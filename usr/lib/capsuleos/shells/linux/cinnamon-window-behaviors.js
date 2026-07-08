/**
 * Comportements fenêtre Cinnamon / Muffin pour Linux Mint (P1–P2).
 * Double-clic barre titre, Super+flèches, menu contextuel barre titre (#windowHeader).
 */
(function initCinnamonWindowBehaviors(global) {
    'use strict';

    const ALWAYS_ON_TOP_Z = 10000;
    const MENU_ID = 'muffin-window-context-menu';

    function isMintDesktop() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function getActiveWindow() {
        return global.document.querySelector('.windowElement.windowElementActive[data-link]')
            || global.document.querySelector('.windowElement.active[data-link]');
    }

    function focusMode() {
        if (global.document.body && global.document.body.dataset.capsuleFocusMode) {
            return global.document.body.dataset.capsuleFocusMode;
        }
        if (global.CapsuleCinnamonGSettings && global.CapsuleCinnamonGSettings.getCapsule) {
            return global.CapsuleCinnamonGSettings.getCapsule('mint-wm-focus-mode', 'click');
        }
        return 'click';
    }

    function activateWindowElement(windowElement) {
        if (!windowElement || typeof global.CapsuleWindow === 'undefined' || !global.CapsuleWindow.activateWindow) {
            windowElement.classList.add('windowElementActive', 'active');
            return;
        }
        global.CapsuleWindow.activateWindow(windowElement);
    }

    function isCinnamonWindow(windowElement) {
        if (!windowElement || windowElement.id === 'mainMenu') {
            return false;
        }
        if (windowElement.dataset.link === 'mainMenu') {
            return false;
        }
        return windowElement.dataset.windowChromeToolkit === 'cinnamon'
            || !!windowElement.querySelector(':scope > #windowHeader');
    }

    function isTitlebarTarget(event) {
        const windowElement = event.target.closest('.windowElement[data-link]');
        if (!windowElement || windowElement.style.display === 'none' || !isCinnamonWindow(windowElement)) {
            return null;
        }
        const api = global.CapsuleWindowDragTargets;
        if (api && typeof api.isTitlebarPointerTarget === 'function') {
            if (!api.isTitlebarPointerTarget(windowElement, event.target, {})) {
                return null;
            }
            return windowElement;
        }
        if (event.target.closest('button, input, textarea, select, a, label')) {
            return null;
        }
        if (!event.target.closest('#windowHeader, [data-window-drag-handle]')) {
            return null;
        }
        return windowElement;
    }

    function toggleMaximized(windowElement) {
        if (typeof global.toggleWindowMaximized === 'function') {
            global.toggleWindowMaximized(windowElement);
            return;
        }
        if (global.CapsuleWindowMaximize && global.CapsuleWindowMaximize.toggleWindowMaximized) {
            global.CapsuleWindowMaximize.toggleWindowMaximized(windowElement);
        }
    }

    function maximizeWindow(windowElement) {
        if (typeof global.maximizeWindowElement === 'function') {
            global.maximizeWindowElement(windowElement);
            return;
        }
        if (global.CapsuleWindowMaximize && global.CapsuleWindowMaximize.maximizeWindowElement) {
            global.CapsuleWindowMaximize.maximizeWindowElement(windowElement);
        }
    }

    function restoreWindow(windowElement) {
        if (typeof global.restoreWindowElement === 'function') {
            global.restoreWindowElement(windowElement);
            return;
        }
        if (global.CapsuleWindowMaximize && global.CapsuleWindowMaximize.restoreWindowElement) {
            global.CapsuleWindowMaximize.restoreWindowElement(windowElement);
        }
    }

    function minimizeWindow(windowElement) {
        if (!windowElement) {
            return;
        }
        const btn = windowElement.querySelector('#minimizeBtn');
        if (btn) {
            btn.click();
            return;
        }
        const applyHide = () => {
            if (global.CapsuleTaskbarLauncherState
                && typeof global.CapsuleTaskbarLauncherState.markRunning === 'function') {
                global.CapsuleTaskbarLauncherState.markRunning(windowElement);
            } else if (windowElement.dataset) {
                windowElement.dataset.capsuleRunning = 'true';
            }
            windowElement.style.display = 'none';
            windowElement.style.zIndex = '5';
            windowElement.classList.remove('windowElementActive', 'active');
            if (typeof global.CustomEvent === 'function') {
                global.document.dispatchEvent(new CustomEvent('capsule:window-minimized', {
                    detail: { container: windowElement, slotId: windowElement.dataset.link },
                }));
                global.document.dispatchEvent(new CustomEvent('capsule:window-hidden', {
                    detail: { container: windowElement, slotId: windowElement.dataset.link },
                }));
            }
        };
        if (typeof global.capsuleBeforeWindowHide === 'function') {
            global.capsuleBeforeWindowHide(windowElement, applyHide);
        } else {
            applyHide();
        }
    }

    function closeWindow(windowElement) {
        const btn = windowElement && windowElement.querySelector('#closeBtn');
        if (btn) {
            btn.click();
        }
    }

    function maintainAlwaysOnTopOrder() {
        const pinned = [...global.document.querySelectorAll('.windowElement[data-capsule-always-on-top="true"]')]
            .filter((win) => win.style.display !== 'none');
        pinned.forEach((win, index) => {
            win.style.zIndex = String(ALWAYS_ON_TOP_Z + index);
            win.classList.add('capsule-window-always-on-top');
        });
    }

    function setAlwaysOnTop(windowElement, enabled) {
        if (!windowElement) {
            return;
        }
        if (enabled) {
            windowElement.dataset.capsuleAlwaysOnTop = 'true';
            windowElement.classList.add('capsule-window-always-on-top');
        } else {
            delete windowElement.dataset.capsuleAlwaysOnTop;
            windowElement.classList.remove('capsule-window-always-on-top');
            if (global.CapsuleWindowStack && typeof global.CapsuleWindowStack.bringToFront === 'function') {
                global.CapsuleWindowStack.bringToFront(windowElement);
            }
        }
        maintainAlwaysOnTopOrder();
    }

    function toggleAlwaysOnTop(windowElement) {
        const enabled = windowElement.dataset.capsuleAlwaysOnTop !== 'true';
        setAlwaysOnTop(windowElement, enabled);
    }

    function maximizeMenuLabel(windowElement) {
        return windowElement && windowElement.dataset.maximized === 'true' ? 'Restaurer' : 'Agrandir';
    }

    function syncContextMenuLabels(menu, windowElement) {
        if (!menu || !windowElement) {
            return;
        }
        const maxItem = menu.querySelector('[data-muffin-ctx-action="toggle-maximize"]');
        if (maxItem) {
            maxItem.textContent = maximizeMenuLabel(windowElement);
        }
        const topItem = menu.querySelector('[data-muffin-ctx-action="always-on-top"]');
        if (topItem) {
            const active = windowElement.dataset.capsuleAlwaysOnTop === 'true';
            topItem.setAttribute('aria-checked', active ? 'true' : 'false');
            topItem.classList.toggle('muffin-window-context-menu__item--checked', active);
        }
    }

    function ensureContextMenu() {
        let menu = global.document.getElementById(MENU_ID);
        if (menu) {
            return menu;
        }
        menu = global.document.createElement('nav');
        menu.id = MENU_ID;
        menu.className = 'desktop-context-menu muffin-window-context-menu';
        menu.hidden = true;
        menu.setAttribute('role', 'menu');
        menu.innerHTML = ''
            + '<button type="button" class="desktop-context-menu__item" role="menuitem"'
            + ' data-muffin-ctx-action="minimize">Réduire</button>'
            + '<button type="button" class="desktop-context-menu__item" role="menuitem"'
            + ' data-muffin-ctx-action="toggle-maximize">Agrandir</button>'
            + '<button type="button" class="desktop-context-menu__item" role="menuitem"'
            + ' data-muffin-ctx-action="close">Fermer</button>'
            + '<div class="desktop-context-menu__separator" role="separator"></div>'
            + '<button type="button" class="desktop-context-menu__item" role="menuitemcheckbox"'
            + ' data-muffin-ctx-action="always-on-top" aria-checked="false">'
            + 'Toujours au premier plan</button>';
        global.document.body.appendChild(menu);

        menu.addEventListener('click', (event) => {
            const item = event.target.closest('[data-muffin-ctx-action]');
            if (!item) {
                return;
            }
            event.preventDefault();
            const win = menu.__capsuleTargetWindow;
            menu.hidden = true;
            if (!win) {
                return;
            }
            const action = item.getAttribute('data-muffin-ctx-action');
            if (action === 'minimize') {
                minimizeWindow(win);
            } else if (action === 'toggle-maximize') {
                toggleMaximized(win);
            } else if (action === 'close') {
                closeWindow(win);
            } else if (action === 'always-on-top') {
                toggleAlwaysOnTop(win);
            }
        });

        global.document.addEventListener('click', (event) => {
            if (!menu.hidden && !menu.contains(event.target)) {
                menu.hidden = true;
            }
        });
        global.document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                menu.hidden = true;
            }
        });
        global.addEventListener('resize', () => {
            menu.hidden = true;
        });

        return menu;
    }

    function openContextMenu(windowElement, clientX, clientY) {
        const menu = ensureContextMenu();
        menu.__capsuleTargetWindow = windowElement;
        syncContextMenuLabels(menu, windowElement);
        menu.hidden = false;
        menu.removeAttribute('hidden');
        const rect = menu.getBoundingClientRect();
        const maxLeft = global.innerWidth - rect.width - 8;
        const maxTop = global.innerHeight - rect.height - 8;
        menu.style.left = `${Math.max(8, Math.min(clientX, maxLeft))}px`;
        menu.style.top = `${Math.max(8, Math.min(clientY, maxTop))}px`;
    }

    function bindTitleDoubleClick() {
        global.document.addEventListener('dblclick', (event) => {
            if (!isMintDesktop()) {
                return;
            }
            const windowElement = isTitlebarTarget(event);
            if (!windowElement) {
                return;
            }
            event.preventDefault();
            const action = (global.document.body && global.document.body.dataset.capsuleDblclickTitlebar)
                || (global.CapsuleCinnamonGSettings && global.CapsuleCinnamonGSettings.getCapsule('mint-wm-dblclick-titlebar', 'toggle-maximize'))
                || 'toggle-maximize';
            if (action === 'none') {
                return;
            }
            if (action === 'maximize') {
                maximizeWindow(windowElement);
                return;
            }
            if (action === 'menu') {
                openContextMenu(windowElement, event.clientX, event.clientY);
                return;
            }
            toggleMaximized(windowElement);
        });
    }

    function bindTitleContextMenu() {
        global.document.addEventListener('contextmenu', (event) => {
            if (!isMintDesktop()) {
                return;
            }
            const windowElement = isTitlebarTarget(event);
            if (!windowElement) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            openContextMenu(windowElement, event.clientX, event.clientY);
        });
    }

    function bindFocusFollowsMouse() {
        global.document.addEventListener('mouseover', function (event) {
            if (!isMintDesktop() || focusMode() !== 'mouse') {
                return;
            }
            var windowElement = event.target.closest('.windowElement[data-link]');
            if (!windowElement || windowElement.id === 'mainMenu' || windowElement.style.display === 'none') {
                return;
            }
            if (!isCinnamonWindow(windowElement)) {
                return;
            }
            activateWindowElement(windowElement);
        });
    }

    function bindAlwaysOnTopMaintenance() {
        global.document.addEventListener('mousedown', () => {
            global.setTimeout(maintainAlwaysOnTopOrder, 0);
        }, true);
        global.document.addEventListener('capsule:slot-injected', () => {
            maintainAlwaysOnTopOrder();
        });
    }

    function bindKeyboardShortcuts() {
        global.document.addEventListener('keydown', (event) => {
            if (!isMintDesktop() || !hasSuperModifier(event)) {
                return;
            }
            const windowElement = getActiveWindow();
            if (!windowElement || windowElement.style.display === 'none') {
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                maximizeWindow(windowElement);
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (windowElement.dataset.maximized === 'true') {
                    restoreWindow(windowElement);
                } else {
                    minimizeWindow(windowElement);
                }
            }
        });
    }

    function hasSuperModifier(event) {
        return event.metaKey
            || (typeof event.getModifierState === 'function' && event.getModifierState('Super'));
    }

    function run() {
        if (!isMintDesktop()) {
            return;
        }
        bindTitleDoubleClick();
        bindTitleContextMenu();
        bindFocusFollowsMouse();
        bindKeyboardShortcuts();
        bindAlwaysOnTopMaintenance();
        global.document.body.dataset.capsuleMuffinWindowCtxInit = 'true';
    }

    if (typeof global.document !== 'undefined') {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
