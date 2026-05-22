# Mapping icônes — Pop!_OS / COSMIC

Références visuelles : `visuel/screenshot/popos_cosmic/` (copies dans `media/reference/`).

Pack source : `visuel/icons/` — apps couleur **hicolor** `com.system76.Cosmic*`, indicatifs **symbolic** thème **Cosmic**.

> **Ne pas utiliser** `Pop/48x48/apps/appgrid.svg` pour la grille Applications (icône type « shop », pas la grille 3×3).

## Export dock (couleur)

Le dock utilise des **SVG** (ou PNG pour Firefox) sous `media/img/dock/`. Commande optionnelle PNG 48×48 si `rsvg-convert` est installé :

```bash
ICONS=../../../../../../visuel/icons
DOCK=media/img/dock
rsvg-convert -w 48 -h 48 "$ICONS/hicolor/scalable/apps/com.system76.CosmicLauncher.svg" -o "$DOCK/launcher.png"
# … répéter pour chaque entrée du tableau ci-dessous (sauf firefox.png déjà PNG)
```

| # | Bouton UI | Fichier CapsuleOS | Source `visuel/icons/` |
|---|-----------|-------------------|-------------------------|
| 1 | Launcher | `dock/launcher.svg` | `hicolor/scalable/apps/com.system76.CosmicLauncher.svg` |
| 2 | Workspaces | `dock/workspaces.svg` | `hicolor/scalable/apps/com.system76.CosmicWorkspaces.svg` |
| 3 | Applications | `dock/applications-grid.svg` | `hicolor/scalable/apps/com.system76.CosmicAppLibrary.svg` |
| 4 | Firefox | `dock/firefox.png` | `ubuntu/media/img/dock/firefox.png` (symlink hicolor cassé en `file://`) |
| 5 | Fichiers | `dock/files.svg` | `hicolor/48x48/apps/com.system76.CosmicFiles.svg` |
| 6 | Éditeur texte | `dock/text-editor.svg` | `hicolor/48x48/apps/com.system76.CosmicEdit.svg` |
| 7 | Terminal | `dock/terminal.svg` | `hicolor/48x48/apps/com.system76.CosmicTerm.svg` |
| 8 | Pop!_Shop | `dock/pop-shop.svg` | `hicolor/48x48/apps/com.system76.CosmicStore.svg` |
| 9 | Paramètres | `dock/settings.svg` | `hicolor/48x48/apps/com.system76.CosmicSettings.svg` |

Ordre dock (captures `desktop.png`, `launcher.png`) : Launcher → Workspaces → Applications → séparateur → Firefox → Fichiers → Éditeur → Terminal → Shop → Paramètres.

Réutilisation : mêmes fichiers pour `cosmic-launcher__app` et `cosmic-applications__app`.

## Bureau

| Élément | Fichier | Source |
|---------|---------|--------|
| Raccourci Pop!_OS | `assets/pop-logo.png` | `pop-os-branding/256x256/apps/ubuntu-logo-icon.png` |

## Tray (`desktop.png` — `<img>` + `filter: invert`, compatible `file://`)

Fichiers : `media/img/symbolic/tray/*.svg` — ordre gauche → droite après `fr`.

| # | Indicateur | Fichier CapsuleOS | Source `visuel/icons/` |
|---|------------|-------------------|-------------------------|
| 1 | Langue `fr` | (texte HTML) | — |
| 2 | Accessibilité | `symbolic/tray/accessibility.svg` | `Cosmic/scalable/apps/preferences-desktop-accessibility-symbolic.svg` |
| 3 | Tiling fenêtres | `symbolic/tray/tiling.svg` | `hicolor/scalable/apps/com.system76.CosmicAppletTiling-symbolic.svg` |
| 4 | Volume | `symbolic/tray/volume.svg` | `hicolor/scalable/apps/com.system76.CosmicAppletAudio-symbolic.svg` |
| 5 | Wi‑Fi | `symbolic/tray/network.svg` | `hicolor/scalable/apps/com.system76.CosmicAppletNetwork-symbolic.svg` |
| 6 | Batterie | `symbolic/tray/battery.svg` | `hicolor/scalable/status/cosmic-applet-battery-level-80-symbolic.svg` |
| 7 | Notifications | `symbolic/tray/notifications.svg` | `hicolor/scalable/apps/com.system76.CosmicAppletNotifications-symbolic.svg` |
| 8 | Capture d'écran | `symbolic/tray/screenshot.svg` | `Cosmic/scalable/apps/accessories-screenshot-symbolic.svg` |
| 9 | Alimentation | `symbolic/tray/power.svg` | `hicolor/scalable/apps/com.system76.CosmicAppletPower-symbolic.svg` |

## Menu alimentation (`shutdown.png`)

Fichiers : `media/img/symbolic/power/*.svg` — `<img>` + filtres CSS — [`power-menu.css`](../style/cosmic-shell/power-menu.css).

| Zone capture | Fichier | Source `visuel/icons/` |
|--------------|---------|-------------------------|
| Paramètres… (engrenage) | `symbolic/power/settings.svg` | `Cosmic/scalable/emblems/emblem-system-symbolic.svg` |
| Verrouiller l'écran | `symbolic/power/lock.svg` | `Cosmic/scalable/actions/system-lock-screen-symbolic.svg` |
| Se déconnecter | `symbolic/power/logout.svg` | `Cosmic/scalable/actions/system-log-out-symbolic.svg` |
| Suspendre (lune, cyan) | `symbolic/power/suspend.svg` | `Cosmic/scalable/actions/system-suspend-symbolic.svg` |
| Redémarrer (cyan) | `symbolic/power/restart.svg` | `Cosmic/scalable/actions/system-reboot-symbolic.svg` |
| Éteindre (cyan) | `symbolic/power/poweroff.svg` | `Cosmic/scalable/actions/system-shutdown-symbolic.svg` |

Couleur actions : `--popos-power-action-color` (`#48b9c7`) via filtre sur `.cosmic-power-menu__icon--action`.

## Grille Applications (`Apps.png`)

### Apps couleur — `media/img/apps/overview/`

| Libellé capture | Fichier CapsuleOS | Source `visuel/icons/` |
|-----------------|-------------------|-------------------------|
| Fichiers COSMIC | `cosmic-files.svg` | `hicolor/128x128/apps/com.system76.CosmicFiles.svg` |
| Firefox | `firefox.png` | `ubuntu/media/img/dock/firefox.png` |
| Lecteur Multimédia COSMIC | `cosmic-player.svg` | `hicolor/128x128/apps/com.system76.CosmicPlayer.svg` |
| Paramètres COSMIC | `cosmic-settings.svg` | `hicolor/128x128/apps/com.system76.CosmicSettings.svg` |
| Paramètres de Qt5 | `qt5-settings.svg` | `breeze/preferences/32/preferences-gtk-config.svg` |
| Paramètres de Qt6 | `qt6-settings.svg` | `Pop/128x128/apps/mate-preferences-desktop-display.svg` |
| Store COSMIC | `cosmic-store.svg` | `hicolor/128x128/apps/com.system76.CosmicStore.svg` |
| Terminal COSMIC | `cosmic-terminal.svg` | `hicolor/128x128/apps/com.system76.CosmicTerm.svg` |
| Éditeur de texte COSMIC | `cosmic-text-editor.svg` | `hicolor/128x128/apps/com.system76.CosmicEdit.svg` |

Le dock conserve `media/img/dock/*` (48×48) ; la grille Applications utilise les SVG 128×128 pour la fidélité `Apps.png`.

### Catégories (monochrome clair) — `media/img/symbolic/apps-categories/`

Sources `Cosmic/scalable/` ; teinte via CSS `filter: brightness(0) invert(1)` sur `.cosmic-applications__category-symbolic`.

| Catégorie | Fichier | Source |
|-----------|---------|--------|
| Accueil | `home.svg` | `places/user-home-symbolic.svg` |
| Bureautique | `office.svg` | `places/folder-documents-symbolic.svg` |
| Système / Utilitaires | `system.svg`, `utilities.svg` | `places/folder-symbolic.svg` |
| Ajout dossier | `folder-new.svg` | `actions/folder-new-symbolic.svg` |

## Fichiers Cosmic (`nemo-cosmic`)

Places + barre d’outils : `Cosmic/scalable/places/` et `Cosmic/scalable/actions/` → `media/img/elements/nemo/` (sous-dossier `places/`).

| Usage | Fichier local |
|-------|----------------|
| App (menubar) | `elements/nemo/cosmic-files-app.svg` ← `hicolor/48x48/apps/com.system76.CosmicFiles.svg` |
| Navigation | `go-previous-symbolic.svg`, `go-next-symbolic.svg`, `edit-symbolic.svg`, `system-search-symbolic.svg` |
| Sidebar | `places/*-symbolic.svg` (récent, home, documents, …) |
| Liste dossiers | `places/*.svg` (icônes colorées Bureau, Documents, …) |
