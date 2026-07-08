/**
 * Pile de fenêtres (z-index, activation).
 */
(function initCapsuleWindowStack(global) {
    'use strict';

    let zCounter = 50;

    function activateWindow(container) {
        if (!container) {
            return;
        }

        document.querySelectorAll('.windowElementActive').forEach((win) => {
            win.classList.remove('windowElementActive');
        });

        container.classList.add('windowElementActive');
        container.style.zIndex = `${++zCounter}`;
    }

    function bringToFront(container) {
        if (!container) {
            return;
        }
        container.style.zIndex = `${++zCounter}`;
    }

    global.CapsuleWindowStack = {
        activateWindow,
        bringToFront,
        getZCounter: () => zCounter,
        resetZCounter: (value = 50) => {
            zCounter = value;
        },
    };
}(typeof window !== 'undefined' ? window : globalThis));
