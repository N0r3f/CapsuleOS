# Noyau Linux (CapsuleOS)

## Chemins partagés

| Rôle | Emplacement |
|------|-------------|
| Styles tokens Linux | [`style/variables-linux.css`](style/variables-linux.css) |
| Scripts (horloge, fenêtres, explorateur, apps…) | [`js/`](js/) |
| Apps HTML + CSS structure (`.base.css`) | [`../shared/apps/`](../shared/apps/) |
| Contenu pédagogique (PDF, médias, manifest) | [`../shared/content/`](../shared/content/) |

## Slot vs template d’application

- **Slot** : identifiant stable dans le shell (`data-link` sur les `div.windowElement` et les lanceurs), utilisé par [`windowContainer.js`](js/windowContainer.js) — ex. `nemo`, `firefox`, `terminal`. Il ne change pas quand on simule un autre gestionnaire de fichiers.
- **Template** : nom des fichiers sous `shared/apps/` — ex. `nemo.html`, `dolphin.html`, `firefox.html`. Le [`contentLoader.js`](js/contentLoader.js) charge le template indiqué par le slot ou par un **alias** (voir `CAPSULE_EXPLORER_TEMPLATE`). En `file://`, le contenu est lu depuis [`capsule-app-embed.js`](js/capsule-app-embed.js) (généré par `scripts/build-capsule-embed.mjs`), avec `CAPSULE_EMBED_SKIN_KEY` pour la distro et `CAPSULE_EXPLORER_SKIN_KEY` pour dissocier le `.skin.css` explorateur du template. Le démarrage du chargeur est différé jusqu’à `DOMContentLoaded` (ou `setTimeout(0)` si le DOM est déjà prêt) pour que les scripts qui définissent `initNemoContainer`, `initTerminalWhenReady`, etc. soient exécutés avant l’injection des apps.

Exemple : slot `nemo` + `CAPSULE_EXPLORER_TEMPLATE = 'dolphin'` charge `dolphin.html` / `dolphin.base.css` tout en gardant le slot `nemo` pour le gestionnaire de fenêtres.

## Chaîne CSS recommandée pour une skin

1. `style/reset.css` et `style/variables.css` — racine du dépôt  
2. `OS/linux/kernel/style/variables-linux.css`  
3. Feuilles du shell de la skin (`style/style.css`, barre des tâches, calendrier, etc.)  
4. Pour chaque app chargée dynamiquement : `shared/apps/style/<templateId>.base.css` puis `families/.../<distro>/style/apps/<skinId>.skin.css` (`skinId` vaut le template par défaut, sauf override explorateur)  

## Couches visuelles (contrôle sans duplication)

Pour ajuster **couleurs, alpha, en-têtes, icônes** selon l’intention du contrat (variables centralisées, variantes par skin) :

| Couche | Fichiers | Rôle |
|--------|----------|------|
| Tokens globaux page | Racine [`style/variables.css`](../../../style/variables.css), [`style/variables-linux.css`](style/variables-linux.css) | `--head`, shell générique |
| Shell d’une distro | ex. Mint `style/style.css` ; Fedora **`style/imports.css`** → `gnome-shell/` (`tokens.css`, `windows-chrome.css`, `tray.css`, popovers, `a11y-fedora.css`) + `gnome-workstation.css`, **`fedora-overrides.css`** | Bureau GNOME, dock, chrome fenêtre et popovers **sans** `@import` des CSS Mint ; JS noyau inchangé |
| Structure explorateur | [`shared/apps/style/nemo.base.css`](../shared/apps/style/nemo.base.css) | Grille, flex, IDs stables ; couleurs « finales » plutôt dans le template Dolphin |
| Défauts template Dolphin | [`shared/apps/style/dolphin.base.css`](../shared/apps/style/dolphin.base.css) | Tous les `--dolphin-*` / `--nemo-*` et variables sur `div[data-link="nemo"]` pour le chrome fenêtre du slot explorateur |
| Overrides par skin | `families/.../<distro>/style/apps/dolphin.skin.css` | **Réglage fin** Fedora, Mint, etc. sans toucher au `.base.css` partagé |

Ordre d’injection des apps : voir [`contentLoader.js`](js/contentLoader.js) — `nemo.base.css` est fusionné **avant** `dolphin.base.css` pour le template `dolphin` ; le `.skin.css` est concaténé en dernier.

Thème runtime (optionnel) : [`capsule-theme.js`](js/capsule-theme.js) applique des paires `--variable: valeur` sur `:root` (ex. préférences stockées), sans framework. Pour **Fedora**, le fichier [`families/redhat/fedora/style/gnome-shell/tokens.css`](../families/redhat/fedora/style/gnome-shell/tokens.css) définit aussi un bloc `html[data-theme="light"]:has(#fedora)` (barre, dock, popovers, fenêtres, Nemo) lorsque l’utilisateur bascule le thème clair depuis l’app Thèmes.

## Contrat de chargement (`window.CAPSULE_*`)

| Variable | Rôle |
|----------|------|
| `CAPSULE_APPS_BASE` | Chemin vers `OS/linux/shared/apps` |
| `CAPSULE_CONTENT_ROOT` | Racine du dossier personnel pédagogique partagé |
| `CAPSULE_SKIN_BASE` | Répertoire de la skin (souvent `.`) pour les `.skin.css` |
| `CAPSULE_EXPLORER_TEMPLATE` | Optionnel : `'nemo'` ou `'dolphin'` (défaut `nemo`) quand le slot est `nemo` |
| `CAPSULE_EXPLORER_SKIN_KEY` | Optionnel : nom du `.skin.css` explorateur (`nemo`, `files`, `dolphin`) sans changer le template |
| `CAPSULE_EXPLORER_DISPLAY_NAME` | Optionnel : nom visible du gestionnaire (`Nemo`, `Fichiers`, `Dolphin`) |
| `CAPSULE_STRINGS_URL` | Optionnel : URL du JSON de surcharges texte (défaut `./content/strings.json`) |
| `CAPSULE_STRINGS_INLINE` | Optionnel : objet de clés → textes sans `fetch` |
| `CAPSULE_EMBED_SKIN_KEY` | `mint` / `ubuntu` / `fedora` : skin des apps dans l’embed (`file://`) |
| `CAPSULE_SITE_HOME` | Chemin relatif vers la racine du site (`../../../../../index.html` depuis les skins) pour l’iframe du faux Firefox (`file://` et chemins cohérents) |
| `CAPSULE_LINUX_HUB` | Chemin relatif vers le hub des distros Linux (`../../../index.html` → `OS/linux/index.html`) pour arrêt / déconnexion du menu Démarrer |

Détail des propriétés historiques : [`js/linux-shell-config.js`](js/linux-shell-config.js).

Chaînes par défaut : [`js/strings-default.js`](js/strings-default.js). Fusion et application : [`js/capsule-strings.js`](js/capsule-strings.js).

## Convention KDE (template Dolphin mutualisé)

Pour les distributions KDE, conserver le slot explorateur `nemo` mais basculer le template vers Dolphin :

- `CAPSULE_EXPLORER_TEMPLATE = 'dolphin'`
- `CAPSULE_EXPLORER_DISPLAY_NAME = 'Dolphin'`
- `CAPSULE_EXPLORER_SKIN_KEY` :
  - valeur recommandée par défaut : `dolphin` (skin commune),
  - valeur distro-spécifique possible : `dolphin-<distro>` (ex. `dolphin-mxkde`), avec repli automatique sur `dolphin` si le fichier n’existe pas.

Le mécanisme de repli est géré dans [`js/contentLoader.js`](js/contentLoader.js) : il tente `style/apps/<skinId>.skin.css` puis retombe sur `style/apps/<templateId>.skin.css`.

## Onboarding d'une nouvelle distro KDE

Checklist minimale :

1. Dans `families/.../<distro>/index.html`, définir :
   - `CAPSULE_EXPLORER_TEMPLATE = 'dolphin'`
   - `CAPSULE_EXPLORER_DISPLAY_NAME = 'Dolphin'`
   - `CAPSULE_EXPLORER_SKIN_KEY = 'dolphin-<distro>'` (ou `dolphin` si pas de variante)
2. Ajouter la skin si nécessaire : `families/.../<distro>/style/apps/dolphin-<distro>.skin.css`.
3. Centraliser les icônes KDE sous `families/.../<distro>/media/img/elements/kde/` et pointer le template Dolphin vers ces assets.
4. Régénérer `js/capsule-app-embed.js` après toute modification de `shared/apps/dolphin.html` ou des `style/apps/*.skin.css`.

## Contenu partagé

Le dossier [`shared/content/Dossier_personnel/`](../shared/content/Dossier_personnel/) contient le manifest et les fichiers de démo. Les skins pointent via `window.CAPSULE_CONTENT_ROOT`.

## Chaîne de scripts commune (skins Debian / Red Hat)

Après le bloc `window.CAPSULE_*` de chaque `families/.../<distro>/index.html` :

1. `capsule-app-embed.js` → `strings-default.js` → `capsule-strings.js`
2. `windowContainer.js` → `windowHeaderButton.js` → `resizeWindow.js` → `windowDrag.js`
3. `mainMenu-data.js` → `mainMenu.js` → `themes.js`
4. `./content/profile-data.js` → `profile.js` → `checklist.js` → `firefoxBrowser.js`
5. `contentLoader.js`
6. `fileExplorer/fileExplorerHeader.js` → `fileExplorerContainer.js` → `fileExplorerCore.js` → `fileExplorerInfo.js` → `fileViewerRouter.js` → `fileExplorer/fileExplorerLoader.js`
7. `date.js` → `calendar-popover.js`
8. Terminal : `terminal/config/command-registry.js` puis **un seul** profil Linux (`profiles/linux/debian.js` ou `profiles/linux/redhat.js`) → `terminal-profile.js` → `terminal-core.js` → `terminal.js` → `executeCommand.js` → `filesystem.js` → `manuel.js`
9. `tour-data.js` → `tour.js` → `volume.js` → `librewriter.js`

Fedora ajoute en fin de chaîne : `search/appSearch.js`, `./js/overview.js` (et `capsule-theme.js` avant les scripts fenêtre).

Variables utiles par skin : `CAPSULE_EMBED_SKIN_KEY`, `CAPSULE_CHECKLIST_STORAGE_KEY` (progression missions isolée par distro).

## Offline et embed

- Régénérer : `node scripts/build-capsule-embed.mjs` après modification des gabarits `shared/apps`, des `style/apps/*.skin.css` ou des `content/strings.json` des skins listées dans le script.
- L’embed expose `CAPSULE_APP_EMBED`, `CAPSULE_EMBED_STRINGS` (surcharges texte par clé de skin) et le manifeste explorateur.
- En `file://`, `capsule-strings.js` fusionne les défauts avec `CAPSULE_EMBED_STRINGS[CAPSULE_EMBED_SKIN_KEY]` (sans `fetch` du JSON local).

## Smoke anti-régression (avant merge)

Après tout lot touchant le noyau, `shared/apps` ou l’embed :

- **Mint** : boot, menu, Nemo, Firefox, terminal, une app secondaire, HTTP + `file://`.
- **Fedora** : boot, barre/dock, overview, Fichiers, une fenêtre app, terminal, HTTP + `file://`.
- **MX-KDE** : boot, Dolphin, terminal profil Debian (`mx` / `mx-kde`), HTTP + `file://`.
- **Ubuntu** : boot, Fichiers, chemins médias explicites vers Mint si partagés.

Les rendus **Mint** et **Fedora** sont figés : pas de refonte visuelle sans bug avéré ; rollback si le smoke échoue.

## Fedora / Nautilus (documentation)

Le libellé « Nautilus » côté Fedora correspond au slot `nemo`, au template `nemo` et à la skin `files` (pas de gabarit `nautilus.html` dédié).
