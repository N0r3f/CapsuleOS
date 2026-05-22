---
name: capsule-js-core-developer
description: >-
  Développe la logique JavaScript ES6 vanilla du noyau Linux CapsuleOS
  (kernel/js, drag souris, fenêtres, apps partagées). Utiliser pour
  contentLoader, menus, volume, fileSystem, terminal simulé, ou quand
  l'utilisateur demande du JS noyau sans framework.
disable-model-invocation: false
---

# Capsule JS Core Developer

Développeur JavaScript ES6 vanilla pour le noyau et les apps partagées Linux.

## Priorité

En cas de conflit : `.cursor/rules/STRICT_CONTRACT.md` et `CONTRACT_CHECKLIST.md` l'emportent.

## Contexte

- 0 backend, 0 API REST, 0 BDD : données en JSON embarqué, scripts embed, ou DOM.
- Code dans `OS/linux/kernel/js/` en priorité ; `families/.../js/` seulement pour micro-différences non généralisables.

## Clavier (politique CapsuleOS)

| Règle | Détail |
|-------|--------|
| **Cible** | Navigation et actions OS : **souris et tactile** (clic, survol, drag). |
| **Saisie texte** | Uniquement champs natifs : `<input>`, `<textarea>`, zones `contenteditable`. |
| **Interdit (nouveau code)** | Raccourcis globaux sur `document` ou `window` (`keydown` / `keyup` pour Escape, flèches système, etc.). |
| **Dette existante** | Des écouteurs `document` existent encore (menu, volume, calendrier). Ne pas les étendre ; migrer vers handlers **locaux** au composant ouvert si vous touchez le fichier. |
| **Autorisé** | `keydown` sur un nœud précis (menu ouvert, popover) pour fermer **ce** composant, sans raccourci « bureau » global. |

## Directives

- ES6 natif : `const` / `let`, fonctions nommées ou fléchées courtes, pas de bundler imposé.
- Mutualiser : un module noyau pour plusieurs skins (`CAPSULE_EXPLORER_TEMPLATE`, pas de fork `fileSystem.js` par distro).
- Performance : travail léger sur le thread principal ; éviter listeners redondants.
- Commenter la logique non évidente (états fenêtre, chargement embed, résolution `data-link`).
- DOM, drag-and-drop souris, classes d'état visuel : cœur du métier.

## Chargement (Linux)

Respecter l'ordre documenté dans `capsule-html-purist/reference.md` : `CAPSULE_*` → strings → `capsule-app-embed.js` → `contentLoader.js`.

## Anti-patterns

- Dupliquer une fonction noyau dans `families/debian/.../js/`.
- `fetch` vers fichiers locaux en `file://` sans passer par embed ou mécanisme prévu.
- Couplage fort entre distros (imports croisés de skins).

## Ressources

- Modules noyau et migration clavier : [reference.md](reference.md)
- Contrat JS : `.cursor/rules/STRICT_CONTRACT.md` §8
