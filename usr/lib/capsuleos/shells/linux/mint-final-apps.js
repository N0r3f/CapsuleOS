/**
 * Apps finales catalogue Mint — mintstick, font_viewer, power_stats, mate_color_select.
 */
(function initMintFinalAppsModule(global) {
    'use strict';

    function getWindowEl(root, slotId) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === slotId) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncWindowTitle(winEl, title) {
        if (!winEl) {
            return;
        }
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = title;
        }
        winEl.setAttribute('data-title', title);
    }

    function initMintstickAppOnce() {
        var root = global.document.getElementById('mintstickApp');
        if (!root || root.dataset.mintstickInit === 'true') {
            return;
        }
        root.dataset.mintstickInit = 'true';
        syncWindowTitle(getWindowEl(root, 'mintstick'), 'Créateur de clé USB');
        var isoInput = root.querySelector('#mstk-iso');
        var deviceSelect = root.querySelector('#mstk-device');
        var writeBtn = root.querySelector('[data-mstk-action="write"]');
        function refreshWriteBtn() {
            if (!writeBtn) {
                return;
            }
            var ready = isoInput && isoInput.value && deviceSelect && deviceSelect.value;
            writeBtn.disabled = !ready;
        }
        root.addEventListener('click', function onClick(ev) {
            var btn = ev.target;
            if (!btn || !btn.getAttribute) {
                return;
            }
            if (btn.getAttribute('data-mstk-action') === 'browse-iso' && isoInput) {
                isoInput.value = '/home/capsule/Téléchargements/linuxmint-22.3.iso';
                refreshWriteBtn();
            }
        });
        if (deviceSelect) {
            deviceSelect.addEventListener('change', refreshWriteBtn);
        }
        root.addEventListener('click', function onWrite(ev) {
            var btn = ev.target;
            if (!btn || !btn.getAttribute) {
                return;
            }
            if (btn.getAttribute('data-mstk-action') === 'write' && !btn.disabled) {
                var title = root.querySelector('.mstk-app__title');
                if (title) {
                    title.textContent = 'Écriture en cours… (simulation)';
                }
            }
        });
    }

    function initMintstickFormatAppOnce() {
        var root = global.document.getElementById('mintstickFormatApp');
        if (!root || root.dataset.mintstickFormatInit === 'true') {
            return;
        }
        root.dataset.mintstickFormatInit = 'true';
        syncWindowTitle(getWindowEl(root, 'mintstick_format'), 'Formateur de clé USB');
        var deviceSelect = root.querySelector('#mstk-fmt-device');
        var formatBtn = root.querySelector('[data-mstk-fmt-action="format"]');
        if (deviceSelect && formatBtn) {
            deviceSelect.addEventListener('change', function onDeviceChange() {
                formatBtn.disabled = !deviceSelect.value;
            });
        }
        root.addEventListener('click', function onFormat(ev) {
            var btn = ev.target;
            if (!btn || !btn.getAttribute) {
                return;
            }
            if (btn.getAttribute('data-mstk-fmt-action') === 'format' && !btn.disabled) {
                var title = root.querySelector('.mstk-fmt-app__title');
                if (title) {
                    title.textContent = 'Formatage en cours… (simulation)';
                }
            }
        });
    }

    function initFontViewerAppOnce() {
        var root = global.document.getElementById('fontViewerApp');
        if (!root || root.dataset.fontViewerInit === 'true') {
            return;
        }
        root.dataset.fontViewerInit = 'true';
        syncWindowTitle(getWindowEl(root, 'font_viewer'), 'Polices');
        var list = root.querySelector('#fnv-font-list');
        var sample = root.querySelector('#fnv-sample');
        var meta = root.querySelector('#fnv-meta');
        var labels = {
            ubuntu: 'Ubuntu · 12 pt',
            noto: 'Noto Sans · 12 pt',
            liberation: 'Liberation Sans · 12 pt'
        };
        function selectFontItem(item) {
            if (!item || !list) {
                return;
            }
            var items = list.querySelectorAll('.fnv-app__font');
            var i;
            for (i = 0; i < items.length; i += 1) {
                items[i].classList.remove('is-selected');
            }
            item.classList.add('is-selected');
            var fontId = item.getAttribute('data-font-id');
            if (meta && labels[fontId]) {
                meta.textContent = labels[fontId];
            }
            if (sample) {
                sample.style.fontFamily = fontId === 'noto' ? 'Noto Sans, sans-serif' : 'Ubuntu, sans-serif';
            }
        }

        if (list) {
            list.setAttribute('tabindex', '0');
            list.addEventListener('keydown', function onFontKey(ev) {
                var items = list.querySelectorAll('.fnv-app__font');
                if (!items.length) {
                    return;
                }
                var activeIdx = 0;
                var ai;
                for (ai = 0; ai < items.length; ai += 1) {
                    if (items[ai].classList.contains('is-selected')) {
                        activeIdx = ai;
                        break;
                    }
                }
                if (ev.key === 'ArrowDown') {
                    ev.preventDefault();
                    selectFontItem(items[Math.min(items.length - 1, activeIdx + 1)]);
                } else if (ev.key === 'ArrowUp') {
                    ev.preventDefault();
                    selectFontItem(items[Math.max(0, activeIdx - 1)]);
                }
            });
            list.addEventListener('click', function onFontClick(ev) {
                var item = ev.target;
                while (item && item !== list) {
                    if (item.classList && item.classList.contains('fnv-app__font')) {
                        selectFontItem(item);
                        return;
                    }
                    item = item.parentElement;
                }
            });
        }
    }

    function initPowerStatsAppOnce() {
        var root = global.document.getElementById('powerStatsApp');
        if (!root || root.dataset.powerStatsInit === 'true') {
            return;
        }
        root.dataset.powerStatsInit = 'true';
        syncWindowTitle(getWindowEl(root, 'power_stats'), 'Statistiques d\'alimentation');
        var bars = root.querySelectorAll('.pwr-app__bar');
        var bi;
        for (bi = 0; bi < bars.length; bi += 1) {
            bars[bi].addEventListener('click', function onBarClick() {
                var all = root.querySelectorAll('.pwr-app__bar');
                var bj;
                for (bj = 0; bj < all.length; bj += 1) {
                    all[bj].classList.remove('is-selected');
                }
                this.classList.add('is-selected');
            });
        }
    }

    function initVisionneurImagesAppOnce() {
        var root = global.document.getElementById('visionneurImages');
        if (!root || root.dataset.visionneurImagesInit === 'true') {
            return;
        }
        root.dataset.visionneurImagesInit = 'true';
        syncWindowTitle(getWindowEl(root, 'visionneur_images'), 'Visionneur d\'images');
    }

    function initVisionneurPdfAppOnce() {
        var root = global.document.getElementById('visionneurPdf');
        if (!root || root.dataset.visionneurPdfInit === 'true') {
            return;
        }
        root.dataset.visionneurPdfInit = 'true';
        syncWindowTitle(getWindowEl(root, 'visionneur_pdf'), 'Visionneur de documents');
    }

    function initMateColorSelectAppOnce() {
        var root = global.document.getElementById('mateColorSelectApp');
        if (!root || root.dataset.mateColorSelectInit === 'true') {
            return;
        }
        root.dataset.mateColorSelectInit = 'true';
        syncWindowTitle(getWindowEl(root, 'mate_color_select'), 'Sélecteur de couleur');
        var swatchesEl = root.querySelector('#mcs-swatches');
        var preview = root.querySelector('#mcs-preview');
        var hexEl = root.querySelector('#mcs-hex');
        var colors = ['#3584e4', '#87cf3e', '#f66151', '#f9f06b', '#9141ac', '#ff7800', '#ffffff', '#2e2e2e'];
        var ci;
        for (ci = 0; ci < colors.length; ci += 1) {
            var btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'mcs-app__swatch' + (ci === 0 ? ' is-selected' : '');
            btn.style.backgroundColor = colors[ci];
            btn.setAttribute('data-mcs-color', colors[ci]);
            swatchesEl.appendChild(btn);
        }
        if (swatchesEl) {
            swatchesEl.addEventListener('click', function onSwatch(ev) {
                var sw = ev.target;
                if (!sw || !sw.classList || !sw.classList.contains('mcs-app__swatch')) {
                    return;
                }
                var all = swatchesEl.querySelectorAll('.mcs-app__swatch');
                var si;
                for (si = 0; si < all.length; si += 1) {
                    all[si].classList.remove('is-selected');
                }
                sw.classList.add('is-selected');
                var color = sw.getAttribute('data-mcs-color');
                if (preview) {
                    preview.style.backgroundColor = color;
                }
                if (hexEl) {
                    hexEl.textContent = color;
                }
            });
        }
    }

    global.initMintstickApp = function initMintstickApp() { initMintstickAppOnce(); };
    global.initMintstickFormatApp = function initMintstickFormatApp() { initMintstickFormatAppOnce(); };
    global.initFontViewerApp = function initFontViewerApp() { initFontViewerAppOnce(); };
    global.initPowerStatsApp = function initPowerStatsApp() { initPowerStatsAppOnce(); };
    global.initVisionneurImagesApp = function initVisionneurImagesApp() { initVisionneurImagesAppOnce(); };
    global.initVisionneurPdfApp = function initVisionneurPdfApp() { initVisionneurPdfAppOnce(); };
    global.initMateColorSelectApp = function initMateColorSelectApp() { initMateColorSelectAppOnce(); };
}(typeof window !== 'undefined' ? window : globalThis));
