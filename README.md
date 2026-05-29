# CapsuleOS
Un site permettant de tester des environnements de bureau, les appréhender en jouant et choisir ses préférences.

[TOC]

## État des lieux et objectifs ▼

L'idée émerge d'une étude à propos des ressources numériques à portée pédagogiques offrant aux personnes éloignées du numérique la possibilité de s'accaparer les TICs, notamment dans l'objectif d'effectuer les démarches en ligne, autrement appelées "démarches dématérialisées".

Celle-ci nous amène à la conclusion que les ressources sont nombreuses, éparses, douteuses mais nullement adaptées à la situation de crise que nous vivons. 

Malgré la mise en place de conseillers numériques et de maison France service sur tout le territoire français, l’illectronisme reste grandissant et les acteurs du numérique que sont ces conseillers n'ont pas révolutionné la pédagogie en matière d'usage numérique.

L'objectif de ce projet est d'utiliser leurs témoignages et ceux de leurs usagers afin de fournir une nouvelle approche, par le biais d'une "sandbox" et de la "gamification".

Ce projet ne peut prétendre devenir la panacée en matière de pédagogie numérique mais il fera l'objet de nombreux tests sur le terrain car il restera gratuit, léger et accessible à tous.

Nous espérons de nombreux retour et de l'enthousiasme.

## Fiche technique et spécificités ▼

Le présent site web est constitué de manière à optimiser les ressources au mieux ▼

- éviter les surcharges de transfert client/serveur
- charger les styles par le biais de variables afin de privilégier le calcul à la déclaration stricte
- permettre une exécution orientée navigateur
- offrir une exécution hors ligne 

### Les langages ▼

Seuls trois langages sont utilisés dans ce projet afin de le rendre accessible, efficient et utilisable hors ligne.

- le HTML (version 5) (sémantique)
- le CSS (Version 3) (sans nesting)
- le JavaScript (ecmascript 6)

### Les styles ▼

Tous les styles ne sont déclarés qu'une fois sous forme de variable dans le fichier 📁 style ➤ 📄 variables.css
Ils sont ensuite utilisés tels quels ou calculés dans chaque feuille de style exemple :

Prenons la variable suivante :

```css
--head: 40px;
```

Elle sera utilisée dans un `<header>` afin de définir les marges de cette manière :

```css
margin: calc(var(--head) / 4) calc(var(--head) / 4) calc(var(--head) / 10) calc(var(--head) / 4);
```

Dans cette exemple, le navigateur interprétera ce code tel quel :

```css
margin-top: 10px;
margin-right: 10px;
margin-bottom: 4px;
margin-left: 10px;
```

### La convention des styles ▼ 

Les déclarations CSS suivent un schéma conventionnel.

- position (si absolute, le positionnement est précisé à la suite)
- display + templating (ex : si flexbox, le flow, l'alignement et la justification sont précisé à la suite)
- width
- height
- margin
- padding
- border
- font
- color
- background
- transform
- animation
- transition
- overflow
- z-index

### Les scripts ▼

Afin de permettre une exécution pondérée des scripts, de soulager les threads et de permettre une prise en main facile, chaque script est commenté de manière claire.
Chaque script est écrit from scratch en ecmascript 6 et s’exécute côté navigateur.
Ils sont tous réutilisables dans chaque environnement.
Ceci évite d'atteindre un nombre critique de scripts et permet d'alléger la charge sur le navigateur et le système hôte.  

### Ouverture en `file://` et gabarits embarqués ▼

Les navigateurs bloquent ou restreignent `fetch()` sur des fichiers locaux. Pour que les bureaux Linux et Android fonctionnent **sans serveur HTTP** (double-clic sur `index.html`), le dépôt inclut des scripts générés : `OS/linux/kernel/js/capsule-app-embed.js` et `OS/android/js/capsule-android-embed.js`.

Après modification des gabarits sous `OS/linux/shared/apps/` ou des skins `style/apps/*.skin.css` (Mint, Ubuntu, Fedora), régénérer le fichier Linux :

```bash
node js/build-capsule-embed.mjs
```

Après modification des apps sous `OS/android/apps/` ou de `OS/android/ressources/messages.json` :

```bash
node js/build-android-embed.mjs
```

Chaque `index.html` de skin Linux définit `window.CAPSULE_EMBED_SKIN_KEY` (`mint`, `ubuntu` ou `fedora`) avant le script embed, afin d’appliquer les bonnes feuilles `.skin.css` embarquées.

Sous `http://` ou `https://`, le noyau continue de charger les gabarits avec `fetch` pour refléter les fichiers à jour sans régénérer l’embed. Pour forcer l’usage des données embarquées même en HTTP (tests), définir `window.CAPSULE_FORCE_APP_EMBED = true` avant les scripts embed.

## Définition de l'arborescence ▼

📄 index.html

📁 assets ▼

​	☰ favicon

📁 js ▼

​	📄 background.js

​	📄 date.js

​	📄 dock.js

​	📄 index.js

​	📄 main.js

​	📄 menu.js

​	📄 windows.js

📁 OS ▼

​	📁 linux ▼

​		📁 kernel ▼ (noyau Linux : styles + logique JS)

​			📄 README.md

​			📁 style ▼

​				📄 variables-linux.css

​			📁 js ▼ (scripts du bureau simulé : fenêtres, Nemo, apps, `capsule-app-embed.js` généré, etc.)

​		📁 shared ▼ (apps HTML/CSS `.base.css` + contenu pédagogique commun)

​			📄 README.md

​			📁 apps ▼

​			📁 content ▼ (ex. Dossier_personnel, manifest Nemo)

​		📁 families ▼

​			📁 debian ▼

​				📁 mint ▼

​					📄 index.html

​					📁 media, style, assets (thème Mint)

​				📁 ubuntu ▼

​					📄 index.html (même noyau + shared ; médias réutilisés depuis mint en attendant des assets Ubuntu)

​			📁 redhat ▼

​				📁 fedora ▼

​					📄 index.html (shell GNOME Workstation, Fichiers / Nemo, assets sous media/)

📄 sw.js (entrée SW, scope racine) → `js/sw.js` (implémentation)

📁 pages ▼

📁 style ▼

​	📄 imports.css

​	📄 reset.css

​	📄 variables.css



