/**
 * Charge les modules pédagogiques montés (mnt/) — métaphore /mnt Linux.
 * Déclaration : CAPSULE_MNT_BASE + CAPSULE_MNT_MODULES (niveau/id).
 */
(function initCapsuleMntModules(global) {
    'use strict';

    const normalizeBase = (base) => String(base || '../../../mnt').replace(/\/+$/, '');

    const mountedList = () => {
        const raw = global.CAPSULE_MNT_MODULES;
        if (!Array.isArray(raw)) {
            return [];
        }
        return raw.map((entry) => String(entry || '').trim()).filter(Boolean);
    };

    const resolveModuleUrl = (mountId) => {
        const base = normalizeBase(global.CAPSULE_MNT_BASE);
        const parts = String(mountId).split('/').filter(Boolean);
        if (parts.length < 2) {
            return null;
        }
        return `${base}/${parts[0]}/${parts[1]}/module.json`;
    };

    const fetchJson = async (url) => {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} pour ${url}`);
        }
        return response.json();
    };

    const loadScenario = async (moduleBase, relativePath) => {
        const url = `${moduleBase}/${String(relativePath).replace(/^\//, '')}`;
        return fetchJson(url);
    };

    const loadModule = async (mountId) => {
        const manifestUrl = resolveModuleUrl(mountId);
        if (!manifestUrl) {
            throw new Error(`Identifiant module invalide: ${mountId}`);
        }
        const manifest = await fetchJson(manifestUrl);
        const base = manifestUrl.replace(/\/module\.json$/, '');
        const scenarios = [];
        const paths = Array.isArray(manifest.scenarios) ? manifest.scenarios : [];
        for (let index = 0; index < paths.length; index += 1) {
            scenarios.push(await loadScenario(base, paths[index]));
        }
        return {
            mountId,
            manifest,
            scenarios,
            baseUrl: base,
        };
    };

    const loadMounted = async () => {
        const mounts = mountedList();
        const modules = [];
        const errors = [];
        for (let index = 0; index < mounts.length; index += 1) {
            try {
                modules.push(await loadModule(mounts[index]));
            } catch (error) {
                errors.push({ mountId: mounts[index], message: String(error && error.message || error) });
            }
        }
        return { modules, errors, mounts };
    };

    global.CapsuleMntModules = {
        mountedList,
        resolveModuleUrl,
        loadModule,
        loadMounted,
    };
}(typeof window !== 'undefined' ? window : globalThis));
