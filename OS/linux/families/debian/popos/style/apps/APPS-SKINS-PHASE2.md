# Skins applications Pop!_OS / COSMIC — phase 2

Plan d’implémentation après le shell structurel (`index.html`, `cosmic-shell/*`).

## Priorités

| Priorité | Capture | Fichier(s) | JS kernel |
|----------|---------|------------|-----------|
| 1 | `terminal_cosmic.png`, `terminal_max.png` | `terminal.skin.css` | `terminal.js` — classe `terminal-window--cosmic` |
| 2 | `dossier_minimiser.png`, `dossiers_fullscreen.png` | `files.skin.css` + `shared/apps/nemo-cosmic.html` | `fileExplorerCore.js` — rendu liste Cosmic |
| 3 | Firefox (barre onglets intégrée) | `firefox.skin.css` | `firefoxBrowser.js` — `body#popos` déjà pris en charge |

## Terminal Cosmic

- Surface sombre ~`#1a1a1e`, accent prompt cyan `#62d0e9`
- Titre fenêtre = répertoire courant (réutiliser `paintGnomeTerminalTitle`)
- Listing `ls` : colonnes, répertoires en cyan
- Fenêtre sans dock gauche : largeur `calc(100vw - 2rem)`, ancrage sous top bar + dock bas

## Fichiers (Nemo Cosmic)

1. [x] `shared/apps/nemo-cosmic.html` (menus Fichier/Modifier/Affichage/Trier, sidebar Cosmic)
2. [x] Icônes `visuel/icons/Cosmic/scalable/places/` → `popos/media/img/elements/nemo/places/`
3. [x] `index.html` : `CAPSULE_EXPLORER_TEMPLATE = 'nemo-cosmic'`
4. [x] `build-capsule-embed.mjs` + `contentLoader.js` : `nemo-cosmic` → `nemo.base.css`
5. [x] `files.skin.css` : accent `#48b9c7`, vue liste + colonnes (container query)

## Firefox

- Réutiliser logique chrome onglets (`firefox-window--fedora` + règles `body#popos`)
- Barre d’onglets fond `#2a2a2e`, accent cyan focus

## Skins secondaires (aliases)

- `profile.skin.css`, `themes.skin.css`, `checklist.skin.css` : fork minimal Ubuntu → tokens `--popos-*`
- `Dossier personnel.skin.css` : accent bureau Pop

## Embed offline

Après chaque skin stable :

```bash
node scripts/build-capsule-embed.mjs
```

Puis vérifier `CONTRACT_CHECKLIST.md` (offline, pas de fetch obligatoire).

## Extensions JS restantes

- [x] `firefoxBrowser.js` — `popos` dans `supportsFirefoxGnomeChrome()`
- [x] `terminal.js` — `terminal-window--cosmic` sur `body#popos`
- [x] `contentLoader.js` — `nemo-cosmic` enregistré
- [ ] Tour : étapes dock / Workspaces / Launcher dans `tour-data.js` (optionnel)

## Fidélité

Passes `capsule-visual-replicator` + `capsule-css-engineer` par capture listée dans `UI-FIDELITE.txt`.
