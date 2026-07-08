/**
 * Zone de notification Mint (Cinnamon) — popovers exclusifs, proportions panel VM.
 */
(function initMintTray(global) {
    'use strict';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    var entries = [];
    var cornerbarSnapshot = [];

    function getVisibleWindows() {
        var list = global.document.querySelectorAll('#desktop > .windowElement[data-link]');
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var w = list[i];
            if (w.id === 'mainMenu') {
                continue;
            }
            if (w.style.display === 'none') {
                continue;
            }
            out.push(w);
        }
        return out;
    }

    function hideWindow(windowElement) {
        if (!windowElement) {
            return;
        }
        var applyHide = function applyHideFn() {
            windowElement.style.display = 'none';
            windowElement.style.zIndex = '5';
            windowElement.classList.remove('windowElementActive', 'active');
            if (typeof global.CustomEvent === 'function') {
                global.document.dispatchEvent(new global.CustomEvent('capsule:window-minimized', {
                    detail: { container: windowElement, slotId: windowElement.dataset.link }
                }));
            }
        };
        if (typeof global.capsuleBeforeWindowHide === 'function') {
            global.capsuleBeforeWindowHide(windowElement, applyHide);
        } else {
            applyHide();
        }
    }

    function closeVolumeAndCalendar(exceptId) {
        var vol = global.document.getElementById('volume-popover');
        var volBtn = global.document.getElementById('tray-sound-btn');
        if (exceptId !== 'volume' && vol && volBtn && !vol.hasAttribute('hidden')) {
            vol.setAttribute('hidden', '');
            volBtn.setAttribute('aria-expanded', 'false');
        }
        var cal = global.document.getElementById('taskbar-calendar-popover');
        var calBtn = global.document.getElementById('taskbar-clock-trigger');
        if (exceptId !== 'calendar' && cal && calBtn && cal.hidden === false) {
            cal.hidden = true;
            calBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function closeAll(exceptId) {
        var i;
        for (i = 0; i < entries.length; i++) {
            if (exceptId && entries[i].id === exceptId) {
                continue;
            }
            entries[i].close();
        }
        closeVolumeAndCalendar(exceptId);
    }

    function positionAtBtn(btn, popover) {
        var rect = btn.getBoundingClientRect();
        var rightOffset = global.innerWidth - rect.right;
        popover.style.right = Math.max(4, rightOffset) + 'px';
        popover.style.bottom = '';
    }

    function registerPopover(id, btn, popover, options) {
        if (!btn || !popover) {
            return;
        }
        options = options || {};

        function close() {
            popover.setAttribute('hidden', '');
            btn.setAttribute('aria-expanded', 'false');
        }

        function open() {
            closeAll(id);
            positionAtBtn(btn, popover);
            popover.removeAttribute('hidden');
            btn.setAttribute('aria-expanded', 'true');
            if (options.onOpen) {
                options.onOpen();
            }
        }

        function toggle() {
            if (popover.hasAttribute('hidden')) {
                open();
            } else {
                close();
            }
        }

        btn.addEventListener('click', function onTrayClick(event) {
            event.stopPropagation();
            if (options.onClick) {
                options.onClick(toggle, open, close, event);
                return;
            }
            toggle();
        });

        entries.push({ id: id, close: close, btn: btn, popover: popover });
    }

    function returnToPickHome() {
        if (global.CapsulePickReturn) {
            global.CapsulePickReturn.redirectToPickHome('linux');
            return;
        }
        var home = (typeof global.CAPSULE_SITE_HOME !== 'undefined' && global.CAPSULE_SITE_HOME)
            ? String(global.CAPSULE_SITE_HOME)
            : '../../../../../index.html';
        global.location.href = home.split('#')[0].split('?')[0] + '?pick=linux#choisir-os';
    }

    function bindPowerMenu() {
        var btn = global.document.querySelector('.taskbar-tray__btn--power');
        var menu = global.document.getElementById('mint-power-menu');
        if (!btn || !menu) {
            return;
        }

        registerPopover('power', btn, menu);

        var exitActions = { logout: true, suspend: true, restart: true, shutdown: true };
        var actionBtns = menu.querySelectorAll('[data-mint-power-action]');
        for (var i = 0; i < actionBtns.length; i++) {
            actionBtns[i].addEventListener('click', function onPowerAction(event) {
                event.stopPropagation();
                var action = event.currentTarget.getAttribute('data-mint-power-action');
                closeAll();
                if (exitActions[action]) {
                    returnToPickHome();
                }
            });
        }
    }

    function bindCornerbar() {
        var btn = global.document.getElementById('tray-btn-cornerbar');
        if (!btn) {
            return;
        }
        btn.addEventListener('click', function onCornerbarClick(event) {
            event.stopPropagation();
            closeAll();
            var visible = getVisibleWindows();
            if (visible.length > 0) {
                cornerbarSnapshot = [];
                var j;
                for (j = 0; j < visible.length; j++) {
                    cornerbarSnapshot.push(visible[j].dataset.link);
                    hideWindow(visible[j]);
                }
                btn.setAttribute('aria-pressed', 'true');
                btn.setAttribute('aria-label', 'Restaurer les fenêtres');
                return;
            }
            if (cornerbarSnapshot.length > 0 && typeof global.openWindowByDataLink === 'function') {
                var k;
                for (k = 0; k < cornerbarSnapshot.length; k++) {
                    global.openWindowByDataLink(cornerbarSnapshot[k]);
                }
                cornerbarSnapshot = [];
            }
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-label', 'Afficher le bureau');
        });
    }

    function bindKeyboardLayouts() {
        var popover = global.document.getElementById('mint-tray-popover-keyboard');
        if (!popover) {
            return;
        }
        var rows = popover.querySelectorAll('[data-mint-layout]');
        var storageKey = 'mint-keyboard-layout';
        var current = global.localStorage.getItem(storageKey) || 'fr';

        function syncRows() {
            var trayLabel = global.document.querySelector('#tray-btn-keyboard .taskbar-tray__kbd-label');
            for (var i = 0; i < rows.length; i++) {
                var code = rows[i].getAttribute('data-mint-layout');
                rows[i].classList.toggle('is-active', code === current);
            }
            if (trayLabel) {
                trayLabel.textContent = current;
            }
            var trayBtn = global.document.getElementById('tray-btn-keyboard');
            if (trayBtn) {
                trayBtn.setAttribute('aria-label', 'Disposition du clavier : ' + (current === 'en' ? 'anglais' : 'français'));
            }
        }

        for (var r = 0; r < rows.length; r++) {
            rows[r].addEventListener('click', function onLayoutPick(event) {
                event.stopPropagation();
                current = event.currentTarget.getAttribute('data-mint-layout');
                global.localStorage.setItem(storageKey, current);
                syncRows();
            });
        }
        syncRows();
    }

    function bindNotificationsClear() {
        var clearBtn = global.document.getElementById('mint-notifications-clear');
        var list = global.document.getElementById('mint-notifications-list');
        if (!clearBtn || !list) {
            return;
        }
        clearBtn.addEventListener('click', function onClear(event) {
            event.stopPropagation();
            list.innerHTML = '<p class="mint-tray-popover__empty">Aucune notification</p>';
        });
    }

    function bindPrinterSettings() {
        var link = global.document.getElementById('mint-tray-printers-settings');
        if (!link) {
            return;
        }
        link.addEventListener('click', function onPrinterSettings(event) {
            event.stopPropagation();
            closeAll();
            if (typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink('themes');
            }
        });
    }

    function bindNetworkSettings() {
        var link = global.document.getElementById('mint-tray-network-settings');
        if (!link) {
            return;
        }
        link.addEventListener('click', function onNetworkSettings(event) {
            event.stopPropagation();
            closeAll();
            if (typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink('themes');
            }
        });
    }

    function init() {
        if (!isMint()) {
            return;
        }

        registerPopover('xapp',
            global.document.getElementById('tray-btn-xapp'),
            global.document.getElementById('mint-tray-popover-xapp'));

        registerPopover('notifications',
            global.document.getElementById('tray-btn-notifications'),
            global.document.getElementById('mint-tray-popover-notifications'));

        registerPopover('printers',
            global.document.getElementById('tray-btn-printers'),
            global.document.getElementById('mint-tray-popover-printers'));

        registerPopover('removable',
            global.document.getElementById('tray-btn-removable'),
            global.document.getElementById('mint-tray-popover-removable'));

        registerPopover('keyboard',
            global.document.getElementById('tray-btn-keyboard'),
            global.document.getElementById('mint-tray-popover-keyboard'));

        registerPopover('network',
            global.document.getElementById('tray-btn-network'),
            global.document.getElementById('mint-tray-popover-network'));

        bindPowerMenu();
        bindCornerbar();
        bindKeyboardLayouts();
        bindNotificationsClear();
        bindPrinterSettings();
        bindNetworkSettings();

        global.document.addEventListener('capsule:mint-tray-open', function onMintTrayOpen(event) {
            if (!event.detail || !event.detail.id) {
                closeAll();
                return;
            }
            closeAll(event.detail.id);
        });

        global.document.addEventListener('click', function onDocClick(event) {
            var target = event.target;
            var hitTray = target.closest && target.closest('.taskbar-tray');
            var hitPopover = target.closest && (
                target.closest('.mint-tray-popover')
                || target.closest('.volume-popover')
                || target.closest('.calendar-popover')
            );
            if (!hitTray && !hitPopover) {
                closeAll();
            }
        });

        global.document.addEventListener('keydown', function onKey(event) {
            if (event.key === 'Escape') {
                closeAll();
            }
        });

        var updatesBtn = global.document.querySelector('[data-update-manager-tray]');
        if (updatesBtn && updatesBtn.dataset.mintTrayPopoverBound !== 'true') {
            updatesBtn.dataset.mintTrayPopoverBound = 'true';
            updatesBtn.addEventListener('click', function onUpdatesClick() {
                closeAll();
            });
        }
    }

    global.CapsuleMintTray = {
        closeAll: closeAll,
        positionAtBtn: positionAtBtn
    };

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : this);
