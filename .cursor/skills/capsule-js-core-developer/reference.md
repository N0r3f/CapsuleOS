# Référence — JS noyau Linux

## Répertoires

| Chemin | Contenu |
|--------|---------|
| `OS/linux/kernel/js/` | Noyau (fenêtres, menu, FS, strings, embed, …) |
| `OS/linux/shared/apps/` | Gabarits HTML apps |
| `OS/linux/families/.../js/` | Overrides skin (ex. `mainMenu-kde-chrome.js`) |

## Fichiers clés

- `strings-default.js` / `capsule-strings.js` — textes
- `capsule-app-embed.js` — gabarits + CSS apps pour `file://` (généré)
- `contentLoader.js` — injection apps dans `.windowElement`
- `linux-shell-config.js` — config shell
- `capsule-resource-url.js` — URLs médias si base externe
- `fileSystem.js` — explorateur (template via `CAPSULE_EXPLORER_TEMPLATE`)

## Écouteurs clavier existants (ne pas étendre)

Fichiers connus avec `document.addEventListener('keydown'` :

- `kernel/js/mainMenu.js`
- `kernel/js/volume.js`
- `kernel/js/calendar-popover.js`
- `kernel/js/librewriter.js`
- `families/redhat/fedora/js/overview.js`
- `families/debian/mx-kde/js/calendar-popover-kde.js`
- `families/debian/mx-kde/js/mainMenu-kde-chrome.js`

Stratégie de migration : attacher au conteneur du composant, retirer l'écouteur à la fermeture.

## Patterns autorisés

```javascript
// Fermeture popover — scope local
popoverEl.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { closePopover(); }
});
```

```javascript
// Interdit pour nouveau code
document.addEventListener('keydown', (event) => {
  if (event.key === 'F1') { openHelp(); }
});
```
