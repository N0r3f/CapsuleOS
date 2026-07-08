/**
 * Fonds d'écran gsettings — org.cinnamon.desktop.background picture-options / opacity.
 */
(function initMintBackgroundGsettingsState(global) {
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
            global.document.body.dataset.capsuleBgPictureOptions = store.getCapsule('mint-bg-picture-options', 'zoom');
            global.document.body.dataset.capsuleBgPictureOpacity = store.getCapsule('mint-bg-picture-opacity', '100');
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:background-gsettings-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail) {
                return;
            }
            var key = event.detail.key;
            if (key === 'picture-options' || key === 'picture-opacity') {
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
