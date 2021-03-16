# Stores de formulaires

L'affichage de champs est certes une problématique intéressante à résoudre, mais le coeur d'une application de gestion reste tout de même constitué d'écrans de saisie, ou **formulaires**.

Pour réaliser un formulaire, les entités et champs dont on dispose vont devoir être complétés d'un état d'**édition** ainsi qu'un état (dérivé) de **validation**. C'est le rôle du `FormNode`, présenté ci-après.

## Le noeud de formulaire : `Form(List)Node`

Un formulaire sera toujours construit à partir d'un `Store(List)Node`, qui sera ici quasiment toujours une entité ou une liste d'entité. Définir un formulaire à ce niveau là fait sens puisque on se base sur des objets d'échange avec le serveur (qui est en passant toujours responsable de la validation et de la sauvegarde des données), et on ne fait pas vraiment de formulaires basés sur un champ unique.

Un `Form(List)Node`, construit via les classes `FormNodeBuilder` ou `FormListNodeBuilder`, est une copie conforme du noeud à partir duquel il a été créé, qui sera "abonné" aux modifications de ce noeud. Il représentera **l'état interne du formulaire**, qui sera modifié lors de la saisie de l'utilisateur, **sans impacter l'état du noeud initial**.

En pratique, un `Form(List)Node` sera créé via [**`makeFormNode`**](../forms#makeFormNode)

## Contenu

Tous les objets contenus dans un `FormNode` (et y compris le `FormNode` lui-même) sont complétés de propriétés supplémentaires représentant les états d'édition et de validation de l'objet. Ils prennent la forme :

-   Sur un `Form(List)Node`
    -   `form`, un objet muni des trois propriétés `isEdit`, `isValid` et `errors`.
    -   `sourceNode`, une référence vers le noeud source équivalent du `FormNode`
    -   `reset()`, une méthode pour réinitialiser le `FormNode` sur son `sourceNode`.
-   Des trois propriétés additionnelles `isEdit`, `isValid` et `error` sur un `EntityField`.

Les propriétés `error(s)` et `isValid` sont en lecture seule et sont calculées automatiquement. `error` est le message d'erreur de validation sur un champ et vaut `undefined` si il n'y a pas d'erreur. `errors` est l'objet qui contient l'ensemble des erreurs des champs contenu dans un noeud. `isValid` sur un noeud est le résultat de validation de tous les champs qu'il contient, valant donc `true` seulement si toutes les propriétés `isValid` des champs valent `true`. A noter cependant que si le noeud/champ n'est pas en édition, alors `isValid` vaut forcément `true` (en effet, il n'y a pas besoin de la validation si on n'est pas en cours de saisie).

Les propriétés `isEdit` sont modifiables, mais chaque `isEdit` est l'intersection de l'état d'édition du noeud/champ et de celui de son parent, ce qui veut dire qu'un champ de formulaire ne peut être en édition (et donc modifiable) que si le formulaire est en édition _et_ que son éventuel noeud parent est en édition _et_ que lui-même est en édition. En pratique, le seul état d'édition que l'on manipule directement est celui du `FormNode`, dont l'état initial peut être passé à la création (par défaut, ce sera `false`). Tous les sous-états d'édition sont initialisés à `true`, pour laisser l'état global piloter toute l'édition.

Les composants de champ utiliseront ces deux propriétés pour gérer le mode édition et afficher les erreurs de validation, comme attendu.
