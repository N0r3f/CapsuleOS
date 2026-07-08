/**
 * Opérations Nautilus GNOME — presse-papiers, corbeille, favoris, réseau, recherche globale, undo.
 */
(function initFileExplorerNautilusOps(global) {
    'use strict';

    const MAX_UNDO = 24;

    const getNemoRoot = () => {
        if (typeof global.getExplorerWindowSlot === 'function') {
            return global.getExplorerWindowSlot();
        }
        return global.document.getElementById('nemo')
            || global.document.querySelector('div.windowElement#nemo[data-link="nemo"]');
    };

    const usesAdvancedExplorerOps = () => (
        typeof global.usesAdvancedExplorerOps === 'function' && global.usesAdvancedExplorerOps()
    );

    const getState = () => global.fileExplorerState || null;

    const getStorageKey = (suffix) => {
        const skin = global.document && global.document.body ? global.document.body.id : 'default';
        const root = typeof global.getFileExplorerRoot === 'function'
            ? global.getFileExplorerRoot()
            : 'home/public';
        return `capsule-nautilus-${suffix}:${skin}:${root}`;
    };

    const readJsonStorage = (key, fallback) => {
        try {
            const raw = global.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    };

    const writeJsonStorage = (key, value) => {
        try {
            global.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            /* quota */
        }
    };

    const pushUndoSnapshot = () => {
        const state = getState();
        if (!state || !state.manifest || !state.manifest.folders) {
            return;
        }
        if (!Array.isArray(state.explorerUndoStack)) {
            state.explorerUndoStack = [];
        }
        if (!Array.isArray(state.explorerRedoStack)) {
            state.explorerRedoStack = [];
        }
        state.explorerUndoStack.push(JSON.stringify(state.manifest.folders));
        if (state.explorerUndoStack.length > MAX_UNDO) {
            state.explorerUndoStack.shift();
        }
        state.explorerRedoStack = [];
        syncUndoMenuState();
    };

    const restoreManifestFolders = (serialized) => {
        const state = getState();
        if (!state || !state.manifest || !serialized) {
            return false;
        }
        try {
            state.manifest.folders = JSON.parse(serialized);
            if (typeof global.persistExplorerManifest === 'function') {
                global.persistExplorerManifest(state.manifest);
            }
            if (typeof global.renderDirectory === 'function' && state.currentPath) {
                global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
            }
            if (typeof global.updatePathDisplay === 'function') {
                global.updatePathDisplay();
            }
            return true;
        } catch (error) {
            return false;
        }
    };

    const syncUndoMenuState = () => {
        const root = getNemoRoot();
        if (!root) {
            return;
        }
        const state = getState();
        const undoBtn = root.querySelector('[data-nautilus-menu="undo"]');
        const redoBtn = root.querySelector('[data-nautilus-menu="redo"]');
        const canUndo = state && Array.isArray(state.explorerUndoStack) && state.explorerUndoStack.length > 0;
        const canRedo = state && Array.isArray(state.explorerRedoStack) && state.explorerRedoStack.length > 0;
        if (undoBtn) {
            undoBtn.disabled = !canUndo;
        }
        if (redoBtn) {
            redoBtn.disabled = !canRedo;
        }
    };

    const getSelectedItemLinks = () => {
        const root = getNemoRoot();
        if (!root) {
            return [];
        }
        const grid = root.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid) {
            return [];
        }
        return [...grid.querySelectorAll('a.nemo-app__item--selected[data-item-name]')];
    };

    const linkToEntry = (link) => {
        if (!link || !link.dataset) {
            return null;
        }
        const state = getState();
        const parentPath = link.dataset.itemFolderPath || (state && state.currentPath) || '';
        return {
            parentPath,
            name: link.dataset.itemName,
            type: link.dataset.itemType || 'file',
            targetPath: link.dataset.itemTargetPath || '',
        };
    };

    const getTrashStore = () => readJsonStorage(getStorageKey('trash'), []);
    const setTrashStore = (items) => writeJsonStorage(getStorageKey('trash'), items);

    const getStarredStore = () => readJsonStorage(getStorageKey('starred'), []);
    const setStarredStore = (items) => writeJsonStorage(getStorageKey('starred'), items);

    const getNetworkStore = () => readJsonStorage(getStorageKey('network'), []);
    const setNetworkStore = (items) => writeJsonStorage(getStorageKey('network'), items);

    const refreshView = () => {
        const state = getState();
        if (!state || !state.currentPath) {
            return;
        }
        if (typeof global.renderDirectory === 'function') {
            global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
        }
        if (typeof global.updatePathDisplay === 'function') {
            global.updatePathDisplay();
        }
        syncPasteMenuState();
    };

    const isPasteDestinationValid = (destPath) => {
        if (!destPath) {
            return false;
        }
        if (typeof global.isCapsuleVirtualPlace === 'function' && global.isCapsuleVirtualPlace(destPath)) {
            return false;
        }
        if (typeof global.CapsuleExplorerVfs !== 'undefined'
            && global.CapsuleExplorerVfs.isExplorerVfsPath
            && global.CapsuleExplorerVfs.isExplorerVfsPath(destPath)) {
            return false;
        }
        return true;
    };

    const resolvePasteDestination = (state, destPath) => {
        if (destPath) {
            return destPath;
        }
        const profile = global.__nautilusContextMenuProfile || 'background';
        if (profile === 'item-folder') {
            const links = getSelectedItemLinks();
            if (links.length === 1 && links[0].dataset.itemType === 'folder') {
                const folderPath = links[0].dataset.itemTargetPath;
                if (folderPath) {
                    return folderPath;
                }
            }
        }
        return state && state.currentPath;
    };

    const isContextActionDisabled = (action, state, selectedCount) => {
        const path = state && state.currentPath;
        const profile = global.__nautilusContextMenuProfile || 'background';
        const virtualPlace = typeof global.isCapsuleVirtualPlace === 'function' && path
            ? global.isCapsuleVirtualPlace(path)
            : false;
        const vfsPath = typeof global.CapsuleExplorerVfs !== 'undefined'
            && global.CapsuleExplorerVfs.isExplorerVfsPath
            && path
            ? global.CapsuleExplorerVfs.isExplorerVfsPath(path)
            : false;
        const inTrashContext = profile === 'trash' || profile === 'trash-item'
            || path === global.CAPSULE_PLACE_TRASH;
        if (action === 'empty-trash') {
            return profile !== 'trash' || !getTrashStore().length;
        }
        if (action === 'open-terminal') {
            const allowedProfile = profile === 'background'
                || profile === 'item-folder'
                || profile === 'item';
            return !allowedProfile || virtualPlace || vfsPath;
        }
        if (action === 'restore-trash' || action === 'delete-forever') {
            return profile !== 'trash-item' || selectedCount === 0;
        }
        if (action === 'paste') {
            const clip = state && state.explorerClipboard;
            const pasteDest = resolvePasteDestination(state);
            return inTrashContext
                || !(clip && Array.isArray(clip.entries) && clip.entries.length
                    && isPasteDestinationValid(pasteDest));
        }
        if (action === 'copy-location') {
            const onItem = profile === 'item-folder' || profile === 'item-file' || profile === 'item';
            return inTrashContext || !onItem || selectedCount !== 1;
        }
        if (['rename', 'open', 'open-with'].includes(action)) {
            return selectedCount !== 1 || inTrashContext;
        }
        if (['cut', 'copy', 'move-to', 'copy-to', 'compress', 'trash'].includes(action)) {
            return selectedCount === 0 || inTrashContext;
        }
        if (action === 'new-folder') {
            return virtualPlace || vfsPath || profile !== 'background';
        }
        if (action === 'select-all') {
            return profile !== 'background';
        }
        return false;
    };

    const syncPasteMenuState = () => {
        const root = getNemoRoot();
        const state = getState();
        if (!root) {
            return;
        }
        const selectedCount = getSelectedItemLinks().length;
        root.querySelectorAll('[data-nemo-ctx]').forEach((btn) => {
            const action = btn.dataset.nemoCtx;
            if (!action) {
                return;
            }
            btn.disabled = isContextActionDisabled(action, state, selectedCount);
        });
    };

    const setExplorerClipboard = (op, entries) => {
        const state = getState();
        if (!state) {
            return;
        }
        state.explorerClipboard = entries.length ? { op, entries } : null;
        syncPasteMenuState();
    };

    const entryLocationPath = (entry) => {
        if (!entry) {
            return '';
        }
        if (entry.targetPath) {
            return entry.targetPath;
        }
        if (entry.parentPath && entry.name) {
            return `${entry.parentPath}/${entry.name}`;
        }
        if (entry.parentPath && entry.name) {
            return `${entry.parentPath}/${entry.name}`;
        }
        return entry.parentPath || '';
    };

    const writeTextToClipboard = async (text) => {
        if (!text) {
            return false;
        }
        try {
            if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
                await global.navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
            /* fallback */
        }
        return false;
    };

    const copyExplorerSelectionLocation = async () => {
        const links = getSelectedItemLinks();
        let location = '';
        if (links.length === 1) {
            location = entryLocationPath(linkToEntry(links[0]));
        } else {
            const state = getState();
            location = state && state.currentPath ? state.currentPath : '';
        }
        if (!location) {
            return { ok: false, message: 'Emplacement indisponible.' };
        }
        const copied = await writeTextToClipboard(location);
        return copied
            ? { ok: true, path: location }
            : { ok: false, message: 'Copie d’emplacement indisponible dans ce navigateur.' };
    };

    const copyExplorerSelection = () => {
        const entries = getSelectedItemLinks().map(linkToEntry).filter(Boolean);
        if (!entries.length) {
            return { ok: false };
        }
        setExplorerClipboard('copy', entries);
        return { ok: true, count: entries.length };
    };

    const cutExplorerSelection = () => {
        const entries = getSelectedItemLinks().map(linkToEntry).filter(Boolean);
        if (!entries.length) {
            return { ok: false };
        }
        setExplorerClipboard('cut', entries);
        return { ok: true, count: entries.length };
    };

    const pasteExplorerClipboard = async (destPath) => {
        const state = getState();
        const clip = state && state.explorerClipboard;
        const target = resolvePasteDestination(state, destPath);
        if (!clip || !clip.entries.length || !isPasteDestinationValid(target)) {
            return { ok: false, message: 'Impossible de coller ici.' };
        }

        let pasted = 0;
        if (clip.entries.length) {
            pushUndoSnapshot();
        }
        for (const entry of clip.entries) {
            if (clip.op === 'cut' && typeof global.moveExplorerItem === 'function') {
                const result = await global.moveExplorerItem(entry.parentPath, entry.name, target);
                if (result && result.ok) {
                    pasted += 1;
                }
            } else if (typeof global.copyExplorerItem === 'function') {
                const result = await global.copyExplorerItem(entry.parentPath, entry.name, target);
                if (result && result.ok) {
                    pasted += 1;
                }
            }
        }

        if (clip.op === 'cut') {
            setExplorerClipboard(null, []);
        }
        refreshView();
        return { ok: pasted > 0, count: pasted };
    };

    const promptDestinationPath = (title) => {
        const root = typeof global.getFileExplorerRoot === 'function'
            ? global.getFileExplorerRoot()
            : '';
        if (typeof global.prompt !== 'function') {
            return null;
        }
        return global.prompt(title, root);
    };

    const transferSelectionToPath = async (mode) => {
        const entries = getSelectedItemLinks().map(linkToEntry).filter(Boolean);
        if (!entries.length) {
            return { ok: false };
        }
        const raw = promptDestinationPath(mode === 'copy' ? 'Copier vers (chemin) :' : 'Déplacer vers (chemin) :');
        if (raw === null) {
            return { ok: false, cancelled: true };
        }
        const dest = typeof global.resolvePathFromLocationInput === 'function'
            ? global.resolvePathFromLocationInput(raw)
            : raw;
        if (!dest) {
            global.alert('Emplacement invalide.');
            return { ok: false };
        }
        let done = 0;
        if (entries.length) {
            pushUndoSnapshot();
        }
        for (const entry of entries) {
            const fn = mode === 'copy' ? global.copyExplorerItem : global.moveExplorerItem;
            if (typeof fn !== 'function') {
                continue;
            }
            const result = await fn(entry.parentPath, entry.name, dest);
            if (result && result.ok) {
                done += 1;
            }
        }
        refreshView();
        return { ok: done > 0, count: done };
    };

    const renameExplorerSelection = async () => {
        const links = getSelectedItemLinks();
        if (links.length !== 1) {
            return { ok: false };
        }
        if (typeof global.startExplorerInlineRename === 'function') {
            return global.startExplorerInlineRename(links[0]);
        }
        const entry = linkToEntry(links[0]);
        if (!entry || typeof global.renameExplorerItem !== 'function') {
            return { ok: false };
        }
        if (typeof global.prompt !== 'function') {
            return { ok: false };
        }
        const next = global.prompt('Nouveau nom :', entry.name);
        if (next === null) {
            return { ok: false, cancelled: true };
        }
        pushUndoSnapshot();
        return global.renameExplorerItem(entry.parentPath, entry.name, next.trim());
    };

    const trashExplorerSelection = async () => {
        const entries = getSelectedItemLinks().map(linkToEntry).filter(Boolean);
        if (!entries.length || typeof global.trashExplorerItem !== 'function') {
            return { ok: false };
        }
        pushUndoSnapshot();
        let trashed = 0;
        for (const entry of entries) {
            const result = await global.trashExplorerItem(entry.parentPath, entry.name);
            if (result && result.ok) {
                trashed += 1;
            }
        }
        refreshView();
        return { ok: trashed > 0, count: trashed };
    };

    const findTrashEntriesForLinks = (links) => {
        const store = getTrashStore();
        const names = links.map((link) => link.dataset.itemName).filter(Boolean);
        return names.map((name) => {
            const index = store.findIndex((entry) => {
                const entryName = (entry.item && entry.item.name) || entry.name;
                return entryName === name;
            });
            if (index < 0) {
                return null;
            }
            return { index, entry: store[index], name };
        }).filter(Boolean);
    };

    const emptyNautilusTrash = async () => {
        const store = getTrashStore();
        if (!store.length) {
            return { ok: true, count: 0 };
        }
        if (typeof global.confirm === 'function' && !global.confirm('Vider la corbeille ?')) {
            return { ok: false, cancelled: true };
        }
        setTrashStore([]);
        refreshView();
        return { ok: true, count: store.length };
    };

    const restoreNautilusTrashSelection = async () => {
        const links = getSelectedItemLinks();
        const loadManifest = global.loadManifestForFileExplorer || global.loadManifest;
        if (!links.length || typeof loadManifest !== 'function') {
            return { ok: false };
        }
        try {
            await loadManifest();
        } catch (error) {
            return { ok: false };
        }
        const state = getState();
        const manifest = state && state.manifest;
        if (!manifest || !manifest.folders) {
            return { ok: false };
        }
        const store = getTrashStore();
        const matches = findTrashEntriesForLinks(links);
        if (!matches.length) {
            return { ok: false };
        }
        let restored = 0;
        const remaining = store.slice();
        const removeIndexes = [];
        matches.forEach(({ index, entry }) => {
            const parent = entry.parentPath;
            const parentNode = manifest.folders[parent];
            const item = entry.item;
            if (!parentNode || !Array.isArray(parentNode.items) || !item) {
                return;
            }
            if (parentNode.items.some((it) => it.name === item.name)) {
                return;
            }
            parentNode.items.push(JSON.parse(JSON.stringify(item)));
            if (item.type === 'folder' && item.path) {
                manifest.folders[item.path] = manifest.folders[item.path] || { label: item.name, items: [] };
            }
            removeIndexes.push(index);
            restored += 1;
        });
        if (!restored) {
            return { ok: false, message: 'Impossible de restaurer (conflit ou dossier d’origine absent).' };
        }
        removeIndexes.sort((a, b) => b - a).forEach((idx) => remaining.splice(idx, 1));
        if (typeof global.persistExplorerManifest === 'function') {
            global.persistExplorerManifest(manifest);
        }
        setTrashStore(remaining);
        refreshView();
        return { ok: true, count: restored };
    };

    const deleteNautilusTrashSelectionPermanently = async () => {
        const links = getSelectedItemLinks();
        if (!links.length) {
            return { ok: false };
        }
        const store = getTrashStore();
        const matches = findTrashEntriesForLinks(links);
        if (!matches.length) {
            return { ok: false };
        }
        const removeIndexes = matches.map((match) => match.index).sort((a, b) => b - a);
        const remaining = store.slice();
        removeIndexes.forEach((idx) => remaining.splice(idx, 1));
        setTrashStore(remaining);
        refreshView();
        return { ok: true, count: matches.length };
    };

    const compressExplorerSelection = async () => {
        const entries = getSelectedItemLinks().map(linkToEntry).filter(Boolean);
        const state = getState();
        const parentPath = state && state.currentPath;
        if (!entries.length || !parentPath || typeof global.compressExplorerItems !== 'function') {
            return { ok: false };
        }
        const defaultName = entries.length === 1
            ? `${entries[0].name}.zip`
            : 'archive.zip';
        const name = typeof global.prompt === 'function'
            ? global.prompt('Nom de l’archive :', defaultName)
            : defaultName;
        if (name === null || !String(name).trim()) {
            return { ok: false, cancelled: name === null };
        }
        pushUndoSnapshot();
        const result = await global.compressExplorerItems(parentPath, entries, String(name).trim());
        refreshView();
        return result;
    };

    const nemoHasPasteClipboard = () => {
        const state = getState();
        const clip = state && state.explorerClipboard;
        return !!(clip && Array.isArray(clip.entries) && clip.entries.length);
    };

    const resolveSelectionLink = (itemLink) => {
        if (itemLink && itemLink.dataset && itemLink.dataset.itemName) {
            return itemLink;
        }
        const links = getSelectedItemLinks();
        return links.length === 1 ? links[0] : null;
    };

    const openExplorerSelectionWith = (itemLink, appId) => {
        const link = resolveSelectionLink(itemLink);
        if (!link) {
            global.alert('Sélectionnez un fichier à ouvrir.');
            return { ok: false };
        }
        const entry = linkToEntry(link);
        if (!entry || entry.type === 'folder') {
            return { ok: false };
        }
        const href = link.dataset.itemHref || entry.href || '#';
        const extension = entry.extension
            || (entry.name && entry.name.includes('.') ? entry.name.split('.').pop().toLowerCase() : '');
        const resolvedHref = typeof global.resolveCapsuleResourceUrl === 'function'
            ? global.resolveCapsuleResourceUrl(href)
            : href;
        const forcedApp = String(appId || '').trim();
        if (forcedApp && typeof global.openFileInViewerWithApp === 'function') {
            const opened = global.openFileInViewerWithApp(resolvedHref, extension, entry.name, forcedApp);
            return opened ? { ok: true, appId: forcedApp } : { ok: false };
        }
        if (typeof global.openFileInViewer === 'function') {
            const opened = global.openFileInViewer(resolvedHref, extension, entry.name);
            if (opened) {
                return { ok: true };
            }
        }
        link.click();
        return { ok: true };
    };

    const addBookmarkForCurrentPath = () => {
        const state = getState();
        if (!state || !state.currentPath) {
            return { ok: false };
        }
        const starred = getStarredStore();
        const label = typeof global.findFolderLabel === 'function'
            ? global.findFolderLabel(state.currentPath)
            : state.currentPath.split('/').pop();
        if (starred.some((entry) => entry.path === state.currentPath)) {
            return { ok: true, duplicate: true };
        }
        starred.push({ path: state.currentPath, label, addedAt: Date.now() });
        setStarredStore(starred);
        return { ok: true };
    };

    const connectNetworkServer = (uri) => {
        const value = String(uri || '').trim();
        if (!value) {
            return { ok: false };
        }
        const list = getNetworkStore();
        if (!list.some((entry) => entry.uri === value)) {
            list.push({ uri: value, label: value.replace(/^[a-z+]+:\/\//i, ''), addedAt: Date.now() });
            setNetworkStore(list);
        }
        const state = getState();
        if (state && state.currentPath === global.CAPSULE_PLACE_NETWORK && typeof global.renderDirectory === 'function') {
            global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
        }
        return { ok: true };
    };

    const collectSearchEverywhereItems = (query) => {
        const state = getState();
        const manifest = state && state.manifest;
        if (!manifest || !manifest.folders || !query) {
            return [];
        }
        const results = [];
        Object.keys(manifest.folders).forEach((folderPath) => {
            const node = manifest.folders[folderPath];
            if (!node || !Array.isArray(node.items)) {
                return;
            }
            node.items.forEach((item) => {
                const enriched = Object.assign({}, item, {
                    folderPath: folderPath,
                    searchParentLabel: typeof global.findFolderLabel === 'function'
                        ? global.findFolderLabel(folderPath)
                        : folderPath,
                });
                if (item.type === 'folder') {
                    const resolvedPath = item.path
                        || (item.name && typeof global.joinExplorerPath === 'function'
                            ? global.joinExplorerPath(folderPath, item.name)
                            : (item.name ? `${folderPath}/${item.name}` : ''));
                    if (resolvedPath) {
                        enriched.path = resolvedPath;
                        enriched.targetPath = resolvedPath;
                    }
                }
                results.push(enriched);
            });
        });
        if (typeof global.filterFileExplorerItemsBySearch === 'function') {
            return global.filterFileExplorerItemsBySearch(results, query);
        }
        const q = query.toLowerCase();
        return results.filter((item) => String(item.name || '').toLowerCase().includes(q));
    };

    const renderSearchEverywhere = (nemoElement, query) => {
        if (!nemoElement) {
            return;
        }
        const items = collectSearchEverywhereItems(query).filter((item) => {
            if (typeof global.passesNautilusSearchFilter === 'function') {
                return global.passesNautilusSearchFilter(item);
            }
            return true;
        });

        nemoElement.innerHTML = '';
        nemoElement.hidden = false;
        const nemoRoot = getNemoRoot();
        const empty = nemoRoot && nemoRoot.querySelector('#nautilus-search-empty');
        if (empty) {
            empty.hidden = true;
        }

        if (!items.length) {
            nemoElement.innerHTML = typeof global.buildNautilusEmptyStateMarkup === 'function'
                ? global.buildNautilusEmptyStateMarkup('search')
                : '<p class="nemo-app__empty">Aucun résultat.</p>';
            if (typeof global.applyFileExplorerViewMode === 'function') {
                global.applyFileExplorerViewMode();
            }
            return;
        }

        const state = getState();
        items.forEach((item) => {
            const parent = item.folderPath || (state && state.currentPath);
            if (typeof global.appendFileExplorerGridItem === 'function') {
                global.appendFileExplorerGridItem(nemoElement, item, parent, (state && state.activePane) || 'primary');
            }
        });
        if (typeof global.applyFileExplorerViewMode === 'function') {
            global.applyFileExplorerViewMode();
        }
    };

    const undoExplorerOperation = () => {
        const state = getState();
        if (!state || !state.explorerUndoStack || !state.explorerUndoStack.length) {
            return false;
        }
        if (state.manifest && state.manifest.folders) {
            state.explorerRedoStack = state.explorerRedoStack || [];
            state.explorerRedoStack.push(JSON.stringify(state.manifest.folders));
        }
        const snapshot = state.explorerUndoStack.pop();
        const ok = restoreManifestFolders(snapshot);
        syncUndoMenuState();
        return ok;
    };

    const redoExplorerOperation = () => {
        const state = getState();
        if (!state || !state.explorerRedoStack || !state.explorerRedoStack.length) {
            return false;
        }
        if (state.manifest && state.manifest.folders) {
            state.explorerUndoStack = state.explorerUndoStack || [];
            state.explorerUndoStack.push(JSON.stringify(state.manifest.folders));
        }
        const snapshot = state.explorerRedoStack.pop();
        const ok = restoreManifestFolders(snapshot);
        syncUndoMenuState();
        return ok;
    };

    const showNautilusDialog = (title, bodyHtml) => {
        const root = getNemoRoot();
        if (!root) {
            global.alert(title);
            return;
        }
        let dialog = root.querySelector('#nautilus-info-dialog');
        if (!dialog) {
            dialog = global.document.createElement('dialog');
            dialog.id = 'nautilus-info-dialog';
            dialog.className = 'nautilus-info-dialog';
            dialog.innerHTML = '<form method="dialog" class="nautilus-info-dialog__panel"><header class="nautilus-info-dialog__header"><h2></h2><button type="submit" value="close">Fermer</button></header><div class="nautilus-info-dialog__body"></div></form>';
            root.appendChild(dialog);
        }
        const titleEl = dialog.querySelector('h2');
        const bodyEl = dialog.querySelector('.nautilus-info-dialog__body');
        if (titleEl) {
            titleEl.textContent = title;
        }
        if (bodyEl) {
            bodyEl.innerHTML = bodyHtml;
        }
        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        }
    };

    const showShortcutsDialog = () => {
        showNautilusDialog('Raccourcis clavier', `<ul class="nautilus-info-dialog__list">
            <li><kbd>Ctrl+N</kbd> Nouvelle fenêtre</li>
            <li><kbd>Ctrl+T</kbd> Nouvel onglet</li>
            <li><kbd>Ctrl+L</kbd> Saisir l’emplacement</li>
            <li><kbd>Ctrl+F</kbd> Rechercher dans le dossier</li>
            <li><kbd>Ctrl+H</kbd> Fichiers cachés</li>
            <li><kbd>Ctrl+C</kbd> / <kbd>Ctrl+X</kbd> / <kbd>Ctrl+V</kbd> Copier / Couper / Coller</li>
            <li><kbd>Ctrl+A</kbd> Tout sélectionner</li>
            <li><kbd>Ctrl+D</kbd> Ajouter aux signets</li>
            <li><kbd>F2</kbd> Renommer</li>
            <li><kbd>Suppr</kbd> Mettre à la corbeille</li>
            <li><kbd>F5</kbd> Actualiser</li>
        </ul>`);
    };

    const showAboutDialog = () => {
        showNautilusDialog('À propos de Fichiers', '<p>CapsuleOS — simulateur GNOME Fichiers (Nautilus 47).</p><p>Gestionnaire de fichiers intégré au bureau virtuel.</p>');
    };

    const showHelpDialog = () => {
        showNautilusDialog('Aide', '<p>Utilisez la barre latérale pour les emplacements, le fil d’Ariane pour naviguer, et le menu contextuel pour les actions sur les fichiers.</p>');
    };

    const filterNautilusSearchItems = (items, query) => {
        const state = getState();
        const mode = (state && state.searchMode) || 'fulltext';
        const q = String(query || '').trim().toLowerCase();
        if (!q) {
            return items;
        }
        return items.filter((item) => {
            const name = String(item.name || '').toLowerCase();
            if (mode === 'filename') {
                return name.includes(q);
            }
            const ext = String(item.extension || '').toLowerCase();
            const parent = String(item.searchParentLabel || item.folderPath || '').toLowerCase();
            return name.includes(q) || ext.includes(q) || parent.includes(q);
        });
    };

    const getVirtualPlaceItems = (placePath) => {
        if (placePath === global.CAPSULE_PLACE_TRASH) {
            return getTrashStore().map((entry) => ({
                type: (entry.item && entry.item.type) || 'file',
                name: (entry.item && entry.item.name) || entry.name || 'Élément',
                path: entry.item && entry.item.path,
                href: entry.item && entry.item.href,
                extension: entry.item && entry.item.extension,
                trashedFrom: entry.parentPath,
            }));
        }
        if (placePath === global.CAPSULE_PLACE_STARRED) {
            return getStarredStore().map((entry) => ({
                type: 'folder',
                name: entry.label || entry.path,
                path: entry.path,
            }));
        }
        if (placePath === global.CAPSULE_PLACE_NETWORK) {
            return getNetworkStore().map((entry) => ({
                type: 'folder',
                name: entry.label || entry.uri,
                path: `__capsule/network/${encodeURIComponent(entry.uri)}`,
                networkUri: entry.uri,
            }));
        }
        return null;
    };

    function bindFileExplorerNautilusOps() {
        if (!usesAdvancedExplorerOps()) {
            return;
        }
        syncUndoMenuState();
        syncPasteMenuState();
    }

    global.bindFileExplorerNautilusOps = bindFileExplorerNautilusOps;
    global.filterFileExplorerItemsBySearch = filterNautilusSearchItems;
    global.renderNautilusSearchEverywhere = renderSearchEverywhere;
    global.collectNautilusSearchEverywhereItems = collectSearchEverywhereItems;
    global.getNautilusVirtualPlaceItems = getVirtualPlaceItems;
    global.copyExplorerSelection = copyExplorerSelection;
    global.copyExplorerSelectionLocation = copyExplorerSelectionLocation;
    global.cutExplorerSelection = cutExplorerSelection;
    global.pasteExplorerClipboard = pasteExplorerClipboard;
    global.transferExplorerSelectionToPath = transferSelectionToPath;
    global.renameExplorerSelection = renameExplorerSelection;
    global.trashExplorerSelection = trashExplorerSelection;
    global.emptyNautilusTrash = emptyNautilusTrash;
    global.restoreNautilusTrashSelection = restoreNautilusTrashSelection;
    global.deleteNautilusTrashSelectionPermanently = deleteNautilusTrashSelectionPermanently;
    global.compressExplorerSelection = compressExplorerSelection;
    global.openExplorerSelectionWith = openExplorerSelectionWith;
    global.nemoHasPasteClipboard = nemoHasPasteClipboard;
    global.addNautilusBookmark = addBookmarkForCurrentPath;
    global.connectNautilusNetworkServer = connectNetworkServer;
    global.undoExplorerOperation = undoExplorerOperation;
    global.redoExplorerOperation = redoExplorerOperation;
    global.pushExplorerUndoSnapshot = pushUndoSnapshot;
    global.syncNautilusClipboardUi = syncPasteMenuState;
    global.showNautilusShortcutsDialog = showShortcutsDialog;
    global.showNautilusAboutDialog = showAboutDialog;
    global.showNautilusHelpDialog = showHelpDialog;

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', (event) => {
            if ((event.detail || {}).slotId === 'nemo') {
                global.setTimeout(() => bindFileExplorerNautilusOps(), 0);
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
