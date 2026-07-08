/**
 * Ancrage fenêtre — object#desktop : position absolute (évite fixed + overflow).
 */
(function initCapsuleWindowPositioning(global) {
    'use strict';

    const boundsApi = () => global.CapsuleWindowBounds;

    function resolveDesktopRoot(options = {}) {
        if (typeof document === 'undefined') {
            return null;
        }
        const selector = options.desktopSelector || options.mainSelector;
        if (!selector) {
            return null;
        }
        return document.querySelector(selector);
    }

    function shouldUseDesktopAnchor(element, options = {}) {
        const root = resolveDesktopRoot(options);
        if (!root || !element || !root.contains(element)) {
            return false;
        }
        if (root.tagName === 'OBJECT') {
            return true;
        }
        return root.id === 'desktop';
    }

    function desktopRootOffset(options = {}) {
        const root = resolveDesktopRoot(options);
        if (!root) {
            return { left: 0, top: 0 };
        }
        const rect = root.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
    }

    function applyViewportBox(element, box, options = {}) {
        if (!element || !box) {
            return box;
        }

        element.style.transform = 'none';
        element.style.marginLeft = '0';
        element.style.marginRight = '0';

        if (shouldUseDesktopAnchor(element, options)) {
            const offset = desktopRootOffset(options);
            element.style.position = 'absolute';
            element.style.left = `${box.left - offset.left}px`;
            element.style.top = `${box.top - offset.top}px`;
        } else {
            element.style.position = 'fixed';
            element.style.left = `${box.left}px`;
            element.style.top = `${box.top}px`;
        }

        if (box.width != null) {
            element.style.width = `${box.width}px`;
        }
        if (box.height != null) {
            element.style.height = `${box.height}px`;
        }

        return box;
    }

    function applyViewportPosition(element, left, top, options = {}) {
        if (!boundsApi() || typeof boundsApi().clampPosition !== 'function') {
            return null;
        }
        const clamped = boundsApi().clampPosition(element, left, top, options);
        return applyViewportBox(element, clamped, options);
    }

    function syncAnchorFromLayout(element, options = {}) {
        if (!element || element.style.display === 'none') {
            return;
        }
        if (!shouldUseDesktopAnchor(element, options)) {
            return;
        }
        const rect = element.getBoundingClientRect();
        applyViewportPosition(element, rect.left, rect.top, options);
    }

    function bindOpenSync() {
        if (typeof document === 'undefined') {
            return;
        }
        document.addEventListener('capsule:window-opened', (event) => {
            if (global.CAPSULE_WINDOW_FAMILY === 'linux') {
                return;
            }
            const detail = event.detail || {};
            if (!detail.container) {
                return;
            }
            const opts = global.CAPSULE_WINDOW_CONTEXT && global.CAPSULE_WINDOW_CONTEXT.bounds
                ? global.CAPSULE_WINDOW_CONTEXT.bounds
                : {};
            global.requestAnimationFrame(() => {
                syncAnchorFromLayout(detail.container, opts);
            });
        });
    }

    global.CapsuleWindowPositioning = {
        resolveDesktopRoot,
        shouldUseDesktopAnchor,
        desktopRootOffset,
        applyViewportBox,
        applyViewportPosition,
        syncAnchorFromLayout,
    };

    bindOpenSync();
}(typeof window !== 'undefined' ? window : globalThis));
