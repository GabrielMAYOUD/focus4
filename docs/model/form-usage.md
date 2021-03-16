# Utilisation dans un composant

Une fois qu'on a présenté tous les différents composants nécessaires à la création d'un formulaire, voyons comment cela s'utilise en pratique.

## Composants

Deux composants React sont en général incontournable dans la réalisation d'un composant qui affiche un formulaire :

### `<Form>`

`Form` est un composant qui sert à poser le formulaire dans un composant React. Il utilise l'objet d'actions dans son cycle de vie (en particulier, il appelle `load` pendant son `componentWillMount`) et peut poser un formulaire HTML dont l'action est le `save`.

La propriété `formProps` de `FormActions` contient toutes les props nécessaires au `Form`, donc en pratique son utilisation est très simple :

```tsx
render() {
    return (
        <Form {...this.actions.formProps}>
            {/* blablabla */}
        </Form>
    );
}
```

On peut y passer également la prop `noForm` pour désactiver le form HTML, et contrôler les `labelRatio` de tous champs qu'il contient.

### `<Panel>`

C'est un composant qui permet de poser un panel avec un titre et des boutons d'actions. Il n'est pas spécialement lié aux formulaires (il se trouve dans le module `components`), mais en pratique il est quasiment toujours utilisé avec.

Comme pour `<Form>`, `FormActions` expose `actions.panelProps`, qui contient les méthodes et les états nécessaires à son fonctionnements.

## Création de formulaire

### `makeFormNode`

`makeFormNode` est la fonction a utiliser pour créer un noeud de formulaire dans un **composant classe**. Ses paramètres sont :

-   `componentClass` : passer `this` (permet de disposer de la réaction de synchronisation lorsque le composant sera démonté).
-   `node`, le noeud à partir duquel on construit le formulaire. Il n'y a aucune restriction sur la nature de ce noeud (simple, liste, composé...). Il n'est juste pas possible de créer un `FormNode` à partir d'un autre `FormNode`.
-   `builder` : il s'agit d'une fonction qui sera appellée avec le `Form(List)Builder`, pour pouvoir paramétrer le noeud de formulaire.
-   `initialData` : Pour renseigner une valeur initiale au formulaire (par défaut, il sera vide).

### `useFormNode`

`useFormNode` est la fonction a utiliser pour créer un noeud de formulaire dans un **composant fonction**. Ses paramètres sont les mêmes que `makeFormNode`, sauf qu'il n'y a pas besoin de lui passer `this`.

### `makeFormActions`

`makeFormActions` est la fonction a utiliser pour créer des actions de formulaire dans un **composant classe**. Ses paramètres sont :

-   `componentClass` : passer `this` (permet de disposer de la réaction de chargement lorsque le composant sera démonté).
-   `formNode`, le `Form(List)Node` sur lequel les actions vont interagir.
-   `builder` : il s'agit d'une fonction qui sera appellée avec le `FormActions`, pour pouvoir paramétrer les actions

### `useFormActions`

`useFormActions` est la fonction a utiliser pour créer les actions d'un formulaire dans un **composant fonction**. Ses paramètres sont les mêmes que `makeFormActions`, sauf qu'il n'y a pas besoin de lui passer `this`.

## Exemple complet

```tsx
import {fieldFor, Form, Panel, selectFor, useFormActions, useFormNode} from "@focus4/forms";
import i18next from "i18next";
import {useObserver} from "mobx-react";

import {router} from "../../../router";
import {loadStructure, saveStructure} from "../../../services/main";
import {mainStore, referenceStore} from "../../../stores";

export function BasicForm() {
    const entity = useFormNode(mainStore.structure);
    const actions = useFormActions(entity, a =>
        a
            .params(() => router.state.home.id)
            .load(loadStructure)
            .save(saveStructure)
    );

    const {denominationSociale, capitalSocial, statutJuridiqueCode, adresse} = entity;
    return useObserver(() => (
        <Form {...actions.formProps} labelRatio={40}>
            <Panel title="form.title" {...actions.panelProps}>
                {i18next.t("form.content")}
                {fieldFor(denominationSociale)}
                {fieldFor(capitalSocial)}
                {selectFor(statutJuridiqueCode, referenceStore.statutJuridique)}
                {fieldFor(adresse.codePostal)}
                {fieldFor(adresse.ville)}
            </Panel>
        </Form>
    ));
}
```
