/**
 * AnduinOS — Menu Démarrer GNOME (favoris + recherche).
 */
function initMainMenuGnome() {
    if (!document.body || document.body.id !== 'anduinos') {
        return;
    }

    const grid = document.getElementById('menu-favorites-grid');
    const searchInput = document.getElementById('menu-search');
    const menuEl = document.querySelector('div[data-link="mainMenu"]');
    const btnPower = document.getElementById('menu-btn-power');
    const btnAllApps = document.getElementById('menu-all-apps');

    if (!grid || typeof ANDUIN_MENU_FAVORITES === 'undefined') {
        return;
    }

    const resolveUrl = typeof resolveCapsuleResourceUrl === 'function'
        ? resolveCapsuleResourceUrl
        : (url) => url;

    const getLinuxDistroHubHref = () => {
        if (typeof window !== 'undefined' && window.CAPSULE_LINUX_HUB) {
            return String(window.CAPSULE_LINUX_HUB);
        }
        return '../../../index.html';
    };

    const isMainMenuOpen = () => !!menuEl && menuEl.style.display !== 'none';

    const closeMainMenu = () => {
        if (!menuEl) {
            return;
        }
        menuEl.style.display = 'none';
        menuEl.classList.remove('windowElementActive');
        const startBtn = document.getElementById('anduin-start-btn');
        if (startBtn) {
            startBtn.classList.remove('active-link');
            startBtn.setAttribute('aria-expanded', 'false');
        }
    };

    const openAppFromMenu = (dataLink) => {
        if (!dataLink) {
            return;
        }
        closeMainMenu();
        if (typeof openWindowByDataLink === 'function') {
            openWindowByDataLink(dataLink);
            return;
        }
        const launcher = document.querySelector(`a[target="windowElement"][data-link="${dataLink}"]`);
        if (launcher && typeof handleOpenwindow === 'function') {
            handleOpenwindow(launcher);
        }
    };

    const renderFavorites = (query) => {
        grid.innerHTML = '';
        const q = (query || '').trim().toLowerCase();
        const items = ANDUIN_MENU_FAVORITES.filter((app) => (
            !q || app.name.toLowerCase().includes(q)
        ));

        if (!items.length) {
            grid.classList.add('is-empty');
            return;
        }

        grid.classList.remove('is-empty');

        items.forEach((app) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'listitem');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'menu-gnome-favorite' + (app.dataLink ? '' : ' is-unavailable');

            const icon = document.createElement('img');
            icon.className = 'menu-gnome-favorite__icon';
            icon.src = resolveUrl(app.icon);
            icon.alt = '';

            const label = document.createElement('span');
            label.className = 'menu-gnome-favorite__label';
            label.textContent = app.name;

            btn.appendChild(icon);
            btn.appendChild(label);

            if (app.dataLink) {
                btn.addEventListener('click', () => openAppFromMenu(app.dataLink));
            }

            li.appendChild(btn);
            grid.appendChild(li);
        });
    };

    renderFavorites('');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderFavorites(searchInput.value);
        });
    }

    document.querySelectorAll('.menu-gnome-quick__btn[data-quick-link]').forEach((btn) => {
        btn.addEventListener('click', () => {
            openAppFromMenu(btn.getAttribute('data-quick-link'));
        });
    });

    if (btnPower) {
        btnPower.addEventListener('click', () => {
            window.location.href = getLinuxDistroHubHref();
        });
    }

    if (btnAllApps) {
        btnAllApps.addEventListener('click', (event) => {
            event.preventDefault();
        });
    }

    if (!document.body.dataset.anduinMenuOutsideCloseBound) {
        document.addEventListener('click', (event) => {
            if (!isMainMenuOpen()) {
                return;
            }
            const startBtn = document.getElementById('anduin-start-btn');
            if (startBtn && startBtn.contains(event.target)) {
                return;
            }
            if (menuEl && menuEl.contains(event.target)) {
                return;
            }
            closeMainMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isMainMenuOpen()) {
                closeMainMenu();
            }
        });

        document.body.dataset.anduinMenuOutsideCloseBound = 'true';
    }
}

window.initMainMenuGnome = initMainMenuGnome;
