'use strict';
const TEXT_EDITOR_EXTENSIONS = [
    'txt', 'md', 'log', 'sh', 'json', 'csv', 'xml', 'css', 'js', 'html',
    'py', 'conf', 'ini', 'yaml', 'yml', 'toml', 'env', 'gitignore'
];

const FILE_VIEWER_BY_EXTENSION = {
    png: 'visionneur_images',
    jpg: 'visionneur_images',
    jpeg: 'visionneur_images',
    gif: 'visionneur_images',
    webp: 'visionneur_images',
    svg: 'visionneur_images',
    bmp: 'visionneur_images',
    tiff: 'visionneur_images',
    ico: 'visionneur_images',
    jxl: 'visionneur_images',
    pdf: 'visionneur_pdf',
    doc: 'librewriter',
    docx: 'librewriter',
    odt: 'librewriter',
    rtf: 'librewriter',
    xls: 'librecalc',
    xlsx: 'librecalc',
    ods: 'librecalc',
    ppt: 'libreoffice_impress',
    pptx: 'libreoffice_impress',
    odp: 'libreoffice_impress',
    mp3: 'lecteur_multimedia',
    ogg: 'lecteur_multimedia',
    wav: 'lecteur_multimedia',
    flac: 'lecteur_multimedia',
    aac: 'lecteur_multimedia',
    m4a: 'lecteur_multimedia',
    mp4: 'lecteur_multimedia',
    webm: 'lecteur_multimedia',
    avi: 'lecteur_multimedia',
    mkv: 'lecteur_multimedia',
    mov: 'lecteur_multimedia',
    zip: 'file_roller',
    tar: 'file_roller',
    gz: 'file_roller',
    bz2: 'file_roller',
    xz: 'file_roller',
    '7z': 'file_roller',
    rar: 'file_roller'
};

TEXT_EDITOR_EXTENSIONS.forEach((ext) => {
    FILE_VIEWER_BY_EXTENSION[ext] = 'text_editor';
});

const fileViewerState = {
    visionneur_images: null,
    visionneur_pdf: null,
    lecteur_multimedia: null,
    text_editor: null,
    librewriter: null,
    librecalc: null,
    libreoffice_impress: null,
    file_roller: null
};

let activeMediaElement = null;

const MEDIA_VIEWER_PLACEHOLDER = 'Ouvrez un fichier audio ou vidéo depuis Nemo pour le lire ici.';

const stopMediaElement = (mediaEl) => {
    if (!mediaEl) {
        return;
    }
    try {
        mediaEl.pause();
    } catch (error) {
        /* ignore */
    }
    mediaEl.querySelectorAll('source').forEach((source) => {
        source.removeAttribute('src');
        source.remove();
    });
    mediaEl.removeAttribute('src');
    try {
        mediaEl.load();
    } catch (error) {
        /* ignore */
    }
};

const resetMediaViewer = () => {
    const contentElement = document.getElementById('mint-media-viewer-content');
    if (contentElement) {
        contentElement.querySelectorAll('audio, video').forEach(stopMediaElement);
    }
    if (typeof window.resetCelluloidIdle === 'function' && document.getElementById('lecteurMultimedia')) {
        window.resetCelluloidIdle();
    } else if (contentElement) {
        contentElement.innerHTML = '';
        const messageElement = document.createElement('p');
        messageElement.className = 'viewer-app__message';
        messageElement.textContent = MEDIA_VIEWER_PLACEHOLDER;
        contentElement.appendChild(messageElement);
    }
    const fileNameElement = document.getElementById('mint-media-viewer-filename');
    if (fileNameElement && typeof window.resetCelluloidIdle !== 'function') {
        fileNameElement.textContent = 'Aucun média sélectionné';
    }
    activeMediaElement = null;
    fileViewerState.lecteur_multimedia = null;
};

const getFileViewerTargetByExtension = (extension) => {
    if (!extension) {
        return null;
    }

    return FILE_VIEWER_BY_EXTENSION[String(extension).toLowerCase()] || null;
};

const getFileViewerTitle = (appId) => {
    if (appId === 'lecteur_multimedia' && typeof window.getCelluloidWindowTitle === 'function') {
        return window.getCelluloidWindowTitle();
    }
    const titles = {
        visionneur_images: "Visionneur d'images",
        visionneur_pdf: 'Visionneur de documents',
        lecteur_multimedia: 'Lecteur multimédia',
        text_editor: 'Éditeur de texte'
    };

    return titles[appId] || appId;
};

const setWindowTitle = (appId) => {
    const container = document.querySelector(`div[data-link="${appId}"]`);
    if (!container) {
        return;
    }

    const titleElement = container.querySelector('#windowTitle');
    if (titleElement) {
        titleElement.textContent = getFileViewerTitle(appId);
    }
};

const renderViewerMessage = (contentElement, message, href) => {
    if (!contentElement) {
        return;
    }

    contentElement.innerHTML = '';

    const messageElement = document.createElement('p');
    messageElement.className = 'viewer-app__message';
    messageElement.textContent = message;
    contentElement.appendChild(messageElement);

    if (!href) {
        return;
    }

    const linkElement = document.createElement('a');
    linkElement.className = 'viewer-app__external-link';
    linkElement.href = href;
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.textContent = 'Ouvrir dans un nouvel onglet';
    contentElement.appendChild(linkElement);
};

const openViewerWindow = (appId) => {
    const container = document.querySelector(`div[data-link="${appId}"]`);

    if (!container) {
        return false;
    }

    if (typeof openWindowByDataLink === 'function') {
        const opened = openWindowByDataLink(appId);
        if (opened) {
            setWindowTitle(appId);
        }
        return opened;
    }

    const link = document.querySelector(`a[target="windowElement"][data-link="${appId}"]`);

    if (!link || typeof handleOpenwindow !== 'function') {
        return false;
    }

    if (container.style.display === 'none') {
        handleOpenwindow(link);
    } else {
        if (typeof activateWindow === 'function') {
            activateWindow(container);
        }
        link.classList.add('active-link');
    }

    setWindowTitle(appId);
    return true;
};

const renderImageViewer = (payload) => {
    const fileNameElement = document.getElementById('mint-image-viewer-filename');
    const contentElement = document.getElementById('mint-image-viewer-content');

    if (!fileNameElement || !contentElement || !payload) {
        return;
    }

    fileNameElement.textContent = payload.name || payload.href;
    contentElement.innerHTML = '';

    const imageElement = document.createElement('img');
    imageElement.className = 'viewer-app__image';
    imageElement.src = payload.href;
    imageElement.alt = payload.name || 'Image';

    imageElement.addEventListener('error', () => {
        renderViewerMessage(contentElement, 'Impossible de charger cette image.', payload.href);
    });

    contentElement.appendChild(imageElement);
};

const renderPdfViewer = (payload) => {
    const fileNameElement = document.getElementById('mint-pdf-viewer-filename');
    const contentElement = document.getElementById('mint-pdf-viewer-content');

    if (!fileNameElement || !contentElement || !payload) {
        return;
    }

    fileNameElement.textContent = payload.name || payload.href;
    contentElement.innerHTML = '';

    const frameElement = document.createElement('iframe');
    frameElement.className = 'viewer-app__frame';
    frameElement.src = payload.href;
    frameElement.title = payload.name || 'Document PDF';

    frameElement.addEventListener('error', () => {
        renderViewerMessage(contentElement, 'Le document PDF ne peut pas être affiche dans ce navigateur.', payload.href);
    });

    contentElement.appendChild(frameElement);
};

const buildSourceElement = (href, type) => {
    const sourceElement = document.createElement('source');
    sourceElement.src = href;

    if (type) {
        sourceElement.type = type;
    }

    return sourceElement;
};

const renderMediaViewer = (payload) => {
    const fileNameElement = document.getElementById('mint-media-viewer-filename');
    const contentElement = document.getElementById('mint-media-viewer-content');

    if (!fileNameElement || !contentElement || !payload) {
        return;
    }

    fileNameElement.textContent = payload.name || payload.href;
    contentElement.innerHTML = '';

    const isVideo = ['mp4', 'webm', 'avi'].includes(payload.extension);
    const mediaElement = document.createElement(isVideo ? 'video' : 'audio');

    mediaElement.className = 'viewer-app__media';
    mediaElement.controls = true;
    mediaElement.preload = 'metadata';

    if (isVideo) {
        mediaElement.playsInline = true;
    }

    const mimeByExtension = {
        mp3: 'audio/mpeg',
        ogg: 'audio/ogg',
        wav: 'audio/wav',
        mp4: 'video/mp4',
        webm: 'video/webm',
        avi: 'video/x-msvideo'
    };

    mediaElement.appendChild(buildSourceElement(payload.href, mimeByExtension[payload.extension] || ''));

    mediaElement.addEventListener('error', () => {
        renderViewerMessage(contentElement, 'Le codec de ce media n\'est pas supporte par le navigateur.', payload.href);
    });

    if (activeMediaElement && activeMediaElement !== mediaElement) {
        stopMediaElement(activeMediaElement);
    }
    activeMediaElement = mediaElement;
    contentElement.appendChild(mediaElement);

    if (typeof window.onCelluloidMediaLoaded === 'function') {
        window.onCelluloidMediaLoaded(payload);
    } else {
        setWindowTitle('lecteur_multimedia');
    }
};

const renderTextEditorViewer = (payload) => {
    const openXed = window.openXedFromExplorer;
    if (typeof openXed !== 'function' || !payload) {
        return;
    }

    openXed(payload.href, payload.name);
};

const renderFileViewer = (appId) => {
    const payload = fileViewerState[appId];

    if (!payload) {
        return;
    }

    if (appId === 'visionneur_images') {
        renderImageViewer(payload);
    }

    if (appId === 'visionneur_pdf') {
        renderPdfViewer(payload);
    }

    if (appId === 'lecteur_multimedia') {
        renderMediaViewer(payload);
    }

    if (appId === 'text_editor') {
        renderTextEditorViewer(payload);
    }

    if (typeof window.onMintViewerRendered === 'function') {
        window.onMintViewerRendered(appId);
    }
};

const resolveViewerHref = (href) => {
    if (!href) {
        return href;
    }
    if (typeof resolveCapsuleResourceUrl === 'function') {
        return resolveCapsuleResourceUrl(href);
    }
    if (typeof CapsuleResource !== 'undefined' && typeof CapsuleResource.resolve === 'function') {
        return CapsuleResource.resolve(href);
    }
    try {
        return new URL(href, window.location.href).href;
    } catch (error) {
        return href;
    }
};

const openFileInViewerWithApp = (href, extension, name, appId) => {
    const targetApp = String(appId || '').trim();
    if (!targetApp) {
        return false;
    }

    fileViewerState[targetApp] = {
        href: resolveViewerHref(href),
        extension: String(extension || '').toLowerCase(),
        name
    };

    const windowOpened = openViewerWindow(targetApp);
    if (!windowOpened) {
        return false;
    }

    window.requestAnimationFrame(() => {
        renderFileViewer(targetApp);
    });

    return true;
};

const openFileInViewer = (href, extension, name) => {
    const appId = getFileViewerTargetByExtension(extension);
    if (!appId) {
        return false;
    }

    return openFileInViewerWithApp(href, extension, name, appId);
};

const bindViewerLaunchers = () => {
    const viewerIds = ['visionneur_images', 'visionneur_pdf', 'lecteur_multimedia', 'text_editor', 'librewriter', 'librecalc', 'libreoffice_impress', 'file_roller'];

    viewerIds.forEach((appId) => {
        const link = document.querySelector(`a[target="windowElement"][data-link="${appId}"]`);
        if (!link) {
            return;
        }

        link.addEventListener('click', () => {
            window.requestAnimationFrame(() => {
                setWindowTitle(appId);
            });
        });
    });
};

const bindMediaViewerLifecycle = () => {
    document.addEventListener('capsule:window-closed', (event) => {
        const detail = event.detail || {};
        if (detail.slotId === 'lecteur_multimedia') {
            resetMediaViewer();
        }
    });

    if (window.CapsuleWindowMemory && typeof window.CapsuleWindowMemory.register === 'function') {
        const tier = window.CapsuleMemoryConventions
            && window.CapsuleMemoryConventions.TIERS
            ? window.CapsuleMemoryConventions.TIERS.SESSION
            : 'session';
        window.CapsuleWindowMemory.register({
            slotId: 'lecteur_multimedia',
            tier,
            purgeRuntime: () => resetMediaViewer(),
            onReopen: () => resetMediaViewer(),
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bindViewerLaunchers();
        bindMediaViewerLifecycle();
    });
} else {
    bindViewerLaunchers();
    bindMediaViewerLifecycle();
}

window.getFileViewerTargetByExtension = getFileViewerTargetByExtension;
window.resetMediaViewer = resetMediaViewer;
window.openFileInViewer = openFileInViewer;
window.openFileInViewerWithApp = openFileInViewerWithApp;
window.renderFileViewer = renderFileViewer;
window.getMintViewerTargetByExtension = getFileViewerTargetByExtension;
window.openMintFileInViewer = openFileInViewer;
window.renderMintViewer = renderFileViewer;
window.fileViewerState = fileViewerState;
