# Cluster toolkit GNOME

Point d’entrée chrome Adwaita / Mutter pour les skins Linux GNOME.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `chrome.css` | Import shell + window-chrome GNOME |
| `variables.css` | Tokens cluster partagés |
| `pack.json` | Manifeste toolkit (référence Rocky, providers, ancres CSD, pipelines sync) |

## Sync automatique

Depuis la racine du dépôt :

```bash
node usr/lib/capsuleos/tools/linux/sync-gnome-toolkit-pack.mjs
```

Orchestre les pipelines déclarées dans `pack.json` :

1. Nautilus (`sync-gnome-nautilus-skin.mjs`)
2. Coque workstation (`sync-gnome-workstation-skin.mjs`)
3. Utilitaires libadwaita (`sync-gnome-utility-app-skins.mjs`)
4. Skins apps étendus (profile, firefox, terminal, etc.)

Référence canonique : `home/RedHat/Rocky/`.

## Validation

```bash
node usr/lib/capsuleos/tools/validate-gnome-toolkit-pack.mjs
```

Vérifie l’existence des ressources du pack, le lien `cluster-registry.json` et la fraîcheur des skins dérivés.
