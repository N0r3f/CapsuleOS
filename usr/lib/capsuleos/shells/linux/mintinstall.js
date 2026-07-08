/**
 * Logithèque — mintinstall 8.4 (Software Manager) sur Mint.
 */
(function initMintInstallAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Logithèque';

    var MI_SCENARIO_BY_APP = {
        'librewriter': 'Mi1-complete',
        'file-roller': 'Mi5-complete',
        'libreoffice': 'Mi6-complete',
        'calendar': 'Mi7-complete',
        'thunderbird': 'Mi8-complete',
        'transmission': 'Mi9-complete',
        'warpinator': 'Mi10-complete',
        'rhythmbox': 'Mi11-complete',
        'simple-scan': 'Mi12-complete'
    };

    var MINT_CAT_BY_SLOT = {
        firefox: 'internet',
        thunderbird: 'internet',
        transmission: 'internet',
        librewriter: 'office',
        librecalc: 'office',
        libreoffice_impress: 'office',
        libreoffice_draw: 'office',
        libreoffice_startcenter: 'office',
        drawing: 'graphics',
        lecteur_multimedia: 'multimedia',
        rhythmbox: 'multimedia',
        calculator: 'accessories',
        text_editor: 'accessories',
        file_roller: 'accessories',
        calendar: 'accessories',
        simple_scan: 'accessories',
        warpinator: 'internet',
        timeshift: 'accessories',
        baobab: 'accessories',
        snapshot: 'graphics'
    };

    var MINT_ICON_BY_SLOT = {
        firefox: './assets/images/vendors/mint/panel/firefox.webp',
        thunderbird: './assets/images/toolkits/cinnamon/apps/thunderbird.png',
        transmission: './assets/images/toolkits/cinnamon/apps/transmission.png',
        librewriter: './assets/images/vendors/mint/panel/libreoffice-writer.webp',
        librecalc: './assets/images/toolkits/cinnamon/apps/libreoffice-calc',
        libreoffice_impress: './assets/images/toolkits/cinnamon/apps/libreoffice-impress',
        libreoffice_draw: './assets/images/toolkits/cinnamon/apps/libreoffice-draw',
        libreoffice_startcenter: './assets/images/toolkits/cinnamon/apps/libreoffice-startcenter',
        drawing: './assets/images/toolkits/cinnamon/apps/com.github.maoschanz.drawing.png',
        lecteur_multimedia: './assets/images/toolkits/cinnamon/apps/io.github.celluloid_player.Celluloid',
        rhythmbox: './assets/images/toolkits/cinnamon/apps/rhythmbox.png',
        calculator: './assets/images/vendors/mint/panel/org.gnome.Calculator.webp',
        text_editor: './assets/images/vendors/mint/panel/accessories-text-editor.webp',
        file_roller: './assets/images/toolkits/cinnamon/apps/file-roller',
        calendar: './assets/images/toolkits/cinnamon/apps/org.gnome.Calendar',
        simple_scan: './assets/images/toolkits/cinnamon/apps/simple-scan',
        warpinator: './assets/images/toolkits/cinnamon/apps/org.x.Warpinator',
        timeshift: './assets/images/toolkits/cinnamon/apps/timeshift-gtk',
        baobab: './assets/images/toolkits/cinnamon/apps/org.gnome.baobab',
        snapshot: './assets/images/toolkits/gnome/apps/overview/org.gnome.Snapshot.svg'
    };

    var CATALOG_FALLBACK = [
        { id: 'firefox', name: 'Firefox', desc: 'Navigateur web', cat: 'internet', icon: './assets/images/vendors/mint/panel/firefox.webp' },
        { id: 'librewriter', name: 'LibreOffice Writer', desc: 'Traitement de texte', cat: 'office', icon: './assets/images/vendors/mint/panel/libreoffice-writer.webp' },
        { id: 'librecalc', name: 'LibreOffice Calc', desc: 'Tableur', cat: 'office', icon: './assets/images/toolkits/cinnamon/apps/libreoffice-calc' },
        { id: 'libreoffice_impress', name: 'LibreOffice Impress', desc: 'Présentations', cat: 'office', icon: './assets/images/toolkits/cinnamon/apps/libreoffice-impress' },
        { id: 'libreoffice_draw', name: 'LibreOffice Draw', desc: 'Dessin vectoriel', cat: 'office', icon: './assets/images/toolkits/cinnamon/apps/libreoffice-draw' }
    ];

    function getSkinCatalog() {
        if (global.CAPSULE_MINTINSTALL_CATALOG) {
            return global.CAPSULE_MINTINSTALL_CATALOG;
        }
        return null;
    }

    function mapStoreEntryToMint(entry) {
        var slot = entry.storeSlot || entry.slot;
        if (!slot) {
            return null;
        }
        return {
            id: entry.id,
            slot: slot,
            name: entry.title,
            desc: entry.sub || entry.desc || entry.title,
            cat: MINT_CAT_BY_SLOT[slot] || 'accessories',
            icon: entry.iconPath || MINT_ICON_BY_SLOT[slot] || './assets/images/toolkits/cinnamon/apps/default.png',
            defaultInstalled: entry.defaultInstalled === true,
            storeInstallable: entry.storeInstallable === true
        };
    }

    function buildCatalogFromRegistry() {
        var store = global.CapsuleMintStore;
        if (!store || typeof store.getStoreList !== 'function') {
            return null;
        }
        var list = store.getStoreList();
        if (!list.length) {
            return null;
        }
        var out = [];
        var i;
        for (i = 0; i < list.length; i += 1) {
            var mapped = mapStoreEntryToMint(list[i]);
            if (mapped) {
                out.push(mapped);
            }
        }
        return out.length ? out : null;
    }

    function buildDiscoverCatalog(installed) {
        var store = global.CapsuleMintStore;
        if (!store || typeof store.getDiscoverApps !== 'function') {
            return [];
        }
        var list = store.getDiscoverApps(installed || {});
        if (!list.length) {
            return [];
        }
        var out = [];
        var i;
        for (i = 0; i < list.length; i += 1) {
            var mapped = mapStoreEntryToMint(list[i]);
            if (mapped) {
                out.push(mapped);
            }
        }
        return out;
    }

    function getCatalog() {
        var fromRegistry = buildCatalogFromRegistry();
        if (!fromRegistry) {
            return CATALOG_FALLBACK;
        }
        var merged = fromRegistry.slice();
        var fi;
        for (fi = 0; fi < CATALOG_FALLBACK.length; fi += 1) {
            var found = false;
            var mi;
            for (mi = 0; mi < merged.length; mi += 1) {
                if (merged[mi].id === CATALOG_FALLBACK[fi].id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                merged.push(CATALOG_FALLBACK[fi]);
            }
        }
        return merged;
    }

    function resolveOpenSlot(pkgId, storeApi) {
        var storeEntry = storeApi && typeof storeApi.getStoreAppEntry === 'function'
            ? storeApi.getStoreAppEntry(pkgId)
            : null;
        if (storeEntry) {
            if (storeEntry.postInstallSlot) {
                return storeEntry.postInstallSlot;
            }
            if (storeEntry.storeSlot) {
                return storeEntry.storeSlot;
            }
            if (storeEntry.slot) {
                return storeEntry.slot;
            }
        }
        var entry = catalogEntry(pkgId);
        if (entry && entry.slot) {
            return entry.slot;
        }
        return pkgId;
    }

    function createPkgActionButton(entry, isInstalled, storeApi) {
        var btn = global.document.createElement('button');
        btn.type = 'button';
        btn.className = 'mi-app__install';
        if (isInstalled) {
            var openSlot = resolveOpenSlot(entry.id, storeApi);
            btn.textContent = 'Ouvrir';
            btn.classList.add('is-open');
            btn.setAttribute('data-mi-open', openSlot);
        } else {
            btn.textContent = 'Installer';
            btn.setAttribute('data-mi-install', entry.id);
        }
        return btn;
    }

    function isVm84Layout(skinCatalog) {
        return !!(skinCatalog && skinCatalog.layout === 'mintinstall-8.4');
    }

    function setLayoutMode(root, mode) {
        if (!root) {
            return;
        }
        if (mode === 'home') {
            root.classList.add('mi-app--mode-home');
            root.classList.remove('mi-app--mode-browse');
            return;
        }
        root.classList.remove('mi-app--mode-home');
        root.classList.add('mi-app--mode-browse');
    }

    function renderHero(root, skinCatalog) {
        var mount = root.querySelector('[data-mi-hero-mount]');
        if (!mount || !skinCatalog || !skinCatalog.hero || !skinCatalog.hero.length) {
            return;
        }
        mount.innerHTML = '';
        // Bannière unique pleine largeur — structure mintinstall 8.4 VM (carousel réseau).
        var slide = skinCatalog.hero[0];
        var promo = global.document.createElement('div');
        promo.className = 'mi-app__hero-slide mi-app__hero-slide--banner';
        if (slide.accent) {
            promo.style.background = 'linear-gradient(135deg, ' + slide.accent + ' 0%, ' + (slide.accentEnd || slide.accent) + ' 100%)';
        }
        var row = global.document.createElement('div');
        row.className = 'mi-app__hero-promo';
        var icon = global.document.createElement('img');
        icon.className = 'mi-app__hero-icon';
        icon.src = resolveIconUrl(slide.icon);
        icon.alt = '';
        var text = global.document.createElement('div');
        text.className = 'mi-app__hero-text';
        var name = global.document.createElement('p');
        name.className = 'mi-app__hero-name';
        name.textContent = slide.name;
        var desc = global.document.createElement('p');
        desc.className = 'mi-app__hero-desc';
        desc.textContent = slide.desc;
        text.appendChild(name);
        text.appendChild(desc);
        if (slide.flathub) {
            var badge = global.document.createElement('p');
            badge.className = 'mi-app__hero-flathub mi-app__spotlight-flathub';
            badge.textContent = 'Flathub';
            text.appendChild(badge);
        }
        row.appendChild(icon);
        row.appendChild(text);
        var nav = global.document.createElement('div');
        nav.className = 'mi-app__hero-nav';
        nav.setAttribute('aria-hidden', 'true');
        var prev = global.document.createElement('button');
        prev.type = 'button';
        prev.className = 'mi-app__hero-nav-btn mi-app__hero-nav-btn--prev';
        prev.setAttribute('tabindex', '-1');
        prev.textContent = '‹';
        var dots = global.document.createElement('div');
        dots.className = 'mi-app__hero-dots';
        var di;
        for (di = 0; di < 5; di += 1) {
            var dot = global.document.createElement('span');
            dot.className = 'mi-app__hero-dot';
            if (di === 0) {
                dot.classList.add('is-active');
            }
            dots.appendChild(dot);
        }
        var next = global.document.createElement('button');
        next.type = 'button';
        next.className = 'mi-app__hero-nav-btn mi-app__hero-nav-btn--next';
        next.setAttribute('tabindex', '-1');
        next.textContent = '›';
        nav.appendChild(prev);
        nav.appendChild(dots);
        nav.appendChild(next);
        promo.appendChild(row);
        promo.appendChild(nav);
        mount.appendChild(promo);
    }

    function renderSpotlight(root, skinCatalog) {
        var grid = root.querySelector('[data-mi-spotlight]');
        if (!grid || !skinCatalog || !skinCatalog.spotlight || !skinCatalog.spotlight.length) {
            return;
        }
        grid.innerHTML = '';
        var si;
        for (si = 0; si < skinCatalog.spotlight.length; si += 1) {
            var item = skinCatalog.spotlight[si];
            var card = global.document.createElement('li');
            card.className = 'mi-app__spotlight-card';
            var iconEl = global.document.createElement('img');
            iconEl.src = resolveIconUrl(item.icon);
            iconEl.alt = '';
            var title = global.document.createElement('p');
            title.className = 'mi-app__spotlight-name';
            title.textContent = item.name;
            var blurb = global.document.createElement('p');
            blurb.className = 'mi-app__spotlight-desc';
            blurb.textContent = item.desc;
            var meta = global.document.createElement('div');
            meta.className = 'mi-app__spotlight-meta';
            if (item.flathub) {
                var flat = global.document.createElement('span');
                flat.className = 'mi-app__spotlight-flathub';
                flat.textContent = 'Flathub';
                meta.appendChild(flat);
            } else {
                meta.appendChild(global.document.createElement('span'));
            }
            if (item.rating) {
                var rating = global.document.createElement('span');
                rating.textContent = item.rating + ' ★';
                meta.appendChild(rating);
            }
            card.appendChild(iconEl);
            card.appendChild(title);
            card.appendChild(blurb);
            card.appendChild(meta);
            grid.appendChild(card);
        }
    }

    function renderHomeCategories(root, skinCatalog) {
        var grid = root.querySelector('[data-mi-home-cats]');
        if (!grid || !skinCatalog || !skinCatalog.homeCategories || !skinCatalog.homeCategories.length) {
            return;
        }
        grid.innerHTML = '';
        var ci;
        for (ci = 0; ci < skinCatalog.homeCategories.length; ci += 1) {
            var cat = skinCatalog.homeCategories[ci];
            var li = global.document.createElement('li');
            var btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'mi-app__home-cat';
            btn.setAttribute('data-mi-home-cat', cat.id);
            var iconEl = global.document.createElement('img');
            iconEl.src = resolveIconUrl(cat.icon);
            iconEl.alt = '';
            var label = global.document.createElement('span');
            label.textContent = cat.label;
            btn.appendChild(iconEl);
            btn.appendChild(label);
            li.appendChild(btn);
            grid.appendChild(li);
        }
    }

    function renderTopRated(root, skinCatalog) {
        var grid = root.querySelector('[data-mi-top-rated]');
        if (!grid || !skinCatalog || !skinCatalog.topRated || !skinCatalog.topRated.length) {
            return;
        }
        grid.innerHTML = '';
        var ti;
        for (ti = 0; ti < skinCatalog.topRated.length; ti += 1) {
            var item = skinCatalog.topRated[ti];
            var card = global.document.createElement('li');
            card.className = 'mi-app__top-rated-card';
            if (item.id) {
                card.setAttribute('data-mi-pkg', item.id);
            }
            var iconEl = global.document.createElement('img');
            iconEl.src = resolveIconUrl(item.icon);
            iconEl.alt = '';
            var body = global.document.createElement('div');
            body.className = 'mi-app__top-rated-body';
            var title = global.document.createElement('p');
            title.className = 'mi-app__top-rated-name';
            title.textContent = item.name;
            var blurb = global.document.createElement('p');
            blurb.className = 'mi-app__top-rated-desc';
            blurb.textContent = item.desc;
            body.appendChild(title);
            body.appendChild(blurb);
            var meta = global.document.createElement('div');
            meta.className = 'mi-app__top-rated-meta';
            if (item.flathub) {
                var flat = global.document.createElement('span');
                flat.className = 'mi-app__top-rated-flathub';
                flat.textContent = 'Flathub';
                meta.appendChild(flat);
            } else {
                meta.appendChild(global.document.createElement('span'));
            }
            if (item.rating) {
                var rating = global.document.createElement('span');
                rating.textContent = item.rating + ' ★';
                meta.appendChild(rating);
            }
            card.appendChild(iconEl);
            card.appendChild(body);
            card.appendChild(meta);
            grid.appendChild(card);
        }
    }

    function renderHomeVm84(root) {
        var skinCatalog = getSkinCatalog();
        if (!isVm84Layout(skinCatalog)) {
            return;
        }
        renderHero(root, skinCatalog);
        renderSpotlight(root, skinCatalog);
        renderHomeCategories(root, skinCatalog);
        renderTopRated(root, skinCatalog);
        var discoverTitle = root.querySelector('.mi-app__discover-title');
        if (discoverTitle && skinCatalog.discover && skinCatalog.discover.title) {
            discoverTitle.textContent = skinCatalog.discover.title;
        }
    }

    function renderDiscoverSection(root, installed, storeApi, catId) {
        var section = root.querySelector('[data-mi-discover-section]');
        var grid = root.querySelector('[data-mi-discover-grid]');
        if (!grid) {
            return;
        }
        var showDiscover = catId === 'all';
        if (section) {
            if (showDiscover) {
                section.removeAttribute('hidden');
            } else {
                section.setAttribute('hidden', 'hidden');
            }
        }
        if (!showDiscover) {
            grid.innerHTML = '';
            grid.setAttribute('hidden', 'hidden');
            return;
        }
        var discover = buildDiscoverCatalog(installed);
        grid.innerHTML = '';
        if (!discover.length) {
            grid.setAttribute('hidden', 'hidden');
            return;
        }
        grid.removeAttribute('hidden');
        var di;
        for (di = 0; di < discover.length; di += 1) {
            var entry = discover[di];
            var card = global.document.createElement('li');
            card.className = 'mi-app__discover-card';
            card.setAttribute('data-mi-pkg', entry.id);
            var row = global.document.createElement('div');
            row.className = 'mi-app__discover-card__row';
            var icon = global.document.createElement('img');
            icon.className = 'mi-app__list-icon';
            icon.src = resolveIconUrl(entry.icon);
            icon.alt = '';
            var info = global.document.createElement('div');
            var name = global.document.createElement('p');
            name.className = 'mi-app__list-name';
            name.textContent = entry.name;
            var desc = global.document.createElement('p');
            desc.className = 'mi-app__list-desc';
            desc.textContent = entry.desc;
            info.appendChild(name);
            info.appendChild(desc);
            row.appendChild(icon);
            row.appendChild(info);
            card.appendChild(row);
            card.appendChild(createPkgActionButton(entry, installed[entry.id], storeApi));
            grid.appendChild(card);
        }
    }

    function loadInstalledState(catalog, storeApi, registryId) {
        var installed = {};
        var ci;
        for (ci = 0; ci < catalog.length; ci += 1) {
            if (catalog[ci].defaultInstalled) {
                installed[catalog[ci].id] = true;
            }
        }
        if (storeApi && typeof storeApi.loadStoreInstalledMeta === 'function') {
            var meta = storeApi.loadStoreInstalledMeta(registryId);
            var ids = meta.appIds || [];
            var ii;
            for (ii = 0; ii < ids.length; ii += 1) {
                installed[ids[ii]] = true;
                var storeEntry = storeApi.getStoreAppEntry(ids[ii]);
                if (storeEntry && storeEntry.storeSlot) {
                    installed[storeEntry.storeSlot] = true;
                }
                if (storeEntry && storeEntry.slot) {
                    installed[storeEntry.slot] = true;
                }
            }
        }
        return installed;
    }

    var CAT_LABELS = {
        home: 'Accueil',
        all: 'Tous les logiciels',
        flatpak: 'Flatpak',
        internet: 'Internet',
        office: 'Bureautique',
        graphics: 'Graphisme',
        games: 'Jeux',
        multimedia: 'Multimédia',
        education: 'Éducation',
        accessories: 'Accessoires',
        installed: 'Installés',
        development: 'Développement'
    };

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'mintinstall') {
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

    function showPage(root, pageId) {
        var pages = root.querySelectorAll('[data-mi-page]');
        var pi;
        for (pi = 0; pi < pages.length; pi += 1) {
            var page = pages[pi];
            if (page.getAttribute('data-mi-page') === pageId) {
                page.removeAttribute('hidden');
            } else {
                page.setAttribute('hidden', 'hidden');
            }
        }
    }

    function setActiveCategory(root, catId) {
        var buttons = root.querySelectorAll('[data-mi-cat]');
        var bi;
        for (bi = 0; bi < buttons.length; bi += 1) {
            var btn = buttons[bi];
            if (btn.getAttribute('data-mi-cat') === catId) {
                btn.classList.add('is-active');
            } else {
                btn.classList.remove('is-active');
            }
        }
    }

    function renderListItem(entry, isInstalled, storeApi) {
        var li = global.document.createElement('li');
        li.className = 'mi-app__list-item';
        li.setAttribute('data-mi-pkg', entry.id);
        var icon = global.document.createElement('img');
        icon.className = 'mi-app__list-icon';
        icon.src = resolveIconUrl(entry.icon);
        icon.alt = '';
        var body = global.document.createElement('div');
        body.className = 'mi-app__list-body';
        var name = global.document.createElement('p');
        name.className = 'mi-app__list-name';
        name.textContent = entry.name;
        var desc = global.document.createElement('p');
        desc.className = 'mi-app__list-desc';
        desc.textContent = entry.desc;
        body.appendChild(name);
        body.appendChild(desc);
        li.appendChild(icon);
        li.appendChild(body);
        li.appendChild(createPkgActionButton(entry, isInstalled, storeApi));
        return li;
    }

    function entryName(pkgId) {
        var catalog = getCatalog();
        var ei;
        for (ei = 0; ei < catalog.length; ei += 1) {
            if (catalog[ei].id === pkgId) {
                return catalog[ei].name;
            }
        }
        return pkgId;
    }

    function catalogEntry(pkgId) {
        var catalog = getCatalog();
        var ei;
        for (ei = 0; ei < catalog.length; ei += 1) {
            if (catalog[ei].id === pkgId) {
                return catalog[ei];
            }
        }
        return null;
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

    function initMintInstallAppOnce() {
        var root = global.document.getElementById('mintInstallApp');
        if (!root || root.dataset.mintInstallInit === 'true') {
            return;
        }
        root.dataset.mintInstallInit = 'true';

        var winEl = getWindowEl(root);
        syncWindowTitle(winEl);
        var skinCatalogInit = getSkinCatalog();
        var useVm84 = isVm84Layout(skinCatalogInit);
        if (useVm84) {
            root.classList.add('mi-app--layout-vm84');
            setLayoutMode(root, 'home');
            renderHomeVm84(root);
        }

        var searchInput = root.querySelector('#mi-search');
        var listEl = root.querySelector('#mi-app-list');
        var searchListEl = root.querySelector('#mi-search-list');
        var searchEmpty = root.querySelector('#mi-search-empty');
        var listTitle = root.querySelector('#mi-list-title');
        var searchTitle = root.querySelector('#mi-search-title');
        var menuEl = root.querySelector('#mi-menu');
        var menuBtn = root.querySelector('[data-mi-action="menu"]');
        var statusEl = root.querySelector('#mi-status');
        var detailName = root.querySelector('#mi-detail-name');
        var detailDesc = root.querySelector('#mi-detail-desc');
        var detailBlurb = root.querySelector('#mi-detail-blurb');
        var detailIcon = root.querySelector('#mi-detail-icon');
        var detailInstallBtn = root.querySelector('[data-mi-detail-install]');

        var storeApi = global.CapsuleMintStore;
        var registryId = storeApi && typeof storeApi.resolveRegistryId === 'function'
            ? storeApi.resolveRegistryId()
            : 'linux-mint';
        var currentCat = 'home';
        var detailPkgId = null;
        var catalog = getCatalog();
        var installed = loadInstalledState(catalog, storeApi, registryId);
        var miBusy = false;

        renderDiscoverSection(root, installed, storeApi, currentCat);

        function setStatus(msg) {
            if (statusEl) {
                statusEl.textContent = msg || '';
            }
        }

        function setMiScenario(pkgId) {
            if (MI_SCENARIO_BY_APP[pkgId]) {
                root.dataset.miScenario = MI_SCENARIO_BY_APP[pkgId];
            }
        }

        function openPkgSlot(pkgId) {
            var openSlot = resolveOpenSlot(pkgId, storeApi);
            if (openSlot && typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink(openSlot);
                setStatus(entryName(pkgId) + ' ouvert.');
            }
        }

        function applyOpenStateToButton(btn, pkgId) {
            var openSlot = resolveOpenSlot(pkgId, storeApi);
            btn.textContent = 'Ouvrir';
            btn.disabled = false;
            btn.classList.remove('is-installing', 'is-installed');
            btn.classList.add('is-open');
            btn.removeAttribute('data-mi-install');
            btn.removeAttribute('data-mi-detail-install');
            btn.setAttribute('data-mi-open', openSlot);
        }

        function syncPkgButtons(pkgId) {
            var openSlot = resolveOpenSlot(pkgId, storeApi);
            root.querySelectorAll('[data-mi-install="' + pkgId + '"]').forEach(function syncInstallBtn(btn) {
                applyOpenStateToButton(btn, pkgId);
            });
            root.querySelectorAll('[data-mi-open="' + openSlot + '"]').forEach(function noop() {
                /* déjà ouvert */
            });
            if (detailPkgId === pkgId) {
                syncDetailInstallBtn(pkgId);
            }
        }

        function finishInstall(pkgId) {
            installed[pkgId] = true;
            var openSlot = resolveOpenSlot(pkgId, storeApi);
            installed[openSlot] = true;
            syncPkgButtons(pkgId);
            setStatus(entryName(pkgId) + ' installé.');
            setMiScenario(pkgId);
            root.dataset.miInstalling = 'false';
            if (storeApi && typeof storeApi.recordStoreInstall === 'function') {
                storeApi.recordStoreInstall(registryId, pkgId, 'apt');
            }
            openDetail(pkgId);
            renderDiscoverSection(root, installed, storeApi, currentCat);
            if (currentCat !== 'home' && currentCat !== 'installed') {
                renderCategoryList(currentCat);
            }
            if (typeof global.document !== 'undefined' && typeof global.document.dispatchEvent === 'function') {
                var storeEntry = storeApi && typeof storeApi.getStoreAppEntry === 'function'
                    ? storeApi.getStoreAppEntry(pkgId)
                    : null;
                var installSlot = storeEntry && storeEntry.slot ? storeEntry.slot : pkgId;
                var installStoreSlot = storeEntry && storeEntry.storeSlot ? storeEntry.storeSlot : installSlot;
                global.document.dispatchEvent(new CustomEvent('capsule:store-app-installed', {
                    detail: {
                        appId: pkgId,
                        slot: installSlot,
                        storeSlot: installStoreSlot,
                        registryId: registryId,
                        source: 'apt'
                    }
                }));
            }
        }

        function runInstallSimulation(pkgId, btn) {
            if (miBusy || installed[pkgId]) {
                return;
            }
            var steps = [
                { text: 'Préparation…', ms: 350 },
                { text: 'Téléchargement…', ms: 500 },
                { text: 'Installation…', ms: 600 },
                { text: 'Finalisation…', ms: 450 }
            ];
            miBusy = true;
            root.dataset.miInstalling = 'true';
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Installation…';
                btn.classList.add('is-installing');
            }
            var idx = 0;
            function nextStep() {
                if (idx >= steps.length) {
                    miBusy = false;
                    finishInstall(pkgId);
                    return;
                }
                var step = steps[idx];
                if (btn) {
                    btn.textContent = step.text.indexOf('Installation') === 0 ? 'Installation…' : step.text;
                }
                setStatus(step.text + ' — ' + entryName(pkgId));
                idx += 1;
                global.setTimeout(nextStep, step.ms);
            }
            global.setTimeout(nextStep, steps[0].ms);
        }

        function handleInstallOrOpen(pkgId, btn) {
            if (installed[pkgId]) {
                openPkgSlot(pkgId);
                return;
            }
            runInstallSimulation(pkgId, btn);
        }

        function filterCatalog(catId) {
            var activeCatalog = getCatalog();
            if (catId === 'all' || catId === 'flatpak') {
                return activeCatalog.slice();
            }
            if (catId === 'installed') {
                var out = [];
                var ci;
                for (ci = 0; ci < activeCatalog.length; ci += 1) {
                    if (installed[activeCatalog[ci].id]) {
                        out.push(activeCatalog[ci]);
                    }
                }
                return out;
            }
            var filtered = [];
            var fi;
            for (fi = 0; fi < activeCatalog.length; fi += 1) {
                if (activeCatalog[fi].cat === catId) {
                    filtered.push(activeCatalog[fi]);
                }
            }
            return filtered;
        }

        function renderCategoryList(catId) {
            if (!listEl || !listTitle) {
                return;
            }
            var label = CAT_LABELS[catId] || catId;
            listTitle.textContent = label;
            listEl.innerHTML = '';
            renderDiscoverSection(root, installed, storeApi, catId);
            var items = filterCatalog(catId);
            var ii;
            for (ii = 0; ii < items.length; ii += 1) {
                listEl.appendChild(renderListItem(items[ii], installed[items[ii].id], storeApi));
            }
            showPage(root, 'list');
        }

        function onCategoryClick(catId) {
            currentCat = catId;
            setActiveCategory(root, catId);
            if (catId === 'home') {
                if (useVm84) {
                    setLayoutMode(root, 'home');
                    renderHomeVm84(root);
                }
                showPage(root, 'home');
                return;
            }
            if (useVm84) {
                setLayoutMode(root, 'browse');
            }
            renderCategoryList(catId);
        }

        function runSearch(query) {
            var q = (query || '').trim().toLowerCase();
            if (!searchListEl || !searchEmpty || !searchTitle) {
                return;
            }
            searchListEl.innerHTML = '';
            if (!q) {
                searchEmpty.setAttribute('hidden', 'hidden');
                onCategoryClick(currentCat);
                return;
            }
            showPage(root, 'search');
            searchTitle.textContent = 'Résultats pour « ' + query.trim() + ' »';
            var activeCatalog = getCatalog();
            var matches = [];
            var si;
            for (si = 0; si < activeCatalog.length; si += 1) {
                var entry = activeCatalog[si];
                if (entry.name.toLowerCase().indexOf(q) !== -1
                    || entry.desc.toLowerCase().indexOf(q) !== -1) {
                    matches.push(entry);
                }
            }
            if (!matches.length) {
                searchEmpty.removeAttribute('hidden');
                return;
            }
            searchEmpty.setAttribute('hidden', 'hidden');
            var mi;
            for (mi = 0; mi < matches.length; mi += 1) {
                searchListEl.appendChild(renderListItem(matches[mi], installed[matches[mi].id], storeApi));
            }
        }

        function syncDetailInstallBtn(pkgId) {
            if (!detailInstallBtn) {
                return;
            }
            detailInstallBtn.classList.remove('is-installing', 'is-installed', 'is-open');
            detailInstallBtn.disabled = false;
            if (installed[pkgId]) {
                applyOpenStateToButton(detailInstallBtn, pkgId);
                return;
            }
            detailInstallBtn.textContent = 'Installer';
            detailInstallBtn.removeAttribute('data-mi-open');
            detailInstallBtn.setAttribute('data-mi-detail-install', pkgId);
        }

        function openDetail(pkgId) {
            var entry = catalogEntry(pkgId);
            if (!entry) {
                return;
            }
            detailPkgId = pkgId;
            if (detailName) {
                detailName.textContent = entry.name;
            }
            if (detailDesc) {
                detailDesc.textContent = entry.desc;
            }
            if (detailBlurb) {
                detailBlurb.textContent = entry.desc + ' — paquet simulé pour le clone pédagogique.';
            }
            if (detailIcon) {
                detailIcon.src = resolveIconUrl(entry.icon);
            }
            syncDetailInstallBtn(pkgId);
            showPage(root, 'detail');
        }

        root.addEventListener('click', function onClick(event) {
            var target = event.target;
            if (!target || !target.closest) {
                return;
            }
            var homeCatBtn = target.closest('[data-mi-home-cat]');
            if (homeCatBtn) {
                onCategoryClick(homeCatBtn.getAttribute('data-mi-home-cat'));
                return;
            }
            var catBtn = target.closest('[data-mi-cat]');
            if (catBtn) {
                onCategoryClick(catBtn.getAttribute('data-mi-cat'));
                return;
            }
            var backBtn = target.closest('[data-mi-back]');
            if (backBtn) {
                onCategoryClick(currentCat);
                return;
            }
            var openBtn = target.closest('[data-mi-open]');
            if (openBtn && !openBtn.disabled) {
                var openSlot = openBtn.getAttribute('data-mi-open');
                if (openSlot && typeof global.openWindowByDataLink === 'function') {
                    global.openWindowByDataLink(openSlot);
                    setStatus('Application ouverte.');
                }
                return;
            }
            var listOpen = target.closest('.mi-app__list-item');
            if (listOpen && !target.closest('[data-mi-install]') && !target.closest('[data-mi-open]')) {
                openDetail(listOpen.getAttribute('data-mi-pkg'));
                return;
            }
            var discoverCard = target.closest('.mi-app__discover-card');
            if (discoverCard && !target.closest('[data-mi-install]') && !target.closest('[data-mi-open]')) {
                openDetail(discoverCard.getAttribute('data-mi-pkg'));
                return;
            }
            var topRatedCard = target.closest('.mi-app__top-rated-card');
            if (topRatedCard && topRatedCard.getAttribute('data-mi-pkg')) {
                openDetail(topRatedCard.getAttribute('data-mi-pkg'));
                return;
            }
            var detailInstall = target.closest('[data-mi-detail-install]');
            if (detailInstall && !detailInstall.disabled) {
                handleInstallOrOpen(detailInstall.getAttribute('data-mi-detail-install'), detailInstall);
                return;
            }
            var installBtn = target.closest('[data-mi-install]');
            if (installBtn && !installBtn.disabled) {
                handleInstallOrOpen(installBtn.getAttribute('data-mi-install'), installBtn);
                return;
            }
            if (menuBtn && target.closest('[data-mi-action="menu"]')) {
                var open = menuEl && menuEl.hidden;
                if (menuEl) {
                    if (open) {
                        menuEl.removeAttribute('hidden');
                    } else {
                        menuEl.setAttribute('hidden', 'hidden');
                    }
                }
                if (menuBtn) {
                    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
                }
                return;
            }
            if (menuEl && !target.closest('#mi-menu') && !target.closest('[data-mi-action="menu"]')) {
                menuEl.setAttribute('hidden', 'hidden');
                if (menuBtn) {
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });

        if (searchInput) {
            searchInput.addEventListener('input', function onSearchInput() {
                runSearch(searchInput.value);
            });
        }

        global.document.addEventListener('keydown', function onMintInstallKeydown(event) {
            if (!root || !root.isConnected) {
                return;
            }
            var activeWin = getWindowEl(root);
            if (!activeWin || activeWin.style.display === 'none') {
                return;
            }
            if (event.ctrlKey && (event.key === 'f' || event.key === 'F')) {
                event.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            if (event.key === 'Escape' && menuEl && !menuEl.hidden) {
                menuEl.setAttribute('hidden', 'hidden');
                if (menuBtn) {
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });

        showPage(root, 'home');
        setActiveCategory(root, 'home');
    }

    global.initMintInstallApp = function initMintInstallApp() {
        initMintInstallAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
