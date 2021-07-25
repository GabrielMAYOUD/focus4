import i18next from "i18next";
import {debounce} from "lodash-decorators";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {observer} from "mobx-react";
import {Component} from "react";
import {findDOMNode} from "react-dom";

import {CSSProp, themr} from "@focus4/styling";
import {
    InputCss,
    ProgressBar,
    Autocomplete as RTAutocomplete,
    AutocompleteCss as RTAutocompleteCss,
    AutocompleteProps as RTAutocompleteProps
} from "@focus4/toolbox";

import autocompleteCss, {AutocompleteCss as ACCSS} from "./__style__/autocomplete.css";
export {autocompleteCss};
export type AutocompleteCss = ACCSS & RTAutocompleteCss & InputCss;
const Theme = themr<AutocompleteCss>("autocomplete", autocompleteCss as AutocompleteCss);

/** Résultat du service de recherche. */
export interface AutocompleteResult {
    /** Données. */
    data?: {
        key: string;
        label: string;
    }[];
    /** Nombre total de résultat. */
    totalCount: number;
}

/** Props du composant d'autocomplétion */
export interface AutocompleteProps<T extends "string" | "number">
    extends Omit<RTAutocompleteProps, "onChange" | "value"> {
    /** Sélectionne automatiquement le résultat d'une recherche qui envoie un seul élément. */
    autoSelect?: boolean;
    /** Utilise l'autocomplete en mode "quick search" (pas de valeur, champ vidé à la sélection). */
    isQuickSearch?: boolean;
    /** Service de résolution de code. */
    keyResolver?: (key: any) => Promise<string | undefined>;
    /** Service de recherche. */
    querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
    /** Au changement. */
    onChange: (value: (T extends "string" ? string : number) | undefined) => void;
    /** Active l'appel à la recherche si le champ est vide. */
    searchOnEmptyQuery?: boolean;
    /** CSS. */
    theme?: CSSProp<AutocompleteCss>;
    /** Type du champ ("string" ou "number"). */
    type: T;
    /** Valeur. */
    value: (T extends "string" ? string : number) | undefined;
}

/** Surcouche de l'Autocomplete React-Toolbox pour utilisation des services de recherche serveur. */
@observer
// eslint-disable-next-line react/no-unsafe
export class Autocomplete<T extends "string" | "number"> extends Component<AutocompleteProps<T>> {
    /** Cette valeur est gardée à chaque retour de l'autocomplete pour savoir s'il faut ou non vider la valeur lorsqu'on saisit du texte. */
    protected value?: string;

    protected inputElement!: HTMLInputElement | null;

    /** Requête d'autocomplete en cours. */
    @observable protected isLoading = false;

    /** Contenu du champ texte. */
    @observable protected query = "";

    /** Résultat de la recherche d'autocomplétion. */
    protected readonly data = observable.map<string, string>();

    constructor(props: AutocompleteProps<T>) {
        super(props);
        makeObservable(this);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
    async UNSAFE_componentWillMount() {
        const {value, keyResolver, isQuickSearch} = this.props;
        if ((value || value === 0) && !isQuickSearch && keyResolver) {
            const label = i18next.t((await keyResolver(value)) ?? "");
            runInAction(() => {
                this.query = label || `${value}`;
                if (label) {
                    this.data.set(`${value}`, label);
                }
            });
        }
    }

    componentDidMount() {
        // eslint-disable-next-line react/no-find-dom-node
        this.inputElement = (findDOMNode(this) as Element).querySelector("input");
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
    async UNSAFE_componentWillReceiveProps({autoSelect, value, isQuickSearch, keyResolver}: AutocompleteProps<T>) {
        if (autoSelect && value !== this.props.value && value && !isQuickSearch && keyResolver) {
            this.query = i18next.t((await keyResolver(value)) ?? "") || value?.toString() || "";
        }
    }

    /** Résultats sous format JSON, pour l'autocomplete. */
    @computed.struct
    get source() {
        return Object.fromEntries(this.data);
    }

    focus() {
        // C'est moche mais sinon ça marche pas...
        setTimeout(() => this.inputElement?.focus(), 0);
    }

    /**
     * Est appelé à chaque saisie dans le champ texte.
     * @param query Le champ texte.
     */
    @action.bound
    onQueryChange(query: string) {
        const {onQueryChange, onChange, isQuickSearch, searchOnEmptyQuery} = this.props;

        // On compare la query à la dernière valeur retournée par l'autocomplete : si elles sont différentes, alors on vide le champ.
        const label = this.value && this.data.get(this.value);
        if (label !== query && onChange) {
            onChange(undefined);
        }

        if (query !== this.query && (!this.value || !isQuickSearch)) {
            this.query = query;
            if (onQueryChange) {
                onQueryChange(query);
            }
            this.debouncedSearch(query);
        }

        if (isQuickSearch) {
            this.value = "";
        }
        if (!searchOnEmptyQuery && !this.query) {
            this.data.clear();
        }
    }

    /**
     * Est appelé lorsque l'on sélectionne une valeur.
     * @param value La valeur sélectionnée.
     */
    @action.bound
    onValueChange(value: string) {
        const {isQuickSearch, onChange, type} = this.props;

        if (isQuickSearch && value) {
            this.query = "";
            this.data.clear();
            this.focus();
        }

        this.value = value;

        if (onChange) {
            const v = (type === "number" ? parseFloat(value) : value) as T extends "string" ? string : number;
            onChange(v || v === 0 ? v : undefined);
        }
    }

    /**
     * Effectue la recherche sur le serveur.
     * @param query Le champ texte.
     */
    @action.bound
    async search(query: string) {
        if (this.props.querySearcher && (this.props.searchOnEmptyQuery || query.trim().length)) {
            this.isLoading = true;
            const result = await this.props.querySearcher(encodeURIComponent(query.trim()));
            runInAction(() => {
                this.data.replace(
                    result?.data?.reduce((acc, next) => ({...acc, [next.key]: i18next.t(next.label)}), {}) ?? {}
                );
                this.isLoading = false;

                if (this.props.autoSelect) {
                    if (this.data && this.data.size === 1) {
                        this.onValueChange(query);
                    } else {
                        this.onValueChange("");
                    }
                }
            });
        }
    }

    @debounce(200)
    private debouncedSearch(query: string) {
        this.search(query);
    }

    @action.bound
    onFocus() {
        if (!this.data.size && this.props.searchOnEmptyQuery) {
            this.search(this.query);
        }
    }

    render() {
        const {keyResolver, querySearcher, theme: pTheme, isQuickSearch, autoSelect, ...props} = this.props;
        return (
            <Theme theme={pTheme}>
                {theme => (
                    <div data-focus="autocomplete">
                        <RTAutocomplete
                            {...props}
                            maxLength={undefined}
                            multiple={false}
                            onChange={value => this.onValueChange(value as string)}
                            onFocus={this.onFocus}
                            onQueryChange={(query?: string) => this.onQueryChange(query ?? "")}
                            query={this.query}
                            source={this.source}
                            suggestionMatch="disabled"
                            theme={theme}
                            type="search"
                            value={`${props.value ?? ""}`}
                        />
                        {this.isLoading ? (
                            <ProgressBar
                                mode="indeterminate"
                                theme={{progressBar: theme.progressBar()}}
                                type="linear"
                            />
                        ) : null}
                    </div>
                )}
            </Theme>
        );
    }
}
