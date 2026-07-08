// SPDX-FileCopyrightText: 2020-2026 les contributeurs CapsuleOS
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Résolution internet simulé CapsuleOS — index Z0 + URLs web locales.
 * Consomme global.CAPSULE_SIMULATED_WEB_INDEX (généré ou inline).
 */
(function initCapsuleSimulatedWebResolver(global) {
    'use strict';

    function getIndex() {
        return global.CAPSULE_SIMULATED_WEB_INDEX || {};
    }

    function normalizeInput(value) {
        return String(value || '').trim();
    }

    function normalizeLower(value) {
        return normalizeInput(value).toLowerCase();
    }

    function normalizeUrlHost(value) {
        let host = normalizeLower(value);
        host = host.replace(/^capsuleos:\/\//, '');
        host = host.replace(/^https?:\/\//, '');
        host = host.replace(/\/.*$/, '');
        host = host.replace(/^www\./, '');
        return host;
    }

    function isHomeTarget(value) {
        const normalized = normalizeLower(value);
        return normalized === ''
            || normalized === 'accueil'
            || normalized === 'about:newtab'
            || normalized === 'about:home'
            || normalized === 'capsuleos://accueil';
    }

    function looksLikeSearchQuery(value) {
        const trimmed = normalizeInput(value);
        if (!trimmed) {
            return false;
        }
        if (trimmed.indexOf(' ') >= 0) {
            return true;
        }
        if (/^capsuleos:\/\//i.test(trimmed)) {
            return false;
        }
        if (/^https?:\/\//i.test(trimmed)) {
            return false;
        }
        if (trimmed.indexOf('.') >= 0) {
            return false;
        }
        return true;
    }

    function webRootPath() {
        if (global.CAPSULE_WEB_ROOT) {
            return String(global.CAPSULE_WEB_ROOT).replace(/\/$/, '');
        }
        const appsBase = global.CAPSULE_APPS_BASE || '../../../usr/share/capsuleos/linux/apps';
        if (String(appsBase).indexOf('linux/apps') >= 0) {
            return String(appsBase).replace(/linux\/apps\/?$/, 'web');
        }
        return '../../../usr/share/capsuleos/web';
    }

    function assetRootPath() {
        const appsBase = global.CAPSULE_APPS_BASE || '../../../usr/share/capsuleos/linux/apps';
        if (String(appsBase).indexOf('linux/apps') >= 0) {
            return String(appsBase).replace(/linux\/apps\/?$/, 'assets/images');
        }
        return '../../../usr/share/capsuleos/assets/images';
    }

    function assetUrl(relativePath) {
        const rel = String(relativePath || '').replace(/^\/+/, '');
        if (!rel) {
            return '';
        }
        if (typeof global.location !== 'undefined' && global.location.protocol
            && global.location.protocol.indexOf('http') === 0) {
            return '/usr/share/capsuleos/assets/images/' + rel.replace(/^assets\/images\//, '');
        }
        const root = assetRootPath().replace(/\/$/, '');
        return root + '/' + rel.replace(/^assets\/images\//, '');
    }

    function webPageUrl(siteId, params) {
        const id = String(siteId || '').trim();
        if (!id) {
            return '';
        }
        const query = params && typeof params === 'object'
            ? Object.keys(params).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&')
            : '';
        const suffix = query ? '?' + query : '';

        if (typeof global.location !== 'undefined' && global.location.protocol
            && global.location.protocol.indexOf('http') === 0) {
            return '/usr/share/capsuleos/web/' + id + '/index.html' + suffix;
        }

        const root = webRootPath().replace(/\/$/, '');
        return root + '/' + id + '/index.html' + suffix;
    }

    function faviconUrlForSiteId(siteId) {
        const id = String(siteId || '').trim();
        if (!id) {
            return '';
        }
        const index = getIndex();
        const sites = index.sites || {};
        const entry = sites[id];
        if (entry && entry.favicon) {
            return assetUrl(entry.favicon);
        }
        const shortcuts = index.shortcuts || {};
        let shortcutKey = null;
        Object.keys(shortcuts).forEach((key) => {
            if (shortcuts[key] && shortcuts[key].siteId === id) {
                shortcutKey = key;
            }
        });
        if (shortcutKey && sites[shortcutKey] && sites[shortcutKey].favicon) {
            return assetUrl(sites[shortcutKey].favicon);
        }
        return '';
    }

    function resolveMntUri(value) {
        const trimmed = normalizeInput(value);
        const match = trimmed.match(/^capsuleos:\/\/mnt\/([^/]+)(?:\/([^/?#]+))?/i);
        if (!match) {
            return null;
        }
        const index = getIndex();
        const moduleId = match[1];
        const scenarioId = match[2] || null;
        const moduleEntry = (index.modules || {})[moduleId];
        if (!moduleEntry) {
            return null;
        }
        return {
            type: 'mnt',
            moduleId: moduleId,
            scenarioId: scenarioId || moduleEntry.defaultScenario || null,
            label: moduleEntry.labelFr || moduleId,
            path: moduleEntry.path || ('mnt/' + moduleId + '/'),
        };
    }

    function resolveSiteIdFromHost(host) {
        const index = getIndex();
        const hosts = index.hosts || {};
        const entry = hosts[host];
        if (entry && entry.siteId) {
            return entry.siteId;
        }
        return null;
    }

    function resolveShortcut(key) {
        const index = getIndex();
        const shortcuts = index.shortcuts || {};
        const entry = shortcuts[key];
        if (!entry) {
            return null;
        }
        if (entry.siteId) {
            return {
                type: 'web',
                siteId: entry.siteId,
                address: entry.host || entry.siteId,
                url: webPageUrl(entry.siteId),
            };
        }
        return null;
    }

    function resolveAlias(value) {
        const index = getIndex();
        const aliases = index.aliases || {};
        const key = normalizeLower(value);
        const entry = aliases[key];
        if (!entry || !entry.siteId) {
            return null;
        }
        return { type: 'web', siteId: entry.siteId, address: key };
    }

    function resolveSearch(query) {
        const index = getIndex();
        const engineKey = index.defaultSearchEngine || 'google';
        const engine = (index.searchEngines || {})[engineKey];
        if (!engine || !engine.siteId) {
            return null;
        }
        const param = engine.queryParam || 'q';
        const params = {};
        params[param] = query;
        return {
            type: 'web',
            siteId: engine.siteId,
            address: engine.labelFr ? 'recherche ' + engine.labelFr : 'recherche',
            url: webPageUrl(engine.siteId, params),
        };
    }

    function resolveInput(rawValue) {
        const value = normalizeInput(rawValue);
        if (isHomeTarget(value)) {
            return { type: 'home' };
        }

        const mnt = resolveMntUri(value);
        if (mnt) {
            return mnt;
        }

        const alias = resolveAlias(value);
        if (alias) {
            alias.url = webPageUrl(alias.siteId);
            return alias;
        }

        if (looksLikeSearchQuery(value)) {
            return resolveSearch(value);
        }

        const host = normalizeUrlHost(value);
        if (host) {
            const siteId = resolveSiteIdFromHost(host);
            if (siteId) {
                return {
                    type: 'web',
                    siteId: siteId,
                    address: host,
                    url: webPageUrl(siteId),
                };
            }
        }

        return {
            type: 'error',
            address: host || value,
            url: webPageUrl('neterror', { host: host || value }),
        };
    }

    global.CapsuleSimulatedWebResolver = {
        getIndex,
        normalizeInput,
        normalizeUrlHost,
        isHomeTarget,
        looksLikeSearchQuery,
        webPageUrl,
        assetUrl,
        faviconUrlForSiteId,
        resolveShortcut,
        resolveInput,
    };
}(typeof window !== 'undefined' ? window : globalThis));
