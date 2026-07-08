/**
 * Menu contextuel panel Cinnamon — Linux Mint (clic droit barre des tâches).
 */
(function initMintPanelContextMenu(global) {
    'use strict';

    var MENU_ID = 'mint-panel-context-menu';
    var PANEL_SELECTOR = '#tableau.mint-panel';

    function isMintDesktop() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function getPanel() {
        return global.document.querySelector(PANEL_SELECTOR);
    }

    function closeMenu(menu) {
        if (!menu) {
            return;
        }
        menu.hidden = true;
    }

    function openMenu(menu, clientX, clientY) {
        menu.hidden = false;
        var rect = menu.getBoundingClientRect();
        var maxLeft = global.innerWidth - rect.width - 8;
        var maxTop = global.innerHeight - rect.height - 8;
        menu.style.left = Math.max(8, Math.min(clientX, maxLeft)) + 'px';
        menu.style.top = Math.max(8, Math.min(clientY, maxTop)) + 'px';
    }

    function isInteractivePanelTarget(target) {
        return !!target.closest(
            'a, button, input, select, textarea, label, '
            + '.mint-panel__launcher, .mint-panel__menu-btn, '
            + '.taskbar-window-list__btn, .taskbar-tray__btn, '
            + '.taskbar-clock-trigger, .taskbar__clock, '
            + '.mint-tray-popover, .calendar-popover, .sticky-applet'
        );
    }

    function isPanelBackgroundEvent(event, panel) {
        if (!panel || !panel.contains(event.target)) {
            return false;
        }
        return !isInteractivePanelTarget(event.target);
    }

    function openCinnamonSettingsPanel(panelId) {
        global.CAPSULE_CS_PENDING_PANEL = panelId;
        if (typeof global.openWindowByDataLink === 'function') {
            global.openWindowByDataLink('themes');
        }
    }

    function bindActions(menu) {
        menu.querySelectorAll('[data-mint-panel-action]').forEach(function (item) {
            item.addEventListener('click', function onPanelAction(event) {
                event.preventDefault();
                var action = item.dataset.mintPanelAction;
                closeMenu(menu);
                if (action === 'add-applets') {
                    openCinnamonSettingsPanel('applets');
                    return;
                }
                if (action === 'configure-panel') {
                    openCinnamonSettingsPanel('panel');
                }
            });
        });
    }

    function init() {
        if (!isMintDesktop()) {
            return;
        }

        var panel = getPanel();
        var menu = global.document.getElementById(MENU_ID);
        if (!panel || !menu) {
            return;
        }

        bindActions(menu);

        panel.addEventListener('contextmenu', function onPanelContextMenu(event) {
            if (!isPanelBackgroundEvent(event, panel)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            openMenu(menu, event.clientX, event.clientY);
        });

        global.document.addEventListener('click', function onDocumentClick(event) {
            if (!menu.hidden && !menu.contains(event.target)) {
                closeMenu(menu);
            }
        });

        global.document.addEventListener('keydown', function onEscape(event) {
            if (event.key === 'Escape') {
                closeMenu(menu);
            }
        });

        global.addEventListener('resize', function onResize() {
            closeMenu(menu);
        });

        global.document.body.dataset.capsuleMintPanelCtxInit = 'true';
    }

    if (typeof global.document !== 'undefined' && global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        global.setTimeout(init, 0);
    }
}(typeof window !== 'undefined' ? window : globalThis));
