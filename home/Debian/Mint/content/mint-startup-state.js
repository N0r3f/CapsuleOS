/**
 * Applications au démarrage — reflète org.cinnamon startup-applications (simulé).
 */
(function initMintStartupState(global) {
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
        var items = [];
        if (store && typeof store.parseStrv === 'function') {
            items = store.parseStrv(store.getRaw('org.cinnamon', 'startup-applications'));
        }
        if (global.document.body) {
            global.document.body.dataset.capsuleStartupApps = JSON.stringify(items);
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:startup-apps-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.key !== 'startup-applications') {
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
