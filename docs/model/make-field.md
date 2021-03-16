# Création et modification de champs

Jusqu'ici, les champs que l'on manipule font partis d'un `StoreNode`, et ces champs ont été initialisés et figés par la définition initiale des entités générées depuis le modèle. Or, bien souvent, on peut avoir besoin de modifier une métadonnée en particulier, ou bien d'avoir à remplacer un composant dans un écran précis pour un champ donné. Et même, on peut vouloir créer un champ à la volée sans avoir besoin de créer un `StoreNode` tout entier.

## Champs simples

Pour répondre à ces problématiques, Focus propose deux fonctions utilitaires :

### `fromField(field, options)`

Cette fonction permet de dupliquer un champ en remplaçant certaines métadonnées par celles précisées dans `options`. Cette fonction ne sert qu'à de l'affichage (et en passant, on n'a bien parlé que de ça depuis le début).

### `makeField(value, options?)`

Cette fonction permet de créer un champ en lecture seule à partir d'une valeur. L'objet optionnel `options` peut contenir un domaine, un formateur, un libellé, ainsi que les définitions de composants d'affichage.

Cet usage de `makeField` est pratique pour afficher des valeurs fixes via `stringFor` et consorts.

## Gestion de l'édition.

Le sujet de l'édition n'a pas réellement été abordé jusque ici pour une raison simple : **les champs ne gèrent pas l'édition nativement**.

Du moins, une propriété `isEdit` peut être ajoutée aux champs, qui pourra être lue par des composants de champs, mais elle est presque toujours gérée par un noeud de formulaire. **En l'absence de cette propriété, il n'est pas possible d'afficher un champ en édition**.

Il existe deux possibilités (_en dehors d'un formulaire, voir chapitre suivant_) pour gérer un champ en édition :

### `makeField(name, builder)`

Cette deuxième signature de `makeField` permet de créer un champ éditable. Le premier paramètre est le nom du champ, tandis que le deuxième permet de décrire ce champ via un `EntityFieldBuilder`, présenté juste en dessous. Un champ créé par `makeField` sera en édition par défaut, sauf indication contraire.

### `cloneField(field, isEdit?)`

Cette méthode est un raccourci pour le `makeField` du dessus pour créer un champ (à priori en édition) à partir d'un champ existant, en réutilisant son getter, son setter et ses métadonnées et son domaine.

## `EntityFieldBuilder`

Il permet de modifier un EntityField existant ou bien d'en créer un nouveau. Il sera le paramètre de `add` et `patch` sur le `FormNodeBuilder` (voir chapitre suivant), ainsi que celui de `makeField` pour un champ éditable.

Il dispose des méthodes suivantes :

### `edit(value)`

`value` peut prendre comme valeur `true` ou `false`, selon l'état souhaité.

_Remarque : `value` pourra également être une fonction retournant un booléen dans un formulaire, pour paramétriser l'état d'édition du champ._

### `value(get, set?)`

La fonction `value` permet de remplacer la valeur d'un champ par une valeur calculée, avec un setter éventuel. Elle prend comme paramètres :

-   `get`, pour spécifier le nouveau getter du champ
-   `set`, pour spécifier le nouveau setter du champ

### `domain(domain)`

Cette fonction permet de remplacer le domaine d'un champ. A l'inverse des autres méthodes, le domaine est forcément fixe. Il permet surtout de fixer le type du champ, le reste des propriétés du domaine pouvant être modifiées par la suite (et rendues dynamiques) par la fonction `metadata`.

### `metadata($metadata)`

La fonction `metadata` permet de remplacer les métadonnées d'un champ (ou bien de les définir pour un champ ajouté). Elle prend un seul paramètre, `$metadata`, qui contient soit toutes les métadonnées à remplacer (champ et contenu du domaine), soit une fonction qui les renvoie qui sera utilisée pour initialiser un champ "computed".
