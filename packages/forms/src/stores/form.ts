import {isFunction} from "lodash";
import {disposeOnUnmount} from "mobx-react";
import {Component, useEffect, useId, useState} from "react";

import {
    EntityToType,
    FormActions,
    FormActionsBuilder,
    FormListNode,
    FormListNodeBuilder,
    FormNode,
    FormNodeBuilder,
    isStoreListNode,
    StoreListNode,
    StoreNode,
    toFlatValues
} from "@focus4/stores";

/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function makeFormNode<E, NE = E>(
    componentClass: Component | null,
    node: StoreNode<E>,
    builder?: (s: FormNodeBuilder<E, E>) => FormNodeBuilder<NE, E>,
    initialData?: EntityToType<E> | (() => EntityToType<E>)
): FormNode<NE, E>;
/**
 * Construit un FormListNode à partir d'un StoreListNode.
 * Le FormListNode est un clone d'un StoreListNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreListNode réinitialise le FormListNode.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function makeFormNode<E, NE = E>(
    componentClass: Component | null,
    node: StoreListNode<E>,
    builder?: (s: FormListNodeBuilder<E, E>) => FormListNodeBuilder<NE, E>,
    initialData?: EntityToType<E>[] | (() => EntityToType<E>[])
): FormListNode<NE, E>;
export function makeFormNode(
    componentClass: Component | null,
    node: StoreListNode | StoreNode,
    builder: (x: any) => any = (x: any) => x,
    initialData?: any
): any {
    let fn;
    if (isStoreListNode(node)) {
        fn = builder(new FormListNodeBuilder(node)).build();
        if (initialData) {
            fn.setNodes(isFunction(initialData) ? initialData() : initialData);
        }
    } else {
        fn = builder(new FormNodeBuilder(node)).build();
        if (initialData) {
            fn.set(isFunction(initialData) ? initialData() : initialData);
        }
    }
    fn.form._initialData = toFlatValues(fn, true);
    if (componentClass && fn.dispose) {
        disposeOnUnmount(componentClass, fn.dispose);
    }
}

/**
 * Construit un FormListNode à partir d'un StoreListNode.
 * Le FormListNode est un clone d'un StoreListNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreListNode réinitialise le FormListNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE = E>(
    node: StoreListNode<E>,
    builder?: (s: FormListNodeBuilder<E, E>) => FormListNodeBuilder<NE, E>,
    initialData?: EntityToType<E>[] | (() => EntityToType<E>[])
): FormListNode<NE, E>;
/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE = E>(
    node: StoreNode<E>,
    builder?: (s: FormNodeBuilder<E, E>) => FormNodeBuilder<NE, E>,
    initialData?: EntityToType<E> | (() => EntityToType<E>)
): FormNode<NE, E>;
export function useFormNode(
    node: StoreListNode | StoreNode,
    builder: (x: any) => any = (x: any) => x,
    initialData: any = undefined
) {
    const [formNode] = useState(() => {
        let fn;
        if (isStoreListNode(node)) {
            fn = builder(new FormListNodeBuilder(node)).build();
            if (initialData) {
                fn.setNodes(isFunction(initialData) ? initialData() : initialData);
            }
        } else {
            fn = builder(new FormNodeBuilder(node)).build();
            if (initialData) {
                fn.set(isFunction(initialData) ? initialData() : initialData);
            }
        }
        fn.form._initialData = toFlatValues(fn, true);
        return fn;
    });
    useEffect(() => formNode.dispose, []);
    return formNode;
}

/**
 * Crée les actions d'un formulaire.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param formNode Le FormNode du formulaire.
 * @param builder Le configurateur.
 */
export function makeFormActions<FN extends FormListNode | FormNode, A extends readonly any[] = never>(
    componentClass: Component | null,
    formNode: FN,
    builder: (s: FormActionsBuilder<FN>) => FormActionsBuilder<FN, A>
): FormActions<FN, A> {
    const formActions = new FormActions(formNode, builder(new FormActionsBuilder()));
    if (componentClass) {
        disposeOnUnmount(componentClass, formActions.register());
    }
    return formActions;
}

/**
 * Permet de définir des actions de formulaires pour un noeud de formulaire. Les actions peuvent comprendre un service de chargement et un service de sauvegarde.
 *
 * Le service de chargement sera rappelé automatiquement à chaque fois que les paramètres définis changent.
 *
 * @param formNode FormNode ou FormListNode.
 * @param builder Builder pour les actions de formulaires (permet de définir les paramètres, les services, et d'autres configurations).
 * @param deps Liste de dépendances (React) pour les actions de formulaire. Le builder sera redéfini à tout changement d'une valeur de cette liste, et l'éventuel service de chargement sera rappelé.
 * @returns Objet d'actions de formulaire.
 */
export function useFormActions<FN extends FormListNode | FormNode, A extends readonly any[] = never>(
    node: FN,
    builder: (s: FormActionsBuilder<FN>) => FormActionsBuilder<FN, A>,
    deps: any[] = []
) {
    const trackingId = useId();
    const [formActions] = useState(() => new FormActions(node, builder(new FormActionsBuilder()), trackingId));

    useEffect(() => formActions.register(node.sourceNode, builder(new FormActionsBuilder())), [node, ...deps]);

    return formActions;
}
