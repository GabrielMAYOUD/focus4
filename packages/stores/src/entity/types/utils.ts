import {isObservableArray} from "mobx";

import {EntityField, EntityToType} from "./entity";
import {FormEntityField, FormListNode, FormNode} from "./form";
import {StoreListNode, StoreNode} from "./store";

/** Génère l'objet JS "normal" équivalent à un noeud de store. */
export type NodeToType<SN> = SN extends FormListNode<infer LEF, infer _>
    ? EntityToType<LEF>[]
    : SN extends FormNode<infer OEF, infer __>
    ? EntityToType<OEF>
    : SN extends StoreListNode<infer LE>
    ? EntityToType<LE>[]
    : SN extends StoreNode<infer OE>
    ? EntityToType<OE>
    : never;

/** Génère l'objet JS "normal" équivalent au SourceNode d'un FormNode. */
export type FormNodeToSourceType<SN> = SN extends FormListNode<infer _, infer LEF>
    ? EntityToType<LEF>[]
    : SN extends FormNode<infer __, infer OEF>
    ? EntityToType<OEF>
    : never;

export function isEntityField(data: any): data is EntityField {
    return data && !!(data as EntityField).$field;
}

export function isAnyStoreNode<E = any>(data: any): data is StoreNode<E> | StoreListNode<E> {
    return data && !!(data as StoreNode).set && !!(data as StoreNode).clear;
}

export function isStoreListNode<E = any>(data: any): data is StoreListNode<E> {
    return isAnyStoreNode(data) && isObservableArray(data);
}

export function isStoreNode<E = any>(data: any): data is StoreNode<E> {
    return isAnyStoreNode(data) && !isObservableArray(data);
}

export function isAnyFormNode<E = any>(data: any): data is FormNode<E> | FormListNode<E> {
    return data && !!(data as FormNode).form;
}

export function isFormNode<E = any>(data: any): data is FormNode<E> {
    return isStoreNode(data) && isAnyFormNode(data);
}

export function isFormListNode<E = any>(data: any): data is FormListNode<E> {
    return isStoreListNode(data) && isAnyFormNode(data);
}

export function isFormEntityField(data: any): data is FormEntityField {
    return isEntityField(data) && (data as FormEntityField).isEdit !== undefined;
}
