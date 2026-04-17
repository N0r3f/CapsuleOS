function initMainMenu() {
    const catsList    = document.getElementById('menu-cats');
    const appList     = document.getElementById('menu-app-list');
    const searchInput = document.getElementById('menu-search');
    const btnLogout   = document.getElementById('menu-btn-logout');
    const btnPower    = document.getElementById('menu-btn-power');
    const menuEl      = document.querySelector('div[data-link="mainMenu"]');
    const menuBtn     = document.querySelector('a[target="windowElement"][data-link="mainMenu"]');

    if (!catsList || !appList || !searchInput) return;

    let activeCatId = 'all';

    // ── Génération des catégories ─────────────────────────────
    MENU_CATS.forEach(cat => {
        const li  = document.createElement('li');
        const btn = document.createElement('button');
        btn.type        = 'button';
        btn.className   = 'menu-cat' + (cat.id === activeCatId ? ' is-active' : '');
        btn.textContent = cat.label;
        btn.dataset.catId = cat.id;

        btn.addEventListener('click', () => {
            activeCatId = cat.id;
            searchInput.value = '';
            document.querySelectorAll('.menu-cat').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            renderApps(activeCatId, '');
        });

        li.appendChild(btn);
        catsList.appendChild(li);
    });

    // Rendu initial
    renderApps('all', '');

    // ── Recherche temps réel ──────────────────────────────────
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        if (q.length > 0) {
            document.querySelectorAll('.menu-cat').forEach(b => b.classList.remove('is-active'));
        } else {
            document.querySelectorAll('.menu-cat').forEach(b => {
                if (b.dataset.catId === activeCatId) b.classList.add('is-active');
            });
        }
        renderApps(activeCatId, q);
    });

    // ── Raccourcis sidebar ────────────────────────────────────
    document.querySelectorAll('.menu-shortcut[data-app-link]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            openApp(link.dataset.appLink);
        });
    });

    // ── Boutons système ───────────────────────────────────────
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            window.location.href = '../../../index.html';
        });
    }
    if (btnPower) {
        btnPower.addEventListener('click', () => {
            window.location.href = '../../../index.html';
        });
    }

    // ── Fonctions internes ────────────────────────────────────

    function isMainMenuOpen() {
        return !!menuEl && menuEl.style.display !== 'none';
    }

    function closeMainMenu() {
        if (!menuEl) return;
        menuEl.style.display = 'none';
        menuEl.classList.remove('windowElementActive');
        if (menuBtn) menuBtn.classList.remove('active-link');
    }

    function renderApps(catId, query) {
        appList.innerHTML = '';
        const q = query.toLowerCase();

        const filtered = MENU_APPS.filter(app => {
            const matchCat = catId === 'all' || catId === 'recent' || app.catId === catId;
            const matchQ   = !q || app.name.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q);
            return matchCat && matchQ;
        });

        // Tri alphabétique
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

        if (filtered.length === 0) {
            appList.classList.add('is-empty');
            return;
        }

        appList.classList.remove('is-empty');

        filtered.forEach(app => {
            const li   = document.createElement('li');
            li.className = 'menu-app-item' + (app.dataLink ? '' : ' is-unavailable');

            const icon = document.createElement('img');
            icon.className = 'menu-app-item__icon';
            icon.src = app.icon;
            icon.alt = '';

            const info = document.createElement('div');
            info.className = 'menu-app-item__info';

            const name = document.createElement('span');
            name.className   = 'menu-app-item__name';
            name.textContent = app.name;

            const desc = document.createElement('span');
            desc.className   = 'menu-app-item__desc';
            desc.textContent = app.desc;

            info.appendChild(name);
            info.appendChild(desc);
            li.appendChild(icon);
            li.appendChild(info);

            if (app.dataLink) {
                li.addEventListener('click', () => openApp(app.dataLink));
            }

            appList.appendChild(li);
        });
    }

    function openApp(dataLink) {
        // Ferme le menu
        closeMainMenu();

        // Ouvre l'application cible via le mécanisme windowContainer.js
        const taskbarLink = document.querySelector(`a[target="windowElement"][data-link="${dataLink}"]`);
        if (taskbarLink) taskbarLink.click();
    }

    // Ferme le menu quand on clique à l'extérieur (vide / autre fenêtre).
    if (!document.body.dataset.mainMenuOutsideCloseBound) {
        document.addEventListener('click', (event) => {
            if (!isMainMenuOpen()) return;
            if (menuBtn && menuBtn.contains(event.target)) return;
            if (menuEl && menuEl.contains(event.target)) return;
            closeMainMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isMainMenuOpen()) {
                closeMainMenu();
            }
        });

        document.body.dataset.mainMenuOutsideCloseBound = 'true';
    }
}
