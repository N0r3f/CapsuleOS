/**
 * Menu alimentation Cosmic — bouton tray (pas quick-settings Ubuntu).
 */
(function () {
    var menu = document.getElementById('cosmic-power-menu');
    var btnPower = document.getElementById('cosmic-tray-power-btn');

    if (!menu || !btnPower) return;

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

    function toggle() {
        if (isOpen()) close();
        else open();
    }

    btnPower.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.CosmicShellState) CosmicShellState.closeAll();
        toggle();
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
            close();
        });
    });
})();
