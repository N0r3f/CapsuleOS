/**
 * Orchestrateur Paramètres KDE Plasma — nav + parité UI (pilote linux-kde-neon).
 */
(function initKdeSystemsettingsOrchestrator(global) {
    'use strict';

    var PLASMA_BODY_IDS = new Set(['kde-neon', 'debian-kde', 'mx-kde', 'lxqt', 'opensuse']);

    function isPlasma() {
        var id = global.document && global.document.body ? global.document.body.id : '';
        return PLASMA_BODY_IDS.has(id);
    }

    function wire(container) {
        if (!isPlasma()) {
            return;
        }
        var root = typeof global.resolveKdeSettingsRoot === 'function'
            ? global.resolveKdeSettingsRoot(container)
            : null;
        if (!root) {
            return;
        }
        if (global.CapsuleKdeSettingsNav && typeof global.CapsuleKdeSettingsNav.bindNavigation === 'function') {
            global.CapsuleKdeSettingsNav.bindNavigation(root);
        }
        if (typeof global.initKdeSettingsApp === 'function') {
            global.initKdeSettingsApp(container);
        }
    }

    global.CapsuleKdeSystemSettings = {
        wire: wire,
    };
}(typeof window !== 'undefined' ? window : globalThis));
