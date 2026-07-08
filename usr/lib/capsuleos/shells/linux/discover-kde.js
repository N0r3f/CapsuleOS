/**
 * Discover KDE Neon — navigation, catalogue, titre fenêtre, layout plein écran.
 */
(function initDiscoverNeon(rootGlobal) {
    'use strict';

    const env = rootGlobal || (typeof globalThis !== 'undefined' ? globalThis : window);
    const CATALOG_URL = env.CAPSULE_DISCOVER_CATALOG_URL || './content/discover-catalog.json';
    const DISCOVER_ASSET_BASE = './assets/images/vendors/neon/discover/';
    const PANEL_ASSET_BASE = './assets/images/vendors/neon/panel/';
    const STORE_SECTION_ID = 'capsule-discover';
    const STORE_SECTION_TITLE = 'À découvrir';

    function resolveAssetUrl(path) {
        if (!path) {
            return '';
        }
        if (typeof resolveCapsuleResourceUrl === 'function') {
            return resolveCapsuleResourceUrl(path);
        }
        return path;
    }

    function resolveIconUrl(app) {
        if (!app || !app.icon) {
            return '';
        }
        if (app.iconBase === 'panel' || app.icon.indexOf('../panel/') === 0) {
            const name = app.icon.replace(/^\.\.\/panel\//, '');
            return resolveAssetUrl(PANEL_ASSET_BASE + name);
        }
        return resolveAssetUrl(DISCOVER_ASSET_BASE + app.icon);
    }

    function resolveRegistryId() {
        if (typeof window !== 'undefined' && window.CAPSULE_SKIN_PROFILE_ID) {
            return window.CAPSULE_SKIN_PROFILE_ID;
        }
        const bodyId = typeof document !== 'undefined' && document.body ? document.body.id : '';
        if (bodyId === 'kde-neon') {
            return 'linux-kde-neon';
        }
        if (bodyId === 'opensuse') {
            return 'linux-opensuse';
        }
        return '';
    }

    function storeInstalledIds(registryId) {
        if (typeof window.CapsuleGnomeStore === 'undefined'
            || typeof window.CapsuleGnomeStore.loadStoreInstalledMeta !== 'function') {
            return [];
        }
        const meta = window.CapsuleGnomeStore.loadStoreInstalledMeta(registryId);
        return meta && Array.isArray(meta.appIds) ? meta.appIds : [];
    }

    function getStoreDiscoverApps() {
        const registryId = resolveRegistryId();
        const storeList = typeof window !== 'undefined' && window.CAPSULE_STORE_APPS_BY_REGISTRY
            ? window.CAPSULE_STORE_APPS_BY_REGISTRY[registryId]
            : null;
        if (!registryId || !storeList || !storeList.length) {
            return [];
        }
        const installed = new Set(storeInstalledIds(registryId));
        const apps = [];
        for (let i = 0; i < storeList.length; i += 1) {
            const entry = storeList[i];
            if (!entry || !entry.id || installed.has(entry.id)) {
                continue;
            }
            apps.push({
                id: entry.id,
                name: entry.title || entry.id,
                desc: entry.sub || entry.desc || '',
                iconClass: entry.iconClass || '',
                storeEntry: entry,
                storeInstallable: entry.storeInstallable !== false,
            });
        }
        return apps;
    }

    function notifyStoreInstall(app) {
        if (!app || !app.storeEntry || typeof window.CapsuleGnomeStore === 'undefined') {
            return;
        }
        const registryId = resolveRegistryId();
        const entry = app.storeEntry;
        const source = entry.source || 'apt';
        if (typeof window.CapsuleGnomeStore.recordStoreInstall === 'function') {
            window.CapsuleGnomeStore.recordStoreInstall(registryId, entry.id, source);
        }
        if (typeof document === 'undefined' || typeof document.dispatchEvent !== 'function') {
            return;
        }
        const slot = entry.slot || entry.postInstallSlot || '';
        document.dispatchEvent(new CustomEvent('capsule:store-app-installed', {
            detail: {
                appId: entry.id,
                slot: slot,
                storeSlot: entry.storeSlot || '',
                registryId: registryId,
                source: source,
                suiteInstall: !!(entry.relatedSlots && entry.relatedSlots.length),
            },
        }));
    }

    let catalogPromise = null;
    let catalogCache = null;
    let state = {
        view: 'home',
        maximized: false,
        categoryId: 'all',
        searchQuery: '',
    };

    function matchesSearch(app, query) {
        if (!query) {
            return true;
        }
        const hay = `${app.name || ''} ${app.desc || ''}`.toLowerCase();
        return hay.indexOf(query) !== -1;
    }

    function filterAppsBySearch(apps, query) {
        if (!query || !Array.isArray(apps)) {
            return apps || [];
        }
        return apps.filter((app) => matchesSearch(app, query));
    }

    const DISCOVER_CAT_IDS = [
        'all', 'accessibility', 'office', 'development', 'education', 'graphics',
        'internet', 'games', 'multimedia', 'science', 'system', 'utilities', 'addons',
    ];

    function findRoot() {
        return document.getElementById('updateManagerApp');
    }

    function findWindowShell() {
        const root = findRoot();
        return root ? root.closest('.windowElement[data-link="update_manager"]') : null;
    }

    function loadCatalog() {
        if (!catalogPromise) {
            catalogPromise = fetch(CATALOG_URL, { cache: 'no-store' })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    catalogCache = data;
                    return data;
                })
                .catch((error) => {
                    console.warn('Discover Neon: catalogue indisponible', error);
                    catalogCache = null;
                    return null;
                });
        }
        return catalogPromise;
    }

    function setWindowTitle(title) {
        const shell = findWindowShell();
        const titleEl = shell ? shell.querySelector('#windowTitle') : null;
        if (titleEl && title) {
            titleEl.textContent = title;
        }
        if (typeof window !== 'undefined' && window.CAPSULE_WINDOW_TITLES) {
            window.CAPSULE_WINDOW_TITLES.update_manager = title;
        }
    }

    function renderDiscoverIcon(app, className, size) {
        const dim = size || 48;
        const classes = className || 'kde-discover-card__icon';
        if (app && app.iconClass) {
            return `<span class="${classes} gnome-software__cardicon ${app.iconClass}" style="width:${dim}px;height:${dim}px" role="img" aria-hidden="true"></span>`;
        }
        const iconUrl = resolveIconUrl(app);
        return `<img class="${classes}" src="${iconUrl}" alt="" width="${dim}" height="${dim}">`;
    }

    function renderAppCard(app) {
        return `
            <article class="kde-discover-card" role="listitem" data-discover-app="${app.id || ''}">
                ${renderDiscoverIcon(app, 'kde-discover-card__icon', 48)}
                <div class="kde-discover-card__text">
                    <span class="kde-discover-card__name">${app.name || ''}</span>
                    <span class="kde-discover-card__desc">${app.desc || ''}</span>
                </div>
            </article>
        `;
    }

    function formatInstalledSizeKb(kb) {
        const value = Number(kb) || 0;
        if (value <= 0) {
            return '';
        }
        if (value >= 1024) {
            return `${(value / 1024).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio`;
        }
        return `${Math.round(value).toLocaleString('fr-FR')} Kio`;
    }

    function resolveInstalledSizeLabel(app) {
        if (app && app.size) {
            return app.size;
        }
        if (app && app.sizeKb) {
            return formatInstalledSizeKb(app.sizeKb);
        }
        return '';
    }

    function resolveInstalledCount(catalog, visibleCount) {
        const meta = catalog && catalog.installedMeta ? catalog.installedMeta : null;
        const query = (state.searchQuery || '').trim();
        if (query) {
            return visibleCount;
        }
        if (meta && typeof meta.totalCount === 'number') {
            return meta.totalCount;
        }
        return visibleCount;
    }

    function renderInstalledCard(app) {
        const iconUrl = resolveIconUrl(app);
        const sizeLabel = resolveInstalledSizeLabel(app);
        const sizeMarkup = sizeLabel
            ? `<span class="kde-discover-card--installed__size">${sizeLabel}</span>`
            : '';
        return `
            <article class="kde-discover-card kde-discover-card--installed" role="listitem" data-discover-app="${app.id || ''}">
                <img class="kde-discover-card__icon" src="${iconUrl}" alt="" width="48" height="48">
                <div class="kde-discover-card__text">
                    <span class="kde-discover-card__name">${app.name || ''}</span>
                    <span class="kde-discover-card__desc">${app.desc || ''}</span>
                </div>
                <button type="button" class="kde-discover-card--installed__remove" aria-label="Supprimer ${app.name || ''}" title="Supprimer">
                    <span class="kde-discover-card--installed__remove-icon" aria-hidden="true"></span>
                </button>
                ${sizeMarkup}
            </article>
        `;
    }

    function parseUpdateSizeKb(sizeLabel) {
        if (!sizeLabel) {
            return 0;
        }
        const kio = String(sizeLabel).match(/([\d,]+)\s*Kio/i);
        if (kio) {
            return parseFloat(kio[1].replace(',', '.')) || 0;
        }
        const mio = String(sizeLabel).match(/([\d,]+)\s*Mio/i);
        if (mio) {
            return (parseFloat(mio[1].replace(',', '.')) || 0) * 1024;
        }
        return 0;
    }

    function formatTotalUpdateSize(kbTotal) {
        if (!kbTotal || kbTotal <= 0) {
            return '0 Kio';
        }
        if (kbTotal >= 1024) {
            return `${(kbTotal / 1024).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio`;
        }
        return `${Math.round(kbTotal).toLocaleString('fr-FR')} Kio`;
    }

    function renderUpdateRow(item) {
        const iconUrl = resolveIconUrl(item);
        const iconMarkup = iconUrl
            ? `<img class="kde-updates__row-icon" src="${iconUrl}" alt="" width="22" height="22">`
            : '<span class="kde-updates__row-icon kde-updates__row-icon--fallback" aria-hidden="true"></span>';
        return `
            <div class="kde-updates__row" role="listitem" data-discover-update="${item.id || ''}">
                <input type="checkbox" class="kde-updates__row-check" checked aria-label="Sélectionner ${item.name}">
                ${iconMarkup}
                <div class="kde-updates__row-text">
                    <span class="kde-updates__row-name">${item.name}</span>
                    <span class="kde-updates__row-sub">${item.from} → ${item.to}</span>
                </div>
                <span class="kde-updates__row-size">${item.size || ''}</span>
            </div>
        `;
    }

    function syncUpdatesChrome(root, catalog) {
        const updates = catalog && Array.isArray(catalog.updates) ? catalog.updates : [];
        const count = updates.length;
        const badge = root.querySelector('[data-discover-updates-badge]');
        if (badge) {
            badge.textContent = String(count);
            badge.hidden = count === 0;
            badge.setAttribute('aria-label', count === 1 ? '1 mise à jour' : `${count} mises à jour`);
        }

        const listSection = root.querySelector('[data-discover-updates-list]');
        const rowsMount = root.querySelector('[data-discover-updates-mount]');
        const emptyEl = root.querySelector('[data-discover-updates-empty]');
        const footer = root.querySelector('[data-discover-updates-footer]');
        const sectionTitle = root.querySelector('[data-discover-updates-section]');
        const meta = catalog && catalog.updatesMeta ? catalog.updatesMeta : null;

        if (sectionTitle && meta && meta.sectionTitle) {
            sectionTitle.textContent = meta.sectionTitle;
        }

        const hasUpdates = count > 0;
        const trayBtn = document.querySelector('[data-update-manager-tray]');
        if (trayBtn) {
            trayBtn.dataset.hasUpdates = hasUpdates ? 'true' : 'false';
            trayBtn.setAttribute(
                'aria-label',
                hasUpdates ? 'Mises à jour disponibles' : 'Aucune mise à jour',
            );
        }
        if (sectionTitle) {
            sectionTitle.hidden = !hasUpdates;
        }
        if (rowsMount) {
            rowsMount.hidden = !hasUpdates;
        }
        if (emptyEl) {
            emptyEl.hidden = hasUpdates;
        }
        if (footer) {
            footer.hidden = !hasUpdates;
        }

        root.querySelectorAll('[data-discover-updates-select]').forEach((btn) => {
            btn.hidden = count <= 1;
        });
    }

    function findAppById(catalog, appId) {
        if (!catalog || !appId) {
            return null;
        }
        let app = null;
        (catalog.homeSections || []).some((section) => {
            return (section.apps || []).some((entry) => {
                if (entry.id === appId) {
                    app = entry;
                    return true;
                }
                return false;
            });
        });
        if (!app) {
            const storeApps = getStoreDiscoverApps();
            for (let i = 0; i < storeApps.length; i += 1) {
                if (storeApps[i].id === appId) {
                    app = storeApps[i];
                    break;
                }
            }
        }
        if (!app && Array.isArray(catalog.installed)) {
            catalog.installed.some((entry) => {
                if (entry.id === appId) {
                    app = entry;
                    return true;
                }
                return false;
            });
        }
        return app;
    }

    function ensureAppDetailPanel(root) {
        let panel = root.querySelector('[data-discover-app-detail]');
        if (panel) {
            return panel;
        }
        panel = document.createElement('main');
        panel.className = 'kde-updates__main kde-discover-panel kde-discover-panel--app-detail';
        panel.dataset.discoverAppDetail = 'true';
        panel.hidden = true;
        panel.setAttribute('aria-label', 'Fiche application');
        const panels = root.querySelector('.kde-discover-panels');
        if (panels) {
            panels.appendChild(panel);
        }
        return panel;
    }

    function resolveScreenshotUrl(shot) {
        if (!shot || !shot.asset) {
            return '';
        }
        return resolveAssetUrl(DISCOVER_ASSET_BASE + shot.asset);
    }

    function renderRating(meta) {
        const rating = Number(meta.rating);
        if (!rating || Number.isNaN(rating)) {
            return '';
        }
        const full = Math.max(0, Math.min(5, Math.floor(rating)));
        const stars = `${'★'.repeat(full)}${'☆'.repeat(5 - full)}`;
        const count = meta.ratingCount ? `<span class="kde-discover-app-detail__rating-count">${meta.ratingCount}</span>` : '';
        return `<p class="kde-discover-app-detail__rating" aria-label="${rating} sur 5">${stars}${count}</p>`;
    }

    function renderScreenshotSlides(screenshots) {
        if (!Array.isArray(screenshots) || !screenshots.length) {
            return '';
        }
        const slides = screenshots.map((shot, index) => {
            const src = resolveScreenshotUrl(shot);
            const label = shot.label || shot.id || `Capture ${index + 1}`;
            if (!src) {
                const tone = shot.tone || '#31363b';
                return `<figure class="kde-discover-app-detail__slide" data-discover-slide="${index}"${index === 0 ? ' data-active="true"' : ' hidden'}>
                    <span class="kde-discover-app-detail__shot-frame" style="--discover-shot-tone: ${tone}" aria-hidden="true"></span>
                    <figcaption class="kde-discover-app-detail__shot-label">${label}</figcaption>
                </figure>`;
            }
            return `<figure class="kde-discover-app-detail__slide" data-discover-slide="${index}"${index === 0 ? ' data-active="true"' : ' hidden'}>
                <img class="kde-discover-app-detail__shot-img" src="${src}" alt="${label}" loading="lazy">
            </figure>`;
        }).join('');
        const dots = screenshots.map((shot, index) => (
            `<button type="button" class="kde-discover-app-detail__carousel-dot${index === 0 ? ' is-active' : ''}" data-discover-carousel-dot="${index}" aria-label="Capture ${index + 1}"></button>`
        )).join('');
        return `
            <section class="kde-discover-app-detail__carousel" aria-label="Captures d'écran" data-discover-carousel>
                <div class="kde-discover-app-detail__carousel-stage">
                    <div class="kde-discover-app-detail__carousel-viewport">
                        ${slides}
                    </div>
                    <button type="button" class="kde-discover-app-detail__carousel-btn kde-discover-app-detail__carousel-btn--prev" data-discover-carousel-prev aria-label="Capture précédente" hidden>‹</button>
                    <button type="button" class="kde-discover-app-detail__carousel-btn kde-discover-app-detail__carousel-btn--next" data-discover-carousel-next aria-label="Capture suivante">›</button>
                    <div class="kde-discover-app-detail__carousel-dots" role="tablist" aria-label="Position du carrousel">${dots}</div>
                </div>
            </section>`;
    }

    function bindAppDetailCarousel(root) {
        const carousel = root.querySelector('[data-discover-carousel]');
        if (!carousel || carousel.dataset.bound === 'true') {
            return;
        }
        const slides = [...carousel.querySelectorAll('[data-discover-slide]')];
        const dots = [...carousel.querySelectorAll('[data-discover-carousel-dot]')];
        const prevBtn = carousel.querySelector('[data-discover-carousel-prev]');
        const nextBtn = carousel.querySelector('[data-discover-carousel-next]');
        if (slides.length < 2) {
            if (nextBtn) {
                nextBtn.hidden = true;
            }
            carousel.dataset.bound = 'true';
            return;
        }
        let index = 0;
        const showSlide = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                const active = slideIndex === index;
                slide.hidden = !active;
                slide.dataset.active = active ? 'true' : 'false';
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
            if (prevBtn) {
                prevBtn.hidden = index === 0;
            }
            if (nextBtn) {
                nextBtn.hidden = index === slides.length - 1;
            }
        };
        if (prevBtn) {
            prevBtn.addEventListener('click', () => showSlide(index - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => showSlide(index + 1));
        }
        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const target = Number(dot.getAttribute('data-discover-carousel-dot'));
                if (!Number.isNaN(target)) {
                    showSlide(target);
                }
            });
        });
        showSlide(0);
        carousel.dataset.bound = 'true';
    }

    function isForceUninstalled(root, appId) {
        if (!root || !appId) {
            return false;
        }
        const forced = (root.dataset.discoverForceUninstalled || '')
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean);
        return forced.includes(appId);
    }

    function isInstalledApp(catalog, app, root) {
        if (!catalog || !app || !app.id) {
            return false;
        }
        if (root && isForceUninstalled(root, app.id)) {
            return false;
        }
        if (catalog.appDetails && catalog.appDetails[app.id] && catalog.appDetails[app.id].installed) {
            return true;
        }
        return Array.isArray(catalog.installed)
            && catalog.installed.some((entry) => entry.id === app.id);
    }

    function markAppInstalledInCatalog(catalog, app) {
        if (!catalog || !app || !app.id) {
            return;
        }
        if (!catalog.appDetails) {
            catalog.appDetails = {};
        }
        if (!catalog.appDetails[app.id]) {
            catalog.appDetails[app.id] = {};
        }
        catalog.appDetails[app.id].installed = true;
        catalog.appDetails[app.id].primaryAction = 'Lancer';
        if (!Array.isArray(catalog.installed)) {
            catalog.installed = [];
        }
        const alreadyListed = catalog.installed.some((entry) => entry && entry.id === app.id);
        if (!alreadyListed) {
            catalog.installed.push({
                id: app.id,
                name: app.name || app.id,
                desc: app.desc || '',
                icon: app.icon || `${app.id}.png`,
                sizeKb: catalog.appDetails[app.id].sizeKb || 0,
            });
        }
        if (catalog.installedMeta && typeof catalog.installedMeta.totalCount === 'number') {
            catalog.installedMeta.totalCount += 1;
        }
    }

    function renderDescriptionBlock(meta, summary) {
        const title = meta.summary || summary || '';
        const body = meta.description || title;
        const chunks = String(body).split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
        const parts = chunks.length ? chunks : [String(body).trim()];
        const blocks = [];
        let bulletItems = [];
        const flushBullets = () => {
            if (!bulletItems.length) {
                return;
            }
            blocks.push(
                `<ul class="kde-discover-app-detail__description-list">${bulletItems.map((item) => (
                    `<li class="kde-discover-app-detail__description-list-item">${item}</li>`
                )).join('')}</ul>`,
            );
            bulletItems = [];
        };
        parts.forEach((part) => {
            if (/^•\s*/.test(part)) {
                bulletItems.push(part.replace(/^•\s*/, ''));
                return;
            }
            flushBullets();
            if (/^Fonctionnalités\s*:/i.test(part)) {
                blocks.push(`<h3 class="kde-discover-app-detail__description-heading">${part}</h3>`);
                return;
            }
            blocks.push(`<p class="kde-discover-app-detail__description-text">${part}</p>`);
        });
        flushBullets();
        return `
                <section class="kde-discover-app-detail__description">
                    <h2 class="kde-discover-app-detail__description-title">${title}</h2>
                    ${blocks.join('')}
                </section>`;
    }

    function renderAppDetailToolbarActions(meta, app, installed, primaryAction, primaryDataAttr) {
        const originLabel = meta.origin ? `De ${meta.origin}` : '';
        const actionBtn = (kind, label, extraClass, dataAttr) => (
            `<button type="button" class="kde-discover-app-detail__header-action kde-discover-app-detail__header-action--${kind}${extraClass ? ` ${extraClass}` : ''}" ${dataAttr || ''}>
                <span class="kde-discover-app-detail__header-action-icon kde-discover-app-detail__header-action-icon--${kind}" aria-hidden="true"></span>
                <span>${label}</span>
            </button>`
        );
        const originBtn = originLabel
            ? `<button type="button" class="kde-discover-app-detail__header-action kde-discover-app-detail__header-action--origin" disabled aria-disabled="true">
                <span>${originLabel}</span>
                <span class="kde-discover-app-detail__header-action-caret" aria-hidden="true"></span>
            </button>`
            : '';
        return `
            <header class="kde-discover-app-detail__header">
                <button type="button" class="kde-discover-app-detail__header-back" data-discover-app-back aria-label="Retour">
                    <span class="kde-discover-app-detail__header-back-icon" aria-hidden="true"></span>
                </button>
                <div class="kde-discover-app-detail__header-actions">
                    ${actionBtn('share', 'Partager', '', 'data-discover-app-action="share"')}
                    ${actionBtn('remove', 'Supprimer', '', 'data-discover-app-action="remove"')}
                    ${actionBtn('launch', primaryAction, 'kde-discover-app-detail__header-action--primary', primaryDataAttr)}
                    ${originBtn}
                </div>
            </header>`;
    }

    function renderAppDetail(root, catalog, app) {
        const panel = ensureAppDetailPanel(root);
        const storeMeta = app && app.storeEntry ? {
            summary: app.storeEntry.sub || app.desc || '',
            description: app.storeEntry.desc || app.desc || '',
            version: app.storeEntry.version || '',
            size: app.storeEntry.size || '',
            license: app.storeEntry.source === 'flatpak' ? 'Flathub' : 'Ubuntu',
            origin: app.storeEntry.source === 'flatpak' ? 'Flathub' : 'Ubuntu noble',
        } : null;
        const meta = storeMeta || (catalog && catalog.appDetails && catalog.appDetails[app.id]) || {};
        const summary = meta.summary || app.desc || '';
        const screenshots = Array.isArray(meta.screenshots) ? meta.screenshots : [];
        const installed = isInstalledApp(catalog, app, root);
        const primaryAction = meta.primaryAction || (installed ? 'Lancer' : 'Installer');
        const primaryDataAttr = installed
            ? `data-discover-app-launch="${app.id || ''}"`
            : `data-discover-app-install="${app.id || ''}"`;
        const developerLine = meta.developer
            ? `<p class="kde-discover-app-detail__developer">${meta.developer}${meta.verifiedDeveloper ? ' <span class="kde-discover-app-detail__verified" aria-label="Développeur vérifié">✓</span>' : ''}</p>`
            : '';
        const facts = [
            meta.version ? `<div><dt>Version</dt><dd>${meta.version}</dd></div>` : '',
            meta.size ? `<div><dt>Taille</dt><dd>${meta.size}</dd></div>` : '',
            meta.license ? `<div><dt>Licences</dt><dd><span class="kde-discover-app-detail__license">${meta.license}</span></dd></div>` : '',
            meta.ageRating ? `<div><dt>Âges</dt><dd>${meta.ageRating}</dd></div>` : '',
        ].filter(Boolean).join('');
        panel.innerHTML = `
            ${renderAppDetailToolbarActions(meta, app, installed, primaryAction, primaryDataAttr)}
            <article class="kde-discover-app-detail__body">
                <div class="kde-discover-app-detail__top">
                    <div class="kde-discover-app-detail__identity">
                        ${renderDiscoverIcon(app, 'kde-discover-app-detail__icon', 96)}
                        <div class="kde-discover-app-detail__identity-text">
                            <h1 class="kde-discover-app-detail__name">${app.name || ''}</h1>
                            ${developerLine}
                            ${renderRating(meta)}
                        </div>
                    </div>
                    ${facts ? `<dl class="kde-discover-app-detail__facts">${facts}</dl>` : ''}
                </div>
                ${renderScreenshotSlides(screenshots)}
                ${renderDescriptionBlock(meta, summary)}
                <p class="kde-discover-app-detail__status" data-discover-app-status hidden role="status"></p>
            </article>
        `;
        bindAppDetailCarousel(root);
    }

    function showAppDetail(root, catalog, appId) {
        const app = findAppById(catalog, appId);
        if (!app) {
            return;
        }
        if (state.view !== 'app-detail') {
            state.detailReturnView = state.view || 'home';
        }
        state.detailAppId = appId;
        state.view = 'app-detail';
        root.querySelectorAll('[data-discover-panel]').forEach((panelEl) => {
            panelEl.hidden = true;
        });
        renderAppDetail(root, catalog, app);
        const detailPanel = root.querySelector('[data-discover-app-detail]');
        if (detailPanel) {
            detailPanel.hidden = false;
        }
        setWindowTitle(`${app.name} — Discover`);
    }

    function closeAppDetail(root, catalog) {
        state.detailAppId = null;
        const detailPanel = root.querySelector('[data-discover-app-detail]');
        if (detailPanel) {
            detailPanel.hidden = true;
        }
        const returnView = state.detailReturnView || 'home';
        state.detailReturnView = null;
        switchView(root, catalog, returnView);
    }

    function catalogAppIndex(catalog) {
        const index = new Map();
        const add = (app) => {
            if (!app || !app.id || index.has(app.id)) {
                return;
            }
            index.set(app.id, app);
        };
        (catalog.homeSections || []).forEach((section) => {
            (section.apps || []).forEach(add);
        });
        (catalog.browseApps || []).forEach(add);
        return index;
    }

    function filterAppsForCategory(catalog, categoryId) {
        if (!catalog || categoryId === 'all') {
            return null;
        }
        const filters = catalog.categoryFilters || {};
        const spec = filters[categoryId];
        if (!spec || !Array.isArray(spec.appIds) || !spec.appIds.length) {
            return [];
        }
        const index = catalogAppIndex(catalog);
        const storeById = new Map();
        getStoreDiscoverApps().forEach((entry) => {
            if (entry && entry.id) {
                storeById.set(entry.id, entry);
            }
        });
        const apps = [];
        for (let i = 0; i < spec.appIds.length; i += 1) {
            const id = spec.appIds[i];
            const app = index.get(id) || storeById.get(id);
            if (app) {
                apps.push(app);
            }
        }
        return apps;
    }

    function renderHome(root, catalog) {
        const mount = root.querySelector('[data-discover-home-mount]');
        if (!mount || !catalog || !Array.isArray(catalog.homeSections)) {
            return;
        }

        const filteredApps = filterAppsForCategory(catalog, state.categoryId);
        const filters = catalog.categoryFilters || {};
        const catMeta = filters[state.categoryId];
        const sections = filteredApps !== null
            ? [{
                id: state.categoryId,
                title: catMeta && catMeta.label ? catMeta.label : 'Applications',
                apps: filteredApps,
            }]
            : catalog.homeSections.filter((section) => !section.hidden);

        const query = (state.searchQuery || '').trim().toLowerCase();
        const storeApps = filteredApps === null ? getStoreDiscoverApps() : [];
        const visibleSections = [];
        for (let i = 0; i < sections.length; i += 1) {
            const section = sections[i];
            const apps = filterAppsBySearch(section.apps, query);
            if (apps.length) {
                visibleSections.push({
                    id: section.id,
                    title: section.title,
                    apps,
                });
            }
        }
        if (storeApps.length && filteredApps === null) {
            const filteredStore = filterAppsBySearch(storeApps, query);
            if (filteredStore.length) {
                visibleSections.push({
                    id: STORE_SECTION_ID,
                    title: STORE_SECTION_TITLE,
                    apps: filteredStore,
                });
            }
        }

        const heading = catalog.views && catalog.views.home
            ? catalog.views.home.heading
            : 'Page d\'accueil';

        mount.innerHTML = `
            <header class="kde-discover-home__hero">
                <h1 class="kde-discover-home__title">${heading}</h1>
            </header>
            ${visibleSections.map((section) => `
                <section class="kde-discover-home__section" aria-label="${section.title}"${section.id === STORE_SECTION_ID ? ' data-discover-store-section' : ''}>
                    <h2 class="kde-discover-home__section-title">${section.title}</h2>
                    <div class="kde-discover-home__grid" role="list">
                        ${(section.apps || []).map(renderAppCard).join('')}
                    </div>
                </section>
            `).join('')}
        `;
    }

    function syncInstalledChrome(root, catalog, visibleCount) {
        const count = resolveInstalledCount(catalog, visibleCount);
        const headingText = `Installé(s) - ${count} élément${count > 1 ? 's' : ''}`;
        const installedPanel = root.querySelector('[data-discover-panel="installed"]');
        const heading = root.querySelector('[data-discover-installed-heading]')
            || (installedPanel ? installedPanel.querySelector('[data-discover-view-heading]') : null);
        if (heading) {
            heading.textContent = headingText;
        }
        const sortLabel = root.querySelector('[data-discover-installed-sort-label]');
        const sortMeta = catalog && catalog.installedMeta ? catalog.installedMeta : null;
        if (sortLabel && sortMeta && sortMeta.sortLabel) {
            sortLabel.textContent = `Tri : ${sortMeta.sortLabel}`;
        }
        const viewMeta = catalog && catalog.views && catalog.views.installed;
        if (viewMeta) {
            const suffix = viewMeta.titleSuffix || ' — Discover';
            setWindowTitle(`${headingText}${suffix}`);
        }
    }

    function renderInstalled(root, catalog) {
        const mount = root.querySelector('[data-discover-installed-mount]');
        if (!mount || !catalog || !Array.isArray(catalog.installed)) {
            return;
        }
        const query = (state.searchQuery || '').trim().toLowerCase();
        const apps = filterAppsBySearch(catalog.installed, query);
        mount.innerHTML = apps.map(renderInstalledCard).join('');
        syncInstalledChrome(root, catalog, apps.length);
    }

    function renderUpdates(root, catalog) {
        const mount = root.querySelector('[data-discover-updates-mount]');
        const totalEl = root.querySelector('[data-discover-updates-total]');
        if (!mount || !catalog || !Array.isArray(catalog.updates)) {
            return;
        }
        mount.innerHTML = catalog.updates.map(renderUpdateRow).join('');
        const totalKb = catalog.updates.reduce((sum, item) => sum + parseUpdateSizeKb(item.size), 0);
        if (totalEl) {
            totalEl.innerHTML = `Taille totale&nbsp;: ${formatTotalUpdateSize(totalKb)}`;
        }
        syncUpdatesChrome(root, catalog);
    }

    function renderConfigSourceRow(source) {
        const checked = source.checked !== false ? 'checked' : '';
        return `
            <label class="kde-discover-config__source-row" role="listitem">
                <input type="checkbox" class="kde-discover-config__check" ${checked} disabled aria-disabled="true">
                <span class="kde-discover-config__source-label">${source.label || ''}</span>
            </label>
        `;
    }

    function renderConfigSection(section) {
        const isDefault = !!section.default;
        const defaultBadge = isDefault
            ? '<span class="kde-discover-config__default-badge">Source par défaut</span>'
            : `<button type="button" class="kde-discover-config__make-default" disabled aria-disabled="true">Définir par défaut</button>`;
        const addSource = section.addSource
            ? `<button type="button" class="kde-discover-config__add-source" disabled aria-disabled="true">
                    <span class="kde-discover-config__add-source-icon" aria-hidden="true"></span>
                    <span>Ajouter une source…</span>
               </button>`
            : '';

        return `
            <section class="kde-discover-config__section" aria-label="${section.name}">
                <header class="kde-discover-config__section-head">
                    <h2 class="kde-discover-config__section-title${isDefault ? ' is-default' : ''}">${section.name}</h2>
                    <div class="kde-discover-config__section-actions">
                        ${defaultBadge}
                        ${addSource}
                    </div>
                </header>
                <div class="kde-discover-config__sources" role="list">
                    ${(section.sources || []).map(renderConfigSourceRow).join('')}
                </div>
            </section>
        `;
    }

    function renderConfig(root, catalog) {
        const mount = root.querySelector('[data-discover-config-mount]');
        const sections = catalog && Array.isArray(catalog.configSources) ? catalog.configSources : [];
        if (!mount) {
            return;
        }
        mount.innerHTML = sections.map(renderConfigSection).join('');
    }

    function renderAboutLink(link) {
        const iconUrl = resolveAssetUrl(`${DISCOVER_ASSET_BASE}${link.icon}`);
        return `
            <button type="button" class="kde-form-delegate kde-form-delegate--link" disabled aria-disabled="true">
                <span class="kde-form-delegate__icon" style="--kde-form-icon: url('${iconUrl}')" aria-hidden="true"></span>
                <span class="kde-form-delegate__label">${link.label}</span>
            </button>
        `;
    }

    function renderAboutAuthor(author) {
        const roleMarkup = author.role
            ? `<span class="kde-form-delegate__desc">${author.role}</span>`
            : '';
        return `
            <div class="kde-form-delegate kde-form-delegate--person" role="listitem">
                <div class="kde-form-delegate__person-text">
                    <span class="kde-form-delegate__label">${author.name}</span>
                    ${roleMarkup}
                </div>
                <div class="kde-form-delegate__person-actions" aria-hidden="true">
                    ${author.email ? '<span class="kde-form-delegate__mini-icon kde-form-delegate__mini-icon--mail"></span>' : ''}
                    ${author.web ? '<span class="kde-form-delegate__mini-icon kde-form-delegate__mini-icon--web"></span>' : ''}
                </div>
            </div>
        `;
    }

    function renderAboutLibrary(lib) {
        return `
            <div class="kde-form-delegate kde-form-delegate--library" role="listitem">
                <span class="kde-form-delegate__label">${lib.name}</span>
                <span class="kde-form-delegate__desc">${lib.version}</span>
            </div>
        `;
    }

    function renderAbout(root, catalog) {
        const mount = root.querySelector('[data-discover-about-mount]');
        const about = catalog && catalog.about ? catalog.about : null;
        if (!mount || !about) {
            return;
        }

        const logoUrl = resolveAssetUrl(`${DISCOVER_ASSET_BASE}plasmadiscover-48.png`);
        const licenseIcon = resolveAssetUrl(`${DISCOVER_ASSET_BASE}license-symbolic.svg`);
        const copyIcon = resolveAssetUrl(`${DISCOVER_ASSET_BASE}edit-copy-symbolic.svg`);
        const links = Array.isArray(about.links) ? about.links : [];
        const libraries = Array.isArray(about.libraries) ? about.libraries : [];
        const authors = Array.isArray(about.authors) ? about.authors : [];
        const licenseName = about.license && about.license.name ? about.license.name : 'Licence publique générale GNU, version 2 ou ultérieure';

        mount.innerHTML = `
            <div class="kde-discover-about__scroll">
                <section class="kde-form-card" aria-label="Discover">
                    <div class="kde-discover-about__general">
                        <img class="kde-discover-about__logo" src="${logoUrl}" alt="" width="48" height="48">
                        <div class="kde-discover-about__intro">
                            <h2 class="kde-discover-about__heading">${about.appName} ${about.version}</h2>
                            <p class="kde-discover-about__tagline">${about.tagline || ''}</p>
                        </div>
                    </div>
                    <hr class="kde-form-card__sep">
                    <div class="kde-form-delegate kde-form-delegate--row">
                        <span class="kde-form-delegate__label">Copyright</span>
                        <span class="kde-form-delegate__desc">${about.copyright || ''}</span>
                    </div>
                </section>

                <h3 class="kde-form-header">Licence</h3>
                <section class="kde-form-card" aria-label="Licence">
                    <button type="button" class="kde-form-delegate kde-form-delegate--button" disabled aria-disabled="true">
                        <span class="kde-form-delegate__icon" style="--kde-form-icon: url('${licenseIcon}')" aria-hidden="true"></span>
                        <span class="kde-form-delegate__label">${licenseName}</span>
                    </button>
                </section>

                <section class="kde-form-card kde-form-card--links" aria-label="Liens">
                    ${links.map((link, index) => `
                        ${index > 0 ? '<hr class="kde-form-card__sep">' : ''}
                        ${renderAboutLink(link)}
                    `).join('')}
                </section>

                <div class="kde-form-header-row">
                    <h3 class="kde-form-header">Bibliothèques utilisées</h3>
                    <button type="button" class="kde-form-header__action" disabled aria-disabled="true" title="Copier dans le presse-papiers">
                        <span class="kde-form-header__action-icon" style="--kde-form-icon: url('${copyIcon}')" aria-hidden="true"></span>
                    </button>
                </div>
                <section class="kde-form-card" aria-label="Bibliothèques utilisées" role="list">
                    ${libraries.map((lib, index) => `
                        ${index > 0 ? '<hr class="kde-form-card__sep">' : ''}
                        ${renderAboutLibrary(lib)}
                    `).join('')}
                </section>

                <h3 class="kde-form-header">Auteurs</h3>
                <section class="kde-form-card" aria-label="Auteurs" role="list">
                    ${authors.map((author, index) => `
                        ${index > 0 ? '<hr class="kde-form-card__sep">' : ''}
                        ${renderAboutAuthor(author)}
                    `).join('')}
                </section>
            </div>
        `;
    }

    function syncSearchPlaceholder(root, catalog) {
        const input = root.querySelector('[data-discover-search]');
        const meta = catalog && catalog.views && catalog.views[state.view];
        state.searchQuery = '';
        if (input && meta && meta.searchPlaceholder) {
            input.placeholder = meta.searchPlaceholder;
            input.value = '';
        }
    }

    function syncViewHeadings(root, catalog) {
        const meta = catalog && catalog.views && catalog.views[state.view];
        if (!meta || !meta.heading) {
            return;
        }
        const panel = root.querySelector(`[data-discover-panel="${state.view}"]`);
        const heading = panel ? panel.querySelector('[data-discover-view-heading]') : null;
        if (heading) {
            heading.textContent = meta.heading;
        }
    }

    function setActiveNav(root, viewId) {
        root.querySelectorAll('[data-discover-nav]').forEach((btn) => {
            const active = btn.getAttribute('data-discover-nav') === viewId;
            btn.classList.toggle('is-active', active);
            if (active) {
                btn.setAttribute('aria-current', 'page');
            } else {
                btn.removeAttribute('aria-current');
            }
        });
    }

    function setVisiblePanel(root, viewId) {
        const detailPanel = root.querySelector('[data-discover-app-detail]');
        if (detailPanel) {
            detailPanel.hidden = true;
        }
        root.querySelectorAll('[data-discover-panel]').forEach((panel) => {
            const show = panel.getAttribute('data-discover-panel') === viewId;
            panel.hidden = !show;
        });
        root.dataset.discoverView = viewId;
    }

    function switchView(root, catalog, viewId) {
        if (!viewId || !catalog || !catalog.views || !catalog.views[viewId]) {
            return;
        }
        state.view = viewId;
        setActiveNav(root, viewId);
        setVisiblePanel(root, viewId);
        syncSearchPlaceholder(root, catalog);
        syncViewHeadings(root, catalog);
        if (viewId === 'installed') {
            renderInstalled(root, catalog);
        } else {
            setWindowTitle(catalog.views[viewId].title);
        }
        if (viewId === 'home') {
            renderHome(root, catalog);
        }
    }

    function syncMaximizedState(root) {
        const shell = findWindowShell();
        const maximized = !!(shell && shell.dataset.maximized === 'true');
        if (state.maximized === maximized) {
            return;
        }
        state.maximized = maximized;
        root.classList.toggle('discover-neon--maximized', maximized);
    }

    function observeWindowChrome(root) {
        const shell = findWindowShell();
        if (!shell) {
            return;
        }
        syncMaximizedState(root);
        const observer = new MutationObserver(() => {
            syncMaximizedState(root);
        });
        observer.observe(shell, {
            attributes: true,
            attributeFilter: ['data-maximized', 'style'],
        });
    }

    function syncCategoryNav(root) {
        root.querySelectorAll('.kde-updates__cat').forEach((btn) => {
            const catId = btn.dataset.discoverCat || 'all';
            const active = catId === state.categoryId;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-current', active ? 'true' : 'false');
        });
    }

    function bindSearch(root) {
        if (root.dataset.discoverSearchInit === 'true') {
            return;
        }
        root.dataset.discoverSearchInit = 'true';
        const input = root.querySelector('[data-discover-search]');
        if (!input) {
            return;
        }
        input.addEventListener('input', () => {
            state.searchQuery = input.value.trim().toLowerCase();
            loadCatalog().then((catalog) => {
                if (!catalog) {
                    return;
                }
                if (state.view === 'home') {
                    renderHome(root, catalog);
                } else if (state.view === 'installed') {
                    renderInstalled(root, catalog);
                }
            });
        });
    }

    function bindCategoryNav(root, catalog) {
        if (root.dataset.discoverCatsInit === 'true') {
            return;
        }
        root.dataset.discoverCatsInit = 'true';
        root.querySelectorAll('.kde-updates__cat').forEach((btn, index) => {
            const catId = DISCOVER_CAT_IDS[index] || 'all';
            btn.dataset.discoverCat = catId;
            btn.removeAttribute('disabled');
            btn.removeAttribute('aria-disabled');
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                state.categoryId = catId;
                state.view = 'home';
                loadCatalog().then((nextCatalog) => {
                    if (!nextCatalog) {
                        return;
                    }
                    renderHome(root, nextCatalog);
                    switchView(root, nextCatalog, 'home');
                    syncCategoryNav(root);
                });
            });
        });
        syncCategoryNav(root);
    }

    function bindUpdatesActions(root) {
        if (root.dataset.discoverActionsInit === 'true') {
            return;
        }
        root.dataset.discoverActionsInit = 'true';
        root.addEventListener('click', (event) => {
            const removeInstalled = event.target.closest('.kde-discover-card--installed__remove');
            if (removeInstalled && root.contains(removeInstalled)) {
                event.preventDefault();
                const card = removeInstalled.closest('.kde-discover-card--installed');
                const appId = card ? card.getAttribute('data-discover-app') : '';
                const status = root.querySelector('[data-discover-installed-status]');
                loadCatalog().then((catalog) => {
                    if (!catalog || !appId) {
                        return;
                    }
                    const idx = Array.isArray(catalog.installed)
                        ? catalog.installed.findIndex((entry) => entry && entry.id === appId)
                        : -1;
                    if (idx >= 0) {
                        const removed = catalog.installed[idx];
                        catalog.installed.splice(idx, 1);
                        if (catalog.installedMeta && typeof catalog.installedMeta.totalCount === 'number') {
                            catalog.installedMeta.totalCount = Math.max(0, catalog.installedMeta.totalCount - 1);
                        }
                        if (catalog.appDetails && catalog.appDetails[appId]) {
                            catalog.appDetails[appId].installed = false;
                        }
                        if (status) {
                            status.hidden = false;
                            status.textContent = `${removed && removed.name ? removed.name : 'Application'} supprimée (simulation).`;
                        }
                        if (state.view === 'installed') {
                            renderInstalled(root, catalog);
                        }
                    }
                });
                return;
            }

            const card = event.target.closest('.kde-discover-card');
            if (card && root.contains(card)) {
                event.preventDefault();
                const appId = card.getAttribute('data-discover-app');
                loadCatalog().then((catalog) => {
                    if (catalog && appId) {
                        showAppDetail(root, catalog, appId);
                    }
                });
                return;
            }

            const backBtn = event.target.closest('[data-discover-app-back]');
            if (backBtn && root.contains(backBtn)) {
                event.preventDefault();
                const finishBack = (catalog) => {
                    if (catalog) {
                        closeAppDetail(root, catalog);
                    }
                };
                if (catalogCache) {
                    finishBack(catalogCache);
                } else {
                    loadCatalog().then(finishBack);
                }
                return;
            }

            const installBtn = event.target.closest('[data-discover-app-install]');
            if (installBtn && root.contains(installBtn)) {
                event.preventDefault();
                if (installBtn.classList.contains('is-installing')) {
                    return;
                }
                const appId = installBtn.getAttribute('data-discover-app-install') || '';
                const status = root.querySelector('[data-discover-app-status]');
                const label = installBtn.querySelector('span:last-child');
                installBtn.classList.add('is-installing');
                installBtn.disabled = true;
                installBtn.setAttribute('aria-disabled', 'true');
                installBtn.setAttribute('aria-busy', 'true');
                if (label) {
                    label.textContent = 'Installation…';
                }
                loadCatalog().then((catalog) => {
                    const app = catalog ? findAppById(catalog, appId) : null;
                    const finishInstall = () => {
                        if (app && app.storeInstallable && app.storeEntry) {
                            notifyStoreInstall(app);
                        }
                        if (catalog && app) {
                            markAppInstalledInCatalog(catalog, app);
                            if (root.dataset.discoverForceUninstalled) {
                                const forced = root.dataset.discoverForceUninstalled
                                    .split(',')
                                    .map((entry) => entry.trim())
                                    .filter((entry) => entry && entry !== appId);
                                if (forced.length) {
                                    root.dataset.discoverForceUninstalled = forced.join(',');
                                } else {
                                    delete root.dataset.discoverForceUninstalled;
                                }
                            }
                            renderAppDetail(root, catalog, app);
                        }
                        const statusEl = root.querySelector('[data-discover-app-status]');
                        if (statusEl) {
                            statusEl.hidden = false;
                            statusEl.textContent = app && app.storeInstallable
                                ? `${app.name || 'Application'} installée (simulation magasin CapsuleOS).`
                                : 'Installation simulée — application ajoutée au catalogue lab.';
                        }
                        if (catalog && app && app.storeInstallable) {
                            renderHome(root, catalog);
                        }
                    };
                    window.setTimeout(finishInstall, 2200);
                });
                return;
            }

            const navBtn = event.target.closest('[data-discover-nav]');
            if (navBtn && root.contains(navBtn)) {
                event.preventDefault();
                loadCatalog().then((catalog) => {
                    switchView(root, catalog, navBtn.getAttribute('data-discover-nav'));
                });
                return;
            }

            const action = event.target.closest('[data-um-kde-action]');
            if (!action || !root.contains(action)) {
                return;
            }
            event.preventDefault();
            const id = action.getAttribute('data-um-kde-action');
            if (id === 'refresh') {
                return;
            }
            if (id === 'updateAll') {
                loadCatalog().then((catalog) => {
                    if (!catalog) {
                        return;
                    }
                    catalog.updates = [];
                    renderUpdates(root, catalog);
                    syncUpdatesChrome(root, catalog);
                });
            }
        });
    }

    function bindOnce() {
        const root = findRoot();
        const discoverReady = root && (
            root.classList.contains('update-manager--kde-neon')
            || root.querySelector('[data-discover-nav]')
        );
        if (!discoverReady) {
            return false;
        }
        if (root.dataset.discoverInit === 'true') {
            const hasCards = root.querySelector('[data-discover-home-mount] .kde-discover-card');
            return !!hasCards;
        }

        loadCatalog().then((catalog) => {
            if (!catalog) {
                return;
            }
            renderHome(root, catalog);
            renderInstalled(root, catalog);
            renderUpdates(root, catalog);
            renderConfig(root, catalog);
            renderAbout(root, catalog);
            switchView(root, catalog, state.view);
            bindCategoryNav(root, catalog);
            bindSearch(root);
            observeWindowChrome(root);
            syncUpdatesChrome(root, catalog);
            root.dataset.discoverInit = 'true';
        });

        bindUpdatesActions(root);
        return true;
    }

    function openView(viewId) {
        const run = () => {
            const root = findRoot();
            if (!root) {
                return false;
            }
            if (root.dataset.discoverInit !== 'true') {
                bindOnce();
            }
            loadCatalog().then((catalog) => {
                if (catalog) {
                    switchView(root, catalog, viewId);
                }
            });
            return true;
        };

        if (!run()) {
            let tries = 0;
            const timer = window.setInterval(() => {
                tries += 1;
                if (run() || tries > 40) {
                    window.clearInterval(timer);
                }
            }, 100);
        }
    }

    window.CapsuleDiscoverNeon = {
        openView,
    };

    window.initUpdateManagerApp = bindOnce;

    document.addEventListener('capsule:discover-open-view', (event) => {
        const viewId = event.detail && event.detail.view;
        if (viewId) {
            openView(viewId);
        }
    });
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this));
