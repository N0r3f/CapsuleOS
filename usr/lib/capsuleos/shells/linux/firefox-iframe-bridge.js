// SPDX-FileCopyrightText: 2020-2026 les contributeurs CapsuleOS
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Pont postMessage iframe simulé → kernel Firefox (navigation parent).
 * Les pages web incluent usr/share/capsuleos/web/_shared/site-nav.js
 */
(function initCapsuleFirefoxIframeBridge(global) {
    'use strict';

    if (global.__capsuleFirefoxIframeBridgeBound) {
        return;
    }
    global.__capsuleFirefoxIframeBridgeBound = true;

    global.addEventListener('message', function onCapsuleWebNavigate(event) {
        const data = event && event.data;
        if (!data || data.type !== 'capsule:web-navigate' || !data.href) {
            return;
        }

        const win = global.document && global.document.getElementById('firefox');
        if (!win || !win.classList.contains('windowElementActive')) {
            return;
        }

        const app = win.querySelector('[data-firefox-app]');
        const frame = app && app.querySelector('[data-browser-redirect-frame]');
        if (!app || !frame || event.source !== frame.contentWindow) {
            return;
        }

        if (typeof app.__capsuleFirefoxNavigate === 'function') {
            app.__capsuleFirefoxNavigate(data.href);
        }
    });
}(typeof window !== 'undefined' ? window : globalThis));
