/**
 * Chrome avancé explorateur (menu contextuel, propriétés) — injection si absent du gabarit (embed obsolète).
 */
(function initFileExplorerAdvancedChrome(global) {
    'use strict';

    const FRAGMENT_PATHS = [
        './fragments/explorer-advanced-chrome.html',
        '../fragments/explorer-advanced-chrome.html',
        '../../../usr/share/capsuleos/linux/apps/fragments/explorer-advanced-chrome.html',
    ];

    const DOLPHIN_MENU_PATHS = [
        './fragments/explorer-context-menu-dolphin.html',
        '../fragments/explorer-context-menu-dolphin.html',
        '../../../usr/share/capsuleos/linux/apps/fragments/explorer-context-menu-dolphin.html',
    ];

    let fragmentMarkup = null;
    let dolphinMenuMarkup = null;
    let fragmentPromise = null;
    let dolphinMenuPromise = null;

    const isDolphinExplorer = () => (
        typeof global.isDolphinTemplate === 'function' && global.isDolphinTemplate()
    );

    const loadFragmentSync = (url) => {
        try {
            const xhr = new global.XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send(null);
            if (xhr.status >= 200 && xhr.status < 300) {
                return xhr.responseText;
            }
        } catch (error) {
            /* sync fetch indisponible */
        }
        return null;
    };

    const resolveAppsBase = () => {
        if (global.CAPSULE_APPS_BASE) {
            return String(global.CAPSULE_APPS_BASE).replace(/\/+$/, '');
        }
        return '../../../usr/share/capsuleos/linux/apps';
    };

    const loadFragmentMarkup = () => {
        if (fragmentMarkup) {
            return Promise.resolve(fragmentMarkup);
        }
        if (fragmentPromise) {
            return fragmentPromise;
        }
        const base = resolveAppsBase();
        const urls = [
            `${base}/fragments/explorer-advanced-chrome.html`,
            ...FRAGMENT_PATHS,
        ];
        fragmentPromise = (async () => {
            let lastError = null;
            for (let index = 0; index < urls.length; index += 1) {
                const url = urls[index];
                try {
                    const response = await fetch(url, { cache: 'no-store' });
                    if (response.ok) {
                        fragmentMarkup = await response.text();
                        return fragmentMarkup;
                    }
                    lastError = new Error(`HTTP ${response.status} ${url}`);
                } catch (error) {
                    lastError = error;
                }
            }
            throw lastError || new Error('Fragment explorer-advanced-chrome introuvable');
        })();
        return fragmentPromise;
    };

    const getExplorerShell = (root) => (
        root.querySelector('main#gestionnaire')
        || root.querySelector('main.dolphin-app')
        || root.querySelector('main.nemo-app')
    );

    const mountPropertiesDialog = (shell, markup) => {
        if (!shell || !markup || shell.querySelector('#nemo-properties-dialog')) {
            return !!shell.querySelector('#nemo-properties-dialog');
        }
        const template = global.document.createElement('template');
        template.innerHTML = markup.trim();
        const dialog = template.content.querySelector('#nemo-properties-dialog');
        if (dialog) {
            shell.appendChild(dialog);
        }
        return !!shell.querySelector('#nemo-properties-dialog');
    };

    const mountContextMenu = (shell, menuMarkup, dolphinMode) => {
        if (!shell || !menuMarkup) {
            return !!shell.querySelector('#nemo-context-menu');
        }
        const existing = shell.querySelector('#nemo-context-menu');
        const needsDolphin = !!dolphinMode;
        if (existing) {
            const isDolphinMenu = existing.classList.contains('dolphin-context-menu');
            if (needsDolphin === isDolphinMenu) {
                return true;
            }
            existing.remove();
            const explorerRoot = shell.closest('.windowElement[data-link="nemo"]');
            if (explorerRoot && explorerRoot.dataset) {
                delete explorerRoot.dataset.nemoContextMenuInit;
            }
            shell.querySelectorAll('[data-nemo-context-menu-bound="true"]').forEach((node) => {
                delete node.dataset.nemoContextMenuBound;
            });
        }
        const template = global.document.createElement('template');
        template.innerHTML = menuMarkup.trim();
        const menu = template.content.querySelector('#nemo-context-menu');
        if (menu) {
            shell.appendChild(menu);
        }
        return !!shell.querySelector('#nemo-context-menu');
    };

    const mountFragmentMarkup = (root, markup, menuMarkup, dolphinMode) => {
        const shell = getExplorerShell(root);
        if (!shell) {
            return false;
        }
        mountPropertiesDialog(shell, markup);
        mountContextMenu(shell, menuMarkup || markup, dolphinMode);
        return !!(shell.querySelector('#nemo-context-menu')
            && shell.querySelector('#nemo-properties-dialog'));
    };

    const resolveFragmentMarkup = () => {
        if (fragmentMarkup) {
            return fragmentMarkup;
        }
        const base = resolveAppsBase();
        const urls = [
            `${base}/fragments/explorer-advanced-chrome.html`,
            ...FRAGMENT_PATHS,
        ];
        for (let index = 0; index < urls.length; index += 1) {
            const markup = loadFragmentSync(urls[index]);
            if (markup) {
                fragmentMarkup = markup;
                return fragmentMarkup;
            }
        }
        return null;
    };

    const loadDolphinMenuMarkup = () => {
        if (dolphinMenuMarkup) {
            return Promise.resolve(dolphinMenuMarkup);
        }
        if (dolphinMenuPromise) {
            return dolphinMenuPromise;
        }
        const base = resolveAppsBase();
        const urls = [
            `${base}/fragments/explorer-context-menu-dolphin.html`,
            ...DOLPHIN_MENU_PATHS,
        ];
        dolphinMenuPromise = (async () => {
            let lastError = null;
            for (let index = 0; index < urls.length; index += 1) {
                const url = urls[index];
                try {
                    const response = await fetch(url, { cache: 'no-store' });
                    if (response.ok) {
                        dolphinMenuMarkup = await response.text();
                        return dolphinMenuMarkup;
                    }
                    lastError = new Error(`HTTP ${response.status} ${url}`);
                } catch (error) {
                    lastError = error;
                }
            }
            throw lastError || new Error('Fragment explorer-context-menu-dolphin introuvable');
        })();
        return dolphinMenuPromise;
    };

    const resolveDolphinMenuMarkup = () => {
        if (dolphinMenuMarkup) {
            return dolphinMenuMarkup;
        }
        const base = resolveAppsBase();
        const urls = [
            `${base}/fragments/explorer-context-menu-dolphin.html`,
            ...DOLPHIN_MENU_PATHS,
        ];
        for (let index = 0; index < urls.length; index += 1) {
            const markup = loadFragmentSync(urls[index]);
            if (markup) {
                dolphinMenuMarkup = markup;
                return dolphinMenuMarkup;
            }
        }
        return null;
    };

    function ensureExplorerAdvancedChrome(root) {
        if (!root) {
            return false;
        }
        const dolphinMode = isDolphinExplorer();
        const hasDialog = !!root.querySelector('#nemo-properties-dialog');
        const menuNode = root.querySelector('#nemo-context-menu');
        const hasCorrectMenu = menuNode && (!dolphinMode || menuNode.classList.contains('dolphin-context-menu'));
        if (hasDialog && hasCorrectMenu) {
            return true;
        }
        const chromeMarkup = resolveFragmentMarkup();
        const menuMarkup = dolphinMode
            ? (resolveDolphinMenuMarkup() || chromeMarkup)
            : chromeMarkup;
        if (!chromeMarkup && !menuMarkup) {
            const loaders = [loadFragmentMarkup()];
            if (dolphinMode) {
                loaders.push(loadDolphinMenuMarkup());
            }
            Promise.all(loaders).then(() => {
                if (typeof global.bindFileExplorerContextMenu === 'function') {
                    global.bindFileExplorerContextMenu();
                }
                if (typeof global.bindFileExplorerProperties === 'function') {
                    global.bindFileExplorerProperties();
                }
            }).catch(() => {});
            return false;
        }
        const mounted = mountFragmentMarkup(root, chromeMarkup, menuMarkup, dolphinMode);
        if (mounted && typeof global.bindFileExplorerContextMenu === 'function') {
            delete root.dataset.nemoContextMenuInit;
            global.bindFileExplorerContextMenu();
        }
        return mounted;
    }

    const DOLPHIN_SIDEBAR_LABEL_TO_KEY = {
        'Dossier Personnel': 'Dossier Personnel',
        Bureau: 'Bureau',
        Documents: 'Documents',
        Musique: 'Musique',
        Images: 'Images',
        Vidéos: 'Vidéos',
        Téléchargements: 'Téléchargements',
        Corbeille: 'Corbeille',
        'Fichiers récents': 'Récent',
    };

    function repairExplorerSidebarPlaceLinks(root) {
        const sidebar = root && root.querySelector('#voletnemo');
        if (!sidebar) {
            return;
        }
        sidebar.querySelectorAll('a.dolphin-sidebar__link, a[data-link], a.nemo-sidebar__link').forEach((link) => {
            const current = String(link.getAttribute('data-link') || '').trim();
            if (current) {
                return;
            }
            const labelNode = link.querySelector('.dolphin-sidebar__label, .nemo-sidebar__label');
            const label = labelNode ? labelNode.textContent.replace(/\s+/g, ' ').trim() : '';
            const key = DOLPHIN_SIDEBAR_LABEL_TO_KEY[label];
            if (key) {
                link.setAttribute('data-link', key);
            }
        });
    }

    global.ensureExplorerAdvancedChrome = ensureExplorerAdvancedChrome;
    global.repairExplorerSidebarPlaceLinks = repairExplorerSidebarPlaceLinks;
    global.preloadExplorerAdvancedChrome = () => {
        const tasks = [loadFragmentMarkup()];
        if (isDolphinExplorer()) {
            tasks.push(loadDolphinMenuMarkup());
        }
        return Promise.all(tasks);
    };

    if (global.document) {
        global.document.addEventListener('DOMContentLoaded', () => {
            global.preloadExplorerAdvancedChrome().catch(() => {});
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
