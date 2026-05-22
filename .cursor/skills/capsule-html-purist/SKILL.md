---
name: capsule-html-purist
description: >-
  Rédige et révise du HTML5 sémantique pour CapsuleOS (bureaux Linux simulés,
  shell, apps partagées). Utiliser lors de la création ou modification de
  index.html, gabarits d'apps, structure de bureau, raccourcis bureau, barre
  des tâches, ou quand l'utilisateur demande du HTML sémantique / DOM léger.
disable-model-invocation: false
---

# Capsule HTML Purist

Expert HTML5 sémantique pour CapsuleOS (simulateur d'OS, exécution 100 % navigateur, point d'entrée statique).

## Priorité

En cas de conflit : `.cursor/rules/STRICT_CONTRACT.md` et `CONTRACT_CHECKLIST.md` à la racine du dépôt l'emportent sur ce skill.

## Contexte

- Architecture 0 backend : pas de rendu serveur.
- Ressources locales : chemins relatifs vers le dépôt (`./media/…`, `../../../shared/…`).
- Pas de framework, pas d'attribut `style`, pas de classes utilitaires type framework.

## Directives

### Sémantique

- Privilégier `header`, `footer`, `nav`, `main`, `section`, `article`, `aside`, `button`, `a`, `ul`/`li`, `figure`, `object` (desktop CapsuleOS) selon le rôle réel.
- `div` uniquement si aucune balise sémantique ne couvre le besoin sans contorsion.
- Actions : vrais `<a href>` ou `<button type="button">`, pas de `div` cliquable.

### CapsuleOS (Linux)

- Fenêtres / apps : slots `.windowElement` avec `data-link` aligné sur les apps (`nemo`, `mainMenu`, `firefox`, …).
- Raccourcis et barre : `<a target="windowElement" data-link="…">` avec `title` et `alt` sur les icônes.
- Zones nommées : `aria-label` sur `nav` / barres de notification quand le libellé visuel ne suffit pas.
- Boutons tray : `type="button"`, `aria-expanded`, `aria-controls` si popover associé.

### Scripts (ordre dans `index.html`)

Définir `window.CAPSULE_*` **avant** les scripts noyau. Voir [reference.md](reference.md) pour la liste minimale et l'ordre de chargement.

### Minimalisme

- DOM le plus léger possible (machines modestes).
- Pas de wrappers inutiles ; pas de markup « au cas où ».

### Accessibilité (contrat §12)

- Priorité : compréhension et usage souris/tactile (public éloigné du numérique).
- Pas de parcours clavier type OS de bureau ; états visuels via souris (`:hover`, classes d'état JS).
- Textes visibles ou `title` / `aria-label` sur les contrôles iconiques.

### Préparation CSS

- HTML « nu » : structure prête pour variables CSS et noyau JS.
- Aucun style inline (y compris sur les slots fenêtres : l'affichage initial est géré par CSS/JS noyau).

## Anti-patterns

- `div` + `onclick` pour une action.
- Liens `http://` externes obligatoires pour l'usage principal.
- Dupliquer un gabarit app dans chaque distro si `OS/linux/shared/apps/` suffit.

## Ressources

- Variables et chargement Linux : [reference.md](reference.md)
- Contrat HTML : `.cursor/rules/STRICT_CONTRACT.md` §6
