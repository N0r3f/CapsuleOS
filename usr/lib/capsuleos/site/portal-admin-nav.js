/**
 * Navigation hash — dashboard admin CapsuleOS.
 */
(function (global) {
    'use strict';

    var HASH_MAP = {
        dashboard: 'dashboard',
        tableau: 'dashboard',
        users: 'users',
        utilisateurs: 'users',
        admins: 'admins',
        administrateurs: 'admins',
        subscriptions: 'subscriptions',
        abonnements: 'subscriptions',
        tickets: 'tickets',
        os: 'os',
        modules: 'modules',
        offers: 'offers',
        offres: 'offers',
        content: 'content',
        contenu: 'content',
        classes: 'classes',
        usage: 'usage',
        quotas: 'usage',
        progress: 'progress',
        progression: 'progress',
        gamification: 'gamification',
        runtime: 'runtime',
        sante: 'runtime',
        entitlements: 'entitlements',
        droits: 'entitlements',
        legal: 'legal',
        accessibilite: 'accessibility',
        accessibility: 'accessibility',
        a11y: 'accessibility',
        audit: 'audit',
    };

    var SECTION_META = {
        dashboard: { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble de la plateforme' },
        users: { title: 'Utilisateurs', subtitle: 'Comptes, grades et vérification e-mail' },
        admins: { title: 'Administrateurs', subtitle: 'Comptes admin distincts des utilisateurs' },
        subscriptions: { title: 'Abonnements', subtitle: 'Statuts, périodes et résiliation' },
        tickets: { title: 'Tickets support', subtitle: 'Demandes et réponses' },
        os: { title: 'Systèmes', subtitle: 'Registre OS du portail' },
        modules: { title: 'Modules pédagogiques', subtitle: 'Catalogue, accès et facturation' },
        offers: { title: 'Offres', subtitle: 'Plans et tarification' },
        content: { title: 'Contenu portail', subtitle: 'Hero, à propos et parcours' },
        classes: { title: 'Classes', subtitle: 'Espaces professeurs et élèves' },
        usage: { title: 'Quotas OS', subtitle: 'Consommation journalière 15 min / OS' },
        progress: { title: 'Progression', subtitle: 'Avancement modules pédagogiques' },
        gamification: { title: 'Gamification', subtitle: 'XP, niveaux et badges' },
        runtime: { title: 'Santé plateforme', subtitle: 'Base, schéma et sources de données' },
        entitlements: { title: 'Droits d\'accès', subtitle: 'Contrat entitlements (lecture seule)' },
        legal: { title: 'Informations légales', subtitle: 'Mentions et RGPD' },
        accessibility: { title: 'Accessibilité', subtitle: 'Page publique et déclaration WCAG' },
        audit: { title: 'Journal d\'audit', subtitle: 'Actions administrateur' },
    };

    var currentView = 'dashboard';

    function setGroupOpen(group, open) {
        if (!group) {
            return;
        }
        group.classList.toggle('is-open', open);
        var toggle = group.querySelector('[data-admin-nav-toggle]');
        if (toggle) {
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        var panel = group.querySelector('[data-admin-nav-panel]');
        if (panel) {
            if (open) {
                panel.removeAttribute('inert');
            } else {
                panel.setAttribute('inert', '');
            }
        }
    }

    function openGroup(target) {
        document.querySelectorAll('[data-admin-nav-group]').forEach(function (group) {
            setGroupOpen(group, group === target);
        });
    }

    function openGroupForView(viewId) {
        var link = document.querySelector('[data-admin-nav="' + viewId + '"]');
        if (!link) {
            return;
        }
        var group = link.closest('[data-admin-nav-group]');
        if (group && !group.classList.contains('is-open')) {
            openGroup(group);
        }
    }

    function bindAccordion() {
        document.querySelectorAll('[data-admin-nav-toggle]').forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                var group = toggle.closest('[data-admin-nav-group]');
                if (!group) {
                    return;
                }
                if (group.classList.contains('is-open')) {
                    setGroupOpen(group, false);
                } else {
                    openGroup(group);
                }
            });
        });
    }

    function parseHash() {
        var raw = global.location.hash.replace(/^#/, '').toLowerCase();
        return HASH_MAP[raw] || 'dashboard';
    }

    function updateTopbar(viewId) {
        var meta = SECTION_META[viewId] || SECTION_META.dashboard;
        var titleEl = document.getElementById('portal-admin-page-title');
        var subtitleEl = document.getElementById('portal-admin-page-subtitle');
        if (titleEl) {
            titleEl.textContent = meta.title;
        }
        if (subtitleEl) {
            subtitleEl.textContent = meta.subtitle;
        }
        currentView = viewId;
    }

    function userInitials(user) {
        var name = String((user && user.displayName) || (user && user.email) || 'A').trim();
        var parts = name.split(/\s+/);
        if (parts.length >= 2 && parts[0] && parts[1]) {
            return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    function setupUserChip() {
        var user = global.CAPSULE_PORTAL_ADMIN_USER;
        if (!user) {
            return;
        }
        var chip = document.querySelector('[data-admin-user-chip]');
        var label = document.querySelector('[data-admin-user-label]');
        if (chip && label) {
            label.textContent = user.displayName || user.email || 'Admin';
            chip.hidden = false;
        }
        var identity = document.querySelector('[data-admin-sidebar-identity]');
        if (identity) {
            var avatar = identity.querySelector('[data-admin-sidebar-avatar]');
            var nameEl = identity.querySelector('[data-admin-sidebar-name]');
            var emailEl = identity.querySelector('[data-admin-sidebar-email]');
            if (avatar) {
                avatar.textContent = userInitials(user);
            }
            if (nameEl) {
                nameEl.textContent = user.displayName || user.email || 'Admin';
            }
            if (emailEl) {
                emailEl.textContent = user.email || '';
            }
            identity.hidden = false;
        }
    }

    var MOBILE_NAV_QUERY = '(max-width: 1024px)';

    function isMobileNav() {
        return global.matchMedia && global.matchMedia(MOBILE_NAV_QUERY).matches;
    }

    function setMobileNav(open) {
        var root = document.querySelector('[data-portal-admin-root]');
        if (!root) {
            return;
        }
        root.classList.toggle('portal-admin--nav-open', open);
        var toggle = document.querySelector('[data-admin-sidebar-toggle]');
        if (toggle) {
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        var backdrop = document.querySelector('[data-admin-sidebar-backdrop]');
        if (backdrop) {
            backdrop.hidden = !open;
        }
    }

    function closeMobileNav() {
        setMobileNav(false);
    }

    function setupSidebarToggle() {
        var toggle = document.querySelector('[data-admin-sidebar-toggle]');
        var backdrop = document.querySelector('[data-admin-sidebar-backdrop]');
        if (toggle) {
            toggle.addEventListener('click', function () {
                var root = document.querySelector('[data-portal-admin-root]');
                var open = !(root && root.classList.contains('portal-admin--nav-open'));
                setMobileNav(open);
            });
        }
        if (backdrop) {
            backdrop.addEventListener('click', closeMobileNav);
        }
        global.addEventListener('keydown', function (ev) {
            if (ev.key === 'Escape') {
                closeMobileNav();
            }
        });
        global.addEventListener('resize', function () {
            if (!isMobileNav()) {
                closeMobileNav();
            }
        });
    }

    function setupRefresh() {
        var btn = document.querySelector('[data-admin-refresh]');
        if (!btn) {
            return;
        }
        btn.addEventListener('click', function () {
            if (global.CapsulePortalAdmin && typeof global.CapsulePortalAdmin.reload === 'function') {
                global.CapsulePortalAdmin.reload(currentView);
            }
        });
    }

    function activate(viewId, updateHash) {
        var root = document.querySelector('[data-portal-admin-root]');
        if (!root) {
            return;
        }
        root.querySelectorAll('[data-admin-view]').forEach(function (el) {
            var match = el.getAttribute('data-admin-view') === viewId;
            el.hidden = !match;
        });
        root.querySelectorAll('[data-admin-nav]').forEach(function (btn) {
            var active = btn.getAttribute('data-admin-nav') === viewId;
            btn.classList.toggle('portal-admin-nav-link--active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
            btn.tabIndex = active ? 0 : -1;
        });
        openGroupForView(viewId);
        updateTopbar(viewId);
        if (isMobileNav()) {
            closeMobileNav();
        }
        if (updateHash !== false) {
            var next = global.location.pathname + global.location.search + '#' + viewId;
            if (global.location.pathname + global.location.search + global.location.hash !== next) {
                global.history.replaceState(null, '', next);
            }
        }
        if (global.CapsulePortalAdmin && typeof global.CapsulePortalAdmin.onView === 'function') {
            global.CapsulePortalAdmin.onView(viewId);
        }
    }

    function bind() {
        document.querySelectorAll('[data-admin-nav]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                activate(btn.getAttribute('data-admin-nav') || 'dashboard');
            });
        });
        global.addEventListener('hashchange', function () {
            activate(parseHash(), false);
        });
        bindAccordion();
        setupSidebarToggle();
        setupUserChip();
        setupRefresh();
        activate(parseHash(), false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }

    global.CapsulePortalAdminNav = { activate: activate, parseHash: parseHash, currentView: function () { return currentView; } };
})(window);
