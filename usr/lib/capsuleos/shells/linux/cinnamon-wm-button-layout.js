/**
 * Disposition boutons barre titre Muffin — org.cinnamon.desktop.wm.preferences button-layout.
 */
(function initCinnamonWmButtonLayout(global) {
    'use strict';

    var BUTTON_IDS = {
        minimize: 'minimizeBtn',
        maximize: 'resizeBtn',
        close: 'closeBtn'
    };

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function parseLayout(layout) {
        var s = String(layout || ':minimize,maximize,close');
        var parts = s.split(':');
        return {
            left: (parts[0] || '').split(',').filter(Boolean),
            right: (parts[1] || '').split(',').filter(Boolean)
        };
    }

    function applyLayoutToHeader(header, layout) {
        if (!header) {
            return;
        }
        var navs = header.querySelectorAll(':scope > nav');
        if (navs.length < 2) {
            return;
        }
        var leftNav = navs[0];
        var rightNav = navs[navs.length - 1];
        var parsed = parseLayout(layout);
        var buttons = {};
        var key;
        for (key in BUTTON_IDS) {
            if (Object.prototype.hasOwnProperty.call(BUTTON_IDS, key)) {
                var btn = header.querySelector('#' + BUTTON_IDS[key]);
                if (btn) {
                    buttons[key] = btn;
                }
            }
        }
        leftNav.textContent = '';
        rightNav.textContent = '';
        parsed.left.forEach(function (name) {
            if (buttons[name]) {
                leftNav.appendChild(buttons[name]);
            }
        });
        parsed.right.forEach(function (name) {
            if (buttons[name]) {
                rightNav.appendChild(buttons[name]);
            }
        });
        header.dataset.capsuleWmLayoutApplied = layout;
    }

    function currentLayout() {
        if (global.document && global.document.body && global.document.body.dataset.capsuleButtonLayout) {
            return global.document.body.dataset.capsuleButtonLayout;
        }
        var gs = global.CapsuleCinnamonGSettings;
        if (gs && typeof gs.getCapsule === 'function') {
            return gs.getCapsule('mint-wm-button-layout', ':minimize,maximize,close');
        }
        return ':minimize,maximize,close';
    }

    function applyAll(layout) {
        if (!isMint()) {
            return;
        }
        var value = layout || currentLayout();
        global.document.querySelectorAll(
            'body#mint .windowElement[data-window-chrome-toolkit="cinnamon"]:not(#mainMenu)'
        ).forEach(function (win) {
            applyLayoutToHeader(win.querySelector(':scope > #windowHeader'), value);
        });
    }

    function refresh() {
        applyAll(currentLayout());
    }

    function onWindowOpened(event) {
        if (!event.detail || !event.detail.slotId) {
            return;
        }
        global.setTimeout(function () {
            var win = global.document.querySelector(
                '.windowElement[data-link="' + event.detail.slotId + '"]'
            );
            if (win) {
                applyLayoutToHeader(win.querySelector(':scope > #windowHeader'), currentLayout());
            }
        }, 0);
    }

    global.CapsuleCinnamonWmButtonLayout = {
        parseLayout: parseLayout,
        applyLayoutToHeader: applyLayoutToHeader,
        applyAll: applyAll,
        refresh: refresh
    };

    if (global.document) {
        global.document.addEventListener('capsule:wm-button-layout-changed', refresh);
        global.document.addEventListener('capsule:window-opened', onWindowOpened);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', refresh);
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', refresh);
        } else {
            refresh();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
