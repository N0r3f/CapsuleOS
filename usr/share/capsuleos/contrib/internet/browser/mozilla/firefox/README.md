# Pack contrib — Firefox (Mozilla)

Pack de métadonnées pour le slot `firefox`. Le gabarit et le kernel restent sous `usr/share/capsuleos/linux/apps/` et `usr/lib/capsuleos/shells/linux/`.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `manifest.json` | Id pack, `slotId`, licence |
| `search-engine.json` | Moteur par défaut (SERP locale) |
| `bookmarks.default.json` | Favoris initiaux |
| `newtab-shortcuts.json` | Tuiles nouvel onglet → `siteId` |

## Gates

```bash
node usr/lib/capsuleos/tools/validate-contrib-packages.mjs
node usr/lib/capsuleos/tools/validate-simulated-web.mjs
node usr/lib/capsuleos/tools/validate-firefox-user-scenarios.mjs
```

## PR contributeur

- Nouveau site : [`root/docs/templates/contrib-pr-nouveau-site-web.md`](../../../../../../../root/docs/templates/contrib-pr-nouveau-site-web.md)
- Favori / raccourci : [`root/docs/templates/contrib-pr-favori-firefox.md`](../../../../../../../root/docs/templates/contrib-pr-favori-firefox.md)

Voir [`root/docs/convention-contrib-apps.md`](../../../../../../../root/docs/convention-contrib-apps.md).
