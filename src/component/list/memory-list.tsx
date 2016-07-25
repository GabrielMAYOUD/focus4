import * as React from "react";
import {autobind} from "core-decorators";
import {omit} from "lodash";

export interface OperationListItem {
    label?: string;
    action: (data: {}) => void;
    style: {shape?: 'icon' | 'flat' | 'raised'};
    icon?: string;
    priority: number;
}

export interface CLProps<E> {
    data?: E;
    isSelected?: boolean;
    lineType?: 'selection' | 'table' | 'timeline';
    onSelection?: (data?: E, isSelected?: boolean, isInit?: boolean) => void;
    operationList?: OperationListItem[];
    reference?: {[key: string]: {}[]};
    isSelection?: boolean;
}

export interface BaseListProps {
    ref?: string;
    data?: {[key: string]: any}[];
    fetchNextPage?: (page?: number) => void;
    hasMoreData?: boolean;
    isManualFetch?: boolean;
    isSelection?: boolean;
    reference?: {[key: string]: {}[]};
}

export interface MemoryListProps<ListProps extends BaseListProps> extends BaseListProps {
    ListComponent: React.ComponentClass<ListProps> | ((props: ListProps & {ref?: string}) => React.ReactElement<any>);
    /** Default: 5 */
    perPage?: number;
}

export interface MemoryListState {
    page?: number;
    maxElements?: number;
}

@autobind
export class MemoryList extends React.Component<MemoryListProps<BaseListProps>, MemoryListState> {

    constructor(props: MemoryListProps<BaseListProps>) {
        super(props);
        this.state = {
            page: 1,
            maxElements: this.props.perPage || 5
        };
    }

    fetchNextPage() {
        let currentPage = this.state.page + 1;
        this.setState({
            page: currentPage,
            maxElements: this.props.perPage * currentPage
        });
    }

    getDataToUse() {
        const {data} = this.props;
        if (!data) {
            return [];
        }
        return data.slice(0, this.state.maxElements);
    }

    render() {
        const {data = [], ListComponent, reference} = this.props;
        let hasMoreData = data.length > this.state.maxElements;
        let childProps = omit(this.props, "data");
        return (
            <ListComponent
                ref="list"
                data={this.getDataToUse()}
                hasMoreData={hasMoreData}
                isSelection={false}
                isManualFetch={true}
                fetchNextPage={this.fetchNextPage}
                reference={reference}
                {...childProps}
            />
        );
    }
}
