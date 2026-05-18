# Ressources partagées Linux (`OS/linux/shared`)

## `apps/`

Gabarits HTML des fenêtres simulées et feuilles **`.base.css`** (structure commune). Les noms de fichiers sont des **templates** : `nemo.html`, `dolphin.html`, `firefox.html`, etc.

Le **slot** dans le shell (`data-link="nemo"`) peut charger un autre template via `CAPSULE_EXPLORER_TEMPLATE` (voir [noyau README](../kernel/README.md)).

## `content/`

Arborescence pédagogique unique (`Dossier_personnel`, manifest, PDF, images, médias). Une seule copie pour toutes les distros.

## Textes par distro

Les surcharges optionnelles par skin vivent dans `families/.../<distro>/content/strings.json` (clés plates, ex. `explorer.windowTitle`). Elles sont fusionnées avec [`strings-default.js`](../kernel/js/strings-default.js) par [`capsule-strings.js`](../kernel/js/capsule-strings.js).

Les gabarits HTML peuvent marquer les nœuds remplaçables avec `data-capsule-text="clé"`.

## Relation avec les skins

Les skins sous `families/.../<distro>/` définissent `CAPSULE_APPS_BASE`, `CAPSULE_CONTENT_ROOT`, et chargent les scripts depuis `OS/linux/kernel/js/` — sans dupliquer la logique métier.

**Où régler le visuel** (couleurs, contrastes, icônes) : voir la section *Couches visuelles* du [README noyau](../kernel/README.md) — en résumé : `.base.css` partagé pour les défauts, `style/apps/<app>.skin.css` par distro pour les surcharges ; Fedora Workstation charge `style/imports.css` (dossier **`style/gnome-shell/`** : forks calendrier / volume / chrome fenêtre / a11y + `tokens.css`) puis `gnome-workstation.css`, et des assets sous `families/redhat/fedora/media/`.
