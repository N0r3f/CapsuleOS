/**
 * État overlays shell Cosmic - mutual exclusion launcher / apps / workspaces rail.
 */
(function (global) {
    var body = document.body;
    var BUILD_REV = '20260622';

    function purgeStaleBackdrop() {
        var stale = document.getElementById('cosmic-backdrop');
        if (stale && stale.parentNode) {
            stale.parentNode.removeChild(stale);
        }
        if (body) {
            body.classList.remove('cosmic-overlay-open');
        }
    }

    function closeAppsAndRail() {
        var apps = document.getElementById('cosmic-applications');
        var rail = document.getElementById('cosmic-workspaces-rail');
        var power = document.getElementById('cosmic-power-menu');
        if (apps) {
            apps.hidden = true;
        }
        if (rail) {
            rail.hidden = true;
        }
        if (power) {
            power.hidden = true;
        }
        var btnPower = document.getElementById('cosmic-tray-power-btn');
        if (btnPower) {
            btnPower.setAttribute('aria-expanded', 'false');
        }
        if (body) {
            body.classList.remove('cosmic-workspaces-open', 'cosmic-apps-open');
        }
        document.querySelectorAll('[data-cosmic-nav]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', 'false');
        });
        var dockApps = document.getElementById('cosmic-dock-applications');
        if (dockApps) {
            dockApps.setAttribute('aria-pressed', 'false');
        }
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
        if (body) {
            body.classList.remove(
                'cosmic-workspaces-open',
                'cosmic-launcher-open',
                'cosmic-apps-open',
                'cosmic-overlay-open'
            );
        }
        document.querySelectorAll('[data-cosmic-nav]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', 'false');
        });
        var dockLauncher = document.getElementById('cosmic-dock-launcher');
        if (dockLauncher) dockLauncher.setAttribute('aria-pressed', 'false');
        var dockApps = document.getElementById('cosmic-dock-applications');
        if (dockApps) dockApps.setAttribute('aria-pressed', 'false');
    }

    purgeStaleBackdrop();
    if (body && body.id === 'popos') {
        body.setAttribute('data-capsule-rev', BUILD_REV);
    }

    global.CosmicShellState = {
        closeAppsAndRail: closeAppsAndRail,
        closeAll: closeAll,
        purgeStaleBackdrop: purgeStaleBackdrop
    };
})(typeof window !== 'undefined' ? window : this);
