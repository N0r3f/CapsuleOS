/**
 * CapsuleOS — home utilisateur simulé partagé entre toutes les distributions.
 *
 * Chemin logique UI : `/home/public` — chemin physique repo : `home/public/`.
 * Charger ce script avant les globals `CAPSULE_CONTENT_ROOT` / `CAPSULE_WIN_CONTENT_ROOT`.
 */
(function initCapsuleUserHome(global) {
    'use strict';

    const DEFAULT_LOGICAL = '/home/public';
    const DEFAULT_PHYSICAL = 'home/public';

    const inlineConfig = global.CAPSULE_USER_HOME_CONFIG && typeof global.CAPSULE_USER_HOME_CONFIG === 'object'
        ? global.CAPSULE_USER_HOME_CONFIG
        : {};

    function getLogicalHome() {
        if (typeof global.CAPSULE_USER_HOME === 'string' && global.CAPSULE_USER_HOME) {
            return global.CAPSULE_USER_HOME;
        }
        if (inlineConfig.logicalPath) {
            return String(inlineConfig.logicalPath);
        }
        return DEFAULT_LOGICAL;
    }

    function getPhysicalSegment() {
        const candidate = inlineConfig.defaultHome || inlineConfig.physicalPath || DEFAULT_PHYSICAL;
        return String(candidate).replace(/^\/+|\/+$/g, '');
    }

    /**
     * Chemin relatif vers `home/public` depuis une page à la profondeur `depth`
     * par rapport à la racine du dépôt (ex. `home/Debian/Mint/index.html` → 3).
     *
     * @param {number} depth
     * @returns {string}
     */
    function fromRepoDepth(depth) {
        const n = Math.max(0, Number(depth) || 0);
        const prefix = n > 0 ? '../'.repeat(n) : '';
        return (prefix + getPhysicalSegment()).replace(/\/+$/, '');
    }

    /**
     * Déduit la profondeur depuis un chemin (URL pathname ou chemin relatif).
     *
     * @param {string} [fromPath]
     * @returns {string}
     */
    function resolveRelative(fromPath) {
        if (typeof fromPath === 'number') {
            return fromRepoDepth(fromPath);
        }

        let source = fromPath;
        if (!source && typeof document !== 'undefined' && document.location) {
            source = document.location.pathname || '';
        }
        if (!source) {
            return fromRepoDepth(0);
        }

        const clean = String(source).split('?')[0].split('#')[0].replace(/\\/g, '/');
        const segments = clean.split('/').filter(Boolean);
        if (segments.length && /\.[a-z0-9]+$/i.test(segments[segments.length - 1])) {
            segments.pop();
        }
        return fromRepoDepth(segments.length);
    }

    function manifestFileName() {
        return '.capsule-manifest.json';
    }

    function manifestPath(fromPath) {
        return `${resolveRelative(fromPath)}/${manifestFileName()}`;
    }

    function finderManifestPath(fromPath) {
        return `${resolveRelative(fromPath)}/.capsule-finder-manifest.json`;
    }

    global.CAPSULE_USER_HOME = getLogicalHome();
    global.CAPSULE_PUBLIC_HOME = global.CAPSULE_USER_HOME;

    global.CapsuleUserHome = {
        logicalPath: getLogicalHome,
        physicalSegment: getPhysicalSegment,
        fromRepoDepth,
        resolveRelative,
        manifestFileName,
        manifestPath,
        finderManifestPath
    };
}(typeof window !== 'undefined' ? window : globalThis));
