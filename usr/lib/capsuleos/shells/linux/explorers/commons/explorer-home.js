/**
 * Commons explorateur — racine `home/public` et manifestes partagés (Nemo / Dolphin / Nautilus).
 */
(function initCapsuleExplorerHome(global) {
    'use strict';

    function getContentRoot() {
        if (global.CAPSULE_CONTENT_ROOT) {
            return String(global.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
        }
        if (global.CapsuleUserHome) {
            return global.CapsuleUserHome.resolveRelative();
        }
        return 'home/public';
    }

    function getManifestFileName() {
        if (global.CapsuleUserHome) {
            return global.CapsuleUserHome.manifestFileName();
        }
        return '.capsule-manifest.json';
    }

    function getManifestPath() {
        return `${getContentRoot()}/${getManifestFileName()}`;
    }

    function getLegacyManifestPath() {
        return `${getContentRoot()}/nemo-manifest.json`;
    }

    /**
     * Réaligne root / clés folders / path href du manifeste sur la racine courante.
     * @param {object} manifest
     * @returns {object}
     */
    function remapManifestToContentRoot(manifest) {
        if (!manifest || typeof manifest !== 'object' || !manifest.folders) {
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
        return Object.assign(
            {}
            , manifest, { root: targetRoot }, { folders: newFolders });
    }

    global.CapsuleExplorerHome = {
        getContentRoot,
        getManifestPath,
        getLegacyManifestPath,
        getManifestFileName,
        remapManifestToContentRoot
    };
}(typeof window !== 'undefined' ? window : globalThis));
