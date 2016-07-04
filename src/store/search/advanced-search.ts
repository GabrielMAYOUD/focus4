import SearchStore from "./search";
import {InputFacet} from "../../search/search-action/types";

export type Results<T extends {}> = {[group: string]: T[]} | {[group: string]: T[]}[];
export type StoreFacets = {[facet: string]: {[code: string]: {count: number, label: string}}};

export const definition: AdvancedSearch = {
    query: "query",
    scope: "scope",
    results: {} as Results<{}>,
    facets: {} as StoreFacets,
    totalCount: 0,
    selectedFacets: {} as {[facet: string]: InputFacet},
    groupingKey: "groupingKey",
    sortBy: "sortBy",
    sortAsc: false
};

export interface AdvancedSearch {
    query?: string;
    scope?: string;
    results?: Results<{}>;
    facets?: StoreFacets;
    totalCount?: number;
    selectedFacets?: {[facet: string]: InputFacet};
    groupingKey?: string;
    sortBy?: string;
    sortAsc?: boolean;
}

export default class AdvancedSearchStore extends SearchStore<AdvancedSearch> {

    constructor(identifier?: string) {
        super({definition, identifier: identifier || "QUICK_SEARCH"});
    }

    emitPendingEvents() {
        if (this.pendingEvents.find(ev => !!["query", "scope", "selectedFacets", "groupingKey", "sortBy", "sortAsc"].find(x => x === ev.name.split(":change")[0]))) {
            this.emit("advanced-search-criterias:change", {status: "update"});
        }
        this.pendingEvents.map((evtToEmit) => {
            let {name, data} = evtToEmit;
            this.emit(name, data);
        });
    }
}
