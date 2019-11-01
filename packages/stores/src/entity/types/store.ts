import {IObservableArray} from "mobx";

import {Entity, EntityField, EntityToType, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "./entity";

/** Génère les entrées de noeud de store équivalent à une entité. */
export type EntityToNode<E extends Entity> = {
    readonly [P in keyof E]: E[P] extends FieldEntry
        ? EntityField<E[P]>
        : E[P] extends ObjectEntry<infer OE>
        ? StoreNode<OE>
        : E[P] extends ListEntry<infer LE>
        ? StoreListNode<LE>
        : E[P] extends RecursiveListEntry
        ? StoreListNode<E>
        : never;
};

/** Noeud de store simple. */
export type StoreNode<E extends Entity = any> = EntityToNode<E> & {
    /** @internal */
    /** isEdit temporaire, traité par `addFormProperties`. */
    $tempEdit?: boolean | (() => boolean);

    /** Vide l'objet (récursivement). */
    clear(): StoreNode<E>;

    /** Remplace le contenu du noeud par le contenu donné. */
    replace(data: EntityToType<E>): StoreNode<E>;

    /** Met à jour les champs donnés dans le noeud. */
    set(data: EntityToType<E>): StoreNode<E>;
};

/** Noeud de store liste. C'est une liste de noeud de store simple. */
export interface StoreListNode<E extends Entity = any> extends IObservableArray<StoreNode<E>> {
    /** @internal */
    /** isEdit temporaire, traité par `addFormProperties`. */
    $tempEdit?: boolean | (() => boolean);

    /** Métadonnées. */
    readonly $entity: E;

    /** Fonction d'initialisation pour les items d'un noeud de formulaire créé à partir de ce noeud liste. */
    /** @deprecated Utiliser makeFormNode(node).items() à la place. */
    $initializer?: (source: StoreNode<E>) => {} | void;

    /** Fonction de modification d'un objet, appelé à la création. */
    /** @internal */
    $nodeBuilder?: <NE extends Entity>(source: StoreNode<E>) => StoreNode<NE>;

    /** Ajoute un élément à la liste. */
    pushNode(...items: EntityToType<E>[]): number;

    /** Reconstruit le noeud de liste à partir de la liste fournie. */
    replaceNodes(data: EntityToType<E>[]): StoreListNode<E>;

    /** Met à jour le noeud de liste à partir de la liste fournie. */
    setNodes(data: EntityToType<E>[]): StoreListNode<E>;
}
