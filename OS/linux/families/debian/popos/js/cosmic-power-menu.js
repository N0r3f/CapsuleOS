/**
 * Menu alimentation Cosmic - bouton tray (pas quick-settings Ubuntu).
 */
(function () {
    var menu = document.getElementById('cosmic-power-menu');
    var btnPower = document.getElementById('cosmic-tray-power-btn');

    if (!menu || !btnPower) return;

    function getSiteHomeHref() {
        if (typeof window !== 'undefined' && window.CAPSULE_SITE_HOME) {
            return String(window.CAPSULE_SITE_HOME);
        }
        return '../../../../../index.html';
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
            if (action === 'poweroff') {
                window.location.href = getSiteHomeHref();
            }
        });
    });
})();
