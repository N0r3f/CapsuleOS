/**
 * Glisser-déposer HTML5 pour l’explorateur (Nemo / Dolphin).
 * Maintenir Ctrl pendant le drop pour copier au lieu de déplacer.
 */
(function initFileExplorerDnD(global) {
    'use strict';

    const DRAG_MIME = 'application/x-capsule-explorer-item';

    let dragPayload = null;

    const parseDragPayload = (event) => {
        const raw = event.dataTransfer.getData(DRAG_MIME);
        if (!raw) {
            return dragPayload;
        }
        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    };

    const clearDropTargets = (root) => {
        root.querySelectorAll('.nemo-app__drop-target').forEach((el) => {
            el.classList.remove('nemo-app__drop-target');
        });
    };

    const resolveDropFolderPath = (target) => {
        const sidebarLink = target.closest('.dolphin-sidebar__link[data-link]');
        if (sidebarLink) {
            const rootPath = typeof global.getFileExplorerRoot === 'function'
                ? String(global.getFileExplorerRoot()).replace(/\/+$/, '')
                : String(global.CAPSULE_CONTENT_ROOT || '').replace(/\/+$/, '');
            const folderMap = {
                'Dossier Personnel': rootPath,
                'Dossier personnel': rootPath,
                'Bureau': `${rootPath}/Bureau`,
                'Documents': `${rootPath}/Documents`,
                'Musique': `${rootPath}/Musique`,
                'Images': `${rootPath}/Images`,
                'Vidéos': `${rootPath}/Vidéos`,
                'Téléchargements': `${rootPath}/Téléchargements`,
            };
            const key = sidebarLink.getAttribute('data-link');
            if (key && folderMap[key] && typeof global.normalizeDirectoryPathForExplorer === 'function') {
                return global.normalizeDirectoryPathForExplorer(folderMap[key]);
            }
        }

        const grid = target.closest('.nemoElement, .nemo-app__content-grid');
        if (grid && grid.dataset.dropFolderPath) {
            return grid.dataset.dropFolderPath;
        }
        const folderLink = target.closest('a[data-item-type="folder"][data-item-target-path]');
        if (folderLink) {
            return folderLink.dataset.itemTargetPath;
        }
        if (typeof global.fileExplorerState !== 'undefined' && global.fileExplorerState) {
            const pane = global.fileExplorerState.activePane || 'primary';
            if (pane === 'secondary' && global.fileExplorerState.secondaryPath) {
                return global.fileExplorerState.secondaryPath;
            }
            return global.fileExplorerState.currentPath;
        }
        return null;
    };

    const bindDraggableItems = (root) => {
        root.querySelectorAll('a[data-item-name][data-item-folder-path]').forEach((link) => {
            if (link.dataset.feDnDInit === 'true') {
                return;
            }
            link.setAttribute('draggable', 'true');
            link.addEventListener('dragstart', (event) => {
                const payload = {
                    name: link.dataset.itemName,
                    type: link.dataset.itemType || 'file',
                    sourceFolderPath: link.dataset.itemFolderPath,
                    targetPath: link.dataset.itemTargetPath || null,
                };
                dragPayload = payload;
                event.dataTransfer.effectAllowed = 'copyMove';
                event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
                link.classList.add('nemo-app__item--dragging');
            });
            link.addEventListener('dragend', () => {
                dragPayload = null;
                link.classList.remove('nemo-app__item--dragging');
                clearDropTargets(root);
            });
            link.dataset.feDnDInit = 'true';
        });
    };

    const bindDropZone = (zone) => {
        if (!zone || zone.dataset.feDropInit === 'true') {
            return;
        }

        zone.addEventListener('dragover', (event) => {
            if (!event.dataTransfer.types.includes(DRAG_MIME)) {
                return;
            }
            event.preventDefault();
            event.dataTransfer.dropEffect = event.ctrlKey ? 'copy' : 'move';
            zone.classList.add('nemo-app__drop-target');
        });

        zone.addEventListener('dragleave', (event) => {
            if (!zone.contains(event.relatedTarget)) {
                zone.classList.remove('nemo-app__drop-target');
            }
        });

        zone.addEventListener('drop', async (event) => {
            event.preventDefault();
            clearDropTargets(rootFromZone(zone));

            const payload = parseDragPayload(event);
            if (!(payload == null ? void 0 : payload.name) || !payload.sourceFolderPath) {
                return;
            }

            const destPath = resolveDropFolderPath(event.target);
            if (!destPath) {
                return;
            }

            const copyMode = event.ctrlKey === true;
            const handler = copyMode ? global.copyExplorerItem : global.moveExplorerItem;
            if (typeof handler !== 'function') {
                return;
            }

            const result = await handler(payload.sourceFolderPath, payload.name, destPath);
            if (result && result.ok === false && result.message) {
                console.warn(`CapsuleOS explorateur: ${result.message}`);
            }
        });

        zone.dataset.feDropInit = 'true';
    };

    const rootFromZone = (zone) => {
        const slotSelector = (typeof window !== 'undefined' && window.EXPLORER_WINDOW_SLOT_SELECTOR)
            ? window.EXPLORER_WINDOW_SLOT_SELECTOR
            : 'div.windowElement#nemo[data-link="nemo"]';
        return zone.closest('#nemo') || zone.closest(slotSelector) || document;
    };

    const syncDropFolderPaths = (root) => {
        const current =(global.fileExplorerState == null ? void 0 : global.fileExplorerState.currentPath);
        const secondary =(global.fileExplorerState == null ? void 0 : global.fileExplorerState.secondaryPath);
        root.querySelectorAll('.nemoElement[data-pane="primary"], .nemoElement:not([data-pane])').forEach((grid) => {
            if (current) {
                grid.dataset.dropFolderPath = current;
            }
        });
        root.querySelectorAll('.nemoElement[data-pane="secondary"]').forEach((grid) => {
            if (secondary) {
                grid.dataset.dropFolderPath = secondary;
            }
        });
    };

    function initFileExplorerDnD() {
        const root = (typeof window.getExplorerWindowSlot === 'function')
            ? window.getExplorerWindowSlot()
            : (document.getElementById('nemo')
                || document.querySelector('div.windowElement#nemo[data-link="nemo"]'));
        if (!root || root.dataset.feDnDRootInit === 'true') {
            return;
        }

        syncDropFolderPaths(root);
        bindDraggableItems(root);
        root.querySelectorAll('.nemoElement, .nemo-app__content-grid').forEach(bindDropZone);
        root.querySelectorAll('a[data-item-type="folder"]').forEach(bindDropZone);
        root.querySelectorAll('.dolphin-sidebar__link[data-link], .nemo-app__sidebar a[data-link]').forEach((link) => {
            bindDropZone(link);
        });

        const observer = new MutationObserver(() => {
            syncDropFolderPaths(root);
            bindDraggableItems(root);
            root.querySelectorAll('.nemoElement, .nemo-app__content-grid').forEach(bindDropZone);
            root.querySelectorAll('.dolphin-sidebar__link[data-link], .nemo-app__sidebar a[data-link]').forEach((link) => {
                bindDropZone(link);
            });
        });
        observer.observe(root, { childList: true, subtree: true });

        root.dataset.feDnDRootInit = 'true';
    }

    global.initFileExplorerDnD = initFileExplorerDnD;
}(typeof window !== 'undefined' ? window : globalThis));
