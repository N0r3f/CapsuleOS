/**
 * Parité System Settings KDE — EFFECT_HANDLERS → bus capsule:* (pilote linux-kde-neon).
 */
(function initKdeSettingsParity(global) {
    'use strict';

    var PLASMA_BODY_IDS = new Set(['kde-neon', 'debian-kde', 'mx-kde', 'lxqt', 'opensuse']);

    function isPlasma() {
        var id = global.document && global.document.body ? global.document.body.id : '';
        return PLASMA_BODY_IDS.has(id);
    }

    function store() {
        return global.CapsuleKdeKconfig;
    }

    function dispatch(name, detail) {
        if (global.document && typeof global.CustomEvent === 'function') {
            global.document.dispatchEvent(new global.CustomEvent(name, { detail: detail || {} }));
        }
    }

    function applyA11yHighContrast(on) {
        var kc = store();
        if (kc) {
            kc.setBool('kdeglobals::KDE/contrast', on);
        }
        var themeStorage = global.CapsuleThemeStorage;
        if (themeStorage && typeof themeStorage.applyContrastMode === 'function') {
            themeStorage.applyContrastMode(on ? 'high' : 'normal');
        } else if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.contrastMode = on ? 'high' : 'normal';
        }
        dispatch('capsule:a11y-contrast-changed', { high: on });
    }

    function applyA11yLargeText(on) {
        var themeStorage = global.CapsuleThemeStorage;
        if (themeStorage && typeof themeStorage.applyFontScale === 'function') {
            themeStorage.applyFontScale(on ? '125' : '100');
        } else if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.fontScale = on ? '125' : '100';
        }
        dispatch('capsule:a11y-font-scale-changed', { large: on, scale: on ? '125' : '100' });
    }

    function applyPanelHeight(value) {
        var kc = store();
        if (kc) {
            kc.setCapsule('plasmashellrc::PanelHeight', value || '40');
        }
        if (global.document && global.document.body) {
            global.document.body.dataset.plasmaPanelHeight = String(value || '40');
        }
        dispatch('capsule:panel-height-changed', { height: value });
    }

    function applyWindowAnimations(on) {
        var kc = store();
        if (kc) {
            kc.setBool('kwinrc::Windows/animate', on);
        }
        dispatch('capsule:window-animations-changed', { enabled: on });
    }

    function applyClickToFocus(on) {
        var kc = store();
        if (kc) {
            kc.setCapsule('kwinrc::Windows/FocusPolicy', on ? 'ClickToFocus' : 'FocusFollowsMouse');
        }
        if (global.document && global.document.body) {
            global.document.body.dataset.plasmaClickToFocus = on ? 'true' : 'false';
        }
        dispatch('capsule:click-to-focus-changed', { enabled: on });
    }

    function applyFocusStealing(on) {
        var kc = store();
        if (kc) {
            kc.setCapsule('kwinrc::Windows/FocusStealingPreventionLevel', on ? '1' : '0');
        }
        dispatch('capsule:focus-stealing-changed', { enabled: on });
    }

    function applyReducedMotion(on) {
        var kc = store();
        if (kc) {
            kc.setBool('kdeglobals::KDE/AnimationDurationFactor', !on);
        }
        if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.reducedMotion = on ? 'true' : 'false';
        }
        dispatch('capsule:reduced-motion-changed', { enabled: on });
    }

    function applyDesktopIcons(on) {
        var kc = store();
        if (kc) {
            kc.setBool('plasma-org.kde.plasma.desktop-appletsrc::DesktopIcons/Enabled', on);
        }
        if (global.document && global.document.body) {
            global.document.body.dataset.plasmaDesktopIcons = on ? 'true' : 'false';
        }
        dispatch('capsule:desktop-icons-visibility-changed', { visible: on });
    }

    function applyDesktopAlign(value) {
        var kc = store();
        if (kc) {
            kc.setCapsule('plasma-org.kde.plasma.desktop-appletsrc::DesktopIcons/Arrangement', value === 'right' ? '1' : '0');
        }
        if (global.document && global.document.body) {
            global.document.body.dataset.plasmaDesktopAlign = value || 'left';
        }
        dispatch('capsule:desktop-align-changed', { align: value || 'left' });
    }

    function applyGlobalTheme(theme) {
        var mode = theme === 'dark' ? 'dark' : 'light';
        var kc = store();
        if (kc) {
            kc.setCapsule('kdeglobals::General/ColorScheme', mode === 'dark' ? 'BreezeDark' : 'Breeze');
        }
        if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.theme = mode;
        }
        var themeStorage = global.CapsuleThemeStorage;
        var bodyId = global.document && global.document.body ? global.document.body.id : 'kde-neon';
        if (themeStorage && typeof themeStorage.persistTheme === 'function') {
            themeStorage.persistTheme(mode, bodyId);
        } else {
            try {
                global.localStorage.setItem('kde-neon-theme', mode);
            } catch (e) { /* offline */ }
        }
        dispatch('capsule:global-theme-changed', { theme: mode });
    }

    function applyNotificationsBanners(on) {
        var kc = store();
        if (kc) {
            kc.setBool('plasmanotifyrc::DoNotDisturb/Enabled', !on);
        }
        dispatch('capsule:notifications-changed', { enabled: on });
    }

    function applyDefaultBrowser(value) {
        var kc = store();
        if (kc) {
            kc.setCapsule('kdeglobals::General/BrowserApplication', value || 'firefox.desktop');
        }
        dispatch('capsule:default-app-changed', { app: value, kind: 'browser' });
    }

    function applyAccentColor(value) {
        var kc = store();
        if (kc) {
            kc.setCapsule('kdeglobals::General/AccentColor', value || 'Blue');
        }
        if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.accentColor = value || 'Blue';
        }
        dispatch('capsule:accent-color-changed', { color: value });
    }

    var EFFECT_HANDLERS = {
        'kde-a11y-high-contrast': function (v) { applyA11yHighContrast(v === 'on'); },
        'kde-a11y-large-text': function (v) { applyA11yLargeText(v === 'on'); },
        'kde-reduced-motion': function (v) { applyReducedMotion(v === 'on'); },
        'kde-panel-height': function (v) { applyPanelHeight(v); },
        'kde-window-animations': function (v) { applyWindowAnimations(v === 'on'); },
        'kde-click-to-focus': function (v) { applyClickToFocus(v === 'on'); },
        'kde-focus-stealing': function (v) { applyFocusStealing(v === 'on'); },
        'kde-desktop-icons': function (v) { applyDesktopIcons(v === 'on'); },
        'kde-desktop-align': function (v) { applyDesktopAlign(v); },
        'kde-global-theme': function (v) { applyGlobalTheme(v); },
        'kde-notifications-banners': function (v) { applyNotificationsBanners(v === 'on'); },
        'kde-default-browser': function (v) { applyDefaultBrowser(v); },
        'kde-accent-color': function (v) { applyAccentColor(v); }
    };

    function bindControls(root) {
        if (!root || !isPlasma()) {
            return;
        }
        root.querySelectorAll('[data-kde-setting]').forEach(function wire(el) {
            var key = el.getAttribute('data-kde-setting');
            if (!key || el.dataset.kdeParityBound === 'true') {
                return;
            }
            el.dataset.kdeParityBound = 'true';
            var handler = EFFECT_HANDLERS[key];
            if (!handler) {
                return;
            }
            if (key === 'kde-global-theme' && el.matches('[data-kde-theme-option]')) {
                return;
            }
            if (el.matches('[data-settings-switch]')) {
                el.addEventListener('click', function onToggle() {
                    var on = el.getAttribute('aria-checked') !== 'true';
                    el.setAttribute('aria-checked', on ? 'true' : 'false');
                    el.classList.toggle('is-on', on);
                    handler(on ? 'on' : 'off');
                });
            } else if (el.matches('select[data-kde-setting]')) {
                el.addEventListener('change', function onSelect() {
                    handler(el.value);
                });
            }
        });
    }

    function initKdeSettingsParity() {
        if (!isPlasma()) {
            return;
        }
        bindControls(global.document);
        global.document.addEventListener('capsule:slot-injected', function onSlot(ev) {
            var detail = ev.detail || {};
            if (detail.slotId === 'themes' && detail.container) {
                bindControls(detail.container);
            }
        });
    }

    global.CapsuleKdeSettingsParity = {
        EFFECT_HANDLERS: EFFECT_HANDLERS,
        bindControls: bindControls
    };

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', initKdeSettingsParity);
        } else {
            initKdeSettingsParity();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
