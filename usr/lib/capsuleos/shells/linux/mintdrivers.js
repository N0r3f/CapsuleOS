/**
 * Gestionnaire de pilotes — mintdrivers (Driver Manager) sur Mint.
 */
(function initMintDriversAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Gestionnaire de pilotes';

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'mintdrivers') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncWindowTitle(winEl) {
        if (!winEl) {
            return;
        }
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = WINDOW_TITLE;
        }
        winEl.setAttribute('data-title', WINDOW_TITLE);
    }

    function showPage(root, pageId) {
        var pages = root.querySelectorAll('[data-md-page]');
        var pi;
        for (pi = 0; pi < pages.length; pi += 1) {
            var page = pages[pi];
            var active = page.getAttribute('data-md-page') === pageId;
            if (active) {
                page.removeAttribute('hidden');
            } else {
                page.setAttribute('hidden', 'hidden');
            }
        }
    }

    var refreshTimerId = null;

    function initMintDriversAppOnce() {
        var root = global.document.getElementById('mintDriversApp');
        if (!root) {
            return;
        }
        if (refreshTimerId !== null) {
            global.clearTimeout(refreshTimerId);
            refreshTimerId = null;
        }
        if (root.dataset.mintDriversInit === 'true') {
            showPage(root, 'refresh');
            refreshTimerId = global.setTimeout(function onRefreshDone() {
                showPage(root, 'no-drivers');
                syncWindowTitle(getWindowEl(root));
                refreshTimerId = null;
            }, 900);
            return;
        }
        root.dataset.mintDriversInit = 'true';

        var winEl = getWindowEl(root);
        syncWindowTitle(winEl);
        showPage(root, 'refresh');

        refreshTimerId = global.setTimeout(function onRefreshDone() {
            showPage(root, 'no-drivers');
            syncWindowTitle(winEl);
            refreshTimerId = null;
        }, 900);
    }

    global.initMintDriversApp = function initMintDriversApp() {
        initMintDriversAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
