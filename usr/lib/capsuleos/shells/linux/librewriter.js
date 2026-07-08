(function () {
    'use strict';

    var GNOME_BODY_IDS = { rocky: 1, fedora: 1, alma: 1, ubuntu: 1 };

    var docState = {
        docNumber: 1,
        dirty: false,
        saved: false,
        fileName: null,
    };

    function supportsLibrewriterGnomeDataset() {
        return Boolean(document.body && GNOME_BODY_IDS[document.body.id]);
    }

    function resolveWindowTitle() {
        if (docState.fileName) {
            return docState.fileName + ' - LibreOffice Writer';
        }
        return 'Sans nom ' + docState.docNumber + ' - LibreOffice Writer';
    }

    function readPageStats() {
        var page = document.getElementById('lw-page');
        if (!page) {
            return { words: 0, chars: 0 };
        }
        var text = page.textContent || '';
        var cleaned = text.replace(/\s+/g, ' ').trim();
        var words = cleaned.length > 0 ? cleaned.split(' ').length : 0;
        return { words: words, chars: text.length };
    }

    function syncLibrewriterGnomeDataset() {
        if (!supportsLibrewriterGnomeDataset()) {
            return;
        }
        var app = document.getElementById('lw-app');
        if (!app) {
            return;
        }
        var win = document.querySelector('div[data-link="librewriter"]');
        var page = document.getElementById('lw-page');
        var stats = readPageStats();
        var title = resolveWindowTitle();
        var ready = app.dataset.lwInit === '1';
        var markers = [app, page, win].filter(Boolean);
        markers.forEach(function (node) {
            node.dataset.librewriterGnomeInit = ready ? 'true' : 'false';
            node.dataset.librewriterGnomeDocNumber = String(docState.docNumber);
            node.dataset.librewriterGnomeDirty = docState.dirty ? 'true' : 'false';
            node.dataset.librewriterGnomeSaved = docState.saved ? 'true' : 'false';
            node.dataset.librewriterGnomeTitle = title;
            node.dataset.librewriterGnomeWordCount = String(stats.words);
            node.dataset.librewriterGnomeCharCount = String(stats.chars);
            node.dataset.librewriterGnomeChrome = 'libreoffice24';
            node.dataset.librewriterGnomeLocale = 'fr-FR';
            if (docState.fileName) {
                node.dataset.librewriterGnomeFileName = docState.fileName;
            } else {
                delete node.dataset.librewriterGnomeFileName;
            }
        });
    }

    function syncWindowTitle() {
        setTimeout(function () {
            var title = resolveWindowTitle();
            if (typeof CapsuleStrings !== 'undefined' && CapsuleStrings.get && !docState.dirty && !docState.fileName) {
                var t = CapsuleStrings.get('librewriter.windowTitle');
                if (t && docState.docNumber === 1) {
                    title = t;
                }
            }
            var win = document.querySelector('div[data-link="librewriter"]');
            if (!win) {
                return;
            }
            var titleEl = win.querySelector('#windowTitle');
            if (titleEl) {
                titleEl.textContent = title;
            }
            win.setAttribute('data-title', title);
            syncLibrewriterGnomeDataset();
        }, 0);
    }

    function markDirty() {
        docState.dirty = true;
        docState.saved = false;
        syncWindowTitle();
    }

    function simulateSave() {
        var stats = readPageStats();
        if (stats.chars === 0) {
            return;
        }
        docState.dirty = false;
        docState.saved = true;
        if (!docState.fileName) {
            docState.fileName = 'Document' + docState.docNumber + '.odt';
        }
        syncWindowTitle();
    }

    function simulateNewDocument() {
        var page = document.getElementById('lw-page');
        if (page) {
            page.innerHTML = '';
            page.textContent = '';
        }
        docState.docNumber += 1;
        docState.dirty = false;
        docState.saved = false;
        docState.fileName = null;
        var wordCount = document.getElementById('lw-word-count');
        var charCount = document.getElementById('lw-char-count');
        if (wordCount) wordCount.textContent = '0 mot';
        if (charCount) charCount.textContent = '0 car.';
        syncWindowTitle();
        focusPage();
    }

    function setupDocumentActions(app) {
        app.querySelectorAll('[data-librewriter-gnome-action="save"]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                simulateSave();
                closeAllMenus(app);
            });
        });
        app.querySelectorAll('[data-librewriter-gnome-action="new"]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                simulateNewDocument();
                closeAllMenus(app);
            });
        });
    }

    function initLibreWriter() {
        var app = document.getElementById('lw-app');
        if (!app || app.dataset.lwInit === '1') {
            return;
        }
        app.dataset.lwInit = '1';

        setupMenus(app);
        setupToolbar(app);
        setupFormatToolbar(app);
        setupWordCount(app);
        setupZoom(app);
        setupViewModes(app);
        setupDocumentActions(app);
        syncWindowTitle();
        syncLibrewriterGnomeDataset();
    }

    /* ─── MENUS ─────────────────────────────────────────────────────────── */
    function setupMenus(app) {
        var menus = app.querySelectorAll('.lw-menu');

        menus.forEach(function (menu) {
            var trigger  = menu.querySelector('.lw-menu__trigger');
            var dropdown = menu.querySelector('.lw-menu__dropdown');
            if (!trigger || !dropdown) return;

            trigger.addEventListener('click', function (e) {
                e.stopPropagation();
                var wasOpen = !dropdown.hidden;
                closeAllMenus(app);
                if (!wasOpen) {
                    dropdown.hidden = false;
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            trigger.addEventListener('mouseenter', function () {
                var anyOpen = app.querySelector('.lw-menu__dropdown:not([hidden])');
                if (anyOpen && dropdown.hidden) {
                    closeAllMenus(app);
                    dropdown.hidden = false;
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });

        document.addEventListener('click', function () { closeAllMenus(app); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeAllMenus(app);
        });
    }

    function closeAllMenus(app) {
        app.querySelectorAll('.lw-menu').forEach(function (menu) {
            var trigger  = menu.querySelector('.lw-menu__trigger');
            var dropdown = menu.querySelector('.lw-menu__dropdown');
            if (!dropdown) return;
            dropdown.hidden = true;
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
    }

    /* ─── STANDARD TOOLBAR ──────────────────────────────────────────────── */
    function setupToolbar(app) {
        app.querySelectorAll('.lw-tb-btn[data-cmd]').forEach(function (btn) {
            btn.addEventListener('mousedown', function (e) {
                e.preventDefault();
                var cmd  = btn.dataset.cmd;
                var page = document.getElementById('lw-page');
                if (!page) return;
                page.focus();
                try { document.execCommand(cmd, false, null); } catch (_) {}
                updateActiveStates(app);
                markDirty();
            });
        });

        document.addEventListener('selectionchange', function () {
            updateActiveStates(app);
        });
    }

    function updateActiveStates(app) {
        var page = document.getElementById('lw-page');
        if (!page) return;
        var sel = window.getSelection();
        if (!sel || !sel.rangeCount || !page.contains(sel.anchorNode)) return;

        var CMDS = [
            'bold', 'italic', 'underline', 'strikeThrough',
            'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
            'insertUnorderedList', 'insertOrderedList',
            'superscript', 'subscript'
        ];

        CMDS.forEach(function (cmd) {
            var active = false;
            try { active = document.queryCommandState(cmd); } catch (_) {}
            var btn = app.querySelector('.lw-tb-btn[data-cmd="' + cmd + '"]');
            if (btn) btn.classList.toggle('lw-tb-btn--active', active);
        });
        syncLibrewriterGnomeDataset();
    }

    /* ─── FORMAT TOOLBAR ────────────────────────────────────────────────── */
    function setupFormatToolbar(app) {
        var fontSelect  = app.querySelector('.lw-tb-select--font');
        var sizeSelect  = app.querySelector('.lw-tb-select--size');
        var styleSelect = app.querySelector('.lw-tb-select--style');

        if (fontSelect) {
            fontSelect.addEventListener('change', function () {
                focusPage();
                try { document.execCommand('fontName', false, fontSelect.value); } catch (_) {}
                markDirty();
            });
        }

        if (sizeSelect) {
            sizeSelect.addEventListener('change', function () {
                focusPage();
                var PT_TO_SCALE = {8:1, 10:2, 12:3, 14:4, 18:5, 24:6, 36:7};
                var sz = PT_TO_SCALE[parseInt(sizeSelect.value, 10)] || 3;
                try { document.execCommand('fontSize', false, sz); } catch (_) {}
                markDirty();
            });
        }

        if (styleSelect) {
            styleSelect.addEventListener('change', function () {
                focusPage();
                if (styleSelect.value) {
                    try { document.execCommand('formatBlock', false, styleSelect.value); } catch (_) {}
                    markDirty();
                }
            });
        }
    }

    function focusPage() {
        var page = document.getElementById('lw-page');
        if (page) page.focus();
    }

    /* ─── WORD / CHAR COUNT ─────────────────────────────────────────────── */
    function setupWordCount(app) {
        var page      = document.getElementById('lw-page');
        var wordCount = document.getElementById('lw-word-count');
        var charCount = document.getElementById('lw-char-count');
        if (!page) return;

        function update() {
            var stats = readPageStats();
            if (wordCount) wordCount.textContent = stats.words + ' mot' + (stats.words !== 1 ? 's' : '');
            if (charCount) charCount.textContent = stats.chars + ' car.';
            if (stats.chars > 0) {
                markDirty();
            }
            syncLibrewriterGnomeDataset();
        }

        page.addEventListener('input', update);
        update();
    }

    /* ─── ZOOM ──────────────────────────────────────────────────────────── */
    function setupZoom(app) {
        var slider     = document.getElementById('lw-zoom-slider') || document.getElementById('lw-zoom');
        var valueLabel = document.getElementById('lw-zoom-value');
        var zoomIn     = document.getElementById('lw-zoom-in');
        var zoomOut    = document.getElementById('lw-zoom-out');
        var page       = document.getElementById('lw-page');
        if (!slider || !page) return;

        function applyZoom(val) {
            var v = Math.min(200, Math.max(50, Math.round(val)));
            slider.value = v;
            if (valueLabel) valueLabel.textContent = v + ' %';
            var scale = v / 100;
            page.style.transformOrigin = 'top center';
            page.style.transform       = 'scale(' + scale + ')';
            var naturalH = 1123;
            var scaledH  = naturalH * scale;
            page.style.marginBottom = (scaledH - naturalH) + 'px';
        }

        slider.addEventListener('input', function () {
            applyZoom(parseInt(slider.value, 10));
        });

        if (zoomIn)  zoomIn.addEventListener('click',  function () { applyZoom(parseInt(slider.value, 10) + 10); });
        if (zoomOut) zoomOut.addEventListener('click', function () { applyZoom(parseInt(slider.value, 10) - 10); });
    }

    /* ─── VIEW MODES ────────────────────────────────────────────────────── */
    function setupViewModes(app) {
        app.querySelectorAll('.lw-statusbar__view[data-view]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                app.querySelectorAll('.lw-statusbar__view').forEach(function (b) {
                    b.classList.remove('lw-statusbar__view--active');
                });
                btn.classList.add('lw-statusbar__view--active');
                app.classList.remove('lw-view--normal', 'lw-view--web', 'lw-view--fullscreen');
                app.classList.add('lw-view--' + btn.dataset.view);
            });
        });
    }

    window.initLibreWriter = initLibreWriter;
    window.syncLibrewriterGnomeDataset = syncLibrewriterGnomeDataset;
    window.supportsLibrewriterGnomeDataset = supportsLibrewriterGnomeDataset;

}());
