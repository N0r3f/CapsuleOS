/**
 * Registre des gabarits d'explorateur Linux (Nemo, Dolphin, Nautilus).
 * Une entrée par `CAPSULE_EXPLORER_TEMPLATE` ; les skins ne dupliquent que le CSS (.skin.css).
 */
(function initCapsuleExplorerRegistry(global) {
    'use strict';

    const DEFAULT_EXPLORERS_BASE = 'usr/share/capsuleos/linux/explorers';

    /**
     * @typedef {Object} ExplorerProfile
     * @property {'nemo'|'dolphin'|'nautilus'} family
     * @property {string} shellRelative  Chemin sous explorers/ (ex. nemo/shell.html)
     * @property {string[]} cssBaseStack Fichiers base.css relatifs à explorers/
     * @property {boolean} [loadDolphinExtension]
     * @property {string} [displayNameDefault]
     */

    /** @type {Record<string, ExplorerProfile>} */
    const PROFILES = {
        nemo: {
            family: 'nemo',
            shellRelative: 'nemo/shell.html',
            cssBaseStack: ['nemo/base.css'],
            displayNameDefault: 'Nemo'
        },
        dolphin: {
            family: 'dolphin',
            shellRelative: 'dolphin/shell.html',
            cssBaseStack: ['nemo/base.css', 'dolphin/base.css'],
            loadDolphinExtension: true,
            displayNameDefault: 'Dolphin'
        },
        nautilus: {
            family: 'nautilus',
            shellRelative: 'nautilus/shell-gnome.html',
            cssBaseStack: ['nemo/base.css', 'nautilus/header-gnome.css'],
            loadNautilusExtension: true,
            displayNameDefault: 'Fichiers'
        },
        'nemo-gnome': {
            family: 'nautilus',
            shellRelative: 'nautilus/shell-gnome.html',
            cssBaseStack: ['nemo/base.css', 'nautilus/header-gnome.css'],
            loadNautilusExtension: true,
            displayNameDefault: 'Fichiers'
        },
        'nemo-cosmic': {
            family: 'nautilus',
            shellRelative: 'nautilus/shell-cosmic.html',
            cssBaseStack: ['nemo/base.css'],
            displayNameDefault: 'Fichiers'
        },
        'nautilus-cosmic': {
            family: 'nautilus',
            shellRelative: 'nautilus/shell-cosmic.html',
            cssBaseStack: ['nemo/base.css'],
            displayNameDefault: 'Fichiers'
        }
    };

    const ALL_TEMPLATE_IDS = Object.keys(PROFILES);

    function getExplorersBase() {
        if (typeof global.CAPSULE_EXPLORERS_BASE === 'string' && global.CAPSULE_EXPLORERS_BASE) {
            return String(global.CAPSULE_EXPLORERS_BASE).replace(/\/+$/, '');
        }
        return DEFAULT_EXPLORERS_BASE;
    }

    function resolveTemplateId(templateId) {
        const id = String(templateId || 'nemo').replace(/\/+$/, '');
        return PROFILES[id] ? id : 'nemo';
    }

    function getProfile(templateId) {
        const id = resolveTemplateId(templateId);
        return Object.assign({ id: id }, PROFILES[id]);
    }

    function resolveActiveProfile() {
        const templateId = typeof global.CAPSULE_EXPLORER_TEMPLATE === 'string'
            ? global.CAPSULE_EXPLORER_TEMPLATE
            : 'nemo';
        return getProfile(templateId);
    }

    /** Chemin HTML depuis `CAPSULE_APPS_BASE` (…/linux/apps → …/linux/explorers/…). */
    function resolveShellPathFromAppsBase(appsBase, templateId) {
        const base = String(appsBase || '../../../usr/share/capsuleos/linux/apps').replace(/\/+$/, '');
        const explorersPrefix = base.replace(/\/apps$/, '/explorers');
        return `${explorersPrefix}/${getProfile(templateId).shellRelative}`;
    }

    function resolveCssBasePathsFromAppsBase(appsBase, templateId) {
        const base = String(appsBase || '../../../usr/share/capsuleos/linux/apps').replace(/\/+$/, '');
        const explorersPrefix = base.replace(/\/apps$/, '/explorers');
        return getProfile(templateId).cssBaseStack.map((rel) => `${explorersPrefix}/${rel}`);
    }

    function isExplorerTemplate(templateId) {
        const id = String(templateId || '').replace(/\/+$/, '');
        return Object.prototype.hasOwnProperty.call(PROFILES, id);
    }

    function isActiveFamily(family) {
        return resolveActiveProfile().family === family;
    }

    global.CapsuleExplorerRegistry = {
        PROFILES,
        ALL_TEMPLATE_IDS,
        getExplorersBase,
        resolveTemplateId,
        getProfile,
        resolveActiveProfile,
        resolveShellPathFromAppsBase,
        resolveCssBasePathsFromAppsBase,
        isExplorerTemplate,
        isActiveFamily,
        isDolphinFamily: () => isActiveFamily('dolphin'),
        isNautilusFamily: () => isActiveFamily('nautilus'),
        isNemoFamily: () => isActiveFamily('nemo')
    };
}(typeof window !== 'undefined' ? window : globalThis));
