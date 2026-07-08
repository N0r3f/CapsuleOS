/**
 * Dialogue Propriétés — Nautilus GNOME (fichier ou emplacement courant).
 */
(function initFileExplorerProperties(global) {
    'use strict';

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

    const setField = (root, id, value) => {
        const node = root.querySelector(id);
        if (node) {
            node.textContent = value || '—';
        }
    };

    const countFolderItems = (folderPath) => {
        const manifest = global.fileExplorerState && global.fileExplorerState.manifest;
        if (!manifest || !manifest.folders || !folderPath) {
            return null;
        }
        const node = manifest.folders[folderPath];
        if (!node || !Array.isArray(node.items)) {
            return 0;
        }
        return node.items.length;
    };

    const formatLocation = (path, item) => {
        if (item && item.targetPath) {
            return item.targetPath;
        }
        if (item && item.folderPath) {
            return `${item.folderPath}/${item.name}`;
        }
        return path || '—';
    };

    function openExplorerProperties(item) {
        const root = getNemoRoot();
        const dialog = root && root.querySelector('#nemo-properties-dialog');
        if (!dialog) {
            return false;
        }

        const state = global.fileExplorerState || {};
        const currentPath = state.currentPath || '';
        const isFolder = !item || item.type === 'folder';
        const name = item ? item.name : resolveTabTitle(currentPath);
        const location = formatLocation(currentPath, item);
        let contentLabel = '—';
        let modifiedLabel = '—';

        if (item && item.type === 'folder' && item.targetPath) {
            const count = countFolderItems(item.targetPath);
            if (count != null) {
                contentLabel = `${count} élément${count > 1 ? 's' : ''}`;
            }
        } else if (!item && currentPath && !(global.isCapsuleVirtualPlace && global.isCapsuleVirtualPlace(currentPath))) {
            const count = countFolderItems(currentPath);
            if (count != null) {
                contentLabel = `${count} élément${count > 1 ? 's' : ''}`;
            }
        } else if (item && item.type !== 'folder') {
            contentLabel = '1 fichier';
        }

        if (typeof global.formatCosmicModifiedLabel === 'function') {
            modifiedLabel = global.formatCosmicModifiedLabel();
        }

        setField(root, '#nemo-properties-name', name);
        setField(root, '#nemo-properties-type', isFolder ? 'Dossier' : 'Fichier');
        setField(root, '#nemo-properties-location', location);
        setField(root, '#nemo-properties-size', contentLabel);
        setField(root, '#nemo-properties-modified', modifiedLabel);

        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.removeAttribute('hidden');
        }
        return true;
    }

    function resolveTabTitle(path) {
        if (path === global.CAPSULE_PLACE_RECENT) {
            return 'Récents';
        }
        if (path === global.CAPSULE_PLACE_STARRED) {
            return 'Favoris';
        }
        if (path === global.CAPSULE_PLACE_TRASH) {
            return 'Corbeille';
        }
        if (path === global.CAPSULE_PLACE_NETWORK) {
            return 'Réseau';
        }
        const root = typeof global.getFileExplorerRoot === 'function'
            ? global.getFileExplorerRoot()
            : '';
        if (path === root) {
            return 'Dossier personnel';
        }
        if (typeof path === 'string') {
            const parts = path.split('/');
            return parts[parts.length - 1] || 'Dossier';
        }
        return 'Dossier';
    }

    const usesNemoProperties = () => (
        typeof global.isNemoTemplate === 'function' && global.isNemoTemplate()
    );

    function bindFileExplorerProperties() {
        if (!usesAdvancedExplorerOps() && !usesNemoProperties()) {
            return;
        }
        const root = getNemoRoot();
        const dialog = root && root.querySelector('#nemo-properties-dialog');
        if (!root || !dialog || root.dataset.nemoPropertiesInit === 'true') {
            return;
        }
        dialog.addEventListener('close', () => {
            dialog.removeAttribute('open');
        });
        root.dataset.nemoPropertiesInit = 'true';
    }

    global.openExplorerProperties = openExplorerProperties;
    global.bindFileExplorerProperties = bindFileExplorerProperties;
}(typeof window !== 'undefined' ? window : globalThis));
