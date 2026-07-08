# Rocky Linux (GNOME) — skin canonique

> **Référence toolkit GNOME** pour la branche Red Hat. Documentation : [`root/docs/branche-redhat-gnome.md`](../../../root/docs/branche-redhat-gnome.md) · Procédure lab : [`procedure-lab-linux-rocky-gnome.md`](../../../root/docs/procedure-lab-linux-rocky-gnome.md).

**Éditer uniquement** `home/RedHat/Rocky/` (HTML, CSS, JS). L’URL pick-os `OS/linux/families/redhat/rocky/index.html` est une **façade générée** (copie + `<base href>`) : ne pas la modifier à la main.

Après toute modification du skin (CSS/HTML) **ou** des scripts fenêtre (`windowContainer.js`, `capsule-window-shell.js`) :

```bash
./root/tools/lab/update-rocky-nautilus.sh
# ou, pour tous les skins Linux :
node usr/lib/capsuleos/tools/linux/sync-linux-skin-closure.mjs
node usr/lib/capsuleos/tools/linux/validate-linux-facades.mjs
```

Le header Nautilus réserve une **colonne CSD à droite** (pleine hauteur, boutons fenêtre) via `nautilus.skin.css` — ne pas se contenter d’un `padding-right` sur la headerbar seule.

Puis **rechargement forcé** du navigateur (Ctrl+F5) — le cache Live Server garde souvent les anciens `.js`.

Valider **les deux** entrées (doivent être identiques visuellement) :

- Canonique : `home/RedHat/Rocky/index.html`
- Pick-os : `OS/linux/families/redhat/rocky/index.html`
