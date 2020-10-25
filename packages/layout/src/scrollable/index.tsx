import "intersection-observer";

import classNames from "classnames";
import {debounce, memoize, range} from "lodash";
import {action, autorun, computed, observable} from "mobx";
import {disposeOnUnmount, observer, useObserver} from "mobx-react";
import {ColdSubscription, spring, styler} from "popmotion";
import * as React from "react";
import {createPortal, findDOMNode} from "react-dom";
import {Transition} from "react-pose";
import ResizeObserverPolyfill from "resize-observer-polyfill";
import {Styler} from "stylefire";

import {CSSProp, ScrollableContext, springPose, themr} from "@focus4/styling";

import {ButtonBackToTop} from "./button-back-to-top";
export {ButtonBttCss, buttonBttCss} from "./button-back-to-top";
import {AnimatedHeader, FixedHeader} from "./header";

import scrollableCss, {ScrollableCss} from "./__style__/scrollable.css";
export {scrollableCss, ScrollableCss};
const Theme = themr("scrollable", scrollableCss);

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

export interface ScrollableProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 300. */
    backToTopOffset?: number;
    /** Children. */
    children?: React.ReactNode;
    /** Classe CSS. */
    className?: string;
    /** @internal */
    /** Ref vers le div container. */
    innerRef?: React.Ref<HTMLDivElement>;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** Reset le scroll (à 0) dès que les children du scrollable changent.  */
    resetScrollOnChildrenChange?: boolean;
    /** CSS. */
    theme?: CSSProp<ScrollableCss>;
}

@observer
class ScrollableComponent extends React.Component<ScrollableProps> {
    @observable.ref canDeploy = false;
    @observable.ref header?: HTMLElement;
    @observable.ref headerProps?: React.HTMLProps<HTMLElement>;

    @observable.ref containerNode!: HTMLDivElement;
    @observable.ref scrollableNode!: HTMLDivElement;
    @observable.ref stickyNode!: HTMLDivElement;

    @observable.ref intersectionObserver!: IntersectionObserver;
    @observable.ref mutationObserver!: MutationObserver;
    @observable.ref resizeObserver!: ResizeObserverPolyfill;

    readonly onIntersects = observable.map<Element, (ratio: number, isIntersecting: boolean) => void>([], {
        deep: false
    });
    readonly stickyStylers = observable.map<React.Key, Styler>({}, {deep: false});
    readonly stickyParentNodes = observable.map<React.Key, HTMLElement>({}, {deep: false});

    @observable hasBtt = false;
    @observable headerHeight = 0;
    @observable isHeaderSticky = false;
    @observable width = 0;

    @computed
    get stickyOffsetTop() {
        return this.isHeaderSticky ? this.stickyNode.offsetTop : 0;
    }

    /** @see ScrollableContext.registerHeader */
    @action.bound
    registerHeader(nonStickyElement: HTMLElement, canDeploy: boolean) {
        if (canDeploy) {
            this.intersectionObserver.observe(nonStickyElement);
        } else {
            styler(this.stickyNode).set({top: this.headerHeight});
        }

        this.canDeploy = canDeploy;
        this.header = nonStickyElement;
        this.isHeaderSticky = !canDeploy;

        return action(() => {
            if (canDeploy) {
                this.intersectionObserver.unobserve(nonStickyElement);
            }

            this.canDeploy = false;
            this.header = undefined;
            this.headerProps = undefined;
            this.isHeaderSticky = false;
        });
    }

    /** @see ScrollableContext.registerHeaderProps */
    @action.bound
    registerHeaderProps(headerProps: React.HTMLProps<HTMLElement>) {
        this.headerProps = headerProps;
        this.onScroll();
    }

    /** @see ScrollableContext.registerIntersect */
    @action.bound
    registerIntersect(node: HTMLElement, onIntersect: (ratio: number, isIntersecting: boolean) => void) {
        this.onIntersects.set(node, onIntersect);
        this.intersectionObserver.observe(node);

        return () => {
            this.onIntersects.delete(node);
            this.intersectionObserver.unobserve(node);
        };
    }

    /** @see ScrollableContext.scrollTo */
    @action.bound
    scrollTo(options?: ScrollToOptions) {
        const {scrollBehaviour = "smooth"} = this.props;
        this.scrollableNode.scrollTo({behavior: scrollBehaviour, ...options});
    }

    /** @see ScrollableContext.portal */
    @action.bound
    portal(node: JSX.Element, parentNode?: HTMLElement | null) {
        if (parentNode) {
            if (!node.key) {
                throw new Error("Un élément sticky doit avoir une key.");
            }
            this.stickyParentNodes.set(node.key, parentNode);
            return createPortal(React.cloneElement(node, {ref: this.setRef(node.key)}), this.stickyNode);
        } else {
            return createPortal(node, this.containerNode);
        }
    }

    setRef = memoize((key: React.Key) => (ref: HTMLElement | null) => {
        if (!ref && this.stickyStylers.has(key)) {
            this.stickyStylers.delete(key);
            this.stickyParentNodes.delete(key);
        } else if (ref && !this.stickyStylers.has(key)) {
            const stickyRef = styler(ref);
            this.stickyStylers.set(key, stickyRef);
            stickyRef.set({
                marginTop:
                    getOffsetTop(this.stickyParentNodes.get(key)!, this.scrollableNode) -
                    this.scrollableNode.scrollTop -
                    this.stickyOffsetTop
            });
        }
    });

    UNSAFE_componentWillReceiveProps(props: ScrollableProps) {
        if (props.resetScrollOnChildrenChange && props.children !== this.props.children) {
            this.scrollTo({top: 0, behavior: "auto"});
        }
    }

    componentDidMount() {
        this.containerNode = findDOMNode(this) as HTMLDivElement;
        this.scrollableNode.addEventListener("scroll", this.onScroll);
        this.resizeObserver = new ResizeObserver(() => this.onScroll());
        this.resizeObserver.observe(this.scrollableNode);
        this.resizeObserver.observe(this.stickyNode);
        this.mutationObserver = new MutationObserver(() => this.onScroll());
        this.mutationObserver.observe(this.scrollableNode, {attributes: true, childList: true, subtree: true});
        this.mutationObserver.observe(this.stickyNode, {attributes: true, childList: true, subtree: true});
        this.intersectionObserver = new IntersectionObserver(
            entries =>
                entries.forEach(e => {
                    if (e.target === this.header) {
                        this.isHeaderSticky = !e.isIntersecting;
                    }
                    const onIntersect = this.onIntersects.get(e.target);
                    if (onIntersect) {
                        onIntersect(e.intersectionRatio, e.isIntersecting);
                    }
                }),
            {root: this.scrollableNode, threshold: range(0, 105, 5).map(t => t / 100)}
        );
        styler(this.stickyNode).set({top: this.headerHeight});
    }

    componentWillUnmount() {
        this.scrollableNode?.removeEventListener("scroll", this.onScroll);
        this.intersectionObserver?.disconnect();
        this.mutationObserver?.disconnect();
        this.resizeObserver?.disconnect();
    }

    @action.bound
    onScroll() {
        this.width = this.scrollableNode.clientWidth;
        this.stickyParentNodes.forEach(node => (node.style.marginLeft = `${this.stickyNode.clientWidth}px`));
        this.hasBtt = this.scrollableNode.scrollTop + this.headerHeight > (this.props.backToTopOffset || 300);
        if (isIEorEdge()) {
            this.onScrollCoreDebounced();
        } else {
            this.onScrollCore();
        }
    }

    onScrollCoreDebounced = debounce(() => this.onScrollCore(), 50);
    onScrollCore() {
        if (!isIEorEdge()) {
            this.setStickyRefs(this.stickyOffsetTop);
        } else {
            this.animateStickyRefs(
                parentOffsetTop => parentOffsetTop - this.scrollableNode.scrollTop - this.stickyOffsetTop
            );
        }
    }

    stickySpring?: ColdSubscription;

    @disposeOnUnmount
    followHeader = autorun(() => {
        if (!this.stickyNode) {
            return;
        }

        const sticky = styler(this.stickyNode);
        const from = sticky.get("top");
        const to = this.isHeaderSticky ? this.headerHeight : 0;
        if (this.header) {
            if (this.stickySpring) {
                this.stickySpring.stop();
            }
            if (this.canDeploy && from !== to) {
                this.stickySpring = spring({...springPose.transition, from, to}).start((top: number) => {
                    sticky.set({top});
                    this.setStickyRefs(top);
                    if (isIEorEdge()) {
                        this.onScrollCoreDebounced.cancel();
                    }
                });
            } else {
                sticky.set({top: to});
                this.setStickyRefs(to);
            }
        }

        if (isIEorEdge()) {
            if (this.isHeaderSticky) {
                this.animateStickyRefs(() => 0);
            }
        }
    });

    setStickyRefs(offsetTop: number) {
        this.stickyStylers.forEach((stickyRef, key) => {
            const parentNode = this.stickyParentNodes.get(key)!;
            stickyRef.set({
                marginTop: Math.max(
                    0,
                    getOffsetTop(parentNode, this.scrollableNode) - this.scrollableNode.scrollTop - offsetTop
                )
            });
        });
    }

    animateStickyRefs(to: (parentOffsetTop: number) => number) {
        this.stickyStylers.forEach((stickyRef, key) => {
            const parentNode = this.stickyParentNodes.get(key)!;
            const transition = {
                from: stickyRef.get("marginTop"),
                to: Math.max(0, to(getOffsetTop(parentNode, this.scrollableNode)))
            };
            if (transition.from !== transition.to) {
                spring({...springPose.transition, ...transition}).start((marginTop: number) => {
                    stickyRef.set({
                        marginTop
                    });
                });
            }
        });
    }

    setHeight = (height: number) => (this.headerHeight = height);
    setScrollableNode = (ref: HTMLDivElement | null) => ref && (this.scrollableNode = ref);
    setStickyNode = (ref: HTMLDivElement | null) => ref && (this.stickyNode = ref);

    Header = () =>
        useObserver(() => {
            const Header = this.canDeploy ? AnimatedHeader : FixedHeader;
            return (
                <Transition>
                    {this.headerProps && this.isHeaderSticky ? (
                        <Header
                            {...this.headerProps}
                            ref={undefined}
                            key="header"
                            onHeightChange={this.setHeight}
                            style={{width: this.width}}
                        />
                    ) : undefined}
                </Transition>
            );
        });

    BackToTop = () =>
        useObserver(() => (
            <Transition>
                {!this.props.hideBackToTop && this.hasBtt ? <ButtonBackToTop key="back-to-top" /> : undefined}
            </Transition>
        ));

    render() {
        const {children, className, innerRef} = this.props;
        return (
            <ScrollableContext.Provider
                value={{
                    registerHeader: this.registerHeader,
                    registerHeaderProps: this.registerHeaderProps,
                    registerIntersect: this.registerIntersect,
                    scrollTo: this.scrollTo,
                    portal: this.portal
                }}
            >
                <Theme theme={this.props.theme}>
                    {theme => (
                        <div ref={innerRef} className={classNames(theme.container(), className)}>
                            <div className={theme.scrollable()} ref={this.setScrollableNode}>
                                {this.intersectionObserver ? children : null}
                            </div>
                            <div className={theme.sticky()} ref={this.setStickyNode} />
                            <this.Header />
                            <this.BackToTop />
                        </div>
                    )}
                </Theme>
            </ScrollableContext.Provider>
        );
    }
}

export const Scrollable = React.forwardRef<HTMLDivElement, React.PropsWithChildren<ScrollableProps>>((props, ref) => (
    <ScrollableComponent {...props} innerRef={ref} />
));

function isIEorEdge() {
    return navigator.userAgent.match(/(Trident|Edge)/);
}

function getOffsetTop(node: HTMLElement, container: HTMLElement) {
    let distance = node.offsetTop;
    if (node.offsetParent && node.offsetParent !== container) {
        distance += getOffsetTop(node.offsetParent as HTMLElement, container);
    }
    return distance;
}
