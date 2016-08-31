import {autobind} from "core-decorators";
import {clone} from "lodash";
import * as React from "react";

import {ReactComponent} from "../../defaults";

export interface GroupComponentProps {
    canShowMore: boolean;
    count: number;
    groupKey: string;
    groupLabel?: string;
    showAllHandler?: (groupKey: string) => void;
    showMoreHandler: () => void;
}

export type GroupComponent = ReactComponent<GroupComponentProps> ;

export interface Props {
    initialRowsCount: number;
    groupComponent: GroupComponent;
    groupKey: string;
    groupLabel?: string;
    count: number;
    isUnique?: boolean;
    showAllHandler?: (key: string) => void;
    list: any[];
    renderResultsList: (list: any[], groupKey: string, count: number, isUnique: boolean) => React.ReactElement<any>;
}

export interface State {
    resultsDisplayedCount: number;
}

@autobind
export class GroupWrapper extends React.Component<Props, State> {
    static defaultProps = {
        isUnique: false
    };

    constructor(props: Props) {
        super(props);
        this.state = {resultsDisplayedCount: this.props.initialRowsCount || 3};
    }

    private showMoreHandler() {
        this.setState({
            resultsDisplayedCount: this.state.resultsDisplayedCount + 3 <= this.props.list.length ? this.state.resultsDisplayedCount + 3 : this.props.list.length
        });
    }

    render() {
        const {groupComponent, isUnique, list, count, groupKey, groupLabel, showAllHandler, renderResultsList} = this.props;
        const listClone = clone(list);
        const listToRender = isUnique ? listClone : listClone.splice(0, this.state.resultsDisplayedCount);
        const Group = groupComponent as React.ComponentClass<GroupComponentProps>;
        return (
            <Group
                canShowMore={list.length > this.state.resultsDisplayedCount}
                count={count}
                groupKey={groupKey}
                groupLabel={groupLabel}
                showAllHandler={showAllHandler}
                showMoreHandler={this.showMoreHandler}
            >
                {renderResultsList(listToRender, groupKey, count, isUnique || false)}
            </Group>
        );
    }
}
