/**
 * Explorateur Windows — arborescence depuis home/public (.capsule-manifest.json).
 * Page : OS/windows/shared/pages/explorateur.html (profondeur auto via CapsuleUserHome).
 */
(function initWinExplorerContent(global) {
    'use strict';

    const MANIFEST_NAME = '.capsule-manifest.json';

    function contentRoot() {
        if (global.CAPSULE_WIN_CONTENT_ROOT) {
            return String(global.CAPSULE_WIN_CONTENT_ROOT).replace(/\/+$/, '');
        }
        if (global.CapsuleUserHome) {
            return global.CapsuleUserHome.resolveRelative();
        }
        return '../../../../home/public';
    }

    function manifestUrl() {
        return `${contentRoot()}/${MANIFEST_NAME}`;
    }

    function normalizePath(p) {
        const root = contentRoot();
        if (!p || typeof p !== 'string') {
            return root;
        }
        return p.replace(/\/+$/, '') || root;
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
            throw new Error(`Manifeste introuvable (${response.status}) : ${url}`);
        }
        return remapManifest(await response.json());
    }

    function fileIcon(item) {
        return item.type === 'folder' ? '📁' : '📄';
    }

    function renderModernList(manifest, folderPath) {
        const list = document.querySelector('.win-page--modern .win-page__list');
        if (!list) {
            return;
        }
        const node = manifest.folders[folderPath];
        const items = sortItems(node && node.items);
        list.innerHTML = '';
        items.forEach((item) => {
            const li = document.createElement('li');
            if (item.type === 'folder' && item.path) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'win-explorer__entry';
                btn.textContent = `${fileIcon(item)} ${item.name}`;
                btn.addEventListener('click', () => {
                    renderModernList(manifest, normalizePath(item.path));
                });
                li.appendChild(btn);
            } else if (item.type === 'file') {
                const href = item.href || `${folderPath}/${item.name}`;
                const a = document.createElement('a');
                a.href = href;
                a.target = '_blank';
                a.rel = 'noopener';
                a.textContent = `${fileIcon(item)} ${item.name}`;
                li.appendChild(a);
            } else {
                li.textContent = `${fileIcon(item)} ${item.name}`;
            }
            list.appendChild(li);
        });
        const header = document.querySelector('.win-page--modern .win-page__header h1');
        if (header) {
            const label = node && node.label ? node.label : 'Ce PC';
            header.textContent = folderPath === manifest.root ? 'Ce PC' : label;
        }
    }

    function renderClassicList(manifest, folderPath) {
        const rows = document.querySelector('.win95-list-rows');
        if (!rows) {
            return;
        }
        const node = manifest.folders[folderPath];
        const items = sortItems(node && node.items);
        rows.innerHTML = '';
        items.forEach((item) => {
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            const sizeSpan = document.createElement('span');
            const typeSpan = document.createElement('span');
            nameSpan.textContent = item.name;
            sizeSpan.textContent = item.type === 'folder' ? '—' : '—';
            typeSpan.textContent = item.type === 'folder' ? 'Dossier' : (item.extension || 'Fichier');
            li.appendChild(nameSpan);
            li.appendChild(sizeSpan);
            li.appendChild(typeSpan);
            if (item.type === 'folder' && item.path) {
                li.tabIndex = 0;
                li.style.cursor = 'pointer';
                li.addEventListener('dblclick', () => {
                    renderClassicList(manifest, normalizePath(item.path));
                });
            } else if (item.type === 'file') {
                const href = item.href || `${folderPath}/${item.name}`;
                li.tabIndex = 0;
                li.style.cursor = 'pointer';
                li.addEventListener('dblclick', () => {
                    global.open(href, '_blank', 'noopener');
                });
            }
            rows.appendChild(li);
        });
        const status = document.querySelector('.win95-statusbar__section');
        if (status) {
            status.textContent = `${items.length} objet(s)`;
        }
    }

    function renderTreeSidebar(manifest) {
        const tree = document.querySelector('.win95-pane--tree');
        if (!tree || !manifest.folders[manifest.root]) {
            return;
        }
        const rootItems = sortItems(manifest.folders[manifest.root].items).filter((i) => i.type === 'folder');
        const lines = ['<span class="win95-tree-item is-selected">▾ Dossier personnel</span>'];
        rootItems.forEach((item) => {
            lines.push(`<span class="win95-tree-item" data-path="${item.path}">　▸ ${item.name}</span>`);
        });
        tree.innerHTML = lines.join('\n');
        tree.querySelectorAll('[data-path]').forEach((el) => {
            el.addEventListener('click', () => {
                tree.querySelectorAll('.win95-tree-item').forEach((n) => n.classList.remove('is-selected'));
                el.classList.add('is-selected');
                renderClassicList(manifest, normalizePath(el.getAttribute('data-path')));
            });
        });
    }

    async function boot() {
        const hint = document.querySelector('.win-page__hint');
        try {
            const manifest = await loadManifest();
            const root = normalizePath(manifest.root);
            renderModernList(manifest, root);
            renderClassicList(manifest, root);
            renderTreeSidebar(manifest);
            if (hint) {
                hint.textContent = 'Contenu partagé CapsuleOS (home/public) — double-cliquez un dossier pour naviguer.';
            }
        } catch (error) {
            console.error('CapsuleOS win-explorer:', error);
            if (hint) {
                hint.textContent = `Impossible de charger le contenu (${error.message}). Vérifiez home/public/.capsule-manifest.json.`;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
}(typeof window !== 'undefined' ? window : globalThis));
