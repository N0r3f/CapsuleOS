/**
 * Desklets Cinnamon — org.cinnamon desklet-snap / lock-desklets / snap-interval.
 */
(function initMintDeskletsState(global) {
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
            global.document.body.dataset.capsuleDeskletSnap = store.getBool('mint-desklet-snap', true) ? 'true' : 'false';
            global.document.body.dataset.capsuleDeskletLock = store.getBool('mint-desklet-lock', false) ? 'true' : 'false';
            global.document.body.dataset.capsuleDeskletSnapInterval = store.getCapsule('mint-desklet-snap-interval', '25');
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:desklets-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail) {
                return;
            }
            var key = event.detail.key;
            if (key === 'desklet-snap' || key === 'lock-desklets' || key === 'desklet-snap-interval') {
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
