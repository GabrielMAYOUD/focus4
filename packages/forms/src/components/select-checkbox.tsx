import i18next from "i18next";
import {useObserver} from "mobx-react";
import {SyntheticEvent} from "react";

import {ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox, CheckboxCss} from "@focus4/toolbox";

import selectCheckboxCss, {SelectCheckboxCss} from "./__style__/select-checkbox.css";
export {selectCheckboxCss, SelectCheckboxCss};

function clickHandlerFactory(
    isDisabled: boolean,
    isSelected: boolean,
    value: any[] | undefined,
    optVal: number | string,
    onChange: (value: any[] | undefined) => void
) {
    return (e: SyntheticEvent<any>) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isDisabled) {
            if (isSelected) {
                // Is selected -> remove it
                onChange(value ? value.filter(val => val !== optVal) : undefined);
            } else {
                // Is not selected -> add it
                onChange(value ? [...value.slice(), optVal] : [optVal]);
            }
        }
    };
}

/** Props du SelectCheckbox */
export interface SelectCheckboxProps<T extends "number" | "string"> {
    /** CSS des checkboxes. */
    checkboxTheme?: CSSProp<CheckboxCss>;
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: string;
    /** Libellé. */
    label?: string;
    /** Id de l'input. */
    id?: string;
    /** Nombre maximal d'éléments sélectionnables. */
    maxSelectable?: number;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: (T extends "string" ? string : number)[] | undefined) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<SelectCheckboxCss>;
    /** Type du champ (number ou string). */
    type: T;
    /** Valeur. */
    value: (T extends "string" ? string : number)[] | undefined;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un composant de sélection multiple pour un champ de type liste de valeurs avec plusieurs choix possibles, dans une liste de référence.
 */
export function SelectCheckbox<T extends "number" | "string">({
    checkboxTheme,
    disabled = false,
    error,
    label,
    id,
    maxSelectable,
    name,
    onChange,
    showSupportingText = "always",
    theme: pTheme,
    value,
    values
}: SelectCheckboxProps<T>) {
    const theme = useTheme("selectCheckbox", selectCheckboxCss, pTheme);

    return useObserver(() => (
        <div className={theme.select({error: !!error})}>
            {label ? <h5>{i18next.t(label)}</h5> : null}
            <ul>
                {values.map(option => {
                    const optVal = option[values.$valueKey];
                    const optLabel = option[values.$labelKey];

                    const isSelected = value ? !!(value as any).find((val: any) => optVal === val) : false;
                    const isDisabled =
                        disabled || (maxSelectable !== undefined && maxSelectable === value?.length && !isSelected);
                    const clickHandler = clickHandlerFactory(isDisabled, isSelected, value, optVal, onChange);

                    return (
                        <li key={optVal} className={theme.option()} onClick={clickHandler}>
                            <Checkbox
                                disabled={isDisabled}
                                id={`${id!}-${optVal as string}`}
                                label={i18next.t(optLabel)}
                                name={`${name!}-${optVal as string}`}
                                theme={checkboxTheme}
                                value={isSelected}
                            />
                        </li>
                    );
                })}
            </ul>
            {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                <div className={theme.supportingText()}>{error}</div>
            ) : null}
        </div>
    ));
}
