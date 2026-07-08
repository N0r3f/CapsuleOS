const EXPLORER_WINDOW_SLOT_SELECTOR = 'div.windowElement[data-link="nemo"]';

const getExplorerWindowSlot = () => {
    if (typeof window !== 'undefined' && typeof window.getExplorerWindowSlot === 'function') {
        return window.getExplorerWindowSlot();
    }
    if (typeof document === 'undefined') {
        return null;
    }
    return document.getElementById('nemo')
        || document.querySelector(EXPLORER_WINDOW_SLOT_SELECTOR);
};

const resolveExplorerSlotRoot = (root) => (
    root || getExplorerWindowSlot() || document.querySelector(EXPLORER_WINDOW_SLOT_SELECTOR)
);

const queryExplorerSlot = (selector, root) => {
    const slot = resolveExplorerSlotRoot(root);
    return slot && typeof slot.querySelector === 'function' ? slot.querySelector(selector) : null;
};

const getFileExplorerRoot = () => {
    if (typeof window !== 'undefined' && window.CAPSULE_CONTENT_ROOT) {
        return String(window.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && window.CapsuleUserHome) {
        return window.CapsuleUserHome.resolveRelative();
    }
    return 'home/public';
};

const getFileExplorerManifestPath = () => {
    const root = getFileExplorerRoot();
    if (typeof window !== 'undefined' && window.CapsuleUserHome) {
        return `${root}/${window.CapsuleUserHome.manifestFileName()}`;
    }
    return `${root}/.capsule-manifest.json`;
};

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
                const out = Object.assign( {} , item);
                if (item.path != null) {
                    out.path = rewritePath(String(item.path));
                }
                if (item.href != null) {
                    out.href = rewritePath(String(item.href));
                }
                return out;
            })
            : folder.items;
        newFolders[newKey] = Object.assign( {} , folder, { items: newItems });
    });
    return Object.assign(
        {}
        , manifest, { root: targetRoot }, { folders: newFolders });
};

const FILE_EXPLORER_VIEW_MODES = ['icons', 'compact', 'list'];

const FILE_EXPLORER_VIEW_GRID_CLASS = {
    icons: 'nemo-app__content-grid--icons',
    compact: 'nemo-app__content-grid--compact',
    list: 'nemo-app__content-grid--list'
};

const CAPSULE_PLACE_RECENT = '__capsule/place/recent';
const CAPSULE_PLACE_TRASH = '__capsule/place/trash';
const CAPSULE_PLACE_NETWORK = '__capsule/place/network';
const CAPSULE_PLACE_FILESYSTEM = '__capsule/place/filesystem';
const CAPSULE_PLACE_STARRED = '__capsule/place/starred';

const isCapsuleVirtualPlace = (path) => (
    path === CAPSULE_PLACE_RECENT
    || path === CAPSULE_PLACE_TRASH
    || path === CAPSULE_PLACE_NETWORK
    || path === CAPSULE_PLACE_FILESYSTEM
    || path === CAPSULE_PLACE_STARRED
);

const fileExplorerState = {
    manifest: null,
    manifestPromise: null,
    history: [],
    historyIndex: -1,
    currentPath: null,
    secondaryPath: null,
    secondaryHistory: [],
    secondaryHistoryIndex: -1,
    zoomValue: null,
    viewMode: 'icons',
    searchQuery: '',
    showHiddenFiles: false,
    searchFilter: 'all',
    searchMode: 'fulltext',
    sortOrder: 'name-asc',
    nautilusChromeMode: 'breadcrumb',
    locationBarMode: 'search',
    explorerClipboard: null,
    explorerUndoStack: [],
    explorerRedoStack: [],
    previewOpen: false,
    splitView: false,
    activePane: 'primary',
    paneSelection: { primary: null, secondary: null },
    selectedPreview: null,
    pathNavigationMode: 'label',
    listExpandedPaths: { primary: [], secondary: [] }
};

fileExplorerState.currentPath = getFileExplorerRoot();
fileExplorerState.secondaryPath = getFileExplorerRoot();
window.fileExplorerState = fileExplorerState;

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
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return;
    }

    const zoomInput = nemoRoot.querySelector('#zoom');
    const { min, max, defaultValue, step } = getFileExplorerZoomSettings();

    const rawValue = Number(value);
    const safeValue = Number.isFinite(rawValue) ? rawValue : defaultValue;
    const clampedValue = Math.max(min, Math.min(max, safeValue));

    fileExplorerState.zoomValue = clampedValue;
    const scale = String(clampedValue / 100);
    nemoRoot.style.setProperty('--nemo-item-scale', scale);
    const dolphinShell = nemoRoot.querySelector('main#gestionnaire.dolphin-app');
    if (dolphinShell) {
        dolphinShell.style.setProperty('--nemo-item-scale', scale);
        nemoRoot.querySelectorAll('.nemoElement.nemo-app__content-grid').forEach((grid) => {
            grid.style.setProperty('--nemo-item-scale', scale);
        });
    }

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

    if (trimmedPath.indexOf('__capsule/') === 0) {
        return trimmedPath.replace(/\/+$/, '') || trimmedPath;
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

const FILE_EXPLORER_EXTENSION_ALIASES = {
    docx: 'doc',
    htm: 'html',
    jpeg: 'jpg',
};

const getFileExtension = (item) => {
    let extension = '';
    if (item.extension) {
        extension = String(item.extension).toLowerCase();
    } else if (item.name && item.name.includes('.')) {
        extension = item.name.split('.').pop().toLowerCase();
    }
    if (!extension) {
        return '';
    }
    return FILE_EXPLORER_EXTENSION_ALIASES[extension] || extension;
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

const FILE_EXPLORER_FOLDER_CATALOG_ALIASES = {
    'Dossier personnel': 'Dossier_personnel'
};

const getFileExplorerCatalogIcon = (key) => {
    if (!key) {
        return null;
    }
    const filesCatalog = getFileExplorerFilesCatalog();
    if (!filesCatalog) {
        return null;
    }
    const catalogKey = FILE_EXPLORER_FOLDER_CATALOG_ALIASES[key] || key;
    const entry = filesCatalog[catalogKey];
    return entry && entry.image ? entry.image : null;
};

const resolveItemIcon = (item) => {
    const resolveUrl = typeof resolveCapsuleResourceUrl === 'function'
        ? resolveCapsuleResourceUrl
        : (url) => url;
    const remapIconPath = (path) => {
        if (!path) {
            return path;
        }
        if (typeof CapsuleExplorerIconBase !== 'undefined' && CapsuleExplorerIconBase.remapPath) {
            return CapsuleExplorerIconBase.remapPath(path);
        }
        return path;
    };
    const toIconUrl = (path) => resolveUrl(remapIconPath(path));
    const folderFallback = (typeof CapsuleExplorerIconBase !== 'undefined' && CapsuleExplorerIconBase.catalogIcon)
        ? CapsuleExplorerIconBase.catalogIcon('folder.svg')
        : (window.CapsuleExplorerToolkitPaths
            ? window.CapsuleExplorerToolkitPaths.catalogIcon('folder.svg')
            : './assets/icons/cinnamon/nemo/folder.svg');
    const fileFallback = toIconUrl('./assets/icons/kde/mimeTypes/application-x-generic.svg');

    if (item && item.vfsEntry === true) {
        const icon = getFileExplorerCatalogIcon('folder')
            || getFileExplorerIconOverride('folder')
            || folderFallback;
        return toIconUrl(icon);
    }

    if (item.type === 'folder') {
        const icon = getFileExplorerIconOverride(item.name)
            || getFileExplorerCatalogIcon(item.name)
            || getFileExplorerIconOverride('folder')
            || getFileExplorerCatalogIcon('folder')
            || folderFallback;
        return toIconUrl(icon);
    }

    const extension = getFileExtension(item);
    const icon = getFileExplorerIconOverride(extension)
        || getFileExplorerCatalogIcon(extension)
        || getFileExplorerIconOverride('txt')
        || getFileExplorerCatalogIcon('txt')
        || './assets/icons/kde/mimeTypes/application-x-generic.svg';
    return toIconUrl(icon);
};

const findFolderLabel = (path) => {
    if (path === CAPSULE_PLACE_RECENT) {
        return 'Récent';
    }
    if (path === CAPSULE_PLACE_TRASH) {
        return 'Corbeille';
    }
    if (path === CAPSULE_PLACE_NETWORK) {
        return 'Réseau';
    }
    if (path === CAPSULE_PLACE_FILESYSTEM) {
        return '/';
    }
    if (path === CAPSULE_PLACE_STARRED) {
        return 'Favoris';
    }

    if (typeof window.CapsuleExplorerVfs !== 'undefined' && window.CapsuleExplorerVfs.isExplorerVfsPath(path)) {
        const vfsLabel = window.CapsuleExplorerVfs.getExplorerPathLabel(path);
        if (vfsLabel) {
            return vfsLabel;
        }
    }

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

const isDolphinTemplate = () => !!queryExplorerSlot('main#gestionnaire.dolphin-app');
window.isDolphinTemplate = isDolphinTemplate;

/** Presse-papiers, corbeille, menu contextuel, F2, etc. (Nautilus GNOME + Dolphin). */
const usesAdvancedExplorerOps = () => isNautilusGnomeTemplate() || isDolphinTemplate();
window.usesAdvancedExplorerOps = usesAdvancedExplorerOps;

const isNautilusGnomeTemplate = () => {
    const main = queryExplorerSlot('main#gestionnaire');
    if (main && main.classList.contains('nautilus-app')) {
        return true;
    }
    if (typeof window !== 'undefined' && window.CapsuleExplorerRegistry
        && typeof window.CapsuleExplorerRegistry.isNautilusFamily === 'function') {
        return window.CapsuleExplorerRegistry.isNautilusFamily();
    }
    return false;
};

const isNemoTemplate = () => {
    if (isNautilusGnomeTemplate()) {
        return false;
    }
    if (queryExplorerSlot('main#gestionnaire.nemo-app:not(.nautilus-app)')) {
        return true;
    }
    if (typeof window !== 'undefined' && window.CapsuleExplorerRegistry
        && typeof window.CapsuleExplorerRegistry.isNemoFamily === 'function') {
        return window.CapsuleExplorerRegistry.isNemoFamily();
    }
    return false;
};
window.isNautilusGnomeTemplate = isNautilusGnomeTemplate;
window.isNemoTemplate = isNemoTemplate;

const isCosmicFilesExplorer = () => !!queryExplorerSlot('main#gestionnaire.cosmic-files-app');

const usesNemoListView = () => (
    isCosmicFilesExplorer()
    || (typeof window !== 'undefined' && window.CAPSULE_EXPLORER_LIST_VIEW === true)
);

/** DOM colonnes (nom / taille / date) : Mint/COSMIC toujours ; Dolphin en vues liste ou compacte seulement. */
const usesExplorerListItemDom = () => {
    if (isCosmicFilesExplorer()) {
        return true;
    }
    if (typeof window !== 'undefined' && window.CAPSULE_EXPLORER_LIST_VIEW === true && !isDolphinTemplate()) {
        return true;
    }
    if (isDolphinTemplate()) {
        const mode = fileExplorerState.viewMode || 'icons';
        return mode === 'list' || mode === 'compact';
    }
    return false;
};

const usesNemoListViewFrenchColumns = () => (
    (typeof window !== 'undefined'
        && window.CAPSULE_EXPLORER_LIST_VIEW === true
        && !isCosmicFilesExplorer())
    || (isDolphinTemplate() && fileExplorerState.viewMode === 'list')
);

const passesExplorerSearchFilter = (item) => {
    if (typeof window.passesNautilusSearchFilter === 'function') {
        return window.passesNautilusSearchFilter(item);
    }
    return true;
};

const shouldHideListViewItem = (item, directoryPath) => {
    if (!passesExplorerSearchFilter(item)) {
        return true;
    }
    if (!fileExplorerState.showHiddenFiles && item && String(item.name || '').startsWith('.')) {
        return true;
    }
    if (isCosmicFilesExplorer() && item.name === 'Public') {
        return true;
    }
    // snap : artefact Ubuntu — masqué hors Ubuntu (vérité VM Fedora/Rocky/Alma).
    if (
        directoryPath === getFileExplorerRoot()
        && item.name === 'snap'
        && (usesNemoListViewFrenchColumns() || isDolphinTemplate() || isNemoTemplate()
            || isNautilusGnomeTemplate())
    ) {
        return true;
    }
    return false;
};

const isGnomeFilesExplorer = () => (
    typeof window !== 'undefined'
    && window.CAPSULE_EXPLORER_SKIN_KEY === 'files'
);

const usesSidebarSelection = () => isDolphinTemplate() || isNemoTemplate() || isNautilusGnomeTemplate()
    || isGnomeFilesExplorer() || isCosmicFilesExplorer();

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

const isDolphinListTreeView = () => (
    isDolphinTemplate()
    && fileExplorerState.viewMode === 'list'
    && typeof document !== 'undefined'
    && document.body
    && document.body.id === 'kde-neon'
);

const ensureListExpandedPaths = () => {
    if (!fileExplorerState.listExpandedPaths) {
        fileExplorerState.listExpandedPaths = { primary: [], secondary: [] };
    }
    return fileExplorerState.listExpandedPaths;
};

const getListExpandedPaths = (pane) => {
    const buckets = ensureListExpandedPaths();
    if (!buckets[pane]) {
        buckets[pane] = [];
    }
    return buckets[pane];
};

const isDolphinListFolderExpanded = (folderPath, pane) => (
    getListExpandedPaths(pane).includes(normalizeDirectoryPath(folderPath))
);

const toggleDolphinListFolderExpanded = (folderPath, pane) => {
    const list = getListExpandedPaths(pane);
    const normalized = normalizeDirectoryPath(folderPath);
    const idx = list.indexOf(normalized);
    if (idx >= 0) {
        list.splice(idx, 1);
    } else {
        list.push(normalized);
    }
};

const clearDolphinListExpandedPaths = (pane) => {
    const buckets = ensureListExpandedPaths();
    if (pane) {
        buckets[pane] = [];
        return;
    }
    buckets.primary = [];
    buckets.secondary = [];
};

const resolveDolphinFolderTargetPath = (item, parentPath) => {
    if (item.path) {
        return normalizeDirectoryPath(item.path);
    }
    const parent = normalizeDirectoryPath(parentPath);
    return normalizeDirectoryPath(`${parent}/${item.name}`);
};

const dolphinFolderHasVisibleChildren = (folderPath) => {
    const node = fileExplorerState.manifest
        && fileExplorerState.manifest.folders
        && fileExplorerState.manifest.folders[normalizeDirectoryPath(folderPath)];
    if (!node || !Array.isArray(node.items)) {
        return false;
    }
    return node.items.some((item) => !shouldHideListViewItem(item, folderPath));
};

const appendDolphinListTreeItems = (nemoElement, path, pane, depth = 0) => {
    const folderNode = fileExplorerState.manifest
        && fileExplorerState.manifest.folders
        && fileExplorerState.manifest.folders[normalizeDirectoryPath(path)];
    if (!folderNode || !Array.isArray(folderNode.items)) {
        return;
    }
    folderNode.items.forEach((item) => {
        if (shouldHideListViewItem(item, path)) {
            return;
        }
        appendFileExplorerGridItem(nemoElement, item, path, pane, depth);
    });
};

const syncNemoListHeaderVisibility = () => {
    const voletContainer = document.querySelector(`${EXPLORER_WINDOW_SLOT_SELECTOR} #voletContainer`);
    if (!voletContainer) {
        return;
    }

    const headers = voletContainer.querySelectorAll('.nemo-app__list-header');
    if (!headers.length) {
        return;
    }

    const show = fileExplorerState.viewMode === 'list'
        && (usesNemoListView() || isDolphinTemplate());
    headers.forEach((header) => {
        if (show) {
            header.removeAttribute('hidden');
        } else {
            header.setAttribute('hidden', '');
        }
    });
};

const ensureNemoListViewChrome = () => {
    const needsListChrome = fileExplorerState.viewMode === 'list'
        && (usesNemoListView() || isDolphinTemplate());
    if (!needsListChrome) {
        syncNemoListHeaderVisibility();
        return;
    }

    const voletContainer = queryExplorerSlot('#voletContainer');
    if (!voletContainer) {
        return;
    }

    const gridNodes = isDolphinTemplate()
        ? [...voletContainer.querySelectorAll('.nemoElement[data-pane]')]
        : [...voletContainer.querySelectorAll('.nemoElement')];
    if (!gridNodes.length) {
        return;
    }

    const buildListHeader = () => {
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
        modifiedSpan.textContent = isDolphinTemplate() ? 'Modifié'
            : (usesNemoListViewFrenchColumns() ? 'Dernière modification' : 'Modifié');

        header.append(nameSpan, sizeSpan, modifiedSpan);
        return header;
    };

    gridNodes.forEach((nemoElement) => {
        const gridParent = nemoElement.parentElement;
        if (!gridParent) {
            return;
        }
        if (!gridParent.querySelector(':scope > .nemo-app__list-header')) {
            gridParent.insertBefore(buildListHeader(), nemoElement);
        }
        nemoElement.classList.add('nemo-app__content-grid');
    });

    syncNemoListHeaderVisibility();
};

const countFoldersInItems = (items) => {
    if (!items || !Array.isArray(items)) {
        return 0;
    }
    return items.filter((item) => item.type === 'folder').length;
};

const countVisibleFoldersInItems = (items, directoryPath) => {
    if (!items || !Array.isArray(items)) {
        return 0;
    }
    return items.filter(
        (item) => item.type === 'folder' && !shouldHideListViewItem(item, directoryPath)
    ).length;
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

const updateDolphinFolderPill = (folderNode, paneId = 'primary') => {
    if (!isDolphinTemplate()) {
        return;
    }
    const directoryPath = paneId === 'secondary'
        ? fileExplorerState.secondaryPath
        : fileExplorerState.currentPath;
    if (typeof window.updateDolphinFolderPillForPane === 'function') {
        window.updateDolphinFolderPillForPane(folderNode, paneId, directoryPath);
        return;
    }
    const pill = document.getElementById('dolphin-folder-pill');
    if (!pill) {
        return;
    }
    const n = folderNode && Array.isArray(folderNode.items)
        ? countVisibleFoldersInItems(folderNode.items, directoryPath)
        : 0;
    pill.textContent = formatDolphinFolderPill(n);
};

window.countFoldersInItems = countFoldersInItems;
window.countVisibleFoldersInItems = countVisibleFoldersInItems;
window.formatDolphinFolderPill = formatDolphinFolderPill;

const getExplorerTitleSuffix = () => {
    if (isDolphinTemplate()) {
        return ' - Dolphin';
    }
    if (isNemoTemplate() || isNautilusGnomeTemplate() || usesNemoListView()) {
        const display = typeof window !== 'undefined' && window.CAPSULE_EXPLORER_DISPLAY_NAME
            ? String(window.CAPSULE_EXPLORER_DISPLAY_NAME)
            : (isNautilusGnomeTemplate() ? 'Fichiers' : 'Nemo');
        return ` - ${display}`;
    }
    return '';
};

const updateExplorerWindowTitle = () => {
    const suffix = getExplorerTitleSuffix();
    if (!suffix) {
        return;
    }
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return;
    }
    const windowTitle = nemoRoot.querySelector('#windowTitle');
    if (!windowTitle) {
        return;
    }
    const activePath = fileExplorerState.activePane === 'secondary'
        ? fileExplorerState.secondaryPath
        : fileExplorerState.currentPath;
    const label = findFolderLabel(activePath);
    windowTitle.textContent = `${label}${suffix}`;
};

window.updateExplorerWindowTitle = updateExplorerWindowTitle;

const getSidebarKeyForPath = (path) => {
    const root = getFileExplorerRoot();
    if (path === root) {
        return 'Dossier Personnel';
    }
    if (path === CAPSULE_PLACE_RECENT) {
        return 'Récent';
    }
    if (path === CAPSULE_PLACE_STARRED) {
        return 'Favoris';
    }
    if (path === CAPSULE_PLACE_TRASH) {
        return 'Corbeille';
    }
    if (path === CAPSULE_PLACE_NETWORK) {
        return 'Réseau';
    }
    if (path === CAPSULE_PLACE_FILESYSTEM
        || (typeof window.CapsuleExplorerVfs !== 'undefined' && window.CapsuleExplorerVfs.isExplorerVfsPath(path))) {
        return 'Système de fichiers';
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
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return;
    }
    const sidebarPath = isDolphinTemplate() && fileExplorerState.activePane === 'secondary'
        ? fileExplorerState.secondaryPath
        : fileExplorerState.currentPath;
    const key = getSidebarKeyForPath(sidebarPath);
    const root = getFileExplorerRoot();
    const atRoot = sidebarPath === root;
    nemoRoot.querySelectorAll('#voletnemo a[data-link]').forEach((a) => {
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
    const nemoRoot = getExplorerWindowSlot();
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

const rememberDolphinPaneSelection = (pane, link) => {
    if (!isDolphinTemplate() || !link) {
        return;
    }
    if (!fileExplorerState.paneSelection) {
        fileExplorerState.paneSelection = { primary: null, secondary: null };
    }
    const itemName = link.dataset.itemName || '';
    const folderPath = link.dataset.itemFolderPath || '';
    if (!itemName) {
        fileExplorerState.paneSelection[pane] = null;
        return;
    }
    fileExplorerState.paneSelection[pane] = { folderPath, itemName };
};

const restoreDolphinPaneSelection = (pane, nemoElement, directoryPath) => {
    if (!isDolphinTemplate() || !nemoElement) {
        return;
    }
    const store = fileExplorerState.paneSelection;
    const sel = store && store[pane];
    if (!sel || !sel.itemName || sel.folderPath !== directoryPath) {
        return;
    }
    const grid = nemoElement.closest('.nemo-app__content-grid') || nemoElement;
    const link = grid.querySelector(`a[data-item-name="${sel.itemName.replace(/"/g, '\\"')}"]`);
    if (!link) {
        return;
    }
    grid.querySelectorAll('.nemo-app__item--selected').forEach((el) => {
        el.classList.remove('nemo-app__item--selected');
    });
    link.classList.add('nemo-app__item--selected');
};

const buildNautilusEmptyStateMarkup = (kind) => {
    const specs = {
        folder: { modifier: 'folder', title: 'Le dossier est vide' },
        starred: { modifier: 'star', title: 'Aucun fichier favori' },
        trash: { modifier: 'trash', title: 'La corbeille est vide' },
        recent: { modifier: 'recent', title: 'Aucun fichier récent' },
        network: {
            modifier: 'network',
            title: 'Aucune connexion connue',
            hint: 'Saisir une adresse pour se connecter à un emplacement réseau.',
        },
        search: { modifier: 'search', title: 'Aucun élément ne correspond à la recherche.' },
    };
    const spec = specs[kind] || specs.folder;
    const hint = spec.hint
        ? `<p class="nautilus-folder-empty__hint">${spec.hint}</p>`
        : '';
    return `<section class="nautilus-folder-empty nautilus-folder-empty--${spec.modifier}" aria-live="polite">
        <div class="nautilus-folder-empty__icon" aria-hidden="true"></div>
        <h2 class="nautilus-folder-empty__title">${spec.title}</h2>
        ${hint}
    </section>`;
};

const applyNautilusPlaceChrome = (path) => {
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot || !nemoRoot.querySelector('.nautilus-app--n47')) {
        return;
    }
    const networkBar = nemoRoot.querySelector('#nautilus-network-bar');
    if (networkBar) {
        networkBar.hidden = path !== CAPSULE_PLACE_NETWORK;
    }
};

const updateNautilusSelectionStatus = (itemLink) => {
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot || !nemoRoot.querySelector('.nautilus-app--n47')) {
        return;
    }
    const statusEl = nemoRoot.querySelector('#nemo-status-label');
    const footerEl = nemoRoot.querySelector('#nemoFooterContainer');
    if (!statusEl) {
        return;
    }

    if (footerEl) {
        footerEl.classList.toggle('nautilus-app__status-pill--selection', Boolean(itemLink));
    }

    if (!itemLink) {
        const displayPath = fileExplorerState.currentPath;
        const label = findFolderLabel(displayPath) || 'Dossier personnel';
        const count = nemoRoot.querySelectorAll('.nemoElement > a, .nemo-app__content-grid > a').length;
        statusEl.textContent = `« ${label} » (${count} élément${count !== 1 ? 's' : ''})`;
        return;
    }

    const name = itemLink.dataset.itemName || '';
    const type = itemLink.dataset.itemType || '';
    let count = 0;
    if (type === 'folder') {
        const folderPath = itemLink.dataset.itemTargetPath || '';
        const node = folderPath && fileExplorerState.manifest && fileExplorerState.manifest.folders
            ? fileExplorerState.manifest.folders[folderPath]
            : null;
        if (node && Array.isArray(node.items)) {
            count = node.items.length;
        }
    }
    statusEl.textContent = `« ${name} » sélectionné (contenant ${count} élément${count !== 1 ? 's' : ''})`;
};

const buildExplorerPathSegments = (displayPath) => {
    const path = normalizeDirectoryPath(displayPath);

    if (isCapsuleVirtualPlace(path) && path !== CAPSULE_PLACE_FILESYSTEM) {
        return [{ path, label: findFolderLabel(path) }];
    }

    if (typeof window.CapsuleExplorerVfs !== 'undefined' && window.CapsuleExplorerVfs.isExplorerVfsPath(path)) {
        const vfs = window.CapsuleExplorerVfs;
        const terminalPath = vfs.explorerPathToTerminalPath(path) || '/';
        const parts = terminalPath === '/' ? [] : terminalPath.split('/').filter(Boolean);
        const segments = [{ path: CAPSULE_PLACE_FILESYSTEM, label: '/' }];
        let terminalAcc = '';
        parts.forEach((name) => {
            terminalAcc = terminalAcc ? `${terminalAcc}/${name}` : `/${name}`;
            const explorerSeg = vfs.terminalPathToExplorerPath(terminalAcc) || terminalAcc;
            segments.push({ path: explorerSeg, label: name });
        });
        return segments;
    }

    const root = normalizeDirectoryPath(getFileExplorerRoot());
    if (path === root) {
        return [{ path: root, label: findFolderLabel(root) }];
    }

    if (path.indexOf(`${root}/`) !== 0) {
        return [{ path, label: findFolderLabel(path) }];
    }

    const parts = path.slice(root.length + 1).split('/').filter(Boolean);
    const segments = [{ path: root, label: findFolderLabel(root) }];
    let acc = root;
    parts.forEach((name) => {
        acc = `${acc}/${name}`;
        segments.push({ path: acc, label: findFolderLabel(acc) });
    });
    return segments;
};

const updatePathNavigationToggleButton = () => {
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return;
    }

    const toggleBtn = nemoRoot.querySelector('#nemo-toggle-path-mode');
    if (!toggleBtn) {
        return;
    }

    const breadcrumb = fileExplorerState.pathNavigationMode === 'breadcrumb';
    toggleBtn.setAttribute('aria-pressed', breadcrumb ? 'true' : 'false');
    toggleBtn.classList.toggle('nemo-app__path-mode-btn--active', breadcrumb);
    toggleBtn.title = breadcrumb
        ? 'Mode de navigation : fil d’Ariane (cliquer pour le libellé simple)'
        : 'Mode de navigation : libellé simple (cliquer pour le fil d’Ariane)';
};

const togglePathNavigationMode = () => {
    fileExplorerState.pathNavigationMode = fileExplorerState.pathNavigationMode === 'breadcrumb'
        ? 'label'
        : 'breadcrumb';
    updatePathDisplay();
    updatePathNavigationToggleButton();
};

/* Vérité VM Mint : Nemo affiche le fil d'Ariane par défaut (Ctrl+L pour le champ texte). */
let pathNavigationModeResolved = false;
const resolveDefaultPathNavigationMode = () => {
    if (pathNavigationModeResolved) {
        return;
    }
    pathNavigationModeResolved = true;
    if (isNemoTemplate()) {
        fileExplorerState.pathNavigationMode = 'breadcrumb';
    }
};

const renderPathNavigationDisplay = (pathLabelElement, displayPath) => {
    const crumbPrefix = pathLabelElement.querySelector('.dolphin-toolbar__crumb-prefix');
    const label = findFolderLabel(displayPath);

    if (fileExplorerState.pathNavigationMode !== 'breadcrumb') {
        pathLabelElement.classList.remove('nemo-app__path-breadcrumb');
        if (crumbPrefix) {
            pathLabelElement.replaceChildren(crumbPrefix, document.createTextNode(label));
        } else {
            pathLabelElement.textContent = label;
        }
        return;
    }

    pathLabelElement.classList.add('nemo-app__path-breadcrumb');
    const fragment = document.createDocumentFragment();
    if (crumbPrefix) {
        fragment.appendChild(crumbPrefix.cloneNode(true));
    }

    const segments = buildExplorerPathSegments(displayPath);
    segments.forEach((segment, index) => {
        if (index > 0 && !isNemoTemplate()) {
            const separator = document.createElement('span');
            separator.className = 'nemo-app__path-sep';
            separator.setAttribute('aria-hidden', 'true');
            separator.textContent = '›';
            fragment.appendChild(separator);
        }

        const link = document.createElement('a');
        link.href = '#';
        link.className = 'nemo-app__path-crumb';
        link.dataset.path = segment.path;
        // VM Nemo : le crumb racine montre la maison symbolique blanche + nom utilisateur (« capsule »)
        if (index === 0 && isNemoTemplate() && segment.path === getFileExplorerRoot()) {
            const homeIcon = document.createElement('img');
            homeIcon.src = typeof resolveCapsuleResourceUrl === 'function'
                ? resolveCapsuleResourceUrl('./assets/icons/cinnamon/nemo/user-home-symbolic.svg')
                : './assets/icons/cinnamon/nemo/user-home-symbolic.svg';
            homeIcon.alt = '';
            homeIcon.className = 'nemo-app__path-crumb-icon';
            link.appendChild(homeIcon);
            const userLabel = (typeof window !== 'undefined' && window.CAPSULE_USER_NAME)
                ? String(window.CAPSULE_USER_NAME)
                : 'capsule';
            link.appendChild(document.createTextNode(userLabel));
            link.title = segment.label;
        } else {
            link.textContent = segment.label;
            link.title = segment.label;
        }
        fragment.appendChild(link);
    });

    pathLabelElement.replaceChildren(fragment);
};

const updatePathDisplay = () => {
    resolveDefaultPathNavigationMode();
    const nemoRoot = getExplorerWindowSlot();
    const pathLabelElement = nemoRoot
        ? nemoRoot.querySelector('.nemo-app__path-current, #nemo-path-label')
        : queryExplorerSlot('.nemo-app__path-current');
    if (!pathLabelElement) {
        return;
    }

    const displayPath = isDolphinTemplate() && fileExplorerState.activePane === 'secondary'
        ? fileExplorerState.secondaryPath
        : fileExplorerState.currentPath;

    renderPathNavigationDisplay(pathLabelElement, displayPath);
    updatePathNavigationToggleButton();
    updateExplorerWindowTitle();
    updateDolphinSidebarActive();
    alignDolphinPathBarToContentGrid();

    if (nemoRoot && nemoRoot.querySelector('.nautilus-app--n47')) {
        if (typeof window.applyNautilusChrome === 'function') {
            window.applyNautilusChrome();
        }
        applyNautilusPlaceChrome(displayPath);
        const selected = nemoRoot.querySelector('.nemoElement > a.nemo-app__item--selected, .nemo-app__content-grid > a.nemo-app__item--selected');
        if (selected) {
            updateNautilusSelectionStatus(selected);
        } else {
            updateNautilusSelectionStatus(null);
        }
    }
};

const updateNavigationControls = () => {
    const nemoRoot = getExplorerWindowSlot();
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

    const pane = isDolphinTemplate() ? (fileExplorerState.activePane || 'primary') : 'primary';
    const history = pane === 'secondary' ? fileExplorerState.secondaryHistory : fileExplorerState.history;
    const historyIndex = pane === 'secondary'
        ? fileExplorerState.secondaryHistoryIndex
        : fileExplorerState.historyIndex;
    const historyLength = history ? history.length : 0;

    toggleDisabled('#precedent', !history || historyIndex <= 0);
    toggleDisabled('#suivant', !history || historyIndex >= historyLength - 1);
    const parentBtn = nemoRoot.querySelector('#parent');
    if (parentBtn) {
        const atManifestRoot = fileExplorerState.currentPath === getFileExplorerRoot();
        const atVfsRoot = fileExplorerState.currentPath === CAPSULE_PLACE_FILESYSTEM;
        const atVirtual = isCapsuleVirtualPlace(fileExplorerState.currentPath)
            && fileExplorerState.currentPath !== CAPSULE_PLACE_FILESYSTEM;
        toggleDisabled('#parent', atVfsRoot || atVirtual);
    }
};

const collectRecentExplorerItems = () => {
    const manifest = fileExplorerState.manifest;
    if (!manifest || !manifest.folders) {
        return [];
    }
    const files = [];
    Object.keys(manifest.folders).forEach((folderPath) => {
        const node = manifest.folders[folderPath];
        if (!node || !Array.isArray(node.items)) {
            return;
        }
        node.items.forEach((item) => {
            if (item.type === 'file' && item.name) {
                files.push({
                    type: 'file',
                    name: item.name,
                    extension: item.extension,
                    href: item.href,
                    path: folderPath
                });
            }
        });
    });
    return sortExplorerItems(files);
};

const appendFileExplorerGridItem = (nemoElement, item, path, pane, depth = 0) => {
    const itemLink = document.createElement('a');
    itemLink.setAttribute('draggable', 'true');
    itemLink.setAttribute('data-details', item.type === 'folder' ? 'Dossier' : 'Fichier');
    itemLink.dataset.itemName = item.name;
    itemLink.dataset.itemType = item.type;
    itemLink.dataset.itemFolderPath = path;
    if (isDolphinListTreeView()) {
        itemLink.dataset.listDepth = String(depth);
        itemLink.style.setProperty('--dolphin-list-depth', String(depth));
        if (item.type === 'folder') {
            const targetPath = resolveDolphinFolderTargetPath(item, path);
            itemLink.dataset.listTargetPath = targetPath;
            if (dolphinFolderHasVisibleChildren(targetPath)) {
                itemLink.classList.add('nemo-app__item--folder-expandable');
            }
            if (isDolphinListFolderExpanded(targetPath, pane)) {
                itemLink.classList.add('nemo-app__item--list-expanded');
            }
        }
    }
    if (item.type === 'folder') {
        const folderTarget = item.path || item.targetPath
            || (path && item.name ? joinExplorerPath(path, item.name) : '');
        if (folderTarget) {
            itemLink.dataset.itemTargetPath = folderTarget;
        }
    }
    if (item.trashedFrom) {
        itemLink.dataset.itemTrashedFrom = item.trashedFrom;
    }
    if (isDolphinTemplate()) {
        if (item.extension) {
            itemLink.dataset.itemExtension = item.extension;
        }
        if (item.href) {
            itemLink.dataset.itemHref = item.href;
        }
    }

    const icon = document.createElement('img');
    icon.src = resolveItemIcon(item);
    icon.alt = item.name;
    itemLink.appendChild(icon);

    if (usesExplorerListItemDom()) {
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
        modifiedEl.textContent = isDolphinTemplate() && fileExplorerState.viewMode === 'list'
            ? 'Hier à 18:25'
            : formatCosmicModifiedLabel();
        itemLink.appendChild(modifiedEl);

        const sizeEl = document.createElement('span');
        sizeEl.className = 'nemo-app__item-size';
        sizeEl.textContent = usesNemoListViewFrenchColumns()
            ? formatListItemSizeFrench(item)
            : formatCosmicItemSize(item);
        itemLink.appendChild(sizeEl);
    } else {
        const label = document.createElement('span');
        label.className = 'nemo-app__item-name';
        label.textContent = item.name;
        itemLink.appendChild(label);
    }

    const selectGridItem = () => {
        const grid = nemoElement.closest('.nemo-app__content-grid') || nemoElement;
        grid.querySelectorAll('.nemo-app__item--selected').forEach((el) => {
            el.classList.remove('nemo-app__item--selected');
        });
        itemLink.classList.add('nemo-app__item--selected');
        if (isNautilusGnomeTemplate()) {
            updateNautilusSelectionStatus(itemLink);
        }
    };

    if (isDolphinTemplate() && typeof window.attachDolphinItemHandlers === 'function') {
        if (item.type === 'folder') {
            itemLink.classList.add('nemo-app__item--folder');
        }
        itemLink.href = '#';
        window.attachDolphinItemHandlers(itemLink, item, path, pane);
    } else if (isNautilusGnomeTemplate() && typeof window.attachNautilusGridItemHandlers === 'function') {
        window.attachNautilusGridItemHandlers(itemLink, item, path, { selectGridItem });
    } else if (item.networkUri) {
        itemLink.classList.add('nemo-app__item--folder');
        itemLink.href = '#';
        itemLink.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                selectGridItem();
            }
        });
        itemLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof window.connectNautilusNetworkServer === 'function') {
                window.connectNautilusNetworkServer(item.networkUri);
            }
            window.alert(`Connexion à ${item.networkUri}`);
        });
    } else if (item.type === 'folder') {
        itemLink.classList.add('nemo-app__item--folder');
        itemLink.href = '#';
        itemLink.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                selectGridItem();
            }
        });
        itemLink.addEventListener('click', (event) => {
            event.preventDefault();
            const targetPath = item.path || itemLink.dataset.itemTargetPath;
            const explorerRoot = itemLink.closest('.windowElement[data-link="nemo"]');
            if (targetPath) {
                navigateToFileExplorerDirectory(targetPath, {
                    updateHistory: true,
                    explorerRoot: explorerRoot || undefined,
                });
            }
        });
    } else {
        const fileHref = item.href || `${path}/${item.name}`;
        const resolveViewerHref = typeof resolveCapsuleResourceUrl === 'function'
            ? resolveCapsuleResourceUrl
            : (href) => {
                try {
                    return new URL(href, window.location.href).href;
                } catch (error) {
                    return href;
                }
            };
        const resolvedFileHref = resolveViewerHref(fileHref);
        itemLink.href = resolvedFileHref;

        const viewerPayload = getFileViewerTargetByItem(item);
        if (viewerPayload && viewerPayload.target) {
            itemLink.href = '#';
            itemLink.addEventListener('mousedown', (event) => {
                if (event.button === 0) {
                    selectGridItem();
                }
            });
            itemLink.addEventListener('click', (event) => {
                event.preventDefault();

                const openViewer = window.openFileInViewer || window.openMintFileInViewer;
                if (typeof openViewer === 'function') {
                    openViewer(resolvedFileHref, viewerPayload.extension, item.name);
                }
            });
        } else {
            itemLink.target = '_blank';
            itemLink.rel = 'noopener noreferrer';
        }
    }

    nemoElement.appendChild(itemLink);

    if (isDolphinListTreeView() && item.type === 'folder') {
        const targetPath = resolveDolphinFolderTargetPath(item, path);
        if (isDolphinListFolderExpanded(targetPath, pane)) {
            appendDolphinListTreeItems(nemoElement, targetPath, pane, depth + 1);
        }
    }
};

const renderVirtualPlaceDirectory = (path, pane, nemoElement) => {
    const root = getFileExplorerRoot();
    nemoElement.innerHTML = '';
    let items = [];
    let emptyKind = 'folder';

    if (path === CAPSULE_PLACE_RECENT) {
        items = collectRecentExplorerItems();
        emptyKind = 'recent';
    } else if (path === CAPSULE_PLACE_FILESYSTEM && typeof window.CapsuleExplorerVfs === 'undefined') {
        const rootLabel = fileExplorerState.manifest.rootLabel || 'Dossier personnel';
        items = [{
            type: 'folder',
            name: rootLabel,
            path: root
        }];
    } else if (typeof window.getNautilusVirtualPlaceItems === 'function') {
        const virtualItems = window.getNautilusVirtualPlaceItems(path);
        if (virtualItems) {
            items = virtualItems;
            if (path === CAPSULE_PLACE_TRASH) {
                emptyKind = 'trash';
            } else if (path === CAPSULE_PLACE_NETWORK) {
                emptyKind = 'network';
            } else if (path === CAPSULE_PLACE_STARRED) {
                emptyKind = 'starred';
            }
        }
    } else if (path === CAPSULE_PLACE_TRASH) {
        emptyKind = 'trash';
    } else if (path === CAPSULE_PLACE_NETWORK) {
        emptyKind = 'network';
    } else if (path === CAPSULE_PLACE_STARRED) {
        emptyKind = 'starred';
    }

    const searchQuery = fileExplorerState.searchQuery || '';
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter((item) => String(item.name || '').toLowerCase().indexOf(query) >= 0);
    }

    if (!items.length) {
        let emptyKind = 'folder';
        if (path === CAPSULE_PLACE_RECENT) {
            emptyKind = 'recent';
        } else if (path === CAPSULE_PLACE_TRASH) {
            emptyKind = 'trash';
        } else if (path === CAPSULE_PLACE_NETWORK) {
            emptyKind = 'network';
        } else if (path === CAPSULE_PLACE_STARRED) {
            emptyKind = 'starred';
        }
        nemoElement.innerHTML = searchQuery
            ? buildNautilusEmptyStateMarkup('search')
            : buildNautilusEmptyStateMarkup(emptyKind);
        updateDolphinFolderPill(null, pane);
        applyFileExplorerViewMode();
        applyNautilusPlaceChrome(path);
        updateNautilusSelectionStatus(null);
        return;
    }

    items.forEach((item) => {
        if (shouldHideListViewItem(item, path)) {
            return;
        }
        appendFileExplorerGridItem(nemoElement, item, path, pane);
    });

    updateDolphinFolderPill(null, pane);
    applyFileExplorerViewMode();
    applyNautilusPlaceChrome(path);
    updateNautilusSelectionStatus(null);
};

const renderVfsExplorerDirectory = (path, pane, nemoElement) => {
    if (typeof window.CapsuleExplorerVfs === 'undefined') {
        nemoElement.innerHTML = '<p class="nemo-app__empty">Système de fichiers indisponible.</p>';
        updateDolphinFolderPill(null, pane);
        applyFileExplorerViewMode();
        return;
    }

    window.CapsuleExplorerVfs.listExplorerDirectory(path).then((result) => {
        if (!nemoElement || !nemoElement.isConnected) {
            return;
        }

        if (result.manifestPath) {
            renderDirectory(result.manifestPath, { pane });
            return;
        }

        nemoElement.innerHTML = '';
        let items = result.items || [];
        const searchQuery = fileExplorerState.searchQuery || '';
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter((item) => String(item.name || '').toLowerCase().indexOf(query) >= 0);
        }

        if (!items.length) {
            nemoElement.innerHTML = searchQuery
                ? buildNautilusEmptyStateMarkup('search')
                : buildNautilusEmptyStateMarkup('folder');
            updateDolphinFolderPill(null, pane);
            applyFileExplorerViewMode();
            applyNautilusPlaceChrome(path);
            updateNautilusSelectionStatus(null);
            return;
        }

        items.forEach((item) => {
            if (shouldHideListViewItem(item, path)) {
                return;
            }
            appendFileExplorerGridItem(nemoElement, item, path, pane);
        });

        updateDolphinFolderPill(null, pane);
        applyFileExplorerViewMode();
        applyNautilusPlaceChrome(path);
        updateNautilusSelectionStatus(null);
    }).catch((error) => {
        console.warn('CapsuleExplorerVfs: rendu impossible.', error);
        nemoElement.innerHTML = '<p class="nemo-app__empty">Système de fichiers indisponible.</p>';
        updateDolphinFolderPill(null, pane);
        applyFileExplorerViewMode();
    });
};

const renderDirectory = (path, options = {}) => {
    const pane = options.pane || 'primary';
    const explorerRoot = resolveExplorerSlotRoot(options.explorerRoot);
    const nemoElement = (isDolphinTemplate() && typeof window.getDolphinPaneGrid === 'function')
        ? window.getDolphinPaneGrid(pane, explorerRoot)
        : (explorerRoot && explorerRoot.querySelector('.nemoElement'));

    if (!nemoElement || !fileExplorerState.manifest || !fileExplorerState.manifest.folders) {
        return;
    }

    const searchQuery = fileExplorerState.searchQuery || '';
    if (isNautilusGnomeTemplate()
        && fileExplorerState.nautilusChromeMode === 'search-everywhere'
        && searchQuery
        && typeof window.renderNautilusSearchEverywhere === 'function') {
        window.renderNautilusSearchEverywhere(nemoElement, searchQuery);
        applyNautilusPlaceChrome(path);
        updateNautilusSelectionStatus(null);
        return;
    }
    if (isDolphinTemplate()
        && fileExplorerState.dolphinSearchScope === 'everywhere'
        && searchQuery) {
        if (typeof window.renderNautilusSearchEverywhere === 'function') {
            window.renderNautilusSearchEverywhere(nemoElement, searchQuery);
        } else if (typeof window.renderDolphinSearchEverywhere === 'function') {
            window.renderDolphinSearchEverywhere(nemoElement, searchQuery);
        } else {
            return;
        }
        updateDolphinFolderPill(null, pane);
        applyFileExplorerViewMode();
        return;
    }

    ensureNemoListViewChrome();

    if (typeof window.CapsuleExplorerVfs !== 'undefined' && window.CapsuleExplorerVfs.isExplorerVfsPath(path)) {
        renderVfsExplorerDirectory(path, pane, nemoElement);
        return;
    }

    if (isCapsuleVirtualPlace(path)) {
        renderVirtualPlaceDirectory(path, pane, nemoElement);
        return;
    }

    const folderNode = fileExplorerState.manifest.folders[path];
    nemoElement.innerHTML = '';

    if (!folderNode || !Array.isArray(folderNode.items)) {
        nemoElement.innerHTML = '<p class="nemo-app__empty">Dossier introuvable.</p>';
        updateDolphinFolderPill(null, pane);
        return;
    }

    let items = folderNode.items;
    if (searchQuery && typeof window.filterFileExplorerItemsBySearch === 'function') {
        items = window.filterFileExplorerItemsBySearch(items, searchQuery);
    } else if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter((item) => String(item.name || '').toLowerCase().indexOf(query) >= 0);
    }

    if (!items.length) {
        nemoElement.innerHTML = searchQuery
            ? buildNautilusEmptyStateMarkup('search')
            : buildNautilusEmptyStateMarkup('folder');
        updateDolphinFolderPill(folderNode, pane);
        applyNautilusPlaceChrome(path);
        updateNautilusSelectionStatus(null);
        applyFileExplorerViewMode();
        return;
    }

    items.forEach((item) => {
        if (shouldHideListViewItem(item, path)) {
            return;
        }
        appendFileExplorerGridItem(nemoElement, item, path, pane);
    });

    updateDolphinFolderPill(folderNode, pane);

    if (isDolphinTemplate() && typeof window.applyDolphinSearchToVisiblePanes === 'function') {
        window.applyDolphinSearchToVisiblePanes();
    }

    applyFileExplorerViewMode();
    applyNautilusPlaceChrome(path);
    if (isDolphinTemplate()) {
        restoreDolphinPaneSelection(pane, nemoElement, path);
    } else {
        updateNautilusSelectionStatus(null);
    }
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

const pushSecondaryHistory = (path) => {
    if (!fileExplorerState.secondaryHistory) {
        fileExplorerState.secondaryHistory = [];
    }
    if (fileExplorerState.secondaryHistoryIndex == null) {
        fileExplorerState.secondaryHistoryIndex = -1;
    }

    const isSameAsCurrent = fileExplorerState.secondaryHistoryIndex >= 0
        && fileExplorerState.secondaryHistory[fileExplorerState.secondaryHistoryIndex] === path;
    if (isSameAsCurrent) {
        return;
    }

    fileExplorerState.secondaryHistory = fileExplorerState.secondaryHistory.slice(0, fileExplorerState.secondaryHistoryIndex + 1);
    fileExplorerState.secondaryHistory.push(path);
    fileExplorerState.secondaryHistoryIndex = fileExplorerState.secondaryHistory.length - 1;
};

const getExplorerManifestStorageKey = () => {
    const skin = typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY
        ? String(window.CAPSULE_EMBED_SKIN_KEY)
        : 'default';
    return `capsule-explorer-manifest:${skin}:${getFileExplorerRoot()}`;
};

const persistExplorerManifest = (manifest) => {
    if (!manifest || !manifest.folders) {
        return;
    }
    try {
        localStorage.setItem(getExplorerManifestStorageKey(), JSON.stringify({ folders: manifest.folders }));
    } catch (error) {
        /* quota / mode privé */
    }
};

const mergeStoredExplorerManifest = (manifest) => {
    if (!manifest || !manifest.folders) {
        return manifest;
    }
    try {
        const raw = localStorage.getItem(getExplorerManifestStorageKey());
        if (!raw) {
            return manifest;
        }
        const stored = JSON.parse(raw);
        if (!stored || !stored.folders || typeof stored.folders !== 'object') {
            return manifest;
        }
        Object.keys(stored.folders).forEach((folderPath) => {
            manifest.folders[folderPath] = stored.folders[folderPath];
        });
    } catch (error) {
        /* ignore */
    }
    return manifest;
};

const joinExplorerPath = (parentPath, name) => {
    const parent = normalizeDirectoryPath(parentPath);
    const segment = String(name || '').trim().replace(/[/\\]+/g, '');
    if (!segment || segment === '.' || segment === '..') {
        return null;
    }
    return `${parent}/${segment}`;
};

const sortExplorerItems = (items) => {
    if (!Array.isArray(items)) {
        return [];
    }
    const sortOrder = fileExplorerState.sortOrder || 'name-asc';
    const sorted = items.slice().sort((a, b) => {
        if (sortOrder === 'modified-desc') {
            const aTime = a.modified || a.mtime || 0;
            const bTime = b.modified || b.mtime || 0;
            if (aTime !== bTime) {
                return bTime - aTime;
            }
        }
        if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
        }
        return String(a.name).localeCompare(String(b.name), 'fr', { sensitivity: 'base' });
    });
    if (sortOrder === 'name-desc') {
        sorted.reverse();
    }
    return sorted;
};

const createFolderInExplorer = async (parentPath, folderName) => {
    try {
        await loadManifest();
    } catch (error) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const manifest = fileExplorerState.manifest;
    if (!manifest || !manifest.folders) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const parent = normalizeDirectoryPath(parentPath);
    const parentNode = manifest.folders[parent];
    if (!parentNode || !Array.isArray(parentNode.items)) {
        return { ok: false, message: 'Dossier parent introuvable.' };
    }

    const name = String(folderName || '').trim();
    if (!name || /[/\\]/.test(name)) {
        return { ok: false, message: 'Nom de dossier invalide.' };
    }

    const newPath = joinExplorerPath(parent, name);
    if (!newPath) {
        return { ok: false, message: 'Nom de dossier invalide.' };
    }

    if (manifest.folders[newPath]) {
        return { ok: false, message: 'Un dossier avec ce nom existe déjà.' };
    }

    const duplicate = parentNode.items.some((entry) => entry.type === 'folder' && entry.name === name);
    if (duplicate) {
        return { ok: false, message: 'Un dossier avec ce nom existe déjà.' };
    }

    const folderItem = { type: 'folder', name, path: newPath };
    parentNode.items.push(folderItem);
    parentNode.items = sortExplorerItems(parentNode.items);
    manifest.folders[newPath] = { label: name, items: [] };

    if (typeof window.pushExplorerUndoSnapshot === 'function') {
        window.pushExplorerUndoSnapshot();
    }
    persistExplorerManifest(manifest);

    const pane = fileExplorerState.activePane || 'primary';
    renderDirectory(parent, { pane });

    return { ok: true, path: newPath, name };
};

const renameExplorerItem = async (parentPath, oldName, newName) => {
    try {
        await loadManifest();
    } catch (error) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const manifest = fileExplorerState.manifest;
    const parent = normalizeDirectoryPath(parentPath);
    const parentNode = manifest.folders[parent];
    const nextName = String(newName || '').trim();

    if (!parentNode || !nextName || /[/\\]/.test(nextName) || nextName === oldName) {
        return { ok: false, message: 'Nom invalide.' };
    }
    if (findItemInFolder(parentNode, nextName)) {
        return { ok: false, message: 'Un élément avec ce nom existe déjà.' };
    }

    const item = findItemInFolder(parentNode, oldName);
    if (!item) {
        return { ok: false, message: 'Élément introuvable.' };
    }

    item.name = nextName;
    if (item.type === 'folder' && item.path) {
        const newPath = joinExplorerPath(parent, nextName);
        relocateFolderSubtree(manifest, item.path, newPath);
        item.path = newPath;
    } else if (item.type === 'file') {
        const dot = nextName.lastIndexOf('.');
        if (dot > 0) {
            item.extension = nextName.slice(dot + 1).toLowerCase();
        } else if (item.extension) {
            delete item.extension;
        }
        if (item.href && typeof item.href === 'string' && item.href.endsWith(`/${oldName}`)) {
            item.href = `${item.href.slice(0, -(oldName.length))}${nextName}`;
        }
    }
    parentNode.items = sortExplorerItems(parentNode.items);
    persistExplorerManifest(manifest);
    renderDirectory(fileExplorerState.currentPath, { pane: fileExplorerState.activePane || 'primary' });
    return { ok: true, name: nextName };
};

const trashExplorerItem = async (parentPath, itemName) => {
    try {
        await loadManifest();
    } catch (error) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const manifest = fileExplorerState.manifest;
    const parent = normalizeDirectoryPath(parentPath);
    const parentNode = manifest.folders[parent];
    if (!parentNode) {
        return { ok: false, message: 'Dossier introuvable.' };
    }

    const item = findItemInFolder(parentNode, itemName);
    if (!item) {
        return { ok: false, message: 'Élément introuvable.' };
    }

    const removed = removeItemFromFolder(parentNode, itemName);
    if (!removed) {
        return { ok: false, message: 'Élément introuvable.' };
    }

    if (removed.type === 'folder' && removed.path && manifest.folders[removed.path]) {
        delete manifest.folders[removed.path];
        Object.keys(manifest.folders).forEach((key) => {
            if (key.startsWith(`${removed.path}/`)) {
                delete manifest.folders[key];
            }
        });
    }

    if (typeof window.getNautilusVirtualPlaceItems === 'function') {
        const skin = document.body ? document.body.id : 'default';
        const root = getFileExplorerRoot();
        const trashKey = `capsule-nautilus-trash:${skin}:${root}`;
        try {
            const raw = localStorage.getItem(trashKey);
            const list = raw ? JSON.parse(raw) : [];
            list.push({
                parentPath: parent,
                name: itemName,
                item: JSON.parse(JSON.stringify(removed)),
                trashedAt: Date.now(),
            });
            localStorage.setItem(trashKey, JSON.stringify(list));
        } catch (error) {
            /* quota */
        }
    }

    persistExplorerManifest(manifest);
    return { ok: true };
};

const compressExplorerItems = async (parentPath, entries, archiveName) => {
    try {
        await loadManifest();
    } catch (error) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const manifest = fileExplorerState.manifest;
    const parent = normalizeDirectoryPath(parentPath);
    const parentNode = manifest.folders[parent];
    if (!parentNode || !Array.isArray(parentNode.items)) {
        return { ok: false, message: 'Dossier introuvable.' };
    }

    const name = String(archiveName || 'archive.zip').trim();
    if (!name || findItemInFolder(parentNode, name)) {
        return { ok: false, message: 'Nom d’archive invalide.' };
    }

    parentNode.items.push({
        type: 'file',
        name,
        extension: 'zip',
        href: '#',
        compressedFrom: (entries || []).map((entry) => entry.name),
    });
    parentNode.items = sortExplorerItems(parentNode.items);
    persistExplorerManifest(manifest);
    return { ok: true, name };
};

const resolveUniqueExplorerFolderName = (parentNode, baseName = 'Nouveau dossier') => {
    if (!parentNode || !Array.isArray(parentNode.items)) {
        return baseName;
    }
    if (!findItemInFolder(parentNode, baseName)) {
        return baseName;
    }
    let index = 2;
    while (findItemInFolder(parentNode, `${baseName} ${index}`)) {
        index += 1;
    }
    return `${baseName} ${index}`;
};

const resolveUniqueExplorerFileName = (parentNode, baseName = 'Nouveau document.txt') => {
    if (!parentNode || !Array.isArray(parentNode.items)) {
        return baseName;
    }
    if (!findItemInFolder(parentNode, baseName)) {
        return baseName;
    }
    const dot = baseName.lastIndexOf('.');
    const stem = dot > 0 ? baseName.slice(0, dot) : baseName;
    const ext = dot > 0 ? baseName.slice(dot) : '';
    let index = 2;
    while (findItemInFolder(parentNode, `${stem} ${index}${ext}`)) {
        index += 1;
    }
    return `${stem} ${index}${ext}`;
};

const createFileInExplorer = async (parentPath, fileName, fileOptions = {}) => {
    try {
        await loadManifest();
    } catch (error) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const manifest = fileExplorerState.manifest;
    if (!manifest || !manifest.folders) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const parent = normalizeDirectoryPath(parentPath);
    const parentNode = manifest.folders[parent];
    if (!parentNode || !Array.isArray(parentNode.items)) {
        return { ok: false, message: 'Dossier parent introuvable.' };
    }

    const name = String(fileName || '').trim();
    if (!name || /[/\\]/.test(name)) {
        return { ok: false, message: 'Nom de fichier invalide.' };
    }
    if (findItemInFolder(parentNode, name)) {
        return { ok: false, message: 'Un élément avec ce nom existe déjà.' };
    }

    const dot = name.lastIndexOf('.');
    const extension = fileOptions.extension
        || (dot > 0 ? name.slice(dot + 1).toLowerCase() : 'txt');
    const href = fileOptions.href != null ? fileOptions.href : '#';
    const fileItem = { type: 'file', name, extension, href };
    parentNode.items.push(fileItem);
    parentNode.items = sortExplorerItems(parentNode.items);

    if (typeof window.pushExplorerUndoSnapshot === 'function') {
        window.pushExplorerUndoSnapshot();
    }
    persistExplorerManifest(manifest);

    const pane = fileExplorerState.activePane || 'primary';
    renderDirectory(parent, { pane });

    return { ok: true, name, extension };
};

const createNewDocumentInCurrentDirectory = async (options = {}) => {
    const parentPath = options.parentPath || fileExplorerState.currentPath;
    if (!parentPath || isCapsuleVirtualPlace(parentPath)) {
        return { ok: false, message: 'Impossible de créer un document ici.' };
    }
    if (typeof window.CapsuleExplorerVfs !== 'undefined'
        && window.CapsuleExplorerVfs.isExplorerVfsPath(parentPath)) {
        return { ok: false, message: 'Impossible de créer un document ici.' };
    }

    let name = options.defaultName || 'Nouveau document.txt';
    try {
        await loadManifest();
        const parentNode = fileExplorerState.manifest
            && fileExplorerState.manifest.folders[normalizeDirectoryPath(parentPath)];
        if (parentNode) {
            name = resolveUniqueExplorerFileName(parentNode, name);
        }
    } catch (error) {
        /* garde le nom par défaut */
    }

    return createFileInExplorer(parentPath, name, { extension: 'txt', href: '#' });
};

const createNewFolderInCurrentDirectory = async (options = {}) => {
    const parentPath = options.parentPath || fileExplorerState.currentPath;
    if (!parentPath || isCapsuleVirtualPlace(parentPath)) {
        return { ok: false, message: 'Impossible de créer un dossier ici.' };
    }
    if (typeof window.CapsuleExplorerVfs !== 'undefined' && window.CapsuleExplorerVfs.isExplorerVfsPath(parentPath)) {
        return { ok: false, message: 'Impossible de créer un dossier ici.' };
    }

    const useInlineRename = !options.skipPrompt
        && typeof window.scheduleExplorerInlineRename === 'function'
        && (
            (typeof window.isNemoTemplate === 'function' && window.isNemoTemplate())
            || (typeof window.isNautilusGnomeTemplate === 'function' && window.isNautilusGnomeTemplate())
        );

    let name = options.defaultName || 'Nouveau dossier';
    if (useInlineRename) {
        try {
            await loadManifest();
            const parentNode = fileExplorerState.manifest
                && fileExplorerState.manifest.folders[normalizeDirectoryPath(parentPath)];
            if (parentNode) {
                name = resolveUniqueExplorerFolderName(parentNode, name);
            }
        } catch (error) {
            /* garde le nom par défaut */
        }
    } else if (!options.skipPrompt && typeof window.prompt === 'function') {
        const input = window.prompt('Nom du nouveau dossier :', name);
        if (input === null) {
            return { ok: false, cancelled: true };
        }
        name = input.trim();
    }

    if (!name) {
        return { ok: false, message: 'Nom de dossier vide.' };
    }

    const result = await createFolderInExplorer(parentPath, name);
    if (result.ok && useInlineRename) {
        window.scheduleExplorerInlineRename(result.name, parentPath);
    }
    return result;
};

const toggleExplorerHiddenFiles = () => {
    fileExplorerState.showHiddenFiles = !fileExplorerState.showHiddenFiles;
    if (isDolphinTemplate()) {
        ['primary', 'secondary'].forEach((pane) => {
            if (pane === 'secondary' && !fileExplorerState.splitView) {
                return;
            }
            const path = pane === 'secondary'
                ? fileExplorerState.secondaryPath
                : fileExplorerState.currentPath;
            if (path) {
                renderDirectory(path, { pane });
            }
        });
        updateDolphinSidebarActive();
        if (typeof window.updateDolphinExplorerChrome === 'function') {
            window.updateDolphinExplorerChrome();
        }
        const nemoRoot = getExplorerWindowSlot();
        const status = nemoRoot && nemoRoot.querySelector('#nemoFooterContainer .nemo-app__status-center p');
        if (status) {
            status.textContent = fileExplorerState.showHiddenFiles
                ? 'Fichiers cachés affichés'
                : 'Fichiers cachés masqués';
        }
    } else {
        renderDirectory(fileExplorerState.currentPath, { pane: fileExplorerState.activePane || 'primary' });
        updatePathDisplay();
    }
    return fileExplorerState.showHiddenFiles;
};

const findItemInFolder = (folderNode, itemName) => {
    if (!folderNode || !Array.isArray(folderNode.items)) {
        return null;
    }
    return folderNode.items.find((entry) => entry.name === itemName) || null;
};

const removeItemFromFolder = (folderNode, itemName) => {
    if (!folderNode || !Array.isArray(folderNode.items)) {
        return null;
    }
    const index = folderNode.items.findIndex((entry) => entry.name === itemName);
    if (index === -1) {
        return null;
    }
    const [removed] = folderNode.items.splice(index, 1);
    folderNode.items = sortExplorerItems(folderNode.items);
    return removed;
};

const cloneExplorerItem = (item, destFolderPath) => {
    const copy = JSON.parse(JSON.stringify(item));
    if (copy.type === 'folder' && copy.path) {
        const newPath = joinExplorerPath(destFolderPath, copy.name);
        copy.path = newPath;
    }
    return copy;
};

const relocateFolderSubtree = (manifest, oldPath, newPath) => {
    if (!manifest.folders[oldPath]) {
        return;
    }
    manifest.folders[newPath] = manifest.folders[oldPath];
    delete manifest.folders[oldPath];
    manifest.folders[newPath].label = newPath.split('/').pop();

    Object.keys(manifest.folders).forEach((key) => {
        if (key.startsWith(`${oldPath}/`)) {
            const suffix = key.slice(oldPath.length);
            manifest.folders[`${newPath}${suffix}`] = manifest.folders[key];
            delete manifest.folders[key];
        }
    });

    Object.values(manifest.folders).forEach((folder) => {
        if (!Array.isArray(folder.items)) {
            return;
        }
        folder.items.forEach((item) => {
            if (item.type === 'folder' && item.path && item.path.startsWith(`${oldPath}/`)) {
                item.path = `${newPath}${item.path.slice(oldPath.length)}`;
            }
        });
    });
};

const moveExplorerItem = async (sourceFolderPath, itemName, destFolderPath) => {
    try {
        await loadManifest();
    } catch (error) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const manifest = fileExplorerState.manifest;
    const sourcePath = normalizeDirectoryPath(sourceFolderPath);
    const destPath = normalizeDirectoryPath(destFolderPath);
    const sourceNode =((manifest == null ? void 0 : manifest.folders) == null ? void 0 : (manifest == null ? void 0 : manifest.folders)[sourcePath]);
    const destNode =((manifest == null ? void 0 : manifest.folders) == null ? void 0 : (manifest == null ? void 0 : manifest.folders)[destPath]);

    if (!sourceNode || !destNode) {
        return { ok: false, message: 'Dossier source ou destination introuvable.' };
    }
    if (sourcePath === destPath) {
        return { ok: false, message: 'La destination est identique à la source.' };
    }

    const item = findItemInFolder(sourceNode, itemName);
    if (!item) {
        return { ok: false, message: 'Élément introuvable.' };
    }

    if (item.type === 'folder' && item.path && (destPath === item.path || destPath.startsWith(`${item.path}/`))) {
        return { ok: false, message: 'Impossible de déplacer un dossier dans lui-même.' };
    }

    const duplicate = findItemInFolder(destNode, itemName);
    if (duplicate) {
        return { ok: false, message: 'Un élément avec ce nom existe déjà.' };
    }

    removeItemFromFolder(sourceNode, itemName);
    destNode.items.push(item);
    destNode.items = sortExplorerItems(destNode.items);

    if (item.type === 'folder' && item.path) {
        relocateFolderSubtree(manifest, item.path, joinExplorerPath(destPath, item.name));
    }

    persistExplorerManifest(manifest);
    renderDirectory(sourcePath, { pane: fileExplorerState.activePane || 'primary' });
    if (fileExplorerState.currentPath === destPath) {
        renderDirectory(destPath, { pane: fileExplorerState.activePane || 'primary' });
    }

    return { ok: true };
};

const copyExplorerItem = async (sourceFolderPath, itemName, destFolderPath) => {
    try {
        await loadManifest();
    } catch (error) {
        return { ok: false, message: 'Manifeste indisponible.' };
    }

    const manifest = fileExplorerState.manifest;
    const sourcePath = normalizeDirectoryPath(sourceFolderPath);
    const destPath = normalizeDirectoryPath(destFolderPath);
    const sourceNode =((manifest == null ? void 0 : manifest.folders) == null ? void 0 : (manifest == null ? void 0 : manifest.folders)[sourcePath]);
    const destNode =((manifest == null ? void 0 : manifest.folders) == null ? void 0 : (manifest == null ? void 0 : manifest.folders)[destPath]);

    if (!sourceNode || !destNode) {
        return { ok: false, message: 'Dossier source ou destination introuvable.' };
    }

    const item = findItemInFolder(sourceNode, itemName);
    if (!item) {
        return { ok: false, message: 'Élément introuvable.' };
    }

    if (findItemInFolder(destNode, itemName)) {
        return { ok: false, message: 'Un élément avec ce nom existe déjà.' };
    }

    const copy = cloneExplorerItem(item, destPath);
    destNode.items.push(copy);
    destNode.items = sortExplorerItems(destNode.items);

    if (copy.type === 'folder') {
        const newPath = copy.path || joinExplorerPath(destPath, copy.name);
        copy.path = newPath;
        manifest.folders[newPath] = { label: copy.name, items: [] };
    }

    persistExplorerManifest(manifest);
    renderDirectory(destPath, { pane: fileExplorerState.activePane || 'primary' });

    return { ok: true };
};

const loadManifest = async () => {
    if (fileExplorerState.manifest) {
        return fileExplorerState.manifest;
    }

    const useEmbedManifest = () => {
        if (typeof window === 'undefined') {
            return false;
        }
        if (window.CAPSULE_FILE_EXPLORER_MANIFEST_EMBED || window.CAPSULE_NEMO_MANIFEST_EMBED) {
            return true;
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
        const manifest = mergeStoredExplorerManifest(remapManifestToFileExplorerRoot(cloned));
        fileExplorerState.manifest = manifest;
        return manifest;
    }

    if (!fileExplorerState.manifestPromise) {
        const primaryManifest = getFileExplorerManifestPath();
        const legacyManifest = `${getFileExplorerRoot()}/nemo-manifest.json`;
        fileExplorerState.manifestPromise = fetch(primaryManifest)
            .then((response) => {
                if (!response.ok && primaryManifest !== legacyManifest) {
                    return fetch(legacyManifest);
                }
                return response;
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                return response.json();
            })
            .then((manifest) => {
                const aligned = mergeStoredExplorerManifest(remapManifestToFileExplorerRoot(manifest));
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
    const {
        updateHistory = true,
        pane = fileExplorerState.activePane || 'primary',
        explorerRoot = getExplorerWindowSlot(),
    } = options;

    try {
        await loadManifest();

        if (isNautilusGnomeTemplate()
            && (fileExplorerState.nautilusChromeMode === 'search-everywhere'
                || fileExplorerState.nautilusChromeMode === 'search-folder'
                || (fileExplorerState.searchQuery || '').trim())
            && typeof window.exitNautilusSearchChrome === 'function') {
            window.exitNautilusSearchChrome({ render: false });
        }

        const path = normalizeDirectoryPath(directory);
        const isVirtual = isCapsuleVirtualPlace(path);
        const isVfs = typeof window.CapsuleExplorerVfs !== 'undefined'
            && window.CapsuleExplorerVfs.isExplorerVfsPath(path);
        if (!isVirtual && !isVfs && !fileExplorerState.manifest.folders[path]) {
            console.warn(`Chemin explorateur introuvable: ${path}`);
            renderDirectory('__invalid__', { pane, explorerRoot });
            return;
        }

        const previousPath = (isDolphinTemplate() && pane === 'secondary')
            ? fileExplorerState.secondaryPath
            : fileExplorerState.currentPath;
        if (isDolphinListTreeView()
            && previousPath
            && normalizeDirectoryPath(previousPath) !== path) {
            clearDolphinListExpandedPaths(pane);
        }

        if (isDolphinTemplate() && pane === 'secondary') {
            fileExplorerState.secondaryPath = path;
            if (updateHistory) {
                pushSecondaryHistory(path);
            }
        } else {
            fileExplorerState.currentPath = path;
            if (updateHistory) {
                pushHistory(path);
            }
        }

        renderDirectory(path, { pane, explorerRoot });
        updatePathDisplay();
        updateNavigationControls();
        applyFileExplorerViewMode();
        alignDolphinPathBarToContentGrid();

        if (isDolphinTemplate() && typeof window.updateDolphinExplorerChrome === 'function') {
            window.updateDolphinExplorerChrome();
        }

        if (typeof window.refreshNemoSidebarTree === 'function') {
            window.refreshNemoSidebarTree();
        }

        if (typeof window.applyNautilusLocationBarMode === 'function') {
            window.applyNautilusLocationBarMode();
        }

        if (typeof window.syncNautilusTabs === 'function') {
            window.syncNautilusTabs();
        }

        if (typeof window.syncNautilusGnomeDataset === 'function') {
            window.syncNautilusGnomeDataset();
        }
    } catch (error) {
        console.error('Erreur lors du chargement du manifeste explorateur:', error);
    }
};

const loadFileExplorerDirectory = (directory) => navigateToFileExplorerDirectory(directory, { updateHistory: true });

const getParentPath = () => {
    const root = getFileExplorerRoot();
    const current = fileExplorerState.currentPath;

    if (typeof window.CapsuleExplorerVfs !== 'undefined' && window.CapsuleExplorerVfs.isExplorerVfsPath(current)) {
        return window.CapsuleExplorerVfs.getExplorerParentPath(current) || root;
    }

    if (current === root) {
        if (typeof window.CapsuleExplorerVfs !== 'undefined') {
            return window.CapsuleExplorerVfs.terminalPathToExplorerPath('/home');
        }
        return root;
    }

    if (isCapsuleVirtualPlace(current)) {
        return root;
    }

    const segments = current.split('/');
    segments.pop();
    const parentPath = segments.join('/');
    return parentPath || root;
};

const goToPreviousDirectory = () => {
    const pane = isDolphinTemplate() ? (fileExplorerState.activePane || 'primary') : 'primary';
    const history = pane === 'secondary' ? fileExplorerState.secondaryHistory : fileExplorerState.history;
    const historyIndex = pane === 'secondary'
        ? fileExplorerState.secondaryHistoryIndex
        : fileExplorerState.historyIndex;

    if (!history || historyIndex <= 0) {
        return;
    }

    const previousIndex = historyIndex - 1;
    const previousPath = history[previousIndex];

    if (pane === 'secondary') {
        fileExplorerState.secondaryHistoryIndex = previousIndex;
    } else {
        fileExplorerState.historyIndex = previousIndex;
    }

    navigateToFileExplorerDirectory(previousPath, { updateHistory: false, pane });
};

const goToNextDirectory = () => {
    const pane = isDolphinTemplate() ? (fileExplorerState.activePane || 'primary') : 'primary';
    const history = pane === 'secondary' ? fileExplorerState.secondaryHistory : fileExplorerState.history;
    const historyIndex = pane === 'secondary'
        ? fileExplorerState.secondaryHistoryIndex
        : fileExplorerState.historyIndex;

    if (!history || historyIndex >= history.length - 1) {
        return;
    }

    const nextIndex = historyIndex + 1;
    const nextPath = history[nextIndex];

    if (pane === 'secondary') {
        fileExplorerState.secondaryHistoryIndex = nextIndex;
    } else {
        fileExplorerState.historyIndex = nextIndex;
    }

    navigateToFileExplorerDirectory(nextPath, { updateHistory: false, pane });
};

const goToParentDirectory = () => {
    const parentPath = getParentPath();
    navigateToFileExplorerDirectory(parentPath, { updateHistory: true });
};

const goToHomeDirectory = () => {
    navigateToFileExplorerDirectory(getFileExplorerRoot(), { updateHistory: true });
};

const getFileExplorerContentGrid = () => {
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return null;
    }

    if (isDolphinTemplate() && typeof window.getDolphinPaneGrid === 'function') {
        const activePane = fileExplorerState.activePane || 'primary';
        return window.getDolphinPaneGrid(activePane)
            || nemoRoot.querySelector('#voletContainer > .nemoElement, .nemo-app__content-grid.nemoElement');
    }

    return nemoRoot.querySelector('#voletContainer > .nemoElement, .nemo-app__content-grid.nemoElement');
};

const resolveViewModeFromButton = (btn) => {
    if (!btn) {
        return null;
    }

    const declared = btn.dataset.viewMode;
    if (declared && FILE_EXPLORER_VIEW_MODES.includes(declared)) {
        return declared;
    }

    const dolphinIco = btn.querySelector('.dolphin-ico--view-grid, .dolphin-ico--view-compact, .dolphin-ico--view-list');
    if (dolphinIco) {
        if (dolphinIco.classList.contains('dolphin-ico--view-grid')) {
            return 'icons';
        }
        if (dolphinIco.classList.contains('dolphin-ico--view-compact')) {
            return 'compact';
        }
        if (dolphinIco.classList.contains('dolphin-ico--view-list')) {
            return 'list';
        }
    }

    const img = btn.querySelector('img[src]');
    if (img) {
        const src = img.getAttribute('src') || '';
        if (src.includes('view-grid')) {
            return 'icons';
        }
        if (src.includes('view-compact')) {
            return 'compact';
        }
        if (src.includes('view-list')) {
            return 'list';
        }
    }

    const label = `${btn.getAttribute('title') || ''} ${btn.getAttribute('aria-label') || ''}`.toLowerCase();
    if (label.includes('icône') || label.includes('icone') || label.includes('icons')) {
        return 'icons';
    }
    if (label.includes('compact')) {
        return 'compact';
    }
    if (label.includes('liste') || label.includes('détaill') || label.includes('detail')) {
        return 'list';
    }

    return null;
};

const getFileExplorerViewButtons = () => {
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return [];
    }

    const viewRoot = nemoRoot.querySelector('.dolphin-toolbar__view, .nemo-app__toolbar-group--view');
    if (!viewRoot) {
        return [];
    }

    return [...viewRoot.querySelectorAll('a[href], a[data-view-mode], button[data-view-mode]')]
        .filter((btn) => resolveViewModeFromButton(btn));
};

const updateFileExplorerViewControls = () => {
    getFileExplorerViewButtons().forEach((btn) => {
        const mode = resolveViewModeFromButton(btn);
        const active = mode === fileExplorerState.viewMode;
        btn.classList.toggle('dolphin-toolbar__view-btn--active', active);
        btn.classList.toggle('nemo-app__view-btn--active', active);
        if (active) {
            btn.setAttribute('aria-current', 'true');
        } else {
            btn.removeAttribute('aria-current');
        }
    });
};

const applyFileExplorerViewMode = () => {
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return;
    }

    const grids = isDolphinTemplate()
        ? [...nemoRoot.querySelectorAll('.nemoElement[data-pane], #voletContainer > .nemoElement')]
        : [getFileExplorerContentGrid()].filter(Boolean);

    grids.forEach((grid) => {
        FILE_EXPLORER_VIEW_MODES.forEach((mode) => {
            const className = FILE_EXPLORER_VIEW_GRID_CLASS[mode];
            if (className) {
                grid.classList.toggle(className, fileExplorerState.viewMode === mode);
            }
        });
    });

    ensureNemoListViewChrome();
    syncNemoListHeaderVisibility();
    updateFileExplorerViewControls();
};

const initFileExplorerDefaultViewMode = () => {
    if (usesNemoListView() && !isDolphinTemplate() && fileExplorerState.viewMode === 'icons') {
        fileExplorerState.viewMode = 'list';
    }
};

const setFileExplorerViewMode = (mode) => {
    if (!FILE_EXPLORER_VIEW_MODES.includes(mode)) {
        return;
    }

    const previousMode = fileExplorerState.viewMode;
    fileExplorerState.viewMode = mode;

    if (previousMode === 'list' && mode !== 'list') {
        clearDolphinListExpandedPaths();
    }

    const dolphinDomShapeChanged = isDolphinTemplate()
        && (
            (previousMode === 'icons') !== (mode === 'icons')
            || (previousMode === 'list') !== (mode === 'list')
            || (previousMode === 'compact') !== (mode === 'compact')
        );
    if (dolphinDomShapeChanged && fileExplorerState.currentPath) {
        renderDirectory(fileExplorerState.currentPath, { pane: fileExplorerState.activePane || 'primary' });
    }

    applyFileExplorerViewMode();
};

const bindFileExplorerSearchControls = () => {
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return;
    }

    const searchInput = nemoRoot.querySelector('#nemo-search-input');
    const searchWrap = nemoRoot.querySelector('#nemo-search-wrap');
    const searchToggle = nemoRoot.querySelector('#nemo-search');
    const toolbar = nemoRoot.querySelector('.nemo-app__toolbar');
    const pathLabel = nemoRoot.querySelector('#nemo-path-label');
    const isNautilus47 = !!nemoRoot.querySelector('.nautilus-app--n47');

    const setSearchOpen = (open) => {
        if (!searchWrap || !searchToggle) {
            return;
        }
        searchWrap.hidden = !open;
        searchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (toolbar) {
            if (open) {
                toolbar.classList.add('nemo-app__toolbar--search-open');
            } else {
                toolbar.classList.remove('nemo-app__toolbar--search-open');
            }
        }
        if (pathLabel) {
            if (open) {
                pathLabel.setAttribute('hidden', '');
            } else {
                pathLabel.removeAttribute('hidden');
            }
        }
        if (open && searchInput) {
            searchInput.focus();
        }
    };

    if (searchInput && searchInput.dataset.feSearchBound !== 'true') {
        const applySearchFromInput = () => {
            const barMode = fileExplorerState.locationBarMode || 'search';
            const chromeMode = (!isNemoTemplate() && fileExplorerState.nautilusChromeMode)
                || (barMode === 'path' ? 'location' : barMode === 'search' ? 'search' : 'breadcrumb');
            if (chromeMode === 'location' || chromeMode === 'breadcrumb') {
                return;
            }
            fileExplorerState.searchQuery = String(searchInput.value || '').replace(/^\s+|\s+$/g, '');
            renderDirectory(fileExplorerState.currentPath, { pane: fileExplorerState.activePane || 'primary' });
            updatePathDisplay();
        };

        searchInput.addEventListener('input', applySearchFromInput);
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isNautilus47) {
                return;
            }
            if (event.key === 'Escape') {
                searchInput.value = '';
                applySearchFromInput();
                setSearchOpen(false);
            }
        });
        searchInput.dataset.feSearchBound = 'true';
    }

    if (isNautilus47 && searchWrap && typeof window.applyNautilusChrome === 'function') {
        window.applyNautilusChrome();
    }

    if (searchToggle && searchWrap && searchToggle.dataset.feSearchToggleBound !== 'true') {
        if (isNautilus47) {
            searchToggle.dataset.feSearchToggleBound = 'true';
        } else {
            searchToggle.addEventListener('click', (event) => {
                event.preventDefault();
                setSearchOpen(searchWrap.hidden);
            });
            searchToggle.setAttribute('aria-expanded', 'false');
            searchToggle.setAttribute('aria-controls', 'nemo-search-wrap');
            searchToggle.dataset.feSearchToggleBound = 'true';
            return;
        }
    }

    if (searchToggle && searchToggle.dataset.feSearchBound !== 'true' && !searchInput) {
        searchToggle.addEventListener('click', (event) => {
            event.preventDefault();
            const current = fileExplorerState.searchQuery || '';
            const query = window.prompt('Rechercher :', current);
            if (query === null) {
                return;
            }
            fileExplorerState.searchQuery = String(query).replace(/^\s+|\s+$/g, '');
            renderDirectory(fileExplorerState.currentPath, { pane: fileExplorerState.activePane || 'primary' });
            updatePathDisplay();
        });
        searchToggle.dataset.feSearchBound = 'true';
    }
};

const bindFileExplorerViewControls = () => {
    const nemoRoot = getExplorerWindowSlot();
    initFileExplorerDefaultViewMode();
    if (!nemoRoot || nemoRoot.dataset.nemoViewDelegationInit === 'true') {
        applyFileExplorerViewMode();
        return;
    }

    const viewRoot = nemoRoot.querySelector('.dolphin-toolbar__view, .nemo-app__toolbar-group--view');
    if (!viewRoot) {
        return;
    }

    viewRoot.addEventListener('click', (event) => {
        const btn = event.target.closest('a[href], button[data-view-mode], a[data-view-mode]');
        if (!btn || !viewRoot.contains(btn)) {
            return;
        }

        if (btn.id === 'nemo-toggle-path-mode') {
            event.preventDefault();
            togglePathNavigationMode();
            return;
        }

        const mode = resolveViewModeFromButton(btn);
        if (!mode) {
            return;
        }

        event.preventDefault();
        setFileExplorerViewMode(mode);
    });

    nemoRoot.dataset.nemoViewDelegationInit = 'true';
    applyFileExplorerViewMode();
};

const bindFileExplorerNavigationControls = () => {
    const nemoRoot = getExplorerWindowSlot();
    if (!nemoRoot) {
        return;
    }

    if (nemoRoot.dataset.nemoNavDelegationInit !== 'true') {
        const navRoot = nemoRoot.querySelector(
            '.dolphin-toolbar__nav, .nemo-app__toolbar-group--nav, .nemo-app__toolbar-group--path, .nautilus-app__headerbar'
        );
        if (navRoot) {
            const navActions = {
                precedent: goToPreviousDirectory,
                suivant: goToNextDirectory,
                parent: goToParentDirectory,
                home: goToHomeDirectory
            };

            navRoot.addEventListener('click', (event) => {
                const pathCrumb = event.target.closest('.nemo-app__path-crumb');
                if (pathCrumb && navRoot.contains(pathCrumb)) {
                    event.preventDefault();
                    event.stopPropagation();
                    const targetPath = pathCrumb.dataset.path;
                    if (targetPath) {
                        navigateToFileExplorerDirectory(targetPath, { updateHistory: true });
                    }
                    return;
                }

                const pathLabel = event.target.closest('.nemo-app__path-current, #nemo-path-label');
                const pathBtn = event.target.closest('.nautilus-app__path-btn, #home');
                if (pathBtn && navRoot.contains(pathBtn) && !event.target.closest('.nemo-app__path-crumb')) {
                    event.preventDefault();
                    goToHomeDirectory();
                    return;
                }

                if (pathLabel && navRoot.contains(pathLabel)
                    && !event.target.closest('.nemo-app__path-crumb')
                    && fileExplorerState.pathNavigationMode !== 'breadcrumb') {
                    event.preventDefault();
                    goToHomeDirectory();
                    return;
                }

                const btn = event.target.closest('a[id], button[id]');
                if (!btn || !navRoot.contains(btn)) {
                    return;
                }

                const handler = navActions[btn.id];
                if (!handler) {
                    return;
                }

                event.preventDefault();
                if (btn.getAttribute('aria-disabled') === 'true') {
                    return;
                }

                handler();
            });
            nemoRoot.dataset.nemoNavDelegationInit = 'true';
        }
    }

    bindFileExplorerSearchControls();
    bindFileExplorerViewControls();

    if (isNemoTemplate() && nemoRoot.dataset.nemoMenuActionsInit !== 'true') {
        const previousMenuResolver = window.resolveFileExplorerMenuAction;
        window.resolveFileExplorerMenuAction = (label, context, scope) => {
            if (label === 'Basculer le mode de navigation') {
                togglePathNavigationMode();
                return true;
            }
            if (label === 'Créer un nouveau dossier' && typeof createNewFolderInCurrentDirectory === 'function') {
                createNewFolderInCurrentDirectory();
                return true;
            }
            if (label === 'Fermer' && typeof window.closeFileExplorerWindow === 'function') {
                window.closeFileExplorerWindow();
                return true;
            }
            if (typeof previousMenuResolver === 'function') {
                return previousMenuResolver(label, context, scope);
            }
            return false;
        };
        nemoRoot.dataset.nemoMenuActionsInit = 'true';
    }

    updatePathNavigationToggleButton();

    if (typeof window.bindFileExplorerDolphinFeatures === 'function') {
        window.bindFileExplorerDolphinFeatures();
    }

    if (typeof window.bindFileExplorerNautilusOps === 'function') {
        window.bindFileExplorerNautilusOps();
    }
    if (typeof window.bindFileExplorerNautilusFeatures === 'function') {
        window.bindFileExplorerNautilusFeatures();
    }
    if (typeof window.bindFileExplorerNautilusHeaderbar === 'function') {
        window.bindFileExplorerNautilusHeaderbar();
    }
    if (typeof window.bindFileExplorerTabs === 'function') {
        window.bindFileExplorerTabs();
    }
    if (typeof window.bindFileExplorerProperties === 'function') {
        window.bindFileExplorerProperties();
    }
    if (typeof window.bindFileExplorerNemoOps === 'function') {
        window.bindFileExplorerNemoOps();
    }
    if (typeof window.bindFileExplorerProperties === 'function') {
        window.bindFileExplorerProperties();
    }
    if (typeof window.bindFileExplorerContextMenu === 'function') {
        window.bindFileExplorerContextMenu(nemoRoot);
    }

    if (nemoRoot.dataset.nemoControlsInit === 'true') {
        updateNavigationControls();
        return;
    }

    const bindControl = (selector, handler) => {
        const element = nemoRoot.querySelector(selector);
        if (!element || element.dataset.feNavBound === 'true') {
            return false;
        }

        element.addEventListener('click', (event) => {
            event.preventDefault();
            if (element.getAttribute('aria-disabled') === 'true') {
                return;
            }
            handler();
        });
        element.dataset.feNavBound = 'true';
        return true;
    };

    /* Gabarits sans groupe nav dédié (fallback hors délégation). */
    if (nemoRoot.dataset.nemoNavDelegationInit !== 'true') {
        bindControl('#precedent', goToPreviousDirectory);
        bindControl('#suivant', goToNextDirectory);
        bindControl('#parent', goToParentDirectory);
        bindControl('#home', goToHomeDirectory);
    }

    const zoomInput = nemoRoot.querySelector('#zoom');
    if (zoomInput && nemoRoot.dataset.nemoZoomInit !== 'true') {
        zoomInput.addEventListener('input', () => {
            applyFileExplorerZoom(zoomInput.value);
        });

        const { defaultValue } = getFileExplorerZoomSettings();
        applyFileExplorerZoom((fileExplorerState.zoomValue != null ? fileExplorerState.zoomValue : defaultValue));
        nemoRoot.dataset.nemoZoomInit = 'true';
    }

    const hasNavControls = nemoRoot.dataset.nemoNavDelegationInit === 'true'
        || nemoRoot.querySelector('#precedent')
        || nemoRoot.querySelector('#suivant');

    const closeIntegrated = nemoRoot.querySelector('.nautilus-app__window-close');
    if (closeIntegrated && closeIntegrated.dataset.feNavBound !== 'true') {
        closeIntegrated.addEventListener('click', (event) => {
            event.preventDefault();
            const chromeClose = nemoRoot.querySelector('#closeBtn');
            if (chromeClose) {
                chromeClose.click();
                return;
            }
            const dispatchNemoWindowClosed = () => {
                if (typeof document !== 'undefined' && typeof CustomEvent === 'function') {
                    document.dispatchEvent(new CustomEvent('capsule:window-closed', {
                        detail: {
                            container: nemoRoot,
                            slotId: nemoRoot.dataset.link || 'nemo',
                        },
                    }));
                }
            };
            if (typeof window.capsuleBeforeWindowHide === 'function') {
                window.capsuleBeforeWindowHide(nemoRoot, () => {
                    nemoRoot.style.display = 'none';
                    dispatchNemoWindowClosed();
                });
            } else {
                nemoRoot.style.display = 'none';
                dispatchNemoWindowClosed();
            }
        });
        closeIntegrated.dataset.feNavBound = 'true';
    }

    if (hasNavControls) {
        nemoRoot.dataset.nemoControlsInit = 'true';
    }

    updateNavigationControls();
    alignDolphinPathBarToContentGrid();

    if (nemoRoot.dataset.nemoPathAlignResizeInit !== 'true') {
        window.addEventListener('resize', alignDolphinPathBarToContentGrid);
        nemoRoot.dataset.nemoPathAlignResizeInit = 'true';
    }
};

window.loadFileExplorerDirectory = loadFileExplorerDirectory;
window.renderDirectory = renderDirectory;
window.updatePathDisplay = updatePathDisplay;
window.togglePathNavigationMode = togglePathNavigationMode;
window.loadManifestForFileExplorer = loadManifest;
window.normalizeDirectoryPathForExplorer = normalizeDirectoryPath;
window.getFileExtension = getFileExtension;
window.getFileViewerTargetByItem = getFileViewerTargetByItem;
window.updateDolphinSidebarActive = updateDolphinSidebarActive;
window.rememberDolphinPaneSelection = rememberDolphinPaneSelection;
window.setFileExplorerViewMode = setFileExplorerViewMode;
window.applyFileExplorerViewMode = applyFileExplorerViewMode;
window.isDolphinListTreeViewActive = isDolphinListTreeView;
window.toggleDolphinListFolderExpanded = toggleDolphinListFolderExpanded;
window.clearDolphinListExpandedPaths = clearDolphinListExpandedPaths;
window.dolphinFolderHasVisibleChildren = dolphinFolderHasVisibleChildren;
window.loadDirectory = loadFileExplorerDirectory;
window.navigateToFileExplorerDirectory = navigateToFileExplorerDirectory;
window.navigateToDirectory = navigateToFileExplorerDirectory;
window.bindFileExplorerNavigationControls = bindFileExplorerNavigationControls;
window.bindNemoNavigationControls = bindFileExplorerNavigationControls;
window.applyFileExplorerZoom = applyFileExplorerZoom;
window.applyNemoZoom = applyFileExplorerZoom;
window.getFileExplorerRoot = getFileExplorerRoot;
window.getNemoRoot = getFileExplorerRoot;
window.createFolderInExplorer = createFolderInExplorer;
window.createFileInExplorer = createFileInExplorer;
window.createNewFolderInCurrentDirectory = createNewFolderInCurrentDirectory;
window.createNewDocumentInCurrentDirectory = createNewDocumentInCurrentDirectory;
window.promptCreateFolderInCurrentDirectory = createNewFolderInCurrentDirectory;
window.toggleExplorerHiddenFiles = toggleExplorerHiddenFiles;
window.moveExplorerItem = moveExplorerItem;
window.copyExplorerItem = copyExplorerItem;
window.persistExplorerManifest = persistExplorerManifest;

window.getExplorerCurrentPath = function getExplorerCurrentPath(slotId) {
    if (slotId && slotId !== 'nemo') {
        return '';
    }
    return fileExplorerState.currentPath || '';
};

window.CAPSULE_PLACE_RECENT = CAPSULE_PLACE_RECENT;
window.CAPSULE_PLACE_TRASH = CAPSULE_PLACE_TRASH;
window.CAPSULE_PLACE_NETWORK = CAPSULE_PLACE_NETWORK;
window.CAPSULE_PLACE_FILESYSTEM = CAPSULE_PLACE_FILESYSTEM;
window.CAPSULE_PLACE_STARRED = CAPSULE_PLACE_STARRED;
window.isCapsuleVirtualPlace = isCapsuleVirtualPlace;
window.buildExplorerPathSegments = buildExplorerPathSegments;
window.findFolderLabel = findFolderLabel;
window.applyNautilusPlaceChrome = applyNautilusPlaceChrome;
window.updateNautilusSelectionStatus = updateNautilusSelectionStatus;
window.buildNautilusEmptyStateMarkup = buildNautilusEmptyStateMarkup;
window.appendFileExplorerGridItem = appendFileExplorerGridItem;
window.renameExplorerItem = renameExplorerItem;
window.trashExplorerItem = trashExplorerItem;
window.compressExplorerItems = compressExplorerItems;

window.buildNemoPlaceFolderMap = function buildNemoPlaceFolderMap(contentRoot) {
    const root = String(contentRoot || getFileExplorerRoot()).replace(/\/+$/, '');
    return {
        'Dossier Personnel': root,
        Bureau: `${root}/Bureau`,
        Documents: `${root}/Documents`,
        Musique: `${root}/Musique`,
        Images: `${root}/Images`,
        Vidéos: `${root}/Vidéos`,
        Téléchargements: `${root}/Téléchargements`,
        Récent: CAPSULE_PLACE_RECENT,
        Favoris: CAPSULE_PLACE_STARRED,
        Corbeille: CAPSULE_PLACE_TRASH,
        Réseau: CAPSULE_PLACE_NETWORK,
        'Système de fichiers': CAPSULE_PLACE_FILESYSTEM
    };
};

window.refreshFileExplorerDirectory = function refreshFileExplorerDirectory() {
    if (!fileExplorerState.currentPath) {
        return;
    }
    renderDirectory(fileExplorerState.currentPath, { pane: fileExplorerState.activePane || 'primary' });
    updatePathDisplay();
    updateNavigationControls();
};

(function bindCapsuleFsChangedListener() {
    'use strict';

    if (typeof window === 'undefined' || window.__capsuleFsChangedBound) {
        return;
    }
    window.__capsuleFsChangedBound = true;
    window.addEventListener('capsule:fs-changed', (event) => {
        const detail = event && event.detail ? event.detail : {};
        const affected = Array.isArray(detail.affectedParents) ? detail.affectedParents : [];
        if (!affected.length || !fileExplorerState.currentPath) {
            return;
        }
        const current = normalizeDirectoryPath(fileExplorerState.currentPath);
        const shouldRefresh = affected.some((parentPath) => (
            normalizeDirectoryPath(parentPath) === current
        ));
        if (!shouldRefresh) {
            return;
        }
        renderDirectory(current, { pane: fileExplorerState.activePane || 'primary' });
        updatePathDisplay();
    });
}());
