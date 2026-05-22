# Référence — CSS CapsuleOS (Linux)

## Fichiers types

| Emplacement | Rôle |
|-------------|------|
| `OS/linux/kernel/style/variables-linux.css` | Tokens communs Linux |
| `OS/linux/kernel/style/*.css` | Composants noyau (fenêtre, menu, …) |
| `OS/linux/shared/apps/style/*.base.css` | Apps mutualisées |
| `OS/linux/families/<famille>/<distro>/style/style.css` | Entrée skin |
| `OS/linux/families/.../style/imports.css` | Agrégation feuilles |
| `OS/linux/families/.../style/apps/*.skin.css` | Surcharges par app |
| `style/variables.css` | Shell / site hors bureau Linux |

## Chaîne d'import type (skin)

```
style.css → imports.css → kernel + apps.base + *.skin.css
```

## Variables fréquentes (indicatif)

Consulter les fichiers sources pour la liste à jour : `--head`, `--font-base`, couleurs panel/desktop, rayons, ombres. Ne pas inventer de doublons (`--panel-bg` vs nouvelle `--mx-panel-bg` identique).

## Checklist rapide avant commit CSS

- [ ] Ordre des propriétés respecté sur les sélecteurs touchés
- [ ] Pas de px fixes si une variable + `calc()` suffit
- [ ] Pas de règle dupliquée ailleurs dans le dépôt
- [ ] Skin dérivée sans `media/` : variables `CAPSULE_MEDIA_BASE` côté HTML, pas de chemins cassés en CSS
