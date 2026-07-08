/**
 * Profils skin CapsuleOS (généré).
 * Source : etc/capsuleos/profiles/*.json
 * Regénérer : node usr/lib/capsuleos/tools/build-skin-profiles.mjs
 */
window.CAPSULE_SKIN_PROFILES = {
  "alma": {
    "id": "linux-alma",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "rhel",
    "vendor": "alma",
    "displayName": "AlmaLinux (GNOME)",
    "bodyId": "alma",
    "embedKey": "alma",
    "tier": "P3",
    "status": "active",
    "fidelityLevel": 3,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:rhel/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/redhat/alma/index.html",
      "skin": "home/RedHat/Alma/index.html"
    },
    "toolkit": {
      "id": "gnome",
      "shell": "gnome"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/alma",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "alma",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/redhat/alma/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "alma",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "alma-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.fedora-desktop-area",
          "desktopSelector": "object#desktop",
          "footerSelector": "header.fedora-top-bar, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "anduinos": {
    "id": "linux-anduinos",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "anduin",
    "displayName": "AnduinOS",
    "bodyId": "anduinos",
    "embedKey": "anduinos",
    "tier": "P3",
    "status": "active",
    "fidelityLevel": 2,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/debian/anduinos/index.html",
      "skin": "home/Debian/AnduinOS/index.html"
    },
    "toolkit": {
      "id": "gnome",
      "shell": "anduin"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/anduin",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "anduinos",
      "CAPSULE_MAIN_MENU_TEMPLATE": "mainMenu-gnome",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/anduinos/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.anduin-workspace",
          "desktopSelector": "#desktop",
          "footerSelector": "footer.anduin-taskbar",
          "subtractFooter": true
        }
      }
    }
  },
  "debian-kde": {
    "id": "linux-debian-kde",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "debian",
    "vendor": "debian",
    "displayName": "Debian KDE (Plasma)",
    "bodyId": "debian-kde",
    "embedKey": "debiankde",
    "tier": "P2",
    "status": "planned",
    "fidelityLevel": 4,
    "upstreamId": null,
    "clusterIds": [
      "explorer.dolphin.kde",
      "toolkit.kde"
    ],
    "extends": "kernel:linux/branch:debian/toolkit:kde",
    "paths": {
      "facade": "OS/linux/families/debian/debian-kde/index.html",
      "skin": "home/Debian/Debian-KDE/index.html"
    },
    "toolkit": {
      "id": "kde",
      "shell": "plasma"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/kde",
      "vendorPack": "vendors/debian",
      "iconPacks": [
        "icons/kde"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Dolphin",
      "CAPSULE_EXPLORER_TEMPLATE": "dolphin",
      "CAPSULE_EMBED_SKIN_KEY": "debiankde",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/debian-kde/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "kde",
        "explorerTemplate": "dolphin",
        "dragMode": "window-header"
      },
      "CAPSULE_EXPLORER_APP_ID": "dolphin",
      "CAPSULE_EXPLORER_SKIN_KEY": "dolphin",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_kde_neon.html",
        "themes": "../../../usr/share/capsuleos/linux/apps/systemsettings_kde_neon.html",
        "spectacle": "../../../usr/share/capsuleos/linux/apps/spectacle_kde_neon.html",
        "kinfocenter": "../../../usr/share/capsuleos/linux/apps/kinfocenter_kde_neon.html",
        "kdeconnect": "../../../usr/share/capsuleos/linux/apps/kdeconnect_kde_neon.html"
      }
    }
  },
  "elementary": {
    "id": "linux-elementary",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "elementary",
    "displayName": "elementary OS",
    "bodyId": "elementary",
    "embedKey": "elementary",
    "tier": "P4",
    "status": "planned",
    "fidelityLevel": 0,
    "upstreamId": "linux-ubuntu",
    "clusterIds": [
      "toolkit.pantheon"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:pantheon",
    "paths": {
      "facade": "OS/linux/families/debian/elementary/index.html",
      "skin": "home/Debian/Elementary/index.html"
    },
    "toolkit": {
      "id": "pantheon",
      "shell": "pantheon"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/pantheon",
      "vendorPack": "vendors/elementary",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "elementary",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/elementary/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian"
    }
  },
  "fedora": {
    "id": "linux-fedora",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "fedora",
    "vendor": "fedora",
    "displayName": "Fedora Workstation",
    "bodyId": "fedora",
    "embedKey": "fedora",
    "tier": "P1",
    "status": "active",
    "fidelityLevel": 3,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:fedora/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/redhat/fedora/index.html",
      "skin": "home/RedHat/Fedora/index.html"
    },
    "defaultTheme": "light",
    "toolkit": {
      "id": "gnome",
      "shell": "gnome"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/fedora",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "fedora",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/redhat/fedora/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "fedora",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "fedora-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.fedora-desktop-area",
          "desktopSelector": "object#desktop",
          "footerSelector": "header.fedora-top-bar, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "kali": {
    "id": "linux-kali",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "kali",
    "vendor": "kali",
    "displayName": "Kali Linux",
    "bodyId": "kali",
    "embedKey": "kali",
    "tier": "P4",
    "status": "planned",
    "fidelityLevel": 0,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "toolkit.xfce"
    ],
    "extends": "kernel:linux/branch:kali/toolkit:xfce",
    "paths": {
      "facade": "OS/linux/families/debian/kali/index.html",
      "skin": "home/Debian/Kali/index.html"
    },
    "toolkit": {
      "id": "xfce",
      "shell": "xfce"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/xfce",
      "vendorPack": "vendors/kali",
      "iconPacks": [
        "icons/cinnamon"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Thunar",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo",
      "CAPSULE_EMBED_SKIN_KEY": "kali",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/kali/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian"
    }
  },
  "kde-neon": {
    "id": "linux-kde-neon",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "neon",
    "displayName": "KDE neon User Edition",
    "bodyId": "kde-neon",
    "embedKey": "kde-neon",
    "tier": "P1",
    "status": "active",
    "fidelityLevel": 4,
    "upstreamId": "linux-debian-kde",
    "clusterIds": [
      "explorer.dolphin.kde",
      "toolkit.kde"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:kde",
    "paths": {
      "facade": "OS/linux/families/debian/kde-neon/index.html",
      "skin": "home/Debian/KDE-Neon/index.html"
    },
    "toolkit": {
      "id": "kde",
      "shell": "plasma"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/kde",
      "vendorPack": "vendors/neon",
      "iconPacks": [
        "icons/kde"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Dolphin",
      "CAPSULE_EXPLORER_TEMPLATE": "dolphin",
      "CAPSULE_EMBED_SKIN_KEY": "kde-neon",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/kde-neon/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "kde",
        "explorerTemplate": "dolphin",
        "dragMode": "window-header"
      },
      "CAPSULE_EXPLORER_APP_ID": "dolphin",
      "CAPSULE_EXPLORER_SKIN_KEY": "dolphin",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "kde-neon-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_kde_neon.html",
        "themes": "../../../usr/share/capsuleos/linux/apps/systemsettings_kde_neon.html",
        "spectacle": "../../../usr/share/capsuleos/linux/apps/spectacle_kde_neon.html",
        "kinfocenter": "../../../usr/share/capsuleos/linux/apps/kinfocenter_kde_neon.html",
        "kdeconnect": "../../../usr/share/capsuleos/linux/apps/kdeconnect_kde_neon.html",
        "visionneur_pdf": "../../../usr/share/capsuleos/linux/apps/okular_kde_neon.html",
        "visionneur_images": "../../../usr/share/capsuleos/linux/apps/gwenview_kde_neon.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": true,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "object#desktop, #desktop",
          "desktopSelector": "object#desktop, #desktop",
          "footerSelector": "footer, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "lxqt": {
    "id": "linux-lxqt",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "debian",
    "vendor": "generic",
    "displayName": "LXQt (générique)",
    "bodyId": "lxqt",
    "embedKey": "lxqt",
    "tier": "P4",
    "status": "planned",
    "fidelityLevel": 0,
    "upstreamId": "linux-debian-kde",
    "clusterIds": [
      "toolkit.lxqt"
    ],
    "extends": "kernel:linux/branch:debian/toolkit:lxqt",
    "paths": {
      "facade": "OS/linux/families/debian/lxqt/index.html",
      "skin": "home/Debian/LXQt/index.html"
    },
    "toolkit": {
      "id": "lxqt",
      "shell": "lxqt"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/lxqt",
      "vendorPack": "vendors/generic",
      "iconPacks": [
        "icons/cinnamon"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "PCManFM-Qt",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo",
      "CAPSULE_EMBED_SKIN_KEY": "lxqt",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/lxqt/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian"
    }
  },
  "mint": {
    "id": "linux-mint",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "mint",
    "vendor": "mint",
    "displayName": "Linux Mint (Cinnamon)",
    "bodyId": "mint",
    "embedKey": "mint",
    "tier": "P0",
    "status": "active",
    "fidelityLevel": 4,
    "upstreamId": null,
    "clusterIds": [
      "explorer.nemo.cinnamon",
      "toolkit.cinnamon"
    ],
    "extends": "kernel:linux/branch:mint/toolkit:cinnamon",
    "paths": {
      "facade": "OS/linux/families/debian/mint/index.html",
      "skin": "home/Debian/Mint/index.html"
    },
    "toolkit": {
      "id": "cinnamon",
      "shell": "cinnamon"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/cinnamon",
      "vendorPack": "vendors/mint",
      "iconPacks": [
        "icons/cinnamon"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Nemo",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo",
      "CAPSULE_EMBED_SKIN_KEY": "mint",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/mint/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "cinnamon",
        "explorerTemplate": "nemo",
        "dragMode": "unified-titlebar"
      },
      "CAPSULE_CHECKLIST_STORAGE_KEY": "mint-checklist",
      "CAPSULE_SLOT_LOAD_TIERED": true,
      "CAPSULE_SLOT_LOAD_BATCH": 4,
      "CAPSULE_SLOT_LOAD_PRIORITY": [
        "mainMenu",
        "nemo",
        "firefox",
        "terminal",
        "themes",
        "update_manager",
        "mintinstall",
        "profile",
        "text_editor",
        "calculator",
        "visionneur_images",
        "visionneur_pdf",
        "lecteur_multimedia",
        "file_roller"
      ],
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/cinnamon_settings.html",
        "visionneur_images": "../../../usr/share/capsuleos/linux/apps/visionneur_images_pix.html",
        "visionneur_pdf": "../../../usr/share/capsuleos/linux/apps/visionneur_pdf_xreader.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": true,
        "headerLayout": "capsule",
        "edgeTiling": true,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "object#desktop, #desktop",
          "desktopSelector": "object#desktop, #desktop",
          "footerSelector": "footer, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "mx-kde": {
    "id": "linux-mx-kde",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "debian",
    "vendor": "mx",
    "displayName": "MX Linux KDE",
    "bodyId": "mx-kde",
    "embedKey": "mxkde",
    "tier": "P1",
    "status": "planned",
    "fidelityLevel": 4,
    "upstreamId": "linux-debian-kde",
    "clusterIds": [
      "explorer.dolphin.kde",
      "toolkit.kde"
    ],
    "extends": "kernel:linux/branch:debian/toolkit:kde",
    "paths": {
      "facade": "OS/linux/families/debian/mx-kde/index.html",
      "skin": "home/Debian/MX-KDE/index.html"
    },
    "toolkit": {
      "id": "kde",
      "shell": "plasma"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/kde",
      "vendorPack": "vendors/mx",
      "iconPacks": [
        "icons/kde"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Dolphin",
      "CAPSULE_EXPLORER_TEMPLATE": "dolphin",
      "CAPSULE_EMBED_SKIN_KEY": "mxkde",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/mx-kde/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "kde",
        "explorerTemplate": "dolphin",
        "dragMode": "window-header"
      },
      "CAPSULE_EXPLORER_APP_ID": "dolphin",
      "CAPSULE_EXPLORER_SKIN_KEY": "dolphin",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "mxkde-checklist",
      "CAPSULE_TERMINAL_USER": "mx-linux",
      "CAPSULE_TERMINAL_HOST": "mx",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_kde_neon.html",
        "themes": "../../../usr/share/capsuleos/linux/apps/systemsettings_kde_neon.html",
        "spectacle": "../../../usr/share/capsuleos/linux/apps/spectacle_kde_neon.html",
        "kinfocenter": "../../../usr/share/capsuleos/linux/apps/kinfocenter_kde_neon.html",
        "kdeconnect": "../../../usr/share/capsuleos/linux/apps/kdeconnect_kde_neon.html"
      }
    }
  },
  "opensuse": {
    "id": "linux-opensuse",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "opensuse",
    "vendor": "opensuse",
    "displayName": "openSUSE Tumbleweed",
    "bodyId": "opensuse",
    "embedKey": "opensuse",
    "tier": "P1",
    "status": "active",
    "fidelityLevel": 4,
    "upstreamId": null,
    "clusterIds": [
      "explorer.dolphin.kde",
      "toolkit.kde"
    ],
    "extends": "kernel:linux/branch:opensuse/toolkit:kde",
    "paths": {
      "facade": "OS/linux/families/suse/opensuse/index.html",
      "skin": "home/SUSE/openSUSE/index.html"
    },
    "toolkit": {
      "id": "kde",
      "shell": "plasma"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/kde",
      "vendorPack": "vendors/opensuse",
      "iconPacks": [
        "icons/kde"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Dolphin",
      "CAPSULE_EXPLORER_TEMPLATE": "dolphin",
      "CAPSULE_EMBED_SKIN_KEY": "opensuse",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/suse/opensuse/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "suse",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "kde",
        "explorerTemplate": "dolphin",
        "dragMode": "window-header"
      },
      "CAPSULE_EXPLORER_APP_ID": "dolphin",
      "CAPSULE_EXPLORER_SKIN_KEY": "dolphin",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_kde_neon.html",
        "themes": "../../../usr/share/capsuleos/linux/apps/systemsettings_kde_neon.html",
        "spectacle": "../../../usr/share/capsuleos/linux/apps/spectacle_kde_neon.html",
        "kinfocenter": "../../../usr/share/capsuleos/linux/apps/kinfocenter_kde_neon.html",
        "kdeconnect": "../../../usr/share/capsuleos/linux/apps/kdeconnect_kde_neon.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": true,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "object#desktop, #desktop",
          "desktopSelector": "object#desktop, #desktop",
          "footerSelector": "footer, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "popos": {
    "id": "linux-popos",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "popos",
    "displayName": "Pop!_OS",
    "bodyId": "popos",
    "embedKey": "popos",
    "tier": "P2",
    "status": "active",
    "fidelityLevel": 2,
    "upstreamId": "linux-ubuntu",
    "clusterIds": [
      "explorer.nemo.cosmic",
      "toolkit.cosmic"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:cosmic",
    "paths": {
      "facade": "OS/linux/families/debian/popos/index.html",
      "skin": "home/Debian/PopOS/index.html"
    },
    "toolkit": {
      "id": "cosmic",
      "shell": "cosmic"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/cosmic",
      "vendorPack": "vendors/popos",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-cosmic",
      "CAPSULE_EMBED_SKIN_KEY": "popos",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/popos/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "cosmic",
        "explorerTemplate": "nemo-cosmic",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_cosmic.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_cosmic.html",
        "lecteur_multimedia": "../../../usr/share/capsuleos/linux/apps/rhythmbox.html"
      }
    }
  },
  "rocky": {
    "id": "linux-rocky",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "rhel",
    "vendor": "rocky",
    "displayName": "Rocky Linux (GNOME)",
    "bodyId": "rocky",
    "embedKey": "rocky",
    "tier": "P1",
    "status": "active",
    "fidelityLevel": 4,
    "upstreamId": null,
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:rhel/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/redhat/rocky/index.html",
      "skin": "home/RedHat/Rocky/index.html"
    },
    "toolkit": {
      "id": "gnome",
      "shell": "gnome"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/rocky",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "rocky",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/redhat/rocky/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "rocky",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "rocky-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.fedora-desktop-area",
          "desktopSelector": "object#desktop",
          "footerSelector": "header.fedora-top-bar, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "ubuntu": {
    "id": "linux-ubuntu",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "ubuntu",
    "displayName": "Ubuntu 26.04 LTS",
    "bodyId": "ubuntu",
    "embedKey": "ubuntu",
    "tier": "P0",
    "status": "active",
    "fidelityLevel": 3,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/debian/ubuntu/index.html",
      "skin": "home/Debian/Ubuntu/index.html"
    },
    "toolkit": {
      "id": "gnome",
      "shell": "gnome"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/ubuntu",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "ubuntu",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/ubuntu/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "ubuntu-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.fedora-desktop-area",
          "desktopSelector": "object#desktop",
          "footerSelector": "header.fedora-top-bar, #tableau",
          "subtractFooter": false
        }
      }
    }
  }
};
window.CAPSULE_SKIN_PROFILES_BY_ID = {
  "linux-alma": {
    "id": "linux-alma",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "rhel",
    "vendor": "alma",
    "displayName": "AlmaLinux (GNOME)",
    "bodyId": "alma",
    "embedKey": "alma",
    "tier": "P3",
    "status": "active",
    "fidelityLevel": 3,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:rhel/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/redhat/alma/index.html",
      "skin": "home/RedHat/Alma/index.html"
    },
    "toolkit": {
      "id": "gnome",
      "shell": "gnome"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/alma",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "alma",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/redhat/alma/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "alma",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "alma-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.fedora-desktop-area",
          "desktopSelector": "object#desktop",
          "footerSelector": "header.fedora-top-bar, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "linux-anduinos": {
    "id": "linux-anduinos",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "anduin",
    "displayName": "AnduinOS",
    "bodyId": "anduinos",
    "embedKey": "anduinos",
    "tier": "P3",
    "status": "active",
    "fidelityLevel": 2,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/debian/anduinos/index.html",
      "skin": "home/Debian/AnduinOS/index.html"
    },
    "toolkit": {
      "id": "gnome",
      "shell": "anduin"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/anduin",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "anduinos",
      "CAPSULE_MAIN_MENU_TEMPLATE": "mainMenu-gnome",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/anduinos/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.anduin-workspace",
          "desktopSelector": "#desktop",
          "footerSelector": "footer.anduin-taskbar",
          "subtractFooter": true
        }
      }
    }
  },
  "linux-debian-kde": {
    "id": "linux-debian-kde",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "debian",
    "vendor": "debian",
    "displayName": "Debian KDE (Plasma)",
    "bodyId": "debian-kde",
    "embedKey": "debiankde",
    "tier": "P2",
    "status": "planned",
    "fidelityLevel": 4,
    "upstreamId": null,
    "clusterIds": [
      "explorer.dolphin.kde",
      "toolkit.kde"
    ],
    "extends": "kernel:linux/branch:debian/toolkit:kde",
    "paths": {
      "facade": "OS/linux/families/debian/debian-kde/index.html",
      "skin": "home/Debian/Debian-KDE/index.html"
    },
    "toolkit": {
      "id": "kde",
      "shell": "plasma"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/kde",
      "vendorPack": "vendors/debian",
      "iconPacks": [
        "icons/kde"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Dolphin",
      "CAPSULE_EXPLORER_TEMPLATE": "dolphin",
      "CAPSULE_EMBED_SKIN_KEY": "debiankde",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/debian-kde/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "kde",
        "explorerTemplate": "dolphin",
        "dragMode": "window-header"
      },
      "CAPSULE_EXPLORER_APP_ID": "dolphin",
      "CAPSULE_EXPLORER_SKIN_KEY": "dolphin",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_kde_neon.html",
        "themes": "../../../usr/share/capsuleos/linux/apps/systemsettings_kde_neon.html",
        "spectacle": "../../../usr/share/capsuleos/linux/apps/spectacle_kde_neon.html",
        "kinfocenter": "../../../usr/share/capsuleos/linux/apps/kinfocenter_kde_neon.html",
        "kdeconnect": "../../../usr/share/capsuleos/linux/apps/kdeconnect_kde_neon.html"
      }
    }
  },
  "linux-elementary": {
    "id": "linux-elementary",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "elementary",
    "displayName": "elementary OS",
    "bodyId": "elementary",
    "embedKey": "elementary",
    "tier": "P4",
    "status": "planned",
    "fidelityLevel": 0,
    "upstreamId": "linux-ubuntu",
    "clusterIds": [
      "toolkit.pantheon"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:pantheon",
    "paths": {
      "facade": "OS/linux/families/debian/elementary/index.html",
      "skin": "home/Debian/Elementary/index.html"
    },
    "toolkit": {
      "id": "pantheon",
      "shell": "pantheon"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/pantheon",
      "vendorPack": "vendors/elementary",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "elementary",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/elementary/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian"
    }
  },
  "linux-fedora": {
    "id": "linux-fedora",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "fedora",
    "vendor": "fedora",
    "displayName": "Fedora Workstation",
    "bodyId": "fedora",
    "embedKey": "fedora",
    "tier": "P1",
    "status": "active",
    "fidelityLevel": 3,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:fedora/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/redhat/fedora/index.html",
      "skin": "home/RedHat/Fedora/index.html"
    },
    "defaultTheme": "light",
    "toolkit": {
      "id": "gnome",
      "shell": "gnome"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/fedora",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "fedora",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/redhat/fedora/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "fedora",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "fedora-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.fedora-desktop-area",
          "desktopSelector": "object#desktop",
          "footerSelector": "header.fedora-top-bar, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "linux-kali": {
    "id": "linux-kali",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "kali",
    "vendor": "kali",
    "displayName": "Kali Linux",
    "bodyId": "kali",
    "embedKey": "kali",
    "tier": "P4",
    "status": "planned",
    "fidelityLevel": 0,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "toolkit.xfce"
    ],
    "extends": "kernel:linux/branch:kali/toolkit:xfce",
    "paths": {
      "facade": "OS/linux/families/debian/kali/index.html",
      "skin": "home/Debian/Kali/index.html"
    },
    "toolkit": {
      "id": "xfce",
      "shell": "xfce"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/xfce",
      "vendorPack": "vendors/kali",
      "iconPacks": [
        "icons/cinnamon"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Thunar",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo",
      "CAPSULE_EMBED_SKIN_KEY": "kali",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/kali/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian"
    }
  },
  "linux-kde-neon": {
    "id": "linux-kde-neon",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "neon",
    "displayName": "KDE neon User Edition",
    "bodyId": "kde-neon",
    "embedKey": "kde-neon",
    "tier": "P1",
    "status": "active",
    "fidelityLevel": 4,
    "upstreamId": "linux-debian-kde",
    "clusterIds": [
      "explorer.dolphin.kde",
      "toolkit.kde"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:kde",
    "paths": {
      "facade": "OS/linux/families/debian/kde-neon/index.html",
      "skin": "home/Debian/KDE-Neon/index.html"
    },
    "toolkit": {
      "id": "kde",
      "shell": "plasma"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/kde",
      "vendorPack": "vendors/neon",
      "iconPacks": [
        "icons/kde"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Dolphin",
      "CAPSULE_EXPLORER_TEMPLATE": "dolphin",
      "CAPSULE_EMBED_SKIN_KEY": "kde-neon",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/kde-neon/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "kde",
        "explorerTemplate": "dolphin",
        "dragMode": "window-header"
      },
      "CAPSULE_EXPLORER_APP_ID": "dolphin",
      "CAPSULE_EXPLORER_SKIN_KEY": "dolphin",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "kde-neon-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_kde_neon.html",
        "themes": "../../../usr/share/capsuleos/linux/apps/systemsettings_kde_neon.html",
        "spectacle": "../../../usr/share/capsuleos/linux/apps/spectacle_kde_neon.html",
        "kinfocenter": "../../../usr/share/capsuleos/linux/apps/kinfocenter_kde_neon.html",
        "kdeconnect": "../../../usr/share/capsuleos/linux/apps/kdeconnect_kde_neon.html",
        "visionneur_pdf": "../../../usr/share/capsuleos/linux/apps/okular_kde_neon.html",
        "visionneur_images": "../../../usr/share/capsuleos/linux/apps/gwenview_kde_neon.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": true,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "object#desktop, #desktop",
          "desktopSelector": "object#desktop, #desktop",
          "footerSelector": "footer, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "linux-lxqt": {
    "id": "linux-lxqt",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "debian",
    "vendor": "generic",
    "displayName": "LXQt (générique)",
    "bodyId": "lxqt",
    "embedKey": "lxqt",
    "tier": "P4",
    "status": "planned",
    "fidelityLevel": 0,
    "upstreamId": "linux-debian-kde",
    "clusterIds": [
      "toolkit.lxqt"
    ],
    "extends": "kernel:linux/branch:debian/toolkit:lxqt",
    "paths": {
      "facade": "OS/linux/families/debian/lxqt/index.html",
      "skin": "home/Debian/LXQt/index.html"
    },
    "toolkit": {
      "id": "lxqt",
      "shell": "lxqt"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/lxqt",
      "vendorPack": "vendors/generic",
      "iconPacks": [
        "icons/cinnamon"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "PCManFM-Qt",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo",
      "CAPSULE_EMBED_SKIN_KEY": "lxqt",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/lxqt/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian"
    }
  },
  "linux-mint": {
    "id": "linux-mint",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "mint",
    "vendor": "mint",
    "displayName": "Linux Mint (Cinnamon)",
    "bodyId": "mint",
    "embedKey": "mint",
    "tier": "P0",
    "status": "active",
    "fidelityLevel": 4,
    "upstreamId": null,
    "clusterIds": [
      "explorer.nemo.cinnamon",
      "toolkit.cinnamon"
    ],
    "extends": "kernel:linux/branch:mint/toolkit:cinnamon",
    "paths": {
      "facade": "OS/linux/families/debian/mint/index.html",
      "skin": "home/Debian/Mint/index.html"
    },
    "toolkit": {
      "id": "cinnamon",
      "shell": "cinnamon"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/cinnamon",
      "vendorPack": "vendors/mint",
      "iconPacks": [
        "icons/cinnamon"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Nemo",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo",
      "CAPSULE_EMBED_SKIN_KEY": "mint",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/mint/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "cinnamon",
        "explorerTemplate": "nemo",
        "dragMode": "unified-titlebar"
      },
      "CAPSULE_CHECKLIST_STORAGE_KEY": "mint-checklist",
      "CAPSULE_SLOT_LOAD_TIERED": true,
      "CAPSULE_SLOT_LOAD_BATCH": 4,
      "CAPSULE_SLOT_LOAD_PRIORITY": [
        "mainMenu",
        "nemo",
        "firefox",
        "terminal",
        "themes",
        "update_manager",
        "mintinstall",
        "profile",
        "text_editor",
        "calculator",
        "visionneur_images",
        "visionneur_pdf",
        "lecteur_multimedia",
        "file_roller"
      ],
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/cinnamon_settings.html",
        "visionneur_images": "../../../usr/share/capsuleos/linux/apps/visionneur_images_pix.html",
        "visionneur_pdf": "../../../usr/share/capsuleos/linux/apps/visionneur_pdf_xreader.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": true,
        "headerLayout": "capsule",
        "edgeTiling": true,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "object#desktop, #desktop",
          "desktopSelector": "object#desktop, #desktop",
          "footerSelector": "footer, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "linux-mx-kde": {
    "id": "linux-mx-kde",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "debian",
    "vendor": "mx",
    "displayName": "MX Linux KDE",
    "bodyId": "mx-kde",
    "embedKey": "mxkde",
    "tier": "P1",
    "status": "planned",
    "fidelityLevel": 4,
    "upstreamId": "linux-debian-kde",
    "clusterIds": [
      "explorer.dolphin.kde",
      "toolkit.kde"
    ],
    "extends": "kernel:linux/branch:debian/toolkit:kde",
    "paths": {
      "facade": "OS/linux/families/debian/mx-kde/index.html",
      "skin": "home/Debian/MX-KDE/index.html"
    },
    "toolkit": {
      "id": "kde",
      "shell": "plasma"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/kde",
      "vendorPack": "vendors/mx",
      "iconPacks": [
        "icons/kde"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Dolphin",
      "CAPSULE_EXPLORER_TEMPLATE": "dolphin",
      "CAPSULE_EMBED_SKIN_KEY": "mxkde",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/mx-kde/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "kde",
        "explorerTemplate": "dolphin",
        "dragMode": "window-header"
      },
      "CAPSULE_EXPLORER_APP_ID": "dolphin",
      "CAPSULE_EXPLORER_SKIN_KEY": "dolphin",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "mxkde-checklist",
      "CAPSULE_TERMINAL_USER": "mx-linux",
      "CAPSULE_TERMINAL_HOST": "mx",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_kde_neon.html",
        "themes": "../../../usr/share/capsuleos/linux/apps/systemsettings_kde_neon.html",
        "spectacle": "../../../usr/share/capsuleos/linux/apps/spectacle_kde_neon.html",
        "kinfocenter": "../../../usr/share/capsuleos/linux/apps/kinfocenter_kde_neon.html",
        "kdeconnect": "../../../usr/share/capsuleos/linux/apps/kdeconnect_kde_neon.html"
      }
    }
  },
  "linux-opensuse": {
    "id": "linux-opensuse",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "opensuse",
    "vendor": "opensuse",
    "displayName": "openSUSE Tumbleweed",
    "bodyId": "opensuse",
    "embedKey": "opensuse",
    "tier": "P1",
    "status": "active",
    "fidelityLevel": 4,
    "upstreamId": null,
    "clusterIds": [
      "explorer.dolphin.kde",
      "toolkit.kde"
    ],
    "extends": "kernel:linux/branch:opensuse/toolkit:kde",
    "paths": {
      "facade": "OS/linux/families/suse/opensuse/index.html",
      "skin": "home/SUSE/openSUSE/index.html"
    },
    "toolkit": {
      "id": "kde",
      "shell": "plasma"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/kde",
      "vendorPack": "vendors/opensuse",
      "iconPacks": [
        "icons/kde"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Dolphin",
      "CAPSULE_EXPLORER_TEMPLATE": "dolphin",
      "CAPSULE_EMBED_SKIN_KEY": "opensuse",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/suse/opensuse/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "suse",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "kde",
        "explorerTemplate": "dolphin",
        "dragMode": "window-header"
      },
      "CAPSULE_EXPLORER_APP_ID": "dolphin",
      "CAPSULE_EXPLORER_SKIN_KEY": "dolphin",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_kde_neon.html",
        "themes": "../../../usr/share/capsuleos/linux/apps/systemsettings_kde_neon.html",
        "spectacle": "../../../usr/share/capsuleos/linux/apps/spectacle_kde_neon.html",
        "kinfocenter": "../../../usr/share/capsuleos/linux/apps/kinfocenter_kde_neon.html",
        "kdeconnect": "../../../usr/share/capsuleos/linux/apps/kdeconnect_kde_neon.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": true,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "object#desktop, #desktop",
          "desktopSelector": "object#desktop, #desktop",
          "footerSelector": "footer, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "linux-popos": {
    "id": "linux-popos",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "popos",
    "displayName": "Pop!_OS",
    "bodyId": "popos",
    "embedKey": "popos",
    "tier": "P2",
    "status": "active",
    "fidelityLevel": 2,
    "upstreamId": "linux-ubuntu",
    "clusterIds": [
      "explorer.nemo.cosmic",
      "toolkit.cosmic"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:cosmic",
    "paths": {
      "facade": "OS/linux/families/debian/popos/index.html",
      "skin": "home/Debian/PopOS/index.html"
    },
    "toolkit": {
      "id": "cosmic",
      "shell": "cosmic"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/cosmic",
      "vendorPack": "vendors/popos",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-cosmic",
      "CAPSULE_EMBED_SKIN_KEY": "popos",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/popos/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "cosmic",
        "explorerTemplate": "nemo-cosmic",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_cosmic.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_cosmic.html",
        "lecteur_multimedia": "../../../usr/share/capsuleos/linux/apps/rhythmbox.html"
      }
    }
  },
  "linux-rocky": {
    "id": "linux-rocky",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "rhel",
    "vendor": "rocky",
    "displayName": "Rocky Linux (GNOME)",
    "bodyId": "rocky",
    "embedKey": "rocky",
    "tier": "P1",
    "status": "active",
    "fidelityLevel": 4,
    "upstreamId": null,
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:rhel/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/redhat/rocky/index.html",
      "skin": "home/RedHat/Rocky/index.html"
    },
    "toolkit": {
      "id": "gnome",
      "shell": "gnome"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/rocky",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "rocky",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/redhat/rocky/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "rocky",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "rocky-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.fedora-desktop-area",
          "desktopSelector": "object#desktop",
          "footerSelector": "header.fedora-top-bar, #tableau",
          "subtractFooter": false
        }
      }
    }
  },
  "linux-ubuntu": {
    "id": "linux-ubuntu",
    "version": 2,
    "family": "linux",
    "kernelId": "linux",
    "branchId": "ubuntu",
    "vendor": "ubuntu",
    "displayName": "Ubuntu 26.04 LTS",
    "bodyId": "ubuntu",
    "embedKey": "ubuntu",
    "tier": "P0",
    "status": "active",
    "fidelityLevel": 3,
    "upstreamId": "linux-rocky",
    "clusterIds": [
      "explorer.nautilus.gnome",
      "toolkit.gnome"
    ],
    "extends": "kernel:linux/branch:ubuntu/toolkit:gnome",
    "paths": {
      "facade": "OS/linux/families/debian/ubuntu/index.html",
      "skin": "home/Debian/Ubuntu/index.html"
    },
    "toolkit": {
      "id": "gnome",
      "shell": "gnome"
    },
    "assets": {
      "assetsBase": "../../../usr/share/capsuleos/assets",
      "toolkitPack": "toolkits/gnome",
      "vendorPack": "vendors/ubuntu",
      "iconPacks": [
        "icons/gnome"
      ]
    },
    "capsuleGlobals": {
      "CAPSULE_APPS_BASE": "../../../usr/share/capsuleos/linux/apps",
      "CAPSULE_SKIN_BASE": ".",
      "CAPSULE_STRINGS_URL": "./content/strings.json",
      "CAPSULE_EXPLORER_DISPLAY_NAME": "Fichiers",
      "CAPSULE_EXPLORER_TEMPLATE": "nemo-gnome",
      "CAPSULE_EMBED_SKIN_KEY": "ubuntu",
      "CAPSULE_SITE_HOME": "../../../index.html",
      "CAPSULE_LINUX_HUB": "../../../OS/linux/families/debian/ubuntu/index.html",
      "CAPSULE_TERMINAL_OS_FAMILY": "linux",
      "CAPSULE_TERMINAL_PROFILE": "debian",
      "CAPSULE_WINDOW_CHROME_CONTEXT": {
        "toolkitId": "gnome",
        "explorerTemplate": "nemo-gnome",
        "dragMode": "app-headerbar-passthrough"
      },
      "CAPSULE_EXPLORER_SKIN_KEY": "nautilus",
      "CAPSULE_CHECKLIST_STORAGE_KEY": "ubuntu-checklist",
      "CAPSULE_TEMPLATE_OVERRIDES": {
        "themes": "../../../usr/share/capsuleos/linux/apps/themes_gnome.html",
        "update_manager": "../../../usr/share/capsuleos/linux/apps/update_manager_gnome.html"
      },
      "CAPSULE_WINDOW_CONTEXT": {
        "family": "linux",
        "draggable": true,
        "resizable": true,
        "forceOnOpen": true,
        "requireHeader": false,
        "headerLayout": "capsule",
        "edgeTiling": false,
        "skipSlots": [
          "mainMenu"
        ],
        "bounds": {
          "mainSelector": "main.fedora-desktop-area",
          "desktopSelector": "object#desktop",
          "footerSelector": "header.fedora-top-bar, #tableau",
          "subtractFooter": false
        }
      }
    }
  }
};
