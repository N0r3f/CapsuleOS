/**
 * Paramètres du système — cinnamon-settings 6.6 sur Mint.
 */
(function initCinnamonSettingsModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Paramètres du système';
    var ICON_BASE = './assets/icons/cinnamon/cs/';
    var TOOLKIT_ICON_BASE = './assets/images/toolkits/cinnamon/apps/';

    /** Icônes haute résolution (SVG/PNG VM) — remplace les cs/*.png 24×24 upscalés. */
    var PANEL_TOOLKIT_ICONS = {
        general: 'cinnamon-settings-general',
        themes: 'cinnamon-settings-themes',
        backgrounds: 'cinnamon-settings-backgrounds',
        effects: 'cinnamon-settings-effects',
        extensions: 'cinnamon-settings-extensions',
        applets: 'cinnamon-settings-applets',
        desklets: 'cinnamon-settings-desklets',
        windows: 'cinnamon-settings-windows',
        workspaces: 'cinnamon-settings-workspaces',
        hotcorner: 'cinnamon-settings-hotcorner',
        gestures: 'cinnamon-settings-gestures',
        panel: 'cinnamon-settings-panel',
        desktop: 'cinnamon-settings-desktop',
        screensaver: 'cinnamon-settings-screensaver',
        fonts: 'cinnamon-settings-fonts',
        keyboard: 'cinnamon-settings-keyboard',
        mouse: 'cinnamon-settings-mouse',
        accessibility: 'cinnamon-settings-universal-access',
        sound: 'cinnamon-settings-sound',
        notifications: 'cinnamon-settings-notifications',
        privacy: 'cinnamon-settings-privacy',
        power: 'cinnamon-settings-power',
        startup: 'cinnamon-settings-startup',
        default: 'cinnamon-settings-default',
        calendar: 'cinnamon-settings-calendar',
        user: 'cinnamon-settings-user',
        users: 'cinnamon-settings-users',
        actions: 'cinnamon-settings-actions',
        nightlight: 'cinnamon-settings-nightlight',
        thunderbolt: 'cinnamon-settings-thunderbolt',
        display: 'cinnamon-display-panel',
        color: 'cinnamon-color-panel',
        network: 'cinnamon-network-panel',
        wacom: 'cinnamon-wacom-panel',
        bluetooth: 'blueman-manager',
        firewall: 'gufw',
        languages: 'mintlocale',
        'input-method': 'cinnamon-onscreen-keyboard',
        'software-sources': 'cinnamon-settings',
        'system-info': 'mintreport',
        printers: 'system-config-printer',
        passwords: 'org.gnome.seahorse.Application',
        'online-accounts': 'gnome-online-accounts-gtk',
        disks: 'disks',
        fingerprints: 'fingwit',
        'login-window': 'cinnamon-settings'
    };

    var CATEGORY_TOOLKIT_ICONS = {
        appear: 'cinnamon-settings-themes',
        prefs: 'cinnamon-settings-general'
    };

    var PANELS = [
        { id: 'general', label: 'Général', icon: 'cs-general', keywords: 'general compositing menu' },
        { id: 'themes', label: 'Thèmes', icon: 'cs-themes', keywords: 'themes gtk icons cursor appearance' },
        { id: 'backgrounds', label: 'Fonds d\'écran', icon: 'cs-backgrounds', keywords: 'background wallpaper fond écran' },
        { id: 'effects', label: 'Effets', icon: 'cs-desktop-effects', keywords: 'effects animations' },
        { id: 'extensions', label: 'Extensions', icon: 'cs-extensions', keywords: 'extensions spices' },
        { id: 'applets', label: 'Applets', icon: 'cs-applets', keywords: 'applets panel' },
        { id: 'desklets', label: 'Desklets', icon: 'cs-desklets', keywords: 'desklets desktop' },
        { id: 'windows', label: 'Fenêtres', icon: 'cs-windows', keywords: 'windows titlebar focus' },
        { id: 'workspaces', label: 'Espaces de travail', icon: 'cs-workspaces', keywords: 'workspaces virtual' },
        { id: 'hotcorner', label: 'Coins intelligents', icon: 'cs-overview', keywords: 'hot corners overview coins' },
        { id: 'gestures', label: 'Gestes', icon: 'cs-gestures', keywords: 'gestures touchpad' },
        { id: 'panel', label: 'Barre des tâches', icon: 'cs-panel', keywords: 'panel taskbar' },
        { id: 'desktop', label: 'Bureau', icon: 'cs-desktop', keywords: 'desktop icons' },
        { id: 'screensaver', label: 'Économiseur d\'écran', icon: 'cs-screensaver', keywords: 'screensaver lock économiseur' },
        { id: 'fonts', label: 'Choix des polices', icon: 'cs-fonts', keywords: 'fonts text polices' },
        { id: 'keyboard', label: 'Clavier', icon: 'cs-keyboard', keywords: 'keyboard layout shortcuts' },
        { id: 'mouse', label: 'Souris et pavé tactile', icon: 'cs-mouse', keywords: 'mouse touchpad pointer' },
        { id: 'accessibility', label: 'Accessibilité', icon: 'cs-universal-access', keywords: 'accessibility zoom contrast' },
        { id: 'sound', label: 'Son', icon: 'cs-sound', keywords: 'sound volume audio' },
        { id: 'notifications', label: 'Notifications', icon: 'cs-notifications', keywords: 'notifications alerts' },
        { id: 'privacy', label: 'Confidentialité', icon: 'cs-privacy', keywords: 'privacy history' },
        { id: 'power', label: 'Gestion de l\'alimentation', icon: 'cs-power', keywords: 'power suspend battery' },
        { id: 'startup', label: 'Applications lancées au démarrage', icon: 'cs-startup-programs', keywords: 'startup autostart démarrage' },
        { id: 'default', label: 'Applications par défaut', icon: 'cs-default-applications', keywords: 'default applications browser mail défaut' },
        { id: 'calendar', label: 'Date et heure', icon: 'cs-date-time', keywords: 'calendar clock timezone' },
        { id: 'user', label: 'Détails du compte', icon: 'cs-user', keywords: 'account user profile' },
        { id: 'users', label: 'Utilisateurs et groupes', icon: 'system-users', keywords: 'users groups admin' },
        { id: 'actions', label: 'Actions', icon: 'cs-actions', keywords: 'actions shortcuts' },
        { id: 'nightlight', label: 'Éclairage nocturne', icon: 'cs-nightlight', keywords: 'night light blue' },
        { id: 'thunderbolt', label: 'Thunderbolt', icon: 'cs-thunderbolt', keywords: 'thunderbolt usb' },
        { id: 'color', label: 'Couleur', icon: 'cs-general', keywords: 'color couleur' },
        { id: 'display', label: 'Affichage', icon: 'preferences-desktop', keywords: 'display monitor resolution' },
        { id: 'network', label: 'Réseau', icon: 'cs-panel', keywords: 'network wifi ethernet' },
        { id: 'wacom', label: 'Tablette graphique', icon: 'cs-mouse', keywords: 'wacom tablet stylus' },
        { id: 'bluetooth', label: 'Bluetooth', icon: 'cs-general', keywords: 'bluetooth devices' },
        { id: 'firewall', label: 'Pare-feu', icon: 'cs-privacy', keywords: 'firewall gufw' },
        { id: 'languages', label: 'Langues', icon: 'cs-language', keywords: 'languages locale' },
        { id: 'input-method', label: 'Méthode de saisie', icon: 'cs-input-method', keywords: 'input method ibus' },
        { id: 'fingerprints', label: 'Empreintes digitales', icon: 'cs-user', keywords: 'fingerprint fingwit' },
        { id: 'login-window', label: 'Fenêtre de connexion', icon: 'cs-login', keywords: 'login lightdm' },
        { id: 'software-sources', label: 'Sources de logiciels', icon: 'cs-sources', keywords: 'software sources mintsources' },
        { id: 'system-info', label: 'Informations système', icon: 'cs-general', keywords: 'system information mintreport' },
        { id: 'printers', label: 'Imprimantes', icon: 'cs-general', keywords: 'printers print' },
        { id: 'passwords', label: 'Mots de passe et clés', icon: 'cs-privacy', keywords: 'passwords seahorse keys' },
        { id: 'online-accounts', label: 'Comptes en ligne', icon: 'cs-online-accounts', keywords: 'online accounts google microsoft comptes' },
        { id: 'disks', label: 'Disques', icon: 'cs-general', keywords: 'disks storage gnome-disks' }
    ];

    /* Accueil VM cinnamon-settings — catégories Apparence + Préférences (grille 6 colonnes) */
    var HOME_CATEGORIES = [
        {
            id: 'appear',
            label: 'Apparence',
            icon: 'cs-cat-appearance',
            modules: ['fonts', 'effects', 'backgrounds', 'themes', 'sound', 'notifications']
        },
        {
            id: 'prefs',
            label: 'Préférences',
            icon: 'cs-cat-prefs',
            modules: [
                'accessibility', 'actions', 'applets', 'startup', 'default', 'desktop',
                'hotcorner', 'online-accounts', 'calendar', 'desklets', 'user', 'screensaver',
                'panel', 'workspaces', 'extensions', 'windows', 'general', 'gestures', 'languages',
                'keyboard', 'mouse', 'power', 'privacy', 'display'
            ]
        }
    ];

    var GENERIC_ROWS = {
        effects: ['Activer les effets de bureau', 'Effets des fenêtres', 'Animation des menus'],
        extensions: ['Extensions installées', 'Gérer les extensions'],
        applets: ['Applets installées', 'Télécharger des applets'],
        desklets: ['Desklets installés', 'Télécharger des desklets'],
        windows: ['Focus au survol', 'Placement automatique', 'Boutons de la barre de titre'],
        workspaces: ['Nombre d\'espaces de travail', 'Afficher les espaces dans le panneau'],
        hotcorner: ['Coin supérieur gauche', 'Coin supérieur droit', 'Coin inférieur gauche', 'Coin inférieur droit'],
        gestures: ['Gestes du pavé tactile', 'Gestes à trois doigts'],
        desktop: ['Icônes sur le bureau', 'Disposition des icônes'],
        screensaver: ['Délai avant écran de veille', 'Verrouiller à la reprise'],
        fonts: ['Police de l\'interface', 'Police des documents', 'Résolution de la police'],
        keyboard: ['Dispositions de clavier', 'Raccourcis clavier', 'Saisie'],
        mouse: ['Vitesse du pointeur', 'Clic du milieu', 'Défilement naturel'],
        accessibility: ['Loupe', 'Contraste élevé', 'Lecteur d\'écran'],
        sound: ['Volume de sortie', 'Volume d\'entrée', 'Périphériques de sortie'],
        notifications: ['Notifications du bureau', 'Ne pas déranger'],
        privacy: ['Historique récent', 'Effacer l\'historique'],
        power: ['Écran éteint après', 'Mise en veille après', 'Action bouton d\'alimentation'],
        startup: ['Applications au démarrage'],
        default: ['Navigateur Web', 'Client de messagerie', 'Terminal'],
        calendar: ['Fuseau horaire', 'Format de l\'heure', 'Format de la date'],
        user: ['Nom affiché', 'Mot de passe', 'Image du compte'],
        users: ['Utilisateurs', 'Groupes'],
        actions: ['Actions disponibles', 'Raccourcis personnalisés'],
        nightlight: ['Activer l\'éclairage nocturne', 'Planification'],
        thunderbolt: ['Appareils Thunderbolt', 'Autorisation de connexion'],
        color: ['Profil couleur', 'Calibration'],
        display: ['Résolution', 'Fréquence de rafraîchissement', 'Mise en miroir'],
        network: ['Connexion filaire', 'Wi-Fi', 'Proxy'],
        wacom: ['Tablette graphique', 'Stylet', 'Zone active'],
        bluetooth: ['Adaptateurs Bluetooth', 'Appareils appairés'],
        firewall: ['État du pare-feu', 'Règles entrantes'],
        languages: ['Langue du système', 'Formats régionaux'],
        'input-method': ['Méthode de saisie', 'Clavier IBus'],
        fingerprints: ['Enregistrer une empreinte', 'Déverrouillage'],
        'login-window': ['Thème de connexion', 'Utilisateur automatique'],
        'software-sources': ['Dépôts officiels', 'PPA'],
        'system-info': ['Matériel', 'Système d\'exploitation', 'Rapport système'],
        printers: ['Imprimantes configurées', 'Ajouter une imprimante'],
        passwords: ['Mots de passe', 'Certificats', 'Clés SSH'],
        'online-accounts': ['Google', 'Microsoft', 'Ajouter un compte'],
        disks: ['Volumes', 'Partitionnement', 'SMART']
    };

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'themes') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncWindowTitle(winEl) {
        if (!winEl) {
            return;
        }
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = WINDOW_TITLE;
        }
        winEl.setAttribute('data-title', WINDOW_TITLE);
    }

    var THEMES_PANEL_HTML = ''
        + '<main id="themesApp" class="themes-app" aria-label="Thèmes">'
        + '<section class="themes-app__section">'
        + '<h2 class="themes-app__label">Style</h2>'
        + '<div class="themes-app__control">'
        + '<button type="button" class="themes-app__select" aria-haspopup="listbox" aria-expanded="false">'
        + '<span>Mint-Y-Dark-Aqua</span>'
        + '<span class="themes-app__caret" aria-hidden="true">▼</span>'
        + '</button></div></section>'
        + '<section class="themes-app__section themes-app__section--vm-labels">'
        + '<h2 class="themes-app__label">Thème GTK</h2>'
        + '<p class="themes-app__vm-value" data-themes-gtk>Mint-Y-Aqua</p></section>'
        + '<section class="themes-app__section themes-app__section--vm-labels">'
        + '<h2 class="themes-app__label">Thème des icônes</h2>'
        + '<p class="themes-app__vm-value" data-themes-icons>Mint-Y-Sand</p></section>'
        + '<section class="themes-app__section">'
        + '<h2 class="themes-app__label">Apparence</h2>'
        + '<div class="themes-app__cards" role="radiogroup" aria-label="Choix du thème">'
        + '<button type="button" class="themes-card" data-theme-option="dark" role="radio" aria-checked="true">'
        + '<span class="themes-card__preview themes-card__preview--dark" aria-hidden="true"></span>'
        + '<span class="themes-card__title">Sombre</span></button>'
        + '<button type="button" class="themes-card" data-theme-option="light" role="radio" aria-checked="false">'
        + '<span class="themes-card__preview themes-card__preview--light" aria-hidden="true"></span>'
        + '<span class="themes-card__title">Clair</span></button></div>'
        + '<p class="themes-app__help" data-themes-help>Le thème sombre est actif.</p></section>'
        + '<section class="themes-app__section themes-app__section--backgrounds" data-mint-wallpaper-section>'
        + '<h2 class="themes-app__label">Arrière-plan</h2>'
        + '<div class="themes-wallpaper-grid" data-wallpaper-grid role="list" aria-label="Fonds d\'écran"></div>'
        + '</section></main>';

    function ensureThemesPanel(panelsRoot) {
        var existing = panelsRoot.querySelector('[data-cs-panel="themes"]');
        if (existing) {
            return existing;
        }
        var section = global.document.createElement('section');
        section.className = 'cs-panel cs-panel--themes';
        section.setAttribute('data-cs-panel', 'themes');
        section.setAttribute('hidden', 'hidden');
        section.setAttribute('aria-label', 'Thèmes');
        section.innerHTML = THEMES_PANEL_HTML;
        panelsRoot.appendChild(section);
        return section;
    }

    function buildBackgroundsWallpaperPickerMarkup() {
        return ''
            + '<div class="cs-bg-panel" data-cs-bg-wallpapers>'
            + '<h3 class="cs-bg-panel__title">Choisir un arrière-plan</h3>'
            + '<div class="themes-wallpaper-grid" data-wallpaper-grid role="list" aria-label="Fonds d\'écran"></div>'
            + '<button type="button" class="cs-bg-add gnome-settings-wallpaper gnome-settings-wallpaper--add" aria-label="Ajouter un fond d\'écran">+</button>'
            + '</div>';
    }

    function appendBackgroundsWallpaperPicker(section) {
        if (!section || section.querySelector('[data-wallpaper-grid]')) {
            return;
        }
        var wrap = global.document.createElement('div');
        wrap.innerHTML = buildBackgroundsWallpaperPickerMarkup();
        while (wrap.firstChild) {
            section.appendChild(wrap.firstChild);
        }
    }

    function ensureBackgroundsPanel(panelsRoot) {
        var existing = panelsRoot.querySelector('[data-cs-panel="backgrounds"]');
        if (existing) {
            existing.classList.add('cs-backgrounds');
            appendBackgroundsWallpaperPicker(existing);
            return existing;
        }
        var section = global.document.createElement('section');
        section.className = 'cs-panel cs-backgrounds';
        section.setAttribute('data-cs-panel', 'backgrounds');
        section.setAttribute('hidden', 'hidden');
        section.setAttribute('aria-label', 'Arrière-plans');
        section.innerHTML = buildBackgroundsWallpaperPickerMarkup();
        panelsRoot.appendChild(section);
        return section;
    }

    function ensureAppletsPanel(panelsRoot) {
        var existing = panelsRoot.querySelector('[data-cs-panel="applets"]');
        if (existing) {
            return existing;
        }
        var appletItems = [
            { id: 'calendar', label: 'Calendrier', on: true },
            { id: 'clock', label: 'Horloge', on: true },
            { id: 'show-desktop', label: 'Afficher le bureau', on: false }
        ];
        var section = global.document.createElement('section');
        section.className = 'cs-panel cs-panel--applets';
        section.setAttribute('data-cs-panel', 'applets');
        section.setAttribute('hidden', 'hidden');
        section.setAttribute('aria-label', 'Applets');
        var list = global.document.createElement('ul');
        list.className = 'cs-applets-list';
        list.setAttribute('role', 'list');
        var ai;
        for (ai = 0; ai < appletItems.length; ai += 1) {
            var item = appletItems[ai];
            var li = global.document.createElement('li');
            li.className = 'cs-applets-list__item';
            var label = global.document.createElement('span');
            label.className = 'cs-row__label';
            label.textContent = item.label;
            var sw = global.document.createElement('button');
            sw.type = 'button';
            sw.className = 'cs-switch' + (item.on ? ' is-on' : '');
            sw.setAttribute('role', 'switch');
            sw.setAttribute('aria-checked', item.on ? 'true' : 'false');
            sw.setAttribute('data-cs-applet', item.id);
            li.appendChild(label);
            li.appendChild(sw);
            list.appendChild(li);
        }
        section.appendChild(list);
        panelsRoot.appendChild(section);
        return section;
    }

    function ensureGenericPanel(panelsRoot, panelId, label) {
        var existing = panelsRoot.querySelector('[data-cs-panel="' + panelId + '"]');
        if (existing) {
            return existing;
        }
        var rows = GENERIC_ROWS[panelId] || ['Options ' + label];
        var section = global.document.createElement('section');
        section.className = 'cs-panel';
        section.setAttribute('data-cs-panel', panelId);
        section.setAttribute('hidden', 'hidden');
        section.setAttribute('aria-label', label);
        var ri;
        for (ri = 0; ri < rows.length; ri += 1) {
            var row = global.document.createElement('div');
            row.className = 'cs-row';
            var span = global.document.createElement('span');
            span.className = 'cs-row__label';
            span.textContent = rows[ri];
            var sw = global.document.createElement('button');
            sw.type = 'button';
            sw.className = 'cs-switch' + (ri === 0 ? ' is-on' : '');
            sw.setAttribute('role', 'switch');
            sw.setAttribute('aria-checked', ri === 0 ? 'true' : 'false');
            sw.setAttribute('data-cs-switch', panelId + '-' + ri);
            row.appendChild(span);
            row.appendChild(sw);
            section.appendChild(row);
        }
        panelsRoot.appendChild(section);
        return section;
    }

    function resolveIconUrl(iconPath) {
        if (typeof global.resolveCapsuleAssetUrl === 'function') {
            return global.resolveCapsuleAssetUrl(iconPath);
        }
        if (typeof global.resolveCapsuleResourceUrl === 'function') {
            return global.resolveCapsuleResourceUrl(iconPath);
        }
        return iconPath;
    }

    function resolveCsPanelIconUrl(panelId, iconKey) {
        var toolkitId = PANEL_TOOLKIT_ICONS[panelId];
        if (toolkitId) {
            return resolveIconUrl(TOOLKIT_ICON_BASE + toolkitId);
        }
        return resolveIconUrl(ICON_BASE + iconKey + '.png');
    }

    function resolveCsCategoryIconUrl(categoryId, fallbackIcon) {
        var toolkitId = CATEGORY_TOOLKIT_ICONS[categoryId];
        if (toolkitId) {
            return resolveIconUrl(TOOLKIT_ICON_BASE + toolkitId);
        }
        return resolveIconUrl(ICON_BASE + fallbackIcon + '.png');
    }

    function findPanel(panelId) {
        var pi;
        for (pi = 0; pi < PANELS.length; pi += 1) {
            if (PANELS[pi].id === panelId) {
                return PANELS[pi];
            }
        }
        return null;
    }

    function ensurePanelContent(panelsRoot, panel) {
        var parity = global.CapsuleCinnamonSettingsParity;
        if (parity && typeof parity.hasRealPanel === 'function' && parity.hasRealPanel(panel.id)) {
            if (typeof parity.buildPanel === 'function') {
                parity.buildPanel(panelsRoot, panel.id, panel.label);
            }
            return;
        }
        if (panel.id === 'themes') {
            ensureThemesPanel(panelsRoot);
        } else if (panel.id === 'backgrounds') {
            ensureBackgroundsPanel(panelsRoot);
        } else if (panel.id === 'applets') {
            ensureAppletsPanel(panelsRoot);
        } else {
            ensureGenericPanel(panelsRoot, panel.id, panel.label);
        }
    }

    function ensureAllPanels(panelsRoot) {
        if (panelsRoot.dataset.csPanelsBuilt === 'true') {
            return;
        }
        var pi;
        for (pi = 0; pi < PANELS.length; pi += 1) {
            ensurePanelContent(panelsRoot, PANELS[pi]);
        }
        panelsRoot.dataset.csPanelsBuilt = 'true';
    }

    function showHomeView(root) {
        var home = root.querySelector('#cs-home');
        var panelView = root.querySelector('#cs-panel-view');
        if (home) {
            home.removeAttribute('hidden');
        }
        if (panelView) {
            panelView.setAttribute('hidden', 'hidden');
        }
        root.dataset.csView = 'home';
    }

    function showPanelView(root) {
        var home = root.querySelector('#cs-home');
        var panelView = root.querySelector('#cs-panel-view');
        if (home) {
            home.setAttribute('hidden', 'hidden');
        }
        if (panelView) {
            panelView.removeAttribute('hidden');
        }
        root.dataset.csView = 'panel';
    }

    function buildHomeGrid(root, panelsRoot) {
        var scroll = root.querySelector('#cs-home-scroll');
        if (!scroll || scroll.dataset.csHomeBuilt === 'true') {
            return;
        }
        ensureAllPanels(panelsRoot);
        var ci;
        for (ci = 0; ci < HOME_CATEGORIES.length; ci += 1) {
            var cat = HOME_CATEGORIES[ci];
            var section = global.document.createElement('section');
            section.className = 'cs-home__category';
            section.setAttribute('data-cs-category', cat.id);
            var head = global.document.createElement('header');
            head.className = 'cs-home__category-head';
            var catIcon = global.document.createElement('img');
            catIcon.className = 'cs-home__category-icon';
            catIcon.src = resolveCsCategoryIconUrl(cat.id, cat.icon);
            catIcon.alt = '';
            head.appendChild(catIcon);
            head.appendChild(global.document.createTextNode(cat.label));
            section.appendChild(head);
            var grid = global.document.createElement('div');
            grid.className = 'cs-home__grid';
            grid.setAttribute('role', 'list');
            var mi;
            for (mi = 0; mi < cat.modules.length; mi += 1) {
                var moduleId = cat.modules[mi];
                var panel = findPanel(moduleId);
                if (!panel) {
                    continue;
                }
                var tile = global.document.createElement('button');
                tile.type = 'button';
                tile.className = 'cs-home__tile';
                tile.setAttribute('data-cs-home-module', moduleId);
                tile.setAttribute('data-cs-nav', moduleId);
                tile.setAttribute('title', panel.label);
                tile.setAttribute('aria-label', panel.label);
                var icon = global.document.createElement('img');
                icon.className = 'cs-home__tile-icon';
                icon.src = resolveCsPanelIconUrl(panel.id, panel.icon);
                icon.alt = '';
                var label = global.document.createElement('span');
                label.className = 'cs-home__tile-label';
                label.textContent = panel.label;
                tile.appendChild(icon);
                tile.appendChild(label);
                grid.appendChild(tile);
            }
            section.appendChild(grid);
            scroll.appendChild(section);
        }
        scroll.dataset.csHomeBuilt = 'true';
    }

    function activatePanel(root, panelId) {
        var panelsRoot = root.querySelector('#cs-panels');
        var titleEl = root.querySelector('#cs-panel-title');
        var label = panelId;
        var pi;
        for (pi = 0; pi < PANELS.length; pi += 1) {
            if (PANELS[pi].id === panelId) {
                label = PANELS[pi].label;
                break;
            }
        }
        if (titleEl) {
            titleEl.textContent = label;
        }
        panelsRoot.querySelectorAll('[data-cs-panel]').forEach(function (section) {
            if (section.getAttribute('data-cs-panel') === panelId) {
                section.classList.add('is-active');
                section.removeAttribute('hidden');
            } else {
                section.classList.remove('is-active');
                section.setAttribute('hidden', 'hidden');
            }
        });
        showPanelView(root);
        if (panelId === 'themes' && typeof global.initThemesApp === 'function') {
            global.initThemesApp();
        }
        if (panelId === 'backgrounds' && typeof global.buildWallpaperGrid === 'function') {
            var bgPanel = panelsRoot.querySelector('[data-cs-panel="backgrounds"]');
            global.buildWallpaperGrid(bgPanel || root);
        }
        root.dataset.csActivePanel = panelId;
        bindSwitches(root);
    }

    function filterHome(root, query) {
        var q = (query || '').trim().toLowerCase();
        var firstMatch = null;
        root.querySelectorAll('[data-cs-home-module]').forEach(function (tile) {
            var moduleId = tile.getAttribute('data-cs-home-module');
            var panel = findPanel(moduleId);
            if (!panel) {
                tile.hidden = true;
                return;
            }
            var hay = (panel.label + ' ' + panel.keywords).toLowerCase();
            var match = !q || hay.indexOf(q) !== -1;
            tile.hidden = !match;
            if (match && !firstMatch) {
                firstMatch = moduleId;
            }
        });
        if (q && firstMatch && root.dataset.csView !== 'panel') {
            activatePanel(root, firstMatch);
        }
    }

    function bindSwitches(root) {
        var parity = global.CapsuleCinnamonSettingsParity;
        if (parity && typeof parity.bindControls === 'function') {
            parity.bindControls(root);
        }
        root.querySelectorAll('.cs-switch:not([data-cs-capsule-key])').forEach(function (toggle) {
            if (toggle.dataset.csBound === 'true') {
                return;
            }
            toggle.dataset.csBound = 'true';
            toggle.addEventListener('click', function () {
                var isOn = toggle.getAttribute('aria-checked') === 'true';
                var nextOn = !isOn;
                toggle.setAttribute('aria-checked', nextOn ? 'true' : 'false');
                toggle.classList.toggle('is-on', nextOn);
            });
        });
    }

    function bindNavigation(root) {
        root.querySelectorAll('[data-cs-nav]').forEach(function (btn) {
            if (btn.dataset.csNavBound === 'true') {
                return;
            }
            btn.dataset.csNavBound = 'true';
            btn.addEventListener('click', function () {
                activatePanel(root, btn.getAttribute('data-cs-nav'));
            });
        });
        var back = root.querySelector('#cs-back');
        if (back && back.dataset.csBackBound !== 'true') {
            back.dataset.csBackBound = 'true';
            back.addEventListener('click', function () {
                var search = root.querySelector('#cs-search');
                if (search) {
                    search.value = '';
                }
                filterHome(root, '');
                showHomeView(root);
            });
        }
        var search = root.querySelector('#cs-search');
        if (search && search.dataset.csSearchBound !== 'true') {
            search.dataset.csSearchBound = 'true';
            search.addEventListener('input', function () {
                if (root.dataset.csView === 'panel' && !search.value.trim()) {
                    showHomeView(root);
                }
                filterHome(root, search.value);
            });
        }
    }

    function initCinnamonSettingsApp(container) {
        var root = container ? container.querySelector('#cinnamonSettingsApp') : global.document.getElementById('cinnamonSettingsApp');
        if (!root) {
            return;
        }
        var panelsRoot = root.querySelector('#cs-panels');
        var winEl = getWindowEl(root);
        syncWindowTitle(winEl);
        buildHomeGrid(root, panelsRoot);
        bindNavigation(root);
        bindSwitches(root);
        if (global.CapsuleCinnamonSettingsParity && typeof global.CapsuleCinnamonSettingsParity.applyAllEffectsFromStore === 'function') {
            global.CapsuleCinnamonSettingsParity.applyAllEffectsFromStore();
        }
        var startPanel = global.CAPSULE_CS_PENDING_PANEL || root.dataset.csActivePanel;
        if (global.CAPSULE_CS_PENDING_PANEL) {
            delete global.CAPSULE_CS_PENDING_PANEL;
        }
        if (startPanel) {
            activatePanel(root, startPanel);
        } else {
            showHomeView(root);
        }
        root.dataset.cinnamonSettingsInit = 'true';
    }

    global.initCinnamonSettingsApp = initCinnamonSettingsApp;

    global.CapsuleCinnamonSettingsUi = {
        appendBackgroundsWallpaperPicker: appendBackgroundsWallpaperPicker
    };

    global.activateCinnamonSettingsPanel = function activateCinnamonSettingsPanel(panelId) {
        var root = global.document.getElementById('cinnamonSettingsApp');
        if (root) {
            activatePanel(root, panelId);
        }
    };

    global.document.addEventListener('capsule:window-opened', function (event) {
        if (!event.detail || event.detail.slotId !== 'themes') {
            return;
        }
        if (!global.document.getElementById('cinnamonSettingsApp')) {
            return;
        }
        global.setTimeout(function () {
            initCinnamonSettingsApp(event.detail.container);
        }, 30);
    });
}(typeof window !== 'undefined' ? window : globalThis));
