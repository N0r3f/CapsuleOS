/**
 * État overlays shell Cosmic — mutual exclusion launcher / apps / workspaces rail.
 */
(function (global) {
    var body = document.body;

    function backdrop() {
        return document.getElementById('cosmic-backdrop');
    }

    function setOverlayOpen(open) {
        if (!body || body.id !== 'popos') return;
        body.classList.toggle('cosmic-overlay-open', !!open);
        var el = backdrop();
        if (el) el.hidden = !open;
    }

    function closeAll() {
        var launcher = document.getElementById('cosmic-launcher');
        var apps = document.getElementById('cosmic-applications');
        var rail = document.getElementById('cosmic-workspaces-rail');
        var power = document.getElementById('cosmic-power-menu');
        if (launcher) launcher.hidden = true;
        if (apps) apps.hidden = true;
        if (rail) rail.hidden = true;
        if (power) power.hidden = true;
        var btnPower = document.getElementById('cosmic-tray-power-btn');
        if (btnPower) btnPower.setAttribute('aria-expanded', 'false');
        if (body) body.classList.remove('cosmic-workspaces-open');
        document.querySelectorAll('[data-cosmic-nav]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', 'false');
        });
        var dockLauncher = document.getElementById('cosmic-dock-launcher');
        if (dockLauncher) dockLauncher.setAttribute('aria-pressed', 'false');
        setOverlayOpen(false);
    }

    global.CosmicShellState = {
        setOverlayOpen: setOverlayOpen,
        closeAll: closeAll
    };
})(typeof window !== 'undefined' ? window : this);
