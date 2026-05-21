/**
 * Grille Applications — barre « Applications ».
 */
(function () {
    var panel = document.getElementById('cosmic-applications');
    var btnApps = document.getElementById('cosmic-btn-applications');
    var btnClose = document.getElementById('cosmic-applications-close');
    var dockGridBtn = document.getElementById('cosmic-dock-applications');

    if (!panel || !btnApps) return;

    function isOpen() {
        return !panel.hidden;
    }

    function open() {
        if (window.CosmicShellState) CosmicShellState.closeAll();
        panel.hidden = false;
        btnApps.setAttribute('aria-pressed', 'true');
        if (window.CosmicShellState) CosmicShellState.setOverlayOpen(true);
    }

    function close() {
        panel.hidden = true;
        btnApps.setAttribute('aria-pressed', 'false');
        if (window.CosmicShellState) CosmicShellState.setOverlayOpen(false);
    }

    function toggle() {
        if (isOpen()) close();
        else open();
    }

    btnApps.addEventListener('click', function (e) {
        e.stopPropagation();
        toggle();
    });

    if (btnClose) btnClose.addEventListener('click', close);

    if (dockGridBtn) {
        dockGridBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toggle();
        });
    }

    panel.querySelectorAll('[data-cosmic-app-link]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var link = btn.getAttribute('data-cosmic-app-link');
            close();
            var dockLink = document.querySelector('.cosmic-dock__item[data-link="' + link + '"]');
            if (dockLink) dockLink.click();
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) close();
    });
})();
