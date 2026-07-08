/**
 * Toolkit KDE — Dolphin chrome (pivot Neon, propagation dérivés Plasma).
 * Skin : body#kde-neon | body#opensuse | body#mx-kde | body#debian-kde
 */
(function initDolphinKdeChrome(global) {
    'use strict';

    const ROOT_LABEL = 'Dossier Personnel';
    const ROOT_LABEL_RE = /Dossier personnel/g;
    const DOLPHIN_TITLE_SUFFIX = ' — Dolphin';
    const DOLPHIN_TITLE_SUFFIX_RE = /\s[-–—]\s*Dolphin\s*$/;
    const VIEW_ICONS = {
        icons: 'dolphin-ico--view-grid',
        compact: 'dolphin-ico--view-compact',
        list: 'dolphin-ico--view-list',
    };

    const viewConfigDraft = {
        mode: 'icons',
        sortOrder: 'asc',
        sortBy: 'name',
        foldersFirst: true,
        previews: true,
        groups: false,
        hiddenFiles: false,
        hiddenLast: false,
    };

    let viewConfigBaseline = null;
    let neonBindingsReady = false;

    const HAMBURGER_MENU_VERSION = '4';
    const KDE_NEMO_ASSETS = './assets/images/toolkits/kde/elements/nemo/';
    const KDE_MENU_PLASMA = './assets/images/toolkits/kde/menu/plasma/';
    const KDE_APPS_ASSETS = './assets/images/toolkits/kde/apps/';

    const hamburgerPanelState = {
        places: true,
        information: false,
        folders: false,
        terminal: false,
        locked: false,
    };

    const HAMBURGER_ITEMS = [
        { id: 'create-new', label: 'Créer un nouveau', icon: `${KDE_NEMO_ASSETS}add-new-file.svg`, submenu: 'create-new' },
        { id: 'select-mode', label: 'Sélectionner des fichiers et des dossiers', icon: `${KDE_NEMO_ASSETS}checkbox-empty.svg`, shortcut: 'Espace' },
        { id: 'view-actions', label: "Actions pour l'affichage courant", icon: `${KDE_NEMO_ASSETS}applications-system.svg`, submenu: 'view-actions' },
        { sep: true },
        { id: 'undo', label: 'Annuler', icon: `${KDE_NEMO_ASSETS}undo.svg`, shortcut: 'Ctrl+Z', disabled: true },
        { id: 'redo', label: 'Refaire', icon: `${KDE_NEMO_ASSETS}redo.svg`, shortcut: 'Ctrl+Maj+Z', disabled: true },
        { id: 'filter', label: 'Filtrer...', icon: `${KDE_MENU_PLASMA}view-filter.svg`, shortcut: 'Ctrl+I' },
        { sep: true },
        { id: 'new-window', label: 'Nouvelle fenêtre', icon: `${KDE_NEMO_ASSETS}screen.svg`, shortcut: 'Ctrl+N' },
        { id: 'new-tab', label: 'Nouvel onglet', icon: `${KDE_NEMO_ASSETS}tab-new.svg`, shortcut: 'Ctrl+T' },
        { id: 'terminal', label: 'Ouvrir un terminal', icon: `${KDE_APPS_ASSETS}utilities-terminal.svg`, shortcut: 'Maj+F4' },
        { sep: true },
        { id: 'panels', label: 'Afficher les panneaux', icon: `${KDE_NEMO_ASSETS}sidebar-tree-symbolic.svg`, submenu: 'panels' },
        { id: 'configure', label: 'Configurer', icon: `${KDE_MENU_PLASMA}preferences-system.svg`, submenu: 'configure' },
        { id: 'help', label: 'Aide', icon: `${KDE_NEMO_ASSETS}help-contents.svg`, submenu: 'help' },
        { sep: true },
        { id: 'more', label: 'Plus', icon: `${KDE_NEMO_ASSETS}open-menu-symbolic.svg`, submenu: 'more' },
    ];

    const HAMBURGER_SUBMENUS = {
        'create-new': [
            { id: 'create-dir', label: 'Créer un dossier…', icon: `${KDE_NEMO_ASSETS}new-folder.svg`, shortcut: 'Maj+Ctrl+N' },
            { id: 'create-file', label: 'Créer un fichier...', icon: `${KDE_NEMO_ASSETS}add-new-file.svg` },
            { sep: true },
            { id: 'template-document', label: 'Document', submenu: 'template-document' },
            { id: 'template-image', label: 'Image', submenu: 'template-image' },
            { id: 'template-audio', label: 'Audio', submenu: 'template-audio' },
            { id: 'template-other', label: 'Autre', submenu: 'template-other' },
        ],
        'template-document': [
            { id: 'plain-text', label: 'Texte brut', icon: `${KDE_NEMO_ASSETS}document-open-recent.svg` },
        ],
        'template-image': [],
        'template-audio': [],
        'template-other': [],
        'view-actions': [
            { id: 'cut', label: 'Couper…', icon: `${KDE_NEMO_ASSETS}cut.svg`, shortcut: 'Ctrl+X' },
            { id: 'copy', label: 'Copier...', icon: `${KDE_NEMO_ASSETS}copy.svg`, shortcut: 'Ctrl+C' },
            { id: 'paste', label: 'Coller le contenu du presse-papier', icon: `${KDE_NEMO_ASSETS}paste.svg`, shortcut: 'Ctrl+V' },
            { sep: true },
            { id: 'rename', label: 'Renommer...', icon: `${KDE_NEMO_ASSETS}keyboard-shortcuts.svg`, shortcut: 'F2' },
            { id: 'trash', label: 'Déplacer vers la corbeille...', icon: `${KDE_NEMO_ASSETS}user-trash-symbolic.svg`, shortcut: 'Suppr' },
            { sep: true },
            { id: 'properties', label: 'Propriétés', icon: `${KDE_NEMO_ASSETS}document-properties.svg`, shortcut: 'Alt+Retour' },
        ],
        panels: [
            { id: 'panel-places', label: 'Emplacements', shortcut: 'F9', checkable: true, checkedKey: 'places' },
            { id: 'panel-information', label: 'Informations', shortcut: 'F11', checkable: true, checkedKey: 'information' },
            { id: 'panel-folders', label: 'Dossiers', shortcut: 'F7', checkable: true, checkedKey: 'folders' },
            { id: 'panel-terminal', label: 'Terminal', shortcut: 'F4', checkable: true, checkedKey: 'terminal' },
            { sep: true },
            { id: 'panel-lock', label: 'Déverrouiller les panneaux', checkable: true, checkedKey: 'locked', dynamicLabel: true },
            { sep: true },
            { id: 'panel-show-hidden-places', label: 'Afficher les emplacements cachés' },
            { id: 'panel-focus-places', label: 'Mettre le focus sur le panneau «\u00a0Emplacements\u00a0»', shortcut: 'Ctrl+P' },
            { id: 'panel-focus-terminal', label: 'Mettre le focus sur le panneau Terminal' },
        ],
        configure: [
            { id: 'window-color-scheme', label: 'Schéma de couleurs de la fenêtre' },
            { sep: true },
            { id: 'switch-language', label: "Changer la langue de l'application" },
            { id: 'key-bindings', label: 'Configurer les raccourcis clavier...' },
            { id: 'configure-toolbars', label: "Configurer les barres d'outils" },
            { id: 'preferences', label: 'Configurer Dolphin...' },
        ],
        help: [
            { id: 'handbook', label: 'Manuel' },
            { id: 'whats-this', label: "Qu'est-ce que c'est ?" },
            { id: 'report-bug', label: 'Signaler un bogue...' },
            { id: 'donate', label: 'Faire un don à KDE...' },
            { sep: true },
            { id: 'about-dolphin', label: 'À propos de Dolphin' },
            { id: 'about-kde', label: 'À propos de KDE' },
        ],
        more: [
            { id: 'refresh', label: 'Rafraîchir', icon: `${KDE_NEMO_ASSETS}refresh.svg`, shortcut: 'F5' },
            { id: 'stop', label: 'Arrêter', icon: `${KDE_NEMO_ASSETS}cross.svg`, disabled: true },
            { id: 'show-hidden-files', label: 'Afficher les fichiers cachés', checkable: true },
            { id: 'sort', label: 'Trier par', submenu: 'sort' },
            { id: 'additional-info', label: 'Afficher des informations supplémentaires', checkable: true },
            { id: 'show-in-groups', label: 'Afficher par groupes', checkable: true },
            { id: 'view-settings', label: 'Configuration des affichages', icon: `${KDE_NEMO_ASSETS}view-grid-symbolic.svg` },
            { id: 'zoom', label: 'Zoom', icon: `${KDE_NEMO_ASSETS}zoom-in.svg`, submenu: 'zoom' },
            { id: 'show-menubar', label: 'Afficher la barre de menus' },
        ],
        sort: [
            { id: 'sort-name', label: 'Nom', checkable: true, checked: true },
            { id: 'sort-size', label: 'Taille' },
            { id: 'sort-modified', label: 'Modifié' },
            { id: 'sort-created', label: 'Créé' },
            { id: 'sort-accessed', label: 'Accès' },
            { id: 'sort-type', label: 'Type' },
            { id: 'sort-rating', label: 'Note' },
            { id: 'sort-tags', label: 'Étiquettes' },
            { id: 'sort-comment', label: 'Commentaire' },
            { sep: true },
            { id: 'sort-asc', label: 'A-Z', checkable: true, checked: true },
            { id: 'sort-desc', label: 'Z-A' },
        ],
        zoom: [
            { id: 'zoom-in', label: 'Zoom avant', icon: `${KDE_NEMO_ASSETS}zoom-in.svg`, shortcut: 'Ctrl++' },
            { id: 'zoom-out', label: 'Zoom arrière', icon: `${KDE_NEMO_ASSETS}zoom-out.svg`, shortcut: 'Ctrl+-' },
            { id: 'zoom-reset', label: 'Réinitialise le niveau de zoom', icon: `${KDE_NEMO_ASSETS}zoom-original.svg`, shortcut: 'Ctrl+0' },
        ],
    };

    let hamburgerSubmenuTimer = null;

    function getSlot() {
        const bodyId = global.document && global.document.body && global.document.body.id;
        if (!bodyId) {
            return null;
        }
        return global.document.querySelector(`body#${bodyId} div[data-link="nemo"]`);
    }

    function patchManifestRootLabel() {
        const state = global.fileExplorerState;
        if (state && state.manifest) {
            state.manifest.rootLabel = ROOT_LABEL;
        }
    }

    function normalizeNeonWindowTitle() {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        const titleEl = slot.querySelector('#windowTitle');
        if (!titleEl) {
            return;
        }
        let text = titleEl.textContent || '';
        if (ROOT_LABEL_RE.test(text)) {
            text = text.replace(ROOT_LABEL_RE, ROOT_LABEL);
        }
        text = text.replace(DOLPHIN_TITLE_SUFFIX_RE, DOLPHIN_TITLE_SUFFIX);
        if (text !== titleEl.textContent) {
            titleEl.textContent = text;
        }
    }

    function normalizeNeonRootLabels() {
        patchManifestRootLabel();
        const slot = getSlot();
        if (!slot) {
            return;
        }
        normalizeNeonWindowTitle();
        slot.querySelectorAll('.nemo-app__path-current, .nemo-app__path-crumb').forEach((node) => {
            if (node.textContent && ROOT_LABEL_RE.test(node.textContent)) {
                node.textContent = node.textContent.replace(ROOT_LABEL_RE, ROOT_LABEL);
            }
        });
    }

    function getExplorerRootPath() {
        return typeof global.getFileExplorerRoot === 'function'
            ? global.getFileExplorerRoot()
            : ROOT_LABEL;
    }

    function pathToCrumbLabel(displayPath) {
        const root = getExplorerRootPath();
        if (!displayPath || displayPath === root) {
            return ROOT_LABEL;
        }
        const leaf = String(displayPath).split('/').filter(Boolean).pop();
        return leaf ? leaf.replace(ROOT_LABEL_RE, ROOT_LABEL) : ROOT_LABEL;
    }

    function renderNeonPathCrumb(pathEl, displayPath) {
        if (!pathEl) {
            return;
        }
        const label = pathToCrumbLabel(displayPath);
        pathEl.replaceChildren();
        const prefix = global.document.createElement('span');
        prefix.className = 'dolphin-toolbar__crumb-prefix';
        prefix.setAttribute('aria-hidden', 'true');
        prefix.textContent = '>';
        pathEl.appendChild(prefix);
        pathEl.appendChild(global.document.createTextNode(label));
    }

    function ensureSecondaryPathBar() {
        const slot = getSlot();
        const toolbar = slot && slot.querySelector('.dolphin-toolbar');
        const primaryPath = slot && slot.querySelector('.dolphin-toolbar__path:not(.dolphin-toolbar__path--secondary)');
        if (!toolbar || !primaryPath) {
            return null;
        }
        const existing = toolbar.querySelector('#dolphin-toolbar-path-secondary');
        if (existing) {
            const closeBtn = existing.querySelector('#dolphin-split-close');
            if (closeBtn) {
                closeBtn.remove();
            }
            return existing;
        }
        const secondary = global.document.createElement('div');
        secondary.id = 'dolphin-toolbar-path-secondary';
        secondary.className = 'nemo-app__toolbar-group nemo-app__toolbar-group--path dolphin-toolbar__path dolphin-toolbar__path--secondary';
        secondary.hidden = true;
        secondary.setAttribute('aria-label', 'Emplacement volet droit');
        secondary.innerHTML = `
            <a href="#" class="nemo-app__path-current nemo-app__path-current--secondary"></a>`;
        primaryPath.insertAdjacentElement('afterend', secondary);
        return secondary;
    }

    function removeSecondaryPathBar() {
        const slot = getSlot();
        const secondary = slot && slot.querySelector('#dolphin-toolbar-path-secondary');
        if (!secondary) {
            return;
        }
        secondary.remove();
    }

    function scheduleNeonPathBarAlign() {
        global.requestAnimationFrame(() => {
            alignNeonDolphinPathBar();
            global.requestAnimationFrame(alignNeonDolphinPathBar);
        });
    }

    let compactLayoutTimer = null;

    function resetNeonCompactGridLayout(grid) {
        grid.classList.remove('nemo-app__content-grid--compact-wrap');
        grid.style.removeProperty('--dolphin-compact-cols');
        grid.style.removeProperty('height');
    }

    function measureNeonCompactContentHeight(grid) {
        const items = grid.querySelectorAll(':scope > a');
        if (!items.length) {
            return 0;
        }

        let total = 0;
        items.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const itemStyle = global.getComputedStyle(item);
            total += rect.height
                + (parseFloat(itemStyle.marginTop) || 0)
                + (parseFloat(itemStyle.marginBottom) || 0);
        });
        return total;
    }

    function layoutOneNeonCompactGrid(grid) {
        resetNeonCompactGridLayout(grid);

        const items = grid.querySelectorAll(':scope > a');
        if (!items.length) {
            return;
        }

        const styles = global.getComputedStyle(grid);
        const padY = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
        const availableHeight = grid.clientHeight - padY;
        if (availableHeight <= 0) {
            return;
        }

        const columnGap = parseFloat(styles.columnGap) || 0;
        const padX = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
        const innerWidth = grid.clientWidth - padX;
        const minColWidth = parseFloat(styles.getPropertyValue('--dolphin-compact-col-min')) || 140;
        const contentHeight = measureNeonCompactContentHeight(grid);
        const maxColsByWidth = Math.max(1, Math.floor((innerWidth + columnGap) / (minColWidth + columnGap)));

        let cols = 1;
        if (maxColsByWidth >= 2 && items.length > 1) {
            cols = 2;
        }
        if (contentHeight > availableHeight + 2) {
            cols = Math.max(cols, Math.min(Math.ceil(contentHeight / availableHeight), maxColsByWidth));
        }

        if (cols <= 1) {
            return;
        }

        grid.style.height = `${grid.clientHeight}px`;
        grid.style.setProperty('--dolphin-compact-cols', String(cols));
        grid.classList.add('nemo-app__content-grid--compact-wrap');
    }

    function normalizeNeonListViewCells() {
        const slot = getSlot();
        const state = global.fileExplorerState;
        if (!slot || !state || state.viewMode !== 'list') {
            return;
        }
        slot.querySelectorAll('.nemo-app__content-grid--list > a[data-item-type="folder"] > .nemo-app__item-size').forEach((el) => {
            el.textContent = '';
        });
    }

    function layoutNeonCompactColumns() {
        const slot = getSlot();
        if (!slot) {
            return;
        }

        const state = global.fileExplorerState;
        const grids = slot.querySelectorAll('.dolphin-content-pane > .nemo-app__content-grid--compact');
        if (!state || state.viewMode !== 'compact') {
            grids.forEach(resetNeonCompactGridLayout);
            return;
        }

        grids.forEach(layoutOneNeonCompactGrid);
    }

    function scheduleNeonCompactLayout() {
        if (compactLayoutTimer) {
            global.clearTimeout(compactLayoutTimer);
        }
        compactLayoutTimer = global.setTimeout(() => {
            compactLayoutTimer = null;
            layoutNeonCompactColumns();
            global.requestAnimationFrame(layoutNeonCompactColumns);
        }, 0);
    }

    let neonWindowGeometryTick = 0;

    function scheduleNeonWindowChromeRealign() {
        if (neonWindowGeometryTick) {
            return;
        }
        neonWindowGeometryTick = global.requestAnimationFrame(() => {
            neonWindowGeometryTick = 0;
            scheduleNeonPathBarAlign();
        });
    }

    function notifyNeonWindowGeometryChanged() {
        scheduleNeonWindowChromeRealign();
        scheduleNeonCompactLayout();
        global.setTimeout(scheduleNeonPathBarAlign, 120);
        global.setTimeout(scheduleNeonCompactLayout, 120);
    }

    function observeNemoWindowGeometry() {
        const slot = getSlot();
        if (!slot || slot.dataset.neonGeometryObserve === 'true') {
            return;
        }
        slot.dataset.neonGeometryObserve = 'true';
        const observer = new MutationObserver(() => {
            notifyNeonWindowGeometryChanged();
        });
        observer.observe(slot, {
            attributes: true,
            attributeFilter: ['data-maximized', 'style'],
        });
    }

    function wrapNemoWindowGeometryHook(name) {
        const original = global[name];
        if (typeof original !== 'function' || global[`__neon${name}Wrapped`]) {
            return;
        }
        global[`__neon${name}Wrapped`] = true;
        global[name] = function neonWrappedWindowGeometry(windowElement, ...rest) {
            const result = original.call(this, windowElement, ...rest);
            if (windowElement && windowElement.dataset && windowElement.dataset.link === 'nemo') {
                notifyNeonWindowGeometryChanged();
            }
            return result;
        };
    }

    function resolveHamburgerIconUrl(path) {
        if (!path) {
            return '';
        }
        if (typeof global.resolveCapsuleResourceUrl === 'function') {
            return global.resolveCapsuleResourceUrl(path);
        }
        return path;
    }

    function appendHamburgerMenuIcon(btn, iconSrc) {
        const icon = global.document.createElement('span');
        icon.className = 'dolphin-hamburger-menu__icon';
        icon.setAttribute('aria-hidden', 'true');
        if (iconSrc) {
            const img = global.document.createElement('img');
            img.className = 'dolphin-hamburger-menu__icon-img';
            img.src = resolveHamburgerIconUrl(iconSrc);
            img.alt = '';
            img.width = 16;
            img.height = 16;
            img.addEventListener('error', () => {
                img.remove();
            });
            icon.appendChild(img);
        }
        btn.appendChild(icon);
    }

    function appendHamburgerLeadingCell(btn, item) {
        if (item.checkable) {
            const check = global.document.createElement('span');
            check.className = 'dolphin-hamburger-menu__check';
            check.setAttribute('aria-hidden', 'true');
            btn.appendChild(check);
            return;
        }
        if (item.icon) {
            appendHamburgerMenuIcon(btn, item.icon);
            return;
        }
        const spacer = global.document.createElement('span');
        spacer.className = 'dolphin-hamburger-menu__icon-spacer';
        spacer.setAttribute('aria-hidden', 'true');
        btn.appendChild(spacer);
    }

    function getHamburgerPanelLabel(checkedKey) {
        if (checkedKey === 'locked') {
            return hamburgerPanelState.locked ? 'Verrouiller les panneaux' : 'Déverrouiller les panneaux';
        }
        return '';
    }

    function isHamburgerItemChecked(item) {
        if (item.checkedKey) {
            return !!hamburgerPanelState[item.checkedKey];
        }
        return !!item.checked;
    }

    function buildHamburgerFlyout(submenuId) {
        const items = HAMBURGER_SUBMENUS[submenuId];
        if (!items) {
            return null;
        }
        const flyout = global.document.createElement('div');
        flyout.className = 'dolphin-hamburger-menu__flyout';
        flyout.dataset.submenuId = submenuId;
        flyout.setAttribute('role', 'menu');
        flyout.hidden = true;
        items.forEach((item) => {
            if (item.sep) {
                const sep = global.document.createElement('div');
                sep.className = 'dolphin-hamburger-menu__sep';
                sep.setAttribute('role', 'separator');
                flyout.appendChild(sep);
                return;
            }
            const btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'dolphin-hamburger-menu__flyout-item';
            btn.dataset.menuId = item.id;
            btn.setAttribute('role', 'menuitem');
            if (item.submenu) {
                btn.classList.add('dolphin-hamburger-menu__flyout-item--submenu');
                btn.dataset.submenuId = item.submenu;
            }
            if (item.checkable) {
                btn.classList.add('dolphin-hamburger-menu__flyout-item--checkable');
                btn.setAttribute('aria-checked', isHamburgerItemChecked(item) ? 'true' : 'false');
                if (isHamburgerItemChecked(item)) {
                    btn.classList.add('is-checked');
                }
            }
            if (item.disabled) {
                btn.disabled = true;
            }
            appendHamburgerLeadingCell(btn, item);
            const label = global.document.createElement('span');
            label.className = 'dolphin-hamburger-menu__label';
            if (item.dynamicLabel && item.checkedKey === 'locked') {
                label.textContent = getHamburgerPanelLabel('locked');
            } else {
                label.textContent = item.label;
            }
            btn.appendChild(label);
            if (item.shortcut) {
                const shortcut = global.document.createElement('span');
                shortcut.className = 'dolphin-hamburger-menu__shortcut';
                shortcut.textContent = item.shortcut;
                btn.appendChild(shortcut);
            }
            flyout.appendChild(btn);
            if (item.submenu) {
                const nested = buildHamburgerFlyout(item.submenu);
                if (nested) {
                    btn.appendChild(nested);
                }
            }
        });
        return flyout;
    }

    function buildHamburgerMenuItem(item) {
        const btn = global.document.createElement('button');
        btn.type = 'button';
        btn.className = 'dolphin-hamburger-menu__item';
        btn.dataset.menuId = item.id;
        btn.setAttribute('role', 'menuitem');
        if (item.submenu) {
            btn.classList.add('dolphin-hamburger-menu__item--submenu');
            btn.dataset.submenuId = item.submenu;
        }
        if (item.disabled) {
            btn.disabled = true;
        }
        appendHamburgerMenuIcon(btn, item.icon);
        const label = global.document.createElement('span');
        label.className = 'dolphin-hamburger-menu__label';
        label.textContent = item.label;
        btn.appendChild(label);
        if (item.shortcut) {
            const shortcut = global.document.createElement('span');
            shortcut.className = 'dolphin-hamburger-menu__shortcut';
            shortcut.textContent = item.shortcut;
            btn.appendChild(shortcut);
        }
        if (item.submenu) {
            const flyout = buildHamburgerFlyout(item.submenu);
            if (flyout) {
                btn.appendChild(flyout);
            }
        }
        return btn;
    }

    function positionHamburgerFlyout(flyout, anchor) {
        if (!flyout || !anchor) {
            return;
        }
        flyout.style.left = '';
        flyout.style.right = '';
        flyout.style.top = '';
        const anchorRect = anchor.getBoundingClientRect();
        const host = flyout.offsetParent || flyout.parentElement;
        const hostRect = host && host.getBoundingClientRect ? host.getBoundingClientRect() : { top: 0, left: 0 };
        flyout.style.right = '100%';
        flyout.style.top = `${Math.max(0, anchorRect.top - hostRect.top - 4)}px`;
    }

    function closeHamburgerSubmenus() {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        slot.querySelectorAll('.dolphin-hamburger-menu__flyout').forEach((flyout) => {
            flyout.hidden = true;
        });
        slot.querySelectorAll('.dolphin-hamburger-menu__item--submenu.is-open, .dolphin-hamburger-menu__flyout-item--submenu.is-open')
            .forEach((node) => node.classList.remove('is-open'));
    }

    function isFlyoutChainAncestor(flyout, node) {
        let current = node;
        while (current) {
            if (current === flyout) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }

    function openHamburgerSubmenu(anchor, submenuId) {
        if (!anchor || !submenuId) {
            return;
        }
        const flyout = anchor.querySelector(`:scope > .dolphin-hamburger-menu__flyout[data-submenu-id="${submenuId}"]`);
        if (!flyout) {
            return;
        }
        const slot = getSlot();
        if (slot) {
            slot.querySelectorAll('.dolphin-hamburger-menu__flyout').forEach((node) => {
                if (node === flyout || isFlyoutChainAncestor(node, anchor)) {
                    return;
                }
                node.hidden = true;
            });
            slot.querySelectorAll('.dolphin-hamburger-menu__item--submenu.is-open, .dolphin-hamburger-menu__flyout-item--submenu.is-open')
                .forEach((node) => {
                    if (node === anchor || node.contains(anchor) || anchor.contains(node)) {
                        return;
                    }
                    node.classList.remove('is-open');
                });
        }
        flyout.hidden = false;
        positionHamburgerFlyout(flyout, anchor);
        anchor.classList.add('is-open');
    }

    function scheduleHamburgerSubmenu(anchor, submenuId) {
        if (hamburgerSubmenuTimer) {
            global.clearTimeout(hamburgerSubmenuTimer);
        }
        hamburgerSubmenuTimer = global.setTimeout(() => {
            openHamburgerSubmenu(anchor, submenuId);
        }, 120);
    }

    function syncHamburgerPanelUi() {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        const sidebar = slot.querySelector('#voletnemo');
        if (sidebar) {
            sidebar.hidden = !hamburgerPanelState.places;
        }
        slot.querySelectorAll('.dolphin-hamburger-menu__flyout-item[data-menu-id="panel-places"]').forEach((btn) => {
            btn.classList.toggle('is-checked', hamburgerPanelState.places);
            btn.setAttribute('aria-checked', hamburgerPanelState.places ? 'true' : 'false');
        });
        slot.querySelectorAll('.dolphin-hamburger-menu__flyout-item[data-menu-id="panel-lock"] .dolphin-hamburger-menu__label')
            .forEach((label) => {
                label.textContent = getHamburgerPanelLabel('locked');
            });
        slot.querySelectorAll('.dolphin-hamburger-menu__flyout-item[data-menu-id="panel-lock"]').forEach((btn) => {
            btn.classList.toggle('is-checked', hamburgerPanelState.locked);
            btn.setAttribute('aria-checked', hamburgerPanelState.locked ? 'true' : 'false');
        });
    }

    function ensureHamburgerMenu() {
        const slot = getSlot();
        const actions = slot && slot.querySelector('.dolphin-toolbar__actions');
        if (!actions) {
            return null;
        }
        let menu = actions.querySelector('#dolphin-hamburger-menu');
        if (menu && menu.dataset.hamburgerVersion === HAMBURGER_MENU_VERSION) {
            return menu;
        }
        if (menu) {
            menu.remove();
        }
        menu = global.document.createElement('div');
        menu.id = 'dolphin-hamburger-menu';
        menu.className = 'dolphin-hamburger-menu';
        menu.dataset.hamburgerVersion = HAMBURGER_MENU_VERSION;
        menu.setAttribute('role', 'menu');
        menu.hidden = true;
        HAMBURGER_ITEMS.forEach((item) => {
            if (item.sep) {
                const sep = global.document.createElement('div');
                sep.className = 'dolphin-hamburger-menu__sep';
                sep.setAttribute('role', 'separator');
                menu.appendChild(sep);
                return;
            }
            menu.appendChild(buildHamburgerMenuItem(item));
        });
        actions.appendChild(menu);
        syncHamburgerPanelUi();
        return menu;
    }

    function closeHamburgerMenu() {
        const slot = getSlot();
        const menu = slot && slot.querySelector('#dolphin-hamburger-menu');
        const trigger = slot && slot.querySelector('#dolphin-main-menu');
        if (hamburgerSubmenuTimer) {
            global.clearTimeout(hamburgerSubmenuTimer);
            hamburgerSubmenuTimer = null;
        }
        closeHamburgerSubmenus();
        if (menu) {
            menu.hidden = true;
        }
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
    }

    function openHamburgerMenu() {
        closeViewMenu();
        const slot = getSlot();
        const menu = ensureHamburgerMenu();
        const trigger = slot && slot.querySelector('#dolphin-main-menu');
        if (!menu || !trigger) {
            return;
        }
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
    }

    function toggleHamburgerMenu() {
        const menu = getSlot() && getSlot().querySelector('#dolphin-hamburger-menu');
        if (!menu) {
            openHamburgerMenu();
            return;
        }
        if (menu.hidden) {
            openHamburgerMenu();
        } else {
            closeHamburgerMenu();
        }
    }

    function resolveHamburgerMenuLabel(menuId) {
        const map = {
            'new-window': 'Nouvelle fenêtre',
            'new-tab': 'Nouvel onglet',
            terminal: 'Ouvrir un terminal',
            'create-dir': 'Créer un nouveau dossier',
            'create-file': 'Créer un nouveau dossier',
            'plain-text': 'Créer un nouveau dossier',
            cut: 'Couper',
            copy: 'Copier',
            paste: 'Coller',
            rename: 'Renommer',
            trash: 'Mettre à la corbeille',
            properties: 'Propriétés',
            preferences: 'Configuration',
            'configure-toolbars': 'Configuration',
            'key-bindings': 'Configuration',
            'switch-language': 'Configuration',
            handbook: 'Aide',
            'whats-this': 'Aide',
            'report-bug': 'Aide',
            donate: 'Aide',
            'about-dolphin': 'Aide',
            'about-kde': 'Aide',
            refresh: 'Actualiser',
            'view-settings': 'Configuration',
            'show-menubar': 'Configuration',
        };
        return map[menuId] || '';
    }

    function runHamburgerAction(menuId) {
        if (menuId === 'filter') {
            closeHamburgerMenu();
            openDolphinSearchBar({ openFilter: true });
            return;
        }
        if (menuId === 'select-mode' && typeof global.setExplorerStatusMessage === 'function') {
            global.setExplorerStatusMessage('Mode sélection : Espace pour basculer la sélection.');
            return;
        }
        if (menuId === 'panel-places') {
            hamburgerPanelState.places = !hamburgerPanelState.places;
            syncHamburgerPanelUi();
            global.setTimeout(alignNeonDolphinPathBar, 0);
            return;
        }
        if (menuId === 'panel-information') {
            hamburgerPanelState.information = !hamburgerPanelState.information;
            const slot = getSlot();
            const preview = slot && slot.querySelector('#dolphin-preview-pane');
            if (preview) {
                preview.hidden = !hamburgerPanelState.information;
            } else if (typeof global.setExplorerStatusMessage === 'function') {
                global.setExplorerStatusMessage('Panneau Informations non disponible dans cette vue.');
            }
            syncHamburgerPanelUi();
            return;
        }
        if (menuId === 'panel-folders' || menuId === 'panel-terminal') {
            if (typeof global.setExplorerStatusMessage === 'function') {
                global.setExplorerStatusMessage(menuId === 'panel-terminal'
                    ? 'Panneau Terminal : ouvrir via « Ouvrir un terminal ».'
                    : 'Panneau Dossiers non disponible dans CapsuleOS.');
            }
            return;
        }
        if (menuId === 'panel-lock') {
            hamburgerPanelState.locked = !hamburgerPanelState.locked;
            syncHamburgerPanelUi();
            return;
        }
        if (menuId === 'panel-show-hidden-places' && typeof global.setExplorerStatusMessage === 'function') {
            global.setExplorerStatusMessage('Emplacements cachés : non disponible dans CapsuleOS.');
            return;
        }
        if (menuId === 'panel-focus-places') {
            const slot = getSlot();
            const link = slot && slot.querySelector('#voletnemo .dolphin-sidebar__link');
            if (link && typeof link.focus === 'function') {
                link.focus();
            }
            return;
        }
        if (menuId === 'panel-focus-terminal' && typeof global.setExplorerStatusMessage === 'function') {
            global.setExplorerStatusMessage('Focus panneau Terminal : non disponible.');
            return;
        }
        if (menuId === 'window-color-scheme') {
            closeHamburgerMenu();
            if (typeof global.resolveFileExplorerMenuAction === 'function') {
                global.resolveFileExplorerMenuAction('Configuration', { type: 'top' });
            }
            return;
        }
        if (menuId === 'zoom-in' || menuId === 'zoom-out' || menuId === 'zoom-reset') {
            const slider = getSlot() && getSlot().querySelector('#zoom');
            if (slider) {
                const step = 10;
                const current = Number(slider.value) || 100;
                if (menuId === 'zoom-in') {
                    slider.value = String(Math.min(140, current + step));
                } else if (menuId === 'zoom-out') {
                    slider.value = String(Math.max(80, current - step));
                } else {
                    slider.value = '100';
                }
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            return;
        }
        if (menuId === 'view-settings') {
            closeHamburgerMenu();
            openViewConfigDialog();
            return;
        }
        const label = resolveHamburgerMenuLabel(menuId);
        if (label && typeof global.resolveFileExplorerMenuAction === 'function') {
            closeHamburgerMenu();
            global.resolveFileExplorerMenuAction(label, { type: 'top' });
            return;
        }
        if (typeof global.setExplorerStatusMessage === 'function') {
            global.setExplorerStatusMessage(`${menuId} : bientôt disponible.`);
        }
    }

    function handleHamburgerMenuPointer(event) {
        const submenuItem = event.target.closest('.dolphin-hamburger-menu__item--submenu, .dolphin-hamburger-menu__flyout-item--submenu');
        if (submenuItem && submenuItem.dataset.submenuId) {
            scheduleHamburgerSubmenu(submenuItem, submenuItem.dataset.submenuId);
            return;
        }
        if (event.type === 'mouseout') {
            const related = event.relatedTarget;
            if (related && related.closest && related.closest('.dolphin-hamburger-menu__flyout, .dolphin-hamburger-menu')) {
                return;
            }
        }
    }

    function resetNeonPathBarLayout() {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        slot.querySelectorAll('.dolphin-toolbar__path').forEach((group) => {
            group.style.marginLeft = '';
            group.style.width = '';
            group.style.maxWidth = '';
            group.style.minWidth = '';
            group.style.flex = '';
        });
    }

    function getPrimaryPathGroup() {
        const slot = getSlot();
        return slot && slot.querySelector('.dolphin-toolbar__path:not(.dolphin-toolbar__path--secondary)');
    }

    function syncNeonSplitToggleButton(open) {
        const splitToggle = getSlot() && getSlot().querySelector('#dolphin-split-toggle');
        if (!splitToggle) {
            return;
        }
        const ico = splitToggle.querySelector('.dolphin-ico');
        const label = splitToggle.querySelector('.dolphin-toolbar__btn-label');
        splitToggle.classList.toggle('dolphin-toolbar__btn--split-open', open);
        splitToggle.setAttribute('aria-pressed', open ? 'true' : 'false');
        if (open) {
            splitToggle.setAttribute('aria-label', 'Fermer la vue de droite');
            if (ico) {
                ico.className = 'dolphin-ico dolphin-ico--close-x';
            }
            if (label) {
                label.textContent = 'Fermer';
            }
        } else {
            splitToggle.setAttribute('aria-label', 'Scinder');
            if (ico) {
                ico.className = 'dolphin-ico dolphin-ico--split';
            }
            if (label) {
                label.textContent = 'Scinder';
            }
        }
    }

    function syncNeonDualPathLabels() {
        const slot = getSlot();
        const state = global.fileExplorerState;
        if (!slot || !state) {
            return;
        }
        const primaryEl = getPrimaryPathGroup() && getPrimaryPathGroup().querySelector('.nemo-app__path-current');
        const secondaryEl = slot.querySelector('.nemo-app__path-current--secondary');
        renderNeonPathCrumb(primaryEl, state.currentPath);
        renderNeonPathCrumb(secondaryEl, state.secondaryPath || state.currentPath);
    }

    function syncNeonSplitChrome() {
        const slot = getSlot();
        const state = global.fileExplorerState;
        if (!slot || !state) {
            return;
        }
        ensureHamburgerMenu();
        const primaryPathGroup = getPrimaryPathGroup();
        const open = !!state.splitView;
        const activePane = state.activePane || 'primary';
        const wasOpen = slot.dataset.neonSplitOpen === 'true';
        let secondaryPathGroup = null;

        if (open) {
            secondaryPathGroup = ensureSecondaryPathBar();
            if (secondaryPathGroup) {
                secondaryPathGroup.hidden = false;
            }
        } else {
            removeSecondaryPathBar();
        }

        if (primaryPathGroup) {
            primaryPathGroup.classList.toggle('dolphin-toolbar__path--active', open && activePane === 'primary');
        }
        if (secondaryPathGroup) {
            secondaryPathGroup.classList.toggle('dolphin-toolbar__path--active', open && activePane === 'secondary');
        }
        syncNeonSplitToggleButton(open);
        slot.dataset.neonSplitOpen = open ? 'true' : 'false';

        if (open) {
            syncNeonDualPathLabels();
        } else if (wasOpen) {
            resetNeonPathBarLayout();
            if (typeof global.updatePathDisplay === 'function') {
                global.updatePathDisplay();
            }
        }

        scheduleNeonPathBarAlign();
    }

    function alignNeonDolphinPathBar() {
        const slot = getSlot();
        if (!slot || slot.style.display === 'none') {
            return;
        }
        const toolbar = slot.querySelector('.dolphin-toolbar');
        const pathGroup = getPrimaryPathGroup();
        const grid = slot.querySelector('.nemo-app__content-grid[data-pane="primary"]')
            || slot.querySelector('.nemo-app__content-grid:not(.nemoElement--secondary)');
        const actions = slot.querySelector('.dolphin-toolbar__actions');
        const state = global.fileExplorerState;
        const splitOpen = !!(state && state.splitView);
        const secondaryPathGroup = slot.querySelector('#dolphin-toolbar-path-secondary');
        const secondaryGrid = slot.querySelector('.nemo-app__content-grid[data-pane="secondary"]');
        if (!toolbar || !pathGroup || !grid || !actions) {
            return;
        }
        if (grid.offsetParent === null || actions.offsetParent === null) {
            return;
        }

        const resetPathStyles = (group) => {
            if (!group) {
                return;
            }
            group.style.marginLeft = '0px';
            group.style.width = 'auto';
            group.style.maxWidth = 'none';
            group.style.minWidth = '0';
            group.style.flex = '';
        };

        resetPathStyles(pathGroup);
        if (splitOpen) {
            resetPathStyles(secondaryPathGroup);
        }

        if (!splitOpen) {
            const gridRect = grid.getBoundingClientRect();
            const pathRect = pathGroup.getBoundingClientRect();
            const splitBtn = slot.querySelector('#dolphin-split-toggle');
            const widthAnchor = splitBtn || actions;
            const anchorRect = widthAnchor.getBoundingClientRect();
            const delta = gridRect.left - pathRect.left;
            const width = Math.max(180, Math.round(anchorRect.left - gridRect.left - 8));

            pathGroup.style.marginLeft = `${Math.round(delta)}px`;
            pathGroup.style.width = `${width}px`;
            pathGroup.style.maxWidth = `${width}px`;
            pathGroup.style.minWidth = `${width}px`;
            pathGroup.style.flex = '0 0 auto';
            return;
        }

        const primaryGrid = grid.getBoundingClientRect();
        const secondaryRect = secondaryGrid && secondaryGrid.offsetParent !== null
            ? secondaryGrid.getBoundingClientRect()
            : null;
        const splitBtn = slot.querySelector('#dolphin-split-toggle');
        const splitRect = splitBtn ? splitBtn.getBoundingClientRect() : actions.getBoundingClientRect();
        const pathRect = pathGroup.getBoundingClientRect();
        const primaryDelta = primaryGrid.left - pathRect.left;
        const splitMid = secondaryRect
            ? secondaryRect.left - 8
            : primaryGrid.left + (splitRect.left - primaryGrid.left) / 2;
        const primaryWidth = Math.max(160, Math.round(splitMid - primaryGrid.left));
        pathGroup.style.marginLeft = `${Math.round(primaryDelta)}px`;
        pathGroup.style.width = `${primaryWidth}px`;
        pathGroup.style.maxWidth = `${primaryWidth}px`;
        pathGroup.style.minWidth = `${primaryWidth}px`;
        pathGroup.style.flex = '0 0 auto';

        if (secondaryPathGroup && secondaryRect) {
            const secPathRect = secondaryPathGroup.getBoundingClientRect();
            const secDelta = secondaryRect.left - secPathRect.left;
            const secondaryWidth = Math.max(140, Math.round(splitRect.left - secondaryRect.left - 8));
            secondaryPathGroup.style.marginLeft = `${Math.round(secDelta)}px`;
            secondaryPathGroup.style.width = `${secondaryWidth}px`;
            secondaryPathGroup.style.maxWidth = `${secondaryWidth}px`;
            secondaryPathGroup.style.minWidth = `${secondaryWidth}px`;
            secondaryPathGroup.style.flex = '0 0 auto';
        }
    }

    function ensureNeonSearchInActions() {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        const actions = slot.querySelector('.dolphin-toolbar__actions');
        const search = slot.querySelector('.dolphin-toolbar__search');
        const menuBtn = slot.querySelector('#dolphin-main-menu');
        if (!actions || !search || !menuBtn) {
            return;
        }
        search.classList.add('dolphin-toolbar__btn--search');
        if (search.parentElement !== actions) {
            actions.insertBefore(search, menuBtn);
            return;
        }
        if (search.nextElementSibling !== menuBtn) {
            actions.insertBefore(search, menuBtn);
        }
    }

    const SEARCH_ICON_BASE = './assets/icons/kde/nemo/';
    const SEARCH_KICKOFF_ICON_BASE = './assets/images/vendors/neon/kickoff/';
    const SEARCH_FILTER_ICON = `${KDE_MENU_PLASMA}view-filter.svg`;
    let dolphinSearchBarBound = false;

    function ensureDolphinSearchState() {
        const state = global.fileExplorerState;
        if (!state) {
            return null;
        }
        if (state.dolphinSearchScope !== 'here' && state.dolphinSearchScope !== 'everywhere') {
            state.dolphinSearchScope = 'here';
        }
        if (state.dolphinSearchIn !== 'names' && state.dolphinSearchIn !== 'content') {
            state.dolphinSearchIn = 'names';
        }
        if (state.dolphinSearchUsing !== 'simple' && state.dolphinSearchUsing !== 'indexing') {
            state.dolphinSearchUsing = 'simple';
        }
        return state;
    }

    function triggerDolphinSearchRender() {
        const state = ensureDolphinSearchState();
        if (!state) {
            return;
        }
        const panes = ['primary'];
        if (state.splitView) {
            panes.push('secondary');
        }
        panes.forEach((paneId) => {
            const path = paneId === 'secondary' ? state.secondaryPath : state.currentPath;
            if (path && typeof global.renderDirectory === 'function') {
                global.renderDirectory(path, { pane: paneId });
            }
        });
    }

    function syncDolphinSearchScopeUi() {
        const slot = getSlot();
        const state = ensureDolphinSearchState();
        if (!slot || !state) {
            return;
        }
        slot.querySelectorAll('[data-dolphin-search-scope]').forEach((btn) => {
            const active = btn.dataset.dolphinSearchScope === state.dolphinSearchScope;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function syncDolphinSearchFilterMenu() {
        const slot = getSlot();
        const state = ensureDolphinSearchState();
        if (!slot || !state) {
            return;
        }
        slot.querySelectorAll('[data-dolphin-search-in]').forEach((input) => {
            input.checked = input.value === state.dolphinSearchIn;
        });
        slot.querySelectorAll('[data-dolphin-search-using]').forEach((input) => {
            input.checked = input.value === state.dolphinSearchUsing;
        });
    }

    function closeDolphinSearchFilterMenu() {
        const slot = getSlot();
        const menu = slot && slot.querySelector('#dolphin-search-filter-menu');
        const btn = slot && slot.querySelector('#dolphin-search-filter-btn');
        if (menu) {
            menu.hidden = true;
        }
        if (btn) {
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    function openDolphinSearchFilterMenu() {
        const slot = getSlot();
        const menu = slot && slot.querySelector('#dolphin-search-filter-menu');
        const btn = slot && slot.querySelector('#dolphin-search-filter-btn');
        if (!menu || !btn) {
            return;
        }
        closeViewMenu();
        closeHamburgerMenu();
        syncDolphinSearchFilterMenu();
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
    }

    function toggleDolphinSearchFilterMenu() {
        const slot = getSlot();
        const menu = slot && slot.querySelector('#dolphin-search-filter-menu');
        if (!menu) {
            return;
        }
        if (menu.hidden) {
            openDolphinSearchFilterMenu();
        } else {
            closeDolphinSearchFilterMenu();
        }
    }

    function openDolphinSearchBar(options) {
        const slot = getSlot();
        const app = slot && slot.querySelector('.dolphin-app');
        const bar = ensureDolphinSearchBar();
        if (!app || !bar) {
            return;
        }
        ensureDolphinSearchState();
        app.classList.add('dolphin-app--search-open');
        bar.hidden = false;
        const input = bar.querySelector('#dolphin-search');
        if (input) {
            global.setTimeout(() => input.focus(), 0);
        }
        syncDolphinSearchScopeUi();
        if (options && options.openFilter) {
            global.setTimeout(openDolphinSearchFilterMenu, 0);
        }
    }

    function closeDolphinSearchBar() {
        const slot = getSlot();
        const app = slot && slot.querySelector('.dolphin-app');
        const bar = slot && slot.querySelector('#dolphin-search-bar');
        const state = ensureDolphinSearchState();
        if (app) {
            app.classList.remove('dolphin-app--search-open');
        }
        if (bar) {
            bar.hidden = true;
        }
        closeDolphinSearchFilterMenu();
        if (state) {
            state.searchQuery = '';
            const input = slot && slot.querySelector('#dolphin-search');
            if (input) {
                input.value = '';
            }
            triggerDolphinSearchRender();
        }
    }

    function ensureDolphinSearchBar() {
        const slot = getSlot();
        const app = slot && slot.querySelector('.dolphin-app');
        if (!app) {
            return null;
        }
        let bar = app.querySelector('#dolphin-search-bar');
        const needsRebuild = !bar
            || !bar.querySelector('.dolphin-search-bar__scope-row')
            || bar.getAttribute('data-dolphin-filter-v') !== '2';
        if (needsRebuild) {
            const wasHidden = bar ? bar.hidden : true;
            const searchInput = app.querySelector('#dolphin-search');
            const previousValue = searchInput ? searchInput.value : '';
            if (bar) {
                bar.remove();
            }
            bar = document.createElement('section');
            bar.id = 'dolphin-search-bar';
            bar.className = 'dolphin-search-bar';
            bar.hidden = wasHidden;
            bar.setAttribute('data-dolphin-filter-v', '2');
            bar.setAttribute('aria-label', 'Recherche');
            bar.innerHTML = [
                '<div class="dolphin-search-bar__main-row">',
                '  <div class="dolphin-search-bar__field">',
                '    <button type="button" class="dolphin-search-bar__save" aria-label="Enregistrer la recherche" title="Enregistrer la recherche" disabled tabindex="-1">',
                `      <img src="${resolveHamburgerIconUrl(SEARCH_ICON_BASE + 'add-bookmark.svg')}" alt="" width="16" height="16">`,
                '    </button>',
                '  </div>',
                '  <div class="dolphin-search-bar__filter-wrap">',
                '    <button type="button" id="dolphin-search-filter-btn" class="dolphin-search-bar__filter-btn" aria-haspopup="true" aria-expanded="false">',
                `      <img class="dolphin-search-bar__filter-icon" src="${resolveHamburgerIconUrl(SEARCH_FILTER_ICON)}" alt="" width="16" height="16">`,
                '      <span>Filtrer</span>',
                '      <span class="dolphin-search-bar__filter-caret" aria-hidden="true"></span>',
                '    </button>',
                '    <div id="dolphin-search-filter-menu" class="dolphin-search-filter-menu" role="dialog" aria-label="Filtrer la recherche" hidden>',
                '      <section class="dolphin-search-filter-menu__section">',
                '        <h3 class="dolphin-search-filter-menu__heading">Rechercher dans :</h3>',
                '        <label class="dolphin-search-filter-menu__option"><input type="radio" name="dolphin-search-in" value="names" data-dolphin-search-in checked> Noms de fichiers</label>',
                '        <label class="dolphin-search-filter-menu__option"><input type="radio" name="dolphin-search-in" value="content" data-dolphin-search-in> Contenu de fichier</label>',
                '      </section>',
                '      <section class="dolphin-search-filter-menu__section">',
                '        <h3 class="dolphin-search-filter-menu__heading">Rechercher en utilisant :</h3>',
                '        <label class="dolphin-search-filter-menu__option dolphin-search-filter-menu__option--with-meta">',
                '          <span class="dolphin-search-filter-menu__option-main"><input type="radio" name="dolphin-search-using" value="simple" data-dolphin-search-using checked> Recherche simple</span>',
                '        </label>',
                '        <label class="dolphin-search-filter-menu__option dolphin-search-filter-menu__option--with-meta">',
                '          <span class="dolphin-search-filter-menu__option-main"><input type="radio" name="dolphin-search-using" value="indexing" data-dolphin-search-using> Indexation des fichiers</span>',
                '          <span class="dolphin-search-filter-menu__option-actions">',
                '            <button type="button" class="dolphin-search-filter-menu__icon-btn" title="Informations sur l\'indexation" aria-label="Informations sur l\'indexation" disabled><img src="' + resolveHamburgerIconUrl(SEARCH_ICON_BASE + 'starred-symbolic.svg') + '" alt="" width="16" height="16"></button>',
                '            <button type="button" class="dolphin-search-filter-menu__icon-btn" title="Configuration de l\'indexation" aria-label="Configuration de l\'indexation" disabled><img src="' + resolveHamburgerIconUrl(SEARCH_ICON_BASE + 'applications-system.svg') + '" alt="" width="16" height="16"></button>',
                '          </span>',
                '        </label>',
                '      </section>',
                '      <section class="dolphin-search-filter-menu__section dolphin-search-filter-menu__section--kfind">',
                '        <h3 class="dolphin-search-filter-menu__heading">Pour des recherches plus avancées :</h3>',
                `        <button type="button" class="dolphin-search-filter-menu__kfind" disabled>`,
                `          <img src="${resolveHamburgerIconUrl(SEARCH_KICKOFF_ICON_BASE + 'system-search.svg')}" alt="" width="22" height="22">`,
                '          <span>Installer KFind...</span>',
                '        </button>',
                '      </section>',
                '    </div>',
                '  </div>',
                '  <button type="button" id="dolphin-search-close" class="dolphin-search-bar__close" aria-label="Fermer la recherche">',
                '    <span aria-hidden="true">×</span>',
                '  </button>',
                '</div>',
                '<div class="dolphin-search-bar__scope-row" role="group" aria-label="Portée de la recherche">',
                '  <button type="button" class="dolphin-search-bar__scope-btn is-active" data-dolphin-search-scope="here" aria-pressed="true">À partir d\'ici</button>',
                '  <button type="button" class="dolphin-search-bar__scope-btn" data-dolphin-search-scope="everywhere" aria-pressed="false">Partout</button>',
                '</div>',
            ].join('');
            mountDolphinSearchBarNode(app, bar);
            const field = bar.querySelector('.dolphin-search-bar__field');
            const input = attachDolphinSearchInput(app, field);
            if (input && previousValue) {
                input.value = previousValue;
            }
        } else {
            mountDolphinSearchBarNode(app, bar);
            attachDolphinSearchInput(app, bar.querySelector('.dolphin-search-bar__field'));
        }
        if (!dolphinSearchBarBound) {
            dolphinSearchBarBound = true;
        }
        return bar;
    }

    function mountDolphinSearchBarNode(app, bar) {
        const contentWrap = app.querySelector('#voletContainer.dolphin-content-wrap')
            || app.querySelector('#voletContainer');
        if (contentWrap) {
            const panes = contentWrap.querySelector('#dolphin-content-panes');
            if (panes && bar.nextElementSibling !== panes) {
                contentWrap.insertBefore(bar, panes);
            } else if (!panes && contentWrap.firstElementChild !== bar) {
                contentWrap.prepend(bar);
            }
            return;
        }
        const toolbar = app.querySelector('.dolphin-app__toolbar');
        if (toolbar) {
            toolbar.insertAdjacentElement('afterend', bar);
            return;
        }
        app.appendChild(bar);
    }

    function attachDolphinSearchInput(app, field) {
        if (!field) {
            return null;
        }
        let input = app.querySelector('#dolphin-search');
        if (input && input.parentElement !== field) {
            field.insertBefore(input, field.firstChild);
        }
        if (!input) {
            input = global.document.createElement('input');
            input.type = 'search';
            input.id = 'dolphin-search';
            field.insertBefore(input, field.firstChild);
        }
        input.className = 'dolphin-search-bar__input';
        input.placeholder = 'Rechercher...';
        input.setAttribute('aria-label', 'Rechercher');
        input.autocomplete = 'off';
        input.removeAttribute('aria-hidden');
        if (input.dataset.dolphinNeonSearchBound !== 'true') {
            input.dataset.dolphinNeonSearchBound = 'true';
            input.addEventListener('input', () => {
                const state = ensureDolphinSearchState();
                if (!state) {
                    return;
                }
                state.searchQuery = input.value.trim();
                triggerDolphinSearchRender();
            });
        }
        return input;
    }

    function syncViewModeUi(mode) {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        const current = mode || (global.fileExplorerState && global.fileExplorerState.viewMode) || 'icons';
        const triggerIco = slot.querySelector('.dolphin-view-mode-ico');
        if (triggerIco) {
            triggerIco.className = `dolphin-ico ${VIEW_ICONS[current] || VIEW_ICONS.icons} dolphin-view-mode-ico`;
        }
        slot.querySelectorAll('.dolphin-view-menu__item[data-view-mode]').forEach((item) => {
            const active = item.dataset.viewMode === current;
            item.setAttribute('aria-checked', active ? 'true' : 'false');
        });
        slot.querySelectorAll('.dolphin-toolbar__view-btn[data-view-mode]').forEach((btn) => {
            btn.classList.toggle('dolphin-toolbar__view-btn--active', btn.dataset.viewMode === current);
            if (btn.dataset.viewMode === current) {
                btn.setAttribute('aria-current', 'true');
            } else {
                btn.removeAttribute('aria-current');
            }
        });
    }

    function closeViewMenu() {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        const menu = slot.querySelector('#dolphin-view-menu');
        const trigger = slot.querySelector('#dolphin-view-mode-btn');
        if (menu) {
            menu.hidden = true;
        }
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
    }

    function openViewMenu() {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        const menu = slot.querySelector('#dolphin-view-menu');
        const trigger = slot.querySelector('#dolphin-view-mode-btn');
        if (!menu || !trigger) {
            return;
        }
        syncViewModeUi();
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
    }

    function toggleViewMenu() {
        const slot = getSlot();
        const menu = slot && slot.querySelector('#dolphin-view-menu');
        if (!menu) {
            return;
        }
        if (menu.hidden) {
            openViewMenu();
        } else {
            closeViewMenu();
        }
    }

    function readViewConfigFromState() {
        const state = global.fileExplorerState || {};
        viewConfigDraft.mode = state.viewMode || 'icons';
        viewConfigDraft.hiddenFiles = !!state.showHiddenFiles;
        viewConfigBaseline = JSON.stringify(viewConfigDraft);
    }

    function ensureViewConfigDialog() {
        const slot = getSlot();
        const app = slot && slot.querySelector('.dolphin-app');
        if (!app || app.querySelector('#dolphin-view-config')) {
            return app && app.querySelector('#dolphin-view-config');
        }

        const dialog = global.document.createElement('div');
        dialog.id = 'dolphin-view-config';
        dialog.className = 'dolphin-view-config';
        dialog.hidden = true;
        dialog.innerHTML = `
            <div class="dolphin-view-config__panel" role="dialog" aria-modal="true" aria-labelledby="dolphin-view-config-title">
                <h2 class="dolphin-view-config__title" id="dolphin-view-config-title">Style d'affichage de la vue</h2>
                <div class="dolphin-view-config__row">
                    <label for="dolphin-view-config-mode">Type d'affichage :</label>
                    <select id="dolphin-view-config-mode" class="dolphin-view-config__select">
                        <option value="icons">Icônes</option>
                        <option value="compact">Synthétique</option>
                        <option value="list">Détails</option>
                    </select>
                </div>
                <div class="dolphin-view-config__row">
                    <span>Tri :</span>
                    <div style="display:flex;gap:0.45rem;">
                        <select id="dolphin-view-config-sort-order" class="dolphin-view-config__select" style="flex:1;">
                            <option value="asc">Croissant</option>
                            <option value="desc">Décroissant</option>
                        </select>
                        <select id="dolphin-view-config-sort-by" class="dolphin-view-config__select" style="flex:1;">
                            <option value="name">Nom</option>
                            <option value="size">Taille</option>
                            <option value="modified">Modifié</option>
                        </select>
                    </div>
                </div>
                <div class="dolphin-view-config__checks">
                    <label><input type="checkbox" id="dolphin-view-config-folders-first" checked> Afficher les dossiers d'abord</label>
                    <label><input type="checkbox" id="dolphin-view-config-previews" checked> Afficher un aperçu</label>
                    <label><input type="checkbox" id="dolphin-view-config-groups"> Afficher par groupes</label>
                    <label><input type="checkbox" id="dolphin-view-config-hidden"> Afficher les fichiers cachés</label>
                    <label><input type="checkbox" id="dolphin-view-config-hidden-last"> Afficher les fichiers cachés en dernier</label>
                </div>
                <div class="dolphin-view-config__actions">
                    <button type="button" class="dolphin-view-config__btn" id="dolphin-view-config-cancel">Annuler</button>
                    <button type="button" class="dolphin-view-config__btn" id="dolphin-view-config-apply" disabled>Appliquer</button>
                    <button type="button" class="dolphin-view-config__btn dolphin-view-config__btn--primary" id="dolphin-view-config-ok">Ok</button>
                </div>
            </div>`;
        app.appendChild(dialog);
        return dialog;
    }

    function populateViewConfigDialog() {
        readViewConfigFromState();
        const dialog = ensureViewConfigDialog();
        if (!dialog) {
            return;
        }
        dialog.querySelector('#dolphin-view-config-mode').value = viewConfigDraft.mode;
        dialog.querySelector('#dolphin-view-config-sort-order').value = viewConfigDraft.sortOrder;
        dialog.querySelector('#dolphin-view-config-sort-by').value = viewConfigDraft.sortBy;
        dialog.querySelector('#dolphin-view-config-folders-first').checked = viewConfigDraft.foldersFirst;
        dialog.querySelector('#dolphin-view-config-previews').checked = viewConfigDraft.previews;
        dialog.querySelector('#dolphin-view-config-groups').checked = viewConfigDraft.groups;
        dialog.querySelector('#dolphin-view-config-hidden').checked = viewConfigDraft.hiddenFiles;
        dialog.querySelector('#dolphin-view-config-hidden-last').checked = viewConfigDraft.hiddenLast;
        updateViewConfigApplyState();
    }

    function collectViewConfigDraftFromDialog() {
        const dialog = ensureViewConfigDialog();
        if (!dialog) {
            return;
        }
        viewConfigDraft.mode = dialog.querySelector('#dolphin-view-config-mode').value;
        viewConfigDraft.sortOrder = dialog.querySelector('#dolphin-view-config-sort-order').value;
        viewConfigDraft.sortBy = dialog.querySelector('#dolphin-view-config-sort-by').value;
        viewConfigDraft.foldersFirst = dialog.querySelector('#dolphin-view-config-folders-first').checked;
        viewConfigDraft.previews = dialog.querySelector('#dolphin-view-config-previews').checked;
        viewConfigDraft.groups = dialog.querySelector('#dolphin-view-config-groups').checked;
        viewConfigDraft.hiddenFiles = dialog.querySelector('#dolphin-view-config-hidden').checked;
        viewConfigDraft.hiddenLast = dialog.querySelector('#dolphin-view-config-hidden-last').checked;
    }

    function updateViewConfigApplyState() {
        const dialog = ensureViewConfigDialog();
        if (!dialog) {
            return;
        }
        collectViewConfigDraftFromDialog();
        const applyBtn = dialog.querySelector('#dolphin-view-config-apply');
        if (applyBtn) {
            applyBtn.disabled = JSON.stringify(viewConfigDraft) === viewConfigBaseline;
        }
    }

    function applyViewConfigDraft() {
        collectViewConfigDraftFromDialog();
        if (typeof global.setFileExplorerViewMode === 'function') {
            global.setFileExplorerViewMode(viewConfigDraft.mode);
        }
        const state = global.fileExplorerState;
        if (state && !!state.showHiddenFiles !== viewConfigDraft.hiddenFiles
            && typeof global.toggleExplorerHiddenFiles === 'function') {
            if (viewConfigDraft.hiddenFiles !== state.showHiddenFiles) {
                global.toggleExplorerHiddenFiles();
            }
        }
        syncViewModeUi(viewConfigDraft.mode);
        viewConfigBaseline = JSON.stringify(viewConfigDraft);
        updateViewConfigApplyState();
        global.setTimeout(alignNeonDolphinPathBar, 0);
    }

    function openViewConfigDialog() {
        closeViewMenu();
        populateViewConfigDialog();
        const dialog = ensureViewConfigDialog();
        if (dialog) {
            dialog.hidden = false;
        }
    }

    function closeViewConfigDialog() {
        const dialog = ensureViewConfigDialog();
        if (dialog) {
            dialog.hidden = true;
        }
    }

    function handleNeonDolphinClick(event) {
        const slot = getSlot();
        if (!slot || !slot.contains(event.target)) {
            return;
        }

        const searchToggle = event.target.closest('.dolphin-toolbar__search');
        if (searchToggle) {
            event.preventDefault();
            event.stopPropagation();
            const app = getSlot() && getSlot().querySelector('.dolphin-app');
            if (app && app.classList.contains('dolphin-app--search-open')) {
                const input = app.querySelector('#dolphin-search');
                if (input) {
                    input.focus();
                }
            } else {
                openDolphinSearchBar();
            }
            return;
        }

        if (event.target.closest('#dolphin-search-close')) {
            event.preventDefault();
            event.stopPropagation();
            closeDolphinSearchBar();
            return;
        }

        if (event.target.closest('#dolphin-search-filter-btn')) {
            event.preventDefault();
            event.stopPropagation();
            toggleDolphinSearchFilterMenu();
            return;
        }

        const scopeBtn = event.target.closest('[data-dolphin-search-scope]');
        if (scopeBtn) {
            event.preventDefault();
            event.stopPropagation();
            const state = ensureDolphinSearchState();
            if (state) {
                state.dolphinSearchScope = scopeBtn.dataset.dolphinSearchScope || 'here';
                syncDolphinSearchScopeUi();
                triggerDolphinSearchRender();
            }
            return;
        }

        const searchInInput = event.target.closest('[data-dolphin-search-in]');
        if (searchInInput) {
            const state = ensureDolphinSearchState();
            if (state) {
                state.dolphinSearchIn = searchInInput.value;
                syncDolphinSearchFilterMenu();
                if (state.dolphinSearchIn === 'content' && typeof global.setExplorerStatusMessage === 'function') {
                    global.setExplorerStatusMessage('Recherche dans le contenu : simulation par nom de fichier dans CapsuleOS.');
                }
                triggerDolphinSearchRender();
            }
            return;
        }

        const searchUsingInput = event.target.closest('[data-dolphin-search-using]');
        if (searchUsingInput) {
            const state = ensureDolphinSearchState();
            if (state) {
                state.dolphinSearchUsing = searchUsingInput.value;
                syncDolphinSearchFilterMenu();
                if (state.dolphinSearchUsing === 'indexing' && typeof global.setExplorerStatusMessage === 'function') {
                    global.setExplorerStatusMessage('Indexation des fichiers non disponible dans CapsuleOS (recherche simple).');
                }
            }
            return;
        }

        const hamburgerTrigger = event.target.closest('#dolphin-main-menu');
        if (hamburgerTrigger) {
            event.preventDefault();
            event.stopPropagation();
            toggleHamburgerMenu();
            return;
        }

        const hamburgerItem = event.target.closest('.dolphin-hamburger-menu__item[data-menu-id], .dolphin-hamburger-menu__flyout-item[data-menu-id]');
        if (hamburgerItem && !hamburgerItem.disabled) {
            event.preventDefault();
            event.stopPropagation();
            if (hamburgerItem.classList.contains('dolphin-hamburger-menu__item--submenu')
                || hamburgerItem.classList.contains('dolphin-hamburger-menu__flyout-item--submenu')) {
                if (hamburgerItem.dataset.submenuId) {
                    openHamburgerSubmenu(hamburgerItem, hamburgerItem.dataset.submenuId);
                }
                return;
            }
            runHamburgerAction(hamburgerItem.dataset.menuId);
            return;
        }

        const trigger = event.target.closest('#dolphin-view-mode-btn');
        if (trigger) {
            event.preventDefault();
            event.stopPropagation();
            toggleViewMenu();
            return;
        }

        const modeItem = event.target.closest('.dolphin-view-menu__item[data-view-mode]');
        if (modeItem) {
            event.preventDefault();
            event.stopPropagation();
            const mode = modeItem.dataset.viewMode;
            if (mode && typeof global.setFileExplorerViewMode === 'function') {
                global.setFileExplorerViewMode(mode);
            }
            syncViewModeUi(mode);
            closeViewMenu();
            global.setTimeout(alignNeonDolphinPathBar, 0);
            return;
        }

        if (event.target.closest('#dolphin-view-config-open')) {
            event.preventDefault();
            event.stopPropagation();
            openViewConfigDialog();
            return;
        }

        if (event.target.closest('#dolphin-view-config-ok')) {
            event.preventDefault();
            applyViewConfigDraft();
            closeViewConfigDialog();
            return;
        }

        if (event.target.closest('#dolphin-view-config-apply')) {
            event.preventDefault();
            applyViewConfigDraft();
            return;
        }

        if (event.target.closest('#dolphin-view-config-cancel')
            || (event.target.closest('#dolphin-view-config') && !event.target.closest('.dolphin-view-config__panel'))) {
            event.preventDefault();
            closeViewConfigDialog();
            return;
        }

        if (!event.target.closest('.dolphin-toolbar__view')) {
            closeViewMenu();
        }
        if (!event.target.closest('.dolphin-toolbar__actions')) {
            closeHamburgerMenu();
        }
        if (!event.target.closest('.dolphin-search-bar__filter-wrap')) {
            closeDolphinSearchFilterMenu();
        }
    }

    let neonCompactResizeObserver = null;

    function observeNeonCompactLayout() {
        const slot = getSlot();
        if (!slot || typeof global.ResizeObserver !== 'function') {
            return;
        }
        const panes = slot.querySelectorAll('.dolphin-content-pane');
        if (!panes.length) {
            return;
        }
        if (neonCompactResizeObserver) {
            neonCompactResizeObserver.disconnect();
        }
        neonCompactResizeObserver = new global.ResizeObserver(() => {
            scheduleNeonCompactLayout();
        });
        panes.forEach((pane) => neonCompactResizeObserver.observe(pane));
    }

    const DOLPHIN_CTX_FLYOUTS = {
        'open-with': ['Autre application…'],
        'create-new': ['Nouveau fichier vierge…', 'Nouveau dossier…'],
        'open-terminal': ['Ouvrir un terminal ici'],
        'compress': ['Compresser au format ZIP…', 'Compresser au format TAR…'],
        'assign-tags': ['Important', 'Favori', 'À revoir'],
        'activities': ['Nouvelle activité…', 'Gérer les activités…'],
    };

    const DOLPHIN_CONTEXT_MENU_ICONS = {
        'tab-new': `${KDE_NEMO_ASSETS}tab-new.svg`,
        'window-new': `${KDE_NEMO_ASSETS}screen.svg`,
        'view-split': `${KDE_NEMO_ASSETS}view-split-left-right.svg`,
        'open-menu': `${KDE_NEMO_ASSETS}open-menu-symbolic.svg`,
        'list-add': `${KDE_NEMO_ASSETS}add-new-file.svg`,
        'edit-cut': `${KDE_NEMO_ASSETS}cut.svg`,
        'edit-copy': `${KDE_NEMO_ASSETS}copy.svg`,
        location: `${KDE_NEMO_ASSETS}location-symbolic.svg`,
        'edit-paste': `${KDE_NEMO_ASSETS}paste.svg`,
        'edit-duplicate': `${KDE_NEMO_ASSETS}copy.svg`,
        'edit-rename': `${KDE_NEMO_ASSETS}document-properties.svg`,
        'user-trash': `${KDE_NEMO_ASSETS}user-trash-symbolic.svg`,
        'utilities-terminal': `${KDE_APPS_ASSETS}utilities-terminal.svg`,
        package: `${KDE_APPS_ASSETS}archive-manager.png`,
        tag: `${KDE_NEMO_ASSETS}starred-symbolic.svg`,
        activities: './assets/icons/kde/elements/folder-activities.svg',
        'folder-new': `${KDE_NEMO_ASSETS}new-folder.svg`,
        'edit-select-all': `${KDE_NEMO_ASSETS}view-grid-symbolic.svg`,
        'edit-undo': `${KDE_NEMO_ASSETS}undo.svg`,
        'document-properties': `${KDE_NEMO_ASSETS}document-properties.svg`,
    };

    function resolveKdeCtxIcon(path) {
        if (typeof global.resolveCapsuleResourceUrl === 'function') {
            return global.resolveCapsuleResourceUrl(path);
        }
        return path;
    }

    function decorateDolphinContextMenuIcons(menu) {
        if (!menu || !menu.classList.contains('dolphin-context-menu')) {
            return;
        }
        menu.querySelectorAll('[data-nemo-ctx-icon]').forEach((item) => {
            const key = item.dataset.nemoCtxIcon;
            const path = DOLPHIN_CONTEXT_MENU_ICONS[key];
            if (!path) {
                return;
            }
            let icon = item.querySelector('.nautilus-context-menu__icon');
            if (!icon) {
                icon = global.document.createElement('img');
                icon.className = 'nautilus-context-menu__icon';
                icon.alt = '';
                item.insertBefore(icon, item.firstChild);
            }
            icon.src = resolveKdeCtxIcon(path);
        });
        menu.dataset.kdeCtxIcons = 'true';
    }

    function closeContextMenuFlyouts(menu) {
        if (!menu) {
            return;
        }
        menu.querySelectorAll('.nautilus-context-menu__flyout').forEach((flyout) => {
            flyout.hidden = true;
        });
        menu.querySelectorAll('.nautilus-context-menu__item.is-open').forEach((item) => {
            item.classList.remove('is-open');
        });
    }

    function ensureContextMenuFlyouts(slot) {
        const menu = slot.querySelector('#nemo-context-menu.dolphin-context-menu');
        if (!menu || menu.dataset.ctxFlyoutsInit === 'true') {
            return;
        }
        menu.dataset.ctxFlyoutsInit = 'true';
        decorateDolphinContextMenuIcons(menu);
        menu.querySelectorAll('.nautilus-context-menu__item--submenu').forEach((item) => {
            const ctx = item.dataset.nemoCtx;
            const entries = DOLPHIN_CTX_FLYOUTS[ctx];
            if (!entries || !entries.length) {
                return;
            }
            let flyout = item.querySelector('.nautilus-context-menu__flyout');
            if (!flyout) {
                flyout = global.document.createElement('div');
                flyout.className = 'nautilus-context-menu__flyout';
                flyout.setAttribute('role', 'menu');
                flyout.hidden = true;
                entries.forEach((label) => {
                    const btn = global.document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'nautilus-context-menu__flyout-item';
                    btn.setAttribute('role', 'menuitem');
                    btn.textContent = label;
                    btn.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        menu.hidden = true;
                        closeContextMenuFlyouts(menu);
                        if (typeof global.setExplorerStatusMessage === 'function') {
                            global.setExplorerStatusMessage(`${label} (simulation)`);
                        }
                    });
                    flyout.appendChild(btn);
                });
                item.appendChild(flyout);
            }
            item.addEventListener('mouseenter', () => {
                closeContextMenuFlyouts(menu);
                item.classList.add('is-open');
                flyout.hidden = false;
            });
            flyout.addEventListener('mouseenter', () => {
                item.classList.add('is-open');
                flyout.hidden = false;
            });
        });
        menu.addEventListener('mouseleave', (event) => {
            const related = event.relatedTarget;
            if (related && menu.contains(related)) {
                return;
            }
            closeContextMenuFlyouts(menu);
        });
    }

    function watchContextMenu(slot) {
        if (!slot || slot.dataset.ctxMenuWatch === 'true') {
            return;
        }
        slot.dataset.ctxMenuWatch = 'true';
        const observer = new MutationObserver(() => {
            const menu = slot.querySelector('#nemo-context-menu.dolphin-context-menu');
            if (menu && !menu.hidden) {
                ensureContextMenuFlyouts(slot);
            }
        });
        observer.observe(slot, {
            subtree: true,
            attributes: true,
            attributeFilter: ['hidden'],
        });
    }

    function ensurePeripheralsSidebar() {
        const slot = getSlot();
        const sidebar = slot && slot.querySelector('#voletnemo');
        if (!sidebar || sidebar.querySelector('[data-neon-peripherals-section]')) {
            return;
        }
        const section = global.document.createElement('div');
        section.className = 'dolphin-sidebar__section';
        section.dataset.neonPeripheralsSection = 'true';
        const heading = global.document.createElement('h4');
        heading.className = 'dolphin-sidebar__heading';
        heading.textContent = 'Périphériques';
        const nav = global.document.createElement('nav');
        nav.className = 'dolphin-sidebar__nav dolphin-sidebar__nav--peripherals';
        nav.setAttribute('aria-label', 'Périphériques');
        const empty = global.document.createElement('p');
        empty.className = 'dolphin-sidebar__empty';
        empty.textContent = 'Aucun périphérique connecté';
        nav.appendChild(empty);
        section.appendChild(heading);
        section.appendChild(nav);
        sidebar.appendChild(section);
    }

    function bindNeonDolphinUi() {
        const slot = getSlot();
        if (!slot || !slot.querySelector('.dolphin-app')) {
            return;
        }
        if (!neonBindingsReady) {
            global.document.addEventListener('click', handleNeonDolphinClick, true);
            slot.addEventListener('mouseover', handleHamburgerMenuPointer);
            watchContextMenu(slot);
            slot.addEventListener('change', (event) => {
                if (event.target.closest('#dolphin-view-config')) {
                    updateViewConfigApplyState();
                }
            });
            slot.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    const app = slot.querySelector('.dolphin-app');
                    const filterMenu = slot.querySelector('#dolphin-search-filter-menu');
                    if (filterMenu && !filterMenu.hidden) {
                        closeDolphinSearchFilterMenu();
                        event.preventDefault();
                        return;
                    }
                    if (app && app.classList.contains('dolphin-app--search-open')) {
                        closeDolphinSearchBar();
                        event.preventDefault();
                        return;
                    }
                    closeViewConfigDialog();
                    closeViewMenu();
                }
                if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'i') {
                    event.preventDefault();
                    openDolphinSearchBar({ openFilter: true });
                }
                if (event.ctrlKey && event.key === '1') {
                    global.setFileExplorerViewMode && global.setFileExplorerViewMode('icons');
                    syncViewModeUi('icons');
                }
                if (event.ctrlKey && event.key === '2') {
                    global.setFileExplorerViewMode && global.setFileExplorerViewMode('compact');
                    syncViewModeUi('compact');
                }
                if (event.ctrlKey && event.key === '3') {
                    global.setFileExplorerViewMode && global.setFileExplorerViewMode('list');
                    syncViewModeUi('list');
                }
            });
            global.addEventListener('resize', notifyNeonWindowGeometryChanged);
            observeNemoWindowGeometry();
            neonBindingsReady = true;
        }
        ensureNeonSearchInActions();
        ensureDolphinSearchBar();
        ensureSecondaryPathBar();
        ensureHamburgerMenu();
        ensurePeripheralsSidebar();
        ensureContextMenuFlyouts(slot);
        syncViewModeUi();
        syncNeonSplitChrome();
        observeNemoWindowGeometry();
        observeNeonCompactLayout();
        alignNeonDolphinPathBar();
        scheduleNeonCompactLayout();
    }

    function watchForDolphinShell() {
        const slot = getSlot();
        if (!slot) {
            return;
        }
        if (slot.querySelector('.dolphin-app')) {
            bindNeonDolphinUi();
            return;
        }
        if (slot.dataset.neonDolphinWatch === 'true') {
            return;
        }
        slot.dataset.neonDolphinWatch = 'true';
        const observer = new MutationObserver(() => {
            if (slot.querySelector('.dolphin-app')) {
                observer.disconnect();
                slot.dataset.neonDolphinWatch = 'false';
                bindNeonDolphinUi();
                scheduleNeonChromeRefresh();
            }
        });
        observer.observe(slot, { childList: true, subtree: true });
    }

    function scheduleNeonChromeRefresh() {
        normalizeNeonRootLabels();
        watchForDolphinShell();
        bindNeonDolphinUi();
        ensureNeonSearchInActions();
        syncViewModeUi();
        syncNeonSplitChrome();
        normalizeNeonListViewCells();
        global.setTimeout(alignNeonDolphinPathBar, 0);
        global.setTimeout(alignNeonDolphinPathBar, 120);
        global.setTimeout(alignNeonDolphinPathBar, 400);
        global.setTimeout(alignNeonDolphinPathBar, 900);
        scheduleNeonCompactLayout();
    }

    function wrapExplorerFn(name, after) {
        const original = global[name];
        if (typeof original !== 'function') {
            return;
        }
        global[name] = function wrappedExplorerFn(...args) {
            patchManifestRootLabel();
            const result = original.apply(this, args);
            if (typeof after === 'function') {
                after();
            } else {
                scheduleNeonChromeRefresh();
            }
            return result;
        };
    }

    wrapExplorerFn('updateExplorerWindowTitle', normalizeNeonWindowTitle);
    wrapExplorerFn('updatePathDisplay', () => {
        syncNeonDualPathLabels();
        syncNeonSplitChrome();
    });
    wrapExplorerFn('setFileExplorerViewMode', () => {
        syncViewModeUi();
        scheduleNeonPathBarAlign();
        scheduleNeonCompactLayout();
        normalizeNeonListViewCells();
    });
    wrapExplorerFn('applyFileExplorerViewMode', () => {
        syncViewModeUi();
        scheduleNeonPathBarAlign();
        scheduleNeonCompactLayout();
        normalizeNeonListViewCells();
    });
    wrapExplorerFn('renderDirectory', () => {
        scheduleNeonCompactLayout();
        normalizeNeonListViewCells();
    });

    const updateChromeOriginal = global.updateDolphinExplorerChrome;
    global.updateDolphinExplorerChrome = function neonUpdateDolphinExplorerChrome(...args) {
        let result;
        if (typeof updateChromeOriginal === 'function') {
            result = updateChromeOriginal.apply(this, args);
        }
        syncNeonSplitChrome();
        scheduleNeonPathBarAlign();
        scheduleNeonCompactLayout();
        return result;
    };

    global.alignDolphinPathBarToContentGrid = function neonAlignDolphinPathBar() {
        const slot = getSlot();
        if (slot) {
            slot.querySelectorAll('.dolphin-toolbar__path').forEach((pathGroup) => {
                if (!global.fileExplorerState || !global.fileExplorerState.splitView) {
                    pathGroup.style.marginLeft = '';
                }
            });
        }
        alignNeonDolphinPathBar();
    };

    wrapNemoWindowGeometryHook('toggleWindowMaximized');
    wrapNemoWindowGeometryHook('maximizeWindowElement');
    wrapNemoWindowGeometryHook('restoreWindowElement');

    if (typeof global.openWindowByDataLink === 'function') {
        const openOriginal = global.openWindowByDataLink;
        global.openWindowByDataLink = function openWindowByDataLinkNeon(dataLink, ...rest) {
            const opened = openOriginal.call(this, dataLink, ...rest);
            if (String(dataLink) === 'nemo') {
                watchForDolphinShell();
                scheduleNeonChromeRefresh();
            }
            return opened;
        };
    }

    if (global.document) {
        global.document.addEventListener('DOMContentLoaded', scheduleNeonChromeRefresh);
    }

    global.openDolphinSearchBar = openDolphinSearchBar;
    global.closeDolphinSearchBar = closeDolphinSearchBar;
}(window));
