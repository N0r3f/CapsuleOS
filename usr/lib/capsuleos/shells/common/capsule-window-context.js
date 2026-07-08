/**
 * Contexte fenêtres multi-vendors (référence comportement : macOS Sonoma).
 * Fusionne window.CAPSULE_WINDOW_CONTEXT avec des défauts par famille OS.
 *
 * Charger après capsule-window.js, resizeWindow.js, window-drag.js.
 */
(function initCapsuleWindowContext(global) {
    'use strict';

    const FAMILY_DEFAULTS = {
        linux: {
            requireHeader: true,
            skipSlots: ['mainMenu'],
            bounds: {
                mainSelector: 'main',
                desktopSelector: 'object#desktop, #desktop',
                footerSelector: 'footer, #tableau',
            },
        },
        macos: {
            skipSlots: ['launchpad'],
            bounds: {
                mainSelector: 'main',
                desktopSelector: 'main, #desktop',
                footerSelector: 'footer, .dock, nav',
            },
            headerLayout: 'macos',
        },
        windows: {
            requireHeader: true,
            skipSlots: [],
            bounds: {
                mainSelector: 'main',
                desktopSelector: 'main',
                footerSelector: 'footer',
            },
            headerLayout: 'windows',
        },
        android: {
            skipSlots: ['mainMenu'],
            bounds: {
                mainSelector: 'main',
                desktopSelector: 'main object, main',
                footerSelector: 'footer, #navigation',
            },
        },
        ios: {
            skipSlots: [],
            bounds: {
                mainSelector: 'main',
                desktopSelector: 'main',
                footerSelector: 'footer, nav',
            },
        },
    };

    const DEFAULT_SKIP = [];

    let cached = null;

    function detectFamily() {
        if (global.CAPSULE_WINDOW_FAMILY) {
            return String(global.CAPSULE_WINDOW_FAMILY);
        }
        if (global.CAPSULE_PICK_OS) {
            const pick = String(global.CAPSULE_PICK_OS);
            if (pick === 'windows') return 'windows';
            if (pick === 'android') return 'android';
            if (pick === 'ios') return 'ios';
        }
        const body = global.document && global.document.body;
        if (body) {
            if (body.dataset && body.dataset.winVersion) return 'windows';
            if (body.id === 'android') return 'android';
            if (body.id === 'mint' || body.id === 'ubuntu' || body.id === 'fedora'
                || body.id === 'opensuse' || body.id === 'popos' || body.id === 'mx-kde'
                || body.id === 'debian-kde' || body.id === 'kde-neon' || body.id === 'anduinos') {
                return 'linux';
            }
        }
        if (global.location && String(global.location.pathname).indexOf('/macos/') !== -1) {
            return 'macos';
        }
        return 'linux';
    }

    function normalizeSkipSlots(raw) {
        const list = Array.isArray(raw) ? raw.slice() : [];
        return new Set(list.map((id) => String(id)));
    }

    function getContext() {
        if (cached) {
            return cached;
        }
        const family = detectFamily();
        const familyDefaults = FAMILY_DEFAULTS[family] || FAMILY_DEFAULTS.linux;
        const user = global.CAPSULE_WINDOW_CONTEXT && typeof global.CAPSULE_WINDOW_CONTEXT === 'object'
            ? global.CAPSULE_WINDOW_CONTEXT
            : {};

        const skipRaw = user.skipSlots != null ? user.skipSlots : familyDefaults.skipSlots;
        cached = {
            family: user.family || family,
            draggable: user.draggable !== false,
            resizable: user.resizable !== false,
            requireHeader: user.requireHeader === true
                || familyDefaults.requireHeader === true,
            allowMainMenuChrome: user.allowMainMenuChrome === true,
            forceOnOpen: user.forceOnOpen !== false,
            edgeTiling: user.edgeTiling !== false,
            skipSlots: normalizeSkipSlots(skipRaw || DEFAULT_SKIP),
            bounds: Object.assign({}, familyDefaults.bounds || {}, user.bounds || {}),
            headerLayout: user.headerLayout || familyDefaults.headerLayout || 'capsule',
        };
        return cached;
    }

    function resetContextCache() {
        cached = null;
    }

    function isGnomeStartMenuContainer(container) {
        return !!(container && container.querySelector('#menu-gnome-root'));
    }

    function shouldSkipWindowChrome(container, slotId) {
        const ctx = getContext();
        if (!container || !slotId) {
            return true;
        }
        if (ctx.skipSlots.has(slotId)) {
            if (slotId === 'mainMenu' && ctx.allowMainMenuChrome) {
                return isGnomeStartMenuContainer(container);
            }
            return true;
        }
        if (slotId === 'mainMenu' && isGnomeStartMenuContainer(container)) {
            return true;
        }
        return false;
    }

    function resolveBoundsOptions() {
        const b = getContext().bounds;
        return {
            mainSelector: b.mainSelector,
            desktopSelector: b.desktopSelector,
            footerSelector: b.footerSelector,
            subtractFooter: b.subtractFooter,
        };
    }

    function clearInteractionFlags(container) {
        if (!container) {
            return;
        }
        delete container.dataset.dragInit;
        delete container.dataset.resizeInit;
        if (typeof global.CapsuleWindowDrag !== 'undefined'
            && typeof global.CapsuleWindowDrag.disableDrag === 'function') {
            global.CapsuleWindowDrag.disableDrag(container);
        }
    }

    function markManaged(container, slotId) {
        if (!container) {
            return;
        }
        container.dataset.capsuleWindowManaged = 'true';
        container.dataset.capsuleWindowSlot = slotId || container.getAttribute('data-link') || '';
    }

    function applyWindowInteraction(container, slotId, options) {
        options = options || {};
        if (shouldSkipWindowChrome(container, slotId)) {
            return false;
        }

        const ctx = getContext();
        const bounds = resolveBoundsOptions();
        const force = options.force === true || ctx.forceOnOpen;

        if (!ctx.draggable && !ctx.resizable) {
            return false;
        }

        if (force) {
            clearInteractionFlags(container);
        }

        markManaged(container, slotId);

        if (typeof global.CapsuleWindow !== 'undefined') {
            if (ctx.draggable && typeof global.CapsuleWindow.initWindowInteraction === 'function') {
                global.CapsuleWindow.initWindowInteraction(container, slotId, {
                    forceDrag: force,
                    requireHeader: ctx.requireHeader,
                    dragHandle: options.dragHandle || 'auto',
                    bounds: bounds,
                });
            } else if (ctx.resizable && typeof global.CapsuleWindow.enableResize === 'function') {
                global.CapsuleWindow.enableResize(container, { bounds: bounds });
            }
            return true;
        }

        if (ctx.draggable && typeof global.makeDraggable === 'function') {
            global.makeDraggable(container, { requireHeader: ctx.requireHeader });
        }
        if (ctx.resizable) {
            if (typeof global.makeResizable === 'function') {
                global.makeResizable(container);
            } else if (typeof global.Resizer === 'function') {
                new global.Resizer(container);
            }
            container.dataset.resizeInit = 'true';
        }
        return true;
    }

    function ensureWindowChrome(container, slotId, options) {
        options = options || {};
        if (shouldSkipWindowChrome(container, slotId)) {
            return;
        }

        const ctx = getContext();

        if (ctx.headerLayout === 'macos'
            && typeof global.CapsuleWindowShell !== 'undefined'
            && typeof global.CapsuleWindowShell.ensureMacHeader === 'function') {
            global.CapsuleWindowShell.ensureMacHeader(container);
            if (options.initInteraction !== false) {
                applyWindowInteraction(container, slotId, { force: options.force === true });
            }
            return;
        }

        if (ctx.headerLayout === 'capsule'
            && typeof global.CapsuleWindow !== 'undefined'
            && global.CapsuleWindow.ensureChrome) {
            const bounds = resolveBoundsOptions();
            global.CapsuleWindow.ensureChrome(container, slotId, {
                forceDrag: options.force === true,
                initInteraction: options.initInteraction !== false,
                requireHeader: ctx.requireHeader,
                bounds: bounds,
            });
            markManaged(container, slotId);
            return;
        }

        if (typeof global.CapsuleWindowChrome !== 'undefined'
            && global.CapsuleWindowChrome.ensureHeader) {
            global.CapsuleWindowChrome.ensureHeader(container, slotId);
            if (global.CapsuleWindowChrome.applyKdeWindowHeaderIcons) {
                global.CapsuleWindowChrome.applyKdeWindowHeaderIcons(container);
            }
        }

        if (options.initInteraction !== false) {
            applyWindowInteraction(container, slotId, { force: options.force === true });
        }
    }

    function ensureChromeAfterSlotInject(container, slotId, options) {
        options = options || {};
        if (!container) {
            return;
        }
        if (!options.forceWhenHidden && container.style.display === 'none') {
            return;
        }
        ensureWindowChrome(container, slotId, { force: true, initInteraction: true });
    }

    function bindVisibleWindows() {
        if (typeof document === 'undefined') {
            return;
        }
        document.querySelectorAll('.windowElement[data-link]').forEach((container) => {
            const slotId = container.getAttribute('data-link');
            if (container.style.display === 'none') {
                return;
            }
            ensureChromeAfterSlotInject(container, slotId);
        });
    }

    function boot() {
        resetContextCache();
        bindVisibleWindows();
    }

    if (typeof document !== 'undefined') {
        document.addEventListener('capsule:slot-injected', (event) => {
            const detail = event.detail || {};
            if (detail.container && detail.slotId) {
                ensureChromeAfterSlotInject(detail.container, detail.slotId, {
                    forceWhenHidden: detail.slotId === 'firefox',
                });
                if (detail.slotId === 'firefox'
                    && typeof window.CapsuleWindowChrome !== 'undefined'
                    && typeof window.CapsuleWindowChrome.syncFirefoxGnomeChrome === 'function') {
                    window.CapsuleWindowChrome.syncFirefoxGnomeChrome(detail.container);
                }
            }
        });
        document.addEventListener('capsule-skin-ready', () => {
            resetContextCache();
            bindVisibleWindows();
        });
    }

    function resolveBoundsOptionsForApi(overrides = {}) {
        if (global.CapsuleWindowBounds && typeof global.CapsuleWindowBounds.resolveBoundsOptions === 'function') {
            return global.CapsuleWindowBounds.resolveBoundsOptions(overrides);
        }
        const b = getContext().bounds || {};
        return Object.assign({}, b, overrides);
    }

    const api = {
        getContext: getContext,
        resetContextCache: resetContextCache,
        resolveBoundsOptions: resolveBoundsOptionsForApi,
        shouldSkipWindowChrome: shouldSkipWindowChrome,
        applyWindowInteraction: applyWindowInteraction,
        ensureWindowChrome: ensureWindowChrome,
        ensureChromeAfterSlotInject: ensureChromeAfterSlotInject,
        bindVisibleWindows: bindVisibleWindows,
        boot: boot,
    };

    global.CapsuleWindowContext = api;
    global.CapsuleLinuxWindowContext = api;
}(typeof window !== 'undefined' ? window : globalThis));
