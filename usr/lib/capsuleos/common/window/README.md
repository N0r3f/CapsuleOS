# Noyau fenêtres CapsuleOS (`CapsuleWindow`)

Source modulaire sous `window/` ; bundle déployable : [`../capsule-window.js`](../capsule-window.js).

## Ordre de chargement (Linux, Windows, macOS)

1. `common/capsule-window.js` — noyau (`CapsuleWindow`, `Resizer`, `CapsuleWindowMaximize`)
2. `common/resizeWindow.js` — shim compat (`Resizer` alias)
3. `common/window-drag.js` — shim compat (`makeDraggable`)
4. Linux : `shells/linux/linux-window-context.js`, `linux-desktop-shell.js` (voir [convention-contexte-fenetres.md](../../../../root/docs/convention-contexte-fenetres.md))
5. Shell OS : `windowContainer.js`, `windowHeaderButton.js`, `windowManager.js` (Windows)

Windows charge en plus `OS/windows/kernel/js/win-window-drag.js` (fixe `requireHeader: true`).

## Modules

| Fichier | Rôle |
|---------|------|
| `bounds.js` | `getWorkAreaRect`, `clampPosition`, `clampSize` |
| `positioning.js` | Ancrage `absolute` sous `object#desktop` (drag/resize/max en coords viewport) |
| `stack.js` | z-index, `activateWindow` |
| `maximize.js` | `maximize` / `restore` / `toggle` (work-area unifiée) |
| `drag-targets.js` | Zones `data-window-drag-region`, passthrough headerbar |
| `drag.js` | Pointer Events, `enableDrag` |
| `resize.js` | Bordures redimensionnables |
| `header-context.js` | Contexte chrome par toolkit DE (`CapsuleWindowHeaderContext`) |
| `chrome.js` | Registre providers (`default`, `nemo`, `dolphin`, `firefox-gnome`, `terminal-*`) |
| `manager.js` | Façade `CapsuleWindow.init`, `ensureChrome`, `openByDataLink` |

## Contrat chrome par slot

```js
CapsuleWindow.init(container, {
  slotId: 'nemo',
  dragHandle: 'auto',
  chromeProvider: 'dolphin',
  resizable: true,
  bounds: { selector: 'main', footerSelector: 'footer' }
});
```

| Provider | Poignée de drag |
|----------|-----------------|
| `default` | `#windowHeader` injecté |
| `nemo` | `#nemoHeaderContainer` ou barre app (passthrough + régions) |
| `nemo-gnome` | `#windowHeader` + `.nautilus-app__headerbar` (régions drag) |
| `dolphin` | `#windowHeader` (barre Breeze) |
| `firefox-gnome` | tabsbar Firefox |
| `terminal-*` | header terminal Cosmic / GNOME / Konsole |

Le chrome **ne doit pas** être dans le fragment `innerHTML` injecté par `contentLoader` : appeler `CapsuleWindow.ensureChrome(motionless, slotId)` après chaque `SLOT_INIT`.

Contexte toolkit : [window-chrome-contexts.md](../../../../root/docs/window-chrome-contexts.md) · contrat `etc/capsuleos/contracts/window-chrome-contexts.json`.

## CSS partagé

[`usr/share/capsuleos/themes/linux/window-chrome.base.css`](../../../../share/capsuleos/themes/linux/window-chrome.base.css) — règles `#windowHeader`, `.windowElementActive`. Les skins importent ce fichier dans `style/imports.css` et ne gardent que tailles par app (`--win-*`) et icônes boutons.

## Régénérer le bundle

```bash
cat usr/lib/capsuleos/common/window/bounds.js \
    usr/lib/capsuleos/common/window/stack.js \
    usr/lib/capsuleos/common/window/maximize.js \
    usr/lib/capsuleos/common/window/drag-targets.js \
    usr/lib/capsuleos/common/window/drag.js \
    usr/lib/capsuleos/common/window/resize.js \
    usr/lib/capsuleos/common/window/chrome.js \
    usr/lib/capsuleos/common/window/manager.js \
  > usr/lib/capsuleos/common/capsule-window.js
```

## Matrice de tests manuels

| OS / skin | Valider |
|-----------|---------|
| Mint | Nemo : drag barre titre, resize, maximise |
| MX-KDE / openSUSE / Debian-KDE | Dolphin : drag titlebar, toolbar non-drag |
| Fedora / Ubuntu | Firefox tabsbar, Nautilus |
| PopOS | Terminal Cosmic |
| Windows 11 / XP | iframe drag, resize bordures, maximise work-area |
| macOS Sonoma | Finder drag, resize |

## Drag-and-drop fichiers (explorateur)

`fileExplorerDnD.js` + `moveExplorerItem` / `copyExplorerItem` dans `fileExplorerCore.js`. **Ctrl** pendant le drop = copier. Manifeste simulé (`localStorage`) uniquement.
