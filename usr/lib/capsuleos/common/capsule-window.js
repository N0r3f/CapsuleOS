/**
 * CapsuleOS window kernel (bundle généré).
 * Source : usr/lib/capsuleos/common/window/
 * Regénérer : node usr/lib/capsuleos/tools/build-capsule-window.mjs
 */
/**
 * Bornes fenêtre partagées (drag + resize).
 */
(function initCapsuleWindowBounds(global) {
    'use strict';

    const defaultBoundsOptions = {
        mainSelector: 'main',
        desktopSelector: '#desktop',
        footerSelector: 'footer',
    };

    function shouldSubtractFooter(opts) {
        if (opts.subtractFooter === false) {
            return false;
        }
        const selector = opts.footerSelector;
        return typeof selector === 'string' && selector.trim().length > 0;
    }

    function resolveBoundsOptions(options = {}) {
        let contextBounds = {};
        if (global.CapsuleWindowContext && typeof global.CapsuleWindowContext.getContext === 'function') {
            const ctx = global.CapsuleWindowContext.getContext();
            if (ctx && ctx.bounds && typeof ctx.bounds === 'object') {
                contextBounds = ctx.bounds;
            }
        } else if (global.CAPSULE_WINDOW_CONTEXT && global.CAPSULE_WINDOW_CONTEXT.bounds) {
            contextBounds = global.CAPSULE_WINDOW_CONTEXT.bounds;
        }
        return Object.assign({}, defaultBoundsOptions, contextBounds, options);
    }

    function getWorkAreaRect(options = {}) {
        const opts = resolveBoundsOptions(options);
        const main = opts.mainSelector
            ? document.querySelector(opts.mainSelector)
            : null;
        const desktop = opts.desktopSelector
            ? document.querySelector(opts.desktopSelector)
            : null;

        let rect;
        if (main) {
            rect = main.getBoundingClientRect();
        } else if (desktop) {
            rect = desktop.getBoundingClientRect();
        } else {
            rect = document.documentElement.getBoundingClientRect();
        }

        let footerHeight = 0;
        if (shouldSubtractFooter(opts)) {
            const footer = document.querySelector(opts.footerSelector);
            footerHeight = footer ? footer.offsetHeight : 0;
        }

        return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: Math.max(120, rect.height - footerHeight),
            right: rect.right,
            bottom: rect.bottom - footerHeight,
        };
    }

    function clampPosition(element, left, top, options = {}) {
        const bounds = getWorkAreaRect(options);
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const maxLeft = bounds.right - width;
        const maxTop = bounds.bottom - height;

        return {
            left: Math.max(bounds.left, Math.min(left, maxLeft)),
            top: Math.max(bounds.top, Math.min(top, maxTop)),
        };
    }

    function resolveResizeAnchors(direction) {
        const dir = String(direction || '');
        return {
            anchorRight: dir === 'left' || dir === 'top-left' || dir === 'bottom-left',
            anchorLeft: dir === 'right' || dir === 'top-right' || dir === 'bottom-right',
            anchorBottom: dir === 'top' || dir === 'top-left' || dir === 'top-right',
            anchorTop: dir === 'bottom' || dir === 'bottom-left' || dir === 'bottom-right',
        };
    }

    function clampHorizontalSize(bounds, left, width, minWidth, anchors) {
        let nextLeft = left;
        let nextWidth = width;

        if (anchors.anchorRight) {
            const right = left + width;
            nextWidth = Math.max(minWidth, width);
            nextLeft = right - nextWidth;
            if (nextLeft < bounds.left) {
                nextLeft = bounds.left;
                nextWidth = right - nextLeft;
            }
            nextWidth = Math.max(minWidth, nextWidth);
            if (nextLeft + nextWidth > bounds.right) {
                nextWidth = Math.max(minWidth, bounds.right - nextLeft);
                nextLeft = bounds.right - nextWidth;
            }
            nextLeft = Math.max(bounds.left, nextLeft);
        } else if (anchors.anchorLeft) {
            nextLeft = Math.max(bounds.left, left);
            nextWidth = Math.max(minWidth, width);
            nextWidth = Math.min(nextWidth, bounds.right - nextLeft);
            nextWidth = Math.max(minWidth, nextWidth);
        } else {
            nextWidth = Math.max(minWidth, Math.min(width, bounds.right - bounds.left));
            nextLeft = Math.max(bounds.left, Math.min(left, bounds.right - nextWidth));
        }

        return { left: nextLeft, width: nextWidth };
    }

    function clampVerticalSize(bounds, top, height, minHeight, anchors) {
        let nextTop = top;
        let nextHeight = height;

        if (anchors.anchorBottom) {
            const bottom = top + height;
            nextHeight = Math.max(minHeight, height);
            nextTop = bottom - nextHeight;
            if (nextTop < bounds.top) {
                nextTop = bounds.top;
                nextHeight = bottom - nextTop;
            }
            nextHeight = Math.max(minHeight, nextHeight);
            if (nextTop + nextHeight > bounds.bottom) {
                nextHeight = Math.max(minHeight, bounds.bottom - nextTop);
                nextTop = bounds.bottom - nextHeight;
            }
            nextTop = Math.max(bounds.top, nextTop);
        } else if (anchors.anchorTop) {
            nextTop = Math.max(bounds.top, top);
            nextHeight = Math.max(minHeight, height);
            nextHeight = Math.min(nextHeight, bounds.bottom - nextTop);
            nextHeight = Math.max(minHeight, nextHeight);
        } else {
            nextHeight = Math.max(minHeight, Math.min(height, bounds.bottom - bounds.top));
            nextTop = Math.max(bounds.top, Math.min(top, bounds.bottom - nextHeight));
        }

        return { top: nextTop, height: nextHeight };
    }

    function clampSize(element, left, top, width, height, options = {}, hints = {}) {
        const bounds = getWorkAreaRect(options);
        const computed = window.getComputedStyle(element);
        const minWidth = parseFloat(computed.minWidth) || 320;
        const minHeight = parseFloat(computed.minHeight) || 180;
        const anchors = resolveResizeAnchors(hints.direction);

        const horizontal = clampHorizontalSize(bounds, left, width, minWidth, anchors);
        const vertical = clampVerticalSize(bounds, top, height, minHeight, anchors);

        return {
            left: horizontal.left,
            top: vertical.top,
            width: horizontal.width,
            height: vertical.height,
        };
    }

    global.CapsuleWindowBounds = {
        resolveBoundsOptions,
        getWorkAreaRect,
        clampPosition,
        clampSize,
        resolveResizeAnchors,
    };
}(typeof window !== 'undefined' ? window : globalThis));
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
/**
 * Pile de fenêtres (z-index, activation).
 */
(function initCapsuleWindowStack(global) {
    'use strict';

    let zCounter = 50;

    function activateWindow(container) {
        if (!container) {
            return;
        }

        document.querySelectorAll('.windowElementActive').forEach((win) => {
            win.classList.remove('windowElementActive');
        });

        container.classList.add('windowElementActive');
        container.style.zIndex = `${++zCounter}`;
    }

    function bringToFront(container) {
        if (!container) {
            return;
        }
        container.style.zIndex = `${++zCounter}`;
    }

    global.CapsuleWindowStack = {
        activateWindow,
        bringToFront,
        getZCounter: () => zCounter,
        resetZCounter: (value = 50) => {
            zCounter = value;
        },
    };
}(typeof window !== 'undefined' ? window : globalThis));
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
/**
 * Déplacement fenêtre (Pointer Events).
 */
(function initCapsuleWindowDrag(global) {
    'use strict';

    const boundsApi = () => global.CapsuleWindowBounds;
    const maxApi = () => global.CapsuleWindowMaximize;
    const targetsApi = () => global.CapsuleWindowDragTargets;

    function resolveDragHandle(element, options) {
        const api = targetsApi();
        if (api && typeof api.resolveDragHandle === 'function') {
            return api.resolveDragHandle(element, options);
        }
        if (options.dragHandle && options.dragHandle !== 'auto') {
            return element.querySelector(options.dragHandle);
        }
        const integrated = element.querySelector('[data-window-drag-handle]:not(#windowHeader)');
        const header = element.querySelector('#windowHeader');
        if (options.requireHeader === true) {
            if (header) {
                const view = element.ownerDocument && element.ownerDocument.defaultView;
                const hidden = view && typeof view.getComputedStyle === 'function'
                    && (view.getComputedStyle(header).display === 'none'
                        || view.getComputedStyle(header).visibility === 'hidden'
                        || header.getAttribute('aria-hidden') === 'true');
                if (!hidden) {
                    return header;
                }
            }
            return integrated || element;
        }
        return integrated
            || element.querySelector('[data-window-drag-handle]')
            || header
            || element;
    }

    function isDragStartTarget(element, target, options) {
        const api = targetsApi();
        if (api && typeof api.isTitlebarPointerTarget === 'function') {
            return api.isTitlebarPointerTarget(element, target, options);
        }
        const dragHandle = resolveDragHandle(element, options);
        if (!dragHandle || !(dragHandle === element || dragHandle.contains(target))) {
            return false;
        }
        if (target.closest('button, input, textarea, select, a, label')) {
            return false;
        }
        return true;
    }

    function applyPosition(element, left, top, boundsOptions) {
        if (global.CapsuleWindowPositioning
            && typeof global.CapsuleWindowPositioning.applyViewportPosition === 'function') {
            global.CapsuleWindowPositioning.applyViewportPosition(element, left, top, boundsOptions);
            return;
        }
        const next = boundsApi().clampPosition(element, left, top, boundsOptions);
        element.style.position = 'fixed';
        element.style.transform = 'none';
        element.style.marginLeft = '0';
        element.style.marginRight = '0';
        element.style.left = `${next.left}px`;
        element.style.top = `${next.top}px`;
    }

    function restoreBeforeDragging(element, event, boundsOptions) {
        if (element.dataset.maximized !== 'true' || (typeof maxApi().restoreWindowElement !== 'function')) {
            return null;
        }

        const maximizedRect = element.getBoundingClientRect();
        const pointerRatioX = maximizedRect.width > 0
            ? (event.clientX - maximizedRect.left) / maximizedRect.width
            : 0.5;
        const pointerOffsetY = event.clientY - maximizedRect.top;

        maxApi().restoreWindowElement(element);

        const restoredWidth = element.offsetWidth || maximizedRect.width;
        const restoredHeight = element.offsetHeight || maximizedRect.height;
        const offsetX = Math.max(0, Math.min(restoredWidth * pointerRatioX, restoredWidth));
        const offsetY = Math.max(0, Math.min(pointerOffsetY, restoredHeight));

        applyPosition(element, event.clientX - offsetX, event.clientY - offsetY, boundsOptions);
        return { offsetX, offsetY };
    }

    function enableDrag(element, options) {
        options = options || {};
        if (!element || element.dataset.dragInit === 'true') {
            return;
        }

        const boundsOptions = options.bounds || {};
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        let activePointerId = null;

        const onPointerMove = (event) => {
            if (!isDragging || event.pointerId !== activePointerId) {
                return;
            }
            event.preventDefault();
            applyPosition(element, event.clientX - offsetX, event.clientY - offsetY, boundsOptions);
        };

        const stopDragging = (event) => {
            if (!isDragging) {
                return;
            }
            if (event && event.pointerId !== activePointerId) {
                return;
            }
            isDragging = false;
            activePointerId = null;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', stopDragging);
            document.removeEventListener('pointercancel', stopDragging);
            if (global.CapsuleWindowEdgeTiling
                && typeof global.CapsuleWindowEdgeTiling.trySnapAfterDrag === 'function') {
                global.CapsuleWindowEdgeTiling.trySnapAfterDrag(element, boundsOptions);
            }
        };

        const startDragging = (event) => {
            if (event.button !== 0 && event.pointerType === 'mouse') {
                return;
            }
            if (!isDragStartTarget(element, event.target, options)) {
                return;
            }

            event.preventDefault();

            const restored = restoreBeforeDragging(element, event, boundsOptions);
            if (restored) {
                offsetX = restored.offsetX;
                offsetY = restored.offsetY;
            } else {
                const rect = element.getBoundingClientRect();
                offsetX = event.clientX - rect.left;
                offsetY = event.clientY - rect.top;
            }

            isDragging = true;
            activePointerId = event.pointerId;

            if (typeof event.target.setPointerCapture === 'function') {
                try {
                    event.target.setPointerCapture(event.pointerId);
                } catch (error) {
                    /* ignore */
                }
            }

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', stopDragging);
            document.addEventListener('pointercancel', stopDragging);
        };

        const handle = resolveDragHandle(element, options);
        if (!handle) {
            return;
        }

        const listenerTarget = options.requireHeader === true ? handle : element;
        listenerTarget.addEventListener('pointerdown', startDragging);

        element.dataset.dragInit = 'true';
    }

    function disableDrag(element) {
        if (!element) {
            return;
        }
        delete element.dataset.dragInit;
    }

    global.CapsuleWindowDrag = {
        enableDrag,
        disableDrag,
        resolveDragHandle,
        isDragStartTarget,
    };
    global.makeDraggable = enableDrag;
}(typeof window !== 'undefined' ? window : globalThis));
/**
 * Redimensionnement bordures fenêtre.
 */
(function initCapsuleWindowResize(global) {
    'use strict';

    const boundsApi = () => global.CapsuleWindowBounds;

    class Resizer {
        constructor(element, options = {}) {
            this.element = element;
            this.BORDER_SIZE =(options.borderSize != null ? options.borderSize : 5);
            this.boundsOptions = options.bounds || {};
            this.resizing = false;
            this.resizeDirection = '';
            this.startX = 0;
            this.startY = 0;
            this.startLeft = 0;
            this.startTop = 0;
            this.startWidth = 0;
            this.startHeight = 0;

            this.onPointerDown = this.startResize.bind(this);
            this.onPointerMove = this.checkBorder.bind(this);
            this.onPointerUp = this.stopResize.bind(this);
            this.onCursorMove = this.changeCursor.bind(this);

            this.element.addEventListener('pointerdown', this.onPointerDown);
            this.element.addEventListener('pointermove', this.onCursorMove);
        }

        startResize(e) {
            if (e.button !== 0 && e.pointerType === 'mouse') {
                return;
            }
            if (e.target.closest('#windowHeader, button, input, textarea, select, a, label')) {
                return;
            }

            const rect = this.element.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            const left = offsetX <= this.BORDER_SIZE;
            const right = offsetX >= rect.width - this.BORDER_SIZE;
            const top = offsetY <= this.BORDER_SIZE;
            const bottom = offsetY >= rect.height - this.BORDER_SIZE;

            let direction = '';
            if (top && left) direction = 'top-left';
            else if (top && right) direction = 'top-right';
            else if (bottom && left) direction = 'bottom-left';
            else if (bottom && right) direction = 'bottom-right';
            else if (left) direction = 'left';
            else if (right) direction = 'right';
            else if (top) direction = 'top';
            else if (bottom) direction = 'bottom';

            if (!direction) {
                return;
            }

            e.preventDefault();
            this.resizing = true;
            this.resizeDirection = direction;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startLeft = rect.left;
            this.startTop = rect.top;
            this.startWidth = rect.width;
            this.startHeight = rect.height;
            this.activePointerId = e.pointerId;

            document.addEventListener('pointermove', this.onPointerMove);
            document.addEventListener('pointerup', this.onPointerUp);
            document.addEventListener('pointercancel', this.onPointerUp);
        }

        checkBorder(e) {
            if (!this.resizing || e.pointerId !== this.activePointerId) {
                return;
            }
            e.preventDefault();

            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;

            let newWidth = this.startWidth;
            let newLeft = this.startLeft;
            let newHeight = this.startHeight;
            let newTop = this.startTop;

            switch (this.resizeDirection) {
                case 'left':
                    newWidth -= dx;
                    newLeft += dx;
                    break;
                case 'right':
                    newWidth += dx;
                    break;
                case 'top':
                    newHeight -= dy;
                    newTop += dy;
                    break;
                case 'bottom':
                    newHeight += dy;
                    break;
                case 'top-left':
                    newWidth -= dx;
                    newLeft += dx;
                    newHeight -= dy;
                    newTop += dy;
                    break;
                case 'top-right':
                    newWidth += dx;
                    newHeight -= dy;
                    newTop += dy;
                    break;
                case 'bottom-left':
                    newWidth -= dx;
                    newLeft += dx;
                    newHeight += dy;
                    break;
                case 'bottom-right':
                    newWidth += dx;
                    newHeight += dy;
                    break;
                default:
                    break;
            }

            const clamped = boundsApi().clampSize(
                this.element,
                newLeft,
                newTop,
                newWidth,
                newHeight,
                this.boundsOptions,
                { direction: this.resizeDirection },
            );

            if (global.CapsuleWindowPositioning
                && typeof global.CapsuleWindowPositioning.applyViewportBox === 'function') {
                global.CapsuleWindowPositioning.applyViewportBox(this.element, clamped, this.boundsOptions);
            } else {
                this.element.style.position = 'fixed';
                this.element.style.width = `${clamped.width}px`;
                this.element.style.height = `${clamped.height}px`;
                this.element.style.left = `${clamped.left}px`;
                this.element.style.top = `${clamped.top}px`;
            }
        }

        stopResize(e) {
            if (!this.resizing) {
                return;
            }
            if (e && e.pointerId !== this.activePointerId) {
                return;
            }

            this.resizing = false;
            this.resizeDirection = '';
            this.activePointerId = null;
            this.element.style.cursor = 'auto';
            document.removeEventListener('pointermove', this.onPointerMove);
            document.removeEventListener('pointerup', this.onPointerUp);
            document.removeEventListener('pointercancel', this.onPointerUp);
        }

        changeCursor(e) {
            if (this.resizing) {
                return;
            }

            const rect = this.element.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            const left = offsetX <= this.BORDER_SIZE;
            const right = offsetX >= rect.width - this.BORDER_SIZE;
            const top = offsetY <= this.BORDER_SIZE;
            const bottom = offsetY >= rect.height - this.BORDER_SIZE;

            if ((left && top) || (right && bottom)) {
                this.element.style.cursor = 'nwse-resize';
            } else if ((right && top) || (left && bottom)) {
                this.element.style.cursor = 'nesw-resize';
            } else if (left || right) {
                this.element.style.cursor = 'ew-resize';
            } else if (top || bottom) {
                this.element.style.cursor = 'ns-resize';
            } else {
                this.element.style.cursor = 'auto';
            }
        }
    }

    function enableResize(element, options = {}) {
        if (!element || element.dataset.resizeInit === 'true') {
            return null;
        }
        const instance = new Resizer(element, options);
        element.dataset.resizeInit = 'true';
        return instance;
    }

    global.CapsuleWindowResize = { Resizer, enableResize };
    global.Resizer = Resizer;
}(typeof window !== 'undefined' ? window : globalThis));
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
/**
 * Chrome fenêtre — registre providers et header template.
 * Résolution toolkit : CapsuleWindowHeaderContext (etc/capsuleos/contracts/window-chrome-contexts.json).
 */
(function initCapsuleWindowChrome(global) {
    'use strict';

    const providers = {};
    const targetsApi = () => global.CapsuleWindowDragTargets;

    function headerCtx() {
        return global.CapsuleWindowHeaderContext || null;
    }

    function isKdeFamily() {
        const ctx = headerCtx();
        if (ctx && typeof ctx.isKdeFamily === 'function') {
            return ctx.isKdeFamily();
        }
        return false;
    }

    function isNautilusFamilyExplorer() {
        const ctx = headerCtx();
        if (ctx && typeof ctx.isNautilusFamilyExplorer === 'function') {
            return ctx.isNautilusFamilyExplorer();
        }
        return false;
    }

    function isDolphinExplorerSlot(slotId) {
        const ctx = headerCtx();
        if (ctx && typeof ctx.isDolphinExplorerSlot === 'function') {
            return ctx.isDolphinExplorerSlot(slotId);
        }
        return false;
    }

    function isNautilusFamilySlot(slotId) {
        const ctx = headerCtx();
        if (ctx && typeof ctx.isNautilusFamilySlot === 'function') {
            return ctx.isNautilusFamilySlot(slotId);
        }
        return false;
    }

    function isFileRollerGtkCsdSlot(slotId) {
        const ctx = headerCtx();
        if (ctx && typeof ctx.resolveChromeProviderId === 'function') {
            return ctx.resolveChromeProviderId(slotId) === 'file-roller-gtk';
        }
        return slotId === 'file_roller';
    }

    function resolveChromeProviderId(slotId) {
        const ctx = headerCtx();
        if (ctx && typeof ctx.resolveChromeProviderId === 'function') {
            return ctx.resolveChromeProviderId(slotId);
        }
        if (slotId === 'nemo') {
            return 'nemo';
        }
        return 'default';
    }

    const LIBADWAITA_CSD_ANCHORS = {
        calculator: '.gnome-calc__header',
        text_editor: '.xed-app__menubar',
        calendar: '.gnome-calendar-app__header',
        clocks: '.gnome-clocks__header',
        update_manager: '.gnome-software__titlebar',
        profile: '.gnome-app__window-chrome',
        checklist: '.checklist-app__header',
        librewriter: '.lw-menubar',
        librecalc: '.lc-menubar',
        libreoffice_startcenter: '.mint-app__header',
        libreoffice_impress: '.lim-app__toolbar',
        libreoffice_draw: '.ldr-app__toolbar',
        themes: '.gnome-settings__headerbar',
        visionneur_images: '.viewer-app__toolbar',
        visionneur_pdf: '.viewer-app__toolbar',
        lecteur_multimedia: '.celluloid-app__menubar',
        snapshot: '.gnome-snapshot__header',
        screenshot: '.gnome-shot__headerbar',
        baobab: '.gnome-baobab__header',
        system_monitor: '.gnome-sysmon__header',
        tour: '.gnome-tour__header',
        characters: '.gnome-characters__header',
        thunderbird: '.tbd-app__menubar',
        transmission: '.trm-app__toolbar',
        rhythmbox: '.rb-app__header',
        drawing: '.drawing-app__menubar',
        simple_scan: '.scn-app__header',
        warpinator: '.wrp-app__header',
        timeshift: '.tsh-app__header',
    };

    const LIBADWAITA_DEDICATED_CHROME_ROW_SLOTS = {
        profile: true,
    };

    function resolveLibadwaitaAnchor(container, slotId) {
        if (LIBADWAITA_DEDICATED_CHROME_ROW_SLOTS[slotId]) {
            const root = container.querySelector(':scope > main, :scope > section');
            if (!root) {
                return null;
            }
            let row = root.querySelector(':scope > .gnome-app__window-chrome');
            if (!row) {
                row = document.createElement('header');
                row.className = 'gnome-app__window-chrome';
                row.setAttribute('aria-label', 'Barre de titre');
                root.insertBefore(row, root.firstChild);
            }
            return row;
        }
        const anchorSelector = LIBADWAITA_CSD_ANCHORS[slotId];
        return anchorSelector ? container.querySelector(anchorSelector) : null;
    }

    function ensureLibadwaitaHeaderEnd(anchor) {
        let end = anchor.querySelector(':scope > .gnome-app__header-end');
        if (!end) {
            end = document.createElement('div');
            end.className = 'gnome-app__header-end';
            anchor.appendChild(end);
        }
        return end;
    }

    function ensureLibadwaitaDragFill(anchor) {
        let fill = anchor.querySelector(':scope > .gnome-app__header-fill');
        if (!fill) {
            fill = document.createElement('div');
            fill.className = 'gnome-app__header-fill';
            fill.setAttribute('data-window-drag-region', '');
            const end = anchor.querySelector(':scope > .gnome-app__header-end');
            if (end) {
                anchor.insertBefore(fill, end);
            } else {
                anchor.appendChild(fill);
            }
        }
        return fill;
    }

    function ensureGs50SoftwareControlsWrap(host) {
        let csdWrap = host.querySelector(':scope > .gnome-app__window-controls');
        if (!csdWrap) {
            csdWrap = document.createElement('div');
            csdWrap.className = 'gnome-app__window-controls';
            csdWrap.setAttribute('role', 'group');
            csdWrap.setAttribute('aria-label', 'Contrôles de fenêtre');
            host.appendChild(csdWrap);
        }
        return csdWrap;
    }

    function resolvesGs50SoftwareChrome(container) {
        const root = container.querySelector('#updateManagerApp.update-manager--gnome');
        if (!root || !container.querySelector('[data-um-gnome-chrome-actions]')) {
            return false;
        }
        if (root.dataset.umGnomeChrome === 'gs50-tabs') {
            return true;
        }
        const body = container.ownerDocument && container.ownerDocument.body;
        const gs50BodyIds = { fedora: true, rocky: true, alma: true, ubuntu: true, anduinos: true };
        return !!(body && gs50BodyIds[body.id]);
    }

    function ensureGs50SoftwareHeaderDrag(container) {
        const shell = container.querySelector('.gnome-software');
        if (!shell || !resolvesGs50SoftwareChrome(container)) {
            return;
        }
        let drag = shell.querySelector('[data-um-gnome-header-drag]');
        if (!drag) {
            drag = document.createElement('div');
            drag.className = 'gnome-software__header-drag window-drag-region';
            drag.setAttribute('data-um-gnome-header-drag', '');
            drag.setAttribute('data-window-drag-region', '');
            drag.setAttribute('aria-hidden', 'true');
            shell.insertBefore(drag, shell.firstChild);
        }
    }

    function reparentGs50SoftwareControls(container, header, gs50Actions) {
        gs50Actions.hidden = false;
        const csdWrap = ensureGs50SoftwareControlsWrap(gs50Actions);
        const buttons = [
            header.querySelector('#minimizeBtn'),
            header.querySelector('#resizeBtn'),
            header.querySelector('#closeBtn'),
        ];
        buttons.forEach((btn) => {
            if (btn && !csdWrap.contains(btn)) {
                csdWrap.appendChild(btn);
            }
        });
        const strayEnd = container.querySelector('.gnome-software__titlebar > .gnome-app__header-end');
        if (strayEnd) {
            strayEnd.querySelectorAll('button').forEach((btn) => {
                if (!csdWrap.contains(btn)) {
                    csdWrap.appendChild(btn);
                }
            });
            const strayWrap = strayEnd.querySelector('.gnome-app__window-controls');
            if (strayWrap && !strayWrap.childElementCount) {
                strayWrap.remove();
            }
            if (!strayEnd.childElementCount) {
                strayEnd.remove();
            }
        }
        ensureGs50SoftwareHeaderDrag(container);
    }

    function relocateLibadwaitaWindowControls(container, slotId) {
        const header = container.querySelector(':scope > #windowHeader');
        const anchor = resolveLibadwaitaAnchor(container, slotId);
        const gs50Actions = slotId === 'update_manager'
            ? container.querySelector('[data-um-gnome-chrome-actions]')
            : null;
        if (!header || !anchor) {
            return false;
        }
        if (header.dataset.libadwaitaCsd === 'true') {
            if (gs50Actions) {
                reparentGs50SoftwareControls(container, header, gs50Actions);
            }
            return true;
        }

        header.dataset.libadwaitaCsd = 'true';
        container.classList.add('gnome-app--csd');

        let csdWrap;
        if (gs50Actions) {
            csdWrap = ensureGs50SoftwareControlsWrap(gs50Actions);
        } else {
            const headerEnd = ensureLibadwaitaHeaderEnd(anchor);
            ensureLibadwaitaDragFill(anchor);
            csdWrap = headerEnd.querySelector('.gnome-app__window-controls');
            if (!csdWrap) {
                csdWrap = document.createElement('div');
                csdWrap.className = 'gnome-app__window-controls';
                csdWrap.setAttribute('role', 'group');
                csdWrap.setAttribute('aria-label', 'Contrôles de fenêtre');
                headerEnd.appendChild(csdWrap);
            }
        }

        const minBtn = header.querySelector('#minimizeBtn');
        const maxBtn = header.querySelector('#resizeBtn');
        const closeBtn = header.querySelector('#closeBtn');
        [minBtn, maxBtn, closeBtn].forEach((btn) => {
            if (btn) {
                csdWrap.appendChild(btn);
            }
        });

        const title = header.querySelector('#windowTitle');
        if (title) {
            title.setAttribute('aria-hidden', 'true');
        }

        if (gs50Actions) {
            reparentGs50SoftwareControls(container, header, gs50Actions);
        }

        return true;
    }

    function relocateNautilusWindowControls(container) {
        const header = container.querySelector(':scope > #windowHeader');
        const trailing = container.querySelector(
            '.nautilus-app__headerbar.nemo-app__toolbar .nautilus-app__trailing'
        );
        if (!header || !trailing) {
            return false;
        }
        if (header.dataset.nautilusCsd === 'true') {
            return true;
        }

        header.dataset.nautilusCsd = 'true';
        container.classList.add('gnome-app--csd');

        let csdWrap = trailing.querySelector(':scope > .gnome-app__window-controls');
        if (!csdWrap) {
            csdWrap = document.createElement('div');
            csdWrap.className = 'gnome-app__window-controls';
            csdWrap.setAttribute('role', 'group');
            csdWrap.setAttribute('aria-label', 'Contrôles de fenêtre');
            trailing.appendChild(csdWrap);
        }

        const minBtn = header.querySelector('#minimizeBtn');
        const maxBtn = header.querySelector('#resizeBtn');
        const closeBtn = header.querySelector('#closeBtn');
        [minBtn, maxBtn, closeBtn].forEach((btn) => {
            if (btn) {
                csdWrap.appendChild(btn);
            }
        });

        const title = header.querySelector('#windowTitle');
        if (title) {
            title.setAttribute('aria-hidden', 'true');
        }

        const integratedClose = trailing.querySelector('.nautilus-app__window-close');
        if (integratedClose) {
            integratedClose.hidden = true;
        }

        return true;
    }

    function relocateFileRollerWindowControls(container) {
        const header = container.querySelector(':scope > #windowHeader');
        const headerEnd = container.querySelector('.fr-app__header-end');
        if (!header || !headerEnd) {
            return false;
        }
        if (header.dataset.fileRollerCsd === 'true') {
            return true;
        }

        header.dataset.fileRollerCsd = 'true';
        container.classList.add('file-roller--csd');

        let csdWrap = headerEnd.querySelector('.fr-app__window-controls');
        if (!csdWrap) {
            csdWrap = document.createElement('div');
            csdWrap.className = 'fr-app__window-controls';
            csdWrap.setAttribute('role', 'group');
            csdWrap.setAttribute('aria-label', 'Contrôles de fenêtre');
            headerEnd.appendChild(csdWrap);
        }

        const minBtn = header.querySelector('#minimizeBtn');
        const maxBtn = header.querySelector('#resizeBtn');
        const closeBtn = header.querySelector('#closeBtn');
        [minBtn, maxBtn, closeBtn].forEach((btn) => {
            if (btn) {
                csdWrap.appendChild(btn);
            }
        });

        const title = header.querySelector('#windowTitle');
        if (title) {
            title.setAttribute('aria-hidden', 'true');
        }

        const appTitle = container.querySelector('.fr-app__title');
        if (appTitle && !appTitle.hasAttribute('data-window-drag-region')) {
            appTitle.setAttribute('data-window-drag-region', '');
        }

        return true;
    }

    function createHeaderTemplate() {
        const windowHeader = document.createElement('div');
        const left = document.createElement('nav');
        const title = document.createElement('span');
        const right = document.createElement('nav');
        const minimizeBtn = document.createElement('button');
        const maximizeBtn = document.createElement('button');
        const closeBtn = document.createElement('button');

        windowHeader.id = 'windowHeader';
        windowHeader.style.minWidth = '0';
        windowHeader.style.width = '100%';
        windowHeader.style.boxSizing = 'border-box';

        title.id = 'windowTitle';
        title.textContent = document.title;

        minimizeBtn.id = 'minimizeBtn';
        maximizeBtn.id = 'resizeBtn';
        closeBtn.id = 'closeBtn';

        windowHeader.appendChild(left);
        windowHeader.appendChild(title);
        windowHeader.appendChild(right);
        right.appendChild(minimizeBtn);
        right.appendChild(maximizeBtn);
        right.appendChild(closeBtn);

        return windowHeader;
    }

    let headerTemplate = null;

    function getHeaderTemplate() {
        if (!headerTemplate) {
            headerTemplate = createHeaderTemplate();
        }
        return headerTemplate;
    }

    function applyKdeWindowHeaderIcons(container) {
        const ctx = headerCtx();
        const useKde = ctx && typeof ctx.shouldUseKdeHeaderIcons === 'function'
            ? ctx.shouldUseKdeHeaderIcons()
            : isKdeFamily();
        if (!container || !useKde) {
            return;
        }
        const headerIconUrl = (file) => {
            const logical = `./assets/images/toolkits/kde/header/${file}`;
            if (typeof global.resolveCapsuleResourceUrl === 'function') {
                return global.resolveCapsuleResourceUrl(logical);
            }
            const toolkitBase = global.CAPSULE_TOOLKIT_ASSETS_BASE
                || (global.CAPSULE_ASSETS_BASE
                    ? `${String(global.CAPSULE_ASSETS_BASE).replace(/\/+$/, '')}/images/toolkits/kde`
                    : null);
            return toolkitBase ? `${toolkitBase}/header/${file}` : logical;
        };
        const header = container.querySelector('#windowHeader');
        if (!header) {
            return;
        }
        const minBtn = header.querySelector('#minimizeBtn');
        const resBtn = header.querySelector('#resizeBtn');
        const clsBtn = header.querySelector('#closeBtn');

        if (minBtn) {
            minBtn.style.backgroundImage = `url("${headerIconUrl('minimize.svg')}")`;
        }
        if (resBtn) {
            resBtn.style.backgroundImage = `url("${headerIconUrl('window-restore.svg')}")`;
            resBtn.style.backgroundSize = 'calc(var(--head) / 2.55)';
        }
        if (clsBtn) {
            clsBtn.style.backgroundImage = `url("${headerIconUrl('window-close.svg')}")`;
        }
    }

    function applyPassthroughChromeHeader(header) {
        const api = targetsApi();
        if (!header) {
            return;
        }
        if (api && typeof api.markDragPassthrough === 'function') {
            api.markDragPassthrough(header);
        } else {
            header.setAttribute('data-window-drag-handle', '');
            header.setAttribute('data-window-drag-passthrough', 'true');
        }
        if (api && typeof api.ensureHeaderDragFill === 'function') {
            api.ensureHeaderDragFill(header);
        }
    }

    function ensureMuffinTitleBarVisible(container) {
        if (!container) {
            return;
        }
        container.classList.remove('file-roller--csd', 'gnome-app--csd');
        const header = container.querySelector(':scope > #windowHeader');
        if (!header) {
            return;
        }
        header.hidden = false;
        header.removeAttribute('aria-hidden');
        header.style.removeProperty('display');
    }

    function resolveFirefoxGnomeTabsbar(container) {
        if (!container) {
            return null;
        }
        return container.querySelector(
            '.capsule-browser__tabsbar[data-firefox-gnome-tabstrip], .capsule-browser__tabsbar'
        );
    }

    function stripHeaderDragOverlay(header) {
        if (!header) {
            return;
        }
        header.querySelectorAll('.window-drag-region--header-fill').forEach((node) => {
            node.remove();
        });
        header.removeAttribute('data-window-drag-handle');
        header.removeAttribute('data-window-drag-passthrough');
        const title = header.querySelector('#windowTitle');
        if (title) {
            title.removeAttribute('data-window-drag-region');
        }
    }

    function cleanupFirefoxGnomeStrayHeader(container) {
        if (!container || container.dataset.link !== 'firefox') {
            return null;
        }
        const integrated = container.querySelector(
            '#windowHeader.firefox-window-controls--fedora, .capsule-browser__tabsbar #windowHeader'
        );
        container.querySelectorAll(':scope > #windowHeader').forEach((header) => {
            if (integrated && header !== integrated) {
                header.remove();
            }
        });
        return integrated || container.querySelector('#windowHeader');
    }

    function applyFirefoxGnomeDragPolicy(container) {
        const tabsbar = resolveFirefoxGnomeTabsbar(container);
        const header = cleanupFirefoxGnomeStrayHeader(container);

        if (tabsbar) {
            if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                targetsApi().markDragPassthrough(tabsbar);
            } else {
                tabsbar.setAttribute('data-window-drag-handle', '');
                tabsbar.setAttribute('data-window-drag-passthrough', 'true');
            }
        }

        if (header) {
            stripHeaderDragOverlay(header);
        }
    }

    function syncFirefoxGnomeChrome(container) {
        if (!container || container.dataset.link !== 'firefox') {
            return;
        }
        applyFirefoxGnomeDragPolicy(container);
    }

    function applyDragHandlePolicy(container, slotId, providerId) {
        const header = container.querySelector(':scope > #windowHeader');
        const appHandle = container.querySelector('[data-window-drag-handle]');
        const ctx = headerCtx();
        const unifiedExplorer = ctx
            && typeof ctx.usesUnifiedExplorerTitleBar === 'function'
            && ctx.usesUnifiedExplorerTitleBar()
            && slotId === (ctx.EXPLORER_SLOT || 'nemo');

        if (providerId === 'nemo-gnome') {
            if (header) {
                applyPassthroughChromeHeader(header);
            }
            const nautilusHeader = container.querySelector(
                '.nautilus-app__win-head, .nautilus-app__headerbar, #nemoHeaderContainer'
            );
            if (nautilusHeader) {
                if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                    targetsApi().markDragPassthrough(nautilusHeader);
                } else {
                    nautilusHeader.setAttribute('data-window-drag-handle', '');
                    nautilusHeader.setAttribute('data-window-drag-passthrough', 'true');
                }
            } else if (appHandle) {
                if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                    targetsApi().markDragPassthrough(appHandle);
                } else {
                    appHandle.setAttribute('data-window-drag-handle', '');
                    appHandle.setAttribute('data-window-drag-passthrough', 'true');
                }
            }
            return;
        }

        if (providerId === 'dolphin' && header) {
            header.setAttribute('data-window-drag-handle', '');
            header.removeAttribute('data-window-drag-passthrough');
            return;
        }

        if (providerId === 'nemo') {
            if (unifiedExplorer && header && appHandle) {
                header.setAttribute('data-window-drag-handle', '');
                header.removeAttribute('data-window-drag-passthrough');
                appHandle.removeAttribute('data-window-drag-handle');
                appHandle.removeAttribute('data-window-drag-passthrough');
                return;
            }
            if (appHandle && header) {
                applyPassthroughChromeHeader(appHandle);
                header.removeAttribute('data-window-drag-handle');
                header.removeAttribute('data-window-drag-passthrough');
                return;
            }
            if (header) {
                header.setAttribute('data-window-drag-handle', '');
                header.removeAttribute('data-window-drag-passthrough');
            }
            return;
        }

        if (providerId === 'terminal-gnome' && header) {
            if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                targetsApi().markDragPassthrough(header);
            } else {
                header.setAttribute('data-window-drag-handle', '');
                header.setAttribute('data-window-drag-passthrough', 'true');
            }
            return;
        }

        if (providerId === 'firefox-gnome') {
            applyFirefoxGnomeDragPolicy(container);
            return;
        }

        if (providerId === 'cinnamon' || providerId === 'default') {
            ensureMuffinTitleBarVisible(container);
        }

        if (providerId === 'file-roller-gtk') {
            const headerbar = container.querySelector('.fr-app__headerbar');
            if (headerbar) {
                if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                    targetsApi().markDragPassthrough(headerbar);
                } else {
                    headerbar.setAttribute('data-window-drag-handle', '');
                    headerbar.setAttribute('data-window-drag-passthrough', 'true');
                }
            }
            if (header) {
                header.removeAttribute('data-window-drag-handle');
                header.removeAttribute('data-window-drag-passthrough');
                header.setAttribute('aria-hidden', 'true');
            }
            return;
        }

        if (providerId === 'libadwaita-gnome') {
            if (slotId === 'update_manager' && resolvesGs50SoftwareChrome(container)) {
                ensureGs50SoftwareHeaderDrag(container);
                const shell = container.querySelector('.gnome-software');
                if (shell) {
                    if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                        targetsApi().markDragPassthrough(shell);
                    } else {
                        shell.setAttribute('data-window-drag-handle', '');
                        shell.setAttribute('data-window-drag-passthrough', 'true');
                    }
                }
                const titlebar = container.querySelector('.gnome-software__titlebar');
                if (titlebar) {
                    titlebar.removeAttribute('data-window-drag-handle');
                    titlebar.removeAttribute('data-window-drag-passthrough');
                }
                if (header) {
                    header.removeAttribute('data-window-drag-handle');
                    header.removeAttribute('data-window-drag-passthrough');
                    header.setAttribute('aria-hidden', 'true');
                }
                return;
            }
            const anchorSelector = LIBADWAITA_CSD_ANCHORS[slotId];
            const anchor = anchorSelector ? container.querySelector(anchorSelector) : null;
            if (anchor) {
                if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                    targetsApi().markDragPassthrough(anchor);
                } else {
                    anchor.setAttribute('data-window-drag-handle', '');
                    anchor.setAttribute('data-window-drag-passthrough', 'true');
                }
            }
            if (header) {
                header.removeAttribute('data-window-drag-handle');
                header.removeAttribute('data-window-drag-passthrough');
                header.setAttribute('aria-hidden', 'true');
            }
            return;
        }

        if (header) {
            header.setAttribute('data-window-drag-handle', '');
            header.removeAttribute('data-window-drag-passthrough');
            if (targetsApi() && typeof targetsApi().ensureHeaderDragFill === 'function') {
                targetsApi().ensureHeaderDragFill(header);
            }
        }
    }

    providers.default = {
        id: 'default',
        ensureHeader(container) {
            let header = container.querySelector(':scope > #windowHeader');
            if (!header) {
                header = getHeaderTemplate().cloneNode(true);
                container.insertBefore(header, container.firstChild);
            }
            return header;
        },
        afterInject(container, slotId) {
            applyKdeWindowHeaderIcons(container);
            applyDragHandlePolicy(container, slotId, 'default');
        },
    };

    providers.dolphin = {
        id: 'dolphin',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            applyKdeWindowHeaderIcons(container);
            applyDragHandlePolicy(container, slotId, 'dolphin');
        },
    };

    providers.nemo = {
        id: 'nemo',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            applyKdeWindowHeaderIcons(container);
            applyDragHandlePolicy(container, slotId, 'nemo');
        },
    };

    providers['nemo-gnome'] = {
        id: 'nemo-gnome',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            relocateNautilusWindowControls(container);
            applyKdeWindowHeaderIcons(container);
            applyDragHandlePolicy(container, slotId, 'nemo-gnome');
        },
    };

    providers.cinnamon = {
        id: 'cinnamon',
        ensureHeader(container) {
            const header = providers.default.ensureHeader(container);
            ensureMuffinTitleBarVisible(container);
            return header;
        },
        afterInject(container, slotId) {
            ensureMuffinTitleBarVisible(container);
            applyDragHandlePolicy(container, slotId, 'cinnamon');
        },
    };

    providers['firefox-gnome'] = {
        id: 'firefox-gnome',
        ensureHeader(container) {
            const existing = container.querySelector('#windowHeader');
            if (existing) {
                return existing;
            }
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            applyDragHandlePolicy(container, slotId, 'firefox-gnome');
        },
    };

    providers['terminal-gnome'] = {
        id: 'terminal-gnome',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            applyDragHandlePolicy(container, slotId, 'terminal-gnome');
        },
    };
    providers['terminal-cosmic'] = providers.default;

    providers['file-roller-gtk'] = {
        id: 'file-roller-gtk',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            relocateFileRollerWindowControls(container);
            applyDragHandlePolicy(container, slotId, 'file-roller-gtk');
        },
    };

    providers['libadwaita-gnome'] = {
        id: 'libadwaita-gnome',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            relocateLibadwaitaWindowControls(container, slotId);
            applyDragHandlePolicy(container, slotId, 'libadwaita-gnome');
        },
    };

    function registerChromeProvider(id, provider) {
        providers[id] = provider;
    }

    function getChromeProvider(slotId) {
        const id = resolveChromeProviderId(slotId);
        return providers[id] || providers.default;
    }

    function ensureHeader(container, slotId) {
        if (!container || slotId === 'mainMenu') {
            return null;
        }
        const isGnomeStartMenu = slotId === 'mainMenu'
            && !!container.querySelector('#menu-gnome-root');
        if (isGnomeStartMenu) {
            return null;
        }
        const provider = getChromeProvider(slotId);
        return provider.ensureHeader(container);
    }

    function stampChromeToolkitAttributes(container, slotId) {
        if (!container) {
            return;
        }
        const ctx = headerCtx();
        if (!ctx) {
            return;
        }
        const toolkitId = typeof ctx.resolveToolkitId === 'function'
            ? ctx.resolveToolkitId()
            : '';
        const providerId = resolveChromeProviderId(slotId);
        if (toolkitId) {
            container.setAttribute('data-window-chrome-toolkit', toolkitId);
        }
        if (providerId) {
            container.setAttribute('data-window-chrome-provider', providerId);
        }
    }

    function afterInject(container, slotId) {
        const provider = getChromeProvider(slotId);
        if (typeof provider.afterInject === 'function') {
            provider.afterInject(container, slotId);
        }
        stampChromeToolkitAttributes(container, slotId);
    }

    global.CapsuleWindowChrome = {
        registerChromeProvider,
        getChromeProvider,
        resolveChromeProviderId,
        ensureHeader,
        afterInject,
        syncFirefoxGnomeChrome,
        applyKdeWindowHeaderIcons,
        getHeaderTemplate,
        isKdeFamily,
        isNautilusFamilyExplorer,
        isDolphinExplorerSlot,
        isNautilusFamilySlot,
    };
}(typeof window !== 'undefined' ? window : globalThis));
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
