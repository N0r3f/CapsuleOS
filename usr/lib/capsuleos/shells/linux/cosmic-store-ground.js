/**
 * COSMIC Store ground — pilote le markup cosmic-store avec le catalogue partagé.
 * Consomme CapsuleGnomeStore (catalogue), CAPSULE_GNOME_SOFTWARE_CONTENT (contenu).
 */
(function initCosmicStoreGround(global) {
    'use strict';

    var CATEGORY_MAP = {
        creation:    { label: 'Création',       filter: ['creation', 'graphics', 'audio', 'video'] },
        work:        { label: 'Travail',        filter: ['productivity', 'office'] },
        development: { label: 'Développement',  filter: ['development'] },
        learn:       { label: 'Apprentissage',  filter: ['education', 'science'] },
        games:       { label: 'Jeux',           filter: ['games', 'game'] },
        relax:       { label: 'Détente',        filter: ['multimedia', 'music', 'video'] },
        social:      { label: 'Socialisation',  filter: ['communication', 'social', 'network'] },
        utilities:   { label: 'Utilitaires',    filter: ['utilities', 'system'] },
        applets:     { label: 'Applets',        filter: ['applet', 'cosmic-applet'] }
    };

    var ICON_BASE = '../../../usr/share/capsuleos/assets/images/vendors/popos/store/';

    var STORE_EXTRA_APPS = {
        'firefox':      { title: 'Firefox',      sub: 'Mozilla Firefox web browser',     icon: 'firefox.svg',               categories: 'network', installed: true, slot: 'firefox' },
        'slack':        { title: 'Slack',        sub: 'Business communication',          icon: 'com.slack.Slack.png',       categories: 'communication,social' },
        'telegram':     { title: 'Telegram',     sub: 'New era of messaging',            icon: 'telegram-panel.svg',        categories: 'communication' },
        'meld':         { title: 'Meld',         sub: 'Compare and merge your files',    icon: null,                        categories: 'development' },
        'steam':        { title: 'Steam (installer)', sub: 'Launcher for the Steam software distribution service', icon: 'steam.png', categories: 'games' },
        'lutris':       { title: 'Lutris',       sub: 'Video game preservation platform', icon: 'lutris.png',              categories: 'games' },
        'mattermost':   { title: 'Mattermost',   sub: 'An open source platform for developer collaboration', icon: 'mattermost-desktop.png', categories: 'communication,development' },
        'vscode':       { title: 'Visual Studio Code', sub: 'Code editing. Redefined.',  icon: 'code.png',                 categories: 'development' },
        'spotify':      { title: 'Spotify',      sub: 'Online music streaming service',  icon: 'spotify.png',              categories: 'multimedia,music' },
        'virt-manager': { title: 'Virtual Machine Manager', sub: 'Graphically manage KVM, Xen, or LXC via libvirt', icon: 'virt-manager.svg', categories: 'system' },
        'google-chrome':{ title: 'Google Chrome', sub: 'The browser built to be yours',  icon: 'chromium.png',             categories: 'network' },
        'brave':        { title: 'Brave',        sub: 'Fast Internet, AI, Adblock',     icon: null,                        categories: 'network' },
        'discord':      { title: 'Discord',      sub: 'Talk, play, hang out',           icon: 'discord.png',               categories: 'communication,games' },
        'vlc':          { title: 'VLC',          sub: 'VLC media player, the open-source multimedia player', icon: 'video-x-google-vlc-plugin.svg', categories: 'multimedia,video' },
        'gimp':         { title: 'GNU Image Manipulation', sub: 'High-end image creation and manipulation', icon: 'gimp.svg', categories: 'graphics,creation' },
        'protontricks': { title: 'Protontricks', sub: 'Apps and fixes for Proton games', icon: null,                       categories: 'games' },
        'heroic':       { title: 'Heroic',       sub: 'Play Epic, GOG and Amazon Games', icon: null,                       categories: 'games' },
        'cosmic-files': { title: 'Files',        sub: 'Gestionnaire de fichiers COSMIC', icon: 'com.system76.CosmicFiles.svg',   categories: 'system,cosmic' },
        'cosmic-edit':  { title: 'COSMIC Edit',  sub: 'Éditeur de texte COSMIC',        icon: 'com.system76.CosmicEdit.svg',    categories: 'utilities,cosmic' },
        'cosmic-term':  { title: 'Terminal',     sub: 'Terminal COSMIC',                 icon: 'com.system76.CosmicTerm.svg',    categories: 'system,cosmic' },
        'cosmic-settings': { title: 'Paramètres', sub: 'Paramètres système COSMIC',     icon: 'com.system76.CosmicSettings.svg', categories: 'system,cosmic' },
        'cosmic-screenshot': { title: 'Capture d\'écran', sub: 'COSMIC Screenshot',     icon: 'com.system76.CosmicScreenshot.svg', categories: 'utilities,cosmic' },
        'cosmic-player': { title: 'COSMIC Player', sub: 'Lecteur multimédia COSMIC',    icon: 'com.system76.CosmicPlayer.svg',  categories: 'multimedia,cosmic' },
        'camera':       { title: 'Camera',       sub: 'Capture photos and videos',      icon: null,                        categories: 'multimedia,cosmic' },
        'tweaks':       { title: 'Tweaks',       sub: 'Beyond the limits of your desktop', icon: null,                     categories: 'system,cosmic' },
        'examine':      { title: 'Examine',      sub: 'View system information',        icon: null,                        categories: 'system,cosmic' },
        'startup-config': { title: 'Startup Configuration', sub: 'View and set startup scripts', icon: null,              categories: 'system,cosmic' },
        'calculator':   { title: 'Calculator',   sub: 'Calculs et conversions',         icon: 'org.gnome.Calculator.svg',  categories: 'utilities,cosmic' },
        'forecast':     { title: 'Forecast',     sub: 'View weather predictions',       icon: null,                        categories: 'utilities,cosmic' },
        'text-editor':  { title: 'Éditeur de texte', sub: 'Modifier des fichiers texte', icon: null,                      categories: 'utilities', installed: true, slot: 'text_editor' },
        'files':        { title: 'Fichiers',     sub: 'Gestionnaire de fichiers',       icon: null,                        categories: 'system', installed: true, slot: 'nemo' },
        'terminal-app': { title: 'Terminal',     sub: 'Ligne de commande',              icon: null,                        categories: 'system', installed: true, slot: 'terminal' },
        'libreoffice':  { title: 'LibreOffice',  sub: 'Suite bureautique',              icon: null,                        categories: 'productivity,creation', installed: true, slot: 'librewriter' },
        'drawing':      { title: 'Dessin',       sub: 'Dessin et annotation',           icon: null,                        categories: 'graphics,creation', installed: true, slot: 'drawing' }
    };

    var EDITORS_PICKS = [
        'slack', 'telegram', 'meld', 'steam', 'lutris', 'mattermost',
        'vscode', 'spotify', 'virt-manager'
    ];

    var POPULAR_APPS = [
        'google-chrome', 'firefox', 'discord',
        'brave', 'gimp', 'telegram',
        'vlc', 'protontricks', 'heroic'
    ];

    var COSMIC_NATIVE = [
        'cosmic-files', 'cosmic-edit', 'cosmic-term', 'cosmic-settings',
        'cosmic-screenshot', 'cosmic-player', 'camera', 'tweaks',
        'examine', 'startup-config', 'calculator', 'forecast'
    ];

    function resolveRegistryId() {
        if (global.CapsuleGnomeStore && typeof global.CapsuleGnomeStore.resolveRegistryId === 'function') {
            return global.CapsuleGnomeStore.resolveRegistryId() || 'linux-popos';
        }
        return 'linux-popos';
    }

    function resolveContent(registryId) {
        var map = global.CAPSULE_GNOME_SOFTWARE_CONTENT || {};
        return (registryId && map[registryId]) ? map[registryId] : {};
    }

    function getCatalog() {
        var base = {};
        if (global.CapsuleGnomeStore && typeof global.CapsuleGnomeStore.mergeStoreApps === 'function') {
            base = global.CapsuleGnomeStore.mergeStoreApps({});
        }
        var ids = Object.keys(STORE_EXTRA_APPS);
        var i;
        for (i = 0; i < ids.length; i += 1) {
            var id = ids[i];
            if (!base[id]) {
                var extra = STORE_EXTRA_APPS[id];
                base[id] = {
                    title: extra.title,
                    sub: extra.sub,
                    desc: extra.sub,
                    iconClass: '',
                    iconPath: extra.icon ? ICON_BASE + extra.icon : null,
                    categories: extra.categories,
                    installed: extra.installed === true,
                    slot: extra.slot || null,
                    source: 'deb'
                };
            } else if (!base[id].iconPath && STORE_EXTRA_APPS[id].icon) {
                base[id].iconPath = ICON_BASE + STORE_EXTRA_APPS[id].icon;
            }
        }
        return base;
    }

    function initialLetter(title) {
        return (title || '?').charAt(0).toUpperCase();
    }

    function renderCard(id, app) {
        var iconHtml;
        if (app.iconPath) {
            iconHtml = '<img class="cosmic-store__card-icon" src="' + app.iconPath + '" alt="" width="48" height="48">';
        } else if (app.iconClass) {
            iconHtml = '<span class="cosmic-store__card-icon cosmic-store__card-icon--placeholder '
                + app.iconClass + '" aria-hidden="true"></span>';
        } else {
            iconHtml = '<span class="cosmic-store__card-icon cosmic-store__card-icon--placeholder" aria-hidden="true">'
                + initialLetter(app.title) + '</span>';
        }
        return '<button type="button" class="cosmic-store__card" role="listitem" data-um-cosmic-app="' + id + '">'
            + iconHtml
            + '<div class="cosmic-store__card-body">'
            + '<h3 class="cosmic-store__card-title">' + (app.title || id) + '</h3>'
            + '<p class="cosmic-store__card-sub">' + (app.sub || '') + '</p>'
            + '</div></button>';
    }

    function renderRow(id, app, opts) {
        var iconHtml;
        if (app.iconPath) {
            iconHtml = '<img class="cosmic-store__row-icon" src="' + app.iconPath + '" alt="" width="40" height="40">';
        } else if (app.iconClass) {
            iconHtml = '<span class="cosmic-store__row-icon cosmic-store__row-icon--placeholder '
                + app.iconClass + '" aria-hidden="true"></span>';
        } else {
            iconHtml = '<span class="cosmic-store__row-icon cosmic-store__row-icon--placeholder" aria-hidden="true">'
                + initialLetter(app.title) + '</span>';
        }
        var actions = '';
        if (opts && opts.installed) {
            actions = '<div class="cosmic-store__row-actions">'
                + '<button type="button" class="cosmic-store__btn cosmic-store__btn--primary" data-um-cosmic-app="' + id + '" data-um-cosmic-row-action="open">Ouvrir</button>'
                + '<button type="button" class="cosmic-store__btn" data-um-cosmic-app="' + id + '" data-um-cosmic-row-action="detail">Détails</button>'
                + '<button type="button" class="cosmic-store__btn cosmic-store__btn--outline" data-um-cosmic-app="' + id + '" data-um-cosmic-row-action="uninstall">Désinstaller</button>'
                + '</div>';
        }
        return '<article class="cosmic-store__installed-row" data-um-cosmic-app="' + id + '">'
            + iconHtml
            + '<div class="cosmic-store__row-info">'
            + '<h3 class="cosmic-store__row-title">' + (app.title || id) + '</h3>'
            + '<p class="cosmic-store__row-sub">' + (app.version || '') + ' · ' + (app.sub || '') + '</p>'
            + '</div>'
            + actions
            + '</article>';
    }

    function fillGrid(grid, ids, catalog, max) {
        if (!grid) {
            return;
        }
        var html = '';
        var count = 0;
        var limit = max || 9;
        var i;
        for (i = 0; i < ids.length && count < limit; i += 1) {
            var app = catalog[ids[i]];
            if (app) {
                html += renderCard(ids[i], app);
                count += 1;
            }
        }
        grid.innerHTML = html;
    }

    function normCategories(raw) {
        if (!raw) {
            return '';
        }
        if (Array.isArray(raw)) {
            return raw.join(',').toLowerCase();
        }
        return String(raw).toLowerCase();
    }

    function matchesCategory(app, categoryKey) {
        var mapping = CATEGORY_MAP[categoryKey];
        if (!mapping) {
            return false;
        }
        var cats = normCategories(app.categories);
        var filters = mapping.filter;
        var j;
        for (j = 0; j < filters.length; j += 1) {
            if (cats.indexOf(filters[j]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function appsByCategory(catalog, categoryKey) {
        var ids = Object.keys(catalog);
        var result = [];
        var i;
        for (i = 0; i < ids.length; i += 1) {
            if (matchesCategory(catalog[ids[i]], categoryKey)) {
                result.push(ids[i]);
            }
        }
        return result;
    }

    function showPane(root, name) {
        root.querySelectorAll('[data-um-cosmic-pane]').forEach(function hidePane(el) {
            el.hidden = el.getAttribute('data-um-cosmic-pane') !== name;
        });
        root.setAttribute('data-um-cosmic-view', name);
    }

    function setActiveNav(root, name) {
        root.querySelectorAll('[data-um-cosmic-nav]').forEach(function toggleNav(btn) {
            var isMatch = btn.getAttribute('data-um-cosmic-nav') === name;
            btn.classList.toggle('is-active', isMatch);
        });
    }

    function applyGround(root) {
        var registryId = resolveRegistryId();
        var content = resolveContent(registryId);
        var catalog = getCatalog();
        var allIds = Object.keys(catalog);

        var editorsGrid = root.querySelector('[data-um-cosmic-editors-grid]');
        fillGrid(editorsGrid, EDITORS_PICKS, catalog, 9);

        var popularGrid = root.querySelector('[data-um-cosmic-popular-grid]');
        fillGrid(popularGrid, POPULAR_APPS, catalog, 9);

        var cosmicGrid = root.querySelector('[data-um-cosmic-cosmic-grid]');
        fillGrid(cosmicGrid, COSMIC_NATIVE, catalog, 9);

        var updatesCount = content.updatesCount || 0;
        var badge = root.querySelector('[data-um-cosmic-badge]');
        if (badge) {
            if (updatesCount > 0) {
                badge.textContent = String(updatesCount);
                badge.hidden = false;
            } else {
                badge.hidden = true;
            }
        }

        var updatesSub = root.querySelector('[data-um-cosmic-updates-sub]');
        if (updatesSub && content.updatesSubtitle) {
            updatesSub.textContent = content.updatesSubtitle;
        }

        renderInstalledList(root, catalog, content);
        renderUpdatesList(root, content);
    }

    function renderInstalledList(root, catalog, content) {
        var list = root.querySelector('[data-um-cosmic-installed-list]');
        if (!list) {
            return;
        }
        var ids = content.exploreFeaturedIds || Object.keys(catalog);
        var html = '';
        var i;
        for (i = 0; i < ids.length; i += 1) {
            var app = catalog[ids[i]];
            if (app && app.installed !== false) {
                html += renderRow(ids[i], app, { installed: true });
            }
        }
        list.innerHTML = html;
    }

    function renderUpdatesList(root, content) {
        var container = root.querySelector('[data-um-cosmic-updates-rows]');
        var empty = root.querySelector('[data-um-cosmic-updates-empty]');
        if (!container) {
            return;
        }
        var rows = content.updatesRows || [];
        if (!rows.length) {
            container.innerHTML = '';
            if (empty) {
                empty.hidden = false;
            }
            return;
        }
        if (empty) {
            empty.hidden = true;
        }
        var html = '';
        var i;
        for (i = 0; i < rows.length; i += 1) {
            var row = rows[i];
            html += '<article class="cosmic-store__update-row">'
                + '<span class="cosmic-store__row-icon cosmic-store__row-icon--placeholder '
                + (row.iconClass || '') + '" aria-hidden="true"></span>'
                + '<div class="cosmic-store__row-info">'
                + '<h3 class="cosmic-store__row-title">' + (row.title || '') + '</h3>'
                + '<p class="cosmic-store__row-sub">' + (row.versionLine || '') + '</p>'
                + '</div>'
                + '<div class="cosmic-store__row-actions">'
                + '<button type="button" class="cosmic-store__btn cosmic-store__btn--primary">Mettre à jour</button>'
                + '</div></article>';
        }
        container.innerHTML = html;
    }

    function showDetail(root, appId) {
        var registryId = resolveRegistryId();
        var content = resolveContent(registryId);
        var catalog = getCatalog();
        var app = catalog[appId];
        if (!app) {
            return;
        }
        root.setAttribute('data-um-cosmic-detail-app', appId);

        var progress = root.querySelector('[data-um-cosmic-install-progress]');
        if (progress) {
            progress.hidden = true;
        }

        root.querySelector('[data-um-cosmic-detail-title]').textContent = app.title || appId;
        root.querySelector('[data-um-cosmic-detail-sub]').textContent = app.sub || '';
        root.querySelector('[data-um-cosmic-detail-long]').textContent = app.desc || '';
        var icon = root.querySelector('[data-um-cosmic-detail-icon]');
        if (icon) {
            if (app.iconPath) {
                var img = icon.tagName === 'IMG' ? icon : null;
                if (!img) {
                    img = root.ownerDocument.createElement('img');
                    img.className = 'cosmic-store__detail-icon';
                    img.setAttribute('data-um-cosmic-detail-icon', '');
                    img.width = 64;
                    img.height = 64;
                    img.alt = '';
                    icon.parentNode.replaceChild(img, icon);
                }
                img.src = app.iconPath;
            } else {
                icon.className = 'cosmic-store__detail-icon cosmic-store__card-icon--placeholder ' + (app.iconClass || '');
            }
        }
        var version = root.querySelector('[data-um-cosmic-detail-version]');
        if (version) {
            version.textContent = app.version || '';
        }
        var size = root.querySelector('[data-um-cosmic-detail-size]');
        if (size) {
            size.textContent = app.size || '';
        }
        var extras = (content.appDetails && content.appDetails[appId]) || content.appDetailsDefault || {};
        var license = root.querySelector('[data-um-cosmic-detail-license]');
        if (license) {
            license.textContent = extras.license || 'Licence libre';
        }
        var origin = root.querySelector('[data-um-cosmic-detail-origin]');
        if (origin) {
            origin.textContent = extras.origin || content.distributionLabel || 'Pop!_OS';
        }
        var source = root.querySelector('[data-um-cosmic-detail-source]');
        if (source) {
            var src = app.source === 'flatpak' ? 'Flathub · Flatpak' : 'AppStream · RPM';
            if (content.distributionLabel && app.source !== 'flatpak') {
                src += ' · ' + content.distributionLabel;
            }
            source.textContent = src;
        }
        var sourceChip = root.querySelector('[data-um-cosmic-detail-source-chip]');
        var sourceText = root.querySelector('[data-um-cosmic-detail-source-text]');
        if (sourceChip && sourceText) {
            sourceText.textContent = source ? source.textContent : '';
            sourceChip.hidden = false;
        }
        var developer = root.querySelector('[data-um-cosmic-detail-developer]');
        if (developer) {
            developer.textContent = extras.developer || app.developer || '';
            developer.hidden = !developer.textContent;
        }
        var rating = root.querySelector('[data-um-cosmic-detail-rating]');
        if (rating) {
            var score = extras.rating || app.rating;
            if (score) {
                rating.innerHTML = '★★★★★ ' + score
                    + (extras.ratingCount ? ' · ' + extras.ratingCount + ' avis' : '');
                rating.hidden = false;
            } else {
                rating.hidden = true;
            }
        }
        var installBtn = root.querySelector('[data-um-cosmic-action="install"]');
        var uninstallBtn = root.querySelector('[data-um-cosmic-action="uninstall"]');
        var installed = app.installed === true;
        if (installBtn) {
            installBtn.textContent = installed ? 'Ouvrir' : 'Installer';
        }
        if (uninstallBtn) {
            uninstallBtn.hidden = !installed;
        }
        showPane(root, 'detail');
    }

    function searchApps(root, query) {
        var catalog = getCatalog();
        var q = (query || '').trim().toLowerCase();
        var grid = root.querySelector('[data-um-cosmic-search-grid]');
        var empty = root.querySelector('[data-um-cosmic-search-empty]');
        var sub = root.querySelector('[data-um-cosmic-search-sub]');
        if (!q) {
            showPane(root, 'explore');
            return;
        }
        var ids = Object.keys(catalog);
        var matches = [];
        var i;
        for (i = 0; i < ids.length; i += 1) {
            var app = catalog[ids[i]];
            var haystack = ((app.title || '') + ' ' + (app.sub || '') + ' ' + normCategories(app.categories)).toLowerCase();
            if (haystack.indexOf(q) !== -1) {
                matches.push(ids[i]);
            }
        }
        if (sub) {
            sub.textContent = matches.length + ' résultat' + (matches.length !== 1 ? 's' : '') + ' pour « ' + query + ' »';
        }
        if (grid) {
            fillGrid(grid, matches, catalog, 30);
        }
        if (empty) {
            empty.hidden = matches.length > 0;
        }
        showPane(root, 'search');
    }

    var INSTALL_PHASES = [
        { pct: 0,   label: 'Préparation…',                      state: 'downloading', duration: 400 },
        { pct: 12,  label: 'Téléchargement du paquet…',          state: 'downloading', duration: 800 },
        { pct: 35,  label: 'Téléchargement des dépendances…',    state: 'downloading', duration: 1000 },
        { pct: 58,  label: 'Vérification des signatures…',       state: 'downloading', duration: 600 },
        { pct: 70,  label: 'Installation en cours…',             state: 'installing',  duration: 900 },
        { pct: 85,  label: 'Configuration…',                     state: 'installing',  duration: 700 },
        { pct: 95,  label: 'Nettoyage…',                         state: 'installing',  duration: 400 },
        { pct: 100, label: 'Installation terminée',              state: 'done',        duration: 0 }
    ];

    function simulateInstall(root, btn, appId) {
        if (btn.disabled) {
            return;
        }
        btn.disabled = true;
        btn.textContent = 'Installation…';

        var progressHost = root.querySelector('[data-um-cosmic-install-progress]');
        var bar = root.querySelector('[data-um-cosmic-install-bar]');
        var label = root.querySelector('[data-um-cosmic-install-label]');
        if (progressHost) {
            progressHost.hidden = false;
        }

        var phaseIdx = 0;
        function runPhase() {
            if (phaseIdx >= INSTALL_PHASES.length) {
                finishInstall(root, btn, appId);
                return;
            }
            var phase = INSTALL_PHASES[phaseIdx];
            if (bar) {
                bar.style.width = phase.pct + '%';
                bar.setAttribute('data-state', phase.state);
            }
            if (label) {
                label.textContent = phase.label;
            }
            phaseIdx += 1;
            if (phase.duration > 0) {
                setTimeout(runPhase, phase.duration);
            } else {
                setTimeout(runPhase, 500);
            }
        }
        runPhase();
    }

    function finishInstall(root, btn, appId) {
        btn.disabled = false;
        btn.textContent = 'Ouvrir';

        var unBtn = root.querySelector('[data-um-cosmic-action="uninstall"]');
        if (unBtn) {
            unBtn.hidden = false;
        }

        if (appId && global.CapsuleGnomeStore) {
            var registryId = resolveRegistryId();
            global.CapsuleGnomeStore.recordStoreInstall(registryId, appId, 'cosmic-store');
        }

        var catalog = getCatalog();
        var app = catalog[appId];
        if (app) {
            app.installed = true;
        }

        injectIntoOverview(appId, catalog[appId]);
        refreshInstalledList(root);
    }

    function simulateUninstall(root, btn) {
        var appId = root.getAttribute('data-um-cosmic-detail-app');
        btn.hidden = true;

        var installBtn = root.querySelector('[data-um-cosmic-action="install"]');
        if (installBtn) {
            installBtn.textContent = 'Installer';
        }

        var progressHost = root.querySelector('[data-um-cosmic-install-progress]');
        if (progressHost) {
            progressHost.hidden = true;
        }

        if (appId && global.CapsuleGnomeStore) {
            var registryId = resolveRegistryId();
            global.CapsuleGnomeStore.removeStoreInstall(registryId, appId);
        }

        var catalog = getCatalog();
        if (catalog[appId]) {
            catalog[appId].installed = false;
        }

        removeFromOverview(appId);
        refreshInstalledList(root);
    }

    function openInstalledApp(appId) {
        if (!appId) {
            return;
        }
        var entry = global.CapsuleGnomeStore ? global.CapsuleGnomeStore.getStoreAppEntry(appId) : null;
        var slot = entry ? entry.slot || entry.postInstallSlot : null;
        if (slot && typeof global.openWindowByDataLink === 'function') {
            global.openWindowByDataLink(slot);
            return;
        }
        var catalog = getCatalog();
        var app = catalog[appId];
        if (app && app.slot && typeof global.openWindowByDataLink === 'function') {
            global.openWindowByDataLink(app.slot);
        }
    }

    function injectIntoOverview(appId, app) {
        if (!app) {
            return;
        }
        var grid = document.getElementById('cosmic-applications-grid');
        if (!grid) {
            return;
        }
        var existing = grid.querySelector('[data-cosmic-app-link="' + appId + '"]');
        if (existing) {
            return;
        }
        var entry = global.CapsuleGnomeStore ? global.CapsuleGnomeStore.getStoreAppEntry(appId) : null;
        var linkTarget = entry ? (entry.slot || entry.postInstallSlot || appId) : appId;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cosmic-applications__app cosmic-applications__app--store-installed';
        btn.setAttribute('data-cosmic-app-link', linkTarget);
        btn.setAttribute('data-cosmic-category', normCategories(app.categories));
        btn.setAttribute('aria-label', app.title || appId);

        var img = document.createElement('img');
        img.alt = '';
        img.width = 48;
        img.height = 48;
        if (app.iconPath) {
            img.src = app.iconPath;
        } else {
            img.src = '../../../usr/share/capsuleos/assets/images/toolkits/cosmic/apps/overview/cosmic-store.svg';
        }

        var span = document.createElement('span');
        span.textContent = app.title || appId;

        btn.appendChild(img);
        btn.appendChild(span);
        grid.appendChild(btn);

        if (typeof global.CosmicAppsCatalog !== 'undefined' && typeof global.CosmicAppsCatalog.refresh === 'function') {
            global.CosmicAppsCatalog.refresh();
        }
    }

    function removeFromOverview(appId) {
        var grid = document.getElementById('cosmic-applications-grid');
        if (!grid) {
            return;
        }
        var el = grid.querySelector('.cosmic-applications__app--store-installed[data-cosmic-app-link="' + appId + '"]');
        if (el) {
            el.remove();
        }
        if (typeof global.CosmicAppsCatalog !== 'undefined' && typeof global.CosmicAppsCatalog.refresh === 'function') {
            global.CosmicAppsCatalog.refresh();
        }
    }

    function refreshInstalledList(root) {
        var registryId = resolveRegistryId();
        var content = resolveContent(registryId);
        var catalog = getCatalog();
        renderInstalledList(root, catalog, content);
    }

    function bindEvents(root) {
        var previousPane = 'explore';
        var catalog = getCatalog();

        root.addEventListener('click', function onCosmicClick(event) {
            var target = event.target.closest('[data-um-cosmic-nav]');
            if (target) {
                var nav = target.getAttribute('data-um-cosmic-nav');
                if (CATEGORY_MAP[nav]) {
                    var catIds = appsByCategory(catalog, nav);
                    var catTitle = root.querySelector('[data-um-cosmic-category-title]');
                    if (catTitle) {
                        catTitle.textContent = CATEGORY_MAP[nav].label;
                    }
                    var catGrid = root.querySelector('[data-um-cosmic-category-grid]');
                    fillGrid(catGrid, catIds, catalog, 30);
                    setActiveNav(root, nav);
                    showPane(root, 'category');
                    return;
                }
                setActiveNav(root, nav);
                showPane(root, nav);
                return;
            }

            var appBtn = event.target.closest('[data-um-cosmic-app]');
            if (appBtn) {
                var appId = appBtn.getAttribute('data-um-cosmic-app');
                var rowAction = event.target.closest('[data-um-cosmic-row-action]');
                if (rowAction) {
                    var action = rowAction.getAttribute('data-um-cosmic-row-action');
                    if (action === 'detail') {
                        previousPane = root.getAttribute('data-um-cosmic-view') || 'explore';
                        showDetail(root, appId);
                    } else if (action === 'open') {
                        openInstalledApp(appId);
                    }
                    return;
                }
                previousPane = root.getAttribute('data-um-cosmic-view') || 'explore';
                showDetail(root, appId);
                return;
            }

            var actionBtn = event.target.closest('[data-um-cosmic-action]');
            if (actionBtn) {
                var act = actionBtn.getAttribute('data-um-cosmic-action');
                if (act === 'toggleSearch') {
                    var bar = root.querySelector('[data-um-cosmic-search-bar]');
                    if (bar) {
                        bar.hidden = !bar.hidden;
                        if (!bar.hidden) {
                            var input = bar.querySelector('[data-um-cosmic-search]');
                            if (input) {
                                input.focus();
                            }
                        }
                    }
                } else if (act === 'closeSearch') {
                    var searchBar = root.querySelector('[data-um-cosmic-search-bar]');
                    if (searchBar) {
                        searchBar.hidden = true;
                    }
                    showPane(root, 'explore');
                    setActiveNav(root, 'explore');
                } else if (act === 'home') {
                    showPane(root, 'explore');
                    setActiveNav(root, 'explore');
                } else if (act === 'detailBack') {
                    showPane(root, previousPane);
                    setActiveNav(root, previousPane);
                } else if (act === 'install') {
                    var currentAppId = root.getAttribute('data-um-cosmic-detail-app');
                    if (actionBtn.textContent === 'Ouvrir') {
                        openInstalledApp(currentAppId);
                        return;
                    }
                    simulateInstall(root, actionBtn, currentAppId);
                } else if (act === 'uninstall') {
                    simulateUninstall(root, actionBtn);
                }
            }
        });

        var searchInput = root.querySelector('[data-um-cosmic-search]');
        if (searchInput) {
            var debounce = null;
            searchInput.addEventListener('input', function onInput() {
                clearTimeout(debounce);
                var val = searchInput.value;
                debounce = setTimeout(function runSearch() {
                    searchApps(root, val);
                }, 200);
            });
        }
    }

    function init() {
        var root = document.getElementById('updateManagerApp');
        if (!root || !root.classList.contains('update-manager--cosmic')) {
            return;
        }
        applyGround(root);
        bindEvents(root);
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
        document.addEventListener('capsule:slot-injected', function onSlot(event) {
            if (event.detail && event.detail.slotId === 'update_manager') {
                init();
            }
        });
    }

    global.CapsuleCosmicStoreGround = {
        applyGround: applyGround,
        showDetail: showDetail,
        searchApps: searchApps,
        openInstalledApp: openInstalledApp,
        injectIntoOverview: injectIntoOverview
    };
}(typeof window !== 'undefined' ? window : globalThis));
