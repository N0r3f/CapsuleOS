const NEMO_ROOT_PATH = './apps/system/Dossier_personnel';
const NEMO_MANIFEST_PATH = './apps/system/Dossier_personnel/nemo-manifest.json';

const nemoState = {
    manifest: null,
    manifestPromise: null,
    history: [],
    historyIndex: -1,
    currentPath: NEMO_ROOT_PATH,
    zoomValue: null
};

const readCssNumberVar = (name, fallbackValue) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
};

const getNemoZoomSettings = () => {
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

const applyNemoZoom = (value) => {
    const nemoRoot = document.getElementById('nemo');
    if (!nemoRoot) {
        return;
    }

    const zoomInput = nemoRoot.querySelector('#zoom');
    const { min, max, defaultValue, step } = getNemoZoomSettings();

    const rawValue = Number(value);
    const safeValue = Number.isFinite(rawValue) ? rawValue : defaultValue;
    const clampedValue = Math.max(min, Math.min(max, safeValue));

    nemoState.zoomValue = clampedValue;
    nemoRoot.style.setProperty('--nemo-item-scale', String(clampedValue / 100));

    if (zoomInput) {
        zoomInput.min = String(min);
        zoomInput.max = String(max);
        zoomInput.step = String(step);
        zoomInput.value = String(clampedValue);
    }
};

const normalizeDirectoryPath = (path) => {
    if (!path || typeof path !== 'string') {
        return NEMO_ROOT_PATH;
    }

    const trimmedPath = path.trim();
    if (!trimmedPath) {
        return NEMO_ROOT_PATH;
    }

    if (trimmedPath === './' || trimmedPath === '.') {
        return NEMO_ROOT_PATH;
    }

    return trimmedPath.replace(/\/+$/, '') || NEMO_ROOT_PATH;
};

const getNemoFilesCatalog = () => {
    if (typeof fileSystemLink !== 'undefined' && fileSystemLink && fileSystemLink.files) {
        return fileSystemLink.files;
    }
    return {};
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

const getMintViewerTargetByItem = (item) => {
    const extension = getFileExtension(item);

    if (typeof window.getMintViewerTargetByExtension !== 'function') {
        return null;
    }

    return {
        extension,
        target: window.getMintViewerTargetByExtension(extension)
    };
};

const resolveItemIcon = (item) => {
    const filesCatalog = getNemoFilesCatalog();

    if (item.type === 'folder') {
        return filesCatalog[item.name]?.image || filesCatalog.Dossier_personnel?.image || './media/img/elements/nemo/folder.png';
    }

    const extension = getFileExtension(item);
    return filesCatalog[extension]?.image || filesCatalog.txt?.image || filesCatalog.Dossier_personnel?.image || './media/img/elements/nemo/folder.png';
};

const findFolderLabel = (path) => {
    if (!nemoState.manifest || !nemoState.manifest.folders) {
        return 'Dossier personnel';
    }

    const folderNode = nemoState.manifest.folders[path];
    if (folderNode && folderNode.label) {
        return folderNode.label;
    }

    if (path === NEMO_ROOT_PATH) {
        return nemoState.manifest.rootLabel || 'Dossier personnel';
    }

    const segments = path.split('/');
    return segments[segments.length - 1] || 'Dossier personnel';
};

const updatePathDisplay = () => {
    const pathLabelElement = document.querySelector('#nemo .nemo-app__path-current');
    if (!pathLabelElement) {
        return;
    }

    pathLabelElement.textContent = findFolderLabel(nemoState.currentPath);
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

    toggleDisabled('#precedent', nemoState.historyIndex <= 0);
    toggleDisabled('#suivant', nemoState.historyIndex >= nemoState.history.length - 1);
    toggleDisabled('#parent', nemoState.currentPath === NEMO_ROOT_PATH);
};

const renderDirectory = (path) => {
    const nemoElement = document.querySelector('#nemo .nemoElement');
    if (!nemoElement || !nemoState.manifest || !nemoState.manifest.folders) {
        return;
    }

    const folderNode = nemoState.manifest.folders[path];
    nemoElement.innerHTML = '';

    if (!folderNode || !Array.isArray(folderNode.items)) {
        nemoElement.innerHTML = '<p class="nemo-app__empty">Dossier introuvable.</p>';
        return;
    }

    if (!folderNode.items.length) {
        nemoElement.innerHTML = '<p class="nemo-app__empty">Ce dossier est vide.</p>';
        return;
    }

    folderNode.items.forEach((item) => {
        const itemLink = document.createElement('a');
        itemLink.setAttribute('data-details', item.type === 'folder' ? 'Dossier' : 'Fichier');
        itemLink.textContent = item.name;

        const icon = document.createElement('img');
        icon.src = resolveItemIcon(item);
        icon.alt = item.name;
        itemLink.prepend(icon);

        if (item.type === 'folder') {
            itemLink.href = '#';
            itemLink.addEventListener('click', (event) => {
                event.preventDefault();
                navigateToDirectory(item.path);
            });
        } else {
            const fileHref = item.href || `${path}/${item.name}`;
            itemLink.href = fileHref;

            const viewerPayload = getMintViewerTargetByItem(item);
            if (viewerPayload && viewerPayload.target) {
                itemLink.addEventListener('click', (event) => {
                    event.preventDefault();

                    if (typeof window.openMintFileInViewer === 'function') {
                        window.openMintFileInViewer(fileHref, viewerPayload.extension, item.name);
                    }
                });
            } else {
                itemLink.target = '_blank';
                itemLink.rel = 'noopener noreferrer';
            }
        }

        nemoElement.appendChild(itemLink);
    });
};

const pushHistory = (path) => {
    const isSameAsCurrent = nemoState.historyIndex >= 0 && nemoState.history[nemoState.historyIndex] === path;
    if (isSameAsCurrent) {
        return;
    }

    nemoState.history = nemoState.history.slice(0, nemoState.historyIndex + 1);
    nemoState.history.push(path);
    nemoState.historyIndex = nemoState.history.length - 1;
};

const loadManifest = async () => {
    if (nemoState.manifest) {
        return nemoState.manifest;
    }

    if (!nemoState.manifestPromise) {
        nemoState.manifestPromise = fetch(NEMO_MANIFEST_PATH)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                return response.json();
            })
            .then((manifest) => {
                nemoState.manifest = manifest;
                return manifest;
            })
            .catch((error) => {
                nemoState.manifestPromise = null;
                throw error;
            });
    }

    return nemoState.manifestPromise;
};

const navigateToDirectory = async (directory, options = {}) => {
    const { updateHistory = true } = options;

    try {
        await loadManifest();

        const path = normalizeDirectoryPath(directory);
        if (!nemoState.manifest.folders[path]) {
            console.warn(`Chemin Nemo introuvable: ${path}`);
            renderDirectory('__invalid__');
            return;
        }

        nemoState.currentPath = path;

        if (updateHistory) {
            pushHistory(path);
        }

        renderDirectory(path);
        updatePathDisplay();
        updateNavigationControls();
    } catch (error) {
        console.error('Erreur lors du chargement du manifeste Nemo:', error);
    }
};

const loadDirectory = (directory) => navigateToDirectory(directory, { updateHistory: true });

const getParentPath = () => {
    if (nemoState.currentPath === NEMO_ROOT_PATH) {
        return NEMO_ROOT_PATH;
    }

    const segments = nemoState.currentPath.split('/');
    segments.pop();
    const parentPath = segments.join('/');
    return parentPath || NEMO_ROOT_PATH;
};

const goToPreviousDirectory = () => {
    if (nemoState.historyIndex <= 0) {
        return;
    }

    nemoState.historyIndex -= 1;
    const previousPath = nemoState.history[nemoState.historyIndex];
    navigateToDirectory(previousPath, { updateHistory: false });
};

const goToNextDirectory = () => {
    if (nemoState.historyIndex >= nemoState.history.length - 1) {
        return;
    }

    nemoState.historyIndex += 1;
    const nextPath = nemoState.history[nemoState.historyIndex];
    navigateToDirectory(nextPath, { updateHistory: false });
};

const goToParentDirectory = () => {
    const parentPath = getParentPath();
    navigateToDirectory(parentPath, { updateHistory: true });
};

const goToHomeDirectory = () => {
    navigateToDirectory(NEMO_ROOT_PATH, { updateHistory: true });
};

const bindNemoNavigationControls = () => {
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
            applyNemoZoom(zoomInput.value);
        });

        const { defaultValue } = getNemoZoomSettings();
        applyNemoZoom(nemoState.zoomValue ?? defaultValue);
        nemoRoot.dataset.nemoZoomInit = 'true';
    }

    nemoRoot.dataset.nemoControlsInit = 'true';
    updateNavigationControls();
};

window.loadDirectory = loadDirectory;
window.navigateToDirectory = navigateToDirectory;
window.bindNemoNavigationControls = bindNemoNavigationControls;
window.applyNemoZoom = applyNemoZoom;
