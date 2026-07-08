# Assets système CapsuleOS

Ressources **noyau** (icônes, illustrations chrome, branding toolkit) — distinctes de `home/public/` (contenu utilisateur simulé).

## Arborescence

```
assets/
├── manifest.json          # registre packs + préfixes logiques
├── images/
│   ├── common/            # fallback neutre
│   ├── toolkits/          # cinnamon, gnome, kde, cosmic, xfce, windows, macos-aqua…
│   ├── vendors/           # mint, ubuntu, fedora, debian, opensuse…
│   └── platforms/         # linux, windows, macos, android, ios, bsd…
└── icons/
    ├── common/
    ├── kde/               # actif — voir aussi usr/share/capsuleos/linux/icons/kde/
    ├── gnome/
    ├── windows/
    ├── macos/
    └── android/
```

## Résolution runtime

| Préfixe logique | Variable globale | Portée |
|----------------|------------------|--------|
| `./media/` | `CAPSULE_MEDIA_BASE` | Skin local |
| `./assets/` | `CAPSULE_ASSETS_BASE` | Noyau |
| `./icons/kde/` | `CAPSULE_KDE_ICONS_BASE` | Pack KDE |

Implémentation : `usr/lib/capsuleos/shells/linux/capsule-resource-url.js` (extension prévue : `CapsuleResource.resolve()`).

## Migration progressive

1. **Phase A** — KDE : consolider sous `assets/icons/kde/` (symlink ou move depuis `linux/icons/kde/`).
2. **Phase B** — GNOME/Cinnamon : packs `toolkits/gnome`, `toolkits/cinnamon`.
3. **Phase C** — Windows/macOS/Android : packs platform + toolkit.

## Licence

Uniquement assets **FOSS** ou créations originales CapsuleOS. Documenter la provenance dans `manifest.json` → `packs.*.license`.

## Références

- [manifeste-noyau.md](../../../root/docs/manifeste-noyau.md)
- [repertoire-os.md](../../../root/docs/repertoire-os.md)
- [etc/capsuleos/os-registry.json](../../../etc/capsuleos/os-registry.json)
