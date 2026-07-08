/**
 * Boutons chrome fenêtre (fermer, réduire, maximiser) — Linux, macOS, Windows.
 */
(function initCapsuleWindowHeaderButtons(global) {
    'use strict';

    function resolveBoundsOptions(options = {}) {
        if (global.CapsuleWindowBounds && typeof global.CapsuleWindowBounds.resolveBoundsOptions === 'function') {
            return global.CapsuleWindowBounds.resolveBoundsOptions(options);
        }
        if (global.CAPSULE_WINDOW_CONTEXT && global.CAPSULE_WINDOW_CONTEXT.bounds) {
            return Object.assign({}, global.CAPSULE_WINDOW_CONTEXT.bounds, options);
        }
        return options;
    }

    function getWindowDesktopRect() {
        const boundsOpts = resolveBoundsOptions();
        if (typeof global.CapsuleWindow !== 'undefined' && global.CapsuleWindow.getWorkAreaRect) {
            return global.CapsuleWindow.getWorkAreaRect(boundsOpts);
        }
        if (global.CapsuleWindowBounds && typeof global.CapsuleWindowBounds.getWorkAreaRect === 'function') {
            return global.CapsuleWindowBounds.getWorkAreaRect(boundsOpts);
        }
        const desktop = document.getElementById('desktop');
        return desktop ? desktop.getBoundingClientRect() : null;
    }

    function storeWindowRestoreState(windowElement) {
        if (typeof global.CapsuleWindowMaximize !== 'undefined'
            && global.CapsuleWindowMaximize.storeRestoreState) {
            global.CapsuleWindowMaximize.storeRestoreState(windowElement);
            return;
        }
        if (!windowElement || windowElement.dataset.maximized === 'true') {
            return;
        }
        windowElement.dataset.prevLeft = windowElement.style.left || '';
        windowElement.dataset.prevTop = windowElement.style.top || '';
        windowElement.dataset.prevWidth = windowElement.style.width || '';
        windowElement.dataset.prevHeight = windowElement.style.height || '';
        windowElement.dataset.prevPosition = windowElement.style.position || '';
    }

    function restoreWindowElement(windowElement) {
        if (typeof global.CapsuleWindow !== 'undefined' && global.CapsuleWindow.restoreWindowElement) {
            return global.CapsuleWindow.restoreWindowElement(windowElement);
        }
        if (!windowElement) {
            return false;
        }
        windowElement.style.width = windowElement.dataset.prevWidth || '';
        windowElement.style.height = windowElement.dataset.prevHeight || '';
        windowElement.style.position = windowElement.dataset.prevPosition || 'fixed';
        windowElement.style.top = windowElement.dataset.prevTop || '';
        windowElement.style.left = windowElement.dataset.prevLeft || '';
        windowElement.dataset.maximized = 'false';
        return true;
    }

    function maximizeWindowElement(windowElement) {
        const boundsOpts = resolveBoundsOptions();
        if (typeof global.CapsuleWindow !== 'undefined' && global.CapsuleWindow.maximizeWindowElement) {
            return global.CapsuleWindow.maximizeWindowElement(windowElement, boundsOpts);
        }
        if (!windowElement) {
            return false;
        }
        const work = getWindowDesktopRect();
        storeWindowRestoreState(windowElement);
        const box = work || {
            left: 0,
            top: 0,
            width: global.innerWidth,
            height: global.innerHeight,
        };
        if (global.CapsuleWindowPositioning
            && typeof global.CapsuleWindowPositioning.applyViewportBox === 'function') {
            global.CapsuleWindowPositioning.applyViewportBox(windowElement, box, boundsOpts);
        } else {
            windowElement.style.position = 'fixed';
            windowElement.style.left = `${box.left}px`;
            windowElement.style.top = `${box.top}px`;
            windowElement.style.width = `${box.width}px`;
            windowElement.style.height = `${box.height}px`;
        }
        windowElement.dataset.maximized = 'true';
        return true;
    }

    function toggleWindowMaximized(windowElement) {
        const boundsOpts = resolveBoundsOptions();
        if (typeof global.CapsuleWindow !== 'undefined' && global.CapsuleWindow.toggleWindowMaximized) {
            return global.CapsuleWindow.toggleWindowMaximized(windowElement, boundsOpts);
        }
        if (!windowElement) {
            return false;
        }
        if (windowElement.dataset.maximized === 'true') {
            return restoreWindowElement(windowElement);
        }
        return maximizeWindowElement(windowElement);
    }

    global.restoreWindowElement = restoreWindowElement;
    global.maximizeWindowElement = maximizeWindowElement;
    global.toggleWindowMaximized = toggleWindowMaximized;

    function resolveWindowFromTarget(target) {
        return target.closest('.windowElement, .win-window, #windowContainer');
    }

    function hideWindowElement(windowElement, options) {
        const opts = options || {};
        const applyHide = () => {
            windowElement.style.display = 'none';
            windowElement.style.zIndex = '5';
            windowElement.classList.remove('windowElementActive');
            windowElement.classList.remove('active');

            if (typeof global.CustomEvent === 'function') {
                if (opts.minimize) {
                    global.document.dispatchEvent(new CustomEvent('capsule:window-minimized', {
                        detail: {
                            container: windowElement,
                            slotId: windowElement.dataset.link,
                        },
                    }));
                } else if (opts.close) {
                    if (global.CapsuleTaskbarLauncherState
                        && typeof global.CapsuleTaskbarLauncherState.clearRunning === 'function') {
                        global.CapsuleTaskbarLauncherState.clearRunning(windowElement);
                    } else if (windowElement.dataset) {
                        delete windowElement.dataset.capsuleRunning;
                    }
                    global.document.dispatchEvent(new CustomEvent('capsule:window-closed', {
                        detail: {
                            container: windowElement,
                            slotId: windowElement.dataset.link,
                        },
                    }));
                }
                global.document.dispatchEvent(new CustomEvent('capsule:window-hidden', {
                    detail: {
                        container: windowElement,
                        slotId: windowElement.dataset.link,
                    },
                }));
            }
        };

        if (typeof global.capsuleBeforeWindowHide === 'function') {
            global.capsuleBeforeWindowHide(windowElement, applyHide);
        } else {
            applyHide();
        }
    }

    document.addEventListener('click', function (event) {
        if (event.target.matches('#minimizeBtn') || event.target.matches('#closeBtn')) {
            const windowElement = resolveWindowFromTarget(event.target);
            if (!windowElement || windowElement.id === 'windowContainer' && windowElement.style.display === 'none') {
                return;
            }
            if (event.target.matches('#minimizeBtn')) {
                hideWindowElement(windowElement, { minimize: true });
            } else {
                hideWindowElement(windowElement, { close: true });
            }
        }

        if (event.target.matches('#resizeBtn')) {
            const windowElement = resolveWindowFromTarget(event.target);
            if (!windowElement) {
                return;
            }
            windowElement.classList.add('windowElementActive');
            toggleWindowMaximized(windowElement);
        }
    });
}(typeof window !== 'undefined' ? window : globalThis));
