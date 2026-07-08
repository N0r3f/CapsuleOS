/**
 * Runtime commun post-chargement du slot explorateur (`data-link="nemo"`).
 */
(function initCapsuleExplorerRuntime(global) {
    'use strict';

    const SHELL_SCRIPTS = [
        'fileExplorer/fileExplorerHeader.js',
        'fileExplorer/fileExplorerContainer.js',
        'fileExplorer/fileExplorerCore.js',
        'fileExplorer/fileExplorerInfo.js',
        '../fileViewerRouter.js',
        'fileExplorer/fileExplorerLoader.js'
    ];

    const DOLPHIN_SCRIPT = 'fileExplorer/fileExplorerDolphin.js';
    const NAUTILUS_SCRIPTS = [
        'fileExplorer/fileExplorerNautilus.js',
        'fileExplorer/fileExplorerNautilusOps.js',
        'fileExplorer/fileExplorerInlineRename.js',
        'fileExplorer/fileExplorerNautilusItemInteraction.js',
        'fileExplorer/fileExplorerNautilusHeaderbar.js',
        'fileExplorer/fileExplorerTabs.js',
        'fileExplorer/fileExplorerProperties.js',
        'fileExplorer/fileExplorerContextMenu.js'
    ];

    function getLinuxShellBase() {
        if (typeof global.CAPSULE_LINUX_SHELL_BASE === 'string' && global.CAPSULE_LINUX_SHELL_BASE) {
            return String(global.CAPSULE_LINUX_SHELL_BASE).replace(/\/+$/, '');
        }
        return 'usr/lib/capsuleos/shells/linux';
    }

    /** Chemins relatifs depuis `shells/linux/` pour inclusion dans index.html. */
    function getScriptChain() {
        const chain = SHELL_SCRIPTS.slice();
        const reg = global.CapsuleExplorerRegistry;
        const profile = reg ? reg.resolveActiveProfile() : null;
        if (profile && profile.loadDolphinExtension) {
            chain.splice(chain.length - 1, 0, DOLPHIN_SCRIPT);
        }
        if (profile && profile.loadNautilusExtension) {
            chain.splice(chain.length - 1, 0, ...NAUTILUS_SCRIPTS);
        }
        return chain;
    }

    function getContentRoot() {
        if (global.CapsuleExplorerHome) {
            return global.CapsuleExplorerHome.getContentRoot();
        }
        if (global.CAPSULE_CONTENT_ROOT) {
            return String(global.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
        }
        return 'home/public';
    }

    function initExplorerSlot() {
        const contentRoot = getContentRoot();
        const reg = global.CapsuleExplorerRegistry;
        if (reg && reg.isDolphinFamily() && typeof global.refreshDolphinShellLayout === 'function') {
            global.refreshDolphinShellLayout();
        }
        if (typeof global.initFileExplorerContainer === 'function') {
            global.initFileExplorerContainer();
        } else if (typeof global.initNemoContainer === 'function') {
            global.initNemoContainer();
        }
        if (typeof global.loadFileExplorerDirectory === 'function') {
            global.loadFileExplorerDirectory(contentRoot);
        } else if (typeof global.loadDirectory === 'function') {
            global.loadDirectory(contentRoot);
        }
    }

    global.CapsuleExplorerRuntime = {
        getLinuxShellBase,
        getScriptChain,
        getContentRoot,
        initExplorerSlot,
        SHELL_SCRIPTS,
        DOLPHIN_SCRIPT
    };
}(typeof window !== 'undefined' ? window : globalThis));
