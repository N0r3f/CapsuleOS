/**
 * Garde-fou scripts bureau (toutes familles) — drag / resize / contexte.
 * Ordre : capsule-window.js → resizeWindow.js → window-drag.js
 *       → capsule-window-context.js → capsule-desktop-shell.js → shell vendor
 */
(function validateCapsuleDesktopShell(global) {
    'use strict';

    const missing = [];
    if (typeof global.CapsuleWindow === 'undefined') {
        missing.push('CapsuleWindow (usr/lib/capsuleos/common/capsule-window.js)');
    }
    if (typeof global.makeDraggable !== 'function'
        && !(global.CapsuleWindow && global.CapsuleWindow.enableDrag)) {
        missing.push('makeDraggable / CapsuleWindow.enableDrag (window-drag.js)');
    }
    if (typeof global.Resizer !== 'function'
        && !(global.CapsuleWindow && global.CapsuleWindow.enableResize)) {
        missing.push('Resizer / CapsuleWindow.enableResize (resizeWindow.js)');
    }
    if (typeof global.CapsuleWindowContext === 'undefined'
        && typeof global.CapsuleLinuxWindowContext === 'undefined') {
        missing.push('CapsuleWindowContext (shells/common/capsule-window-context.js)');
    }

    if (missing.length) {
        console.error('[CapsuleOS] capsule-desktop-shell — manquant:', missing.join(', '));
    }

    const boot = () => {
        if (global.CapsuleWindowContext && typeof global.CapsuleWindowContext.boot === 'function') {
            global.CapsuleWindowContext.boot();
        }
    };

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            setTimeout(boot, 0);
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
