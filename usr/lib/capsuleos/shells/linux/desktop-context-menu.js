/**
 * Menu contextuel bureau — Cinnamon Mint (clic droit fond + icônes bureau).
 */
(function initCapsuleDesktopContextMenu(global) {
    'use strict';

    var iconTarget = null;

    function isMintDesktop() {
        var bodyId = typeof document !== 'undefined' && document.body ? document.body.id : '';
        var skinKey = typeof global !== 'undefined' ? global.CAPSULE_EMBED_SKIN_KEY : '';
        return bodyId === 'mint' || skinKey === 'mint';
    }

    function closeMenu(menu) {
        if (!menu) {
            return;
        }
        menu.hidden = true;
    }

    function closeAllMenus(backgroundMenu, iconMenu) {
        closeMenu(backgroundMenu);
        closeMenu(iconMenu);
        iconTarget = null;
    }

    function openMenu(menu, clientX, clientY) {
        menu.hidden = false;
        var rect = menu.getBoundingClientRect();
        var maxLeft = global.innerWidth - rect.width - 8;
        var maxTop = global.innerHeight - rect.height - 8;
        menu.style.left = `${Math.max(8, Math.min(clientX, maxLeft))}px`;
        menu.style.top = `${Math.max(8, Math.min(clientY, maxTop))}px`;
    }

    function bindBackgroundActions(menu) {
        menu.querySelectorAll('[data-desktop-action]').forEach(function (item) {
            item.addEventListener('click', function onBackgroundAction(event) {
                event.preventDefault();
                var action = item.dataset.desktopAction;
                closeMenu(menu);

                if (action === 'refresh') {
                    global.location.reload();
                    return;
                }
                if (action === 'wallpaper' || action === 'desktop-settings') {
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

    function bindIconActions(menu, backgroundMenu) {
        menu.querySelectorAll('[data-desktop-icon-action]').forEach(function (item) {
            item.addEventListener('click', function onIconAction(event) {
                event.preventDefault();
                var action = item.dataset.desktopIconAction;
                var shortcut = iconTarget;
                closeAllMenus(backgroundMenu, menu);

                if (!shortcut) {
                    return;
                }
                if (action === 'open' && typeof global.openMintDesktopIcon === 'function') {
                    global.openMintDesktopIcon(shortcut);
                    return;
                }
                if (action === 'cut' && typeof global.cutMintDesktopIcon === 'function') {
                    global.cutMintDesktopIcon(shortcut);
                    return;
                }
                if (action === 'copy' && typeof global.copyMintDesktopIcon === 'function') {
                    global.copyMintDesktopIcon(shortcut);
                    return;
                }
                if (action === 'rename' && typeof global.renameMintDesktopIcon === 'function') {
                    global.renameMintDesktopIcon(shortcut);
                    return;
                }
                if (action === 'delete' && typeof global.deleteMintDesktopIcon === 'function') {
                    global.deleteMintDesktopIcon(shortcut);
                    return;
                }
                if (action === 'properties' && typeof global.showMintDesktopIconProperties === 'function') {
                    global.showMintDesktopIconProperties(shortcut);
                }
            });
        });
    }

    function isDesktopBackgroundEvent(event, desktop) {
        if (event.target.closest('.windowElement, .desktop-shortcut, a, button, input')) {
            return false;
        }
        if (event.target === desktop || (desktop.contains(event.target) && event.target.id === 'desktop')) {
            return true;
        }
        if (event.target.id === 'mint' || event.target === document.body) {
            var rect = desktop.getBoundingClientRect();
            return event.clientX >= rect.left && event.clientX <= rect.right
                && event.clientY >= rect.top && event.clientY <= rect.bottom;
        }
        return false;
    }

    function init() {
        if (!isMintDesktop()) {
            return;
        }

        var desktop = document.getElementById('desktop');
        var backgroundMenu = document.getElementById('desktop-context-menu');
        var iconMenu = document.getElementById('desktop-icon-context-menu');
        if (!desktop || !backgroundMenu) {
            return;
        }

        bindBackgroundActions(backgroundMenu);
        if (iconMenu) {
            bindIconActions(iconMenu, backgroundMenu);
        }

        var onDesktopContextMenu = function onDesktopContextMenu(event) {
            var shortcut = event.target.closest('.desktop-shortcut[data-desktop-icon]');
            if (shortcut && desktop.contains(shortcut) && iconMenu) {
                event.preventDefault();
                iconTarget = shortcut;
                closeMenu(backgroundMenu);
                openMenu(iconMenu, event.clientX, event.clientY);
                return;
            }
            if (!isDesktopBackgroundEvent(event, desktop)) {
                return;
            }
            event.preventDefault();
            iconTarget = null;
            closeMenu(iconMenu);
            openMenu(backgroundMenu, event.clientX, event.clientY);
        };

        desktop.addEventListener('contextmenu', onDesktopContextMenu);
        document.body.addEventListener('contextmenu', onDesktopContextMenu);

        document.addEventListener('click', function onDocumentClick(event) {
            if (!backgroundMenu.hidden && !backgroundMenu.contains(event.target)) {
                closeMenu(backgroundMenu);
            }
            if (iconMenu && !iconMenu.hidden && !iconMenu.contains(event.target)) {
                closeMenu(iconMenu);
                iconTarget = null;
            }
        });

        document.addEventListener('keydown', function onEscape(event) {
            if (event.key === 'Escape') {
                closeAllMenus(backgroundMenu, iconMenu);
            }
        });

        global.addEventListener('resize', function onResize() {
            closeAllMenus(backgroundMenu, iconMenu);
        });
    }

    if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        global.setTimeout(init, 0);
    }
}(typeof window !== 'undefined' ? window : globalThis));
