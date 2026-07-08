(function initFedoraOverview() {
    'use strict';

    const shell = document.getElementById('fedora');
    const trigger = document.querySelector('.fedora-overview-trigger');
    const overview = document.querySelector('.fedora-overview');
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

    const resolveSearchIcon = (icon) => {
        if (typeof window.resolveCapsuleResourceUrl === 'function') {
            return window.resolveCapsuleResourceUrl(icon);
        }
        if (window.CapsuleResource && typeof window.CapsuleResource.resolve === 'function') {
            return window.CapsuleResource.resolve(icon);
        }
        return icon;
    };

    const searchCatalog = [
        {
            label: 'Fichiers',
            aliases: ['files', 'nemo', 'nautilus', 'dossier', 'documents'],
            description: 'Gestionnaire de fichiers',
            icon: './assets/images/toolkits/gnome/apps/dash/org.gnome.Nautilus.svg',
            dataLink: 'nemo'
        },
        {
            label: 'Firefox',
            aliases: ['navigateur', 'browser', 'web', 'internet'],
            description: 'Navigateur web',
            icon: './assets/images/toolkits/gnome/apps/firefox.webp',
            dataLink: 'firefox'
        },
        {
            label: 'Lecteur vidéo',
            aliases: ['video', 'videos', 'showtime', 'media'],
            description: 'Lire des vidéos',
            icon: './assets/images/toolkits/gnome/apps/overview/org.gnome.Showtime.svg',
            dataLink: 'lecteur_multimedia'
        },
        {
            label: 'Calculatrice',
            aliases: ['calculator', 'calcul', 'maths'],
            description: 'Effectuer des calculs',
            icon: './assets/images/toolkits/gnome/apps/overview/org.gnome.Calculator.png',
            dataLink: 'calculator'
        },
        {
            label: 'GNOME Software',
            aliases: ['software', 'logiciels', 'store', 'boutique', 'update_manager'],
            description: 'Installer des applications',
            icon: './assets/images/toolkits/gnome/apps/dash/org.gnome.Software.svg',
            dataLink: 'update_manager'
        },
        {
            label: 'Éditeur de texte',
            aliases: ['text editor', 'gedit', 'editeur', 'texte'],
            description: 'Éditeur de texte simple',
            icon: './assets/images/toolkits/gnome/apps/dash/org.gnome.TextEditor.svg',
            dataLink: 'text_editor'
        },
        {
            label: 'LibreOffice Writer',
            aliases: ['writer', 'document', 'office'],
            description: 'Traitement de texte',
            icon: './assets/images/toolkits/gnome/apps/overview/libreoffice-writer.svg',
            dataLink: 'librewriter'
        },
        {
            label: 'LibreOffice Calc',
            aliases: ['calc', 'tableur', 'spreadsheet', 'office'],
            description: 'Tableur',
            icon: './assets/images/toolkits/gnome/apps/overview/libreoffice-calc.svg'
        },
        {
            label: 'Paramètres',
            aliases: ['settings', 'preferences', 'configuration', 'theme'],
            description: 'Configurer le système',
            icon: './assets/images/toolkits/gnome/apps/overview/org.gnome.Settings.svg',
            dataLink: 'themes'
        },
        {
            label: 'Terminal',
            aliases: ['ptyxis', 'console', 'shell', 'commande'],
            description: 'Émulateur de terminal',
            icon: './assets/images/toolkits/gnome/apps/overview/org.gnome.Ptyxis.svg',
            dataLink: 'terminal'
        },
        {
            label: 'Calendrier',
            aliases: ['calendar', 'agenda', 'date'],
            description: 'Consulter le calendrier',
            icon: './assets/images/toolkits/gnome/apps/dash/org.gnome.Calendar.svg',
            dataLink: 'calendar'
        },
        {
            label: 'Horloges',
            aliases: ['clocks', 'world clock', 'fuseau'],
            description: 'Horloges mondiales',
            icon: './assets/images/toolkits/gnome/apps/overview/org.gnome.clocks.svg',
            dataLink: 'clocks'
        },
        {
            label: 'Contacts',
            aliases: ['contact', 'adresse'],
            description: 'Carnet de contacts',
            icon: './assets/images/toolkits/gnome/apps/overview/org.gnome.Contacts.svg'
        },
        {
            label: 'Météo',
            aliases: ['weather', 'temps'],
            description: 'Prévisions météo',
            icon: './assets/images/toolkits/gnome/apps/overview/org.gnome.Weather.svg'
        },
        {
            label: 'Caractères',
            aliases: ['characters', 'symboles', 'unicode'],
            description: 'Table des caractères',
            icon: './assets/images/toolkits/gnome/apps/overview/org.gnome.Characters.svg'
        }
    ];

    let currentMode = 'workspace';
    let currentResults = [];

    const setOverviewMode = (mode) => {
        currentMode = mode === 'apps' ? 'apps' : 'workspace';
        shell.classList.toggle('is-overview-apps', mode === 'apps');
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
        trigger.setAttribute('aria-pressed', String(isOpen));
        overview.setAttribute('aria-hidden', String(!isOpen));
        if (isOpen) {
            setOverviewMode(mode);
            window.setTimeout(() => {
                if (window.CapsuleGnomeWorkspaces
                    && typeof window.CapsuleGnomeWorkspaces.refreshWorkspacePreviews === 'function') {
                    window.CapsuleGnomeWorkspaces.refreshWorkspacePreviews();
                }
                if (searchInput) {
                    searchInput.focus();
                }
            }, 80);
        } else {
            clearSearch(false);
            setOverviewMode('workspace');
        }
    };

    const toggleOverview = () => {
        const isOpen = shell.classList.contains('is-overview');
        setOverview(!isOpen, 'workspace');
    };

    const isTypingTarget = (target) => {
        if (!target) {
            return false;
        }
        const tag = target.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    };

    window.CapsuleGnomeOverview = {
        setOverview,
        toggleOverview,
        isOpen: () => shell.classList.contains('is-overview'),
    };

    trigger.setAttribute('aria-pressed', 'false');
    trigger.addEventListener('click', (event) => {
        event.preventDefault();
        toggleOverview();
    });

    const getLaunchTarget = (linkId) => document.querySelector(`.fedora-dock a[data-link="${linkId}"], a[target="windowElement"][data-link="${linkId}"]`);

    const openOverviewLink = (linkId) => {
        if (!linkId) {
            return;
        }
        if (linkId === 'themes' && typeof window.setCapsuleSettingsPanel === 'function') {
            window.setCapsuleSettingsPanel('wifi');
        }
        const target = getLaunchTarget(linkId);
        setOverview(false, 'workspace');
        if (target) {
            target.click();
            return;
        }
        if (typeof window.openWindowByDataLink === 'function') {
            window.openWindowByDataLink(linkId);
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
        img.src = resolveSearchIcon(item.icon);
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

        const catalog = (window.CapsuleGnomeSettingsParity
            && typeof window.CapsuleGnomeSettingsParity.filterSearchCatalog === 'function')
            ? window.CapsuleGnomeSettingsParity.filterSearchCatalog(searchCatalog)
            : searchCatalog;
        currentResults = appSearch.search(query, catalog, { limit: 8 });
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

        const appsButton = event.target.closest('[data-overview-apps]');
        if (appsButton && overview.contains(appsButton)) {
            const isOpen = shell.classList.contains('is-overview');
            const isApps = shell.classList.contains('is-overview-apps');
            clearSearch(false);
            setOverview(true, isOpen && isApps ? 'workspace' : 'apps');
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
            return;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Meta' && !event.repeat && !event.ctrlKey && !event.altKey && !isTypingTarget(event.target)) {
            event.preventDefault();
            toggleOverview();
            return;
        }
        if (event.key === 'Escape' && shell.classList.contains('is-overview')) {
            if (searchInput && searchInput.value.trim()) {
                event.preventDefault();
                clearSearch(true);
                searchInput.focus();
                return;
            }
            setOverview(false, 'workspace');
        }
    });
})();
