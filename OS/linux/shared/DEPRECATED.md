Ce répertoire est déprécié.

Les gabarits apps et contenus Linux canoniques sont sous :

- `usr/share/capsuleos/linux/apps/`
- `usr/share/capsuleos/linux/content/`
- `usr/share/capsuleos/linux/explorers/`

L'embed offline est généré par :

`node usr/lib/capsuleos/tools/linux/build-linux-embed.mjs`

→ `var/lib/capsuleos/generated/capsule-app-embed.js`

Purge legacy : `node usr/lib/capsuleos/tools/purge-repo-hygiene.mjs`
