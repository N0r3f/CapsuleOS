/**
 * Ground truth GNOME Software — chrome GS50 (onglets), hero, grilles, fiche détail.
 * Consomme CAPSULE_GNOME_SOFTWARE_CONTENT + CapsuleGnomeStore.
 */
(function initCapsuleGnomeSoftwareGround(global) {
    'use strict';

    function resolveRegistryId() {
        if (global.CapsuleGnomeStore && typeof global.CapsuleGnomeStore.resolveRegistryId === 'function') {
            return global.CapsuleGnomeStore.resolveRegistryId() || 'linux-rocky';
        }
        return 'linux-rocky';
    }

    function resolveContent(registryId) {
        var map = global.CAPSULE_GNOME_SOFTWARE_CONTENT || {};
        if (registryId && map[registryId]) {
            return map[registryId];
        }
        return map['linux-fedora'] || map['linux-rocky'] || {};
    }

    function chromeProfile(registryId, content) {
        if (content.chromeProfile) {
            return content.chromeProfile;
        }
        return 'gs50-tabs';
    }

    function applyChromeProfile(root, registryId, content) {
        var profile = chromeProfile(registryId, content);
        root.dataset.umGnomeChrome = profile;
        var titlebar = root.querySelector('.gnome-software__titlebar');
        if (!titlebar) {
            return;
        }
        var collapsed = content.searchCollapsedDefault === true
            || (content.searchCollapsedDefault !== false && profile === 'gs50-tabs');
        titlebar.classList.toggle('gnome-software__search--collapsed', collapsed);
        titlebar.classList.toggle('gnome-software__search--expanded', !collapsed);
        var chromeActions = root.querySelector('[data-um-gnome-chrome-actions]');
        if (chromeActions) {
            chromeActions.hidden = profile !== 'gs50-tabs';
        }
        applyNavLabels(root, content);
        applyExploreBannerVisibility(root, content, profile);
        applyLegacyCategoriesVisibility(root, content, profile);
        if (profile === 'gs50-tabs') {
            mergeGs50WindowChrome(root);
            syncSearchExpandedState(root);
        }
    }

    function ensureGs50HeaderDrag(root) {
        var shell = root.querySelector('.gnome-software');
        if (!shell) {
            return;
        }
        var drag = shell.querySelector('[data-um-gnome-header-drag]');
        if (!drag) {
            drag = root.ownerDocument.createElement('div');
            drag.className = 'gnome-software__header-drag window-drag-region';
            drag.setAttribute('data-um-gnome-header-drag', '');
            drag.setAttribute('data-window-drag-region', '');
            drag.setAttribute('aria-hidden', 'true');
            shell.insertBefore(drag, shell.firstChild);
        }
        shell.setAttribute('data-window-drag-handle', '');
        shell.setAttribute('data-window-drag-passthrough', 'true');
        var titlebar = root.querySelector('.gnome-software__titlebar');
        if (titlebar) {
            titlebar.removeAttribute('data-window-drag-handle');
            titlebar.removeAttribute('data-window-drag-passthrough');
        }
    }

    function mergeGs50WindowChrome(root) {
        var chromeActions = root.querySelector('[data-um-gnome-chrome-actions]');
        var titlebar = root.querySelector('.gnome-software__titlebar');
        if (!chromeActions || !titlebar) {
            return;
        }
        var headerEnd = titlebar.querySelector(':scope > .gnome-app__header-end');
        if (headerEnd) {
            var controls = headerEnd.querySelector('.gnome-app__window-controls');
            if (controls && !chromeActions.contains(controls)) {
                chromeActions.appendChild(controls);
            }
            if (!headerEnd.childElementCount) {
                headerEnd.remove();
            }
        }
        chromeActions.hidden = false;
        ensureGs50HeaderDrag(root);
    }

    function syncSearchExpandedState(root) {
        var titlebar = root.querySelector('.gnome-software__titlebar');
        if (!titlebar) {
            return;
        }
        var expanded = titlebar.classList.contains('gnome-software__search--expanded');
        if (expanded) {
            root.dataset.umGnomeSearchExpanded = 'true';
        } else {
            delete root.dataset.umGnomeSearchExpanded;
        }
    }

    function applyNavLabels(root, content) {
        var labels = content.navLabels || {};
        root.querySelectorAll('[data-um-gnome-nav]').forEach(function setNavLabel(btn) {
            var key = btn.getAttribute('data-um-gnome-nav');
            if (!labels[key]) {
                return;
            }
            var text = btn.querySelector('span:not(.gnome-software__navicon):not(.gnome-software__badge)');
            if (text) {
                text.textContent = labels[key];
            }
        });
        if (labels.explore === 'Explorer') {
            var exploreIcon = root.querySelector('[data-um-gnome-nav="explore"] .gnome-software__navicon--explore');
            if (exploreIcon) {
                exploreIcon.classList.add('gnome-software__navicon--explorer');
            }
        }
    }

    function applyExploreBannerVisibility(root, content, profile) {
        var banner = root.querySelector('[data-um-gnome-updates-banner]');
        if (!banner) {
            return;
        }
        if (content.hideExploreUpdatesBanner && profile === 'gs50-tabs') {
            banner.hidden = true;
            banner.dataset.umGnomeBannerSuppressed = 'gs50-explore';
        } else if (banner.dataset.umGnomeBannerSuppressed === 'gs50-explore') {
            delete banner.dataset.umGnomeBannerSuppressed;
        }
    }

    function applyLegacyCategoriesVisibility(root, content, profile) {
        var legacy = root.querySelector('[data-um-gnome-legacy-categories]');
        if (!legacy) {
            return;
        }
        var hide = profile === 'gs50-tabs' && (content.categoryHeroes || []).length > 0;
        legacy.hidden = hide;
    }

    function collapseSearch(root, options) {
        var titlebar = root.querySelector('.gnome-software__titlebar');
        if (!titlebar) {
            return;
        }
        titlebar.classList.add('gnome-software__search--collapsed');
        titlebar.classList.remove('gnome-software__search--expanded');
        syncSearchExpandedState(root);
        var input = root.querySelector('[data-um-gnome-search]');
        if (input) {
            input.blur();
            if (!options || options.clear !== false) {
                input.value = '';
            }
        }
    }

    function toggleSearch(root) {
        var titlebar = root.querySelector('.gnome-software__titlebar');
        if (!titlebar) {
            return;
        }
        if (titlebar.classList.contains('gnome-software__search--expanded')) {
            collapseSearch(root);
            return;
        }
        titlebar.classList.remove('gnome-software__search--collapsed');
        titlebar.classList.add('gnome-software__search--expanded');
        syncSearchExpandedState(root);
        var input = root.querySelector('[data-um-gnome-search]');
        if (input) {
            input.focus();
        }
    }

    function renderHeroSlide(card, icon, title, sub, hero) {
        if (title) {
            title.textContent = hero.title || '';
        }
        if (sub) {
            sub.textContent = hero.sub || '';
        }
        if (icon) {
            icon.className = 'gnome-software__hero-icon gnome-software__cardicon gnome-software__cardicon--has-icon '
                + (hero.iconClass || '');
        }
        if (card) {
            if (hero.appId) {
                card.setAttribute('data-um-gnome-app', hero.appId);
            } else {
                card.removeAttribute('data-um-gnome-app');
            }
            if (hero.gradient && hero.gradient.length >= 2) {
                card.style.background = 'linear-gradient(135deg, ' + hero.gradient[0] + ' 0%, '
                    + hero.gradient[1] + ' 55%, ' + (hero.gradient[2] || hero.gradient[1]) + ' 100%)';
            } else if (hero.solidColor) {
                card.style.background = hero.solidColor;
            } else {
                card.style.background = '';
            }
        }
    }

    function renderHeroCarousel(root, content, hero) {
        var carousel = content.featuredHeroCarousel || {};
        var slideCount = carousel.slideCount || 0;
        var prev = root.querySelector('[data-um-gnome-hero-prev]');
        var next = root.querySelector('[data-um-gnome-hero-next]');
        var dotsHost = root.querySelector('[data-um-gnome-hero-dots]');
        var card = root.querySelector('[data-um-gnome-hero-card]');
        var icon = root.querySelector('[data-um-gnome-hero-icon]');
        var title = root.querySelector('[data-um-gnome-hero-title]');
        var sub = root.querySelector('[data-um-gnome-hero-sub]');
        var slides = content.featuredHeroSlides && content.featuredHeroSlides.length
            ? content.featuredHeroSlides.slice()
            : [hero];
        while (slides.length < slideCount) {
            slides.push(hero);
        }
        var activeIndex = 0;

        function paintDots() {
            if (!dotsHost || slideCount < 2) {
                return;
            }
            var html = '';
            var i;
            for (i = 0; i < slideCount; i += 1) {
                html += '<span class="gnome-software__hero-dot' + (i === activeIndex ? ' is-active' : '') + '"></span>';
            }
            dotsHost.innerHTML = html;
        }

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            renderHeroSlide(card, icon, title, sub, slides[activeIndex] || hero);
            paintDots();
        }

        if (slideCount > 1) {
            if (prev) {
                prev.hidden = false;
                prev.onclick = function onPrev() {
                    showSlide(activeIndex - 1);
                };
            }
            if (next) {
                next.hidden = false;
                next.onclick = function onNext() {
                    showSlide(activeIndex + 1);
                };
            }
            if (dotsHost) {
                dotsHost.hidden = false;
            }
            paintDots();
        } else {
            if (prev) {
                prev.hidden = true;
            }
            if (next) {
                next.hidden = true;
            }
            if (dotsHost) {
                dotsHost.hidden = true;
            }
        }
        renderHeroSlide(card, icon, title, sub, hero);
    }

    function renderHero(root, content) {
        var host = root.querySelector('[data-um-gnome-hero]');
        if (!host) {
            return;
        }
        var hero = content.featuredHero;
        if (!hero) {
            host.hidden = true;
            return;
        }
        host.hidden = false;
        renderHeroCarousel(root, content, hero);
    }

    function renderCategoryHeroes(root, content) {
        var host = root.querySelector('[data-um-gnome-category-hero-grid]');
        if (!host) {
            return;
        }
        var items = content.categoryHeroes || [];
        var section = root.querySelector('[data-um-gnome-category-hero-section]');
        if (!items.length) {
            host.hidden = true;
            if (section) {
                section.hidden = true;
            }
            return;
        }
        host.hidden = false;
        if (section) {
            section.hidden = false;
        }
        var html = '';
        var i;
        for (i = 0; i < items.length; i += 1) {
            var item = items[i];
            html += '<button type="button" class="gnome-software__category-hero ' + (item.heroClass || '')
                + '" data-um-gnome-category="' + item.categoryId + '" role="listitem">'
                + (item.iconClass
                    ? '<span class="gnome-software__category-hero-icon ' + item.iconClass + '" aria-hidden="true"></span>'
                    : '')
                + '<span>' + item.label + '</span></button>';
        }
        host.innerHTML = html;
    }

    function renderFeaturedGrid(root, catalog, content) {
        var grid = root.querySelector('[data-um-gnome-featured-grid]');
        if (!grid) {
            return;
        }
        var ids = content.exploreFeaturedIds || Object.keys(catalog);
        var html = '';
        var i;
        for (i = 0; i < ids.length; i += 1) {
            var id = ids[i];
            var app = catalog[id];
            if (!app) {
                continue;
            }
            html += '<button type="button" class="gnome-software__card" role="listitem"'
                + ' data-um-gnome-app="' + id + '" aria-label="' + app.title + '">'
                + '<span class="gnome-software__cardicon gnome-software__cardicon--has-icon ' + app.iconClass
                + '" aria-hidden="true"></span>'
                + '<span class="gnome-software__cardname">' + app.title + '</span>'
                + '<span class="gnome-software__cardsub">' + app.sub + '</span>'
                + '</button>';
        }
        grid.innerHTML = html;
        var section = root.querySelector('[data-um-gnome-featured-section]');
        if (section) {
            section.hidden = !html;
        }
    }

    function detailExtras(registryId, appId, content) {
        var bag = content.appDetails || {};
        if (bag[appId]) {
            return bag[appId];
        }
        return content.appDetailsDefault || {};
    }

    function formatDetailSource(registryId, app, content) {
        var source = app && app.source ? app.source : 'rpm';
        var channel = source === 'flatpak' ? 'Flathub' : 'AppStream';
        var pkg = source === 'flatpak' ? 'Flatpak' : 'RPM';
        var label = channel + ' · ' + pkg;
        if (content.distributionLabel && source !== 'flatpak') {
            label += ' · ' + content.distributionLabel;
        }
        return label;
    }

    function enrichDetailPane(root, app, appId, registryId, content, opts) {
        var extras = detailExtras(registryId, appId, content);
        var developer = root.querySelector('[data-um-gnome-detail-developer]');
        var rating = root.querySelector('[data-um-gnome-detail-rating]');
        var longDesc = root.querySelector('[data-um-gnome-detail-long]');
        var license = root.querySelector('[data-um-gnome-detail-license]');
        var origin = root.querySelector('[data-um-gnome-detail-origin]');
        var sourceChip = root.querySelector('[data-um-gnome-detail-source-chip]');
        var sourceText = root.querySelector('[data-um-gnome-detail-source-text]');
        var screenshots = root.querySelector('[data-um-gnome-detail-screenshots]');
        var uninstall = root.querySelector('[data-um-gnome-detail-uninstall]');

        if (developer) {
            developer.textContent = extras.developer || app.developer || '';
            developer.hidden = !developer.textContent;
        }
        if (rating) {
            var score = extras.rating || app.rating;
            if (score) {
                rating.innerHTML = '<span class="gnome-software__stars" aria-hidden="true">★★★★★</span> '
                    + score + (extras.ratingCount ? ' · ' + extras.ratingCount + ' avis' : '');
                rating.hidden = false;
            } else {
                rating.hidden = true;
            }
        }
        if (longDesc) {
            longDesc.textContent = extras.longDesc || app.desc || '';
        }
        if (license) {
            license.textContent = extras.license || 'Licence libre';
        }
        if (origin) {
            origin.textContent = extras.origin || content.distributionLabel || 'Fedora Linux';
        }
        if (sourceText) {
            sourceText.textContent = formatDetailSource(registryId, app, content);
        }
        if (sourceChip) {
            sourceChip.hidden = false;
        }
        if (screenshots) {
            var frames = screenshots.querySelectorAll('[data-um-gnome-screenshot]');
            var shots = extras.screenshots || [];
            var hasShots = shots.length > 0;
            screenshots.hidden = !hasShots;
            if (hasShots && frames.length) {
                frames[0].style.backgroundImage = 'url("' + shots[0] + '")';
            }
        }
        if (uninstall) {
            var installed = opts && typeof opts.installed === 'boolean'
                ? opts.installed
                : app.installed === true;
            uninstall.hidden = !installed;
        }
    }

    function patchRenderedCardIcons(root) {
        root.querySelectorAll('.gnome-software__cardicon').forEach(function addHasIcon(el) {
            if (!el.classList.contains('gnome-software__cardicon--has-icon')) {
                el.classList.add('gnome-software__cardicon--has-icon');
            }
        });
    }

    function applyGround(root, catalog) {
        var registryId = resolveRegistryId();
        var content = resolveContent(registryId);
        applyChromeProfile(root, registryId, content);
        renderHero(root, content);
        renderCategoryHeroes(root, content);
        if (catalog) {
            renderFeaturedGrid(root, catalog, content);
        }
        patchRenderedCardIcons(root);
        return { registryId: registryId, content: content };
    }

    global.CapsuleGnomeSoftwareGround = {
        resolveRegistryId: resolveRegistryId,
        resolveContent: resolveContent,
        chromeProfile: chromeProfile,
        applyGround: applyGround,
        toggleSearch: toggleSearch,
        collapseSearch: collapseSearch,
        mergeGs50WindowChrome: mergeGs50WindowChrome,
        enrichDetailPane: enrichDetailPane,
        formatDetailSource: formatDetailSource,
        patchRenderedCardIcons: patchRenderedCardIcons
    };

    if (typeof document !== 'undefined') {
        document.addEventListener('capsule:slot-injected', function onSoftwareSlotInjected(event) {
            if (!event.detail || event.detail.slotId !== 'update_manager') {
                return;
            }
            var root = document.getElementById('updateManagerApp');
            if (!root || root.dataset.umGnomeChrome !== 'gs50-tabs') {
                return;
            }
            mergeGs50WindowChrome(root);
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
