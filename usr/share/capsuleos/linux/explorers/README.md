# Explorateurs Linux — gabarits communs

Contenu canonique des gestionnaires de fichiers simulés, partagé entre toutes les distributions.

| Famille bureau | Template(s) `CAPSULE_EXPLORER_TEMPLATE` | Gabarit HTML | CSS de base |
|----------------|----------------------------------------|--------------|-------------|
| **Nemo** (Cinnamon) | `nemo` | `nemo/shell.html` | `nemo/base.css` |
| **Dolphin** (KDE) | `dolphin` | `dolphin/shell.html` | `nemo/base.css` + `dolphin/base.css` |
| **Nautilus** (GNOME / COSMIC) | `nautilus`, `nemo-gnome` | `nautilus/shell-gnome.html` (split GNOME 45+ : sidebar « Emplacements » + headerbar contenu) + `header-gnome.css` | `nemo/base.css` + `nautilus/header-gnome.css` |
| **Nautilus** (legacy / réf.) | — | `nautilus/shell.html` (menubar Nemo, non utilisé par `nemo-gnome`) | `nemo/base.css` |
| **COSMIC Files** | `nemo-cosmic`, `nautilus-cosmic` | `nautilus/shell-cosmic.html` | `nemo/base.css` |

## Fichiers utilisateur

Tous les explorateurs lisent le même système de fichiers simulé : **`home/public/`** (manifeste `.capsule-manifest.json`).

## Logique JS (noyau)

- `usr/lib/capsuleos/shells/linux/explorers/explorer-registry.js` — registre des profils
- `usr/lib/capsuleos/shells/linux/explorers/commons/explorer-home.js` — racine + manifeste
- `usr/lib/capsuleos/shells/linux/explorers/explorer-runtime.js` — initialisation du slot
- `usr/lib/capsuleos/shells/linux/fileExplorer/*` — navigation, rendu, extensions Dolphin

## Configuration skin

```html
<script src="../../../usr/lib/capsuleos/common/user-home.js"></script>
<script src="../../../usr/lib/capsuleos/shells/linux/explorers/explorer-registry.js"></script>
<script src="../../../usr/lib/capsuleos/shells/linux/explorers/commons/explorer-home.js"></script>
<script>
  window.CAPSULE_CONTENT_ROOT = CapsuleUserHome.fromRepoDepth(3);
  window.CAPSULE_EXPLORER_TEMPLATE = 'dolphin'; /* ou nemo, nemo-gnome, nemo-cosmic */
  window.CAPSULE_EXPLORER_SKIN_KEY = 'dolphin';
  window.CAPSULE_EXPLORER_DISPLAY_NAME = 'Dolphin';
</script>
```

Les fichiers sous `usr/share/capsuleos/linux/apps/nemo.html` (etc.) sont **dépréciés** ; ne pas les dupliquer dans les skins.

## Embed offline

Après modification d’un gabarit :

```bash
./root/tools/lab/update-rocky-nautilus.sh   # Rocky : façades pick-os + embed + audit
bash usr/lib/capsuleos/tools/linux/sync-skin-after-home-edit.sh   # après toute modif home/*/index.html
node usr/lib/capsuleos/tools/linux/build-linux-embed.mjs   # inclut explorers/ (nemo-gnome, nautilus, …)
```
