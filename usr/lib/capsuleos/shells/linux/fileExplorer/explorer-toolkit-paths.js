/**
 * Chemins icônes explorateur par toolkit DE (Cinnamon, GNOME, KDE, COSMIC).
 * Le catalogue fileExplorerInfo.js utilise CATALOG_BASE (Cinnamon) ; CapsuleExplorerIconBase remappe au runtime.
 */
(function initCapsuleExplorerToolkitPaths(global) {
    'use strict';

    const PATHS = {
        cinnamon: './assets/icons/cinnamon/nemo',
        gnome: './assets/icons/gnome/adwaita',
        yaru: './assets/icons/gnome/yaru',
        kde: './assets/icons/kde/nemo',
        cosmic: './assets/images/toolkits/cosmic/elements/nemo',
    };

    const YARU_BODY_IDS = new Set(['ubuntu']);

    function gnomeIconPackId() {
        const bodyId = global.document && global.document.body ? global.document.body.id : '';
        if (bodyId && YARU_BODY_IDS.has(bodyId)) {
            return 'yaru';
        }
        const packs = global.CAPSULE_SKIN_PROFILE_ICON_PACKS;
        if (Array.isArray(packs) && packs.includes('icons/gnome/yaru')) {
            return 'yaru';
        }
        return 'gnome';
    }

    function gnomeIconBase() {
        const pack = gnomeIconPackId();
        return PATHS[pack] || PATHS.gnome;
    }

    const GNOME_BODY_IDS = new Set(['rocky', 'fedora', 'alma', 'ubuntu', 'anduinos']);
    const KDE_BODY_IDS = new Set(['opensuse', 'kde-neon', 'debian-kde', 'mx-kde']);
    const COSMIC_BODY_IDS = new Set(['popos']);

    function activeToolkitId() {
        const bodyId = global.document && global.document.body ? global.document.body.id : '';
        if (bodyId && GNOME_BODY_IDS.has(bodyId)) {
            return 'gnome';
        }
        if (bodyId && KDE_BODY_IDS.has(bodyId)) {
            return 'kde';
        }
        if (bodyId && COSMIC_BODY_IDS.has(bodyId)) {
            return 'cosmic';
        }
        const packs = global.CAPSULE_SKIN_PROFILE_ICON_PACKS;
        if (Array.isArray(packs)) {
            if (packs.includes('icons/gnome')) {
                return 'gnome';
            }
            if (packs.includes('icons/kde')) {
                return 'kde';
            }
        }
        return 'cinnamon';
    }

    function catalogBase() {
        return PATHS.cinnamon;
    }

    function activeBase() {
        return PATHS[activeToolkitId()] || PATHS.cinnamon;
    }

    function catalogIcon(leaf) {
        return `${catalogBase()}/${leaf}`;
    }

    global.CAPSULE_EXPLORER_TOOLKIT_PATHS = PATHS;
    global.CAPSULE_EXPLORER_CATALOG_BASE = catalogBase();
    global.CapsuleExplorerToolkitPaths = {
        paths: PATHS,
        activeToolkitId: activeToolkitId,
        catalogBase: catalogBase,
        activeBase: activeBase,
        catalogIcon: catalogIcon,
        gnomeIconPackId: gnomeIconPackId,
        gnomeIconBase: gnomeIconBase,
    };
}(typeof window !== 'undefined' ? window : globalThis));
