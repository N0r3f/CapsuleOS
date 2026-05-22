# Template livrable — reproduction visuelle

## Analyse (à remplir)

| Élément | Observation | Variable / calc proposé |
|---------|-------------|-------------------------|
| Barre hauteur | ex. 48px | `height: var(--head)` ou `calc(var(--head) * 1.1)` |
| Fond bureau | #… | `--desktop-bg` existante ou nouvelle |
| Rayon fenêtre | … | `--win-radius` |
| Ombre panel | … | `box-shadow` via variables ombre |

## Fichiers modifiés

```
OS/linux/families/<famille>/<distro>/
├── index.html              # si structure tray/desktop change
├── style/style.css         # rare — préférer skin
├── style/apps/
│   ├── mainMenu.skin.css
│   ├── nemo.skin.css       # ou dolphin / nautilus
│   └── …
└── media/img/…             # nouvelles icônes si besoin
```

## Extrait CSS type (ordre contrat)

```css
/* mainMenu.skin.css — exemple structure */
#mainMenu.windowElement {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: calc(var(--menu-width));
    height: auto;
    margin: 0;
    padding: calc(var(--head) / 4);
    border: 1px solid var(--menu-border);
    font: var(--font-base);
    color: var(--menu-fg);
    background: var(--menu-bg);
    transform: none;
    animation: none;
    transition: opacity 0.15s ease;
    overflow: hidden;
    z-index: 9000;
}
```

## Checklist avant handoff

- [ ] Aucune valeur px orpheline remplaçable par `var` / `calc`
- [ ] Pas de style inline ajouté au HTML
- [ ] `build-capsule-embed.mjs` relancé si gabarits apps modifiés
- [ ] Hub / index distro testé en navigateur
