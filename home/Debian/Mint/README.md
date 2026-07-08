# Linux Mint Cinnamon — skin de référence (famille Debian)

- **Entrée canonique :** `home/Debian/Mint/index.html`
- **Façade stable :** `OS/linux/families/debian/mint/index.html` (`<base href>` vers ce dossier)
- **Variables clés :** `CAPSULE_EXPLORER_TEMPLATE = 'nemo'`, `CAPSULE_EMBED_SKIN_KEY = 'mint'`
- **Assets système :** `./assets/…` → `usr/share/capsuleos/assets/` (profil `skin.profile.json`) ; apps partagées sous `usr/share/capsuleos/linux/`
- **Surcouches CSS :** `style/apps/*.skin.css` — le menu Cinnamon est un **panneau** (`mainMenu.skin.css` statique dans `imports.css`), pas une fenêtre draggable
- **Panel Cinnamon v3 :** `style/mint-panel.css` (source unique) — menu, grouped-window-list, tray ; adaptateurs `mint-tray.js` + `mint-panel-pinned.js`
- **Bureau :** menu contextuel clic droit (`desktop-context-menu.js`)
- **Tokens panel/menu :** `usr/share/capsuleos/themes/linux/variables-linux.css` (`--mint-*`)
- **Dérivation Debian :** copier la structure Mint, ajuster `body#…`, tokens `--mint-*` et `*.skin.css` ; réutiliser le noyau `usr/lib/capsuleos/shells/linux/`

Test local : `python3 -m http.server 8765` à la racine du dépôt → http://127.0.0.1:8765/home/Debian/Mint/index.html

Après modification du skin, régénérer la façade pick-os : `node usr/lib/capsuleos/tools/linux/build-linux-facades.mjs` (sinon l’accueil sert une copie HTML obsolète sous `OS/linux/families/debian/mint/`).
