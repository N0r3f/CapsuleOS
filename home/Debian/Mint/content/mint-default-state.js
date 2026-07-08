/**
 * Applications par défaut — reflète org.cinnamon.desktop.media-handling / terminal.
 */
(function initMintDefaultState(global) {
    'use strict';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function gs() {
        return global.CapsuleCinnamonGSettings;
    }

    function applyAll() {
        if (!isMint()) {
            return;
        }
        var store = gs();
        if (!store) {
            return;
        }
        var autorun = store.getBool('mint-default-autorun-never', false);
        var terminal = store.getCapsule('mint-default-terminal', 'gnome-terminal');
        if (global.document.body) {
            global.document.body.dataset.capsuleAutorunNever = autorun ? 'true' : 'false';
            global.document.body.dataset.capsuleDefaultTerminal = terminal || 'gnome-terminal';
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:default-apps-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail) {
                return;
            }
            var key = event.detail.key;
            if (key === 'autorun-never' || key === 'exec') {
                applyAll();
            }
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
