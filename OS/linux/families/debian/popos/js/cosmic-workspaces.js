/**
 * Rail workspaces + bouton barre « Workspaces » (workspace.png - sans blur bureau).
 */
(function () {
    var btnWorkspaces = document.getElementById('cosmic-btn-workspaces');
    var dockWorkspaces = document.getElementById('cosmic-dock-workspaces');
    var rail = document.getElementById('cosmic-workspaces-rail');

    if (!btnWorkspaces || !rail) return;

    function isOpen() {
        return !rail.hidden;
    }

    function open() {
        if (window.CosmicShellState) CosmicShellState.closeAll();
        rail.hidden = false;
        btnWorkspaces.setAttribute('aria-pressed', 'true');
        document.body.classList.add('cosmic-workspaces-open');
    }

    function close() {
        rail.hidden = true;
        btnWorkspaces.setAttribute('aria-pressed', 'false');
        document.body.classList.remove('cosmic-workspaces-open');
    }

    btnWorkspaces.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isOpen()) {
            close();
            return;
        }
        open();
    });

    rail.querySelectorAll('[data-workspace-select]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            rail.querySelectorAll('.cosmic-workspaces-rail__workspace').forEach(function (item) {
                item.classList.remove('cosmic-workspaces-rail__workspace--active');
            });
            btn.classList.add('cosmic-workspaces-rail__workspace--active');
        });
    });

    document.addEventListener('click', function (e) {
        if (!isOpen()) return;
        if (rail.contains(e.target)) return;
        if (btnWorkspaces.contains(e.target)) return;
        if (dockWorkspaces && dockWorkspaces.contains(e.target)) return;
        close();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) close();
    });
})();
