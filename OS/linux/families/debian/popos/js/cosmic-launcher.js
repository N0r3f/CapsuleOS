/**
 * Launcher Cosmic - barre recherche + liste (launcher.png / launcher_search.png).
 */
(function () {
    var launcher = document.getElementById('cosmic-launcher');
    var dockBtn = document.getElementById('cosmic-dock-launcher');
    var searchInput = document.getElementById('cosmic-launcher-search');
    var resultsPanel = document.getElementById('cosmic-launcher-results');
    var listEl = document.getElementById('cosmic-launcher-list');
    var rowTpl = document.getElementById('cosmic-launcher-row-tpl');

    if (!launcher || !searchInput || !resultsPanel || !listEl || !rowTpl) {
        return;
    }

    var selectedIndex = -1;
    var visibleItems = [];

    function isOpen() {
        return !launcher.hidden;
    }

    function setResultsExpanded(expanded) {
        searchInput.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    function clearSelection() {
        selectedIndex = -1;
        listEl.querySelectorAll('.cosmic-launcher__row').forEach(function (row) {
            row.classList.remove('cosmic-launcher__row--selected');
        });
    }

    function selectIndex(index) {
        clearSelection();
        var rows = listEl.querySelectorAll('.cosmic-launcher__row');
        if (index < 0 || index >= rows.length) {
            return;
        }
        selectedIndex = index;
        rows[index].classList.add('cosmic-launcher__row--selected');
        rows[index].scrollIntoView({ block: 'nearest' });
    }

    function launchAt(index) {
        if (index < 0 || index >= visibleItems.length) {
            return;
        }
        var link = visibleItems[index].link;
        close();
        if (window.CosmicAppLaunch) {
            CosmicAppLaunch.open(link);
        }
    }

    function renderResults(query) {
        var q = (query || '').trim();
        listEl.innerHTML = '';
        visibleItems = [];

        if (!q) {
            resultsPanel.hidden = true;
            setResultsExpanded(false);
            clearSelection();
            return;
        }

        if (window.CosmicAppsCatalog) {
            visibleItems = CosmicAppsCatalog.filter(q);
        }

        visibleItems.forEach(function (item, index) {
            var node = rowTpl.content.cloneNode(true);
            var row = node.querySelector('.cosmic-launcher__row');
            var btn = node.querySelector('.cosmic-launcher__row-btn');
            var icon = node.querySelector('.cosmic-launcher__app-icon');
            var title = node.querySelector('.cosmic-launcher__title');
            var subtitle = node.querySelector('.cosmic-launcher__subtitle');
            var shortcut = node.querySelector('.cosmic-launcher__shortcut');

            if (icon && item.iconSrc) {
                icon.src = item.iconSrc;
                icon.alt = '';
            }
            if (title) title.textContent = item.label;
            if (subtitle) subtitle.textContent = item.subtitle;
            if (shortcut) shortcut.textContent = 'Ctrl + ' + (index + 1);

            btn.addEventListener('click', function () {
                launchAt(index);
            });

            listEl.appendChild(node);
        });

        resultsPanel.hidden = visibleItems.length === 0;
        setResultsExpanded(visibleItems.length > 0);
        if (visibleItems.length > 0) {
            selectIndex(0);
        } else {
            clearSelection();
        }
    }

    function open() {
        if (window.CosmicShellState && CosmicShellState.closeAppsAndRail) {
            CosmicShellState.closeAppsAndRail();
        }
        if (window.CosmicAppsCatalog) {
            CosmicAppsCatalog.refresh();
        }
        launcher.hidden = false;
        document.body.classList.add('cosmic-launcher-open');
        if (dockBtn) {
            dockBtn.setAttribute('aria-pressed', 'true');
        }
        searchInput.value = '';
        renderResults('');
        searchInput.focus();
    }

    function close() {
        launcher.hidden = true;
        document.body.classList.remove('cosmic-launcher-open');
        if (dockBtn) {
            dockBtn.setAttribute('aria-pressed', 'false');
        }
        searchInput.value = '';
        renderResults('');
    }

    function toggle() {
        if (isOpen()) {
            close();
        } else {
            open();
        }
    }

    if (dockBtn) {
        dockBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggle();
        });
    }

    document.addEventListener('click', function (e) {
        if (!isOpen()) {
            return;
        }
        if (launcher.contains(e.target)) {
            return;
        }
        if (dockBtn && dockBtn.contains(e.target)) {
            return;
        }
        close();
    });

    searchInput.addEventListener('input', function () {
        renderResults(searchInput.value);
    });

    searchInput.addEventListener('keydown', function (e) {
        if (!isOpen()) {
            return;
        }
        if (e.key === 'Escape') {
            close();
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0) {
                launchAt(selectedIndex);
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (visibleItems.length) {
                selectIndex(Math.min(selectedIndex + 1, visibleItems.length - 1));
            }
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (visibleItems.length) {
                selectIndex(Math.max(selectedIndex - 1, 0));
            }
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) {
            close();
        }
    });
})();
