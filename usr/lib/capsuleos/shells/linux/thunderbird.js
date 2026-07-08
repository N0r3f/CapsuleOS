/**
 * Thunderbird — messagerie sur Mint.
 */
(function initThunderbirdAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Thunderbird';

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'thunderbird') {
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

    function initThunderbirdAppOnce() {
        var root = global.document.getElementById('thunderbirdApp');
        if (!root || root.dataset.thunderbirdInit === 'true') {
            return;
        }
        root.dataset.thunderbirdInit = 'true';
        syncWindowTitle(getWindowEl(root));

        var folderList = root.querySelector('.tbd-app__folder-list');
        if (folderList) {
            folderList.addEventListener('click', function onFolderClick(ev) {
                var folder = ev.target;
                while (folder && folder !== folderList) {
                    if (folder.classList && folder.classList.contains('tbd-app__folder')) {
                        var folders = folderList.querySelectorAll('.tbd-app__folder');
                        var fi;
                        for (fi = 0; fi < folders.length; fi += 1) {
                            folders[fi].classList.remove('is-selected');
                        }
                        folder.classList.add('is-selected');
                        return;
                    }
                    folder = folder.parentElement;
                }
            });
        }

        var msgList = root.querySelector('#tbd-msg-list');
        if (msgList) {
            msgList.addEventListener('click', function onMsgClick(ev) {
                var msg = ev.target;
                while (msg && msg !== msgList) {
                    if (msg.classList && msg.classList.contains('tbd-app__msg')) {
                        var msgs = msgList.querySelectorAll('.tbd-app__msg');
                        var mi;
                        for (mi = 0; mi < msgs.length; mi += 1) {
                            msgs[mi].classList.remove('is-selected');
                        }
                        msg.classList.add('is-selected');
                        return;
                    }
                    msg = msg.parentElement;
                }
            });
        }
    }

    global.initThunderbirdApp = function initThunderbirdApp() {
        initThunderbirdAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
