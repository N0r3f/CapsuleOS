'use strict';
/* Généré par generate-kde-kconfig-bindings.mjs — ne pas éditer à la main */
window.CAPSULE_KDE_KCONFIG_BINDINGS = {
    "kde-global-theme": {
        "controlId": "global-theme-light",
        "panelId": "appearance",
        "kconfigFile": "kdeglobals",
        "kconfigGroup": "General",
        "kconfigKey": "ColorScheme",
        "type": "choice",
        "layer": "Se-Theme",
        "event": "capsule:global-theme-changed"
    },
    "kde-panel-height": {
        "controlId": "panel-height",
        "panelId": "appearance",
        "kconfigFile": "plasmashellrc",
        "kconfigGroup": "PanelHeight",
        "kconfigKey": "PanelHeight",
        "type": "select",
        "layer": "Se-Shell",
        "event": "capsule:panel-height-changed"
    },
    "kde-window-animations": {
        "controlId": "window-animations",
        "panelId": "appearance",
        "kconfigFile": "kwinrc",
        "kconfigGroup": "Windows",
        "kconfigKey": "animate",
        "type": "switch",
        "layer": "Se-WM",
        "event": "capsule:window-animations-changed"
    },
    "kde-desktop-icons": {
        "controlId": "desktop-icons",
        "panelId": "desktop",
        "kconfigFile": "plasma-org.kde.plasma.desktop-appletsrc",
        "kconfigGroup": "DesktopIcons",
        "kconfigKey": "Enabled",
        "type": "switch",
        "layer": "Se-Desktop",
        "event": "capsule:desktop-icons-visibility-changed"
    },
    "kde-desktop-align": {
        "controlId": "desktop-align",
        "panelId": "desktop",
        "kconfigFile": "plasma-org.kde.plasma.desktop-appletsrc",
        "kconfigGroup": "DesktopIcons",
        "kconfigKey": "Arrangement",
        "type": "select",
        "layer": "Se-Desktop",
        "event": "capsule:desktop-align-changed"
    },
    "kde-click-to-focus": {
        "controlId": "click-to-focus",
        "panelId": "workspace",
        "kconfigFile": "kwinrc",
        "kconfigGroup": "Windows",
        "kconfigKey": "FocusPolicy",
        "type": "switch",
        "layer": "Se-WM",
        "event": "capsule:click-to-focus-changed"
    },
    "kde-focus-stealing": {
        "controlId": "focus-stealing",
        "panelId": "workspace",
        "kconfigFile": "kwinrc",
        "kconfigGroup": "Windows",
        "kconfigKey": "FocusStealingPreventionLevel",
        "type": "switch",
        "layer": "Se-WM",
        "event": "capsule:focus-stealing-changed"
    },
    "kde-a11y-high-contrast": {
        "controlId": "high-contrast",
        "panelId": "accessibility",
        "kconfigFile": "kdeglobals",
        "kconfigGroup": "KDE",
        "kconfigKey": "ContrastEffect",
        "type": "switch",
        "layer": "Se-A11y",
        "event": "capsule:a11y-contrast-changed"
    },
    "kde-a11y-large-text": {
        "controlId": "large-text",
        "panelId": "accessibility",
        "kconfigFile": "kdeglobals",
        "kconfigGroup": "General",
        "kconfigKey": "fontSize",
        "type": "switch",
        "layer": "Se-A11y",
        "event": "capsule:a11y-font-scale-changed"
    },
    "kde-reduced-motion": {
        "controlId": "reduced-motion",
        "panelId": "accessibility",
        "kconfigFile": "kdeglobals",
        "kconfigGroup": "KDE",
        "kconfigKey": "AnimationDurationFactor",
        "type": "switch",
        "layer": "Se-A11y",
        "event": "capsule:reduced-motion-changed"
    },
    "kde-notifications-banners": {
        "controlId": "notification-banners",
        "panelId": "notifications",
        "kconfigFile": "plasmanotifyrc",
        "kconfigGroup": "DoNotDisturb",
        "kconfigKey": "Enabled",
        "type": "switch",
        "layer": "Se-Shell",
        "event": "capsule:notifications-changed"
    },
    "kde-default-browser": {
        "controlId": "default-browser",
        "panelId": "applications",
        "kconfigFile": "kdeglobals",
        "kconfigGroup": "General",
        "kconfigKey": "BrowserApplication",
        "type": "select",
        "layer": "Se-Desktop",
        "event": "capsule:default-app-changed"
    },
    "kde-accent-color": {
        "controlId": "accent-color",
        "panelId": "colors",
        "kconfigFile": "kdeglobals",
        "kconfigGroup": "General",
        "kconfigKey": "AccentColor",
        "type": "select",
        "layer": "Se-Theme",
        "event": "capsule:accent-color-changed"
    }
};
