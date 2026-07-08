// SPDX-FileCopyrightText: 2020-2026 les contributeurs CapsuleOS
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Navigation inter-sites depuis une iframe web simulée vers le kernel Firefox.
 * Liens internes (relatifs, ?page=) restent dans l'iframe ; hosts indexés remontent au parent.
 */
(function initCapsuleWebNav() {
    'use strict';

    if (window.__capsuleWebNavBound) {
        return;
    }
    window.__capsuleWebNavBound = true;

    function shouldDelegateToParent(href) {
        if (!href || href.charAt(0) === '#') {
            return false;
        }
        if (/^javascript:/i.test(href)) {
            return false;
        }
        if (/^capsuleos:\/\//i.test(href)) {
            return true;
        }
        if (/^https?:\/\//i.test(href)) {
            return true;
        }
        if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}/i.test(href)) {
            return true;
        }
        if (href.indexOf('data-capsule-web-nav') >= 0) {
            return true;
        }
        return false;
    }

    document.addEventListener('click', function onWebNavClick(event) {
        const link = event.target.closest('[data-capsule-web-nav], a[href]');
        if (!link) {
            return;
        }

        const explicit = link.getAttribute('data-capsule-web-nav');
        const href = explicit || link.getAttribute('href') || '';
        if (!href || !shouldDelegateToParent(href)) {
            return;
        }

        if (window.parent === window) {
            return;
        }

        event.preventDefault();
        window.parent.postMessage({ type: 'capsule:web-navigate', href: href }, '*');
    });

    document.addEventListener('submit', function onWebFormSubmit(event) {
        const form = event.target;
        if (!form || form.tagName !== 'FORM') {
            return;
        }
        if (form.hasAttribute('data-capsule-web-stay')) {
            return;
        }
        const input = form.querySelector('input[type="search"], input[type="text"]');
        if (!input) {
            return;
        }
        const value = String(input.value || '').trim();
        if (!value) {
            event.preventDefault();
            return;
        }
        if (window.parent === window) {
            return;
        }
        event.preventDefault();
        window.parent.postMessage({ type: 'capsule:web-navigate', href: value }, '*');
    });
}());
