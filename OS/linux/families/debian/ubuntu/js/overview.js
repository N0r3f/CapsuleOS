/**
 * Vue Activités / grille applications Ubuntu (réf. app_bouton_bas.png).
 * Bouton dock bas : #ubuntu-dock-show-apps → mode apps.
 */
(function initUbuntuOverview() {
    const shell = document.getElementById('ubuntu');
    const trigger = document.querySelector('.fedora-overview-trigger');
    const overview = document.querySelector('.fedora-overview');
    const showAppsBtn = document.getElementById('ubuntu-dock-show-apps');
    const searchForm = overview ? overview.querySelector('[data-overview-search-form]') : null;
    const searchInput = overview ? overview.querySelector('[data-overview-search-input]') : null;
    const searchClear = overview ? overview.querySelector('[data-overview-search-clear]') : null;
    const searchResults = overview ? overview.querySelector('[data-overview-search-results]') : null;

    if (!shell || !trigger || !overview) {
        return;
    }

    const appSearch = window.CapsuleAppSearch || {
        search() {
            return [];
        }
    };

    const searchCatalog = [
        {
            label: 'Fichiers',
            aliases: ['files', 'nemo', 'nautilus', 'dossier', 'documents'],
            description: 'Gestionnaire de fichiers',
            icon: './media/img/dock/files.png',
            dataLink: 'nemo'
        },
        {
            label: 'Firefox',
            aliases: ['navigateur', 'browser', 'web', 'internet'],
            description: 'Navigateur web',
            icon: './media/img/dock/firefox.png',
            dataLink: 'firefox'
        },
        {
            label: 'Ubuntu Software',
            aliases: ['software', 'logiciels', 'store', 'boutique'],
            description: 'Installer des applications',
            icon: './media/img/dock/software-store.png',
            dataLink: 'themes'
        },
        {
            label: 'Aide',
            aliases: ['help', 'aide', 'support', 'yelp'],
            description: 'Documentation Ubuntu',
            icon: './media/img/dock/help.png',
            dataLink: 'profile'
        },
        {
            label: 'Terminal',
            aliases: ['ptyxis', 'console', 'shell', 'commande'],
            description: 'Émulateur de terminal',
            icon: './media/img/dock/terminal.png',
            dataLink: 'terminal'
        },
        {
            label: 'Paramètres',
            aliases: ['settings', 'preferences', 'configuration', 'theme'],
            description: 'Configurer le système',
            icon: './media/img/apps/overview/settings.png',
            dataLink: 'themes'
        },
        {
            label: 'Horloges',
            aliases: ['clocks', 'horloge', 'alarme', 'minuteur'],
            description: 'Horloges et alarmes',
            icon: './media/img/apps/overview/clocks.png'
        },
        {
            label: 'Centre de sécurité',
            aliases: ['security', 'securite', 'confidentialite', 'privacy', 'snap'],
            description: 'Permissions et sécurité',
            icon: './media/img/apps/overview/security-center.png'
        },
        {
            label: 'Calculatrice',
            aliases: ['calculator', 'calc'],
            description: 'Calculatrice',
            icon: './media/img/apps/overview/calculator.png'
        },
        {
            label: 'Ressources',
            aliases: ['monitor', 'system monitor', 'moniteur', 'cpu', 'ram'],
            description: 'Moniteur système',
            icon: './media/img/apps/overview/system-monitor.png'
        },
        {
            label: 'Missions CapsuleOS',
            aliases: ['checklist', 'missions', 'decouverte'],
            description: 'Parcours guidé',
            icon: './media/img/apps/checklist.svg',
            dataLink: 'checklist'
        }
    ];

    let currentMode = 'workspace';
    let currentResults = [];

    const syncShowAppsButton = () => {
        if (!showAppsBtn) {
            return;
        }
        const isApps = shell.classList.contains('is-overview')
            && shell.classList.contains('is-overview-apps');
        showAppsBtn.setAttribute('aria-pressed', String(isApps));
    };

    const setOverviewMode = (mode) => {
        currentMode = mode === 'apps' ? 'apps' : 'workspace';
        shell.classList.toggle('is-overview-apps', mode === 'apps');
        syncShowAppsButton();
    };

    const setSearchActive = (isActive) => {
        shell.classList.toggle('is-overview-search', isActive);
        if (searchResults) {
            searchResults.hidden = !isActive;
        }
        if (searchClear) {
            searchClear.hidden = !isActive;
        }
    };

    const clearSearch = (restoreMode = true) => {
        if (searchInput) {
            searchInput.value = '';
        }
        currentResults = [];
        if (searchResults) {
            searchResults.innerHTML = '';
        }
        setSearchActive(false);
        if (restoreMode) {
            setOverviewMode(currentMode);
        }
    };

    const setOverview = (isOpen, mode = 'workspace') => {
        shell.classList.toggle('is-overview', isOpen);
        trigger.setAttribute('aria-pressed', String(isOpen && mode !== 'apps'));
        overview.setAttribute('aria-hidden', String(!isOpen));
        if (isOpen) {
            setOverviewMode(mode);
            if (mode === 'apps' && searchInput) {
                window.setTimeout(() => {
                    searchInput.focus();
                }, 0);
            }
        } else {
            clearSearch(false);
            setOverviewMode('workspace');
        }
        syncShowAppsButton();
    };

    const toggleOverviewWorkspace = () => {
        const isOpen = shell.classList.contains('is-overview');
        const isApps = shell.classList.contains('is-overview-apps');
        if (isOpen && !isApps) {
            setOverview(false, 'workspace');
            return;
        }
        setOverview(true, 'workspace');
    };

    const toggleOverviewApps = () => {
        const isOpen = shell.classList.contains('is-overview');
        const isApps = shell.classList.contains('is-overview-apps');
        if (isOpen && isApps) {
            setOverview(false, 'workspace');
            return;
        }
        clearSearch(false);
        setOverview(true, 'apps');
    };

    trigger.setAttribute('aria-pressed', 'false');
    trigger.addEventListener('click', (event) => {
        event.preventDefault();
        toggleOverviewWorkspace();
    });

    if (showAppsBtn) {
        showAppsBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleOverviewApps();
        });
    }

    const getLaunchTarget = (linkId) => document.querySelector(
        `#tableau.fedora-dock a[data-link="${linkId}"], a[target="windowElement"][data-link="${linkId}"]`
    );

    const openOverviewLink = (linkId) => {
        if (!linkId) {
            return;
        }
        const target = getLaunchTarget(linkId);
        setOverview(false, 'workspace');
        if (target) {
            target.click();
        }
    };

    const createResultButton = (item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fedora-overview__search-result';
        button.dataset.overviewResultIndex = String(index);
        button.setAttribute('aria-label', item.label);
        if (!item.dataLink) {
            button.classList.add('fedora-overview__search-result--disabled');
            button.setAttribute('aria-disabled', 'true');
        }

        const img = document.createElement('img');
        img.src = item.icon;
        img.alt = '';

        const label = document.createElement('span');
        label.className = 'fedora-overview__search-result-label';
        label.textContent = item.label;

        if (item.description) {
            const description = document.createElement('span');
            description.className = 'fedora-overview__search-result-description';
            description.textContent = item.description;
            button.appendChild(img);
            button.appendChild(label);
            button.appendChild(description);
            return button;
        }

        button.appendChild(img);
        button.appendChild(label);
        return button;
    };

    const renderSearchResults = (query) => {
        if (!searchResults) {
            return;
        }

        currentResults = appSearch.search(query, searchCatalog, { limit: 8 });
        searchResults.innerHTML = '';

        if (!currentResults.length) {
            const empty = document.createElement('p');
            empty.className = 'fedora-overview__search-empty';
            empty.textContent = 'Aucun résultat';
            searchResults.appendChild(empty);
            return;
        }

        currentResults.forEach((item, index) => {
            searchResults.appendChild(createResultButton(item, index));
        });
    };

    const updateSearch = () => {
        if (!searchInput) {
            return;
        }

        const query = searchInput.value.trim();
        if (!query) {
            clearSearch(true);
            return;
        }

        setSearchActive(true);
        setOverviewMode('apps');
        if (!shell.classList.contains('is-overview')) {
            setOverview(true, 'apps');
        }
        renderSearchResults(query);
    };

    if (searchInput) {
        searchInput.addEventListener('input', updateSearch);
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const firstActionable = currentResults.find((result) => result.dataLink);
            if (firstActionable) {
                openOverviewLink(firstActionable.dataLink);
            }
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            clearSearch(true);
            if (searchInput) {
                searchInput.focus();
            }
        });
    }

    overview.addEventListener('click', (event) => {
        const desktopButton = event.target.closest('[data-overview-desktop]');
        if (desktopButton && overview.contains(desktopButton)) {
            setOverview(false, 'workspace');
            return;
        }

        const resultButton = event.target.closest('[data-overview-result-index]');
        if (resultButton && overview.contains(resultButton)) {
            const item = currentResults[Number(resultButton.dataset.overviewResultIndex)];
            if (item && item.dataLink) {
                openOverviewLink(item.dataLink);
            }
            return;
        }

        const launcher = event.target.closest('[data-overview-link]');
        if (launcher && overview.contains(launcher)) {
            const linkId = launcher.getAttribute('data-overview-link');
            openOverviewLink(linkId);
        }
    });
})();
