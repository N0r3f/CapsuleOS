/**
 * Catalogue apps Pop!_OS - lu depuis #cosmic-applications-grid (icônes overview/).
 */
(function (global) {
    var entries = [];
    var ready = false;

    var TAGLINES = {
        firefox: 'Naviguer sur le Web',
        nemo: 'Parcourir les fichiers',
        terminal: 'Terminal',
        profile: 'Paramètres système',
        themes: 'Applications et mises à jour',
        checklist: 'Éditer des documents',
        lecteur_multimedia: 'Lire des médias'
    };

    function categoryPrefix(cats) {
        var list = (cats || '').split(/\s+/);
        if (list.indexOf('system') !== -1) return 'Système';
        if (list.indexOf('office') !== -1) return 'Bureau';
        if (list.indexOf('utilities') !== -1) return 'Utilitaires';
        return 'Accueil';
    }

    function displayTitle(btn) {
        var span = btn.querySelector('span');
        if (span && span.textContent.trim()) {
            return span.textContent.trim().replace(/\s+COSMIC$/i, '');
        }
        var label = btn.getAttribute('aria-label') || '';
        return label.replace(/\s+COSMIC$/i, '').trim();
    }

    function buildSubtitle(link, cats) {
        var prefix = categoryPrefix(cats);
        var tag = TAGLINES[link];
        if (tag) {
            return prefix + ' - ' + tag;
        }
        return prefix;
    }

    function readFromGrid() {
        var grid = document.getElementById('cosmic-applications-grid');
        if (!grid) {
            return [];
        }
        var list = [];
        grid.querySelectorAll('[data-cosmic-app-link]').forEach(function (btn) {
            if (btn.getAttribute('aria-disabled') === 'true') {
                return;
            }
            if (btn.classList.contains('cosmic-applications__app--static')) {
                return;
            }
            var link = btn.getAttribute('data-cosmic-app-link');
            if (!link) {
                return;
            }
            var img = btn.querySelector('img');
            list.push({
                link: link,
                label: displayTitle(btn),
                subtitle: buildSubtitle(link, btn.getAttribute('data-cosmic-category')),
                iconSrc: img ? img.getAttribute('src') : '',
                searchText: (
                    displayTitle(btn) + ' ' +
                    (btn.getAttribute('aria-label') || '') + ' ' +
                    (btn.getAttribute('data-cosmic-category') || '')
                ).toLowerCase()
            });
        });
        return list;
    }

    function init() {
        entries = readFromGrid();
        ready = true;
    }

    function filter(query) {
        if (!ready) {
            init();
        }
        var q = (query || '').trim().toLowerCase();
        if (!q) {
            return [];
        }
        return entries.filter(function (item) {
            return item.searchText.indexOf(q) !== -1 || item.label.toLowerCase().indexOf(q) !== -1;
        });
    }

    function refresh() {
        entries = readFromGrid();
        ready = true;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    global.CosmicAppsCatalog = {
        filter: filter,
        refresh: refresh,
        getAll: function () {
            if (!ready) init();
            return entries.slice();
        }
    };
})(typeof window !== 'undefined' ? window : this);
