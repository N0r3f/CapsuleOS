/**
 * Menu contextuel explorateur — branche par toolkit (ordre : Nemo Cinnamon → Dolphin/Nautilus) :
 *   Cinnamon Nemo (Mint) → bindNemoContextMenu — menu dynamique .nemo-app__context-menu
 *   GNOME Nautilus (Rocky/Ubuntu/Fedora) → bindNautilusGnomeContextMenu (#nemo-context-menu)
 *   KDE Dolphin → bindNautilusGnomeContextMenu (#nemo-context-menu.dolphin-context-menu)
 */
(function initFileExplorerContextMenu(global) {
    'use strict';

    const getNemoRoot = () => {
        if (typeof global.getExplorerWindowSlot === 'function') {
            return global.getExplorerWindowSlot();
        }
        return global.document.getElementById('nemo')
            || global.document.querySelector('div.windowElement#nemo[data-link="nemo"]');
    };

    const isNautilusGnome = () => (
        typeof global.isNautilusGnomeTemplate === 'function' && global.isNautilusGnomeTemplate()
    );

    const resolveContextMenuRoot = (scope) => scope || getNemoRoot();

    const queryScopeMain = (root, selector) => (
        root && typeof root.querySelector === 'function' ? root.querySelector(selector) : null
    );

    const isRegistryNautilusFamily = () => (
        typeof global.CapsuleExplorerRegistry !== 'undefined'
        && typeof global.CapsuleExplorerRegistry.isNautilusFamily === 'function'
        && global.CapsuleExplorerRegistry.isNautilusFamily()
    );

    const isRegistryNemoFamily = () => (
        typeof global.CapsuleExplorerRegistry !== 'undefined'
        && typeof global.CapsuleExplorerRegistry.isNemoFamily === 'function'
        && global.CapsuleExplorerRegistry.isNemoFamily()
    );

    const isRegistryDolphinFamily = () => (
        typeof global.CapsuleExplorerRegistry !== 'undefined'
        && typeof global.CapsuleExplorerRegistry.isDolphinFamily === 'function'
        && global.CapsuleExplorerRegistry.isDolphinFamily()
    );

    const isNautilusGnomeScope = (scope) => {
        const root = resolveContextMenuRoot(scope);
        if (queryScopeMain(root, 'main#gestionnaire.dolphin-app')) {
            return false;
        }
        if (queryScopeMain(root, 'main#gestionnaire.nemo-app:not(.nautilus-app)')) {
            return false;
        }
        if (queryScopeMain(root, 'main#gestionnaire.nautilus-app')) {
            return true;
        }
        if (isRegistryNautilusFamily()) {
            return true;
        }
        return isNautilusGnome();
    };

    const isNemoCinnamonScope = (scope) => {
        const root = resolveContextMenuRoot(scope);
        if (queryScopeMain(root, 'main#gestionnaire.dolphin-app')) {
            return false;
        }
        if (queryScopeMain(root, 'main#gestionnaire.nautilus-app')) {
            return false;
        }
        if (queryScopeMain(root, 'main#gestionnaire.nemo-app:not(.nautilus-app)')) {
            return true;
        }
        if (isRegistryDolphinFamily()) {
            return false;
        }
        if (isRegistryNemoFamily()) {
            return true;
        }
        if (typeof global.isNemoTemplate === 'function') {
            return global.isNemoTemplate();
        }
        return false;
    };

    const isDolphinScope = (scope) => {
        const root = resolveContextMenuRoot(scope);
        if (queryScopeMain(root, 'main#gestionnaire.dolphin-app')) {
            return true;
        }
        return typeof global.isDolphinTemplate === 'function' && global.isDolphinTemplate();
    };

    /* ── GNOME Nautilus (shell-gnome.html, #nemo-context-menu) ── */

    let contextTarget = null;
    let contextProfile = 'background';

    const getNautilusMenu = (root) => root.querySelector('#nemo-context-menu');

    const closeNautilusMenu = (menu) => {
        if (!menu) {
            return;
        }
        menu.hidden = true;
        contextTarget = null;
    };

    const resolveContextProfile = (root, target, options) => {
        options = options || {};
        if (options.sidebarTrash) {
            return 'trash';
        }
        const path = global.fileExplorerState && global.fileExplorerState.currentPath;
        const trashPlace = global.CAPSULE_PLACE_TRASH || '__capsule/place/trash';
        if (path === trashPlace) {
            return target ? 'trash-item' : 'trash';
        }
        if (!target) {
            return 'background';
        }
        if (isDolphinScope(root)) {
            const itemType = target.dataset && target.dataset.itemType === 'folder' ? 'folder' : 'file';
            return itemType === 'folder' ? 'item-folder' : 'item-file';
        }
        return 'item';
    };

    const syncDolphinContextLabels = (menu, profile) => {
        menu.querySelectorAll('[data-dolphin-ctx-label-folder]').forEach((labelNode) => {
            const folderLabel = labelNode.dataset.dolphinCtxLabelFolder;
            const fileLabel = labelNode.dataset.dolphinCtxLabelFile;
            if (profile === 'item-file' && fileLabel) {
                labelNode.textContent = fileLabel;
            } else if (folderLabel) {
                labelNode.textContent = folderLabel;
            }
        });
    };

    const applyMenuScope = (menu, profile) => {
        contextProfile = profile || 'background';
        global.__nautilusContextMenuProfile = contextProfile;
        menu.querySelectorAll('[data-nemo-ctx-scope]').forEach((node) => {
            const scopes = String(node.dataset.nemoCtxScope || '').split(/\s+/).filter(Boolean);
            const show = scopes.includes(profile)
                || scopes.includes('both')
                || (profile === 'item-folder' && scopes.includes('item'))
                || (profile === 'item-file' && scopes.includes('item'));
            node.hidden = !show;
        });
        if (isDolphinScope()) {
            syncDolphinContextLabels(menu, profile);
        }
        if (typeof global.syncNautilusClipboardUi === 'function') {
            global.syncNautilusClipboardUi();
        }
    };

    const selectContextTarget = (root, target) => {
        const grid = root && root.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid) {
            return;
        }
        grid.querySelectorAll('.nemo-app__item--selected').forEach((el) => {
            el.classList.remove('nemo-app__item--selected');
        });
        if (target) {
            target.classList.add('nemo-app__item--selected');
            if (typeof global.updateNautilusSelectionStatus === 'function') {
                global.updateNautilusSelectionStatus(target);
            }
        } else if (typeof global.updateNautilusSelectionStatus === 'function') {
            global.updateNautilusSelectionStatus(null);
        }
    };

    const openNautilusMenu = (menu, clientX, clientY, target, root, options) => {
        options = options || {};
        contextTarget = target || null;
        if (root) {
            selectContextTarget(root, target);
        }
        applyMenuScope(menu, resolveContextProfile(root, target, options));
        menu.hidden = false;
        const rect = menu.getBoundingClientRect();
        const maxLeft = global.innerWidth - rect.width - 8;
        const maxTop = global.innerHeight - rect.height - 8;
        menu.style.left = `${Math.max(8, Math.min(clientX, maxLeft))}px`;
        menu.style.top = `${Math.max(8, Math.min(clientY, maxTop))}px`;
    };

    const getItemFromLink = (link) => {
        if (!link || !link.dataset) {
            return null;
        }
        const name = link.dataset.itemName;
        if (!name) {
            return null;
        }
        return {
            name: name,
            type: link.dataset.itemType || 'file',
            folderPath: link.dataset.itemFolderPath || '',
            targetPath: link.dataset.itemTargetPath || '',
            href: link.dataset.itemHref || ''
        };
    };

    const showItemProperties = (item) => {
        if (typeof global.openExplorerProperties === 'function') {
            global.openExplorerProperties(item);
            return;
        }
        if (!item) {
            const path = global.fileExplorerState && global.fileExplorerState.currentPath;
            global.alert(`Emplacement : ${path || '—'}`);
            return;
        }
        const kind = item.type === 'folder' ? 'Dossier' : 'Fichier';
        const location = item.targetPath || (item.folderPath ? `${item.folderPath}/${item.name}` : item.name);
        global.alert(`${kind} : ${item.name}\nEmplacement : ${location}`);
    };

    const resolveExplorerTerminalCwd = (itemData) => {
        if (itemData && itemData.type === 'folder' && itemData.targetPath) {
            return itemData.targetPath;
        }
        if (global.fileExplorerState && global.fileExplorerState.currentPath) {
            return global.fileExplorerState.currentPath;
        }
        return null;
    };

    const openContextItem = (item, link) => {
        if (!item || !link) {
            return;
        }
        if (typeof global.activateNautilusExplorerItem === 'function') {
            const path = link.dataset.itemFolderPath
                || (global.fileExplorerState && global.fileExplorerState.currentPath)
                || '';
            const payload = Object.assign({}, item, {
                path: item.targetPath || item.path,
                href: item.href || link.dataset.itemHref,
                type: item.type || link.dataset.itemType,
            });
            global.activateNautilusExplorerItem(link, payload, path);
            return;
        }
        if (item.type === 'folder' && item.targetPath && typeof global.navigateToFileExplorerDirectory === 'function') {
            const explorerRoot = link.closest('.windowElement[data-link="nemo"]');
            global.navigateToFileExplorerDirectory(item.targetPath, {
                updateHistory: true,
                explorerRoot: explorerRoot || undefined,
            });
            return;
        }
        link.click();
    };

    const selectAllItems = (root) => {
        const grid = root.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid) {
            return;
        }
        const links = Array.prototype.slice.call(grid.querySelectorAll('a[data-item-name]'));
        if (!links.length) {
            return;
        }
        links.forEach((link) => link.classList.add('nemo-app__item--selected'));
        if (typeof global.updateNautilusSelectionStatus === 'function') {
            global.updateNautilusSelectionStatus(links[links.length - 1]);
        }
    };

    const CONTEXT_MENU_ICONS = {
        'document-open': './assets/icons/gnome/adwaita/places/document-open-recent-symbolic.svg',
        'open-menu': './assets/icons/gnome/adwaita/symbolic/actions/open-menu-symbolic.svg',
        'folder-new': './assets/icons/gnome/adwaita/symbolic/actions/folder-new-symbolic.svg',
        'user-trash': './assets/icons/gnome/adwaita/places/user-trash-symbolic.svg',
        'utilities-terminal': './assets/images/toolkits/kde/apps/utilities-terminal.svg',
        'edit-undo': './assets/icons/gnome/adwaita/symbolic/actions/go-previous-symbolic.svg',
        'document-properties': './assets/icons/gnome/adwaita/symbolic/actions/view-more-symbolic.svg',
        'edit-select-all': './assets/icons/gnome/adwaita/symbolic/actions/view-grid-symbolic.svg',
    };

    const resolveMenuIconUrl = (path) => {
        if (typeof global.resolveCapsuleResourceUrl === 'function') {
            return global.resolveCapsuleResourceUrl(path);
        }
        return path;
    };

    const decorateContextMenuIcons = (menu) => {
        menu.querySelectorAll('[data-nemo-ctx-icon]').forEach((item) => {
            if (item.querySelector('.nautilus-context-menu__icon, .nautilus-context-menu__icon--spacer')) {
                return;
            }
            const key = item.dataset.nemoCtxIcon;
            const path = CONTEXT_MENU_ICONS[key];
            if (path) {
                const icon = global.document.createElement('img');
                icon.className = 'nautilus-context-menu__icon';
                icon.alt = '';
                icon.src = resolveMenuIconUrl(path);
                item.insertBefore(icon, item.firstChild);
            } else {
                const spacer = global.document.createElement('span');
                spacer.className = 'nautilus-context-menu__icon--spacer';
                spacer.setAttribute('aria-hidden', 'true');
                item.insertBefore(spacer, item.firstChild);
            }
        });
    };

    const bindNautilusMenuActions = (root, menu) => {
        menu.querySelectorAll('[data-nemo-ctx]').forEach((item) => {
            if (item.dataset.nemoCtxBound === 'true') {
                return;
            }
            item.addEventListener('click', async (event) => {
                event.preventDefault();
                const action = item.dataset.nemoCtx;
                const link = contextTarget;
                const itemData = getItemFromLink(link);
                closeNautilusMenu(menu);

                if (action === 'open') {
                    openContextItem(itemData, link);
                    return;
                }
                if (action === 'new-folder' && typeof global.createNewFolderInCurrentDirectory === 'function') {
                    global.createNewFolderInCurrentDirectory();
                    return;
                }
                if (action === 'open-terminal') {
                    const cwd = resolveExplorerTerminalCwd(itemData);
                    if (typeof global.openTerminalWithExplorerContext === 'function') {
                        global.openTerminalWithExplorerContext(cwd);
                    } else if (typeof global.openWindowByDataLink === 'function') {
                        global.openWindowByDataLink('terminal');
                    }
                    return;
                }
                if (action === 'empty-trash' && typeof global.emptyNautilusTrash === 'function') {
                    await global.emptyNautilusTrash();
                    return;
                }
                if (action === 'restore-trash' && typeof global.restoreNautilusTrashSelection === 'function') {
                    await global.restoreNautilusTrashSelection();
                    return;
                }
                if (action === 'delete-forever' && typeof global.deleteNautilusTrashSelectionPermanently === 'function') {
                    await global.deleteNautilusTrashSelectionPermanently();
                    return;
                }
                if (action === 'open-with' && typeof global.openExplorerSelectionWith === 'function') {
                    global.openExplorerSelectionWith();
                    return;
                }
                if (action === 'select-all') {
                    selectAllItems(root);
                    return;
                }
                if (action === 'cut' && typeof global.cutExplorerSelection === 'function') {
                    global.cutExplorerSelection();
                    return;
                }
                if (action === 'copy' && typeof global.copyExplorerSelection === 'function') {
                    global.copyExplorerSelection();
                    return;
                }
                if (action === 'paste' && typeof global.pasteExplorerClipboard === 'function') {
                    await global.pasteExplorerClipboard();
                    return;
                }
                if (action === 'move-to' && typeof global.transferExplorerSelectionToPath === 'function') {
                    await global.transferExplorerSelectionToPath('move');
                    return;
                }
                if (action === 'copy-to' && typeof global.transferExplorerSelectionToPath === 'function') {
                    await global.transferExplorerSelectionToPath('copy');
                    return;
                }
                if (action === 'rename') {
                    if (link && typeof global.startExplorerInlineRename === 'function') {
                        await global.startExplorerInlineRename(link);
                    } else if (typeof global.renameExplorerSelection === 'function') {
                        await global.renameExplorerSelection();
                    }
                    return;
                }
                if (action === 'compress' && typeof global.compressExplorerSelection === 'function') {
                    await global.compressExplorerSelection();
                    return;
                }
                if (action === 'trash' && typeof global.trashExplorerSelection === 'function') {
                    await global.trashExplorerSelection();
                    return;
                }
                if (action === 'properties') {
                    showItemProperties(itemData);
                }
            });
            item.dataset.nemoCtxBound = 'true';
        });
    };

    const bindNautilusContentContextMenu = (root, menu) => {
        const grid = root.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid || grid.dataset.nemoContextMenuBound === 'true') {
            return;
        }

        grid.addEventListener('contextmenu', (event) => {
            const itemLink = event.target.closest('a[data-item-name]');
            if (itemLink && grid.contains(itemLink)) {
                event.preventDefault();
                openNautilusMenu(menu, event.clientX, event.clientY, itemLink, root);
                return;
            }
            if (event.target.closest('a, button, input, .nemo-app__list-header, .nemo-app__item-rename-input')) {
                return;
            }
            event.preventDefault();
            openNautilusMenu(menu, event.clientX, event.clientY, null, root);
        });

        grid.dataset.nemoContextMenuBound = 'true';
    };

    const bindNautilusSidebarContextMenu = (root, menu) => {
        const sidebar = root.querySelector('#voletnemo');
        if (!sidebar || sidebar.dataset.nemoSidebarContextMenuBound === 'true') {
            return;
        }
        sidebar.addEventListener('contextmenu', (event) => {
            const trashLink = event.target.closest('a[data-link="Corbeille"]');
            if (!trashLink || !sidebar.contains(trashLink)) {
                return;
            }
            event.preventDefault();
            openNautilusMenu(menu, event.clientX, event.clientY, null, root, { sidebarTrash: true });
        });
        sidebar.dataset.nemoSidebarContextMenuBound = 'true';
    };

    function bindNautilusGnomeContextMenu(scope) {
        if (!isNautilusGnomeScope(scope) && !isDolphinScope(scope)) {
            return;
        }
        const root = scope || getNemoRoot();
        const menu = root && getNautilusMenu(root);
        if (!root || !menu) {
            return;
        }
        if (root.dataset.nemoContextMenuInit === 'true') {
            return;
        }

        decorateContextMenuIcons(menu);
        bindNautilusMenuActions(root, menu);
        bindNautilusContentContextMenu(root, menu);
        bindNautilusSidebarContextMenu(root, menu);

        global.document.addEventListener('click', (event) => {
            if (!menu.hidden && !menu.contains(event.target)) {
                closeNautilusMenu(menu);
            }
        });
        global.document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeNautilusMenu(menu);
            }
        });
        global.addEventListener('resize', () => closeNautilusMenu(menu));

        root.dataset.nemoContextMenuInit = 'true';
    }

    /* ── Cinnamon Nemo (menu dynamique) ── */

    var NEMO_MENU_ID = 'nemo-file-context-menu';

    var NEMO_OPEN_WITH_APPS = [
        { action: 'open-with-app', label: 'Éditeur de texte', appId: 'text_editor' },
        { action: 'open-with-app', label: 'Visionneur d\'images', appId: 'visionneur_images' },
        { action: 'open-with-app', label: 'Visionneur de documents', appId: 'visionneur_pdf' },
        { action: 'open-with-app', label: 'Lecteur multimédia', appId: 'lecteur_multimedia' },
    ];

    var NEMO_DOCUMENT_TEMPLATES = [
        { action: 'new-document-template', label: 'Document vide', fileName: 'Nouveau document.txt' },
        { action: 'new-document-template', label: 'Feuille de calcul', fileName: 'Nouvelle feuille.ods' },
        { action: 'new-document-template', label: 'Présentation', fileName: 'Nouvelle présentation.odp' },
    ];

    var NEMO_ITEMS = [
        { action: 'new-folder', label: 'Créer un nouveau dossier', scopes: 'background' },
        {
            action: 'new-document',
            label: 'Créer un nouveau document',
            scopes: 'background',
            submenu: NEMO_DOCUMENT_TEMPLATES,
        },
        { sep: true, scopes: 'background item multi' },
        { action: 'open', label: 'Ouvrir', scopes: 'item' },
        {
            action: 'open-with',
            label: 'Ouvrir avec…',
            scopes: 'item',
            submenu: NEMO_OPEN_WITH_APPS,
        },
        { sep: true, scopes: 'item multi' },
        { action: 'cut', label: 'Couper', scopes: 'item multi' },
        { action: 'copy', label: 'Copier', scopes: 'item multi' },
        { action: 'paste', label: 'Coller', scopes: 'background item multi' },
        { action: 'rename', label: 'Renommer', scopes: 'item' },
        { action: 'compress', label: 'Compresser…', scopes: 'item multi' },
        { action: 'trash', label: 'Déplacer vers la corbeille', scopes: 'item multi' },
        { action: 'restore-trash', label: 'Restaurer', scopes: 'trash-item' },
        { action: 'delete-forever', label: 'Supprimer définitivement', scopes: 'trash-item' },
        { sep: true, scopes: 'background item trash trash-item sidebar-trash' },
        { action: 'open-terminal', label: 'Ouvrir dans un terminal', scopes: 'background' },
        { action: 'select-all', label: 'Tout sélectionner', scopes: 'background' },
        { action: 'empty-trash', label: 'Vider la corbeille', scopes: 'trash sidebar-trash' },
        { action: 'open', label: 'Ouvrir', scopes: 'sidebar-place' },
        { action: 'remove-place', label: 'Supprimer', scopes: 'sidebar-place' },
        { action: 'empty-trash', label: 'Vider la corbeille', scopes: 'sidebar-place' },
        { action: 'properties', label: 'Propriétés', scopes: 'background item multi sidebar-place' },
    ];

    function pinNemoContextMenuOverlay(menu) {
        if (!menu || !menu.style) {
            return;
        }
        /* Hors flux flex .windowElement — le skin seul ne suffit pas (computed → relative). */
        menu.style.setProperty('position', 'fixed', 'important');
        menu.style.setProperty('z-index', '12000');
        menu.style.setProperty('margin', '0');
        menu.style.setProperty('width', 'max-content');
    }

    function ensureNemoMenu(scope) {
        var existing = scope.querySelector('.nemo-app__context-menu');
        if (existing) {
            pinNemoContextMenuOverlay(existing);
            return existing;
        }

        var menu = global.document.createElement('nav');
        menu.id = NEMO_MENU_ID;
        menu.className = 'nemo-app__context-menu';
        menu.setAttribute('role', 'menu');
        menu.hidden = true;

        NEMO_ITEMS.forEach(function (item) {
            if (item.sep) {
                var hr = global.document.createElement('hr');
                hr.className = 'nemo-app__context-sep';
                hr.dataset.nemoCtxScope = item.scopes || 'background item';
                menu.appendChild(hr);
                return;
            }
            var row = global.document.createElement('div');
            row.className = 'nemo-app__context-row';
            row.dataset.nemoCtxScope = item.scopes || 'background item';
            var btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'nemo-app__context-item';
            btn.setAttribute('role', 'menuitem');
            btn.dataset.nemoCtxAction = item.action;
            btn.textContent = item.label;
            if (item.submenu && item.submenu.length) {
                btn.classList.add('has-submenu');
                btn.setAttribute('aria-haspopup', 'true');
                var sub = global.document.createElement('div');
                sub.className = 'nemo-app__context-submenu';
                sub.setAttribute('role', 'menu');
                sub.hidden = true;
                item.submenu.forEach(function (subItem) {
                    var subBtn = global.document.createElement('button');
                    subBtn.type = 'button';
                    subBtn.className = 'nemo-app__context-item';
                    subBtn.setAttribute('role', 'menuitem');
                    subBtn.dataset.nemoCtxAction = subItem.action;
                    subBtn.textContent = subItem.label;
                    if (subItem.appId) {
                        subBtn.dataset.nemoCtxAppId = subItem.appId;
                    }
                    if (subItem.fileName) {
                        subBtn.dataset.nemoCtxFileName = subItem.fileName;
                    }
                    sub.appendChild(subBtn);
                });
                row.appendChild(btn);
                row.appendChild(sub);
            } else {
                row.appendChild(btn);
            }
            menu.appendChild(row);
        });

        scope.appendChild(menu);
        pinNemoContextMenuOverlay(menu);
        return menu;
    }

    function closeNemoMenu(menu) {
        if (!menu) {
            return;
        }
        menu.hidden = true;
    }

    function openNemoMenu(menu, clientX, clientY) {
        pinNemoContextMenuOverlay(menu);
        menu.hidden = false;
        var rect = menu.getBoundingClientRect();
        var maxLeft = global.innerWidth - rect.width - 8;
        var maxTop = global.innerHeight - rect.height - 8;
        menu.style.left = Math.max(8, Math.min(clientX, maxLeft)) + 'px';
        menu.style.top = Math.max(8, Math.min(clientY, maxTop)) + 'px';
    }

    function getNemoTargetItem(event, scope) {
        var link = event.target.closest('a[data-item-name]');
        if (link && scope.contains(link)) {
            return link;
        }
        return null;
    }

    function countNemoSelectedItems(scope) {
        var grid = scope && scope.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid) {
            return 0;
        }
        return grid.querySelectorAll('a.nemo-app__item--selected').length;
    }

    function resolveNemoProfile(activeItem, options) {
        options = options || {};
        if (options.sidebarTrash) {
            return 'sidebar-trash';
        }
        if (options.sidebarPlace) {
            return 'sidebar-place';
        }
        if (options.multiSelect) {
            return 'multi';
        }
        var path = global.fileExplorerState && global.fileExplorerState.currentPath;
        var trashPlace = global.CAPSULE_PLACE_TRASH || '__capsule/place/trash';
        if (path === trashPlace) {
            return activeItem ? 'trash-item' : 'trash';
        }
        return activeItem ? 'item' : 'background';
    }

    function isNemoTrashEmpty() {
        if (typeof global.getNautilusVirtualPlaceItems === 'function') {
            var trashPlace = global.CAPSULE_PLACE_TRASH || '__capsule/place/trash';
            var items = global.getNautilusVirtualPlaceItems(trashPlace);
            return !items || !items.length;
        }
        if (typeof global.getExplorerStorageKey === 'function') {
            try {
                var rawTrash = global.localStorage
                    && global.localStorage.getItem(global.getExplorerStorageKey('trash'));
                var trashItems = rawTrash ? JSON.parse(rawTrash) : [];
                return !Array.isArray(trashItems) || trashItems.length === 0;
            } catch (trashErr) {
                return true;
            }
        }
        return true;
    }

    function syncNemoMenuScope(menu, profile, itemLink) {
        menu.querySelectorAll('[data-nemo-ctx-scope]').forEach(function (node) {
            var scopes = String(node.dataset.nemoCtxScope || '').split(/\s+/);
            var show = scopes.indexOf(profile) >= 0;
            if (node.classList.contains('nemo-app__context-sep')) {
                node.hidden = !show;
                return;
            }
            node.hidden = !show;
            if (!show) {
                return;
            }
            var btn = node.classList.contains('nemo-app__context-item')
                ? node
                : node.querySelector('.nemo-app__context-item');
            if (!btn) {
                return;
            }
            var action = btn.dataset.nemoCtxAction;
            var disabled = false;
            if (action === 'paste') {
                disabled = !(typeof global.nemoHasPasteClipboard === 'function'
                    && global.nemoHasPasteClipboard());
            } else if (action === 'new-folder' || action === 'new-document') {
                disabled = profile !== 'background';
            } else if (action === 'open-terminal' || action === 'select-all') {
                disabled = profile !== 'background';
            } else if (action === 'properties' && (profile === 'item' || profile === 'multi')) {
                disabled = !itemLink;
            } else if (action === 'open' && profile === 'multi') {
                disabled = true;
            } else if (action === 'open-with') {
                disabled = !itemLink || profile === 'multi'
                    || (itemLink.dataset && itemLink.dataset.itemType === 'folder');
            } else if (['cut', 'copy', 'rename', 'trash', 'compress'].indexOf(action) >= 0) {
                disabled = !itemLink;
            } else if (action === 'open') {
                disabled = !itemLink;
            } else if (['restore-trash', 'delete-forever'].indexOf(action) >= 0) {
                disabled = !itemLink;
            } else if (action === 'remove-place') {
                disabled = profile !== 'sidebar-place';
            } else if (action === 'empty-trash') {
                disabled = profile !== 'trash' && profile !== 'sidebar-trash' && profile !== 'sidebar-place';
                if (!disabled) {
                    disabled = isNemoTrashEmpty();
                }
            }
            btn.disabled = disabled;
        });
        var prevHidden = true;
        menu.querySelectorAll('.nemo-app__context-sep').forEach(function (sep) {
            if (sep.hidden) {
                return;
            }
            if (prevHidden) {
                sep.hidden = true;
            }
            prevHidden = false;
        });
    }

    function resolveNemoTerminalCwd(itemLink) {
        if (itemLink && itemLink.dataset && itemLink.dataset.itemType === 'folder') {
            const folderPath = itemLink.dataset.itemTargetPath;
            if (folderPath) {
                return folderPath;
            }
        }
        if (global.fileExplorerState && global.fileExplorerState.currentPath) {
            return global.fileExplorerState.currentPath;
        }
        return null;
    }

    function selectAllNemoItems(scope) {
        const grid = scope.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid) {
            return;
        }
        const links = Array.prototype.slice.call(grid.querySelectorAll('a[data-item-name]'));
        if (!links.length) {
            return;
        }
        links.forEach(function (link) {
            link.classList.add('nemo-app__item--selected');
        });
    }

    function runNemoAction(action, itemLink, scope, options) {
        options = options || {};
        if (action === 'new-folder' && typeof global.createNewFolderInCurrentDirectory === 'function') {
            global.createNewFolderInCurrentDirectory();
            return;
        }
        if (action === 'new-document' && typeof global.createNewDocumentInCurrentDirectory === 'function') {
            global.createNewDocumentInCurrentDirectory();
            return;
        }
        if (action === 'new-document-template' && typeof global.createNewDocumentInCurrentDirectory === 'function') {
            var templateName = options && options.fileName ? options.fileName : 'Nouveau document.txt';
            global.createNewDocumentInCurrentDirectory({ defaultName: templateName });
            return;
        }
        if (action === 'properties' && typeof global.openFileExplorerProperties === 'function') {
            global.openFileExplorerProperties(itemLink || null);
            return;
        }
        if (action === 'open' && itemLink && typeof itemLink.click === 'function') {
            itemLink.click();
            return;
        }
        if (action === 'open-with' && typeof global.openExplorerSelectionWith === 'function') {
            global.openExplorerSelectionWith(itemLink);
            return;
        }
        if (action === 'open-with-app' && typeof global.openExplorerSelectionWith === 'function') {
            var forcedApp = options && options.appId ? options.appId : '';
            global.openExplorerSelectionWith(itemLink, forcedApp);
            return;
        }
        if (action === 'copy' && itemLink && typeof global.copyExplorerSelection === 'function') {
            global.copyExplorerSelection(itemLink);
            return;
        }
        if (action === 'cut' && itemLink && typeof global.cutExplorerSelection === 'function') {
            global.cutExplorerSelection(itemLink);
            return;
        }
        if (action === 'paste' && typeof global.pasteExplorerClipboard === 'function') {
            global.pasteExplorerClipboard();
            return;
        }
        if (action === 'rename' && typeof global.renameExplorerSelection === 'function') {
            global.renameExplorerSelection(itemLink);
            return;
        }
        if (action === 'compress' && typeof global.compressExplorerSelection === 'function') {
            global.compressExplorerSelection(itemLink);
            return;
        }
        if (action === 'trash' && typeof global.trashExplorerSelection === 'function') {
            global.trashExplorerSelection(itemLink);
            return;
        }
        if (action === 'open-terminal') {
            const cwd = resolveNemoTerminalCwd(itemLink);
            if (typeof global.openTerminalWithExplorerContext === 'function') {
                global.openTerminalWithExplorerContext(cwd);
            } else if (typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink('terminal');
            }
            return;
        }
        if (action === 'select-all' && scope) {
            selectAllNemoItems(scope);
            return;
        }
        if (action === 'empty-trash' && typeof global.emptyNautilusTrash === 'function') {
            global.emptyNautilusTrash();
            return;
        }
        if (action === 'restore-trash' && typeof global.restoreNautilusTrashSelection === 'function') {
            global.restoreNautilusTrashSelection();
            return;
        }
        if (action === 'delete-forever' && typeof global.deleteNautilusTrashSelectionPermanently === 'function') {
            global.deleteNautilusTrashSelectionPermanently();
        }
        if (action === 'remove-place' && options && options.sidebarPlaceLink) {
            var placeRow = options.sidebarPlaceLink.closest('.places-item, a[data-link]');
            if (placeRow && placeRow.parentNode) {
                placeRow.parentNode.removeChild(placeRow);
            }
        }
        if (action === 'open' && options && options.sidebarPlaceLink && typeof options.sidebarPlaceLink.click === 'function') {
            options.sidebarPlaceLink.click();
        }
    }

    function selectNemoContextItem(scope, itemLink) {
        var grid = scope.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid) {
            return;
        }
        grid.querySelectorAll('.nemo-app__item--selected').forEach(function (el) {
            el.classList.remove('nemo-app__item--selected');
        });
        if (itemLink) {
            itemLink.classList.add('nemo-app__item--selected');
        }
    }

    function bindNemoContextMenu(scope) {
        if (!scope) {
            return;
        }
        if (scope.__nemoCtxMenuHandler) {
            scope.removeEventListener('contextmenu', scope.__nemoCtxMenuHandler);
            scope.__nemoCtxMenuHandler = null;
        }

        var menu = ensureNemoMenu(scope);
        var activeItem = null;
        var activeSidebarPlace = null;

        scope.__nemoCtxMenuHandler = function (event) {
            if (event.target.closest('.nemo-app__context-menu')) {
                return;
            }
            var trashLink = event.target.closest('#voletnemo a[data-link="Corbeille"]');
            if (trashLink && scope.contains(trashLink)) {
                event.preventDefault();
                activeItem = null;
                activeSidebarPlace = null;
                syncNemoMenuScope(menu, 'sidebar-trash', null);
                openNemoMenu(menu, event.clientX, event.clientY);
                return;
            }
            var placeLink = event.target.closest('#voletnemo a.places-item[data-link], #voletnemo .nemo-app__sidebar-places a[data-link]');
            if (placeLink && scope.contains(placeLink) && placeLink.dataset.link !== 'Corbeille') {
                event.preventDefault();
                activeItem = null;
                activeSidebarPlace = placeLink;
                syncNemoMenuScope(menu, 'sidebar-place', null);
                openNemoMenu(menu, event.clientX, event.clientY);
                return;
            }
            var pathbarHit = event.target.closest('.nemo-pathbar, .nemo-app__path-current, #nemo-path-label, #nemo-toggle-path-mode');
            if (pathbarHit && scope.contains(pathbarHit)) {
                event.preventDefault();
                activeItem = null;
                activeSidebarPlace = null;
                syncNemoMenuScope(menu, 'background', null);
                openNemoMenu(menu, event.clientX, event.clientY);
                return;
            }
            var content = scope.querySelector('.nemoElement, .nemo-app__content-grid');
            if (!content || !content.contains(event.target)) {
                return;
            }
            event.preventDefault();
            activeSidebarPlace = null;
            var selectedCount = countNemoSelectedItems(scope);
            activeItem = getNemoTargetItem(event, scope);
            if (selectedCount > 1) {
                activeItem = content.querySelector('a.nemo-app__item--selected') || activeItem;
            }
            if (selectedCount <= 1) {
                selectNemoContextItem(scope, activeItem);
            }
            var profile = resolveNemoProfile(activeItem, {
                multiSelect: selectedCount > 1,
            });
            syncNemoMenuScope(menu, profile, activeItem);
            openNemoMenu(menu, event.clientX, event.clientY);
        };
        scope.addEventListener('contextmenu', scope.__nemoCtxMenuHandler);

        function hideNemoSubmenus() {
            menu.querySelectorAll('.nemo-app__context-submenu').forEach(function (sub) {
                sub.hidden = true;
            });
        }

        menu.querySelectorAll('.nemo-app__context-row').forEach(function (row) {
            var parentBtn = row.querySelector(':scope > .nemo-app__context-item.has-submenu');
            var sub = row.querySelector('.nemo-app__context-submenu');
            if (parentBtn && sub) {
                parentBtn.addEventListener('mouseenter', function () {
                    if (parentBtn.disabled) {
                        return;
                    }
                    hideNemoSubmenus();
                    sub.hidden = false;
                    sub.classList.remove('nemo-app__context-submenu--flip-left');
                    var rowRect = row.getBoundingClientRect();
                    var subWidth = sub.offsetWidth || sub.scrollWidth || 176;
                    if (rowRect.right + subWidth > global.innerWidth - 8) {
                        sub.classList.add('nemo-app__context-submenu--flip-left');
                    }
                });
                row.addEventListener('mouseleave', function () {
                    sub.hidden = true;
                });
            }
        });

        menu.querySelectorAll('.nemo-app__context-item').forEach(function (btn) {
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (btn.classList.contains('has-submenu')) {
                    return;
                }
                var action = btn.dataset.nemoCtxAction;
                closeNemoMenu(menu);
                hideNemoSubmenus();
                runNemoAction(action, activeItem, scope, {
                    appId: btn.dataset.nemoCtxAppId || '',
                    fileName: btn.dataset.nemoCtxFileName || '',
                    sidebarPlaceLink: activeSidebarPlace || null,
                });
            });
        });

        global.document.addEventListener('click', function (event) {
            if (!menu.hidden && !menu.contains(event.target)) {
                closeNemoMenu(menu);
            }
        });

        global.document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeNemoMenu(menu);
            }
        });

        scope.dataset.nemoContextMenuInit = 'true';
    }

    /* ── Point d'entrée (contentLoader / fileExplorerCore) ── */

    function bindFileExplorerContextMenu(scope) {
        const root = resolveContextMenuRoot(scope);
        if (!root) {
            return;
        }
        /* Cinnamon Nemo en premier : le gabarit Dolphin partage .nemo-app sans .nautilus-app. */
        if (isNemoCinnamonScope(root)) {
            bindNemoContextMenu(root);
            return;
        }
        if (isDolphinScope(root) || isNautilusGnomeScope(root)) {
            bindNautilusGnomeContextMenu(root);
        }
    }

    global.bindFileExplorerContextMenu = bindFileExplorerContextMenu;

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', function onNemoContextRebind(event) {
            var detail = event.detail || {};
            if (detail.slotId === 'nemo' && detail.container && detail.container.dataset) {
                if (detail.container.__nemoCtxMenuHandler) {
                    detail.container.removeEventListener('contextmenu', detail.container.__nemoCtxMenuHandler);
                    detail.container.__nemoCtxMenuHandler = null;
                }
                delete detail.container.dataset.nemoContextMenuInit;
                var staleSidebar = detail.container.querySelector('#voletnemo');
                if (staleSidebar && staleSidebar.dataset) {
                    delete staleSidebar.dataset.nemoSidebarContextMenuBound;
                }
                var stale = detail.container.querySelector('.nemo-app__context-menu');
                if (stale) {
                    stale.parentNode.removeChild(stale);
                }
                global.setTimeout(function () {
                    bindFileExplorerContextMenu(detail.container);
                }, 0);
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
