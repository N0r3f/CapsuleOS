/**
 * Base icônes explorateur : Cinnamon/Nemo (Mint) vs Adwaita/Nautilus (GNOME Rocky, Fedora).
 * Fichiers sous icons/gnome/adwaita/ : pull-vm-assets.sh (VM ground truth).
 */
(function initCapsuleExplorerIconBase(global) {
    'use strict';

    const paths = global.CapsuleExplorerToolkitPaths;
    const CINNAMON_BASE = paths ? paths.catalogBase() : './assets/icons/cinnamon/nemo';
    const KDE_BASE = paths ? paths.paths.kde : './assets/icons/kde/nemo';
    const ADWAITA_BASE = paths ? paths.paths.gnome : './assets/icons/gnome/adwaita';
    const SYMBOLIC_BASE = ADWAITA_BASE;

    function gnomeBase() {
        if (paths && typeof paths.gnomeIconBase === 'function') {
            return paths.gnomeIconBase();
        }
        if (usesGnomeYaru()) {
            return paths && paths.paths ? paths.paths.yaru : './assets/icons/gnome/yaru';
        }
        return ADWAITA_BASE;
    }

    function gnomeAssetPath(mapped) {
        if (!mapped) {
            return null;
        }
        let rel = mapped;
        if (usesGnomeYaru() && YARU_MIME_FALLBACK[rel]) {
            rel = YARU_MIME_FALLBACK[rel];
        }
        return resolveAssetUrl(`${gnomeBase()}/${withRasterExt(rel)}`);
    }

    function usesGnomeYaru() {
        if (paths && typeof paths.gnomeIconPackId === 'function') {
            return paths.gnomeIconPackId() === 'yaru';
        }
        const bodyId = global.document && global.document.body ? global.document.body.id : '';
        return bodyId === 'ubuntu';
    }

    function withRasterExt(mapped) {
        if (!mapped || !usesGnomeYaru()) {
            return mapped;
        }
        if (mapped.startsWith('symbolic/') || mapped.startsWith('places/document-open-recent')) {
            return mapped;
        }
        if (mapped.startsWith('mimetypes/') || mapped.startsWith('places/')) {
            return mapped.replace(/\.svg$/, '.png');
        }
        return mapped;
    }
    const COSMIC_BASE = paths ? paths.paths.cosmic : './assets/images/toolkits/cosmic/elements/nemo';

    /** Icônes toolbar connues → sous-dossier symbolic (hors sidebar). */
    const SYMBOLIC_SUBDIR_MAP = {
        'go-previous-symbolic.svg': 'symbolic/actions',
        'go-next-symbolic.svg': 'symbolic/actions',
        'go-up-symbolic.svg': 'symbolic/actions',
        'pan-start-symbolic.svg': 'symbolic/actions',
        'pan-end-symbolic.svg': 'symbolic/actions',
        'view-grid-symbolic.svg': 'symbolic/actions',
        'view-list-symbolic.svg': 'symbolic/actions',
        'view-compact-symbolic.svg': 'symbolic/actions',
        'system-search-symbolic.svg': 'symbolic/actions',
        'find-location-symbolic.svg': 'symbolic/actions',
        'sidebar-show-symbolic.svg': 'symbolic/actions',
        'starred-symbolic.svg': 'symbolic/status',
        'network-workgroup-symbolic.svg': 'symbolic/places',
    };

    /** Yaru VM : application-x-generic absent — text-x-generic comme fallback. */
    const YARU_MIME_FALLBACK = {
        'mimetypes/application-x-generic.svg': 'mimetypes/text-x-generic.svg',
    };

    /** Icônes MIME KDE catalogue → Adwaita scalable/mimetypes (VM ground truth). */
    const ADWAITA_MIME_LEAF_MAP = {
        'x-office-document.svg': 'mimetypes/x-office-document.svg',
        'text-x-generic.svg': 'mimetypes/text-x-generic.svg',
        'text-x-script.svg': 'mimetypes/text-x-script.svg',
        'text-html.svg': 'mimetypes/text-x-generic.svg',
        'application-x-generic.svg': 'mimetypes/application-x-generic.svg',
        'application-x-executable.svg': 'mimetypes/application-x-executable.svg',
        'image-x-generic.svg': 'mimetypes/image-x-generic.svg',
        'audio-x-generic.svg': 'mimetypes/audio-x-generic.svg',
        'video-x-generic.svg': 'mimetypes/video-x-generic.svg',
        'package-x-generic.svg': 'mimetypes/package-x-generic.svg',
    };

    /** Noms Mint/Cinnamon → chemin relatif sous icons/gnome/adwaita/ (VM Adwaita). */
    const ADWAITA_LEAF_MAP = {
        'recent.svg': 'places/document-open-recent-symbolic.svg',
        'location-symbolic.svg': 'symbolic/actions/find-location-symbolic.svg',
        'search-symbolic.svg': 'symbolic/actions/system-search-symbolic.svg',
        'view-compact-symbolic.svg': 'symbolic/actions/view-grid-symbolic.svg',
        'view-grid-symbolic.svg': 'symbolic/actions/view-grid-symbolic.svg',
        'view-list-symbolic.svg': 'symbolic/actions/view-list-symbolic.svg',
        'go-previous-symbolic.svg': 'symbolic/actions/go-previous-symbolic.svg',
        'go-next-symbolic.svg': 'symbolic/actions/go-next-symbolic.svg',
        'go-up-symbolic.svg': 'symbolic/actions/go-up-symbolic.svg',
        'sidebar-places-symbolic.svg': 'symbolic/actions/sidebar-show-symbolic.svg',
        'sidebar-tree-symbolic.svg': 'symbolic/actions/sidebar-show-symbolic.svg',
        'sidebar-hide-symbolic.svg': 'symbolic/actions/sidebar-show-symbolic.svg',
        'starred-symbolic.svg': 'symbolic/status/starred-symbolic.svg',
        'folder.svg': 'places/folder.svg',
        'network-workgroup-symbolic.svg': 'symbolic/places/network-workgroup-symbolic.svg',
        'pan-end-symbolic.svg': 'symbolic/actions/go-next-symbolic.svg',
        'open-menu-symbolic.svg': 'symbolic/actions/open-menu-symbolic.svg',
        'view-more-symbolic.svg': 'symbolic/actions/view-more-symbolic.svg',
        'tab-new.svg': 'symbolic/actions/folder-new-symbolic.svg',
        'folder-new-symbolic.svg': 'symbolic/actions/folder-new-symbolic.svg',
        'user-desktop-symbolic.svg': 'places/user-desktop.svg',
        'find-location-symbolic.svg': 'symbolic/actions/find-location-symbolic.svg',
    };

    function usesGnomeAdwaita() {
        if (paths && paths.activeToolkitId() === 'gnome') {
            return true;
        }
        const packs = global.CAPSULE_SKIN_PROFILE_ICON_PACKS;
        if (Array.isArray(packs) && packs.includes('icons/gnome')) {
            return true;
        }
        return false;
    }

    function usesKdeIcons() {
        if (paths && paths.activeToolkitId() === 'kde') {
            return true;
        }
        if (global.CapsuleExplorerRegistry
            && typeof global.CapsuleExplorerRegistry.isDolphinFamily === 'function'
            && global.CapsuleExplorerRegistry.isDolphinFamily()) {
            return true;
        }
        const packs = global.CAPSULE_SKIN_PROFILE_ICON_PACKS;
        if (Array.isArray(packs) && packs.includes('icons/kde')) {
            return true;
        }
        return false;
    }

    function explorerPlacesBase() {
        if (usesGnomeAdwaita()) {
            return `${gnomeBase()}/places`;
        }
        if (usesKdeIcons()) {
            return KDE_BASE;
        }
        return CINNAMON_BASE;
    }

    function remapLeaf(rawLeaf, context) {
        // Catalogue Cinnamon en PNG Mint-Y (vérité VM) — normaliser vers .svg pour le mapping Adwaita.
        const leaf = String(rawLeaf || '').replace(/\.png$/, '.svg');
        if (ADWAITA_LEAF_MAP[leaf]) {
            return ADWAITA_LEAF_MAP[leaf];
        }
        const folderSymbolic = /^folder-(.+)-symbolic\.svg$/.exec(leaf);
        if (folderSymbolic) {
            if (context === 'sidebar') {
                return `symbolic/places/folder-${folderSymbolic[1]}-symbolic.svg`;
            }
            return `places/folder-${folderSymbolic[1]}.svg`;
        }
        if (leaf === 'user-home-symbolic.svg') {
            return context === 'sidebar'
                ? 'symbolic/places/user-home-symbolic.svg'
                : 'places/user-home.svg';
        }
        if (leaf === 'user-trash-symbolic.svg') {
            return context === 'sidebar'
                ? 'symbolic/places/user-trash-symbolic.svg'
                : 'places/user-trash.svg';
        }
        if (leaf.endsWith('-symbolic.svg')) {
            if (context === 'sidebar') {
                return `symbolic/places/${leaf}`;
            }
            const subdir = SYMBOLIC_SUBDIR_MAP[leaf] || 'symbolic/actions';
            return `${subdir}/${leaf}`;
        }
        if (/^folder-[^/]+\.svg$/.test(leaf) || /^user-(home|trash|desktop)\.svg$/.test(leaf)) {
            return `places/${leaf}`;
        }
        return null;
    }

    function resolveAssetUrl(path) {
        if (global.resolveCapsuleResourceUrl) {
            return global.resolveCapsuleResourceUrl(path);
        }
        if (global.CapsuleResource && typeof global.CapsuleResource.resolve === 'function') {
            return global.CapsuleResource.resolve(path);
        }
        return path;
    }

    function remapCinnamonToKde(path) {
        if (!path || typeof path !== 'string') {
            return path;
        }
        let mapped = path
            .replace(`${CINNAMON_BASE}/`, `${KDE_BASE}/`)
            .replace('./assets/images/toolkits/cinnamon/', './assets/images/toolkits/kde/');
        // Catalogue Cinnamon en PNG Mint-Y — le pack KDE reste en SVG.
        if (mapped.indexOf(`${KDE_BASE}/`) === 0) {
            mapped = mapped.replace(/\.png$/, '.svg');
        }
        return resolveAssetUrl(mapped);
    }

    function remapPath(path) {
        if (!path || typeof path !== 'string') {
            return path;
        }
        if (usesKdeIcons()) {
            if (path.indexOf(`${CINNAMON_BASE}/`) === 0
                || path.indexOf('./assets/images/toolkits/cinnamon/') === 0) {
                return remapCinnamonToKde(path);
            }
            return resolveAssetUrl(path);
        }
        if (!usesGnomeAdwaita()) {
            return resolveAssetUrl(path);
        }
        if (path.indexOf('kde/mimeTypes/') >= 0) {
            const leaf = path.split('/').pop();
            const mapped = ADWAITA_MIME_LEAF_MAP[leaf] || 'mimetypes/application-x-generic.svg';
            return gnomeAssetPath(mapped);
        }
        if (path.indexOf(`${CINNAMON_BASE}/`) === 0) {
            const leaf = path.slice(CINNAMON_BASE.length + 1);
            const mapped = remapLeaf(leaf, 'grid');
            if (!mapped) {
                return resolveAssetUrl(path);
            }
            return gnomeAssetPath(mapped);
        }
        const gnomeBasePath = gnomeBase();
        if (path.indexOf(`${gnomeBasePath}/`) === 0) {
            return resolveAssetUrl(path);
        }
        if (path.indexOf(`${ADWAITA_BASE}/`) === 0) {
            const rel = path.slice(ADWAITA_BASE.length + 1);
            return gnomeAssetPath(rel);
        }
        if (path.indexOf('./assets/images/toolkits/gnome/elements/nemo/') === 0
            || path.indexOf('./assets/images/toolkits/cinnamon/elements/nemo/') === 0) {
            const leaf = path.split('/').pop();
            return gnomeAssetPath(remapLeaf(leaf));
        }
        return resolveAssetUrl(path);
    }

    function rewriteImagesInRoot(root) {
        if (!root || (!usesGnomeAdwaita() && !usesKdeIcons())) {
            return;
        }
        root.querySelectorAll('img[src]').forEach((img) => {
            const src = img.getAttribute('src');
            if (!src) {
                return;
            }
            if (usesKdeIcons() && src.indexOf('cinnamon/nemo/') >= 0) {
                img.setAttribute('src', remapCinnamonToKde(src));
                return;
            }
            const marker = 'cinnamon/nemo/';
            const idx = src.indexOf(marker);
            if (idx < 0) {
                return;
            }
            if (img.closest('.nemo-app__menubar')) {
                return;
            }
            const context = img.closest('.nemo-app__sidebar') ? 'sidebar' : 'toolbar';
            const leaf = src.slice(idx + marker.length);
            const mapped = remapLeaf(leaf, context);
            if (!mapped) {
                return;
            }
            const next = gnomeAssetPath(mapped);
            if (next && next !== src) {
                img.setAttribute('src', next);
            }
        });
    }

    function patchFileExplorerCatalog() {
        if (!global.fileExplorerSystemLink || !global.fileExplorerSystemLink.files) {
            return;
        }
        Object.keys(global.fileExplorerSystemLink.files).forEach((key) => {
            const entry = global.fileExplorerSystemLink.files[key];
            if (entry && entry.image) {
                entry.image = remapPath(entry.image);
            }
        });
    }

    function patchNemoIconMap() {
        if (!global.CAPSULE_NEMO_ICON_MAP) {
            return;
        }
        const base = explorerPlacesBase();
        if (usesGnomeAdwaita()) {
            global.CAPSULE_NEMO_ICON_MAP = {
                Récent: `${base}/document-open-recent-symbolic.svg`,
                Corbeille: `${base}/user-trash-symbolic.svg`,
                Réseau: `${base}/network-server.svg`,
                'Système de fichiers': gnomeAssetPath('places/folder.svg'),
            };
        }
    }

    function apply() {
        patchFileExplorerCatalog();
        patchNemoIconMap();
        global.CAPSULE_EXPLORER_ICON_BASE = explorerPlacesBase();
        const slot = global.document && global.document.getElementById('nemo');
        if (slot) {
            rewriteImagesInRoot(slot);
        }
    }

    function defaultIcon(leaf) {
        const catalog = paths && typeof paths.catalogIcon === 'function'
            ? paths.catalogIcon(leaf)
            : `${CINNAMON_BASE}/${leaf}`;
        return remapPath(catalog);
    }

    global.CapsuleExplorerIconBase = {
        usesGnomeAdwaita: usesGnomeAdwaita,
        placesBase: explorerPlacesBase,
        catalogIcon: defaultIcon,
        remapPath: remapPath,
        rewriteImagesInRoot: rewriteImagesInRoot,
        apply: apply,
    };

    apply();

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', (event) => {
            const detail = event.detail || {};
            if (detail.slotId === 'nemo' && detail.container) {
                patchFileExplorerCatalog();
                patchNemoIconMap();
                rewriteImagesInRoot(detail.container);
            }
        });
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', apply);
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
