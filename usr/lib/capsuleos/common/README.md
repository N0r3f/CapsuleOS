# `usr/lib/capsuleos/common/`

JavaScript vanilla partagé entre portail, Windows, Linux et macOS.

| Fichier | API | Rôle |
|---------|-----|------|
| `capsule-window.js` | `CapsuleWindow`, `Resizer`, `CapsuleWindowMaximize` | Noyau fenêtres (drag, resize, stack, maximise, chrome) — voir [`window/README.md`](window/README.md) |
| `resizeWindow.js` | `class Resizer` | Shim compat ; charge `capsule-window.js` en premier |
| `window-drag.js` | `makeDraggable(element, options?)` | Shim compat → `CapsuleWindow.enableDrag` |
| `background.js` | (IIFE) | Animation fond portail (`--bleu` → `--violet`) |
| `capsule-resource.js` | `CapsuleResource.resolve()` | Résolution assets via `assets/manifest.json` |
| `capsule-skin-boot.js` | `CapsuleSkinBoot` | Applique `skin.profile.json` / embed profils |
| `user-home.js` | `CapsuleUserHome`, `CAPSULE_USER_HOME` | Home simulé partagé `home/public/` (voir `.cursor/ARCHITECTURE.md` §11) |
| `terminal-completion.js` | `CapsuleTerminalCompletion` | Complétion Tab (commandes + chemins FS virtuel) sur le prompt terminal |
| `terminal-editors.js` | `CapsuleTerminalEditors` | Éditeurs nano/vim in-terminal (FS virtuel) — voir `shells/shared/terminal/README.md` |

### Ordre de chargement (skins Linux)

1. `common/user-home.js`
2. `var/lib/capsuleos/generated/capsule-assets-manifest.js`
3. `var/lib/capsuleos/generated/capsule-skin-profiles.js`
4. `common/capsule-resource.js` (**avant** skin-boot)
5. `common/capsule-skin-boot.js`
6. `common/capsule-window.js` → shims → shell Linux

Regénération :

```bash
node usr/lib/capsuleos/tools/seed-skin-profiles.mjs      # si profils canon modifiés
node usr/lib/capsuleos/tools/build-skin-profiles.mjs
node usr/lib/capsuleos/tools/build-assets-manifest.mjs
node usr/lib/capsuleos/tools/build-pick-os.mjs           # S7 portail
```

### Ordre de chargement (tous OS — fenêtres)

1. `common/capsule-window.js`
2. `common/resizeWindow.js`
3. `common/window-drag.js`
4. Adaptateur shell (`shells/linux/windowContainer.js`, `OS/windows/kernel/js/win-window-drag.js`, …)

### Shell Windows

Après le noyau :

1. `OS/windows/kernel/js/win-window-drag.js` (`requireHeader: true`)
2. `OS/windows/kernel/js/windowManager.js` (resize bordures via `Resizer`)

### Chemins relatifs (exemples)

| Depuis | Vers `common/` |
|--------|----------------|
| `home/Debian/Mint/index.html` | `../../../usr/lib/capsuleos/common/` |
| `OS/linux/families/debian/mint/index.html` | `../../../../../usr/lib/capsuleos/common/` |
| `OS/macos/sonoma/index.html` | `../../../../../usr/lib/capsuleos/common/` |
| `OS/windows/versions/11/index.html` | `../../../../../usr/lib/capsuleos/common/` |

Les shims `site/window*.js` et forks `OS/linux/kernel/js/windowDrag.js` ont été supprimés — source unique : `capsule-window.js`.

### Home partagé (`home/public/`)

Après ajout de fichiers sous `home/public/`, régénérer les manifestes et l’embed Linux :

```bash
node usr/lib/capsuleos/tools/generate-public-manifest.mjs
node usr/lib/capsuleos/tools/linux/build-linux-embed.mjs
```

Les skins Linux définissent `CAPSULE_CONTENT_ROOT = CapsuleUserHome.fromRepoDepth(3)` ; Windows et les pages iframe utilisent `CapsuleUserHome.resolveRelative()`.
