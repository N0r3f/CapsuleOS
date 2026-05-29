(() => {
    if (!document.body || document.body.id !== 'debian-kde') {
        return;
    }

    if (typeof initMainMenu !== 'function' || initMainMenu.__debianPlasmaWrapped === true) {
        return;
    }

    const originalInit = initMainMenu;
    const categoryMeta = new Map(
        (typeof MENU_CATS === 'undefined' ? [] : MENU_CATS).map((cat) => [cat.id, cat])
    );

    function returnToPickHome() {
        if (window.CapsulePickReturn) {
            window.CapsulePickReturn.redirectToPickHome('linux');
            return;
        }
        const home = (typeof window !== 'undefined' && window.CAPSULE_SITE_HOME)
            ? String(window.CAPSULE_SITE_HOME)
            : '../../../../../index.html';
        window.location.href = `${home.split('#')[0].split('?')[0]}?pick=linux#choisir-os`;
    }

    function applyCategoryMetadata(btn) {
        const cat = categoryMeta.get(btn.dataset.catId);
        if (!cat) {
            return;
        }

        if (cat.icon) {
            const iconUrl = (typeof resolveCapsuleResourceUrl === 'function')
                ? resolveCapsuleResourceUrl(cat.icon)
                : cat.icon;
            btn.style.setProperty('--menu-cat-icon', `url(${iconUrl})`);
        }

        btn.classList.toggle('menu-cat--decorative', !!cat.decorative);
        btn.classList.toggle('menu-cat--disabled', !!cat.disabled);

        if (cat.disabled || cat.decorative) {
            btn.setAttribute('aria-disabled', 'true');
        } else {
            btn.removeAttribute('aria-disabled');
        }
    }

    function bindHeaderChrome() {
        const filterBtn = document.getElementById('menu-btn-filter');
        const pinBtn = document.getElementById('menu-btn-pin');
        const closeBtn = document.getElementById('menu-btn-close');

        if (filterBtn) {
            filterBtn.style.backgroundImage = 'url("./media/img/menu/plasma/view-filter.svg")';
        }
        if (pinBtn) {
            pinBtn.style.backgroundImage = 'url("./media/img/menu/plasma/view-pin.svg")';
        }
        if (closeBtn && closeBtn.dataset.plasmaCloseBound !== 'true') {
            closeBtn.dataset.plasmaCloseBound = 'true';
            closeBtn.addEventListener('click', () => {
                const menuEl = document.querySelector('div[data-link="mainMenu"]');
                const menuBtn = document.querySelector('a[target="windowElement"][data-link="mainMenu"]');
                if (menuEl) {
                    menuEl.style.display = 'none';
                    menuEl.classList.remove('windowElementActive');
                }
                menuBtn?.classList.remove('active-link');
                menuBtn?.focus();
            });
        }
    }

    function bindPowerActions() {
        ['menu-btn-sleep', 'menu-btn-hibernate', 'menu-btn-restart', 'menu-btn-power', 'menu-btn-session'].forEach((id) => {
            const btn = document.getElementById(id);
            if (!btn || btn.dataset.plasmaBound === 'true') {
                return;
            }
            btn.dataset.plasmaBound = 'true';
            btn.addEventListener('click', returnToPickHome);
        });
    }

    function activateFavoritesCategory() {
        const favoritesBtn = document.querySelector('#mainMenu .menu-cat[data-cat-id="favorites"]');
        if (!favoritesBtn || favoritesBtn.classList.contains('is-active')) {
            return;
        }
        favoritesBtn.click();
    }

    function blockDecorativeCategories() {
        document.querySelectorAll('#mainMenu .menu-cat.menu-cat--disabled, #mainMenu .menu-cat.menu-cat--decorative').forEach((btn) => {
            if (btn.dataset.plasmaCatBlock === 'true') {
                return;
            }
            btn.dataset.plasmaCatBlock = 'true';
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
            }, true);
        });
    }

    function syncSearchSelection(appList, menuRoot) {
        if (!appList || !menuRoot.classList.contains('menu-root--search')) {
            appList?.querySelectorAll('.menu-app-item.is-active').forEach((el) => el.classList.remove('is-active'));
            return;
        }

        const items = appList.querySelectorAll('.menu-app-item');
        items.forEach((el, index) => el.classList.toggle('is-active', index === 0));
    }

    function bindSearchMode() {
        const menuRoot = document.querySelector('#mainMenu .menu-root--plasma');
        const searchInput = document.getElementById('menu-search');
        const clearBtn = document.getElementById('menu-search-clear');
        const resultsHeading = document.getElementById('menu-results-heading');
        const appList = document.getElementById('menu-app-list');
        const menuEl = document.querySelector('div[data-link="mainMenu"]');

        if (!menuRoot || !searchInput || !appList) {
            return;
        }

        if (clearBtn && clearBtn.dataset.plasmaBound !== 'true') {
            clearBtn.dataset.plasmaBound = 'true';
            clearBtn.style.backgroundImage = 'url("./media/img/menu/plasma/search-clear.svg")';
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                searchInput.focus();
            });
        }

        function updateSearchChrome() {
            const hasQuery = searchInput.value.trim().length > 0;
            menuRoot.classList.toggle('menu-root--search', hasQuery);
            if (clearBtn) {
                clearBtn.hidden = !hasQuery;
            }
            if (resultsHeading) {
                resultsHeading.hidden = !hasQuery;
            }
            syncSearchSelection(appList, menuRoot);
        }

        if (searchInput.dataset.plasmaSearchBound !== 'true') {
            searchInput.dataset.plasmaSearchBound = 'true';
            searchInput.addEventListener('input', () => {
                window.setTimeout(updateSearchChrome, 0);
            });
        }

        if (appList.dataset.plasmaSearchObserve !== 'true') {
            appList.dataset.plasmaSearchObserve = 'true';
            const listObserver = new MutationObserver(() => syncSearchSelection(appList, menuRoot));
            listObserver.observe(appList, { childList: true });
        }

        if (menuEl && menuEl.dataset.plasmaSearchMenuObserve !== 'true') {
            menuEl.dataset.plasmaSearchMenuObserve = 'true';
            const menuObserver = new MutationObserver(() => {
                if (menuEl.style.display === 'none' && searchInput.value.trim() !== '') {
                    searchInput.value = '';
                    menuRoot.classList.remove('menu-root--search');
                    if (clearBtn) {
                        clearBtn.hidden = true;
                    }
                    if (resultsHeading) {
                        resultsHeading.hidden = true;
                    }
                    syncSearchSelection(appList, menuRoot);
                }
            });
            menuObserver.observe(menuEl, { attributes: true, attributeFilter: ['style'] });
        }

        updateSearchChrome();
    }

    function bindTabs() {
        const menuRoot = document.querySelector('#mainMenu .menu-root--plasma');
        const searchInput = document.getElementById('menu-search');
        const cats = document.getElementById('menu-cats');
        const places = document.getElementById('menu-places');
        const tabs = Array.from(document.querySelectorAll('#mainMenu [data-menu-tab]'));

        if (!menuRoot || !cats || !places || tabs.length === 0) {
            return;
        }

        function setTab(tabId) {
            const isPlaces = tabId === 'places';
            tabs.forEach((btn) => btn.classList.toggle('menu-plasma-tab--active', btn.dataset.menuTab === tabId));
            menuRoot.classList.toggle('menu-root--places', isPlaces);
            cats.hidden = isPlaces;
            places.hidden = !isPlaces;
            if (searchInput) {
                searchInput.disabled = isPlaces;
                if (isPlaces) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }

        tabs.forEach((btn) => {
            if (btn.dataset.plasmaTabBound === 'true') return;
            btn.dataset.plasmaTabBound = 'true';
            btn.addEventListener('click', () => setTab(btn.dataset.menuTab));
        });

        setTab('apps');
    }

    function bindPlaceIcons() {
        const base = '../../suse/opensuse/media/img/elements/places32';
        const iconMap = {
            home: `${base}/folder.svg`,
            desktop: `${base}/user-desktop.svg`,
            documents: `${base}/folder-documents.svg`,
            downloads: `${base}/folder-download.svg`,
            pictures: `${base}/folder-pictures.svg`,
            music: `${base}/folder-sound.svg`,
            videos: `${base}/folder-videos.svg`,
            trash: `${base}/folder.svg`,
        };

        document.querySelectorAll('#mainMenu .menu-shortcut').forEach((link) => {
            const id = link.dataset.shortcutId;
            const icon = iconMap[id];
            if (!icon) return;
            const iconUrl = (typeof resolveCapsuleResourceUrl === 'function')
                ? resolveCapsuleResourceUrl(icon)
                : icon;
            link.style.setProperty('--menu-shortcut-icon', `url(${iconUrl})`);
        });
    }

    function ensureShortcutDirectories() {
        if (typeof window === 'undefined' || !window.CAPSULE_CONTENT_ROOT || typeof MENU_SHORTCUTS === 'undefined') {
            return;
        }

        const root = String(window.CAPSULE_CONTENT_ROOT).replace(/\/+$/, '');
        const map = {
            home: `${root}`,
            desktop: `${root}/Bureau`,
            documents: `${root}/Documents`,
            downloads: `${root}/Téléchargements`,
            pictures: `${root}/Images`,
            music: `${root}/Musique`,
            videos: `${root}/Vidéos`,
            trash: `${root}/Corbeille`,
        };

        Object.entries(map).forEach(([key, directory]) => {
            if (MENU_SHORTCUTS[key] && typeof MENU_SHORTCUTS[key] === 'object') {
                MENU_SHORTCUTS[key].directory = directory;
            }
        });
    }

    function setupPlasmaMenu() {
        document.querySelectorAll('#mainMenu .menu-cat').forEach(applyCategoryMetadata);
        blockDecorativeCategories();
        bindHeaderChrome();
        bindPowerActions();
        bindSearchMode();
        bindTabs();
        ensureShortcutDirectories();
        bindPlaceIcons();
        activateFavoritesCategory();
    }

    const wrappedInit = function initMainMenuPlasmaDebian() {
        originalInit();
        setupPlasmaMenu();
    };

    wrappedInit.__debianPlasmaWrapped = true;
    window.initMainMenu = wrappedInit;
})();

