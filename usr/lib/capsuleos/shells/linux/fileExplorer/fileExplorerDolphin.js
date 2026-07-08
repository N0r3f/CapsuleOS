/**
 * Dolphin : recherche, aperçu (toggle), vue scindée.
 * S’appuie sur fileExplorerState / fileExplorerCore.js (template `dolphin`).
 */
'use strict';
(function initFileExplorerDolphin() {
    const getState = () => window.fileExplorerState || null;

    const isDolphin = () => (
        typeof window.isDolphinTemplate === 'function' && window.isDolphinTemplate()
    );

    let layoutRootOverride = null;

    const queryInRoot = (root, selector) => {
        if (!root || typeof root.querySelector !== 'function') {
            return null;
        }
        return root.querySelector(selector);
    };

    const getRoot = () => {
        const preferred = layoutRootOverride;
        if (preferred && typeof preferred.querySelector === 'function') {
            return preferred;
        }
        if (typeof window.getExplorerWindowSlot === 'function') {
            const slot = window.getExplorerWindowSlot();
            if (slot && typeof slot.querySelector === 'function') {
                return slot;
            }
        }
        const fallback = document.querySelector('div.windowElement#nemo[data-link="nemo"]')
            || document.querySelector('object#desktop div.windowElement#nemo[data-link="nemo"]')
            || document.querySelector('#desktop div.windowElement#nemo[data-link="nemo"]');
        return fallback && typeof fallback.querySelector === 'function' ? fallback : null;
    };

    const getExplorerShell = () => queryInRoot(getRoot(), 'main#gestionnaire.dolphin-app')
        || queryInRoot(getRoot(), 'main.dolphin-app')
        || null;

    const getPanesWrap = () => queryInRoot(getExplorerShell(), '#dolphin-content-panes')
        || document.getElementById('dolphin-content-panes');

    const getVolet = () => queryInRoot(getRoot(), '#voletContainer') || null;

    const hasDolphinShell = () => !!(
        getExplorerShell()
        || queryInRoot(getRoot(), 'main#gestionnaire.dolphin-app, main.dolphin-app')
    );

    const ensurePreviewToolbarControls = () => {
        const shell = getExplorerShell() || queryInRoot(getRoot(), 'main.dolphin-app, main#gestionnaire');
        if (!shell) {
            return;
        }

        let previewToggle = shell.querySelector('#dolphin-preview-toggle');
        if (!previewToggle) {
            const actions = shell.querySelector('.dolphin-toolbar__actions, .nemo-app__toolbar-group--actions');
            if (actions) {
                previewToggle = document.createElement('a');
                previewToggle.href = '#';
                previewToggle.id = 'dolphin-preview-toggle';
                previewToggle.className = 'dolphin-toolbar__btn dolphin-toolbar__btn--preview';
                previewToggle.setAttribute('aria-label', 'Aperçu');
                previewToggle.setAttribute('aria-pressed', 'false');
                previewToggle.innerHTML = '<span class="dolphin-ico dolphin-ico--preview" aria-hidden="true"></span><span>Aperçu</span>';
                actions.insertBefore(previewToggle, actions.firstChild);
            }
        }

        const legacySplit = shell.querySelector(
            '#dolphin-split-toggle, .dolphin-toolbar__actions a[title="Vue scindée"], .dolphin-toolbar__actions a[aria-label="Vue scindée"]'
        );
        if (legacySplit && !legacySplit.id) {
            legacySplit.id = 'dolphin-split-toggle';
            legacySplit.classList.add('dolphin-toolbar__btn', 'dolphin-toolbar__btn--split');
            legacySplit.setAttribute('aria-pressed', 'false');
        }

        if (!shell.querySelector('#dolphin-search')) {
            const actions = shell.querySelector('.dolphin-toolbar__actions, .nemo-app__toolbar-group--actions');
            const legacySearch =(actions == null ? void 0 : actions.querySelector)('a[title="Rechercher"], a[aria-label="Rechercher"]');
            if (legacySearch && actions) {
                const label = document.createElement('label');
                label.className = 'dolphin-toolbar__search';
                label.setAttribute('aria-label', 'Rechercher');
                label.innerHTML = '<span class="dolphin-ico dolphin-ico--search" aria-hidden="true"></span>';
                const input = document.createElement('input');
                input.type = 'search';
                input.id = 'dolphin-search';
                input.className = 'dolphin-toolbar__search-input';
                input.placeholder = 'Rechercher...';
                input.setAttribute('aria-label', 'Rechercher');
                input.autocomplete = 'off';
                label.appendChild(input);
                legacySearch.replaceWith(label);
            }
        }

    };

    const mountDolphinShellLayout = () => {
        if (!hasDolphinShell()) {
            return;
        }
        ensurePreviewToolbarControls();

        const shell = getExplorerShell() || queryInRoot(getRoot(), 'main.dolphin-app, main#gestionnaire');
        const volet = getVolet();
        if (!shell || !volet) {
            ensurePreviewPaneDom();
            return;
        }

        let panes = shell.querySelector('#dolphin-content-panes');
        const grid = volet.querySelector(':scope > .nemoElement, .dolphin-content-pane .nemoElement, .nemoElement');
        const pill = volet.querySelector(':scope > #dolphin-folder-pill, .dolphin-content-pane > #dolphin-folder-pill');

        if (!panes && grid) {
            panes = document.createElement('div');
            panes.id = 'dolphin-content-panes';
            panes.className = 'dolphin-content-panes';

            const primaryPane = document.createElement('div');
            primaryPane.className = 'dolphin-content-pane dolphin-content-pane--primary dolphin-content-pane--active';
            primaryPane.dataset.pane = 'primary';
            if (pill && pill.parentElement === volet) {
                primaryPane.appendChild(pill);
            }
            if (!grid.dataset.pane) {
                grid.dataset.pane = 'primary';
            }
            primaryPane.appendChild(grid);
            panes.appendChild(primaryPane);
            volet.appendChild(panes);
        }

        ensurePreviewPaneDom();
    };

    const ensurePreviewPaneDom = () => {
        const root = getRoot();
        const shell = getExplorerShell() || root;
        if (!shell) {
            return getPreviewNodes();
        }

        let panes = shell.querySelector('#dolphin-content-panes');
        if (!panes && getVolet()) {
            panes = document.createElement('div');
            panes.id = 'dolphin-content-panes';
            panes.className = 'dolphin-content-panes';
            const volet = getVolet();
            const legacyGrid = volet.querySelector('.nemoElement');
            const pill = volet.querySelector('#dolphin-folder-pill');
            if (legacyGrid) {
                const primaryPane = document.createElement('div');
                primaryPane.className = 'dolphin-content-pane dolphin-content-pane--primary dolphin-content-pane--active';
                primaryPane.dataset.pane = 'primary';
                if (pill && pill.parentElement === volet) {
                    primaryPane.appendChild(pill);
                }
                if (!legacyGrid.dataset.pane) {
                    legacyGrid.dataset.pane = 'primary';
                }
                primaryPane.appendChild(legacyGrid);
                panes.appendChild(primaryPane);
                volet.appendChild(panes);
            }
        }

        let pane = shell.querySelector('#dolphin-preview-pane');
        if (!pane && panes) {
            pane = document.createElement('aside');
            pane.id = 'dolphin-preview-pane';
            pane.className = 'dolphin-preview-pane';
            pane.setAttribute('aria-label', 'Aperçu');
            pane.hidden = true;

            const header = document.createElement('header');
            header.className = 'dolphin-preview-pane__header';
            const title = document.createElement('span');
            title.id = 'dolphin-preview-title';
            title.className = 'dolphin-preview-pane__title';
            title.textContent = 'Aperçu';
            header.appendChild(title);

            const body = document.createElement('div');
            body.id = 'dolphin-preview-body';
            body.className = 'dolphin-preview-pane__body';
            body.innerHTML = '<p class="dolphin-preview-pane__empty">Sélectionnez un fichier pour afficher l’aperçu.</p>';

            pane.appendChild(header);
            pane.appendChild(body);
            panes.appendChild(pane);
        }

        return getPreviewNodes();
    };

    const getPreviewNodes = () => {
        const shell = getExplorerShell() || getRoot();
        if (!shell) {
            return { body: null, title: null, pane: null, toggle: null };
        }
        return {
            body: shell.querySelector('#dolphin-preview-body'),
            title: shell.querySelector('#dolphin-preview-title'),
            pane: shell.querySelector('#dolphin-preview-pane'),
            toggle: shell.querySelector('#dolphin-preview-toggle')
        };
    };

    const getPaneGrid = (paneId) => {
        const root = getRoot();
        if (!root) {
            return null;
        }
        return root.querySelector(`.nemoElement[data-pane="${paneId}"]`)
            || root.querySelector('.nemoElement');
    };

    const getPanePath = (paneId) => {
        const state = getState();
        if (!state) {
            return null;
        }
        return paneId === 'secondary' ? state.secondaryPath : state.currentPath;
    };

    const normalizeSearch = (value) => {
        if (window.CapsuleAppSearch && typeof window.CapsuleAppSearch.normalize === 'function') {
            return window.CapsuleAppSearch.normalize(value);
        }
        return String(value || '').toLowerCase().trim();
    };

    const filterItemsBySearch = (items, query) => {
        if (!query) {
            return items;
        }
        const normalizedQuery = normalizeSearch(query);
        if (!normalizedQuery) {
            return items;
        }
        return items.filter((item) => normalizeSearch(item.name).includes(normalizedQuery));
    };

    const syncPreviewOpenState = () => {
        const state = getState();
        const toggle = getPreviewNodes().toggle;
        if (!state) {
            return false;
        }
        if (state.previewOpen) {
            return true;
        }
        if (!toggle) {
            return false;
        }
        const open = toggle.getAttribute('aria-pressed') === 'true';
        state.previewOpen = open;
        return open;
    };

    const isPreviewOpen = () => syncPreviewOpenState();

    /** Mode aperçu actif (bouton, état ou colonne déjà ouverte). */
    const isPreviewModeActive = () => {
        const state = getState();
        const { toggle } = getPreviewNodes();
        const panes = getPanesWrap();
        const toggleOn =(toggle == null ? void 0 : toggle.getAttribute)('aria-pressed') === 'true';
        const panesOpen = !!(panes && panes.classList.contains('dolphin-content-panes--preview-open'));
        if ((toggleOn || panesOpen) && state) {
            state.previewOpen = true;
        }
        return toggleOn || panesOpen || !!(state == null ? void 0 : state.previewOpen);
    };

    const applyPreviewPaneOpenLayout = (pane) => {
        if (!pane) {
            return;
        }
        pane.hidden = false;
        pane.removeAttribute('hidden');
        pane.setAttribute('aria-hidden', 'false');
        pane.style.display = 'flex';
        pane.style.flexDirection = 'column';
        pane.style.flex = '0 0 280px';
        pane.style.width = '280px';
        pane.style.minWidth = '200px';
        pane.style.maxWidth = '42%';
        pane.style.overflow = 'hidden';
        pane.style.visibility = 'visible';
        pane.style.padding = '';
        pane.style.margin = '';
        pane.style.border = '';
        pane.style.borderLeft = '1px solid var(--dolphin-chrome-border, #bdc3c7)';
        pane.style.background = 'var(--dolphin-chrome, #eff0f1)';
    };

    const applyPreviewPaneClosedLayout = (pane) => {
        if (!pane) {
            return;
        }
        pane.hidden = true;
        pane.setAttribute('hidden', '');
        pane.setAttribute('aria-hidden', 'true');
        pane.style.display = 'none';
        pane.style.flex = '0 0 0';
        pane.style.width = '0';
        pane.style.minWidth = '0';
        pane.style.maxWidth = '0';
        pane.style.overflow = 'hidden';
        pane.style.visibility = 'hidden';
    };

    const resolveFileHref = (item, folderPath) => {
        const resolveUrl = typeof window.resolveCapsuleResourceUrl === 'function'
            ? window.resolveCapsuleResourceUrl
            : (url) => url;
        const rawHref = item.href || `${folderPath}/${item.name}`;
        const resolved = resolveUrl(rawHref);
        if (typeof resolved !== 'string') {
            return rawHref;
        }
        if (/^(https?:|file:|data:|blob:)/i.test(resolved)) {
            return resolved;
        }
        try {
            return new URL(resolved, document.baseURI || window.location.href).href;
        } catch (error) {
            return resolved;
        }
    };

    const itemFromLink = (link) => {
        const name = link.dataset.itemName || '';
        const extension = link.dataset.itemExtension
            || (name.includes('.') ? name.split('.').pop().toLowerCase() : '');
        return {
            name,
            type: link.dataset.itemType || 'file',
            extension,
            href: link.dataset.itemHref || '',
            path: link.dataset.itemTargetPath || ''
        };
    };

    const renderPreviewContent = (item, folderPath) => {
        const { body, title, pane } = ensurePreviewPaneDom();
        if (!body) {
            return;
        }

        const getTarget = window.getFileViewerTargetByExtension || window.getMintViewerTargetByExtension;
        const extension = typeof window.getFileExtension === 'function'
            ? window.getFileExtension(item)
            : (item.name && item.name.includes('.') ? item.name.split('.').pop().toLowerCase() : '');
        const appId = typeof getTarget === 'function' ? getTarget(extension) : null;
        const href = resolveFileHref(item, folderPath);

        if (title) {
            title.textContent = item.name || 'Aperçu';
        }

        body.innerHTML = '';
        ensurePreviewPaneVisible();
        if (pane) {
            pane.removeAttribute('hidden');
        }

        if (!appId) {
            const message = document.createElement('p');
            message.className = 'dolphin-preview-pane__empty';
            message.textContent = 'Aucun aperçu disponible pour ce type de fichier.';
            body.appendChild(message);
            return;
        }

        if (appId === 'visionneur_images') {
            const image = document.createElement('img');
            image.src = href;
            image.alt = item.name || '';
            image.addEventListener('error', () => {
                body.innerHTML = '<p class="dolphin-preview-pane__empty">Impossible de charger l’image.</p>';
            });
            body.appendChild(image);
            return;
        }

        if (appId === 'visionneur_pdf') {
            const objectEl = document.createElement('object');
            objectEl.className = 'dolphin-preview-pane__pdf';
            objectEl.type = 'application/pdf';
            objectEl.data = href;
            objectEl.title = item.name || 'PDF';
            objectEl.setAttribute('aria-label', item.name || 'PDF');

            const fallback = document.createElement('p');
            fallback.className = 'dolphin-preview-pane__empty';
            fallback.innerHTML = `Impossible d’afficher le PDF ici. <a href="${href}" target="_blank" rel="noopener noreferrer">Ouvrir le fichier</a>`;
            objectEl.appendChild(fallback);
            body.appendChild(objectEl);
            return;
        }

        if (appId === 'lecteur_multimedia') {
            const isVideo = ['mp4', 'webm', 'avi'].includes(extension);
            const media = document.createElement(isVideo ? 'video' : 'audio');
            media.controls = true;
            media.preload = 'metadata';
            if (isVideo) {
                media.playsInline = true;
            }
            const source = document.createElement('source');
            source.src = href;
            media.appendChild(source);
            media.addEventListener('error', () => {
                body.innerHTML = '<p class="dolphin-preview-pane__empty">Impossible de lire ce média.</p>';
            });
            body.appendChild(media);
        }
    };

    const clearPreview = () => {
        const state = getState();
        if (state) {
            state.selectedPreview = null;
        }
        const { body, title } = getPreviewNodes();
        if (title) {
            title.textContent = 'Aperçu';
        }
        if (body) {
            body.innerHTML = '<p class="dolphin-preview-pane__empty">Sélectionnez un fichier pour afficher l’aperçu.</p>';
        }
    };

    const ensurePreviewPaneVisible = () => {
        ensurePreviewPaneDom();
        const state = getState();
        if (state) {
            state.previewOpen = true;
        }
        const panes = getPanesWrap();
        const volet = queryInRoot(getExplorerShell(), '#voletContainer');
        const { pane, toggle } = getPreviewNodes();
        if (panes) {
            panes.classList.add('dolphin-content-panes--preview-open');
            panes.style.display = 'flex';
            panes.style.flexDirection = 'row';
            panes.style.width = '100%';
            panes.style.minHeight = '0';
            panes.style.flex = '1 1 auto';
        }
        if (volet) {
            volet.classList.add('dolphin-content-wrap--preview-open');
        }
        applyPreviewPaneOpenLayout(pane);
        if (toggle) {
            toggle.setAttribute('aria-pressed', 'true');
            toggle.classList.add('dolphin-toolbar__btn--active');
        }
    };

    const updatePreviewChrome = () => {
        ensurePreviewPaneDom();
        const state = getState();
        const panes = getPanesWrap();
        const volet = queryInRoot(getExplorerShell(), '#voletContainer');
        const { pane, toggle } = getPreviewNodes();
        const open = !!(state && state.previewOpen);
        if (panes) {
            panes.classList.toggle('dolphin-content-panes--preview-open', open);
        }
        if (volet) {
            volet.classList.toggle('dolphin-content-wrap--preview-open', open);
        }
        if (open) {
            applyPreviewPaneOpenLayout(pane);
        } else {
            applyPreviewPaneClosedLayout(pane);
        }
        if (toggle) {
            toggle.setAttribute('aria-pressed', open ? 'true' : 'false');
            toggle.classList.toggle('dolphin-toolbar__btn--active', open);
        }
        if (!open) {
            clearPreview();
        }
    };

    const updateSplitChrome = () => {
        const state = getState();
        const panes = getPanesWrap();
        const volet = queryInRoot(getRoot(), '#voletContainer');
        const secondaryPane = queryInRoot(getRoot(), '.dolphin-content-pane--secondary');
        const toggle = document.getElementById('dolphin-split-toggle');
        const open = !!(state && state.splitView);

        if (panes) {
            panes.classList.toggle('dolphin-content-panes--split', open);
        }
        if (volet) {
            volet.classList.toggle('dolphin-content-wrap--split', open);
        }
        if (secondaryPane) {
            secondaryPane.hidden = !open;
            secondaryPane.setAttribute('aria-hidden', open ? 'false' : 'true');
        }
        if (toggle) {
            toggle.setAttribute('aria-pressed', open ? 'true' : 'false');
            toggle.classList.toggle('dolphin-toolbar__btn--active', open);
        }
    };

    const setActivePane = (paneId) => {
        const state = getState();
        if (!state) {
            return;
        }
        state.activePane = paneId;
        var rootEl = getRoot();
        if (rootEl) {
            rootEl.querySelectorAll('.dolphin-content-pane[data-pane]').forEach((pane) => {
                pane.classList.toggle('dolphin-content-pane--active', pane.dataset.pane === paneId);
            });
        }

        if (typeof window.updatePathDisplay === 'function') {
            window.updatePathDisplay();
        }
        if (typeof window.updateExplorerWindowTitle === 'function') {
            window.updateExplorerWindowTitle();
        }
        if (typeof window.updateDolphinSidebarActive === 'function') {
            window.updateDolphinSidebarActive();
        }
        if (typeof window.updateNavigationControls === 'function') {
            window.updateNavigationControls();
        }
    };

    const updateDolphinExplorerChrome = () => {
        mountDolphinShellLayout();
        bindDolphinFilePointerActivation();
        updatePreviewChrome();
        updateSplitChrome();
        setActivePane((getState() == null ? void 0 : getState().activePane) || 'primary');
    };

    const navigateDolphinDirectory = (directory, options = {}) => {
        const navigate = window.navigateToFileExplorerDirectory || window.navigateToDirectory;
        if (typeof navigate !== 'function') {
            return;
        }
        const pane = options.pane ||(getState() == null ? void 0 : getState().activePane) || 'primary';
        navigate(directory, Object.assign( {} , options, { pane: pane }));
    };

    const selectFileLink = (link, paneId) => {
        if (!link) {
            return;
        }
        setActivePane(paneId);
        const grid = getPaneGrid(paneId);
        if (grid) {
            grid.querySelectorAll('.nemo-app__item--selected').forEach((el) => {
                el.classList.remove('nemo-app__item--selected');
            });
            link.classList.add('nemo-app__item--selected');
        }
        if (typeof window.rememberDolphinPaneSelection === 'function') {
            window.rememberDolphinPaneSelection(paneId, link);
        }
    };

    const showFolderPreviewPlaceholder = () => {
        const { body, title, pane } = ensurePreviewPaneDom();
        if (title) {
            title.textContent = 'Aperçu';
        }
        if (body) {
            body.innerHTML = '<p class="dolphin-preview-pane__empty">Double-cliquez pour ouvrir ce dossier.</p>';
        }
        if (pane) {
            pane.removeAttribute('hidden');
        }
        ensurePreviewPaneVisible();
    };

    const handleDolphinItemSelect = (item, folderPath, paneId, event, linkEl) => {
        const state = getState();
        if (!state) {
            return;
        }

        const link = linkEl
            || (((event == null ? void 0 : event.target) == null ? void 0 : (event == null ? void 0 : event.target).closest) ? event.target.closest('a[data-item-name]') : null);
        selectFileLink(link, paneId);

        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        if (item.type === 'folder') {
            state.selectedPreview = null;
            if (typeof window.isDolphinListTreeViewActive === 'function' && window.isDolphinListTreeViewActive()) {
                const targetPath = resolveFolderTargetPath(item, folderPath);
                if (typeof window.dolphinFolderHasVisibleChildren === 'function'
                    && !window.dolphinFolderHasVisibleChildren(targetPath)) {
                    if (event && typeof event.preventDefault === 'function') {
                        event.preventDefault();
                    }
                    return;
                }
                if (typeof window.toggleDolphinListFolderExpanded === 'function') {
                    window.toggleDolphinListFolderExpanded(targetPath, paneId);
                }
                const currentPath = getPanePath(paneId);
                if (currentPath && typeof window.renderDirectory === 'function') {
                    window.renderDirectory(currentPath, { pane: paneId });
                }
                if (event && typeof event.preventDefault === 'function') {
                    event.preventDefault();
                }
                return;
            }
            if (isPreviewModeActive()) {
                state.previewOpen = true;
                showFolderPreviewPlaceholder();
            }
            return;
        }

        if (!isPreviewModeActive()) {
            return;
        }

        state.previewOpen = true;
        state.selectedPreview = { item, folderPath, paneId };
        ensurePreviewPaneVisible();
        renderPreviewContent(item, folderPath);
    };

    const resolveFolderTargetPath = (item, folderPath) => {
        if (item.path) {
            return item.path;
        }
        const normalize = window.normalizeDirectoryPathForExplorer;
        const joined = `${folderPath}/${item.name}`;
        return typeof normalize === 'function' ? normalize(joined) : joined;
    };

    const handleDolphinItemOpen = (item, folderPath, paneId, event) => {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        setActivePane(paneId);

        if (item.type === 'folder') {
            if (typeof window.clearDolphinListExpandedPaths === 'function') {
                window.clearDolphinListExpandedPaths(paneId);
            }
            navigateDolphinDirectory(resolveFolderTargetPath(item, folderPath), {
                pane: paneId,
                updateHistory: true
            });
            return;
        }

        const getViewer = window.getFileViewerTargetByItem;
        const viewerPayload = typeof getViewer === 'function' ? getViewer(item) : null;
        if (!viewerPayload || !viewerPayload.target) {
            setExplorerStatusMessage(`Impossible d’ouvrir « ${item.name} ».`);
            return;
        }

        const href = resolveFileHref(item, folderPath);
        const openViewer = window.openFileInViewer || window.openMintFileInViewer;
        if (typeof openViewer === 'function') {
            openViewer(href, viewerPayload.extension, item.name);
        }
    };

    const attachDolphinItemHandlers = (itemLink, item, folderPath, paneId) => {
        itemLink.addEventListener('mousedown', (event) => {
            if (event.button !== 0) {
                return;
            }
            setActivePane(paneId);
            const grid = getPaneGrid(paneId);
            if (grid) {
                grid.querySelectorAll('.nemo-app__item--selected').forEach((el) => {
                    el.classList.remove('nemo-app__item--selected');
                });
                itemLink.classList.add('nemo-app__item--selected');
            }
        });
    };

    const applySearchToVisiblePanes = () => {
        const state = getState();
        if (!state || !state.searchQuery) {
            var rootSearch = getRoot();
            if (rootSearch) {
                rootSearch.querySelectorAll('.nemo-app__item--search-hidden').forEach((el) => {
                    el.classList.remove('nemo-app__item--search-hidden');
                });
            }
            return;
        }

        const query = state.searchQuery;
        ['primary', 'secondary'].forEach((paneId) => {
            const grid = getPaneGrid(paneId);
            if (!grid) {
                return;
            }
            grid.querySelectorAll('a[data-item-name]').forEach((link) => {
                const name = link.dataset.itemName || '';
                const match = normalizeSearch(name).includes(normalizeSearch(query));
                link.classList.toggle('nemo-app__item--search-hidden', !match);
            });
        });
    };

    const togglePreview = () => {
        const state = getState();
        if (!state) {
            return;
        }
        state.previewOpen = !state.previewOpen;
        updateDolphinExplorerChrome();
        if (state.previewOpen && state.selectedPreview) {
            const { item, folderPath } = state.selectedPreview;
            renderPreviewContent(item, folderPath);
        }
    };

    const resolveGridItemLinkFromEvent = (event) => {
        const root = getRoot();
        if (!root || root.style.display === 'none' || !isDolphin()) {
            return null;
        }
        if (!((event == null ? void 0 : event.target) == null ? void 0 : (event == null ? void 0 : event.target).closest)) {
            return null;
        }
        const link = event.target.closest('a[data-item-name]');
        const volet = getVolet();
        if (!link || !volet || !volet.contains(link)) {
            return null;
        }
        return link;
    };

    const bindDolphinFilePointerActivation = () => {
        if (document.body.dataset.dolphinPointerActivation === 'true') {
            return;
        }

        document.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) {
                return;
            }
            const link = resolveGridItemLinkFromEvent(event);
            if (!link) {
                return;
            }
            const paneId =(link.closest('[data-pane]') == null ? void 0 : link.closest('[data-pane]').dataset).pane
                ||(link.closest('.dolphin-content-pane') == null ? void 0 : link.closest('.dolphin-content-pane').dataset).pane
                || 'primary';
            selectFileLink(link, paneId);
        }, true);

        document.addEventListener('pointerup', (event) => {
            if (event.button !== 0) {
                return;
            }
            const link = resolveGridItemLinkFromEvent(event);
            if (!link) {
                return;
            }
            const paneId =(link.closest('[data-pane]') == null ? void 0 : link.closest('[data-pane]').dataset).pane
                ||(link.closest('.dolphin-content-pane') == null ? void 0 : link.closest('.dolphin-content-pane').dataset).pane
                || 'primary';
            const folderPath = link.dataset.itemFolderPath || '';
            const item = itemFromLink(link);
            handleDolphinItemSelect(item, folderPath, paneId, event, link);
        }, true);

        document.addEventListener('dblclick', (event) => {
            const link = resolveGridItemLinkFromEvent(event);
            if (!link) {
                return;
            }
            const paneId =(link.closest('[data-pane]') == null ? void 0 : link.closest('[data-pane]').dataset).pane
                ||(link.closest('.dolphin-content-pane') == null ? void 0 : link.closest('.dolphin-content-pane').dataset).pane
                || 'primary';
            const folderPath = link.dataset.itemFolderPath || '';
            const item = itemFromLink(link);
            handleDolphinItemOpen(item, folderPath, paneId, event);
        }, true);

        document.body.dataset.dolphinPointerActivation = 'true';

        document.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) {
                return;
            }
            const paneEl = event.target.closest('.dolphin-content-pane[data-pane]');
            if (!paneEl || !resolveGridItemLinkFromEvent(event)) {
                if (paneEl && paneEl.dataset.pane) {
                    setActivePane(paneEl.dataset.pane);
                }
            }
        }, true);
    };

    const setExplorerStatusMessage = (message) => {
        const status = queryInRoot(getRoot(), '#nemoFooterContainer .nemo-app__status-center p');
        if (status) {
            status.textContent = message;
        }
    };

    const refreshExplorerDirectory = () => {
        const state = getState();
        if (!state) {
            return;
        }
        ['primary', 'secondary'].forEach((paneId) => {
            if (paneId === 'secondary' && !state.splitView) {
                return;
            }
            const path = getPanePath(paneId);
            if (path && typeof window.renderDirectory === 'function') {
                window.renderDirectory(path, { pane: paneId });
            }
        });
        if (typeof window.updateNavigationControls === 'function') {
            window.updateNavigationControls();
        }
    };

    const closeDolphinWindow = () => {
        const root = getRoot();
        if (!root) {
            return;
        }
        root.style.display = 'none';
        root.classList.remove('windowElementActive');
        const launcher = document.querySelector('a[target="windowElement"][data-link="nemo"]');
        if (launcher) {
            launcher.classList.remove('active-link');
        }
    };

    const getSelectedFileEntry = () => {
        const paneId =(getState() == null ? void 0 : getState().activePane) || 'primary';
        const grid = getPaneGrid(paneId);
        const link =(grid == null ? void 0 : grid.querySelector)('a.nemo-app__item--selected[data-item-type="file"]');
        if (!link) {
            return null;
        }
        return {
            item: itemFromLink(link),
            folderPath: link.dataset.itemFolderPath || ''
        };
    };

    const copySelectedEntry = async () => {
        const entry = getSelectedFileEntry();
        if (!entry) {
            setExplorerStatusMessage('Sélectionnez un fichier à copier.');
            return false;
        }
        const text = entry.item.name || resolveFileHref(entry.item, entry.folderPath);
        try {
            if ((navigator.clipboard == null ? void 0 : navigator.clipboard.writeText)) {
                await navigator.clipboard.writeText(text);
                setExplorerStatusMessage(`Copié : ${text}`);
                return true;
            }
        } catch (error) {
            setExplorerStatusMessage('Copie indisponible dans ce navigateur.');
        }
        return false;
    };

    const pasteFromClipboard = async () => {
        try {
            if (!(navigator.clipboard == null ? void 0 : navigator.clipboard.readText)) {
                setExplorerStatusMessage('Collage indisponible dans ce navigateur.');
                return false;
            }
            const text = await navigator.clipboard.readText();
            if (!text) {
                setExplorerStatusMessage('Presse-papiers vide.');
                return false;
            }
            setExplorerStatusMessage(`Collé : ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);
            return true;
        } catch (error) {
            setExplorerStatusMessage('Collage indisponible (autorisation refusée).');
            return false;
        }
    };

    const openCapsuleApp = (dataLink) => {
        if (typeof window.openWindowByDataLink === 'function') {
            window.openWindowByDataLink(dataLink);
            return true;
        }
        setExplorerStatusMessage(`Impossible d’ouvrir ${dataLink}.`);
        return false;
    };

    const ensureDolphinWindowVisible = () => {
        const root = getRoot();
        const container = root
            || document.querySelector('div.windowElement[data-link="nemo"]')
            || document.querySelector('div[data-link="nemo"]');
        if (!container) {
            openCapsuleApp('nemo');
            return;
        }
        const hidden = container.style.display === 'none';
        if (hidden) {
            openCapsuleApp('nemo');
            return;
        }
        if (typeof window.CapsuleWindowShell !== 'undefined'
            && typeof window.CapsuleWindowShell.activateWindow === 'function') {
            window.CapsuleWindowShell.activateWindow(container);
        }
    };

    const getActivePaneDirectoryPath = () => {
        const state = getState();
        if (!state) {
            return typeof window.getFileExplorerRoot === 'function' ? window.getFileExplorerRoot() : '';
        }
        const paneId = state.activePane || 'primary';
        if (paneId === 'secondary') {
            return state.secondaryPath || state.currentPath ||(window.getFileExplorerRoot == null ? void 0 : window.getFileExplorerRoot());
        }
        return state.currentPath ||(window.getFileExplorerRoot == null ? void 0 : window.getFileExplorerRoot());
    };

    const openDolphinNewTab = () => {
        ensureDolphinWindowVisible();
        const state = getState();
        if (!state) {
            return;
        }

        if (!state.splitView) {
            state.splitView = true;
            updateSplitChrome();
        }

        const home = typeof window.getFileExplorerRoot === 'function'
            ? window.getFileExplorerRoot()
            : state.currentPath;
        navigateDolphinDirectory(home, { pane: 'secondary', updateHistory: true });
        setActivePane('secondary');
        setExplorerStatusMessage('Nouvel onglet (volet droit).');
    };

    const openDolphinNewWindow = () => {
        const opened = window.open(window.location.href, '_blank', 'noopener,noreferrer');
        if (!opened) {
            setExplorerStatusMessage('Autorisez les fenêtres popup pour ouvrir une nouvelle fenêtre.');
            return;
        }
        setExplorerStatusMessage('Nouvelle fenêtre ouverte.');
    };

    const createNewFolderInCurrentDirectory = async () => {
        ensureDolphinWindowVisible();
        const parentPath = getActivePaneDirectoryPath();
        let name = 'Nouveau dossier';

        if (typeof window.prompt === 'function') {
            const input = window.prompt('Nom du nouveau dossier :', name);
            if (input === null) {
                return;
            }
            name = input.trim();
        }

        if (!name) {
            setExplorerStatusMessage('Nom de dossier vide.');
            return;
        }

        const createFolder = window.createFolderInExplorer;
        if (typeof createFolder !== 'function') {
            setExplorerStatusMessage('Création de dossier indisponible.');
            return;
        }

        const result = await createFolder(parentPath, name);
        if (result.ok) {
            setExplorerStatusMessage(`Dossier « ${result.name} » créé.`);
            return;
        }
        setExplorerStatusMessage(result.message || 'Impossible de créer le dossier.');
    };

    const normalizeMenuLabel = (label) => label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    const resolveDolphinMenuAction = (label, context) => {
        const key = normalizeMenuLabel(label);
        const actions = {
            'nouvel onglet': openDolphinNewTab,
            'nouvelle fenetre': openDolphinNewWindow,
            'creer un nouveau dossier': createNewFolderInCurrentDirectory,
            fermer: closeDolphinWindow,
            annuler: () => setExplorerStatusMessage('Annuler : non disponible.'),
            retablir: () => setExplorerStatusMessage('Rétablir : non disponible.'),
            copier: () => copySelectedEntry(),
            coller: () => pasteFromClipboard(),
            actualiser: refreshExplorerDirectory,
            apercu: () => togglePreview(),
            'aller a': () => {
                const sidebar = queryInRoot(getRoot(), '#voletnemo');
                const link = queryInRoot(sidebar, '.dolphin-sidebar__link');
                if (link && typeof link.focus === 'function') {
                    link.focus();
                }
                if (typeof window.goToHomeDirectory === 'function') {
                    window.goToHomeDirectory();
                }
            },
            outils: () => openCapsuleApp('terminal'),
            configuration: () => openCapsuleApp('themes'),
            aide: () => openCapsuleApp('checklist')
        };

        const handler = actions[key];
        if (!handler) {
            if ((context == null ? void 0 : context.type) === 'top') {
                setExplorerStatusMessage(`${label} : bientôt disponible.`);
            }
            return false;
        }
        handler();
        return true;
    };

    const bindDolphinMenubar = () => {
        const root = getRoot();
        if (!root || typeof window.bindFileExplorerMenubar !== 'function') {
            return;
        }
        window.resolveFileExplorerMenuAction = resolveDolphinMenuAction;
        window.refreshFileExplorerDirectory = refreshExplorerDirectory;
        window.refreshExplorerDirectory = refreshExplorerDirectory;
        window.closeFileExplorerWindow = closeDolphinWindow;
        bindFileExplorerMenubar(root);
    };

    const toggleSplitView = async () => {
        const state = getState();
        if (!state) {
            return;
        }

        state.splitView = !state.splitView;
        updateSplitChrome();

        if (state.splitView) {
            const secondaryPath = state.secondaryPath || state.currentPath ||(window.getFileExplorerRoot == null ? void 0 : window.getFileExplorerRoot());
            if (secondaryPath) {
                navigateDolphinDirectory(secondaryPath, {
                    pane: 'secondary',
                    updateHistory: true
                });
            }
        }
        setActivePane('primary');
    };

    const openDolphinSplitWithItem = (itemData) => {
        ensureDolphinWindowVisible();
        const state = getState();
        if (!state) {
            return;
        }
        if (!state.splitView) {
            state.splitView = true;
            updateSplitChrome();
        }
        const secondaryPath = itemData && itemData.type === 'folder' && itemData.targetPath
            ? itemData.targetPath
            : (state.secondaryPath || state.currentPath || (typeof window.getFileExplorerRoot === 'function'
                ? window.getFileExplorerRoot()
                : ''));
        if (secondaryPath) {
            navigateDolphinDirectory(secondaryPath, {
                pane: 'secondary',
                updateHistory: true,
            });
        }
        setActivePane('secondary');
        setExplorerStatusMessage('Vue scindée ouverte.');
    };

    window.bindAdvancedExplorerModules = function bindAdvancedExplorerModules() {
        if (typeof window.usesAdvancedExplorerOps !== 'function' || !window.usesAdvancedExplorerOps()) {
            return;
        }
        if (typeof window.bindFileExplorerNautilusOps === 'function') {
            window.bindFileExplorerNautilusOps();
        }
        if (typeof window.bindFileExplorerContextMenu === 'function') {
            window.bindFileExplorerContextMenu();
        }
        if (typeof window.bindFileExplorerProperties === 'function') {
            window.bindFileExplorerProperties();
        }
        if (typeof window.bindFileExplorerNautilusFeatures === 'function') {
            window.bindFileExplorerNautilusFeatures();
        }
        if (typeof window.ensureExplorerAdvancedChrome === 'function') {
            const root = getRoot();
            if (root) {
                window.ensureExplorerAdvancedChrome(root);
            }
        }
        if (typeof window.repairExplorerSidebarPlaceLinks === 'function') {
            const root = getRoot();
            if (root) {
                window.repairExplorerSidebarPlaceLinks(root);
            }
        }
    };

    const bindFileExplorerDolphinFeatures = () => {
        if (!hasDolphinShell() && !isDolphin()) {
            return;
        }

        const root = getRoot();
        if (!root) {
            return;
        }

        mountDolphinShellLayout();
        bindDolphinFilePointerActivation();
        bindDolphinMenubar();

        if (root.dataset.dolphinFeaturesInit === 'true') {
            updateDolphinExplorerChrome();
            bindAdvancedExplorerModules();
            return;
        }

        const state = getState();
        if (state) {
            state.previewOpen = state.previewOpen || false;
            state.splitView = state.splitView || false;
            state.activePane = state.activePane || 'primary';
            state.searchQuery = state.searchQuery || '';
            if (!state.secondaryPath) {
                state.secondaryPath = state.currentPath;
            }
        }

        const searchInput = document.getElementById('dolphin-search');
        if (searchInput && searchInput.dataset.dolphinSearchBound !== 'true') {
            searchInput.dataset.dolphinSearchBound = 'true';
            searchInput.addEventListener('input', () => {
                const st = getState();
                if (!st) {
                    return;
                }
                st.searchQuery = searchInput.value.trim();
                ['primary', 'secondary'].forEach((paneId) => {
                    if (paneId === 'secondary' && !st.splitView) {
                        return;
                    }
                    const path = getPanePath(paneId);
                    if (path && typeof window.renderDirectory === 'function') {
                        window.renderDirectory(path, { pane: paneId });
                    }
                });
            });
        }

        const previewToggle = getPreviewNodes().toggle;
        if (previewToggle && previewToggle.dataset.dolphinPreviewBound !== 'true') {
            previewToggle.dataset.dolphinPreviewBound = 'true';
            previewToggle.addEventListener('click', (event) => {
                event.preventDefault();
                togglePreview();
            });
        }

        const splitToggle = queryInRoot(getExplorerShell(), '#dolphin-split-toggle');
        if (splitToggle && splitToggle.dataset.dolphinSplitBound !== 'true') {
            splitToggle.dataset.dolphinSplitBound = 'true';
            splitToggle.addEventListener('click', (event) => {
                event.preventDefault();
                toggleSplitView();
            });
        }

        root.querySelectorAll('.dolphin-content-pane[data-pane]').forEach((paneEl) => {
            if (paneEl.dataset.dolphinPaneBound === 'true') {
                return;
            }
            paneEl.dataset.dolphinPaneBound = 'true';
            paneEl.addEventListener('mousedown', () => {
                setActivePane(paneEl.dataset.pane || 'primary');
            });
        });

        root.dataset.dolphinFeaturesInit = 'true';
        updateDolphinExplorerChrome();
        bindAdvancedExplorerModules();
    };

    const updateDolphinFolderPillForPane = (folderNode, paneId, directoryPath) => {
        const pillId = paneId === 'secondary' ? 'dolphin-folder-pill-secondary' : 'dolphin-folder-pill';
        const pill = document.getElementById(pillId);
        if (!pill) {
            return;
        }
        const path = directoryPath
            || (paneId === 'secondary' ? state.secondaryPath : state.currentPath);
        const countFn = typeof window.countVisibleFoldersInItems === 'function'
            ? window.countVisibleFoldersInItems
            : window.countFoldersInItems;
        const n = folderNode && Array.isArray(folderNode.items) && typeof countFn === 'function'
            ? countFn(folderNode.items, path)
            : 0;
        const label = typeof window.formatDolphinFolderPill === 'function'
            ? window.formatDolphinFolderPill(n)
            : `${n} dossiers`;
        pill.textContent = label;
    };

    const collectDolphinSearchEverywhereItems = (query) => {
        const state = getState();
        const manifest = state && state.manifest;
        if (!manifest || !manifest.folders || !query) {
            return [];
        }
        const results = [];
        Object.keys(manifest.folders).forEach((folderPath) => {
            const node = manifest.folders[folderPath];
            if (!node || !Array.isArray(node.items)) {
                return;
            }
            node.items.forEach((item) => {
                const enriched = Object.assign({}, item, {
                    folderPath: folderPath,
                    searchParentLabel: typeof window.findFolderLabel === 'function'
                        ? window.findFolderLabel(folderPath)
                        : folderPath,
                });
                if (item.type === 'folder') {
                    const resolvedPath = item.path
                        || (item.name && typeof window.joinExplorerPath === 'function'
                            ? window.joinExplorerPath(folderPath, item.name)
                            : (item.name ? `${folderPath}/${item.name}` : ''));
                    if (resolvedPath) {
                        enriched.path = resolvedPath;
                        enriched.targetPath = resolvedPath;
                    }
                }
                results.push(enriched);
            });
        });
        return filterItemsBySearch(results, query);
    };

    const renderDolphinSearchEverywhere = (nemoElement, query) => {
        if (!nemoElement || !query) {
            return;
        }
        const items = collectDolphinSearchEverywhereItems(query);
        const state = getState();
        nemoElement.innerHTML = '';
        if (!items.length) {
            nemoElement.innerHTML = typeof window.buildNautilusEmptyStateMarkup === 'function'
                ? window.buildNautilusEmptyStateMarkup('search')
                : '<p class="nemo-app__empty">Aucun résultat.</p>';
            if (typeof window.applyFileExplorerViewMode === 'function') {
                window.applyFileExplorerViewMode();
            }
            return;
        }
        items.forEach((item) => {
            const parent = item.folderPath || (state && state.currentPath);
            if (typeof window.appendFileExplorerGridItem === 'function') {
                window.appendFileExplorerGridItem(
                    nemoElement,
                    item,
                    parent,
                    (state && state.activePane) || 'primary'
                );
            }
        });
        if (typeof window.applyFileExplorerViewMode === 'function') {
            window.applyFileExplorerViewMode();
        }
    };

    window.getDolphinPaneGrid = getPaneGrid;
    window.filterFileExplorerItemsBySearch = filterItemsBySearch;
    window.renderDolphinSearchEverywhere = renderDolphinSearchEverywhere;
    window.attachDolphinItemHandlers = attachDolphinItemHandlers;
    window.navigateDolphinDirectory = navigateDolphinDirectory;
    window.bindFileExplorerDolphinFeatures = bindFileExplorerDolphinFeatures;
    window.updateDolphinExplorerChrome = updateDolphinExplorerChrome;
    window.updateDolphinFolderPillForPane = updateDolphinFolderPillForPane;
    window.applyDolphinSearchToVisiblePanes = applySearchToVisiblePanes;
    window.bindFileExplorerDolphinVolet = bindDolphinFilePointerActivation;
    window.refreshDolphinShellLayout = (container) => {
        layoutRootOverride = container && typeof container.querySelector === 'function'
            ? container
            : null;
        try {
            mountDolphinShellLayout();
            bindFileExplorerDolphinFeatures();
            bindDolphinMenubar();
            bindAdvancedExplorerModules();
        } finally {
            layoutRootOverride = null;
        }
    };
    window.bindDolphinMenubar = bindDolphinMenubar;
    window.mountDolphinShellLayout = mountDolphinShellLayout;
    window.openDolphinNewTab = openDolphinNewTab;
    window.openDolphinNewWindow = openDolphinNewWindow;
    window.openDolphinSplitWithItem = openDolphinSplitWithItem;
    window.setExplorerStatusMessage = setExplorerStatusMessage;
    window.fileExplorerState = window.fileExplorerState || null;

    bindDolphinFilePointerActivation();
})();
