/**
 * Manifeste assets CapsuleOS (généré).
 * Source : usr/share/capsuleos/assets/manifest.json
 * Regénérer : node usr/lib/capsuleos/tools/build-assets-manifest.mjs
 */
window.CAPSULE_ASSETS_MANIFEST = {
  "version": 2,
  "updated": "2026-06-02",
  "description": "Registre des packs d'assets système CapsuleOS. Seules zones image autorisées : assets/ + home/public/Images/.",
  "allowedZones": [
    "usr/share/capsuleos/assets/",
    "home/public/Images/"
  ],
  "logicalPrefixes": [
    {
      "prefix": "./media/",
      "resolver": "CAPSULE_TOOLKIT_ASSETS_BASE",
      "scope": "legacy"
    },
    {
      "prefix": "./assets/",
      "resolver": "CAPSULE_ASSETS_BASE",
      "scope": "kernel"
    },
    {
      "prefix": "./icons/kde/",
      "resolver": "CAPSULE_KDE_ICONS_BASE",
      "pack": "icons/kde"
    },
    {
      "prefix": "./icons/cinnamon/",
      "resolver": "CAPSULE_CINNAMON_ICONS_BASE",
      "pack": "icons/cinnamon"
    },
    {
      "prefix": "./icons/gnome/",
      "resolver": "CAPSULE_GNOME_ICONS_BASE",
      "pack": "icons/gnome"
    },
    {
      "prefix": "./icons/common/",
      "resolver": "CAPSULE_ASSETS_BASE",
      "pack": "icons/common"
    }
  ],
  "packs": {
    "icons/kde": {
      "path": "icons/kde",
      "physicalPath": "usr/share/capsuleos/assets/icons/kde",
      "global": "CAPSULE_KDE_ICONS_BASE",
      "fallback": "icons/common",
      "license": "FOSS — Breeze / Papirus",
      "status": "active"
    },
    "icons/cinnamon": {
      "path": "icons/cinnamon",
      "global": "CAPSULE_CINNAMON_ICONS_BASE",
      "license": "FOSS — Mint-Y / Adwaita",
      "status": "active"
    },
    "icons/gnome": {
      "path": "icons/gnome",
      "global": "CAPSULE_GNOME_ICONS_BASE",
      "status": "planned"
    },
    "images/platforms/pick-os": {
      "path": "images/platforms/pick-os",
      "global": "CAPSULE_PICK_OS_ICONS_BASE",
      "status": "active"
    },
    "toolkits/cinnamon": {
      "path": "images/toolkits/cinnamon",
      "status": "active"
    },
    "toolkits/kde": {
      "path": "images/toolkits/kde",
      "status": "active"
    },
    "toolkits/gnome": {
      "path": "images/toolkits/gnome",
      "status": "active"
    },
    "toolkits/cosmic": {
      "path": "images/toolkits/cosmic",
      "status": "active"
    },
    "toolkits/windows": {
      "path": "images/toolkits/windows",
      "status": "active"
    },
    "toolkits/macos-aqua": {
      "path": "images/toolkits/macos-aqua",
      "status": "active"
    },
    "toolkits/android-material": {
      "path": "images/toolkits/android-material",
      "status": "active"
    }
  },
  "rules": [
    "Aucune image hors assets/ ou home/public/Images/ — validate-asset-zones.mjs",
    "Ne pas utiliser ./assets/images/toolkits/cinnamon/ dans le code source",
    "Agents IA : voir .cursor/rules/capsuleos-assets.mdc"
  ]
};
