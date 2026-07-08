/**
 * Notes — sticky sur Mint.
 */
(function initStickyAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Notes';

    var NOTES = {
        '1': { title: 'Liste de courses', body: 'Lait\nPain\nCafé', color: 'yellow' },
        '2': { title: 'Idées Mint', body: 'Parité VM CapsuleOS\nSmoke par app', color: 'green' }
    };

    var activeNoteId = '1';

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'sticky') {
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

    function applyEditorColor(root, color) {
        var editor = root.querySelector('#stk-editor');
        if (!editor) {
            return;
        }
        editor.classList.remove(
            'stk-app__editor--yellow',
            'stk-app__editor--green',
            'stk-app__editor--pink',
        );
        if (color) {
            editor.classList.add('stk-app__editor--' + color);
        }
        if (NOTES[activeNoteId]) {
            NOTES[activeNoteId].color = color;
        }
    }

    function selectNote(root, id) {
        var items = root.querySelectorAll('.stk-app__item');
        var editor = root.querySelector('#stk-editor');
        var ii;
        activeNoteId = id;
        for (ii = 0; ii < items.length; ii += 1) {
            var active = items[ii].getAttribute('data-stk-id') === id;
            items[ii].classList.toggle('is-active', active);
        }
        if (editor && NOTES[id]) {
            editor.value = NOTES[id].body;
            applyEditorColor(root, NOTES[id].color || 'yellow');
        }
    }

    function renderStickyAppletList() {
        var list = global.document.querySelector('.sticky-applet__list');
        if (!list) {
            return;
        }
        list.innerHTML = '';
        Object.keys(NOTES).forEach(function (id) {
            var note = NOTES[id];
            var li = global.document.createElement('li');
            li.className = 'sticky-applet__item';
            li.textContent = note.title;
            li.setAttribute('data-stk-applet-id', id);
            list.appendChild(li);
        });
    }

    function initStickyAppOnce() {
        var root = global.document.getElementById('stickyApp');
        if (!root || root.dataset.stickyInit === 'true') {
            return;
        }
        root.dataset.stickyInit = 'true';
        syncWindowTitle(getWindowEl(root));
        renderStickyAppletList();

        var list = root.querySelector('#stk-list');
        var editor = root.querySelector('#stk-editor');
        var deleteConfirm = root.querySelector('#stk-delete-confirm');

        if (list) {
            list.addEventListener('click', function onListClick(ev) {
                var item = ev.target;
                while (item && item !== list) {
                    if (item.classList && item.classList.contains('stk-app__item')) {
                        selectNote(root, item.getAttribute('data-stk-id'));
                        return;
                    }
                    item = item.parentElement;
                }
            });
        }

        if (editor) {
            editor.addEventListener('input', function onEditorInput() {
                if (NOTES[activeNoteId]) {
                    NOTES[activeNoteId].body = editor.value;
                }
            });
        }

        root.addEventListener('click', function onAction(ev) {
            var btn = ev.target;
            if (!btn || !btn.getAttribute) {
                return;
            }
            var action = btn.getAttribute('data-stk-action');
            if (action === 'new') {
                var nextId = String(Object.keys(NOTES).length + 1);
                NOTES[nextId] = { title: 'Nouvelle note', body: '', color: 'yellow' };
                var li = global.document.createElement('li');
                li.className = 'stk-app__item sticky-note';
                li.setAttribute('data-stk-id', nextId);
                li.innerHTML = '<span class="stk-app__item-title">Nouvelle note</span>';
                list.appendChild(li);
                selectNote(root, nextId);
                renderStickyAppletList();
                return;
            }
            if (action === 'delete') {
                if (!NOTES[activeNoteId] || Object.keys(NOTES).length <= 1) {
                    return;
                }
                delete NOTES[activeNoteId];
                var item = list.querySelector('[data-stk-id="' + activeNoteId + '"]');
                if (item) {
                    item.remove();
                }
                var remaining = Object.keys(NOTES);
                selectNote(root, remaining[0]);
                renderStickyAppletList();
                if (deleteConfirm) {
                    deleteConfirm.hidden = false;
                    global.setTimeout(function () {
                        deleteConfirm.hidden = true;
                    }, 1200);
                }
                return;
            }
            var color = btn.getAttribute('data-stk-color');
            if (color) {
                applyEditorColor(root, color);
            }
        });

        var appletTrigger = global.document.querySelector('[data-stk-applet-trigger]');
        var appletPopover = global.document.querySelector('.sticky-applet');
        if (appletTrigger && appletPopover) {
            appletTrigger.addEventListener('click', function onAppletClick(event) {
                event.preventDefault();
                event.stopPropagation();
                appletPopover.hidden = !appletPopover.hidden;
                appletTrigger.setAttribute('aria-expanded', appletPopover.hidden ? 'false' : 'true');
            });
            global.document.addEventListener('click', function onDocClick(event) {
                if (appletPopover.hidden) {
                    return;
                }
                if (appletPopover.contains(event.target) || appletTrigger.contains(event.target)) {
                    return;
                }
                appletPopover.hidden = true;
                appletTrigger.setAttribute('aria-expanded', 'false');
            });
            appletPopover.addEventListener('click', function onAppletSelect(event) {
                var entry = event.target.closest('[data-stk-applet-id]');
                if (!entry) {
                    return;
                }
                if (typeof global.openWindowByDataLink === 'function') {
                    global.openWindowByDataLink('sticky');
                }
                selectNote(root, entry.getAttribute('data-stk-applet-id'));
                appletPopover.hidden = true;
            });
        }
    }

    global.initStickyApp = function initStickyApp() {
        initStickyAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
