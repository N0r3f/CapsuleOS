# Mapping icônes — capture `app_bouton_bas.png`

Référence visuelle : `visuel/screenshot/app_bouton_bas.png`  
Pack source : `visuel/icons_ubuntu_gnome/` (thème **Yaru** + **hicolor**)

Les fichiers `Yaru/*/apps/org.gnome.*.png` sont souvent des **liens symboliques texte** (≈13–24 o) vers un autre nom. Toujours copier la **cible résolue** (PNG > 1 Ko) ou `hicolor/scalable/*.svg`.

---

## Dock (barre gauche)

| Élément capture | Nom Ubuntu | Source Yaru / hicolor | Fichier CapsuleOS |
|-----------------|------------|------------------------|-------------------|
| Firefox | Firefox | `hicolor/48x48/apps/firefox.png` | `dock/firefox.png` |
| Fichiers | Nautilus | `Yaru/48x48@2x/apps/filemanager-app.png` ← `org.gnome.Nautilus.png` | `dock/files.png` |
| Ubuntu Software | GNOME Software | `Yaru/48x48@2x/apps/software-store.png` ← `org.gnome.Software.png` | `dock/software-store.png` |
| Aide | Yelp / help | `Yaru/48x48@2x/apps/help-app.png` | `dock/help.png` |
| Terminal | Ptyxis | `Yaru/48x48@2x/apps/terminal-app2.png` | `dock/terminal.png` |
| Corbeille | user-trash | `Yaru/48x48/places/user-trash.png` | `dock/trash.png` |
| **Bouton bas** (logo Ubuntu) | Afficher les applications | `Yaru/48x48@2x/places/start-here.png` ← `distributor-logo.png` | `dock/show-applications.png` |

> Le bouton bas n’utilise **pas** `actions/view-app-grid.png` (grille 9 points) sur cette capture Ubuntu : c’est le logo **Circle of Friends** (`start-here`).

Ordre dock (haut → bas) : Firefox, Fichiers, Ubuntu Software, Aide, Terminal, Corbeille (groupe haut, même espacement), puis bouton « Afficher les applications » en bas du dock.

---

## Grille « Afficher les applications » (ordre capture, 6 colonnes)

| Libellé capture | Application | Source (résolu) | Fichier CapsuleOS |
|-----------------|-------------|-----------------|-------------------|
| Horloges | GNOME Clocks | `Yaru/256x256@2x/apps/clock-app.png` ← `org.gnome.clocks.png` | `apps/overview/clocks.png` |
| Actualiseu… | Mise à jour logiciels | `Yaru/256x256@2x/apps/software-updater.png` | `apps/overview/software-updater.png` |
| Calculatrice | Calculator | `Yaru/256x256@2x/apps/calculator-app.png` ← `org.gnome.Calculator.png` | `apps/overview/calculator.png` |
| Centre de … | **Security Center** (snap) | *hors Yaru* — `canonical/desktop-security-center` → `snap/gui/desktop-security-center.png` | `apps/overview/security-center.png` |
| Paramètres | GNOME Settings | `Yaru/256x256@2x/actions/configure.png` ← `org.gnome.Settings.png` → `system-settings.png` | `apps/overview/settings.png` |
| Éditeur de … | Text Editor | `Yaru/256x256@2x/apps/org.gnome.TextEditor.png` | `apps/overview/text-editor.png` |
| Gestionnai… | Software & Updates | `Yaru/256x256@2x/apps/software-properties.png` | `apps/overview/software-properties.png` |
| Prise en ch… | Langues / claviers | `Yaru/256x256@2x/categories/system-component-input-sources.png` | `apps/overview/language-support.png` |
| Ressources | Moniteur système | `Yaru/256x256@2x/apps/system-monitor-app.png` | `apps/overview/system-monitor.png` |
| Caractères | Characters | `Yaru/256x256@2x/apps/accessories-character-map.png` ← `org.gnome.Characters.png` | `apps/overview/characters.png` |
| Terminal | Ptyxis | `Yaru/256x256@2x/apps/terminal-app2.png` ← `org.gnome.Ptyxis.png` | `apps/overview/terminal.png` |
| Utilitaires | Dossier catégorie | `Yaru/256x256@2x/categories/applications-accessories.png` | `apps/overview/folder-utilities.png` |
| Système | Dossier catégorie | `Yaru/256x256@2x/categories/system-component-application.png` | `apps/overview/folder-system.png` |

### Centre de sécurité

L’icône bouclier orange + cadenas n’est **pas** dans le dépôt Yaru extrait : elle est fournie par le snap **desktop-security-center** (`Icon=…/desktop-security-center.png`). Source versionnée : dépôt GitHub Canonical (voir lien dans `UI-FIDELITE.txt`).

Candidats Yaru **incorrects** pour cette tuile (à ne pas utiliser) : `livepatch.png`, `app-center.png`, `passwords-app.png`, `jockey.png`.

### Symlinks à éviter (copie directe = PNG invalide)

| Symlink | Cible réelle |
|---------|----------------|
| `org.gnome.Nautilus.png` | `filemanager-app.png` |
| `org.gnome.Calculator.png` | `calculator-app.png` |
| `org.gnome.Settings.png` | `system-settings.png` → `../actions/configure.png` |
| `org.gnome.Ptyxis.png` | `terminal-app2.png` |
| `org.gnome.Characters.png` | `accessories-character-map.png` |
| `org.gnome.clocks.png` | `clock-app.png` |
| `distributor-logo.png` | `start-here.png` |
| `seahorse.png` | `passwords-app.png` |

---

## Alternatives SVG (hicolor, si besoin vectoriel)

| App | SVG |
|-----|-----|
| Fichiers | `hicolor/scalable/apps/org.gnome.Nautilus.svg` |
| Paramètres | `hicolor/scalable/apps/org.gnome.Settings.svg` |
| Horloges | `hicolor/scalable/apps/org.gnome.clocks.svg` |
| Terminal | `hicolor/scalable/apps/org.gnome.Ptyxis.svg` |
| Caractères | `hicolor/scalable/apps/org.gnome.Characters.svg` |

---

## Fichiers (Nautilus) — `naut.png`

Grille principale : PNG Yaru `places/` (96 px HiDPI), pas les SVG Fedora hérités de `elements/nemo/`.

| Dossier affiché | Source Yaru `48x48@2x/places/` | Fichier CapsuleOS |
|-----------------|--------------------------------|-------------------|
| Bureau | `user-desktop.png` | `elements/nemo/places/user-desktop.png` |
| Documents | `folder-documents.png` | `elements/nemo/places/folder-documents.png` |
| Images | `folder-pictures.png` | `elements/nemo/places/folder-pictures.png` |
| Musique | `folder-music.png` | `elements/nemo/places/folder-music.png` |
| Modèles | `folder-templates.png` | `elements/nemo/places/folder-templates.png` |
| Public | `folder-publicshare.png` | `elements/nemo/places/folder-publicshare.png` |
| snap | `folder.png` | `elements/nemo/places/folder.png` |
| Téléchargements | `folder-download.png` | `elements/nemo/places/folder-download.png` |
| Vidéos | `folder-videos.png` | `elements/nemo/places/folder-videos.png` |
| Dossier personnel (racine) | `user-home.png` | `elements/nemo/places/user-home.png` |

Template explorateur : `shared/apps/nemo-gnome.html` (sidebar GNOME : Dossier personnel, Récents, Favoris, Réseau, Corbeille + XDG).

---

*Généré pour la fidélité Ubuntu 25.10 / GNOME — voir aussi `UI-FIDELITE.txt`.*
