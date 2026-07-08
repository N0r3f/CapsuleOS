/**
 * Langue système — org.gnome.system.locale region (aligné /etc/default/locale VM).
 */
(function initMintLocaleState(global) {
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
            global.document.body.dataset.capsuleSystemLocale = store.getCapsule('mint-locale-lang', 'fr_FR.UTF-8');
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:locale-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.key !== 'region') {
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
