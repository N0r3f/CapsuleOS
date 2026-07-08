/**
 * Celluloid — lecteur_multimedia sur Linux Mint.
 */
(function initCelluloidAppModule(global) {
    'use strict';

    var DEFAULT_TITLE = 'Celluloid';

    function isMintSkin() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function getRoot() {
        return global.document.getElementById('lecteurMultimedia');
    }

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'lecteur_multimedia') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncWindowTitle(title) {
        var root = getRoot();
        var winEl = getWindowEl(root);
        if (!winEl) {
            return;
        }
        var label = title || DEFAULT_TITLE;
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = label;
        }
        winEl.setAttribute('data-title', label);
    }

    function setControlsEnabled(root, enabled) {
        if (!root) {
            return;
        }
        var controls = root.querySelectorAll('.celluloid-app__controls .celluloid-app__ctl');
        var ci;
        for (ci = 0; ci < controls.length; ci += 1) {
            controls[ci].disabled = !enabled;
        }
        if (enabled) {
            root.classList.add('celluloid-app--playing');
        } else {
            root.classList.remove('celluloid-app--playing');
        }
    }

    function resetCelluloidIdle() {
        var root = getRoot();
        if (!root) {
            return;
        }
        var content = global.document.getElementById('mint-media-viewer-content');
        var fileName = global.document.getElementById('mint-media-viewer-filename');
        if (content) {
            content.innerHTML = '';
        }
        if (fileName) {
            fileName.textContent = 'Aucun média sélectionné';
        }
        setControlsEnabled(root, false);
        var timeEl = root.querySelector('.celluloid-app__time');
        if (timeEl) {
            timeEl.textContent = '0:00 / 0:00';
        }
        syncWindowTitle(DEFAULT_TITLE);
    }

    function onMediaLoaded(payload) {
        var root = getRoot();
        if (!root || !payload) {
            return;
        }
        setControlsEnabled(root, true);
        var title = payload.name || DEFAULT_TITLE;
        syncWindowTitle(title);
        var timeEl = root.querySelector('.celluloid-app__time');
        if (timeEl) {
            timeEl.textContent = '0:00 / 0:00';
        }
    }

    function setupMenubar(root) {
        var menus = root.querySelectorAll('.celluloid-app__menu');
        var mi;
        function closeAll() {
            var mj;
            for (mj = 0; mj < menus.length; mj += 1) {
                var dd = menus[mj].querySelector('.celluloid-app__menu-dropdown');
                var btn = menus[mj].querySelector('.celluloid-app__menu-btn');
                if (dd) {
                    dd.setAttribute('hidden', 'hidden');
                }
                if (btn) {
                    btn.setAttribute('aria-expanded', 'false');
                }
            }
        }
        for (mi = 0; mi < menus.length; mi += 1) {
            (function bindMenu(menuEl) {
                var btn = menuEl.querySelector('.celluloid-app__menu-btn');
                if (!btn) {
                    return;
                }
                var dropdown = menuEl.querySelector('.celluloid-app__menu-dropdown');
                if (!dropdown) {
                    dropdown = global.document.createElement('ul');
                    dropdown.className = 'celluloid-app__menu-dropdown';
                    dropdown.setAttribute('role', 'menu');
                    dropdown.setAttribute('hidden', 'hidden');
                    var item = global.document.createElement('li');
                    item.setAttribute('role', 'none');
                    var action = global.document.createElement('button');
                    action.type = 'button';
                    action.className = 'celluloid-app__menu-item';
                    action.setAttribute('role', 'menuitem');
                    action.textContent = btn.textContent + '…';
                    item.appendChild(action);
                    dropdown.appendChild(item);
                    menuEl.appendChild(dropdown);
                }
                btn.addEventListener('click', function onMenuClick(event) {
                    event.stopPropagation();
                    var wasOpen = dropdown && !dropdown.hidden;
                    closeAll();
                    if (!wasOpen && dropdown) {
                        dropdown.removeAttribute('hidden');
                        btn.setAttribute('aria-expanded', 'true');
                    }
                });
            }(menus[mi]));
        }
        global.document.addEventListener('click', closeAll);
        global.document.addEventListener('keydown', function onMenuKey(event) {
            if (event.key === 'Escape') {
                closeAll();
            }
        });
    }

    function initCelluloidAppOnce() {
        var root = getRoot();
        if (!root || root.dataset.celluloidInit === 'true') {
            return;
        }
        root.dataset.celluloidInit = 'true';
        if (!isMintSkin()) {
            return;
        }
        resetCelluloidIdle();
        setupMenubar(root);
        global.setTimeout(function syncTitleAfterOpen() {
            syncWindowTitle(DEFAULT_TITLE);
        }, 0);
    }

    function openCelluloidDemoMedia() {
        initCelluloidAppOnce();
        var root = getRoot();
        var content = global.document.getElementById('mint-media-viewer-content');
        if (content) {
            content.innerHTML = '<div class="celluloid-app__placeholder" aria-hidden="true"></div>';
        }
        onMediaLoaded({ name: 'demo.mp4' });
        var fileName = global.document.getElementById('mint-media-viewer-filename');
        if (fileName) {
            fileName.textContent = 'demo.mp4';
        }
        if (root) {
            root.dataset.celluloidDemo = 'true';
        }
    }

    global.initCelluloidApp = function initCelluloidApp() {
        initCelluloidAppOnce();
    };
    global.resetCelluloidIdle = resetCelluloidIdle;
    global.onCelluloidMediaLoaded = onMediaLoaded;
    global.openCelluloidDemoMedia = openCelluloidDemoMedia;
    global.getCelluloidWindowTitle = function getCelluloidWindowTitle() {
        return isMintSkin() ? DEFAULT_TITLE : 'Lecteur multimédia';
    };
}(typeof window !== 'undefined' ? window : globalThis));
