/**
 * Coin actif GNOME — zone haut-gauche (enable-hot-corners / data-hot-corners).
 */
(function initGnomeHotCorners(global) {
    'use strict';

    const GNOME_BODY_IDS = new Set(['rocky', 'fedora', 'alma', 'ubuntu', 'anduinos']);
    const CORNER_SIZE_PX = 12;
    const OPEN_DELAY_MS = 250;

    function shellRoot() {
        const id = global.document.body && global.document.body.id;
        return id && GNOME_BODY_IDS.has(id) ? global.document.getElementById(id) : null;
    }

    function hotCornersEnabled() {
        return global.document.documentElement.dataset.hotCorners !== 'off';
    }

    function openOverview() {
        const api = global.CapsuleGnomeOverview;
        if (api && typeof api.setOverview === 'function' && !api.isOpen()) {
            api.setOverview(true, 'workspace');
        }
    }

    function bindHotZone(shell) {
        if (!shell || shell.dataset.hotCornerBound === 'true') {
            return;
        }
        shell.dataset.hotCornerBound = 'true';

        let zone = shell.querySelector('.fedora-overview-hot-zone');
        if (!zone) {
            zone = global.document.createElement('div');
            zone.className = 'fedora-overview-hot-zone';
            zone.setAttribute('aria-hidden', 'true');
            shell.appendChild(zone);
        }

        let openTimer = null;

        const clearTimer = () => {
            if (openTimer) {
                global.clearTimeout(openTimer);
                openTimer = null;
            }
        };

        zone.addEventListener('mouseenter', () => {
            if (!hotCornersEnabled() || shell.classList.contains('is-overview')) {
                return;
            }
            clearTimer();
            openTimer = global.setTimeout(() => {
                if (hotCornersEnabled()) {
                    openOverview();
                }
                openTimer = null;
            }, OPEN_DELAY_MS);
        });

        zone.addEventListener('mouseleave', clearTimer);

        global.document.addEventListener('capsule:hot-corners-changed', () => {
            zone.classList.toggle('is-disabled', !hotCornersEnabled());
        });
        zone.classList.toggle('is-disabled', !hotCornersEnabled());
    }

    function init() {
        const shell = shellRoot();
        if (shell) {
            bindHotZone(shell);
        }
    }

    if (typeof global.document !== 'undefined') {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
