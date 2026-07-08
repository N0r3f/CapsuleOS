/**
 * Raccourcis bureau Mint — favoris VM (calendrier tray).
 */
(function initMintDesktopFavorites(global) {
    'use strict';

    function isMintDesktop() {
        return document.body && document.body.id === 'mint';
    }

    function openCalendarPopover() {
        var trigger = document.getElementById('taskbar-clock-trigger');
        if (trigger) {
            trigger.click();
        }
    }

    function bindFavorite(shortcut) {
        var action = shortcut.getAttribute('data-mint-favorite');
        if (!action) {
            return;
        }
        shortcut.addEventListener('click', function onFavoriteClick(event) {
            if (action === 'calendar') {
                event.preventDefault();
                event.stopPropagation();
                openCalendarPopover();
            }
        });
    }

    function init() {
        if (!isMintDesktop()) {
            return;
        }
        document.querySelectorAll('.desktop-shortcut[data-mint-favorite]').forEach(bindFavorite);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : this);
