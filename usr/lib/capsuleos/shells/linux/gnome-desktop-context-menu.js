/**
 * Menu contextuel bureau — GNOME (Rocky, Fedora, Alma, Ubuntu…).
 */
(function initGnomeDesktopContextMenu(global) {
    'use strict';

    const GNOME_IDS = new Set(['rocky', 'fedora', 'ubuntu', 'anduinos']);

    function isGnomeDesktop() {
        const bodyId = global.document && global.document.body ? global.document.body.id : '';
        return GNOME_IDS.has(bodyId);
    }

    function closeMenu(menu) {
        if (!menu) {
            return;
        }
        menu.hidden = true;
    }

    function openMenu(menu, clientX, clientY) {
        menu.hidden = false;
        const rect = menu.getBoundingClientRect();
        const maxLeft = global.innerWidth - rect.width - 8;
        const maxTop = global.innerHeight - rect.height - 8;
        menu.style.left = `${Math.max(8, Math.min(clientX, maxLeft))}px`;
        menu.style.top = `${Math.max(8, Math.min(clientY, maxTop))}px`;
    }

    function bindActions(menu) {
        menu.querySelectorAll('[data-gnome-desktop-action]').forEach((item) => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const action = item.dataset.gnomeDesktopAction;
                closeMenu(menu);

                if (action === 'new-folder') {
                    if (typeof global.openWindowByDataLink === 'function') {
                        global.openWindowByDataLink('nemo');
                    }
                    const scheduleCreate = () => {
                        const root = typeof global.getFileExplorerRoot === 'function'
                            ? global.getFileExplorerRoot()
                            : (global.CAPSULE_CONTENT_ROOT || 'home/public').replace(/\/+$/, '');
                        const bureauPath = `${root}/Bureau`;
                        if (typeof global.navigateToFileExplorerDirectory === 'function') {
                            global.navigateToFileExplorerDirectory(bureauPath, { updateHistory: true });
                        }
                        if (typeof global.createNewFolderInCurrentDirectory === 'function') {
                            global.createNewFolderInCurrentDirectory();
                        }
                    };
                    global.setTimeout(scheduleCreate, 600);
                    return;
                }
                if (action === 'display-settings') {
                    if (typeof global.setCapsuleSettingsPanel === 'function') {
                        global.setCapsuleSettingsPanel('displays');
                    }
                    if (typeof global.openWindowByDataLink === 'function') {
                        global.openWindowByDataLink('themes');
                    }
                    return;
                }
                if (action === 'change-background') {
                    if (typeof global.setCapsuleSettingsPanel === 'function') {
                        global.setCapsuleSettingsPanel('background');
                    }
                    if (typeof global.openWindowByDataLink === 'function') {
                        global.openWindowByDataLink('themes');
                    }
                }
            });
        });
    }

    function init() {
        if (!isGnomeDesktop()) {
            return;
        }

        const desktop = global.document.getElementById('desktop');
        const menu = global.document.getElementById('gnome-desktop-context-menu');
        if (!desktop || !menu) {
            return;
        }

        bindActions(menu);

        desktop.addEventListener('contextmenu', (event) => {
            if (event.target.closest('.windowElement, .desktop-shortcut, a, button, input')) {
                return;
            }
            event.preventDefault();
            openMenu(menu, event.clientX, event.clientY);
        });

        global.document.addEventListener('click', (event) => {
            if (!menu.hidden && !menu.contains(event.target)) {
                closeMenu(menu);
            }
        });

        global.document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu(menu);
            }
        });

        global.addEventListener('resize', () => closeMenu(menu));
    }

    if (typeof global.document !== 'undefined' && global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
}(typeof window !== 'undefined' ? window : globalThis));
