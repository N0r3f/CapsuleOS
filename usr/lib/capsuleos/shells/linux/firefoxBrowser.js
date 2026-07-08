'use strict';

function capsuleStr(key, fallback) {
    const m = (typeof window !== 'undefined' && window.CAPSULE_STRINGS_MERGED) || {};
    if (m[key] !== undefined && m[key] !== null && String(m[key]).length > 0) {
        return String(m[key]);
    }
    return fallback;
}

function capsuleStrFmt(key, vars, fallback) {
    let s = capsuleStr(key, fallback);
    if (vars && typeof s === 'string') {
        Object.keys(vars).forEach((k) => {
            s = s.split(`{${k}}`).join(vars[k]);
        });
    }
    return s;
}

function supportsFirefoxGnomeChrome() {
    if (!document.body || !document.body.id) {
        return false;
    }
    return document.body.id === 'fedora'
        || document.body.id === 'rocky'
        || document.body.id === 'alma'
        || document.body.id === 'ubuntu'
        || document.body.id === 'popos'
        || document.body.id === 'kali'
        || document.body.id === 'elementary'
        || document.body.id === 'anduinos';
}

function isMintFirefoxScope() {
    return !!(document.body && document.body.id === 'mint');
}

function ensureMintFirefoxTitlebar(windowElement, browserRoot) {
    if (!isMintFirefoxScope() || !windowElement || windowElement.dataset.link !== 'firefox') {
        return;
    }

    windowElement.classList.remove('firefox-window--fedora');

    const tabsbar = browserRoot && browserRoot.querySelector('.capsule-browser__tabsbar');
    let header = windowElement.querySelector(':scope > #windowHeader');
    const integrated = tabsbar && tabsbar.querySelector('#windowHeader');

    if (integrated && integrated !== header) {
        integrated.remove();
        header = windowElement.querySelector(':scope > #windowHeader');
    }

    if (header && tabsbar && tabsbar.contains(header)) {
        const anchor = windowElement.querySelector(':scope > #windowIframe') || browserRoot.parentElement;
        if (anchor && anchor.parentElement === windowElement) {
            windowElement.insertBefore(header, anchor);
        } else {
            windowElement.prepend(header);
        }
        header.classList.remove('firefox-window-controls--fedora');
        delete header.dataset.fedoraFirefoxControls;
    }

    if (header) {
        header.hidden = false;
        header.removeAttribute('aria-hidden');
        header.style.removeProperty('display');
    }

    const titleKey = 'firefox.windowTitle';
    const titleText = capsuleStr(titleKey, 'Mozilla Firefox');
    const titleEl = header && header.querySelector('#windowTitle');
    if (titleEl) {
        titleEl.textContent = titleText;
    }
    windowElement.setAttribute('data-title', titleText);

    if (window.CapsuleWindowChrome) {
        if (typeof window.CapsuleWindowChrome.ensureHeader === 'function') {
            window.CapsuleWindowChrome.ensureHeader(windowElement, 'firefox');
        }
        if (typeof window.CapsuleWindowChrome.afterInject === 'function') {
            window.CapsuleWindowChrome.afterInject(windowElement, 'firefox');
        }
    }
}

function getFirefoxContribPack() {
    if (typeof window === 'undefined' || !window.CAPSULE_FIREFOX_CONTRIB) {
        return null;
    }
    return window.CAPSULE_FIREFOX_CONTRIB;
}

function applyFirefoxContribPack(browserRoot, refs) {
    const pack = getFirefoxContribPack();
    if (!pack || !browserRoot || !refs) {
        return false;
    }

    const searchCfg = pack.searchEngine || {};
    const engineKey = searchCfg.defaultEngine || 'google';
    const engine = (searchCfg.engines || {})[engineKey] || {};
    const placeholder = engine.placeholderFr
        || capsuleStr('firefox.addressPlaceholder', 'Rechercher avec Google ou saisir une adresse');

    if (refs.addressInput) {
        refs.addressInput.placeholder = placeholder;
    }
    if (refs.newtabInput) {
        refs.newtabInput.placeholder = placeholder;
    }

    if (refs.bookmarksBar) {
        refs.bookmarksBar.innerHTML = '';
        (pack.bookmarks || []).forEach((entry) => {
            const label = entry.labelFr || entry.label || 'favori';
            const route = entry.route || 'noop';
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'capsule-browser__bookmark';
            if (entry.primary) {
                link.classList.add('capsule-browser__bookmark--primary');
            }
            if (route === 'noop') {
                link.classList.add('capsule-browser__bookmark--import');
            }
            link.setAttribute('data-browser-bookmark', label);
            link.setAttribute('data-browser-route', route);
            link.textContent = label;
            refs.bookmarksBar.appendChild(link);
        });
    }

    if (refs.newtabShortcuts) {
        refs.newtabShortcuts.querySelectorAll('[data-browser-newtab-link]').forEach((node) => {
            node.remove();
        });
        const addButton = refs.newtabShortcuts.querySelector('[data-browser-newtab-action="add"]');
        (pack.newtabShortcuts || []).forEach((entry) => {
            const key = entry.key || entry.siteId || '';
            if (!key) {
                return;
            }
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'capsule-browser-newtab__shortcut capsule-browser-newtab__shortcut--' + key;
            link.setAttribute('data-browser-newtab-link', key);
            link.textContent = entry.labelFr || entry.label || key;
            if (entry.sponsored) {
                const sponsored = document.createElement('span');
                sponsored.className = 'capsule-browser-newtab__sponsored';
                sponsored.textContent = capsuleStr('firefox.newtabSponsored', 'Sponsorisé');
                link.appendChild(sponsored);
            }
            if (addButton) {
                refs.newtabShortcuts.insertBefore(link, addButton);
            } else {
                refs.newtabShortcuts.appendChild(link);
            }
        });
    }

    browserRoot.dataset.firefoxContribLoaded = 'true';
    browserRoot.dataset.firefoxContribVersion = String((pack.manifest && pack.manifest.version) || 1);
    browserRoot.dataset.firefoxContribShortcuts = String((pack.newtabShortcuts || []).length);
    return true;
}

function syncFirefoxGnomeDataset(browserRoot) {
    const root = browserRoot
        || document.querySelector('#firefox [data-firefox-gnome-root]');
    if (!root || !supportsFirefoxGnomeChrome()) {
        return;
    }
    const session = root.__capsuleFirefoxSession;
    if (!session) {
        return;
    }
    let activeTab = null;
    session.tabs.forEach((tab) => {
        if (tab.id === session.activeTabId) {
            activeTab = tab;
        }
    });
    if (!activeTab) {
        activeTab = session.tabs[0] || null;
    }
    const markers = [
        root,
        root.querySelector('[data-firefox-gnome-root]'),
    ].filter(Boolean);
    const view = activeTab ? activeTab.view : 'home';
    markers.forEach((node) => {
        node.dataset.firefoxGnomeInit = 'true';
        node.dataset.firefoxGnomeView = view;
        node.dataset.firefoxGnomeTabCount = String(session.tabs.length);
        node.dataset.firefoxGnomeActiveTabId = session.activeTabId || '';
        node.dataset.firefoxGnomeBookmarksVisible = session.bookmarksVisible ? 'true' : 'false';
        node.dataset.firefoxGnomeChrome = 'proton';
        if (browserRoot && browserRoot.dataset.firefoxContribLoaded) {
            node.dataset.firefoxContribLoaded = browserRoot.dataset.firefoxContribLoaded;
            node.dataset.firefoxContribShortcuts = browserRoot.dataset.firefoxContribShortcuts || '';
        }
        if (activeTab && activeTab.history) {
            node.dataset.firefoxGnomeCanGoBack = activeTab.historyIndex > 0 ? 'true' : 'false';
            node.dataset.firefoxGnomeCanGoForward = activeTab.historyIndex < activeTab.history.length - 1
                ? 'true'
                : 'false';
        }
    });
}

function decorateFedoraFirefoxWindow(browserRoot) {
    if (!supportsFirefoxGnomeChrome()) {
        return;
    }

    const windowElement = browserRoot.closest('.windowElement');
    if (!windowElement || windowElement.dataset.link !== 'firefox') {
        return;
    }

    windowElement.classList.add('firefox-window--fedora');

    const moveControlsIntoTabsbar = () => {
        const tabsbar = browserRoot.querySelector('.capsule-browser__tabsbar');
        const header = windowElement.querySelector('#windowHeader');
        if (!tabsbar || !header) {
            return false;
        }

        if (window.CapsuleWindowDragTargets && typeof window.CapsuleWindowDragTargets.markDragPassthrough === 'function') {
            window.CapsuleWindowDragTargets.markDragPassthrough(tabsbar);
        } else {
            tabsbar.setAttribute('data-window-drag-handle', '');
            tabsbar.setAttribute('data-window-drag-passthrough', 'true');
        }

        if (header.dataset.fedoraFirefoxControls === 'true' && header.parentElement === tabsbar) {
            return true;
        }

        header.dataset.fedoraFirefoxControls = 'true';
        header.classList.add('firefox-window-controls--fedora');
        header.style.minWidth = '';
        header.style.maxWidth = '';
        header.style.width = '';
        tabsbar.appendChild(header);

        if (window.CapsuleWindowChrome
            && typeof window.CapsuleWindowChrome.syncFirefoxGnomeChrome === 'function') {
            window.CapsuleWindowChrome.syncFirefoxGnomeChrome(windowElement);
        } else if (window.CapsuleWindowDragTargets) {
            const fill = header.querySelector('.window-drag-region--header-fill');
            if (fill) {
                fill.remove();
            }
            header.removeAttribute('data-window-drag-handle');
            header.removeAttribute('data-window-drag-passthrough');
        }

        return true;
    };

    if (!moveControlsIntoTabsbar() && windowElement.dataset.fedoraFirefoxControlsObserver !== 'true') {
        windowElement.dataset.fedoraFirefoxControlsObserver = 'true';
        const observer = new MutationObserver(() => {
            if (moveControlsIntoTabsbar()) {
                observer.disconnect();
            }
        });
        observer.observe(windowElement, { childList: true });
    }
}

function initFirefoxBrowser() {
    const browserRoot = document.querySelector('#firefox [data-firefox-app]');
    if (!browserRoot || browserRoot.dataset.initialized === 'true') {
        return;
    }

    const form = browserRoot.querySelector('[data-browser-form]');
    const addressInput = browserRoot.querySelector('[data-browser-address]');
    const status = browserRoot.querySelector('[data-browser-status]');
    const homeView = browserRoot.querySelector('[data-browser-home]');
    const redirectView = browserRoot.querySelector('[data-browser-redirect]');
    const redirectFrame = browserRoot.querySelector('[data-browser-redirect-frame]');
    const siteView = browserRoot.querySelector('[data-browser-site]');
    const preferencesView = browserRoot.querySelector('[data-browser-preferences]');
    const bookmarksBar = browserRoot.querySelector('[data-browser-bookmarks]');
    const tabsList = browserRoot.querySelector('[data-browser-tabs]');
    const newtabForm = browserRoot.querySelector('[data-browser-newtab-form]');
    const newtabInput = browserRoot.querySelector('[data-browser-newtab-input]');
    const newtabShortcuts = browserRoot.querySelector('[data-browser-newtab-shortcuts]');
    const panelHistory = browserRoot.querySelector('[data-browser-panel="history"]');
    const panelDownloads = browserRoot.querySelector('[data-browser-panel="downloads"]');
    const historyList = browserRoot.querySelector('[data-browser-history-list]');

    const btnHomes = browserRoot.querySelectorAll('[data-browser-action="home"]');
    const btnReload = browserRoot.querySelector('[data-browser-action="reload"]');
    const btnBack = browserRoot.querySelector('[data-browser-action="back"]');
    const btnForward = browserRoot.querySelector('[data-browser-action="forward"]');
    const btnNewTab = browserRoot.querySelector('[data-browser-action="new-tab"]');
    const btnToggleBookmarks = browserRoot.querySelector('[data-browser-action="toggle-bookmarks"]');
    const btnLibrary = browserRoot.querySelector('[data-browser-action="library"]');
    const btnMenu = browserRoot.querySelector('[data-browser-action="menu"]');
    const btnProfile = browserRoot.querySelector('[data-browser-action="profile"]');
    const btnPocket = browserRoot.querySelector('[data-browser-action="pocket"]');

    if (!form || !addressInput || !status || !homeView || !redirectView || !redirectFrame
        || !bookmarksBar || !tabsList || !btnReload || !btnBack || !btnForward) {
        return;
    }

    const windowElement = browserRoot.closest('.windowElement');
    if (isMintFirefoxScope()) {
        ensureMintFirefoxTitlebar(windowElement, browserRoot);
    } else {
        decorateFedoraFirefoxWindow(browserRoot);
    }

    applyFirefoxContribPack(browserRoot, {
        addressInput: addressInput,
        newtabInput: newtabInput,
        bookmarksBar: bookmarksBar,
        newtabShortcuts: newtabShortcuts,
    });

    const defaultTabLabel = capsuleStr('firefox.tabNewLabel', 'Nouvel onglet');

    const resolver = (typeof window !== 'undefined' && window.CapsuleSimulatedWebResolver)
        ? window.CapsuleSimulatedWebResolver
        : null;

    function makeHomeEntry() {
        return {
            view: 'home',
            address: '',
            label: defaultTabLabel,
            resolution: null,
        };
    }

    function makePreferencesEntry() {
        return {
            view: 'preferences',
            address: 'about:preferences',
            label: capsuleStr('firefox.prefsTabLabel', 'Paramètres'),
            resolution: null,
        };
    }

    function createTabState(id) {
        const entry = makeHomeEntry();
        return {
            id: id,
            label: defaultTabLabel,
            view: 'home',
            address: '',
            resolution: null,
            history: [entry],
            historyIndex: 0,
        };
    }

    const state = {
        tabCounter: 1,
        activeTabId: 'tab-1',
        bookmarksVisible: false,
        openPanel: null,
        zoomPercent: 100,
        closedTabs: [],
        sessionHistory: [],
        demoDownloads: [{
            id: 'demo-1',
            name: capsuleStr('firefox.downloadDemoName', 'guide-capsuleos-simulation.pdf'),
            size: capsuleStr('firefox.downloadDemoSize', '248 Ko'),
            state: 'complete',
        }],
        tabs: [createTabState('tab-1')],
    };

    function normalizeInput(value) {
        if (resolver && typeof resolver.normalizeInput === 'function') {
            return resolver.normalizeInput(value);
        }
        return String(value || '').trim();
    }

    function isHomeTarget(value) {
        if (resolver && typeof resolver.isHomeTarget === 'function') {
            return resolver.isHomeTarget(value);
        }
        const normalized = normalizeInput(value).toLowerCase();
        return normalized === ''
            || normalized === 'accueil'
            || normalized === 'about:newtab'
            || normalized === 'capsuleos://accueil';
    }

    function resolveNavigation(rawValue) {
        if (resolver && typeof resolver.resolveInput === 'function') {
            return resolver.resolveInput(rawValue);
        }
        const value = normalizeInput(rawValue);
        if (isHomeTarget(value)) {
            return { type: 'home' };
        }
        return {
            type: 'web',
            siteId: 'lacapsule',
            address: 'lacapsule.org',
            url: (typeof window !== 'undefined' && window.CAPSULE_SITE_HOME)
                ? String(window.CAPSULE_SITE_HOME)
                : '/index.html',
        };
    }

    function getActiveTab() {
        let found = null;
        state.tabs.forEach((tab) => {
            if (tab.id === state.activeTabId) {
                found = tab;
            }
        });
        return found || state.tabs[0];
    }

    function setStatus(message) {
        if (!message) {
            status.hidden = true;
            status.textContent = '';
            return;
        }
        status.hidden = false;
        status.textContent = message;
    }

    function setLoading(loading) {
        browserRoot.dataset.browserLoading = loading ? 'true' : 'false';
        btnReload.classList.toggle('capsule-browser__btn--loading', !!loading);
        btnReload.disabled = !!loading;
    }

    function tabLabelForView(view, address, resolution) {
        if (resolution && resolution.type === 'mnt' && resolution.label) {
            return resolution.label;
        }
        if (view === 'web' && resolution && resolution.siteId === 'lacapsule') {
            return capsuleStr('firefox.tabOsLaCapsuleLabel', 'La Capsule');
        }
        if (view === 'web' && resolution && resolution.siteId === 'search-google') {
            const q = resolution.url && resolution.url.indexOf('q=') >= 0
                ? decodeURIComponent((resolution.url.split('q=')[1] || '').split('&')[0])
                : '';
            return q
                ? capsuleStrFmt('firefox.tabSearchLabel', { query: q }, 'Recherche : ' + q)
                : capsuleStr('firefox.tabSearchDefault', 'Recherche Google');
        }
        if (view === 'web' && address && !isHomeTarget(address)) {
            return address;
        }
        if (view === 'error' && address) {
            return address;
        }
        return defaultTabLabel;
    }

    function resolutionToEntry(resolution) {
        if (!resolution || resolution.type === 'home') {
            return makeHomeEntry();
        }
        if (resolution.type === 'web') {
            const address = resolution.address || resolution.siteId || '';
            return {
                view: 'web',
                address: address,
                label: tabLabelForView('web', address, resolution),
                resolution: resolution,
            };
        }
        if (resolution.type === 'mnt') {
            const address = resolution.moduleId || '';
            return {
                view: 'module',
                address: address,
                label: tabLabelForView('module', address, resolution),
                resolution: resolution,
            };
        }
        if (resolution.type === 'error') {
            const address = resolution.address || '';
            return {
                view: 'error',
                address: address,
                label: tabLabelForView('error', address, resolution),
                resolution: resolution,
            };
        }
        return makeHomeEntry();
    }

    function switchView(view) {
        const showHome = view === 'home';
        const showWeb = view === 'web' || view === 'error';
        const showModule = view === 'module';
        const showPreferences = view === 'preferences';

        homeView.hidden = !showHome;
        redirectView.hidden = !showWeb;
        if (siteView) {
            siteView.hidden = !showModule;
        }
        if (preferencesView) {
            preferencesView.hidden = !showPreferences;
        }

        homeView.style.display = showHome ? 'flex' : 'none';
        redirectView.style.display = showWeb ? 'block' : 'none';
        if (siteView) {
            siteView.style.display = showModule ? 'block' : 'none';
        }
        if (preferencesView) {
            preferencesView.style.display = showPreferences ? 'flex' : 'none';
        }

        browserRoot.setAttribute('data-browser-current-view', view);
    }

    function syncAddressInput(address) {
        if (isHomeTarget(address)) {
            addressInput.value = '';
            if (newtabInput) {
                newtabInput.value = '';
            }
            return;
        }
        addressInput.value = address;
    }

    function syncNavButtons() {
        const tab = getActiveTab();
        const canBack = !!(tab && tab.history && tab.historyIndex > 0);
        const canForward = !!(tab && tab.history && tab.historyIndex < tab.history.length - 1);
        btnBack.disabled = !canBack;
        btnForward.disabled = !canForward;
    }

    function recordSessionHistory(tab, entry) {
        state.sessionHistory.push({
            tabId: tab.id,
            view: entry.view,
            address: entry.address,
            label: entry.label,
            ts: Date.now(),
        });
        if (state.sessionHistory.length > 80) {
            state.sessionHistory.shift();
        }
    }

    function renderModulePanel(resolution) {
        if (!siteView || !resolution) {
            return;
        }
        siteView.replaceChildren();
        const index = resolver && typeof resolver.getIndex === 'function'
            ? resolver.getIndex()
            : (typeof window !== 'undefined' && window.CAPSULE_SIMULATED_WEB_INDEX) || {};
        const modules = index.modules || {};
        const entry = modules[resolution.moduleId] || {};
        const label = resolution.label || entry.labelFr || resolution.moduleId || '';

        const article = document.createElement('article');
        article.className = 'capsule-browser-site__page capsule-browser-site__page--mnt';
        article.setAttribute('data-browser-mnt-module', resolution.moduleId || '');

        const title = document.createElement('h1');
        title.className = 'capsule-browser-site__title';
        title.textContent = label;

        const lead = document.createElement('p');
        lead.className = 'capsule-browser-site__lead';
        lead.textContent = capsuleStrFmt(
            'firefox.mntPanelLead',
            { module: label },
            'Module pédagogique CapsuleOS — parcours monté sous /mnt.'
        );

        const hint = document.createElement('p');
        hint.className = 'capsule-browser-site__hint';
        hint.textContent = capsuleStr(
            'firefox.mntPanelHint',
            'Les Missions et les applications du scénario s\'ouvrent automatiquement si disponibles sur ce bureau.'
        );

        article.appendChild(title);
        article.appendChild(lead);
        article.appendChild(hint);
        siteView.appendChild(article);
    }

    const prefsSidebarSections = [
        { id: 'general', icon: '⚙', label: capsuleStr('firefox.prefsSectionGeneral', 'Général') },
        { id: 'home', icon: '🏠', label: capsuleStr('firefox.prefsSectionHome', 'Accueil') },
        { id: 'search', icon: '🔍', label: capsuleStr('firefox.prefsSectionSearch', 'Recherche') },
        { id: 'privacy', icon: '🔒', label: capsuleStr('firefox.prefsSectionPrivacy', 'Vie privée et sécurité') },
        { id: 'sync', icon: '🔄', label: capsuleStr('firefox.prefsSectionSync', 'Synchronisation') },
        { id: 'labs', icon: '🔬', label: capsuleStr('firefox.prefsSectionLabs', 'Firefox Labs') },
        { id: 'other-products', icon: '📦', label: capsuleStr('firefox.prefsSectionOtherProducts', 'Autres produits de Mozilla') },
        { sep: true },
        { id: 'addons', icon: '🧩', label: capsuleStr('firefox.prefsSectionAddons', 'Extensions et thèmes') },
        { id: 'help', icon: '❓', label: capsuleStr('firefox.prefsSectionHelp', 'Assistance de Firefox') },
    ];

    let prefsActiveSection = 'general';

    function notifyPrefChanged(label, checked) {
        setStatus(capsuleStrFmt(
            'firefox.statusPrefChanged',
            { label: label, state: checked ? capsuleStr('firefox.prefsStateOn', 'activé') : capsuleStr('firefox.prefsStateOff', 'désactivé') },
            'Préférence mise à jour.',
        ));
    }

    function appendPrefsCheckbox(container, item, depth) {
        const row = document.createElement('label');
        row.className = 'capsule-browser-prefs__checkbox-row';
        if (depth) {
            row.style.marginLeft = `${depth * 1.4}rem`;
        }
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!item.checked;
        input.disabled = !!item.greyed;
        input.addEventListener('change', function onPrefsCheckboxChange() {
            notifyPrefChanged(item.label, input.checked);
        });
        const textWrap = document.createElement('span');
        const main = document.createElement('span');
        main.textContent = item.label;
        textWrap.appendChild(main);
        if (item.description) {
            const desc = document.createElement('span');
            desc.className = 'capsule-browser-prefs__item-description';
            desc.textContent = item.description;
            textWrap.appendChild(desc);
        }
        row.appendChild(input);
        row.appendChild(textWrap);
        container.appendChild(row);
        if (item.children) {
            item.children.forEach(function appendChild(child) {
                appendPrefsCheckbox(container, child, (depth || 0) + 1);
            });
        }
    }

    let prefsRadioGroupCounter = 0;

    function appendPrefsRadioGroup(container, items) {
        prefsRadioGroupCounter += 1;
        const groupName = `capsule-prefs-radio-${prefsRadioGroupCounter}`;
        items.forEach(function appendOne(item) {
            const row = document.createElement('label');
            row.className = 'capsule-browser-prefs__checkbox-row';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = groupName;
            input.checked = !!item.selected;
            input.addEventListener('change', function onPrefsRadioChange() {
                notifyPrefChanged(item.label, true);
            });
            const textWrap = document.createElement('span');
            const main = document.createElement('span');
            main.textContent = item.label;
            textWrap.appendChild(main);
            if (item.description) {
                const desc = document.createElement('span');
                desc.className = 'capsule-browser-prefs__item-description';
                desc.textContent = item.description;
                textWrap.appendChild(desc);
            }
            row.appendChild(input);
            row.appendChild(textWrap);
            container.appendChild(row);
            if (item.button) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'capsule-browser-prefs__btn capsule-browser-prefs__btn--inline';
                btn.textContent = item.button;
                btn.addEventListener('click', function onPrefsRadioBtnClick() {
                    setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: item.button }, 'Menu : bientôt disponible.'));
                });
                container.appendChild(btn);
            }
        });
    }

    function appendPrefsSubsectionTitle(container, text) {
        const h = document.createElement('h3');
        h.className = 'capsule-browser-prefs__subsection-title';
        h.textContent = text;
        container.appendChild(h);
    }

    function appendPrefsDescription(container, text) {
        const p = document.createElement('p');
        p.className = 'capsule-browser-prefs__description';
        p.textContent = text;
        container.appendChild(p);
    }

    function appendPrefsPlaceholder(container, text) {
        const p = document.createElement('p');
        p.className = 'capsule-browser-prefs__placeholder';
        p.textContent = text;
        container.appendChild(p);
    }

    function appendPrefsInfoBox(container, text) {
        const p = document.createElement('p');
        p.className = 'capsule-browser-prefs__infobox';
        p.textContent = text;
        container.appendChild(p);
    }

    function appendPrefsButtonRow(container, item) {
        const row = document.createElement('div');
        row.className = 'capsule-browser-prefs__button-row';
        if (item.title) {
            const strong = document.createElement('strong');
            strong.textContent = item.title;
            row.appendChild(strong);
        }
        if (item.description) {
            const desc = document.createElement('span');
            desc.className = 'capsule-browser-prefs__item-description';
            desc.textContent = item.description;
            row.appendChild(desc);
        }
        container.appendChild(row);
        if (item.button) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'capsule-browser-prefs__btn';
            btn.textContent = item.button;
            btn.addEventListener('click', function onPrefsBtnClick() {
                setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: item.button }, 'Menu : bientôt disponible.'));
            });
            container.appendChild(btn);
        }
    }

    function appendPrefsSelectRow(container, item) {
        const row = document.createElement('div');
        row.className = 'capsule-browser-prefs__select-row';
        if (item.label) {
            const label = document.createElement('span');
            label.textContent = item.label;
            row.appendChild(label);
        }
        const select = document.createElement('span');
        select.className = 'capsule-browser-prefs__select-value';
        select.textContent = item.select || item.value || '';
        row.appendChild(select);
        if (item.button) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'capsule-browser-prefs__btn capsule-browser-prefs__btn--inline';
            btn.textContent = item.button;
            btn.addEventListener('click', function onPrefsSelectBtnClick() {
                setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: item.button }, 'Menu : bientôt disponible.'));
            });
            row.appendChild(btn);
        }
        container.appendChild(row);
    }

    function renderPrefsItem(container, item) {
        if (item.checkbox) {
            appendPrefsCheckbox(container, {
                label: item.checkbox,
                checked: item.checked,
                description: item.description || item.sub,
                greyed: item.greyed,
                children: item.children ? item.children.map((c) => ({
                    label: c.checkbox || c.label,
                    checked: c.checked,
                    description: c.description || c.sub,
                    greyed: c.greyed,
                })) : null,
            }, item.indent);
            if (item.button) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'capsule-browser-prefs__btn capsule-browser-prefs__btn--inline';
                btn.textContent = item.button;
                btn.addEventListener('click', function onItemBtnClick() {
                    setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: item.button }, 'Menu : bientôt disponible.'));
                });
                container.appendChild(btn);
            }
            return;
        }
        if (item.radio) {
            appendPrefsRadioGroup(container, [{ label: item.radio, selected: item.selected, description: item.description, button: item.button }]);
            return;
        }
        if (item.infoBox || item.infoText) {
            appendPrefsInfoBox(container, item.infoBox || item.infoText);
            return;
        }
        if (item.permission) {
            appendPrefsSelectRow(container, { label: item.permission, select: '', button: item.button });
            return;
        }
        if (item.select && item.label) {
            appendPrefsSelectRow(container, item);
            return;
        }
        if (item.label && item.button && !item.select) {
            appendPrefsButtonRow(container, { title: item.label, button: item.button });
            return;
        }
        if (item.button && item.description) {
            appendPrefsButtonRow(container, item);
            return;
        }
        if (item.button) {
            appendPrefsButtonRow(container, { title: '', button: item.button });
        }
    }

    function renderPrefsSubsection(container, subsection) {
        appendPrefsSubsectionTitle(container, subsection.title);
        if (subsection.description) {
            appendPrefsDescription(container, subsection.description);
        }
        if (subsection.intro) {
            appendPrefsDescription(container, subsection.intro);
        }
        if (subsection.items) {
            let pendingRadios = [];
            subsection.items.forEach(function dispatchItem(item) {
                if (item.radio) {
                    pendingRadios.push(item);
                    return;
                }
                if (pendingRadios.length) {
                    appendPrefsRadioGroup(container, pendingRadios);
                    pendingRadios = [];
                }
                renderPrefsItem(container, item);
            });
            if (pendingRadios.length) {
                appendPrefsRadioGroup(container, pendingRadios);
            }
        }
        if (subsection.options) {
            appendPrefsRadioGroup(container, subsection.options.map((o) => ({ label: o.radio, selected: o.selected, description: o.description })));
        }
        if (subsection.subsections) {
            subsection.subsections.forEach(function renderNested(nested) {
                renderPrefsSubsection(container, nested);
            });
        }
        if (subsection.content) {
            appendPrefsDescription(container, subsection.content.description || '');
            if (subsection.content.button) {
                appendPrefsButtonRow(container, { title: '', button: subsection.content.button });
            }
        }
        if (subsection.shortcuts) {
            const list = document.createElement('div');
            list.className = 'capsule-browser-prefs__shortcut-list';
            subsection.shortcuts.forEach(function appendShortcut(sc) {
                const row = document.createElement('div');
                row.className = 'capsule-browser-prefs__shortcut-row';
                const name = document.createElement('span');
                name.textContent = sc.name;
                const keyword = document.createElement('span');
                keyword.className = 'capsule-browser-prefs__item-description';
                keyword.textContent = sc.keyword;
                row.appendChild(name);
                row.appendChild(keyword);
                list.appendChild(row);
            });
            container.appendChild(list);
        }
        if (subsection.table) {
            const table = document.createElement('div');
            table.className = 'capsule-browser-prefs__table';
            subsection.table.forEach(function appendRow(row) {
                const rowEl = document.createElement('div');
                rowEl.className = 'capsule-browser-prefs__table-row';
                const type = document.createElement('span');
                type.textContent = row.type;
                const action = document.createElement('span');
                action.className = 'capsule-browser-prefs__item-description';
                action.textContent = row.action;
                rowEl.appendChild(type);
                rowEl.appendChild(action);
                table.appendChild(rowEl);
            });
            container.appendChild(table);
        }
    }

    function renderPrefsSectionData(content, sectionData) {
        const title = document.createElement('h2');
        title.className = 'capsule-browser-prefs__title';
        title.textContent = sectionData.title;
        content.appendChild(title);
        if (sectionData.intro) {
            appendPrefsDescription(content, sectionData.intro);
        }
        (sectionData.subsections || []).forEach(function renderTop(subsection) {
            renderPrefsSubsection(content, subsection);
        });
        if (sectionData.content) {
            appendPrefsDescription(content, sectionData.content.description || '');
            if (sectionData.content.button) {
                appendPrefsButtonRow(content, { title: '', button: sectionData.content.button });
            }
        }
    }

    function renderPrefsOtherSection(content, section) {
        const title = document.createElement('h2');
        title.className = 'capsule-browser-prefs__title';
        title.textContent = section.label;
        content.appendChild(title);
        appendPrefsPlaceholder(content, capsuleStr('firefox.prefsSectionComingSoon', 'Cette section sera complétée dans une prochaine passe.'));
    }

    function buildPrefsGeneralData() {
        return {
            title: capsuleStr('firefox.prefsSectionGeneral', 'Général'),
            subsections: [
                {
                    title: capsuleStr('firefox.prefsGeneralStartup', 'Démarrage'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsStartupReopen', 'Ouvrir les fenêtres et onglets précédents'), checked: false },
                        { checkbox: capsuleStr('firefox.prefsStartupCheckDefault', 'Toujours vérifier que Firefox est votre navigateur par défaut'), checked: false },
                        { infoBox: capsuleStr('firefox.prefsStartupIsDefault', 'Firefox est votre navigateur par défaut') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralImport', 'Importer des données d’un navigateur'),
                    description: capsuleStr('firefox.prefsImportDesc', 'Importer les marques-pages, les mots de passe, l’historique et les données de remplissage automatique dans Firefox'),
                    items: [{ button: capsuleStr('firefox.prefsImportBtn', 'Importer des données') }],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralProfiles', 'Profils'),
                    description: capsuleStr('firefox.prefsProfilesDesc', 'Chaque profil dispose de données de navigation et de paramètres distincts, comme l’historique, les mots de passe, etc. En savoir plus'),
                    items: [{ button: capsuleStr('firefox.prefsProfilesBtn', 'Gérer les profils') }],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralTabs', 'Onglets'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsTabsCtrlTab', 'Ctrl+Tab fait défiler vos onglets en les classant selon leur dernière utilisation'), checked: false },
                        { checkbox: capsuleStr('firefox.prefsTabsOpenLinksInTabs', 'Ouvrir les liens dans les onglets au lieu de nouvelles fenêtres'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsTabsOpenFromApps', 'Ouvrir les liens provenant d’applications à côté de l’onglet que vous consultez'), checked: false },
                        { checkbox: capsuleStr('firefox.prefsTabsSwitchImmediately', 'À l’ouverture d’un lien, d’une image ou d’un média dans un nouvel onglet, basculer vers celui-ci immédiatement'), checked: false },
                        { checkbox: capsuleStr('firefox.prefsTabsWarnClose', 'Me demander avant de fermer plusieurs onglets'), checked: false },
                        { checkbox: capsuleStr('firefox.prefsTabsWarnQuit', 'Me demander avant de quitter avec Ctrl+Q'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsTabsHoverPreview', 'Afficher un aperçu au survol des onglets'), checked: true },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralLayout', 'Disposition du navigateur'),
                    items: [
                        { radio: capsuleStr('firefox.prefsLayoutHorizontal', 'Onglets horizontaux'), selected: true, description: capsuleStr('firefox.prefsLayoutHorizontalDesc', 'Onglets affichés en haut du navigateur') },
                        { radio: capsuleStr('firefox.prefsLayoutVertical', 'Onglets verticaux'), selected: false, description: capsuleStr('firefox.prefsLayoutVerticalDesc', 'Onglets affichés sur le côté, dans le panneau latéral') },
                        { checkbox: capsuleStr('firefox.prefsLayoutSidebar', 'Afficher le panneau latéral'), checked: false, description: capsuleStr('firefox.prefsLayoutSidebarDesc', 'Accédez rapidement aux marque-pages, aux onglets de votre téléphone, aux chatbots IA et encore plus sans quitter l’affichage principal.') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralLanguageAppearance', 'Langue et apparence'),
                    subsections: [
                        {
                            title: capsuleStr('firefox.prefsWebAppearance', 'Apparence des sites web'),
                            description: capsuleStr('firefox.prefsWebAppearanceDesc', 'Certains sites web adaptent leur jeu de couleurs en fonction de vos préférences. Choisissez le jeu de couleurs que vous souhaitez utiliser pour ces sites.'),
                            items: [
                                { radio: capsuleStr('firefox.prefsWebAppearanceAuto', 'Automatique'), selected: true },
                                { radio: capsuleStr('firefox.prefsWebAppearanceLight', 'Clair'), selected: false },
                                { radio: capsuleStr('firefox.prefsWebAppearanceDark', 'Sombre'), selected: false },
                            ],
                        },
                        {
                            title: capsuleStr('firefox.prefsContrastControl', 'Contrôle du contraste'),
                            description: capsuleStr('firefox.prefsContrastControlDesc', 'Les sites web utilisent beaucoup de couleurs différentes pour le premier plan et l’arrière-plan. Configurez Firefox pour qu’il utilise les mêmes couleurs sur tous les sites web afin d’améliorer leur lisibilité.'),
                            items: [
                                { radio: capsuleStr('firefox.prefsContrastAuto', 'Automatique (utiliser les paramètres système)'), selected: false },
                                { radio: capsuleStr('firefox.prefsContrastOff', 'Désactivé'), selected: true },
                                { radio: capsuleStr('firefox.prefsContrastCustom', 'Personnalisé'), selected: false, button: capsuleStr('firefox.prefsContrastCustomBtn', 'Gérer les couleurs...') },
                            ],
                        },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralFonts', 'Polices'),
                    items: [
                        { label: capsuleStr('firefox.prefsFontsDefault', 'Police par défaut'), select: capsuleStr('firefox.prefsFontsDefaultValue', 'Par défaut (Noto Serif)'), button: capsuleStr('firefox.prefsFontsAdvanced', 'Avancé...') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralZoom', 'Zoom'),
                    items: [
                        { label: capsuleStr('firefox.prefsZoomDefault', 'Zoom par défaut'), select: '100 %' },
                        { checkbox: capsuleStr('firefox.prefsZoomTextOnly', 'Agrandir uniquement le texte'), checked: false },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralLanguage', 'Langue'),
                    description: capsuleStr('firefox.prefsLanguageDesc', 'Choisissez en quelle langue doivent s’afficher les menus, messages et notifications de Firefox.'),
                    items: [
                        { select: 'Français', button: capsuleStr('firefox.prefsLanguageAlt', 'Choisir des alternatives...') },
                        { label: capsuleStr('firefox.prefsLanguageWebPages', 'Choix de la langue préférée pour l’affichage des pages'), button: capsuleStr('firefox.prefsChooseBtn', 'Choisir...') },
                        { checkbox: capsuleStr('firefox.prefsLanguageOsFormat', 'Utiliser les paramètres de votre système d’exploitation en « Français (France) » pour formater les dates, les heures, les nombres et les mesures.'), checked: false },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralDownloads', 'Téléchargements'),
                    items: [
                        { label: capsuleStr('firefox.prefsDownloadsFolder', 'Téléchargements'), button: capsuleStr('firefox.prefsBrowseBtn', 'Parcourir...') },
                        { checkbox: capsuleStr('firefox.prefsDownloadsAskWhere', 'Toujours demander où enregistrer les fichiers'), checked: false },
                        { checkbox: capsuleStr('firefox.prefsDownloadsDeletePrivate', 'Supprimer les fichiers téléchargés en navigation privée quand toutes les fenêtres de navigation privée sont fermées'), checked: false },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsGeneralApplications', 'Applications'),
                    description: capsuleStr('firefox.prefsApplicationsDesc', 'Définissez le comportement de Firefox avec les fichiers que vous téléchargez et les applications que vous utilisez lorsque vous naviguez.'),
                    table: [
                        { type: 'Extensible Markup Language (XML)', action: capsuleStr('firefox.prefsAppActionSave', 'Enregistrer le fichier') },
                        { type: capsuleStr('firefox.prefsAppTypeAvif', 'Fichier image AV1 (AVIF)'), action: capsuleStr('firefox.prefsAppActionOpenFirefox', 'Ouvrir dans Firefox') },
                        { type: capsuleStr('firefox.prefsAppTypeWebp', 'Image WebP'), action: capsuleStr('firefox.prefsAppActionOpenFirefox', 'Ouvrir dans Firefox') },
                        { type: 'mailto', action: capsuleStr('firefox.prefsAppActionThunderbird', 'Utiliser Messagerie Thunderbird (par défaut)') },
                        { type: capsuleStr('firefox.prefsAppTypePdf', 'Portable Document Format (PDF)'), action: capsuleStr('firefox.prefsAppActionOpenFirefox', 'Ouvrir dans Firefox') },
                        { type: capsuleStr('firefox.prefsAppTypeSvg', 'Scalable Vector Graphics (SVG)'), action: capsuleStr('firefox.prefsAppActionSave', 'Enregistrer le fichier') },
                    ],
                },
            ],
        };
    }

    function buildPrefsHomeData() {
        return {
            title: capsuleStr('firefox.prefsSectionHome', 'Accueil'),
            subsections: [
                {
                    title: capsuleStr('firefox.prefsHomeNewWindows', 'Nouvelles fenêtres et nouveaux onglets'),
                    description: capsuleStr('firefox.prefsHomeNewWindowsDesc', 'Choisissez ce qui est affiché lorsque vous ouvrez votre page d’accueil, de nouvelles fenêtres ou de nouveaux onglets.'),
                    items: [
                        { label: capsuleStr('firefox.prefsHomeAndWindows', 'Page d’accueil et nouvelles fenêtres'), select: capsuleStr('firefox.prefsHomeDefaultValue', 'Page d’accueil de Firefox (par défaut)') },
                        { label: capsuleStr('firefox.prefsHomeNewTabs', 'Nouveaux onglets'), select: capsuleStr('firefox.prefsHomeDefaultValue', 'Page d’accueil de Firefox (par défaut)') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsHomeContent', 'Contenu de la Page d’accueil de Firefox'),
                    description: capsuleStr('firefox.prefsHomeContentDesc', 'Choisissez le contenu que vous souhaitez pour la Page d’accueil de Firefox.'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsHomeWebSearch', 'Recherche web'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsHomeShortcuts', 'Raccourcis'), checked: true, sub: capsuleStr('firefox.prefsHomeShortcutsSub', 'Sites que vous enregistrez ou visitez') },
                        { checkbox: capsuleStr('firefox.prefsHomeRecommended', 'Articles recommandés'), checked: true, sub: capsuleStr('firefox.prefsHomeRecommendedSub', 'Contenu exceptionnel sélectionné par les membres de la gamme de produits Firefox') },
                        {
                            checkbox: capsuleStr('firefox.prefsHomeSupport', 'Soutenir Firefox'), checked: true,
                            children: [
                                { checkbox: capsuleStr('firefox.prefsHomeSponsoredShortcuts', 'Raccourcis sponsorisés'), checked: true },
                                { checkbox: capsuleStr('firefox.prefsHomeSponsoredArticles', 'Articles sponsorisés'), checked: true },
                            ],
                        },
                        {
                            checkbox: capsuleStr('firefox.prefsHomeRecentActivity', 'Activité récente'), checked: false, sub: capsuleStr('firefox.prefsHomeRecentActivitySub', 'Une sélection de sites et de contenus récents'),
                            children: [
                                { checkbox: capsuleStr('firefox.prefsHomeVisitedPages', 'Pages visitées'), greyed: true },
                                { checkbox: capsuleStr('firefox.prefsHomeBookmarks2', 'Marque-pages'), greyed: true },
                                { checkbox: capsuleStr('firefox.prefsHomeLastDownload', 'Dernier téléchargement'), greyed: true },
                            ],
                        },
                    ],
                },
            ],
        };
    }

    function buildPrefsSearchData() {
        return {
            title: capsuleStr('firefox.prefsSectionSearch', 'Recherche'),
            subsections: [
                {
                    title: capsuleStr('firefox.prefsSearchDefaultEngine', 'Moteur de recherche par défaut'),
                    description: capsuleStr('firefox.prefsSearchDefaultEngineDesc', 'Ceci est votre moteur de recherche par défaut dans la barre d’adresse et la barre de recherche. Vous pouvez le changer à tout moment.'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsSearchShowTerms', 'Afficher les termes des recherches dans la barre d’adresse des pages de résultats'), checked: true },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsSearchSuggestions', 'Suggestions de recherche'),
                    description: capsuleStr('firefox.prefsSearchSuggestionsDesc', 'Choisissez comment apparaîtront les suggestions des moteurs de recherche.'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsSearchShowSuggestions', 'Afficher les suggestions de recherche'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsSearchSuggestionsBeforeHistory', 'Afficher les suggestions de recherche avant l’historique de navigation dans les résultats de la barre d’adresse'), checked: true, indent: 1 },
                        { checkbox: capsuleStr('firefox.prefsSearchSuggestionsPrivate', 'Afficher les suggestions de recherche dans les fenêtres de navigation privée'), checked: false, indent: 1 },
                        { checkbox: capsuleStr('firefox.prefsSearchSuggestionsPopular', 'Afficher les suggestions de recherche populaires'), checked: true, indent: 1 },
                        { checkbox: capsuleStr('firefox.prefsSearchRecent', 'Afficher les recherches récentes'), checked: true },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsSearchFirefoxSuggests', 'Firefox suggère'),
                    description: capsuleStr('firefox.prefsSearchFirefoxSuggestsDesc', 'Des suggestions de Firefox et de nos partenaires dans votre barre d’adresse. En savoir plus'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsSearchHistory', 'Historique de navigation'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsSearchBookmarksItem', 'Marque-pages'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsSearchOpenTabs', 'Onglets ouverts'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsSearchShortcutsItem', 'Raccourcis'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsSearchSuggestEngines', 'Suggérer des moteurs de recherche à utiliser'), checked: true },
                        { checkbox: capsuleStr('firefox.prefsSearchQuickActions', 'Actions rapides'), checked: true },
                        {
                            checkbox: capsuleStr('firefox.prefsSearchFirefoxSuggestions', 'Suggestions de Firefox'), checked: true, sub: capsuleStr('firefox.prefsSearchFirefoxSuggestionsSub', 'Obtenir des suggestions du Web en rapport avec votre recherche.'),
                            children: [
                                { checkbox: capsuleStr('firefox.prefsSearchSponsoredSuggestions', 'Suggestions de sponsors'), checked: true, description: capsuleStr('firefox.prefsSearchSponsoredSuggestionsSub', 'Soutenez Firefox en affichant de temps en temps des suggestions sponsorisées.') },
                            ],
                        },
                        { label: capsuleStr('firefox.prefsSearchRejected', 'Suggestions rejetées — Restaurer les suggestions rejetées des sponsors et de Firefox.'), button: capsuleStr('firefox.prefsRestoreBtn', 'Restaurer') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsSearchShortcutsTitle', 'Raccourcis de recherche'),
                    description: capsuleStr('firefox.prefsSearchShortcutsDesc', 'Sélectionnez les moteurs de recherche alternatifs qui apparaissent sous la barre d’adresse et la barre de recherche lorsque vous commencez à saisir un mot-clé.'),
                    shortcuts: [
                        { name: 'Bing', keyword: '@bing' },
                        { name: 'DuckDuckGo', keyword: '@duckduckgo, @ddg' },
                        { name: 'eBay', keyword: '@ebay' },
                        { name: 'Perplexity', keyword: '@perplexity' },
                        { name: 'Qwant', keyword: '@qwant' },
                        { name: capsuleStr('firefox.prefsWikipediaFr', 'Wikipédia (fr)'), keyword: '@wikipédia, @wikipedia' },
                        { name: capsuleStr('firefox.prefsSearchBookmarksItem', 'Marque-pages'), keyword: '@marque-pages, @bookmarks, *' },
                        { name: capsuleStr('firefox.prefsSearchOpenTabs2', 'Onglets'), keyword: '@onglets, @tabs, %' },
                        { name: capsuleStr('firefox.prefsSearchHistoryItem', 'Historique'), keyword: '@historique, @history, ^' },
                        { name: capsuleStr('firefox.prefsSearchActionsItem', 'Actions'), keyword: '@actions, >' },
                    ],
                },
            ],
        };
    }

    function buildPrefsPrivacyData() {
        return {
            title: capsuleStr('firefox.prefsSectionPrivacy', 'Vie privée et sécurité'),
            subsections: [
                {
                    title: capsuleStr('firefox.prefsPrivacyTracking', 'Protection renforcée contre le pistage'),
                    intro: capsuleStr('firefox.prefsPrivacyTrackingIntro', 'Les traqueurs vous suivent en ligne pour collecter des informations sur vos habitudes de navigation et vos centres d’intérêt. Firefox bloque un grand nombre de ces traqueurs et de scripts malveillants. En savoir plus'),
                    items: [
                        { radio: capsuleStr('firefox.prefsPrivacyStandard', 'Standard'), selected: true, description: capsuleStr('firefox.prefsPrivacyStandardDesc', 'Équilibré entre protection et performances. Les pages se chargeront normalement.') },
                        { radio: capsuleStr('firefox.prefsPrivacyStrict', 'Stricte'), selected: false, description: capsuleStr('firefox.prefsPrivacyStrictDesc', 'Protection renforcée, mais certains sites ou contenus peuvent ne pas fonctionner correctement.') },
                        { radio: capsuleStr('firefox.prefsPrivacyCustom', 'Personnalisée'), selected: false, description: capsuleStr('firefox.prefsPrivacyCustomDesc', 'Choisissez les traqueurs et les scripts à bloquer.') },
                        { infoBox: capsuleStr('firefox.prefsPrivacyCookieProtection', 'Inclut la protection totale contre les cookies, notre fonctionnalité de protection de la vie privée la plus puissante') },
                        { button: capsuleStr('firefox.prefsManageExceptions', 'Gérer les exceptions...') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyWebsitePrefs', 'Préférences de confidentialité des sites web'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsPrivacyDoNotSell', 'Demander aux sites web de ne pas vendre ni partager mes données'), checked: false },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyCookies', 'Cookies et données de sites'),
                    items: [
                        { button: capsuleStr('firefox.prefsClearData', '🔥 Effacer les données de navigation') },
                        { infoBox: capsuleStr('firefox.prefsCookiesDiskUsage', 'Le stockage des cookies, de l’historique, des données de sites et du cache utilise actuellement 105 Mo d’espace disque.') },
                        { button: capsuleStr('firefox.prefsManageBrowsingData', 'Gérer les données de navigation') },
                        { title: capsuleStr('firefox.prefsManageExceptionsTitle', 'Vous pouvez spécifier quels sites web sont toujours ou jamais autorisés à utiliser des cookies et des données de site.'), button: capsuleStr('firefox.prefsManageExceptions', 'Gérer les exceptions...') },
                        { checkbox: capsuleStr('firefox.prefsCookiesDeleteOnClose', 'Supprimer les cookies et les données des sites à la fermeture de Firefox'), checked: false },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyPasswords', 'Mots de passe'),
                    items: [
                        {
                            checkbox: capsuleStr('firefox.prefsPasswordsOffer', 'Proposer d’enregistrer les mots de passe'), checked: true, button: capsuleStr('firefox.prefsExceptionsBtn', 'Exceptions...'),
                            children: [
                                { checkbox: capsuleStr('firefox.prefsPasswordsAutofill', 'Remplir automatiquement les noms d’utilisateur et mots de passe'), checked: true },
                                { checkbox: capsuleStr('firefox.prefsPasswordsSuggest', 'Suggérer des mots de passe compliqués...'), checked: true },
                                { checkbox: capsuleStr('firefox.prefsPasswordsRelay', 'Proposer des alias de messagerie Firefox Relay pour protéger votre adresse e-mail'), checked: true },
                                { checkbox: capsuleStr('firefox.prefsPasswordsBreachAlerts', 'Afficher des alertes pour les mots de passe de sites concernés par des fuites de données'), checked: true },
                            ],
                        },
                        { checkbox: capsuleStr('firefox.prefsPasswordsPrimary', 'Utiliser un mot de passe principal'), checked: false, button: capsuleStr('firefox.prefsChangePrimaryPassword', 'Changer le mot de passe principal...') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyPayments', 'Moyens de paiement'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsPaymentsAutofill', 'Enregistrer et renseigner automatiquement les informations de paiement'), checked: true },
                        { button: capsuleStr('firefox.prefsManagePayments', 'Gérer les moyens de paiement') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyAddresses', 'Adresses et autres informations'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsAddressesAutofill', 'Enregistrer et remplir automatiquement les adresses'), checked: true },
                        { button: capsuleStr('firefox.prefsManageAddresses', 'Gérer les adresses et les autres informations') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyHistory', 'Historique'),
                    items: [
                        { label: capsuleStr('firefox.prefsHistoryRetention', 'Règles de conservation'), select: capsuleStr('firefox.prefsHistoryKeep', 'Conserver l’historique'), button: capsuleStr('firefox.prefsHistoryClearBtn', 'Effacer l’historique...') },
                        { infoText: capsuleStr('firefox.prefsHistoryInfoText', 'Firefox conservera les données de navigation, les téléchargements, les formulaires et l’historique de recherche.') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyPermissions', 'Permissions'),
                    items: [
                        { permission: capsuleStr('firefox.prefsPermLocation', 'Localisation'), button: capsuleStr('firefox.prefsSettingsBtn', 'Paramètres...') },
                        { permission: capsuleStr('firefox.prefsPermCamera', 'Caméra'), button: capsuleStr('firefox.prefsSettingsBtn', 'Paramètres...') },
                        { permission: capsuleStr('firefox.prefsPermMicrophone', 'Microphone'), button: capsuleStr('firefox.prefsSettingsBtn', 'Paramètres...') },
                        { permission: capsuleStr('firefox.prefsPermSpeaker', 'Sélection du haut-parleur'), button: capsuleStr('firefox.prefsSettingsBtn', 'Paramètres...') },
                        { permission: capsuleStr('firefox.prefsPermNotifications', 'Notifications'), button: capsuleStr('firefox.prefsSettingsBtn', 'Paramètres...') },
                        { permission: capsuleStr('firefox.prefsPermAutoplay', 'Lecture automatique'), button: capsuleStr('firefox.prefsSettingsBtn', 'Paramètres...') },
                        { permission: capsuleStr('firefox.prefsPermVr', 'Réalité virtuelle'), button: capsuleStr('firefox.prefsSettingsBtn', 'Paramètres...') },
                        { checkbox: capsuleStr('firefox.prefsPermBlockPopups', 'Bloquer les popups et les redirections tierces'), checked: true, button: capsuleStr('firefox.prefsExceptionsBtn', 'Exceptions...') },
                        { checkbox: capsuleStr('firefox.prefsPermWarnAddons', 'Prévenir lorsque les sites essaient d’installer des modules complémentaires'), checked: true, button: capsuleStr('firefox.prefsExceptionsBtn', 'Exceptions...') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyDataCollection', 'Collecte de données par Firefox et utilisation'),
                    description: capsuleStr('firefox.prefsPrivacyDataCollectionDesc', 'Nous nous efforçons de vous laisser le choix et de ne recueillir que le minimum de données nécessaires à l’amélioration de Firefox pour tout le monde. Consulter la politique de confidentialité'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsDataTechnical', 'Envoyer des données techniques et d’interaction à Mozilla'), checked: true, description: capsuleStr('firefox.prefsDataTechnicalDesc', 'Ce partage nous aide à améliorer les fonctionnalités, les performances et la stabilité de Firefox.') },
                        { checkbox: capsuleStr('firefox.prefsDataPersonalized', 'Autoriser les recommandations personnalisées d’extensions'), checked: true, description: capsuleStr('firefox.prefsDataPersonalizedDesc', 'Recevez des recommandations d’extensions pour améliorer votre navigation.') },
                        { checkbox: capsuleStr('firefox.prefsDataStudies', 'Installer et lancer des études'), checked: true, description: capsuleStr('firefox.prefsDataStudiesDesc', 'Testez des fonctionnalités et des idées avant qu’elles ne soient disponibles pour tout le monde.') },
                        { checkbox: capsuleStr('firefox.prefsDataPing', 'Envoyer un ping quotidien d’utilisation à Mozilla'), checked: true, description: capsuleStr('firefox.prefsDataPingDesc', 'Ce paramètre aide Mozilla à évaluer le nombre d’utilisateurs actifs.') },
                        { checkbox: capsuleStr('firefox.prefsDataCrashReports', 'Envoyer automatiquement les rapports de plantage'), checked: false, description: capsuleStr('firefox.prefsDataCrashReportsDesc', 'Les rapports de plantage permettent à Mozilla de diagnostiquer et de corriger des problèmes avec le navigateur. Les rapports peuvent contenir des données personnelles ou sensibles.') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacySecurity', 'Sécurité'),
                    items: [
                        {
                            checkbox: capsuleStr('firefox.prefsSecurityBlockDangerous', 'Bloquer les contenus dangereux ou trompeurs'), checked: true,
                            children: [
                                { checkbox: capsuleStr('firefox.prefsSecurityBlockDownloads', 'Bloquer les téléchargements dangereux'), checked: true },
                                { checkbox: capsuleStr('firefox.prefsSecurityReportUnwanted', 'Signaler la présence de logiciels indésirables ou peu communs'), checked: true },
                            ],
                        },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyCertificates', 'Certificats'),
                    description: capsuleStr('firefox.prefsCertificatesDesc', 'Configurer les certificats que Firefox utilise pour l’authentification. En savoir plus'),
                    items: [
                        { button: capsuleStr('firefox.prefsShowCertificates', 'Afficher les certificats...') },
                        { button: capsuleStr('firefox.prefsSecurityDevices', 'Périphériques de sécurité...') },
                    ],
                },
                {
                    title: capsuleStr('firefox.prefsPrivacyHttps', 'Mode HTTPS uniquement'),
                    description: capsuleStr('firefox.prefsHttpsDesc', 'Ce mode autorise seulement les connexions sécurisées aux sites web. Firefox demande avant d’établir une connexion non sécurisée. En savoir plus'),
                    items: [
                        { radio: capsuleStr('firefox.prefsHttpsAll', 'Activer le mode HTTPS uniquement dans toutes les fenêtres'), selected: false },
                        { radio: capsuleStr('firefox.prefsHttpsPrivate', 'Activer le mode HTTPS uniquement dans les fenêtres privées seulement'), selected: false },
                        { radio: capsuleStr('firefox.prefsHttpsOff', 'Ne pas activer le mode HTTPS uniquement'), selected: true, description: capsuleStr('firefox.prefsHttpsOffDesc', 'Firefox peut tout de même surclasser certaines connexions') },
                        { button: capsuleStr('firefox.prefsManageExceptions', 'Gérer les exceptions...') },
                    ],
                },
            ],
        };
    }

    function buildPrefsSyncData() {
        return {
            title: capsuleStr('firefox.prefsSectionSync', 'Synchronisation'),
            subsections: [
                {
                    title: capsuleStr('firefox.prefsSyncHeadline', 'Emportez votre Web partout avec vous'),
                    description: capsuleStr('firefox.prefsSyncDesc', 'Synchronisez marque-pages, historique, onglets, mots de passe, modules complémentaires et paramètres entre tous vos appareils.'),
                    items: [
                        { button: capsuleStr('firefox.prefsSyncSignIn', 'Se connecter pour synchroniser...') },
                    ],
                },
            ],
        };
    }

    function buildPrefsLabsData() {
        return {
            title: capsuleStr('firefox.prefsSectionLabs', 'Firefox Labs'),
            intro: capsuleStr('firefox.prefsLabsIntro', 'Essayez nos fonctionnalités expérimentales ! Elles sont en cours de développement et évoluent, ce qui peut avoir un effet sur le fonctionnement de Firefox.'),
            subsections: [
                {
                    title: capsuleStr('firefox.prefsLabsCustomize', 'Personnalisez votre navigation'),
                    items: [
                        { checkbox: capsuleStr('firefox.prefsLabsIme', 'Barre d’adresse : afficher les résultats pendant la composition IME'), checked: false, description: capsuleStr('firefox.prefsLabsImeDesc', 'Un IME (Input Method Editor, éditeur de méthode de saisie) est un outil qui permet la saisie de symboles complexes. Activer cette expérience conserve ouvert le panneau de la barre d’adresse pendant que l’IME est utilisé pour saisir du texte.') },
                    ],
                },
            ],
        };
    }

    function getPrefsSectionData(sectionId) {
        if (sectionId === 'general') { return buildPrefsGeneralData(); }
        if (sectionId === 'home') { return buildPrefsHomeData(); }
        if (sectionId === 'search') { return buildPrefsSearchData(); }
        if (sectionId === 'privacy') { return buildPrefsPrivacyData(); }
        if (sectionId === 'sync') { return buildPrefsSyncData(); }
        if (sectionId === 'labs') { return buildPrefsLabsData(); }
        return null;
    }

    function renderPreferencesPanel() {
        if (!preferencesView) {
            return;
        }
        preferencesView.replaceChildren();

        const wrap = document.createElement('div');
        wrap.className = 'capsule-browser-prefs';

        const sidebar = document.createElement('aside');
        sidebar.className = 'capsule-browser-prefs__sidebar';

        const search = document.createElement('div');
        search.className = 'capsule-browser-prefs__search';
        search.textContent = capsuleStr('firefox.prefsTopSearch', 'Rechercher dans les paramètres');
        sidebar.appendChild(search);

        const nav = document.createElement('nav');
        nav.className = 'capsule-browser-prefs__nav';
        prefsSidebarSections.forEach(function appendSidebarItem(section) {
            if (section.sep) {
                const sep = document.createElement('div');
                sep.className = 'capsule-browser-prefs__nav-separator';
                nav.appendChild(sep);
                return;
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'capsule-browser-prefs__nav-item'
                + (section.id === prefsActiveSection ? ' capsule-browser-prefs__nav-item--active' : '');
            btn.setAttribute('data-browser-prefs-section', section.id);
            const icon = document.createElement('span');
            icon.className = 'capsule-browser-prefs__nav-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = section.icon;
            const label = document.createElement('span');
            label.textContent = section.label;
            btn.appendChild(icon);
            btn.appendChild(label);
            nav.appendChild(btn);
        });
        sidebar.appendChild(nav);

        const content = document.createElement('div');
        content.className = 'capsule-browser-prefs__content';

        const activeSection = prefsSidebarSections.filter((s) => s.id === prefsActiveSection)[0];
        const sectionData = getPrefsSectionData(prefsActiveSection);
        if (sectionData) {
            renderPrefsSectionData(content, sectionData);
        } else if (activeSection) {
            renderPrefsOtherSection(content, activeSection);
        }

        wrap.appendChild(sidebar);
        wrap.appendChild(content);
        preferencesView.appendChild(wrap);
    }

    if (preferencesView) {
        preferencesView.addEventListener('click', function onPrefsNavClick(event) {
            const item = event.target.closest('[data-browser-prefs-section]');
            if (!item || !preferencesView.contains(item)) {
                return;
            }
            const sectionId = item.getAttribute('data-browser-prefs-section');
            if (sectionId === prefsActiveSection) {
                return;
            }
            prefsActiveSection = sectionId;
            renderPreferencesPanel();
        });
    }

    function openPreferences() {
        addTab();
        applyEntryToTab(getActiveTab(), makePreferencesEntry(), {});
    }

    const devtoolsPanel = browserRoot.querySelector('[data-browser-devtools]');
    const devtoolsTabs = [
        { id: 'inspecteur', label: capsuleStr('firefox.devtoolsTabInspector', 'Inspecteur') },
        { id: 'console', label: capsuleStr('firefox.devtoolsTabConsole', 'Console') },
        { id: 'debogueur', label: capsuleStr('firefox.devtoolsTabDebugger', 'Débogueur') },
        { id: 'reseau', label: capsuleStr('firefox.devtoolsTabNetwork', 'Réseau') },
        { id: 'editeur-style', label: capsuleStr('firefox.devtoolsTabStyleEditor', 'Éditeur de style') },
        { id: 'performances', label: capsuleStr('firefox.devtoolsTabPerformance', 'Performances') },
        { id: 'memoire', label: capsuleStr('firefox.devtoolsTabMemory', 'Mémoire') },
        { id: 'stockage', label: capsuleStr('firefox.devtoolsTabStorage', 'Stockage') },
        { id: 'accessibilite', label: capsuleStr('firefox.devtoolsTabAccessibility', 'Accessibilité') },
        { id: 'applications', label: capsuleStr('firefox.devtoolsTabApplications', 'Applications') },
    ];

    let devtoolsActiveTab = 'inspecteur';

    function dtSection(container, title) {
        const h = document.createElement('h4');
        h.className = 'capsule-browser-devtools__section-title';
        h.textContent = title;
        container.appendChild(h);
    }

    function dtToolbar(container, labels) {
        const row = document.createElement('div');
        row.className = 'capsule-browser-devtools__toolbar';
        labels.forEach(function appendIcon(label) {
            const span = document.createElement('span');
            span.className = 'capsule-browser-devtools__toolbar-icon';
            span.textContent = label;
            row.appendChild(span);
        });
        container.appendChild(row);
    }

    function dtEmptyState(container, text) {
        const p = document.createElement('p');
        p.className = 'capsule-browser-devtools__empty';
        p.textContent = text;
        container.appendChild(p);
    }

    function renderDtInspecteur(container) {
        const wrap = document.createElement('div');
        wrap.className = 'capsule-browser-devtools__columns';

        const left = document.createElement('div');
        left.className = 'capsule-browser-devtools__col';
        dtSection(left, capsuleStr('firefox.devtoolsInspectorHtmlTree', 'Arborescence HTML'));
        dtToolbar(left, [capsuleStr('firefox.devtoolsInspectorSearch', 'Rechercher dans le HTML'), '+', '🔍']);
        dtEmptyState(left, capsuleStr('firefox.devtoolsInspectorHint', 'Survolez ou cliquez un élément de la page pour l’inspecter.'));

        const mid = document.createElement('div');
        mid.className = 'capsule-browser-devtools__col';
        dtSection(mid, capsuleStr('firefox.devtoolsInspectorCssRules', 'Règles CSS'));
        dtToolbar(mid, [capsuleStr('firefox.devtoolsInspectorFilterStyles', 'Filtrer les styles'), ':hov', '.cls', '+']);
        dtEmptyState(mid, capsuleStr('firefox.devtoolsInspectorNoSelection', 'Aucun élément sélectionné.'));

        const right = document.createElement('div');
        right.className = 'capsule-browser-devtools__col';
        const tabs = document.createElement('div');
        tabs.className = 'capsule-browser-devtools__subtabs';
        [
            capsuleStr('firefox.devtoolsInspectorLayout', 'Mise en page'),
            capsuleStr('firefox.devtoolsInspectorComputed', 'Calculé'),
            capsuleStr('firefox.devtoolsInspectorChanges', 'Modifications'),
            capsuleStr('firefox.devtoolsInspectorCompat', 'Compatibilité'),
        ].forEach(function appendSubtab(label, i) {
            const t = document.createElement('span');
            t.className = 'capsule-browser-devtools__subtab' + (i === 0 ? ' capsule-browser-devtools__subtab--active' : '');
            t.textContent = label;
            tabs.appendChild(t);
        });
        right.appendChild(tabs);
        dtEmptyState(right, capsuleStr('firefox.devtoolsInspectorFlexHint', 'Sélectionnez un conteneur flexible ou un élément flex pour continuer'));

        wrap.appendChild(left);
        wrap.appendChild(mid);
        wrap.appendChild(right);
        container.appendChild(wrap);
    }

    function renderDtConsole(container) {
        dtToolbar(container, [
            '🗑', capsuleStr('firefox.devtoolsConsoleFilter', 'Filtrer'),
            capsuleStr('firefox.devtoolsConsoleErrors', 'Erreurs'), capsuleStr('firefox.devtoolsConsoleWarnings', 'Avertissements'),
            capsuleStr('firefox.devtoolsConsoleInfo', 'Informations'), capsuleStr('firefox.devtoolsConsoleLogs', 'Journaux'),
        ]);
        const repl = document.createElement('div');
        repl.className = 'capsule-browser-devtools__repl';
        const prompt = document.createElement('span');
        prompt.className = 'capsule-browser-devtools__repl-prompt';
        prompt.textContent = '>>';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'capsule-browser-devtools__repl-input';
        input.placeholder = capsuleStr('firefox.devtoolsConsolePlaceholder', 'Saisir une expression JavaScript…');
        repl.appendChild(prompt);
        repl.appendChild(input);
        container.appendChild(repl);
    }

    function renderDtDebogueur(container) {
        const wrap = document.createElement('div');
        wrap.className = 'capsule-browser-devtools__columns';

        const left = document.createElement('div');
        left.className = 'capsule-browser-devtools__col';
        const tabs = document.createElement('div');
        tabs.className = 'capsule-browser-devtools__subtabs';
        [capsuleStr('firefox.devtoolsDebuggerSources', 'Sources'), capsuleStr('firefox.devtoolsDebuggerOutline', 'Structure'), capsuleStr('firefox.devtoolsDebuggerSearch', 'Rechercher')]
            .forEach(function appendSubtab(label, i) {
                const t = document.createElement('span');
                t.className = 'capsule-browser-devtools__subtab' + (i === 0 ? ' capsule-browser-devtools__subtab--active' : '');
                t.textContent = label;
                tabs.appendChild(t);
            });
        left.appendChild(tabs);

        const mid = document.createElement('div');
        mid.className = 'capsule-browser-devtools__col capsule-browser-devtools__col--wide';
        [
            ['Ctrl+P', capsuleStr('firefox.devtoolsDebuggerGoToFile', 'Aller au fichier')],
            ['Ctrl+Maj+F', capsuleStr('firefox.devtoolsDebuggerSearchFiles', 'Rechercher dans des fichiers')],
            ['Ctrl+/', capsuleStr('firefox.devtoolsDebuggerAllShortcuts', 'Afficher tous les raccourcis')],
        ].forEach(function appendShortcut(pair) {
            const row = document.createElement('div');
            row.className = 'capsule-browser-devtools__shortcut-hint';
            const key = document.createElement('span');
            key.className = 'capsule-browser-devtools__kbd';
            key.textContent = pair[0];
            const label = document.createElement('span');
            label.textContent = pair[1];
            row.appendChild(key);
            row.appendChild(label);
            mid.appendChild(row);
        });

        const right = document.createElement('div');
        right.className = 'capsule-browser-devtools__col';
        dtSection(right, capsuleStr('firefox.devtoolsDebuggerWatch', 'Expressions espionnes'));
        dtSection(right, capsuleStr('firefox.devtoolsDebuggerBreakpoints', 'Points d’arrêt'));
        appendPrefsCheckbox(right, { label: capsuleStr('firefox.devtoolsDebuggerPauseOnDebugger', 'Pause sur une instruction « debugger »'), checked: true });
        appendPrefsCheckbox(right, { label: capsuleStr('firefox.devtoolsDebuggerPauseOnExceptions', 'Pause sur les exceptions'), checked: false });
        dtSection(right, capsuleStr('firefox.devtoolsDebuggerXhrBreakpoints', 'Points d’arrêt XHR'));
        dtSection(right, capsuleStr('firefox.devtoolsDebuggerEventBreakpoints', 'Points d’arrêt des événements'));

        wrap.appendChild(left);
        wrap.appendChild(mid);
        wrap.appendChild(right);
        container.appendChild(wrap);
    }

    function renderDtReseau(container) {
        dtToolbar(container, ['⏸', '➕', '🔍', '🚫']);
        const filterTabs = document.createElement('div');
        filterTabs.className = 'capsule-browser-devtools__subtabs';
        [capsuleStr('firefox.devtoolsNetworkAll', 'Tout'), 'HTML', 'CSS', 'JS', 'XHR', capsuleStr('firefox.devtoolsNetworkFonts', 'Polices'), capsuleStr('firefox.devtoolsNetworkImages', 'Images'), capsuleStr('firefox.devtoolsNetworkMedia', 'Médias'), 'WS', capsuleStr('firefox.devtoolsNetworkOther', 'Autre')]
            .forEach(function appendTab(label, i) {
                const t = document.createElement('span');
                t.className = 'capsule-browser-devtools__subtab' + (i === 0 ? ' capsule-browser-devtools__subtab--active' : '');
                t.textContent = label;
                filterTabs.appendChild(t);
            });
        container.appendChild(filterTabs);

        const cols = document.createElement('div');
        cols.className = 'capsule-browser-devtools__table-header';
        [
            capsuleStr('firefox.devtoolsNetworkColStatus', 'État'), capsuleStr('firefox.devtoolsNetworkColMethod', 'Méthode'),
            capsuleStr('firefox.devtoolsNetworkColDomain', 'Domaine'), capsuleStr('firefox.devtoolsNetworkColFile', 'Fichier'),
            capsuleStr('firefox.devtoolsNetworkColType', 'Type'), capsuleStr('firefox.devtoolsNetworkColTransfer', 'Transfert'),
            capsuleStr('firefox.devtoolsNetworkColSize', 'Taille'),
        ].forEach(function appendCol(label) {
            const span = document.createElement('span');
            span.textContent = label;
            cols.appendChild(span);
        });
        container.appendChild(cols);
        dtEmptyState(container, capsuleStr('firefox.devtoolsNetworkEmpty', 'Aucune requête enregistrée pour le moment. Rechargez la page pour capturer les requêtes réseau.'));
    }

    function renderDtEditeurStyle(container) {
        const wrap = document.createElement('div');
        wrap.className = 'capsule-browser-devtools__columns';

        const left = document.createElement('div');
        left.className = 'capsule-browser-devtools__col';
        dtToolbar(left, ['+', '👁', capsuleStr('firefox.devtoolsStyleEditorFilter', 'Filtrer les feuilles...')]);
        dtEmptyState(left, capsuleStr('firefox.devtoolsStyleEditorNoSheets', 'Aucune feuille de style à afficher pour cette page.'));

        const mid = document.createElement('div');
        mid.className = 'capsule-browser-devtools__col capsule-browser-devtools__col--wide';
        dtSection(mid, capsuleStr('firefox.devtoolsStyleEditorEditor', 'Éditeur CSS'));
        dtEmptyState(mid, capsuleStr('firefox.devtoolsStyleEditorSelectSheet', 'Sélectionnez une feuille de style à gauche.'));

        const right = document.createElement('div');
        right.className = 'capsule-browser-devtools__col';
        dtSection(right, capsuleStr('firefox.devtoolsStyleEditorAtRules', 'Règles @'));

        wrap.appendChild(left);
        wrap.appendChild(mid);
        wrap.appendChild(right);
        container.appendChild(wrap);
    }

    function renderDtPerformances(container) {
        const banner = document.createElement('div');
        banner.className = 'capsule-browser-devtools__banner';
        banner.textContent = capsuleStr('firefox.devtoolsPerfBanner', 'Nouveau : Firefox Profiler est à présent intégré dans les outils de développement.');
        container.appendChild(banner);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'capsule-browser-prefs__btn';
        btn.textContent = capsuleStr('firefox.devtoolsPerfStartBtn', 'Commencer l’enregistrement ↗');
        btn.addEventListener('click', function onPerfStart() {
            setStatus(capsuleStr('firefox.devtoolsPerfSoon', 'Firefox Profiler : bientôt disponible (ouvre profiler.firefox.com dans un nouvel onglet).'));
        });
        container.appendChild(btn);

        dtSection(container, capsuleStr('firefox.devtoolsPerfSettings', 'Paramètres'));
        appendPrefsSelectRow(container, { label: capsuleStr('firefox.devtoolsPerfPreset', 'Réglage'), select: capsuleStr('firefox.devtoolsPerfPresetValue', 'Développement web') });
    }

    function renderDtMemoire(container) {
        dtToolbar(container, ['🗑', '📷', '🔖', 'ℹ']);
        appendPrefsCheckbox(container, { label: capsuleStr('firefox.devtoolsMemoryAllocations', 'Enregistrer les piles d’allocations'), checked: false });
        appendPrefsSelectRow(container, { label: capsuleStr('firefox.devtoolsMemoryView', 'Afficher'), select: capsuleStr('firefox.devtoolsMemoryTreemap', 'Carte proportionnelle') });
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'capsule-browser-prefs__btn capsule-browser-devtools__center-btn';
        btn.textContent = capsuleStr('firefox.devtoolsMemoryCapture', 'Capturer un instantané');
        btn.addEventListener('click', function onCaptureSnapshot() {
            setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: btn.textContent }, 'Menu : bientôt disponible.'));
        });
        container.appendChild(btn);
    }

    function renderDtStockage(container) {
        const wrap = document.createElement('div');
        wrap.className = 'capsule-browser-devtools__columns';
        const left = document.createElement('div');
        left.className = 'capsule-browser-devtools__col';
        ['Cookies', capsuleStr('firefox.devtoolsStorageSession', 'Stockage de session'), 'Indexed DB', capsuleStr('firefox.devtoolsStorageCache', 'Stockage cache'), capsuleStr('firefox.devtoolsStorageLocal', 'Stockage local')]
            .forEach(function appendItem(label) {
                const p = document.createElement('p');
                p.className = 'capsule-browser-devtools__tree-item';
                p.textContent = label;
                left.appendChild(p);
            });
        const right = document.createElement('div');
        right.className = 'capsule-browser-devtools__col capsule-browser-devtools__col--wide';
        const cols = document.createElement('div');
        cols.className = 'capsule-browser-devtools__table-header';
        ['Nom', 'Valeur', 'Domain', 'Path', capsuleStr('firefox.devtoolsStorageExpiry', 'Expiration')].forEach(function appendCol(label) {
            const span = document.createElement('span');
            span.textContent = label;
            cols.appendChild(span);
        });
        right.appendChild(cols);
        dtEmptyState(right, capsuleStr('firefox.devtoolsStorageEmpty', 'Sélectionnez un type de stockage à gauche.'));
        wrap.appendChild(left);
        wrap.appendChild(right);
        container.appendChild(wrap);
    }

    function renderDtAccessibilite(container) {
        dtToolbar(container, [
            capsuleStr('firefox.devtoolsA11ySearchProblems', 'Recherche de problèmes pour :'), capsuleStr('firefox.devtoolsA11yNone', 'Aucun'),
            capsuleStr('firefox.devtoolsA11ySimulate', 'Simuler :'), '👁',
        ]);
        appendPrefsCheckbox(container, { label: capsuleStr('firefox.devtoolsA11yTabOrder', 'Afficher l’ordre de tabulation'), checked: false });
        dtSection(container, capsuleStr('firefox.devtoolsA11yChecks', 'Vérifications'));
        dtEmptyState(container, capsuleStr('firefox.devtoolsA11yNoNode', 'Sélectionnez un nœud pour afficher ses propriétés d’accessibilité.'));
    }

    function renderDtApplications(container) {
        const wrap = document.createElement('div');
        wrap.className = 'capsule-browser-devtools__columns';
        const left = document.createElement('div');
        left.className = 'capsule-browser-devtools__col';
        [capsuleStr('firefox.devtoolsAppServiceWorkers', 'Service workers'), capsuleStr('firefox.devtoolsAppManifest', 'Manifeste')].forEach(function appendItem(label) {
            const p = document.createElement('p');
            p.className = 'capsule-browser-devtools__tree-item';
            p.textContent = label;
            left.appendChild(p);
        });
        const right = document.createElement('div');
        right.className = 'capsule-browser-devtools__col capsule-browser-devtools__col--wide';
        dtEmptyState(right, capsuleStr('firefox.devtoolsAppNoServiceWorker', 'Aucun service worker trouvé.'));
        wrap.appendChild(left);
        wrap.appendChild(right);
        container.appendChild(wrap);
    }

    function renderDevToolsPanel() {
        if (!devtoolsPanel) {
            return;
        }
        devtoolsPanel.replaceChildren();

        const tabBar = document.createElement('div');
        tabBar.className = 'capsule-browser-devtools__tabbar';

        const tabsList2 = document.createElement('div');
        tabsList2.className = 'capsule-browser-devtools__tabs';
        devtoolsTabs.forEach(function appendTab(tab) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'capsule-browser-devtools__tab'
                + (tab.id === devtoolsActiveTab ? ' capsule-browser-devtools__tab--active' : '');
            btn.setAttribute('data-browser-devtools-tab', tab.id);
            btn.textContent = tab.label;
            tabsList2.appendChild(btn);
        });
        tabBar.appendChild(tabsList2);

        const controls = document.createElement('div');
        controls.className = 'capsule-browser-devtools__controls';
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'capsule-browser-devtools__control-btn';
        closeBtn.setAttribute('data-browser-devtools-close', '');
        closeBtn.setAttribute('aria-label', capsuleStr('firefox.devtoolsCloseAria', 'Fermer les outils de développement'));
        closeBtn.textContent = '×';
        controls.appendChild(closeBtn);
        tabBar.appendChild(controls);

        devtoolsPanel.appendChild(tabBar);

        const content = document.createElement('div');
        content.className = 'capsule-browser-devtools__content';
        if (devtoolsActiveTab === 'inspecteur') { renderDtInspecteur(content); }
        else if (devtoolsActiveTab === 'console') { renderDtConsole(content); }
        else if (devtoolsActiveTab === 'debogueur') { renderDtDebogueur(content); }
        else if (devtoolsActiveTab === 'reseau') { renderDtReseau(content); }
        else if (devtoolsActiveTab === 'editeur-style') { renderDtEditeurStyle(content); }
        else if (devtoolsActiveTab === 'performances') { renderDtPerformances(content); }
        else if (devtoolsActiveTab === 'memoire') { renderDtMemoire(content); }
        else if (devtoolsActiveTab === 'stockage') { renderDtStockage(content); }
        else if (devtoolsActiveTab === 'accessibilite') { renderDtAccessibilite(content); }
        else if (devtoolsActiveTab === 'applications') { renderDtApplications(content); }
        devtoolsPanel.appendChild(content);
    }

    function openDevTools() {
        if (!devtoolsPanel) {
            return;
        }
        devtoolsPanel.hidden = false;
        renderDevToolsPanel();
    }

    function closeDevTools() {
        if (!devtoolsPanel) {
            return;
        }
        devtoolsPanel.hidden = true;
    }

    function toggleDevTools() {
        if (!devtoolsPanel) {
            return;
        }
        if (devtoolsPanel.hidden) {
            openDevTools();
        } else {
            closeDevTools();
        }
    }

    if (devtoolsPanel) {
        devtoolsPanel.addEventListener('click', function onDevtoolsClick(event) {
            const closeBtn = event.target.closest('[data-browser-devtools-close]');
            if (closeBtn) {
                closeDevTools();
                return;
            }
            const tabBtn = event.target.closest('[data-browser-devtools-tab]');
            if (!tabBtn) {
                return;
            }
            const tabId = tabBtn.getAttribute('data-browser-devtools-tab');
            if (tabId === devtoolsActiveTab) {
                return;
            }
            devtoolsActiveTab = tabId;
            renderDevToolsPanel();
        });
    }

    let urlBarPopup = null;
    let urlBarActiveIndex = -1;

    function ensureUrlBarPopup() {
        if (urlBarPopup) {
            return urlBarPopup;
        }
        urlBarPopup = document.createElement('div');
        urlBarPopup.className = 'capsule-browser__urlbar-popup';
        urlBarPopup.hidden = true;
        urlBarPopup.setAttribute('role', 'listbox');
        if (form) {
            form.appendChild(urlBarPopup);
        }
        return urlBarPopup;
    }

    function closeUrlBarPopup() {
        if (!urlBarPopup) {
            return;
        }
        urlBarPopup.hidden = true;
        urlBarActiveIndex = -1;
    }

    function urlBarSuggestionEntries(query) {
        const entries = [];
        const seen = {};
        const pushEntry = function pushOne(entry) {
            const dedupeKey = entry.kind + '|' + entry.value;
            if (seen[dedupeKey]) {
                return;
            }
            seen[dedupeKey] = true;
            entries.push(entry);
        };

        if (bookmarksBar) {
            bookmarksBar.querySelectorAll('[data-browser-bookmark]').forEach(function collectBookmark(el) {
                const label = el.getAttribute('data-browser-bookmark') || el.textContent.trim();
                const route = el.getAttribute('data-browser-route') || '';
                if (route === 'noop') {
                    return;
                }
                if (query && label.toLowerCase().indexOf(query.toLowerCase()) === -1) {
                    return;
                }
                pushEntry({ kind: 'bookmark', icon: '★', label: label, value: route || label, action: () => navigateToBookmark(el) });
            });
        }

        state.sessionHistory.slice().reverse().forEach(function collectHistory(item) {
            const label = item.label || item.address || '';
            if (!label) {
                return;
            }
            if (query && label.toLowerCase().indexOf(query.toLowerCase()) === -1) {
                return;
            }
            pushEntry({
                kind: 'history',
                icon: '🕐',
                label: label,
                value: item.address || label,
                action: () => {
                    if (item.view === 'home') {
                        pushNavigation({ type: 'home' }, '');
                        return;
                    }
                    navigateFromInput(item.address || label, '');
                },
            });
        });

        return entries.slice(0, 6);
    }

    function renderUrlBarPopup() {
        const popup = ensureUrlBarPopup();
        popup.replaceChildren();
        urlBarActiveIndex = -1;

        const query = addressInput.value.trim();
        const rows = [];

        if (query) {
            const searchRow = document.createElement('div');
            searchRow.className = 'capsule-browser__urlbar-row capsule-browser__urlbar-row--search';
            searchRow.setAttribute('role', 'option');
            searchRow.setAttribute('data-browser-urlbar-row', '');
            const icon = document.createElement('span');
            icon.className = 'capsule-browser__urlbar-row-icon';
            icon.textContent = '🔍';
            const text = document.createElement('span');
            text.textContent = query;
            const hint = document.createElement('span');
            hint.className = 'capsule-browser__urlbar-row-hint';
            hint.textContent = capsuleStr('firefox.urlbarSearchWith', 'Rechercher avec Google');
            searchRow.appendChild(icon);
            searchRow.appendChild(text);
            searchRow.appendChild(hint);
            searchRow.addEventListener('click', function onSearchRowClick() {
                navigateFromInput(query, '');
                closeUrlBarPopup();
            });
            popup.appendChild(searchRow);
            rows.push(() => navigateFromInput(query, ''));
        } else {
            const heading = document.createElement('div');
            heading.className = 'capsule-browser__urlbar-heading';
            heading.textContent = capsuleStr('firefox.urlbarFrequent', 'Sites fréquents');
            popup.appendChild(heading);
        }

        const entries = urlBarSuggestionEntries(query);
        entries.forEach(function appendEntry(entry) {
            const row = document.createElement('div');
            row.className = 'capsule-browser__urlbar-row';
            row.setAttribute('role', 'option');
            row.setAttribute('data-browser-urlbar-row', '');
            const icon = document.createElement('span');
            icon.className = 'capsule-browser__urlbar-row-icon';
            icon.textContent = entry.icon;
            const text = document.createElement('span');
            text.textContent = entry.label;
            const hint = document.createElement('span');
            hint.className = 'capsule-browser__urlbar-row-hint';
            hint.textContent = entry.value !== entry.label ? entry.value : '';
            row.appendChild(icon);
            row.appendChild(text);
            row.appendChild(hint);
            row.addEventListener('click', function onEntryClick() {
                entry.action();
                closeUrlBarPopup();
            });
            popup.appendChild(row);
            rows.push(entry.action);
        });

        if (!query && !entries.length) {
            const empty = document.createElement('p');
            empty.className = 'capsule-browser__urlbar-empty';
            empty.textContent = capsuleStr('firefox.urlbarEmptyHint', 'Aucun favori ni historique pour le moment.');
            popup.appendChild(empty);
        }

        popup.hidden = false;
        popup.__capsuleRowActions = rows;
    }

    function openUrlBarPopup() {
        renderUrlBarPopup();
    }

    function moveUrlBarSelection(delta) {
        if (!urlBarPopup || urlBarPopup.hidden) {
            return;
        }
        const rowEls = urlBarPopup.querySelectorAll('[data-browser-urlbar-row]');
        if (!rowEls.length) {
            return;
        }
        rowEls.forEach((el) => el.classList.remove('capsule-browser__urlbar-row--active'));
        urlBarActiveIndex = (urlBarActiveIndex + delta + rowEls.length) % rowEls.length;
        rowEls[urlBarActiveIndex].classList.add('capsule-browser__urlbar-row--active');
    }

    if (addressInput) {
        addressInput.addEventListener('focus', openUrlBarPopup);
        addressInput.addEventListener('input', openUrlBarPopup);
        addressInput.addEventListener('keydown', function onAddressKeydown(event) {
            if (!urlBarPopup || urlBarPopup.hidden) {
                return;
            }
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                moveUrlBarSelection(1);
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                moveUrlBarSelection(-1);
                return;
            }
            if (event.key === 'Escape') {
                closeUrlBarPopup();
                return;
            }
            if (event.key === 'Enter' && urlBarActiveIndex >= 0 && urlBarPopup.__capsuleRowActions) {
                const action = urlBarPopup.__capsuleRowActions[urlBarActiveIndex];
                if (action) {
                    event.preventDefault();
                    action();
                    closeUrlBarPopup();
                }
            }
        });
    }

    document.addEventListener('click', function onDocUrlBarClose(event) {
        if (!urlBarPopup || urlBarPopup.hidden) {
            return;
        }
        if (urlBarPopup.contains(event.target) || event.target === addressInput) {
            return;
        }
        closeUrlBarPopup();
    });

    function applyEntryToTab(tab, entry, options) {
        const opts = options || {};
        tab.view = entry.view;
        tab.address = entry.address || '';
        tab.resolution = entry.resolution || null;
        tab.label = entry.label || defaultTabLabel;

        switchView(tab.view);
        syncAddressInput(tab.address);

        if (tab.view === 'web' || tab.view === 'error') {
            const targetUrl = tab.resolution && tab.resolution.url ? tab.resolution.url : '';
            if (targetUrl) {
                setLoading(true);
                if (redirectFrame.src !== targetUrl) {
                    redirectFrame.src = targetUrl;
                } else {
                    setLoading(false);
                }
            }
        } else if (tab.view === 'module') {
            redirectFrame.src = 'about:blank';
            setLoading(false);
            renderModulePanel(tab.resolution);
            if (tab.resolution && typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('capsule:open-mnt-scenario', {
                    detail: {
                        moduleId: tab.resolution.moduleId,
                        scenarioId: tab.resolution.scenarioId,
                        path: tab.resolution.path,
                    },
                }));
            }
        } else if (tab.view === 'preferences') {
            redirectFrame.src = 'about:blank';
            setLoading(false);
            renderPreferencesPanel();
        } else {
            redirectFrame.src = 'about:blank';
            setLoading(false);
        }

        if (opts.message) {
            setStatus(opts.message);
        }

        renderTabs();
        syncNavButtons();
        renderHistoryPanel();
        syncFirefoxGnomeDataset(browserRoot);
    }

    function pushNavigation(resolution, message) {
        const tab = getActiveTab();
        if (!tab) {
            return;
        }
        const entry = resolutionToEntry(resolution);
        if (tab.historyIndex < tab.history.length - 1) {
            tab.history = tab.history.slice(0, tab.historyIndex + 1);
        }
        tab.history.push(entry);
        tab.historyIndex = tab.history.length - 1;
        recordSessionHistory(tab, entry);
        applyEntryToTab(tab, entry, { message: message });
    }

    function applyActiveTabToUi() {
        const tab = getActiveTab();
        if (!tab || !tab.history || tab.history.length === 0) {
            return;
        }
        const entry = tab.history[tab.historyIndex] || tab.history[0];
        applyEntryToTab(tab, entry, {});
    }

    function goBack() {
        const tab = getActiveTab();
        if (!tab || tab.historyIndex <= 0) {
            return;
        }
        tab.historyIndex -= 1;
        applyEntryToTab(tab, tab.history[tab.historyIndex], {});
        setStatus('');
    }

    function goForward() {
        const tab = getActiveTab();
        if (!tab || tab.historyIndex >= tab.history.length - 1) {
            return;
        }
        tab.historyIndex += 1;
        applyEntryToTab(tab, tab.history[tab.historyIndex], {});
        setStatus('');
    }

    function applyNavigation(resolution, message) {
        if (!resolution || resolution.type === 'home') {
            pushNavigation({ type: 'home' }, message || capsuleStr('firefox.statusHomeShown', 'Page Accueil affichee.'));
            return;
        }
        if (resolution.type === 'web') {
            pushNavigation(resolution, message || capsuleStr('firefox.statusWebLoading', 'Chargement de la page…'));
            return;
        }
        if (resolution.type === 'mnt') {
            pushNavigation(resolution, message || capsuleStrFmt(
                'firefox.statusMntOpen',
                { label: resolution.label || resolution.moduleId },
                'Ouverture du module pédagogique…'
            ));
            return;
        }
        if (resolution.type === 'error') {
            pushNavigation(resolution, message || '');
            return;
        }
        pushNavigation({
            type: 'error',
            address: '',
            url: resolver ? resolver.webPageUrl('neterror') : '',
        });
    }

    function navigateFromInput(rawValue, message) {
        applyNavigation(resolveNavigation(rawValue), message);
    }

    function faviconStyleForTab(tab) {
        if (!tab || !tab.resolution || tab.resolution.type !== 'web' || !tab.resolution.siteId) {
            return '';
        }
        if (resolver && typeof resolver.faviconUrlForSiteId === 'function') {
            return resolver.faviconUrlForSiteId(tab.resolution.siteId);
        }
        return '';
    }

    function renderTabs() {
        tabsList.replaceChildren();

        state.tabs.forEach((tab) => {
            const isActive = tab.id === state.activeTabId;
            const tabBtn = document.createElement('button');
            tabBtn.type = 'button';
            tabBtn.className = 'capsule-browser__tab firefox-tab'
                + (isActive ? ' capsule-browser__tab--active' : '');
            tabBtn.setAttribute('data-browser-tab-id', tab.id);
            tabBtn.setAttribute('role', 'tab');
            tabBtn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            if (isActive) {
                tabBtn.setAttribute('aria-current', 'page');
            }

            const icon = document.createElement('span');
            const favicon = faviconStyleForTab(tab);
            icon.className = 'capsule-browser__tab-icon capsule-browser__tab-icon--firefox'
                + (favicon ? ' capsule-browser__tab-icon--site' : '');
            if (favicon) {
                icon.style.backgroundImage = 'url("' + favicon + '")';
            }
            icon.setAttribute('aria-hidden', 'true');

            const label = document.createElement('span');
            label.className = 'capsule-browser__tab-label';
            label.textContent = tab.label;

            const closeBtn = document.createElement('span');
            closeBtn.className = 'capsule-browser__tab-close';
            closeBtn.setAttribute('data-browser-tab-close', tab.id);
            closeBtn.setAttribute('role', 'button');
            closeBtn.setAttribute('aria-label', capsuleStr('firefox.tabCloseAria', 'Fermer l’onglet'));
            closeBtn.textContent = '\u00D7';

            tabBtn.appendChild(icon);
            tabBtn.appendChild(label);
            tabBtn.appendChild(closeBtn);
            tabsList.appendChild(tabBtn);
        });
    }

    function renderHistoryPanel() {
        if (!historyList) {
            return;
        }
        historyList.replaceChildren();
        const items = state.sessionHistory.slice().reverse();
        if (!items.length) {
            const empty = document.createElement('p');
            empty.className = 'capsule-browser-panel__empty';
            empty.textContent = capsuleStr('firefox.historyEmpty', 'Aucune entrée dans l’historique de session.');
            historyList.appendChild(empty);
            return;
        }
        items.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'capsule-browser-panel__item';
            btn.setAttribute('data-browser-history-index', String(state.sessionHistory.length - 1 - index));
            btn.textContent = item.label || item.address || defaultTabLabel;
            historyList.appendChild(btn);
        });
    }

    function togglePanel(name) {
        const next = state.openPanel === name ? null : name;
        state.openPanel = next;
        if (panelHistory) {
            panelHistory.hidden = next !== 'history';
        }
        if (panelDownloads) {
            panelDownloads.hidden = next !== 'downloads';
        }
        browserRoot.dataset.browserOpenPanel = next || '';
        if (next === 'history') {
            renderHistoryPanel();
        }
    }

    function activateTab(tabId) {
        state.activeTabId = tabId;
        applyActiveTabToUi();
    }

    function addTab() {
        state.tabCounter += 1;
        const tabId = 'tab-' + String(state.tabCounter);
        state.tabs.push(createTabState(tabId));
        activateTab(tabId);
        setStatus('');
    }

    function duplicateTab(tabId) {
        const source = state.tabs.filter((tab) => tab.id === tabId)[0];
        if (!source) {
            return;
        }
        state.tabCounter += 1;
        const tabId2 = 'tab-' + String(state.tabCounter);
        const copy = createTabState(tabId2);
        copy.label = source.label;
        copy.view = source.view;
        copy.address = source.address;
        copy.resolution = source.resolution;
        copy.history = source.history.slice();
        copy.historyIndex = source.historyIndex;
        state.tabs.push(copy);
        activateTab(tabId2);
        setStatus('');
    }

    function closeTab(tabId) {
        if (state.tabs.length <= 1) {
            pushNavigation({ type: 'home' }, '');
            return;
        }

        let removeIndex = -1;
        state.tabs.forEach((tab, index) => {
            if (tab.id === tabId) {
                removeIndex = index;
            }
        });

        if (removeIndex < 0) {
            return;
        }

        const wasActive = state.activeTabId === tabId;
        const removed = state.tabs.splice(removeIndex, 1)[0];
        state.closedTabs.push({ index: removeIndex, tab: removed });
        if (state.closedTabs.length > 10) {
            state.closedTabs.shift();
        }

        if (wasActive) {
            const nextTab = state.tabs[removeIndex] || state.tabs[removeIndex - 1] || state.tabs[0];
            activateTab(nextTab.id);
            return;
        }

        renderTabs();
    }

    function reopenClosedTab() {
        const entry = state.closedTabs.pop();
        if (!entry) {
            setStatus(capsuleStr('firefox.statusReopenClosedTabEmpty', 'Aucun onglet fermé à restaurer.'));
            return;
        }
        state.tabCounter += 1;
        const tabId = 'tab-' + String(state.tabCounter);
        const restored = Object.assign({}, entry.tab, { id: tabId });
        const insertAt = Math.min(entry.index, state.tabs.length);
        state.tabs.splice(insertAt, 0, restored);
        activateTab(tabId);
        setStatus('');
    }

    function buildFlatMenuItems(container, items, itemAttr) {
        items.forEach(function appendItem(item) {
            if (item.sep) {
                const sep = document.createElement('div');
                sep.className = 'capsule-browser__menu-separator';
                sep.setAttribute('role', 'separator');
                container.appendChild(sep);
                return;
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'capsule-browser__menu-item';
            btn.setAttribute('role', 'menuitem');
            btn.setAttribute(itemAttr, item.action);
            const labelSpan = document.createElement('span');
            labelSpan.className = 'capsule-browser__menu-item-label';
            labelSpan.textContent = item.label;
            btn.appendChild(labelSpan);
            if (item.arrow) {
                const arrowSpan = document.createElement('span');
                arrowSpan.className = 'capsule-browser__menu-item-arrow';
                arrowSpan.setAttribute('aria-hidden', 'true');
                btn.appendChild(arrowSpan);
            }
            container.appendChild(btn);
        });
    }

    function createContextMenu(config) {
        let el = browserRoot.querySelector('[' + config.attr + ']');
        let context = null;
        if (!el) {
            el = document.createElement('div');
            el.className = 'capsule-browser__tab-context-menu';
            el.hidden = true;
            el.setAttribute(config.attr, '');
            el.setAttribute('role', 'menu');
            config.buildItems(el);
            browserRoot.appendChild(el);
        }

        function close() {
            el.hidden = true;
            context = null;
        }

        function open(clientX, clientY, ctx) {
            context = ctx;
            if (config.onOpen) {
                config.onOpen(el, ctx);
            }
            const hostRect = browserRoot.getBoundingClientRect();
            el.style.left = `${clientX - hostRect.left}px`;
            el.style.top = `${clientY - hostRect.top}px`;
            el.hidden = false;
            const menuRect = el.getBoundingClientRect();
            const overflowX = menuRect.right - hostRect.right;
            const overflowY = menuRect.bottom - hostRect.bottom;
            if (overflowX > 0) {
                el.style.left = `${clientX - hostRect.left - overflowX}px`;
            }
            if (overflowY > 0) {
                el.style.top = `${clientY - hostRect.top - overflowY}px`;
            }
        }

        el.addEventListener('click', function onContextMenuClick(event) {
            const item = event.target.closest('[' + config.itemAttr + ']');
            if (!item || !el.contains(item)) {
                return;
            }
            event.preventDefault();
            const labelEl = item.querySelector('.capsule-browser__menu-item-label');
            const label = labelEl ? labelEl.textContent : item.textContent.trim();
            const action = item.getAttribute(config.itemAttr);
            const ctxAtClick = context;
            close();
            config.onAction(action, ctxAtClick, label);
        });

        document.addEventListener('click', function onDocContextMenuClose(event) {
            if (el.hidden || el.contains(event.target)) {
                return;
            }
            close();
        });

        return { el: el, open: open, close: close };
    }

    const tabContextItems = [
        { action: 'tab-new-right', label: capsuleStr('firefox.tabCtxNewRight', 'Nouvel onglet à droite') },
        { action: 'tab-new-group', label: capsuleStr('firefox.tabCtxNewGroup', 'Ajouter l’onglet à un nouveau groupe') },
        { sep: true },
        { action: 'tab-reload', label: capsuleStr('firefox.tabCtxReload', 'Recharger l’onglet') },
        { action: 'tab-mute', label: capsuleStr('firefox.tabCtxMute', 'Couper le son de l’onglet') },
        { action: 'tab-pin', label: capsuleStr('firefox.tabCtxPin', 'Épingler l’onglet') },
        { action: 'tab-unload', label: capsuleStr('firefox.tabCtxUnload', 'Décharger l’onglet') },
        { action: 'tab-duplicate', label: capsuleStr('firefox.tabCtxDuplicate', 'Dupliquer l’onglet') },
        { sep: true },
        { action: 'tab-ai-chatbot', label: capsuleStr('firefox.tabCtxAiChatbot', 'Demander à un chatbot IA (Z)'), arrow: true },
        { sep: true },
        { action: 'tab-bookmark', label: capsuleStr('firefox.tabCtxBookmark', 'Marquer l’onglet...') },
        { action: 'tab-move', label: capsuleStr('firefox.tabCtxMove', 'Déplacer l’onglet'), arrow: true },
        { action: 'tab-select-all', label: capsuleStr('firefox.tabCtxSelectAll', 'Sélectionner tous les onglets') },
        { sep: true },
        { action: 'tab-close', label: capsuleStr('firefox.tabCtxClose', 'Fermer l’onglet') },
        { action: 'tab-close-duplicates', label: capsuleStr('firefox.tabCtxCloseDuplicates', 'Fermer les onglets en double') },
        { action: 'tab-close-multiple', label: capsuleStr('firefox.tabCtxCloseMultiple', 'Fermer plusieurs onglets'), arrow: true },
        { action: 'tab-reopen-closed', label: capsuleStr('firefox.tabCtxReopenClosed', 'Rouvrir l’onglet fermé') },
    ];

    const tabContextMenuCtrl = createContextMenu({
        attr: 'data-browser-tab-context-menu',
        itemAttr: 'data-browser-tab-ctx-action',
        buildItems: function buildTabContextItems(container) {
            buildFlatMenuItems(container, tabContextItems, 'data-browser-tab-ctx-action');
        },
        onAction: function onTabContextAction(action, tabId, label) {
            if (!tabId) {
                return;
            }
            if (action === 'tab-new-right') {
                addTab();
                return;
            }
            if (action === 'tab-reload') {
                activateTab(tabId);
                reloadActiveTab();
                return;
            }
            if (action === 'tab-duplicate') {
                duplicateTab(tabId);
                return;
            }
            if (action === 'tab-close') {
                closeTab(tabId);
                return;
            }
            if (action === 'tab-reopen-closed') {
                reopenClosedTab();
                return;
            }
            setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: label || '' }, 'Menu : bientôt disponible.'));
        },
    });

    if (tabsList) {
        tabsList.addEventListener('contextmenu', function onTabContextMenu(event) {
            const tabBtn = event.target.closest('[data-browser-tab-id]');
            if (!tabBtn || !tabsList.contains(tabBtn)) {
                return;
            }
            event.preventDefault();
            tabContextMenuCtrl.open(event.clientX, event.clientY, tabBtn.getAttribute('data-browser-tab-id'));
        });
    }

    let tooltipEl = null;
    let tooltipShowTimer = null;

    function ensureTooltipEl() {
        if (tooltipEl) {
            return tooltipEl;
        }
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'capsule-browser__tooltip';
        tooltipEl.hidden = true;
        browserRoot.appendChild(tooltipEl);
        return tooltipEl;
    }

    function hideTooltip() {
        if (tooltipShowTimer) {
            clearTimeout(tooltipShowTimer);
            tooltipShowTimer = null;
        }
        if (tooltipEl) {
            tooltipEl.hidden = true;
        }
    }

    function showTooltipFor(target, lines) {
        const el = ensureTooltipEl();
        el.replaceChildren();
        lines.forEach(function appendTooltipLine(line) {
            const p = document.createElement('div');
            p.className = 'capsule-browser__tooltip-line';
            p.textContent = line;
            el.appendChild(p);
        });
        const hostRect = browserRoot.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        el.hidden = false;
        let left = targetRect.left - hostRect.left;
        const top = targetRect.bottom - hostRect.top + 6;
        const overflowX = (left + el.offsetWidth) - hostRect.width;
        if (overflowX > 0) {
            left -= overflowX;
        }
        if (left < 4) {
            left = 4;
        }
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
    }

    function attachTooltip(target, lines) {
        if (!target || !lines || !lines.length) {
            return;
        }
        target.addEventListener('mouseenter', function onTooltipEnter() {
            if (tooltipShowTimer) {
                clearTimeout(tooltipShowTimer);
            }
            tooltipShowTimer = setTimeout(function showTooltipDelayed() {
                showTooltipFor(target, lines);
            }, 650);
        });
        target.addEventListener('mouseleave', hideTooltip);
        target.addEventListener('mousedown', hideTooltip);
    }

    attachTooltip(btnBack, [
        capsuleStr('firefox.tooltipBackLine1', 'Reculer d’une page (Alt+Flèche gauche)'),
        capsuleStr('firefox.tooltipBackLine2', 'Faire un clic droit ou cliquer en déplaçant la souris vers le bas pour afficher l’historique'),
    ]);
    attachTooltip(btnForward, [capsuleStr('firefox.tooltipForward', 'Suivant (Alt+Flèche droite)')]);
    attachTooltip(btnReload, [capsuleStr('firefox.tooltipReload', 'Actualiser la page courante (Ctrl+R)')]);
    attachTooltip(btnMenu, [capsuleStr('firefox.tooltipHamburger', 'Ouvrir le menu de l’application')]);
    attachTooltip(btnProfile, [capsuleStr('firefox.tooltipProfile', 'Compte')]);

    const findBar = browserRoot.querySelector('[data-browser-findbar]');
    const findInput = browserRoot.querySelector('[data-browser-findbar-input]');
    const findPrevBtn = browserRoot.querySelector('[data-browser-findbar-prev]');
    const findNextBtn = browserRoot.querySelector('[data-browser-findbar-next]');
    const findCloseBtn = browserRoot.querySelector('[data-browser-findbar-close]');
    const findCountEl = browserRoot.querySelector('[data-browser-findbar-count]');
    const findHighlightAllToggle = browserRoot.querySelector('[data-browser-findbar-highlight-all]');
    const findCaseToggle = browserRoot.querySelector('[data-browser-findbar-case]');
    const findDiacriticsToggle = browserRoot.querySelector('[data-browser-findbar-diacritics]');
    const findWholeWordToggle = browserRoot.querySelector('[data-browser-findbar-whole-word]');

    let findMatches = [];
    let findActiveIndex = -1;

    function stripDiacritics(value) {
        return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    function isWholeWordMatch(haystack, start, length) {
        const before = start > 0 ? haystack.charAt(start - 1) : '';
        const after = haystack.charAt(start + length);
        const wordChar = /[\wÀ-ſ]/;
        return !wordChar.test(before) && !wordChar.test(after);
    }

    function clearFindHighlights() {
        const root = browserRoot.querySelector('.capsule-browser__viewport');
        if (!root) {
            return;
        }
        root.querySelectorAll('mark.capsule-browser-findbar__mark').forEach(function unwrapMark(mark) {
            const parent = mark.parentNode;
            if (!parent) {
                return;
            }
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }

    function highlightMatchesInNode(originalNode, matchesForNode) {
        const descending = matchesForNode.slice().sort((a, b) => b.start - a.start);
        let node = originalNode;
        descending.forEach(function wrapOne(m) {
            node.splitText(m.end);
            const matchNode = node.splitText(m.start);
            const mark = document.createElement('mark');
            mark.className = 'capsule-browser-findbar__mark';
            matchNode.parentNode.insertBefore(mark, matchNode);
            mark.appendChild(matchNode);
            m.markEl = mark;
            node = matchNode.parentNode.previousSibling || node;
        });
    }

    function renderFindHighlights() {
        const byNode = new Map();
        findMatches.forEach(function groupMatch(m) {
            if (!byNode.has(m.node)) {
                byNode.set(m.node, []);
            }
            byNode.get(m.node).push(m);
        });
        byNode.forEach(highlightMatchesInNode);
    }

    function updateFindCount() {
        if (!findCountEl) {
            return;
        }
        if (!findInput.value) {
            findCountEl.textContent = '';
            return;
        }
        if (!findMatches.length) {
            findCountEl.textContent = capsuleStr('firefox.findbarNotFound', 'Texte non trouvé');
            return;
        }
        findCountEl.textContent = capsuleStrFmt(
            'firefox.findbarCount',
            { current: String(findActiveIndex + 1), total: String(findMatches.length) },
            `${findActiveIndex + 1} sur ${findMatches.length}`,
        );
    }

    function updateActiveMatch(scrollIntoView) {
        const highlightAll = !findHighlightAllToggle || findHighlightAllToggle.checked;
        findMatches.forEach(function toggleActive(m, i) {
            if (!m.markEl) {
                return;
            }
            m.markEl.classList.toggle('capsule-browser-findbar__mark--active', i === findActiveIndex);
            m.markEl.classList.toggle('capsule-browser-findbar__mark--dim', !highlightAll && i !== findActiveIndex);
        });
        const active = findMatches[findActiveIndex];
        if (active && active.markEl && scrollIntoView) {
            active.markEl.scrollIntoView({ block: 'center', inline: 'nearest' });
        }
        updateFindCount();
    }

    function findRunSearch() {
        clearFindHighlights();
        const raw = findInput.value;
        if (!raw) {
            findMatches = [];
            findActiveIndex = -1;
            findInput.classList.remove('capsule-browser-findbar__input--nomatch');
            updateFindCount();
            return;
        }

        const caseSensitive = !!(findCaseToggle && findCaseToggle.checked);
        const matchDiacritics = !!(findDiacriticsToggle && findDiacriticsToggle.checked);
        const wholeWord = !!(findWholeWordToggle && findWholeWordToggle.checked);

        let needle = raw;
        if (!matchDiacritics) {
            needle = stripDiacritics(needle);
        }
        if (!caseSensitive) {
            needle = needle.toLowerCase();
        }

        const root = browserRoot.querySelector('.capsule-browser__viewport');
        const found = [];
        if (root && needle) {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                acceptNode: function acceptTextNode(node) {
                    if (!node.nodeValue || !node.nodeValue.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    const parent = node.parentElement;
                    if (!parent || parent.closest('.capsule-browser-findbar')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (parent.offsetParent === null) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                },
            });
            let node = walker.nextNode();
            while (node) {
                let hay = node.nodeValue;
                if (!matchDiacritics) {
                    hay = stripDiacritics(hay);
                }
                if (!caseSensitive) {
                    hay = hay.toLowerCase();
                }
                let fromIndex = 0;
                while (fromIndex <= hay.length - needle.length) {
                    const idx = hay.indexOf(needle, fromIndex);
                    if (idx < 0) {
                        break;
                    }
                    if (!wholeWord || isWholeWordMatch(hay, idx, needle.length)) {
                        found.push({ node: node, start: idx, end: idx + needle.length });
                    }
                    fromIndex = idx + Math.max(needle.length, 1);
                }
                node = walker.nextNode();
            }
        }

        findMatches = found;
        findActiveIndex = found.length ? 0 : -1;
        renderFindHighlights();
        findInput.classList.toggle('capsule-browser-findbar__input--nomatch', raw.length > 0 && found.length === 0);
        updateActiveMatch(true);
    }

    function findGoToMatch(delta) {
        if (!findMatches.length) {
            return;
        }
        findActiveIndex = (findActiveIndex + delta + findMatches.length) % findMatches.length;
        updateActiveMatch(true);
    }

    function openFindBar() {
        if (!findBar || !findInput) {
            return;
        }
        findBar.hidden = false;
        findInput.focus();
        findInput.select();
    }

    function closeFindBar() {
        if (!findBar || !findInput) {
            return;
        }
        clearFindHighlights();
        findMatches = [];
        findActiveIndex = -1;
        findBar.hidden = true;
        findInput.value = '';
        findInput.classList.remove('capsule-browser-findbar__input--nomatch');
        if (findCountEl) {
            findCountEl.textContent = '';
        }
    }

    if (findInput) {
        findInput.addEventListener('input', findRunSearch);
        findInput.addEventListener('keydown', function onFindKeydown(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                findGoToMatch(event.shiftKey ? -1 : 1);
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                closeFindBar();
            }
        });
    }
    if (findPrevBtn) {
        findPrevBtn.addEventListener('click', function onFindPrevClick() {
            findGoToMatch(-1);
        });
    }
    if (findNextBtn) {
        findNextBtn.addEventListener('click', function onFindNextClick() {
            findGoToMatch(1);
        });
    }
    if (findCloseBtn) {
        findCloseBtn.addEventListener('click', closeFindBar);
    }
    [findHighlightAllToggle, findCaseToggle, findDiacriticsToggle, findWholeWordToggle].forEach(function wireFindToggle(toggle) {
        if (!toggle) {
            return;
        }
        toggle.addEventListener('change', findRunSearch);
    });

    function frameUrlWithCacheBust(url) {
        if (!url) {
            return url;
        }
        const sep = url.indexOf('?') >= 0 ? '&' : '?';
        return url + sep + '_capsule=' + String(Date.now());
    }

    function reloadActiveTab() {
        const tab = getActiveTab();
        if (tab && (tab.view === 'web' || tab.view === 'error') && tab.resolution) {
            setLoading(true);
            redirectFrame.src = frameUrlWithCacheBust(tab.resolution.url || '');
            setStatus(capsuleStr('firefox.statusWebReloaded', 'Page rechargée.'));
            return;
        }
        if (tab && tab.view === 'module' && tab.resolution) {
            applyEntryToTab(tab, tab.history[tab.historyIndex], {});
            return;
        }
        applyEntryToTab(tab, makeHomeEntry(), {
            message: capsuleStr('firefox.statusHomeReloaded', 'Page Accueil rechargee.'),
        });
    }

    function setBookmarksVisible(visible) {
        state.bookmarksVisible = visible;
        bookmarksBar.hidden = !visible;
        if (btnToggleBookmarks) {
            btnToggleBookmarks.setAttribute('aria-pressed', visible ? 'true' : 'false');
            btnToggleBookmarks.classList.toggle('capsule-browser__btn--active', visible);
        }
        syncFirefoxGnomeDataset(browserRoot);
    }

    browserRoot.__capsuleFirefoxNavigate = function capsuleFirefoxNavigate(href) {
        navigateFromInput(href, '');
    };

    form.addEventListener('submit', function onAddressSubmit(event) {
        event.preventDefault();
        navigateFromInput(addressInput.value);
        closeUrlBarPopup();
    });

    if (newtabForm && newtabInput) {
        newtabForm.addEventListener('submit', function onNewtabSubmit(event) {
            event.preventDefault();
            navigateFromInput(newtabInput.value);
        });
    }

    btnHomes.forEach((btnHome) => {
        btnHome.addEventListener('click', function onHomeClick() {
            pushNavigation({ type: 'home' }, capsuleStr('firefox.statusHomeShown', 'Page Accueil affichee.'));
        });
    });

    btnReload.addEventListener('click', function onReloadClick() {
        reloadActiveTab();
    });

    btnBack.addEventListener('click', function onBackClick() {
        goBack();
    });

    btnForward.addEventListener('click', function onForwardClick() {
        goForward();
    });

    if (btnNewTab) {
        btnNewTab.addEventListener('click', function onNewTabClick() {
            addTab();
        });
    }

    if (btnToggleBookmarks) {
        btnToggleBookmarks.addEventListener('click', function onToggleBookmarksClick() {
            setBookmarksVisible(!state.bookmarksVisible);
        });
    }

    if (btnLibrary) {
        btnLibrary.addEventListener('click', function onLibraryClick() {
            setStatus(capsuleStr('firefox.statusLibrarySoon', 'Bibliothèque : bientôt disponible.'));
        });
    }

    if (btnProfile) {
        btnProfile.addEventListener('click', function onProfileClick() {
            setStatus(capsuleStr('firefox.statusProfileSoon', 'Profil Firefox : bientôt disponible.'));
        });
    }

    if (btnPocket) {
        btnPocket.addEventListener('click', function onPocketClick() {
            setStatus(capsuleStr('firefox.statusPocketSoon', 'Pocket : bientôt disponible.'));
        });
    }

    let menuPopover = browserRoot.querySelector('[data-browser-menu]');
    let showMenuView = function noopShowMenuView() {};
    if (!menuPopover && btnMenu) {
        menuPopover = document.createElement('div');
        menuPopover.className = 'capsule-browser__menu-popover firefox-appmenu';
        menuPopover.hidden = true;
        menuPopover.setAttribute('data-browser-menu', '');
        menuPopover.setAttribute('role', 'menu');

        function appendMenuSeparator(container) {
            const sep = document.createElement('div');
            sep.className = 'capsule-browser__menu-separator';
            sep.setAttribute('role', 'separator');
            container.appendChild(sep);
        }

        function appendMenuSectionLabel(container, text) {
            const label = document.createElement('div');
            label.className = 'capsule-browser__menu-section-label';
            label.textContent = text;
            container.appendChild(label);
        }

        function appendMenuItem(container, item) {
            if (item.zoom) {
                const row = document.createElement('div');
                row.className = 'capsule-browser__menu-zoom';
                const zoomLabel = document.createElement('span');
                zoomLabel.className = 'capsule-browser__menu-zoom-label';
                zoomLabel.textContent = capsuleStr('firefox.menuZoomLabel', 'Zoom');
                const controls = document.createElement('div');
                controls.className = 'capsule-browser__menu-zoom-controls';
                const btnOut = document.createElement('button');
                btnOut.type = 'button';
                btnOut.className = 'capsule-browser__menu-zoom-btn';
                btnOut.setAttribute('data-browser-zoom-out', '');
                btnOut.setAttribute('aria-label', capsuleStr('firefox.menuZoomOutAria', 'Réduire le zoom'));
                btnOut.textContent = '−';
                const value = document.createElement('span');
                value.className = 'capsule-browser__menu-zoom-value';
                value.textContent = `${state.zoomPercent} %`;
                const btnIn = document.createElement('button');
                btnIn.type = 'button';
                btnIn.className = 'capsule-browser__menu-zoom-btn';
                btnIn.setAttribute('data-browser-zoom-in', '');
                btnIn.setAttribute('aria-label', capsuleStr('firefox.menuZoomInAria', 'Augmenter le zoom'));
                btnIn.textContent = '+';
                const btnFull = document.createElement('button');
                btnFull.type = 'button';
                btnFull.className = 'capsule-browser__menu-zoom-btn capsule-browser__menu-zoom-btn--fullscreen';
                btnFull.setAttribute('data-browser-menu-action', 'zoom-fullscreen');
                btnFull.setAttribute('aria-label', capsuleStr('firefox.menuZoomFullscreenAria', 'Passer en plein écran'));
                btnOut.addEventListener('click', function onZoomOut(event) {
                    event.stopPropagation();
                    state.zoomPercent = Math.max(30, state.zoomPercent - 10);
                    value.textContent = `${state.zoomPercent} %`;
                });
                btnIn.addEventListener('click', function onZoomIn(event) {
                    event.stopPropagation();
                    state.zoomPercent = Math.min(300, state.zoomPercent + 10);
                    value.textContent = `${state.zoomPercent} %`;
                });
                controls.appendChild(btnOut);
                controls.appendChild(value);
                controls.appendChild(btnIn);
                controls.appendChild(btnFull);
                row.appendChild(zoomLabel);
                row.appendChild(controls);
                container.appendChild(row);
                return;
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = item.disabled
                ? 'capsule-browser__menu-item capsule-browser__menu-item--disabled'
                : 'capsule-browser__menu-item';
            btn.disabled = !!item.disabled;
            btn.setAttribute('role', 'menuitem');
            btn.setAttribute('data-browser-menu-action', item.action);
            const labelSpan = document.createElement('span');
            labelSpan.className = 'capsule-browser__menu-item-label';
            labelSpan.textContent = item.label;
            btn.appendChild(labelSpan);
            if (item.shortcut) {
                const shortcutSpan = document.createElement('span');
                shortcutSpan.className = 'capsule-browser__menu-item-shortcut';
                shortcutSpan.textContent = item.shortcut;
                btn.appendChild(shortcutSpan);
            }
            if (item.arrow) {
                const arrowSpan = document.createElement('span');
                arrowSpan.className = 'capsule-browser__menu-item-arrow';
                arrowSpan.setAttribute('aria-hidden', 'true');
                btn.appendChild(arrowSpan);
            }
            container.appendChild(btn);
        }

        function appendMenuSections(container, sections) {
            sections.forEach(function appendSection(section, index) {
                if (index > 0) {
                    appendMenuSeparator(container);
                }
                if (section.heading) {
                    appendMenuSectionLabel(container, section.heading);
                }
                section.items.forEach(function appendItem(item) {
                    appendMenuItem(container, item);
                });
            });
        }

        const mainView = document.createElement('div');
        mainView.className = 'capsule-browser__menu-view';
        mainView.setAttribute('data-menu-view', 'main');

        const menuHeader = document.createElement('div');
        menuHeader.className = 'capsule-browser__menu-header';
        const menuHeaderText = document.createElement('span');
        menuHeaderText.className = 'capsule-browser__menu-header-text';
        menuHeaderText.textContent = capsuleStr('firefox.menuSyncHeader', 'Synchroniser et enregistrer les données');
        const menuHeaderBtn = document.createElement('button');
        menuHeaderBtn.type = 'button';
        menuHeaderBtn.className = 'capsule-browser__menu-header-btn';
        menuHeaderBtn.setAttribute('data-browser-menu-action', 'sync-sign-in');
        menuHeaderBtn.textContent = capsuleStr('firefox.menuSignIn', 'Connexion');
        menuHeader.appendChild(menuHeaderText);
        menuHeader.appendChild(menuHeaderBtn);
        mainView.appendChild(menuHeader);

        appendMenuSections(mainView, [
            {
                items: [
                    { action: 'profiles', label: capsuleStr('firefox.menuProfiles', 'Profils'), arrow: true },
                ],
            },
            {
                items: [
                    { action: 'new-tab', label: capsuleStr('firefox.menuNewTab', 'Nouvel onglet'), shortcut: 'Ctrl+T' },
                    { action: 'new-window', label: capsuleStr('firefox.menuNewWindow', 'Nouvelle fenêtre'), shortcut: 'Ctrl+N' },
                    { action: 'new-private-window', label: capsuleStr('firefox.menuNewPrivateWindow', 'Nouvelle fenêtre privée'), shortcut: 'Ctrl+Maj+P' },
                ],
            },
            {
                items: [
                    { action: 'bookmarks', label: capsuleStr('firefox.menuBookmarksMenu', 'Marque-pages'), arrow: true },
                    { action: 'history', label: capsuleStr('firefox.menuHistory', 'Historique'), arrow: true },
                    { action: 'downloads', label: capsuleStr('firefox.menuDownloads', 'Téléchargements'), shortcut: 'Ctrl+Maj+Y' },
                    { action: 'passwords', label: capsuleStr('firefox.menuPasswords', 'Mots de passe') },
                    { action: 'addons', label: capsuleStr('firefox.menuAddons', 'Extensions et thèmes'), shortcut: 'Ctrl+Maj+A' },
                ],
            },
            {
                items: [
                    { action: 'print', label: capsuleStr('firefox.menuPrint', 'Imprimer...'), shortcut: 'Ctrl+P' },
                    { action: 'save-page', label: capsuleStr('firefox.menuSavePage', 'Enregistrer sous...'), shortcut: 'Ctrl+S' },
                    { action: 'find', label: capsuleStr('firefox.menuFind', 'Rechercher dans la page...'), shortcut: 'Ctrl+F' },
                    { action: 'translate', label: capsuleStr('firefox.menuTranslate', 'Traduire la page...'), disabled: true },
                    { action: 'zoom', zoom: true },
                ],
            },
            {
                items: [
                    { action: 'settings', label: capsuleStr('firefox.menuSettings', 'Paramètres') },
                    { action: 'more-tools', label: capsuleStr('firefox.menuMoreTools', 'Outils supplémentaires'), arrow: true },
                    { action: 'report-site', label: capsuleStr('firefox.menuReportSite', 'Signaler des problèmes avec ce site'), arrow: true, disabled: true },
                    { action: 'help', label: capsuleStr('firefox.menuHelp', 'Aide'), arrow: true },
                ],
            },
        ]);
        menuPopover.appendChild(mainView);

        const submenuDefs = {
            profiles: {
                title: capsuleStr('firefox.menuProfiles', 'Profils'),
                sections: [
                    {
                        items: [
                            { action: 'profiles-new', label: capsuleStr('firefox.menuProfilesNew', '➕ Nouveau profil') },
                            { action: 'profiles-manage', label: capsuleStr('firefox.menuProfilesManage', 'Gérer les profils') },
                        ],
                    },
                ],
            },
            bookmarks: {
                title: capsuleStr('firefox.menuBookmarksMenu', 'Marque-pages'),
                sections: [
                    {
                        items: [
                            { action: 'bookmark-current-tab', label: capsuleStr('firefox.menuBookmarkCurrentTab', 'Marquer l’onglet courant...'), shortcut: 'Ctrl+D' },
                            { action: 'bookmarks-search', label: capsuleStr('firefox.menuBookmarksSearch', 'Rechercher dans les marque-pages') },
                            { action: 'bookmarks-toggle-bar', label: capsuleStr('firefox.menuBookmarksToggleBar', 'Masquer la barre personnelle') },
                        ],
                    },
                    {
                        heading: capsuleStr('firefox.menuBookmarksRecentSectionLabel', 'Marque-pages récents'),
                        items: [
                            { action: 'bookmark-demo-1', label: capsuleStr('firefox.menuBookmarkDemoCustomize', 'Personnaliser Firefox') },
                            { action: 'bookmark-demo-2', label: capsuleStr('firefox.menuBookmarkDemoContribute', 'Participer') },
                            { action: 'bookmark-demo-3', label: capsuleStr('firefox.menuBookmarkDemoHelp', 'Obtenir de l’aide') },
                            { action: 'bookmark-demo-4', label: capsuleStr('firefox.menuBookmarkDemoAbout', 'À propos de Mozilla') },
                        ],
                    },
                    {
                        items: [
                            { action: 'bookmarks-manage', label: capsuleStr('firefox.menuBookmarksManage', 'Organiser les marque-pages'), shortcut: 'Ctrl+Maj+O' },
                        ],
                    },
                ],
            },
            history: {
                title: capsuleStr('firefox.menuHistory', 'Historique'),
                sections: [
                    {
                        items: [
                            { action: 'history-recent-tabs', label: capsuleStr('firefox.menuHistoryRecentTabs', 'Onglets récemment fermés'), arrow: true },
                            { action: 'history-recent-windows', label: capsuleStr('firefox.menuHistoryRecentWindows', 'Fenêtres récemment fermées'), arrow: true, disabled: true },
                            { action: 'history-search', label: capsuleStr('firefox.menuHistorySearch', 'Rechercher dans l’historique') },
                            { action: 'history-restore-session', label: capsuleStr('firefox.menuHistoryRestoreSession', 'Restaurer la session précédente') },
                        ],
                    },
                    {
                        items: [
                            { action: 'history-clear', label: capsuleStr('firefox.menuHistoryClear', 'Effacer l’historique récent...') },
                        ],
                    },
                    {
                        heading: capsuleStr('firefox.menuHistoryRecentSectionLabel', 'Historique récent'),
                        items: [
                            { action: 'history-demo-1', label: capsuleStr('firefox.menuHistoryDemo1', 'Compte Pro Intégré à votre Comptabilité') },
                            { action: 'history-demo-2', label: capsuleStr('firefox.menuHistoryDemo2', 'Google') },
                            { action: 'history-demo-3', label: capsuleStr('firefox.menuHistoryDemo3', 'about:newtab - Recherche Google') },
                            { action: 'history-demo-4', label: capsuleStr('firefox.menuHistoryDemo4', 'Google Search') },
                        ],
                    },
                    {
                        items: [
                            { action: 'history-manage', label: capsuleStr('firefox.menuHistoryManage', 'Gérer l’historique'), shortcut: 'Ctrl+Maj+H' },
                        ],
                    },
                ],
            },
            'more-tools': {
                title: capsuleStr('firefox.menuMoreTools', 'Outils supplémentaires'),
                sections: [
                    {
                        items: [
                            { action: 'tools-customize-toolbar', label: capsuleStr('firefox.menuToolsCustomizeToolbar', 'Personnaliser la barre d’outils...') },
                        ],
                    },
                    {
                        heading: capsuleStr('firefox.menuToolsSectionLabel', 'Outils du navigateur'),
                        items: [
                            { action: 'tools-devtools', label: capsuleStr('firefox.menuToolsDevtools', 'Outils de développement web'), shortcut: 'Ctrl+Maj+I' },
                            { action: 'tools-task-manager', label: capsuleStr('firefox.menuToolsTaskManager', 'Gestionnaire de tâches'), shortcut: 'Maj+Échap' },
                            { action: 'tools-remote-debug', label: capsuleStr('firefox.menuToolsRemoteDebug', 'Débogage distant') },
                            { action: 'tools-browser-console', label: capsuleStr('firefox.menuToolsBrowserConsole', 'Console du navigateur'), shortcut: 'Ctrl+Maj+J' },
                            { action: 'tools-responsive', label: capsuleStr('firefox.menuToolsResponsive', 'Vue adaptative'), shortcut: 'Ctrl+Maj+M' },
                            { action: 'tools-eyedropper', label: capsuleStr('firefox.menuToolsEyedropper', 'Pipette') },
                            { action: 'tools-view-source', label: capsuleStr('firefox.menuToolsViewSource', 'Code source de la page'), shortcut: 'Ctrl+U' },
                            { action: 'tools-dev-extensions', label: capsuleStr('firefox.menuToolsDevExtensions', 'Extensions de développement') },
                        ],
                    },
                ],
            },
            help: {
                title: capsuleStr('firefox.menuHelp', 'Aide'),
                sections: [
                    {
                        items: [
                            { action: 'help-get-help', label: capsuleStr('firefox.menuHelpGetHelp', 'Obtenir de l’aide') },
                            { action: 'help-feedback', label: capsuleStr('firefox.menuHelpFeedback', 'Partager des idées et des commentaires...') },
                            { action: 'help-troubleshoot-mode', label: capsuleStr('firefox.menuHelpTroubleshootMode', 'Mode de dépannage...') },
                            { action: 'help-troubleshoot-info', label: capsuleStr('firefox.menuHelpTroubleshootInfo', 'Plus d’informations de dépannage') },
                            { action: 'help-report-deceptive', label: capsuleStr('firefox.menuHelpReportDeceptive', 'Signaler un site trompeur...'), disabled: true },
                            { action: 'help-switch-device', label: capsuleStr('firefox.menuHelpSwitchDevice', 'Passer à un nouvel appareil') },
                            { action: 'help-about', label: capsuleStr('firefox.menuHelpAbout', 'À propos de Firefox') },
                        ],
                    },
                ],
            },
        };

        const menuViews = { main: mainView };

        Object.keys(submenuDefs).forEach(function buildSubmenuView(key) {
            const def = submenuDefs[key];
            const view = document.createElement('div');
            view.className = 'capsule-browser__menu-view';
            view.hidden = true;
            view.setAttribute('data-menu-view', key);

            const subHeader = document.createElement('div');
            subHeader.className = 'capsule-browser__menu-submenu-header';
            const backBtn = document.createElement('button');
            backBtn.type = 'button';
            backBtn.className = 'capsule-browser__menu-back-btn';
            backBtn.setAttribute('data-browser-menu-back', '');
            backBtn.setAttribute('aria-label', capsuleStr('firefox.menuBackAria', 'Retour'));
            const subTitle = document.createElement('span');
            subTitle.className = 'capsule-browser__menu-submenu-title';
            subTitle.textContent = def.title;
            subHeader.appendChild(backBtn);
            subHeader.appendChild(subTitle);
            view.appendChild(subHeader);

            appendMenuSections(view, def.sections);
            menuPopover.appendChild(view);
            menuViews[key] = view;
        });

        showMenuView = function showMenuViewImpl(name) {
            Object.keys(menuViews).forEach(function toggleView(key) {
                menuViews[key].hidden = key !== name;
            });
        };

        const menuHost = btnMenu.parentElement;
        if (menuHost) {
            menuHost.appendChild(menuPopover);
        }
    }

    const MENU_SUBMENU_ACTIONS = ['profiles', 'bookmarks', 'history', 'more-tools', 'help'];

    function closeMenuPopover() {
        if (!menuPopover || !btnMenu) {
            return;
        }
        menuPopover.hidden = true;
        btnMenu.setAttribute('aria-expanded', 'false');
        showMenuView('main');
    }

    function toggleMenuPopover() {
        if (!menuPopover || !btnMenu) {
            return;
        }
        const willOpen = menuPopover.hidden;
        menuPopover.hidden = !willOpen;
        btnMenu.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        if (!willOpen) {
            showMenuView('main');
        }
    }

    function handleMenuAction(action, label) {
        if (MENU_SUBMENU_ACTIONS.indexOf(action) !== -1) {
            showMenuView(action);
            return;
        }
        closeMenuPopover();
        if (action === 'new-tab') {
            addTab();
            return;
        }
        if (action === 'downloads') {
            togglePanel('downloads');
            return;
        }
        if (action === 'bookmarks-toggle-bar') {
            setBookmarksVisible(!state.bookmarksVisible);
            return;
        }
        if (action === 'history-manage') {
            togglePanel('history');
            return;
        }
        if (action === 'find') {
            openFindBar();
            return;
        }
        if (action === 'settings') {
            openPreferences();
            return;
        }
        if (action === 'tools-devtools') {
            openDevTools();
            return;
        }
        setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: label || '' }, 'Menu : bientôt disponible.'));
    }

    if (btnMenu) {
        btnMenu.addEventListener('click', function onMenuClick(event) {
            event.preventDefault();
            event.stopPropagation();
            toggleMenuPopover();
        });
    }

    if (menuPopover) {
        menuPopover.addEventListener('click', function onMenuItemClick(event) {
            const backBtn = event.target.closest('[data-browser-menu-back]');
            if (backBtn && menuPopover.contains(backBtn)) {
                event.preventDefault();
                showMenuView('main');
                return;
            }
            const item = event.target.closest('[data-browser-menu-action]');
            if (!item || !menuPopover.contains(item)) {
                return;
            }
            event.preventDefault();
            const labelEl = item.querySelector('.capsule-browser__menu-item-label');
            handleMenuAction(item.getAttribute('data-browser-menu-action'), labelEl ? labelEl.textContent : item.textContent.trim());
        });
    }

    browserRoot.querySelectorAll('[data-browser-panel-close]').forEach((btn) => {
        btn.addEventListener('click', function onPanelClose() {
            togglePanel(state.openPanel);
        });
    });

    if (historyList) {
        historyList.addEventListener('click', function onHistoryClick(event) {
            const item = event.target.closest('[data-browser-history-index]');
            if (!item || !historyList.contains(item)) {
                return;
            }
            const index = Number(item.getAttribute('data-browser-history-index'));
            const record = state.sessionHistory[index];
            if (!record) {
                return;
            }
            if (record.view === 'home') {
                pushNavigation({ type: 'home' }, '');
                return;
            }
            if (record.address) {
                navigateFromInput(record.address, '');
            }
        });
    }

    document.addEventListener('click', function onDocMenuClose(event) {
        if (!menuPopover || menuPopover.hidden) {
            return;
        }
        if (menuPopover.contains(event.target) || event.target === btnMenu) {
            return;
        }
        closeMenuPopover();
    });

    function handleFirefoxShortcutKeys(event) {
        const key = event.key;
        if (event.altKey && key === 'ArrowLeft') {
            event.preventDefault();
            goBack();
            return;
        }
        if (event.altKey && key === 'ArrowRight') {
            event.preventDefault();
            goForward();
            return;
        }
        if (key === 'F5' || (event.ctrlKey && (key === 'r' || key === 'R'))) {
            event.preventDefault();
            reloadActiveTab();
            return;
        }
        if (key === 'F12') {
            event.preventDefault();
            toggleDevTools();
            return;
        }
        if (event.ctrlKey && event.shiftKey && (key === 'i' || key === 'I')) {
            event.preventDefault();
            toggleDevTools();
            return;
        }
        if (event.ctrlKey && (key === 'w' || key === 'W')) {
            event.preventDefault();
            closeTab(state.activeTabId);
            return;
        }
        if (!event.ctrlKey) {
            return;
        }
        if (key === 't' || key === 'T') {
            event.preventDefault();
            addTab();
            return;
        }
        if (key === 'l' || key === 'L') {
            event.preventDefault();
            addressInput.focus();
            addressInput.select();
            return;
        }
        if (key === 'f' || key === 'F') {
            event.preventDefault();
            openFindBar();
        }
    }

    browserRoot.__capsuleFirefoxHandleKeys = handleFirefoxShortcutKeys;

    browserRoot.setAttribute('tabindex', '-1');
    if (browserRoot.dataset.firefoxKeysBound !== 'true') {
        browserRoot.addEventListener('keydown', function onFirefoxKeys(event) {
            handleFirefoxShortcutKeys(event);
        });
        browserRoot.dataset.firefoxKeysBound = 'true';
    }

    if (document.documentElement.dataset.firefoxGlobalKeysBound !== 'true') {
        document.addEventListener('keydown', function onGlobalFirefoxKeys(event) {
            const win = document.getElementById('firefox');
            if (!win || !win.classList.contains('windowElementActive')) {
                return;
            }
            const app = win.querySelector('[data-firefox-app]');
            if (app && typeof app.__capsuleFirefoxHandleKeys === 'function') {
                app.__capsuleFirefoxHandleKeys(event);
            }
        });
        document.documentElement.dataset.firefoxGlobalKeysBound = 'true';
    }

    tabsList.addEventListener('click', function onTabsListClick(event) {
        const closeTarget = event.target.closest('[data-browser-tab-close]');
        if (closeTarget && tabsList.contains(closeTarget)) {
            event.preventDefault();
            event.stopPropagation();
            closeTab(closeTarget.getAttribute('data-browser-tab-close'));
            return;
        }

        const tabBtn = event.target.closest('[data-browser-tab-id]');
        if (!tabBtn || !tabsList.contains(tabBtn)) {
            return;
        }

        event.preventDefault();
        activateTab(tabBtn.getAttribute('data-browser-tab-id'));
        setStatus('');
    });

    function navigateToBookmark(bookmark) {
        const label = bookmark.getAttribute('data-browser-bookmark') || 'favori';
        const route = bookmark.getAttribute('data-browser-route') || 'noop';

        if (route === 'noop') {
            setStatus(capsuleStr('firefox.bookmarkImportHint', 'Import des marque-pages : bientôt disponible.'));
            return;
        }

        if (route === 'home') {
            pushNavigation({ type: 'home' }, capsuleStr('firefox.statusFavoriteHome', 'Favori "Accueil" ouvert.'));
            return;
        }

        const shortcutKey = route === 'os-lacapsule' ? 'os-lacapsule' : route;
        if (resolver && typeof resolver.resolveShortcut === 'function' && shortcutKey) {
            const resolution = resolver.resolveShortcut(shortcutKey);
            if (resolution) {
                applyNavigation(resolution, capsuleStrFmt(
                    'firefox.statusFavoriteOsLaCapsule',
                    { label: label },
                    'Favori "' + label + '" ouvert.'
                ));
                return;
            }
        }

        if (isHomeTarget(label) || isHomeTarget(route)) {
            pushNavigation({ type: 'home' }, capsuleStr('firefox.statusFavoriteHome', 'Favori "Accueil" ouvert.'));
            return;
        }

        navigateFromInput(route || label, capsuleStrFmt(
            'firefox.statusFavoriteOsLaCapsule',
            { label: label },
            'Favori "' + label + '" ouvert.'
        ));
    }

    bookmarksBar.addEventListener('click', function onBookmarksBarClick(event) {
        const bookmark = event.target.closest('[data-browser-bookmark]');
        if (!bookmark || !bookmarksBar.contains(bookmark)) {
            return;
        }
        event.preventDefault();
        navigateToBookmark(bookmark);
    });

    const bookmarkContextMenuCtrl = createContextMenu({
        attr: 'data-browser-bookmark-context-menu',
        itemAttr: 'data-browser-bookmark-ctx-action',
        buildItems: function buildBookmarkContextItems(container) {
            const onItemView = document.createElement('div');
            onItemView.setAttribute('data-bookmark-ctx-view', 'item');
            buildFlatMenuItems(onItemView, [
                { action: 'bookmark-open', label: capsuleStr('firefox.bookmarkCtxOpen', 'Ouvrir') },
                { action: 'bookmark-open-newtab', label: capsuleStr('firefox.bookmarkCtxOpenNewTab', 'Ouvrir dans un nouvel onglet') },
                { action: 'bookmark-open-newwindow', label: capsuleStr('firefox.bookmarkCtxOpenNewWindow', 'Ouvrir dans une nouvelle fenêtre') },
                { sep: true },
                { action: 'bookmark-edit', label: capsuleStr('firefox.bookmarkCtxEdit', 'Modifier le marque-page...') },
                { action: 'bookmark-copy', label: capsuleStr('firefox.bookmarkCtxCopy', 'Copier l’emplacement') },
                { sep: true },
                { action: 'bookmark-delete', label: capsuleStr('firefox.bookmarkCtxDelete', 'Supprimer') },
            ], 'data-browser-bookmark-ctx-action');

            const onEmptyView = document.createElement('div');
            onEmptyView.setAttribute('data-bookmark-ctx-view', 'empty');
            onEmptyView.hidden = true;
            buildFlatMenuItems(onEmptyView, [
                { action: 'bookmark-add-page', label: capsuleStr('firefox.bookmarkCtxAddPage', 'Ajouter cette page...') },
                { action: 'bookmark-new-folder', label: capsuleStr('firefox.bookmarkCtxNewFolder', 'Nouveau dossier...') },
                { action: 'bookmark-new-separator', label: capsuleStr('firefox.bookmarkCtxNewSeparator', 'Nouvelle séparation') },
                { sep: true },
                { action: 'bookmark-show-sidebar', label: capsuleStr('firefox.bookmarkCtxShowSidebar', 'Afficher les marque-pages dans la barre latérale') },
            ], 'data-browser-bookmark-ctx-action');

            container.appendChild(onItemView);
            container.appendChild(onEmptyView);
        },
        onOpen: function onBookmarkContextOpen(container, target) {
            const onItemView = container.querySelector('[data-bookmark-ctx-view="item"]');
            const onEmptyView = container.querySelector('[data-bookmark-ctx-view="empty"]');
            if (onItemView) {
                onItemView.hidden = !target;
            }
            if (onEmptyView) {
                onEmptyView.hidden = !!target;
            }
        },
        onAction: function onBookmarkContextAction(action, target, label) {
            if (action === 'bookmark-open' && target) {
                navigateToBookmark(target);
                return;
            }
            if (action === 'bookmark-open-newtab' && target) {
                addTab();
                navigateToBookmark(target);
                return;
            }
            setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: label || '' }, 'Menu : bientôt disponible.'));
        },
    });

    if (bookmarksBar) {
        bookmarksBar.addEventListener('contextmenu', function onBookmarksBarContextMenu(event) {
            event.preventDefault();
            const target = event.target.closest('[data-browser-bookmark]');
            bookmarkContextMenuCtrl.open(event.clientX, event.clientY, target && bookmarksBar.contains(target) ? target : null);
        });
    }

    const pageViewport = browserRoot.querySelector('.capsule-browser__viewport');
    const pageContextMenuCtrl = createContextMenu({
        attr: 'data-browser-page-context-menu',
        itemAttr: 'data-browser-page-ctx-action',
        buildItems: function buildPageContextItems(container) {
            buildFlatMenuItems(container, [
                { action: 'page-new-tab', label: capsuleStr('firefox.menuNewTab', 'Nouvel onglet') },
                { action: 'page-new-window', label: capsuleStr('firefox.menuNewWindow', 'Nouvelle fenêtre') },
                { action: 'page-new-private-window', label: capsuleStr('firefox.menuNewPrivateWindow', 'Nouvelle fenêtre privée') },
                { sep: true },
                { action: 'page-save-as', label: capsuleStr('firefox.menuSavePage', 'Enregistrer sous...') },
                { action: 'page-select-all', label: capsuleStr('firefox.pageCtxSelectAll', 'Tout sélectionner') },
                { sep: true },
                { action: 'page-view-source', label: capsuleStr('firefox.pageCtxViewSource', 'Afficher le code source de la page') },
                { action: 'page-info', label: capsuleStr('firefox.pageCtxPageInfo', 'Informations sur la page') },
                { action: 'page-inspect-a11y', label: capsuleStr('firefox.pageCtxInspectA11y', 'Inspecter les propriétés d’accessibilité') },
            ], 'data-browser-page-ctx-action');
        },
        onAction: function onPageContextAction(action, context, label) {
            if (action === 'page-new-tab') {
                addTab();
                return;
            }
            setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: label || '' }, 'Menu : bientôt disponible.'));
        },
    });

    function truncateForMenuLabel(text) {
        return text.length > 24 ? `${text.slice(0, 24)}…` : text;
    }

    const textSelectionContextMenuCtrl = createContextMenu({
        attr: 'data-browser-selection-context-menu',
        itemAttr: 'data-browser-selection-ctx-action',
        buildItems: function buildSelectionContextItems(container) {
            buildFlatMenuItems(container, [
                { action: 'selection-copy', label: capsuleStr('firefox.selectionCtxCopy', 'Copier') },
                { action: 'selection-select-all', label: capsuleStr('firefox.selectionCtxSelectAll', 'Tout sélectionner') },
                { sep: true },
                { action: 'selection-search-web', label: capsuleStr('firefox.selectionCtxSearchWeb', 'Rechercher dans le Web') },
                { action: 'selection-search-with', label: capsuleStr('firefox.selectionCtxSearchWith', 'Rechercher avec...') },
                { action: 'selection-translate', label: capsuleStr('firefox.selectionCtxTranslate', 'Traduire la sélection') },
                { sep: true },
                { action: 'selection-save-as', label: capsuleStr('firefox.selectionCtxSaveAs', 'Enregistrer la sélection sous...') },
                { action: 'selection-send-email', label: capsuleStr('firefox.selectionCtxSendEmail', 'Envoyer le lien par e-mail') },
                { action: 'selection-inspect', label: capsuleStr('firefox.selectionCtxInspect', 'Inspecter') },
            ], 'data-browser-selection-ctx-action');
        },
        onOpen: function onSelectionContextOpen(container, selectedText) {
            const truncated = truncateForMenuLabel(selectedText);
            const searchWebLabel = container.querySelector('[data-browser-selection-ctx-action="selection-search-web"] .capsule-browser__menu-item-label');
            const searchWithLabel = container.querySelector('[data-browser-selection-ctx-action="selection-search-with"] .capsule-browser__menu-item-label');
            if (searchWebLabel) {
                searchWebLabel.textContent = capsuleStrFmt('firefox.selectionCtxSearchWebText', { text: truncated }, `Rechercher « ${truncated} » dans le Web`);
            }
            if (searchWithLabel) {
                searchWithLabel.textContent = capsuleStrFmt('firefox.selectionCtxSearchWithText', { text: truncated }, `Rechercher « ${truncated} » avec...`);
            }
        },
        onAction: function onSelectionContextAction(action, selectedText, label) {
            if (action === 'selection-copy' && selectedText) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(selectedText).catch(() => {});
                }
                setStatus(capsuleStr('firefox.statusSelectionCopied', 'Sélection copiée.'));
                return;
            }
            if (action === 'selection-select-all') {
                const selectableRoot = browserRoot.querySelector('[data-browser-home]');
                if (selectableRoot && window.getSelection) {
                    const range = document.createRange();
                    range.selectNodeContents(selectableRoot);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                return;
            }
            setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: label || '' }, 'Menu : bientôt disponible.'));
        },
    });

    if (pageViewport) {
        pageViewport.addEventListener('contextmenu', function onPageContextMenu(event) {
            if (event.target.closest('.capsule-browser-panel, [data-browser-redirect-frame]')) {
                return;
            }
            const selection = window.getSelection ? window.getSelection() : null;
            const selectedText = selection ? selection.toString().trim() : '';
            if (selectedText && selection.anchorNode && pageViewport.contains(selection.anchorNode)) {
                event.preventDefault();
                textSelectionContextMenuCtrl.open(event.clientX, event.clientY, selectedText);
                return;
            }
            event.preventDefault();
            pageContextMenuCtrl.open(event.clientX, event.clientY, null);
        });
    }

    function navigateToNewtabShortcut(link) {
        const key = link.getAttribute('data-browser-newtab-link') || '';

        if (resolver && typeof resolver.resolveShortcut === 'function' && key) {
            const resolution = resolver.resolveShortcut(key);
            if (resolution) {
                applyNavigation(resolution, capsuleStr(
                    'firefox.statusFavoriteOsLaCapsule',
                    'Favori « La Capsule » ouvert.'
                ));
                return;
            }
        }

        navigateFromInput(key, capsuleStrFmt(
            'firefox.statusNewtabShortcutSoon',
            { label: link.textContent.replace(/\s+/g, ' ').trim() },
            'Raccourci non mappe pour le moment.'
        ));
    }

    if (newtabShortcuts) {
        newtabShortcuts.addEventListener('click', function onNewtabShortcutsClick(event) {
            const addBtn = event.target.closest('[data-browser-newtab-action="add"]');
            if (addBtn && newtabShortcuts.contains(addBtn)) {
                event.preventDefault();
                setStatus(capsuleStr('firefox.statusNewtabAddSoon', 'Ajout de raccourci : bientôt disponible.'));
                return;
            }

            const link = event.target.closest('[data-browser-newtab-link]');
            if (!link || !newtabShortcuts.contains(link)) {
                return;
            }

            event.preventDefault();
            navigateToNewtabShortcut(link);
        });
    }

    const linkContextMenuCtrl = createContextMenu({
        attr: 'data-browser-link-context-menu',
        itemAttr: 'data-browser-link-ctx-action',
        buildItems: function buildLinkContextItems(container) {
            buildFlatMenuItems(container, [
                { action: 'link-open', label: capsuleStr('firefox.linkCtxOpen', 'Ouvrir le lien') },
                { action: 'link-open-newtab', label: capsuleStr('firefox.linkCtxOpenNewTab', 'Ouvrir le lien dans un nouvel onglet') },
                { action: 'link-open-newwindow', label: capsuleStr('firefox.linkCtxOpenNewWindow', 'Ouvrir le lien dans une nouvelle fenêtre') },
                { action: 'link-open-private', label: capsuleStr('firefox.linkCtxOpenPrivate', 'Ouvrir le lien dans une fenêtre de navigation privée') },
                { sep: true },
                { action: 'link-save-as', label: capsuleStr('firefox.linkCtxSaveAs', 'Enregistrer le lien sous...') },
                { action: 'link-copy-address', label: capsuleStr('firefox.linkCtxCopyAddress', 'Copier l’adresse du lien') },
                { action: 'link-copy-notrack', label: capsuleStr('firefox.linkCtxCopyNoTrack', 'Copier le lien sans suivi') },
                { sep: true },
                { action: 'link-inspect', label: capsuleStr('firefox.linkCtxInspect', 'Inspecter') },
            ], 'data-browser-link-ctx-action');
        },
        onAction: function onLinkContextAction(action, target, label) {
            if (action === 'link-open' && target) {
                navigateToNewtabShortcut(target);
                return;
            }
            if (action === 'link-open-newtab' && target) {
                addTab();
                navigateToNewtabShortcut(target);
                return;
            }
            setStatus(capsuleStrFmt('firefox.statusMenuItem', { label: label || '' }, 'Menu : bientôt disponible.'));
        },
    });

    if (newtabShortcuts) {
        newtabShortcuts.addEventListener('contextmenu', function onNewtabShortcutsContextMenu(event) {
            const link = event.target.closest('[data-browser-newtab-link]');
            if (!link || !newtabShortcuts.contains(link)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            linkContextMenuCtrl.open(event.clientX, event.clientY, link);
        });
    }

    redirectFrame.addEventListener('load', function onRedirectLoad() {
        setLoading(false);
        const tab = getActiveTab();
        if (tab && tab.view === 'web') {
            setStatus(capsuleStr('firefox.statusWebShown', 'Page affichée.'));
        }
        if (tab && tab.view === 'error') {
            setStatus('');
        }
    });

    redirectFrame.addEventListener('error', function onRedirectError() {
        setLoading(false);
        const tab = getActiveTab();
        if (!tab || (tab.view !== 'web' && tab.view !== 'error')) {
            return;
        }
        const errorResolution = {
            type: 'error',
            address: tab.address || '',
            url: resolver ? resolver.webPageUrl('neterror', { host: tab.address || '' }) : '',
        };
        const entry = resolutionToEntry(errorResolution);
        tab.history[tab.historyIndex] = entry;
        applyEntryToTab(tab, entry, {
            message: capsuleStr(
                'firefox.statusErrorWeb',
                'Erreur de chargement : impossible d\'ouvrir la page.'
            ),
        });
    });

    browserRoot.__capsuleFirefoxSession = state;
    browserRoot.dataset.initialized = 'true';
    setBookmarksVisible(supportsFirefoxGnomeChrome());
    applyEntryToTab(getActiveTab(), makeHomeEntry(), {});
    syncNavButtons();
    syncFirefoxGnomeDataset(browserRoot);
}

window.syncFirefoxGnomeDataset = syncFirefoxGnomeDataset;

function purgeFirefoxWindowRuntime(windowElement) {
    const root = windowElement || document.getElementById('firefox');
    const app = root && root.querySelector('[data-firefox-app]');
    if (!app) {
        return;
    }
    delete app.__capsuleFirefoxSession;
    delete app.__capsuleFirefoxHandleKeys;
    delete app.__capsuleFirefoxNavigate;
    delete app.dataset.initialized;
    delete app.dataset.browserLoading;
    delete app.dataset.browserOpenPanel;

    const addressInput = app.querySelector('[data-browser-address]');
    const status = app.querySelector('[data-browser-status]');
    const homeView = app.querySelector('[data-browser-home]');
    const redirectView = app.querySelector('[data-browser-redirect]');
    const redirectFrame = app.querySelector('[data-browser-redirect-frame]');
    const tabsList = app.querySelector('[data-browser-tabs]');
    const newtabInput = app.querySelector('[data-browser-newtab-input]');

    if (addressInput) {
        addressInput.value = '';
    }
    if (newtabInput) {
        newtabInput.value = '';
    }
    if (status) {
        status.hidden = true;
        status.textContent = '';
    }
    if (tabsList) {
        tabsList.innerHTML = '';
    }
    if (redirectFrame) {
        redirectFrame.src = 'about:blank';
    }
    if (redirectView) {
        redirectView.hidden = true;
    }
    const siteView = app.querySelector('[data-browser-site]');
    if (siteView) {
        siteView.hidden = true;
    }
    if (homeView) {
        homeView.hidden = false;
    }
}

function reopenFirefoxWindow(windowElement) {
    purgeFirefoxWindowRuntime(windowElement);
    if (typeof initFirefoxBrowser === 'function') {
        initFirefoxBrowser();
    }
}

if (typeof window !== 'undefined'
    && window.CapsuleWindowMemory
    && typeof window.CapsuleWindowMemory.register === 'function') {
    const sessionTier = (window.CapsuleMemoryConventions && window.CapsuleMemoryConventions.TIERS)
        ? window.CapsuleMemoryConventions.TIERS.SESSION
        : (window.CapsuleWindowMemory.TIERS && window.CapsuleWindowMemory.TIERS.SESSION);
    window.CapsuleWindowMemory.register({
        slotId: 'firefox',
        tier: sessionTier || 'session',
        resolveStorageKeys: () => [],
        purgeRuntime: purgeFirefoxWindowRuntime,
        onReopen: reopenFirefoxWindow,
    });
}

window.initFirefoxBrowser = initFirefoxBrowser;
window.initMintFirefoxBrowser = initFirefoxBrowser;
