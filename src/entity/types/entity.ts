import {AutocompleteProps, DisplayProps, InputProps, LabelProps, SelectProps} from "../../components";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    FieldComponents
} from "./components";
import {Validator} from "./validation";

/** Définition d'un domaine. */
export interface Domain<
    ICProps extends BaseInputProps = InputProps<"string" | "number">,
    SCProps extends BaseSelectProps = SelectProps<"string" | "number">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<"string" | "number">,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
> extends FieldComponents<ICProps, SCProps, ACProps, DCProps, LCProps> {
    /** Classe CSS pour le champ. */
    className?: string;
    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: any) => string;
    /** Formatteur pour l'affichage du champ en édition. */
    inputFormatter?: (value: any) => string;
    /** Formatteur inverse pour convertir l'affichage du champ en la valeur (édition uniquement) */
    unformatter?: (text: string) => any;
    /** Liste des validateurs. */
    validator?: Validator | Validator[];

    /** Composant personnalisé pour l'autocomplete. */
    AutocompleteComponent?: React.ComponentType<ACProps>;
    /** Composant personnalisé pour l'affichage. */
    DisplayComponent?: React.ComponentType<DCProps>;
    /** Composant personnalisé pour le libellé. */
    LabelComponent?: React.ComponentType<LCProps>;
    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent?: React.ComponentType<ICProps>;
    /** Composant personnalisé pour le select. */
    SelectComponent?: React.ComponentType<SCProps>;
}

/** Définition générale d'une entité. */
export interface Entity {
    /** Nom de l'entité. */
    readonly name: string;

    /** Liste des champs de l'entité. */
    readonly fields: {[key: string]: FieldEntry | ObjectEntry | ListEntry};
}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<
    T = any,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
> {
    readonly type: "field";

    /** Type du champ. */
    readonly fieldType: T;

    /** Domaine du champ. */
    readonly domain: Domain<ICProps, SCProps, ACProps, DCProps, LCProps>;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Libellé de l'entrée. */
    readonly label: string;

    /** Commentaire de l'entrée */
    readonly comment?: React.ReactNode;
}

/** Récupère le type d'un FieldEntry, et gère les cas spéciaux "string", "number" et "boolean". */
export type FieldEntryType<F> = F extends FieldEntry<"string">
    ? string
    : F extends FieldEntry<"number">
    ? number
    : F extends FieldEntry<"boolean">
    ? boolean
    : F extends FieldEntry<infer T>
    ? T
    : never;

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry<E extends Entity = any> {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entity: E;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<E extends Entity = any> {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entity: E;
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToType<E extends Entity> = {
    [P in keyof E["fields"]]?: E["fields"][P] extends FieldEntry
        ? FieldEntryType<E["fields"][P]>
        : E["fields"][P] extends ObjectEntry<infer OE>
        ? EntityToType<OE>
        : E["fields"][P] extends ListEntry<infer LE>
        ? EntityToType<LE>[]
        : never
};

/** Définition de champ dans un store. */
export interface EntityField<F extends FieldEntry = FieldEntry> {
    /** Métadonnées. */
    readonly $field: F;

    /** Valeur. */
    value: FieldEntryType<F> | undefined;
}
