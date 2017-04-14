import {autobind} from "core-decorators";
import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {GroupOperationListItem, LineOperationListItem} from "../../../list";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import {Group, GroupStyle} from "./group";
export {GroupStyle};

export interface ResultsProps {
    classNames?: {mosaicAdd?: string};
    emptyComponent?: () => React.ReactElement<any>;
    groupOperationLists?: {[scope: string]: GroupOperationListItem<{}>[]};
    /** Par défaut: 5 */
    groupPageSize?: number;
    hasSelection: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    lineComponentMapper?: (scope: string) => ReactComponent<any>;
    lineProps?: {};
    lineOperationLists?: {[scope: string]: (data: {}) => LineOperationListItem<{}>[]};
    mosaicComponentMapper?: (scope: string) => ReactComponent<any>;
    /** Par défaut : 250 */
    offset?: number;
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    store: SearchStore<any>;
}

@autobind
@observer
export class Results extends React.Component<ResultsProps, void> {

    private get key() {
        const {store, scopeFacetKey = "FCT_SCOPE"} = this.props;
        return store.groupingKey || scopeFacetKey;
    }

    componentDidMount() {
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    private scrollListener() {
        const {store: {currentCount, totalCount, groupingKey, isLoading, search}, offset = 250} = this.props;
        if (currentCount < totalCount && !groupingKey) {
            const el = findDOMNode(this) as HTMLElement;
            const scrollTop = window.pageYOffset;
            if (el && topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < offset) {
                if (!isLoading) {
                    search(true);
                }
            }
        }
    }

    private renderSingleGroup(group: GroupResult<{}>) {
        const {classNames, groupOperationLists = {}, groupPageSize = 5, hasSelection, i18nPrefix, lineComponentMapper, mosaicComponentMapper, lineProps, lineOperationLists = {}, store} = this.props;
        const groupKey = store.scope === "ALL" && group.code ? group.code : store.scope;
        return (
            <Group
                key={group.code}
                classNames={classNames}
                group={group}
                groupOperationList={groupOperationLists[groupKey]}
                hasSelection={hasSelection}
                i18nPrefix={i18nPrefix}
                LineComponent={lineComponentMapper && lineComponentMapper(groupKey)}
                MosaicComponent={mosaicComponentMapper && mosaicComponentMapper(groupKey)}
                lineProps={lineProps}
                lineOperationList={lineOperationLists[groupKey]}
                perPage={groupPageSize}
                showAllHandler={this.showAllHandler}
                store={store}
            />
        );
    }

    private showAllHandler(key: string) {
        const {store, scopeFacetKey = "FCT_SCOPE"} = this.props;
        if (store.facets.find(facet => facet.code === scopeFacetKey)) {
            this.scopeSelectionHandler(key);
        } else {
            this.facetSelectionHandler(store.groupingKey!, key);
        }
    }

    private scopeSelectionHandler(scope: string) {
        this.props.store.setProperties({scope});
    }

    private facetSelectionHandler(key: string, value: string) {
        const {selectedFacets, setProperties} = this.props.store;
        setProperties({
            groupingKey: undefined,
            selectedFacets: {...selectedFacets, [key]: value}
        });
    }

    render() {
        const {i18nPrefix = "focus", store} = this.props;
        const {results, totalCount} = store;

        if (0 === totalCount) {
            const Empty = this.props.emptyComponent || (() => <div>{i18n.t(`${i18nPrefix}.search.empty`)}</div>);
            return <Empty />;
        }

        const filteredResults = results.filter(result => result.totalCount !== 0);
        if (!filteredResults.length) {
            return null;
        } else if (filteredResults.length === 1) {
            return this.renderSingleGroup(filteredResults[0]);
        } else {
            return <div>{filteredResults.map(this.renderSingleGroup)}</div>;
        }
    }
}

function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
}
