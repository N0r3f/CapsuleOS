const FILE_VIEWER_BY_EXTENSION = {
    png: 'visionneur_images',
    jpg: 'visionneur_images',
    jpeg: 'visionneur_images',
    gif: 'visionneur_images',
    webp: 'visionneur_images',
    svg: 'visionneur_images',
    pdf: 'visionneur_pdf',
    mp3: 'lecteur_multimedia',
    ogg: 'lecteur_multimedia',
    wav: 'lecteur_multimedia',
    mp4: 'lecteur_multimedia',
    webm: 'lecteur_multimedia',
    avi: 'lecteur_multimedia'
};

const fileViewerState = {
    visionneur_images: null,
    visionneur_pdf: null,
    lecteur_multimedia: null
};

const getFileViewerTargetByExtension = (extension) => {
    if (!extension) {
        return null;
    }

    return FILE_VIEWER_BY_EXTENSION[String(extension).toLowerCase()] || null;
};

const getFileViewerTitle = (appId) => {
    const titles = {
        visionneur_images: "Visionneur d'images",
        visionneur_pdf: 'Visionneur PDF',
        lecteur_multimedia: 'Lecteur multimédia'
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

    contentElement.appendChild(mediaElement);
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
};

const openFileInViewer = (href, extension, name) => {
    const appId = getFileViewerTargetByExtension(extension);
    if (!appId) {
        return false;
    }

    fileViewerState[appId] = {
        href,
        extension: String(extension).toLowerCase(),
        name
    };

    const windowOpened = openViewerWindow(appId);
    if (!windowOpened) {
        return false;
    }

    window.requestAnimationFrame(() => {
        renderFileViewer(appId);
    });

    return true;
};

const bindViewerLaunchers = () => {
    const viewerIds = ['visionneur_images', 'visionneur_pdf', 'lecteur_multimedia'];

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindViewerLaunchers);
} else {
    bindViewerLaunchers();
}

window.getFileViewerTargetByExtension = getFileViewerTargetByExtension;
window.openFileInViewer = openFileInViewer;
window.renderFileViewer = renderFileViewer;
window.getMintViewerTargetByExtension = getFileViewerTargetByExtension;
window.openMintFileInViewer = openFileInViewer;
window.renderMintViewer = renderFileViewer;
