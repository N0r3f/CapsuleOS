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
    return document.body.id === 'fedora' || document.body.id === 'ubuntu' || document.body.id === 'popos';
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
        const tabsbar = browserRoot.querySelector('.mint-browser__tabsbar');
        const header = windowElement.querySelector('#windowHeader');
        if (!tabsbar || !header) {
            return false;
        }

        tabsbar.setAttribute('data-window-drag-handle', '');

        if (header.dataset.fedoraFirefoxControls === 'true' && header.parentElement === tabsbar) {
            return true;
        }

        header.dataset.fedoraFirefoxControls = 'true';
        header.classList.add('firefox-window-controls--fedora');
        header.style.minWidth = '';
        header.style.maxWidth = '';
        header.style.width = '';
        tabsbar.appendChild(header);
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
    const bookmarksBar = browserRoot.querySelector('.mint-browser__bookmarks');

    const btnHomes = browserRoot.querySelectorAll('[data-browser-action="home"]');
    const btnReload = browserRoot.querySelector('[data-browser-action="reload"]');
    const btnBack = browserRoot.querySelector('[data-browser-action="back"]');
    const btnForward = browserRoot.querySelector('[data-browser-action="forward"]');
    const btnNewTab = browserRoot.querySelector('[data-browser-action="new-tab"]');
    const tabs = browserRoot.querySelectorAll('[data-browser-tab]');

    if (!form || !addressInput || !status || !homeView || !redirectView || !redirectFrame || !bookmarksBar || !btnHomes.length || !btnReload || !btnBack || !btnForward) {
        return;
    }

    decorateFedoraFirefoxWindow(browserRoot);

    const state = {
        view: 'home',
        status: capsuleStr(
            'firefox.statusSimulation',
            'Mode simulation actif: la vue Accueil ouvre la page interne du navigateur.'
        )
    };
    const OS_LACAPSULE_PAGE = (typeof window !== 'undefined' && window.CAPSULE_SITE_HOME)
        ? String(window.CAPSULE_SITE_HOME)
        : '/index.html';

    function normalizeInput(value) {
        return String(value || '').trim().toLowerCase();
    }

    function isHomeTarget(value) {
        const normalized = normalizeInput(value);
        return normalized === 'accueil' || normalized === 'capsuleos://accueil';
    }

    function isOsLaCapsuleTarget(value) {
        const normalized = normalizeInput(value);
        return normalized === 'os-lacapsule' || normalized === 'capsuleos://os-lacapsule' || normalized === 'la capsule';
    }

    function setStatus(message) {
        state.status = message;
        status.textContent = message;
    }

    function switchView(view) {
        const showHomeView = view === 'home';

        homeView.hidden = !showHomeView;
        redirectView.hidden = showHomeView;

        homeView.style.display = showHomeView ? 'grid' : 'none';
        redirectView.style.display = showHomeView ? 'none' : 'block';

        state.view = view;
        browserRoot.setAttribute('data-browser-current-view', view);
    }

    function showHome(message) {
        switchView('home');
        addressInput.value = 'accueil';

        if (message) {
            setStatus(message);
        }
    }

    function showOsLaCapsule(message) {
        switchView('os-lacapsule');
        addressInput.value = 'os-lacapsule';
        setStatus(
            capsuleStr('firefox.statusOsLaCapsuleLoading', 'Chargement de la page os-lacapsule...')
        );
        redirectFrame.src = OS_LACAPSULE_PAGE;

        if (message) {
            setStatus(message);
        }
    }

    form.addEventListener('submit', function onAddressSubmit(event) {
        event.preventDefault();
        showOsLaCapsule(
            capsuleStr('firefox.statusSubmitRedirect', 'Toute saisie est redirigee vers os-lacapsule.')
        );
    });

    btnHomes.forEach((btnHome) => {
        btnHome.addEventListener('click', function onHomeClick() {
            showHome(capsuleStr('firefox.statusHomeShown', 'Page Accueil affichee.'));
        });
    });

    btnReload.addEventListener('click', function onReloadClick() {
        if (state.view === 'os-lacapsule') {
            redirectFrame.src = OS_LACAPSULE_PAGE;
            setStatus(
                capsuleStr('firefox.statusOsLaCapsuleReloaded', 'Page os-lacapsule rechargee.')
            );
            return;
        }

        showHome(capsuleStr('firefox.statusHomeReloaded', 'Page Accueil rechargee.'));
    });

    btnBack.addEventListener('click', function onBackClick() {
        setStatus(
            capsuleStr(
                'firefox.statusBackUnavailable',
                'Retour indisponible pour le moment (mode simulation).'
            )
        );
    });

    btnForward.addEventListener('click', function onForwardClick() {
        setStatus(
            capsuleStr(
                'firefox.statusForwardUnavailable',
                'Avance indisponible pour le moment (mode simulation).'
            )
        );
    });

    if (btnNewTab) {
        btnNewTab.addEventListener('click', function onNewTabClick() {
            showHome(capsuleStr('firefox.statusNewTab', 'Nouvel onglet: page Accueil affichee.'));
        });
    }

    bookmarksBar.addEventListener('click', function onBookmarksBarClick(event) {
        const bookmark = event.target.closest('[data-browser-bookmark]');
        if (!bookmark || !bookmarksBar.contains(bookmark)) {
            return;
        }

        event.preventDefault();
        const label = bookmark.getAttribute('data-browser-bookmark') || 'favori';
        const route = bookmark.getAttribute('data-browser-route') || 'noop';

        if (route === 'home') {
            showHome(capsuleStr('firefox.statusFavoriteHome', 'Favori "Accueil" ouvert.'));
            return;
        }

        if (route === 'os-lacapsule') {
            showOsLaCapsule(
                capsuleStrFmt(
                    'firefox.statusFavoriteOsLaCapsule',
                    { label },
                    'Favori "' + label + '" ouvert.'
                )
            );
            return;
        }

        if (isHomeTarget(label)) {
            showHome(capsuleStr('firefox.statusFavoriteHome', 'Favori "Accueil" ouvert.'));
            return;
        }

        if (isOsLaCapsuleTarget(label)) {
            showOsLaCapsule(
                capsuleStrFmt(
                    'firefox.statusFavoriteOsLaCapsule',
                    { label },
                    'Favori "' + label + '" ouvert.'
                )
            );
            return;
        }

        setStatus(
            capsuleStrFmt(
                'firefox.statusBookmarkUnmapped',
                { label },
                'Favori "' + label + '" non mappe pour le moment.'
            )
        );
    });

    tabs.forEach(function onTab(tab) {
        tab.addEventListener('click', function onTabClick() {
            const label = tab.getAttribute('data-browser-tab') || 'onglet';
            showHome(
                capsuleStrFmt(
                    'firefox.statusTabSimulated',
                    { label },
                    'Onglet "' + label + '" simule.'
                )
            );
        });
    });

    redirectFrame.addEventListener('load', function onRedirectLoad() {
        if (state.view === 'os-lacapsule') {
            setStatus(
                capsuleStr('firefox.statusOsLaCapsuleShown', 'Page os-lacapsule affichee.')
            );
        }
    });

    redirectFrame.addEventListener('error', function onRedirectError() {
        showHome(
            capsuleStr(
                'firefox.statusErrorOsLaCapsule',
                "Erreur de chargement: impossible d'ouvrir la page os-lacapsule."
            )
        );
    });

    browserRoot.dataset.initialized = 'true';
    showHome(state.status);
}

window.initFirefoxBrowser = initFirefoxBrowser;
window.initMintFirefoxBrowser = initFirefoxBrowser;
