import i18next from "i18next";
import {action, comparer, observable, reaction} from "mobx";
import {useObserver} from "mobx-react";
import {ElementType, SyntheticEvent, useEffect, useState} from "react";

import {CollectionStore, FacetOutput, FormEntityField} from "@focus4/stores";
import {CSSProp, fromBem, getIcon, useTheme} from "@focus4/styling";
import {IconButton} from "@focus4/toolbox";

import {Facet, FacetCss, facetCss, FacetProps} from "./facet";
import {shouldDisplayFacet} from "./utils";
export {shouldDisplayFacet, FacetProps};

import facetBoxCss, {FacetBoxCss} from "../__style__/facet-box.css";
export {FacetBoxCss, FacetCss, facetBoxCss, facetCss};

/** "Facette" additionnelle. */
export interface AdditionalFacet {
    /** Le composant de rendu de la "facette". */
    Component: ElementType<FacetProps>;
    /** Les champs utilisés dans le filtre. Ils seront associés au bouton "clear" de la FacetBox si renseignés. */
    fields?: FormEntityField[];
    /** Valeurs initiales des champs, pour que le "clear" remette les champs à ses valeurs là. */
    initialValues?: any[];
    /** La position à laquelle le composant sera inséré dans la liste des facettes. Si non renseigné, elle sera en premier (0). */
    position?: number;
}

/** Props de la FacetBox. */
export interface FacetBoxProps<T> {
    /** Composants additionnels à afficher dans la FacetBox, pour y intégrer des filtres par exemple.  */
    additionalFacets?: {
        [facet: string]: AdditionalFacet;
    };
    /** Composant personnalisés pour affichage d'une facette en particulier. */
    customFacetComponents?: {[facet: string]: ElementType<FacetProps>};
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataList?: number;
    /**
     * Si renseigné, affiche les facettes dans des sections nommées.
     * Il est possible d'avoir une section qui contient toutes les facettes non renseignées en ne renseignant pas la liste `facets`.
     */
    sections?: {name: string; facets?: string[]}[];
    /** Affiche les facettes qui n'ont qu'une seule valeur. */
    showSingleValuedFacets?: boolean;
    /** Store de recherche associé. */
    store: CollectionStore<T>;
    /** CSS. */
    theme?: CSSProp<FacetBoxCss>;
}

/** Composant contenant la liste des facettes retournées par une recherche. */
export function FacetBox<T>({
    additionalFacets = {},
    customFacetComponents = {},
    i18nPrefix = "focus",
    nbDefaultDataList = 6,
    sections,
    showSingleValuedFacets,
    store,
    theme: pTheme
}: FacetBoxProps<T>) {
    const theme = useTheme("facetBox", facetBoxCss, pTheme);
    const facetTheme = useTheme("facet", facetCss);

    // Map pour contrôler les facettes qui sont ouvertes, initialisée une seule fois après le premier chargement du store (le service renvoie toujours toutes les facettes).
    const [openedMap] = useState(() => observable.map<string, boolean>());

    function toggleAll(opened: boolean) {
        openedMap.replace(
            store.facets
                .map(facet => [facet.code, opened])
                .concat(Object.keys(additionalFacets).map(code => [code, opened]))
        );
    }

    useEffect(
        () =>
            reaction(
                () => store.facets.map(f => f.code),
                () => toggleAll(true),
                {
                    equals: comparer.structural,
                    fireImmediately: true
                }
            ),
        [additionalFacets]
    );

    function renderFacet(facet: FacetOutput) {
        const FacetComponent = customFacetComponents[facet.code] ?? additionalFacets[facet.code]?.Component ?? Facet;
        return (
            <FacetComponent
                key={facet.code}
                facet={facet}
                i18nPrefix={i18nPrefix}
                nbDefaultDataList={nbDefaultDataList}
                openedMap={openedMap}
                store={store}
                theme={
                    customFacetComponents[facet.code] ?? additionalFacets[facet.code] ? fromBem(facetTheme) : undefined
                }
            />
        );
    }

    const clearFacets = action((e: SyntheticEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        store.removeFacetValue();
        Object.values(additionalFacets).forEach(facet =>
            facet.fields?.forEach((field, idx) => (field.value = facet.initialValues?.[idx]))
        );
    });

    return useObserver(() => {
        const facets = store.facets.slice();

        Object.entries(additionalFacets).forEach(([code, def]) => {
            facets.splice(def.position ?? 0, 0, {
                code,
                label: code,
                canExclude: false,
                isMultiSelectable: false,
                isMultiValued: false,
                values: []
            });
        });

        const filteredFacets = facets.filter(
            facet =>
                facet.code in additionalFacets ||
                (shouldDisplayFacet(facet, store.inputFacets, showSingleValuedFacets, store.totalCount) &&
                    facet.code !== store.groupingKey)
        );

        let sectionElements: JSX.Element[] | undefined;
        if (sections) {
            if (sections.filter(s => !s.facets).length > 1) {
                throw new Error("Il ne peut y avoir qu'une seule section de facettes non renseignées.");
            }

            let remainingFacets = [...filteredFacets];

            sectionElements = sections
                .filter(s => !!s.facets && s.facets.length)
                .map(s => {
                    const facets = s
                        .facets!.map(code => {
                            const facet = filteredFacets.find(f => f.code === code);
                            if (facet) {
                                remainingFacets = remainingFacets.filter(f => facet !== f);
                                return renderFacet(facet);
                            } else {
                                return null;
                            }
                        })
                        .filter(x => x);
                    if (facets.length) {
                        return (
                            <div key={s.name} className={theme.section()}>
                                <h5>{s.name}</h5>
                                {facets}
                            </div>
                        );
                    } else {
                        return null;
                    }
                })
                .filter(x => x) as JSX.Element[];

            const restSection = sections.find(s => !s.facets && !!remainingFacets.length);
            if (restSection) {
                sectionElements.splice(
                    sections.indexOf(restSection),
                    0,
                    <div key={restSection.name} className={theme.section()}>
                        {restSection.name ? <h4>{restSection.name}</h4> : null}
                        {remainingFacets.map(renderFacet)}
                    </div>
                );
            }
        }

        const opened = Array.from(openedMap.values()).some(v => v);

        const shouldDisplayClear =
            Object.values(store.inputFacets).some(l => l.selected || l.excluded) ||
            Object.values(additionalFacets).some(({fields = [], initialValues = []}) =>
                fields.some((field, idx) => field.value !== initialValues[idx])
            );

        return (
            <div className={theme.facetBox()}>
                <h3 onClick={() => toggleAll(!opened)}>
                    <IconButton icon={getIcon(`${i18nPrefix}.icons.facets.${opened ? "close" : "open"}`)} />
                    <span>{i18next.t(`${i18nPrefix}.search.facets.title`)}</span>
                    {shouldDisplayClear ? (
                        <IconButton onClick={clearFacets} icon={getIcon(`${i18nPrefix}.icons.searchBar.clear`)} />
                    ) : null}
                </h3>
                {sectionElements || filteredFacets.map(renderFacet)}
            </div>
        );
    });
}
