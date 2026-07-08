/**
 * Plasma — bascule panel dock ↔ barre pleine largeur (fenêtre maximisée).
 * Skins : body[data-plasma-panel] ou bodyId opensuse | kde-neon | debian-kde | mx-kde.
 */
'use strict';
(function initPlasmaPanelMode() {
    const PLASMA_BODY_IDS = new Set(['opensuse', 'kde-neon', 'debian-kde', 'mx-kde']);

    if (!document.body) {
        return;
    }

    const bodyId = document.body.id;
    const enabled = document.body.dataset.plasmaPanel !== undefined
        || document.body.getAttribute('data-plasma-panel') !== null
        || PLASMA_BODY_IDS.has(bodyId);

    if (!enabled) {
        return;
    }

    const body = document.body;
    const desktop = document.getElementById('desktop');
    const boundsBase = {
        mainSelector: 'object#desktop, #desktop',
        desktopSelector: 'object#desktop, #desktop',
        footerSelector: 'footer, #tableau',
    };

    let panelMode = null;
    let syncing = false;
    let observer = null;

    function getBoundsOptions() {
        return (window.CapsuleLinuxWindowContext
            && typeof window.CapsuleLinuxWindowContext.getContext === 'function'
            && window.CapsuleLinuxWindowContext.getContext().bounds)
            || (window.CAPSULE_WINDOW_CONTEXT && window.CAPSULE_WINDOW_CONTEXT.bounds)
            || boundsBase;
    }

    function resetWindowContextCache() {
        const ctx = window.CapsuleLinuxWindowContext || window.CapsuleWindowContext;
        if (ctx && typeof ctx.resetContextCache === 'function') {
            ctx.resetContextCache();
        }
    }

    function applyBoundsPolicy(expanded) {
        window.CAPSULE_WINDOW_CONTEXT = Object.assign({}, window.CAPSULE_WINDOW_CONTEXT || {}, {
            bounds: Object.assign({}, boundsBase, {
                subtractFooter: expanded,
            }),
        });
        resetWindowContextCache();
    }

    function isVisibleWindow(win) {
        if (!win) {
            return false;
        }
        if (win.style.display === 'none' || win.style.visibility === 'hidden') {
            return false;
        }
        if (typeof win.getClientRects === 'function' && win.getClientRects().length === 0) {
            return false;
        }
        return true;
    }

    function hasMaximizedWindow() {
        if (!desktop) {
            return false;
        }
        const wins = desktop.querySelectorAll('.windowElement[data-maximized="true"]');
        for (let index = 0; index < wins.length; index += 1) {
            if (isVisibleWindow(wins[index])) {
                return true;
            }
        }
        return false;
    }

    function applyMaximizedLayout(win) {
        if (!win || win.dataset.maximized !== 'true') {
            return;
        }
        const boundsOpts = getBoundsOptions();
        const work = (window.CapsuleWindowBounds
            && typeof window.CapsuleWindowBounds.getWorkAreaRect === 'function'
            && window.CapsuleWindowBounds.getWorkAreaRect(boundsOpts))
            || {
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight,
            };
        const box = {
            left: work.left,
            top: work.top,
            width: work.width,
            height: work.height,
        };
        if (window.CapsuleWindowPositioning
            && typeof window.CapsuleWindowPositioning.applyViewportBox === 'function') {
            window.CapsuleWindowPositioning.applyViewportBox(win, box, boundsOpts);
            return;
        }
        win.style.position = 'fixed';
        win.style.transform = 'none';
        win.style.marginLeft = '0';
        win.style.marginRight = '0';
        win.style.left = `${work.left}px`;
        win.style.top = `${work.top}px`;
        win.style.width = `${work.width}px`;
        win.style.height = `${work.height}px`;
    }

    function relayoutMaximizedWindows() {
        if (!desktop) {
            return;
        }
        desktop.querySelectorAll('.windowElement[data-maximized="true"]').forEach((win) => {
            if (isVisibleWindow(win)) {
                applyMaximizedLayout(win);
            }
        });
    }

    function syncPanelMode() {
        if (syncing) {
            return;
        }
        const expanded = hasMaximizedWindow();
        const nextMode = expanded ? 'expanded' : 'dock';
        if (nextMode === panelMode) {
            return;
        }

        syncing = true;
        if (observer) {
            observer.disconnect();
        }
        try {
            panelMode = nextMode;
            body.dataset.plasmaPanel = nextMode;
            applyBoundsPolicy(expanded);
            if (expanded) {
                requestAnimationFrame(() => {
                    relayoutMaximizedWindows();
                });
            }
        } finally {
            if (observer && desktop) {
                observer.observe(desktop, {
                    attributes: true,
                    attributeFilter: ['data-maximized', 'style'],
                    subtree: true,
                });
            }
            syncing = false;
        }
    }

    function observeDesktop() {
        if (!desktop) {
            return;
        }
        observer = new MutationObserver((records) => {
            const touched = records.some((record) => {
                if (record.type !== 'attributes') {
                    return false;
                }
                if (record.attributeName === 'data-maximized') {
                    return true;
                }
                if (record.attributeName === 'style'
                    && record.target.classList
                    && record.target.classList.contains('windowElement')) {
                    return true;
                }
                return false;
            });
            if (touched) {
                scheduleSyncPanelMode();
            }
        });
        observer.observe(desktop, {
            attributes: true,
            attributeFilter: ['data-maximized', 'style'],
            subtree: true,
        });
        panelMode = null;
        syncPanelMode();
    }

    function scheduleSyncPanelMode() {
        requestAnimationFrame(syncPanelMode);
    }

    function onWindowLifecycle(event) {
        const container = event.detail && event.detail.container;
        if (event.type === 'capsule:window-closed'
            && container
            && container.dataset
            && container.dataset.maximized === 'true') {
            container.dataset.maximized = 'false';
        }
        scheduleSyncPanelMode();
    }

    function bindWindowLifecycle() {
        [
            'capsule:window-hidden',
            'capsule:window-closed',
            'capsule:window-minimized',
        ].forEach((eventName) => {
            document.addEventListener(eventName, onWindowLifecycle);
        });
    }

    applyBoundsPolicy(false);
    body.dataset.plasmaPanel = 'dock';
    bindWindowLifecycle();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeDesktop);
    } else {
        observeDesktop();
    }
}());
