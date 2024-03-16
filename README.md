# CapsuleOS
Un site permettant de tester des envirronements de bureau, les appréhender en jouant et choisir ses préférences.

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

### Les scripts ▼

Afin de permettre une exécution pondérée des scripts, de soulager les threads et de permettre une prise en main facile, chaque script est commenté de manière claire.
Chaque script est écrit from scratch en ecmascript 6 et s’exécute côté navigateur.
Ils sont tous réutilisables dans chaque environnement.
Ceci évite d'atteindre un nombre critique de scripts et permet d'alléger la charge sur le navigateur et le système hôte.  

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

​		📁 capsule ▼

​			📄 index.html

​			📁 assets ▼

​				☰ menu_logo

​			📁 media ▼

​				📁 img ▼

​					📁 dock ▼

​					📁 menu ▼

​			📁 pages ▼

​				📄 menu.html

​			📁 style ▼

​				📄 animations.css

​				📄 footer.css

​				📄 header.css

​				📄 imports.css

​				📄 menu.css

​				📄 style.css

​				📄 windows.css				

📁 pages ▼

📁 style ▼

​	📄 imports.css

​	📄 reset.css

​	📄 variables.css



