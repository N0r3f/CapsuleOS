// SPDX-FileCopyrightText: 2020-2026 les contributeurs CapsuleOS
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Préférences accessibilité WCAG 2.x — portail et site CapsuleOS (P10 opt-in).
 * Stockage partagé avec Se-A11y Linux (mint-contrast-mode, mint-font-scale).
 */
(function initCapsuleA11y(global) {
    'use strict';

    const doc = global.document;
    if (!doc || !doc.documentElement) {
        return;
    }

    const STORAGE = {
        contrast: 'mint-contrast-mode',
        fontScale: 'mint-font-scale',
        reducedMotion: 'capsule-reduced-motion',
        underlineLinks: 'capsule-underline-links',
    };

    const DEFAULTS = {
        contrast: 'normal',
        fontScale: '100',
        reducedMotion: 'off',
        underlineLinks: 'off',
    };

    function readPref(key, fallback) {
        try {
            return global.localStorage.getItem(key) || fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writePref(key, value) {
        try {
            global.localStorage.setItem(key, value);
        } catch (e) {
            /* quota / mode privé */
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

    function applyReducedMotion(mode) {
        doc.documentElement.dataset.reducedMotion = mode === 'on' ? 'on' : 'off';
    }

    function applyUnderlineLinks(mode) {
        doc.documentElement.dataset.underlineLinks = mode === 'on' ? 'on' : 'off';
    }

    function getState() {
        return {
            contrast: readPref(STORAGE.contrast, DEFAULTS.contrast),
            fontScale: readPref(STORAGE.fontScale, DEFAULTS.fontScale),
            reducedMotion: readPref(STORAGE.reducedMotion, DEFAULTS.reducedMotion),
            underlineLinks: readPref(STORAGE.underlineLinks, DEFAULTS.underlineLinks),
        };
    }

    function applyState(state) {
        applyContrast(state.contrast);
        applyFontScale(state.fontScale);
        applyReducedMotion(state.reducedMotion);
        applyUnderlineLinks(state.underlineLinks);
    }

    function bootstrapFromStorage() {
        applyState(getState());
    }

    function setContrast(mode) {
        const resolved = mode === 'high' ? 'high' : 'normal';
        writePref(STORAGE.contrast, resolved);
        applyContrast(resolved);
        doc.dispatchEvent(new CustomEvent('capsule:a11y-contrast-changed', {
            detail: { mode: resolved, high: resolved === 'high' },
        }));
    }

    function setFontScale(scale) {
        const resolved = ['110', '125'].includes(String(scale)) ? String(scale) : '100';
        writePref(STORAGE.fontScale, resolved);
        applyFontScale(resolved);
        doc.dispatchEvent(new CustomEvent('capsule:a11y-font-scale-changed', {
            detail: { scale: resolved, large: resolved === '125' },
        }));
    }

    function setReducedMotion(on) {
        const resolved = on ? 'on' : 'off';
        writePref(STORAGE.reducedMotion, resolved);
        applyReducedMotion(resolved);
        doc.dispatchEvent(new CustomEvent('capsule:a11y-reduced-motion-changed', {
            detail: { on: resolved === 'on' },
        }));
    }

    function setUnderlineLinks(on) {
        const resolved = on ? 'on' : 'off';
        writePref(STORAGE.underlineLinks, resolved);
        applyUnderlineLinks(resolved);
        doc.dispatchEvent(new CustomEvent('capsule:a11y-underline-links-changed', {
            detail: { on: resolved === 'on' },
        }));
    }

    function isActive() {
        const state = getState();
        return state.contrast === 'high'
            || state.fontScale !== '100'
            || state.reducedMotion === 'on'
            || state.underlineLinks === 'on';
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

    global.CapsuleA11y = {
        STORAGE,
        DEFAULTS,
        getState,
        applyState,
        bootstrapFromStorage,
        setContrast,
        setFontScale,
        setReducedMotion,
        setUnderlineLinks,
        isActive,
    };
}(typeof window !== 'undefined' ? window : globalThis));
