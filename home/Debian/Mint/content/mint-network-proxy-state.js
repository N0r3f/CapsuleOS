/**
 * Réseau — proxy système et applet nm-applet.
 */
(function initMintNetworkProxyState(global) {
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
        if (global.document.body) {
            global.document.body.dataset.capsuleProxyMode = store.getCapsule('mint-proxy-mode', 'none');
            global.document.body.dataset.capsuleNmShowApplet = store.getBool('mint-nm-show-applet', true) ? 'true' : 'false';
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:network-proxy-changed', applyAll);
        global.document.addEventListener('capsule:nm-applet-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', applyAll);
    }

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', bind);
        } else {
            bind();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
