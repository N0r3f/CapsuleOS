'use strict';
/* Généré par generate-cinnamon-gsettings-bindings.mjs — ne pas éditer à la main */
window.CAPSULE_CINNAMON_GSETTINGS_BINDINGS = {
    "mint-desktop-show-icons": {
        "controlId": "show-desktop-icons",
        "panelId": "desktop",
        "schema": "org.nemo.desktop",
        "key": "show-desktop-icons",
        "map": "boolOnOff",
        "effect": "desktopIconsVisibility",
        "effectArg": null
    },
    "mint-desktop-home-icon": {
        "controlId": "home-icon",
        "panelId": "desktop",
        "schema": "org.nemo.desktop",
        "key": "home-icon-visible",
        "map": "boolOnOff",
        "effect": "desktopIconKind",
        "effectArg": "home"
    },
    "mint-desktop-trash-icon": {
        "controlId": "trash-icon",
        "panelId": "desktop",
        "schema": "org.nemo.desktop",
        "key": "trash-icon-visible",
        "map": "boolOnOff",
        "effect": "desktopIconKind",
        "effectArg": "trash"
    },
    "mint-enable-animations": {
        "controlId": "enable-animations",
        "panelId": "effects",
        "schema": "org.cinnamon.desktop.interface",
        "key": "enable-animations",
        "map": "boolOnOff",
        "effect": "windowAnimations",
        "effectArg": null
    },
    "mint-wm-button-layout": {
        "controlId": "button-layout",
        "panelId": "windows",
        "schema": "org.cinnamon.desktop.wm.preferences",
        "key": "button-layout",
        "map": "buttonLayout",
        "effect": "windowButtonLayout",
        "effectArg": null
    },
    "mint-wm-dblclick-titlebar": {
        "controlId": "action-double-click",
        "panelId": "windows",
        "schema": "org.cinnamon.desktop.wm.preferences",
        "key": "action-double-click-titlebar",
        "map": "wmTitleAction",
        "effect": "wmDoubleClickTitlebar",
        "effectArg": null
    },
    "mint-wm-focus-mode": {
        "controlId": "focus-mode",
        "panelId": "windows",
        "schema": "org.cinnamon.desktop.wm.preferences",
        "key": "focus-mode",
        "map": "passthrough",
        "effect": "wmFocusMode",
        "effectArg": null
    },
    "mint-panel-height": {
        "controlId": "panels-height",
        "panelId": "panel",
        "schema": "org.cinnamon",
        "key": "panels-height",
        "map": "panelsHeight",
        "effect": "panelHeight",
        "effectArg": null
    },
    "mint-panel-autohide": {
        "controlId": "panels-autohide",
        "panelId": "panel",
        "schema": "org.cinnamon",
        "key": "panels-autohide",
        "map": "panelsAutohide",
        "effect": "panelAutohide",
        "effectArg": null
    },
    "mint-dynamic-workspaces": {
        "controlId": "dynamic-workspaces",
        "panelId": "workspaces",
        "schema": "org.cinnamon.muffin",
        "key": "dynamic-workspaces",
        "map": "boolOnOff",
        "effect": "dynamicWorkspaces",
        "effectArg": null
    },
    "mint-number-workspaces": {
        "controlId": "number-workspaces",
        "panelId": "workspaces",
        "schema": "org.cinnamon",
        "key": "number-workspaces",
        "map": "uint32",
        "effect": "numberWorkspaces",
        "effectArg": null
    },
    "mint-screensaver-idle": {
        "controlId": "idle-activation",
        "panelId": "screensaver",
        "schema": "org.cinnamon.desktop.screensaver",
        "key": "idle-activation-enabled",
        "map": "boolOnOff",
        "effect": "screensaverIdle",
        "effectArg": null
    },
    "mint-screensaver-lock-delay": {
        "controlId": "lock-delay",
        "panelId": "screensaver",
        "schema": "org.cinnamon.desktop.screensaver",
        "key": "lock-delay",
        "map": "uint32",
        "effect": "screensaverLockDelay",
        "effectArg": null
    },
    "mint-unredirect-fullscreen": {
        "controlId": "unredirect-fullscreen",
        "panelId": "general",
        "schema": "org.cinnamon.muffin",
        "key": "unredirect-fullscreen-windows",
        "map": "boolOnOff",
        "effect": "unredirectFullscreen",
        "effectArg": null
    },
    "mint-notifications-enabled": {
        "controlId": "display-notifications",
        "panelId": "notifications",
        "schema": "org.cinnamon.desktop.notifications",
        "key": "display-notifications",
        "map": "boolOnOff",
        "effect": "notificationsEnabled",
        "effectArg": null
    },
    "mint-event-sounds": {
        "controlId": "event-sounds",
        "panelId": "sound",
        "schema": "org.cinnamon.sounds",
        "key": "enabled",
        "map": "boolOnOff",
        "effect": "eventSounds",
        "effectArg": null
    },
    "mint-a11y-high-contrast": {
        "controlId": "high-contrast",
        "panelId": "accessibility",
        "schema": "org.gnome.desktop.a11y.interface",
        "key": "high-contrast",
        "map": "boolOnOff",
        "effect": "a11yHighContrast",
        "effectArg": null
    },
    "mint-a11y-large-text": {
        "controlId": "large-text",
        "panelId": "accessibility",
        "schema": "org.cinnamon.desktop.interface",
        "key": "text-scaling-factor",
        "map": "textScalingLarge",
        "effect": "a11yLargeText",
        "effectArg": null
    },
    "mint-hotcorner-0-enabled": {
        "controlId": "hotcorner-tl-enable",
        "panelId": "hotcorner",
        "schema": "org.cinnamon",
        "key": "hotcorner-layout",
        "map": "hotcornerEnable",
        "effect": "hotcornerLayout",
        "effectArg": "0"
    },
    "mint-hotcorner-0-action": {
        "controlId": "hotcorner-tl-action",
        "panelId": "hotcorner",
        "schema": "org.cinnamon",
        "key": "hotcorner-layout",
        "map": "hotcornerAction",
        "effect": "hotcornerLayout",
        "effectArg": "0"
    },
    "mint-hotcorner-1-enabled": {
        "controlId": "hotcorner-tr-enable",
        "panelId": "hotcorner",
        "schema": "org.cinnamon",
        "key": "hotcorner-layout",
        "map": "hotcornerEnable",
        "effect": "hotcornerLayout",
        "effectArg": "1"
    },
    "mint-hotcorner-1-action": {
        "controlId": "hotcorner-tr-action",
        "panelId": "hotcorner",
        "schema": "org.cinnamon",
        "key": "hotcorner-layout",
        "map": "hotcornerAction",
        "effect": "hotcornerLayout",
        "effectArg": "1"
    },
    "mint-hotcorner-2-enabled": {
        "controlId": "hotcorner-bl-enable",
        "panelId": "hotcorner",
        "schema": "org.cinnamon",
        "key": "hotcorner-layout",
        "map": "hotcornerEnable",
        "effect": "hotcornerLayout",
        "effectArg": "2"
    },
    "mint-hotcorner-2-action": {
        "controlId": "hotcorner-bl-action",
        "panelId": "hotcorner",
        "schema": "org.cinnamon",
        "key": "hotcorner-layout",
        "map": "hotcornerAction",
        "effect": "hotcornerLayout",
        "effectArg": "2"
    },
    "mint-hotcorner-3-enabled": {
        "controlId": "hotcorner-br-enable",
        "panelId": "hotcorner",
        "schema": "org.cinnamon",
        "key": "hotcorner-layout",
        "map": "hotcornerEnable",
        "effect": "hotcornerLayout",
        "effectArg": "3"
    },
    "mint-hotcorner-3-action": {
        "controlId": "hotcorner-br-action",
        "panelId": "hotcorner",
        "schema": "org.cinnamon",
        "key": "hotcorner-layout",
        "map": "hotcornerAction",
        "effect": "hotcornerLayout",
        "effectArg": "3"
    },
    "mint-applet-calendar": {
        "controlId": "applet-calendar",
        "panelId": "applets",
        "schema": "org.cinnamon",
        "key": "enabled-applets",
        "map": "appletEnabled",
        "effect": "appletVisibility",
        "effectArg": "calendar@cinnamon.org"
    },
    "mint-applet-notifications": {
        "controlId": "applet-notifications",
        "panelId": "applets",
        "schema": "org.cinnamon",
        "key": "enabled-applets",
        "map": "appletEnabled",
        "effect": "appletVisibility",
        "effectArg": "notifications@cinnamon.org"
    },
    "mint-applet-cornerbar": {
        "controlId": "applet-cornerbar",
        "panelId": "applets",
        "schema": "org.cinnamon",
        "key": "enabled-applets",
        "map": "appletEnabled",
        "effect": "appletVisibility",
        "effectArg": "cornerbar@cinnamon.org"
    },
    "mint-kbd-repeat": {
        "controlId": "key-repeat",
        "panelId": "keyboard",
        "schema": "org.cinnamon.desktop.peripherals.keyboard",
        "key": "repeat",
        "map": "boolOnOff",
        "effect": "keyboardRepeat",
        "effectArg": null
    },
    "mint-kbd-numlock": {
        "controlId": "numlock-state",
        "panelId": "keyboard",
        "schema": "org.cinnamon.desktop.peripherals.keyboard",
        "key": "numlock-state",
        "map": "boolOnOff",
        "effect": "keyboardNumlock",
        "effectArg": null
    },
    "mint-mouse-left-handed": {
        "controlId": "left-handed",
        "panelId": "mouse",
        "schema": "org.cinnamon.desktop.peripherals.mouse",
        "key": "left-handed",
        "map": "boolOnOff",
        "effect": "mouseLeftHanded",
        "effectArg": null
    },
    "mint-mouse-natural-scroll": {
        "controlId": "natural-scroll",
        "panelId": "mouse",
        "schema": "org.cinnamon.desktop.peripherals.mouse",
        "key": "natural-scroll",
        "map": "boolOnOff",
        "effect": "mouseNaturalScroll",
        "effectArg": null
    },
    "mint-power-sleep-display": {
        "controlId": "sleep-display-ac",
        "panelId": "power",
        "schema": "org.cinnamon.settings-daemon.plugins.power",
        "key": "sleep-display-ac",
        "map": "uint32",
        "effect": "powerSleepDisplay",
        "effectArg": null
    },
    "mint-power-button-action": {
        "controlId": "button-power",
        "panelId": "power",
        "schema": "org.cinnamon.settings-daemon.plugins.power",
        "key": "button-power",
        "map": "passthrough",
        "effect": "powerButtonAction",
        "effectArg": null
    },
    "mint-privacy-remember-recent": {
        "controlId": "remember-recent-files",
        "panelId": "privacy",
        "schema": "org.cinnamon.desktop.privacy",
        "key": "remember-recent-files",
        "map": "boolOnOff",
        "effect": "privacyRememberRecent",
        "effectArg": null
    },
    "mint-privacy-recent-max-age": {
        "controlId": "recent-files-max-age",
        "panelId": "privacy",
        "schema": "org.cinnamon.desktop.privacy",
        "key": "recent-files-max-age",
        "map": "int32",
        "effect": "privacyRecentMaxAge",
        "effectArg": null
    },
    "mint-font-interface": {
        "controlId": "font-name",
        "panelId": "fonts",
        "schema": "org.cinnamon.desktop.interface",
        "key": "font-name",
        "map": "passthrough",
        "effect": "interfaceFont",
        "effectArg": null
    },
    "mint-font-antialiasing": {
        "controlId": "antialiasing",
        "panelId": "fonts",
        "schema": "org.cinnamon.settings-daemon.plugins.xsettings",
        "key": "antialiasing",
        "map": "passthrough",
        "effect": "fontAntialiasing",
        "effectArg": null
    },
    "mint-display-orientation-lock": {
        "controlId": "orientation-lock",
        "panelId": "display",
        "schema": "org.cinnamon.settings-daemon.peripherals.touchscreen",
        "key": "orientation-lock",
        "map": "boolOnOff",
        "effect": "displayOrientationLock",
        "effectArg": null
    },
    "mint-display-fractional-scale": {
        "controlId": "fractional-scale-mode",
        "panelId": "display",
        "schema": "org.cinnamon.muffin.x11",
        "key": "fractional-scale-mode",
        "map": "passthrough",
        "effect": "displayFractionalScale",
        "effectArg": null
    },
    "mint-clock-24h": {
        "controlId": "clock-use-24h",
        "panelId": "calendar",
        "schema": "org.cinnamon.desktop.interface",
        "key": "clock-use-24h",
        "map": "boolOnOff",
        "effect": "clockUse24h",
        "effectArg": null
    },
    "mint-clock-show-date": {
        "controlId": "clock-show-date",
        "panelId": "calendar",
        "schema": "org.cinnamon.desktop.interface",
        "key": "clock-show-date",
        "map": "boolOnOff",
        "effect": "clockShowDate",
        "effectArg": null
    },
    "mint-clock-show-seconds": {
        "controlId": "clock-show-seconds",
        "panelId": "calendar",
        "schema": "org.cinnamon.desktop.interface",
        "key": "clock-show-seconds",
        "map": "boolOnOff",
        "effect": "clockShowSeconds",
        "effectArg": null
    },
    "mint-startup-firefox": {
        "controlId": "startup-firefox",
        "panelId": "startup",
        "schema": "org.cinnamon",
        "key": "startup-applications",
        "map": "startupAppEnabled",
        "effect": "startupApps",
        "effectArg": "firefox.desktop"
    },
    "mint-startup-nemo": {
        "controlId": "startup-nemo",
        "panelId": "startup",
        "schema": "org.cinnamon",
        "key": "startup-applications",
        "map": "startupAppEnabled",
        "effect": "startupApps",
        "effectArg": "nemo.desktop"
    },
    "mint-extension-deskgrid": {
        "controlId": "extension-deskgrid",
        "panelId": "extensions",
        "schema": "org.cinnamon",
        "key": "enabled-extensions",
        "map": "extensionEnabled",
        "effect": "extensionsEnabled",
        "effectArg": "deskgrid@cinnamon.org"
    },
    "mint-default-autorun-never": {
        "controlId": "autorun-never",
        "panelId": "default",
        "schema": "org.cinnamon.desktop.media-handling",
        "key": "autorun-never",
        "map": "boolOnOff",
        "effect": "defaultAutorunNever",
        "effectArg": null
    },
    "mint-default-terminal": {
        "controlId": "default-terminal",
        "panelId": "default",
        "schema": "org.cinnamon.desktop.default-applications.terminal",
        "key": "exec",
        "map": "passthrough",
        "effect": "defaultTerminal",
        "effectArg": null
    },
    "mint-desklet-snap": {
        "controlId": "desklet-snap",
        "panelId": "desklets",
        "schema": "org.cinnamon",
        "key": "desklet-snap",
        "map": "boolOnOff",
        "effect": "deskletSnap",
        "effectArg": null
    },
    "mint-desklet-snap-interval": {
        "controlId": "desklet-snap-interval",
        "panelId": "desklets",
        "schema": "org.cinnamon",
        "key": "desklet-snap-interval",
        "map": "int32",
        "effect": "deskletSnapInterval",
        "effectArg": null
    },
    "mint-desklet-lock": {
        "controlId": "lock-desklets",
        "panelId": "desklets",
        "schema": "org.cinnamon",
        "key": "lock-desklets",
        "map": "boolOnOff",
        "effect": "deskletLock",
        "effectArg": null
    },
    "mint-gestures-enabled": {
        "controlId": "gestures-enabled",
        "panelId": "gestures",
        "schema": "org.cinnamon.gestures",
        "key": "enabled",
        "map": "boolOnOff",
        "effect": "gesturesEnabled",
        "effectArg": null
    },
    "mint-locale-lang": {
        "controlId": "system-locale",
        "panelId": "languages",
        "schema": "org.gnome.system.locale",
        "key": "region",
        "map": "passthrough",
        "effect": "systemLocale",
        "effectArg": null
    },
    "mint-oa-whitelist-all": {
        "controlId": "oa-whitelist-all",
        "panelId": "online-accounts",
        "schema": "org.gnome.online-accounts",
        "key": "whitelisted-providers",
        "map": "oaWhitelistAll",
        "effect": "onlineAccountsWhitelist",
        "effectArg": "all"
    },
    "mint-user-realname": {
        "controlId": "account-realname",
        "panelId": "user",
        "schema": "org.cinnamon",
        "key": "account-realname-sim",
        "map": "passthrough",
        "effect": "userRealname",
        "effectArg": null
    },
    "mint-nemo-actions-enabled": {
        "controlId": "nemo-actions-enabled",
        "panelId": "actions",
        "schema": "org.cinnamon",
        "key": "nemo-actions-parity-sim",
        "map": "boolOnOff",
        "effect": "nemoActionsEnabled",
        "effectArg": null
    },
    "mint-gtk-theme": {
        "controlId": "gtk-theme",
        "panelId": "themes",
        "schema": "org.cinnamon.desktop.interface",
        "key": "gtk-theme",
        "map": "passthrough",
        "effect": "gtkTheme",
        "effectArg": null
    },
    "mint-icon-theme": {
        "controlId": "icon-theme",
        "panelId": "themes",
        "schema": "org.cinnamon.desktop.interface",
        "key": "icon-theme",
        "map": "passthrough",
        "effect": "iconTheme",
        "effectArg": null
    },
    "mint-bg-picture-options": {
        "controlId": "picture-options",
        "panelId": "backgrounds",
        "schema": "org.cinnamon.desktop.background",
        "key": "picture-options",
        "map": "passthrough",
        "effect": "bgPictureOptions",
        "effectArg": null
    },
    "mint-bg-picture-opacity": {
        "controlId": "picture-opacity",
        "panelId": "backgrounds",
        "schema": "org.cinnamon.desktop.background",
        "key": "picture-opacity",
        "map": "uint32",
        "effect": "bgPictureOpacity",
        "effectArg": null
    },
    "mint-night-light-enabled": {
        "controlId": "night-light-enabled",
        "panelId": "nightlight",
        "schema": "org.cinnamon.settings-daemon.plugins.color",
        "key": "night-light-enabled",
        "map": "boolOnOff",
        "effect": "nightLightEnabled",
        "effectArg": null
    },
    "mint-input-per-window": {
        "controlId": "input-per-window",
        "panelId": "input-method",
        "schema": "org.cinnamon.desktop.input-sources",
        "key": "per-window",
        "map": "boolOnOff",
        "effect": "inputPerWindow",
        "effectArg": null
    },
    "mint-input-show-all": {
        "controlId": "input-show-all",
        "panelId": "input-method",
        "schema": "org.cinnamon.desktop.input-sources",
        "key": "show-all-sources",
        "map": "boolOnOff",
        "effect": "inputShowAllSources",
        "effectArg": null
    },
    "mint-install-search-category": {
        "controlId": "search-in-category",
        "panelId": "software-sources",
        "schema": "com.linuxmint.install",
        "key": "search-in-category",
        "map": "boolOnOff",
        "effect": "installSearchCategory",
        "effectArg": null
    },
    "mint-install-unverified-flatpaks": {
        "controlId": "allow-unverified-flatpaks",
        "panelId": "software-sources",
        "schema": "com.linuxmint.install",
        "key": "allow-unverified-flatpaks",
        "map": "boolOnOff",
        "effect": "installUnverifiedFlatpaks",
        "effectArg": null
    },
    "mint-report-automonitor": {
        "controlId": "report-automonitor",
        "panelId": "system-info",
        "schema": "com.linuxmint.report",
        "key": "automonitor",
        "map": "boolOnOff",
        "effect": "reportAutomonitor",
        "effectArg": null
    },
    "mint-report-autorefresh": {
        "controlId": "report-autorefresh",
        "panelId": "system-info",
        "schema": "com.linuxmint.report",
        "key": "autorefresh",
        "map": "boolOnOff",
        "effect": "reportAutorefresh",
        "effectArg": null
    },
    "mint-bluetooth-nap": {
        "controlId": "bluetooth-nap",
        "panelId": "bluetooth",
        "schema": "org.blueman.network",
        "key": "nap-enable",
        "map": "boolOnOff",
        "effect": "bluetoothNap",
        "effectArg": null
    },
    "mint-color-recalibrate-display": {
        "controlId": "recalibrate-display",
        "panelId": "color",
        "schema": "org.cinnamon.settings-daemon.plugins.color",
        "key": "recalibrate-display-threshold",
        "map": "uint32",
        "effect": "colorRecalibrateDisplay",
        "effectArg": null
    },
    "mint-color-recalibrate-printer": {
        "controlId": "recalibrate-printer",
        "panelId": "color",
        "schema": "org.cinnamon.settings-daemon.plugins.color",
        "key": "recalibrate-printer-threshold",
        "map": "uint32",
        "effect": "colorRecalibratePrinter",
        "effectArg": null
    },
    "mint-proxy-mode": {
        "controlId": "proxy-mode",
        "panelId": "network",
        "schema": "org.gnome.system.proxy",
        "key": "mode",
        "map": "passthrough",
        "effect": "proxyMode",
        "effectArg": null
    },
    "mint-nm-show-applet": {
        "controlId": "nm-show-applet",
        "panelId": "network",
        "schema": "org.gnome.nm-applet",
        "key": "show-applet",
        "map": "boolOnOff",
        "effect": "nmShowApplet",
        "effectArg": null
    },
    "mint-applet-printers": {
        "controlId": "applet-printers",
        "panelId": "printers",
        "schema": "org.cinnamon",
        "key": "enabled-applets",
        "map": "appletEnabled",
        "effect": "appletVisibility",
        "effectArg": "printers@cinnamon.org"
    },
    "mint-lockdown-disable-printing": {
        "controlId": "lockdown-printing",
        "panelId": "printers",
        "schema": "org.cinnamon.desktop.lockdown",
        "key": "disable-printing",
        "map": "boolOnOff",
        "effect": "lockdownDisablePrinting",
        "effectArg": null
    },
    "mint-ufw-enabled": {
        "controlId": "ufw-enabled",
        "panelId": "firewall",
        "schema": "org.ubuntu.ufw",
        "key": "enabled",
        "map": "boolOnOff",
        "effect": "ufwEnabled",
        "effectArg": null
    },
    "mint-ufw-logging": {
        "controlId": "ufw-logging",
        "panelId": "firewall",
        "schema": "org.ubuntu.ufw",
        "key": "logging",
        "map": "passthrough",
        "effect": "ufwLogging",
        "effectArg": null
    },
    "mint-thunderbolt-auth-mode": {
        "controlId": "bolt-auth-mode",
        "panelId": "thunderbolt",
        "schema": "org.freedesktop.bolt1.Manager",
        "key": "AuthMode",
        "map": "passthrough",
        "effect": "thunderboltAuthMode",
        "effectArg": null
    }
};
