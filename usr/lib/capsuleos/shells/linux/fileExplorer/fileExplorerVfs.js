/**
 * Pont explorateur ↔ terminal virtuel (ls /, /home/public = home/public manifeste).
 */
(function initCapsuleExplorerVfs(global) {
    'use strict';

    const CAPSULE_VFS_ROOT = '__capsule/vfs';

    function normalizeTerminalPath(path) {
        const normalized = String(path || '/').replace(/\/+/g, '/');
        return normalized.length > 1 ? normalized.replace(/\/+$/, '') : '/';
    }

    function getTerminalLogicalHome() {
        if (typeof global.CAPSULE_USER_HOME === 'string' && global.CAPSULE_USER_HOME) {
            return normalizeTerminalPath(global.CAPSULE_USER_HOME);
        }
        return '/home/public';
    }

    function cloneTerminalSkeleton() {
        if (typeof fileSystem === 'undefined' || !fileSystem) {
            return { '/': {} };
        }
        return JSON.parse(JSON.stringify(fileSystem));
    }

    function isTerminalDirectory(fs, path) {
        const normalized = normalizeTerminalPath(path);
        return Boolean(fs[normalized] && typeof fs[normalized] === 'object');
    }

    function getTerminalDirectoryListing(fs, path) {
        const normalized = normalizeTerminalPath(path);
        const directory = fs[normalized];
        if (!directory || typeof directory !== 'object') {
            return [];
        }
        const seen = new Set();
        return Object.keys(directory)
            .map((name) => (name.indexOf('/') === 0 ? name.slice(1) : name))
            .filter((name) => {
                if (!name || seen.has(name)) {
                    return false;
                }
                seen.add(name);
                return true;
            })
            .sort((a, b) => a.localeCompare(b, 'fr'));
    }

    let hydratedFsPromise = null;

    function getHydratedTerminalFilesystem() {
        if (!hydratedFsPromise) {
            const baseFs = cloneTerminalSkeleton();
            if (global.CapsuleVirtualShell && typeof global.CapsuleVirtualShell.prepareTerminalFilesystem === 'function') {
                hydratedFsPromise = global.CapsuleVirtualShell.prepareTerminalFilesystem(baseFs)
                    .then((result) => (result && result.fs ? result.fs : baseFs));
            } else {
                hydratedFsPromise = Promise.resolve(baseFs);
            }
        }
        return hydratedFsPromise;
    }

    function explorerPathToTerminalPath(explorerPath) {
        if (explorerPath === global.CAPSULE_PLACE_FILESYSTEM) {
            return '/';
        }
        if (explorerPath === CAPSULE_VFS_ROOT) {
            return '/';
        }
        const prefix = `${CAPSULE_VFS_ROOT}/`;
        if (explorerPath && explorerPath.indexOf(prefix) === 0) {
            const suffix = explorerPath.slice(CAPSULE_VFS_ROOT.length);
            return normalizeTerminalPath(suffix || '/');
        }
        return null;
    }

    function terminalPathToExplorerPath(terminalPath) {
        const normalized = normalizeTerminalPath(terminalPath);
        if (normalized === '/') {
            return global.CAPSULE_PLACE_FILESYSTEM;
        }
        return `${CAPSULE_VFS_ROOT}${normalized}`;
    }

    function resolveManifestPathFromTerminal(terminalPath) {
        if (typeof global.getFileExplorerRoot !== 'function') {
            return null;
        }
        const manifestRoot = String(global.getFileExplorerRoot()).replace(/\/+$/, '');
        const home = getTerminalLogicalHome();
        const normalized = normalizeTerminalPath(terminalPath);
        if (normalized === home) {
            return manifestRoot;
        }
        if (normalized.indexOf(`${home}/`) === 0) {
            return manifestRoot + normalized.slice(home.length);
        }
        return null;
    }

    function manifestPathToTerminalPath(explorerPath) {
        if (!explorerPath) {
            return '/';
        }
        const vfsTerminalPath = explorerPathToTerminalPath(explorerPath);
        if (vfsTerminalPath) {
            return vfsTerminalPath;
        }
        if (typeof global.getFileExplorerRoot !== 'function') {
            return getTerminalLogicalHome();
        }
        const manifestRoot = String(global.getFileExplorerRoot()).replace(/\/+$/, '');
        const home = getTerminalLogicalHome();
        const key = String(explorerPath).replace(/\/+$/, '');
        if (!key || key === manifestRoot) {
            return home;
        }
        if (manifestRoot && (key === manifestRoot || key.indexOf(`${manifestRoot}/`) === 0)) {
            const suffix = key.slice(manifestRoot.length);
            return normalizeTerminalPath(`${home}${suffix}`);
        }
        return home;
    }

    function isExplorerVfsPath(path) {
        if (!path || typeof path !== 'string') {
            return false;
        }
        if (path === global.CAPSULE_PLACE_FILESYSTEM || path === CAPSULE_VFS_ROOT) {
            return true;
        }
        return path.indexOf(`${CAPSULE_VFS_ROOT}/`) === 0;
    }

    function getTerminalParentPath(terminalPath) {
        const normalized = normalizeTerminalPath(terminalPath);
        if (normalized === '/') {
            return '/';
        }
        const parts = normalized.split('/').filter(Boolean);
        parts.pop();
        return parts.length ? `/${parts.join('/')}` : '/';
    }

    function getExplorerParentPath(explorerPath) {
        const terminalPath = explorerPathToTerminalPath(explorerPath);
        if (!terminalPath) {
            return null;
        }
        const parentTerminal = getTerminalParentPath(terminalPath);
        return terminalPathToExplorerPath(parentTerminal);
    }

    function getExplorerPathLabel(explorerPath) {
        const terminalPath = explorerPathToTerminalPath(explorerPath);
        if (terminalPath) {
            return terminalPath;
        }
        return null;
    }

    function buildExplorerItemsForTerminalPath(terminalPath, fs) {
        const names = getTerminalDirectoryListing(fs, terminalPath);
        const items = [];
        names.forEach((name) => {
            const childTerminal = terminalPath === '/'
                ? `/${name}`
                : `${normalizeTerminalPath(terminalPath)}/${name}`;
            const manifestPath = resolveManifestPathFromTerminal(childTerminal);
            const explorerPath = manifestPath || terminalPathToExplorerPath(childTerminal);
            items.push({
                type: 'folder',
                name,
                path: explorerPath,
                vfsEntry: true
            });
        });
        return items;
    }

    function listExplorerDirectory(explorerPath) {
        const terminalPath = explorerPathToTerminalPath(explorerPath);
        if (!terminalPath) {
            return Promise.resolve([]);
        }
        const manifestPath = resolveManifestPathFromTerminal(terminalPath);
        if (manifestPath) {
            return Promise.resolve({ manifestPath, items: null });
        }
        return getHydratedTerminalFilesystem().then((fs) => ({
            manifestPath: null,
            items: buildExplorerItemsForTerminalPath(terminalPath, fs)
        }));
    }

    global.CAPSULE_VFS_ROOT = CAPSULE_VFS_ROOT;
    global.CapsuleExplorerVfs = {
        CAPSULE_VFS_ROOT,
        normalizeTerminalPath,
        getTerminalLogicalHome,
        getHydratedTerminalFilesystem,
        explorerPathToTerminalPath,
        terminalPathToExplorerPath,
        resolveManifestPathFromTerminal,
        manifestPathToTerminalPath,
        isExplorerVfsPath,
        getExplorerParentPath,
        getExplorerPathLabel,
        listExplorerDirectory,
        buildExplorerItemsForTerminalPath
    };
}(typeof window !== 'undefined' ? window : globalThis));
