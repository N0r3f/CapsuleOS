/**
 * Persistance kconfig simulée KDE — schémas kdeglobals / plasmashellrc / kwinrc.
 */
(function initCapsuleKdeKconfigStore(global) {
    'use strict';

    var STORAGE_PREFIX = 'kde-kconfig::';
    var BASELINE = {
        'kdeglobals::KDE/contrast': 'false',
        'kdeglobals::WM/startupAnimations': 'true',
        'plasmashellrc::PanelHeight': '40',
        'kwinrc::Windows/animate': 'true',
        'kwinrc::Windows/FocusPolicy': 'ClickToFocus',
        'kwinrc::Windows/FocusStealingPreventionLevel': '0'
    };

    function storageKey(schemaKey) {
        return STORAGE_PREFIX + schemaKey;
    }

    function getCapsule(key, fallback) {
        var saved = global.localStorage.getItem(storageKey(key));
        return saved != null ? saved : fallback;
    }

    function setCapsule(key, value) {
        global.localStorage.setItem(storageKey(key), String(value));
        return value;
    }

    function seedBaseline() {
        Object.keys(BASELINE).forEach(function seed(key) {
            if (global.localStorage.getItem(storageKey(key)) == null) {
                setCapsule(key, BASELINE[key]);
            }
        });
    }

    seedBaseline();

    global.CapsuleKdeKconfig = {
        getCapsule: getCapsule,
        setCapsule: setCapsule,
        getBool: function getBool(key, fallback) {
            var v = getCapsule(key, fallback ? 'true' : 'false');
            return v === 'true' || v === 'on' || v === '1';
        },
        setBool: function setBool(key, on) {
            return setCapsule(key, on ? 'true' : 'false');
        }
    };
}(typeof window !== 'undefined' ? window : globalThis));
