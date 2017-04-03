import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle, StyleInjector} from "../../theming";

import {LineOperationListItem, LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import {list} from "./style/list.css";

export interface ListProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    data?: T[];
    operationList?: (data: T) => LineOperationListItem<T>[];
}

@autobind
@observer
export class ListWithoutStyle<T, P extends {data?: T}, AP> extends ListBase<T, ListProps<T, P> & AP> {

    protected get data() {
        return this.props.data || [];
    }

    protected renderLines() {
        const {LineComponent, lineProps, operationList} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T, P>;
        return this.displayedData.map((item, idx) => (
            <Line
                key={idx}
                data={item}
                LineComponent={LineComponent}
                lineProps={lineProps}
                operationList={operationList}
            />
        ));
    }

    render() {
        const {classNames} = this.props;
        return (
            <div>
                <ul className={`${list} ${classNames!.list || ""}`}>
                    {this.renderLines()}
                </ul>
                {this.renderButtons()}
            </div>
        );
    }
}

export const List: StyleInjector<ListWithoutStyle<{}, {data?: {}}, {}>> = injectStyle("list", ListWithoutStyle) as any;

export function listFor<T, P extends {data?: T}>(props: ListProps<T, P>) {
    const List2 = List as any;
    return <List2 {...props} />;
};
