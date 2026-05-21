---
name: capsule-css-engineer
description: >-
  Écrit et refactorise du CSS3 natif pour CapsuleOS en respectant l'ordre des
  propriétés, les variables centralisées et l'offline. Utiliser pour
  style.css, imports.css, *.skin.css, variables, barre des tâches, fenêtres,
  apps partagées, ou quand l'utilisateur mentionne styles CapsuleOS / variables
  CSS / calc().
disable-model-invocation: false
---

# Capsule CSS Engineer

Ingénieur CSS3 pour CapsuleOS (rendu 100 % navigateur, compatible `file://`).

## Priorité

En cas de conflit : `.cursor/rules/STRICT_CONTRACT.md` et `CONTRACT_CHECKLIST.md` l'emportent.

## Ordre obligatoire des propriétés

Pour **chaque** sélecteur, respecter cet ordre :

1. `position`
2. `display` + templating (flex, grid, `gap`, `align-*`, `justify-*`, …)
3. `width`
4. `height`
5. `margin`
6. `padding`
7. `border`
8. `font`
9. `color`
10. `background`
11. `transform`
12. `animation`
13. `transition`
14. `overflow`
15. `z-index`

Shorthands (`margin`, `font`, `background`) comptent dans leur groupe.

## Variables

- Racine site : `style/variables.css`
- Linux : `OS/linux/kernel/style/variables-linux.css`
- **Réutiliser** avant d'ajouter une variable ; réaffectation dynamique autorisée.
- Nouvelle variable **uniquement** si aucune existante ne couvre le besoin sans perdre fidélité ou lisibilité.
- Dimensions : privilégier `calc(var(--head) / 4)` plutôt que des px « magiques ».

## Centralisation

- Pas de duplication : factoriser dans `kernel/style/` ou `shared/apps/style/*.base.css`.
- Skins : surcharges dans `families/.../style/apps/*.skin.css` et `style/imports.css`.
- CSS standard uniquement : **pas** de nesting, pas de préprocesseur.

## Interdictions

- Librairies externes, `@import` réseau, polices CDN obligatoires.
- Styles inline dans le HTML (rôle du HTML purist).
- Copier-coller d'un bloc déjà présent ailleurs : étendre ou partager.

## Interaction visuelle

- États souris/tactile : `:hover`, classes `.active` / états posés par le JS.
- Pas de parcours `:focus-visible` complexe type application bureau réelle ; focus minimal acceptable pour champs natifs.

## Fidélité

Pour reproduction depuis capture : utiliser le skill `capsule-visual-replicator` (workflow) ; ce skill impose l'ordre CSS et les variables.

## Ressources

- Arborescence styles Linux : [reference.md](reference.md)
- Contrat CSS : `.cursor/rules/STRICT_CONTRACT.md` §7
