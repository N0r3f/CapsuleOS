/**
 * Nemo — barre d'état gauche : Emplacements, Arborescence, masquer panneau (F9).
 * Parité VM : vue « Poste de travail » vs arborescence des dossiers du manifeste.
 */
(function initNemoSidebarControls(global) {
    'use strict';

    function resolveSidebarIconUrl(path) {
        if (!path) {
            return path;
        }
        if (typeof global.resolveCapsuleAssetUrl === 'function') {
            return global.resolveCapsuleAssetUrl(path);
        }
        if (typeof global.resolveCapsuleResourceUrl === 'function') {
            return global.resolveCapsuleResourceUrl(path);
        }
        return path;
    }

    var MODE_PLACES = 'places';
    var MODE_TREE = 'tree';

    function getExplorerRoot() {
        if (typeof global.getExplorerWindowSlot === 'function') {
            return global.getExplorerWindowSlot();
        }
        return global.document.getElementById('nemo')
            || global.document.querySelector('div.windowElement#nemo[data-link="nemo"]');
    }

    function getSidebarEl(root) {
        return root ? root.querySelector('#voletnemo') : null;
    }

    function getTreeEl(sidebar) {
        if (!sidebar) {
            return null;
        }
        var tree = sidebar.querySelector('#nemo-sidebar-tree');
        if (!tree) {
            tree = global.document.createElement('div');
            tree.id = 'nemo-sidebar-tree';
            tree.className = 'nemo-sidebar__tree';
            tree.setAttribute('role', 'tree');
            tree.setAttribute('aria-label', 'Arborescence');
            tree.hidden = true;
            sidebar.appendChild(tree);
        }
        return tree;
    }

    function getFooterButtons(root) {
        var left = root ? root.querySelector('#nemoFooterContainer .nemo-app__status-left') : null;
        if (!left) {
            return null;
        }
        return {
            places: left.querySelector('[data-nemo-sidebar-mode="places"]'),
            tree: left.querySelector('[data-nemo-sidebar-mode="tree"]'),
            toggle: left.querySelector('#nemo-toggle-sidebar')
        };
    }

    function normalizePath(path) {
        if (typeof global.normalizeDirectoryPathForExplorer === 'function') {
            return global.normalizeDirectoryPathForExplorer(path);
        }
        return String(path || '').replace(/\\/g, '/').replace(/\/+$/, '') || '/';
    }

    function getManifest() {
        return global.fileExplorerState && global.fileExplorerState.manifest
            ? global.fileExplorerState.manifest
            : null;
    }

    function listChildFolderPaths(parentPath, manifest) {
        var out = [];
        var seen = {};
        var parent = normalizePath(parentPath);
        var prefix = parent + '/';
        var node = manifest.folders[parent];

        if (node && Array.isArray(node.items)) {
            node.items.forEach(function eachItem(item) {
                if (item.type === 'folder' && item.path && !seen[item.path]) {
                    seen[item.path] = true;
                    out.push({ path: normalizePath(item.path), name: item.name });
                }
            });
        }

        Object.keys(manifest.folders).forEach(function eachKey(key) {
            var folderPath = normalizePath(key);
            if (folderPath === parent) {
                return;
            }
            if (folderPath.indexOf(prefix) !== 0) {
                return;
            }
            var rel = folderPath.slice(prefix.length);
            if (rel.indexOf('/') >= 0) {
                return;
            }
            if (!seen[folderPath]) {
                seen[folderPath] = true;
                var folderNode = manifest.folders[folderPath];
                out.push({
                    path: folderPath,
                    name: (folderNode && folderNode.label) || rel
                });
            }
        });

        out.sort(function sortFolders(a, b) {
            return String(a.name).localeCompare(String(b.name), 'fr', { sensitivity: 'base' });
        });
        return out;
    }

    function navigateTo(path) {
        if (typeof global.navigateToFileExplorerDirectory === 'function') {
            global.navigateToFileExplorerDirectory(path, { updateHistory: true });
            return;
        }
        if (typeof global.loadFileExplorerDirectory === 'function') {
            global.loadFileExplorerDirectory(path);
        }
    }

    function getCurrentPath() {
        if (global.fileExplorerState && global.fileExplorerState.currentPath) {
            return normalizePath(global.fileExplorerState.currentPath);
        }
        if (typeof global.getFileExplorerRoot === 'function') {
            return normalizePath(global.getFileExplorerRoot());
        }
        return 'home/public';
    }

    function isVirtualPath(path) {
        return typeof path === 'string' && path.indexOf('__capsule/') === 0;
    }

    function renderTreeBranch(container, parentPath, manifest, depth, expandedPaths) {
        if (isVirtualPath(parentPath)) {
            return;
        }
        var children = listChildFolderPaths(parentPath, manifest);
        if (!children.length) {
            return;
        }

        var list = global.document.createElement('ul');
        list.className = 'nemo-sidebar__tree-list';
        list.setAttribute('role', 'group');

        children.forEach(function eachChild(entry) {
            var hasKids = listChildFolderPaths(entry.path, manifest).length > 0;
            var isExpanded = expandedPaths[entry.path] === true;
            var isActive = getCurrentPath() === entry.path;

            var row = global.document.createElement('li');
            row.className = 'nemo-sidebar__tree-item';
            row.setAttribute('role', 'treeitem');
            row.setAttribute('aria-expanded', hasKids ? (isExpanded ? 'true' : 'false') : 'false');

            var line = global.document.createElement('div');
            line.className = 'nemo-sidebar__tree-line';
            if (isActive) {
                line.classList.add('nemo-sidebar__tree-line--active');
            }
            line.style.setProperty('--nemo-tree-depth', String(depth));

            if (hasKids) {
                var expander = global.document.createElement('button');
                expander.type = 'button';
                expander.className = 'nemo-sidebar__tree-expander';
                expander.setAttribute('aria-label', isExpanded ? 'Réduire' : 'Développer');
                var expanderIcon = global.document.createElement('img');
                expanderIcon.src = resolveSidebarIconUrl(isExpanded
                    ? (window.CapsuleExplorerIconBase
                        ? window.CapsuleExplorerIconBase.catalogIcon('pan-down-symbolic.svg')
                        : './assets/icons/cinnamon/nemo/pan-down-symbolic.svg')
                    : (window.CapsuleExplorerIconBase
                        ? window.CapsuleExplorerIconBase.catalogIcon('pan-end-symbolic.svg')
                        : './assets/icons/cinnamon/nemo/pan-end-symbolic.svg'));
                expanderIcon.alt = '';
                expanderIcon.width = 16;
                expanderIcon.height = 16;
                expander.appendChild(expanderIcon);
                expander.addEventListener('click', function onExpandClick(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    expandedPaths[entry.path] = !isExpanded;
                    renderSidebarTree(getSidebarEl(getExplorerRoot()));
                });
                line.appendChild(expander);
            } else {
                var spacer = global.document.createElement('span');
                spacer.className = 'nemo-sidebar__tree-spacer';
                spacer.setAttribute('aria-hidden', 'true');
                line.appendChild(spacer);
            }

            var link = global.document.createElement('button');
            link.type = 'button';
            link.className = 'nemo-sidebar__tree-link';
            var folderIcon = global.document.createElement('img');
            folderIcon.src = resolveSidebarIconUrl(window.CapsuleExplorerIconBase
                ? window.CapsuleExplorerIconBase.catalogIcon('folder.svg')
                : './assets/icons/cinnamon/nemo/folder.svg');
            folderIcon.alt = '';
            folderIcon.width = 16;
            folderIcon.height = 16;
            link.appendChild(folderIcon);
            var label = global.document.createElement('span');
            label.textContent = entry.name;
            link.appendChild(label);
            link.addEventListener('click', function onTreeNavigate(event) {
                event.preventDefault();
                navigateTo(entry.path);
            });
            line.appendChild(link);
            row.appendChild(line);

            if (hasKids && isExpanded) {
                renderTreeBranch(row, entry.path, manifest, depth + 1, expandedPaths);
            }

            list.appendChild(row);
        });

        container.appendChild(list);
    }

    function renderSidebarTree(sidebar) {
        if (!sidebar) {
            return;
        }
        var tree = getTreeEl(sidebar);
        if (!tree) {
            return;
        }

        var manifest = getManifest();
        tree.innerHTML = '';
        if (!manifest || !manifest.folders) {
            var empty = global.document.createElement('p');
            empty.className = 'nemo-sidebar__tree-empty';
            empty.textContent = 'Arborescence indisponible.';
            tree.appendChild(empty);
            return;
        }

        var rootPath = normalizePath(manifest.root || getCurrentPath());
        var expandedPaths = {};
        var current = getCurrentPath();
        var walk = current;
        expandedPaths[rootPath] = true;
        while (walk && walk.length > rootPath.length) {
            expandedPaths[walk] = true;
            var slash = walk.lastIndexOf('/');
            if (slash <= 0) {
                break;
            }
            walk = walk.slice(0, slash);
        }

        var rootRow = global.document.createElement('div');
        rootRow.className = 'nemo-sidebar__tree-root';
        var rootBtn = global.document.createElement('button');
        rootBtn.type = 'button';
        rootBtn.className = 'nemo-sidebar__tree-link';
        if (current === rootPath) {
            rootBtn.classList.add('nemo-sidebar__tree-link--active');
        }
        var rootIcon = global.document.createElement('img');
        rootIcon.src = resolveSidebarIconUrl(window.CapsuleExplorerIconBase
            ? window.CapsuleExplorerIconBase.catalogIcon('user-home.svg')
            : './assets/icons/cinnamon/nemo/user-home-symbolic.svg');
        rootIcon.alt = '';
        rootIcon.width = 16;
        rootIcon.height = 16;
        rootBtn.appendChild(rootIcon);
        var rootLabel = global.document.createElement('span');
        rootLabel.textContent = manifest.rootLabel || 'Dossier personnel';
        rootBtn.appendChild(rootLabel);
        rootBtn.addEventListener('click', function onRootClick(event) {
            event.preventDefault();
            navigateTo(rootPath);
        });
        rootRow.appendChild(rootBtn);
        tree.appendChild(rootRow);

        renderTreeBranch(tree, rootPath, manifest, 0, expandedPaths);
    }

    function applySidebarMode(root, mode) {
        var sidebar = getSidebarEl(root);
        if (!sidebar) {
            return;
        }
        var nextMode = mode === MODE_TREE ? MODE_TREE : MODE_PLACES;
        sidebar.setAttribute('data-sidebar-view', nextMode);
        root.dataset.nemoSidebarView = nextMode;

        var tree = getTreeEl(sidebar);
        if (tree) {
            if (nextMode === MODE_TREE) {
                tree.hidden = false;
                if (sidebar.firstChild !== tree) {
                    sidebar.insertBefore(tree, sidebar.firstChild);
                }
                renderSidebarTree(sidebar);
            } else {
                tree.hidden = true;
            }
        }

        syncFooterButtonStates(root);
    }

    function setSidebarHidden(root, hidden) {
        var sidebar = getSidebarEl(root);
        if (!sidebar) {
            return;
        }
        if (hidden) {
            sidebar.classList.add('is-sidebar-hidden');
        } else {
            sidebar.classList.remove('is-sidebar-hidden');
        }
        root.dataset.nemoSidebarHidden = hidden ? 'true' : 'false';
        syncFooterButtonStates(root);
    }

    function syncFooterButtonStates(root) {
        var buttons = getFooterButtons(root);
        var sidebar = getSidebarEl(root);
        if (!buttons || !sidebar) {
            return;
        }
        var hidden = sidebar.classList.contains('is-sidebar-hidden');
        var mode = sidebar.getAttribute('data-sidebar-view') || MODE_PLACES;

        if (buttons.places) {
            buttons.places.setAttribute('aria-pressed', (!hidden && mode === MODE_PLACES) ? 'true' : 'false');
            buttons.places.classList.toggle('nemo-footer-btn--active', !hidden && mode === MODE_PLACES);
        }
        if (buttons.tree) {
            buttons.tree.setAttribute('aria-pressed', (!hidden && mode === MODE_TREE) ? 'true' : 'false');
            buttons.tree.classList.toggle('nemo-footer-btn--active', !hidden && mode === MODE_TREE);
        }
        if (buttons.toggle) {
            buttons.toggle.setAttribute('aria-pressed', hidden ? 'true' : 'false');
            buttons.toggle.title = hidden ? 'Afficher le panneau latéral (F9)' : 'Masquer le panneau latéral (F9)';
        }
    }

    function showSidebarWithMode(root, mode) {
        setSidebarHidden(root, false);
        applySidebarMode(root, mode);
    }

    function bindFooterControls(root) {
        if (!root || root.dataset.nemoFooterControlsBound === 'true') {
            syncFooterButtonStates(root);
            return;
        }

        var sidebar = getSidebarEl(root);
        if (sidebar && !sidebar.getAttribute('data-sidebar-view')) {
            sidebar.setAttribute('data-sidebar-view', MODE_PLACES);
        }

        var buttons = getFooterButtons(root);
        if (buttons && buttons.places) {
            buttons.places.addEventListener('click', function onPlaces(event) {
                event.preventDefault();
                showSidebarWithMode(root, MODE_PLACES);
            });
        }
        if (buttons && buttons.tree) {
            buttons.tree.addEventListener('click', function onTree(event) {
                event.preventDefault();
                showSidebarWithMode(root, MODE_TREE);
                if (typeof global.loadManifestForFileExplorer === 'function') {
                    global.loadManifestForFileExplorer().then(function refreshTree() {
                        renderSidebarTree(getSidebarEl(root));
                    }).catch(function noop() { /* ignore */ });
                } else {
                    renderSidebarTree(getSidebarEl(root));
                }
            });
        }
        if (buttons && buttons.toggle) {
            buttons.toggle.addEventListener('click', function onToggle(event) {
                event.preventDefault();
                var side = getSidebarEl(root);
                if (!side) {
                    return;
                }
                var hidden = !side.classList.contains('is-sidebar-hidden');
                setSidebarHidden(root, hidden);
            });
        }

        if (!root.hasAttribute('tabindex')) {
            root.setAttribute('tabindex', '-1');
        }

        if (root.dataset.nemoF9Bound !== 'true') {
            root.addEventListener('keydown', function onF9(event) {
                if (event.key !== 'F9') {
                    return;
                }
                event.preventDefault();
                var side = getSidebarEl(root);
                if (!side) {
                    return;
                }
                setSidebarHidden(root, !side.classList.contains('is-sidebar-hidden'));
            });
            root.dataset.nemoF9Bound = 'true';
        }

        root.dataset.nemoFooterControlsBound = 'true';
        syncFooterButtonStates(root);
    }

    function refreshNemoSidebarTree() {
        var root = getExplorerRoot();
        var sidebar = getSidebarEl(root);
        if (!sidebar || sidebar.getAttribute('data-sidebar-view') !== MODE_TREE) {
            return;
        }
        renderSidebarTree(sidebar);
    }

    global.bindNemoSidebarFooterControls = bindFooterControls;
    global.refreshNemoSidebarTree = refreshNemoSidebarTree;
    global.renderNemoSidebarTree = renderSidebarTree;
}(typeof window !== 'undefined' ? window : this));
