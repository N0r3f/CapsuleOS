/**
 * Barre titre GNOME / headerbar denses — double-clic maximise, menu contextuel.
 * Complète cinnamon-window-behaviors.js (Mint uniquement).
 */
(function initGnomeWindowBehaviors(global) {
    'use strict';

    const GNOME_BODY_IDS = new Set(['rocky', 'fedora', 'ubuntu', 'popos', 'anduinos']);
    const GNOME_SKIN_KEYS = new Set(['rocky', 'fedora', 'ubuntu', 'popos', 'anduinos']);

    function isGnomeShell() {
        const bodyId = global.document && global.document.body ? global.document.body.id : '';
        const skinKey = global.CAPSULE_EMBED_SKIN_KEY || '';
        return GNOME_BODY_IDS.has(bodyId) || GNOME_SKIN_KEYS.has(skinKey);
    }

    function isTitlebarTarget(event) {
        const win = event.target.closest('.windowElement[data-link]');
        if (!win || win.style.display === 'none') {
            return null;
        }
        const api = global.CapsuleWindowDragTargets;
        if (api && typeof api.isTitlebarPointerTarget === 'function') {
            if (!api.isTitlebarPointerTarget(win, event.target, {})) {
                return null;
            }
            return win;
        }
        if (event.target.closest('button, input, textarea, select, a, label')) {
            return null;
        }
        const handle = event.target.closest('#windowHeader, [data-window-drag-handle]');
        if (!handle) {
            return null;
        }
        return win;
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

    function minimizeWindow(windowElement) {
        if (!windowElement) {
            return;
        }
        const btn = windowElement.querySelector('#minimizeBtn');
        if (btn) {
            btn.click();
            return;
        }
        windowElement.style.display = 'none';
        windowElement.classList.remove('windowElementActive', 'active');
    }

    function closeWindow(windowElement) {
        const btn = windowElement && windowElement.querySelector('#closeBtn');
        if (btn) {
            btn.click();
        }
    }

    function ensureContextMenu() {
        let menu = global.document.getElementById('capsule-window-context-menu');
        if (menu) {
            return menu;
        }
        menu = global.document.createElement('nav');
        menu.id = 'capsule-window-context-menu';
        menu.className = 'capsule-window-context-menu';
        menu.hidden = true;
        menu.setAttribute('role', 'menu');
        menu.innerHTML = ''
            + '<button type="button" role="menuitem" data-window-action="minimize">Réduire</button>'
            + '<button type="button" role="menuitem" data-window-action="toggle-maximize">'
            + 'Agrandir / Restaurer</button>'
            + '<button type="button" role="menuitem" data-window-action="close">Fermer</button>';
        global.document.body.appendChild(menu);

        menu.addEventListener('click', (event) => {
            const item = event.target.closest('[data-window-action]');
            if (!item) {
                return;
            }
            const win = menu.__capsuleTargetWindow;
            menu.hidden = true;
            if (!win) {
                return;
            }
            const action = item.getAttribute('data-window-action');
            if (action === 'minimize') {
                minimizeWindow(win);
            } else if (action === 'toggle-maximize') {
                toggleMaximized(win);
            } else if (action === 'close') {
                closeWindow(win);
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
        return menu;
    }

    function openContextMenu(windowElement, clientX, clientY) {
        const menu = ensureContextMenu();
        menu.__capsuleTargetWindow = windowElement;
        menu.hidden = false;
        const rect = menu.getBoundingClientRect();
        const maxLeft = global.innerWidth - rect.width - 8;
        const maxTop = global.innerHeight - rect.height - 8;
        menu.style.left = `${Math.max(8, Math.min(clientX, maxLeft))}px`;
        menu.style.top = `${Math.max(8, Math.min(clientY, maxTop))}px`;
    }

    function bindTitleDoubleClick() {
        global.document.addEventListener('dblclick', (event) => {
            if (!isGnomeShell()) {
                return;
            }
            const win = isTitlebarTarget(event);
            if (!win) {
                return;
            }
            event.preventDefault();
            toggleMaximized(win);
        });
    }

    function bindTitleContextMenu() {
        global.document.addEventListener('contextmenu', (event) => {
            if (!isGnomeShell()) {
                return;
            }
            const win = isTitlebarTarget(event);
            if (!win) {
                return;
            }
            event.preventDefault();
            openContextMenu(win, event.clientX, event.clientY);
        });
    }

    function run() {
        if (!isGnomeShell()) {
            return;
        }
        bindTitleDoubleClick();
        bindTitleContextMenu();
    }

    if (typeof global.document !== 'undefined') {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
