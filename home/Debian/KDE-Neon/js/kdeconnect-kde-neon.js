/**
 * KDE Connect Neon — stub appairage pédagogique.
 */
(function initKdeconnectKdeNeon(global) {
    'use strict';

    function findRoot() {
        return global.document.getElementById('kdeconnectApp');
    }

    function setWindowTitle(title) {
        var shell = global.document.querySelector('.windowElement[data-link="kdeconnect"]');
        var titleEl = shell ? shell.querySelector('#windowTitle') : null;
        if (titleEl) {
            titleEl.textContent = title;
        }
        if (global.CAPSULE_WINDOW_TITLES) {
            global.CAPSULE_WINDOW_TITLES.kdeconnect = title;
        }
    }

    function initKdeconnectApp() {
        var root = findRoot();
        if (!root || root.dataset.kdeconnectInit === 'true') {
            return;
        }
        root.dataset.kdeconnectInit = 'true';
        setWindowTitle('KDE Connect');

        var hint = root.querySelector('#kdeconnect-hint');
        var list = root.querySelector('#kdeconnect-device-list');
        var status = root.querySelector('#kdeconnect-status');
        var pairBtn = root.querySelector('#kdeconnect-pair-btn');
        var actions = root.querySelectorAll('[data-kdeconnect-action]');

        function enableActions(enabled) {
            actions.forEach(function action(btn) {
                btn.disabled = !enabled;
            });
        }

        if (pairBtn) {
            pairBtn.addEventListener('click', function onPair() {
                if (status) {
                    status.textContent = 'Recherche d\'appareils sur le réseau local…';
                }
                global.setTimeout(function afterScan() {
                    if (hint) {
                        hint.hidden = true;
                    }
                    if (list) {
                        list.hidden = false;
                    }
                    enableActions(true);
                    if (status) {
                        status.textContent = 'Appareil simulé jumelé — actions disponibles.';
                    }
                }, 650);
            });
        }
    }

    global.initKdeconnectKdeNeonApp = initKdeconnectApp;

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', function onInjected(event) {
            var detail = event.detail || {};
            if (detail.slotId === 'kdeconnect') {
                initKdeconnectApp();
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
