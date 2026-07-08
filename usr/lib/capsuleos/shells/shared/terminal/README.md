# Terminal partagé — propagation nano / vim

## Module central

| Fichier | Rôle |
|---------|------|
| `usr/lib/capsuleos/common/terminal-completion.js` | Complétion Tab (commandes + chemins FS virtuel) |
| `usr/lib/capsuleos/common/terminal-editors.js` | Moteur nano/vim, lecture/écriture FS virtuel |
| `usr/share/capsuleos/themes/linux/terminal-editors.css` | Overlay éditeur (variables skin terminal) |

## Ordre de chargement (toute page avec terminal)

1. `common/user-home.js` (déjà requis pour le FS `home/public`)
2. `terminal/config/command-registry.js`
3. **`terminal/config/command-core.js`** — noyau partagé (32 cmd)
4. **`terminal/config/terminal-profile-builder.js`**
5. Profil famille (`config/profiles/linux/debian.js`, `redhat.js`, `suse.js`…)
6. **`terminal/config/terminal-vendor-extensions.js`** — singularités vendor (ex. `cinnamon` sur Mint)
7. `terminal-profile.js`, **`terminal-bashrc.js`**, `terminal-core.js`

Contrat et procédure : `etc/capsuleos/contracts/terminal-commands.json` · `root/docs/procedure-terminal-commandes.md`
5. **`common/terminal-completion.js`**, puis **`common/terminal-editors.js`** ← avant `terminal.js` et `executeCommand.js`
6. `terminal.js`, **`terminal-shell-parse.js`**, **`terminal-package-managers.js`**, `executeCommand.js`, `filesystem.js`, `virtual-shell.js`, `manuel.js`
7. (optionnel) `terminal-konsole-chrome.js` après `terminal.js` — skins Konsole : `opensuse`, `mx-kde`, `debian-kde` (colorise le prompt actif + l’historique ; barre d’outils décorative)

### Konsole (Plasma)

| Fichier | Rôle |
|---------|------|
| `style/apps/terminal.skin.css` | Chrome fenêtre Konsole, toolbar, couleurs prompt (`--konsole-*`) |
| `terminal-konsole-chrome.js` | Découpe `user@host:path$` en spans `.konsole-prompt__*` |

Les trois skins KDE partagent le gabarit `terminal.html` (toolbar Konsole). **Debian-KDE** réutilise les tokens `--opensuse-*` définis dans `debian-breeze.css` / `style.css`.

## Linux (8 skins + facades `OS/linux/families/`)

Profils : `linux:debian`, `linux:redhat`, `linux:suse`, `linux:arch` — noyau commun + extensions famille ; `nano`/`vim` dans le noyau.

`executeCommand.js` délègue à `CapsuleTerminalEditors.prepareCommand` ; `terminal.js` monte l’overlay in-terminal.

## macOS (Sonoma)

Quand un terminal est ajouté : même scripts + profil `macos:default` étendu avec `nano`, `vim`, et chemins `../../../usr/lib/capsuleos/common/terminal-editors.js`.

## BSD (GhostBSD, etc.)

Réutiliser le profil `unix:default` ou dupliquer la liste de commandes ; charger les mêmes scripts depuis `usr/lib/capsuleos/`.

## Android / HarmonyOS

Stubs : inclure `terminal-editors.js` + hook `executeTerminalCommand` identique dès qu’un shell terminal existe sous `home/Android/` ou `home/HarmonyOS/`.

## UNIX (`home/UNIX/`)

Créer la skin avec `CAPSULE_TERMINAL_PROFILE = 'unix'` et :

```html
<script src=".../config/profiles/unix/default.js"></script>
```

## API programmatique

```javascript
CapsuleTerminalEditors.openNano('notes.txt', {
  session: terminalSession,
  host: document.querySelector('[data-terminal-app]'),
  callbacks: { onClose(closed) { /* lignes */ } }
});
```
