## MobX
Cette branche reflète le travail de portage de Flux à MobX. Parce que MobX c'est la vie.

# autofocus
C'est à la fois une "recopie" de focus-core intégralement réécrit, remis au propre et réorganisé et un portage de la surcouche Typescript mise en place sur un projet (en plus propre, aussi).

### Ce qu'il y a en plus

* Module `component`, avec 6 classes qui remplacent à fonctionnalité et interface quasiment identique tous les combinaisons pratiquables de mixins de focus-components. La documentation existe mais n'est pas encore ici.
* Module `defaults`, qui sert à renseigner des composants de focus-components nécessaires pour les composants d'autofocus (parce qu'on ne veut pas de dépendance).
* Module `list/component`, avec les composants de listes de focus-components réécrits.
* Module `search/component`, avec les composants de recherche de focus-components réécrits.

N'ayant pas de dépendance à focus-core ou focus-components (et ayant vocation à remplacer au moins le premier), il faudra probablement faire des alias de modules pour que ça marche avec focus-components.

### Roadmap
1. Ajouter et porter la documentation au sein du code et dans le repo.
2. Porter les composants de focus-components avec dépendence au store manquants (ListPage? Layout?).
3. Utiliser sur un vrai projet.

## Pourquoi ?
Parce que le focus-core existant il est pas si mal et qu'on pourrait, via les petites améliorations que je propose ici (et sûrement d'autres), facilement le remettre au "goût du jour" et le rendre plus robuste et clair. En particulier, Typescript est d'une aide inestimable pour assurer un bon niveau d'auto-documentation, de description de code, d'aide à l'utilisation et pour détecter la plupart des erreurs courantes (en particulier dans ses modes les plus stricts). Tout ceci pour un coup vraiment négligeable (voir nul ?).

D'autant plus que, si on veut plus tard refondre certaines parties (genre remplacer Flux par Redux, même si au fond c'est quand même vraiment la même chose), on peut partir de là pour avoir une vision d'ensemble plus claire. D'autant plus que, encore une fois grâce à Typescript, la migration de projets existants (pour peu qu'ils soient écrits en Typescript aussi, pardi) pourraient être très facilitée : idéalement, il suffirait que le projet compile à nouveau pour avoir résolu tous les problèmes... Cela voudrait dire qu'on pourrait toujours concevoir des plans de migration de version majeure en version majeure, au lieu de laisser sur le côté les projets existants avec d'anciennes versions à peine maintenues (je pense notamment ici au form et à la recherche). Après ça reste à voir, et c'est peut être un peu trop idéaliste.

## Changements de rupture (par rapport à focus-core)
* Il manque des bouts, qui ont été volontairement non copiés : pas mal de choses dans `application`, les modules `util`, `site-description` et `router`.
* En particulier, il y a plus de module `entity` et `domain` (outre leurs définitions TS), car il est tout aussi simple (et plus robuste) de gérer des références vers les différents objets, plutôt que de tout mettre dans un state global et d'aller chercher dedans. (ça implique d'avoir des composants qui fonctionnent ainsi: c'est donc incompatible avec les `definitionMixin`/`builtInComponents` de focus-components. Mais ça tombe bien, les composants de `component` sont compatibles !).
* L'`ApplicationStore` prend un `ReactElement` (ie du JSX) à la place d'un objet `{component, props}`. C'est discutable de prendre une régression là-dessus je suis d'accord.
* Le module `network` utilise maintenant le nouveau `fetch` du standard et ne contient plus qu'un léger wrapper autour. En particulier, ce wrapper appelle directement `manageResponseErrors` en cas d'erreur dans la requête, et la méthode est exposée via 4 méthodes `httpGet`, `httpPost`, `httpPut` et `httpDelete` qui ont pour but de largement simplifier l'usage. En contre-partie, c'est moins customisable et les requêtes ne sont plus annulables (ça ne fait pas partie du standard). A discuter également.
* Peut-être le truc le plus gros (mais aussi le plus nécessaire) : les stores n'ont plus de méthodes générées pour accéder à leurs noeuds, mais une méthode statique équivalente qui prend le nom du noeud en premier paramètre. Genre `addNodeChangeListener(cb)` devient `addChangeListener('node', cb)`.

## Dépendances entre modules

#### action-builder
* dispatcher
* network
* store

#### application

#### component
* application
* defaults
* definition
* list
* message
* reference
* store
* translation

#### defaults

#### definition
* translation

#### dispatcher

#### history

#### list
* defaults
* dispatcher
* store
* translation

#### message

#### network
* dispatcher
* message
* translation

#### reference
* store

#### search
* component
* defaults
* dispatcher
* list
* store
* translation

#### store

#### testing
* defaults
* reference

#### translation

#### user

## Une petite note pour finir
Le projet utilise Typescript 2.0, qui n'est pas encore capable de compiler async/await en ES5 (2.1 pourra par contre). Donc en l'état (cible en ES2015) ça ne doit marcher que sur les toutes dernières versions des navigateurs. J'utilise aussi toutes les options les plus strictes (dont la toute nouvelle non-nullité par défaut), ce qui veut dire qu'il y a beaucoup de vérifications qui sont laissées au langage. Ca veut dire qu'il est plus facilement possible de se tirer dans le pied si on se borgne à vouloir coder les yeux fermés avec deux mains dans le dos. Ca veut aussi dire que dans les bonnes conditions, c'est quasiment impossible.

Et c'est évidemment pas du tout testé. #YOLO.
