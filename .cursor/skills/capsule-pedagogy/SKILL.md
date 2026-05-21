---
name: capsule-pedagogy
description: >-
  Guide les choix pédagogiques CapsuleOS : exploration libre, accessibilité,
  gamification, fidélité vs simplification. Utiliser pour parcours débutant,
  checklist missions, sandbox, comparaison OS, ou arbitrage fidélité/UX.
disable-model-invocation: true
---

# Capsule Pedagogy

Garde-fou pédagogique pour CapsuleOS (simulateur d'OS à vocation formation / découverte).

## Priorité

`.cursor/rules/STRICT_CONTRACT.md` §2 (fidélité), §4 (apprentissage), §12 (priorités) l'emportent.

## Objectifs utilisateur

Le système doit permettre :

- Exploration libre d'un bureau simulé
- Apprentissage par essai, erreur, répétition
- Compréhension progressive des usages numériques
- Comparaison visuelle et fonctionnelle entre environnements
- Expression de préférences à partir d'expériences concrètes

Public cible : personnes **éloignées du numérique** — interfaces lisibles, peu de jargon, retours visuels clairs.

## Arbitrage fidélité ↔ pédagogie

| Situation | Choisir |
|-----------|---------|
| Détail visuel illisible sur petit écran | Légère simplification **documentée** |
| Comportement OS réel dangereux ou hors navigateur | Comportement simulé pédagogique (ex. pas de vrai `rm -rf`) |
| Raccourci clavier expert | **Ne pas** implémenter (souris/tactile d'abord) |
| Checklist / missions (`data-link="checklist"`) | Renforcer la découverte guidée sans bloquer l'exploration libre |

Les écarts à l'OS réel sont autorisés si imposés par le navigateur, la performance, ou l'objectif pédagogique — les **signaler** brièvement dans la PR ou un commentaire CSS/JS.

## Accessibilité (sens CapsuleOS)

- Priorité contrat : **accessibilité et compréhension** avant optimisation extrême.
- Grandes zones cliquables, `title` / libellés sur icônes, contrastes suffisants via variables.
- Pas d'exigence WCAG complète type application métier ; éviter les pièges (actions sans feedback, icônes seules sans nom).

## Gamification / checklist

- App `checklist` : missions de découverte ; `CAPSULE_CHECKLIST_STORAGE_KEY` par skin.
- Feedback positif (progression visible) sans punition bloquante.
- Ne pas masquer des fonctions essentielles du bureau derrière la checklist seule.

## Comparaison entre OS

- Même noyau, variantes par famille Linux — faciliter la comparaison Debian vs Red Hat, etc.
- Éviter les différences arbitraires qui confondent l'apprenant (même action, même emplacement logique quand l'OS réel le permet).

## Liens skills techniques

- Structure et hub : `capsule-os-architect`
- Fidélité visuelle : `capsule-visual-replicator`
- Interaction souris : `capsule-js-core-developer`
- Revue avant release : `capsule-contract-review`

## Périmètre

Focus **Linux** pour l'instant. Autres familles OS du contrat : hors scope actif jusqu'à polish Linux.
