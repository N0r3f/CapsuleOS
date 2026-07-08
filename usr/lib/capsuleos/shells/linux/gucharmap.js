(function initGucharmapAppModule(global) {
    'use strict';
    var WINDOW_TITLE = 'Table de caractères';
    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789àâäéèêëïîôùûüç€'.split('');

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'gucharmap') return el;
            el = el.parentElement;
        }
        return null;
    }

    function syncWindowTitle(winEl) {
        if (!winEl) return;
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) wmTitle.textContent = WINDOW_TITLE;
        winEl.setAttribute('data-title', WINDOW_TITLE);
    }

    function initGucharmapAppOnce() {
        var root = global.document.getElementById('gucharmapApp');
        if (!root || root.dataset.gucharmapInit === 'true') return;
        root.dataset.gucharmapInit = 'true';
        syncWindowTitle(getWindowEl(root));
        var grid = root.querySelector('#gcm-grid');
        var preview = root.querySelector('#gcm-preview');
        if (!grid) return;
        var search = root.querySelector('#gcm-search');
        if (search) {
            search.addEventListener('input', function onSearch() {
                var q = search.value.trim().toLowerCase();
                var cells = grid.querySelectorAll('.gcm-app__cell');
                var cj;
                for (cj = 0; cj < cells.length; cj += 1) {
                    var match = !q || cells[cj].textContent.toLowerCase().indexOf(q) >= 0;
                    cells[cj].hidden = !match;
                }
            });
        }
        var ci;
        for (ci = 0; ci < CHARS.length; ci += 1) {
            var cell = global.document.createElement('button');
            cell.type = 'button';
            cell.className = 'gcm-app__cell' + (ci === 0 ? ' is-selected' : '');
            cell.textContent = CHARS[ci];
            cell.addEventListener('click', function onCell() {
                var cells = grid.querySelectorAll('.gcm-app__cell');
                var cj;
                for (cj = 0; cj < cells.length; cj += 1) cells[cj].classList.remove('is-selected');
                this.classList.add('is-selected');
                if (preview) preview.textContent = this.textContent + ' — sélectionné';
            });
            grid.appendChild(cell);
        }
    }

    global.initGucharmapApp = function initGucharmapApp() { initGucharmapAppOnce(); };
}(typeof window !== 'undefined' ? window : globalThis));
