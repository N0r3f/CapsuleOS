'use strict';
function resetFileExplorerSlotBindings(fileExplorerRoot) {
    if (!fileExplorerRoot || !fileExplorerRoot.dataset) {
        return;
    }
    const keys = [
        'nemoNavDelegationInit',
        'nemoViewDelegationInit',
        'nemoControlsInit',
        'nemoZoomInit',
        'nemoSidebarDelegation',
        'nemoContextMenuInit',
        'nemoContextMenuBound',
        'nemoSidebarContextMenuBound',
        'nautilusTabsInit',
        'nemoPropertiesInit',
        'nautilusKeyboardInit',
        'nautilusHeaderbarInit',
        'feDnDRootInit',
        'nemoMenuActionsInit',
        'nemoPathAlignResizeInit'
    ];
    keys.forEach((key) => {
        delete fileExplorerRoot.dataset[key];
    });
}

function initFileExplorerContainer(rootContainer) {
    const root = (typeof window !== 'undefined' && window.CAPSULE_CONTENT_ROOT)
        ? String(window.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '')
        : (typeof window !== 'undefined' && window.CapsuleUserHome)
            ? window.CapsuleUserHome.resolveRelative()
            : 'home/public';

    const fileExplorerRoot = rootContainer
        || ((typeof window.getExplorerWindowSlot === 'function')
            ? window.getExplorerWindowSlot()
            : (document.getElementById('nemo')
                || document.querySelector('div.windowElement[data-link="nemo"]')));
    if (!fileExplorerRoot) {
        return;
    }

    const folderMap = typeof window.buildNemoPlaceFolderMap === 'function'
        ? window.buildNemoPlaceFolderMap(root)
        : {
            'Dossier Personnel': root,
            Bureau: `${root}/Bureau`,
            Documents: `${root}/Documents`,
            Musique: `${root}/Musique`,
            Images: `${root}/Images`,
            Vidéos: `${root}/Vidéos`,
            Téléchargements: `${root}/Téléchargements`
        };

    function navigatePlaceKey(key) {
        const directory = folderMap[key];
        if (!directory) {
            return;
        }
        if (typeof window.exitNautilusSearchChrome === 'function') {
            window.exitNautilusSearchChrome({ render: false });
        }
        if (typeof navigateToFileExplorerDirectory === 'function') {
            navigateToFileExplorerDirectory(directory, { updateHistory: true });
            return;
        }
        if (typeof loadFileExplorerDirectory === 'function') {
            loadFileExplorerDirectory(directory);
        }
    }

    if (fileExplorerRoot.dataset.nemoSidebarDelegation !== 'true') {
        const sidebar = fileExplorerRoot.querySelector('#voletnemo');
        if (sidebar) {
            sidebar.addEventListener('click', (event) => {
                const sectionToggle = event.target.closest('[data-nemo-section-toggle]');
                if (sectionToggle && sidebar.contains(sectionToggle)) {
                    event.preventDefault();
                    const sectionId = sectionToggle.getAttribute('data-nemo-section-toggle');
                    const body = sidebar.querySelector(`[data-nemo-section-body="${sectionId}"]`);
                    if (!body) {
                        return;
                    }
                    const collapsed = body.hasAttribute('hidden');
                    if (collapsed) {
                        body.removeAttribute('hidden');
                        sectionToggle.setAttribute('aria-expanded', 'true');
                    } else {
                        body.setAttribute('hidden', '');
                        sectionToggle.setAttribute('aria-expanded', 'false');
                    }
                    return;
                }

                const placeLink = event.target.closest('a[data-link]');
                if (placeLink && sidebar.contains(placeLink)) {
                    const key = placeLink.getAttribute('data-link');
                    if (!key) {
                        return;
                    }
                    event.preventDefault();
                    navigatePlaceKey(key);
                }
            });
            fileExplorerRoot.dataset.nemoSidebarDelegation = 'true';
        }
    }

    if (typeof bindNemoSidebarFooterControls === 'function') {
        bindNemoSidebarFooterControls(fileExplorerRoot);
    }

    if (fileExplorerRoot.dataset.fileExplorerInit === 'true' || fileExplorerRoot.dataset.nemoInit === 'true') {
        if (typeof bindFileExplorerNavigationControls === 'function' || typeof bindNemoNavigationControls === 'function') {
            (window.bindFileExplorerNavigationControls || window.bindNemoNavigationControls)();
        }
        return;
    }

    if (typeof bindFileExplorerMenubar === 'function') {
        bindFileExplorerMenubar(fileExplorerRoot);
    }

    if (typeof bindFileExplorerNautilusItemInteraction === 'function') {
        bindFileExplorerNautilusItemInteraction(fileExplorerRoot);
    }

    if (typeof bindFileExplorerNavigationControls === 'function' || typeof bindNemoNavigationControls === 'function') {
        (window.bindFileExplorerNavigationControls || window.bindNemoNavigationControls)();
    }

    fileExplorerRoot.dataset.fileExplorerInit = 'true';
    fileExplorerRoot.dataset.nemoInit = 'true';
}

window.resetFileExplorerSlotBindings = resetFileExplorerSlotBindings;
window.initFileExplorerContainer = initFileExplorerContainer;
window.initNemoContainer = initFileExplorerContainer;
