function initMintFirefoxBrowser() {
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

    const btnHome = browserRoot.querySelector('[data-browser-action="home"]');
    const btnReload = browserRoot.querySelector('[data-browser-action="reload"]');
    const btnBack = browserRoot.querySelector('[data-browser-action="back"]');
    const btnForward = browserRoot.querySelector('[data-browser-action="forward"]');
    const btnNewTab = browserRoot.querySelector('[data-browser-action="new-tab"]');
    const tabs = browserRoot.querySelectorAll('[data-browser-tab]');

    if (!form || !addressInput || !status || !homeView || !redirectView || !redirectFrame || !bookmarksBar || !btnHome || !btnReload || !btnBack || !btnForward) {
        return;
    }

    const state = {
        view: 'home',
        status: 'Mode simulation actif: la vue Accueil ouvre la page interne du navigateur.'
    };
    const OS_LACAPSULE_PAGE = '/index.html';

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
        setStatus('Chargement de la page os-lacapsule...');
        redirectFrame.src = OS_LACAPSULE_PAGE;

        if (message) {
            setStatus(message);
        }
    }

    form.addEventListener('submit', function onAddressSubmit(event) {
        event.preventDefault();
        showOsLaCapsule('Toute saisie est redirigee vers os-lacapsule.');
    });

    btnHome.addEventListener('click', function onHomeClick() {
        showHome('Page Accueil affichee.');
    });

    btnReload.addEventListener('click', function onReloadClick() {
        if (state.view === 'os-lacapsule') {
            redirectFrame.src = OS_LACAPSULE_PAGE;
            setStatus('Page os-lacapsule rechargee.');
            return;
        }

        showHome('Page Accueil rechargee.');
    });

    btnBack.addEventListener('click', function onBackClick() {
        setStatus('Retour indisponible pour le moment (mode simulation).');
    });

    btnForward.addEventListener('click', function onForwardClick() {
        setStatus('Avance indisponible pour le moment (mode simulation).');
    });

    if (btnNewTab) {
        btnNewTab.addEventListener('click', function onNewTabClick() {
            showHome('Nouvel onglet: page Accueil affichee.');
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
            showHome('Favori "Accueil" ouvert.');
            return;
        }

        if (route === 'os-lacapsule') {
            showOsLaCapsule('Favori "' + label + '" ouvert.');
            return;
        }

        if (isHomeTarget(label)) {
            showHome('Favori "Accueil" ouvert.');
            return;
        }

        if (isOsLaCapsuleTarget(label)) {
            showOsLaCapsule('Favori "' + label + '" ouvert.');
            return;
        }

        setStatus('Favori "' + label + '" non mappe pour le moment.');
    });

    tabs.forEach(function onTab(tab) {
        tab.addEventListener('click', function onTabClick() {
            const label = tab.getAttribute('data-browser-tab') || 'onglet';
            showHome('Onglet "' + label + '" simule.');
        });
    });

    redirectFrame.addEventListener('load', function onRedirectLoad() {
        if (state.view === 'os-lacapsule') {
            setStatus('Page os-lacapsule affichee.');
        }
    });

    redirectFrame.addEventListener('error', function onRedirectError() {
        showHome('Erreur de chargement: impossible d\'ouvrir la page os-lacapsule.');
    });

    browserRoot.dataset.initialized = 'true';
    showHome(state.status);
}
