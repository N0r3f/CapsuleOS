function getWindowDesktopRect() {
    const desktop = document.getElementById('desktop');
    return desktop ? desktop.getBoundingClientRect() : null;
}

function storeWindowRestoreState(windowElement) {
    if (!windowElement || windowElement.dataset.maximized === 'true') {
        return;
    }

    windowElement.dataset.prevLeft = windowElement.style.left || '';
    windowElement.dataset.prevTop = windowElement.style.top || '';
    windowElement.dataset.prevWidth = windowElement.style.width || '';
    windowElement.dataset.prevHeight = windowElement.style.height || '';
    windowElement.dataset.prevPosition = windowElement.style.position || '';
}

function restoreWindowElement(windowElement) {
    if (!windowElement) {
        return false;
    }

    windowElement.style.width = windowElement.dataset.prevWidth || '';
    windowElement.style.height = windowElement.dataset.prevHeight || '';
    windowElement.style.position = windowElement.dataset.prevPosition || 'fixed';
    windowElement.style.top = windowElement.dataset.prevTop || '';
    windowElement.style.left = windowElement.dataset.prevLeft || '';
    windowElement.dataset.maximized = 'false';
    return true;
}

function maximizeWindowElement(windowElement) {
    if (!windowElement) {
        return false;
    }

    const desktopRect = getWindowDesktopRect();
    storeWindowRestoreState(windowElement);

    windowElement.style.position = 'fixed';
    windowElement.style.left = desktopRect ? `${desktopRect.left}px` : '0';
    windowElement.style.top = desktopRect ? `${desktopRect.top}px` : '0';
    windowElement.style.width = desktopRect ? `${desktopRect.width}px` : '100%';
    windowElement.style.height = desktopRect ? `${desktopRect.height}px` : '100%';
    windowElement.dataset.maximized = 'true';
    return true;
}

function toggleWindowMaximized(windowElement) {
    if (!windowElement) {
        return false;
    }

    if (windowElement.dataset.maximized === 'true') {
        return window.restoreWindowElement(windowElement);
    }

    return window.maximizeWindowElement(windowElement);
}

window.restoreWindowElement = restoreWindowElement;
window.maximizeWindowElement = maximizeWindowElement;
window.toggleWindowMaximized = toggleWindowMaximized;

document.addEventListener('click', function (event) {

    if (event.target.matches('#minimizeBtn') || event.target.matches('#closeBtn')) {
        const windowElement = event.target.closest('.windowElement');
        if (!windowElement) {
            return;
        }
        windowElement.style.display = 'none';
        windowElement.style.zIndex = '5'; // Réinitialiser le z-index à 5 lors de la minimisation
        windowElement.classList.remove('windowElementActive');

        // Trouver le lien correspondant
        const link = document.querySelector(`a[data-link="${windowElement.dataset.link}"]`);

        // Si la fenêtre est masquée (minimize ou close), retirer la classe active-link.
        if ((event.target.matches('#minimizeBtn') || event.target.matches('#closeBtn')) && link) {
            link.classList.remove('active-link');
        }
    }

    if (event.target.matches('#resizeBtn')) {
        const windowElement = event.target.closest('.windowElement');
        if (!windowElement) {
            return;
        }
        // Augmenter le z-index pour que la fenêtre apparaisse au-dessus des autres fenêtres ouvertes
        windowElement.classList.add('windowElementActive');
        toggleWindowMaximized(windowElement);
    }
});
