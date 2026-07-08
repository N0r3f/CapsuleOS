/**
 * Catalogue magasin Logithèque Mint — runtime browser.
 * Données : var/lib/capsuleos/generated/capsule-store-catalog.js (généré depuis contrats).
 * VM ground truth : apps pré-installées — section « À découvrir » via getDiscoverApps.
 */
(function initCapsuleMintStoreCatalog(global) {
    'use strict';

    var STORE_INSTALLED_PREFIX = 'capsule-store-installed:';
    var STORE_APPS_BY_REGISTRY = global.CAPSULE_STORE_APPS_BY_REGISTRY || {};

    function resolveRegistryId() {
        if (global.CAPSULE_SKIN_PROFILE_ID) {
            return global.CAPSULE_SKIN_PROFILE_ID;
        }
        var bodyId = global.document && global.document.body ? global.document.body.id : '';
        if (bodyId === 'mint') {
            return 'linux-mint';
        }
        return '';
    }

    function storeInstalledKey(registryId) {
        return STORE_INSTALLED_PREFIX + registryId;
    }

    function loadStoreInstalledMeta(registryId) {
        var key = storeInstalledKey(registryId);
        try {
            var raw = global.sessionStorage.getItem(key);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            /* hors ligne */
        }
        return { appIds: [], installedAt: null, source: null };
    }

    function saveStoreInstalledMeta(registryId, meta) {
        try {
            global.sessionStorage.setItem(storeInstalledKey(registryId), JSON.stringify(meta));
        } catch (e) {
            /* hors ligne */
        }
    }

    function recordStoreInstall(registryId, appId, source) {
        var meta = loadStoreInstalledMeta(registryId);
        var ids = meta.appIds || [];
        if (ids.indexOf(appId) === -1) {
            ids.push(appId);
        }
        meta.appIds = ids;
        meta.installedAt = new Date().toISOString();
        if (source) {
            meta.source = source;
        }
        saveStoreInstalledMeta(registryId, meta);
        return meta;
    }

    function getStoreList() {
        var registryId = resolveRegistryId();
        return STORE_APPS_BY_REGISTRY[registryId] || [];
    }

    function isDiscoverEntry(entry) {
        if (!entry) {
            return false;
        }
        if (entry.storeInstallable === true) {
            return true;
        }
        return entry.defaultInstalled === false;
    }

    function getDiscoverApps(installedIds) {
        var storeList = getStoreList();
        var installed = installedIds || {};
        var result = [];
        var i;
        for (i = 0; i < storeList.length; i += 1) {
            var entry = storeList[i];
            if (!isDiscoverEntry(entry)) {
                continue;
            }
            if (installed[entry.id] === true) {
                continue;
            }
            if (entry.storeSlot && installed[entry.storeSlot] === true) {
                continue;
            }
            result.push(entry);
        }
        return result;
    }

    function getStoreAppEntry(appId) {
        var storeList = getStoreList();
        var i;
        for (i = 0; i < storeList.length; i += 1) {
            if (storeList[i].id === appId) {
                return storeList[i];
            }
            if (storeList[i].storeSlot === appId) {
                return storeList[i];
            }
        }
        return null;
    }

    var storeApi = {
        STORE_INSTALLED_PREFIX: STORE_INSTALLED_PREFIX,
        resolveRegistryId: resolveRegistryId,
        storeInstalledKey: storeInstalledKey,
        loadStoreInstalledMeta: loadStoreInstalledMeta,
        saveStoreInstalledMeta: saveStoreInstalledMeta,
        recordStoreInstall: recordStoreInstall,
        getStoreList: getStoreList,
        getDiscoverApps: getDiscoverApps,
        getStoreAppEntry: getStoreAppEntry
    };

    global.CapsuleMintStore = storeApi;
    global.CapsuleCinnamonStore = storeApi;
}(typeof window !== 'undefined' ? window : globalThis));
