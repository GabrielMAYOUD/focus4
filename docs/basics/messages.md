# Gestion des messages

Les messages dans une application Focus sont gérés par le **`messageStore`**. Tout message envoyé dans ce store sera transféré au **`MessageCenter`** (posé par le `Layout` du module `@focus4/layout`, qui les affichera dans une "Snackbar", en bas de l'application.

Les messages peuvent être des messages de succès (affichés en vert), d'erreur (affichés en rouge), ou des warnings (affichés en jaune). Les couleurs sont personnalisables via le module `@focus4/styling`.

Par défaut, tous les formulaires (du module `@focus4/stores`) envoient des messages de succès lorsqu'une sauvegarde est réalisée avec succès, et toute requête en erreur (voir paragraphe suivant) envoie des messages d'erreurs contenant leurs détails.

Plusieurs messages peuvent être envoyés en même temps ou à suivre, ils seront dépilés un par un par le `MessageCenter`.
