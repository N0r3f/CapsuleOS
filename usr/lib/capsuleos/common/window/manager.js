/**
 * Façade CapsuleWindow — cycle de vie fenêtre.
 */
(function initCapsuleWindowManager(global) {
    'use strict';

    const bounds = () => global.CapsuleWindowBounds;
    const stack = () => global.CapsuleWindowStack;
    const max = () => global.CapsuleWindowMaximize;
    const drag = () => global.CapsuleWindowDrag;
    const resize = () => global.CapsuleWindowResize;
    const chrome = () => global.CapsuleWindowChrome;

    function callFactory(factory, method) {
        var mod = factory();
        var args = Array.prototype.slice.call(arguments, 2);
        if (mod && typeof mod[method] === 'function') {
            return mod[method].apply(mod, args);
        }
    }

    function initWindow(element, config) {
        config = config || {};
        if (!element || element.dataset.capsuleWindowInit === 'true') {
            return element;
        }

        const slotId = config.slotId || element.dataset.link || '';
        const boundsOptions = config.bounds || {};

        if (config.ensureHeader !== false) {
            callFactory(chrome, 'ensureHeader', element, slotId);
            callFactory(chrome, 'afterInject', element, slotId);
        }

        if (config.resizable !== false) {
            var resizeOpts = Object.assign({ bounds: boundsOptions }, config.resize || {});
            callFactory(resize, 'enableResize', element, resizeOpts);
        }

        if (config.draggable !== false) {
            const dragOptions = {
                requireHeader: config.requireHeader === true,
                dragHandle: config.dragHandle || 'auto',
                bounds: boundsOptions,
            };
            callFactory(drag, 'enableDrag', element, dragOptions);
        }

        element.dataset.capsuleWindowInit = 'true';
        return element;
    }

    function ensureChrome(container, slotId, options) {
        options = options || {};
        if (!container) {
            return;
        }

        callFactory(chrome, 'ensureHeader', container, slotId);
        callFactory(chrome, 'afterInject', container, slotId);

        if (options.forceDrag) {
            callFactory(drag, 'disableDrag', container);
        }

        const isGnomeStartMenu = slotId === 'mainMenu'
            && !!container.querySelector('#menu-gnome-root');
        if (!isGnomeStartMenu && options.initInteraction !== false) {
            initWindowInteraction(container, slotId, options);
        }
    }

    function initWindowInteraction(container, slotId, options) {
        options = options || {};
        const isGnomeStartMenu = slotId === 'mainMenu'
            && !!container.querySelector('#menu-gnome-root');
        if (!container || isGnomeStartMenu) {
            return;
        }

        if (options.forceDrag && container.dataset.dragInit === 'true') {
            callFactory(drag, 'disableDrag', container);
        }

        if (container.dataset.dragInit !== 'true') {
            callFactory(drag, 'enableDrag', container, {
                requireHeader: options.requireHeader === true,
                dragHandle: options.dragHandle || 'auto',
                bounds: options.bounds || {},
            });
        }

        if (container.dataset.resizeInit !== 'true') {
            callFactory(resize, 'enableResize', container, { bounds: options.bounds || {} });
        }

        const pos = global.CapsuleWindowPositioning;
        if (global.CAPSULE_WINDOW_FAMILY !== 'linux'
            && pos
            && typeof pos.syncAnchorFromLayout === 'function') {
            pos.syncAnchorFromLayout(container, options.bounds || {});
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
        ensureChrome(container, slotId, { forceDrag: true, initInteraction: true });
    }

    function activateWindow(container) {
        callFactory(stack, 'activateWindow', container);
    }

    global.CapsuleWindow = {
        initWindow,
        ensureChrome,
        ensureHeader: function (container, slotId) {
            return callFactory(chrome, 'ensureHeader', container, slotId);
        },
        initWindowInteraction,
        ensureChromeAfterSlotInject,
        activateWindow,
        enableDrag: function (el, opts) {
            return callFactory(drag, 'enableDrag', el, opts);
        },
        enableResize: function (el, opts) {
            return callFactory(resize, 'enableResize', el, opts);
        },
        getWorkAreaRect: function (opts) {
            return callFactory(bounds, 'getWorkAreaRect', opts);
        },
        restoreWindowElement: function (el) {
            return callFactory(max, 'restoreWindowElement', el);
        },
        maximizeWindowElement: function (el, opts) {
            return callFactory(max, 'maximizeWindowElement', el, opts);
        },
        toggleWindowMaximized: function (el, opts) {
            return callFactory(max, 'toggleWindowMaximized', el, opts);
        },
        registerChromeProvider: function (id, p) {
            return callFactory(chrome, 'registerChromeProvider', id, p);
        },
        getHeaderTemplate: function () {
            var c = chrome();
            return c ? c.getHeaderTemplate() : undefined;
        },
        createHeaderTemplate: function () {
            var c = chrome();
            var template = c ? c.getHeaderTemplate() : null;
            return template ? template.cloneNode(true) : null;
        },
    };

    global.ensureWindowChromeAfterSlotInject = ensureChromeAfterSlotInject;
}(typeof window !== 'undefined' ? window : globalThis));
