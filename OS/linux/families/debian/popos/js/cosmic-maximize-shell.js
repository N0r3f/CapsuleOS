/**
 * Pop!_OS - dock pilule → barre quand une fenêtre est maximisée.
 * Fenêtres dans #desktop : absolute inset 0 (pas fixed + rect #desktop viewport).
 */
(function (global) {
    var body = document.body;
    if (!body || body.id !== 'popos') {
        return;
    }

    var desktop = document.getElementById('desktop');
    var dock = document.querySelector('.cosmic-dock');

    function isWindowVisible(win) {
        return !!(win && win.style.display !== 'none');
    }

    function isInsideDesktop(windowElement) {
        return !!(desktop && windowElement && desktop.contains(windowElement));
    }

    function hasVisibleMaximizedWindow() {
        var list = document.querySelectorAll('.windowElement[data-maximized="true"]');
        for (var i = 0; i < list.length; i++) {
            if (isWindowVisible(list[i])) {
                return true;
            }
        }
        return false;
    }

    function getPoposTaskbarInset() {
        var value = getComputedStyle(document.documentElement).getPropertyValue('--popos-taskbar-height').trim();
        if (value) {
            return value;
        }
        return dock ? dock.getBoundingClientRect().height + 'px' : '0';
    }

    function applyPoposMaximizedLayout(windowElement) {
        if (!windowElement || windowElement.dataset.maximized !== 'true') {
            return;
        }

        var taskbarInset = getPoposTaskbarInset();

        if (isInsideDesktop(windowElement)) {
            windowElement.style.position = 'absolute';
            windowElement.style.top = '0';
            windowElement.style.left = '0';
            windowElement.style.right = '0';
            windowElement.style.bottom = taskbarInset;
        } else {
            var topBar = document.querySelector('.cosmic-top-bar');
            var top = topBar ? topBar.getBoundingClientRect().height : 0;
            var bottom = dock ? dock.getBoundingClientRect().height : 0;
            windowElement.style.position = 'fixed';
            windowElement.style.top = top + 'px';
            windowElement.style.left = '0';
            windowElement.style.right = '0';
            windowElement.style.bottom = bottom + 'px';
        }

        windowElement.style.width = 'auto';
        windowElement.style.height = 'auto';
        windowElement.style.minWidth = '0';
        windowElement.style.maxWidth = 'none';
        windowElement.style.minHeight = '0';
        windowElement.style.maxHeight = 'none';
        windowElement.style.marginLeft = '0';
        windowElement.style.marginRight = '0';
        windowElement.style.transform = '';
    }

    function clearPoposMaximizedLayout(windowElement) {
        if (!windowElement) {
            return;
        }
        windowElement.style.right = '';
        windowElement.style.bottom = '';
        windowElement.style.minWidth = '';
        windowElement.style.maxWidth = '';
        windowElement.style.minHeight = '';
        windowElement.style.maxHeight = '';
    }

    function syncTaskbarMode() {
        var on = hasVisibleMaximizedWindow();
        body.classList.toggle('cosmic-shell--taskbar-mode', on);
        if (on) {
            document.querySelectorAll('.windowElement[data-maximized="true"]').forEach(function (win) {
                if (isWindowVisible(win)) {
                    applyPoposMaximizedLayout(win);
                }
            });
        }
    }

    function afterMaximizeChange(windowElement) {
        if (windowElement && windowElement.dataset.maximized === 'true' && isWindowVisible(windowElement)) {
            body.classList.add('cosmic-shell--taskbar-mode');
            applyPoposMaximizedLayout(windowElement);
        }
        requestAnimationFrame(syncTaskbarMode);
    }

    function wrapMaximizeRestore() {
        var origMax = global.maximizeWindowElement;
        var origRestore = global.restoreWindowElement;
        var origToggle = global.toggleWindowMaximized;

        if (typeof origMax !== 'function' || typeof origRestore !== 'function') {
            return;
        }

        global.maximizeWindowElement = function (windowElement) {
            if (!windowElement) {
                return false;
            }
            var ok = origMax(windowElement);
            if (ok) {
                afterMaximizeChange(windowElement);
            }
            return ok;
        };

        global.restoreWindowElement = function (windowElement) {
            clearPoposMaximizedLayout(windowElement);
            var ok = origRestore(windowElement);
            requestAnimationFrame(syncTaskbarMode);
            return ok;
        };

        if (typeof origToggle === 'function') {
            global.toggleWindowMaximized = function (windowElement) {
                if (!windowElement) {
                    return false;
                }
                var wasMaximized = windowElement.dataset.maximized === 'true';
                var ok = origToggle(windowElement);
                if (!ok) {
                    return ok;
                }
                if (wasMaximized) {
                    requestAnimationFrame(syncTaskbarMode);
                } else {
                    afterMaximizeChange(windowElement);
                }
                return ok;
            };
        }
    }

    document.addEventListener('click', function (e) {
        if (e.target.matches('#minimizeBtn') || e.target.matches('#closeBtn')) {
            requestAnimationFrame(syncTaskbarMode);
        }
    });

    document.addEventListener('capsule-window-opened', function () {
        requestAnimationFrame(syncTaskbarMode);
    });

    wrapMaximizeRestore();

    if (!global.CosmicShellState) {
        global.CosmicShellState = {};
    }
    global.CosmicShellState.syncTaskbarMode = syncTaskbarMode;

    global.addEventListener('resize', function () {
        if (hasVisibleMaximizedWindow()) {
            syncTaskbarMode();
        }
    });

    syncTaskbarMode();
})(typeof window !== 'undefined' ? window : this);
