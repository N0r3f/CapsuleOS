/**
 * Pont terminal ↔ manifeste explorateur (source de vérité utilisateur partagée).
 */
(function initCapsuleUserFs(global) {
    'use strict';

    function normalizeDirectoryPath(path) {
        if (typeof global.normalizeDirectoryPathForExplorer === 'function') {
            return global.normalizeDirectoryPathForExplorer(path);
        }
        return String(path || '').replace(/\\/g, '/').replace(/\/+$/, '');
    }

    function joinExplorerPath(parentPath, name) {
        const parent = normalizeDirectoryPath(parentPath);
        const segment = String(name || '').trim().replace(/[/\\]+/g, '');
        if (!segment || segment === '.' || segment === '..') {
            return null;
        }
        return `${parent}/${segment}`;
    }

    function findItemInFolder(folderNode, itemName) {
        if (!folderNode || !Array.isArray(folderNode.items)) {
            return null;
        }
        return folderNode.items.find((entry) => entry.name === itemName) || null;
    }

    function removeItemFromFolder(folderNode, itemName) {
        if (!folderNode || !Array.isArray(folderNode.items)) {
            return null;
        }
        const index = folderNode.items.findIndex((entry) => entry.name === itemName);
        if (index === -1) {
            return null;
        }
        const [removed] = folderNode.items.splice(index, 1);
        folderNode.items = sortExplorerItems(folderNode.items);
        return removed;
    }

    function sortExplorerItems(items) {
        if (!Array.isArray(items)) {
            return [];
        }
        return items.slice().sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
            }
            return String(a.name).localeCompare(String(b.name), 'fr', { sensitivity: 'base' });
        });
    }

    function deleteFolderSubtree(manifest, folderPath) {
        const normalized = normalizeDirectoryPath(folderPath);
        if (!normalized || !manifest.folders) {
            return;
        }
        delete manifest.folders[normalized];
        Object.keys(manifest.folders).forEach((key) => {
            if (key.startsWith(`${normalized}/`)) {
                delete manifest.folders[key];
            }
        });
    }

    function relocateFolderSubtree(manifest, oldPath, newPath) {
        const oldKey = normalizeDirectoryPath(oldPath);
        const newKey = normalizeDirectoryPath(newPath);
        if (!manifest.folders[oldKey]) {
            return;
        }
        manifest.folders[newKey] = manifest.folders[oldKey];
        delete manifest.folders[oldKey];
        manifest.folders[newKey].label = newKey.split('/').pop();

        Object.keys(manifest.folders).forEach((key) => {
            if (key.startsWith(`${oldKey}/`)) {
                const suffix = key.slice(oldKey.length);
                manifest.folders[`${newKey}${suffix}`] = manifest.folders[key];
                delete manifest.folders[key];
            }
        });

        Object.values(manifest.folders).forEach((folder) => {
            if (!Array.isArray(folder.items)) {
                return;
            }
            folder.items.forEach((item) => {
                if (item.type === 'folder' && item.path && item.path.startsWith(`${oldKey}/`)) {
                    item.path = `${newKey}${item.path.slice(oldKey.length)}`;
                }
            });
        });
    }

    function buildFileItem(fileName) {
        const dot = fileName.lastIndexOf('.');
        const extension = dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
        return {
            type: 'file',
            name: fileName,
            extension,
            href: '#'
        };
    }

    function resolveParentManifestPath(cwd) {
        const vfs = global.CapsuleExplorerVfs;
        if (!vfs || typeof vfs.resolveManifestPathFromTerminal !== 'function') {
            return null;
        }
        const normalized = typeof vfs.normalizeTerminalPath === 'function'
            ? vfs.normalizeTerminalPath(cwd)
            : String(cwd || '/');
        return vfs.resolveManifestPathFromTerminal(normalized);
    }

    async function ensureExplorerManifest() {
        if (typeof global.loadManifestForFileExplorer === 'function') {
            await global.loadManifestForFileExplorer();
        }
        const manifest = global.fileExplorerState && global.fileExplorerState.manifest;
        if (!manifest || !manifest.folders) {
            return null;
        }
        return manifest;
    }

    function applyMutation(manifest, affectedParents, meta) {
        if (typeof global.persistExplorerManifest === 'function') {
            global.persistExplorerManifest(manifest);
        }
        if (typeof global.dispatchEvent === 'function') {
            global.dispatchEvent(new CustomEvent('capsule:fs-changed', {
                detail: {
                    op: meta && meta.op,
                    affectedParents: Array.from(affectedParents || []),
                    source: (meta && meta.source) || 'terminal'
                }
            }));
        }
    }

    async function applyTerminalMutation(manifest, parentPath, payload) {
        const parent = normalizeDirectoryPath(parentPath);
        const parentNode = manifest.folders[parent];
        if (!parentNode || !Array.isArray(parentNode.items)) {
            return { ok: false, reason: 'parent-missing' };
        }

        const affectedParents = new Set([parent]);
        const op = payload.op;

        if (op === 'touch') {
            const fileName = String(payload.name || '').trim();
            if (!fileName || findItemInFolder(parentNode, fileName)) {
                return { ok: true, skipped: true };
            }
            parentNode.items.push(buildFileItem(fileName));
            parentNode.items = sortExplorerItems(parentNode.items);
            applyMutation(manifest, affectedParents, payload);
            return { ok: true };
        }

        if (op === 'mkdir') {
            const folderName = String(payload.name || '').trim();
            const newPath = joinExplorerPath(parent, folderName);
            if (!folderName || !newPath || manifest.folders[newPath] || findItemInFolder(parentNode, folderName)) {
                return { ok: true, skipped: true };
            }
            parentNode.items.push({ type: 'folder', name: folderName, path: newPath });
            parentNode.items = sortExplorerItems(parentNode.items);
            manifest.folders[newPath] = { label: folderName, items: [] };
            applyMutation(manifest, affectedParents, payload);
            return { ok: true };
        }

        if (op === 'rm' || op === 'rmdir') {
            const itemName = String(payload.name || '').trim();
            const removed = removeItemFromFolder(parentNode, itemName);
            if (!removed) {
                return { ok: true, skipped: true };
            }
            if (removed.type === 'folder' && removed.path) {
                deleteFolderSubtree(manifest, removed.path);
            }
            applyMutation(manifest, affectedParents, payload);
            return { ok: true };
        }

        if (op === 'cp') {
            const sourceName = String(payload.source || '').trim();
            const destName = String(payload.dest || '').trim();
            if (!sourceName || !destName || sourceName === destName) {
                return { ok: false, reason: 'invalid-cp' };
            }
            const sourceItem = findItemInFolder(parentNode, sourceName);
            if (!sourceItem || findItemInFolder(parentNode, destName)) {
                return { ok: true, skipped: true };
            }
            if (sourceItem.type === 'file') {
                parentNode.items.push(buildFileItem(destName));
                parentNode.items = sortExplorerItems(parentNode.items);
                applyMutation(manifest, affectedParents, payload);
                return { ok: true };
            }
            if (sourceItem.type === 'folder' && sourceItem.path) {
                const newPath = joinExplorerPath(parent, destName);
                if (!newPath || manifest.folders[newPath]) {
                    return { ok: true, skipped: true };
                }
                const sourceFolder = manifest.folders[sourceItem.path];
                parentNode.items.push({ type: 'folder', name: destName, path: newPath });
                manifest.folders[newPath] = {
                    label: destName,
                    items: sourceFolder && Array.isArray(sourceFolder.items)
                        ? JSON.parse(JSON.stringify(sourceFolder.items))
                        : [],
                };
                parentNode.items = sortExplorerItems(parentNode.items);
                applyMutation(manifest, affectedParents, payload);
                return { ok: true };
            }
            return { ok: true, skipped: true };
        }

        if (op === 'mv') {
            const sourceName = String(payload.source || '').trim();
            const destName = String(payload.dest || payload.name || '').trim();
            if (!sourceName || !destName || sourceName === destName) {
                return { ok: false, reason: 'invalid-mv' };
            }
            const item = findItemInFolder(parentNode, sourceName);
            if (!item) {
                return { ok: true, skipped: true };
            }
            if (findItemInFolder(parentNode, destName)) {
                return { ok: true, skipped: true };
            }

            item.name = destName;
            if (item.type === 'folder' && item.path) {
                const newPath = joinExplorerPath(parent, destName);
                if (newPath) {
                    relocateFolderSubtree(manifest, item.path, newPath);
                    item.path = newPath;
                }
            } else if (item.type === 'file') {
                const dot = destName.lastIndexOf('.');
                if (dot > 0) {
                    item.extension = destName.slice(dot + 1).toLowerCase();
                } else if (item.extension) {
                    delete item.extension;
                }
            }
            parentNode.items = sortExplorerItems(parentNode.items);
            applyMutation(manifest, affectedParents, payload);
            return { ok: true };
        }

        return { ok: false, reason: 'unknown-op' };
    }

    async function syncFromTerminal(payload) {
        const data = payload || {};
        const parentManifestPath = resolveParentManifestPath(data.cwd);
        if (!parentManifestPath) {
            return { ok: false, reason: 'outside-manifest' };
        }

        const manifest = await ensureExplorerManifest();
        if (!manifest) {
            return { ok: false, reason: 'manifest-unavailable' };
        }

        return applyTerminalMutation(manifest, parentManifestPath, data);
    }

    global.CapsuleUserFs = {
        syncFromTerminal,
        applyMutation
    };
}(typeof window !== 'undefined' ? window : globalThis));
