/**
 * Grille Applications — Apps.png (barre « Applications », fenêtre flottante).
 */
(function () {
    var panel = document.getElementById('cosmic-applications');
    var btnApps = document.getElementById('cosmic-btn-applications');
    var dockGridBtn = document.getElementById('cosmic-dock-applications');
    var searchInput = document.getElementById('cosmic-applications-search');
    var grid = document.getElementById('cosmic-applications-grid');
    var backdrop = document.getElementById('cosmic-backdrop');
    var categoryButtons = panel
        ? panel.querySelectorAll('.cosmic-applications__category[data-apps-category]')
        : [];

    if (!panel || !btnApps) return;

    var activeCategory = 'home';

    function isOpen() {
        return !panel.hidden;
    }

    function setDockGridPressed(pressed) {
        if (dockGridBtn) dockGridBtn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    }

    function setActiveCategory(cat) {
        activeCategory = cat || 'home';
        categoryButtons.forEach(function (btn) {
            var id = btn.getAttribute('data-apps-category');
            var on = id === activeCategory;
            btn.classList.toggle('cosmic-applications__category--active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyFilters();
    }

    function appMatchesCategory(btn, cat) {
        if (cat === 'home' || cat === 'add') return true;
        var cats = (btn.getAttribute('data-cosmic-category') || '').split(/\s+/);
        return cats.indexOf(cat) !== -1;
    }

    function applyFilters() {
        if (!grid) return;
        var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        grid.querySelectorAll('.cosmic-applications__app').forEach(function (btn) {
            var label = (btn.getAttribute('aria-label') || btn.textContent || '').toLowerCase();
            var matchSearch = !q || label.indexOf(q) !== -1;
            var matchCat = appMatchesCategory(btn, activeCategory);
            btn.hidden = !(matchSearch && matchCat);
        });
    }

    function resetFilters() {
        activeCategory = 'home';
        if (searchInput) searchInput.value = '';
        setActiveCategory('home');
    }

    function open() {
        if (window.CosmicShellState) CosmicShellState.closeAll();
        panel.hidden = false;
        btnApps.setAttribute('aria-pressed', 'true');
        setDockGridPressed(true);
        if (window.CosmicShellState) CosmicShellState.setOverlayOpen(true);
        if (searchInput) searchInput.focus();
    }

    function close() {
        panel.hidden = true;
        btnApps.setAttribute('aria-pressed', 'false');
        setDockGridPressed(false);
        if (window.CosmicShellState) CosmicShellState.setOverlayOpen(false);
        resetFilters();
    }

    function toggle() {
        if (isOpen()) close();
        else open();
    }

    function launchApp(link) {
        if (!link) return;
        var target = document.querySelector('.windowElement[data-link="' + link + '"]');
        if (target && typeof window.openWindowByDataLink === 'function') {
            window.openWindowByDataLink(link);
            return;
        }
        if (target && typeof window.openWindow === 'function') {
            window.openWindow(link);
            return;
        }
        var dockLink = document.querySelector('.cosmic-dock__item[data-link="' + link + '"]');
        if (dockLink) dockLink.click();
    }

    btnApps.addEventListener('click', function (e) {
        e.stopPropagation();
        toggle();
    });

    if (dockGridBtn) {
        dockGridBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toggle();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', function () {
            if (isOpen()) close();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    categoryButtons.forEach(function (btn) {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        btn.addEventListener('click', function () {
            var cat = btn.getAttribute('data-apps-category');
            if (!cat || cat === 'add') return;
            setActiveCategory(cat);
        });
    });

    panel.querySelectorAll('[data-cosmic-app-link]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var link = btn.getAttribute('data-cosmic-app-link');
            close();
            launchApp(link);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) close();
    });
})();
