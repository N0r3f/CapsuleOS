# Icônes systèmes (CapsuleOS)

Répertoire central des logos de distributions et versions, référencé par les hubs (`OS/linux/index.html`, `OS/windows/index.html`), `pick-os.js`, les favicons des skins et l’explorateur Linux.

Les **marques de familles** (cartes d’accueil, liens explorateur « OS ») sont dans `assets/brands/` (`linux.webp`, `windows.webp`, …).

| Dossier | Contenu | Exemples utilisés dans le projet |
|---------|---------|----------------------------------|
| `linux/` | ~900 distros | `mint.png`, `ubuntu.png`, `fedora.png`, `debian.png`, `anduin.png`, `rocky.png` |
| `windows/` | Versions consommateur | `win95.png` … `win11.png`, `vista.png`, `winxp.png` |
| `macos/` | Versions macOS | `sonoma.png` (simulation active) |
| `android/` | Versions Android | `vanillaicecream.png` (fiche Android) |
| `bsd/` | Variantes BSD | `freebsd.png`, `ghostbsd.png` |

Convention de nommage : minuscules, sans espaces (ex. `popos.png`, `winxp.png`).

iOS : pas de dossier dédié pour l’instant — la carte d’accueil utilise `assets/brands/ios.webp` ; la fiche iOS 15 conserve son SVG local.

Les skins Windows sous `OS/windows/versions/<version>/` partagent le noyau `OS/windows/kernel/` et le contenu `OS/windows/shared/`, sur le modèle des familles Linux.
