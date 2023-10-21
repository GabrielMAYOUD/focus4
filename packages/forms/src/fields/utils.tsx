import {upperFirst} from "lodash";
import {action} from "mobx";

import {
    AutocompleteComponents,
    BaseSelectProps,
    DomainTypeSingle,
    EntityField,
    FieldEntry,
    FieldEntryType,
    InputComponents,
    ReferenceList,
    SelectComponents,
    SingleDomainFieldType
} from "@focus4/stores";

import {Field, FieldOptions} from "./field";

function getOnChange<F extends FieldEntry>(field: EntityField<F>) {
    return action(
        `on${upperFirst(field.$field.name)}Change`,
        (value: FieldEntryType<F> | undefined) => (field.value = value)
    );
}

/** Options pour `autocompleteFor` */
export type AutocompleteForOptions<F extends FieldEntry> = AutocompleteComponents<
    NonNullable<F["domain"]["autocompleteProps"]>,
    NonNullable<F["domain"]["displayProps"]>,
    NonNullable<F["domain"]["labelProps"]>
> &
    Partial<FieldOptions<F>> & {
        /** Service de résolution de code. */
        keyResolver?: (
            key: DomainTypeSingle<SingleDomainFieldType<F["domain"]["type"]>>
        ) => Promise<string | undefined>;
        /** Service de recherche. */
        querySearcher?: (text: string) => Promise<{key: string; label: string}[]>;
    };

/** Options pour `fieldFor` */
export type FieldForOptions<F extends FieldEntry> = InputComponents<
    NonNullable<F["domain"]["inputProps"]>,
    NonNullable<F["domain"]["displayProps"]>,
    NonNullable<F["domain"]["labelProps"]>
> &
    Partial<FieldOptions<F>>;

/** Options pour `selectFor`. */
export type SelectForOptions<F extends FieldEntry> = Partial<FieldOptions<F>> &
    SelectComponents<
        BaseSelectProps & NonNullable<F["domain"]["selectProps"]>,
        NonNullable<F["domain"]["displayProps"]>,
        NonNullable<F["domain"]["labelProps"]>
    >;

/**
 * Crée un champ avec saisie en autocomplete
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function autocompleteFor<F extends FieldEntry>(field: EntityField<F>, options: AutocompleteForOptions<F>) {
    const {keyResolver, querySearcher, ...otherOptions} = options;
    return (
        <Field
            field={field}
            onChange={getOnChange(field)}
            {...otherOptions}
            autocompleteProps={{...((options.autocompleteProps as {}) || {}), keyResolver, querySearcher}}
            inputType="autocomplete"
        />
    );
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<F extends FieldEntry>(field: EntityField<F>, options: FieldForOptions<F> = {}) {
    return <Field field={field} onChange={getOnChange(field)} {...options} inputType="input" />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<F extends FieldEntry>(
    field: EntityField<F>,
    values: ReferenceList,
    options: SelectForOptions<F> = {}
) {
    return (
        <Field
            field={field}
            onChange={getOnChange(field)}
            {...options}
            inputType="select"
            selectProps={{
                ...((options.selectProps as {}) || {}),
                values
            }}
        />
    );
}
