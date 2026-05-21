# Skins applications Pop!_OS / COSMIC — phase 2

Plan d’implémentation après le shell structurel (`index.html`, `cosmic-shell/*`).

## Priorités

| Priorité | Capture | Fichier(s) | JS kernel |
|----------|---------|------------|-----------|
| 1 | `terminal_cosmic.png`, `terminal_max.png` | `terminal.skin.css` | `terminal.js` — classe `terminal-window--cosmic` |
| 2 | `dossier_minimiser.png`, `dossiers_fullscreen.png` | `files.skin.css` + template `shared/apps/nemo-cosmic.html` | `contentLoader.js` — `CAPSULE_EXPLORER_TEMPLATE` |
| 3 | Firefox (barre onglets intégrée) | `firefox.skin.css` | `firefoxBrowser.js` — `body#popos` déjà pris en charge |

## Terminal Cosmic

- Surface sombre ~`#1a1a1e`, accent prompt cyan `#62d0e9`
- Titre fenêtre = répertoire courant (réutiliser `paintGnomeTerminalTitle`)
- Listing `ls` : colonnes, répertoires en cyan
- Fenêtre sans dock gauche : largeur `calc(100vw - 2rem)`, ancrage sous top bar + dock bas

## Fichiers (Nemo Cosmic)

1. Créer `shared/apps/nemo-cosmic.html` (sidebar Cosmic, pathbar, pas de orange Yaru)
2. Copier icônes places depuis `visuel/icons_Pop!_OS/` → `popos/media/img/elements/nemo/places/`
3. Remplacer dans `index.html` : `CAPSULE_EXPLORER_TEMPLATE = 'nemo-cosmic'`
4. Mettre à jour `build-capsule-embed.mjs` : entrée template `nemo-cosmic` → `nemo.base.css`
5. `files.skin.css` : tokens `--nemo-accent: #62d0e9`, surfaces `#242428`

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
- [ ] `contentLoader.js` — enregistrer `nemo-cosmic` quand le template existe
- [ ] Tour : étapes dock / Workspaces / Launcher dans `tour-data.js` (optionnel)

## Fidélité

Passes `capsule-visual-replicator` + `capsule-css-engineer` par capture listée dans `UI-FIDELITE.txt`.
