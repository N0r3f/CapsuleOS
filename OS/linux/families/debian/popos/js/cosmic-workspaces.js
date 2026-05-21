/**
 * Rail workspaces + bouton barre « Workspaces ».
 */
(function () {
    var btnWorkspaces = document.getElementById('cosmic-btn-workspaces');
    var rail = document.getElementById('cosmic-workspaces-rail');
    var backdrop = document.getElementById('cosmic-backdrop');

    if (!btnWorkspaces || !rail) return;

    function isOpen() {
        return !rail.hidden;
    }

    function open() {
        if (window.CosmicShellState) CosmicShellState.closeAll();
        rail.hidden = false;
        btnWorkspaces.setAttribute('aria-pressed', 'true');
        if (window.CosmicShellState) CosmicShellState.setOverlayOpen(true);
    }

    function close() {
        rail.hidden = true;
        btnWorkspaces.setAttribute('aria-pressed', 'false');
        if (window.CosmicShellState) CosmicShellState.setOverlayOpen(false);
    }

    function toggle() {
        if (isOpen()) close();
        else open();
    }

    btnWorkspaces.addEventListener('click', function (e) {
        e.stopPropagation();
        toggle();
    });

    rail.querySelectorAll('[data-workspace-select]').forEach(function (card) {
        card.addEventListener('click', function () {
            rail.querySelectorAll('[data-workspace-select]').forEach(function (c) {
                c.classList.remove('cosmic-workspaces-rail__card--active');
            });
            card.classList.add('cosmic-workspaces-rail__card--active');
            close();
        });
    });

    if (backdrop) {
        backdrop.addEventListener('click', function () {
            if (window.CosmicShellState) CosmicShellState.closeAll();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) {
            close();
        }
    });
})();
