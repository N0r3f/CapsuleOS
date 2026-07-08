'use strict';
function initMainMenu() {
    if (document.getElementById('menu-gnome-root')) {
        if (typeof initMainMenuGnome === 'function') {
            initMainMenuGnome();
        }
        return;
    }

    const catsList    = document.getElementById('menu-cats');
    const appList     = document.getElementById('menu-app-list');
    const searchInput = document.getElementById('menu-search');
    const btnLock     = document.getElementById('menu-btn-lock');
    const btnLogout   = document.getElementById('menu-btn-logout');
    const btnPower    = document.getElementById('menu-btn-power');
    const menuEl      = document.querySelector('div[data-link="mainMenu"]');
    const menuBtn     = document.querySelector('a[target="windowElement"][data-link="mainMenu"]');

    if (!catsList || !appList || !searchInput) return;

    const isMintCinnamonMenu = document.body && document.body.id === 'mint';
    let menuAppContextMenu = null;
    let menuAppContextTarget = null;

    if (typeof window !== 'undefined' && window.CAPSULE_CONTENT_ROOT) {
        const root = String(window.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
        MENU_SHORTCUTS.desktop.directory = `${root}/Bureau`;
        MENU_SHORTCUTS.downloads.directory = `${root}/Téléchargements`;
    }

    let activeCatId = 'all';

    // ── Génération des catégories ─────────────────────────────
    MENU_CATS.forEach(cat => {
        const li  = document.createElement('li');
        const btn = document.createElement('button');
        btn.type        = 'button';
        btn.className   = 'menu-cat' + (cat.id === activeCatId ? ' is-active' : '');
        if (cat.icon) {
            const catIcon = document.createElement('img');
            catIcon.className = 'menu-cat__icon';
            catIcon.alt = '';
            catIcon.src = typeof resolveCapsuleAssetUrl === 'function'
                ? resolveCapsuleAssetUrl(cat.icon)
                : (typeof resolveCapsuleResourceUrl === 'function'
                    ? resolveCapsuleResourceUrl(cat.icon)
                    : cat.icon);
            btn.appendChild(catIcon);
            const catLabel = document.createElement('span');
            catLabel.className = 'menu-cat__label';
            catLabel.textContent = cat.label;
            btn.appendChild(catLabel);
        } else {
            btn.textContent = cat.label;
        }
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

    if (isMintCinnamonMenu) {
        document.addEventListener('capsule:cinnamon-store-menu-pin', function onCinnamonStoreMenuPin() {
            renderApps(activeCatId, searchInput.value.trim());
        });
    }

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
    document.querySelectorAll('.menu-shortcut').forEach(link => {
        const shortcutConfig = MENU_SHORTCUTS[link.dataset.shortcutId];
        link.tabIndex = 0;

        if (shortcutConfig && shortcutConfig.icon) {
            const shortcutImg = link.querySelector('img');
            if (shortcutImg) {
                const iconUrl = typeof resolveCapsuleAssetUrl === 'function'
                    ? resolveCapsuleAssetUrl(shortcutConfig.icon)
                    : (typeof resolveCapsuleResourceUrl === 'function'
                        ? resolveCapsuleResourceUrl(shortcutConfig.icon)
                        : shortcutConfig.icon);
                shortcutImg.src = iconUrl;
            }
        }

        if (!shortcutConfig || !shortcutConfig.dataLink) {
            link.classList.add('is-unavailable');
            link.setAttribute('aria-disabled', 'true');
            link.tabIndex = -1;
            return;
        }

        link.addEventListener('click', e => {
            e.preventDefault();
            openApp(shortcutConfig);
        });

        link.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openApp(shortcutConfig);
            }
        });
    });

    const returnToPickHome = () => {
        if (window.CapsulePickReturn) {
            window.CapsulePickReturn.redirectToPickHome('linux');
            return;
        }
        const home = (typeof window !== 'undefined' && window.CAPSULE_SITE_HOME)
            ? String(window.CAPSULE_SITE_HOME)
            : '../../../../../index.html';
        window.location.href = `${home.split('#')[0].split('?')[0]}?pick=linux#choisir-os`;
    };

    // ── Boutons système (retour accueil avec modale Linux) ──
    if (btnLock) {
        btnLock.addEventListener('click', returnToPickHome);
    }
    if (btnLogout) {
        btnLogout.addEventListener('click', returnToPickHome);
    }
    if (btnPower) {
        btnPower.addEventListener('click', returnToPickHome);
    }

    // ── Fonctions internes ────────────────────────────────────

    function menuAppSearchRank(app) {
        let rank = 0;
        if (app.dataLink) {
            rank += 2;
        }
        if (app.catId === 'favorites') {
            rank += 1;
        }
        return rank;
    }

    function menuAppDedupeKey(app) {
        return (app.desktop || app.name || '').toLowerCase();
    }

    function dedupeMenuApps(apps) {
        const byKey = new Map();

        apps.forEach((app) => {
            const key = menuAppDedupeKey(app);
            if (!key) return;
            const existing = byKey.get(key);
            if (!existing || menuAppSearchRank(app) > menuAppSearchRank(existing)) {
                byKey.set(key, app);
            }
        });

        return Array.from(byKey.values());
    }

    function isMainMenuOpen() {
        return !!menuEl && menuEl.style.display !== 'none';
    }

    function closeMainMenu() {
        closeMenuAppContextMenu();
        if (!menuEl) return;
        menuEl.style.display = 'none';
        menuEl.classList.remove('windowElementActive');
        if (menuBtn) menuBtn.classList.remove('active-link');
        if (menuBtn) menuBtn.blur();
        if (window.CapsuleTaskbarLauncherState) {
            if (typeof window.CapsuleTaskbarLauncherState.clearRunning === 'function') {
                window.CapsuleTaskbarLauncherState.clearRunning(menuEl);
            }
            if (typeof window.CapsuleTaskbarLauncherState.refresh === 'function') {
                window.CapsuleTaskbarLauncherState.refresh();
            }
        }
    }

    function ensureMenuAppContextMenu() {
        if (menuAppContextMenu) {
            return menuAppContextMenu;
        }
        if (!isMintCinnamonMenu) {
            return null;
        }

        const existing = document.getElementById('menu-app-context-menu');
        if (existing) {
            menuAppContextMenu = existing;
            return menuAppContextMenu;
        }

        const menu = document.createElement('nav');
        menu.id = 'menu-app-context-menu';
        menu.className = 'menu-app-context-menu';
        menu.setAttribute('role', 'menu');
        menu.hidden = true;

        const items = [
            { action: 'add-favorite', label: 'Ajouter aux favoris' },
            { action: 'add-desktop', label: 'Ajouter au bureau' },
            { sep: true },
            { action: 'uninstall', label: 'Désinstaller…' },
        ];

        items.forEach(item => {
            if (item.sep) {
                const hr = document.createElement('div');
                hr.className = 'menu-app-context-menu__separator';
                hr.setAttribute('role', 'separator');
                menu.appendChild(hr);
                return;
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'menu-app-context-menu__item';
            btn.setAttribute('role', 'menuitem');
            btn.dataset.menuAppCtxAction = item.action;
            btn.textContent = item.label;
            menu.appendChild(btn);
        });

        menu.querySelectorAll('[data-menu-app-ctx-action]').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                closeMenuAppContextMenu();
            });
        });

        document.body.appendChild(menu);
        menuAppContextMenu = menu;
        return menuAppContextMenu;
    }

    function closeMenuAppContextMenu() {
        if (!menuAppContextMenu) {
            return;
        }
        menuAppContextMenu.hidden = true;
        menuAppContextTarget = null;
    }

    function openMenuAppContextMenu(clientX, clientY, itemEl, app) {
        const menu = ensureMenuAppContextMenu();
        if (!menu || !itemEl) {
            return;
        }

        menuAppContextTarget = app || null;
        appList.querySelectorAll('.menu-app-item.is-context-target').forEach(node => {
            node.classList.remove('is-context-target');
        });
        itemEl.classList.add('is-context-target');

        menu.hidden = false;
        const rect = menu.getBoundingClientRect();
        const maxLeft = window.innerWidth - rect.width - 8;
        const maxTop = window.innerHeight - rect.height - 8;
        menu.style.left = `${Math.max(8, Math.min(clientX, maxLeft))}px`;
        menu.style.top = `${Math.max(8, Math.min(clientY, maxTop))}px`;
    }

    function renderApps(catId, query) {
        appList.innerHTML = '';
        const q = query.toLowerCase();

        const effectiveCatId = q ? 'all' : catId;
        let filtered = MENU_APPS.filter(app => {
            const matchCat = effectiveCatId === 'all' || effectiveCatId === 'recent'
                || app.catId === effectiveCatId
                || (effectiveCatId === 'favorites' && app.favorite);
            const matchQ   = !q || app.name.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q);
            return matchCat && matchQ;
        });

        if (q || effectiveCatId === 'all') {
            filtered = dedupeMenuApps(filtered);
            filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        } else if (effectiveCatId === 'favorites') {
            // Ordre VM : gsettings org.cinnamon favorite-apps (pas alpha).
            filtered.sort((a, b) => (a.favoriteRank != null ? a.favoriteRank : 99) - (b.favoriteRank != null ? b.favoriteRank : 99));
        } else {
            filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        }

        if (filtered.length === 0) {
            appList.classList.add('is-empty');
            return;
        }

        appList.classList.remove('is-empty');

        filtered.forEach(app => {
            const li   = document.createElement('li');
            li.className = 'menu-app-item' + (app.dataLink ? '' : ' is-unavailable');
            li.tabIndex = app.dataLink ? 0 : -1;
            li.setAttribute('role', 'button');

            const icon = document.createElement('img');
            icon.className = 'menu-app-item__icon';
            icon.src = typeof resolveCapsuleAssetUrl === 'function'
                ? resolveCapsuleAssetUrl(app.icon)
                : (typeof resolveCapsuleResourceUrl === 'function'
                    ? resolveCapsuleResourceUrl(app.icon)
                    : app.icon);
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
                li.dataset.menuAppLink = app.dataLink;
                li.addEventListener('click', () => {
                    if (app.csPanel && typeof window !== 'undefined') {
                        window.CAPSULE_CS_PENDING_PANEL = app.csPanel;
                    }
                    openApp(app.dataLink);
                });
                li.addEventListener('keydown', event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        if (app.csPanel && typeof window !== 'undefined') {
                            window.CAPSULE_CS_PENDING_PANEL = app.csPanel;
                        }
                        openApp(app.dataLink);
                    }
                });
            }

            if (isMintCinnamonMenu && app.dataLink) {
                li.addEventListener('contextmenu', event => {
                    event.preventDefault();
                    openMenuAppContextMenu(event.clientX, event.clientY, li, app);
                });
            }

            appList.appendChild(li);
        });

        bindAppListKeyboardNav();
    }

    function bindAppListKeyboardNav() {
        const items = Array.from(appList.querySelectorAll('.menu-app-item[tabindex="0"]'));

        items.forEach((item, index) => {
            item.addEventListener('keydown', event => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    const next = items[index + 1] || items[0];
                    if (next) {
                        next.focus();
                    }
                }

                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    const previous = items[index - 1] || items[items.length - 1];
                    if (previous) {
                        previous.focus();
                    }
                }
            });
        });
    }

    function openApp(target) {
        const config = normalizeLaunchTarget(target);

        if (!config) {
            return;
        }

        // Ferme le menu
        closeMainMenu();

        const container = document.querySelector(`div.windowElement[data-link="${config.dataLink}"]`);
        const alreadyOpen = !!container && container.style.display !== 'none';
        const launcher = resolveLauncher(config.dataLink);

        if (alreadyOpen) {
            focusWindow(container, launcher);
        } else if (!launcher) {
            if (typeof openWindowByDataLink === 'function') {
                const opened = openWindowByDataLink(config.dataLink);
                if (!opened) {
                    console.warn('[mainMenu] Impossible d\'ouvrir la fenetre pour', config.dataLink);
                    return;
                }
                dispatchTaskForDataLink(config.dataLink);
            } else {
                console.warn('[mainMenu] Aucun lanceur standard trouve pour', config.dataLink);
                return;
            }
        } else {
            launchViaStandardMechanism(launcher, config.dataLink);
        }

        if (config.directory) {
            openNemoDirectory(config.directory);
        }
    }

    function normalizeLaunchTarget(target) {
        if (!target) {
            return null;
        }

        if (typeof target === 'string') {
            return { dataLink: target };
        }

        if (typeof target === 'object' && typeof target.dataLink === 'string') {
            return target;
        }

        return null;
    }

    function resolveLauncher(dataLink) {
        const selectors = [
            `footer a[target="windowElement"][data-link="${dataLink}"]`,
            `footer a.mint-panel__launcher[target="windowElement"][data-link="${dataLink}"]`,
            `#desktop > a[target="windowElement"][data-link="${dataLink}"]`,
            `a.desktop-shortcut[target="windowElement"][data-link="${dataLink}"]`,
            `a.mint-panel__launcher[target="windowElement"][data-link="${dataLink}"]`,
            `a[target="windowElement"][data-link="${dataLink}"]`
        ];

        for (const selector of selectors) {
            const launcher = document.querySelector(selector);
            if (launcher) {
                return launcher;
            }
        }

        return null;
    }

    function normalizeMenuDirectory(directory) {
        if (!directory || typeof directory !== 'string') {
            return directory;
        }
        const legacyPrefix = './apps/system/Dossier_personnel';
        if (directory.indexOf(legacyPrefix) !== 0) {
            return directory;
        }
        let root = 'home/public';
        if (typeof window !== 'undefined' && window.CAPSULE_CONTENT_ROOT) {
            root = String(window.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
        } else if (typeof window !== 'undefined' && window.CapsuleUserHome) {
            root = window.CapsuleUserHome.resolveRelative();
        }
        const suffix = directory.slice(legacyPrefix.length).replace(/^\//, '');
        return suffix ? `${root}/${suffix}` : root;
    }

    function openNemoDirectory(directory) {
        const target = normalizeMenuDirectory(directory);
        window.setTimeout(() => {
            if (typeof navigateToDirectory === 'function') {
                navigateToDirectory(target);
                return;
            }

            if (typeof loadDirectory === 'function') {
                loadDirectory(target);
            }
        }, 0);
    }

    function launchViaStandardMechanism(launcher, dataLink) {
        // Evite l'ouverture d'onglets about:blank sur certains navigateurs
        // en contournant le clic natif sur <a target="windowElement">.
        if (typeof handleOpenwindow === 'function') {
            handleOpenwindow(launcher);
            dispatchTaskForDataLink(dataLink);
            return;
        }

        launcher.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        const container = document.querySelector(`div.windowElement[data-link="${dataLink}"]`);
        const opened = !!container && container.style.display !== 'none';
        if (opened) {
            return;
        }

        if (container) {
            container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        }
    }

    function dispatchTaskForDataLink(dataLink) {
        if (typeof dispatchCapsuleTask !== 'function') {
            return;
        }

        const map = {
            nemo: 'open-nemo',
            firefox: 'open-firefox',
            terminal: 'open-terminal',
            mainMenu: 'open-menu',
            visionneur_images: 'open-viewer',
            visionneur_pdf: 'open-viewer',
            lecteur_multimedia: 'open-viewer',
            profile: 'open-profile',
        };

        const taskId = map[dataLink];
        if (taskId) {
            dispatchCapsuleTask(taskId);
        }
    }

    function focusWindow(container, launcher) {
        if (launcher) {
            launcher.classList.add('active-link');
        }

        container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }

    if (isMintCinnamonMenu && !document.body.dataset.menuAppContextMenuBound) {
        document.addEventListener('click', (event) => {
            if (!menuAppContextMenu || menuAppContextMenu.hidden) {
                return;
            }
            if (menuAppContextMenu.contains(event.target)) {
                return;
            }
            closeMenuAppContextMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape' || !menuAppContextMenu || menuAppContextMenu.hidden) {
                return;
            }
            event.preventDefault();
            closeMenuAppContextMenu();
        });

        document.body.dataset.menuAppContextMenuBound = 'true';
    }

    // Ferme le menu quand on clique à l'extérieur (vide / autre fenêtre).
    if (!document.body.dataset.mainMenuOutsideCloseBound) {
        document.addEventListener('click', (event) => {
            if (menuAppContextMenu && !menuAppContextMenu.hidden && menuAppContextMenu.contains(event.target)) {
                return;
            }
            if (!isMainMenuOpen()) return;
            if (menuBtn && menuBtn.contains(event.target)) return;
            if (menuEl && menuEl.contains(event.target)) return;
            closeMainMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menuAppContextMenu && !menuAppContextMenu.hidden) {
                closeMenuAppContextMenu();
                return;
            }

            if (event.key === 'Escape' && isMainMenuOpen()) {
                closeMainMenu();
                return;
            }

            if (!isMainMenuOpen()) {
                return;
            }

            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && event.target === searchInput) {
                const firstItem = appList.querySelector('.menu-app-item[tabindex="0"]');
                if (firstItem) {
                    event.preventDefault();
                    firstItem.focus();
                }
            }
        });

        document.body.dataset.mainMenuOutsideCloseBound = 'true';
    }

    if (menuBtn && menuBtn.dataset.menuFocusBound !== 'true') {
        menuBtn.addEventListener('click', () => {
            window.setTimeout(() => {
                if (!isMainMenuOpen()) {
                    return;
                }

                const preferredTarget = searchInput || appList.querySelector('.menu-app-item[tabindex="0"]');
                if (preferredTarget) {
                    preferredTarget.focus();
                }
            }, 0);
        });

        menuBtn.dataset.menuFocusBound = 'true';
    }
}
