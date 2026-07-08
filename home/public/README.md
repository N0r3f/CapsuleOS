# Home utilisateur simulé (`home/public`)

Contenu pédagogique partagé entre Linux (Nemo/Nautilus/Dolphin), Windows (explorateur) et macOS (Finder).

| Fichier | Rôle |
|---------|------|
| `.capsule-manifest.json` | Arborescence explorateur Linux / Windows |
| `.capsule-finder-manifest.json` | Arborescence Finder macOS |

Régénérer les manifestes après ajout de fichiers ou dossiers :

```bash
node usr/lib/capsuleos/tools/generate-public-manifest.mjs
node usr/lib/capsuleos/tools/linux/build-linux-embed.mjs
```

Chemin logique UI : `/home/public` — voir `usr/lib/capsuleos/common/user-home.js`.
