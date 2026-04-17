function initNemoContainer() {
    const folderMap = {
        'Dossier Personnel': './apps/system/Dossier_personnel',
        'Bureau': './apps/system/Dossier_personnel/Bureau',
        'Documents': './apps/system/Dossier_personnel/Documents',
        'Musique': './apps/system/Dossier_personnel/Musique',
        'Images': './apps/system/Dossier_personnel/Images',
        'Vidéos': './apps/system/Dossier_personnel/Vidéos',
        'Téléchargements': './apps/system/Dossier_personnel/Téléchargements'
    };

    const nemoRoot = document.getElementById('nemo');
    if (!nemoRoot || nemoRoot.dataset.nemoInit === 'true') {
        return;
    }

    // Les raccourcis Nemo sont injectés dynamiquement dans la fenêtre et utilisent target="windowElement".
    const nemoLinks = nemoRoot.querySelectorAll('#voletnemo a[target="windowElement"][data-link]');

    nemoLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const key = link.dataset.link;
            const directory = folderMap[key];

            if (directory && typeof navigateToDirectory === 'function') {
                navigateToDirectory(directory);
            } else if (directory && typeof loadDirectory === 'function') {
                loadDirectory(directory);
            }
        });
    });

    if (typeof bindNemoNavigationControls === 'function') {
        bindNemoNavigationControls();
    }

    nemoRoot.dataset.nemoInit = 'true';
}
