/**
 * Visibilité applets panel Cinnamon — reflète org.cinnamon enabled-applets (parity).
 */
(function initMintAppletVisibility(global) {
    'use strict';

    var TARGETS = {
        'calendar@cinnamon.org': '#taskbar-clock-trigger',
        'notifications@cinnamon.org': '#tray-btn-notifications',
        'cornerbar@cinnamon.org': '#tray-btn-cornerbar',
        'printers@cinnamon.org': '#tray-btn-printers',
        'network@cinnamon.org': '#tray-btn-network'
    };

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function gs() {
        return global.CapsuleCinnamonGSettings;
    }

    function listHasToken(items, token) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            if (items[i].indexOf(token) !== -1) {
                return true;
            }
        }
        return false;
    }

    function setTrayVisible(selector, visible) {
        var el = global.document.querySelector(selector);
        if (!el) {
            return;
        }
        if (visible) {
            el.removeAttribute('hidden');
            el.classList.remove('mint-tray--vm-collapsed');
            el.setAttribute('aria-hidden', 'false');
        } else {
            el.setAttribute('hidden', '');
            el.classList.add('mint-tray--vm-collapsed');
            el.setAttribute('aria-hidden', 'true');
        }
    }

    function applyAll() {
        if (!isMint()) {
            return;
        }
        var store = gs();
        var items = [];
        if (store && typeof store.parseStrv === 'function') {
            items = store.parseStrv(store.getRaw('org.cinnamon', 'enabled-applets'));
        }
        Object.keys(TARGETS).forEach(function (token) {
            var enabled = listHasToken(items, token);
            if (token === 'notifications@cinnamon.org' || token === 'printers@cinnamon.org') {
                setTrayVisible(TARGETS[token], false);
                return;
            }
            setTrayVisible(TARGETS[token], enabled);
        });
        if (global.CapsuleMintPanelIdleTray && typeof global.CapsuleMintPanelIdleTray.refresh === 'function') {
            global.CapsuleMintPanelIdleTray.refresh();
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:applet-visibility-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.key !== 'enabled-applets') {
                return;
            }
            applyAll();
        });
    }

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', bind);
        } else {
            bind();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
