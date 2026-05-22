# Référence — HTML Linux CapsuleOS

## `window.CAPSULE_*` (avant scripts noyau)

Typiquement dans un `<script>` inline en tête de fin de `<body>`, **avant** `capsule-app-embed.js` et `contentLoader.js` :

| Variable | Rôle |
|----------|------|
| `CAPSULE_APPS_BASE` | Chemin vers `OS/linux/shared/apps` |
| `CAPSULE_CONTENT_ROOT` | Racine contenu utilisateur simulé |
| `CAPSULE_SKIN_BASE` | Répertoire de la skin (souvent `.`) |
| `CAPSULE_EMBED_SKIN_KEY` | Clé embed (`mint`, `ubuntu`, `mxkde`, `fedora`, …) |
| `CAPSULE_EXPLORER_TEMPLATE` | Gabarit explorateur (`nemo`, `dolphin`, `nautilus`, …) |
| `CAPSULE_EXPLORER_APP_ID` / `DISPLAY_NAME` / `SKIN_KEY` | Identité explorateur |
| `CAPSULE_STRINGS_URL` | Option `./content/strings.json` |
| `CAPSULE_SITE_HOME` / `CAPSULE_LINUX_HUB` | Navigation retour hub / accueil |
| `CAPSULE_MEDIA_BASE` / `CAPSULE_ASSETS_BASE` | Si pas de `media/` local (skin dérivée) |

## Ordre de chargement scripts (extrait checklist)

1. Config `CAPSULE_*`
2. `capsule-resource-url.js` (si `CAPSULE_MEDIA_BASE`)
3. `strings-default.js` → `capsule-strings.js`
4. `capsule-app-embed.js` (mode `file://`)
5. Scripts noyau (`contentLoader.js`, fenêtres, etc.)
6. Scripts spécifiques skin (`./js/…`) en dernier si nécessaire

## Exemple de structure bureau

Référence : `OS/linux/families/debian/mx-kde/index.html`

- `<object id="desktop">` : raccourcis + slots `.windowElement`
- `<footer id="tableau">` : `<nav>` pins + tray + horloge

## Feuilles de style dans `<head>`

- Skin : `./style/style.css`
- Apps partagées : `../../../shared/apps/style/*.base.css`
- Surcharges : `./style/apps/*.skin.css`
