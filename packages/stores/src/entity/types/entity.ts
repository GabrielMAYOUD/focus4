import {ComponentType} from "react";

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
    T = unknown,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
> extends FieldComponents<ICProps, SCProps, ACProps, DCProps, LCProps> {
    /** Classe CSS pour le champ. */
    className?: string;
    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: T | undefined) => string;
    /** Liste des validateurs. */
    validator?: Validator<T> | Validator<T>[];

    /** Composant personnalisé pour l'autocomplete. */
    AutocompleteComponent?: ComponentType<ACProps>;
    /** Composant personnalisé pour l'affichage. */
    DisplayComponent?: ComponentType<DCProps>;
    /** Composant personnalisé pour le libellé. */
    LabelComponent?: ComponentType<LCProps>;
    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent?: ComponentType<ICProps>;
    /** Composant personnalisé pour le select. */
    SelectComponent?: ComponentType<SCProps>;
}

/** Définition générale d'une entité. */
export interface Entity {
    /** Nom de l'entité. */
    readonly name: string;

    /** Liste des champs de l'entité. */
    readonly fields: {[key: string]: FieldEntry | ObjectEntry | ListEntry | RecursiveListEntry};
}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<
    DT = any,
    FT extends FieldEntryType<DT> = FieldEntryType<DT>,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
> {
    readonly type: "field";

    /** Type du champ. */
    readonly fieldType: FT;

    /** Domaine du champ. */
    readonly domain: Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps>;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Libellé de l'entrée. */
    readonly label: string;

    /** Commentaire de l'entrée */
    readonly comment?: React.ReactNode;
}

/** Transforme un type effectif en un type à passer à un FieldEntry. */
export type FieldEntryType<T> = T extends string
    ? "string"
    : T extends number
    ? "number"
    : T extends boolean
    ? "boolean"
    : NonNullable<T>;

/** Transforme le type passé à un FieldEntry en type effectif. */
export type FieldType<FT> = FT extends "string"
    ? string
    : FT extends "number"
    ? number
    : FT extends "boolean"
    ? boolean
    : NonNullable<FT>;

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

/** Métadonnées d'une entrée de type "recursive-list" pour une entité. */
export interface RecursiveListEntry {
    readonly type: "recursive-list";
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToType<E extends Entity> = {
    -readonly [P in keyof E["fields"]]?: E["fields"][P] extends FieldEntry
        ? FieldType<E["fields"][P]["fieldType"]>
        : E["fields"][P] extends ObjectEntry<infer OE>
        ? EntityToType<OE>
        : E["fields"][P] extends ListEntry<infer LE>
        ? EntityToType<LE>[]
        : E["fields"][P] extends RecursiveListEntry
        ? EntityToType<E>[]
        : never;
};

/** Définition de champ dans un store. */
export interface EntityField<F extends FieldEntry = FieldEntry> {
    /** Métadonnées. */
    readonly $field: F;

    /** Valeur. */
    value: FieldType<F["fieldType"]> | undefined;
}
