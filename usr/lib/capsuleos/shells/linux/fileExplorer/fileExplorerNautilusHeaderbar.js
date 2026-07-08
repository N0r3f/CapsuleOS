/**
 * Headerbar Nautilus 47 — modes chrome VM (fil d'Ariane, recherche dossier/partout, emplacement).
 */
(function initFileExplorerNautilusHeaderbar(global) {
    'use strict';

    const CHROME_MODES = ['breadcrumb', 'search-folder', 'search-everywhere', 'location'];

    let openPopover = null;
    let openPopoverAnchor = null;

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

    const getState = () => global.fileExplorerState || null;

    const getChromeMode = (state) => {
        if (!state) {
            return 'breadcrumb';
        }
        if (state.nautilusChromeMode && CHROME_MODES.includes(state.nautilusChromeMode)) {
            return state.nautilusChromeMode;
        }
        if (state.locationBarMode === 'path') {
            return 'location';
        }
        return 'breadcrumb';
    };

    const closePopover = () => {
        if (openPopover) {
            openPopover.hidden = true;
        }
        if (openPopoverAnchor) {
            openPopoverAnchor.setAttribute('aria-expanded', 'false');
        }
        openPopover = null;
        openPopoverAnchor = null;
    };

    const openPopoverAt = (menu, anchor, clientX, clientY) => {
        if (!menu || !anchor) {
            return;
        }
        closePopover();
        menu.hidden = false;
        const rect = menu.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        const left = clientX != null ? clientX : anchorRect.left;
        const top = clientY != null ? clientY : anchorRect.bottom + 4;
        const maxLeft = global.innerWidth - rect.width - 8;
        const maxTop = global.innerHeight - rect.height - 8;
        menu.style.left = `${Math.max(8, Math.min(left, maxLeft))}px`;
        menu.style.top = `${Math.max(8, Math.min(top, maxTop))}px`;
        anchor.setAttribute('aria-expanded', 'true');
        openPopover = menu;
        openPopoverAnchor = anchor;
    };

    const focusSearchInput = (selectAll) => {
        const root = getNemoRoot();
        const input = root && root.querySelector('#nemo-search-input');
        if (!input) {
            return null;
        }
        input.focus();
        if (selectAll && typeof input.select === 'function') {
            input.select();
        }
        return input;
    };

    const formatLocationBarValue = (path) => {
        const root = typeof global.getFileExplorerRoot === 'function'
            ? global.getFileExplorerRoot()
            : '';
        if (!path || path === root) {
            return '~';
        }
        if (path === global.CAPSULE_PLACE_FILESYSTEM) {
            return '/';
        }
        if (path === global.CAPSULE_PLACE_RECENT) {
            return 'recent://';
        }
        if (path === global.CAPSULE_PLACE_TRASH) {
            return 'trash://';
        }
        if (path === global.CAPSULE_PLACE_NETWORK) {
            return 'network://';
        }
        if (path === global.CAPSULE_PLACE_STARRED) {
            return 'starred://';
        }
        if (root && path.startsWith(`${root}/`)) {
            return `~/${path.slice(root.length + 1)}`;
        }
        return path;
    };

    const getPathCrumbIcon = (path, index) => {
        if (index !== 0) {
            return null;
        }
        if (path === global.CAPSULE_PLACE_STARRED) {
            return './assets/icons/cinnamon/nemo/starred-symbolic.svg';
        }
        if (path === global.CAPSULE_PLACE_NETWORK) {
            return './assets/icons/cinnamon/nemo/network-workgroup-symbolic.svg';
        }
        if (path === global.CAPSULE_PLACE_TRASH) {
            return './assets/icons/cinnamon/nemo/user-trash-symbolic.svg';
        }
        if (path === global.CAPSULE_PLACE_RECENT) {
            return './assets/icons/cinnamon/nemo/recent.svg';
        }
        return './assets/icons/cinnamon/nemo/user-home-symbolic.svg';
    };

    const renderPathCrumbs = (root, state) => {
        const container = root.querySelector('#nautilus-path-crumbs');
        if (!container || !state) {
            return;
        }
        const path = state.currentPath;
        const segments = typeof global.buildExplorerPathSegments === 'function'
            ? global.buildExplorerPathSegments(path)
            : [{ path, label: 'Dossier personnel' }];

        container.replaceChildren();
        segments.forEach((segment, index) => {
            if (index > 0) {
                const sep = global.document.createElement('span');
                sep.className = 'nautilus-app__path-crumb-sep';
                sep.setAttribute('aria-hidden', 'true');
                sep.textContent = '/';
                container.appendChild(sep);
            }

            const crumb = global.document.createElement('button');
            crumb.type = 'button';
            crumb.className = 'nautilus-app__path-crumb';
            crumb.dataset.path = segment.path;
            crumb.title = segment.label;

            const iconSrc = getPathCrumbIcon(segment.path, index);
            if (iconSrc) {
                const icon = global.document.createElement('img');
                icon.className = 'nautilus-app__path-crumb-icon';
                const remap = global.CapsuleExplorerIconBase
                    && typeof global.CapsuleExplorerIconBase.remapPath === 'function'
                    ? global.CapsuleExplorerIconBase.remapPath
                    : null;
                var resolvedIconSrc = remap ? remap(iconSrc) : iconSrc;
                if (typeof global.resolveCapsuleAssetUrl === 'function') {
                    icon.src = global.resolveCapsuleAssetUrl(resolvedIconSrc);
                } else if (typeof global.resolveCapsuleResourceUrl === 'function') {
                    icon.src = global.resolveCapsuleResourceUrl(resolvedIconSrc);
                } else {
                    icon.src = resolvedIconSrc;
                }
                icon.alt = '';
                icon.setAttribute('aria-hidden', 'true');
                crumb.appendChild(icon);
            }

            const label = global.document.createElement('span');
            label.textContent = segment.label;
            crumb.appendChild(label);
            container.appendChild(crumb);
        });

        const pill = root.querySelector('#nautilus-path-pill');
        if (pill && segments.length) {
            pill.title = segments.map((entry) => entry.label).join(' / ');
        }
    };

    const syncSearchEmptyState = (root, state, mode) => {
        const emptyState = root.querySelector('#nautilus-search-empty');
        const contentGrid = root.querySelector('#voletContainer > .nemoElement');
        if (!emptyState) {
            return;
        }
        const showEmpty = mode === 'search-everywhere' && !(state.searchQuery || '').trim();
        emptyState.hidden = !showEmpty;
        if (contentGrid) {
            contentGrid.hidden = showEmpty;
        }
    };

    const exitNautilusSearchChrome = (options = {}) => {
        const state = getState();
        const root = getNemoRoot();
        if (!state || !root) {
            return false;
        }
        const mode = getChromeMode(state);
        if (mode !== 'search-everywhere' && mode !== 'search-folder') {
            return false;
        }
        state.nautilusChromeMode = 'breadcrumb';
        state.locationBarMode = 'search';
        if (!options.keepQuery) {
            state.searchQuery = '';
            const input = root.querySelector('#nemo-search-input');
            if (input) {
                input.value = '';
            }
        }
        applyChrome();
        if (options.render !== false && typeof global.renderDirectory === 'function' && state.currentPath) {
            global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
        }
        if (typeof global.updatePathDisplay === 'function') {
            global.updatePathDisplay();
        }
        return true;
    };

    const applyChrome = () => {
        const state = getState();
        const root = getNemoRoot();
        if (!state || !root) {
            return;
        }

        const mode = getChromeMode(state);
        const main = root.querySelector('main#gestionnaire, main.nautilus-app');
        if (main) {
            main.dataset.nautilusChromeMode = mode;
        }
        const crumbbar = root.querySelector('#nautilus-path-crumbbar');
        const searchWrap = root.querySelector('#nemo-search-wrap');
        const input = root.querySelector('#nemo-search-input');
        const clearBtn = root.querySelector('#nautilus-search-clear');
        const showSearch = mode !== 'breadcrumb';

        if (crumbbar) {
            crumbbar.hidden = showSearch;
        }
        if (searchWrap) {
            searchWrap.hidden = !showSearch;
        }

        renderPathCrumbs(root, state);

        if (input) {
            if (mode === 'location') {
                input.value = formatLocationBarValue(state.currentPath);
                input.placeholder = 'Saisir un emplacement';
                input.setAttribute('aria-label', 'Emplacement');
            } else if (mode === 'search-everywhere') {
                input.value = state.searchQuery || '';
                input.placeholder = 'Rechercher partout';
                input.setAttribute('aria-label', 'Rechercher partout');
            } else if (mode === 'search-folder') {
                input.value = state.searchQuery || '';
                input.placeholder = 'Rechercher dans le dossier actuel';
                input.setAttribute('aria-label', 'Rechercher dans le dossier actuel');
            }
            if (clearBtn) {
                const showClear = showSearch && mode !== 'location' && String(input.value || '').length > 0;
                clearBtn.hidden = !showClear;
            }
        }

        syncSearchEmptyState(root, state, mode);

        if (typeof global.updateExplorerWindowTitle === 'function') {
            global.updateExplorerWindowTitle();
        }
    };

    const setChromeMode = (mode) => {
        const state = getState();
        if (!state) {
            return;
        }
        const normalized = CHROME_MODES.includes(mode) ? mode : 'breadcrumb';
        state.nautilusChromeMode = normalized;
        state.locationBarMode = normalized === 'location' ? 'path' : 'search';
        applyChrome();
        if (normalized === 'location' || normalized === 'search-folder' || normalized === 'search-everywhere') {
            focusSearchInput(normalized === 'location');
        }
    };

    const applyLocationBarMode = () => {
        applyChrome();
    };

    const setLocationBarMode = (mode) => {
        if (mode === 'path') {
            setChromeMode('location');
            return;
        }
        const state = getState();
        const current = getChromeMode(state);
        if (current === 'location') {
            setChromeMode(state && state.searchQuery ? 'search-folder' : 'breadcrumb');
            return;
        }
        setChromeMode('search-folder');
    };

    const toggleLocationBarMode = () => {
        const state = getState();
        if (!state) {
            return;
        }
        if (getChromeMode(state) === 'location') {
            setChromeMode('breadcrumb');
        } else {
            setChromeMode('location');
        }
    };

    const syncUndoMenuState = () => {
        const root = getNemoRoot();
        if (!root) {
            return;
        }
        const state = getState();
        const undoBtn = root.querySelector('[data-nautilus-menu="undo"]');
        const redoBtn = root.querySelector('[data-nautilus-menu="redo"]');
        const canUndo = state && Array.isArray(state.explorerUndoStack) && state.explorerUndoStack.length > 0;
        const canRedo = state && Array.isArray(state.explorerRedoStack) && state.explorerRedoStack.length > 0;
        if (undoBtn) {
            undoBtn.disabled = !canUndo;
        }
        if (redoBtn) {
            redoBtn.disabled = !canRedo;
        }
    };

    const syncViewMenuHiddenLabel = (root) => {
        const item = root.querySelector('[data-nautilus-view="toggle-hidden"]');
        if (!item || !getState()) {
            return;
        }
        const label = item.querySelector('span');
        if (label) {
            label.textContent = getState().showHiddenFiles
                ? 'Masquer les fichiers cachés'
                : 'Afficher les fichiers cachés';
        }
    };

    const syncSearchFilterMenu = (root) => {
        const filter = (getState() && getState().searchFilter) || 'all';
        const labels = { all: 'N\'importe lequel', folders: 'Dossiers uniquement', files: 'Fichiers uniquement' };
        const panelField = root.querySelector('.nautilus-popover__panel-field[data-nautilus-search-filter]');
        if (panelField) {
            panelField.textContent = labels[filter] || labels.all;
        }
        root.querySelectorAll('[data-nautilus-search-filter]').forEach((btn) => {
            if (btn.classList.contains('nautilus-popover__panel-field')) {
                return;
            }
            const active = btn.dataset.nautilusSearchFilter === filter;
            btn.setAttribute('aria-checked', active ? 'true' : 'false');
            btn.classList.toggle('is-active', active);
        });
        const searchMode = (getState() && getState().searchMode) || 'fulltext';
        root.querySelectorAll('[data-nautilus-search-mode]').forEach((btn) => {
            const active = btn.dataset.nautilusSearchMode === searchMode;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    };

    const syncViewSortMenu = (root) => {
        const sort = (getState() && getState().sortOrder) || 'name-asc';
        root.querySelectorAll('[data-nautilus-view^="sort-"]').forEach((btn) => {
            const key = btn.dataset.nautilusView;
            const active = (key === 'sort-az' && sort === 'name-asc')
                || (key === 'sort-za' && sort === 'name-desc')
                || (key === 'sort-modified' && sort === 'modified-desc');
            btn.setAttribute('aria-checked', active ? 'true' : 'false');
            btn.classList.toggle('is-active', active);
        });
    };

    const setSearchFilter = (filter) => {
        const state = getState();
        if (!state) {
            return;
        }
        state.searchFilter = filter || 'all';
        if (typeof global.renderDirectory === 'function') {
            global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
        }
        if (typeof global.updatePathDisplay === 'function') {
            global.updatePathDisplay();
        }
        const root = getNemoRoot();
        if (root) {
            syncSearchFilterMenu(root);
        }
    };

    const setSearchMode = (mode) => {
        const state = getState();
        if (!state) {
            return;
        }
        state.searchMode = mode === 'filename' ? 'filename' : 'fulltext';
        const root = getNemoRoot();
        if (root) {
            syncSearchFilterMenu(root);
        }
        if (state.searchQuery && typeof global.renderDirectory === 'function') {
            global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
        }
    };

    const setSortOrder = (order) => {
        const state = getState();
        if (!state) {
            return;
        }
        state.sortOrder = order;
        if (typeof global.refreshFileExplorerDirectory === 'function') {
            global.refreshFileExplorerDirectory();
        }
        const root = getNemoRoot();
        if (root) {
            syncViewSortMenu(root);
        }
    };

    const adjustZoom = (delta) => {
        const state = getState();
        const settings = { min: 80, max: 140, defaultValue: 100, step: 10 };
        const current = state && state.zoomValue != null ? state.zoomValue : settings.defaultValue;
        const next = Math.max(settings.min, Math.min(settings.max, current + delta));
        if (typeof global.applyFileExplorerZoom === 'function') {
            global.applyFileExplorerZoom(next);
        }
    };

    const copyCurrentLocation = () => {
        const state = getState();
        if (!state) {
            return;
        }
        const text = formatLocationBarValue(state.currentPath);
        if (global.navigator && global.navigator.clipboard && typeof global.navigator.clipboard.writeText === 'function') {
            global.navigator.clipboard.writeText(text).catch(() => {});
        }
    };

    const runMainMenuAction = (action) => {
        closePopover();
        if (action === 'new-window') {
            if (typeof global.openNewWindowByDataLink === 'function') {
                global.openNewWindowByDataLink('nemo');
            } else if (typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink('nemo', { newWindow: true });
            }
            return;
        }
        if (action === 'new-tab' && typeof global.openNautilusTab === 'function') {
            const home = typeof global.getFileExplorerRoot === 'function'
                ? global.getFileExplorerRoot()
                : null;
            global.openNautilusTab(home);
            return;
        }
        if (action === 'preferences' && typeof global.openWindowByDataLink === 'function') {
            global.openWindowByDataLink('themes');
            return;
        }
        if (action === 'undo' && typeof global.undoExplorerOperation === 'function') {
            global.undoExplorerOperation();
            return;
        }
        if (action === 'redo' && typeof global.redoExplorerOperation === 'function') {
            global.redoExplorerOperation();
            return;
        }
        if (action === 'shortcuts' && typeof global.showNautilusShortcutsDialog === 'function') {
            global.showNautilusShortcutsDialog();
            return;
        }
        if (action === 'help' && typeof global.showNautilusHelpDialog === 'function') {
            global.showNautilusHelpDialog();
            return;
        }
        if (action === 'about' && typeof global.showNautilusAboutDialog === 'function') {
            global.showNautilusAboutDialog();
        }
    };

    const runPathMenuAction = (action) => {
        closePopover();
        if (action === 'new-folder' && typeof global.createNewFolderInCurrentDirectory === 'function') {
            global.createNewFolderInCurrentDirectory();
            return;
        }
        if (action === 'refresh' && typeof global.refreshFileExplorerDirectory === 'function') {
            global.refreshFileExplorerDirectory();
            return;
        }
        if (action === 'location') {
            setChromeMode('location');
            return;
        }
        if (action === 'copy-location') {
            copyCurrentLocation();
            return;
        }
        if (action === 'properties' && typeof global.openExplorerProperties === 'function') {
            global.openExplorerProperties(null);
            return;
        }
        if (action === 'bookmark' && typeof global.addNautilusBookmark === 'function') {
            global.addNautilusBookmark();
            return;
        }
        if (action === 'open-terminal') {
            const cwd = global.fileExplorerState && global.fileExplorerState.currentPath;
            if (typeof global.openTerminalWithExplorerContext === 'function') {
                global.openTerminalWithExplorerContext(cwd);
            } else if (typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink('terminal');
            }
        }
    };

    const runViewMenuAction = (action) => {
        closePopover();
        if (action === 'compact' && typeof global.setFileExplorerViewMode === 'function') {
            global.setFileExplorerViewMode('compact');
            return;
        }
        if (action === 'zoom-in') {
            adjustZoom(10);
            return;
        }
        if (action === 'zoom-out') {
            adjustZoom(-10);
            return;
        }
        if (action === 'sort-az') {
            setSortOrder('name-asc');
            return;
        }
        if (action === 'sort-za') {
            setSortOrder('name-desc');
            return;
        }
        if (action === 'sort-modified') {
            setSortOrder('modified-desc');
            return;
        }
        if (action === 'toggle-hidden' && typeof global.toggleExplorerHiddenFiles === 'function') {
            global.toggleExplorerHiddenFiles();
            const root = getNemoRoot();
            if (root) {
                syncViewMenuHiddenLabel(root);
            }
        }
    };

    const bindPopoverMenu = (root, menu, anchorSelector, beforeOpen) => {
        const menuEl = typeof menu === 'string' ? root.querySelector(menu) : menu;
        const anchor = root.querySelector(anchorSelector);
        if (!menuEl || !anchor || anchor.dataset.nautilusPopoverBound === 'true') {
            return;
        }
        anchor.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!menuEl.hidden && openPopover === menuEl) {
                closePopover();
                return;
            }
            if (typeof beforeOpen === 'function') {
                beforeOpen(root);
            }
            openPopoverAt(menuEl, anchor);
        });
        anchor.dataset.nautilusPopoverBound = 'true';
    };

    const bindMenuItems = (root) => {
        root.querySelectorAll('[data-nautilus-menu]').forEach((item) => {
            if (item.dataset.nautilusMenuBound === 'true' || item.disabled) {
                return;
            }
            item.addEventListener('click', (event) => {
                event.preventDefault();
                runMainMenuAction(item.dataset.nautilusMenu);
            });
            item.dataset.nautilusMenuBound = 'true';
        });

        root.querySelectorAll('[data-nautilus-path]').forEach((item) => {
            if (item.dataset.nautilusPathBound === 'true') {
                return;
            }
            item.addEventListener('click', (event) => {
                event.preventDefault();
                runPathMenuAction(item.dataset.nautilusPath);
            });
            item.dataset.nautilusPathBound = 'true';
        });

        root.querySelectorAll('[data-nautilus-search-filter]').forEach((item) => {
            if (item.dataset.nautilusFilterBound === 'true' || item.classList.contains('nautilus-popover__panel-field')) {
                return;
            }
            item.addEventListener('click', (event) => {
                event.preventDefault();
                setSearchFilter(item.dataset.nautilusSearchFilter);
            });
            item.dataset.nautilusFilterBound = 'true';
        });

        root.querySelectorAll('[data-nautilus-search-mode]').forEach((item) => {
            if (item.dataset.nautilusSearchModeBound === 'true') {
                return;
            }
            item.addEventListener('click', (event) => {
                event.preventDefault();
                setSearchMode(item.dataset.nautilusSearchMode);
            });
            item.dataset.nautilusSearchModeBound = 'true';
        });

        root.querySelectorAll('[data-nautilus-view]').forEach((item) => {
            if (item.dataset.nautilusViewBound === 'true') {
                return;
            }
            item.addEventListener('click', (event) => {
                event.preventDefault();
                runViewMenuAction(item.dataset.nautilusView);
            });
            item.dataset.nautilusViewBound = 'true';
        });

        root.querySelectorAll('[data-nautilus-chrome]').forEach((item) => {
            if (item.dataset.nautilusChromeBound === 'true') {
                return;
            }
            item.addEventListener('click', (event) => {
                event.preventDefault();
                if (item.dataset.nautilusChrome === 'search-settings') {
                    const anchor = root.querySelector('.nautilus-app__search-filter');
                    const menu = root.querySelector('#nautilus-search-filter-menu');
                    if (menu && anchor) {
                        syncSearchFilterMenu(root);
                        openPopoverAt(menu, anchor);
                    }
                }
            });
            item.dataset.nautilusChromeBound = 'true';
        });
    };

    const bindPlateSearch = (root) => {
        const btn = root.querySelector('.nautilus-app__plate-search');
        if (!btn || btn.dataset.nautilusPlateSearchBound === 'true') {
            return;
        }
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            setChromeMode('search-everywhere');
        });
        btn.dataset.nautilusPlateSearchBound = 'true';
    };

    const bindSearchInfo = (root) => {
        const btn = root.querySelector('.nautilus-app__search-info');
        if (!btn || btn.dataset.nautilusSearchInfoBound === 'true') {
            return;
        }
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const state = getState();
            if (state && getChromeMode(state) === 'location') {
                setChromeMode('breadcrumb');
                return;
            }
            setChromeMode('location');
        });
        btn.dataset.nautilusSearchInfoBound = 'true';
    };

    const bindSearchClear = (root) => {
        const btn = root.querySelector('#nautilus-search-clear');
        const input = root.querySelector('#nemo-search-input');
        if (!btn || !input || btn.dataset.nautilusSearchClearBound === 'true') {
            return;
        }
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const state = getState();
            input.value = '';
            if (state) {
                state.searchQuery = '';
            }
            if (typeof global.renderDirectory === 'function' && state) {
                global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
            }
            if (typeof global.updatePathDisplay === 'function') {
                global.updatePathDisplay();
            }
            input.focus();
        });
        btn.dataset.nautilusSearchClearBound = 'true';
    };

    const bindPathCrumbNavigation = (root) => {
        const pill = root.querySelector('#nautilus-path-pill');
        if (!pill || pill.dataset.nautilusPathCrumbBound === 'true') {
            return;
        }
        pill.addEventListener('click', (event) => {
            const crumb = event.target.closest('.nautilus-app__path-crumb');
            if (!crumb || !pill.contains(crumb)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const targetPath = crumb.dataset.path;
            if (targetPath && typeof global.navigateToFileExplorerDirectory === 'function') {
                global.navigateToFileExplorerDirectory(targetPath, { updateHistory: true });
            }
        });
        pill.dataset.nautilusPathCrumbBound = 'true';
    };

    const bindLocationBarEscape = (root) => {
        const input = root.querySelector('#nemo-search-input');
        if (!input || input.dataset.nautilusLocationEscapeBound === 'true') {
            return;
        }
        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') {
                return;
            }
            const state = getState();
            if (!state || getChromeMode(state) === 'breadcrumb') {
                return;
            }
            event.preventDefault();
            if (state.searchQuery) {
                state.searchQuery = '';
                input.value = '';
                if (typeof global.renderDirectory === 'function') {
                    global.renderDirectory(state.currentPath, { pane: state.activePane || 'primary' });
                }
            }
            setChromeMode('breadcrumb');
        });
        input.dataset.nautilusLocationEscapeBound = 'true';
    };

    function bindFileExplorerNautilusHeaderbar() {
        if (!isNautilusGnome()) {
            return;
        }
        const root = getNemoRoot();
        if (!root) {
            return;
        }

        const state = getState();
        if (state) {
            if (!state.searchFilter) {
                state.searchFilter = 'all';
            }
            if (!state.sortOrder) {
                state.sortOrder = 'name-asc';
            }
            if (!state.searchMode) {
                state.searchMode = 'fulltext';
            }
            if (!state.nautilusChromeMode) {
                state.nautilusChromeMode = getChromeMode(state);
            }
        }

        bindPlateSearch(root);
        bindSearchInfo(root);
        bindSearchClear(root);
        bindPathCrumbNavigation(root);
        bindLocationBarEscape(root);
        bindMenuItems(root);
        bindPopoverMenu(root, '#nautilus-main-menu', '.nautilus-app__sidebar-menu-btn', syncUndoMenuState);
        bindPopoverMenu(root, '#nautilus-path-menu', '#nautilus-path-pill-menu');
        bindPopoverMenu(root, '#nautilus-search-filter-menu', '.nautilus-app__search-filter', syncSearchFilterMenu);
        bindPopoverMenu(root, '#nautilus-view-menu', '.nautilus-app__view-menu-btn', (r) => {
            syncViewMenuHiddenLabel(r);
            syncViewSortMenu(r);
        });

        if (root.dataset.nautilusHeaderbarInit !== 'true') {
            global.document.addEventListener('click', (event) => {
                if (!openPopover || openPopover.hidden) {
                    return;
                }
                if (openPopover.contains(event.target) || (openPopoverAnchor && openPopoverAnchor.contains(event.target))) {
                    return;
                }
                closePopover();
            });
            global.document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closePopover();
                }
            });
            global.addEventListener('resize', closePopover);
            root.dataset.nautilusHeaderbarInit = 'true';
        }

        applyChrome();
        syncSearchFilterMenu(root);
        syncViewSortMenu(root);
    }

    global.bindFileExplorerNautilusHeaderbar = bindFileExplorerNautilusHeaderbar;
    global.setNautilusChromeMode = setChromeMode;
    global.exitNautilusSearchChrome = exitNautilusSearchChrome;
    global.applyNautilusChrome = applyChrome;
    global.setNautilusLocationBarMode = setLocationBarMode;
    global.toggleNautilusLocationBarMode = toggleLocationBarMode;
    global.applyNautilusLocationBarMode = applyLocationBarMode;
    global.passesNautilusSearchFilter = function passesNautilusSearchFilter(item) {
        const filter = (getState() && getState().searchFilter) || 'all';
        if (!item) {
            return true;
        }
        if (filter === 'folders') {
            return item.type === 'folder';
        }
        if (filter === 'files') {
            return item.type !== 'folder';
        }
        return true;
    };

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', (event) => {
            const detail = event.detail || {};
            if (detail.slotId === 'nemo') {
                global.setTimeout(() => bindFileExplorerNautilusHeaderbar(), 0);
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
