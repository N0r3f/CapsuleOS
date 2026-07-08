// SPDX-FileCopyrightText: 2020-2026 les contributeurs CapsuleOS
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Bus Se-A11y transversal — dataset html + événements capsule:a11y-* (tous toolkits Linux).
 * Contrat : etc/capsuleos/contracts/settings-effects-chain.json → layerConsumers.Se-A11y
 */
(function initCapsuleSeA11yBus(global) {
    'use strict';

    if (global.CapsuleA11y) {
        global.CapsuleSeA11yBus = {
            bootstrapFromStorage: global.CapsuleA11y.bootstrapFromStorage,
        };
        return;
    }

    const doc = global.document;
    if (!doc || !doc.documentElement) {
        return;
    }

    const CONTRAST_KEY = 'mint-contrast-mode';
    const FONT_KEY = 'mint-font-scale';

    function readPref(key, fallback) {
        try {
            return global.localStorage.getItem(key) || fallback;
        } catch (e) {
            return fallback;
        }
    }

    function applyContrast(mode) {
        const resolved = mode === 'high' ? 'high' : 'normal';
        doc.documentElement.dataset.contrastMode = resolved;
    }

    function applyFontScale(scale) {
        const resolved = ['110', '125'].includes(String(scale)) ? String(scale) : '100';
        doc.documentElement.dataset.fontScale = resolved;
    }

    function bootstrapFromStorage() {
        applyContrast(readPref(CONTRAST_KEY, 'normal'));
        applyFontScale(readPref(FONT_KEY, '100'));
        const reduced = readPref('capsule-reduced-motion', 'off');
        doc.documentElement.dataset.reducedMotion = reduced === 'on' ? 'on' : 'off';
        const underline = readPref('capsule-underline-links', 'off');
        doc.documentElement.dataset.underlineLinks = underline === 'on' ? 'on' : 'off';
    }

    doc.addEventListener('capsule:a11y-contrast-changed', function onContrast(ev) {
        const detail = ev && ev.detail ? ev.detail : {};
        if (detail.mode) {
            applyContrast(detail.mode);
            return;
        }
        if (detail.high !== undefined) {
            applyContrast(detail.high ? 'high' : 'normal');
        }
    });

    doc.addEventListener('capsule:a11y-font-scale-changed', function onFont(ev) {
        const detail = ev && ev.detail ? ev.detail : {};
        if (detail.scale) {
            applyFontScale(detail.scale);
            return;
        }
        if (detail.large) {
            applyFontScale('125');
        }
    });

    bootstrapFromStorage();
    global.CapsuleSeA11yBus = { bootstrapFromStorage: bootstrapFromStorage };
}(typeof window !== 'undefined' ? window : globalThis));
