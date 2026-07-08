/**
 * Shell virtuel CapsuleOS — couche FS pour le terminal Linux.
 *
 * Architecture :
 * - Le squelette système (`filesystem.js`) fournit /, /bin, /home/public/* dossiers vides.
 * - Ce module hydrate l’arborescence depuis `home/public/.capsule-manifest.json`
 *   (fetch HTTP) ou `CAPSULE_FILE_EXPLORER_MANIFEST_EMBED` (file:// / embed).
 * - Les chemins logiques (`/home/public`, `~/Documents`) sont alignés sur `CAPSULE_USER_HOME`
 *   et `CAPSULE_CONTENT_ROOT` comme l’explorateur Nemo.
 * - Les fichiers texte sont préchargés via `fetch(href)` ; les binaires restent listables
 *   mais `cat` / `less` affichent un message type bash.
 */
(function initCapsuleVirtualShell(global) {
    'use strict';

    const TEXT_EXTENSIONS = new Set([
        'txt', 'md', 'log', 'sh', 'json', 'csv', 'xml', 'html', 'htm', 'css', 'js', 'mjs',
        'c', 'h', 'py', 'yml', 'yaml', 'ini', 'conf', 'env'
    ]);

    function normalizePath(path) {
        const normalized = String(path || '/').replace(/\/+/g, '/');
        return normalized.length > 1 ? normalized.replace(/\/+$/, '') : '/';
    }

    function getLogicalHome() {
        if (typeof global.CAPSULE_USER_HOME === 'string' && global.CAPSULE_USER_HOME) {
            return normalizePath(global.CAPSULE_USER_HOME);
        }
        return '/home/public';
    }

    function getContentRoot() {
        if (typeof global.CAPSULE_CONTENT_ROOT === 'string' && global.CAPSULE_CONTENT_ROOT) {
            return String(global.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
        }
        if (global.CapsuleUserHome && typeof global.CapsuleUserHome.resolveRelative === 'function') {
            return global.CapsuleUserHome.resolveRelative();
        }
        return 'home/public';
    }

    function manifestUrl() {
        if (global.CapsuleUserHome && typeof global.CapsuleUserHome.manifestPath === 'function') {
            return global.CapsuleUserHome.manifestPath();
        }
        return `${getContentRoot()}/.capsule-manifest.json`;
    }

    function remapManifestToContentRoot(manifest) {
        if (global.CapsuleExplorerHome && typeof global.CapsuleExplorerHome.remapManifestToContentRoot === 'function') {
            return global.CapsuleExplorerHome.remapManifestToContentRoot(manifest);
        }
        if (!manifest || !manifest.folders) {
            return manifest;
        }
        const targetRoot = getContentRoot();
        const sourceRoot = typeof manifest.root === 'string'
            ? manifest.root.replace(/\/+$/, '')
            : '';
        if (!sourceRoot || sourceRoot === targetRoot) {
            return Object.assign( {} , manifest, { root: targetRoot });
        }
        const rewritePath = (str) => {
            if (typeof str !== 'string') {
                return str;
            }
            if (str === sourceRoot || str.startsWith(`${sourceRoot}/`)) {
                return targetRoot + str.slice(sourceRoot.length);
            }
            return str;
        };
        const newFolders = {};
        Object.keys(manifest.folders).forEach((key) => {
            const folder = manifest.folders[key];
            const newKey = rewritePath(key);
            const newItems = Array.isArray(folder.items)
                ? folder.items.map((item) => {
                    const out = Object.assign( {} , item);
                    if (item.path != null) {
                        out.path = rewritePath(String(item.path));
                    }
                    if (item.href != null) {
                        out.href = rewritePath(String(item.href));
                    }
                    return out;
                })
                : folder.items;
            newFolders[newKey] = Object.assign( {} , folder, { items: newItems });
        });
        return Object.assign( {} , manifest, { root: targetRoot }, { folders: newFolders });
    }

    function manifestKeyToLogical(folderKey, manifestRoot, logicalHome) {
        const key = String(folderKey || '').replace(/\/+$/, '');
        const root = String(manifestRoot || '').replace(/\/+$/, '');
        if (!key || key === root) {
            return logicalHome;
        }
        if (root && (key === root || key.startsWith(`${root}/`))) {
            const suffix = key.slice(root.length);
            return normalizePath(`${logicalHome}${suffix}`);
        }
        const tail = key.split('/').filter(Boolean).pop();
        if (!tail) {
            return logicalHome;
        }
        return normalizePath(`${logicalHome}/${tail}`);
    }

    function isTextFileName(name) {
        const base = String(name || '');
        const dot = base.lastIndexOf('.');
        if (dot <= 0) {
            return true;
        }
        return TEXT_EXTENSIONS.has(base.slice(dot + 1).toLowerCase());
    }

    function ensureDirNode(fs, dirPath) {
        const path = normalizePath(dirPath);
        if (!fs[path] || typeof fs[path] !== 'object') {
            fs[path] = {};
        }
        return fs[path];
    }

    function linkParentChild(fs, parentPath, childName, isDirectory) {
        const parent = ensureDirNode(fs, parentPath);
        const key = childName.startsWith('/') ? childName : childName;
        parent[key] = isDirectory ? {} : {};
        if (isDirectory) {
            ensureDirNode(fs, normalizePath(`${parentPath}/${childName.replace(/^\//, '')}`));
        }
    }

    function hydrateFileSystem(baseFs, manifest) {
        const fs = baseFs || {};
        const logicalHome = getLogicalHome();
        const fileContents = {};
        const fileHrefs = {};

        if (!manifest || !manifest.folders) {
            return { fs, fileContents, fileHrefs };
        }

        const manifestRoot = manifest.root;
        const folderKeys = Object.keys(manifest.folders).sort((a, b) => a.length - b.length);

        folderKeys.forEach((folderKey) => {
            const folder = manifest.folders[folderKey];
            const logicalDir = manifestKeyToLogical(folderKey, manifestRoot, logicalHome);
            ensureDirNode(fs, logicalDir);

            const items = Array.isArray(folder.items) ? folder.items : [];
            items.forEach((item) => {
                if (!item || !item.name) {
                    return;
                }
                const name = String(item.name);
                if (item.type === 'folder') {
                    const childLogical = item.path
                        ? manifestKeyToLogical(item.path, manifestRoot, logicalHome)
                        : normalizePath(`${logicalDir}/${name}`);
                    linkParentChild(fs, logicalDir, name, true);
                    ensureDirNode(fs, childLogical);
                    return;
                }
                if (item.type === 'file') {
                    linkParentChild(fs, logicalDir, name, false);
                    const logicalFile = normalizePath(`${logicalDir}/${name}`);
                    if (item.href) {
                        fileHrefs[logicalFile] = String(item.href);
                    }
                    if (!isTextFileName(name)) {
                        fileContents[logicalFile] = null;
                    }
                }
            });
        });

        ensureDirNode(fs, logicalHome);
        return { fs, fileContents, fileHrefs };
    }

    function loadManifest() {
        const embedded = global.CAPSULE_FILE_EXPLORER_MANIFEST_EMBED
            || global.CAPSULE_NEMO_MANIFEST_EMBED;
        if (embedded && typeof embedded === 'object') {
            return Promise.resolve(remapManifestToContentRoot(
                typeof structuredClone === 'function'
                    ? structuredClone(embedded)
                    : JSON.parse(JSON.stringify(embedded))
            ));
        }

        const url = manifestUrl();
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then((manifest) => remapManifestToContentRoot(manifest))
            .catch((error) => {
                console.warn('CapsuleVirtualShell: manifeste indisponible, FS minimal.', error);
                return null;
            });
    }

    async function prefetchTextFiles(fileContents, fileHrefs) {
        const entries = Object.entries(fileHrefs).filter(([path]) => (
            fileContents[path] !== null && isTextFileName(path.split('/').pop())
        ));
        await Promise.all(entries.map(async ([logicalPath, href]) => {
            if (fileContents[logicalPath]) {
                return;
            }
            try {
                const response = await fetch(href);
                if (!response.ok) {
                    return;
                }
                const text = await response.text();
                if (text) {
                    fileContents[logicalPath] = text;
                }
            } catch {
                /* file:// ou CORS — contenu à la demande via placeholder */
            }
        }));
    }

    let preparePromise = null;

    async function prepareTerminalFilesystem(baseFs) {
        if (!preparePromise) {
            preparePromise = (async () => {
                const manifest = await loadManifest();
                const hydration = hydrateFileSystem(baseFs, manifest);
                const mergedContents = Object.assign(
                    {},
                    global.CAPSULE_TERMINAL_FILE_CONTENTS || {},
                    hydration.fileContents
                );
                await prefetchTextFiles(mergedContents, hydration.fileHrefs);
                Object.keys(mergedContents).forEach((key) => {
                    if (mergedContents[key] === null) {
                        delete mergedContents[key];
                    }
                });
                return {
                    fs: hydration.fs,
                    fileContents: mergedContents,
                    fileHrefs: hydration.fileHrefs
                };
            })();
        }
        return preparePromise;
    }

    global.CapsuleVirtualShell = {
        loadManifest,
        hydrateFileSystem,
        prepareTerminalFilesystem,
        manifestKeyToLogical,
        isTextFileName
    };
}(typeof window !== 'undefined' ? window : globalThis));
