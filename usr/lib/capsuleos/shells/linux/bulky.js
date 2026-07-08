/**
 * Bulky — Renommer fichiers (Linux Mint).
 */
(function initBulkyAppModule(global) {
    'use strict';

    function padNumber(num, width) {
        var text = String(num);
        while (text.length < width) {
            text = '0' + text;
        }
        return text;
    }

    function updatePreviews(root) {
        var prefixInput = root.querySelector('#blk-prefix');
        var numInput = root.querySelector('#blk-num');
        var rows = root.querySelectorAll('#blk-body tr');
        var prefix = prefixInput ? prefixInput.value : 'IMG_';
        var startNum = numInput ? parseInt(numInput.value, 10) : 1;
        if (Number.isNaN(startNum)) {
            startNum = 1;
        }
        var numWidth = numInput && numInput.value ? numInput.value.length : 3;
        var ri;
        for (ri = 0; ri < rows.length; ri += 1) {
            var originalCell = rows[ri].cells[0];
            var previewCell = rows[ri].querySelector('.blk-app__preview');
            if (!originalCell || !previewCell) {
                continue;
            }
            var original = originalCell.textContent || '';
            var dot = original.lastIndexOf('.');
            var ext = dot >= 0 ? original.slice(dot) : '';
            previewCell.textContent = prefix + padNumber(startNum + ri, numWidth) + ext;
        }
    }

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'bulky') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function initBulkyAppOnce() {
        var root = global.document.getElementById('bulkyApp');
        if (!root || root.dataset.bulkyInit === 'true') {
            return;
        }
        root.dataset.bulkyInit = 'true';

        var winEl = getWindowEl(root);
        if (winEl) {
            var wmTitle = winEl.querySelector('#windowTitle');
            if (wmTitle) {
                wmTitle.textContent = 'Renommer fichiers';
            }
            winEl.setAttribute('data-title', 'Renommer fichiers');
        }

        var prefixInput = root.querySelector('#blk-prefix');
        var numInput = root.querySelector('#blk-num');
        var renameBtn = root.querySelector('[data-blk-action="rename"]');

        if (prefixInput) {
            prefixInput.addEventListener('input', function onPrefix() {
                updatePreviews(root);
            });
        }
        if (numInput) {
            numInput.addEventListener('input', function onNum() {
                updatePreviews(root);
            });
        }
        if (renameBtn) {
            renameBtn.addEventListener('click', function onRename() {
                var rows = root.querySelectorAll('#blk-body tr');
                var ri;
                for (ri = 0; ri < rows.length; ri += 1) {
                    var previewCell = rows[ri].querySelector('.blk-app__preview');
                    var originalCell = rows[ri].cells[0];
                    if (previewCell && originalCell) {
                        originalCell.textContent = previewCell.textContent;
                    }
                }
                renameBtn.textContent = 'Renommé';
                global.setTimeout(function resetBtn() {
                    renameBtn.textContent = 'Renommer';
                }, 900);
            });
        }

        updatePreviews(root);
    }

    global.initBulkyApp = function initBulkyApp() {
        initBulkyAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
