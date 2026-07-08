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
