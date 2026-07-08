/**
 * Paramètres souris Cinnamon — défilement naturel simulé (org.cinnamon.desktop.peripherals.mouse).
 */
(function initMintMouseSettings(global) {
    'use strict';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function naturalScrollOn() {
        return global.document.body
            && global.document.body.dataset.capsuleNaturalScroll === 'true';
    }

    function onWheel(event) {
        if (!isMint() || !naturalScrollOn()) {
            return;
        }
        var target = event.target;
        var scrollable = target && target.closest
            && target.closest('.windowElement, .menu-root, .mint-tray-popover, .calendar-popover, .volume-popover');
        if (!scrollable) {
            return;
        }
        if (scrollable.scrollHeight <= scrollable.clientHeight) {
            return;
        }
        event.preventDefault();
        scrollable.scrollTop -= event.deltaY;
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        global.document.addEventListener('wheel', onWheel, { passive: false, capture: true });
    }

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', bind);
        } else {
            bind();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
