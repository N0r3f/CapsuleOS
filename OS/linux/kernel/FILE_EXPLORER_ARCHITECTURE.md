# Explorateur de fichiers Linux

## État actuel

Le moteur d'exploration de fichiers est désormais nommé conceptuellement `fileExplorer` côté noyau :

- `kernel/js/fileExplorer/` porte la navigation, l'historique, le rendu des dossiers et l'ouverture des fichiers ;
- `kernel/js/nemo/` a été retiré ; les alias publics `Nemo` restent exposés par `fileExplorer*` ;
- `shared/apps/nemo.html` reste le gabarit partagé du slot historique ;
- `shared/apps/style/nemo.base.css` reste la base visuelle commune ;
- `CAPSULE_EXPLORER_SKIN_KEY` permet de charger une skin locale dont le nom diffère du template (`files.skin.css` pour Ubuntu/Fedora, `nemo.skin.css` pour Mint).

Le nom `Nemo` est maintenant réservé au branding Mint. Fedora et Ubuntu exposent le nom visible `Fichiers` via leur configuration et leurs chaînes.

## Direction cible

À terme, le moteur commun pourra aller plus loin vers :

```text
kernel/js/fileExplorer/
  core navigation, history, manifest, icon resolution

shared/apps/fileExplorer.html
shared/apps/style/fileExplorer.base.css

families/debian/mint/style/apps/nemo.skin.css
families/redhat/fedora/style/apps/files.skin.css
families/suse/opensuse/style/apps/dolphin.skin.css
```

Chaque distribution resterait libre de définir :

- le nom visible de l'application (`Nemo`, `Fichiers`, `Dolphin`) ;
- la structure de toolbar/sidebar si nécessaire ;
- les assets locaux utilisés par sa skin ;
- les tokens CSS et l'habillage.

## Stratégie progressive

Ne pas renommer brutalement les identifiants publics `nemo` tant que Fedora Fichiers vient d'être stabilisé.

La migration recommandée est :

1. garder les IDs/classes actuels comme compatibilité ;
2. ajouter des alias explicites autour de `CAPSULE_EXPLORER_TEMPLATE` ;
3. déplacer les fonctions vers `kernel/js/fileExplorer/` ;
4. conserver temporairement des alias globaux `Nemo` depuis le moteur `fileExplorer` ;
5. réserver enfin le nom `Nemo` au branding Mint.

Cette approche évite de casser Mint tout en respectant le contrat : logique commune, skins spécialisées, assets locaux et fonctionnement offline.

## Contrat de compatibilité actuel

Les identifiants suivants restent stables pour le shell, les missions et le tour guidé :

- `data-link="nemo"` ;
- `id="nemo"` ;
- tâche `open-nemo` ;
- classes DOM `.nemo-app__*` et IDs `#voletnemo`, `#nemoHeaderContainer`, `#nemoMainContainer`, `#nemoFooterContainer`.

Les nouvelles APIs à utiliser sont :

- `initFileExplorerContainer()` ;
- `loadFileExplorerDirectory()` ;
- `navigateToFileExplorerDirectory()` ;
- `bindFileExplorerNavigationControls()` ;
- `applyFileExplorerZoom()` ;
- `getFileExplorerRoot()`.

Les anciens alias restent disponibles pendant la transition :

- `initNemoContainer()` ;
- `loadDirectory()` ;
- `navigateToDirectory()` ;
- `bindNemoNavigationControls()` ;
- `applyNemoZoom()` ;
- `getNemoRoot()`.

## Données et offline

Le manifeste physique reste `shared/content/Dossier_personnel/nemo-manifest.json` pour éviter une casse large.

En mode embarqué, le build expose désormais :

- `CAPSULE_FILE_EXPLORER_MANIFEST_EMBED` comme globale principale ;
- `CAPSULE_NEMO_MANIFEST_EMBED` comme alias legacy.

Chaque modification de template, skin ou manifeste doit être suivie de :

```bash
node scripts/build-capsule-embed.mjs
```

## Branding par distribution

Chaque distribution peut définir :

- `CAPSULE_EXPLORER_APP_ID` pour le slot technique, actuellement `nemo` ;
- `CAPSULE_EXPLORER_DISPLAY_NAME` pour le nom visible (`Nemo`, `Fichiers`, `Dolphin`) ;
- `CAPSULE_EXPLORER_TEMPLATE` pour le gabarit (`nemo` ou `dolphin`) ;
- `CAPSULE_EXPLORER_SKIN_KEY` pour la surcouche CSS locale (`nemo`, `files`, `dolphin`) ;
- `explorer.windowTitle` dans `content/strings.json` pour le titre de fenêtre.

`CAPSULE_EXPLORER_TEMPLATE` choisit la structure HTML et le `.base.css`. `CAPSULE_EXPLORER_SKIN_KEY` choisit uniquement le fichier `families/.../<distro>/style/apps/<skin>.skin.css`. Si la clé de skin est absente ou introuvable, le chargeur revient au skin du template.

La suppression des alias `Nemo` ne doit être faite qu'après une passe de validation visuelle sur Mint, Ubuntu, Fedora et le mode `file://`.
