/**
 * Update Manager (simulation) — Mint : accueil VM, liste, installation simulée.
 */
'use strict';
(function initUpdateManagerApp() {
    var WELCOME_KEY = 'capsule-mintupdate-welcome-dismissed';
    var MIRROR_KEY = 'capsule-mintupdate-mirror-dismissed';
    var GNOME_INSTALLED_KEY = 'capsule-gnome-software-installed';
    var busy = false;
    var gnomeBusy = false;
    var gnomeInstalledRuntime = null;

    function findRoot() {
        return document.getElementById('updateManagerApp');
    }

    function isMintSkin() {
        if (typeof document === 'undefined' || !document.body) {
            return false;
        }
        if (document.body.id === 'mint') {
            return true;
        }
        return typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY === 'mint';
    }

    function welcomeDismissed() {
        try {
            return window.localStorage.getItem(WELCOME_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function setWelcomeDismissed() {
        try {
            window.localStorage.setItem(WELCOME_KEY, '1');
        } catch (e) {
            /* hors ligne */
        }
    }

    function mirrorDismissed() {
        try {
            return window.localStorage.getItem(MIRROR_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function setMirrorDismissed() {
        try {
            window.localStorage.setItem(MIRROR_KEY, '1');
        } catch (e) {
            /* hors ligne */
        }
    }

    function applyMirrorBanner(root) {
        var banner = root.querySelector('#um-mirror-banner');
        if (!banner) {
            return;
        }
        if (mirrorDismissed()) {
            hideMirrorBanner(banner);
            return;
        }
        banner.hidden = false;
        banner.removeAttribute('aria-hidden');
        banner.style.display = '';
    }

    function detectLayout() {
        const root = findRoot();
        if (!root) {
            return;
        }
        const isPopOs = typeof document !== 'undefined'
            && document.body
            && (document.body.id === 'popos'
                || (typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY === 'popos'));
        const isOpenSuse = typeof document !== 'undefined'
            && document.body
            && (document.body.id === 'opensuse'
                || (typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY === 'opensuse'));

        if (isPopOs) {
            root.dataset.umLayout = 'cosmic';
            return;
        }
        if (isOpenSuse) {
            root.dataset.umLayout = 'kde';
            return;
        }
        root.dataset.umLayout = root.dataset.umLayout || 'mint';
    }

    function bindTrayOnce() {
        const trayBtn = document.querySelector('[data-update-manager-tray]');
        if (!trayBtn || trayBtn.dataset.umTrayInit === 'true') {
            return;
        }
        if (document.body && document.body.id === 'kde-neon') {
            return;
        }
        trayBtn.dataset.umTrayInit = 'true';
        trayBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof window.openWindowByDataLink === 'function') {
                window.openWindowByDataLink('update_manager');
            }
        });
    }

    function setStatus(text) {
        const root = findRoot();
        if (root && root.classList.contains('update-manager--gnome')) {
            root.querySelectorAll('.gnome-software__status').forEach(function setLine(el) {
                el.textContent = text;
            });
            return;
        }
        const el = document.getElementById('um-status-text');
        if (el) {
            el.textContent = text;
        }
    }

    function showFeedback(root, text, restoreMs) {
        var delay = restoreMs || 2500;
        var statusFooter = root.querySelector('.update-manager__status');
        if (root.dataset.umView === 'updates' && statusFooter) {
            statusFooter.hidden = false;
            setStatus(text);
            return;
        }
        var emptyText = root.querySelector('.update-manager__empty-text');
        var empty = root.querySelector('#um-empty');
        if (emptyText && empty && !empty.hidden) {
            var previous = emptyText.textContent;
            emptyText.textContent = text;
            window.setTimeout(function restoreEmptyText() {
                if (emptyText.textContent === text) {
                    emptyText.textContent = previous;
                }
            }, delay);
            return;
        }
        setStatus(text);
    }

    function setTrayBadgeVisible(isVisible) {
        const trayBtn = document.querySelector('[data-update-manager-tray]');
        if (!trayBtn) {
            return;
        }
        trayBtn.dataset.hasUpdates = isVisible ? 'true' : 'false';
        trayBtn.setAttribute('aria-label', isVisible ? 'Mises à jour disponibles' : 'Aucune mise à jour');
    }

    function getActiveTabId(root) {
        var active = root.querySelector('[data-um-tab].is-active');
        return active ? active.getAttribute('data-um-tab') : 'info';
    }

    function buildPanelHtml(tabId, pkgName, pkgDesc, pkgVersion) {
        var labelMap = {
            info: 'Renseignements',
            packages: 'Paquets',
            changelog: 'Journal des changements'
        };
        var label = labelMap[tabId] || 'Renseignements';
        if (!pkgName) {
            return '<p class="update-manager__placeholder">Sélectionnez une mise à jour pour afficher des '
                + label.toLowerCase() + '.</p>';
        }
        if (tabId === 'packages') {
            return '<p class="update-manager__placeholder"><strong>' + pkgName + '</strong> — paquet binaire '
                + '(simulation).</p>';
        }
        if (tabId === 'changelog') {
            return '<p class="update-manager__placeholder"><strong>' + pkgName + '</strong> — correctifs et '
                + 'améliorations (simulation).</p>';
        }
        return '<p class="update-manager__placeholder"><strong>' + pkgName + '</strong><br>'
            + pkgDesc + '<br>Nouvelle version : ' + pkgVersion + '</p>';
    }

    function setActiveTab(tabId, root) {
        if (!root) {
            root = findRoot();
        }
        if (!root) {
            return;
        }
        root.querySelectorAll('[data-um-tab]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.getAttribute('data-um-tab') === tabId);
        });
        var panel = root.querySelector('#um-panel');
        var selected = root.querySelector('#um-tablewrap tbody tr.is-selected');
        if (!panel) {
            return;
        }
        if (selected) {
            var pkg = selected.querySelector('.update-manager__pkg');
            var desc = selected.querySelector('.update-manager__desc');
            var version = selected.querySelector('.update-manager__version');
            panel.innerHTML = buildPanelHtml(
                tabId,
                pkg ? pkg.textContent : '',
                desc ? desc.textContent : '',
                version ? version.textContent : ''
            );
            return;
        }
        panel.innerHTML = buildPanelHtml(tabId, '', '', '');
    }

    function countSelected(root) {
        var boxes = root.querySelectorAll('#um-tablewrap tbody input[type="checkbox"]');
        var checked = 0;
        var total = boxes.length;
        var i;
        for (i = 0; i < boxes.length; i++) {
            if (boxes[i].checked) {
                checked++;
            }
        }
        return { checked: checked, total: total };
    }

    function updateSelectionStatus(root) {
        var counts = countSelected(root);
        var installBtn = root.querySelector('[data-um-action="install"]');
        if (counts.checked === 0) {
            setStatus('Aucune mise à jour sélectionnée');
            if (installBtn && root.dataset.umView === 'updates' && !busy) {
                installBtn.disabled = true;
            }
            return;
        }
        if (counts.checked === counts.total) {
            setStatus(counts.total + ' mises à jour sont sélectionnées (214 Mo)');
        } else {
            setStatus(counts.checked + ' mise(s) sélectionnée(s) dans la liste (' + counts.total + ' au total, 214 Mo)');
        }
        if (installBtn && root.dataset.umView === 'updates' && !busy) {
            installBtn.disabled = false;
        }
    }

    function setToolbarState(root, mode) {
        if (!root || busy) {
            return;
        }
        var all = root.querySelectorAll('[data-um-action]');
        var i;
        for (i = 0; i < all.length; i++) {
            var btn = all[i];
            var action = btn.getAttribute('data-um-action');
            if (mode === 'updates') {
                btn.disabled = action === 'install' ? countSelected(root).checked === 0 : false;
            } else if (action === 'refresh') {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }
    }

    function setBusy(root, isBusy) {
        busy = isBusy;
        root.dataset.umBusy = isBusy ? 'true' : 'false';
        var tools = root.querySelectorAll('[data-um-action]');
        var i;
        for (i = 0; i < tools.length; i++) {
            tools[i].disabled = isBusy;
        }
        if (!isBusy) {
            setToolbarState(root, root.dataset.umView || 'uptodate');
            if (root.dataset.umView === 'updates') {
                updateSelectionStatus(root);
            }
        }
    }

    function showWelcome(root) {
        root.dataset.umView = 'welcome';
        var welcome = root.querySelector('#um-welcome');
        var main = root.querySelector('#um-main');
        if (welcome) {
            welcome.hidden = false;
        }
        if (main) {
            main.hidden = true;
        }
        setToolbarState(root, 'welcome');
        setStatus('');
    }

    function showMainView(root, view) {
        root.dataset.umView = view;
        var welcome = root.querySelector('#um-welcome');
        var main = root.querySelector('#um-main');
        var empty = root.querySelector('#um-empty');
        var table = root.querySelector('#um-tablewrap');
        var bottom = root.querySelector('.update-manager__bottom');
        var statusFooter = root.querySelector('.update-manager__status');
        if (welcome) {
            welcome.hidden = true;
        }
        if (main) {
            main.hidden = false;
        }
        if (view === 'updates') {
            if (empty) {
                empty.hidden = true;
            }
            if (table) {
                table.hidden = false;
            }
            if (bottom) {
                bottom.hidden = false;
            }
            if (statusFooter) {
                statusFooter.hidden = false;
            }
            setToolbarState(root, 'updates');
            if (mirrorDismissed()) {
                applyMirrorBanner(root);
            }
            updateSelectionStatus(root);
            return;
        }
        if (empty) {
            empty.hidden = false;
        }
        if (table) {
            table.hidden = true;
        }
        if (bottom) {
            bottom.hidden = true;
        }
        if (statusFooter) {
            statusFooter.hidden = true;
        }
        setToolbarState(root, 'uptodate');
        setStatus('');
        if (view === 'uptodate') {
            applyMirrorBanner(root);
        }
    }

    function selectRow(root, row) {
        var rows = root.querySelectorAll('#um-tablewrap tbody tr');
        var i;
        for (i = 0; i < rows.length; i++) {
            rows[i].classList.remove('is-selected');
        }
        if (row) {
            row.classList.add('is-selected');
        }
        setActiveTab(getActiveTabId(root), root);
    }

    function selectFirstRow(root) {
        var first = root.querySelector('#um-tablewrap tbody tr');
        if (first) {
            selectRow(root, first);
        }
    }

    function runRefreshSimulation(root) {
        setBusy(root, true);
        setStatus('Recherche de mises à jour…');
        window.setTimeout(function onRefreshDone() {
            var welcome = root.querySelector('#um-welcome');
            if (welcome && !welcome.hidden) {
                setWelcomeDismissed();
            }
            showMainView(root, 'updates');
            selectFirstRow(root);
            setBusy(root, false);
        }, 900);
    }

    function runInstallSimulation(root) {
        var steps = [
            { text: 'Préparation de l\'installation…', ms: 700 },
            { text: 'Téléchargement des paquets…', ms: 900 },
            { text: 'Application des mises à jour (35 %)…', ms: 800 },
            { text: 'Application des mises à jour (72 %)…', ms: 800 },
            { text: 'Finalisation et nettoyage…', ms: 700 }
        ];
        var idx = 0;
        setBusy(root, true);
        setStatus(steps[0].text);

        function nextStep() {
            if (idx >= steps.length) {
                setTrayBadgeVisible(false);
                showMainView(root, 'uptodate');
                setBusy(root, false);
                return;
            }
            setStatus(steps[idx].text);
            window.setTimeout(nextStep, steps[idx].ms);
            idx++;
        }

        window.setTimeout(nextStep, steps[0].ms);
    }

    function onAction(action, root) {
        if (action === 'install') {
            runInstallSimulation(root);
            return;
        }
        if (action === 'refresh') {
            runRefreshSimulation(root);
            return;
        }
        if (action === 'selectAll') {
            var boxes = root.querySelectorAll('#um-tablewrap tbody input[type="checkbox"]');
            var i;
            for (i = 0; i < boxes.length; i++) {
                boxes[i].checked = true;
            }
            updateSelectionStatus(root);
            return;
        }
        if (action === 'clear') {
            var checks = root.querySelectorAll('#um-tablewrap tbody input[type="checkbox"]');
            var j;
            for (j = 0; j < checks.length; j++) {
                checks[j].checked = false;
            }
            updateSelectionStatus(root);
        }
    }

    function closeAllMenus(root) {
        root.querySelectorAll('.update-manager__menu').forEach(function closeMenu(menu) {
            var trigger = menu.querySelector('.update-manager__menu-trigger');
            var dropdown = menu.querySelector('.update-manager__menu-dropdown');
            if (!dropdown) {
                return;
            }
            dropdown.hidden = true;
            if (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function closeUpdateManagerWindow(root) {
        var win = root.closest('[data-link="update_manager"]');
        if (!win) {
            return;
        }
        var closeBtn = win.querySelector('#closeBtn');
        if (closeBtn) {
            closeBtn.click();
        }
    }

    function setRowsChecked(root, predicate) {
        var rows = root.querySelectorAll('#um-tablewrap tbody tr');
        var i;
        for (i = 0; i < rows.length; i++) {
            var checkbox = rows[i].querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = predicate(rows[i], i);
            }
        }
        updateSelectionStatus(root);
    }

    function syncAutoRefreshMenu(root) {
        var item = root.querySelector('[data-um-menu-action="auto-refresh"]');
        if (!item) {
            return;
        }
        var enabled = root.dataset.umAutoRefresh === 'true';
        item.classList.toggle('is-checked', enabled);
    }

    function onMenuAction(action, root) {
        closeAllMenus(root);
        if (action === 'preferences') {
            showFeedback(root, 'Préférences du gestionnaire de mise à jour (simulation).');
            return;
        }
        if (action === 'close') {
            closeUpdateManagerWindow(root);
            return;
        }
        if (action === 'select-security' || action === 'select-kernels') {
            if (root.dataset.umView !== 'updates') {
                runRefreshSimulation(root);
                window.setTimeout(function afterRefresh() {
                    setRowsChecked(root, function pickRow(row, index) {
                        return index < 3;
                    });
                    showFeedback(root, action === 'select-security'
                        ? 'Mises à jour de sécurité sélectionnées (simulation).'
                        : 'Mises à jour des noyaux sélectionnées (simulation).', 3000);
                }, 950);
                return;
            }
            setRowsChecked(root, function pickRow(row, index) {
                return index < 3;
            });
            showFeedback(root, action === 'select-security'
                ? 'Mises à jour de sécurité sélectionnées (simulation).'
                : 'Mises à jour des noyaux sélectionnées (simulation).', 3000);
            return;
        }
        if (action === 'selectAll') {
            onAction('selectAll', root);
            return;
        }
        if (action === 'clear') {
            onAction('clear', root);
            return;
        }
        if (action === 'show-updates') {
            runRefreshSimulation(root);
            return;
        }
        if (action === 'auto-refresh') {
            var next = root.dataset.umAutoRefresh !== 'true';
            root.dataset.umAutoRefresh = next ? 'true' : 'false';
            syncAutoRefreshMenu(root);
            showFeedback(root, next
                ? 'Actualisation automatique activée (simulation).'
                : 'Actualisation automatique désactivée (simulation).');
            return;
        }
        if (action === 'history') {
            showFeedback(root, 'Historique des mises à jour (simulation).');
            return;
        }
        if (action === 'help') {
            window.alert('Gestionnaire de mise à jour\nmintupdate 7.1.4\nSimulation CapsuleOS');
            return;
        }
        if (action === 'about') {
            window.alert('Gestionnaire de mise à jour\nmintupdate 7.1.4\nLinux Mint 22.3\nSimulation CapsuleOS');
        }
    }

    function hideMirrorBanner(banner) {
        if (!banner) {
            return;
        }
        banner.hidden = true;
        banner.setAttribute('aria-hidden', 'true');
        banner.style.display = 'none';
    }

    function onMirrorResponse(choice, root) {
        closeAllMenus(root);
        var banner = root.querySelector('#um-mirror-banner');
        setMirrorDismissed();
        hideMirrorBanner(banner);
        if (choice === 'yes') {
            showFeedback(root, 'Ouverture des sources logicielles…', 1400);
            return;
        }
    }

    function bindMirrorButtons(root) {
        var banner = root.querySelector('#um-mirror-banner');
        if (!banner || banner.dataset.umMirrorInit === 'true') {
            return;
        }
        banner.dataset.umMirrorInit = 'true';
        banner.querySelectorAll('[data-um-mirror], .update-manager__banner-btn').forEach(function bindMirror(btn) {
            btn.addEventListener('click', function onMirrorClick(event) {
                event.preventDefault();
                event.stopPropagation();
                if (busy) {
                    return;
                }
                var choice = btn.getAttribute('data-um-mirror');
                if (!choice) {
                    choice = btn.textContent.trim().toLowerCase() === 'oui' ? 'yes' : 'no';
                }
                onMirrorResponse(choice, root);
            });
        });
    }

    function setupMenus(root) {
        root.querySelectorAll('.update-manager__menu').forEach(function bindMenu(menu) {
            var trigger = menu.querySelector('.update-manager__menu-trigger');
            var dropdown = menu.querySelector('.update-manager__menu-dropdown');
            if (!trigger || !dropdown) {
                return;
            }

            trigger.addEventListener('click', function onTriggerClick(e) {
                e.stopPropagation();
                if (busy) {
                    return;
                }
                var wasOpen = !dropdown.hidden;
                closeAllMenus(root);
                if (!wasOpen) {
                    dropdown.hidden = false;
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            trigger.addEventListener('mouseenter', function onTriggerEnter() {
                if (busy) {
                    return;
                }
                var anyOpen = root.querySelector('.update-manager__menu-dropdown:not([hidden])');
                if (anyOpen && dropdown.hidden) {
                    closeAllMenus(root);
                    dropdown.hidden = false;
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            dropdown.querySelectorAll('[data-um-menu-action]').forEach(function bindEntry(entry) {
                entry.addEventListener('click', function onEntryClick(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (busy) {
                        return;
                    }
                    onMenuAction(entry.getAttribute('data-um-menu-action'), root);
                });
            });
        });

        document.addEventListener('click', function onDocClick(event) {
            if (!root.contains(event.target)) {
                closeAllMenus(root);
            }
        }, true);

        root.addEventListener('keydown', function onEscape(event) {
            if (event.key === 'Escape') {
                closeAllMenus(root);
            }
        });

        syncAutoRefreshMenu(root);
    }

    function bindMintInteractions(root) {
        setupMenus(root);
        bindMirrorButtons(root);

        root.addEventListener('click', function onMintClick(event) {
            if (busy) {
                return;
            }
            var welcomeBtn = event.target.closest('[data-um-welcome]');
            if (welcomeBtn && root.contains(welcomeBtn)) {
                event.preventDefault();
                var cmd = welcomeBtn.getAttribute('data-um-welcome');
                if (cmd === 'help') {
                    onMenuAction('help', root);
                    return;
                }
                if (cmd === 'finish') {
                    setWelcomeDismissed();
                    showMainView(root, 'uptodate');
                }
                return;
            }
            var menuAction = event.target.closest('[data-um-menu-action]');
            if (menuAction && root.contains(menuAction)) {
                return;
            }
            var mirrorBtn = event.target.closest('[data-um-mirror], .update-manager__banner-btn');
            if (mirrorBtn && root.contains(mirrorBtn)) {
                return;
            }
            var tab = event.target.closest('[data-um-tab]');
            if (tab && root.contains(tab)) {
                event.preventDefault();
                setActiveTab(tab.getAttribute('data-um-tab'), root);
                return;
            }
            var row = event.target.closest('#um-tablewrap tbody tr');
            if (row && root.contains(row) && !event.target.closest('input[type="checkbox"]')) {
                selectRow(root, row);
                return;
            }
            var tool = event.target.closest('[data-um-action]');
            if (tool && root.contains(tool) && !tool.disabled) {
                event.preventDefault();
                onAction(tool.getAttribute('data-um-action'), root);
            }
        });

        root.addEventListener('change', function onMintChange(event) {
            var checkbox = event.target;
            if (!checkbox || checkbox.type !== 'checkbox') {
                return;
            }
            if (!root.contains(checkbox) || !checkbox.closest('#um-tablewrap tbody')) {
                return;
            }
            updateSelectionStatus(root);
        });
    }

    function gnomeAppCatalog() {
        var base = {
            firefox: {
                title: 'Firefox',
                sub: 'Navigateur Web',
                desc: 'Navigateur Web libre et open source développé par Mozilla.',
                version: '140.11.0',
                size: '~95 Mo',
                iconClass: 'gnome-software__cardicon--firefox',
                installed: true,
                slot: 'firefox',
                categories: ['productivity']
            },
            'libreoffice-writer': {
                title: 'LibreOffice Writer',
                sub: 'Traitement de texte',
                desc: 'Suite bureautique libre — éditeur de documents.',
                version: '24.8',
                size: '~120 Mo',
                iconClass: 'gnome-software__cardicon--libreoffice-writer',
                installed: false,
                slot: 'librewriter',
                categories: ['productivity', 'creation']
            },
            files: {
                title: 'Fichiers',
                sub: 'Gestionnaire de fichiers',
                desc: 'Parcourez et organisez les fichiers et dossiers.',
                version: '47.6',
                size: '~4 Mo',
                iconClass: 'gnome-software__cardicon--files',
                installed: true,
                slot: 'nemo',
                categories: ['productivity', 'utilities']
            },
            'text-editor': {
                title: 'Éditeur de texte',
                sub: 'Éditeur simple',
                desc: 'Éditeur de texte léger pour notes et scripts.',
                version: '47.4',
                size: '~2 Mo',
                iconClass: 'gnome-software__cardicon--text-editor',
                installed: true,
                slot: 'text_editor',
                categories: ['productivity', 'development']
            },
            calculator: {
                title: 'Calculatrice',
                sub: 'Calculs et conversions',
                desc: 'Effectuez des calculs arithmétiques et des conversions.',
                version: '46.3',
                size: '~1 Mo',
                iconClass: 'gnome-software__cardicon--calculator',
                installed: true,
                slot: 'calculator',
                categories: ['utilities']
            },
            terminal: {
                title: 'Terminal',
                sub: 'Ligne de commande',
                desc: 'Accédez au shell système via une interface graphique.',
                version: '47.13',
                size: '~3 Mo',
                iconClass: 'gnome-software__cardicon--terminal',
                installed: true,
                slot: 'terminal',
                categories: ['development', 'utilities']
            },
            netsleuth: {
                title: 'Netsleuth',
                sub: 'Analyseur de trafic réseau',
                desc: 'Inspectez les connexions réseau actives sur votre système.',
                version: '0.1',
                size: '~2 Mo',
                iconClass: 'gnome-software__cardicon--netsleuth',
                installed: false,
                categories: ['utilities', 'development']
            }
        };
        if (typeof window.CapsuleGnomeStore !== 'undefined'
            && typeof window.CapsuleGnomeStore.mergeStoreApps === 'function') {
            return window.CapsuleGnomeStore.mergeStoreApps(base);
        }
        return base;
    }

    function initGnomeInstalledFromCatalog() {
        var saved = null;
        try {
            var raw = window.sessionStorage.getItem(GNOME_INSTALLED_KEY);
            if (raw) {
                saved = JSON.parse(raw);
            }
        } catch (e) {
            saved = null;
        }
        var catalog = gnomeAppCatalog();
        var state = {};
        var ids = Object.keys(catalog);
        var i;
        for (i = 0; i < ids.length; i += 1) {
            state[ids[i]] = catalog[ids[i]].installed === true;
        }
        if (saved) {
            var savedIds = Object.keys(saved);
            for (i = 0; i < savedIds.length; i += 1) {
                state[savedIds[i]] = saved[savedIds[i]] === true;
            }
        }
        if (typeof window.CapsuleGnomeStore !== 'undefined'
            && typeof window.CapsuleGnomeStore.loadStoreInstalledMeta === 'function') {
            var registryId = window.CapsuleGnomeStore.resolveRegistryId();
            var storeMeta = window.CapsuleGnomeStore.loadStoreInstalledMeta(registryId);
            var storeIds = storeMeta.appIds || [];
            for (i = 0; i < storeIds.length; i += 1) {
                state[storeIds[i]] = true;
            }
        }
        return state;
    }

    function getGnomeInstalledState() {
        if (!gnomeInstalledRuntime) {
            gnomeInstalledRuntime = initGnomeInstalledFromCatalog();
        }
        return gnomeInstalledRuntime;
    }

    function saveGnomeInstalledState() {
        try {
            window.sessionStorage.setItem(GNOME_INSTALLED_KEY, JSON.stringify(getGnomeInstalledState()));
        } catch (e) {
            /* hors ligne */
        }
    }

    function isGnomeAppInstalled(appId) {
        var state = getGnomeInstalledState();
        return state[appId] === true;
    }

    function setGnomeAppInstalled(appId, value) {
        var state = getGnomeInstalledState();
        state[appId] = value === true;
        saveGnomeInstalledState();
    }

    function notifyStoreAppInstalled(appId, app) {
        if (typeof window.CapsuleGnomeStore === 'undefined') {
            return;
        }
        var registryId = window.CapsuleGnomeStore.resolveRegistryId();
        var source = app && app.source ? app.source : 'rpm';
        window.CapsuleGnomeStore.recordStoreInstall(registryId, appId, source);
        if (typeof document === 'undefined' || typeof document.dispatchEvent !== 'function') {
            return;
        }
        var storeEntry = typeof window.CapsuleGnomeStore.getStoreAppEntry === 'function'
            ? window.CapsuleGnomeStore.getStoreAppEntry(appId)
            : null;
        var slots = [];
        var seen = {};
        function pushSlot(slotId) {
            if (!slotId || seen[slotId]) {
                return;
            }
            seen[slotId] = true;
            slots.push(slotId);
        }
        if (storeEntry && storeEntry.relatedSlots && storeEntry.relatedSlots.length) {
            var ri;
            for (ri = 0; ri < storeEntry.relatedSlots.length; ri += 1) {
                pushSlot(storeEntry.relatedSlots[ri]);
            }
            pushSlot(storeEntry.storeSlot);
        } else if (app && app.slot) {
            pushSlot(app.slot);
        } else if (storeEntry && storeEntry.slot) {
            pushSlot(storeEntry.slot);
        }
        var si;
        for (si = 0; si < slots.length; si += 1) {
            document.dispatchEvent(new CustomEvent('capsule:store-app-installed', {
                detail: {
                    appId: appId,
                    slot: slots[si],
                    storeSlot: storeEntry && storeEntry.storeSlot ? storeEntry.storeSlot : (app && app.storeSlot ? app.storeSlot : ''),
                    registryId: registryId,
                    source: source,
                    suiteInstall: !!(storeEntry && storeEntry.relatedSlots && storeEntry.relatedSlots.length)
                }
            }));
        }
    }

    function notifyStoreAppUninstalled(appId, app) {
        if (typeof window.CapsuleGnomeStore !== 'undefined'
            && typeof window.CapsuleGnomeStore.removeStoreInstall === 'function') {
            var registryId = window.CapsuleGnomeStore.resolveRegistryId();
            window.CapsuleGnomeStore.removeStoreInstall(registryId, appId);
        }
        if (typeof document === 'undefined' || typeof document.dispatchEvent !== 'function') {
            return;
        }
        var storeEntry = typeof window.CapsuleGnomeStore !== 'undefined'
            && typeof window.CapsuleGnomeStore.getStoreAppEntry === 'function'
            ? window.CapsuleGnomeStore.getStoreAppEntry(appId)
            : null;
        document.dispatchEvent(new CustomEvent('capsule:store-app-uninstalled', {
            detail: {
                appId: appId,
                slot: app && app.slot ? app.slot : (storeEntry && storeEntry.slot ? storeEntry.slot : ''),
                storeSlot: storeEntry && storeEntry.storeSlot ? storeEntry.storeSlot : '',
                registryId: typeof window.CapsuleGnomeStore !== 'undefined'
                    ? window.CapsuleGnomeStore.resolveRegistryId()
                    : ''
            }
        }));
    }

    function canUninstallGnomeApp(appId) {
        if (!appId || appId === 'gnome-software') {
            return false;
        }
        return isGnomeAppInstalled(appId);
    }

    function collapseGnomeSearch(root, options) {
        if (typeof window.CapsuleGnomeSoftwareGround !== 'undefined'
            && typeof window.CapsuleGnomeSoftwareGround.collapseSearch === 'function') {
            window.CapsuleGnomeSoftwareGround.collapseSearch(root, options);
        }
    }

    function closeGnomeSoftwareMenu(root) {
        var menu = root.querySelector('[data-um-gnome-menu]');
        var btn = root.querySelector('[data-um-gnome-action="menu"]');
        if (menu) {
            menu.hidden = true;
        }
        if (btn) {
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    function toggleGnomeSoftwareMenu(root) {
        var menu = root.querySelector('[data-um-gnome-menu]');
        var btn = root.querySelector('[data-um-gnome-action="menu"]');
        if (!menu) {
            return;
        }
        var open = menu.hidden;
        menu.hidden = !open;
        if (btn) {
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
    }

    function onGnomeMenuAction(actionId, root) {
        closeGnomeSoftwareMenu(root);
        if (actionId === 'refresh') {
            setGnomeLoading(root, true, 'Actualisation du cache logiciel…');
            window.setTimeout(function onRefreshDone() {
                setGnomeLoading(root, false);
                renderDiscoverSection(root);
                renderGnomeInstalledList(root);
                setStatus('Cache logiciel actualisé (simulation).');
            }, 700);
            return;
        }
        if (actionId === 'about') {
            var content = resolveGnomeSoftwareContent(resolveGnomeRegistryId());
            var version = content.softwarePackageVersion || '50.0';
            setStatus('Logiciels ' + version + ' — simulation CapsuleOS.');
        }
    }

    function syncGnomeDetailUninstallButton(root, appId) {
        var uninstallBtn = root.querySelector('[data-um-gnome-detail-uninstall]');
        if (!uninstallBtn) {
            return;
        }
        uninstallBtn.hidden = !canUninstallGnomeApp(appId);
    }

    function handleGnomeUninstall(root, appId) {
        if (!canUninstallGnomeApp(appId)) {
            return;
        }
        var catalog = gnomeAppCatalog();
        var app = catalog[appId];
        if (!app) {
            return;
        }
        setGnomeAppInstalled(appId, false);
        notifyStoreAppUninstalled(appId, app);
        renderGnomeInstalledList(root);
        renderDiscoverSection(root);
        if (root.dataset.umGnomeView === 'detail' && root.dataset.umGnomeDetailApp === appId) {
            syncGnomeDetailInstallButton(root, appId);
            syncGnomeDetailUninstallButton(root, appId);
        }
        setStatus(app.title + ' désinstallé.');
    }

    function renderDiscoverSection(root) {
        var section = root.querySelector('[data-um-gnome-discover-section]');
        var grid = root.querySelector('[data-um-gnome-discover-grid]');
        if (!section || !grid) {
            return;
        }
        if (typeof window.CapsuleGnomeStore === 'undefined'
            || typeof window.CapsuleGnomeStore.getDiscoverApps !== 'function') {
            section.hidden = true;
            return;
        }
        var apps = window.CapsuleGnomeStore.getDiscoverApps(getGnomeInstalledState());
        if (!apps.length) {
            section.hidden = true;
            return;
        }
        section.hidden = false;
        renderGnomeAppGrid(root, grid, apps);
    }

    function openGnomeAppSlot(slot) {
        if (!slot) {
            return;
        }
        if (typeof window.CapsuleWindowShell !== 'undefined'
            && typeof window.CapsuleWindowShell.resolveWindowSlot === 'function'
            && typeof window.CapsuleWindowShell.openWindowContainer === 'function') {
            var container = window.CapsuleWindowShell.resolveWindowSlot(slot);
            if (container) {
                window.CapsuleWindowShell.openWindowContainer(container, slot);
                return;
            }
        }
        if (typeof window.openWindowByDataLink === 'function') {
            window.openWindowByDataLink(slot);
        }
    }

    function resolveGnomeRegistryId() {
        if (typeof window.CapsuleGnomeStore !== 'undefined'
            && typeof window.CapsuleGnomeStore.resolveRegistryId === 'function') {
            return window.CapsuleGnomeStore.resolveRegistryId() || 'linux-rocky';
        }
        return 'linux-rocky';
    }

    function resolveGnomeSoftwareContent(registryId) {
        var map = window.CAPSULE_GNOME_SOFTWARE_CONTENT || {};
        if (registryId && map[registryId]) {
            return map[registryId];
        }
        return map['linux-rocky'] || {
            softwarePackageVersion: '47.5',
            updatesCount: 4,
            updatesBanner: {
                strong: '4 mises à jour disponibles',
                sub: 'Cliquez pour afficher les mises à jour'
            },
            updatesSubtitle: '4 mises à jour disponibles',
            distributionLabel: 'Red Hat Enterprise Linux',
            updatesRows: []
        };
    }

    function formatGnomeDetailSource(registryId, app) {
        var content = resolveGnomeSoftwareContent(registryId);
        var source = app && app.source ? app.source : 'rpm';
        var channel = source === 'flatpak' ? 'Flathub' : 'AppStream';
        var pkg = source === 'flatpak' ? 'Flatpak' : 'RPM';
        var label = channel + ' · ' + pkg;
        if (content.distributionLabel && source !== 'flatpak') {
            label += ' · ' + content.distributionLabel;
        }
        return label;
    }

    function renderGnomeUpdatesList(root, content) {
        var container = root.querySelector('[data-um-gnome-updates-rows]');
        if (!container) {
            return;
        }
        var rows = content.updatesRows || [];
        var html = '';
        var i;
        for (i = 0; i < rows.length; i += 1) {
            var row = rows[i];
            html += '<article class="gnome-software__update-row" aria-label="' + row.title + '">'
                + '<span class="gnome-software__appicon ' + row.iconClass + '" aria-hidden="true"></span>'
                + '<div class="gnome-software__rowtext">'
                + '<p class="gnome-software__rowtitle">' + row.title + '</p>'
                + '<p class="gnome-software__rowsub">' + row.versionLine + '</p>'
                + '</div>'
                + '<button type="button" class="gnome-software__rowbtn" data-um-gnome-action="updateOne">Mettre à jour</button>'
                + '</article>';
        }
        container.innerHTML = html;
        var list = root.querySelector('[data-um-gnome-updates-list]');
        if (list) {
            list.hidden = rows.length === 0;
        }
    }

    function applyGnomeSoftwareContent(root) {
        var registryId = resolveGnomeRegistryId();
        var content = resolveGnomeSoftwareContent(registryId);
        var count = content.updatesCount || 0;
        var badge = root.querySelector('[data-um-gnome-badge]');
        if (badge) {
            badge.textContent = String(count);
            badge.setAttribute('aria-label', count + ' mise' + (count > 1 ? 's' : '') + ' à jour');
            badge.hidden = count === 0;
        }
        var bannerStrong = root.querySelector('[data-um-gnome-banner-strong]');
        var bannerSub = root.querySelector('[data-um-gnome-banner-sub]');
        var banner = root.querySelector('[data-um-gnome-updates-banner]');
        if (bannerStrong && content.updatesBanner) {
            bannerStrong.textContent = content.updatesBanner.strong || bannerStrong.textContent;
        }
        if (bannerSub && content.updatesBanner) {
            bannerSub.textContent = content.updatesBanner.sub || bannerSub.textContent;
        }
        if (banner) {
            banner.setAttribute('aria-label', (content.updatesBanner && content.updatesBanner.strong)
                ? content.updatesBanner.strong + ' — afficher'
                : 'Mises à jour disponibles — afficher');
            if (content.hideExploreUpdatesBanner
                && (content.chromeProfile || 'gs50-tabs') === 'gs50-tabs') {
                banner.hidden = true;
                banner.dataset.umGnomeBannerSuppressed = 'gs50-explore';
            } else if (banner.dataset.umGnomeBannerSuppressed !== 'gs50-explore') {
                banner.hidden = count === 0;
            }
        }
        var subtitle = root.querySelector('[data-um-gnome-updates-subtitle]');
        if (subtitle) {
            subtitle.textContent = content.updatesSubtitle || subtitle.textContent;
        }
        renderGnomeUpdatesList(root, content);
    }

    function gnomeMetaInstalledRows(registryId) {
        var content = resolveGnomeSoftwareContent(registryId);
        return [{
            id: 'gnome-software',
            title: 'Logiciels',
            sub: (content.softwarePackageVersion || '47.5') + ' · Centre d\'applications',
            iconClass: 'gnome-software__appicon--software',
            noOpen: true,
            noDetails: true
        }];
    }

    function renderGnomeInstalledList(root) {
        var container = root.querySelector('[data-um-gnome-installed-list]');
        if (!container) {
            return;
        }
        var catalog = gnomeAppCatalog();
        var ids = Object.keys(catalog);
        var html = '';
        var i;
        for (i = 0; i < ids.length; i += 1) {
            var id = ids[i];
            var app = catalog[id];
            if (!isGnomeAppInstalled(id)) {
                continue;
            }
            html += '<article class="gnome-software__update-row gnome-software__update-row--installed" aria-label="'
                + app.title + '">'
                + '<span class="gnome-software__appicon gnome-software__cardicon ' + app.iconClass
                + '" aria-hidden="true"></span>'
                + '<div class="gnome-software__rowtext">'
                + '<p class="gnome-software__rowtitle">' + app.title + '</p>'
                + '<p class="gnome-software__rowsub">' + app.version + ' · ' + app.sub + '</p>'
                + '</div>'
                + '<div class="gnome-software__rowactions">';
            if (app.slot) {
                html += '<button type="button" class="gnome-software__rowbtn" data-um-gnome-action="open" data-um-gnome-app="'
                    + id + '">Ouvrir</button>';
            }
            html += '<button type="button" class="gnome-software__rowbtn gnome-software__rowbtn--secondary" data-um-gnome-app="'
                + id + '">Détails</button>';
            if (canUninstallGnomeApp(id)) {
                html += '<button type="button" class="gnome-software__rowbtn gnome-software__rowbtn--danger" data-um-gnome-action="uninstall" data-um-gnome-app="'
                    + id + '">Désinstaller</button>';
            }
            html += '</div></article>';
        }
        var registryId = resolveGnomeRegistryId();
        var metaRows = gnomeMetaInstalledRows(registryId);
        for (i = 0; i < metaRows.length; i += 1) {
            var meta = metaRows[i];
            html += '<article class="gnome-software__update-row gnome-software__update-row--installed" aria-label="'
                + meta.title + '">'
                + '<span class="gnome-software__appicon ' + meta.iconClass + '" aria-hidden="true"></span>'
                + '<div class="gnome-software__rowtext">'
                + '<p class="gnome-software__rowtitle">' + meta.title + '</p>'
                + '<p class="gnome-software__rowsub">' + meta.sub + '</p>'
                + '</div>'
                + '<div class="gnome-software__rowactions">'
                + '<button type="button" class="gnome-software__rowbtn gnome-software__rowbtn--secondary" disabled>Détails</button>'
                + '</div></article>';
        }
        container.innerHTML = html;
    }

    function syncGnomeDetailInstallButton(root, appId) {
        var catalog = gnomeAppCatalog();
        var app = catalog[appId];
        var installBtn = root.querySelector('.gnome-software__detail-install');
        if (!installBtn || !app) {
            return;
        }
        installBtn.classList.remove('is-installing', 'is-open');
        installBtn.disabled = false;
        if (isGnomeAppInstalled(appId)) {
            installBtn.textContent = 'Ouvrir';
            installBtn.classList.add('is-open');
            installBtn.setAttribute('data-um-gnome-action', 'install');
            return;
        }
        installBtn.textContent = 'Installer';
        installBtn.setAttribute('data-um-gnome-action', 'install');
    }

    function runGnomeInstallSimulation(root, appId) {
        if (gnomeBusy) {
            return;
        }
        var catalog = gnomeAppCatalog();
        var app = catalog[appId];
        if (!app || isGnomeAppInstalled(appId)) {
            return;
        }
        var installBtn = root.querySelector('.gnome-software__detail-install');
        var progress = root.querySelector('[data-um-gnome-install-progress]');
        var bar = root.querySelector('[data-um-gnome-install-bar]');
        var label = root.querySelector('[data-um-gnome-install-label]');
        var networkError = root.querySelector('[data-um-gnome-network-error]');
        if (networkError) {
            networkError.hidden = true;
        }
        var steps = [
            { text: 'Préparation…', pct: 12, ms: 450 },
            { text: 'Téléchargement…', pct: 38, ms: 650 },
            { text: 'Installation…', pct: 68, ms: 750 },
            { text: 'Finalisation…', pct: 92, ms: 600 },
            { text: 'Terminé', pct: 100, ms: 350 }
        ];
        gnomeBusy = true;
        root.dataset.umGnomeInstalling = 'true';
        if (installBtn) {
            installBtn.disabled = true;
            installBtn.textContent = 'Installation…';
            installBtn.classList.add('is-installing');
        }
        if (progress) {
            progress.hidden = false;
            progress.setAttribute('aria-hidden', 'false');
        }
        if (bar) {
            bar.style.width = '0%';
        }
        var idx = 0;
        function nextStep() {
            if (idx >= steps.length) {
                setGnomeAppInstalled(appId, true);
                if (app.storeInstallable === true) {
                    notifyStoreAppInstalled(appId, app);
                }
                if (installBtn) {
                    installBtn.disabled = false;
                    installBtn.textContent = 'Ouvrir';
                    installBtn.classList.remove('is-installing');
                    installBtn.classList.add('is-open');
                }
                if (progress) {
                    progress.hidden = true;
                    progress.setAttribute('aria-hidden', 'true');
                }
                renderGnomeInstalledList(root);
                renderDiscoverSection(root);
                syncGnomeDetailUninstallButton(root, appId);
                setStatus(app.title + ' installé.');
                gnomeBusy = false;
                root.dataset.umGnomeInstalling = 'false';
                if (appId === 'libreoffice-writer') {
                    root.dataset.umGnomeScenario = 'S1-complete';
                } else if (appId === 'file-roller') {
                    root.dataset.umGnomeScenario = 'S5-complete';
                } else if (appId === 'libreoffice') {
                    root.dataset.umGnomeScenario = 'S6-complete';
                } else if (appId === 'calendar') {
                    root.dataset.umGnomeScenario = 'S7-complete';
                } else if (appId === 'thunderbird') {
                    root.dataset.umGnomeScenario = 'S9-complete';
                } else if (appId === 'transmission') {
                    root.dataset.umGnomeScenario = 'S10-complete';
                } else if (appId === 'warpinator') {
                    root.dataset.umGnomeScenario = 'S11-complete';
                } else if (appId === 'simple-scan') {
                    root.dataset.umGnomeScenario = 'S12-complete';
                }
                return;
            }
            var step = steps[idx];
            if (installBtn && idx < steps.length - 1) {
                installBtn.textContent = step.text.indexOf('Installation') === 0 ? 'Installation…' : step.text;
            }
            if (bar) {
                bar.style.width = String(step.pct) + '%';
            }
            if (label) {
                label.textContent = step.text + ' — ' + app.title;
            }
            setStatus(step.text + ' — ' + app.title);
            idx += 1;
            window.setTimeout(nextStep, step.ms);
        }
        window.setTimeout(nextStep, steps[0].ms);
    }

    function handleGnomeInstallOrOpen(root, appId) {
        var catalog = gnomeAppCatalog();
        var app = catalog[appId];
        if (!app) {
            return;
        }
        if (isGnomeAppInstalled(appId)) {
            if (app.slot) {
                openGnomeAppSlot(app.slot);
                setStatus(app.title + ' ouvert.');
            }
            return;
        }
        runGnomeInstallSimulation(root, appId);
    }

    function showGnomeNetworkError(root) {
        var banner = root.querySelector('[data-um-gnome-network-error]');
        if (banner) {
            banner.hidden = false;
        }
        setStatus('Erreur réseau (simulation).');
        root.dataset.umGnomeScenario = 'S8-network-error';
    }

    var GNOME_CATEGORY_LABELS = {
        productivity: 'Productivité',
        creation: 'Création',
        development: 'Développement',
        utilities: 'Utilitaires'
    };

    function gnomeAppsForCategory(categoryId) {
        var catalog = gnomeAppCatalog();
        var ids = Object.keys(catalog);
        var result = [];
        var i;
        for (i = 0; i < ids.length; i += 1) {
            var id = ids[i];
            var app = catalog[id];
            if ((app.categories || []).indexOf(categoryId) !== -1) {
                result.push({ id: id, app: app });
            }
        }
        return result;
    }

    function gnomeAppsForSearch(query) {
        var catalog = gnomeAppCatalog();
        var needle = String(query || '').trim().toLowerCase();
        if (!needle) {
            return [];
        }
        var ids = Object.keys(catalog);
        var result = [];
        var i;
        for (i = 0; i < ids.length; i += 1) {
            var id = ids[i];
            var app = catalog[id];
            var hay = (app.title + ' ' + app.sub + ' ' + app.desc).toLowerCase();
            if (hay.indexOf(needle) !== -1) {
                result.push({ id: id, app: app });
            }
        }
        return result;
    }

    function renderGnomeAppGrid(root, container, apps) {
        if (!container) {
            return;
        }
        var html = '';
        var i;
        for (i = 0; i < apps.length; i += 1) {
            var entry = apps[i];
            html += '<button type="button" class="gnome-software__card" role="listitem"'
                + ' data-um-gnome-app="' + entry.id + '" aria-label="' + entry.app.title + '">'
                + '<span class="gnome-software__cardicon gnome-software__cardicon--has-icon ' + entry.app.iconClass + '" aria-hidden="true"></span>'
                + '<span class="gnome-software__cardname">' + entry.app.title + '</span>'
                + '<span class="gnome-software__cardsub">' + entry.app.sub + '</span>'
                + '</button>';
        }
        container.innerHTML = html;
    }

    function setGnomeLoading(root, visible, text) {
        var overlay = root.querySelector('[data-um-gnome-loading]');
        var label = root.querySelector('[data-um-gnome-loading-text]');
        if (!overlay) {
            return;
        }
        overlay.hidden = !visible;
        if (label && text) {
            label.textContent = text;
        }
    }

    function showGnomeCategory(root, categoryId) {
        var label = GNOME_CATEGORY_LABELS[categoryId] || 'Catégorie';
        var title = root.querySelector('[data-um-gnome-category-title]');
        var sub = root.querySelector('[data-um-gnome-category-sub]');
        var grid = root.querySelector('[data-um-gnome-category-grid]');
        if (title) {
            title.textContent = label;
        }
        if (sub) {
            sub.textContent = 'Applications de la catégorie « ' + label + ' »';
        }
        renderGnomeAppGrid(root, grid, gnomeAppsForCategory(categoryId));
        root.dataset.umGnomeCategory = categoryId;
        setGnomeView(root, 'category');
        setStatus('Catégorie « ' + label + ' »');
    }

    function showGnomeSearch(root, query) {
        var sub = root.querySelector('[data-um-gnome-search-sub]');
        var grid = root.querySelector('[data-um-gnome-search-grid]');
        var empty = root.querySelector('[data-um-gnome-search-empty]');
        var trimmed = String(query || '').trim();
        var apps = gnomeAppsForSearch(trimmed);
        if (sub) {
            sub.textContent = trimmed
                ? apps.length + ' résultat(s) pour « ' + trimmed + ' »'
                : 'Saisissez un terme dans la barre de recherche';
        }
        renderGnomeAppGrid(root, grid, apps);
        if (grid) {
            grid.hidden = apps.length === 0;
        }
        if (empty) {
            empty.hidden = apps.length !== 0 || !trimmed;
        }
        if (trimmed) {
            setGnomeView(root, 'search');
        }
    }

    function showGnomeUpdatesEmpty(root) {
        var empty = root.querySelector('[data-um-gnome-updates-empty]');
        var list = root.querySelector('[data-um-gnome-updates-list]');
        var subtitle = root.querySelector('[data-um-gnome-updates-subtitle]');
        var actions = root.querySelector('[data-um-gnome-pane="updates"] .gnome-software__actions');
        if (empty) {
            empty.hidden = false;
        }
        if (list) {
            list.hidden = true;
        }
        if (subtitle) {
            subtitle.textContent = 'Le système est à jour';
        }
        if (actions) {
            actions.querySelectorAll('[data-um-gnome-action="updateAll"]').forEach(function hideBtn(btn) {
                btn.hidden = true;
            });
        }
    }

    function setGnomeView(root, viewId) {
        var panes = root.querySelectorAll('[data-um-gnome-pane]');
        var i;
        for (i = 0; i < panes.length; i += 1) {
            var pane = panes[i];
            var paneId = pane.getAttribute('data-um-gnome-pane');
            var show = paneId === viewId;
            pane.hidden = !show;
        }
        if (viewId !== 'detail' && viewId !== 'search' && viewId !== 'category') {
            root.dataset.umGnomeBackView = viewId;
        }
        root.dataset.umGnomeView = viewId;
        var navItems = root.querySelectorAll('[data-um-gnome-nav]');
        for (i = 0; i < navItems.length; i += 1) {
            var nav = navItems[i];
            var navId = nav.getAttribute('data-um-gnome-nav');
            var active = navId === viewId
                && viewId !== 'detail'
                && viewId !== 'search'
                && viewId !== 'category';
            nav.classList.toggle('is-active', active);
            if (active) {
                nav.setAttribute('aria-current', 'page');
            } else {
                nav.removeAttribute('aria-current');
            }
        }
    }

    function showGnomeDetail(root, appId) {
        var catalog = gnomeAppCatalog();
        var app = catalog[appId];
        if (!app) {
            return;
        }
        var icon = root.querySelector('[data-um-gnome-detail-icon]');
        var title = root.querySelector('[data-um-gnome-detail-title]');
        var sub = root.querySelector('[data-um-gnome-detail-sub]');
        var desc = root.querySelector('[data-um-gnome-detail-long]');
        var version = root.querySelector('[data-um-gnome-detail-version]');
        var size = root.querySelector('[data-um-gnome-detail-size]');
        var installBtn = root.querySelector('.gnome-software__detail-install');
        var sourceEl = root.querySelector('[data-um-gnome-detail-source]');
        var registryId = resolveGnomeRegistryId();
        if (icon) {
            icon.className = 'gnome-software__detail-icon gnome-software__cardicon gnome-software__cardicon--has-icon ' + app.iconClass;
        }
        if (title) {
            title.textContent = app.title;
        }
        if (sub) {
            sub.textContent = app.sub;
        }
        if (desc) {
            desc.textContent = app.desc;
        }
        if (version) {
            version.textContent = app.version;
        }
        if (size) {
            size.textContent = app.size;
        }
        if (sourceEl) {
            if (typeof window.CapsuleGnomeSoftwareGround !== 'undefined'
                && typeof window.CapsuleGnomeSoftwareGround.formatDetailSource === 'function') {
                sourceEl.textContent = window.CapsuleGnomeSoftwareGround.formatDetailSource(registryId, app, resolveGnomeSoftwareContent(registryId));
            } else {
                sourceEl.textContent = formatGnomeDetailSource(registryId, app);
            }
        }
        if (typeof window.CapsuleGnomeSoftwareGround !== 'undefined'
            && typeof window.CapsuleGnomeSoftwareGround.enrichDetailPane === 'function') {
            window.CapsuleGnomeSoftwareGround.enrichDetailPane(
                root,
                app,
                appId,
                registryId,
                resolveGnomeSoftwareContent(registryId),
                { installed: isGnomeAppInstalled(appId) }
            );
        }
        if (installBtn) {
            syncGnomeDetailInstallButton(root, appId);
        }
        syncGnomeDetailUninstallButton(root, appId);
        root.dataset.umGnomeDetailApp = appId;
        setGnomeView(root, 'detail');
    }

    function bindGnomeSoftware(root) {
        if (typeof window.CapsuleGnomeSoftwareGround !== 'undefined'
            && typeof window.CapsuleGnomeSoftwareGround.applyGround === 'function') {
            window.CapsuleGnomeSoftwareGround.applyGround(root, gnomeAppCatalog());
        }
        applyGnomeSoftwareContent(root);
        renderGnomeInstalledList(root);
        renderDiscoverSection(root);
        if (typeof window.CapsuleGnomeSoftwareGround !== 'undefined'
            && typeof window.CapsuleGnomeSoftwareGround.patchRenderedCardIcons === 'function') {
            window.CapsuleGnomeSoftwareGround.patchRenderedCardIcons(root);
        }
        setGnomeView(root, 'explore');
        root.addEventListener('click', function onGnomeClick(event) {
            if (gnomeBusy) {
                return;
            }
            var menuEntry = event.target.closest('[data-um-gnome-menu-action]');
            if (menuEntry && root.contains(menuEntry)) {
                event.preventDefault();
                onGnomeMenuAction(menuEntry.getAttribute('data-um-gnome-menu-action'), root);
                return;
            }
            if (!event.target.closest('[data-um-gnome-menu]')
                && !event.target.closest('[data-um-gnome-action="menu"]')) {
                closeGnomeSoftwareMenu(root);
            }
            var nav = event.target.closest('[data-um-gnome-nav]');
            if (nav && root.contains(nav)) {
                event.preventDefault();
                collapseGnomeSearch(root);
                var navId = nav.getAttribute('data-um-gnome-nav');
                if (navId === 'explore') {
                    var searchInput = root.querySelector('[data-um-gnome-search]');
                    if (searchInput) {
                        searchInput.value = '';
                    }
                }
                setGnomeView(root, navId);
                return;
            }
            var action = event.target.closest('[data-um-gnome-action]');
            if (action && root.contains(action)) {
                event.preventDefault();
                var id = action.getAttribute('data-um-gnome-action');
                if (id === 'open') {
                    var openAppId = action.getAttribute('data-um-gnome-app') || '';
                    handleGnomeInstallOrOpen(root, openAppId);
                    root.dataset.umGnomeScenario = 'S4-open';
                    return;
                }
                if (id === 'check') {
                    setGnomeLoading(root, true, 'Recherche de mises à jour…');
                    setStatus('Recherche de mises à jour…');
                    window.setTimeout(function onCheckDone() {
                        setGnomeLoading(root, false);
                        setStatus('Dernière vérification : aujourd’hui (simulation)');
                    }, 900);
                    return;
                }
                if (id === 'updateAll') {
                    setGnomeLoading(root, true, 'Installation des mises à jour…');
                    window.setTimeout(function onUpdateAllDone() {
                        setGnomeLoading(root, false);
                        setStatus('Toutes les mises à jour installées (simulation).');
                        setTrayBadgeVisible(false);
                        var badge = root.querySelector('[data-um-gnome-badge]');
                        if (badge) {
                            badge.hidden = true;
                        }
                        var banner = root.querySelector('.gnome-software__updates-banner');
                        if (banner) {
                            banner.hidden = true;
                        }
                        showGnomeUpdatesEmpty(root);
                        root.dataset.umGnomeScenario = 'S3-complete';
                    }, 1200);
                    return;
                }
                if (id === 'updateOne') {
                    setStatus('Mise à jour installée (simulation).');
                    var row = action.closest('.gnome-software__update-row');
                    if (row) {
                        row.hidden = true;
                    }
                    return;
                }
                if (id === 'toggleSearch') {
                    if (typeof window.CapsuleGnomeSoftwareGround !== 'undefined'
                        && typeof window.CapsuleGnomeSoftwareGround.toggleSearch === 'function') {
                        window.CapsuleGnomeSoftwareGround.toggleSearch(root);
                    }
                    return;
                }
                if (id === 'closeSearch') {
                    collapseGnomeSearch(root);
                    if (root.dataset.umGnomeView === 'search') {
                        setGnomeView(root, 'explore');
                        setStatus('Catalogue AppStream (simulation)');
                    }
                    return;
                }
                if (id === 'menu') {
                    toggleGnomeSoftwareMenu(root);
                    return;
                }
                if (id === 'install') {
                    var detailApp = root.dataset.umGnomeDetailApp || '';
                    handleGnomeInstallOrOpen(root, detailApp);
                    return;
                }
                if (id === 'uninstall') {
                    var uninstallAppId = action.getAttribute('data-um-gnome-app')
                        || root.dataset.umGnomeDetailApp
                        || '';
                    handleGnomeUninstall(root, uninstallAppId);
                    return;
                }
                if (id === 'simulateNetworkError') {
                    showGnomeNetworkError(root);
                    root.dataset.umGnomeScenario = 'S8-network-error';
                }
                return;
            }
            var appBtn = event.target.closest('[data-um-gnome-app]');
            if (appBtn && root.contains(appBtn)) {
                event.preventDefault();
                showGnomeDetail(root, appBtn.getAttribute('data-um-gnome-app'));
                return;
            }
            var category = event.target.closest('[data-um-gnome-category]');
            if (category && root.contains(category)) {
                event.preventDefault();
                showGnomeCategory(root, category.getAttribute('data-um-gnome-category'));
                return;
            }
        });
        var search = root.querySelector('[data-um-gnome-search]');
        if (search) {
            search.addEventListener('input', function onGnomeSearch() {
                var query = search.value.trim();
                if (!query) {
                    setGnomeView(root, 'explore');
                    setStatus('Catalogue AppStream (simulation)');
                    return;
                }
                showGnomeSearch(root, query);
                setStatus('Recherche « ' + query + ' »');
            });
            search.addEventListener('keydown', function onGnomeSearchKey(event) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    collapseGnomeSearch(root);
                    if (root.dataset.umGnomeView === 'search') {
                        setGnomeView(root, 'explore');
                        setStatus('Catalogue AppStream (simulation)');
                    }
                }
            });
        }
        root.addEventListener('keydown', function onGnomeKeydown(event) {
            if (event.key !== 'Escape') {
                return;
            }
            closeGnomeSoftwareMenu(root);
            if (root.querySelector('.gnome-software__titlebar.gnome-software__search--expanded')) {
                collapseGnomeSearch(root);
                if (root.dataset.umGnomeView === 'search') {
                    setGnomeView(root, 'explore');
                    setStatus('Catalogue AppStream (simulation)');
                }
                return;
            }
            if (root.dataset.umGnomeView === 'detail') {
                var backView = root.dataset.umGnomeBackView || 'explore';
                setGnomeView(root, backView);
            }
        });
    }

    function bindOnce() {
        const root = findRoot();
        if (!root || root.dataset.umInit === 'true') {
            return;
        }
        if (root.classList.contains('update-manager--ubuntu')) {
            root.dataset.umInit = 'true';
            root.addEventListener('click', (event) => {
                const action = event.target.closest('[data-um-ubuntu-action]');
                if (!action || !root.contains(action)) {
                    return;
                }
                event.preventDefault();
                const id = action.getAttribute('data-um-ubuntu-action');
                if (id === 'check') {
                    setStatus('Recherche de mises à jour… (simulation)');
                    return;
                }
                if (id === 'updateAll') {
                    setStatus('Toutes les mises à jour installées (simulation).');
                    setTrayBadgeVisible(false);
                    return;
                }
                if (id === 'updateOne') {
                    setStatus('Mise à jour installée (simulation).');
                }
            });
            return;
        }
        if (root.classList.contains('update-manager--gnome')) {
            root.dataset.umInit = 'true';
            bindGnomeSoftware(root);
            return;
        }
        detectLayout();

        root.dataset.umInit = 'true';

        if (root.dataset.umLayout === 'cosmic') {
            root.addEventListener('click', (event) => {
                const action = event.target.closest('[data-um-cosmic-action]');
                if (action && root.contains(action)) {
                    event.preventDefault();
                    setStatus('Mises à jour vérifiées (simulation).');
                }
            });
            return;
        }

        if (root.dataset.umLayout === 'kde') {
            const isMxKde = typeof document !== 'undefined'
                && document.body
                && (document.body.id === 'mx-kde'
                    || (typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY === 'mxkde'));
            if (isMxKde) {
                const badge = root.querySelector('.kde-updates__badge');
                if (badge) {
                    badge.textContent = '3';
                    badge.setAttribute('aria-label', '3 mises à jour');
                }
            }
            root.addEventListener('click', (event) => {
                const action = event.target.closest('[data-um-kde-action]');
                if (action && root.contains(action)) {
                    event.preventDefault();
                    const id = action.getAttribute('data-um-kde-action');
                    if (id === 'refresh') {
                        setStatus('Mises à jour rafraîchies (simulation).');
                    } else {
                        setStatus('Toutes les mises à jour installées (simulation).');
                        setTrayBadgeVisible(false);
                    }
                }
            });
            return;
        }

        bindMintInteractions(root);

        if (isMintSkin() && !welcomeDismissed()) {
            showWelcome(root);
        } else if (isMintSkin()) {
            showMainView(root, 'uptodate');
        } else {
            var welcome = root.querySelector('#um-welcome');
            var main = root.querySelector('#um-main');
            var table = root.querySelector('#um-tablewrap');
            var empty = root.querySelector('#um-empty');
            if (welcome) {
                welcome.hidden = true;
            }
            if (main) {
                main.hidden = false;
            }
            if (empty) {
                empty.hidden = true;
            }
            if (table) {
                table.hidden = false;
            }
            setToolbarState(root, 'updates');
            updateSelectionStatus(root);
        }
        setActiveTab('info', root);
    }

    window.initUpdateManagerApp = bindOnce;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindTrayOnce);
    } else {
        bindTrayOnce();
    }
})();
