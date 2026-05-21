# Référence — Architecture Linux

## Familles prévues (contrat)

Debian, Red Hat, Arch, Suse, Slackware — sous `OS/linux/families/`.

## Scripts build (racine `scripts/`)

| Script | Sortie |
|--------|--------|
| `build-capsule-embed.mjs` | `OS/linux/kernel/js/capsule-app-embed.js` |
| `build-android-embed.mjs` | Embed Android (hors scope Linux courant) |

Relancer `build-capsule-embed.mjs` après modification de :

- `OS/linux/shared/apps/*.html`
- `OS/linux/shared/apps/style/*`
- `families/.../style/apps/*.skin.css` listés dans `SKIN_DIRS`
- `content/strings.json` par skin embarquée

## `CAPSULE_EMBED_SKIN_KEY`

Doit correspondre à une entrée `key` dans `SKIN_DIRS` du script build (ex. `mxkde`, `mint`, `fedora`).

## Hub

`OS/linux/index.html` : liens vers chaque bureau simulé listé. Toute nouvelle distro visible doit y figurer.

## Diagnostic chemins cassés

1. Ouvrir la console navigateur (404 sur `media/`, `shared/`, `kernel/`).
2. Vérifier profondeur des `../../../` depuis `families/.../index.html`.
3. Vérifier `CAPSULE_APPS_BASE` et `CAPSULE_SKIN_BASE`.
4. En `file://` : vérifier présence et fraîcheur de `capsule-app-embed.js`.

## Fichiers de config shell

- `OS/linux/kernel/js/linux-shell-config.js`
- `OS/linux/kernel/js/capsule-resource-url.js`
