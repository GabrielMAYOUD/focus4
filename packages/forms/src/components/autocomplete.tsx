import {debounce} from "lodash";
import {ForwardedRef, forwardRef, ReactElement, useCallback, useEffect, useState} from "react";

import {DomainFieldType, DomainTypeSingle} from "@focus4/stores";
import {Autocomplete, AutocompleteProps} from "@focus4/toolbox";

import {stringToDomainType} from "./utils";

export interface AutocompleteSearchProps<T extends DomainFieldType, TSource = {key: string; label: string}>
    extends Omit<
        AutocompleteProps<TSource>,
        "error" | "loading" | "onChange" | "suggestionMatch" | "value" | "values"
    > {
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Service de résolution de clé. Doit retourner le libellé. */
    keyResolver?: (key: DomainTypeSingle<T>) => Promise<string | undefined>;
    /** Au changement. */
    onChange?: (key: DomainTypeSingle<T> | undefined, value?: TSource) => void;
    /** Service de recherche. */
    querySearcher?: (text: string) => Promise<TSource[]>;
    /** Active l'appel à la recherche si le champ est vide. */
    searchOnEmptyQuery?: boolean;
    /** Rappelle la recherche quand le `querySearcher` change (nécessite un `querySearcher` stable). */
    searchOnQuerySearcherChange?: boolean;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Valeur. */
    value?: DomainTypeSingle<T>;
}

const defaultGetKey = (x: any) => x.key;

/**
 * Champ de saisie en autocomplétion à partir d'un **service de recherche**.
 *
 * Il s'agit du composant par défaut de `autocompleteFor`.
 */
export const AutocompleteSearch = forwardRef(function AutocompleteSearch<
    T extends DomainFieldType,
    TSource = {key: string; label: string}
>(
    {
        error,
        getKey = defaultGetKey,
        keyResolver,
        onChange,
        onQueryChange,
        query: pQuery = "",
        querySearcher,
        searchOnEmptyQuery = false,
        searchOnQuerySearcherChange = false,
        supportingText,
        showSupportingText = "always",
        type,
        value,
        ...props
    }: AutocompleteSearchProps<T, TSource>,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    const [query, setQuery] = useState(pQuery);
    useEffect(() => setQuery(pQuery), [pQuery]);

    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState<TSource[]>([]);

    useEffect(() => {
        if ((!!value || value === 0) && (!!keyResolver || !!pQuery)) {
            setLoading(true);
            (keyResolver
                ? keyResolver(value)
                : new Promise<string>(r => {
                      r(pQuery);
                  })
            ).then(async label => {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                setQuery(label ?? `${value}`);
                if (!values.find(v => getKey(v) === value) && label && querySearcher) {
                    setValues(await querySearcher(encodeURIComponent(label)));
                }
                setLoading(false);
            });
        }
    }, [value]);

    const search = useCallback(
        debounce(async function search(newQuery: string) {
            if (querySearcher && (searchOnEmptyQuery || newQuery.trim().length)) {
                setLoading(true);
                setValues(await querySearcher(encodeURIComponent(newQuery.trim())));
                setLoading(false);
            }
        }, 200),
        [querySearcher, searchOnEmptyQuery]
    );

    useEffect(() => {
        if (searchOnQuerySearcherChange && query) {
            setValues([]);
            search(query);
        }
    }, [search, searchOnQuerySearcherChange]);

    function handleQueryChange(newQuery: string) {
        setQuery(newQuery);
        onQueryChange?.(newQuery);

        if (!newQuery && !searchOnEmptyQuery) {
            setValues([]);
        }

        search(newQuery);
    }

    function handleChange(newKey?: string, newValue?: TSource) {
        onChange?.(stringToDomainType(newKey, type), newValue);
    }

    function handleFocus() {
        if (searchOnEmptyQuery && !values.length) {
            search(query);
        }
    }

    return (
        <Autocomplete
            {...props}
            ref={ref}
            error={!!error}
            loading={loading}
            onChange={handleChange}
            onFocus={handleFocus}
            onQueryChange={handleQueryChange}
            query={query}
            showSupportingText={showSupportingText}
            suggestionMatch="disabled"
            supportingText={error ?? supportingText}
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            value={value !== undefined ? `${value}` : undefined}
            values={values}
        />
    );
}) as <T extends DomainFieldType, TSource = {key: string; label: string}>(
    props: AutocompleteSearchProps<T, TSource> & {ref?: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
) => ReactElement;
