function initFileExplorerContainer() {
    const root = (typeof window !== 'undefined' && window.CAPSULE_CONTENT_ROOT)
        ? String(window.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '')
        : './apps/system/Dossier_personnel';

    const folderMap = {
        'Dossier Personnel': root,
        'Bureau': `${root}/Bureau`,
        'Documents': `${root}/Documents`,
        'Musique': `${root}/Musique`,
        'Images': `${root}/Images`,
        'Vidéos': `${root}/Vidéos`,
        'Téléchargements': `${root}/Téléchargements`
    };

    const fileExplorerRoot = document.getElementById('nemo');
    if (!fileExplorerRoot || fileExplorerRoot.dataset.fileExplorerInit === 'true' || fileExplorerRoot.dataset.nemoInit === 'true') {
        return;
    }

    // Les raccourcis de l'explorateur sont injectés dynamiquement dans la fenêtre legacy `nemo`.
    const fileExplorerLinks = fileExplorerRoot.querySelectorAll('#voletnemo a[target="windowElement"][data-link]');

    fileExplorerLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const key = link.dataset.link;
            const directory = folderMap[key];

            if (directory && (typeof navigateToFileExplorerDirectory === 'function' || typeof navigateToDirectory === 'function')) {
                (window.navigateToFileExplorerDirectory || window.navigateToDirectory)(directory);
            } else if (directory && (typeof loadFileExplorerDirectory === 'function' || typeof loadDirectory === 'function')) {
                (window.loadFileExplorerDirectory || window.loadDirectory)(directory);
            }
        });
    });

    if (typeof bindFileExplorerMenubar === 'function') {
        bindFileExplorerMenubar(fileExplorerRoot);
    }

    if (typeof bindFileExplorerNavigationControls === 'function' || typeof bindNemoNavigationControls === 'function') {
        (window.bindFileExplorerNavigationControls || window.bindNemoNavigationControls)();
    }

    fileExplorerRoot.dataset.fileExplorerInit = 'true';
    fileExplorerRoot.dataset.nemoInit = 'true';
}

window.initFileExplorerContainer = initFileExplorerContainer;
window.initNemoContainer = initFileExplorerContainer;
