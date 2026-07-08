/**
 * Spectacle KDE Neon — modes capture et feedback pédagogique.
 */
(function initSpectacleKdeNeon(global) {
    'use strict';

    var MODE_HINTS = {
        region: 'Sélectionnez une zone à l\'écran avec le curseur.',
        window: 'Cliquez sur la fenêtre à capturer.',
        screen: 'La capture inclura tous les écrans connectés.',
        record: 'Sélectionnez la zone à enregistrer.'
    };

    function findRoot() {
        return global.document.getElementById('spectacleApp');
    }

    function setWindowTitle(title) {
        var shell = global.document.querySelector('.windowElement[data-link="spectacle"]');
        var titleEl = shell ? shell.querySelector('#windowTitle') : null;
        if (titleEl) {
            titleEl.textContent = title;
        }
        if (global.CAPSULE_WINDOW_TITLES) {
            global.CAPSULE_WINDOW_TITLES.spectacle = title;
        }
    }

    function initSpectacleKdeNeonApp() {
        var root = findRoot();
        if (!root || root.dataset.spectacleInit === 'true') {
            return;
        }
        root.dataset.spectacleInit = 'true';
        setWindowTitle('Spectacle');

        var hint = root.querySelector('#spectacle-hint');
        var status = root.querySelector('#spectacle-status');
        var captureBtn = root.querySelector('#spectacle-capture-btn');
        var activeMode = 'region';

        root.querySelectorAll('[data-spectacle-mode]').forEach(function bindMode(btn) {
            btn.addEventListener('click', function onMode() {
                activeMode = btn.getAttribute('data-spectacle-mode') || 'region';
                root.querySelectorAll('.kde-spectacle__mode').forEach(function clear(el) {
                    el.classList.remove('is-active');
                });
                btn.classList.add('is-active');
                if (hint) {
                    hint.textContent = MODE_HINTS[activeMode] || MODE_HINTS.region;
                }
                if (status) {
                    status.textContent = '';
                }
            });
        });

        if (captureBtn) {
            captureBtn.addEventListener('click', function onCapture() {
                if (status) {
                    status.textContent = 'Capture simulée — image enregistrée dans Images/Captures d\'écran.';
                }
            });
        }
    }

    global.initSpectacleKdeNeonApp = initSpectacleKdeNeonApp;

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', function onInjected(event) {
            var detail = event.detail || {};
            if (detail.slotId === 'spectacle') {
                initSpectacleKdeNeonApp();
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
