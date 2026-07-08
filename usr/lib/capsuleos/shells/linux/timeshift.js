/**
 * Timeshift — snapshots système sur Mint.
 */
(function initTimeshiftAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Timeshift';

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'timeshift') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncWindowTitle(winEl) {
        if (!winEl) {
            return;
        }
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = WINDOW_TITLE;
        }
        winEl.setAttribute('data-title', WINDOW_TITLE);
    }

    function initTimeshiftAppOnce() {
        var root = global.document.getElementById('timeshiftApp');
        if (!root || root.dataset.timeshiftInit === 'true') {
            return;
        }
        root.dataset.timeshiftInit = 'true';
        syncWindowTitle(getWindowEl(root));

        root.addEventListener('click', function onNav(ev) {
            var btn = ev.target;
            if (!btn || !btn.getAttribute) {
                return;
            }
            var view = btn.getAttribute('data-tsh-view');
            if (!view) {
                return;
            }
            var navs = root.querySelectorAll('.tsh-app__nav');
            var ni;
            for (ni = 0; ni < navs.length; ni += 1) {
                navs[ni].classList.toggle('is-active', navs[ni].getAttribute('data-tsh-view') === view);
            }
            var panel = root.querySelector('.tsh-app__main');
            if (panel) {
                panel.setAttribute('data-tsh-panel', view);
            }
        });

        var list = root.querySelector('#tsh-list');
        if (list) {
            list.addEventListener('click', function onListClick(ev) {
                var snap = ev.target;
                while (snap && snap !== list) {
                    if (snap.classList && snap.classList.contains('tsh-app__snap')) {
                        var snaps = list.querySelectorAll('.tsh-app__snap');
                        var si;
                        for (si = 0; si < snaps.length; si += 1) {
                            snaps[si].classList.remove('is-selected');
                        }
                        snap.classList.add('is-selected');
                        return;
                    }
                    snap = snap.parentElement;
                }
            });
        }
    }

    global.initTimeshiftApp = function initTimeshiftApp() {
        initTimeshiftAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
