# Checklist alignement STRICT_CONTRACT.md

À utiliser avant merge ou release (revue manuelle ou automatisée partielle).

## Stack

- [ ] HTML5, CSS3, JavaScript ES6 uniquement pour l’implémentation utilisateur.
- [ ] Aucun framework front, aucune lib UI externe, aucun préprocesseur CSS.
- [ ] Aucun code serveur requis pour l’exécution normale du site.
- [ ] Aucune dépendance imposant un chargement réseau obligatoire pour l’usage principal.

## HTML / CSS

- [ ] HTML sémantique ; `div` évité lorsqu’une balise plus précise existe.
- [ ] Ordre des propriétés CSS conforme au contrat (position → … → z-index).
- [ ] Styles centralisés ; variables CSS réutilisées avant d’en ajouter de nouvelles.

## JavaScript

- [ ] Logique mutualisée ; pas de duplication inutile ; pas de couplage fort entre OS simulés.

## Offline

- [ ] Le site reste utilisable hors ligne après chargement initial (Service Worker + cache ; tester en coupant le réseau sur localhost).
- [ ] Ouverture locale `file://` : `capsule-app-embed.js` / `capsule-android-embed.js` à jour si les gabarits ou JSON embarqués ont changé ; vérifier un bureau Linux et Android sans serveur.

## Structure

- [ ] Arborescence lisible ; séparation noyau commun / variantes OS respectée.
- [ ] Aucun lien symbolique versionné dans le dépôt ; skins dérivées sans `media/` local déclarent `CAPSULE_MEDIA_BASE` (et `CAPSULE_ASSETS_BASE` si besoin) avant `capsule-resource-url.js`.

## Linux (CapsuleOS / `OS/linux`)

- [ ] `CAPSULE_APPS_BASE`, `CAPSULE_CONTENT_ROOT`, `CAPSULE_SKIN_BASE`, `CAPSULE_EMBED_SKIN_KEY` définis avant les scripts noyau ; `capsule-app-embed.js` chargé avant `contentLoader.js` ; `strings-default.js` et `capsule-strings.js` chargés avant `contentLoader.js`.
- [ ] Slot explorateur `data-link="nemo"` : template résolu via `CAPSULE_EXPLORER_TEMPLATE` (`nemo`, `dolphin`, `nautilus`, …) sans dupliquer la logique dans `fileSystem.js`.
- [ ] Textes surchargeables : défauts dans `kernel/js/strings-default.js`, option `./content/strings.json` par skin.
- [ ] Hub statique `OS/linux/index.html` à jour pour les distros listées ; pas de backend requis.
