/**
 * Couleur — seuils recalibrage org.cinnamon.settings-daemon.plugins.color.
 */
(function initMintColorCalibrationState(global) {
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
            global.document.body.dataset.capsuleColorRecalibrateDisplay = store.getCapsule('mint-color-recalibrate-display', '0');
            global.document.body.dataset.capsuleColorRecalibratePrinter = store.getCapsule('mint-color-recalibrate-printer', '0');
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:color-calibration-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.schema !== 'org.cinnamon.settings-daemon.plugins.color') {
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
