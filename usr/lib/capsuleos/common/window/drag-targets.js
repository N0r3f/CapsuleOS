/**
 * Cibles de drag titre / headerbar — zones explicites entre contrôles interactifs.
 */
(function initCapsuleWindowDragTargets(global) {
    'use strict';

    const DRAG_REGION_SELECTOR = '[data-window-drag-region]';
    const DRAG_HANDLE_SELECTOR = '#windowHeader, [data-window-drag-handle]';
    const INTERACTIVE_SELECTOR = 'button, input, textarea, select, a, label, [role="button"]';
    const BLOCKED_APP_SELECTOR = [
        '.nemo-app__toolbar:not([data-window-drag-handle])',
        '.nemo-app__main',
        '.nemo-app__statusbar',
        '.nemo-app__content-grid',
        '#voletnemo',
        '#nemoFooterContainer',
    ].join(', ');

    function usesDragPassthrough(handle) {
        return !!(handle && handle.getAttribute('data-window-drag-passthrough') === 'true');
    }

    function isHiddenDragHeader(header) {
        if (!header) {
            return true;
        }
        if (header.getAttribute('aria-hidden') === 'true') {
            return true;
        }
        const doc = header.ownerDocument;
        const view = doc && doc.defaultView;
        if (!view || typeof view.getComputedStyle !== 'function') {
            return false;
        }
        const style = view.getComputedStyle(header);
        return style.display === 'none' || style.visibility === 'hidden';
    }

    function resolveIntegratedAppDragHandle(element) {
        return element.querySelector(
            '.nautilus-app__win-head[data-window-drag-handle],'
            + ' .nautilus-app__win-head[data-window-drag-passthrough],'
            + ' [data-window-drag-handle]:not(#windowHeader)'
        );
    }

    function resolveDragHandle(element, options) {
        if (options && options.dragHandle && options.dragHandle !== 'auto') {
            return element.querySelector(options.dragHandle);
        }
        const header = element.querySelector('#windowHeader');
        const integrated = resolveIntegratedAppDragHandle(element);
        if (options && options.requireHeader === true) {
            if (header && !isHiddenDragHeader(header)) {
                return header;
            }
            return integrated || element;
        }
        return integrated
            || element.querySelector('[data-window-drag-handle]')
            || header
            || element;
    }

    function isInsideDragHandle(element, target, options) {
        const dragHandle = resolveDragHandle(element, options || {});
        if (!dragHandle) {
            return false;
        }
        return dragHandle === element || dragHandle.contains(target);
    }

    function isExplicitDragRegion(target) {
        return !!(target && target.closest(DRAG_REGION_SELECTOR));
    }

    function isTitlebarPointerTarget(element, target, options) {
        if (!target || !element) {
            return false;
        }
        if (!isInsideDragHandle(element, target, options)) {
            return false;
        }
        if (isExplicitDragRegion(target)) {
            return true;
        }
        if (target.closest(BLOCKED_APP_SELECTOR)) {
            return false;
        }
        if (target.closest('#windowTitle, .fr-app__title')) {
            return true;
        }

        const handle = resolveDragHandle(element, options || {});
        const interactive = target.closest(INTERACTIVE_SELECTOR);

        if (!interactive) {
            return true;
        }

        if (handle && usesDragPassthrough(handle)) {
            return false;
        }

        return false;
    }

    function ensureHeaderDragFill(header) {
        if (!header || header.querySelector('.window-drag-region--header-fill')) {
            return;
        }
        const fill = document.createElement('span');
        fill.className = 'window-drag-region window-drag-region--header-fill';
        fill.setAttribute('data-window-drag-region', '');
        fill.setAttribute('aria-hidden', 'true');
        header.insertBefore(fill, header.firstChild);
        const title = header.querySelector('#windowTitle');
        if (title && !title.hasAttribute('data-window-drag-region')) {
            title.setAttribute('data-window-drag-region', '');
        }
    }

    function markDragPassthrough(handle) {
        if (!handle) {
            return;
        }
        handle.setAttribute('data-window-drag-handle', '');
        handle.setAttribute('data-window-drag-passthrough', 'true');
    }

    const api = {
        DRAG_REGION_SELECTOR,
        DRAG_HANDLE_SELECTOR,
        INTERACTIVE_SELECTOR,
        usesDragPassthrough,
        resolveDragHandle,
        isInsideDragHandle,
        isExplicitDragRegion,
        isTitlebarPointerTarget,
        ensureHeaderDragFill,
        markDragPassthrough,
    };

    global.CapsuleWindowDragTargets = api;
}(typeof window !== 'undefined' ? window : globalThis));
