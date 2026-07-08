/**
 * Gardes toolkit partagés — contrat Se-Shell / Se-WM (settings-effects-chain).
 */
(function initSeToolkitGuards(global) {
    'use strict';

    const GNOME_BODY_IDS = new Set(['rocky', 'fedora', 'alma', 'ubuntu', 'anduinos', 'elementary', 'kali']);
    const MINT_BODY_IDS = new Set(['mint']);
    const PLASMA_BODY_IDS = new Set(['kde-neon', 'debian-kde', 'mx-kde', 'lxqt']);

    function bodyId() {
        return global.document && global.document.body ? global.document.body.id : '';
    }

    global.CapsuleSeToolkitGuards = {
        bodyId: bodyId,
        isMint: function isMint(id) {
            return MINT_BODY_IDS.has(id || bodyId());
        },
        isGnomeShell: function isGnomeShell(id) {
            return GNOME_BODY_IDS.has(id || bodyId());
        },
        isPlasma: function isPlasma(id) {
            return PLASMA_BODY_IDS.has(id || bodyId());
        }
    };
}(typeof window !== 'undefined' ? window : globalThis));
