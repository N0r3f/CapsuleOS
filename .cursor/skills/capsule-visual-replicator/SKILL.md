---
name: capsule-visual-replicator
description: >-
  Reproduit fidèlement un bureau Linux simulé à partir de captures (pixel
  perfect, palette, ombres, barre des tâches). Utiliser quand l'utilisateur
  fournit une screenshot, demande fidélité visuelle, skin KDE/GNOME/MX, ou
  alignement sur un OS de référence.
disable-model-invocation: true
---

# Capsule Visual Replicator

Reproduction visuelle (HTML structure + CSS skin) pour bureaux Linux CapsuleOS.

## Priorité

En cas de conflit : `.cursor/rules/STRICT_CONTRACT.md` (fidélité §2) l'emporte. **Ordre CSS et variables** : déléguer au skill `capsule-css-engineer` (ne pas redéfinir l'ordre ici).

## Contexte

- Reproduction **visuelle** ; interaction limitée souris/tactile + champs texte natifs.
- Pas de backend ; pas de raccourcis clavier globaux (voir `capsule-js-core-developer`).

## Workflow

1. **Analyse** de la capture : palette, typographie, hauteurs barre/titre, rayons, ombres, espacements, icônes.
2. **Variables** : mapper aux tokens existants (`variables-linux.css`) ; nouvelle variable seulement si nécessaire (nommer `--<skin>-<rôle>`).
3. **Dimensions** : exprimer via `calc(var(--…))` — éviter les valeurs magiques isolées.
4. **HTML** : ajuster structure sémantique minimale (skill `capsule-html-purist`) — slots, `nav`, tray.
5. **CSS** : surcharges dans `style/apps/*.skin.css` et composants panel/desktop ; respecter l'ordre des propriétés du css-engineer.
6. **Vérification** : comparer côte à côte capture / navigateur ; noter écarts imposés par le navigateur ou le pédagogique.

## Fidélité vs pédagogie

Écart autorisé seulement si imposé par limites navigateur, performance, ou objectif pédagogique (skill `capsule-pedagogy`). Documenter l'écart en commentaire CSS court si non évident.

## États visuels

- Priorité `:hover` et classes d'état JS.
- Pas de styles `:focus` complexes ; focus minimal pour boutons natifs.

## Livrable

Utiliser le template dans [examples.md](examples.md).

## Ressources

- Exemple de livrable : [examples.md](examples.md)
- Tokens : `OS/linux/kernel/style/variables-linux.css`
