CAPSULEOS — MACHINE STRICT CONTRACT
0. Référence unique

Le dépôt source de vérité est : https://github.com/N0r3f/CapsuleOS.
Toute production doit respecter le contenu fonctionnel, l’intention pédagogique, la structure et l’esprit du projet décrits dans ce dépôt.
1. Objet

CapsuleOS est une application web pédagogique permettant de tester, comprendre et comparer des environnements de bureau à travers une interface interactive, une sandbox et des mécanismes de gamification.
L’objectif final est de permettre à un utilisateur de découvrir des systèmes d’exploitation de manière simple, autonome, sécurisée et ludique.
2. Obligation de fidélité

Chaque OS simulé doit être reproduit aussi fidèlement que possible à l’identique, dans ses repères visuels, ses comportements perceptibles et son ergonomie générale.
La fidélité visée concerne notamment la structure d’interface, les codes visuels, les motifs d’interaction, les éléments de navigation, les couleurs, les usages dominants et les conventions d’affichage.
Les écarts ne sont autorisés que s’ils sont imposés par les limites du navigateur, par les contraintes de performance ou par l’objectif pédagogique.
3. Couverture des familles d’OS

Le projet doit couvrir l’ensemble des grandes familles suivantes :

    Linux Debian.
    
    Linux Red Hat.
    
    Linux Arch.
    
    Linux Suse.
    
    Linux Slackware.
    
    Windows.
    
    MacOS.
    
    Android.
    
    iOS.
    
    BSD.
    
    UNIX.

L’architecture doit être conçue pour accueillir d’autres variantes dérivées de ces familles sans refonte globale.
4. Objectif d’apprentissage

Le système doit permettre :

    L’exploration libre d’un environnement simulé.
    
    L’apprentissage par essai, erreur et répétition.
    
    La compréhension progressive des usages numériques.
    
    La comparaison visuelle et fonctionnelle entre OS.
    
    La sélection de préférences utilisateur à partir d’expériences concrètes.

L’approche doit rester accessible aux personnes éloignées du numérique, conformément à l’intention pédagogique initiale du projet.
5. Langages autorisés

Les seuls langages autorisés sont :

    HTML5.
    
    CSS3.
    
    JavaScript ES6.

Interdictions absolues :

    Framework front-end.
    
    Bibliothèque UI externe.
    
    Préprocesseur CSS.
    
    Dépendance imposant un chargement réseau obligatoire.
    
    Code serveur pour l’exécution normale du projet.

6. HTML

Le HTML doit être sémantique au maximum.
L’usage de balises neutres doit être réduit au strict minimum.
Les balises rémanentes, notamment div, doivent être évitées lorsqu’une balise sémantique plus précise existe.
Chaque page, bloc fonctionnel et zone d’interface doit être structuré selon son rôle réel dans l’expérience utilisateur.
7. CSS

Les styles doivent être centralisés autant que possible.
Les variables CSS doivent être réutilisées au maximum entre tous les OS afin d’éviter la prolifération inutile de constantes.
La modification des variables à la volée est autorisée, y compris la réaffectation dynamique de leur valeur.
La création de nouvelles variables n’est autorisée que si aucune variable existante ne permet de couvrir le besoin sans perte de lisibilité ou de fidélité.

Les styles doivent conserver l’ordre conventionnel suivant :

    position.
    
    display et templating.
    
    width.
    
    height.
    
    margin.
    
    padding.
    
    border.
    
    font.
    
    color.
    
    background.
    
    transform.
    
    animation.
    
    transition.
    
    overflow.
    
    z-index.

8. JavaScript

Les scripts JavaScript doivent être mutualisés au maximum.
La logique doit être centralisée, réutilisable et factorisée pour éviter la multiplication des fichiers et les effets de bord.
Chaque module doit servir plusieurs contextes lorsque c’est possible.
Le code doit être écrit en ES6, côté navigateur, avec une logique claire, commentée et maintenable.

Interdictions :

    Scripts redondants.
    
    Logique dupliquée.
    
    Couplage fort entre OS.
    
    Fonctionnalités inutilisables hors du navigateur.

9. Architecture du projet

L’arborescence doit être “smart” et “clever”, c’est-à-dire :

    Optimisée pour le chargement navigateur.
    
    Lisible par un humain.
    
    Stable dans le temps.
    
    Adaptée à la réutilisation des ressources.
    
    Compatible avec l’exécution hors ligne.

La structure doit faciliter :

    Le chargement progressif.
    
    La séparation claire entre noyau commun et variantes d’OS.
    
    La mutualisation des assets.
    
    La minimisation des requêtes inutiles.

Les **liens symboliques ne doivent pas être versionnés** dans le dépôt. Pour une skin dérivée qui réutilise les médias d’une autre (ex. Ubuntu / Mint), utiliser des chemins relatifs explicites (`../mint/media/…`) et/ou `CAPSULE_MEDIA_BASE` / `CAPSULE_ASSETS_BASE` (voir `linux-shell-config.js` et `capsule-resource-url.js`).

10. Règles de conception système

Le projet doit appliquer les principes suivants :

    Un noyau commun doit porter les comportements partagés.
    
    Les OS simulés doivent être des variantes spécialisées, pas des réécritures complètes.
    
    Les styles et scripts communs doivent être réutilisés avant toute création nouvelle.
    
    Les différences doivent être injectées par configuration, variables, données ou micro-comportements.
    
    Toute duplication non justifiée est un défaut.

11. Mode offline

L’application doit fonctionner hors ligne.
Les ressources critiques doivent être disponibles localement.
Le projet ne doit pas dépendre d’un service distant pour son fonctionnement essentiel.
Toute stratégie de chargement doit préserver la continuité de l’expérience en mode déconnecté.
12. Priorités absolues

Ordre de priorité :

    Fidélité visuelle et comportementale des OS.
    
    Accessibilité et compréhension.
    
    Réutilisation maximale du code.
    
    Légèreté et performance.
    
    Simplicité de maintenance.
    
    Extensibilité future.

13. Règles de décision pour l’IA

Quand plusieurs solutions sont possibles, l’IA doit choisir celle qui :

    Réutilise le plus les ressources existantes.
    
    Réduit le nombre de fichiers, de variables et de scripts.
    
    Préserve la fidélité du système d’exploitation simulé.
    
    Reste lisible, stable et compatible offline.
    
    Respecte la sémantique HTML et l’ordre CSS imposé.

Si une proposition contredit une règle ci-dessus, elle doit être rejetée.
14. Interdictions globales

Sont interdites :

    L’ajout de dépendances externes lourdes.
    
    La multiplication inutile des fichiers.
    
    Les duplications de logique.
    
    Les structures HTML non sémantiques par confort.
    
    Les styles locaux non factorisés quand une variable commune suffit.
    
    Les scripts spécifiques à un OS lorsqu’un script générique peut couvrir le besoin.

15. Référence de dépôt

Le projet de référence est le dépôt GitHub suivant :
https://github.com/N0r3f/CapsuleOS.

Toute implémentation doit rester alignée sur ce référentiel et sur l’intention pédagogique décrite dans sa présentation.