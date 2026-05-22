/**
 * Overlay lanceur Cosmic — dock + recherche.
 */
(function () {
    var launcher = document.getElementById('cosmic-launcher');
    var dockBtn = document.getElementById('cosmic-dock-launcher');
    var topBtn = document.getElementById('cosmic-btn-applications');
    var searchInput = document.getElementById('cosmic-launcher-search');
    var grid = launcher && launcher.querySelector('.cosmic-launcher__grid');

    if (!launcher) return;

    function isOpen() {
        return !launcher.hidden;
    }

    function open() {
        if (window.CosmicShellState) CosmicShellState.closeAll();
        launcher.hidden = false;
        if (dockBtn) dockBtn.setAttribute('aria-pressed', 'true');
        if (window.CosmicShellState) CosmicShellState.setOverlayOpen(true);
        if (searchInput) searchInput.focus();
    }

    function close() {
        launcher.hidden = true;
        if (dockBtn) dockBtn.setAttribute('aria-pressed', 'false');
        if (window.CosmicShellState) CosmicShellState.setOverlayOpen(false);
    }

    function toggle() {
        if (isOpen()) close();
        else open();
    }

    if (dockBtn) {
        dockBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toggle();
        });
    }

    if (searchInput && grid) {
        searchInput.addEventListener('input', function () {
            var q = searchInput.value.trim().toLowerCase();
            grid.querySelectorAll('.cosmic-launcher__app').forEach(function (btn) {
                var label = (btn.getAttribute('aria-label') || btn.textContent || '').toLowerCase();
                btn.hidden = q.length > 0 && label.indexOf(q) === -1;
            });
        });
    }

    launcher.querySelectorAll('[data-cosmic-app-link]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var link = btn.getAttribute('data-cosmic-app-link');
            if (!link) return;
            close();
            var target = document.querySelector('.windowElement[data-link="' + link + '"]');
            if (target && typeof window.openWindow === 'function') {
                window.openWindow(link);
            } else if (target) {
                var dockLink = document.querySelector('.cosmic-dock__item[data-link="' + link + '"]');
                if (dockLink) dockLink.click();
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) close();
    });
})();
