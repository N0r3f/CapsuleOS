/**
 * Persistance thème clair/sombre par toolkit (gnome-theme, cosmic-theme, mint-theme).
 */
(function initCapsuleThemeStorage(global) {
    'use strict';

    const GNOME_BODY_IDS = new Set(['rocky', 'fedora', 'alma', 'ubuntu', 'anduinos']);
    const COSMIC_BODY_IDS = new Set(['popos']);

    function bodyId() {
        return global.document && global.document.body ? global.document.body.id : '';
    }

    function getThemeStorageKey(id) {
        const resolved = id || bodyId();
        if (GNOME_BODY_IDS.has(resolved)) {
            return 'gnome-theme';
        }
        if (COSMIC_BODY_IDS.has(resolved)) {
            return 'cosmic-theme';
        }
        return 'mint-theme';
    }

    function isGnomeShell(id) {
        return GNOME_BODY_IDS.has(id || bodyId());
    }

    function readSavedTheme(id) {
        const key = getThemeStorageKey(id);
        const gs = global.CapsuleGnomeGSettings;
        if (gs && isGnomeShell(id) && gs.hasBinding(key)) {
            const mapped = gs.getCapsule(key, null);
            if (mapped === 'light' || mapped === 'dark') {
                return mapped;
            }
        }
        const saved = global.localStorage.getItem(key);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        if (key === 'gnome-theme' || key === 'cosmic-theme') {
            const legacy = global.localStorage.getItem('mint-theme');
            if (legacy === 'light' || legacy === 'dark') {
                global.localStorage.setItem(key, legacy);
                global.localStorage.removeItem('mint-theme');
                return legacy;
            }
        }
        return null;
    }

    function persistTheme(theme, id) {
        const resolved = theme === 'light' ? 'light' : 'dark';
        const key = getThemeStorageKey(id);
        const gs = global.CapsuleGnomeGSettings;
        if (gs && isGnomeShell(id) && gs.hasBinding(key)) {
            gs.setCapsule(key, resolved);
        } else {
            global.localStorage.setItem(key, resolved);
        }
        return resolved;
    }

    const GNOME_ACCENTS = {
        blue: '#3584e4',
        teal: '#219a90',
        green: '#3a944a',
        yellow: '#c9a000',
        orange: '#ed5b00',
        red: '#e01b24',
        pink: '#d56199',
        purple: '#9141ac',
        slate: '#6f6f6f',
    };

    function getAccentStorageKey() {
        return 'gnome-accent';
    }

    function readSavedAccent() {
        const key = getAccentStorageKey();
        const gs = global.CapsuleGnomeGSettings;
        if (gs && gs.hasBinding(key)) {
            const mapped = gs.getCapsule(key, null);
            if (mapped && GNOME_ACCENTS[mapped]) {
                return mapped;
            }
        }
        const saved = global.localStorage.getItem(key);
        const bid = bodyId();
        const fallback = bid === 'ubuntu' ? 'orange' : 'blue';
        return saved && GNOME_ACCENTS[saved] ? saved : fallback;
    }

    function persistAccent(accentId) {
        const resolved = GNOME_ACCENTS[accentId] ? accentId : 'blue';
        const key = getAccentStorageKey();
        const gs = global.CapsuleGnomeGSettings;
        if (gs && gs.hasBinding(key)) {
            gs.setCapsule(key, resolved);
        } else {
            global.localStorage.setItem(key, resolved);
        }
        return resolved;
    }

    function getWallpaperStorageKey(id) {
        const resolved = id || bodyId();
        if (resolved === 'mint') {
            return 'mint-wallpaper';
        }
        return resolved ? `gnome-wallpaper:${resolved}` : 'gnome-wallpaper';
    }

    function isWallpaperUriAllowedForBody(uri, id) {
        const bid = id || bodyId();
        const u = String(uri || '').toLowerCase();
        if (!u) {
            return true;
        }
        const isRhel = bid === 'fedora' || bid === 'rocky' || bid === 'alma';
        if (isRhel && (u.includes('/ubuntu/') || u.includes('racoon') || u.includes('warty') || u.includes('questing'))) {
            return false;
        }
        if (bid === 'ubuntu' && (u.includes('/fedora/') || u.includes('f44-01') || u.includes('rocky-default'))) {
            return false;
        }
        if (bid === 'fedora' && u.includes('rocky-default') && !u.includes('f44-01')) {
            return false;
        }
        if ((bid === 'rocky' || bid === 'alma') && u.includes('f44-01')) {
            return false;
        }
        return true;
    }

    function wallpaperIdAllowedForBody(wallpaperId, id) {
        const bid = id || bodyId();
        if (!wallpaperId || wallpaperId === 'custom') {
            return wallpaperId === 'custom';
        }
        const catalog = getWallpaperCatalog(bid);
        return catalog.some((entry) => entry.id === wallpaperId);
    }

    function migrateLegacyWallpaperKey(id) {
        const key = getWallpaperStorageKey(id);
        const legacy = global.localStorage.getItem('gnome-wallpaper');
        if (legacy && !global.localStorage.getItem(key)) {
            global.localStorage.setItem(key, legacy);
        }
        return key;
    }

    function resolveWallpaperIdFromUri(uri) {
        const file = String(uri || '').split('/').pop() || '';
        const catalog = getWallpaperCatalog(bodyId());
        for (const entry of catalog) {
            if (file.includes(entry.id)) {
                return entry.id;
            }
            const paths = [entry.dark, entry.light].filter(Boolean);
            if (paths.some((relPath) => file && relPath.endsWith(file))) {
                return entry.id;
            }
        }
        if (file.includes('abstract-1')) {
            return 'abstract-1';
        }
        if (file.includes('abstract-2')) {
            return 'abstract-2';
        }
        if (file.includes('sapphire')) {
            return 'sapphire';
        }
        if (file.includes('f44-01')) {
            return 'f44-01';
        }
        if (file.includes('gemstone')) {
            return 'gemstone-skies';
        }
        if (file.includes('racoon') || file.includes('warty') || file.includes('questing')) {
            return 'racoon';
        }
        if (file.includes('adwaita-d') || file.includes('adwaita-l') || file.includes('ubuntu-wallpaper')) {
            return 'adwaita';
        }
        return null;
    }

    function shellBackgroundVar(id) {
        const bid = id || bodyId();
        if (bid === 'mint') {
            return '--mint';
        }
        if (bid === 'ubuntu') {
            return '--ubuntu-bg';
        }
        return '--fedora-bg';
    }

    function wallpaperIdToGsettingsUri(wallpaperId, skinId) {
        const entry = findWallpaperEntry(wallpaperId, skinId);
        const theme = global.document && global.document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
        if (entry.type === 'color') {
            return `file:///usr/share/backgrounds/rocky-default-10-${wallpaperId}-day.png`;
        }
        if (entry.gsettingsDark || entry.gsettingsLight) {
            const rel = theme === 'light' ? entry.gsettingsLight : entry.gsettingsDark;
            return `file:///usr/share/backgrounds/${rel}`;
        }
        const rel = theme === 'light' ? entry.light : entry.dark;
        const file = rel.split('/').pop();
        return `file:///usr/share/backgrounds/${file}`;
    }

    function readSavedWallpaper(id) {
        const bid = id || bodyId();
        const key = migrateLegacyWallpaperKey(bid);
        const gs = global.CapsuleGnomeGSettings;
        if (gs && gs.hasBinding('gnome-wallpaper')) {
            const uri = gs.getCapsule('gnome-wallpaper', null);
            if (isWallpaperUriAllowedForBody(uri, bid)) {
                const mapped = resolveWallpaperIdFromUri(uri);
                if (mapped && wallpaperIdAllowedForBody(mapped, bid)) {
                    return mapped;
                }
            }
        }
        const stored = global.localStorage.getItem(key);
        if (stored && wallpaperIdAllowedForBody(stored, bid)) {
            return stored;
        }
        return defaultWallpaperId(bid);
    }

    function persistWallpaper(wallpaperId, skinId) {
        if (!wallpaperId) {
            return wallpaperId;
        }
        const bid = skinId || bodyId();
        const key = getWallpaperStorageKey(bid);
        const gs = global.CapsuleGnomeGSettings;
        if (gs && gs.hasBinding('gnome-wallpaper')) {
            gs.setCapsule('gnome-wallpaper', wallpaperIdToGsettingsUri(wallpaperId, bid));
        }
        global.localStorage.setItem(key, wallpaperId);
        return wallpaperId;
    }

    const ACCENT_CSS_VARS = [
        '--menu-accent',
        '--gcc-accent',
        '--cluster-gnome-menu-accent',
        '--gnome-software-accent',
    ];

    function dispatchAppearanceEvent(name, detail) {
        if (global.document && typeof global.CustomEvent === 'function') {
            global.document.dispatchEvent(new global.CustomEvent(name, { detail: detail || {} }));
        }
    }

    function applyAccentColor(accentId) {
        const resolved = persistAccent(accentId);
        const color = GNOME_ACCENTS[resolved];
        ACCENT_CSS_VARS.forEach((varName) => setShellVar(varName, color));
        global.document.documentElement.dataset.gnomeAccent = resolved;
        global.document.documentElement.style.setProperty('--settings-accent-hex', color);
        dispatchAppearanceEvent('capsule:accent-changed', { accentId: resolved, color: color });
        return resolved;
    }

    function resolveWallpaperAssetUrl(relativePath) {
        const rel = `./assets/images/${relativePath}`;
        if (global.CapsuleResource && typeof global.CapsuleResource.resolve === 'function') {
            return global.CapsuleResource.resolve(rel);
        }
        return rel.replace('./assets/images/', '../../../usr/share/capsuleos/assets/images/');
    }

    /** URL absolue : les url() dans var(--fedora-bg) se résolvent depuis la feuille qui consomme la variable (style/), pas depuis le document. */
    function toAbsoluteWallpaperUrl(path) {
        if (!path || /^(https?:|data:|blob:|file:)/.test(path)) {
            return path;
        }
        const doc = global.document;
        if (!doc || !doc.baseURI) {
            return path;
        }
        try {
            return new URL(path, doc.baseURI).href;
        } catch (error) {
            return path;
        }
    }

    function getWallpaperVendor(bodyId) {
        const vendorMap = {
            mint: 'mint',
            rocky: 'rocky',
            alma: 'alma',
            fedora: 'fedora',
            ubuntu: 'ubuntu',
            anduinos: 'anduinos',
        };
        return vendorMap[bodyId] || 'rocky';
    }

    function defaultWallpaperId(bodyId) {
        if (bodyId === 'mint') {
            return 'default_background';
        }
        if (bodyId === 'fedora') {
            return 'f44-01';
        }
        if (bodyId === 'ubuntu') {
            return 'racoon';
        }
        if (bodyId === 'alma') {
            return 'almalinux';
        }
        return 'gemstone-skies';
    }

    function mintWallpaperCatalog() {
        const injected = global.CAPSULE_MINT_WALLPAPER_CATALOG;
        if (Array.isArray(injected) && injected.length) {
            return injected;
        }
        return [
            {
                id: 'linuxmint',
                label: 'Linux Mint',
                type: 'image',
                dark: 'vendors/mint/wallpaper/linuxmint.webp',
                light: 'vendors/mint/wallpaper/linuxmint.webp',
                default: true,
            },
        ];
    }

    function fedoraWallpaperCatalog(base) {
        return [
            {
                id: 'f44-01',
                label: 'Fedora 44',
                type: 'image',
                dark: `${base}/f44-01-night.webp`,
                light: `${base}/f44-01-day.webp`,
                gsettingsDark: 'f44/default/f44-01-night.webp',
                gsettingsLight: 'f44/default/f44-01-day.webp',
                default: true,
            },
            {
                id: 'solid-graphite',
                label: 'Graphite',
                type: 'color',
                dark: 'linear-gradient(165deg, #2e2e32 0%, #1c1c1f 100%)',
                light: 'linear-gradient(165deg, #ececf0 0%, #d4d4da 100%)',
            },
            {
                id: 'solid-ocean',
                label: 'Océan',
                type: 'color',
                dark: 'linear-gradient(145deg, #1a3d5c 0%, #0c1f33 55%, #061018 100%)',
                light: 'linear-gradient(145deg, #8ecae6 0%, #caf0f8 55%, #e8f6fc 100%)',
            },
        ];
    }

    function almaWallpaperCatalog(base) {
        return [
            {
                id: 'almalinux',
                label: 'AlmaLinux',
                type: 'image',
                dark: `${base}/almalinux-night.jpg`,
                light: `${base}/almalinux-day.jpg`,
                default: true,
            },
            {
                id: 'solid-graphite',
                label: 'Graphite',
                type: 'color',
                dark: 'linear-gradient(165deg, #2e2e32 0%, #1c1c1f 100%)',
                light: 'linear-gradient(165deg, #ececf0 0%, #d4d4da 100%)',
            },
            {
                id: 'solid-ocean',
                label: 'Océan',
                type: 'color',
                dark: 'linear-gradient(145deg, #1a3d5c 0%, #0c1f33 55%, #061018 100%)',
                light: 'linear-gradient(145deg, #8ecae6 0%, #caf0f8 55%, #e8f6fc 100%)',
            },
        ];
    }

    function rockyWallpaperCatalog(base) {
        return [
            {
                id: 'gemstone-skies',
                label: 'Ciel de pierres',
                type: 'image',
                dark: `${base}/rocky-default-10-gemstone-skies-night.webp`,
                light: `${base}/rocky-default-10-gemstone-skies-day.webp`,
                default: true,
            },
            {
                id: 'sapphire',
                label: 'Saphir',
                type: 'image',
                dark: `${base}/rocky-default-10-sapphire.webp`,
                light: `${base}/rocky-default-10-sapphire-light.webp`,
            },
            {
                id: 'abstract-1',
                label: 'Abstrait 1',
                type: 'image',
                dark: `${base}/rocky-default-10-abstract-1-night.webp`,
                light: `${base}/rocky-default-10-abstract-1-day.webp`,
            },
            {
                id: 'abstract-2',
                label: 'Abstrait 2',
                type: 'image',
                dark: `${base}/rocky-default-10-abstract-2.webp`,
                light: `${base}/rocky-default-10-abstract-2.webp`,
            },
            {
                id: 'abstract-3',
                label: 'Abstrait 3',
                type: 'image',
                dark: `${base}/rocky-default-10-abstract-3.webp`,
                light: `${base}/rocky-default-10-abstract-3.webp`,
            },
            {
                id: 'abstract-4',
                label: 'Abstrait 4',
                type: 'image',
                dark: `${base}/rocky-default-10-abstract-4.webp`,
                light: `${base}/rocky-default-10-abstract-4.webp`,
            },
            {
                id: 'abstract-5',
                label: 'Abstrait 5',
                type: 'image',
                dark: `${base}/rocky-default-10-abstract-5.webp`,
                light: `${base}/rocky-default-10-abstract-5.webp`,
            },
            {
                id: 'solid-graphite',
                label: 'Graphite',
                type: 'color',
                dark: 'linear-gradient(165deg, #2e2e32 0%, #1c1c1f 100%)',
                light: 'linear-gradient(165deg, #ececf0 0%, #d4d4da 100%)',
            },
            {
                id: 'solid-ocean',
                label: 'Océan',
                type: 'color',
                dark: 'linear-gradient(145deg, #1a3d5c 0%, #0c1f33 55%, #061018 100%)',
                light: 'linear-gradient(145deg, #8ecae6 0%, #caf0f8 55%, #e8f6fc 100%)',
            },
            {
                id: 'solid-wine',
                label: 'Grenat',
                type: 'color',
                dark: 'linear-gradient(155deg, #4a2038 0%, #2a1020 100%)',
                light: 'linear-gradient(155deg, #e8b4c8 0%, #f8e0ea 100%)',
            },
        ];
    }

    const GRAPHITE_SOLID_ENTRY = {
        id: 'solid-graphite',
        label: 'Graphite',
        type: 'color',
        dark: 'linear-gradient(165deg, #2e2e32 0%, #1c1c1f 100%)',
        light: 'linear-gradient(165deg, #ececf0 0%, #d4d4da 100%)',
    };

    function ubuntuWallpaperCatalog(base) {
        const injected = global.CAPSULE_UBUNTU_WALLPAPER_CATALOG;
        if (Array.isArray(injected) && injected.length) {
            return injected;
        }
        const thumbs = `${base}/thumbnails`;
        return [
            {
                id: 'adwaita',
                label: 'Adwaita',
                type: 'image',
                dark: `${base}/wallpaper-adwaita-dark.webp`,
                light: `${base}/wallpaper-adwaita-dark.webp`,
                thumbDark: `${thumbs}/wallpaper-adwaita-dark-thumb.webp`,
                thumbLight: `${thumbs}/wallpaper-adwaita-dark-thumb.webp`,
                gsettingsDark: 'ubuntu-wallpaper-d.png',
                gsettingsLight: 'gnome/adwaita-l.jxl',
            },
            {
                id: 'racoon',
                label: 'Resolute Raccoon',
                type: 'image',
                dark: `${base}/wallpaper-racoon.webp`,
                light: `${base}/wallpaper-racoon-light.webp`,
                thumbDark: `${thumbs}/wallpaper-racoon-thumb.webp`,
                thumbLight: `${thumbs}/wallpaper-racoon-light-thumb.webp`,
                default: true,
            },
            GRAPHITE_SOLID_ENTRY,
        ];
    }

    function getWallpaperCatalog(bodyId) {
        const vendor = getWallpaperVendor(bodyId);
        const base = `vendors/${vendor}/wallpaper`;
        if (vendor === 'mint') {
            return mintWallpaperCatalog();
        }
        if (vendor === 'fedora') {
            return fedoraWallpaperCatalog(base);
        }
        if (vendor === 'ubuntu') {
            return ubuntuWallpaperCatalog(base);
        }
        if (vendor === 'alma') {
            return almaWallpaperCatalog(base);
        }
        return rockyWallpaperCatalog(base);
    }

    function resolveWallpaperEntry(entry, theme) {
        const mode = theme === 'light' ? 'light' : 'dark';
        if (!entry) {
            return '';
        }
        if (entry.type === 'color' || (!entry.dark && !entry.light && entry[mode])) {
            return entry[mode] || entry.dark || entry.light || '';
        }
        const file = mode === 'light' ? entry.light : entry.dark;
        return `url("${toAbsoluteWallpaperUrl(resolveWallpaperAssetUrl(file))}")`;
    }

    function resolveWallpaperThumb(entry, theme) {
        if (!entry || entry.type === 'color') {
            return resolveWallpaperEntry(entry, theme);
        }
        const mode = theme === 'light' ? 'light' : 'dark';
        const thumb = mode === 'light' ? entry.thumbLight : entry.thumbDark;
        if (thumb) {
            return `url("${toAbsoluteWallpaperUrl(resolveWallpaperAssetUrl(thumb))}")`;
        }
        return resolveWallpaperEntry(entry, theme);
    }

    function findWallpaperEntry(wallpaperId, skinId) {
        const catalog = getWallpaperCatalog(skinId || bodyId());
        return catalog.find((item) => item.id === wallpaperId)
            || catalog.find((item) => item.default)
            || catalog[0];
    }

    function setShellVar(name, value) {
        const root = global.document.documentElement;
        root.style.setProperty(name, value);
        if (global.document.body) {
            global.document.body.style.setProperty(name, value);
        }
    }

    function applyWallpaperBackground(value, wallpaperId) {
        const doc = global.document.documentElement;
        doc.dataset.wallpaperTransition = 'on';
        setShellVar(shellBackgroundVar(), value);
        doc.dataset.gnomeWallpaper = wallpaperId || '';
        if (global.document.body) {
            global.document.body.dataset.gnomeWallpaper = wallpaperId || '';
        }
        global.setTimeout(() => {
            delete doc.dataset.wallpaperTransition;
        }, 220);
        dispatchAppearanceEvent('capsule:wallpaper-changed', {
            wallpaperId: wallpaperId,
            background: value,
        });
    }

    function applyWallpaper(wallpaperId, skinId) {
        if (wallpaperId === 'custom') {
            return wallpaperId;
        }
        const entry = findWallpaperEntry(wallpaperId, skinId);
        const theme = global.document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
        const background = resolveWallpaperEntry(entry, theme);
        applyWallpaperBackground(background, entry.id);
        persistWallpaper(entry.id, skinId);
        return entry.id;
    }

    function applyCustomWallpaper(objectUrl) {
        applyWallpaperBackground(`url("${objectUrl}")`, 'custom');
        persistWallpaper('custom', bodyId());
        return 'custom';
    }

    const DISPLAY_RESOLUTION_KEYS = {
        '1920 × 1080': '1920x1080',
        '1680 × 1050': '1680x1050',
        '1280 × 720': '1280x720',
    };

    const DISPLAY_SCALE_KEYS = {
        '100 %': '100',
        '125 %': '125',
        '150 %': '150',
        '200 %': '200',
    };

    const DISPLAY_ORIENTATION_KEYS = {
        Paysage: 'landscape',
        'Paysage (inversé)': 'landscape-reverse',
        Portrait: 'portrait',
    };

    function readPref(key, fallback) {
        const gs = global.CapsuleGnomeGSettings;
        if (gs && gs.hasBinding(key)) {
            return gs.getCapsule(key, fallback);
        }
        return global.localStorage.getItem(key) || fallback;
    }

    function persistPref(key, value) {
        const gs = global.CapsuleGnomeGSettings;
        if (gs && gs.hasBinding(key)) {
            gs.setCapsule(key, value);
            return value;
        }
        global.localStorage.setItem(key, value);
        return value;
    }

    function applyDisplayResolution(label) {
        const resolved = DISPLAY_RESOLUTION_KEYS[label] || '1920x1080';
        global.document.documentElement.dataset.displayResolution = resolved;
        persistPref('gnome-display-resolution', label);
        return label;
    }

    function applyDisplayScale(label) {
        const resolved = DISPLAY_SCALE_KEYS[label] || '100';
        global.document.documentElement.dataset.displayScale = resolved;
        persistPref('gnome-display-scale', label);
        dispatchAppearanceEvent('capsule:display-scale-changed', { scale: resolved, label: label });
        return label;
    }

    function applyDisplayOrientation(label) {
        const resolved = DISPLAY_ORIENTATION_KEYS[label] || 'landscape';
        global.document.documentElement.dataset.displayOrientation = resolved;
        persistPref('gnome-display-orientation', label);
        return label;
    }

    function applyNightLight(enabled) {
        const on = !!enabled;
        const doc = global.document.documentElement;
        doc.dataset.nightLightTransition = 'on';
        doc.dataset.nightLight = on ? 'on' : 'off';
        persistPref('gnome-night-light', on ? 'on' : 'off');
        global.setTimeout(() => {
            delete doc.dataset.nightLightTransition;
        }, 1050);
        dispatchAppearanceEvent('capsule:night-light-changed', { enabled: on });
        return on;
    }

    function applyContrastMode(mode) {
        const resolved = mode === 'high' ? 'high' : 'normal';
        global.document.documentElement.dataset.contrastMode = resolved;
        persistPref('mint-contrast-mode', resolved);
        if (global.document && typeof global.document.dispatchEvent === 'function') {
            global.document.dispatchEvent(new CustomEvent('capsule:a11y-contrast-changed', {
                detail: { high: resolved === 'high', mode: resolved }
            }));
        }
        return resolved;
    }

    function applyFontScale(scale) {
        const resolved = ['110', '125'].includes(scale) ? scale : '100';
        global.document.documentElement.dataset.fontScale = resolved;
        persistPref('mint-font-scale', resolved);
        if (global.document && typeof global.document.dispatchEvent === 'function') {
            global.document.dispatchEvent(new CustomEvent('capsule:a11y-font-scale-changed', {
                detail: { scale: resolved, large: resolved === '125' }
            }));
        }
        return resolved;
    }

    function applyGnomeShellPreferences() {
        applyDisplayResolution(readPref('gnome-display-resolution', '1920 × 1080'));
        applyDisplayScale(readPref('gnome-display-scale', '100 %'));
        applyDisplayOrientation(readPref('gnome-display-orientation', 'Paysage'));
        applyNightLight(readPref('gnome-night-light', 'off') === 'on');
        applyContrastMode(readPref('mint-contrast-mode', 'normal'));
        applyFontScale(readPref('mint-font-scale', '100'));
    }

    global.CapsuleThemeStorage = {
        getThemeStorageKey: getThemeStorageKey,
        isGnomeShell: isGnomeShell,
        readSavedTheme: readSavedTheme,
        persistTheme: persistTheme,
        getAccentStorageKey: getAccentStorageKey,
        readSavedAccent: readSavedAccent,
        persistAccent: persistAccent,
        applyAccentColor: applyAccentColor,
        GNOME_ACCENTS: GNOME_ACCENTS,
        getWallpaperStorageKey: getWallpaperStorageKey,
        readSavedWallpaper: readSavedWallpaper,
        persistWallpaper: persistWallpaper,
        getWallpaperCatalog: getWallpaperCatalog,
        getWallpaperVendor: getWallpaperVendor,
        findWallpaperEntry: findWallpaperEntry,
        resolveWallpaperEntry: resolveWallpaperEntry,
        resolveWallpaperThumb: resolveWallpaperThumb,
        applyWallpaper: applyWallpaper,
        applyCustomWallpaper: applyCustomWallpaper,
        applyWallpaperBackground: applyWallpaperBackground,
        resolveWallpaperAssetUrl: resolveWallpaperAssetUrl,
        GNOME_ACCENT_COLORS: GNOME_ACCENTS,
        applyDisplayResolution: applyDisplayResolution,
        applyDisplayScale: applyDisplayScale,
        applyDisplayOrientation: applyDisplayOrientation,
        applyNightLight: applyNightLight,
        applyContrastMode: applyContrastMode,
        applyFontScale: applyFontScale,
        applyGnomeShellPreferences: applyGnomeShellPreferences,
        setShellVar: setShellVar,
        DISPLAY_RESOLUTION_KEYS: DISPLAY_RESOLUTION_KEYS,
        DISPLAY_SCALE_KEYS: DISPLAY_SCALE_KEYS,
        GNOME_BODY_IDS: GNOME_BODY_IDS,
        COSMIC_BODY_IDS: COSMIC_BODY_IDS,
        getProfileDefaultTheme: function getProfileDefaultTheme(bid) {
            var profiles = global.CAPSULE_SKIN_PROFILES || {};
            var id = global.CAPSULE_SKIN_PROFILE_ID || '';
            var p = profiles[id] || profiles[bid] || null;
            return p && p.defaultTheme ? p.defaultTheme : null;
        },
    };
}(typeof window !== 'undefined' ? window : globalThis));
