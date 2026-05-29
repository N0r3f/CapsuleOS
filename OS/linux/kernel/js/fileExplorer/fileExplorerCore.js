const getFileExplorerRoot = () => {
    if (typeof window !== 'undefined' && window.CAPSULE_CONTENT_ROOT) {
        return String(window.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
    }
    return './apps/system/Dossier_personnel';
};

const getFileExplorerManifestPath = () => `${getFileExplorerRoot()}/nemo-manifest.json`;

/**
 * Réaligne root / clés folders / path href du manifeste sur CAPSULE_CONTENT_ROOT
 * (ex. manifest généré avec un niveau ../ de plus que la skin courante).
 */
const remapManifestToFileExplorerRoot = (manifest) => {
    if (!manifest || typeof manifest !== 'object' || !manifest.folders) {
        return manifest;
    }
    const targetRoot = getFileExplorerRoot();
    const sourceRoot = typeof manifest.root === 'string'
        ? manifest.root.replace(/\/+$/, '')
        : '';
    if (!sourceRoot || sourceRoot === targetRoot) {
        return manifest;
    }
    const rewritePath = (str) => {
        if (typeof str !== 'string') {
            return str;
        }
        if (str === sourceRoot || str.startsWith(`${sourceRoot}/`)) {
            return targetRoot + str.slice(sourceRoot.length);
        }
        return str;
    };
    const newFolders = {};
    Object.keys(manifest.folders).forEach((key) => {
        const folder = manifest.folders[key];
        const newKey = rewritePath(key);
        const newItems = Array.isArray(folder.items)
            ? folder.items.map((item) => {
                const out = { ...item };
                if (item.path != null) {
                    out.path = rewritePath(String(item.path));
                }
                if (item.href != null) {
                    out.href = rewritePath(String(item.href));
                }
                return out;
            })
            : folder.items;
        newFolders[newKey] = { ...folder, items: newItems };
    });
    return {
        ...manifest,
        root: targetRoot,
        folders: newFolders
    };
};

const fileExplorerState = {
    manifest: null,
    manifestPromise: null,
    history: [],
    historyIndex: -1,
    currentPath: null,
    zoomValue: null
};

fileExplorerState.currentPath = getFileExplorerRoot();

const readCssNumberVar = (name, fallbackValue) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
};

const getFileExplorerZoomSettings = () => {
    const min = readCssNumberVar('--nemo-zoom-min', 80);
    const max = readCssNumberVar('--nemo-zoom-max', 140);
    const fallbackDefault = readCssNumberVar('--nemo-zoom-default', 100);
    const defaultValue = Math.max(min, Math.min(max, fallbackDefault));

    return {
        min,
        max,
        defaultValue,
        step: 10
    };
};

const applyFileExplorerZoom = (value) => {
    const nemoRoot = document.getElementById('nemo');
    if (!nemoRoot) {
        return;
    }

    const zoomInput = nemoRoot.querySelector('#zoom');
    const { min, max, defaultValue, step } = getFileExplorerZoomSettings();

    const rawValue = Number(value);
    const safeValue = Number.isFinite(rawValue) ? rawValue : defaultValue;
    const clampedValue = Math.max(min, Math.min(max, safeValue));

    fileExplorerState.zoomValue = clampedValue;
    nemoRoot.style.setProperty('--nemo-item-scale', String(clampedValue / 100));

    if (zoomInput) {
        zoomInput.min = String(min);
        zoomInput.max = String(max);
        zoomInput.step = String(step);
        zoomInput.value = String(clampedValue);
    }
};

const normalizeDirectoryPath = (path) => {
    const root = getFileExplorerRoot();
    if (!path || typeof path !== 'string') {
        return root;
    }

    const trimmedPath = path.trim();
    if (!trimmedPath) {
        return root;
    }

    if (trimmedPath === './' || trimmedPath === '.') {
        return root;
    }

    return trimmedPath.replace(/\/+$/, '') || root;
};

const getFileExplorerFilesCatalog = () => {
    if (typeof fileExplorerSystemLink !== 'undefined' && fileExplorerSystemLink && fileExplorerSystemLink.files) {
        return fileExplorerSystemLink.files;
    }
    if (typeof fileSystemLink !== 'undefined' && fileSystemLink && fileSystemLink.files) {
        return fileSystemLink.files;
    }
    return {};
};

const getFileExplorerIconOverride = (key) => {
    if (typeof window === 'undefined' || !key) {
        return null;
    }

    const maps = [window.CAPSULE_FILE_EXPLORER_ICON_MAP, window.CAPSULE_NEMO_ICON_MAP];
    for (const map of maps) {
        if (map && Object.prototype.hasOwnProperty.call(map, key)) {
            return map[key];
        }
    }

    return null;
};

const getFileExtension = (item) => {
    if (item.extension) {
        return String(item.extension).toLowerCase();
    }

    if (!item.name || !item.name.includes('.')) {
        return '';
    }

    return item.name.split('.').pop().toLowerCase();
};

const getFileViewerTargetByItem = (item) => {
    const extension = getFileExtension(item);
    const getTarget = window.getFileViewerTargetByExtension || window.getMintViewerTargetByExtension;

    if (typeof getTarget !== 'function') {
        return null;
    }

    return {
        extension,
        target: getTarget(extension)
    };
};

const resolveItemIcon = (item) => {
    const filesCatalog = getFileExplorerFilesCatalog();
    const resolveUrl = typeof resolveCapsuleResourceUrl === 'function'
        ? resolveCapsuleResourceUrl
        : (url) => url;

    if (item.type === 'folder') {
        return resolveUrl(
            getFileExplorerIconOverride(item.name)
            || getFileExplorerIconOverride('folder')
            || filesCatalog[item.name]?.image
            || filesCatalog.Dossier_personnel?.image
            || './media/img/elements/nemo/folder.png'
        );
    }

    const extension = getFileExtension(item);
    return resolveUrl(
        getFileExplorerIconOverride(extension)
        || getFileExplorerIconOverride('file')
        || filesCatalog[extension]?.image
        || filesCatalog.txt?.image
        || filesCatalog.Dossier_personnel?.image
        || './media/img/elements/nemo/folder.png'
    );
};

const findFolderLabel = (path) => {
    if (!fileExplorerState.manifest || !fileExplorerState.manifest.folders) {
        return 'Dossier personnel';
    }

    const folderNode = fileExplorerState.manifest.folders[path];
    if (folderNode && folderNode.label) {
        return folderNode.label;
    }

    if (path === getFileExplorerRoot()) {
        return fileExplorerState.manifest.rootLabel || 'Dossier personnel';
    }

    const segments = path.split('/');
    return segments[segments.length - 1] || 'Dossier personnel';
};

const isDolphinTemplate = () => !!document.querySelector('#nemo main#gestionnaire.dolphin-app');

const isCosmicFilesExplorer = () => !!document.querySelector('#nemo main#gestionnaire.cosmic-files-app');

const usesNemoListView = () => (
    isCosmicFilesExplorer()
    || (typeof window !== 'undefined' && window.CAPSULE_EXPLORER_LIST_VIEW === true)
);

const usesNemoListViewFrenchColumns = () => (
    typeof window !== 'undefined'
    && window.CAPSULE_EXPLORER_LIST_VIEW === true
    && !isCosmicFilesExplorer()
);

const shouldHideListViewItem = (item, directoryPath) => {
    if (isCosmicFilesExplorer() && item.name === 'Public') {
        return true;
    }
    if (
        usesNemoListViewFrenchColumns()
        && directoryPath === getFileExplorerRoot()
        && item.name === 'snap'
    ) {
        return true;
    }
    return false;
};

const isGnomeFilesExplorer = () => (
    typeof window !== 'undefined'
    && window.CAPSULE_EXPLORER_SKIN_KEY === 'files'
);

const usesSidebarSelection = () => isDolphinTemplate() || isGnomeFilesExplorer() || isCosmicFilesExplorer();

const formatCosmicModifiedLabel = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return `Aujourd'hui, ${time}`;
};

const getCosmicFolderItemCount = (item) => {
    if (!item || item.type !== 'folder' || !fileExplorerState.manifest || !fileExplorerState.manifest.folders) {
        return 0;
    }
    const node = fileExplorerState.manifest.folders[item.path];
    return node && Array.isArray(node.items) ? node.items.length : 0;
};

const formatCosmicItemMeta = (item) => {
    const modified = formatCosmicModifiedLabel();
    if (item.type === 'folder') {
        const count = getCosmicFolderItemCount(item);
        const label = count === 1 ? '1 élément' : `${count} éléments`;
        return `${modified} - ${label}`;
    }
    return modified;
};

const formatCosmicItemSize = (item) => {
    if (item.type !== 'folder') {
        return '—';
    }
    const count = getCosmicFolderItemCount(item);
    if (count === 0) {
        return '0 items';
    }
    if (count === 1) {
        return '1 item';
    }
    return `${count} items`;
};

const formatListItemSizeFrench = (item) => {
    if (item.type !== 'folder') {
        return '—';
    }
    const count = getCosmicFolderItemCount(item);
    if (count === 0) {
        return '0 élément';
    }
    if (count === 1) {
        return '1 élément';
    }
    return `${count} éléments`;
};

const ensureNemoListViewChrome = () => {
    if (!usesNemoListView()) {
        return;
    }

    const voletContainer = document.querySelector('#nemo #voletContainer');
    const nemoElement = document.querySelector('#nemo .nemoElement');
    if (!voletContainer || !nemoElement) {
        return;
    }

    if (!voletContainer.querySelector('.nemo-app__list-header')) {
        const header = document.createElement('div');
        header.className = 'nemo-app__list-header';
        header.setAttribute('aria-hidden', 'true');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'nemo-app__list-header-name';
        nameSpan.textContent = 'Nom';

        const sizeSpan = document.createElement('span');
        sizeSpan.className = 'nemo-app__list-header-size';
        sizeSpan.textContent = 'Taille';

        const modifiedSpan = document.createElement('span');
        modifiedSpan.className = 'nemo-app__list-header-modified';
        modifiedSpan.textContent = usesNemoListViewFrenchColumns() ? 'Dernière modification' : 'Modifié';

        header.append(nameSpan, sizeSpan, modifiedSpan);
        voletContainer.insertBefore(header, nemoElement);
    }

    nemoElement.classList.add('nemo-app__content-grid', 'nemo-app__content-grid--list');
};

const countFoldersInItems = (items) => {
    if (!items || !Array.isArray(items)) {
        return 0;
    }
    return items.filter((item) => item.type === 'folder').length;
};

const formatDolphinFolderPill = (n) => {
    if (n <= 0) {
        return '0 dossiers';
    }
    if (n === 1) {
        return '1 dossier';
    }
    return `${n} dossiers`;
};

const updateDolphinFolderPill = (folderNode) => {
    if (!isDolphinTemplate()) {
        return;
    }
    const pill = document.getElementById('dolphin-folder-pill');
    if (!pill) {
        return;
    }
    const n = folderNode && Array.isArray(folderNode.items) ? countFoldersInItems(folderNode.items) : 0;
    pill.textContent = formatDolphinFolderPill(n);
};

const updateExplorerWindowTitle = () => {
    if (!isDolphinTemplate()) {
        return;
    }
    const nemoRoot = document.getElementById('nemo');
    if (!nemoRoot) {
        return;
    }
    const windowTitle = nemoRoot.querySelector('#windowTitle');
    if (!windowTitle) {
        return;
    }
    const label = findFolderLabel(fileExplorerState.currentPath);
    windowTitle.textContent = `${label} — Dolphin`;
};

const getSidebarKeyForPath = (path) => {
    const root = getFileExplorerRoot();
    if (path === root) {
        return 'Dossier Personnel';
    }
    const prefix = `${root}/`;
    if (!path.startsWith(prefix)) {
        return null;
    }
    const rest = path.slice(prefix.length);
    const first = rest.split('/')[0];
    const map = {
        Bureau: 'Bureau',
        Documents: 'Documents',
        Musique: 'Musique',
        Images: 'Images',
        Vidéos: 'Vidéos',
        Téléchargements: 'Téléchargements',
    };
    return map[first] || null;
};

const updateDolphinSidebarActive = () => {
    if (!usesSidebarSelection()) {
        return;
    }
    const nemoRoot = document.getElementById('nemo');
    if (!nemoRoot) {
        return;
    }
    const key = getSidebarKeyForPath(fileExplorerState.currentPath);
    const root = getFileExplorerRoot();
    const atRoot = fileExplorerState.currentPath === root;
    nemoRoot.querySelectorAll('#voletnemo a[target="windowElement"]').forEach((a) => {
        const dl = a.getAttribute('data-link');
        const active = atRoot
            ? dl === 'Dossier Personnel'
            : Boolean(key && dl === key);
        a.classList.toggle('dolphin-sidebar__link--active', active);
        a.classList.toggle('nemo-sidebar__link--active', active);
    });
};

const alignDolphinPathBarToContentGrid = () => {
    if (!isDolphinTemplate()) {
        return;
    }
    const nemoRoot = document.getElementById('nemo');
    if (!nemoRoot) {
        return;
    }
    const pathGroup = nemoRoot.querySelector('.dolphin-toolbar__path');
    const contentGrid = nemoRoot.querySelector('.nemo-app__content-grid');
    if (!pathGroup || !contentGrid) {
        return;
    }

    if (contentGrid.offsetParent === null || contentGrid.getClientRects().length === 0) {
        return;
    }
    if (pathGroup.offsetParent === null || pathGroup.getClientRects().length === 0) {
        return;
    }

    const firstGridItem = contentGrid.querySelector('a');
    const targetLeft = (firstGridItem || contentGrid).getBoundingClientRect().left;
    const currentLeft = pathGroup.getBoundingClientRect().left;
    if (!Number.isFinite(targetLeft) || !Number.isFinite(currentLeft)) {
        return;
    }

    if (!pathGroup.dataset.alignBaseMarginLeft) {
        pathGroup.dataset.alignBaseMarginLeft = String(parseFloat(getComputedStyle(pathGroup).marginLeft) || 0);
    }
    const baseMarginLeft = parseFloat(pathGroup.dataset.alignBaseMarginLeft) || 0;
    const delta = targetLeft - currentLeft;
    const boundedDelta = Math.max(-240, Math.min(240, delta));
    const nextMarginLeft = Math.max(0, Math.round(baseMarginLeft + boundedDelta));
    pathGroup.style.marginLeft = `${nextMarginLeft}px`;
};

const updatePathDisplay = () => {
    const pathLabelElement = document.querySelector('#nemo .nemo-app__path-current');
    if (!pathLabelElement) {
        return;
    }

    const label = findFolderLabel(fileExplorerState.currentPath);
    const crumbPrefix = pathLabelElement.querySelector('.dolphin-toolbar__crumb-prefix');
    if (crumbPrefix) {
        pathLabelElement.replaceChildren(crumbPrefix, document.createTextNode(label));
    } else {
        pathLabelElement.textContent = label;
    }
    updateExplorerWindowTitle();
    updateDolphinSidebarActive();
    alignDolphinPathBarToContentGrid();
};

const updateNavigationControls = () => {
    const nemoRoot = document.getElementById('nemo');
    if (!nemoRoot) {
        return;
    }

    const toggleDisabled = (selector, disabled) => {
        const element = nemoRoot.querySelector(selector);
        if (!element) {
            return;
        }

        element.setAttribute('aria-disabled', disabled ? 'true' : 'false');
        element.style.pointerEvents = disabled ? 'none' : 'auto';
        element.style.opacity = disabled ? '0.45' : '1';
    };

    toggleDisabled('#precedent', fileExplorerState.historyIndex <= 0);
    toggleDisabled('#suivant', fileExplorerState.historyIndex >= fileExplorerState.history.length - 1);
    toggleDisabled('#parent', fileExplorerState.currentPath === getFileExplorerRoot());
};

const renderDirectory = (path) => {
    const nemoElement = document.querySelector('#nemo .nemoElement');
    if (!nemoElement || !fileExplorerState.manifest || !fileExplorerState.manifest.folders) {
        return;
    }

    ensureNemoListViewChrome();

    const folderNode = fileExplorerState.manifest.folders[path];
    nemoElement.innerHTML = '';

    if (!folderNode || !Array.isArray(folderNode.items)) {
        nemoElement.innerHTML = '<p class="nemo-app__empty">Dossier introuvable.</p>';
        updateDolphinFolderPill(null);
        return;
    }

    if (!folderNode.items.length) {
        nemoElement.innerHTML = '<p class="nemo-app__empty">Ce dossier est vide.</p>';
        updateDolphinFolderPill(folderNode);
        return;
    }

    folderNode.items.forEach((item) => {
        if (shouldHideListViewItem(item, path)) {
            return;
        }

        const itemLink = document.createElement('a');
        itemLink.setAttribute('data-details', item.type === 'folder' ? 'Dossier' : 'Fichier');

        const icon = document.createElement('img');
        icon.src = resolveItemIcon(item);
        icon.alt = item.name;
        itemLink.appendChild(icon);

        if (usesNemoListView()) {
            const body = document.createElement('span');
            body.className = 'nemo-app__item-body';

            const nameEl = document.createElement('span');
            nameEl.className = 'nemo-app__item-name';
            nameEl.textContent = item.name;
            body.appendChild(nameEl);

            if (isCosmicFilesExplorer()) {
                const metaEl = document.createElement('span');
                metaEl.className = 'nemo-app__item-meta';
                metaEl.textContent = formatCosmicItemMeta(item);
                body.appendChild(metaEl);
            }

            itemLink.appendChild(body);

            const modifiedEl = document.createElement('span');
            modifiedEl.className = 'nemo-app__item-modified';
            modifiedEl.textContent = formatCosmicModifiedLabel();
            itemLink.appendChild(modifiedEl);

            const sizeEl = document.createElement('span');
            sizeEl.className = 'nemo-app__item-size';
            sizeEl.textContent = usesNemoListViewFrenchColumns()
                ? formatListItemSizeFrench(item)
                : formatCosmicItemSize(item);
            itemLink.appendChild(sizeEl);
        } else {
            const label = document.createElement('span');
            label.textContent = item.name;
            itemLink.appendChild(label);
        }

        const selectGridItem = () => {
            const grid = nemoElement.closest('.nemo-app__content-grid') || nemoElement;
            grid.querySelectorAll('.nemo-app__item--selected').forEach((el) => {
                el.classList.remove('nemo-app__item--selected');
            });
            itemLink.classList.add('nemo-app__item--selected');
        };

        if (item.type === 'folder') {
            itemLink.classList.add('nemo-app__item--folder');
            itemLink.href = '#';
            itemLink.addEventListener('mousedown', (event) => {
                if (event.button === 0) {
                    selectGridItem();
                }
            });
            itemLink.addEventListener('click', (event) => {
                event.preventDefault();
                navigateToFileExplorerDirectory(item.path);
            });
        } else {
            const fileHref = item.href || `${path}/${item.name}`;
            itemLink.href = fileHref;

            const viewerPayload = getFileViewerTargetByItem(item);
            if (viewerPayload && viewerPayload.target) {
                itemLink.addEventListener('click', (event) => {
                    event.preventDefault();

                    const openViewer = window.openFileInViewer || window.openMintFileInViewer;
                    if (typeof openViewer === 'function') {
                        openViewer(fileHref, viewerPayload.extension, item.name);
                    }
                });
            } else {
                itemLink.target = '_blank';
                itemLink.rel = 'noopener noreferrer';
            }
        }

        nemoElement.appendChild(itemLink);
    });

    updateDolphinFolderPill(folderNode);
};

const pushHistory = (path) => {
    const isSameAsCurrent = fileExplorerState.historyIndex >= 0 && fileExplorerState.history[fileExplorerState.historyIndex] === path;
    if (isSameAsCurrent) {
        return;
    }

    fileExplorerState.history = fileExplorerState.history.slice(0, fileExplorerState.historyIndex + 1);
    fileExplorerState.history.push(path);
    fileExplorerState.historyIndex = fileExplorerState.history.length - 1;
};

const loadManifest = async () => {
    if (fileExplorerState.manifest) {
        return fileExplorerState.manifest;
    }

    const useEmbedManifest = () => {
        if (typeof window === 'undefined' || !(window.CAPSULE_FILE_EXPLORER_MANIFEST_EMBED || window.CAPSULE_NEMO_MANIFEST_EMBED)) {
            return false;
        }
        if (window.CAPSULE_FORCE_APP_EMBED === true) {
            return true;
        }
        if (typeof location !== 'undefined' && location.protocol === 'file:') {
            return true;
        }
        return false;
    };

    if (useEmbedManifest()) {
        const raw = (window.CAPSULE_FILE_EXPLORER_MANIFEST_EMBED || window.CAPSULE_NEMO_MANIFEST_EMBED);
        const cloned = JSON.parse(JSON.stringify(raw));
        const manifest = remapManifestToFileExplorerRoot(cloned);
        fileExplorerState.manifest = manifest;
        return manifest;
    }

    if (!fileExplorerState.manifestPromise) {
        fileExplorerState.manifestPromise = fetch(getFileExplorerManifestPath())
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                return response.json();
            })
            .then((manifest) => {
                const aligned = remapManifestToFileExplorerRoot(manifest);
                fileExplorerState.manifest = aligned;
                return aligned;
            })
            .catch((error) => {
                fileExplorerState.manifestPromise = null;
                throw error;
            });
    }

    return fileExplorerState.manifestPromise;
};

const navigateToFileExplorerDirectory = async (directory, options = {}) => {
    const { updateHistory = true } = options;

    try {
        await loadManifest();

        const path = normalizeDirectoryPath(directory);
        if (!fileExplorerState.manifest.folders[path]) {
            console.warn(`Chemin explorateur introuvable: ${path}`);
            renderDirectory('__invalid__');
            return;
        }

        fileExplorerState.currentPath = path;

        if (updateHistory) {
            pushHistory(path);
        }

        renderDirectory(path);
        updatePathDisplay();
        updateNavigationControls();
        alignDolphinPathBarToContentGrid();
    } catch (error) {
        console.error('Erreur lors du chargement du manifeste explorateur:', error);
    }
};

const loadFileExplorerDirectory = (directory) => navigateToFileExplorerDirectory(directory, { updateHistory: true });

const getParentPath = () => {
    const root = getFileExplorerRoot();
    if (fileExplorerState.currentPath === root) {
        return root;
    }

    const segments = fileExplorerState.currentPath.split('/');
    segments.pop();
    const parentPath = segments.join('/');
    return parentPath || root;
};

const goToPreviousDirectory = () => {
    if (fileExplorerState.historyIndex <= 0) {
        return;
    }

    fileExplorerState.historyIndex -= 1;
    const previousPath = fileExplorerState.history[fileExplorerState.historyIndex];
    navigateToFileExplorerDirectory(previousPath, { updateHistory: false });
};

const goToNextDirectory = () => {
    if (fileExplorerState.historyIndex >= fileExplorerState.history.length - 1) {
        return;
    }

    fileExplorerState.historyIndex += 1;
    const nextPath = fileExplorerState.history[fileExplorerState.historyIndex];
    navigateToFileExplorerDirectory(nextPath, { updateHistory: false });
};

const goToParentDirectory = () => {
    const parentPath = getParentPath();
    navigateToFileExplorerDirectory(parentPath, { updateHistory: true });
};

const goToHomeDirectory = () => {
    navigateToFileExplorerDirectory(getFileExplorerRoot(), { updateHistory: true });
};

const bindFileExplorerNavigationControls = () => {
    const nemoRoot = document.getElementById('nemo');
    if (!nemoRoot || nemoRoot.dataset.nemoControlsInit === 'true') {
        return;
    }

    const bindControl = (selector, handler) => {
        const element = nemoRoot.querySelector(selector);
        if (!element) {
            return;
        }

        element.addEventListener('click', (event) => {
            event.preventDefault();
            handler();
        });
    };

    bindControl('#precedent', goToPreviousDirectory);
    bindControl('#suivant', goToNextDirectory);
    bindControl('#parent', goToParentDirectory);
    bindControl('#home', goToHomeDirectory);

    const zoomInput = nemoRoot.querySelector('#zoom');
    if (zoomInput && nemoRoot.dataset.nemoZoomInit !== 'true') {
        zoomInput.addEventListener('input', () => {
            applyFileExplorerZoom(zoomInput.value);
        });

        const { defaultValue } = getFileExplorerZoomSettings();
        applyFileExplorerZoom(fileExplorerState.zoomValue ?? defaultValue);
        nemoRoot.dataset.nemoZoomInit = 'true';
    }

    nemoRoot.dataset.nemoControlsInit = 'true';
    updateNavigationControls();
    alignDolphinPathBarToContentGrid();

    if (nemoRoot.dataset.nemoPathAlignResizeInit !== 'true') {
        window.addEventListener('resize', alignDolphinPathBarToContentGrid);
        nemoRoot.dataset.nemoPathAlignResizeInit = 'true';
    }
};

window.loadFileExplorerDirectory = loadFileExplorerDirectory;
window.loadDirectory = loadFileExplorerDirectory;
window.navigateToFileExplorerDirectory = navigateToFileExplorerDirectory;
window.navigateToDirectory = navigateToFileExplorerDirectory;
window.bindFileExplorerNavigationControls = bindFileExplorerNavigationControls;
window.bindNemoNavigationControls = bindFileExplorerNavigationControls;
window.applyFileExplorerZoom = applyFileExplorerZoom;
window.applyNemoZoom = applyFileExplorerZoom;
window.getFileExplorerRoot = getFileExplorerRoot;
window.getNemoRoot = getFileExplorerRoot;
