---
name: capsule-offline-embed
description: >-
  Gère le mode hors ligne CapsuleOS : Service Worker, cache, embed file://,
  scripts build-capsule-embed et capsule-app-embed.js. Utiliser après
  modification de gabarits apps, strings.json, manifest Nemo, ou pour
  diagnostiquer fetch/CORS en file://.
disable-model-invocation: false
---

# Capsule Offline & Embed

Stratégies offline pour CapsuleOS (focus **Linux** ; Android embed : secondaire).

## Priorité

`CONTRACT_CHECKLIST.md` § Offline et `.cursor/rules/STRICT_CONTRACT.md` §11 l'emportent.

## Deux modes

| Mode | Mécanisme | Test |
|------|-----------|------|
| **HTTP / localhost** | `navigator.serviceWorker.register('./sw.js')` sur `index.html` racine | Couper réseau après 1er chargement |
| **`file://`** | Pas de `fetch` fiable vers HTML/JSON locaux → **embed JS** | Ouvrir `OS/linux/families/.../index.html` sans serveur |

## Embed Linux

**Génération**

```bash
node scripts/build-capsule-embed.mjs
```

**Sortie** : `OS/linux/kernel/js/capsule-app-embed.js`

**Quand relancer**

- Modification `OS/linux/shared/apps/*.html` ou `shared/apps/style/*`
- Modification `families/.../style/apps/*.skin.css` d'une skin listée dans `SKIN_DIRS`
- Modification `content/strings.json` embarqué
- Modification `nemo-manifest.json` (contenu explorateur)

**Chargement page distro**

`capsule-app-embed.js` doit être inclus **avant** `contentLoader.js` (voir `capsule-html-purist/reference.md`).

## Service Worker

- Fichier : `sw.js` à la racine du dépôt.
- Enregistrement : `index.html` racine du site CapsuleOS.
- Ne pas rendre le SW obligatoire pour ouvrir une page Linux en `file://` (SW inactif sur `file://`).

## Android (rappel minimal)

`scripts/build-android-embed.mjs` → `capsule-android-embed.js` — uniquement si travail sur `OS/android/` ; hors périmètre Linux courant.

## Diagnostic

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| App vide en `file://` | Embed pas à jour ou absent | Rebuild + vérifier ordre scripts |
| 404 en HTTP | Chemin relatif ou hub | Architecte : chemins `CAPSULE_*` |
| Ancien contenu en ligne | Cache SW | Hard refresh / bump cache SW si changement critique |

## Ressources

- Détail `SKIN_DIRS` et manifest : [reference.md](reference.md)
