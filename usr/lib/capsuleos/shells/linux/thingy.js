(function initThingyAppModule(global) {
    'use strict';
    var WINDOW_TITLE = 'Bibliothèque';
    function getWindowEl(root) { var el = root; while (el) { if (el.getAttribute && el.getAttribute('data-link') === 'thingy') return el; el = el.parentElement; } return null; }
    function syncWindowTitle(winEl) { if (!winEl) return; var t = winEl.querySelector('#windowTitle'); if (t) t.textContent = WINDOW_TITLE; winEl.setAttribute('data-title', WINDOW_TITLE); }
    function initThingyAppOnce() {
        var root = global.document.getElementById('thingyApp');
        if (!root || root.dataset.thingyInit === 'true') return;
        root.dataset.thingyInit = 'true';
        syncWindowTitle(getWindowEl(root));
        var list = root.querySelector('#thy-list');
        if (list) list.addEventListener('click', function (ev) {
            var item = ev.target;
            while (item && item !== list) {
                if (item.classList && item.classList.contains('thy-app__item')) {
                    var items = list.querySelectorAll('.thy-app__item');
                    var i; for (i = 0; i < items.length; i += 1) items[i].classList.remove('is-selected');
                    item.classList.add('is-selected');
                    return;
                }
                item = item.parentElement;
            }
        });
    }
    global.initThingyApp = function () { initThingyAppOnce(); };
}(typeof window !== 'undefined' ? window : globalThis));
