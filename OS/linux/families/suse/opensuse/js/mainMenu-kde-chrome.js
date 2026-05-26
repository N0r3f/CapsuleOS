(function attachMainMenuKdeChrome() {
    if (!document.body || document.body.id !== 'opensuse') {
        return;
    }

    if (typeof initMainMenu !== 'function' || initMainMenu.__mxKdeWrapped === true) {
        return;
    }

    const originalInit = initMainMenu;
    const categoryMeta = new Map(
        (typeof MENU_CATS === 'undefined' ? [] : MENU_CATS).map((cat) => [cat.id, cat])
    );

    const FLYOUT_ID = 'opensuse-menu-apps-flyout';
    const FLYOUT_OPEN_CLASS = 'opensuse-menu-apps-flyout--open';

    function getFlyoutEl() {
        return document.getElementById(FLYOUT_ID);
    }

    function readPaddingY(el) {
        if (!el) {
            return 0;
        }
        const s = getComputedStyle(el);
        return (parseFloat(s.paddingTop) || 0) + (parseFloat(s.paddingBottom) || 0);
    }

    function parseCssLengthToPx(value, rootFontPx) {
        const v = String(value || '').trim();
        if (!v) {
            return 0;
        }
        const n = parseFloat(v);
        if (Number.isNaN(n)) {
            return 0;
        }
        if (v.endsWith('rem')) {
            return n * (rootFontPx || 16);
        }
        if (v.endsWith('px')) {
            return n;
        }
        return n;
    }

    function positionAndSizeFlyout(menuEl, flyout) {
        if (!menuEl || !flyout || !flyout.classList.contains(FLYOUT_OPEN_CLASS)) {
            return;
        }
        if (menuEl.style.display === 'none') {
            return;
        }

        const mx = document.getElementById('opensuse');
        const menuRect = menuEl.getBoundingClientRect();
        const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const gapStr = mx ? getComputedStyle(mx).getPropertyValue('--opensuse-menu-apps-flyout-gap').trim() : '0.22rem';
        const gapPx = parseCssLengthToPx(gapStr, rootFont);
        const edge = Math.max(8, rootFont * 0.35);

        flyout.style.left = `${menuRect.right + gapPx}px`;
        flyout.style.top = `${menuRect.top}px`;

        const flyoutWidthBefore = flyout.getBoundingClientRect().width;
        const maxW = Math.max(100, window.innerWidth - menuRect.right - gapPx - edge);
        if (flyoutWidthBefore > maxW) {
            flyout.style.maxWidth = `${maxW}px`;
        } else {
            flyout.style.maxWidth = '';
        }

        /* Hauteur inline précédente : la liste en flex garde une zone haute → scrollHeight ≈ clientHeight
           et le panneau ne rétrécit pas. On relâche la hauteur avant mesure. */
        flyout.style.height = '';
        void flyout.offsetHeight;

        const list = document.getElementById('menu-app-list');
        const menuApps = flyout.querySelector('.menu-apps');
        const listContentH = list ? list.scrollHeight : 0;
        const desiredRaw = readPaddingY(flyout) + readPaddingY(menuApps) + listContentH;

        const minHStr = mx
            ? getComputedStyle(mx).getPropertyValue('--opensuse-menu-apps-flyout-min-height').trim()
            : '5.25rem';
        const minHPx = parseCssLengthToPx(minHStr, rootFont);

        const tableau = document.getElementById('tableau');
        const bottomLimit = tableau ? tableau.getBoundingClientRect().top : window.innerHeight;
        const capViewport = Math.max(minHPx, bottomLimit - menuRect.top - edge);
        const capMenu = menuRect.height;
        const cap = Math.min(capViewport, capMenu);

        const natural = Math.max(minHPx, desiredRaw);
        const finalH = Math.min(natural, cap);
        flyout.style.height = `${Math.ceil(finalH)}px`;
    }

    function scheduleFlyoutLayout(menuEl, flyout) {
        if (!menuEl || !flyout) {
            return;
        }
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                positionAndSizeFlyout(menuEl, flyout);
            });
        });
    }

    function resetCategoriesView(menuRoot, searchInput) {
        if (!menuRoot) {
            return;
        }

        const flyout = getFlyoutEl();
        if (flyout) {
            flyout.classList.remove(FLYOUT_OPEN_CLASS);
            flyout.setAttribute('aria-hidden', 'true');
            flyout.style.height = '';
            flyout.style.top = '';
            flyout.style.left = '';
            flyout.style.maxWidth = '';
        }

        menuRoot.classList.remove('menu-root--apps-open');
        menuRoot.classList.add('menu-root--categories');

        if (searchInput && searchInput.value.trim() !== '') {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function openAppsView(menuRoot) {
        if (!menuRoot) {
            return;
        }

        menuRoot.classList.add('menu-root--apps-open');
        menuRoot.classList.remove('menu-root--categories');

        const flyout = getFlyoutEl();
        const menuEl = document.querySelector('#mainMenu');
        if (!flyout || !menuEl || menuEl.style.display === 'none') {
            return;
        }

        flyout.classList.add(FLYOUT_OPEN_CLASS);
        flyout.setAttribute('aria-hidden', 'false');
        scheduleFlyoutLayout(menuEl, flyout);
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

    const RAIL_ICON_BASE = './media/img/menu-rail';

    /** SVG Breeze (visuel/icons) copiés localement ; `mono` = icône sombre à inverser sur thème sombre. */
    function applyMenuRailBreezeIcons() {
        const shortcuts = [
            { id: 'desktop', file: 'user-desktop.svg', mono: false },
            { id: 'downloads', file: 'folder-download.svg', mono: false },
            { id: 'calculator', file: 'accessories-calculator.svg', mono: false },
            { id: 'agenda', file: 'view-calendar.svg', mono: true },
            { id: 'text-editor', file: 'accessories-text-editor.svg', mono: false },
            { id: 'software-manager', file: 'system-software-install.svg', mono: false },
            { id: 'system-settings', file: 'preferences-system.svg', mono: false },
        ];

        shortcuts.forEach(({ id, file, mono }) => {
            const link = document.querySelector(`#mainMenu .menu-shortcut[data-shortcut-id="${id}"]`);
            const img = link && link.querySelector('img');
            if (!img) {
                return;
            }
            img.src = `${RAIL_ICON_BASE}/${file}`;
            if (mono) {
                img.setAttribute('data-capsule-rail-mono', 'true');
            } else {
                img.removeAttribute('data-capsule-rail-mono');
            }
        });

        const actions = [
            { btnId: 'menu-btn-lock', file: 'system-lock-screen.svg' },
            { btnId: 'menu-btn-logout', file: 'system-log-out.svg' },
            { btnId: 'menu-btn-power', file: 'system-shutdown.svg' },
        ];

        actions.forEach(({ btnId, file }) => {
            const btn = document.getElementById(btnId);
            const img = btn && btn.querySelector('img');
            if (!img) {
                return;
            }
            img.src = `${RAIL_ICON_BASE}/${file}`;
        });
    }

    function bindCategoryButton(menuRoot, btn, searchInput) {
        if (btn.dataset.kdeChromeBound === 'true') {
            return;
        }

        btn.dataset.kdeChromeBound = 'true';

        btn.addEventListener('click', (event) => {
            const cat = categoryMeta.get(btn.dataset.catId);
            if (cat && (cat.disabled || cat.decorative)) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }

            window.setTimeout(() => {
                openAppsView(menuRoot);
            }, 0);
        }, true);
    }

    function observeMenuVisibility(menuEl, menuRoot, searchInput) {
        if (menuEl.dataset.kdeVisibilityBound === 'true') {
            return;
        }

        let lastDisplay = menuEl.style.display === 'none' ? 'none' : (menuEl.style.display || 'flex');

        const observer = new MutationObserver(() => {
            const d = menuEl.style.display === 'none' ? 'none' : (menuEl.style.display || '');
            if (d === lastDisplay) {
                return;
            }
            lastDisplay = d;
            resetCategoriesView(menuRoot, searchInput);
        });

        observer.observe(menuEl, { attributes: true, attributeFilter: ['style'] });
        menuEl.dataset.kdeVisibilityBound = 'true';
    }

    function ensureAppsFlyoutReparent(menuRoot, menuEl) {
        if (menuEl.dataset.mxKdeAppsFlyoutInit === 'true') {
            return getFlyoutEl();
        }

        const menuApps = menuRoot.querySelector('.menu-apps');
        if (!menuApps) {
            return null;
        }

        const flyout = document.createElement('div');
        flyout.id = FLYOUT_ID;
        flyout.className = 'opensuse-menu-apps-flyout';
        flyout.setAttribute('role', 'region');
        flyout.setAttribute('aria-label', 'Applications');
        flyout.setAttribute('aria-hidden', 'true');
        document.body.appendChild(flyout);
        flyout.appendChild(menuApps);
        menuEl.dataset.mxKdeAppsFlyoutInit = 'true';
        return flyout;
    }

    function bindAppsFlyoutLayout(menuEl, menuRoot, flyout, searchInput) {
        if (menuEl.dataset.mxKdeAppsFlyoutListeners === 'true') {
            return;
        }
        menuEl.dataset.mxKdeAppsFlyoutListeners = 'true';

        let rafId = null;
        function scheduleMeasure() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (!flyout.classList.contains(FLYOUT_OPEN_CLASS)) {
                    return;
                }
                positionAndSizeFlyout(menuEl, flyout);
            });
        }

        window.addEventListener('resize', scheduleMeasure);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', scheduleMeasure);
            window.visualViewport.addEventListener('scroll', scheduleMeasure);
        }

        const appList = document.getElementById('menu-app-list');
        if (appList) {
            const mo = new MutationObserver(scheduleMeasure);
            mo.observe(appList, { childList: true, subtree: true });
        }

        document.addEventListener(
            'keydown',
            (ev) => {
                if (ev.key !== 'Escape') {
                    return;
                }
                if (!flyout.classList.contains(FLYOUT_OPEN_CLASS)) {
                    return;
                }
                if (menuEl.style.display === 'none') {
                    return;
                }
                resetCategoriesView(menuRoot, searchInput);
                ev.preventDefault();
            },
            true
        );
    }

    function setupMainMenuKdeChrome() {
        const menuRoot = document.querySelector('#mainMenu .menu-root');
        const menuEl = document.querySelector('#mainMenu');
        const categoriesPane = document.querySelector('#mainMenu .menu-categories');
        const searchInput = document.getElementById('menu-search');

        if (!menuRoot || !menuEl || !categoriesPane) {
            return;
        }

        const flyout = ensureAppsFlyoutReparent(menuRoot, menuEl);
        if (flyout) {
            bindAppsFlyoutLayout(menuEl, menuRoot, flyout, searchInput);
        }

        if (menuRoot.dataset.kdeChromeBound !== 'true') {
            menuRoot.dataset.kdeChromeBound = 'true';
            menuRoot.classList.add('menu-root--categories');

            document.querySelectorAll('#mainMenu .menu-cat').forEach((btn) => {
                bindCategoryButton(menuRoot, btn, searchInput);
            });

            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    if (searchInput.value.trim().length > 0) {
                        openAppsView(menuRoot);
                    } else {
                        resetCategoriesView(menuRoot, searchInput);
                    }
                });
            }

            observeMenuVisibility(menuEl, menuRoot, searchInput);
        }

        document.querySelectorAll('#mainMenu .menu-cat').forEach(applyCategoryMetadata);
        applyMenuRailBreezeIcons();
        resetCategoriesView(menuRoot, searchInput);
    }

    const wrappedInit = function initMainMenuKdeChrome() {
        originalInit();
        setupMainMenuKdeChrome();
    };

    wrappedInit.__mxKdeWrapped = true;
    window.initMainMenu = wrappedInit;
})();
