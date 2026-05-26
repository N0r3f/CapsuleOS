(function attachMainMenuPlasmaChrome() {
    if (!document.body || document.body.id !== 'opensuse') {
        return;
    }

    if (typeof initMainMenu !== 'function' || initMainMenu.__opensusePlasmaWrapped === true) {
        return;
    }

    const originalInit = initMainMenu;
    const categoryMeta = new Map(
        (typeof MENU_CATS === 'undefined' ? [] : MENU_CATS).map((cat) => [cat.id, cat])
    );

    function getLinuxDistroHubHref() {
        if (typeof window !== 'undefined' && window.CAPSULE_LINUX_HUB) {
            return String(window.CAPSULE_LINUX_HUB);
        }
        return '../../../index.html';
    }

    function applyCategoryMetadata(btn) {
        const cat = categoryMeta.get(btn.dataset.catId);
        if (!cat) {
            return;
        }

        if (cat.icon) {
            btn.style.setProperty('--menu-cat-icon', `url("${cat.icon}")`);
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

        if (filterBtn) {
            filterBtn.style.backgroundImage = 'url("./media/img/menu/plasma/view-filter.svg")';
        }
        if (pinBtn) {
            pinBtn.style.backgroundImage = 'url("./media/img/menu/plasma/view-pin.svg")';
        }
    }

    function bindPowerActions() {
        const hub = getLinuxDistroHubHref();
        ['menu-btn-sleep', 'menu-btn-restart', 'menu-btn-power', 'menu-btn-session'].forEach((id) => {
            const btn = document.getElementById(id);
            if (!btn || btn.dataset.plasmaBound === 'true') {
                return;
            }
            btn.dataset.plasmaBound = 'true';
            btn.addEventListener('click', () => {
                window.location.href = hub;
            });
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

    function setupPlasmaMenu() {
        document.querySelectorAll('#mainMenu .menu-cat').forEach(applyCategoryMetadata);
        blockDecorativeCategories();
        bindHeaderChrome();
        bindPowerActions();
        bindSearchMode();
        activateFavoritesCategory();
    }

    const wrappedInit = function initMainMenuPlasma() {
        originalInit();
        setupPlasmaMenu();
    };

    wrappedInit.__opensusePlasmaWrapped = true;
    window.initMainMenu = wrappedInit;
})();
