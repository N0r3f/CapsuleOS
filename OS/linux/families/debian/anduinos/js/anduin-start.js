/**
 * AnduinOS — bouton Menu Démarrer (taskbar).
 */
(function bindAnduinStartButton() {
    if (!document.body || document.body.id !== 'anduinos') {
        return;
    }

    const startBtn = document.getElementById('anduin-start-btn');
    const menuEl = document.querySelector('div[data-link="mainMenu"]');

    if (!startBtn || !menuEl) {
        return;
    }

    const isMenuOpen = () => menuEl.style.display !== 'none';

    const syncStartButton = () => {
        const open = isMenuOpen();
        startBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        startBtn.classList.toggle('active-link', open);
    };

    startBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (isMenuOpen()) {
            menuEl.style.display = 'none';
            menuEl.classList.remove('windowElementActive');
            syncStartButton();
            return;
        }

        if (typeof openWindowByDataLink === 'function') {
            openWindowByDataLink('mainMenu');
        } else if (typeof handleOpenwindow === 'function') {
            handleOpenwindow({ dataset: { link: 'mainMenu' } });
        }

        syncStartButton();

        window.setTimeout(() => {
            const searchInput = document.getElementById('menu-search');
            searchInput?.focus();
        }, 50);
    });

    const observer = new MutationObserver(syncStartButton);
    observer.observe(menuEl, { attributes: true, attributeFilter: ['style', 'class'] });

    syncStartButton();
})();
