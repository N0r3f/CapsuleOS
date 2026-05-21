---
name: capsule-os-architect
description: >-
  Conçoit l'arborescence et l'intégration des distros Linux simulées dans
  CapsuleOS (families, shared, kernel, chemins relatifs, hub index). Utiliser
  pour ajouter une distro Debian/Red Hat/Arch, diagnostiquer chemins assets,
  CAPSULE_* manquants, ou structure OS/linux.
disable-model-invocation: true
---

# Capsule OS Architect

Architecte système pour la branche **Linux** de CapsuleOS (Windows / Android / iOS : hors scope tant que Linux n'est pas stabilisé).

## Priorité

En cas de conflit : `.cursor/rules/STRICT_CONTRACT.md` et `CONTRACT_CHECKLIST.md` l'emportent.

## Principes

- **Simple Static App** : aucune logique métier serveur.
- **Pas de duplication** : réutiliser `kernel/`, `shared/`, assets parent via chemins relatifs ou `CAPSULE_MEDIA_BASE`.
- **Scalabilité** : structure prête pour des dizaines de distros sans refonte.

## Arborescence Linux

```
OS/linux/
├── kernel/          # Comportements et styles communs
├── shared/          # Apps et contenu communs
├── families/        # Variantes (debian/, redhat/, arch/, …)
│   └── <distro>/    # index.html, style/, media/, content/, js/
└── index.html       # Hub — à mettre à jour pour chaque nouvelle distro
```

## Nouvelle distro (workflow)

1. Copier une skin proche (même famille) comme squelette.
2. Ajuster `index.html` : `CAPSULE_*`, `CAPSULE_EMBED_SKIN_KEY`, chemins relatifs.
3. `style/imports.css` + `*.skin.css` ; médias locaux ou `CAPSULE_MEDIA_BASE` vers parent.
4. Enregistrer la clé dans `scripts/build-capsule-embed.mjs` (`SKIN_DIRS`) si apps/strings embarqués.
5. Relancer le build embed (skill `capsule-offline-embed`).
6. Ajouter l'entrée dans `OS/linux/index.html`.
7. Vérifier checklist Linux (`CONTRACT_CHECKLIST.md`).

## Règles structurelles

- **Pas de symlinks versionnés** : chemins relatifs explicites (`../mint/media/…`).
- Skins dérivées sans `media/` : définir `CAPSULE_MEDIA_BASE` / `CAPSULE_ASSETS_BASE` avant `capsule-resource-url.js`.
- Explorer : slot `data-link="nemo"` + `CAPSULE_EXPLORER_TEMPLATE` (pas de logique FS dupliquée).

## Offline

- Mode serveur / localhost : Service Worker (`sw.js` depuis `index.html` racine).
- Mode `file://` : embed JS — voir skill `capsule-offline-embed`.

## Ressources

- Checklist intégration, scripts build, hub : [reference.md](reference.md)
- Contrat architecture : `.cursor/rules/STRICT_CONTRACT.md` §9–11
