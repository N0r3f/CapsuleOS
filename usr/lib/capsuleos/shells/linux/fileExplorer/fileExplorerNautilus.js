/**
 * Interactions GNOME Fichiers (Nautilus 47) — raccourcis, nouveau dossier, barre d’emplacement.
 */
(function initFileExplorerNautilus(global) {
    'use strict';

    const getNemoRoot = () => {
        if (typeof global.getExplorerWindowSlot === 'function') {
            return global.getExplorerWindowSlot();
        }
        return global.document.getElementById('nemo')
            || global.document.querySelector('div.windowElement#nemo[data-link="nemo"]');
    };

    const isNautilusGnome = () => (
        typeof global.isNautilusGnomeTemplate === 'function' && global.isNautilusGnomeTemplate()
    );

    const isDolphin = () => (
        typeof global.isDolphinTemplate === 'function' && global.isDolphinTemplate()
    );

    const usesAdvancedExplorerOps = () => (
        typeof global.usesAdvancedExplorerOps === 'function' && global.usesAdvancedExplorerOps()
    );

    const focusSearchInput = (selectAll) => {
        const root = getNemoRoot();
        const input = root && root.querySelector('#nemo-search-input');
        if (!input) {
            return null;
        }
        input.focus();
        if (selectAll && typeof input.select === 'function') {
            input.select();
        }
        return input;
    };

    const resolvePathFromLocationInput = (rawValue) => {
        const value = String(rawValue || '').trim();
        if (!value) {
            return null;
        }

        const root = typeof global.getFileExplorerRoot === 'function'
            ? global.getFileExplorerRoot()
            : 'home/public';
        const manifest = global.fileExplorerState && global.fileExplorerState.manifest;
        const folders = manifest && manifest.folders ? manifest.folders : null;

        if (value === '/') {
            return global.CAPSULE_PLACE_FILESYSTEM || '__capsule/place/filesystem';
        }

        if (value === '~' || value === '~/') {
            return root;
        }

        if (value.startsWith('~/')) {
            const sub = value.slice(2);
            const candidate = `${root}/${sub}`.replace(/\/+/g, '/').replace(/\/+$/, '');
            if (!folders || folders[candidate]) {
                return candidate;
            }
        }

        if (value.startsWith('/')) {
            const tail = value.replace(/^\/+/, '');
            if (!tail) {
                return global.CAPSULE_PLACE_FILESYSTEM || '__capsule/place/filesystem';
            }
            const fromRoot = `${root}/${tail}`.replace(/\/+/g, '/').replace(/\/+$/, '');
            if (!folders || folders[fromRoot]) {
                return fromRoot;
            }
        }

        const direct = value.replace(/\/+$/, '');
        if (folders && folders[direct]) {
            return direct;
        }

        const fromHome = `${root}/${direct}`.replace(/\/+/g, '/').replace(/\/+$/, '');
        if (folders && folders[fromHome]) {
            return fromHome;
        }

        const placeMap = typeof global.buildNemoPlaceFolderMap === 'function'
            ? global.buildNemoPlaceFolderMap(root)
            : null;
        if (placeMap) {
            const match = Object.entries(placeMap).find(([label]) => (
                label.toLowerCase() === direct.toLowerCase()
            ));
            if (match) {
                return match[1];
            }
        }

        return null;
    };

    const navigateFromLocationInput = (rawValue) => {
        const target = resolvePathFromLocationInput(rawValue);
        if (!target || typeof global.navigateToFileExplorerDirectory !== 'function') {
            return false;
        }
        global.navigateToFileExplorerDirectory(target, { updateHistory: true });
        return true;
    };

    const adjustZoom = (delta) => {
        const state = global.fileExplorerState;
        const settings = { min: 80, max: 140, defaultValue: 100, step: 10 };
        const current = state && state.zoomValue != null ? state.zoomValue : settings.defaultValue;
        const next = Math.max(settings.min, Math.min(settings.max, current + delta));
        if (typeof global.applyFileExplorerZoom === 'function') {
            global.applyFileExplorerZoom(next);
        }
    };

    const bindKeyboardShortcuts = (root) => {
        if (root.dataset.nautilusKeyboardInit === 'true') {
            return;
        }

        global.document.addEventListener('keydown', (event) => {
            if (!usesAdvancedExplorerOps()) {
                return;
            }
            const win = getNemoRoot();
            if (!win || win.style.display === 'none') {
                return;
            }
            if (!win.contains(global.document.activeElement) && global.document.activeElement !== global.document.body) {
                const tag = global.document.activeElement && global.document.activeElement.tagName;
                if (tag && tag !== 'BODY' && !win.contains(global.document.activeElement)) {
                    return;
                }
            }

            const ctrl = event.ctrlKey || event.metaKey;
            const key = event.key;

            if (!isDolphin() && ctrl && !event.shiftKey && (key === 'l' || key === 'L')) {
                event.preventDefault();
                if (typeof global.setNautilusChromeMode === 'function') {
                    global.setNautilusChromeMode('location');
                } else if (typeof global.setNautilusLocationBarMode === 'function') {
                    global.setNautilusLocationBarMode('path');
                } else {
                    focusSearchInput(true);
                }
                return;
            }

            if (ctrl && !event.shiftKey && (key === 'f' || key === 'F')) {
                event.preventDefault();
                if (isDolphin() && typeof global.openDolphinSearchBar === 'function') {
                    global.openDolphinSearchBar();
                } else if (typeof global.setNautilusChromeMode === 'function') {
                    global.setNautilusChromeMode('search-folder');
                } else {
                    focusSearchInput(true);
                }
                return;
            }

            if (ctrl && !event.shiftKey && (key === 'h' || key === 'H')) {
                event.preventDefault();
                if (typeof global.toggleExplorerHiddenFiles === 'function') {
                    global.toggleExplorerHiddenFiles();
                }
                return;
            }

            if (!isDolphin() && ctrl && !event.shiftKey && key === '1') {
                event.preventDefault();
                if (typeof global.setFileExplorerViewMode === 'function') {
                    global.setFileExplorerViewMode('icons');
                }
                return;
            }

            if (!isDolphin() && ctrl && !event.shiftKey && key === '2') {
                event.preventDefault();
                if (typeof global.setFileExplorerViewMode === 'function') {
                    global.setFileExplorerViewMode('list');
                }
                return;
            }

            if (ctrl && event.shiftKey && (key === 'n' || key === 'N')) {
                event.preventDefault();
                if (typeof global.createNewFolderInCurrentDirectory === 'function') {
                    global.createNewFolderInCurrentDirectory();
                }
                return;
            }

            if (!isDolphin() && ctrl && !event.shiftKey && (key === 't' || key === 'T')) {
                event.preventDefault();
                if (typeof global.openNautilusTab === 'function') {
                    const root = typeof global.getFileExplorerRoot === 'function'
                        ? global.getFileExplorerRoot()
                        : null;
                    global.openNautilusTab(root);
                }
                return;
            }

            if (!isDolphin() && ctrl && !event.shiftKey && (key === 'n' || key === 'N')) {
                event.preventDefault();
                if (typeof global.openNewWindowByDataLink === 'function') {
                    global.openNewWindowByDataLink('nemo');
                } else if (typeof global.openWindowByDataLink === 'function') {
                    global.openWindowByDataLink('nemo', { newWindow: true });
                }
                return;
            }

            if (!isDolphin() && ctrl && !event.shiftKey && (key === 'd' || key === 'D')) {
                event.preventDefault();
                if (typeof global.addNautilusBookmark === 'function') {
                    global.addNautilusBookmark();
                }
                return;
            }

            if (ctrl && event.altKey && !event.shiftKey && (key === 'c' || key === 'C')) {
                event.preventDefault();
                if (typeof global.copyExplorerSelectionLocation === 'function') {
                    global.copyExplorerSelectionLocation().then((result) => {
                        if (typeof global.setExplorerStatusMessage !== 'function') {
                            return;
                        }
                        if (result && result.ok) {
                            global.setExplorerStatusMessage(`Emplacement copié : ${result.path}`);
                        } else if (result && result.message) {
                            global.setExplorerStatusMessage(result.message);
                        }
                    });
                }
                return;
            }

            if (ctrl && !event.shiftKey && (key === 'c' || key === 'C')) {
                event.preventDefault();
                if (typeof global.copyExplorerSelection === 'function') {
                    global.copyExplorerSelection();
                }
                return;
            }

            if (ctrl && !event.shiftKey && (key === 'x' || key === 'X')) {
                event.preventDefault();
                if (typeof global.cutExplorerSelection === 'function') {
                    global.cutExplorerSelection();
                }
                return;
            }

            if (ctrl && !event.shiftKey && (key === 'v' || key === 'V')) {
                event.preventDefault();
                if (typeof global.pasteExplorerClipboard === 'function') {
                    global.pasteExplorerClipboard();
                }
                return;
            }

            if (ctrl && !event.shiftKey && (key === 'a' || key === 'A')) {
                event.preventDefault();
                const grid = win.querySelector('.nemoElement, .nemo-app__content-grid');
                if (grid) {
                    grid.querySelectorAll('a[data-item-name]').forEach((link) => {
                        link.classList.add('nemo-app__item--selected');
                    });
                }
                return;
            }

            if (ctrl && event.shiftKey && (key === 'z' || key === 'Z')) {
                event.preventDefault();
                if (typeof global.redoExplorerOperation === 'function') {
                    global.redoExplorerOperation();
                }
                return;
            }

            if (ctrl && !event.shiftKey && (key === 'z' || key === 'Z')) {
                event.preventDefault();
                if (typeof global.undoExplorerOperation === 'function') {
                    global.undoExplorerOperation();
                }
                return;
            }

            if (key === 'F2') {
                if (event.target && event.target.closest('.nemo-app__item-rename-input')) {
                    return;
                }
                if (global.document.querySelector('.nemo-app__item--renaming')) {
                    return;
                }
                event.preventDefault();
                if (typeof global.renameExplorerSelection === 'function') {
                    global.renameExplorerSelection();
                }
                return;
            }

            const openSelectedExplorerProperties = () => {
                const selected = win.querySelector('a.nemo-app__item--selected[data-item-name]');
                let item = null;
                if (selected && selected.dataset) {
                    item = {
                        name: selected.dataset.itemName,
                        type: selected.dataset.itemType || 'file',
                        folderPath: selected.dataset.itemFolderPath || '',
                        targetPath: selected.dataset.itemTargetPath || '',
                        href: selected.dataset.itemHref || '',
                    };
                }
                if (typeof global.openExplorerProperties === 'function') {
                    global.openExplorerProperties(item);
                }
            };

            if (event.altKey && !ctrl && !event.shiftKey
                && (key === 'Enter' || key === 'Backspace' || key === 'BrowserBack')) {
                event.preventDefault();
                openSelectedExplorerProperties();
                return;
            }

            if (key === 'Delete') {
                event.preventDefault();
                if (typeof global.trashExplorerSelection === 'function') {
                    global.trashExplorerSelection();
                }
            }

            if (ctrl && (key === '+' || key === '=')) {
                event.preventDefault();
                adjustZoom(10);
                return;
            }

            if (ctrl && key === '-') {
                event.preventDefault();
                adjustZoom(-10);
                return;
            }

            if (key === 'F5') {
                event.preventDefault();
                if (typeof global.refreshFileExplorerDirectory === 'function') {
                    global.refreshFileExplorerDirectory();
                }
            }
        });

        root.dataset.nautilusKeyboardInit = 'true';
    };

    const bindNewFolderButton = (root) => {
        const btn = root.querySelector('.nautilus-app__new-folder-btn');
        if (!btn || btn.dataset.nautilusNewFolderBound === 'true') {
            return;
        }
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof global.createNewFolderInCurrentDirectory === 'function') {
                global.createNewFolderInCurrentDirectory();
            }
        });
        btn.dataset.nautilusNewFolderBound = 'true';
    };

    const bindLocationBar = (root) => {
        const input = root.querySelector('#nemo-search-input');
        if (!input || input.dataset.nautilusLocationBound === 'true') {
            return;
        }

        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') {
                return;
            }
            const value = String(input.value || '').trim();
            if (!value || (!value.startsWith('/') && !value.startsWith('~'))) {
                return;
            }
            const navigated = navigateFromLocationInput(value);
            if (!navigated) {
                return;
            }
            event.preventDefault();
            if (global.fileExplorerState) {
                global.fileExplorerState.searchQuery = '';
            }
            input.value = '';
            if (typeof global.renderDirectory === 'function' && global.fileExplorerState) {
                global.renderDirectory(global.fileExplorerState.currentPath, {
                    pane: global.fileExplorerState.activePane || 'primary'
                });
            }
            if (typeof global.setNautilusChromeMode === 'function') {
                global.setNautilusChromeMode('breadcrumb');
            }
            if (typeof global.updatePathDisplay === 'function') {
                global.updatePathDisplay();
            }
        });

        input.dataset.nautilusLocationBound = 'true';
    };

    const bindNetworkPlaceChrome = (root) => {
        const input = root.querySelector('#nautilus-network-input');
        const connect = root.querySelector('#nautilus-network-connect');
        const infoBtn = root.querySelector('#nautilus-network-info');
        const infoMenu = root.querySelector('#nautilus-network-info-menu');
        if (!input || !connect || input.dataset.nautilusNetworkBound === 'true') {
            return;
        }

        const syncConnectState = () => {
            connect.disabled = !String(input.value || '').trim();
        };

        input.addEventListener('input', syncConnectState);
        connect.addEventListener('click', (event) => {
            event.preventDefault();
            const value = String(input.value || '').trim();
            if (!value) {
                return;
            }
            if (typeof global.connectNautilusNetworkServer === 'function') {
                global.connectNautilusNetworkServer(value);
            }
            input.value = '';
            syncConnectState();
        });

        if (infoBtn && infoMenu && infoBtn.dataset.nautilusNetworkInfoBound !== 'true') {
            infoBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const rect = infoBtn.getBoundingClientRect();
                infoMenu.hidden = !infoMenu.hidden;
                if (!infoMenu.hidden) {
                    infoMenu.style.left = `${Math.max(8, rect.left - 280)}px`;
                    infoMenu.style.top = `${Math.max(8, rect.top - infoMenu.offsetHeight - 8)}px`;
                }
            });
            global.document.addEventListener('click', (event) => {
                if (!infoMenu.hidden && !infoMenu.contains(event.target) && event.target !== infoBtn) {
                    infoMenu.hidden = true;
                }
            });
            infoBtn.dataset.nautilusNetworkInfoBound = 'true';
        }

        input.dataset.nautilusNetworkBound = 'true';
        syncConnectState();
    };

    const resolveNautilusGnomePlace = () => {
        const state = global.fileExplorerState;
        const path = state && state.currentPath ? String(state.currentPath) : '';
        const root = typeof global.getFileExplorerRoot === 'function'
            ? global.getFileExplorerRoot()
            : 'home/public';
        if (path === global.CAPSULE_PLACE_STARRED) {
            return 'starred';
        }
        if (path === global.CAPSULE_PLACE_NETWORK) {
            return 'network';
        }
        if (path === global.CAPSULE_PLACE_TRASH) {
            return 'trash';
        }
        if (path === global.CAPSULE_PLACE_RECENT) {
            return 'recent';
        }
        if (path.endsWith('/Documents')) {
            return 'documents';
        }
        if (path.endsWith('/Téléchargements') || path.endsWith('/Downloads')) {
            return 'downloads';
        }
        if (path.endsWith('/Bureau') || path.endsWith('/Desktop')) {
            return 'desktop';
        }
        if (path === root || path.endsWith('/public')) {
            return 'home';
        }
        return 'folder';
    };

    const syncNautilusGnomeDataset = () => {
        const root = getNemoRoot();
        if (!root || !isNautilusGnome()) {
            return;
        }
        const state = global.fileExplorerState || {};
        const place = resolveNautilusGnomePlace();
        const chromeMode = state.nautilusChromeMode || 'breadcrumb';
        const markers = [
            root,
            root.querySelector('[data-nautilus-gnome-root]'),
        ].filter(Boolean);
        markers.forEach((node) => {
            node.dataset.nautilusGnomeInit = 'true';
            node.dataset.nautilusGnomePlace = place;
            node.dataset.nautilusGnomeChromeMode = chromeMode;
        });
        const crumb = root.querySelector('[data-nautilus-gnome-path-crumbbar]');
        if (crumb) {
            crumb.hidden = chromeMode === 'search-everywhere'
                || chromeMode === 'search-folder';
        }
    };

    function bindFileExplorerNautilusFeatures() {
        const root = getNemoRoot();
        if (!root) {
            return;
        }
        if (isNautilusGnome()) {
            bindNewFolderButton(root);
            bindLocationBar(root);
            bindNetworkPlaceChrome(root);
            syncNautilusGnomeDataset();
        }
        if (usesAdvancedExplorerOps()) {
            bindKeyboardShortcuts(root);
        }
    }

    global.bindFileExplorerNautilusFeatures = bindFileExplorerNautilusFeatures;
    global.syncNautilusGnomeDataset = syncNautilusGnomeDataset;
    global.resolvePathFromLocationInput = resolvePathFromLocationInput;
}(typeof window !== 'undefined' ? window : globalThis));
