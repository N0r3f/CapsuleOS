/**
 * macOS Sonoma — shell fenêtre commun (référence CapsuleOS).
 */
(function initMacosSonomaWindowContainer() {
    'use strict';

    window.CAPSULE_WINDOW_FAMILY = window.CAPSULE_WINDOW_FAMILY || 'macos';

    function ensureFinderFrame(container) {
        if (!container || container.dataset.finderReady === 'true') {
            return;
        }
        const iframe = document.createElement('iframe');
        iframe.src = './pages/finder.html';
        iframe.title = 'Finder';
        iframe.className = 'mac-finder-frame';
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups');
        iframe.style.cssText = 'border:0;width:100%;height:calc(100% - var(--head, 28px));flex:1;';
        container.appendChild(iframe);
        container.dataset.finderReady = 'true';
    }

    if (typeof CapsuleWindowShell === 'undefined') {
        console.error('CapsuleOS macOS: charger capsule-window-shell.js avant windowContainer.js');
        return;
    }

    CapsuleWindowShell.init({
        displayOnOpen: 'block',
        positionOnOpen: 'fixed',
        onOpen: function (container, slotId) {
            if (slotId === 'finder') {
                ensureFinderFrame(container);
            }
        },
    });
}());
