(function initLibreofficeStartcenterAppModule(global) {
    'use strict';
    var WINDOW_TITLE = 'LibreOffice';
    var MODULE_SLOTS = { Writer: 'librewriter', Calc: 'librecalc', Draw: 'libreoffice_draw', Impress: 'libreoffice_impress' };
    function getWindowEl(root) { var el = root; while (el) { if (el.getAttribute && el.getAttribute('data-link') === 'libreoffice_startcenter') return el; el = el.parentElement; } return null; }
    function resolveTileSlot(tile) {
        var label = tile.querySelector('span');
        if (!label) return null;
        return MODULE_SLOTS[label.textContent.replace(/\s+/g, ' ').trim()] || null;
    }
    function launchTileModule(tile) {
        var slot = resolveTileSlot(tile);
        if (!slot || typeof global.openWindowByDataLink !== 'function') return;
        global.openWindowByDataLink(slot);
    }
    function syncWindowTitle(winEl) { if (!winEl) return; var t = winEl.querySelector('#windowTitle'); if (t) t.textContent = WINDOW_TITLE; winEl.setAttribute('data-title', WINDOW_TITLE); }
    function initLibreofficeStartcenterAppOnce() {
        var root = global.document.getElementById('libreofficeStartcenterApp');
        if (!root || root.dataset.libreofficeStartcenterInit === 'true') return;
        root.dataset.libreofficeStartcenterInit = 'true';
        syncWindowTitle(getWindowEl(root));
        var tiles = root.querySelectorAll('.lsc-app__tile');
        var ti;
        for (ti = 0; ti < tiles.length; ti += 1) {
            tiles[ti].setAttribute('tabindex', '0');
        }
        root.addEventListener('click', function (ev) {
            var tile = ev.target.closest('.lsc-app__tile');
            if (!tile || !root.contains(tile)) return;
            var all = root.querySelectorAll('.lsc-app__tile');
            var tj;
            for (tj = 0; tj < all.length; tj += 1) {
                all[tj].classList.remove('is-active');
            }
            tile.classList.add('is-active');
        });
        root.addEventListener('keydown', function (ev) {
            if (ev.key !== 'Enter') return;
            var tile = ev.target.closest('.lsc-app__tile');
            if (!tile || !root.contains(tile)) return;
            tile.click();
            launchTileModule(tile);
        });
        root.addEventListener('dblclick', function (ev) {
            var tile = ev.target.closest('.lsc-app__tile');
            if (!tile || !root.contains(tile)) return;
            launchTileModule(tile);
        });
    }
    global.initLibreofficeStartcenterApp = function () { initLibreofficeStartcenterAppOnce(); };
}(typeof window !== 'undefined' ? window : globalThis));

(function initLibreofficeDrawAppModule(global) {
    'use strict';
    var WINDOW_TITLE = 'Sans nom 1 — LibreOffice Draw';
    function getWindowEl(root) { var el = root; while (el) { if (el.getAttribute && el.getAttribute('data-link') === 'libreoffice_draw') return el; el = el.parentElement; } return null; }
    function syncWindowTitle(winEl) { if (!winEl) return; var t = winEl.querySelector('#windowTitle'); if (t) t.textContent = WINDOW_TITLE; winEl.setAttribute('data-title', WINDOW_TITLE); }
    function initLibreofficeDrawAppOnce() {
        var root = global.document.getElementById('libreofficeDrawApp');
        if (!root || root.dataset.libreofficeDrawInit === 'true') return;
        root.dataset.libreofficeDrawInit = 'true';
        syncWindowTitle(getWindowEl(root));
        var canvas = root.querySelector('#ldr-canvas');
        if (canvas) {
            canvas.addEventListener('click', function () {
                canvas.dataset.hasShape = 'true';
                if (!canvas.querySelector('.ldr-app__shape')) {
                    var shape = global.document.createElement('div');
                    shape.className = 'ldr-app__shape';
                    shape.setAttribute('aria-hidden', 'true');
                    canvas.appendChild(shape);
                }
            });
        }
    }
    global.initLibreofficeDrawApp = function () { initLibreofficeDrawAppOnce(); };
}(typeof window !== 'undefined' ? window : globalThis));

(function initLibreofficeImpressAppModule(global) {
    'use strict';
    var WINDOW_TITLE = 'Sans nom 1 — LibreOffice Impress';
    function getWindowEl(root) { var el = root; while (el) { if (el.getAttribute && el.getAttribute('data-link') === 'libreoffice_impress') return el; el = el.parentElement; } return null; }
    function syncWindowTitle(winEl) { if (!winEl) return; var t = winEl.querySelector('#windowTitle'); if (t) t.textContent = WINDOW_TITLE; winEl.setAttribute('data-title', WINDOW_TITLE); }
    function initLibreofficeImpressAppOnce() {
        var root = global.document.getElementById('libreofficeImpressApp');
        if (!root || root.dataset.libreofficeImpressInit === 'true') return;
        root.dataset.libreofficeImpressInit = 'true';
        syncWindowTitle(getWindowEl(root));
        root.addEventListener('click', function (ev) {
            var slide = ev.target.closest('.lim-app__slide');
            if (!slide || !root.contains(slide)) return;
            var slides = root.querySelectorAll('.lim-app__slide');
            var si;
            for (si = 0; si < slides.length; si += 1) {
                slides[si].classList.remove('is-active');
            }
            slide.classList.add('is-active');
            var stage = root.querySelector('.lim-app__stage');
            var label = slide.textContent || '1';
            if (stage) {
                stage.textContent = 'Diapositive ' + label + ' — Titre';
            }
        });
    }
    global.initLibreofficeImpressApp = function () { initLibreofficeImpressAppOnce(); };
}(typeof window !== 'undefined' ? window : globalThis));
