/**
 * Caractères GNOME — simulation org.gnome.Characters (grille récents + détail).
 */
(function initGnomeCharactersApp(global) {
    'use strict';

    var CHARS = [
        { glyph: 'é', name: 'e accent aigu', code: 'U+00E9' },
        { glyph: 'à', name: 'a accent grave', code: 'U+00E0' },
        { glyph: 'ç', name: 'c cédille', code: 'U+00E7' },
        { glyph: 'ù', name: 'u accent grave', code: 'U+00F9' },
        { glyph: 'ô', name: 'o accent circonflexe', code: 'U+00F4' },
        { glyph: '€', name: 'symbole euro', code: 'U+20AC' },
        { glyph: '©', name: 'symbole copyright', code: 'U+00A9' },
        { glyph: '→', name: 'flèche vers la droite', code: 'U+2192' },
        { glyph: '½', name: 'un demi', code: 'U+00BD' },
        { glyph: '…', name: 'points de suspension', code: 'U+2026' },
        { glyph: '°', name: 'symbole degré', code: 'U+00B0' },
        { glyph: '±', name: 'plus ou moins', code: 'U+00B1' },
        { glyph: '«', name: 'guillemet français ouvrant', code: 'U+00AB' },
        { glyph: '»', name: 'guillemet français fermant', code: 'U+00BB' },
        { glyph: '—', name: 'tiret cadratin', code: 'U+2014' },
        { glyph: '§', name: 'paragraphe', code: 'U+00A7' }
    ];

    var selectedIndex = 0;
    var searchQuery = '';

    function normalizeQuery(text) {
        return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function matchesQuery(entry, query) {
        if (!query) {
            return true;
        }
        var haystack = normalizeQuery(entry.glyph + ' ' + entry.name + ' ' + entry.code);
        return haystack.indexOf(query) !== -1;
    }

    function getVisibleChars() {
        var query = normalizeQuery(searchQuery);
        return CHARS.filter(function (entry) {
            return matchesQuery(entry, query);
        });
    }

    function findCharIndex(entry) {
        for (var i = 0; i < CHARS.length; i += 1) {
            if (CHARS[i].glyph === entry.glyph && CHARS[i].code === entry.code) {
                return i;
            }
        }
        return -1;
    }

    function syncCharactersDataset(root) {
        if (!root) {
            return;
        }
        var entry = CHARS[selectedIndex];
        root.dataset.charactersInit = 'true';
        root.dataset.charactersSelected = entry ? entry.glyph : '';
        root.dataset.charactersSearchQuery = searchQuery;
        root.dataset.charactersCopyEnabled = entry ? 'true' : 'false';
    }

    function updatePreview(root, entry) {
        var glyph = root.querySelector('#gnome-characters-glyph');
        var name = root.querySelector('#gnome-characters-name');
        var code = root.querySelector('#gnome-characters-code');
        if (!glyph || !name || !code || !entry) {
            return;
        }
        glyph.textContent = entry.glyph;
        name.textContent = entry.name;
        code.textContent = entry.code;
        var copyBtn = root.querySelector('[data-characters-gnome-action="copy"]');
        if (copyBtn) {
            copyBtn.disabled = !entry;
        }
        syncCharactersDataset(root);
    }

    function renderGrid(root) {
        var grid = root.querySelector('#gnome-characters-grid');
        var empty = root.querySelector('#gnome-characters-empty');
        if (!grid) {
            return;
        }
        var visible = getVisibleChars();
        grid.innerHTML = '';
        if (empty) {
            empty.hidden = visible.length > 0;
        }
        visible.forEach(function (entry) {
            var index = findCharIndex(entry);
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gnome-characters__cell';
            if (index === selectedIndex) {
                btn.classList.add('gnome-characters__cell--active');
            }
            btn.setAttribute('role', 'listitem');
            btn.setAttribute('data-characters-gnome-glyph', entry.glyph);
            btn.setAttribute('aria-label', entry.name);
            btn.setAttribute('aria-pressed', index === selectedIndex ? 'true' : 'false');
            btn.textContent = entry.glyph;
            btn.addEventListener('click', function () {
                selectChar(root, index);
            });
            grid.appendChild(btn);
        });
    }

    function selectChar(root, index) {
        if (index < 0 || index >= CHARS.length) {
            return;
        }
        selectedIndex = index;
        updatePreview(root, CHARS[index]);
        renderGrid(root);
    }

    function bindCopy(root) {
        var copyBtn = root.querySelector('[data-characters-gnome-action="copy"]');
        if (!copyBtn) {
            return;
        }
        copyBtn.addEventListener('click', function () {
            var entry = CHARS[selectedIndex];
            if (!entry) {
                return;
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(entry.glyph).catch(function () {});
            }
            root.dataset.charactersCopied = entry.glyph;
        });
    }

    function bindSearch(root) {
        var search = root.querySelector('#gnome-characters-search');
        if (!search) {
            return;
        }
        search.addEventListener('input', function () {
            searchQuery = search.value.trim();
            var visible = getVisibleChars();
            if (visible.length && findCharIndex(visible[0]) !== selectedIndex) {
                var firstIndex = findCharIndex(visible[0]);
                if (firstIndex !== -1) {
                    selectedIndex = firstIndex;
                    updatePreview(root, CHARS[firstIndex]);
                }
            }
            renderGrid(root);
            syncCharactersDataset(root);
        });
    }

    function initCharactersApp() {
        var root = document.getElementById('gnomeCharactersApp');
        if (!root || root.dataset.charactersReady === '1') {
            return;
        }
        root.dataset.charactersReady = '1';
        selectedIndex = 0;
        searchQuery = '';
        var search = root.querySelector('#gnome-characters-search');
        if (search) {
            search.value = '';
        }
        updatePreview(root, CHARS[selectedIndex]);
        bindSearch(root);
        bindCopy(root);
        renderGrid(root);
        syncCharactersDataset(root);
    }

    global.initCharactersApp = initCharactersApp;
}(typeof window !== 'undefined' ? window : this));
