import {autobind} from "core-decorators";
import i18next from "i18next";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {IconButton} from "react-toolbox/lib/button";

import {getIcon} from "../../../components";
import {ReactComponent} from "../../../config";
import {DetailProps, DragLayerStyle, EmptyProps, LineProps, LineStyle, ListStyle, MiniListStore, OperationListItem, StoreList} from "../../../list";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import ActionBar from "../action-bar";

import * as styles from "./__style__/group.css";

export type GroupStyle = Partial<typeof styles>;

/** Props du composant de groupe. */
export interface GroupProps<T> {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: T) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ReactComponent<DetailProps<T>>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
    /** Type de l'item de liste pour le drag and drop. Par défaut : "item". */
    dragItemType?: string;
    /** CSS du DragLayer. */
    dragLayerTheme?: DragLayerStyle;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ReactComponent<EmptyProps<T>>;
    /** Constituion du groupe à afficher. */
    group: GroupResult<T>;
    /** Header de groupe personnalisé. */
    GroupHeader?: ReactComponent<{group: GroupResult<T>}>;
    /** Actions de groupe. */
    groupOperationList?: OperationListItem<T[]>[];
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data: T) => boolean;
    /** Composant de ligne. */
    LineComponent?: ReactComponent<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: T) => OperationListItem<T>[];
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Composant de mosaïque. */
    MosaicComponent?: ReactComponent<LineProps<T>>;
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage: number;
    /** Store contenant la liste. */
    store: SearchStore<T>;
    /** CSS */
    theme?: GroupStyle;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/** Composant de groupe, affiche une ActionBar (si plusieurs groupes) et une StoreList. */
@autobind
@observer
export class Group<T> extends React.Component<GroupProps<T>, void> {

    @computed
    protected get store(): MiniListStore<any> {
        const {group, store} = this.props;
        return group.code ? store.getSearchGroupStore(group.code) : store;
    }

    /** Action pour dégrouper et sélectionner la facette correspondant au groupe choisi. */
    protected showAllHandler() {
        const {groupingKey, selectedFacets, setProperties} = this.props.store;
        setProperties({
            groupingKey: undefined,
            selectedFacets: {...selectedFacets, [groupingKey!]: this.props.group.code}
        });
    }

    render() {
        const {canOpenDetail, DetailComponent, detailHeight, dragItemType, dragLayerTheme, EmptyComponent, group, GroupHeader = DefaultGroupHeader, groupOperationList, hasDragAndDrop, hasSelection, i18nPrefix = "focus", isLineSelectionnable, LineComponent, lineOperationList, lineTheme, listTheme, MosaicComponent, perPage, store, theme, useGroupActionBars} = this.props;
        return (
            <div className={theme!.container}>
                {useGroupActionBars ?
                    <ActionBar
                        group={{code: group.code, label: group.label, totalCount: group.totalCount}}
                        hasSelection={hasSelection}
                        operationList={groupOperationList}
                        store={this.store}
                    />
                :
                    <div className={theme!.header}>
                        {hasSelection ?
                            <IconButton
                                icon={getIcon(`${i18nPrefix}.icons.actionBar.${this.store.selectionStatus}`)}
                                onClick={this.store.toggleAll}
                                theme={{toggle: theme!.selectionToggle, icon: theme!.selectionIcon}}
                            />
                        : null}
                        <GroupHeader group={group} />
                    </div>
                }
                <StoreList
                    canOpenDetail={canOpenDetail}
                    data={group.list}
                    detailHeight={detailHeight}
                    DetailComponent={DetailComponent}
                    dragItemType={dragItemType}
                    dragLayerTheme={dragLayerTheme}
                    EmptyComponent={EmptyComponent}
                    hasDragAndDrop={hasDragAndDrop}
                    hasSelection={hasSelection}
                    hideAdditionalItems={!!group.code}
                    i18nPrefix={i18nPrefix}
                    isManualFetch={!!group.code}
                    LineComponent={LineComponent}
                    lineTheme={lineTheme}
                    MosaicComponent={MosaicComponent}
                    operationList={lineOperationList}
                    perPage={perPage}
                    isLineSelectionnable={isLineSelectionnable}
                    showAllHandler={group.list.length < group.totalCount ? this.showAllHandler : undefined}
                    store={this.store}
                    theme={listTheme}
                />
                <GroupLoadingBar i18nPrefix={i18nPrefix} store={store} />
            </div>
        );
    }
}

/** "Barre" de chargement pour les résultats. */
export function GroupLoadingBar({i18nPrefix = "focus", store}: {i18nPrefix?: string, store: SearchStore}) {
    return store.isLoading ?
        <div style={{padding: "15px"}}>
            {i18next.t(`${i18nPrefix}.search.loading`)}
        </div>
    : null;
}

export function DefaultGroupHeader({group}: {group: GroupResult}) {
    return <strong>{`${i18next.t(group.label)} (${group.totalCount})`}</strong>;
}

export default themr("group", styles)(Group);
