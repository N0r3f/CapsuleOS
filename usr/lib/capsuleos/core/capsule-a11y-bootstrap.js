// SPDX-FileCopyrightText: 2020-2026 les contributeurs CapsuleOS
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Bootstrap WCAG CapsuleOS — applique les préférences localStorage sur <html> avant le rendu.
 * Contrat Se-A11y : etc/capsuleos/contracts/settings-effects-chain.json
 */
(function bootstrapCapsuleA11y(global) {
    'use strict';

    const doc = global.document;
    if (!doc || !doc.documentElement) {
        return;
    }

    const KEYS = {
        contrast: 'mint-contrast-mode',
        fontScale: 'mint-font-scale',
        reducedMotion: 'capsule-reduced-motion',
        underlineLinks: 'capsule-underline-links',
    };

    function readPref(key, fallback) {
        try {
            return global.localStorage.getItem(key) || fallback;
        } catch (e) {
            return fallback;
        }
    }

    const root = doc.documentElement;
    const contrast = readPref(KEYS.contrast, 'normal');
    root.dataset.contrastMode = contrast === 'high' ? 'high' : 'normal';

    const scale = String(readPref(KEYS.fontScale, '100'));
    root.dataset.fontScale = ['110', '125'].includes(scale) ? scale : '100';

    root.dataset.reducedMotion = readPref(KEYS.reducedMotion, 'off') === 'on' ? 'on' : 'off';
    root.dataset.underlineLinks = readPref(KEYS.underlineLinks, 'off') === 'on' ? 'on' : 'off';
}(typeof window !== 'undefined' ? window : globalThis));
