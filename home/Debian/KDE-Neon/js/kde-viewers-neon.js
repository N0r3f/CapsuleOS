/**
 * Okular + Gwenview KDE Neon — init slots kickoff B1.
 */
(function initKdeViewersNeon(global) {
    'use strict';

    var DEMO_IMAGE = '../../../usr/share/capsuleos/assets/images/vendors/neon/discover/kolourpaint.svg';

    function setSlotTitle(slotId, title) {
        var shell = global.document.querySelector('.windowElement[data-link="' + slotId + '"]');
        var titleEl = shell ? shell.querySelector('#windowTitle') : null;
        if (titleEl) {
            titleEl.textContent = title;
        }
        if (global.CAPSULE_WINDOW_TITLES) {
            global.CAPSULE_WINDOW_TITLES[slotId] = title;
        }
    }

    function initOkularKdeNeonApp() {
        var root = global.document.getElementById('okularApp');
        if (!root || root.dataset.okularInit === 'true') {
            return;
        }
        root.dataset.okularInit = 'true';
        setSlotTitle('visionneur_pdf', 'Okular');

        var zoom = 100;
        var syncZoom = function syncZoom() {
            var frame = root.querySelector('.kde-okular__frame');
            if (frame) {
                frame.style.zoom = String(zoom / 100);
            }
            var zoomEl = root.querySelector('#okular-zoom');
            if (zoomEl) {
                zoomEl.textContent = zoom + ' %';
            }
        };

        root.querySelectorAll('[data-okular-action]').forEach(function bind(btn) {
            btn.addEventListener('click', function onAction() {
                var action = btn.getAttribute('data-okular-action');
                if (action === 'zoom-in') {
                    zoom = Math.min(400, zoom + 25);
                    syncZoom();
                } else if (action === 'zoom-out') {
                    zoom = Math.max(50, zoom - 25);
                    syncZoom();
                } else if (action === 'sidebar') {
                    var sidebar = root.querySelector('#okular-sidebar');
                    if (!sidebar) {
                        return;
                    }
                    var open = sidebar.hasAttribute('hidden');
                    if (open) {
                        sidebar.removeAttribute('hidden');
                        btn.setAttribute('aria-pressed', 'true');
                    } else {
                        sidebar.setAttribute('hidden', 'hidden');
                        btn.setAttribute('aria-pressed', 'false');
                    }
                }
            });
        });
    }

    function initGwenviewKdeNeonApp() {
        var root = global.document.getElementById('gwenviewApp');
        if (!root || root.dataset.gwenviewInit === 'true') {
            return;
        }
        root.dataset.gwenviewInit = 'true';
        setSlotTitle('visionneur_images', 'Gwenview');

        var zoom = 100;
        var syncZoom = function syncZoom() {
            var img = root.querySelector('.kde-gwenview__image');
            if (img) {
                img.style.transform = 'scale(' + (zoom / 100) + ')';
            }
            var zoomEl = root.querySelector('#gwenview-zoom');
            if (zoomEl) {
                zoomEl.textContent = zoom + ' %';
            }
        };

        root.querySelectorAll('[data-gwenview-action]').forEach(function bind(btn) {
            btn.addEventListener('click', function onAction() {
                var action = btn.getAttribute('data-gwenview-action');
                if (action === 'zoom-in') {
                    zoom = Math.min(400, zoom + 25);
                    syncZoom();
                } else if (action === 'zoom-out') {
                    zoom = Math.max(25, zoom - 25);
                    syncZoom();
                } else if (action === 'slideshow' && !btn.disabled) {
                    var status = root.querySelector('#gwenview-filename');
                    if (status) {
                        status.textContent = 'Diaporama (simulation)';
                    }
                }
            });
        });
    }

    function initKateKdeNeonTitle() {
        setSlotTitle('text_editor', 'Bienvenue — Kate');
    }

    function loadGwenviewDemo() {
        var root = global.document.getElementById('gwenviewApp');
        if (!root) {
            return;
        }
        var content = root.querySelector('#gwenview-content');
        if (!content) {
            return;
        }
        content.innerHTML = '';
        var img = global.document.createElement('img');
        img.className = 'kde-gwenview__image';
        img.alt = 'kolourpaint.svg';
        img.src = DEMO_IMAGE;
        content.appendChild(img);
        var nameEl = root.querySelector('#gwenview-filename');
        if (nameEl) {
            nameEl.textContent = 'kolourpaint.svg';
        }
        var slideshow = root.querySelector('[data-gwenview-action="slideshow"]');
        if (slideshow) {
            slideshow.disabled = false;
        }
    }

    global.initOkularKdeNeonApp = initOkularKdeNeonApp;
    global.initGwenviewKdeNeonApp = initGwenviewKdeNeonApp;
    global.initKateKdeNeonTitle = initKateKdeNeonTitle;

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', function onInjected(event) {
            var detail = event.detail || {};
            if (detail.slotId === 'visionneur_pdf') {
                initOkularKdeNeonApp();
            }
            if (detail.slotId === 'visionneur_images') {
                initGwenviewKdeNeonApp();
                loadGwenviewDemo();
            }
            if (detail.slotId === 'text_editor') {
                initKateKdeNeonTitle();
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
