/**
 * Snap bord d'écran (Muffin / Cinnamon) — activé sur skins avec edgeTiling !== false (défaut Mint).
 */
(function initCapsuleWindowEdgeTiling(global) {
    'use strict';

    const EDGE_THRESHOLD_PX = 20;
    const maxApi = () => global.CapsuleWindowMaximize;
    const boundsApi = () => global.CapsuleWindowBounds;

    function isEnabled() {
        const runtime = global.CapsuleWindowContext
            && typeof global.CapsuleWindowContext.getContext === 'function'
            ? global.CapsuleWindowContext.getContext()
            : null;
        const ctx = runtime || global.CAPSULE_WINDOW_CONTEXT;
        if (ctx && ctx.edgeTiling === false) {
            return false;
        }
        const body = global.document && global.document.body;
        return !!(body && body.id === 'mint');
    }

    function getWorkArea(boundsOptions) {
        const opts = boundsApi() && typeof boundsApi().resolveBoundsOptions === 'function'
            ? boundsApi().resolveBoundsOptions(boundsOptions || {})
            : (boundsOptions || {});
        if (boundsApi() && typeof boundsApi().getWorkAreaRect === 'function') {
            return boundsApi().getWorkAreaRect(opts);
        }
        return {
            left: 0,
            top: 0,
            width: global.innerWidth,
            height: global.innerHeight,
        };
    }

    function applyGeometry(windowElement, work, geometry, boundsOptions) {
        const opts = boundsApi() && typeof boundsApi().resolveBoundsOptions === 'function'
            ? boundsApi().resolveBoundsOptions(boundsOptions || {})
            : (boundsOptions || {});
        const box = {
            left: geometry.left,
            top: geometry.top,
            width: geometry.width,
            height: geometry.height,
        };
        if (global.CapsuleWindowPositioning
            && typeof global.CapsuleWindowPositioning.applyViewportBox === 'function') {
            global.CapsuleWindowPositioning.applyViewportBox(windowElement, box, opts);
        } else {
            windowElement.style.position = 'fixed';
            windowElement.style.transform = 'none';
            windowElement.style.marginLeft = '0';
            windowElement.style.marginRight = '0';
            windowElement.style.left = `${geometry.left}px`;
            windowElement.style.top = `${geometry.top}px`;
            windowElement.style.width = `${geometry.width}px`;
            windowElement.style.height = `${geometry.height}px`;
        }
        windowElement.dataset.maximized = 'false';
    }

    function tileWindowQuarter(windowElement, corner, boundsOptions) {
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        if (!windowElement || !corners.includes(corner)) {
            return false;
        }
        const max = maxApi();
        if (!max || typeof max.storeRestoreState !== 'function') {
            return false;
        }

        const work = getWorkArea(boundsOptions);
        max.storeRestoreState(windowElement);

        const halfWidth = Math.floor(work.width / 2);
        const halfHeight = Math.floor(work.height / 2);
        let left = work.left;
        let top = work.top;

        if (corner.includes('right')) {
            left += halfWidth;
        }
        if (corner.includes('bottom')) {
            top += halfHeight;
        }

        applyGeometry(windowElement, work, {
            left: left,
            top: top,
            width: halfWidth,
            height: halfHeight,
        }, boundsOptions);
        windowElement.dataset.tiled = corner;
        return true;
    }

    function tileWindowHalf(windowElement, side, boundsOptions) {
        if (!windowElement || (side !== 'left' && side !== 'right')) {
            return false;
        }
        const max = maxApi();
        if (!max || typeof max.storeRestoreState !== 'function') {
            return false;
        }

        const work = getWorkArea(boundsOptions);
        max.storeRestoreState(windowElement);

        const halfWidth = Math.floor(work.width / 2);
        const left = side === 'left' ? work.left : work.left + halfWidth;

        applyGeometry(windowElement, work, {
            left: left,
            top: work.top,
            width: halfWidth,
            height: work.height,
        }, boundsOptions);
        windowElement.dataset.tiled = side;
        return true;
    }

    function trySnapAfterDrag(windowElement, boundsOptions) {
        if (!isEnabled() || !windowElement || windowElement.style.display === 'none') {
            return false;
        }
        if (windowElement.dataset.maximized === 'true') {
            return false;
        }

        const max = maxApi();
        const rect = windowElement.getBoundingClientRect();
        const work = getWorkArea(boundsOptions);

        const nearTop = rect.top - work.top <= EDGE_THRESHOLD_PX;
        const nearBottom = work.top + work.height - (rect.top + rect.height) <= EDGE_THRESHOLD_PX;
        const nearLeft = rect.left - work.left <= EDGE_THRESHOLD_PX;
        const nearRight = work.left + work.width - (rect.left + rect.width) <= EDGE_THRESHOLD_PX;

        if (nearTop && nearLeft) {
            return tileWindowQuarter(windowElement, 'top-left', boundsOptions);
        }
        if (nearTop && nearRight) {
            return tileWindowQuarter(windowElement, 'top-right', boundsOptions);
        }
        if (nearBottom && nearLeft) {
            return tileWindowQuarter(windowElement, 'bottom-left', boundsOptions);
        }
        if (nearBottom && nearRight) {
            return tileWindowQuarter(windowElement, 'bottom-right', boundsOptions);
        }

        if (nearTop) {
            if (max && typeof max.maximizeWindowElement === 'function') {
                const opts = boundsApi() && typeof boundsApi().resolveBoundsOptions === 'function'
                    ? boundsApi().resolveBoundsOptions(boundsOptions || {})
                    : (boundsOptions || {});
                max.maximizeWindowElement(windowElement, opts);
                delete windowElement.dataset.tiled;
                return true;
            }
        }

        if (nearLeft) {
            return tileWindowHalf(windowElement, 'left', boundsOptions);
        }

        if (nearRight) {
            return tileWindowHalf(windowElement, 'right', boundsOptions);
        }

        return false;
    }

    global.CapsuleWindowEdgeTiling = {
        isEnabled,
        tileWindowHalf,
        tileWindowQuarter,
        trySnapAfterDrag,
    };
}(typeof window !== 'undefined' ? window : globalThis));
