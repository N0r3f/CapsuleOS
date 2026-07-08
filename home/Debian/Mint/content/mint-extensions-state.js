/**
 * Extensions Cinnamon — reflète org.cinnamon enabled-extensions.
 */
(function initMintExtensionsState(global) {
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
            items = store.parseStrv(store.getRaw('org.cinnamon', 'enabled-extensions'));
        }
        if (global.document.body) {
            global.document.body.dataset.capsuleEnabledExtensions = JSON.stringify(items);
            global.document.body.dataset.capsuleExtensionsActive = items.length > 0 ? 'true' : 'false';
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:extensions-enabled-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.key !== 'enabled-extensions') {
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
