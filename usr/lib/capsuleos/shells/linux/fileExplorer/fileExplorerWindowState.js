/**
 * État explorateur isolé par fenêtre Nautilus — bascule sur focus / nouvelle instance.
 */
(function initFileExplorerWindowState(global) {
    'use strict';

    let activeNemoRoot = null;

    const getLiveState = () => global.fileExplorerState || null;

    const getContentRoot = () => {
        if (typeof global.getFileExplorerRoot === 'function') {
            return global.getFileExplorerRoot();
        }
        if (global.CAPSULE_CONTENT_ROOT) {
            return String(global.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
        }
        return 'home/public';
    };

    const cloneExplorerState = (source) => {
        const contentRoot = getContentRoot();
        const src = source || {};
        const clone = {
            manifest: src.manifest || null,
            manifestPromise: src.manifestPromise || null,
            history: Array.isArray(src.history) && src.history.length ? src.history.slice() : [contentRoot],
            historyIndex: typeof src.historyIndex === 'number'
                ? src.historyIndex
                : (Array.isArray(src.history) && src.history.length ? src.history.length - 1 : 0),
            currentPath: src.currentPath || contentRoot,
            secondaryPath: src.secondaryPath || contentRoot,
            secondaryHistory: Array.isArray(src.secondaryHistory) ? src.secondaryHistory.slice() : [],
            secondaryHistoryIndex: typeof src.secondaryHistoryIndex === 'number' ? src.secondaryHistoryIndex : -1,
            zoomValue: src.zoomValue,
            viewMode: src.viewMode || 'icons',
            searchQuery: src.searchQuery || '',
            showHiddenFiles: !!src.showHiddenFiles,
            searchFilter: src.searchFilter || 'all',
            searchMode: src.searchMode || 'fulltext',
            sortOrder: src.sortOrder || 'name-asc',
            nautilusChromeMode: src.nautilusChromeMode || 'breadcrumb',
            locationBarMode: src.locationBarMode || 'search',
            explorerClipboard: src.explorerClipboard ? Object.assign({}, src.explorerClipboard) : null,
            explorerUndoStack: Array.isArray(src.explorerUndoStack) ? src.explorerUndoStack.slice() : [],
            explorerRedoStack: Array.isArray(src.explorerRedoStack) ? src.explorerRedoStack.slice() : [],
            previewOpen: !!src.previewOpen,
            splitView: !!src.splitView,
            activePane: src.activePane || 'primary',
            selectedPreview: src.selectedPreview || null,
            pathNavigationMode: src.pathNavigationMode || 'label',
        };
        if (Array.isArray(src.tabs)) {
            clone.tabs = src.tabs.map((tab) => Object.assign({}, tab, {
                history: Array.isArray(tab.history) ? tab.history.slice() : [tab.path],
            }));
            clone.activeTabId = src.activeTabId;
        }
        return clone;
    };

    const createFreshExplorerState = () => {
        const contentRoot = getContentRoot();
        const live = getLiveState();
        return cloneExplorerState({
            manifest: live && live.manifest,
            manifestPromise: live && live.manifestPromise,
            currentPath: contentRoot,
            secondaryPath: contentRoot,
            history: [contentRoot],
            historyIndex: 0,
        });
    };

    const replaceObjectState = (target, source) => {
        if (!target || !source) {
            return;
        }
        Object.keys(target).forEach((key) => {
            if (!(key in source)) {
                delete target[key];
            }
        });
        Object.assign(target, source);
    };

    const captureActiveExplorerState = () => {
        const live = getLiveState();
        if (!live || !activeNemoRoot) {
            return;
        }
        activeNemoRoot.__capsuleFileExplorerStateSnapshot = cloneExplorerState(live);
    };

    const restoreExplorerStateFromRoot = (root) => {
        const live = getLiveState();
        if (!live || !root) {
            return;
        }
        const snapshot = root.__capsuleFileExplorerStateSnapshot || createFreshExplorerState();
        root.__capsuleFileExplorerStateSnapshot = snapshot;
        replaceObjectState(live, snapshot);
        global.fileExplorerState = live;
    };

    async function refreshExplorerViewForRoot(root) {
        const live = getLiveState();
        if (!live || !root || !live.currentPath) {
            return;
        }
        if (typeof global.navigateToFileExplorerDirectory === 'function') {
            await global.navigateToFileExplorerDirectory(live.currentPath, {
                updateHistory: false,
                explorerRoot: root,
            });
        } else if (typeof global.renderDirectory === 'function') {
            global.renderDirectory(live.currentPath, {
                pane: live.activePane || 'primary',
                explorerRoot: root,
            });
        }
        if (typeof global.updatePathDisplay === 'function') {
            global.updatePathDisplay();
        }
        if (typeof global.updateNavigationControls === 'function') {
            global.updateNavigationControls();
        }
        if (typeof global.applyFileExplorerViewMode === 'function') {
            global.applyFileExplorerViewMode();
        }
        if (typeof global.applyNautilusLocationBarMode === 'function') {
            global.applyNautilusLocationBarMode();
        }
        if (typeof global.bindFileExplorerTabs === 'function') {
            await global.bindFileExplorerTabs();
        }
    }

    function activateExplorerWindowSync(root) {
        if (!root || root.dataset.link !== 'nemo') {
            return false;
        }
        if (activeNemoRoot === root) {
            return false;
        }
        captureActiveExplorerState();
        activeNemoRoot = root;
        restoreExplorerStateFromRoot(root);
        return true;
    }

    async function activateExplorerWindow(root) {
        if (!root || root.dataset.link !== 'nemo') {
            return;
        }
        const changed = activateExplorerWindowSync(root);
        if (!changed) {
            return;
        }
        await refreshExplorerViewForRoot(root);
    }

    function initExplorerWindowInstance(root) {
        if (!root || root.dataset.link !== 'nemo') {
            return;
        }
        const isSecondary = !!root.dataset.capsuleWindowInstance;
        if (isSecondary) {
            captureActiveExplorerState();
            root.__capsuleFileExplorerStateSnapshot = createFreshExplorerState();
            activeNemoRoot = root;
            restoreExplorerStateFromRoot(root);
            return;
        }
        if (!root.__capsuleFileExplorerStateSnapshot) {
            const live = getLiveState();
            root.__capsuleFileExplorerStateSnapshot = live
                ? cloneExplorerState(live)
                : createFreshExplorerState();
        }
        activeNemoRoot = root;
    }

    function releaseExplorerWindowInstance(root) {
        if (!root || activeNemoRoot !== root) {
            return;
        }
        captureActiveExplorerState();
        activeNemoRoot = null;
        const primary = global.document.getElementById('nemo')
            || global.document.querySelector('.windowElement[data-link="nemo"]:not([data-capsule-window-instance])');
        if (primary && primary !== root && primary.style.display !== 'none') {
            activateExplorerWindow(primary);
        }
    }

    global.initExplorerWindowInstance = initExplorerWindowInstance;
    global.activateExplorerWindow = activateExplorerWindow;
    global.activateExplorerWindowSync = activateExplorerWindowSync;
    global.releaseExplorerWindowInstance = releaseExplorerWindowInstance;
    global.captureActiveExplorerState = captureActiveExplorerState;
    global.getActiveExplorerWindowRoot = () => activeNemoRoot;

    if (global.document) {
        global.document.addEventListener('mousedown', (event) => {
            const root = event.target.closest('.windowElement[data-link="nemo"]');
            if (!root || root.style.display === 'none') {
                return;
            }
            activateExplorerWindowSync(root);
        }, true);

        global.document.addEventListener('capsule:window-focused', (event) => {
            const detail = event.detail || {};
            if (detail.slotId === 'nemo' && detail.container) {
                activateExplorerWindow(detail.container);
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
