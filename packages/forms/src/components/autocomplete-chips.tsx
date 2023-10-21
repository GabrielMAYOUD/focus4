import i18next from "i18next";
import {observable} from "mobx";
import {useObserver} from "mobx-react";
import {useCallback, useEffect, useState} from "react";

import {DomainFieldType, DomainTypeMultiple, DomainTypeSingle, SingleDomainFieldType} from "@focus4/stores";
import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {AutocompleteCss, Chip, ChipCss, TextFieldCss} from "@focus4/toolbox";

import {AutocompleteSearch} from "./autocomplete";
import {SelectChipsCss, selectChipsCss} from "./select-chips";
import {toSimpleType} from "./utils";

export interface AutocompleteChipsProps<T extends DomainFieldType, TSource = {key: string; label: string}> {
    /** CSS pour les Chips. */
    chipTheme?: CSSProp<ChipCss>;
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: string;
    /**
     * Détermine la propriété de l'objet a utiliser comme clé.
     * Par défaut : `item => item.key`
     */
    getKey?: (item: TSource) => string;
    /**
     * Détermine la propriété de l'objet à utiliser comme libellé.
     * Le libellé de l'objet est le texte utilisé pour chercher la correspondance avec le texte saisi dans le champ.
     * Par défaut : `item => item.label`
     */
    getLabel?: (item: TSource) => string;
    /** Service de résolution de clé. Doit retourner le libellé. */
    keyResolver?: (key: DomainTypeSingle<SingleDomainFieldType<T>>) => Promise<string | undefined>;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Id de l'input. */
    id?: string;
    /** Nombre maximal d'éléments sélectionnables. */
    maxSelectable?: number;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: DomainTypeMultiple<T>) => void;
    /** Service de recherche. */
    querySearcher?: (text: string) => Promise<TSource[]>;
    /** Active l'appel à la recherche si le champ est vide. */
    searchOnEmptyQuery?: boolean;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<AutocompleteCss & SelectChipsCss & TextFieldCss>;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Valeur. */
    value?: DomainTypeMultiple<T>;
}

const defaultGetKey = (x: any) => x.key;

/**
 * AutocompleteSearch permettant de sélectionner plusieurs valeurs, affichées dans des `Chips` en dessous du champ.
 */
export function AutocompleteChips<T extends DomainFieldType, TSource = {key: string; label: string}>({
    chipTheme,
    disabled = false,
    error,
    i18nPrefix = "focus",
    id,
    getKey = defaultGetKey,
    getLabel,
    keyResolver,
    maxSelectable,
    name,
    onChange,
    querySearcher,
    searchOnEmptyQuery = false,
    showSupportingText = "always",
    theme: pTheme,
    type,
    value = [] as DomainTypeMultiple<T>
}: AutocompleteChipsProps<T, TSource>) {
    const theme = useTheme<AutocompleteCss & SelectChipsCss & TextFieldCss>("selectChips", selectChipsCss, pTheme);

    const [labels] = useState(() => observable.map<boolean | number | string, string>());

    useEffect(() => {
        if (keyResolver) {
            for (const item of value.filter(i => !labels.has(i))) {
                keyResolver(item as DomainTypeSingle<SingleDomainFieldType<T>>).then(label =>
                    labels.set(item, label ?? "")
                );
            }
        }
    }, [keyResolver, value]);

    const handleAddValue = useCallback(
        function handleAddValue(v?: boolean | number | string) {
            if (v && (!maxSelectable || value.length < maxSelectable)) {
                onChange?.([...value, v] as DomainTypeMultiple<T>);
            }
        },
        [onChange, maxSelectable, value]
    );

    const handleRemoveValue = useCallback(
        function handleRemoveValue(v: boolean | number | string) {
            onChange?.(value.filter(i => i !== v) as DomainTypeMultiple<T>);
        },
        [onChange, value]
    );

    const handleRemoveAll = useCallback(
        function handleRemoveAll() {
            onChange?.([] as DomainTypeMultiple<T>);
        },
        [onChange]
    );

    const fixedQuerySearcher = useCallback(
        async function fixedQuerySearcher(query: string) {
            if (querySearcher) {
                const results = await querySearcher(query);
                return results.filter(r => !(value as (boolean | number | string)[]).includes(getKey(r)));
            } else {
                return [];
            }
        },

        [getKey, querySearcher, value]
    );

    return useObserver(() => (
        <div className={theme.select({error: !!error})}>
            <AutocompleteSearch<SingleDomainFieldType<T>, TSource>
                clearQueryOnChange
                disabled={disabled}
                error={error}
                getKey={getKey}
                getLabel={getLabel}
                id={id}
                keyResolver={keyResolver}
                name={name}
                onChange={handleAddValue}
                querySearcher={fixedQuerySearcher}
                searchOnEmptyQuery={searchOnEmptyQuery}
                showSupportingText="never"
                theme={theme}
                trailing={{
                    icon: getIcon(`${i18nPrefix}.icons.select.unselectAll`),
                    onClick: handleRemoveAll,
                    tooltip: i18next.t(`${i18nPrefix}.select.unselectAll`),
                    blurOnClick: true
                }}
                type={toSimpleType(type)}
            />
            <div className={theme.chips()}>
                {value.map(item => (
                    <Chip
                        key={`${item}`}
                        className={theme.chip()}
                        color="light"
                        disabled={disabled}
                        label={labels.get(item) ?? ""}
                        onDeleteClick={() => handleRemoveValue(item)}
                        theme={chipTheme}
                    />
                ))}
            </div>
            {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                <div className={theme.supportingText()}>{error}</div>
            ) : null}
        </div>
    ));
}
