---
name: capsule-contract-review
description: >-
  Revue d'alignement CapsuleOS avant merge ou release selon STRICT_CONTRACT
  et CONTRACT_CHECKLIST. Utiliser quand l'utilisateur demande une revue
  contrat, checklist release, conformité stack, ou avant PR/merge.
disable-model-invocation: true
---

# Capsule Contract Review

Revue systématique avant merge ou release.

## Priorité

Sources de vérité (dans l'ordre) :

1. `.cursor/rules/STRICT_CONTRACT.md`
2. `CONTRACT_CHECKLIST.md` (racine dépôt)
3. Règle Cursor `capsuleos-contract.mdc`

## Procédure

1. Lire la checklist complète : `CONTRACT_CHECKLIST.md`.
2. Identifier le **périmètre** de la PR (HTML/CSS/JS Linux, SW, embed, structure, hub).
3. Cocher mentalement chaque section applicable ; signaler les échecs avec fichier + correction proposée.
4. Vérifier qu'aucune dérogation (framework, CDN obligatoire, symlink versionné) n'a été introduite sans mise à jour du contrat.

## Sections checklist → skills

| Section checklist | Skill complémentaire |
|-------------------|----------------------|
| HTML sémantique | `capsule-html-purist` |
| Ordre CSS / variables | `capsule-css-engineer` |
| JS mutualisé | `capsule-js-core-developer` |
| Offline / embed | `capsule-offline-embed` |
| Structure Linux / hub | `capsule-os-architect` |
| Fidélité / accessibilité | `capsule-pedagogy`, `capsule-visual-replicator` |

## Format de rapport

```markdown
## Revue contrat CapsuleOS

**Périmètre :** …
**Verdict :** OK | À corriger

### Conforme
- …

### Écarts (bloquants)
- [ ] … — fichier `…` — action : …

### Recommandations (non bloquantes)
- …
```

## Interdictions globales (rappel rapide)

Framework front, préprocesseur CSS, duplication logique, HTML non sémantique par confort, styles non factorisés, scripts OS-spécifiques quand le noyau suffit.

## Périmètre actuel projet

Revue Linux prioritaire. Windows / Android / iOS : mentionner seulement si la PR les touche explicitement ; sinon renvoyer à la stabilisation Linux.
