/**
 * Navigation par catégories — page compte (PHP et dev statique).
 */
(function (global) {
    'use strict';

    var HASH_MAP = {
        compte: 'overview',
        overview: 'overview',
        progression: 'progress',
        progress: 'progress',
        achats: 'purchases',
        purchases: 'purchases',
        classes: 'classes',
        modules: 'modules',
        support: 'support',
        soutien: 'support',
        parametres: 'settings',
        settings: 'settings',
    };

    var SUB_HASH_MAP = {
        abonnement: 'subscription',
        subscription: 'subscription',
        compte: 'account',
        account: 'account',
        support: 'support',
    };

    var REVERSE_HASH = {
        overview: 'compte',
        progress: 'progression',
        purchases: 'achats',
        classes: 'classes',
        modules: 'modules',
        support: 'support',
        settings: 'parametres',
    };

    var REVERSE_SUB_HASH = {
        subscription: 'abonnement',
        account: 'compte',
        support: 'support',
    };

    function hashUrl(fragment) {
        var hash = String(fragment || '').replace(/^#/, '');
        return window.location.pathname + window.location.search + (hash ? '#' + hash : '');
    }

    function visibleNavIds() {
        var ids = ['overview', 'support', 'settings'];
        document.querySelectorAll('[data-account-nav-item]:not([hidden])').forEach(function (el) {
            var id = el.getAttribute('data-account-nav-item');
            if (id && ids.indexOf(id) === -1) {
                ids.push(id);
            }
        });
        document.querySelectorAll('[data-account-nav]').forEach(function (btn) {
            var id = btn.getAttribute('data-account-nav');
            if (id && ids.indexOf(id) === -1) {
                var item = btn.closest('[data-account-nav-item]');
                if (!item || !item.hidden) {
                    ids.push(id);
                }
            }
        });
        return ids;
    }

    function isTicketSubId(subId) {
        return /^ticket-\d+$/.test(subId || '');
    }

    function isSupportSubId(subId) {
        return subId === 'support' || subId === 'historique' || isTicketSubId(subId);
    }

    function parseHash() {
        var raw = window.location.hash.replace(/^#/, '').toLowerCase();
        if (!raw) {
            return { view: 'overview', sub: 'subscription' };
        }
        var parts = raw.split('/');
        var mainKey = parts[0];
        var view = HASH_MAP[mainKey] || HASH_MAP[raw] || 'overview';
        var sub = view === 'support' ? 'support' : 'subscription';

        if (view === 'settings' && parts[1]) {
            if (parts[1] === 'support' || isTicketSubId(parts[1])) {
                return {
                    view: 'support',
                    sub: parts[1] === 'support' ? 'support' : parts[1],
                };
            }
            sub = SUB_HASH_MAP[parts[1]] || 'subscription';
        }

        if (view === 'support' && parts[1]) {
            sub = isSupportSubId(parts[1]) ? parts[1] : 'support';
        }

        return { view: view, sub: sub };
    }

    function buildHash(viewId, subId) {
        if (viewId === 'support') {
            if (isSupportSubId(subId || '')) {
                return 'support/' + subId;
            }
            return 'support';
        }
        if (viewId === 'settings') {
            var subPart = REVERSE_SUB_HASH[subId || 'subscription'] || 'abonnement';
            return 'parametres/' + subPart;
        }
        return REVERSE_HASH[viewId] || 'compte';
    }

    function subnavScopeForView(viewId) {
        if (viewId === 'settings' || viewId === 'support') {
            return viewId;
        }
        return null;
    }

    function activateSubView(scope, subId, options) {
        var opts = options || {};
        var root = document.querySelector('[data-account-subnav-scope="' + scope + '"]');
        if (!root) {
            return;
        }

        if (scope === 'settings') {
            var allowedSettings = ['subscription', 'account'];
            if (allowedSettings.indexOf(subId) === -1) {
                subId = 'subscription';
            }
        } else if (scope === 'support') {
            if (!isSupportSubId(subId)) {
                subId = 'support';
            }
        }

        root.querySelectorAll('[data-account-sub-view]').forEach(function (panel) {
            var id = panel.getAttribute('data-account-sub-view');
            panel.hidden = id !== subId;
        });

        document.querySelectorAll('[data-account-sub-nav]').forEach(function (btn) {
            var btnScope = btn.closest('[data-account-subnav-scope]');
            if (!btnScope || btnScope.getAttribute('data-account-subnav-scope') !== scope) {
                return;
            }
            var id = btn.getAttribute('data-account-sub-nav');
            var active = id === subId;
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
            btn.tabIndex = active ? 0 : -1;
            btn.classList.toggle('portal-account-subnav-link--active', active);
        });

        if (opts.updateHash !== false) {
            var nextHash = buildHash(scope, subId);
            if (window.location.hash.replace(/^#/, '') !== nextHash) {
                history.replaceState(null, '', hashUrl(nextHash));
            }
        }

        if (scope === 'support' && isTicketSubId(subId)
            && global.CapsulePortalTickets
            && typeof global.CapsulePortalTickets.markTicketSeenBySub === 'function') {
            global.CapsulePortalTickets.markTicketSeenBySub(subId);
        }
    }

    function activateView(viewId, options) {
        var opts = options || {};
        var allowed = visibleNavIds();
        if (allowed.indexOf(viewId) === -1) {
            viewId = 'overview';
        }

        var supportEl = document.querySelector('[data-account-view="support"]');
        var supportWasHidden = !supportEl || supportEl.hidden;

        document.querySelectorAll('[data-account-view]').forEach(function (panel) {
            var id = panel.getAttribute('data-account-view');
            panel.hidden = id !== viewId;
        });

        document.querySelectorAll('[data-account-nav]').forEach(function (btn) {
            var id = btn.getAttribute('data-account-nav');
            var active = id === viewId;
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
            btn.tabIndex = active ? 0 : -1;
            btn.classList.toggle('portal-account-nav-link--active', active);
        });

        var scope = subnavScopeForView(viewId);
        if (scope) {
            activateSubView(scope, opts.sub || (scope === 'support' ? 'support' : 'subscription'), { updateHash: false });
        }

        if (viewId === 'support' && supportWasHidden && opts.skipTicketRefresh !== true
            && global.CapsulePortalTickets
            && typeof global.CapsulePortalTickets.refreshFromApi === 'function') {
            global.CapsulePortalTickets.refreshFromApi(opts.sub || 'support');
        }

        if (viewId === 'classes'
            && global.CapsulePortalAccount
            && typeof global.CapsulePortalAccount.refreshTeacherClassroom === 'function') {
            global.CapsulePortalAccount.refreshTeacherClassroom();
        }

        if (opts.updateHash !== false) {
            var nextHash = buildHash(viewId, opts.sub);
            if (window.location.hash.replace(/^#/, '') !== nextHash) {
                history.replaceState(null, '', hashUrl(nextHash));
            }
        }
    }

    function bindNav() {
        var root = document.querySelector('[data-portal-account], [data-portal-account-dev]');
        if (!root || !root.querySelector('[data-account-nav]')) {
            return;
        }

        if (global.CapsulePortalTickets
            && typeof global.CapsulePortalTickets.initPanels === 'function') {
            global.CapsulePortalTickets.initPanels();
        }

        root.addEventListener('click', function (event) {
            var btn = event.target.closest('[data-account-nav]');
            if (!btn || !root.contains(btn)) {
                return;
            }
            var navList = root.querySelector('.portal-account-nav-list');
            if (navList && navList.contains(btn)) {
                return;
            }
            event.preventDefault();
            var view = btn.getAttribute('data-account-nav') || 'overview';
            var sub = btn.getAttribute('data-account-sub-nav') || null;
            if (view === 'support' && !sub) {
                sub = 'support';
            }
            if (view === 'settings' && !sub) {
                sub = 'subscription';
            }
            activateView(view, { sub: sub });
        });

        var navList = root.querySelector('.portal-account-nav-list');
        if (navList) {
            navList.addEventListener('click', function (event) {
                var btn = event.target.closest('[data-account-nav]');
                if (!btn || !navList.contains(btn)) {
                    return;
                }
                var view = btn.getAttribute('data-account-nav') || 'overview';
                var sub = btn.getAttribute('data-account-sub-nav') || null;
                if (view === 'support' && !sub) {
                    sub = 'support';
                }
                if (view === 'settings' && !sub) {
                    sub = 'subscription';
                }
                activateView(view, { sub: sub });
            });
        }

        document.querySelectorAll('[data-account-subnav-scope]').forEach(function (scopeEl) {
            var scope = scopeEl.getAttribute('data-account-subnav-scope') || '';
            var list = scopeEl.querySelector('[data-account-subnav-list]');
            if (!list) {
                return;
            }
            list.addEventListener('click', function (event) {
                var btn = event.target.closest('[data-account-sub-nav]');
                if (!btn || !list.contains(btn)) {
                    return;
                }
                event.preventDefault();
                var sub = btn.getAttribute('data-account-sub-nav')
                    || (scope === 'support' ? 'support' : 'subscription');
                activateSubView(scope, sub);
            });
        });

        window.addEventListener('hashchange', function () {
            var parsed = parseHash();
            activateView(parsed.view, { sub: parsed.sub, updateHash: false });
        });

        var parsed = parseHash();
        activateView(parsed.view, { sub: parsed.sub, updateHash: false });
    }

    global.CapsulePortalAccountNav = {
        activate: function (viewId, options) {
            activateView(viewId, options || {});
        },
        activateSub: function (scope, subId, options) {
            activateSubView(scope, subId, options || {});
        },
        visibleIds: visibleNavIds,
        refresh: function () {
            var parsed = parseHash();
            activateView(parsed.view, { sub: parsed.sub, updateHash: false });
        },
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindNav);
    } else {
        bindNav();
    }
}(typeof window !== 'undefined' ? window : globalThis));
