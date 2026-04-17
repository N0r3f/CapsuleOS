(function () {
    'use strict';

    function initLibreWriter() {
        var app = document.getElementById('lw-app');
        if (!app) return;

        setupMenus(app);
        setupToolbar(app);
        setupFormatToolbar(app);
        setupWordCount(app);
        setupZoom(app);
        setupViewModes(app);
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

            /* Hover-switch between open menus */
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
                e.preventDefault(); /* preserve selection */
                var cmd  = btn.dataset.cmd;
                var page = document.getElementById('lw-page');
                if (!page) return;
                page.focus();
                try { document.execCommand(cmd, false, null); } catch (_) {}
                updateActiveStates(app);
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
            });
        }

        if (sizeSelect) {
            sizeSelect.addEventListener('change', function () {
                focusPage();
                /* execCommand fontSize uses 1-7 scale */
                var PT_TO_SCALE = {8:1, 10:2, 12:3, 14:4, 18:5, 24:6, 36:7};
                var sz = PT_TO_SCALE[parseInt(sizeSelect.value, 10)] || 3;
                try { document.execCommand('fontSize', false, sz); } catch (_) {}
            });
        }

        if (styleSelect) {
            styleSelect.addEventListener('change', function () {
                focusPage();
                if (styleSelect.value) {
                    try { document.execCommand('formatBlock', false, styleSelect.value); } catch (_) {}
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
            var text    = page.textContent || '';
            var cleaned = text.replace(/\s+/g, ' ').trim();
            var words   = cleaned.length > 0 ? cleaned.split(' ').length : 0;
            var chars   = text.length;
            if (wordCount) wordCount.textContent = words + ' mot' + (words !== 1 ? 's' : '');
            if (charCount) charCount.textContent = chars + ' car.';
        }

        page.addEventListener('input', update);
        update();
    }

    /* ─── ZOOM ──────────────────────────────────────────────────────────── */
    function setupZoom(app) {
        var slider     = document.getElementById('lw-zoom-slider');
        var valueLabel = document.getElementById('lw-zoom-value');
        var zoomIn     = document.getElementById('lw-zoom-in');
        var zoomOut    = document.getElementById('lw-zoom-out');
        var page       = document.getElementById('lw-page');
        var scroll     = app.querySelector('.lw-scroll');
        if (!slider || !page) return;

        function applyZoom(val) {
            var v = Math.min(200, Math.max(50, Math.round(val)));
            slider.value = v;
            if (valueLabel) valueLabel.textContent = v + ' %';
            var scale = v / 100;
            page.style.transformOrigin = 'top center';
            page.style.transform       = 'scale(' + scale + ')';
            /* Adjust wrapper height so scroll area compensates */
            var naturalH = 1123; /* A4 min-height px */
            var scaledH  = naturalH * scale;
            page.style.marginBottom = (scaledH - naturalH) + 'px';
        }

        slider.addEventListener('input', function () {
            applyZoom(parseInt(slider.value, 10));
        });

        if (zoomIn)  zoomIn.addEventListener('click',  function () { applyZoom(parseInt(slider.value,10) + 10); });
        if (zoomOut) zoomOut.addEventListener('click', function () { applyZoom(parseInt(slider.value,10) - 10); });
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

    /* ─── EXPORT ────────────────────────────────────────────────────────── */
    window.initLibreWriter = initLibreWriter;

}());
