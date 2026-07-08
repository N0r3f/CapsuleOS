/**
 * Maximisation / restauration fenêtre (work-area).
 */
(function initCapsuleWindowMaximize(global) {
    'use strict';

    const bounds = () => global.CapsuleWindowBounds;

    function resolveBoundsOptions(options = {}) {
        if (bounds() && typeof bounds().resolveBoundsOptions === 'function') {
            return bounds().resolveBoundsOptions(options);
        }
        return options;
    }

    function storeRestoreState(windowElement) {
        if (!windowElement || windowElement.dataset.maximized === 'true') {
            return;
        }

        windowElement.dataset.prevLeft = windowElement.style.left || '';
        windowElement.dataset.prevTop = windowElement.style.top || '';
        windowElement.dataset.prevWidth = windowElement.style.width || '';
        windowElement.dataset.prevHeight = windowElement.style.height || '';
        windowElement.dataset.prevPosition = windowElement.style.position || '';
        windowElement.dataset.prevTransform = windowElement.style.transform || '';
        windowElement.dataset.prevMarginLeft = windowElement.style.marginLeft || '';
        windowElement.dataset.prevMarginRight = windowElement.style.marginRight || '';
    }

    function restoreWindowElement(windowElement) {
        if (!windowElement) {
            return false;
        }

        windowElement.style.width = windowElement.dataset.prevWidth || '';
        windowElement.style.height = windowElement.dataset.prevHeight || '';
        windowElement.style.position = windowElement.dataset.prevPosition || 'fixed';
        windowElement.style.top = windowElement.dataset.prevTop || '';
        windowElement.style.left = windowElement.dataset.prevLeft || '';
        windowElement.style.transform = windowElement.dataset.prevTransform || '';
        windowElement.style.marginLeft = windowElement.dataset.prevMarginLeft || '';
        windowElement.style.marginRight = windowElement.dataset.prevMarginRight || '';
        windowElement.dataset.maximized = 'false';
        delete windowElement.dataset.tiled;
        return true;
    }

    function maximizeWindowElement(windowElement, options = {}) {
        if (!windowElement) {
            return false;
        }

        const boundsOpts = resolveBoundsOptions(options);
        const work =(bounds() == null ? void 0 : bounds().getWorkAreaRect)(boundsOpts) || {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
        };

        storeRestoreState(windowElement);

        const box = {
            left: work.left,
            top: work.top,
            width: work.width,
            height: work.height,
        };
        if (global.CapsuleWindowPositioning
            && typeof global.CapsuleWindowPositioning.applyViewportBox === 'function') {
            global.CapsuleWindowPositioning.applyViewportBox(windowElement, box, boundsOpts);
        } else {
            windowElement.style.position = 'fixed';
            windowElement.style.transform = 'none';
            windowElement.style.marginLeft = '0';
            windowElement.style.marginRight = '0';
            windowElement.style.left = `${work.left}px`;
            windowElement.style.top = `${work.top}px`;
            windowElement.style.width = `${work.width}px`;
            windowElement.style.height = `${work.height}px`;
        }
        windowElement.dataset.maximized = 'true';
        return true;
    }

    function toggleWindowMaximized(windowElement, options = {}) {
        if (!windowElement) {
            return false;
        }
        if (windowElement.dataset.maximized === 'true') {
            return restoreWindowElement(windowElement);
        }
        return maximizeWindowElement(windowElement, options);
    }

    global.CapsuleWindowMaximize = {
        storeRestoreState,
        restoreWindowElement,
        maximizeWindowElement,
        toggleWindowMaximized,
    };

    global.restoreWindowElement = restoreWindowElement;
    global.maximizeWindowElement = maximizeWindowElement;
    global.toggleWindowMaximized = toggleWindowMaximized;
}(typeof window !== 'undefined' ? window : globalThis));
