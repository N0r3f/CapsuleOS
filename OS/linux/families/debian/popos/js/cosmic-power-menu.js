/**
 * Menu alimentation Cosmic - bouton tray (pas quick-settings Ubuntu).
 */
(function () {
    var menu = document.getElementById('cosmic-power-menu');
    var btnPower = document.getElementById('cosmic-tray-power-btn');

    if (!menu || !btnPower) return;

    var EXIT_ACTIONS = {
        logout: true,
        suspend: true,
        restart: true,
        poweroff: true
    };

    function returnToPickHome() {
        if (window.CapsulePickReturn) {
            window.CapsulePickReturn.redirectToPickHome('linux');
            return;
        }
        var home = (typeof window !== 'undefined' && window.CAPSULE_SITE_HOME)
            ? String(window.CAPSULE_SITE_HOME)
            : '../../../../../index.html';
        window.location.href = home.split('#')[0].split('?')[0] + '?pick=linux#choisir-os';
    }

    function isOpen() {
        return !menu.hidden;
    }

    function open() {
        menu.hidden = false;
        btnPower.setAttribute('aria-expanded', 'true');
    }

    function close() {
        menu.hidden = true;
        btnPower.setAttribute('aria-expanded', 'false');
    }

    btnPower.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isOpen()) {
            close();
            return;
        }
        if (window.CosmicShellState) CosmicShellState.closeAll();
        open();
    });

    document.addEventListener('click', function (e) {
        if (!isOpen()) return;
        if (menu.contains(e.target) || btnPower.contains(e.target)) return;
        close();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) close();
    });

    menu.querySelectorAll('[data-power-action]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var action = btn.getAttribute('data-power-action');
            close();
            if (EXIT_ACTIONS[action]) {
                returnToPickHome();
            }
        });
    });
})();
