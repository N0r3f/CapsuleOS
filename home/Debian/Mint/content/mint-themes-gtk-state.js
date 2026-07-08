/**
 * Thèmes GTK/icônes — org.cinnamon.desktop.interface gtk-theme / icon-theme.
 */
(function initMintThemesGtkState(global) {
    'use strict';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function gs() {
        return global.CapsuleCinnamonGSettings;
    }

    function syncThemesPanelLabels(gtk, icons) {
        var gtkEl = global.document.querySelector('[data-themes-gtk]');
        var iconsEl = global.document.querySelector('[data-themes-icons]');
        if (gtkEl) {
            gtkEl.textContent = gtk;
        }
        if (iconsEl) {
            iconsEl.textContent = icons;
        }
    }

    function applyAll() {
        if (!isMint()) {
            return;
        }
        var store = gs();
        if (!store) {
            return;
        }
        var gtk = store.getCapsule('mint-gtk-theme', 'Mint-Y-Dark-Aqua');
        var icons = store.getCapsule('mint-icon-theme', 'Mint-Y-Sand');
        if (global.document.body) {
            global.document.body.dataset.capsuleGtkTheme = gtk;
            global.document.body.dataset.capsuleIconTheme = icons;
        }
        syncThemesPanelLabels(gtk, icons);
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        applyAll();
        global.document.addEventListener('capsule:gtk-theme-changed', applyAll);
        global.document.addEventListener('capsule:icon-theme-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail) {
                return;
            }
            var key = event.detail.key;
            if (key === 'gtk-theme' || key === 'icon-theme') {
                applyAll();
            }
        });
    }

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', bind);
        } else {
            bind();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
