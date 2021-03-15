# Surcharge du CSS Focus

## Présentation

L'utilisation de modules CSS, si configuré correctement dans Webpack avec un nom obfusqué (ou au moins partiellement), empêche de surcharger directement le CSS des composants Focus en ajoutant une simple feuille de style.

Focus propose donc un système, inspiré par celui de `react-toolbox`, qui permet de surcharger le CSS explicitement à plusieurs niveaux.

## `useTheme` (/ `themr`)

Tous les composants Focus qui utilisent du CSS utilisent le hook **`useTheme`** (ou la fonction `themr` qui permet de créer un équivalent dans un composant classe), dont l'objectif et de pouvoir **fusionner plusieurs sources de CSS**.

Son API est la suivante : **`useTheme(contextKey: string, ...css: (T | CSSToStrings<T> | Partial<ToBem<T>> | undefined)[])`**

`contextKey` fait référence à un nom de propriété qui se retrouve dans l'objet de contexte React `ThemeContext`. Ce contexte peut être posé manuellement, mais il est en général posé par le composant de `Layout` et alimenté la propriété `appTheme`. Il est possible de passer pour chaque `contextKey` soit un objet "simple", doit un objet construit par `toBem`. **Le CSS qui sera posé dans le contexte sera appliqué à tous les composants Focus**.

Exemple :

```tsx
import {Layout} from "@focus4/layout";
import display from "./display.css";

ReactDOM.render(<Layout appTheme={{display}}>{/* Votre appli */}</Layout>);
```

`css` est la liste de tous les styles qui doivent être fusionnés pour créer le style final du composant. Comme son type le laisse sous-entendre, il est possible de passer du CSS sur n'importe quel format.

En général, il est utilisé par les composants Focus de la façon suivante :

```tsx
import {CSSProp, useTheme} from "@focus4/styling";
import displayCss, {DisplayCss} from "./__style__/display.css";

function Display(props: {theme?: CSSProp<DisplayCss>; value: any}) {
    const theme = useTheme("display", displayCss, props.theme);
    return <div className={theme.display()}>{props.value}</div>;
}
```

## 3 sources de CSS

Via l'usage de `useTheme` dans Focus, il y a donc au total **3 sources potentielles de CSS** :

-   En premier lieu, **le CSS par défaut de Focus est toujours appliqué** (vous pouvez toujours ne pas importer la feuille de style Focus si vous n'en voulez pas, mais c'est très déconseillé).
-   Ensuite, vous pouvez surcharger le CSS **pour tous les composants** via la propriété `appTheme` du `Layout`.
-   Enfin, vous pouvez surcharger localement le CSS **d'un seul composant** via la propriété `theme` du composant en question. Tous les composants ont une cette propriété. La structure du CSS varie selon les composants : en général, les composants Focus sont construits correctement, mais les composants réexportés de `react-toolbox` n'utilisent pas la gestion des modifiers et n'ont donc que des classes "Element" (alors que certaines sont vraiment des modifiers).

Vous n'avez pas besoin d'utiliser vous aussi des modules CSS pour surcharger Focus. Tant que vous utilisez les propriétés `appTheme`/`theme`, même avec des chaînes de caractères en dur, cela fonctionnera comme attendu. Et si vous utilisez les modules CSS de Focus, vous n'avez pas non plus besoin d'utiliser systématiquement `toBem` pour vous servir de votre CSS ni pour le passer à Focus, et il y a encore moins besoin d'utiliser `useTheme` dans votre code.
