import {Component, ComponentType, forwardRef, HTMLAttributes, PointerEvent, ReactNode} from "react";
import {createPortal} from "react-dom";

import {CSSProp, ToBem, useTheme} from "@focus4/styling";

import {PointerEvents} from "../types/pointer-events";

import tooltipCss, {TooltipCss} from "./__style__/tooltip.css";
export {tooltipCss, TooltipCss};

const POSITION = {
    BOTTOM: "bottom",
    HORIZONTAL: "horizontal",
    LEFT: "left",
    RIGHT: "right",
    TOP: "top",
    VERTICAL: "vertical"
} as const;

export interface TooltipOptions {
    tooltipDelay?: number;
    tooltipHideOnClick?: boolean;
    tooltipPassthrough?: boolean;
    tooltipPosition?: "bottom" | "horizontal" | "left" | "right" | "top" | "vertical";
    tooltipShowOnClick?: boolean;
    theme?: CSSProp<TooltipCss>;
}

export interface TooltipProps extends Omit<TooltipOptions, "theme">, PointerEvents<HTMLElement> {
    children?: ReactNode;
    tooltip?: ReactNode;
    tooltipTheme?: CSSProp<TooltipCss>;
}

/**
 * Une factory pour ajouter une tooltip à un composant ou un élément HTML. Cela permet de créer une version du même composant/élément avec une tooltip de la façon suivante :
 *
 *  ```tsx
 *  const TooltippedButton = tooltipFactory()(Button);
 *
 *  <TooltippedButton label="Click" tooltip="Click me" />; // Les props de la tooltip sont ajoutées aux props existantes du composant.
 *  ```
 */
export function tooltipFactory({
    tooltipDelay = 0,
    tooltipHideOnClick = true,
    tooltipPassthrough = true,
    tooltipPosition = POSITION.VERTICAL,
    tooltipShowOnClick = false,
    theme: oTheme
}: TooltipOptions = {}) {
    return function Tooltip<P = HTMLAttributes<HTMLElement>>(ComposedComponent: ComponentType<P> | string) {
        return forwardRef<TooltippedComponent<P>, P & TooltipProps>((p, ref) => {
            const theme = useTheme("RTTooltip", tooltipCss, p.tooltipTheme, oTheme);
            return (
                <TooltippedComponent
                    ref={ref}
                    tooltipDelay={tooltipDelay}
                    tooltipHideOnClick={tooltipHideOnClick}
                    tooltipPassthrough={tooltipPassthrough}
                    tooltipPosition={tooltipPosition}
                    tooltipShowOnClick={tooltipShowOnClick}
                    {...p}
                    ComposedComponent={ComposedComponent}
                    tooltipTheme={theme}
                />
            );
        });
    };
}

class TooltippedComponent<P> extends Component<
    TooltipProps & {ComposedComponent: ComponentType<P> | string} & {tooltipTheme: ToBem<TooltipCss>}
> {
    // eslint-disable-next-line react/state-in-constructor
    state = {
        active: false,
        position: this.props.tooltipPosition!,
        visible: false,
        left: 0,
        top: 0
    };

    timeout?: NodeJS.Timeout | number;
    tooltipNode?: HTMLSpanElement | null;

    componentWillUnmount() {
        if (this.tooltipNode) {
            this.tooltipNode?.removeEventListener("transitionend", this.onTransformEnd);
        }
        if (this.timeout) {
            clearTimeout(this.timeout as number);
        }
    }

    onTransformEnd = (e: any) => {
        if (e.propertyName === "transform") {
            this.tooltipNode?.removeEventListener("transitionend", this.onTransformEnd);
            this.setState({visible: false});
        }
    };

    getPosition(element: HTMLElement) {
        const {tooltipPosition} = this.props;
        if (tooltipPosition === POSITION.HORIZONTAL) {
            const origin = element.getBoundingClientRect();
            const ww = window.innerWidth || document.documentElement.offsetWidth;
            const toRight = origin.left < ww / 2 - origin.width / 2;
            return toRight ? POSITION.RIGHT : POSITION.LEFT;
        }
        if (tooltipPosition === POSITION.VERTICAL) {
            const origin = element.getBoundingClientRect();
            const wh = window.innerHeight || document.documentElement.offsetHeight;
            const toBottom = origin.top < wh / 2 - origin.height / 2;
            return toBottom ? POSITION.BOTTOM : POSITION.TOP;
        }
        return tooltipPosition;
    }

    handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
        this.activate(this.calculatePosition(event.currentTarget as HTMLElement));
        if (this.props.onPointerEnter) {
            this.props.onPointerEnter(event);
        }
    };

    handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
        this.deactivate();
        if (this.props.onPointerLeave) {
            this.props.onPointerLeave(event);
        }
    };

    handlePointerUp = (event: PointerEvent<HTMLElement>) => {
        if (this.props.tooltipHideOnClick && this.state.active) {
            this.deactivate();
        }

        if (this.props.tooltipShowOnClick && !this.state.active) {
            this.activate(this.calculatePosition(event.currentTarget as HTMLElement));
        }

        if (this.props.onPointerUp) {
            this.props.onPointerUp(event);
        }
    };

    activate({top, left, position}: {top?: number; left?: number; position?: string} = {}) {
        if (this.timeout) {
            clearTimeout(this.timeout as number);
        }
        this.setState({visible: true, position});
        this.timeout = setTimeout(() => {
            this.setState({active: true, top, left});
        }, this.props.tooltipDelay);
    }

    deactivate() {
        if (this.timeout) {
            clearTimeout(this.timeout as number);
        }
        if (this.state.active) {
            this.tooltipNode?.addEventListener("transitionend", this.onTransformEnd);
            this.setState({active: false});
        } else if (this.state.visible) {
            this.setState({visible: false});
        }
    }

    calculatePosition(element: HTMLElement) {
        const position = this.getPosition(element);
        const {top, left, height, width} = element.getBoundingClientRect();
        const xOffset = window.scrollX || window.pageXOffset;
        const yOffset = window.scrollY || window.pageYOffset;
        if (position === POSITION.BOTTOM) {
            return {
                top: top + height + yOffset,
                left: left + width / 2 + xOffset,
                position
            };
        }
        if (position === POSITION.TOP) {
            return {
                top: top + yOffset,
                left: left + width / 2 + xOffset,
                position
            };
        }
        if (position === POSITION.LEFT) {
            return {
                top: top + height / 2 + yOffset,
                left: left + xOffset,
                position
            };
        }
        if (position === POSITION.RIGHT) {
            return {
                top: top + height / 2 + yOffset,
                left: left + width + xOffset,
                position
            };
        }
        return undefined;
    }

    render() {
        const {active, left, top, position, visible} = this.state;
        const {
            children,
            tooltipTheme: tTheme,
            onPointerEnter,
            onPointerLeave,
            onPointerUp,
            tooltip,
            tooltipDelay,
            tooltipHideOnClick,
            tooltipPassthrough,
            tooltipPosition,
            tooltipShowOnClick,
            ComposedComponent,
            ...other
        } = this.props;

        const childProps = {
            ...other,
            onPointerEnter: this.handlePointerEnter,
            onPointerLeave: this.handlePointerLeave,
            onPointerUp: this.handlePointerUp
        };

        const shouldPass = typeof ComposedComponent !== "string" && tooltipPassthrough;
        const finalProps = shouldPass ? {...childProps} : childProps;

        return (
            <>
                <ComposedComponent {...(finalProps as any)}>{children}</ComposedComponent>
                {visible
                    ? createPortal(
                          <span
                              ref={node => {
                                  this.tooltipNode = node;
                              }}
                              className={tTheme.tooltip({active, [position]: true})}
                              data-react-toolbox="tooltip"
                              style={{top, left}}
                          >
                              <span className={tTheme.tooltipInner()}>{tooltip}</span>
                          </span>,
                          document.body
                      )
                    : null}
            </>
        );
    }
}
