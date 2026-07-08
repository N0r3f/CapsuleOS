/**
 * Applet favorites@cinnamon.org — 5 lanceurs tray VM (22 px, gap ~2.86 px).
 * Ground truth : linux-mint-vm.json → panel.favorites
 */
(function initMintTrayFavorites(global) {
    'use strict';

    var FAVORITES = [
        { slot: 'calculator', title: 'Calculatrice', icon: '../../../usr/share/capsuleos/assets/images/vendors/mint/panel/org.gnome.Calculator.webp' },
        { slot: 'calendar', title: 'Agenda', icon: '../../../usr/share/capsuleos/assets/images/vendors/mint/panel/org.gnome.Calendar.webp' },
        { slot: 'text_editor', title: 'Éditeur de texte', icon: '../../../usr/share/capsuleos/assets/images/vendors/mint/panel/accessories-text-editor.webp' },
        { slot: 'mintinstall', title: 'Logithèque', icon: '../../../usr/share/capsuleos/assets/images/vendors/mint/panel/mintinstall.webp' },
        { slot: 'themes', title: 'Paramètres du système', icon: '../../../usr/share/capsuleos/assets/images/vendors/mint/panel/preferences-desktop-theme.webp' },
    ];

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function resolveIcon(path) {
        if (typeof global.resolveCapsuleAssetUrl === 'function') {
            return global.resolveCapsuleAssetUrl(path);
        }
        if (typeof global.resolveCapsuleResourceUrl === 'function') {
            return global.resolveCapsuleResourceUrl(path);
        }
        return path;
    }

    function bindFavorite(btn) {
        if (!btn || btn.dataset.mintFavoriteBound === 'true') {
            return;
        }
        btn.dataset.mintFavoriteBound = 'true';
        btn.addEventListener('click', function onFavoriteClick(event) {
            event.preventDefault();
            event.stopPropagation();
            var slot = btn.getAttribute('data-link');
            if (slot && typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink(slot);
            }
        });
    }

    function renderFavorites(container) {
        if (!container) {
            return;
        }
        container.innerHTML = '';
        FAVORITES.forEach(function renderFavorite(entry) {
            var btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'taskbar-favorites__btn';
            btn.setAttribute('data-link', entry.slot);
            btn.title = entry.title;
            btn.setAttribute('aria-label', entry.title);
            var img = global.document.createElement('img');
            img.src = resolveIcon(entry.icon);
            img.alt = '';
            btn.appendChild(img);
            container.appendChild(btn);
            bindFavorite(btn);
        });
    }

    function init() {
        if (!isMint()) {
            return;
        }
        var container = global.document.getElementById('mint-tray-favorites');
        if (!container) {
            return;
        }
        renderFavorites(container);
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}(typeof window !== 'undefined' ? window : this));
