/**
 * Outil de sauvegarde — mintbackup sur Mint.
 */
(function initMintbackupAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Outil de sauvegarde';

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'mintbackup') {
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

    function showStep(root, stepId) {
        var steps = root.querySelectorAll('[data-mbk-step]');
        var si;
        for (si = 0; si < steps.length; si += 1) {
            var step = steps[si];
            if (step.getAttribute('data-mbk-step') === stepId) {
                step.removeAttribute('hidden');
            } else {
                step.setAttribute('hidden', 'hidden');
            }
        }
    }

    function initMintbackupAppOnce() {
        var root = global.document.getElementById('mintbackupApp');
        if (!root || root.dataset.mintbackupInit === 'true') {
            return;
        }
        root.dataset.mintbackupInit = 'true';
        syncWindowTitle(getWindowEl(root));

        var browseSourceBtn = root.querySelector('[data-mbk-action="browse-source"]');
        if (browseSourceBtn) {
            browseSourceBtn.addEventListener('click', function onBrowseSource() {
                var sourceInput = root.querySelector('#mbk-source');
                if (sourceInput) {
                    sourceInput.value = '/home/capsule/Documents';
                }
            });
        }

        root.addEventListener('click', function onAction(ev) {
            var btn = ev.target;
            while (btn && btn !== root) {
                if (btn.getAttribute && btn.getAttribute('data-mbk-action')) {
                    break;
                }
                btn = btn.parentElement;
            }
            if (!btn || btn === root) {
                return;
            }
            var action = btn.getAttribute('data-mbk-action');
            if (action === 'next') {
                showStep(root, 'dest');
            }
            if (action === 'backup') {
                var title = root.querySelector('.mbk-app__title');
                if (title) {
                    title.textContent = 'Sauvegarde en cours… (simulation)';
                }
            }
        });
    }

    global.initMintbackupApp = function initMintbackupApp() {
        initMintbackupAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
