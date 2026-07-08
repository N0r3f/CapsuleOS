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
