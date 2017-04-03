import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import BackToTop from "focus-components/button-back-to-top";

import {ActionBar, GroupOperationListItem, LineOperationListItem} from "../../../list";
import {injectStyle} from "../../../theming";

import {SearchStore} from "../../store";
import {Results} from "../results";
import {FacetBox, FacetBoxStyle, FacetStyle} from "./facet-box";
import {Summary, SummaryStyle} from "./summary";
export {FacetBoxStyle, FacetStyle, SummaryStyle};

import * as styles from "./style/advanced-search.css";
export type AdvancedSearchStyle = Partial<typeof styles>;

export interface AdvancedSearchProps {
    classNames?: AdvancedSearchStyle;
    groupOperationLists?: {[scope: string]: GroupOperationListItem<{}>[]};
    /** Par défault: true */
    hasBackToTop?: boolean;
    hasSelection?: boolean;
    isSingleScope?: boolean;
    lineComponentMapper: (scope: string) => ReactComponent<any>;
    lineOperationLists?: {[scope: string]: (data: {}) => LineOperationListItem<{}>[]};
    lineProps?: {};
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    openedFacetList?: {};
    scopes: {code: string, label?: string}[];
    scopesConfig?: {[key: string]: string};
    store: SearchStore;
}

@injectStyle("advancedSearch")
@autobind
@observer
export class AdvancedSearch extends React.Component<AdvancedSearchProps, void> {

    componentWillMount() {
        this.props.store.search();
    }

    private renderFacetBox() {
        const {scopesConfig = {}, openedFacetList = {}, store} = this.props;
        return (
            <FacetBox
                openedFacetList={openedFacetList}
                scopesConfig={scopesConfig}
                store={store}
            />
        );
    }

    private renderListSummary() {
        const {isSingleScope, scopes, store} = this.props;
        return (
            <Summary
                isSingleScope={!!isSingleScope}
                scopes={scopes}
                store={store}
            />
        );
    }

    private renderActionBar() {
        const {hasSelection, groupOperationLists, orderableColumnList, store} = this.props;

        if (store.groupingKey) {
            return null;
        }

        const groupableColumnList = store.facets && store.scope !== "ALL" ? store.facets.reduce((result, facet) => {
            if (facet.values.length > 1) {
                result[facet.code] = facet.label;
            }
            return result;
        }, {} as {[facet: string]: string}) : {};

        return (
            <ActionBar
                groupableColumnList={groupableColumnList}
                hasSelection={hasSelection}
                operationList={store.scope !== "ALL" && groupOperationLists && store.totalCount > 0 ? groupOperationLists[store.scope] : []}
                orderableColumnList={orderableColumnList}
                store={store}
            />
        );
    }

    private renderResults() {
        const {groupOperationLists, hasSelection, lineComponentMapper, lineProps, lineOperationLists, store} = this.props;
        return (
            <Results
                groupOperationLists={groupOperationLists}
                hasSelection={!!hasSelection}
                lineComponentMapper={lineComponentMapper}
                lineProps={lineProps}
                lineOperationLists={lineOperationLists}
                store={store}
            />
        );
    }

    render() {
        const {store, hasBackToTop = true, classNames} = this.props;
        return (
            <div>
                {store.scope !== "ALL" ?
                    <div className={`${styles.facetContainer} ${classNames!.facetContainer || ""}`}>
                        {this.renderFacetBox()}
                    </div>
                : null}
                <div className={`${styles.resultContainer} ${classNames!.resultContainer || ""}`}>
                    {this.renderListSummary()}
                    {this.renderActionBar()}
                    {this.renderResults()}
                </div>
                {hasBackToTop ? <BackToTop /> : null}
            </div>
        );
    }
}
