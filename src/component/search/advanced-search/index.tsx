import * as React from "react";
import {isFunction, reduce} from "lodash";
import {autobind} from "core-decorators";

import actionBuilder, {SearchAction} from "../../../search/action-builder";
import {SearchActionService} from "../../../search/search-action";
import {advancedSearchStore} from "../../../search/built-in-store";
import {AdvancedSearchStore} from "../../../store/search";
import {AdvancedSearch} from "../../../store/search/advanced-search";
import dispatcher from "../../../dispatcher";
import {ButtonBackToTop, ReactComponent} from "../../defaults";
import {GroupComponent} from "./group";
import {FacetBox} from "./facet-box";
import ListActionBar from "./action-bar";
import ListSummary from "./list-summary";
import ResultsComponent from "../results";
import {OperationListItem} from "../../list/memory-list";

export interface Props {
    action?: SearchAction;
    /** Default: ButtonBackToTop */
    backToTopComponent?: typeof ButtonBackToTop;
    /** Default: true */
    hasBackToTop?: boolean;
    /** Default: true */
    isSelection?: boolean;
    lineComponentMapper: (...args: any[]) => ReactComponent<any>;
    /** Default: [] */
    lineOperationList?: OperationListItem[];
    onLineClick?: (...args: any[]) => void;
    onScopeChange?: (scope?: string) => void;
    /** Default: [] */
    orderableColumnList?: {} | {}[];
    /** Default: {} */
    openedFacetList?: {};
    refContainer?: {[key: string]: {}[]};
    /** Default: {} */
    scopesConfig?: {};
    scrollParentSelector?: string;
    scopeLock?: boolean;
    selectItem?: (data?: any, isSelected?: boolean) => void;
    selectionAction?: (status: string) => void;
    service: SearchActionService;
    /** Default: advancedSearchStore */
    store?: AdvancedSearchStore;
}

export interface State extends AdvancedSearch {
    hasGrouping?: boolean;
    selectionStatus?: 'none' | 'partial' | 'selected';
}

@autobind
export default class extends React.Component<Props, State> {
    static displayName = "advanced-search";
    static defaultProps = {
        backToTopComponent: ButtonBackToTop,
        hasBackToTop: true,
        isSelection: true,
        lineOperationList: [],
        orderableColumnList: [],
        openedFacetList: {},
        scopesConfig: {},
        store: advancedSearchStore
    };

    private action: SearchAction;

    constructor(props: Props) {
        super(props);
        this.state = this.getNewStateFromStore();
    }

    componentWillMount() {
        this.props.store!.on("advanced-search-criterias:change", this.onStoreChangeWithSearch);

        // Listen to data changes
        ["facets", "results", "totalCount"].forEach((node) => {
            this.props.store!.addChangeListener(node, this.onStoreChangeWithoutSearch);
        });

        // Listen to scope change
        this.props.store!.addChangeListener("scope", this.onScopeChange);

        this.action = this.props.action || actionBuilder({
            service: this.props.service,
            identifier: this.props.store!.identifier!,
            getSearchOptions: () => this.props.store!.getValue.call(this.props.store) // Binding the store in the function call
        });

        const {updateProperties} = this.action;

        // On ajoute le onScopeChange si l'action modifie le scope.
        this.action.updateProperties = data => {
            if (data.scope && data.scope !== this.state.scope) {
                data.selectedFacets = {};
            }
            updateProperties(data);
            if (Object.keys(data).find(d => d === "scope") && this.props.onScopeChange) {
                this.props.onScopeChange(data.scope);
            }
        };
        this.action.search();
    }

    componentWillUnmount() {
        // Remove listeners
        this.props.store!.removeListener("advanced-search-criterias:change", this.onStoreChangeWithSearch);
        ["facets", "results", "totalCount"].forEach((node) => {
            this.props.store!.removeChangeListener(node, this.onStoreChangeWithoutSearch);
        });
        this.props.store!.removeChangeListener("scope", this.onScopeChange);
    }

    /** Cette fonction est le diable incarné. C'est vraiment laid. */
    getSelectedItems() {
        const results = this.refs["resultList"] as ResultsComponent;
        const outSelectedItems = reduce(results.refs, (selectedItems, ref) => {
            if (isFunction((ref as any).getSelectedItems)) { // ListSelection dans le Results, cas sans groupes.
                selectedItems = selectedItems.concat((ref as any).getSelectedItems());
            } else if ((ref as any).refs) { // Groupes.
                selectedItems = selectedItems.concat(reduce((ref as any).refs, (subSelectedItems, subRef) => {
                    if (isFunction((subRef as any).getSelectedItems)) { // ListSection dans les Groupes.
                        subSelectedItems = subSelectedItems.concat((subRef as any).getSelectedItems());
                    }
                    return subSelectedItems;
                }, [] as any[]));
            }
            return selectedItems;
        }, [] as any[]);
        return outSelectedItems;
    }

    private onStoreChangeWithSearch() {
        this.setState(this.getNewStateFromStore(), this.action.search);
    }

    private onStoreChangeWithoutSearch() {
        this.setState(this.getNewStateFromStore());
    }

    private onScopeChange() {
        dispatcher.handleViewAction({
            data: {sortBy: null, sortAsc: null},
            type: "update",
            identifier: advancedSearchStore.identifier
        });
    }

    private getNewStateFromStore(): State {
        const {store} = this.props;
        const scope = store!.get<string>("scope");
        return {
            scope,
            query: store!.get<string>("query"),
            selectedFacets: store!.get<any>("selectedFacets") || {},
            groupingKey: store!.get<string>("groupingKey"),
            sortBy: store!.get<string>("sortBy"),
            sortAsc: store!.get<boolean>("sortAsc"),
            facets: store!.get<any>("facets"),
            results: store!.get<any>("results"),
            totalCount: store!.get<number>("totalCount"),
            hasGrouping: scope !== undefined && scope !== "ALL",
        };
    }

    private renderFacetBox() {
        const {facets, selectedFacets} = this.state;
        const {scopesConfig, openedFacetList} = this.props;
        return (
            <FacetBox
                action={this.action}
                openedFacetList={openedFacetList || {}}
                facetList={facets}
                ref="facetBox"
                scopesConfig={scopesConfig!}
                selectedFacetList={selectedFacets!}
            />
        );
    }

    private renderListSummary() {
        const {query, scope, totalCount} = this.state;
        return (
            <ListSummary
                action={this.action}
                query={query}
                ref="summary"
                scope={scope}
                scopeLock={this.props.scopeLock}
                totalCount={totalCount}
                onScopeChange={this.props.onScopeChange}
            />
        );
    }

    private renderActionBar() {
        const {facets, groupingKey, hasGrouping, selectedFacets, selectionStatus, sortBy, totalCount} = this.state;
        const {isSelection, lineOperationList, orderableColumnList} = this.props;
        const groupableColumnList = facets ? facets.reduce((result, facet) => {
            if (facet.values.length > 1) {
                result[facet.code] = facet.label;
            }
            return result;
        }, {} as {[facet: string]: string}) : {};

        return (
            <ListActionBar
                action={this.action}
                groupingKey={groupingKey}
                groupableColumnList={groupableColumnList}
                hasGrouping={hasGrouping}
                isSelection={isSelection}
                operationList={totalCount > 0 ? lineOperationList : {}}
                sortBy={sortBy}
                orderableColumnList={orderableColumnList}
                ref="actionBar"
                selectedFacets={selectedFacets}
                selectionAction={this.selectionAction}
                selectionStatus={selectionStatus}
            />
        );
    }

    private renderResults() {
        const {isSelection, onLineClick, lineComponentMapper, lineOperationList, refContainer, scrollParentSelector, store} = this.props;
        const {groupingKey, facets, results, selectionStatus, totalCount} = this.state;
        return (
            <ResultsComponent
                action={this.action}
                groupComponent={GroupComponent}
                groupingKey={groupingKey}
                isSelection={isSelection!}
                lineClickHandler={onLineClick}
                lineComponentMapper={lineComponentMapper}
                lineOperationList={lineOperationList}
                lineSelectionHandler={this.selectItem}
                ref="resultList"
                reference={refContainer}
                renderSingleGroupDecoration={false}
                resultsFacets={facets}
                resultsMap={results}
                scrollParentSelector={scrollParentSelector}
                selectionStatus={selectionStatus}
                store={store!}
                totalCount={totalCount!}
            />
        );
    }

    private selectItem(data: any) {
        this.setState({selectionStatus: "partial"});
        if (this.props.selectItem) {
            this.props.selectItem(data);
        }
    }

    private selectionAction(selectionStatus: 'none' | 'partial' | 'selected') {
        this.setState({selectionStatus});
        if (this.props.selectionAction) {
            this.props.selectionAction(selectionStatus);
        }
    }

    render() {
        // true if a facet is collapsed
        const facetCollapsedClassName = Object.keys(this.props.openedFacetList).length === 0 ? "facet-collapsed" : "";
        const {backToTopComponent: BackToTop} = this.props;

        if (!BackToTop) {
            throw new Error("`backToTopComponent` n'a pas été défini. Vous manque-t'il un défaut ?");
        }

        return (
            <div className="advanced-search" data-focus="advanced-search">
                {this.state.scope !== "ALL" ?
                    <div data-focus="facet-container" className={facetCollapsedClassName}>
                        {this.renderFacetBox()}
                    </div>
                : ""}
                <div data-focus="result-container">
                    {this.renderListSummary()}
                    {this.renderActionBar()}
                    {this.renderResults()}
                </div>
                {this.props.hasBackToTop && <BackToTop />}
            </div>
        );
    }
}
