/**
 * Visibilité tray bureau nu — ground truth capture VM 1280×800 (2026-06-18).
 * Cinnamon n'affiche pas tous les applets activés : systray réduit + applets dédiées.
 */
(function initMintPanelIdleTray(global) {
    'use strict';

    /** Masqués sur bureau nu (VM : shield · réseau · son · horloge · cornerbar). */
    var IDLE_HIDDEN = [
        '.sticky-applet-trigger',
        '#tray-btn-xapp',
        '#tray-btn-notifications',
        '#tray-btn-printers',
        '#tray-btn-removable',
        '#tray-btn-keyboard',
        '#mint-tray-favorites',
        '#tray-btn-screensaver',
        '#tray-btn-power',
    ];

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function setIdleHidden(selector, hidden) {
        var nodes = global.document.querySelectorAll(selector);
        var i;
        for (i = 0; i < nodes.length; i += 1) {
            if (hidden) {
                nodes[i].classList.add('mint-tray--idle-hidden');
                nodes[i].setAttribute('aria-hidden', 'true');
                if (nodes[i].id === 'mint-tray-favorites') {
                    nodes[i].setAttribute('hidden', '');
                }
            } else {
                nodes[i].classList.remove('mint-tray--idle-hidden');
                nodes[i].removeAttribute('aria-hidden');
                if (nodes[i].id === 'mint-tray-favorites') {
                    nodes[i].removeAttribute('hidden');
                }
            }
        }
    }

    function applyIdleTray() {
        if (!isMint()) {
            return;
        }
        /* VM ground truth : ces applets n'ont pas de service actif dans le clone —
           rester masqués en permanence, indépendamment des fenêtres ouvertes. */
        IDLE_HIDDEN.forEach(function hide(sel) {
            setIdleHidden(sel, true);
        });
        global.document.dispatchEvent(new CustomEvent('capsule:mint-tray-idle-applied'));
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyIdleTray();
    }

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', bind);
        } else {
            bind();
        }
    }

    global.CapsuleMintPanelIdleTray = { refresh: applyIdleTray };
}(typeof window !== 'undefined' ? window : globalThis));
