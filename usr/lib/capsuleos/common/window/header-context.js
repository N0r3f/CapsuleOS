/**
 * Contexte chrome fenêtre par toolkit DE (Cinnamon, GNOME, KDE, …).
 * Évite les effets de bord entre Nemo, Nautilus et Dolphin.
 *
 * Contrat : etc/capsuleos/contracts/window-chrome-contexts.json
 * Profil skin : CAPSULE_WINDOW_CHROME_CONTEXT (toolkitId, slotProviders, explorerTemplate)
 */
(function initCapsuleWindowHeaderContext(global) {
    'use strict';

    const EXPLORER_SLOT = 'nemo';

    const TOOLKIT = {
        cinnamon: 'cinnamon',
        gnome: 'gnome',
        kde: 'kde',
        cosmic: 'cosmic',
    };

    const GNOME_EXPLORER_TEMPLATES = {
        'nemo-gnome': true,
        nautilus: true,
        'nemo-cosmic': true,
        'nautilus-cosmic': true,
    };

    const KDE_EXPLORER_TEMPLATES = {
        dolphin: true,
    };

    const CINNAMON_EXPLORER_TEMPLATES = {
        nemo: true,
    };

    const TOOLKIT_DEFAULTS = {
        cinnamon: {
            toolkitId: TOOLKIT.cinnamon,
            explorerChromeProvider: 'nemo',
            explorerDragMode: 'unified-titlebar',
            headerIconPack: 'cinnamon',
            slotProviders: {},
        },
        gnome: {
            toolkitId: TOOLKIT.gnome,
            explorerChromeProvider: 'nemo-gnome',
            explorerDragMode: 'app-headerbar-passthrough',
            headerIconPack: 'gnome',
            slotProviders: {
                firefox: 'firefox-gnome',
                terminal: 'terminal-gnome',
                calculator: 'libadwaita-gnome',
                text_editor: 'libadwaita-gnome',
                calendar: 'libadwaita-gnome',
                clocks: 'libadwaita-gnome',
                update_manager: 'libadwaita-gnome',
                profile: 'libadwaita-gnome',
                checklist: 'libadwaita-gnome',
                librewriter: 'libadwaita-gnome',
                libreoffice_startcenter: 'libadwaita-gnome',
                librecalc: 'libadwaita-gnome',
                libreoffice_impress: 'libadwaita-gnome',
                libreoffice_draw: 'libadwaita-gnome',
                themes: 'libadwaita-gnome',
                visionneur_images: 'libadwaita-gnome',
                visionneur_pdf: 'libadwaita-gnome',
                lecteur_multimedia: 'libadwaita-gnome',
                snapshot: 'libadwaita-gnome',
                screenshot: 'libadwaita-gnome',
                baobab: 'libadwaita-gnome',
                characters: 'libadwaita-gnome',
                system_monitor: 'libadwaita-gnome',
                tour: 'libadwaita-gnome',
                file_roller: 'file-roller-gtk',
                thunderbird: 'libadwaita-gnome',
                transmission: 'libadwaita-gnome',
                rhythmbox: 'libadwaita-gnome',
                drawing: 'libadwaita-gnome',
                simple_scan: 'libadwaita-gnome',
                warpinator: 'libadwaita-gnome',
                timeshift: 'libadwaita-gnome',
            },
        },
        kde: {
            toolkitId: TOOLKIT.kde,
            explorerChromeProvider: 'dolphin',
            explorerDragMode: 'window-header',
            headerIconPack: 'kde-breeze',
            slotProviders: {},
        },
        cosmic: {
            toolkitId: TOOLKIT.cosmic,
            explorerChromeProvider: 'nemo-gnome',
            explorerDragMode: 'app-headerbar-passthrough',
            headerIconPack: 'cosmic',
            slotProviders: {
                terminal: 'terminal-cosmic',
            },
        },
    };

    let cachedToolkitId = null;
    let cachedToolkitContext = null;

    function readUserChromeContext() {
        if (global.CAPSULE_WINDOW_CHROME_CONTEXT
            && typeof global.CAPSULE_WINDOW_CHROME_CONTEXT === 'object') {
            return global.CAPSULE_WINDOW_CHROME_CONTEXT;
        }
        return {};
    }

    function readExplorerTemplate() {
        const user = readUserChromeContext();
        if (user.explorerTemplate) {
            return String(user.explorerTemplate);
        }
        if (global.CAPSULE_EXPLORER_TEMPLATE) {
            return String(global.CAPSULE_EXPLORER_TEMPLATE);
        }
        return 'nemo';
    }

    function readProfile() {
        const bodyId = global.document && global.document.body
            ? global.document.body.id
            : null;
        const profiles = global.CAPSULE_SKIN_PROFILES;
        const byId = global.CAPSULE_SKIN_PROFILES_BY_ID;
        if (bodyId && profiles && profiles[bodyId]) {
            return profiles[bodyId];
        }
        if (global.CAPSULE_SKIN_PROFILE_ID && byId && byId[global.CAPSULE_SKIN_PROFILE_ID]) {
            return byId[global.CAPSULE_SKIN_PROFILE_ID];
        }
        return null;
    }

    function readToolkitFromProfile() {
        const user = readUserChromeContext();
        if (user.toolkitId) {
            return String(user.toolkitId);
        }
        const profile = readProfile();
        if (profile && profile.toolkit && profile.toolkit.id) {
            return String(profile.toolkit.id);
        }
        return null;
    }

    function inferToolkitIdFromTemplate(template) {
        if (KDE_EXPLORER_TEMPLATES[template]) {
            return TOOLKIT.kde;
        }
        if (template === 'nemo-cosmic' || template === 'nautilus-cosmic') {
            return TOOLKIT.cosmic;
        }
        if (GNOME_EXPLORER_TEMPLATES[template]) {
            return TOOLKIT.gnome;
        }
        if (CINNAMON_EXPLORER_TEMPLATES[template]) {
            return TOOLKIT.cinnamon;
        }
        return null;
    }

    function inferToolkitIdLegacy() {
        const skinKey = global.CAPSULE_EMBED_SKIN_KEY;
        const bodyId = global.document && global.document.body
            ? global.document.body.id
            : null;

        if (skinKey === 'opensuse' || skinKey === 'mxkde' || skinKey === 'debiankde') {
            return TOOLKIT.kde;
        }
        if (skinKey === 'popos') {
            return TOOLKIT.cosmic;
        }
        if (skinKey === 'fedora' || skinKey === 'ubuntu') {
            return TOOLKIT.gnome;
        }
        if (skinKey === 'mint' || bodyId === 'mint') {
            return TOOLKIT.cinnamon;
        }
        if (bodyId === 'opensuse' || bodyId === 'mx-kde' || bodyId === 'debian-kde') {
            return TOOLKIT.kde;
        }
        if (bodyId === 'popos') {
            return TOOLKIT.cosmic;
        }
        if (bodyId === 'rocky' || bodyId === 'alma' || bodyId === 'fedora' || bodyId === 'ubuntu' || bodyId === 'anduinos') {
            return TOOLKIT.gnome;
        }
        return TOOLKIT.cinnamon;
    }

    function resolveToolkitId() {
        if (cachedToolkitId) {
            return cachedToolkitId;
        }
        const fromProfile = readToolkitFromProfile();
        if (fromProfile && TOOLKIT_DEFAULTS[fromProfile]) {
            cachedToolkitId = fromProfile;
            return cachedToolkitId;
        }
        const fromTemplate = inferToolkitIdFromTemplate(readExplorerTemplate());
        if (fromTemplate) {
            cachedToolkitId = fromTemplate;
            return cachedToolkitId;
        }
        cachedToolkitId = inferToolkitIdLegacy();
        return cachedToolkitId;
    }

    function getToolkitContext() {
        if (cachedToolkitContext) {
            return cachedToolkitContext;
        }
        const toolkitId = resolveToolkitId();
        const defaults = TOOLKIT_DEFAULTS[toolkitId] || TOOLKIT_DEFAULTS.cinnamon;
        const user = readUserChromeContext();
        const userSlots = user.slotProviders && typeof user.slotProviders === 'object'
            ? user.slotProviders
            : {};

        cachedToolkitContext = {
            toolkitId: toolkitId,
            explorerTemplate: readExplorerTemplate(),
            explorerSlotId: EXPLORER_SLOT,
            explorerChromeProvider: user.explorerChromeProvider
                || defaults.explorerChromeProvider,
            explorerDragMode: user.explorerDragMode || defaults.explorerDragMode,
            headerIconPack: user.headerIconPack || defaults.headerIconPack,
            slotProviders: Object.assign({}, defaults.slotProviders || {}, userSlots),
        };
        return cachedToolkitContext;
    }

    function resetHeaderContextCache() {
        cachedToolkitId = null;
        cachedToolkitContext = null;
    }

    function isExplorerSlot(slotId) {
        return slotId === EXPLORER_SLOT;
    }

    function isKdeFamily() {
        return resolveToolkitId() === TOOLKIT.kde;
    }

    function isGnomeFamily() {
        const id = resolveToolkitId();
        return id === TOOLKIT.gnome || id === TOOLKIT.cosmic;
    }

    function isCinnamonFamily() {
        return resolveToolkitId() === TOOLKIT.cinnamon;
    }

    function isNautilusFamilyExplorer() {
        const template = readExplorerTemplate();
        return GNOME_EXPLORER_TEMPLATES[template] === true;
    }

    function isDolphinExplorerSlot(slotId) {
        return isExplorerSlot(slotId)
            && readExplorerTemplate() === 'dolphin';
    }

    function isNautilusFamilySlot(slotId) {
        if (!isExplorerSlot(slotId)) {
            return false;
        }
        const ctx = getToolkitContext();
        return ctx.explorerChromeProvider === 'nemo-gnome';
    }

    function resolveChromeProviderId(slotId) {
        const ctx = getToolkitContext();
        if (ctx.slotProviders[slotId]) {
            return ctx.slotProviders[slotId];
        }
        const toolkitId = resolveToolkitId();
        if (toolkitId === TOOLKIT.cinnamon) {
            if (isExplorerSlot(slotId)) {
                return ctx.explorerChromeProvider;
            }
            return 'cinnamon';
        }
        if (isExplorerSlot(slotId)) {
            return ctx.explorerChromeProvider;
        }
        if (slotId === 'firefox' && isGnomeFamily()) {
            return 'firefox-gnome';
        }
        if (slotId === 'terminal') {
            if (resolveToolkitId() === TOOLKIT.cosmic) {
                return 'terminal-cosmic';
            }
            if (resolveToolkitId() === TOOLKIT.gnome) {
                return 'terminal-gnome';
            }
        }
        return 'default';
    }

    function usesUnifiedExplorerTitleBar() {
        const ctx = getToolkitContext();
        return isExplorerSlot(EXPLORER_SLOT)
            && ctx.explorerDragMode === 'unified-titlebar';
    }

    function shouldUseKdeHeaderIcons() {
        const ctx = getToolkitContext();
        return ctx.headerIconPack === 'kde-breeze';
    }

    if (typeof document !== 'undefined') {
        document.addEventListener('capsule-skin-ready', resetHeaderContextCache);
    }

    global.CapsuleWindowHeaderContext = {
        TOOLKIT: TOOLKIT,
        EXPLORER_SLOT: EXPLORER_SLOT,
        resolveToolkitId: resolveToolkitId,
        getToolkitContext: getToolkitContext,
        resetHeaderContextCache: resetHeaderContextCache,
        readExplorerTemplate: readExplorerTemplate,
        isExplorerSlot: isExplorerSlot,
        isKdeFamily: isKdeFamily,
        isGnomeFamily: isGnomeFamily,
        isCinnamonFamily: isCinnamonFamily,
        isNautilusFamilyExplorer: isNautilusFamilyExplorer,
        isDolphinExplorerSlot: isDolphinExplorerSlot,
        isNautilusFamilySlot: isNautilusFamilySlot,
        resolveChromeProviderId: resolveChromeProviderId,
        usesUnifiedExplorerTitleBar: usesUnifiedExplorerTitleBar,
        shouldUseKdeHeaderIcons: shouldUseKdeHeaderIcons,
    };
}(typeof window !== 'undefined' ? window : globalThis));
