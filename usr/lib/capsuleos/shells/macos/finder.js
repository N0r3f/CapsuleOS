/**
 * Finder macOS — navigation via home/public/.capsule-finder-manifest.json
 */
(function initMacFinder(global) {
    'use strict';

    const state = {
        manifest: null,
        history: [],
        historyIndex: -1,
        currentPath: null,
        viewMode: 'icons'
    };

    function manifestUrl() {
        if (global.CAPSULE_FINDER_MANIFEST_URL) {
            return String(global.CAPSULE_FINDER_MANIFEST_URL);
        }
        if (global.CapsuleUserHome) {
            return global.CapsuleUserHome.finderManifestPath();
        }
        return '../../../../../home/public/.capsule-finder-manifest.json';
    }

    function contentRoot() {
        if (global.CAPSULE_FINDER_CONTENT_ROOT) {
            return String(global.CAPSULE_FINDER_CONTENT_ROOT).replace(/\/+$/, '');
        }
        if (global.CapsuleUserHome) {
            return global.CapsuleUserHome.resolveRelative();
        }
        return '../../../../../home/public';
    }

    function normalizePath(p) {
        const root = state.manifest ? state.manifest.root : contentRoot();
        if (!p || typeof p !== 'string') {
            return root;
        }
        return p.replace(/\/+$/, '') || root;
    }

    function remapManifest(manifest) {
        if (!manifest || !manifest.folders) {
            return manifest;
        }
        const targetRoot = contentRoot();
        const sourceRoot = typeof manifest.root === 'string'
            ? manifest.root.replace(/\/+$/, '')
            : '';
        if (!sourceRoot || sourceRoot === targetRoot) {
            return Object.assign( {} , manifest, { root: targetRoot });
        }
        const rewrite = (str) => {
            if (typeof str !== 'string') {
                return str;
            }
            if (str === sourceRoot || str.startsWith(`${sourceRoot}/`)) {
                return targetRoot + str.slice(sourceRoot.length);
            }
            return str;
        };
        const folders = {};
        Object.keys(manifest.folders).forEach((key) => {
            const folder = manifest.folders[key];
            const newKey = rewrite(key);
            const items = Array.isArray(folder.items)
                ? folder.items.map((item) => {
                    const out = Object.assign( {} , item);
                    if (item.path != null) {
                        out.path = rewrite(String(item.path));
                    }
                    if (item.href != null) {
                        out.href = rewrite(String(item.href));
                    }
                    return out;
                })
                : folder.items;
            folders[newKey] = Object.assign( {} , folder, { items: items });
        });
        return Object.assign( {} , manifest, { root: targetRoot }, { folders: folders });
    }

    async function loadManifest() {
        const url = manifestUrl();
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} — ${url}`);
        }
        state.manifest = remapManifest(await response.json());
        state.currentPath = state.manifest.root;
        return state.manifest;
    }

    function sortItems(items) {
        if (!Array.isArray(items)) {
            return [];
        }
        return items.slice().sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
            }
            return String(a.name).localeCompare(String(b.name), 'fr', { sensitivity: 'base' });
        });
    }

    function pathLabel(path) {
        if (!state.manifest) {
            return 'utilisateur';
        }
        if (path === state.manifest.root) {
            return state.manifest.rootLabel || 'utilisateur';
        }
        const node = state.manifest.folders[path];
        return (node && node.label) || path.split('/').pop() || path;
    }

    function updateNavButtons() {
        const back = document.getElementById('macFinderBack');
        const forward = document.getElementById('macFinderForward');
        if (back) {
            back.disabled = state.historyIndex <= 0;
        }
        if (forward) {
            forward.disabled = state.historyIndex < 0 || state.historyIndex >= state.history.length - 1;
        }
    }

    function pushHistory(path) {
        const normalized = normalizePath(path);
        if (state.historyIndex >= 0 && state.history[state.historyIndex] === normalized) {
            return;
        }
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(normalized);
        state.historyIndex = state.history.length - 1;
        updateNavButtons();
    }

    function renderSidebar() {
        const aside = document.getElementById('macFinderSidebar');
        if (!aside || !state.manifest) {
            return;
        }
        const root = state.manifest.root;
        const rootNode = state.manifest.folders[root];
        const folders = sortItems(rootNode && rootNode.items).filter((i) => i.type === 'folder');
        aside.innerHTML = '';
        const fav = document.createElement('section');
        fav.className = 'mac-finder__sidebar-group';
        const title = document.createElement('h2');
        title.className = 'mac-finder__sidebar-title';
        title.textContent = 'Favoris';
        fav.appendChild(title);
        const ul = document.createElement('ul');
        ul.className = 'mac-finder__sidebar-list';
        folders.forEach((item) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mac-finder__sidebar-btn';
            btn.textContent = item.name;
            if (normalizePath(item.path) === state.currentPath) {
                btn.classList.add('mac-finder__sidebar-btn--active');
            }
            btn.addEventListener('click', () => navigateTo(item.path));
            li.appendChild(btn);
            ul.appendChild(li);
        });
        fav.appendChild(ul);
        aside.appendChild(fav);
    }

    function renderContent() {
        const main = document.getElementById('macFinderContent');
        const status = document.getElementById('macFinderStatus');
        const pathEl = document.getElementById('macFinderPath');
        if (!main || !state.manifest) {
            return;
        }
        const path = normalizePath(state.currentPath);
        const node = state.manifest.folders[path];
        const items = sortItems(node && node.items);
        main.innerHTML = '';
        main.classList.toggle('mac-finder__content--list', state.viewMode === 'list');
        main.classList.toggle('mac-finder__content--icons', state.viewMode === 'icons');

        items.forEach((item) => {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'mac-finder__item';
            const icon = document.createElement('span');
            icon.className = 'mac-finder__item-icon';
            icon.textContent = item.type === 'folder' ? '📁' : '📄';
            const label = document.createElement('span');
            label.className = 'mac-finder__item-label';
            label.textContent = item.name;
            cell.appendChild(icon);
            cell.appendChild(label);
            if (item.type === 'folder' && item.path) {
                cell.addEventListener('click', () => navigateTo(item.path));
            } else if (item.type === 'file') {
                const href = item.href || `${path}/${item.name}`;
                cell.addEventListener('click', () => global.open(href, '_blank', 'noopener'));
            }
            main.appendChild(cell);
        });

        if (pathEl) {
            pathEl.textContent = pathLabel(path);
        }
        if (status) {
            status.textContent = `${items.length} élément(s)`;
        }
        renderSidebar();
    }

    function navigateTo(path, options = {}) {
        const { updateHistory = true } = options;
        const normalized = normalizePath(path);
        if (!state.manifest.folders[normalized]) {
            console.warn('Finder: chemin introuvable', normalized);
            return;
        }
        state.currentPath = normalized;
        if (updateHistory) {
            pushHistory(normalized);
        }
        renderContent();
    }

    function bindToolbar() {
        const back = document.getElementById('macFinderBack');
        const forward = document.getElementById('macFinderForward');
        const icons = document.getElementById('macFinderViewIcons');
        const list = document.getElementById('macFinderViewList');

        if (back) {
            back.addEventListener('click', () => {
                if (state.historyIndex > 0) {
                    state.historyIndex -= 1;
                    state.currentPath = state.history[state.historyIndex];
                    updateNavButtons();
                    renderContent();
                }
            });
        }
        if (forward) {
            forward.addEventListener('click', () => {
                if (state.historyIndex < state.history.length - 1) {
                    state.historyIndex += 1;
                    state.currentPath = state.history[state.historyIndex];
                    updateNavButtons();
                    renderContent();
                }
            });
        }
        if (icons && list) {
            icons.addEventListener('click', () => {
                state.viewMode = 'icons';
                icons.classList.add('mac-finder__toolbar-btn--active');
                icons.setAttribute('aria-pressed', 'true');
                list.classList.remove('mac-finder__toolbar-btn--active');
                list.setAttribute('aria-pressed', 'false');
                renderContent();
            });
            list.addEventListener('click', () => {
                state.viewMode = 'list';
                list.classList.add('mac-finder__toolbar-btn--active');
                list.setAttribute('aria-pressed', 'true');
                icons.classList.remove('mac-finder__toolbar-btn--active');
                icons.setAttribute('aria-pressed', 'false');
                renderContent();
            });
        }
    }

    async function boot() {
        const status = document.getElementById('macFinderStatus');
        try {
            await loadManifest();
            pushHistory(state.manifest.root);
            bindToolbar();
            renderContent();
        } catch (error) {
            console.error('CapsuleOS Finder:', error);
            if (status) {
                status.textContent = `Erreur : ${error.message}`;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
}(typeof window !== 'undefined' ? window : globalThis));
