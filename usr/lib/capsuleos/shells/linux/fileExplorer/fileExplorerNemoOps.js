/**
 * Opérations Nemo Cinnamon — presse-papiers, corbeille, renommage, ouvrir avec.
 */
(function initFileExplorerNemoOps(global) {
    'use strict';

    const isNemoCinnamon = () => (
        typeof global.isNemoTemplate === 'function' && global.isNemoTemplate()
    );

    const getState = () => global.fileExplorerState || null;

    const getNemoRoot = () => {
        if (typeof global.getExplorerWindowSlot === 'function') {
            return global.getExplorerWindowSlot();
        }
        return global.document.getElementById('nemo')
            || global.document.querySelector('div.windowElement#nemo[data-link="nemo"]');
    };

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

    const getTrashStore = () => readJsonStorage(getStorageKey('trash'), []);
    const setTrashStore = (items) => writeJsonStorage(getStorageKey('trash'), items);

    const getSelectedItemLinks = () => {
        const root = getNemoRoot();
        if (!root) {
            return [];
        }
        const grid = root.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid) {
            return [];
        }
        return Array.prototype.slice.call(grid.querySelectorAll('a.nemo-app__item--selected[data-item-name]'));
    };

    const linkToEntry = (link) => {
        if (!link) {
            return null;
        }
        const state = getState();
        const name = link.getAttribute('data-item-name') || '';
        const parentPath = state && state.currentPath ? state.currentPath : '';
        const itemType = link.getAttribute('data-item-type')
            || (link.dataset && link.dataset.itemType)
            || 'file';
        const entry = {
            name: name,
            parentPath: parentPath,
            type: itemType === 'folder' ? 'folder' : 'file',
        };
        if (itemType === 'folder' && parentPath && name) {
            entry.targetPath = `${parentPath}/${name}`;
        }
        return entry;
    };

    const refreshView = () => {
        const state = getState();
        if (!state || !state.currentPath) {
            return;
        }
        if (typeof global.navigateToFileExplorerDirectory === 'function') {
            global.navigateToFileExplorerDirectory(state.currentPath, { updateHistory: false });
        } else if (typeof global.loadFileExplorerDirectory === 'function') {
            global.loadFileExplorerDirectory(state.currentPath);
        } else if (typeof global.renderDirectory === 'function') {
            global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
        }
    };

    const setExplorerClipboard = (op, entries) => {
        const state = getState();
        if (!state) {
            return;
        }
        state.explorerClipboard = entries && entries.length ? { op: op, entries: entries } : null;
    };

    const cutExplorerSelection = (link) => {
        const entry = linkToEntry(link);
        if (!entry) {
            return { ok: false };
        }
        setExplorerClipboard('cut', [entry]);
        return { ok: true };
    };

    const copyExplorerSelection = (link) => {
        const entry = linkToEntry(link);
        if (!entry) {
            return { ok: false };
        }
        setExplorerClipboard('copy', [entry]);
        return { ok: true };
    };

    const pasteExplorerClipboard = async () => {
        const state = getState();
        const clip = state && state.explorerClipboard;
        const target = state && state.currentPath;
        if (!clip || !clip.entries || !clip.entries.length || !target) {
            return { ok: false };
        }
        let pasted = 0;
        for (let i = 0; i < clip.entries.length; i += 1) {
            const entry = clip.entries[i];
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

    const hasPasteClipboard = () => {
        const state = getState();
        const clip = state && state.explorerClipboard;
        return !!(clip && clip.entries && clip.entries.length);
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
            return { index: index, entry: store[index], name: name };
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
        matches.forEach((match) => {
            const entry = match.entry;
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
            removeIndexes.push(match.index);
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

    const renameExplorerSelection = async (itemLink) => {
        const link = itemLink || getSelectedItemLinks()[0];
        if (!link) {
            return { ok: false };
        }
        if (typeof global.startExplorerInlineRename === 'function') {
            return global.startExplorerInlineRename(link);
        }
        const entry = linkToEntry(link);
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
        const result = await global.renameExplorerItem(entry.parentPath, entry.name, next.trim());
        refreshView();
        return result;
    };

    const trashExplorerSelection = async (itemLink) => {
        const link = itemLink || getSelectedItemLinks()[0];
        const entry = linkToEntry(link);
        if (!entry || typeof global.trashExplorerItem !== 'function') {
            return { ok: false };
        }
        const result = await global.trashExplorerItem(entry.parentPath, entry.name);
        refreshView();
        return result;
    };

    const compressExplorerSelection = async (itemLink) => {
        const links = itemLink ? [itemLink] : getSelectedItemLinks();
        const entries = links.map(linkToEntry).filter(Boolean);
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
        const result = await global.compressExplorerItems(parentPath, entries, String(name).trim());
        refreshView();
        return result;
    };

    const openExplorerSelectionWith = (itemLink) => {
        const link = itemLink || getSelectedItemLinks()[0];
        if (!link) {
            return { ok: false };
        }
        if (link.dataset.itemType === 'folder') {
            if (typeof link.click === 'function') {
                link.click();
            }
            return { ok: true };
        }
        const name = link.dataset.itemName || '';
        const href = link.dataset.itemHref || link.getAttribute('href') || '#';
        const dot = name.lastIndexOf('.');
        const extension = dot > 0 ? name.slice(dot + 1).toLowerCase() : 'txt';
        if (typeof global.openFileInViewer === 'function') {
            const appId = typeof global.getFileViewerTargetByExtension === 'function'
                ? global.getFileViewerTargetByExtension(extension)
                : null;
            if (!appId && typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink('text_editor');
            }
            const opened = global.openFileInViewer(href, extension, name);
            return { ok: !!opened };
        }
        if (typeof link.click === 'function') {
            link.click();
            return { ok: true };
        }
        return { ok: false };
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
        return null;
    };

    function usesAdvancedExplorerOps() {
        return isNemoCinnamon();
    }

    function openFileExplorerProperties(itemLink) {
        if (typeof global.openExplorerProperties !== 'function') {
            return false;
        }
        const item = itemLink ? linkToEntry(itemLink) : null;
        return global.openExplorerProperties(item);
    }

    function bindFileExplorerNemoOps() {
        if (!isNemoCinnamon()) {
            return;
        }
        const root = getNemoRoot();
        if (!root || root.dataset.nemoOpsInit === 'true') {
            return;
        }
        root.dataset.nemoOpsInit = 'true';
        if (typeof global.bindFileExplorerInlineRename === 'function') {
            global.bindFileExplorerInlineRename(root);
        }
    }

    global.getExplorerStorageKey = getStorageKey;
    global.usesAdvancedExplorerOps = usesAdvancedExplorerOps;
    global.cutExplorerSelection = cutExplorerSelection;
    global.copyExplorerSelection = copyExplorerSelection;
    global.pasteExplorerClipboard = pasteExplorerClipboard;
    global.nemoHasPasteClipboard = hasPasteClipboard;
    global.openFileExplorerProperties = openFileExplorerProperties;
    global.getNautilusVirtualPlaceItems = getVirtualPlaceItems;
    global.emptyNautilusTrash = emptyNautilusTrash;
    global.restoreNautilusTrashSelection = restoreNautilusTrashSelection;
    global.deleteNautilusTrashSelectionPermanently = deleteNautilusTrashSelectionPermanently;
    global.renameExplorerSelection = renameExplorerSelection;
    global.trashExplorerSelection = trashExplorerSelection;
    global.compressExplorerSelection = compressExplorerSelection;
    global.openExplorerSelectionWith = openExplorerSelectionWith;
    global.bindFileExplorerNemoOps = bindFileExplorerNemoOps;

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', function onNemoSlot(event) {
            const detail = event.detail || {};
            if (detail.slotId === 'nemo' && detail.container && detail.container.dataset) {
                delete detail.container.dataset.nemoOpsInit;
                global.setTimeout(bindFileExplorerNemoOps, 0);
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
