# Référence — Offline & embed

## `build-capsule-embed.mjs`

- Lit `OS/linux/shared/apps/` et styles apps.
- Produit un objet global consommé par le noyau (gabarits HTML + CSS inline ou références selon implémentation actuelle).
- `SKIN_DIRS` : associe `key` (ex. `mxkde`) → répertoire `style/apps` + `strings.json`.

Ajouter une distro :

```javascript
{
    key: 'nouvellecle',
    dir: path.join(ROOT, 'OS/linux/families/.../style/apps'),
    strings: path.join(ROOT, 'OS/linux/families/.../content/strings.json')
}
```

Puis aligner `CAPSULE_EMBED_SKIN_KEY` dans `index.html` de la distro.

## Manifest explorateur

`OS/linux/shared/content/Dossier_personnel/nemo-manifest.json` — regénéré dans l'embed ; relancer build si arborescence simulée change.

## Checklist CONTRACT (extrait)

- [ ] Site utilisable hors ligne après chargement (SW + cache)
- [ ] `file://` : embed à jour ; bureau Linux testé sans serveur
- [ ] Pas de dépendance réseau pour l'usage principal

## Commandes

```bash
# Linux
node scripts/build-capsule-embed.mjs

# Android (si besoin)
node scripts/build-android-embed.mjs
```
