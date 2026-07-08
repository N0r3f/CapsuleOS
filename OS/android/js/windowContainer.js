/**
 * Android — shell fenêtre commun (drag / resize sur .windowElement).
 */
(function initAndroidWindowContainer() {
    'use strict';

    window.CAPSULE_WINDOW_FAMILY = window.CAPSULE_WINDOW_FAMILY || 'android';

    if (typeof CapsuleWindowShell === 'undefined') {
        console.error('CapsuleOS Android: charger capsule-window-shell.js avant windowContainer.js');
        return;
    }

    CapsuleWindowShell.init({
        displayOnOpen: 'flex',
        positionOnOpen: 'fixed',
    });
}());
