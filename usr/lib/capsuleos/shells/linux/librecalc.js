(function () {
    'use strict';

    function initLibreCalc() {
        var app = document.getElementById('lc-app');
        if (!app || app.dataset.lcInit === '1') {
            return;
        }
        app.dataset.lcInit = '1';

        buildGrid(app);
        setupMenus(app);
        setupGridSelection(app);
        syncWindowTitle(app);
    }

    function buildGrid(app) {
        var body = app.querySelector('#lc-grid-body');
        if (!body || body.dataset.built === '1') {
            return;
        }
        body.dataset.built = '1';
        var html = '';
        var r;
        for (r = 1; r <= 25; r += 1) {
            html += '<tr data-row="' + r + '">';
            html += '<th class="lc-grid__rowhead" scope="row">' + r + '</th>';
            var c;
            for (c = 0; c < 8; c += 1) {
                html += '<td class="lc-grid__cell" data-col="' + c + '" data-row="' + r + '"></td>';
            }
            html += '</tr>';
        }
        body.innerHTML = html;
    }

    function colLabel(colIndex) {
        var n = colIndex;
        var s = '';
        while (n >= 0) {
            s = String.fromCharCode(65 + (n % 26)) + s;
            n = Math.floor(n / 26) - 1;
        }
        return s;
    }

    function setupGridSelection(app) {
        var nameInput = app.querySelector('#lc-cell-ref');
        var formulaInput = app.querySelector('#lc-formula-input');
        var cells = app.querySelectorAll('.lc-grid__cell');

        function selectCell(cell) {
            var ci;
            for (ci = 0; ci < cells.length; ci += 1) {
                cells[ci].classList.remove('is-selected');
            }
            cell.classList.add('is-selected');
            var col = parseInt(cell.dataset.col, 10);
            var row = parseInt(cell.dataset.row, 10);
            if (nameInput) {
                nameInput.textContent = colLabel(col) + row;
            }
            if (formulaInput) {
                formulaInput.value = '=';
            }
        }

        var i;
        for (i = 0; i < cells.length; i += 1) {
            cells[i].addEventListener('click', function () {
                selectCell(this);
            });
        }

        if (cells.length) {
            selectCell(cells[0]);
        }
    }

    function setupMenus(app) {
        var menus = app.querySelectorAll('.lw-menu');

        function closeAllMenus() {
            var mi;
            for (mi = 0; mi < menus.length; mi += 1) {
                var dd = menus[mi].querySelector('.lw-menu__dropdown');
                var tr = menus[mi].querySelector('.lw-menu__trigger');
                if (dd) {
                    dd.hidden = true;
                }
                if (tr) {
                    tr.setAttribute('aria-expanded', 'false');
                }
            }
        }

        var m;
        for (m = 0; m < menus.length; m += 1) {
            (function bindMenu(menu) {
                var trigger = menu.querySelector('.lw-menu__trigger');
                var dropdown = menu.querySelector('.lw-menu__dropdown');
                if (!trigger || !dropdown) {
                    return;
                }

                trigger.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var wasOpen = !dropdown.hidden;
                    closeAllMenus();
                    if (!wasOpen) {
                        dropdown.hidden = false;
                        trigger.setAttribute('aria-expanded', 'true');
                    }
                });

                trigger.addEventListener('mouseenter', function () {
                    var anyOpen = app.querySelector('.lw-menu__dropdown:not([hidden])');
                    if (anyOpen && dropdown.hidden) {
                        closeAllMenus();
                        dropdown.hidden = false;
                        trigger.setAttribute('aria-expanded', 'true');
                    }
                });
            }(menus[m]));
        }

        document.addEventListener('click', closeAllMenus);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeAllMenus();
            }
        });
    }

    function syncWindowTitle() {
        setTimeout(function () {
            var title = 'Sans nom 1 - LibreOffice Calc';
            if (typeof CapsuleStrings !== 'undefined' && CapsuleStrings.get) {
                var t = CapsuleStrings.get('librecalc.windowTitle');
                if (t) {
                    title = t;
                }
            }
            var win = document.querySelector('div[data-link="librecalc"]');
            if (!win) {
                return;
            }
            var titleEl = win.querySelector('#windowTitle');
            if (titleEl) {
                titleEl.textContent = title;
            }
            win.setAttribute('data-title', title);
        }, 0);
    }

    window.initLibreCalc = initLibreCalc;
}());
