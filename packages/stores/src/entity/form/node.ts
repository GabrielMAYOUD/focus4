import {isFunction} from "lodash";
import {extendObservable, observable} from "mobx";

import {EntityFieldBuilder} from "../field";
import {nodeToFormNode} from "../store";
import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    FieldEntry,
    FormNode,
    isEntityField,
    isStoreListNode,
    isStoreNode,
    ListEntry,
    ObjectEntry,
    RecursiveListEntry,
    StoreListNode,
    StoreNode
} from "../types";
import {FormListNodeBuilder} from "./list-node";

type FieldsOf<E> = {[P in keyof E]: E[P] extends FieldEntry ? P : never}[keyof E];
type ObjectsOf<E> = {[P in keyof E]: E[P] extends ObjectEntry ? P : never}[keyof E];
type ListsOf<E> = {[P in keyof E]: E[P] extends ListEntry | RecursiveListEntry ? P : never}[keyof E];

type EntryToEntity<E> = E extends ObjectEntry<infer E1>
    ? E1
    : E extends ListEntry<infer E2>
    ? E2
    : E extends RecursiveListEntry
    ? E
    : never;

export class FormNodeBuilder<E, E0 = E> {
    /** @internal */
    node: StoreNode<E>;
    /** @internal */
    sourceNode: StoreNode<E0>;
    /** @internal */
    isEdit?: boolean | (() => boolean);

    constructor(node: StoreNode<E>) {
        this.node = clone(node);
        this.sourceNode = node as any;
    }

    /**
     * Ajoute un champ calculé dans le FormNode.
     * @param name Nom du champ.
     * @param get Getter du champ.
     * @param set Setter du champ.
     */
    add<FE extends string, NFE extends FieldEntry>(
        name: FE,
        builder: (
            b: EntityFieldBuilder<
                FieldEntry<
                    "string",
                    string,
                    BaseInputProps,
                    BaseSelectProps,
                    BaseAutocompleteProps,
                    BaseDisplayProps,
                    BaseLabelProps
                >
            >,
            node: StoreNode<E>
        ) => EntityFieldBuilder<NFE>
    ): FormNodeBuilder<E & {[P in FE]: NFE}, E0> {
        // @ts-ignore
        this.node[name] = builder(new EntityFieldBuilder(name), this.node).collect();
        // @ts-ignore
        return this;
    }

    /**
     * Construit le FormNode à partir de la configuration renseignée.
     */
    build(): FormNode<E, E0> {
        this.node.$tempEdit = this.isEdit ?? false;
        nodeToFormNode(this.node, this.sourceNode);

        // @ts-ignore
        return this.node;
    }

    /**
     * Initialise l'état d'édition du FormNode.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormNodeBuilder<E, E0>;
    /**
     * Force l'état d'édition du FormNode.
     * @param value Condition d'édition.
     */
    edit(value: (node: StoreNode<E>) => boolean): FormNodeBuilder<E, E0>;
    /**
     * Initialise l'état d'édition de plusieurs champs/noeuds du FormNode.
     * @param value Etat d'édition initial.
     * @param params Les champs.
     */
    edit(value: boolean, ...params: (keyof E)[]): FormNodeBuilder<E, E0>;
    /**
     * Force l'état d'édition de plusieurs champs/noeuds du FormNode.
     * @param value Condition d'édition.
     * @param params Les champs.
     */
    edit(value: (node: StoreNode<E>) => boolean, ...params: (keyof E)[]): FormNodeBuilder<E, E0>;
    edit(value: boolean | ((node: StoreNode<E>) => boolean), ...params: (keyof E)[]): FormNodeBuilder<E, E0> {
        const isEdit = isFunction(value) ? () => value(this.node) : value;
        if (!params.length) {
            this.isEdit = isEdit;
        } else {
            params.forEach(key => {
                const child = this.node[key];
                if (isStoreListNode(child)) {
                    // @ts-ignore
                    this.node[key] = new FormListNodeBuilder(child).edit(isEdit).collect();
                } else if (isStoreNode(child)) {
                    // @ts-ignore
                    this.node[key] = new FormNodeBuilder(child).edit(isEdit).collect();
                } else if (isEntityField(child)) {
                    // @ts-ignore
                    this.node[key] = new EntityFieldBuilder(child).edit(isEdit).collect();
                }
            });
        }
        return this;
    }

    /**
     * Modifie un champ du FormNode.
     * @param field Nom du champ.
     * @param builder Configurateur de champ.
     */
    patch<F extends FieldsOf<E>, NFE extends FieldEntry>(
        field: F,
        builder: (b: EntityFieldBuilder<E[F]>, node: StoreNode<E>) => EntityFieldBuilder<NFE>
    ): FormNodeBuilder<E[F] extends NFE ? E : Omit<E, F> & {[_ in F]: NFE}, E0>;
    /**
     * Modifie un noeud du FormNode.
     * @param node Nom du noeud.
     * @param builder Configurateur de noeud.
     */
    patch<L extends ListsOf<E>, NE>(
        node: L,
        builder: (
            b: FormListNodeBuilder<EntryToEntity<E[L]>>,
            node: StoreNode<E>
        ) => FormListNodeBuilder<NE, EntryToEntity<E[L]>>
    ): FormNodeBuilder<E[L] extends NE ? E : Omit<E, L> & {[_ in L]: ListEntry<NE>}, E0>;
    /**
     * Modifie un noeud du FormNode.
     * @param node Nom du noeud.
     * @param builder Configurateur de noeud.
     */
    patch<O extends ObjectsOf<E>, NE>(
        node: O,
        builder: (
            b: FormNodeBuilder<EntryToEntity<E[O]>>,
            node: StoreNode<E>
        ) => FormNodeBuilder<NE, EntryToEntity<E[O]>>
    ): FormNodeBuilder<E[O] extends NE ? E : Omit<E, O> & {[_ in O]: ObjectEntry<NE>}, E0>;
    patch(node: keyof E, builder: Function): any {
        const child = this.node[node];
        if (isStoreListNode(child)) {
            this.node[node] = builder(new FormListNodeBuilder(child), this.node).collect();
        } else if (isStoreNode(child)) {
            this.node[node] = builder(new FormNodeBuilder(child as any), this.node).collect();
        } else if (isEntityField(child)) {
            this.node[node] = builder(new EntityFieldBuilder(child), this.node).collect();
        }
        return this;
    }

    /**
     * Supprime les champs demandés du FormNode.
     * @param fields Les champs à supprimer.
     */
    remove<F extends FieldsOf<E> | ObjectsOf<E> | ListsOf<E>>(...fields: F[]): FormNodeBuilder<Omit<E, F>, E0> {
        fields.forEach(field => delete this.node[field]);
        // @ts-ignore
        return this;
    }

    /**
     * Supprime tous les champs du FormNode, sauf ceux demandés.
     * @param fields Les champs à garder.
     */
    removeAllBut<F extends FieldsOf<E> | ObjectsOf<E> | ListsOf<E>>(...fields: F[]): FormNodeBuilder<Pick<E, F>, E0> {
        for (const key in this.node) {
            if (!fields.includes(key as F) && !["clear", "replace", "set"].includes(key)) {
                delete this.node[key as F];
            }
        }
        // @ts-ignore
        return this;
    }

    /** @internal */
    collect() {
        this.node.$tempEdit = this.isEdit ?? true;
        return this.node;
    }
}

export function clone(source: any): any {
    if (isStoreListNode(source)) {
        const res = observable.array<{}>([], {deep: false}) as StoreListNode;

        // @ts-ignore
        res.$entity = source.$entity;
        res.pushNode = source.pushNode;
        res.replaceNodes = source.replaceNodes;
        res.setNodes = source.setNodes;

        return res;
    } else if (isStoreNode(source)) {
        const res: typeof source = {} as any;
        for (const key in source) {
            // @ts-ignore
            res[key] = clone((source as any)[key]);
        }
        return res;
    } else if (isEntityField(source)) {
        return extendObservable(
            {
                $field: source.$field
            },
            {
                value: undefined
            },
            {
                value: observable.ref
            }
        );
    }

    return source;
}
