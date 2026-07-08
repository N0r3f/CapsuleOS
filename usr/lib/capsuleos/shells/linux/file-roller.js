/**
 * File Roller (Gestionnaire d'archives) — org.gnome.FileRoller sur Mint.
 */
(function initFileRollerAppModule(global) {
    'use strict';

    var DEMO_ARCHIVE = {
        name: 'demo.zip',
        path: '/',
        entries: [
            {
                name: 'demo.txt',
                size: '11 octets',
                type: 'Plain text document',
                modified: '04 juin 2026, 18:21'
            }
        ]
    };

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'file_roller') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function initFileRollerAppOnce() {
        var root = global.document.getElementById('fileRollerApp');
        if (!root || root.dataset.fileRollerInit === 'true') {
            return;
        }
        root.dataset.fileRollerInit = 'true';

        var titleEl = root.querySelector('#fr-app-title');
        var emptyEl = global.document.getElementById('fr-empty');
        var listWrap = global.document.getElementById('fr-list-wrap');
        var listBody = global.document.getElementById('fr-list-body');
        var navRow = global.document.getElementById('fr-nav-row');
        var searchRow = global.document.getElementById('fr-search-row');
        var searchInput = global.document.getElementById('fr-search-input');
        var pathText = global.document.getElementById('fr-path-text');
        var menuEl = global.document.getElementById('fr-menu');
        var statusEl = global.document.getElementById('fr-status');
        var extractBtn = root.querySelector('[data-fr-action="extract"]');
        var closeMenuBtn = root.querySelector('[data-fr-menu="close"]');
        var winEl = getWindowEl(root);

        if (!titleEl || !emptyEl || !listWrap || !listBody) {
            return;
        }

        var archive = null;
        var searchOpen = false;
        var menuOpen = false;

        function setStatus(msg) {
            if (statusEl) {
                statusEl.textContent = msg || '';
            }
        }

        function refreshWindowTitle() {
            var title = 'Gestionnaire d\'archives';
            if (archive && archive.name) {
                title = archive.name;
            }
            if (titleEl) {
                titleEl.textContent = title;
            }
            if (winEl) {
                var wmTitle = winEl.querySelector('#windowTitle');
                if (wmTitle) {
                    wmTitle.textContent = title;
                }
            }
        }

        function renderEntries(filterText) {
            listBody.innerHTML = '';
            if (!archive || !archive.entries || !archive.entries.length) {
                return;
            }
            var needle = filterText ? String(filterText).toLowerCase() : '';
            var i;
            for (i = 0; i < archive.entries.length; i++) {
                var entry = archive.entries[i];
                if (needle && entry.name.toLowerCase().indexOf(needle) === -1) {
                    continue;
                }
                var tr = global.document.createElement('tr');
                var tdName = global.document.createElement('td');
                var cell = global.document.createElement('div');
                cell.className = 'fr-app__file-cell';
                var icon = global.document.createElement('span');
                icon.className = 'fr-app__file-icon';
                icon.setAttribute('aria-hidden', 'true');
                var label = global.document.createElement('span');
                label.textContent = entry.name;
                cell.appendChild(icon);
                cell.appendChild(label);
                tdName.appendChild(cell);

                var tdSize = global.document.createElement('td');
                tdSize.textContent = entry.size;

                var tdType = global.document.createElement('td');
                tdType.textContent = entry.type;

                var tdMod = global.document.createElement('td');
                tdMod.textContent = entry.modified;

                tr.appendChild(tdName);
                tr.appendChild(tdSize);
                tr.appendChild(tdType);
                tr.appendChild(tdMod);
                listBody.appendChild(tr);
            }
        }

        function showEmptyState() {
            archive = null;
            emptyEl.hidden = false;
            emptyEl.setAttribute('aria-hidden', 'false');
            listWrap.hidden = true;
            if (navRow) {
                navRow.hidden = true;
            }
            if (extractBtn) {
                extractBtn.disabled = true;
            }
            if (closeMenuBtn) {
                closeMenuBtn.disabled = true;
            }
            if (pathText) {
                pathText.textContent = '/';
            }
            if (searchInput) {
                searchInput.value = '';
            }
            renderEntries('');
            refreshWindowTitle();
            setStatus('');
        }

        function openArchive(data) {
            if (!data || !data.name) {
                return;
            }
            archive = {
                name: data.name,
                path: data.path || '/',
                entries: data.entries ? data.entries.slice() : []
            };
            emptyEl.hidden = true;
            emptyEl.setAttribute('aria-hidden', 'true');
            listWrap.hidden = false;
            if (navRow) {
                navRow.hidden = false;
            }
            if (extractBtn) {
                extractBtn.disabled = false;
            }
            if (closeMenuBtn) {
                closeMenuBtn.disabled = false;
            }
            if (pathText) {
                pathText.textContent = archive.path;
            }
            renderEntries(searchInput ? searchInput.value : '');
            refreshWindowTitle();
            setStatus('Archive ouverte : ' + archive.name);
        }

        function closeMenu() {
            menuOpen = false;
            if (menuEl) {
                menuEl.hidden = true;
            }
            var menuBtn = root.querySelector('[data-fr-action="menu"]');
            if (menuBtn) {
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        }

        function toggleMenu() {
            menuOpen = !menuOpen;
            if (menuEl) {
                menuEl.hidden = !menuOpen;
            }
            var menuBtn = root.querySelector('[data-fr-action="menu"]');
            if (menuBtn) {
                menuBtn.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
            }
        }

        function toggleSearch() {
            searchOpen = !searchOpen;
            if (searchRow) {
                searchRow.hidden = !searchOpen;
            }
            var searchBtn = root.querySelector('[data-fr-action="search"]');
            if (searchBtn) {
                searchBtn.setAttribute('aria-pressed', searchOpen ? 'true' : 'false');
            }
            if (searchOpen && searchInput) {
                searchInput.focus();
            }
            if (!searchOpen && searchInput) {
                searchInput.value = '';
                renderEntries('');
            }
        }

        root.querySelectorAll('[data-fr-action]').forEach(function bindAction(btn) {
            btn.addEventListener('click', function onAction() {
                var action = btn.getAttribute('data-fr-action');
                if (action === 'extract') {
                    if (archive) {
                        setStatus('Extraction simulée vers ~/Téléchargements/');
                    }
                    return;
                }
                if (action === 'add') {
                    if (!archive) {
                        var name = global.prompt('Nom de la nouvelle archive :', 'archive.zip');
                        if (name) {
                            openArchive({ name: name, path: '/', entries: [] });
                        }
                        return;
                    }
                    var fileName = global.prompt('Ajouter un fichier à l\'archive :', 'nouveau.txt');
                    if (fileName) {
                        archive.entries.push({
                            name: fileName,
                            size: '0 octet',
                            type: 'Plain text document',
                            modified: '04 juin 2026, 18:21'
                        });
                        renderEntries(searchInput ? searchInput.value : '');
                        setStatus('Fichier ajouté : ' + fileName);
                    }
                    return;
                }
                if (action === 'search') {
                    toggleSearch();
                    return;
                }
                if (action === 'menu') {
                    toggleMenu();
                    return;
                }
                if (action === 'home' && archive) {
                    if (pathText) {
                        pathText.textContent = '/';
                    }
                    archive.path = '/';
                    setStatus('Racine de l\'archive');
                }
            });
        });

        if (menuEl) {
            menuEl.querySelectorAll('[data-fr-menu]').forEach(function bindMenu(item) {
                item.addEventListener('click', function onMenu() {
                    var cmd = item.getAttribute('data-fr-menu');
                    closeMenu();
                    if (cmd === 'new') {
                        var name = global.prompt('Nom de la nouvelle archive :', 'archive.zip');
                        if (name) {
                            openArchive({ name: name, path: '/', entries: [] });
                        }
                        return;
                    }
                    if (cmd === 'open' || cmd === 'open-demo') {
                        openArchive(DEMO_ARCHIVE);
                        return;
                    }
                    if (cmd === 'close') {
                        showEmptyState();
                        return;
                    }
                    if (cmd === 'about') {
                        global.alert('Gestionnaire d\'archives\nFile Roller 43.0\nSimulation CapsuleOS');
                    }
                });
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', function onSearch() {
                renderEntries(searchInput.value);
            });
        }

        global.document.addEventListener('click', function onDocClick(ev) {
            if (!menuOpen) {
                return;
            }
            if (menuEl && menuEl.contains(ev.target)) {
                return;
            }
            if (ev.target && ev.target.closest && ev.target.closest('[data-fr-action="menu"]')) {
                return;
            }
            closeMenu();
        });

        root.addEventListener('keydown', function onFrKeyboard(event) {
            if (event.ctrlKey && (event.key === 'f' || event.key === 'F')) {
                event.preventDefault();
                if (!searchOpen) {
                    toggleSearch();
                }
                if (searchInput) {
                    searchInput.focus();
                }
            }
            if (event.key === 'Escape') {
                if (menuOpen) {
                    closeMenu();
                } else if (searchOpen) {
                    toggleSearch();
                }
            }
        });

        showEmptyState();

        global.openFileRollerDemoArchive = function openFileRollerDemoArchive() {
            openArchive(DEMO_ARCHIVE);
        };

        global.openFileRollerNewArchive = function openFileRollerNewArchive(name) {
            openArchive({ name: name || 'archive.zip', path: '/', entries: [] });
        };
    }

    global.initFileRollerApp = function initFileRollerApp() {
        initFileRollerAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
