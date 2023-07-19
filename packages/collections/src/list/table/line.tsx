import classNames from "classnames";
import {observable} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {useEffect} from "react";

import {CollectionStore} from "@focus4/stores";
import {getIcon, ToBem} from "@focus4/styling";
import {IconButton} from "@focus4/toolbox";

import {TableColumn} from "./header";

import {TableCss} from "../__style__/table.css";

/** Ligne de tableau. */
export function TableLine<T>({
    className,
    columns,
    domRef,
    i18nPrefix = "focus",
    onClick,
    theme,
    ...oProps
}: {
    /** Classe CSS pour une ligne. */
    className?: (data: T) => string;
    /** La description des colonnes du tableau. */
    columns: TableColumn<T>[];
    /** L'élément de la liste. */
    data: T;
    /** Ref vers le <td>. */
    domRef: ((listNode: HTMLElement | null) => void) | undefined;
    /** Affiche la sélection sur les lignes (store uniquement). */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés de la liste. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Appelé au clic sur une ligne. */
    onClick?: (data: T) => void;
    /** Le store contenant la liste. */
    store?: CollectionStore<T>;
    /** CSS. */
    theme: ToBem<TableCss>;
}) {
    const props = useLocalObservable(
        () => ({
            data: oProps.data,
            hasSelection: oProps.hasSelection,
            store: oProps.store
        }),
        {data: observable.ref, store: observable.ref}
    );
    useEffect(() => {
        props.data = oProps.data;
        props.hasSelection = oProps.hasSelection;
        props.store = oProps.store;
    }, [oProps.data, oProps.hasSelection, oProps.store]);

    const state = useLocalObservable(() => ({
        /** Précise si la checkbox doit être affichée. */
        get isCheckboxDisplayed() {
            return !!props.store?.selectedItems.size || false;
        },

        /** Précise si la ligne est sélectionnable. */
        get isSelectable() {
            return (props.hasSelection && props.store?.isItemSelectionnable(props.data)) ?? false;
        },

        /** Précise si la ligne est sélectionnée.. */
        get isSelected() {
            return props.store?.selectedItems.has(props.data) ?? false;
        },

        /** Handler de clic sur la case de sélection. */
        onSelection() {
            props.store?.toggle(props.data);
        }
    }));

    return useObserver(() => (
        <tr
            ref={domRef}
            className={classNames(
                theme.row({clickable: !!onClick, selected: state.isSelected}),
                className?.(props.data) ?? ""
            )}
        >
            {props.hasSelection ? (
                <td className={theme.checkbox({forceDisplay: state.isCheckboxDisplayed})}>
                    {state.isSelectable ? (
                        <IconButton
                            icon={getIcon(`${i18nPrefix}.icons.line.${state.isSelected ? "" : "un"}selected`)}
                            onClick={state.onSelection}
                            primary={state.isSelected}
                            theme={{toggle: theme.toggle(), icon: theme.checkboxIcon()}}
                        />
                    ) : null}
                </td>
            ) : null}
            {columns.map(({className: cellClassName, content}, idx) => (
                <td key={idx} className={cellClassName} onClick={() => onClick?.(props.data)}>
                    {content(props.data)}
                </td>
            ))}
        </tr>
    ));
}
