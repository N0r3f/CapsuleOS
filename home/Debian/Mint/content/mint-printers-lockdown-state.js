/**
 * Imprimantes — applet panel + verrouillage impression.
 */
(function initMintPrintersLockdownState(global) {
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
            global.document.body.dataset.capsuleLockdownDisablePrinting = store.getBool('mint-lockdown-disable-printing', false) ? 'true' : 'false';
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:lockdown-printing-changed', applyAll);
        global.document.addEventListener('capsule:applet-visibility-changed', function () {});
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.key !== 'disable-printing') {
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
