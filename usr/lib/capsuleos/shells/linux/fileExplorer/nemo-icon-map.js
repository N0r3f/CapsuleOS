/**
 * Lieux virtuels explorateur (sidebar Récent, Corbeille, …).
 * Catalogue canonique Cinnamon ; CapsuleExplorerIconBase remappe pour GNOME/KDE.
 */
(function initCapsuleExplorerVirtualPlacesMap(global) {
    'use strict';

    const catalogIcon = global.CapsuleExplorerToolkitPaths
        && typeof global.CapsuleExplorerToolkitPaths.catalogIcon === 'function'
        ? global.CapsuleExplorerToolkitPaths.catalogIcon.bind(global.CapsuleExplorerToolkitPaths)
        : function fallbackCatalogIcon(leaf) {
            return `./assets/icons/cinnamon/nemo/${leaf}`;
        };

    global.CAPSULE_NEMO_ICON_MAP = {
        Récent: catalogIcon('places/folder-recent-symbolic.svg'),
        Corbeille: catalogIcon('user-trash-symbolic.svg'),
        Réseau: catalogIcon('network-workgroup-symbolic.svg'),
        'Système de fichiers': catalogIcon('media-removable-symbolic.svg'),
    };
}(typeof window !== 'undefined' ? window : globalThis));
