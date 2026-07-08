/**
 * Centre d'informations KDE Neon — navigation sections.
 */
(function initKinfocenterKdeNeon(global) {
    'use strict';

    function findRoot() {
        return global.document.getElementById('kinfocenterApp');
    }

    function setWindowTitle(title) {
        var shell = global.document.querySelector('.windowElement[data-link="kinfocenter"]');
        var titleEl = shell ? shell.querySelector('#windowTitle') : null;
        if (titleEl) {
            titleEl.textContent = title;
        }
        if (global.CAPSULE_WINDOW_TITLES) {
            global.CAPSULE_WINDOW_TITLES.kinfocenter = title;
        }
    }

    function showSection(sectionId) {
        var root = findRoot();
        if (!root) {
            return;
        }
        root.querySelectorAll('[data-kinfo-panel]').forEach(function panel(el) {
            var match = el.getAttribute('data-kinfo-panel') === sectionId;
            if (match) {
                el.removeAttribute('hidden');
            } else {
                el.setAttribute('hidden', '');
            }
        });
        root.querySelectorAll('[data-kinfo-section]').forEach(function navBtn(el) {
            if (el.getAttribute('data-kinfo-section') === sectionId) {
                el.classList.add('is-active');
            } else {
                el.classList.remove('is-active');
            }
        });
    }

    function initKinfocenterKdeNeonApp() {
        var root = findRoot();
        if (!root || root.dataset.kinfocenterInit === 'true') {
            return;
        }
        root.dataset.kinfocenterInit = 'true';
        setWindowTitle('Centre d\'informations');

        root.querySelectorAll('[data-kinfo-section]').forEach(function bindNav(btn) {
            btn.addEventListener('click', function onNav() {
                showSection(btn.getAttribute('data-kinfo-section') || 'summary');
            });
        });
        showSection('summary');
    }

    global.initKinfocenterKdeNeonApp = initKinfocenterKdeNeonApp;

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', function onInjected(event) {
            var detail = event.detail || {};
            if (detail.slotId === 'kinfocenter') {
                initKinfocenterKdeNeonApp();
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
