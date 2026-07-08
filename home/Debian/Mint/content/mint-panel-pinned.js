/**
 * Lanceurs grouped-window-list Mint — prefetch slots au survol.
 * Les clics sont gérés par taskbar-window-list.js (boutons grouped).
 */
(function initMintPanelPinned(global) {
    'use strict';

    function isMintPanel() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function bindGroupedPrefetch(btn) {
        if (!btn || btn.dataset.mintGroupedPrefetchBound === 'true') {
            return;
        }
        btn.dataset.mintGroupedPrefetchBound = 'true';
        btn.addEventListener('mouseenter', function onGroupedPrefetch() {
            var slot = btn.getAttribute('data-window-link');
            if (slot && global.CapsuleSlotLoader
                && typeof global.CapsuleSlotLoader.ensureSlotLoaded === 'function') {
                global.CapsuleSlotLoader.ensureSlotLoaded(slot);
            }
        });
    }

    function bindExistingGroupedButtons() {
        var buttons = global.document.querySelectorAll(
            '#taskbar-window-list .taskbar-window-list__btn[data-window-link]'
        );
        var i;
        for (i = 0; i < buttons.length; i++) {
            bindGroupedPrefetch(buttons[i]);
        }
    }

    function init() {
        if (!isMintPanel()) {
            return;
        }
        bindExistingGroupedButtons();
        global.document.addEventListener('capsule:window-opened', bindExistingGroupedButtons);
        global.document.addEventListener('capsule:window-focused', bindExistingGroupedButtons);
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : this);
