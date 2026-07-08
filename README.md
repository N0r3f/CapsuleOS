# CapsuleOS — export applicatif

Dépôt **miroir** du code exécutable CapsuleOS (HTML / CSS / JS / JSON + assets).

Le dépôt de travail complet (docs, lab, pipeline VM) reste sur le serveur Git #TEAM.
Ce dépôt peut être poussé sur **GitHub** sans les hooks du monorepo principal.

## Lancer en local

```bash
npm run dev
# → http://127.0.0.1:2929
```

Ou tout serveur statique à la racine (`index.html`).

## Synchroniser depuis le monorepo #TEAM

```bash
# Dans CapsuleOS (dépôt principal)
node usr/lib/capsuleos/tools/export-github-repo.mjs
```

Voir `etc/capsuleos/contracts/github-export.json` dans le monorepo pour la liste des chemins exportés.
