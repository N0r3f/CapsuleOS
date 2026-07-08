/**
 * Applications Web — webapp-manager sur Mint.
 */
(function initWebappManagerAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Applications Web';

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'webapp_manager') {
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

    function setStatus(root, msg) {
        var status = root.querySelector('#wam-status');
        if (status) {
            status.textContent = msg || '';
        }
    }

    function selectItem(root, item) {
        var items = root.querySelectorAll('.wam-app__item');
        var ii;
        for (ii = 0; ii < items.length; ii += 1) {
            items[ii].classList.remove('is-selected');
        }
        if (item) {
            item.classList.add('is-selected');
            var name = item.querySelector('.wam-app__name');
            var url = item.querySelector('.wam-app__url');
            var detailTitle = root.querySelector('.wam-app__detail-title');
            var detailUrl = root.querySelector('.wam-app__detail-url');
            if (detailTitle && name) {
                detailTitle.textContent = name.textContent;
            }
            if (detailUrl && url) {
                detailUrl.textContent = 'https://' + url.textContent;
            }
        }
    }

    function initWebappManagerAppOnce() {
        var root = global.document.getElementById('webappManagerApp');
        if (!root || root.dataset.webappManagerInit === 'true') {
            return;
        }
        root.dataset.webappManagerInit = 'true';

        var winEl = getWindowEl(root);
        syncWindowTitle(winEl);

        var list = root.querySelector('#wam-list');
        if (list) {
            list.addEventListener('click', function onListClick(ev) {
                var item = ev.target;
                while (item && item !== list) {
                    if (item.classList && item.classList.contains('wam-app__item')) {
                        selectItem(root, item);
                        return;
                    }
                    item = item.parentElement;
                }
            });
        }

        root.addEventListener('click', function onAction(ev) {
            var btn = ev.target;
            if (!btn || !btn.getAttribute) {
                return;
            }
            var action = btn.getAttribute('data-wam-action');
            if (action === 'launch') {
                setStatus(root, 'Ouverture de Matrix simulée.');
            } else if (action === 'create') {
                setStatus(root, 'Assistant de création simulé.');
            } else if (action === 'remove') {
                setStatus(root, 'Suppression simulée.');
            }
        });
    }

    global.initWebappManagerApp = function initWebappManagerApp() {
        initWebappManagerAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
