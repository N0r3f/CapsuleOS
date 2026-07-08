/**
 * xed — Éditeur de texte (org.x.editor) sur Linux Mint Cinnamon.
 */
(function initXedAppModule(global) {
    'use strict';

    var pendingExplorerOpen = null;

    var SHORTCUTS = {
        'ctrl+n': 'new',
        'ctrl+o': 'open',
        'ctrl+s': 'save',
        'ctrl+shift+s': 'save-as',
        'ctrl+r': 'revert',
        'ctrl+w': 'close',
        'ctrl+z': 'undo',
        'ctrl+y': 'redo',
        'ctrl+x': 'cut',
        'ctrl+c': 'copy',
        'ctrl+v': 'paste',
        'ctrl+a': 'select-all',
        'ctrl+f': 'find',
        'ctrl+g': 'find-next',
        'ctrl+h': 'replace',
        'ctrl+i': 'goto-line'
    };

    var GNOME_TE_SESSION_KEY = 'capsule-gnome-text-editor-session';
    var GNOME_TE_VFS_SAMPLE = '../../../home/public/Documents/introduction-bash.txt';
    var gnomeTeDocs = null;
    var gnomeTeActiveIndex = 0;
    var teGnomeToastTimer = null;

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'text_editor') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    /** org.gnome.TextEditor — barre d'icônes xed masquée par défaut (menus suffisent). */
    function prefersGnomeTextEditorLayout() {
        var bodyId = global.document.body && global.document.body.id;
        return bodyId === 'rocky'
            || bodyId === 'fedora'
            || bodyId === 'alma'
            || bodyId === 'ubuntu'
            || bodyId === 'popos'
            || bodyId === 'anduinos';
    }

    function isGnomeTeLayout() {
        return prefersGnomeTextEditorLayout();
    }

    function untitledLabel() {
        return isGnomeTeLayout() ? 'Document sans titre' : 'Sans titre';
    }

    function createEmptyGnomeDoc() {
        return {
            id: String(Date.now()) + '-' + String(Math.random()).slice(2, 8),
            fileName: '',
            content: '',
            savedValue: '',
            dirty: false
        };
    }

    function showTeGnomeSaveToast(message) {
        var root = global.document.getElementById('xedApp');
        if (!root) {
            return;
        }
        var toast = root.querySelector('[data-te-gnome-toast]');
        if (!toast) {
            return;
        }
        toast.textContent = message || 'Document enregistré';
        toast.hidden = false;
        if (teGnomeToastTimer) {
            global.clearTimeout(teGnomeToastTimer);
        }
        teGnomeToastTimer = global.setTimeout(function hideToast() {
            toast.hidden = true;
        }, 2600);
    }

    function syncTeGnomeDataset(root, dirtyState) {
        if (!root || !isGnomeTeLayout()) {
            return;
        }
        root.dataset.teGnomeDirty = dirtyState ? 'true' : 'false';
        if (gnomeTeDocs) {
            root.dataset.teGnomeTabCount = String(gnomeTeDocs.length);
            root.dataset.teGnomeActiveTab = String(gnomeTeActiveIndex);
        }
    }

    function persistGnomeTeSession() {
        if (!isGnomeTeLayout() || !gnomeTeDocs || !global.window.sessionStorage) {
            return;
        }
        try {
            global.window.sessionStorage.setItem(GNOME_TE_SESSION_KEY, JSON.stringify({
                docs: gnomeTeDocs,
                activeIndex: gnomeTeActiveIndex
            }));
        } catch (err) {
            /* ignore quota */
        }
    }

    function initTextEditorAppOnce() {
        var root = global.document.getElementById('xedApp');
        if (!root || root.dataset.xedInit === 'true') {
            return;
        }
        root.dataset.xedInit = 'true';

        var area = global.document.getElementById('xed-area');
        var fileInput = global.document.getElementById('xed-file-input');
        var statusPos = global.document.getElementById('xed-status-pos');
        var statusChars = global.document.getElementById('xed-status-chars');
        var toolbar = global.document.getElementById('xed-toolbar');
        var statusbar = global.document.getElementById('xed-statusbar');
        var winEl = getWindowEl(root);
        if (!area || !statusPos || !statusChars) {
            return;
        }

        var fileName = '';
        var dirty = false;
        var savedValue = '';
        var lastFind = '';
        var lastFindIndex = -1;
        var toolbarVisible = true;
        var statusVisible = true;
        var wrapSoft = false;
        var gnomeTabsEl = global.document.getElementById('xed-gnome-tabs');

        function snapshotCurrentGnomeDoc() {
            if (!isGnomeTeLayout() || !gnomeTeDocs || !gnomeTeDocs.length) {
                return;
            }
            var doc = gnomeTeDocs[gnomeTeActiveIndex];
            if (!doc) {
                return;
            }
            doc.content = area.value;
            doc.dirty = dirty;
            doc.savedValue = savedValue;
            doc.fileName = fileName;
        }

        function docDisplayLabel(doc) {
            var base = doc.fileName || untitledLabel();
            return doc.dirty ? '*' + base : base;
        }

        function renderGnomeTeTabs() {
            if (!isGnomeTeLayout() || !gnomeTabsEl || !gnomeTeDocs) {
                return;
            }
            if (gnomeTeDocs.length <= 1) {
                gnomeTabsEl.hidden = true;
                gnomeTabsEl.innerHTML = '';
                return;
            }
            gnomeTabsEl.hidden = false;
            var html = '';
            var i;
            for (i = 0; i < gnomeTeDocs.length; i += 1) {
                var doc = gnomeTeDocs[i];
                var label = docDisplayLabel(doc);
                html += '<button type="button" class="xed-app__tab'
                    + (i === gnomeTeActiveIndex ? ' is-active' : '')
                    + '" data-te-gnome-tab="' + i + '" aria-selected="'
                    + (i === gnomeTeActiveIndex ? 'true' : 'false') + '">'
                    + label + '</button>';
            }
            gnomeTabsEl.innerHTML = html;
            root.classList.add('is-gnome-tabs');
        }

        function loadGnomeDoc(index, skipSnapshot) {
            if (!gnomeTeDocs || index < 0 || index >= gnomeTeDocs.length) {
                return;
            }
            if (!skipSnapshot) {
                snapshotCurrentGnomeDoc();
            }
            gnomeTeActiveIndex = index;
            var doc = gnomeTeDocs[index];
            area.value = doc.content || '';
            fileName = doc.fileName || '';
            savedValue = doc.savedValue || '';
            dirty = doc.dirty === true;
            refreshTitle();
            syncDocumentsMenu();
            updateStatus();
            renderGnomeTeTabs();
            syncTeGnomeDataset(root, dirty);
            persistGnomeTeSession();
        }

        function newGnomeTab() {
            if (!gnomeTeDocs) {
                gnomeTeDocs = [createEmptyGnomeDoc()];
            }
            snapshotCurrentGnomeDoc();
            gnomeTeDocs.push(createEmptyGnomeDoc());
            loadGnomeDoc(gnomeTeDocs.length - 1);
            area.value = '';
            fileName = '';
            savedValue = '';
            setDirty(false);
            updateStatus();
        }

        function closeGnomeTab() {
            if (!gnomeTeDocs || gnomeTeDocs.length <= 1) {
                clearDocument();
                return;
            }
            snapshotCurrentGnomeDoc();
            gnomeTeDocs.splice(gnomeTeActiveIndex, 1);
            if (gnomeTeActiveIndex >= gnomeTeDocs.length) {
                gnomeTeActiveIndex = gnomeTeDocs.length - 1;
            }
            loadGnomeDoc(gnomeTeActiveIndex, true);
        }

        function openTeGnomeVfsSample(href, name) {
            var targetHref = href || GNOME_TE_VFS_SAMPLE;
            var displayName = name || basenameFromHref(targetHref);
            loadDocumentFromExplorer(targetHref, displayName);
        }

        function setDirty(next) {
            dirty = next === true;
            refreshTitle();
            syncDocumentsMenu();
            syncTeGnomeDataset(root, dirty);
            snapshotCurrentGnomeDoc();
            persistGnomeTeSession();
        }

        function refreshTitle() {
            if (!winEl) {
                return;
            }
            var titleEl = winEl.querySelector('#windowTitle');
            if (!titleEl) {
                return;
            }
            var base = fileName || untitledLabel();
            titleEl.textContent = dirty ? '*' + base : base;
        }

        function syncDocumentsMenu() {
            var docBtn = root.querySelector('[data-xed-doc="0"]');
            if (!docBtn) {
                return;
            }
            var label = fileName || untitledLabel();
            if (dirty) {
                label = '*' + label;
            }
            docBtn.textContent = label;
            if (isGnomeTeLayout() && gnomeTeDocs) {
                var docsMenu = root.querySelector('.xed-menu:last-child .xed-menu__dropdown');
                if (docsMenu) {
                    var existing = docsMenu.querySelectorAll('[data-te-gnome-doc]');
                    existing.forEach(function removeDocBtn(btn) {
                        btn.parentElement.remove();
                    });
                    var sep = docsMenu.querySelector('.xed-menu__sep');
                    var i;
                    for (i = 0; i < gnomeTeDocs.length; i += 1) {
                        var li = global.document.createElement('li');
                        li.setAttribute('role', 'none');
                        var btn = global.document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'xed-menu__item' + (i === gnomeTeActiveIndex ? ' xed-menu__item--checked' : '');
                        btn.setAttribute('role', 'menuitem');
                        btn.setAttribute('data-te-gnome-doc', String(i));
                        btn.textContent = docDisplayLabel(gnomeTeDocs[i]);
                        btn.addEventListener('click', function onDocSwitch(e) {
                            e.stopPropagation();
                            closeAllMenus();
                            loadGnomeDoc(parseInt(this.getAttribute('data-te-gnome-doc'), 10));
                        });
                        li.appendChild(btn);
                        docsMenu.insertBefore(li, sep || null);
                    }
                }
            }
        }

        function updateStatus() {
            var text = area.value || '';
            var len = text.length;
            var start = area.selectionStart;
            if (typeof start !== 'number') {
                start = len;
            }
            var before = text.slice(0, start);
            var lines = before.split('\n');
            var line = lines.length;
            var col = lines[lines.length - 1].length + 1;
            statusPos.textContent = 'Ligne ' + line + ', Col ' + col;
            statusChars.textContent = len + (len > 1 ? ' caractères' : ' caractère');
        }

        function confirmDiscard() {
            if (!dirty) {
                return true;
            }
            return global.confirm('Les modifications non enregistrées seront perdues. Continuer ?');
        }

        function clearDocument() {
            area.value = '';
            fileName = '';
            savedValue = '';
            lastFind = '';
            lastFindIndex = -1;
            setDirty(false);
            updateStatus();
        }

        function insertTextAtCursor(text) {
            var start = area.selectionStart;
            var end = area.selectionEnd;
            if (typeof start !== 'number') {
                start = area.value.length;
            }
            if (typeof end !== 'number') {
                end = start;
            }
            var before = area.value.substring(0, start);
            var after = area.value.substring(end);
            area.value = before + text + after;
            var pos = start + text.length;
            area.selectionStart = pos;
            area.selectionEnd = pos;
            area.focus();
            setDirty(area.value !== savedValue);
            updateStatus();
        }

        function getSelectionText() {
            var start = area.selectionStart;
            var end = area.selectionEnd;
            if (typeof start !== 'number' || typeof end !== 'number' || start === end) {
                return '';
            }
            return area.value.substring(start, end);
        }

        function copySelection() {
            var text = getSelectionText();
            if (!text) {
                return;
            }
            area.focus();
            if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
                global.navigator.clipboard.writeText(text).catch(function onCopyFail() {
                    try {
                        global.document.execCommand('copy');
                    } catch (err) {
                        /* ignore */
                    }
                });
                return;
            }
            try {
                global.document.execCommand('copy');
            } catch (err) {
                /* ignore */
            }
        }

        function cutSelection() {
            var start = area.selectionStart;
            var end = area.selectionEnd;
            if (typeof start !== 'number' || typeof end !== 'number' || start === end) {
                return;
            }
            var text = area.value.substring(start, end);
            area.focus();

            function applyCut() {
                var val = area.value;
                area.value = val.substring(0, start) + val.substring(end);
                area.selectionStart = start;
                area.selectionEnd = start;
                setDirty(area.value !== savedValue);
                updateStatus();
            }

            if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
                global.navigator.clipboard.writeText(text).then(applyCut).catch(function onCutFail() {
                    try {
                        if (global.document.execCommand('cut')) {
                            setDirty(area.value !== savedValue);
                            updateStatus();
                        }
                    } catch (err) {
                        /* ignore */
                    }
                });
                return;
            }
            try {
                if (global.document.execCommand('cut')) {
                    setDirty(area.value !== savedValue);
                    updateStatus();
                }
            } catch (err) {
                /* ignore */
            }
        }

        function pasteFromClipboard() {
            area.focus();
            if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.readText) {
                global.navigator.clipboard.readText().then(function onPasteText(text) {
                    if (typeof text === 'string' && text.length > 0) {
                        insertTextAtCursor(text);
                    }
                }).catch(function onPasteFail() {
                    try {
                        global.document.execCommand('paste');
                        setDirty(area.value !== savedValue);
                        updateStatus();
                    } catch (err) {
                        /* ignore */
                    }
                });
                return;
            }
            try {
                global.document.execCommand('paste');
                setDirty(area.value !== savedValue);
                updateStatus();
            } catch (err) {
                /* ignore */
            }
        }

        function runEditCommand(cmd) {
            area.focus();
            try {
                global.document.execCommand(cmd, false, null);
            } catch (err) {
                /* ignore */
            }
            setDirty(area.value !== savedValue);
            updateStatus();
        }

        function deleteSelection() {
            var start = area.selectionStart;
            var end = area.selectionEnd;
            if (typeof start !== 'number' || typeof end !== 'number') {
                return;
            }
            if (start === end) {
                if (end < area.value.length) {
                    area.value = area.value.substring(0, start) + area.value.substring(end + 1);
                }
            } else {
                area.value = area.value.substring(0, start) + area.value.substring(end);
            }
            area.selectionStart = start;
            area.selectionEnd = start;
            area.focus();
            setDirty(area.value !== savedValue);
            updateStatus();
        }

        function selectAll() {
            area.focus();
            area.selectionStart = 0;
            area.selectionEnd = area.value.length;
            updateStatus();
        }

        function basenameFromPath(pathValue) {
            var raw = String(pathValue || '').replace(/^\s+|\s+$/g, '');
            if (!raw) {
                return '';
            }
            var parts = raw.split('/');
            return parts[parts.length - 1] || raw;
        }

        function downloadDocument(name) {
            var blob = new Blob([area.value], { type: 'text/plain;charset=utf-8' });
            var url = global.URL.createObjectURL(blob);
            var link = global.document.createElement('a');
            link.download = name;
            link.href = url;
            link.click();
            global.setTimeout(function revokeUrl() {
                global.URL.revokeObjectURL(url);
            }, 500);
            savedValue = area.value;
            setDirty(false);
        }

        function openSaveAsDialog() {
            closeAllMenus();
            openDialog('xed-save-dialog');
            var pathInput = global.document.getElementById('xed-save-path');
            if (pathInput) {
                var suggested = fileName ? '~/Documents/' + fileName : '~/Documents/document.txt';
                pathInput.value = suggested;
                pathInput.focus();
                pathInput.select();
            }
        }

        function applySaveAs() {
            var pathInput = global.document.getElementById('xed-save-path');
            if (!pathInput) {
                return;
            }
            var name = basenameFromPath(pathInput.value);
            if (!name) {
                return;
            }
            fileName = name;
            closeAllDialogs();
            downloadDocument(name);
            refreshTitle();
            syncDocumentsMenu();
            showTeGnomeSaveToast('« ' + name + ' » enregistré');
            renderGnomeTeTabs();
        }

        function saveDocument(asCopy) {
            if (asCopy) {
                openSaveAsDialog();
                return;
            }
            var name = fileName || 'document.txt';
            downloadDocument(name);
            if (!fileName) {
                fileName = name;
                refreshTitle();
                syncDocumentsMenu();
            }
            showTeGnomeSaveToast('Document enregistré');
            renderGnomeTeTabs();
        }

        function revertDocument() {
            if (!fileName && savedValue === '') {
                return;
            }
            if (!global.confirm('Recharger le document et annuler les modifications ?')) {
                return;
            }
            area.value = savedValue;
            setDirty(false);
            updateStatus();
        }

        function closeWindow() {
            if (!confirmDiscard() || !winEl) {
                return;
            }
            winEl.style.display = 'none';
            winEl.style.zIndex = '5';
            winEl.classList.remove('windowElementActive');
            winEl.classList.remove('active');
            if (global.CapsuleTaskbarLauncherState
                && typeof global.CapsuleTaskbarLauncherState.clearRunning === 'function') {
                global.CapsuleTaskbarLauncherState.clearRunning(winEl);
            } else if (winEl.dataset) {
                delete winEl.dataset.capsuleRunning;
            }
            if (typeof global.CustomEvent === 'function') {
                global.document.dispatchEvent(new global.CustomEvent('capsule:window-closed', {
                    detail: { container: winEl, slotId: winEl.dataset.link }
                }));
                global.document.dispatchEvent(new global.CustomEvent('capsule:window-hidden', {
                    detail: { container: winEl, slotId: winEl.dataset.link }
                }));
            }
        }

        function closeAllDialogs() {
            root.querySelectorAll('.xed-dialog').forEach(function closeDlg(dlg) {
                dlg.hidden = true;
            });
            var searchbar = global.document.getElementById('xed-searchbar');
            if (searchbar) {
                searchbar.hidden = true;
            }
        }

        function hideSearchBar() {
            var searchbar = global.document.getElementById('xed-searchbar');
            if (searchbar) {
                searchbar.hidden = true;
            }
        }

        function showSearchBar() {
            closeAllDialogs();
            closeAllMenus();
            var searchbar = global.document.getElementById('xed-searchbar');
            var searchInput = global.document.getElementById('xed-searchbar-input');
            if (!searchbar || !searchInput) {
                openDialog('xed-find-dialog');
                var findInput = global.document.getElementById('xed-find-input');
                if (findInput) {
                    if (lastFind) {
                        findInput.value = lastFind;
                    }
                    findInput.focus();
                    findInput.select();
                }
                return;
            }
            searchbar.hidden = false;
            if (lastFind) {
                searchInput.value = lastFind;
            }
            searchInput.focus();
            searchInput.select();
        }

        function setPrefsTab(tabId) {
            root.querySelectorAll('[data-xed-prefs-tab]').forEach(function markTab(btn) {
                btn.classList.toggle('is-active', btn.getAttribute('data-xed-prefs-tab') === tabId);
            });
            root.querySelectorAll('[data-xed-prefs-panel]').forEach(function markPanel(panel) {
                panel.hidden = panel.getAttribute('data-xed-prefs-panel') !== tabId;
            });
        }

        function openPreferences() {
            closeAllMenus();
            openDialog('xed-prefs-dialog');
            setPrefsTab('font');
        }

        function applyPreferences() {
            var fontSelect = global.document.getElementById('xed-prefs-font');
            var sizeInput = global.document.getElementById('xed-prefs-font-size');
            if (fontSelect) {
                area.style.fontFamily = fontSelect.value === 'monospace'
                    ? 'monospace'
                    : fontSelect.value;
            }
            if (sizeInput && sizeInput.value) {
                area.style.fontSize = parseInt(sizeInput.value, 10) + 'px';
            }
            closeAllDialogs();
        }

        function openDialog(id) {
            closeAllDialogs();
            closeAllMenus();
            var dlg = global.document.getElementById(id);
            if (dlg) {
                dlg.hidden = false;
            }
        }

        function applyFindQuery(query, advance) {
            var q = (query || '').replace(/^\s+|\s+$/g, '');
            if (!q) {
                return false;
            }
            lastFind = q;
            var startAt = advance && lastFindIndex >= 0 ? lastFindIndex + 1 : 0;
            var idx = area.value.indexOf(q, startAt);
            if (idx < 0 && startAt > 0) {
                idx = area.value.indexOf(q, 0);
            }
            if (idx < 0) {
                return false;
            }
            lastFindIndex = idx;
            area.focus();
            area.selectionStart = idx;
            area.selectionEnd = idx + q.length;
            updateStatus();
            return true;
        }

        function findText(advance) {
            if (!advance) {
                showSearchBar();
                return;
            }
            var searchInput = global.document.getElementById('xed-searchbar-input');
            if (searchInput && !searchInput.closest('[hidden]')) {
                applyFindQuery(searchInput.value, true);
                return;
            }
            if (!applyFindQuery(lastFind, true)) {
                return;
            }
        }

        function replaceText() {
            var findInput = global.document.getElementById('xed-replace-find');
            var withInput = global.document.getElementById('xed-replace-with');
            if (findInput && lastFind) {
                findInput.value = lastFind;
            }
            if (withInput && !withInput.value) {
                withInput.value = '';
            }
            openDialog('xed-replace-dialog');
            if (findInput) {
                findInput.focus();
            }
        }

        function applyReplaceOne() {
            var findInput = global.document.getElementById('xed-replace-find');
            var withInput = global.document.getElementById('xed-replace-with');
            if (!findInput || !withInput) {
                return;
            }
            var findQ = findInput.value.replace(/^\s+|\s+$/g, '');
            if (!findQ) {
                return;
            }
            lastFind = findQ;
            var repl = withInput.value;
            var sel = getSelectionText();
            if (sel === findQ) {
                insertTextAtCursor(repl);
                applyFindQuery(findQ, true);
                return;
            }
            if (!applyFindQuery(findQ, false) && getSelectionText() !== findQ) {
                return;
            }
            if (getSelectionText() === findQ) {
                insertTextAtCursor(repl);
                applyFindQuery(findQ, true);
            }
        }

        function applyReplaceAll() {
            var findInput = global.document.getElementById('xed-replace-find');
            var withInput = global.document.getElementById('xed-replace-with');
            if (!findInput || !withInput) {
                return;
            }
            var findQ = findInput.value.replace(/^\s+|\s+$/g, '');
            if (!findQ) {
                return;
            }
            var repl = withInput.value;
            if (area.value.indexOf(findQ) < 0) {
                return;
            }
            area.value = area.value.split(findQ).join(repl);
            lastFind = findQ;
            lastFindIndex = -1;
            setDirty(area.value !== savedValue);
            updateStatus();
        }

        function goToLine() {
            var lineInput = global.document.getElementById('xed-goto-line');
            openDialog('xed-goto-dialog');
            if (lineInput) {
                lineInput.focus();
                lineInput.select();
            }
        }

        function applyGoToLine() {
            var lineInput = global.document.getElementById('xed-goto-line');
            if (!lineInput) {
                return;
            }
            var num = parseInt(lineInput.value, 10);
            if (!num || num < 1) {
                return;
            }
            var lines = area.value.split('\n');
            var line = Math.min(num, lines.length);
            var pos = 0;
            var i;
            for (i = 0; i < line - 1; i++) {
                pos += lines[i].length + 1;
            }
            closeAllDialogs();
            area.focus();
            area.selectionStart = pos;
            area.selectionEnd = pos;
            updateStatus();
        }

        function toggleToolbar() {
            toolbarVisible = !toolbarVisible;
            root.classList.toggle('is-toolbar-hidden', !toolbarVisible);
            var item = root.querySelector('[data-xed-action="toggle-toolbar"]');
            if (item) {
                item.classList.toggle('xed-menu__item--checked', toolbarVisible);
            }
        }

        function toggleStatusbar() {
            statusVisible = !statusVisible;
            root.classList.toggle('is-status-hidden', !statusVisible);
            var item = root.querySelector('[data-xed-action="toggle-statusbar"]');
            if (item) {
                item.classList.toggle('xed-menu__item--checked', statusVisible);
                item.setAttribute('aria-checked', statusVisible ? 'true' : 'false');
            }
        }

        function toggleWrap() {
            wrapSoft = !wrapSoft;
            root.classList.toggle('is-wrap-soft', wrapSoft);
            area.setAttribute('wrap', wrapSoft ? 'soft' : 'off');
            var item = root.querySelector('[data-xed-action="toggle-wrap"]');
            if (item) {
                item.classList.toggle('xed-menu__item--checked', wrapSoft);
            }
        }

        function closeAllMenus() {
            root.querySelectorAll('.xed-menu').forEach(function closeMenu(menu) {
                var trigger = menu.querySelector('.xed-menu__trigger');
                var dropdown = menu.querySelector('.xed-menu__dropdown');
                if (!dropdown) {
                    return;
                }
                dropdown.hidden = true;
                if (trigger) {
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        }

        function setupMenus() {
            root.querySelectorAll('.xed-menu').forEach(function bindMenu(menu) {
                var trigger = menu.querySelector('.xed-menu__trigger');
                var dropdown = menu.querySelector('.xed-menu__dropdown');
                if (!trigger || !dropdown) {
                    return;
                }

                trigger.addEventListener('click', function onTriggerClick(e) {
                    e.stopPropagation();
                    var wasOpen = !dropdown.hidden;
                    closeAllMenus();
                    if (!wasOpen) {
                        dropdown.hidden = false;
                        trigger.setAttribute('aria-expanded', 'true');
                    }
                });

                trigger.addEventListener('mouseenter', function onTriggerEnter() {
                    var anyOpen = root.querySelector('.xed-menu__dropdown:not([hidden])');
                    if (anyOpen && dropdown.hidden) {
                        closeAllMenus();
                        dropdown.hidden = false;
                        trigger.setAttribute('aria-expanded', 'true');
                    }
                });
            });

            global.document.addEventListener('click', function onDocClick() {
                closeAllMenus();
            });

            root.addEventListener('keydown', function onEscape(e) {
                if (e.key === 'Escape') {
                    closeAllMenus();
                }
            });
        }

        function runAction(action) {
            if (action === 'new') {
                if (!confirmDiscard()) {
                    return;
                }
                clearDocument();
                return;
            }
            if (action === 'new-tab') {
                newGnomeTab();
                return;
            }
            if (action === 'close-tab') {
                closeGnomeTab();
                return;
            }
            if (action === 'open-vfs') {
                var vfsBtn = root.querySelector('[data-te-gnome-action="open-vfs"]');
                var vfsHref = vfsBtn ? vfsBtn.getAttribute('data-te-gnome-vfs') : GNOME_TE_VFS_SAMPLE;
                if (!confirmDiscard()) {
                    return;
                }
                openTeGnomeVfsSample(vfsHref);
                return;
            }
            if (action === 'open') {
                if (!confirmDiscard()) {
                    return;
                }
                if (fileInput) {
                    fileInput.click();
                }
                return;
            }
            if (action === 'save') {
                saveDocument(false);
                return;
            }
            if (action === 'save-as') {
                saveDocument(true);
                return;
            }
            if (action === 'revert') {
                revertDocument();
                return;
            }
            if (action === 'close') {
                if (isGnomeTeLayout() && gnomeTeDocs && gnomeTeDocs.length > 1) {
                    closeGnomeTab();
                    return;
                }
                closeWindow();
                return;
            }
            if (action === 'undo') {
                runEditCommand('undo');
                return;
            }
            if (action === 'redo') {
                runEditCommand('redo');
                return;
            }
            if (action === 'cut') {
                cutSelection();
                return;
            }
            if (action === 'copy') {
                copySelection();
                return;
            }
            if (action === 'paste') {
                pasteFromClipboard();
                return;
            }
            if (action === 'delete') {
                deleteSelection();
                return;
            }
            if (action === 'select-all') {
                selectAll();
                return;
            }
            if (action === 'find') {
                findText(false);
                return;
            }
            if (action === 'find-next') {
                findText(true);
                return;
            }
            if (action === 'replace') {
                replaceText();
                return;
            }
            if (action === 'goto-line') {
                goToLine();
                return;
            }
            if (action === 'preferences') {
                openPreferences();
                return;
            }
            if (action === 'toggle-toolbar') {
                toggleToolbar();
                return;
            }
            if (action === 'toggle-statusbar') {
                toggleStatusbar();
                return;
            }
            if (action === 'toggle-wrap') {
                toggleWrap();
            }
        }

        function setupActions() {
            root.querySelectorAll('[data-xed-action]').forEach(function bindAction(el) {
                var action = el.getAttribute('data-xed-action');
                var needsSelection = action === 'cut' || action === 'copy';

                el.addEventListener('mousedown', function onMouseDown(e) {
                    if (needsSelection) {
                        e.preventDefault();
                    }
                });

                el.addEventListener('click', function onClick(e) {
                    e.stopPropagation();
                    closeAllMenus();
                    runAction(action);
                });
            });
        }

        function shortcutKey(e) {
            if (!e.ctrlKey && !e.metaKey) {
                return '';
            }
            var parts = [];
            if (e.ctrlKey || e.metaKey) {
                parts.push('ctrl');
            }
            if (e.shiftKey) {
                parts.push('shift');
            }
            parts.push(e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase());
            return parts.join('+');
        }

        function setupKeyboard() {
            area.addEventListener('keydown', function onAreaKeydown(e) {
                var key = shortcutKey(e);
                var action = SHORTCUTS[key];
                if (!action) {
                    return;
                }
                e.preventDefault();
                runAction(action);
            });
        }

        area.addEventListener('input', function onInput() {
            setDirty(area.value !== savedValue);
            updateStatus();
        });

        area.addEventListener('click', updateStatus);
        area.addEventListener('keyup', updateStatus);
        area.addEventListener('select', updateStatus);

        if (fileInput) {
            fileInput.addEventListener('change', function onFileChosen() {
                var file = fileInput.files && fileInput.files[0];
                fileInput.value = '';
                if (!file) {
                    return;
                }
                var reader = new FileReader();
                reader.onload = function onLoaded() {
                    area.value = typeof reader.result === 'string' ? reader.result : '';
                    fileName = file.name || 'document.txt';
                    savedValue = area.value;
                    setDirty(false);
                    updateStatus();
                };
                reader.readAsText(file);
            });
        }

        function setupDialogs() {
            root.querySelectorAll('[data-xed-dialog]').forEach(function bindDialogBtn(btn) {
                btn.addEventListener('click', function onDialogClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var action = btn.getAttribute('data-xed-dialog');
                    if (action === 'close') {
                        closeAllDialogs();
                        return;
                    }
                    if (action === 'find-next') {
                        var findInput = global.document.getElementById('xed-find-input');
                        if (findInput) {
                            applyFindQuery(findInput.value, lastFindIndex >= 0);
                        }
                        return;
                    }
                    if (action === 'replace-one') {
                        applyReplaceOne();
                        return;
                    }
                    if (action === 'replace-all') {
                        applyReplaceAll();
                        return;
                    }
                    if (action === 'goto-apply') {
                        applyGoToLine();
                    }
                    if (action === 'save-apply') {
                        applySaveAs();
                    }
                    if (action === 'prefs-apply') {
                        applyPreferences();
                    }
                });
            });

            root.querySelectorAll('[data-xed-searchbar]').forEach(function bindSearchbarBtn(btn) {
                btn.addEventListener('click', function onSearchbarClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var action = btn.getAttribute('data-xed-searchbar');
                    var searchInput = global.document.getElementById('xed-searchbar-input');
                    if (action === 'close') {
                        hideSearchBar();
                        return;
                    }
                    if (!searchInput) {
                        return;
                    }
                    if (action === 'next') {
                        applyFindQuery(searchInput.value, lastFindIndex >= 0);
                        return;
                    }
                    if (action === 'prev') {
                        var q = (searchInput.value || '').replace(/^\s+|\s+$/g, '');
                        if (!q) {
                            return;
                        }
                        var startAt = lastFindIndex > 0 ? lastFindIndex - 1 : area.value.length;
                        var idx = area.value.lastIndexOf(q, startAt);
                        if (idx < 0) {
                            idx = area.value.lastIndexOf(q);
                        }
                        if (idx < 0) {
                            return;
                        }
                        lastFind = q;
                        lastFindIndex = idx;
                        area.focus();
                        area.selectionStart = idx;
                        area.selectionEnd = idx + q.length;
                        updateStatus();
                    }
                });
            });

            var searchbarInput = global.document.getElementById('xed-searchbar-input');
            if (searchbarInput) {
                searchbarInput.addEventListener('keydown', function onSearchbarKey(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        applyFindQuery(searchbarInput.value, e.shiftKey && lastFindIndex >= 0);
                    }
                    if (e.key === 'Escape') {
                        hideSearchBar();
                    }
                });
                searchbarInput.addEventListener('input', function onSearchbarInput() {
                    applyFindQuery(searchbarInput.value, false);
                });
            }

            root.querySelectorAll('[data-xed-prefs-tab]').forEach(function bindPrefsTab(btn) {
                btn.addEventListener('click', function onPrefsTabClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    setPrefsTab(btn.getAttribute('data-xed-prefs-tab'));
                });
            });

            var findInput = global.document.getElementById('xed-find-input');
            if (findInput) {
                findInput.addEventListener('keydown', function onFindKey(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        applyFindQuery(findInput.value, lastFindIndex >= 0);
                    }
                    if (e.key === 'Escape') {
                        closeAllDialogs();
                    }
                });
            }

            var gotoInput = global.document.getElementById('xed-goto-line');
            if (gotoInput) {
                gotoInput.addEventListener('keydown', function onGotoKey(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        applyGoToLine();
                    }
                    if (e.key === 'Escape') {
                        closeAllDialogs();
                    }
                });
            }

            root.querySelectorAll('.xed-dialog').forEach(function bindOverlay(dlg) {
                dlg.addEventListener('click', function onOverlayClick(e) {
                    if (e.target === dlg) {
                        closeAllDialogs();
                    }
                });
            });
        }

        setupMenus();
        setupActions();
        setupDialogs();
        setupKeyboard();

        if (prefersGnomeTextEditorLayout()) {
            toolbarVisible = false;
            root.classList.add('is-toolbar-hidden');
            var toolbarMenuItem = root.querySelector('[data-xed-action="toggle-toolbar"]');
            if (toolbarMenuItem) {
                toolbarMenuItem.classList.remove('xed-menu__item--checked');
            }
            gnomeTeDocs = [createEmptyGnomeDoc()];
            root.querySelectorAll('.xed-menu__item--gnome-only').forEach(function revealGnomeItem(el) {
                el.hidden = false;
            });
            if (gnomeTabsEl) {
                gnomeTabsEl.addEventListener('click', function onTabClick(event) {
                    var tabBtn = event.target.closest('[data-te-gnome-tab]');
                    if (!tabBtn) {
                        return;
                    }
                    event.preventDefault();
                    loadGnomeDoc(parseInt(tabBtn.getAttribute('data-te-gnome-tab'), 10));
                });
            }
            syncTeGnomeDataset(root, false);
            global.openTeGnomeVfsSample = openTeGnomeVfsSample;
            global.showTeGnomeSaveToast = showTeGnomeSaveToast;
            global.renderGnomeTeTabs = renderGnomeTeTabs;
        }

        refreshTitle();
        syncDocumentsMenu();
        updateStatus();

        if (!toolbar) {
            toolbar = global.document.getElementById('xed-toolbar');
        }
        if (!statusbar) {
            statusbar = global.document.getElementById('xed-statusbar');
        }

        function basenameFromHref(href) {
            var path = String(href || '').split('?')[0].split('#')[0];
            var parts = path.split('/');
            return parts[parts.length - 1] || 'document.txt';
        }

        function resolveExplorerHref(href) {
            if (!href) {
                return '';
            }
            if (typeof global.resolveCapsuleResourceUrl === 'function') {
                return global.resolveCapsuleResourceUrl(href);
            }
            try {
                return new global.URL(href, global.document.baseURI).href;
            } catch (err) {
                return href;
            }
        }

        function loadDocumentFromExplorer(href, name) {
            if (!href) {
                return;
            }
            if (!confirmDiscard()) {
                return;
            }
            var resolved = resolveExplorerHref(href);
            var displayName = name || basenameFromHref(href);

            if (typeof global.fetch !== 'function') {
                global.alert('Impossible d\'ouvrir « ' + displayName + ' ».');
                return;
            }

            global.fetch(resolved, { credentials: 'same-origin' })
                .then(function onResponse(res) {
                    if (!res.ok) {
                        throw new Error('fetch-failed');
                    }
                    return res.text();
                })
                .then(function onText(text) {
                    area.value = text;
                    fileName = displayName;
                    savedValue = area.value;
                    setDirty(false);
                    refreshTitle();
                    syncDocumentsMenu();
                    updateStatus();
                })
                .catch(function onFetchError() {
                    global.alert('Impossible d\'ouvrir « ' + displayName + ' ».');
                });
        }

        global.__xedLoadFromExplorer = loadDocumentFromExplorer;
        if (pendingExplorerOpen) {
            loadDocumentFromExplorer(pendingExplorerOpen.href, pendingExplorerOpen.name);
            pendingExplorerOpen = null;
        }
    }

    function openXedFromExplorer(href, name) {
        var root = global.document.getElementById('xedApp');
        if (!root) {
            pendingExplorerOpen = { href: href, name: name };
            if (typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink('text_editor');
            }
            if (typeof global.document !== 'undefined') {
                global.document.addEventListener('capsule:slot-injected', function onXedSlotReady(event) {
                    if (!event.detail || event.detail.slotId !== 'text_editor') {
                        return;
                    }
                    global.document.removeEventListener('capsule:slot-injected', onXedSlotReady);
                    global.initTextEditorApp();
                    if (global.__xedLoadFromExplorer) {
                        global.__xedLoadFromExplorer(href, name);
                    }
                });
            }
            return;
        }
        global.initTextEditorApp();
        if (global.__xedLoadFromExplorer) {
            global.__xedLoadFromExplorer(href, name);
        } else {
            pendingExplorerOpen = { href: href, name: name };
        }
    }

    global.initTextEditorApp = initTextEditorAppOnce;
    global.openXedFromExplorer = openXedFromExplorer;
}(typeof window !== 'undefined' ? window : this));
