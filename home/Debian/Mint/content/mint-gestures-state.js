/**
 * Gestes Cinnamon — org.cinnamon.gestures enabled.
 */
(function initMintGesturesState(global) {
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
            global.document.body.dataset.capsuleGesturesEnabled = store.getBool('mint-gestures-enabled', false) ? 'true' : 'false';
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:gestures-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.key !== 'enabled') {
                return;
            }
            if (event.detail.schema === 'org.cinnamon.gestures') {
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
