/**
 * Pare-feu — état UFW simulé (baseline /etc/ufw/ufw.conf VM).
 */
(function initMintFirewallUfwState(global) {
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
            global.document.body.dataset.capsuleUfwEnabled = store.getBool('mint-ufw-enabled', false) ? 'true' : 'false';
            global.document.body.dataset.capsuleUfwLogging = store.getCapsule('mint-ufw-logging', 'low');
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:ufw-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.schema !== 'org.ubuntu.ufw') {
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
