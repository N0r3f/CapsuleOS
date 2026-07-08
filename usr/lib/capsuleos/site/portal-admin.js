/**
 * Dashboard administrateur CapsuleOS — API et rendu des panneaux.
 */
(function (global) {
    'use strict';

    var csrf = global.CAPSULE_PORTAL_CSRF || '';
    var loaded = {};
    var currentView = 'dashboard';
    var lastTicketsData = [];
    var activeTicketTab = 'nouveau';
    var lastSubscriptionsData = [];
    var lastSubscriptionsFingerprint = '';

    var STATUS_LABELS = {
        ouvert: 'Nouveau',
        en_cours: 'En cours',
        ferme: 'Fermé',
        fermé: 'Fermé',
        closed: 'Fermé',
        clos: 'Clos',
        none: 'Gratuit',
        active: 'Abonné actif',
        past_due: 'Impayé',
        canceled: 'Annulé',
        suspended: 'Désactivé',
        utilisateur: 'Utilisateur',
        abonne: 'Abonné',
        professeur: 'Professeur',
        createur: 'Créateur',
        eleve: 'Élève',
        administrateur: 'Administrateur',
        blacklisted: 'Liste noire',
        compte_actif: 'Actif',
        oui: 'Oui',
        non: 'Non',
        visible: 'Visible',
        masqué: 'Masqué',
        masque: 'Masqué',
        planned: 'À venir',
        stub: 'En dev',
        hidden: 'En dev',
        beta: 'Bêta',
        deprecated: 'Déprécié',
        archived: 'Archivé',
        verifie: 'Vérifié',
        non_verifie: 'Non vérifié',
    };

    var AUDIT_LABELS = {
        ticket_close: 'Ticket clôturé',
        ticket_reply: 'Réponse au ticket',
        ticket_reopen: 'Ticket rouvert',
        ticket_take_charge: 'Ticket pris en charge',
        grant_role: 'Rôle accordé',
        revoke_role: 'Rôle révoqué',
        update_display_name: 'Nom mis à jour',
        update_email: 'E-mail mis à jour',
        set_account_status: 'Statut compte modifié',
        blacklist_user: 'Compte banni',
        unblacklist_user: 'Compte débanni',
        password_reset_email: 'E-mail réinitialisation MDP',
        delete_user: 'Compte supprimé',
        set_prof_max_classrooms: 'Limite classes prof',
        force_verify_email: 'E-mail vérifié (admin)',
        subscription_set_status: 'Abonnement modifié',
        subscription_set_period_end: 'Fin de période modifiée',
        subscription_cancel_flag: 'Résiliation programmée',
        os_update_status: 'Statut OS modifié',
        os_update_meta: 'Métadonnées OS modifiées',
        module_update_access: 'Accès module modifié',
        module_update_meta: 'Module renommé',
        module_update_price: 'Prix module modifié',
        module_update_billing: 'Facturation module modifiée',
        module_toggle_catalog: 'Visibilité store modifiée',
        module_catalog_sync: 'Catalogue modules synchronisé',
        offers_update_plan: 'Offre mise à jour',
        offers_update_section: 'Section tarifs mise à jour',
        entitlements_update_level: 'Niveau d\'accès modifié',
        entitlements_update_module_access: 'Accès modules modifié',
        grades_update_grade: 'Grade modifié',
        grades_update_permissions: 'Droits de grade modifiés',
        legal_update_section: 'Texte légal modifié',
        accessibility_update_page: 'Page accessibilité modifiée',
        accessibility_update_section: 'Section accessibilité modifiée',
        content_update: 'Contenu portail mis à jour',
        classroom_delete: 'Classe supprimée',
        classroom_remove_member: 'Membre retiré de la classe',
        classroom_extend_invite: 'Invitation classe prolongée',
        runtime_migrate: 'Migrations de schéma appliquées',
    };

    var AUDIT_TARGET_LABELS = {
        user: 'Utilisateur',
        os: 'Système',
        ticket: 'Ticket',
        module: 'Module',
        classroom: 'Classe',
        plan: 'Offre',
        offers: 'Offres',
        entitlements: 'Droits d\'accès',
        grade: 'Grade',
        legal: 'Légal',
        accessibility: 'Accessibilité',
        content: 'Contenu',
        catalog: 'Catalogue',
    };

    var GRADE_LABELS = {
        utilisateur: 'Utilisateur',
        abonne: 'Abonné',
        professeur: 'Professeur',
        createur: 'Créateur',
        eleve: 'Élève',
        administrateur: 'Administrateur',
        visiteur: 'Visiteur',
    };

    var SUBSCRIPTION_LABELS = {
        none: 'Sans abonnement',
        active: 'Abonné',
        past_due: 'Impayé',
        canceled: 'Annulé',
    };

    var USER_TABS = [
        { id: 'all', label: 'Tous' },
        { id: 'utilisateur', label: 'Utilisateurs' },
        { id: 'abonne', label: 'Abonnés' },
        { id: 'eleve', label: 'Élèves' },
        { id: 'professeur', label: 'Professeurs' },
        { id: 'createur', label: 'Créateurs' },
    ];

    var lastUsersData = [];
    var activeUserTab = 'all';
    var usersPanelMode = 'users';

    var SUBSCRIPTION_OPTIONS = [
        { value: 'none', label: 'Gratuit' },
        { value: 'active', label: 'Abonné actif' },
        { value: 'past_due', label: 'Impayé' },
        { value: 'canceled', label: 'Annulé' },
    ];

    var MODULE_ACCESS_OPTIONS = [
        { value: 'free', label: 'Gratuit' },
        { value: 'registered', label: 'Compte requis' },
        { value: 'subscriber', label: 'Abonné' },
        { value: 'class', label: 'Classe' },
    ];

    var TICKET_TABS = [
        { id: 'nouveau', label: 'Nouveaux' },
        { id: 'en_cours', label: 'En cours' },
        { id: 'ferme', label: 'Clôturés' },
        { id: 'all', label: 'Tous' },
    ];

    var TICKET_TYPE_LABELS = {
        support: 'Support',
        demande_createur: 'Demande du rôle Créateur',
        demande_module: 'Demande d\u2019ajout de module',
        facturation: 'Facturation',
        bug: 'Bug',
        autre: 'Autre',
    };

    var ROLE_REQUEST_TYPES = { demande_createur: 'createur' };

    function ticketTypeLabel(type) {
        var key = String(type || '');
        return TICKET_TYPE_LABELS[key] || (key ? key : 'Ticket');
    }

    function countActionableTickets(tickets) {
        return (tickets || []).reduce(function (n, t) {
            if (isTicketNew(t.status) || t.awaitingAdmin) {
                return n + 1;
            }
            return n;
        }, 0);
    }

    var pendingUserSearchQuery = '';

    function updateTicketNavBadge(count) {
        var badge = document.querySelector('[data-admin-nav-badge="tickets"]');
        if (!badge) {
            return;
        }
        var n = Number(count) || 0;
        if (n > 0) {
            badge.textContent = n > 99 ? '99+' : String(n);
            badge.hidden = false;
            badge.setAttribute('aria-label', n + ' ticket(s) en attente');
        } else {
            badge.hidden = true;
        }
        var bellDot = document.querySelector('[data-admin-bell-dot]');
        if (bellDot) {
            bellDot.hidden = n <= 0;
        }
    }

    function refreshTicketBadge() {
        return apiGet('tickets.php?limit=200').then(function (data) {
            var tickets = data.tickets || [];
            lastTicketsData = tickets;
            updateTicketNavBadge(countActionableTickets(tickets));
            return tickets;
        }).catch(function () {
            return lastTicketsData || [];
        });
    }

    function getOpenTicketDetailId() {
        var modal = document.querySelector('[data-admin-modal]');
        if (!modal || modal.hidden) {
            return 0;
        }
        var body = modal.querySelector('[data-admin-modal-body]');
        if (!body) {
            return 0;
        }
        return parseInt(body.getAttribute('data-admin-ticket-detail-id') || '0', 10) || 0;
    }

    function notifyAdminUserReply(ticket, options) {
        var opts = options || {};
        var live = global.CapsulePortalTicketLive;
        if (!live || !ticket) {
            return;
        }
        if (opts.silent) {
            return;
        }
        if (getOpenTicketDetailId() === Number(ticket.id)) {
            return;
        }
        live.showToast({
            title: 'Nouvelle réponse client',
            message: ticket.subject || ('Ticket #' + ticket.id),
            icon: 'fa-reply',
            variant: 'admin',
            actionLabel: 'Ouvrir',
            onAction: function () {
                openTicketDetail(ticket.id);
            },
        });
    }

    function openTicketDetail(ticketId) {
        var id = parseInt(String(ticketId || '0'), 10);
        if (!id) {
            return;
        }
        navTo('tickets');
        apiGet('tickets.php?id=' + encodeURIComponent(String(id))).then(function (data) {
            if (!data || !data.ticket) {
                return;
            }
            var detail = openAdminModal();
            mountTicketDetail(detail, data.ticket);
        });
    }

    function refreshOpenTicketDetail(ticketId, options) {
        var opts = options || {};
        var id = parseInt(String(ticketId || '0'), 10);
        if (!id) {
            return Promise.resolve();
        }
        return apiGet('tickets.php?id=' + encodeURIComponent(String(id))).then(function (data) {
            if (!data || !data.ticket) {
                return;
            }
            var modal = document.querySelector('[data-admin-modal]');
            if (!modal || modal.hidden) {
                return;
            }
            var body = modal.querySelector('[data-admin-modal-body]');
            if (!body || parseInt(body.getAttribute('data-admin-ticket-detail-id') || '0', 10) !== id) {
                return;
            }
            var live = global.CapsulePortalTicketLive;
            var nextFp = live ? live.detailFingerprint(data.ticket) : '';
            var prevFp = body.getAttribute('data-ticket-fingerprint') || '';
            if (prevFp === nextFp) {
                return;
            }
            var draft = '';
            var form = body.querySelector('[data-ticket-reply]');
            if (form && form.body) {
                draft = String(form.body.value || '');
            }
            body.innerHTML = renderTicketDetail(data.ticket);
            body.setAttribute('data-admin-ticket-detail-id', String(data.ticket.id));
            body.setAttribute('data-ticket-fingerprint', nextFp);
            bindTicketDetail(body);
            if (draft) {
                form = body.querySelector('[data-ticket-reply]');
                if (form && form.body) {
                    form.body.value = draft;
                }
            }
            if (!opts.silent && live && live.lastMessageRole(data.ticket) === 'user') {
                notifyAdminUserReply(data.ticket, { silent: false });
            }
            var log = body.querySelector('.portal-admin-ticket-thread, .portal-account-ticket-messages');
            if (log) {
                log.scrollTop = log.scrollHeight;
            }
        });
    }

    function pollAdminTickets(options) {
        var opts = options || {};
        var live = global.CapsulePortalTicketLive;
        var prevMap = {};
        (lastTicketsData || []).forEach(function (ticket) {
            if (ticket && ticket.id != null && live) {
                prevMap[String(ticket.id)] = live.listFingerprint(ticket);
            }
        });
        return refreshTicketBadge().then(function (tickets) {
            tickets.forEach(function (ticket) {
                if (!ticket || ticket.id == null || !live) {
                    return;
                }
                var id = String(ticket.id);
                var prev = prevMap[id];
                var next = live.listFingerprint(ticket);
                if (prev && prev !== next && ticket.awaitingAdmin) {
                    notifyAdminUserReply(ticket, { silent: opts.initial });
                }
            });
            if (currentView === 'tickets') {
                var panel = document.querySelector('[data-admin-panel="tickets"]');
                if (panel) {
                    refreshTicketListPanel(panel);
                }
            }
            var openId = getOpenTicketDetailId();
            if (openId > 0) {
                return refreshOpenTicketDetail(openId, { silent: true });
            }
        });
    }

    var ticketPollTimer = null;
    var TICKET_POLL_MS = 6000;

    function startTicketPolling() {
        if (ticketPollTimer) {
            return;
        }
        pollAdminTickets({ initial: true });
        pollAdminSubscriptions({ initial: true, force: true });
        ticketPollTimer = setInterval(function () {
            if (document.hidden) {
                return;
            }
            pollAdminTickets({ auto: true });
            pollAdminSubscriptions({ auto: true });
        }, TICKET_POLL_MS);
    }

    function stopTicketPolling() {
        if (ticketPollTimer) {
            clearInterval(ticketPollTimer);
            ticketPollTimer = null;
        }
    }

    function refreshSubscriptionsPanel(panel) {
        if (!panel) {
            return;
        }
        panel.innerHTML = renderSubscriptions({ subscriptions: lastSubscriptionsData });
        bindPanel('subscriptions', panel);
    }

    function refreshDashboardSubscriptionBlocks(panel) {
        if (!panel) {
            return;
        }
        var live = global.CapsulePortalSubscriptionLive;
        if (!live || typeof live.listSummary !== 'function') {
            return;
        }
        var summary = live.listSummary(lastSubscriptionsData);
        var kpi = panel.querySelector('[data-admin-kpi="subscribersActive"] .portal-admin-kpi-value');
        if (kpi) {
            kpi.textContent = String(summary.activeCount);
        }
        var chartEl = panel.querySelector('[data-admin-subscription-chart]');
        if (chartEl) {
            chartEl.innerHTML = subscriptionDonut(summary.byStatus);
        }
    }

    function pollAdminSubscriptions(options) {
        var opts = options || {};
        var live = global.CapsulePortalSubscriptionLive;
        return apiGet('subscriptions.php').then(function (data) {
            var subs = data.subscriptions || [];
            var fp = live && typeof live.listFingerprint === 'function'
                ? live.listFingerprint(subs)
                : String(subs.length);
            if (fp !== lastSubscriptionsFingerprint || opts.force) {
                lastSubscriptionsFingerprint = fp;
                lastSubscriptionsData = subs;
                if (currentView === 'subscriptions') {
                    refreshSubscriptionsPanel(document.querySelector('[data-admin-panel="subscriptions"]'));
                }
                if (currentView === 'dashboard') {
                    refreshDashboardSubscriptionBlocks(document.querySelector('[data-admin-panel="dashboard"]'));
                }
            }
            return subs;
        }).catch(function () {
            return lastSubscriptionsData || [];
        });
    }

    var OS_TABS = [
        { id: 'active', label: 'Actif', statuses: ['active'] },
        { id: 'planned', label: 'À venir', statuses: ['planned'] },
        { id: 'dev', label: 'En dev', statuses: ['stub', 'hidden', 'beta', 'deprecated', 'archived'] },
    ];

    var OS_SORT_OPTIONS = [
        { id: 'order', label: 'Ordre portail' },
        { id: 'name', label: 'Nom (A→Z)' },
        { id: 'family', label: 'Famille' },
        { id: 'id', label: 'ID' },
    ];

    var OS_STATUS_OPTIONS = [
        { value: 'active', label: 'Actif' },
        { value: 'planned', label: 'À venir' },
        { value: 'stub', label: 'En dev' },
    ];

    var lastOsData = [];
    var activeOsTab = 'active';
    var activeOsSort = 'order';
    var activeOsSearch = '';

    var lastModulesData = [];
    var lastModulesSource = '';

    var lastOffersData = null;

    var lastEntitlementsData = null;

    var lastGradesData = null;

    var lastLegalData = [];

    var lastAccessibilityData = null;

    var GRADE_PERMISSION_META = {
        osQuotaUnlimited: { label: 'Quota OS illimité', icon: 'fa-infinity' },
        storeBrowse: { label: 'Parcourir le magasin', icon: 'fa-store' },
        storeAppLaunch: { label: 'Lancer les apps du store', icon: 'fa-rocket' },
        storeModules: { label: 'Modules du store', icon: 'fa-puzzle-piece' },
        pedagogicalModules: { label: 'Modules pédagogiques', icon: 'fa-graduation-cap' },
        showGamification: { label: 'Gamification visible', icon: 'fa-trophy' },
        persistSkinSaves: { label: 'Sauvegarde des skins', icon: 'fa-floppy-disk' },
        canPurchaseModules: { label: 'Achat de modules', icon: 'fa-cart-shopping' },
    };

    /** Grade id → clé permissions dans portal-grades.json (GradeResolver). */
    var GRADE_PERM_KEYS = {
        utilisateur: 'utilisateur',
        abonne: 'abonne',
        eleve: 'eleve_active',
    };

    var MODULE_BILLING_LABELS = {
        subscription: 'Abonnement',
        purchase: 'Achat',
        free: 'Gratuit',
        class: 'Classe',
        account: 'Compte',
    };

    var ROLE_TOGGLES = [
        { id: 'createur', label: 'Créateur', icon: 'fa-wand-magic-sparkles' },
        { id: 'professeur', label: 'Professeur', icon: 'fa-chalkboard-user' },
        { id: 'administrateur', label: 'Administrateur', icon: 'fa-shield-halved' },
    ];

    var CONTENT_SECTION_LABELS = {
        hero: 'Bannière d\'accueil',
        about: 'À propos',
        parcours: 'Parcours pédagogiques',
    };

    var lastContentData = null;

    var CONTENT_FIELD_LABELS = {
        title: 'Titre',
        lead: 'Introduction',
        eyebrow: 'Surtitre',
        ctaLabel: 'Libellé du bouton principal',
        ctaHref: 'Lien du bouton principal',
        secondaryLabel: 'Libellé du lien secondaire',
        secondaryHref: 'Lien secondaire',
    };

    var CONTENT_FEATURE_ICONS = [
        { id: 'cloud-arrow-up', label: 'Nuage / apprentissage' },
        { id: 'desktop', label: 'Bureau / OS' },
        { id: 'feather', label: 'Léger' },
        { id: 'wifi', label: 'Connexion / hors ligne' },
        { id: 'gamepad', label: 'Jeu' },
        { id: 'graduation-cap', label: 'Formation' },
        { id: 'rocket', label: 'Lancement' },
        { id: 'puzzle-piece', label: 'Puzzle' },
        { id: 'book', label: 'Livre' },
        { id: 'bolt', label: 'Rapidité' },
        { id: 'leaf', label: 'Écologie' },
        { id: 'globe', label: 'Web / monde' },
        { id: 'users', label: 'Communauté' },
        { id: 'shield-halved', label: 'Sécurité' },
        { id: 'lock', label: 'Verrouillage' },
        { id: 'star', label: 'Étoile' },
        { id: 'heart', label: 'Cœur' },
        { id: 'check', label: 'Validé' },
        { id: 'arrows-rotate', label: 'Synchronisation' },
        { id: 'download', label: 'Téléchargement' },
        { id: 'laptop', label: 'Ordinateur portable' },
        { id: 'mobile-screen', label: 'Mobile' },
        { id: 'compass', label: 'Exploration' },
        { id: 'lightbulb', label: 'Idée' },
    ];

    function normalizeContentFeatureIcon(icon) {
        var key = String(icon || 'check').trim().toLowerCase();
        var i;
        for (i = 0; i < CONTENT_FEATURE_ICONS.length; i += 1) {
            if (CONTENT_FEATURE_ICONS[i].id === key) {
                return key;
            }
        }
        return 'check';
    }

    function contentFeatureIconSelect(current) {
        var icon = normalizeContentFeatureIcon(current);
        var html = '<label class="portal-admin-list-editor-icon-field"><span class="sr-only">Icône</span>';
        html += '<span class="portal-admin-list-editor-icon-preview" data-list-icon-preview><i class="fa-solid fa-' + escapeHtml(icon) + '" aria-hidden="true"></i></span>';
        html += '<select class="portal-input" data-list-field="icon">';
        CONTENT_FEATURE_ICONS.forEach(function (opt) {
            html += '<option value="' + escapeHtml(opt.id) + '"' + (opt.id === icon ? ' selected' : '') + '>' + escapeHtml(opt.label) + '</option>';
        });
        return html + '</select></label>';
    }

    var lastClassesData = [];
    var auditFilterAction = '';
    var auditOffset = 0;
    var auditPageSize = 50;
    var lastAuditEntries = [];
    var usageOffset = 0;
    var progressOffset = 0;
    var gamificationOffset = 0;
    var usersOffset = 0;
    var usersPageSize = 50;

    function apiBase() {
        return '/portal/api/admin/';
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** Libellé anonymisé (#XXXXX façon Discord). */
    function userPublicLabel(user) {
        if (!user) {
            return 'Utilisateur';
        }
        var publicId = user.publicId || user.public_id || user.userPublicId
            || user.teacherPublicId || user.actorPublicId || '';
        if (publicId) {
            return '#' + String(publicId);
        }
        var id = user.id || user.userId || user.user_id || 0;
        return id ? ('#' + id) : 'Utilisateur';
    }

    function panelEl(viewId) {
        return document.querySelector('[data-admin-panel="' + viewId + '"]');
    }

    function apiGet(endpoint) {
        return fetch(apiBase() + endpoint, { credentials: 'same-origin', cache: 'no-store' })
            .then(function (r) {
                return r.json().then(function (data) {
                    if (!r.ok) {
                        throw new Error(data.error || ('Erreur API (' + r.status + ')'));
                    }
                    return data;
                });
            });
    }

    function apiPost(endpoint, body) {
        var payload = Object.assign({}, body || {}, { _csrf: csrf });
        return fetch(apiBase() + endpoint, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
            body: JSON.stringify(payload),
        }).then(function (r) { return r.json(); });
    }

    function navTo(viewId) {
        if (global.CapsulePortalAdminNav && typeof global.CapsulePortalAdminNav.activate === 'function') {
            global.CapsulePortalAdminNav.activate(viewId);
        }
    }

    var lastModalTrigger = null;

    function ensureAdminModal() {
        var modal = document.querySelector('[data-admin-modal]');
        if (modal) {
            return modal;
        }
        modal = document.createElement('div');
        modal.className = 'portal-admin-modal';
        modal.setAttribute('data-admin-modal', '');
        modal.hidden = true;
        modal.innerHTML =
            '<div class="portal-admin-modal-overlay" data-admin-modal-close></div>'
            + '<div class="portal-admin-modal-dialog" role="dialog" aria-modal="true">'
            + '<button type="button" class="portal-admin-modal-close" data-admin-modal-close aria-label="Fermer">'
            + '<i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'
            + '<div class="portal-admin-modal-body portal-admin-panel portal-admin-panel--detail" data-admin-modal-body tabindex="-1"></div>'
            + '</div>';
        document.body.appendChild(modal);
        modal.querySelectorAll('[data-admin-modal-close]').forEach(function (el) {
            el.addEventListener('click', closeAdminModal);
        });
        document.addEventListener('keydown', function (ev) {
            if (ev.key === 'Escape' && !modal.hidden) {
                closeAdminModal();
            }
        });
        return modal;
    }

    function mountTicketDetail(detail, ticket) {
        if (!detail || !ticket) {
            return;
        }
        detail.innerHTML = renderTicketDetail(ticket);
        detail.setAttribute('data-admin-ticket-detail-id', String(ticket.id));
        var live = global.CapsulePortalTicketLive;
        if (live) {
            detail.setAttribute('data-ticket-fingerprint', live.detailFingerprint(ticket));
        }
        bindTicketDetail(detail);
    }

    function openAdminModal() {
        lastModalTrigger = document.activeElement;
        var modal = ensureAdminModal();
        modal.hidden = false;
        document.body.classList.add('portal-admin-modal-open');
        var dialog = modal.querySelector('.portal-admin-modal-dialog');
        if (dialog) {
            dialog.className = 'portal-admin-modal-dialog';
        }
        var body = modal.querySelector('[data-admin-modal-body]');
        body.scrollTop = 0;
        body.innerHTML = '';
        return body;
    }

    function closeAdminModal() {
        var modal = document.querySelector('[data-admin-modal]');
        if (!modal || modal.hidden) {
            return;
        }
        modal.hidden = true;
        document.body.classList.remove('portal-admin-modal-open');
        var body = modal.querySelector('[data-admin-modal-body]');
        if (body) {
            body.innerHTML = '';
            body.removeAttribute('data-admin-ticket-detail-id');
            body.removeAttribute('data-ticket-fingerprint');
        }
        if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
            lastModalTrigger.focus();
        }
        lastModalTrigger = null;
    }

    function adminSaveToast(opts) {
        opts = opts || {};
        var live = global.CapsulePortalTicketLive;
        if (!live || typeof live.showToast !== 'function') {
            return;
        }
        live.showToast({
            title: opts.title || 'Enregistrement réussi',
            message: opts.message || 'Les modifications ont été sauvegardées.',
            icon: 'fa-circle-check',
            variant: 'success',
            durationMs: 4000,
        });
    }

    function adminConfirm(opts) {
        opts = opts || {};
        return new Promise(function (resolve) {
            var trigger = document.activeElement;
            var modal = document.createElement('div');
            modal.className = 'portal-admin-modal portal-admin-confirm';
            modal.innerHTML =
                '<div class="portal-admin-modal-overlay" data-confirm-cancel></div>'
                + '<div class="portal-admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="portal-admin-confirm-title" aria-describedby="portal-admin-confirm-message">'
                + '<div class="portal-admin-confirm-icon' + (opts.danger ? ' portal-admin-confirm-icon--danger' : '') + '"><i class="fa-solid ' + escapeHtml(opts.icon || 'fa-triangle-exclamation') + '" aria-hidden="true"></i></div>'
                + '<h2 class="portal-admin-confirm-title" id="portal-admin-confirm-title">' + escapeHtml(opts.title || 'Confirmer') + '</h2>'
                + '<p class="portal-admin-confirm-message" id="portal-admin-confirm-message">' + (opts.messageHtml || escapeHtml(opts.message || '')) + '</p>'
                + '<div class="portal-admin-confirm-actions">'
                + '<button type="button" class="portal-account-btn portal-account-btn--compact" data-confirm-cancel>' + escapeHtml(opts.cancelLabel || 'Annuler') + '</button>'
                + '<button type="button" class="portal-account-btn portal-account-btn--compact ' + (opts.danger ? 'portal-account-btn--danger' : 'portal-account-btn--primary') + '" data-confirm-ok>' + escapeHtml(opts.confirmLabel || 'Confirmer') + '</button>'
                + '</div></div>';
            document.body.appendChild(modal);
            document.body.classList.add('portal-admin-modal-open');

            function cleanup(result) {
                document.removeEventListener('keydown', onKey, true);
                modal.remove();
                var detailModal = document.querySelector('[data-admin-modal]');
                if (!detailModal || detailModal.hidden) {
                    document.body.classList.remove('portal-admin-modal-open');
                }
                if (trigger && typeof trigger.focus === 'function') {
                    trigger.focus();
                }
                resolve(result);
            }

            function onKey(ev) {
                if (ev.key === 'Escape') {
                    ev.stopPropagation();
                    cleanup(false);
                }
            }

            modal.querySelectorAll('[data-confirm-cancel]').forEach(function (el) {
                el.addEventListener('click', function () { cleanup(false); });
            });
            modal.querySelector('[data-confirm-ok]').addEventListener('click', function () { cleanup(true); });
            document.addEventListener('keydown', onKey, true);
            var cancelBtn = modal.querySelector('[data-confirm-cancel]');
            if (cancelBtn) {
                cancelBtn.focus();
            }
        });
    }

    function adminMessageForm(opts) {
        opts = opts || {};
        return new Promise(function (resolve) {
            var trigger = document.activeElement;
            var modal = document.createElement('div');
            modal.className = 'portal-admin-modal portal-admin-confirm portal-admin-message-form';
            modal.innerHTML =
                '<div class="portal-admin-modal-overlay" data-msgform-cancel></div>'
                + '<div class="portal-admin-confirm-dialog portal-admin-message-form-dialog" role="dialog" aria-modal="true" aria-labelledby="portal-admin-msgform-title">'
                + '<div class="portal-admin-confirm-icon' + (opts.danger ? ' portal-admin-confirm-icon--danger' : '') + '"><i class="fa-solid ' + escapeHtml(opts.icon || 'fa-pen-to-square') + '" aria-hidden="true"></i></div>'
                + '<h2 class="portal-admin-confirm-title" id="portal-admin-msgform-title">' + escapeHtml(opts.title || 'Message au créateur') + '</h2>'
                + (opts.intro ? '<p class="portal-admin-confirm-message">' + escapeHtml(opts.intro) + '</p>' : '')
                + '<form class="portal-form portal-admin-message-form-inner" data-msgform-form>'
                + '<label class="portal-field"><span>' + escapeHtml(opts.label || 'Message') + '</span>'
                + '<textarea class="portal-input" name="message" rows="5" maxlength="4000" required placeholder="' + escapeHtml(opts.placeholder || '') + '"></textarea></label>'
                + '<div class="portal-admin-confirm-actions">'
                + '<button type="button" class="portal-account-btn portal-account-btn--compact" data-msgform-cancel>' + escapeHtml(opts.cancelLabel || 'Annuler') + '</button>'
                + '<button type="submit" class="portal-account-btn portal-account-btn--compact ' + (opts.danger ? 'portal-account-btn--danger' : 'portal-account-btn--primary') + '">' + escapeHtml(opts.submitLabel || 'Envoyer') + '</button>'
                + '</div></form></div>';
            document.body.appendChild(modal);
            document.body.classList.add('portal-admin-modal-open');

            function cleanup(result) {
                document.removeEventListener('keydown', onKey, true);
                modal.remove();
                var detailModal = document.querySelector('[data-admin-modal]');
                if (!detailModal || detailModal.hidden) {
                    document.body.classList.remove('portal-admin-modal-open');
                }
                if (trigger && typeof trigger.focus === 'function') {
                    trigger.focus();
                }
                resolve(result);
            }

            function onKey(ev) {
                if (ev.key === 'Escape') {
                    ev.stopPropagation();
                    cleanup(null);
                }
            }

            modal.querySelectorAll('[data-msgform-cancel]').forEach(function (el) {
                el.addEventListener('click', function () { cleanup(null); });
            });
            document.addEventListener('keydown', onKey, true);
            var form = modal.querySelector('[data-msgform-form]');
            var textarea = form ? form.querySelector('textarea') : null;
            if (textarea) {
                textarea.focus();
            }
            if (form) {
                form.addEventListener('submit', function (ev) {
                    ev.preventDefault();
                    var message = textarea ? textarea.value.trim() : '';
                    if (!message) {
                        if (textarea) {
                            textarea.focus();
                        }
                        return;
                    }
                    cleanup(message);
                });
            }
        });
    }

    function formatDate(raw) {
        if (!raw) {
            return '';
        }
        var d = new Date(raw);
        if (isNaN(d.getTime())) {
            return String(raw);
        }
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function formatInt(value) {
        var n = Number(value);
        if (!isFinite(n)) {
            n = 0;
        }
        return n.toLocaleString('fr-FR');
    }

    function statusLabel(status) {
        var key = String(status || '').toLowerCase();
        return STATUS_LABELS[key] || String(status || '');
    }

    function auditLabel(action) {
        return AUDIT_LABELS[String(action || '')] || String(action || '').replace(/_/g, ' ');
    }

    function auditTargetLabel(targetType, targetId) {
        var typeKey = String(targetType || '').toLowerCase();
        var typeLabel = AUDIT_TARGET_LABELS[typeKey] || (typeKey ? typeKey.charAt(0).toUpperCase() + typeKey.slice(1) : 'Cible');
        var id = String(targetId || '').trim();
        if (!id) {
            return typeLabel;
        }
        return typeLabel + ' #' + id;
    }

    function auditPayloadHint(action, payload) {
        payload = payload || {};
        if (action === 'subscription_set_status' && payload.status) {
            return subscriptionLabel(payload.status);
        }
        if (action === 'os_update_status' && payload.status) {
            return osStatusLabel(payload.status);
        }
        if ((action === 'grant_role' || action === 'revoke_role') && payload.role) {
            return gradeLabel(payload.role);
        }
        if (action === 'set_account_status' && payload.status) {
            return payload.status === 'suspended' ? 'Désactivé' : 'Actif';
        }
        if (action === 'delete_user' && payload.email) {
            return payload.email;
        }
        if (action === 'update_email' && payload.email) {
            return payload.email;
        }
        if (action === 'update_display_name' && payload.displayName) {
            return payload.displayName;
        }
        return '';
    }

    var AUDIT_PAYLOAD_LABELS = {
        email: 'E-mail',
        displayName: 'Nom affiché',
        role: 'Rôle',
        status: 'Statut',
        max: 'Maximum',
        mountId: 'Module',
        registryId: 'Système',
        classroomId: 'Classe',
        ticketId: 'Ticket',
    };

    function auditPayloadKeyLabel(key) {
        return AUDIT_PAYLOAD_LABELS[key] || String(key || '').replace(/_/g, ' ');
    }

    function auditPayloadValueLabel(key, value) {
        if (value === null || value === undefined || value === '') {
            return '—';
        }
        if (key === 'role') {
            return gradeLabel(String(value));
        }
        if (key === 'status' && typeof value === 'string') {
            return subscriptionLabel(value) || statusLabel(value) || value;
        }
        if (typeof value === 'boolean') {
            return value ? 'Oui' : 'Non';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    }

    function auditTargetSummary(entry) {
        var summary = auditTargetLabel(entry.targetType, entry.targetId);
        var hint = auditPayloadHint(entry.action, entry.payload);
        if (hint) {
            summary += ' · ' + hint;
        }
        return summary;
    }

    function renderAuditDetail(entry) {
        if (!entry) {
            return '<p class="portal-admin-empty">Entrée introuvable.</p>';
        }
        var html = '<h2 class="portal-admin-panel-title">' + escapeHtml(auditLabel(entry.action)) + '</h2>';
        html += '<p class="portal-admin-meta">#' + escapeHtml(entry.id) + ' · ' + escapeHtml(formatDate(entry.createdAt)) + '</p>';
        html += '<dl class="portal-admin-dl portal-admin-dl--audit">';
        html += '<dt>Acteur</dt><dd><code>' + escapeHtml(userPublicLabel({ publicId: entry.actorPublicId, id: entry.actorUserId })) + '</code>';
        if (entry.actorEmail) {
            html += '<br><span class="portal-admin-cell-muted">' + escapeHtml(entry.actorEmail) + '</span>';
        }
        html += '</dd>';
        html += '<dt>Cible</dt><dd>' + escapeHtml(auditTargetLabel(entry.targetType, entry.targetId)) + '</dd>';
        html += '<dt>Action</dt><dd><code>' + escapeHtml(entry.action) + '</code></dd>';
        html += '</dl>';
        var payload = entry.payload || {};
        var keys = Object.keys(payload);
        if (keys.length) {
            html += '<h3 class="portal-admin-toggle-group-title">Détails</h3>';
            html += '<dl class="portal-admin-dl portal-admin-dl--audit">';
            keys.forEach(function (key) {
                var val = auditPayloadValueLabel(key, payload[key]);
                html += '<dt>' + escapeHtml(auditPayloadKeyLabel(key)) + '</dt><dd>';
                if (String(val).indexOf('\n') !== -1) {
                    html += '<pre class="portal-admin-code-block">' + escapeHtml(val) + '</pre>';
                } else {
                    html += escapeHtml(val);
                }
                html += '</dd>';
            });
            html += '</dl>';
        } else {
            html += '<p class="portal-admin-empty">Aucun détail supplémentaire enregistré pour cette action.</p>';
        }
        return html;
    }

    function openAuditDetail(entryId) {
        var entry = lastAuditEntries.find(function (e) {
            return String(e.id) === String(entryId);
        });
        var body = openAdminModal();
        body.innerHTML = renderAuditDetail(entry);
        var dialog = body.closest('.portal-admin-modal-dialog');
        if (dialog) {
            dialog.classList.add('portal-admin-modal-dialog--audit');
        }
    }

    function auditActivityMeta(entry) {
        var actor = userPublicLabel({ publicId: entry.actorPublicId, id: entry.actorUserId });
        var target = auditTargetLabel(entry.targetType, entry.targetId);
        var hint = auditPayloadHint(entry.action, entry.payload);
        return actor + ' · ' + target + (hint ? ' · ' + hint : '');
    }

    function gradeLabel(gradeId) {
        var key = String(gradeId || 'utilisateur').toLowerCase();
        return GRADE_LABELS[key] || statusLabel(key) || String(gradeId || '');
    }

    function subscriptionLabel(status) {
        var key = String(status || 'none').toLowerCase();
        return SUBSCRIPTION_LABELS[key] || statusLabel(key) || String(status || '');
    }

    function gradeBadge(gradeId) {
        var key = String(gradeId || 'utilisateur').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        return '<span class="portal-admin-badge portal-admin-badge--grade-' + escapeHtml(key) + '">' + escapeHtml(gradeLabel(gradeId)) + '</span>';
    }

    function subscriptionBadge(status) {
        var key = String(status || 'none').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        return '<span class="portal-admin-badge portal-admin-badge--sub-' + escapeHtml(key) + '">' + escapeHtml(subscriptionLabel(status)) + '</span>';
    }

    function accountVerificationBadge(verified) {
        return '<span class="portal-admin-badge portal-admin-badge--account-' + (verified ? 'verifie' : 'non-verifie') + '">' + escapeHtml(verified ? 'Vérifié' : 'Non vérifié') + '</span>';
    }

    function primaryGradeId(user) {
        var grades = user.grades || [user.gradeId || 'utilisateur'];
        if (grades.indexOf('createur') !== -1) {
            return 'createur';
        }
        if (grades.indexOf('professeur') !== -1) {
            return 'professeur';
        }
        if (grades.indexOf('eleve') !== -1) {
            return 'eleve';
        }
        if (grades.indexOf('abonne') !== -1) {
            return 'abonne';
        }
        return 'utilisateur';
    }

    function isAdminUser(user) {
        return (user.roles || []).indexOf('administrateur') !== -1;
    }

    function filterUsersByTab(users, tab) {
        return (users || []).filter(function (u) {
            var roles = u.roles || [];
            var grades = u.grades || [u.gradeId || 'utilisateur'];
            if (tab === 'professeur') {
                return roles.indexOf('professeur') !== -1;
            }
            if (tab === 'createur') {
                return roles.indexOf('createur') !== -1;
            }
            if (tab === 'eleve') {
                return grades.indexOf('eleve') !== -1;
            }
            if (tab === 'abonne') {
                return grades.indexOf('abonne') !== -1 && roles.indexOf('professeur') === -1 && roles.indexOf('createur') === -1;
            }
            if (tab === 'utilisateur') {
                return grades.indexOf('utilisateur') !== -1 && grades.indexOf('eleve') === -1 && roles.indexOf('professeur') === -1 && roles.indexOf('createur') === -1;
            }
            return true;
        });
    }

    function filterUsersForPanel(users, mode, tab) {
        var scoped = (users || []).filter(function (u) {
            return mode === 'admins' ? isAdminUser(u) : !isAdminUser(u);
        });
        return mode === 'admins' ? scoped : filterUsersByTab(scoped, tab);
    }

    function isTicketClosed(status) {
        var s = String(status || '').toLowerCase();
        return s === 'clos' || s === 'ferme' || s === 'fermé' || s === 'closed';
    }

    function isTicketNew(status) {
        return String(status || '').toLowerCase() === 'ouvert';
    }

    function isTicketInProgress(status) {
        return String(status || '').toLowerCase() === 'en_cours';
    }

    function filterTicketsByTab(tickets, tab) {
        return (tickets || []).filter(function (t) {
            if (tab === 'nouveau') {
                return isTicketNew(t.status);
            }
            if (tab === 'en_cours') {
                return isTicketInProgress(t.status);
            }
            if (tab === 'ferme') {
                return isTicketClosed(t.status);
            }
            return true;
        });
    }

    function subscriptionStatusSelect(userId, current) {
        var cur = String(current || 'none');
        var html = '<select class="portal-input portal-input--compact" data-sub-status="' + escapeHtml(userId) + '" data-current-status="' + escapeHtml(cur) + '">';
        SUBSCRIPTION_OPTIONS.forEach(function (opt) {
            html += '<option value="' + escapeHtml(opt.value) + '"' + (opt.value === cur ? ' selected' : '') + '>' + escapeHtml(opt.label) + '</option>';
        });
        return html + '</select>';
    }

    function moduleAccessSelect(mountId, current) {
        var cur = String(current || 'subscriber');
        var html = '<select class="portal-input portal-input--compact" data-module-access="' + escapeHtml(mountId) + '" data-current-access="' + escapeHtml(cur) + '" title="Qui peut accéder au module">';
        MODULE_ACCESS_OPTIONS.forEach(function (opt) {
            html += '<option value="' + escapeHtml(opt.value) + '"' + (opt.value === cur ? ' selected' : '') + '>' + escapeHtml(opt.label) + '</option>';
        });
        return html + '</select>';
    }

    function moduleAccessLabel(access) {
        var cur = String(access || 'subscriber');
        for (var i = 0; i < MODULE_ACCESS_OPTIONS.length; i += 1) {
            if (MODULE_ACCESS_OPTIONS[i].value === cur) {
                return MODULE_ACCESS_OPTIONS[i].label;
            }
        }
        return cur;
    }

    function moduleBillingEditable(billingMode) {
        return billingMode === 'subscription' || billingMode === 'purchase';
    }

    function moduleAccessBadge(access) {
        return '<span class="portal-admin-badge portal-admin-badge--access">' + escapeHtml(moduleAccessLabel(access)) + '</span>';
    }

    function moduleBillingBadge(m) {
        var mode = String(m.billingMode || 'subscription');
        var label = MODULE_BILLING_LABELS[mode] || mode;
        if (mode === 'purchase') {
            var price = m.priceDisplay || m.priceRaw || '';
            return '<span class="portal-admin-badge portal-admin-badge--billing-paid">' + escapeHtml(price ? (label + ' · ' + price) : label) + '</span>';
        }
        return '<span class="portal-admin-badge">' + escapeHtml(label) + '</span>';
    }

    function moduleCatalogBadge(inStore) {
        return inStore
            ? '<span class="portal-admin-badge portal-admin-badge--visible">Visible</span>'
            : '<span class="portal-admin-badge portal-admin-badge--masque">Masqué</span>';
    }

    function adminToggleRow(opts) {
        opts = opts || {};
        var checked = opts.checked ? ' checked' : '';
        var attrs = '';
        Object.keys(opts.attrs || {}).forEach(function (key) {
            attrs += ' ' + key + '="' + escapeHtml(opts.attrs[key]) + '"';
        });
        return '<label class="portal-admin-toggle-row">' +
            '<span class="portal-admin-toggle-row-label">' +
            (opts.icon ? '<i class="fa-solid ' + escapeHtml(opts.icon) + '" aria-hidden="true"></i> ' : '') +
            escapeHtml(opts.label) + '</span>' +
            '<span class="portal-admin-switch">' +
            '<input type="checkbox" class="portal-admin-switch-input"' + checked + attrs + '>' +
            '<span class="portal-admin-switch-track" aria-hidden="true"></span>' +
            '</span></label>';
    }

    function listEditorRow(variant, item) {
        var rowClass = 'portal-admin-list-editor-row';
        if (variant === 'feature') {
            rowClass += ' portal-admin-list-editor-row--feature';
        }
        var html = '<div class="' + rowClass + '"><div class="portal-admin-list-editor-fields">';
        if (variant === 'feature') {
            var title = item && item.title ? item.title : '';
            var description = item && item.description ? item.description : '';
            html += contentFeatureIconSelect(item && item.icon ? item.icon : 'check');
            html += '<input class="portal-input" data-list-field="title" value="' + escapeHtml(title) + '" placeholder="Titre">';
            html += '<input class="portal-input" data-list-field="description" value="' + escapeHtml(description) + '" placeholder="Description (facultatif)">';
        } else if (variant === 'pair') {
            var title = item && item.title ? item.title : '';
            var description = item && item.description ? item.description : '';
            html += '<input class="portal-input" data-list-field="title" value="' + escapeHtml(title) + '" placeholder="Titre">';
            html += '<input class="portal-input" data-list-field="description" value="' + escapeHtml(description) + '" placeholder="Description (facultatif)">';
        } else {
            var value = typeof item === 'string' ? item : ((item && item.value) ? item.value : '');
            html += '<input class="portal-input" data-list-field="value" value="' + escapeHtml(value) + '" placeholder="Saisir une ligne…">';
        }
        html += '</div><button type="button" class="portal-admin-list-editor-remove" data-list-remove aria-label="Supprimer cet élément"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>';
        return html + '</div>';
    }

    function listEditor(opts) {
        opts = opts || {};
        var variant = opts.variant === 'feature' ? 'feature' : (opts.variant === 'pair' ? 'pair' : 'simple');
        var items = opts.items || [];
        var html = '<div class="portal-admin-list-editor" data-list-editor data-variant="' + variant + '">';
        html += '<div class="portal-admin-list-editor-rows" data-list-editor-rows>';
        items.forEach(function (item) {
            html += listEditorRow(variant, item);
        });
        html += '</div>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-admin-list-editor-add" data-list-add><i class="fa-solid fa-plus" aria-hidden="true"></i> ' + escapeHtml(opts.addLabel || 'Ajouter') + '</button>';
        html += '<template data-list-editor-template>' + listEditorRow(variant, null) + '</template>';
        return html + '</div>';
    }

    function bindListEditor(root, opts) {
        opts = opts || {};
        if (!root || root.dataset.listEditorBound === '1') {
            return;
        }
        root.dataset.listEditorBound = '1';
        var rows = root.querySelector('[data-list-editor-rows]');
        var tpl = root.querySelector('[data-list-editor-template]');
        var addBtn = root.querySelector('[data-list-add]');
        if (addBtn && rows && tpl) {
            addBtn.addEventListener('click', function () {
                var wrap = document.createElement('div');
                wrap.innerHTML = tpl.innerHTML.trim();
                var row = wrap.firstChild;
                if (!row) {
                    return;
                }
                rows.appendChild(row);
                var input = row.querySelector('input');
                if (input) {
                    input.focus();
                }
            });
        }
        root.addEventListener('click', function (ev) {
            var removeBtn = ev.target.closest('[data-list-remove]');
            if (!removeBtn || !root.contains(removeBtn)) {
                return;
            }
            var row = removeBtn.closest('.portal-admin-list-editor-row');
            if (!row) {
                return;
            }
            function removeRow() {
                if (row.parentNode) {
                    row.parentNode.removeChild(row);
                }
            }
            if (!opts.confirmRemove) {
                removeRow();
                return;
            }
            var itemLabel = opts.removeItemLabel || 'cet élément';
            adminConfirm({
                title: 'Supprimer l\u2019élément',
                message: 'Voulez-vous supprimer ' + itemLabel + ' de la liste ?',
                confirmLabel: 'Supprimer',
                cancelLabel: 'Annuler',
                icon: 'fa-trash-can',
                danger: true,
            }).then(function (ok) {
                if (ok) {
                    removeRow();
                }
            });
        });
        root.addEventListener('change', function (ev) {
            var sel = ev.target.closest('[data-list-field="icon"]');
            if (!sel || !root.contains(sel)) {
                return;
            }
            var iconRow = sel.closest('.portal-admin-list-editor-row');
            var previewIcon = iconRow ? iconRow.querySelector('[data-list-icon-preview] i') : null;
            if (previewIcon) {
                previewIcon.className = 'fa-solid fa-' + normalizeContentFeatureIcon(sel.value);
            }
        });
    }

    function readListEditor(root, variant) {
        var out = [];
        if (!root) {
            return out;
        }
        root.querySelectorAll('.portal-admin-list-editor-row').forEach(function (row) {
            if (variant === 'feature') {
                var featureTitleEl = row.querySelector('[data-list-field="title"]');
                var featureDescEl = row.querySelector('[data-list-field="description"]');
                var iconEl = row.querySelector('[data-list-field="icon"]');
                var featureTitle = featureTitleEl ? featureTitleEl.value.trim() : '';
                var featureDescription = featureDescEl ? featureDescEl.value.trim() : '';
                if (featureTitle) {
                    out.push({
                        title: featureTitle,
                        description: featureDescription,
                        icon: normalizeContentFeatureIcon(iconEl ? iconEl.value : 'check'),
                    });
                }
            } else if (variant === 'pair') {
                var titleEl = row.querySelector('[data-list-field="title"]');
                var descEl = row.querySelector('[data-list-field="description"]');
                var title = titleEl ? titleEl.value.trim() : '';
                var description = descEl ? descEl.value.trim() : '';
                if (title) {
                    out.push({ title: title, description: description });
                }
            } else {
                var valueEl = row.querySelector('[data-list-field="value"]');
                var value = valueEl ? valueEl.value.trim() : '';
                if (value) {
                    out.push(value);
                }
            }
        });
        return out;
    }

    function statusBadge(status) {
        var key = String(status || 'default').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        var label = statusLabel(status);
        return '<span class="portal-admin-badge portal-admin-badge--' + escapeHtml(key) + '">' + escapeHtml(label) + '</span>';
    }

    function kpiCard(opts) {
        opts = opts || {};
        var tag = opts.href ? 'a' : 'div';
        var href = opts.href ? ' href="#' + escapeHtml(opts.href) + '" data-admin-kpi-link="' + escapeHtml(opts.href) + '"' : '';
        var kpiId = opts.kpiId ? ' data-admin-kpi="' + escapeHtml(opts.kpiId) + '"' : '';
        var toneClass = opts.tone ? ' portal-admin-kpi-icon--' + escapeHtml(opts.tone) : '';
        var hint = '';
        if (opts.trendUp && opts.hint) {
            hint = '<span class="portal-admin-kpi-trend portal-admin-kpi-trend--up"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i> ' + escapeHtml(opts.hint) + '</span>';
        } else if (opts.hint) {
            hint = '<span class="portal-admin-kpi-hint">' + escapeHtml(opts.hint) + '</span>';
        }
        return '<' + tag + ' class="portal-admin-kpi"' + href + kpiId + '>' +
            '<span class="portal-admin-kpi-icon' + toneClass + '"><i class="fa-solid ' + escapeHtml(opts.icon || 'fa-chart-simple') + '" aria-hidden="true"></i></span>' +
            '<span class="portal-admin-kpi-body">' +
            '<span class="portal-admin-kpi-label">' + escapeHtml(opts.label) + '</span>' +
            '<strong class="portal-admin-kpi-value">' + escapeHtml(opts.value) + '</strong>' +
            hint +
            '</span></' + tag + '>';
    }

    function kpiStatusCard(opts) {
        opts = opts || {};
        var ok = opts.ok !== false;
        var dotClass = ok ? 'portal-admin-status-dot--ok' : 'portal-admin-status-dot--error';
        var label = ok ? 'Connectée' : 'Erreur';
        return '<div class="portal-admin-kpi portal-admin-kpi--status">' +
            '<span class="portal-admin-kpi-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>' +
            '<span class="portal-admin-kpi-body">' +
            '<span class="portal-admin-kpi-label">État de la base</span>' +
            '<strong class="portal-admin-kpi-value portal-admin-kpi-value--status">' +
            '<span class="portal-admin-status-dot ' + dotClass + '" aria-hidden="true"></span> ' +
            escapeHtml(label) +
            '</strong></span></div>';
    }

    function subscriptionChart(byStatus) {
        byStatus = byStatus || {};
        var order = [
            { key: 'active', label: 'Actifs', tone: 'success' },
            { key: 'none', label: 'Gratuits', tone: 'muted' },
            { key: 'past_due', label: 'Impayés', tone: 'warning' },
            { key: 'canceled', label: 'Annulés', tone: 'danger' },
        ];
        var total = order.reduce(function (sum, row) {
            return sum + (Number(byStatus[row.key]) || 0);
        }, 0);
        if (total === 0) {
            return '<p class="portal-admin-empty">Aucun abonnement enregistré.</p>';
        }
        var html = '<div class="portal-admin-chart-bars">';
        order.forEach(function (row) {
            var count = Number(byStatus[row.key]) || 0;
            var pct = Math.round((count / total) * 100);
            html += '<div class="portal-admin-chart-row">' +
                '<div class="portal-admin-chart-row-head">' +
                '<span>' + escapeHtml(row.label) + '</span>' +
                '<strong>' + count + ' <small>(' + pct + '%)</small></strong>' +
                '</div>' +
                '<div class="portal-admin-chart-track"><div class="portal-admin-chart-fill portal-admin-chart-fill--' + row.tone + '" style="width:' + pct + '%"></div></div>' +
                '</div>';
        });
        return html + '</div>';
    }

    function subscriptionDonut(byStatus) {
        byStatus = byStatus || {};
        var order = [
            { key: 'none', label: 'Gratuits', tone: 'muted', color: 'rgba(255, 255, 255, 0.35)' },
            { key: 'active', label: 'Abonnés payants', tone: 'success', color: '#3ecf8e' },
            { key: 'past_due', label: 'Impayés', tone: 'warning', color: '#f5b942' },
            { key: 'canceled', label: 'Annulés', tone: 'danger', color: '#f07178' },
        ];
        var total = order.reduce(function (sum, row) {
            return sum + (Number(byStatus[row.key]) || 0);
        }, 0);
        if (total === 0) {
            return '<p class="portal-admin-empty">Aucun abonnement enregistré.</p>';
        }
        var acc = 0;
        var stops = [];
        order.forEach(function (row) {
            var count = Number(byStatus[row.key]) || 0;
            if (count <= 0) {
                return;
            }
            var pct = (count / total) * 100;
            var start = acc;
            acc += pct;
            stops.push(row.color + ' ' + start.toFixed(2) + '% ' + acc.toFixed(2) + '%');
        });
        var gradient = stops.length ? 'conic-gradient(' + stops.join(', ') + ')' : 'transparent';
        var html = '<div class="portal-admin-donut-wrap">';
        html += '<div class="portal-admin-donut" style="background:' + gradient + '" role="img" aria-label="Répartition des abonnements">';
        html += '<div class="portal-admin-donut-hole"><strong>' + total + '</strong><span>comptes</span></div>';
        html += '</div>';
        html += '<ul class="portal-admin-donut-legend">';
        order.forEach(function (row) {
            var count = Number(byStatus[row.key]) || 0;
            var pct = total > 0 ? Math.round((count / total) * 100) : 0;
            html += '<li class="portal-admin-donut-legend-item">' +
                '<span class="portal-admin-donut-swatch portal-admin-donut-swatch--' + row.tone + '" aria-hidden="true"></span>' +
                '<span class="portal-admin-donut-legend-label">' + escapeHtml(row.label) + '</span>' +
                '<strong class="portal-admin-donut-legend-value">' + count + ' <small>(' + pct + '%)</small></strong>' +
                '</li>';
        });
        return html + '</ul></div>';
    }

    function activityFeed(audit, tickets) {
        var items = [];
        (audit || []).forEach(function (e) {
            items.push({
                type: 'audit',
                at: e.createdAt,
                title: auditLabel(e.action),
                meta: auditActivityMeta(e),
            });
        });
        (tickets || []).forEach(function (t) {
            items.push({
                type: 'ticket',
                at: t.createdAt,
                title: t.subject,
                meta: userPublicLabel({ publicId: t.userPublicId, id: t.userId }) + ' · ' + statusLabel(t.status || ''),
                id: t.id,
            });
        });
        items.sort(function (a, b) {
            return String(b.at || '').localeCompare(String(a.at || ''));
        });
        items = items.slice(0, 10);
        if (!items.length) {
            return '<p class="portal-admin-empty">Aucune activité récente.</p>';
        }
        var html = '<ul class="portal-admin-activity">';
        items.forEach(function (item) {
            var icon = item.type === 'audit' ? 'fa-clipboard-list' : 'fa-life-ring';
            var click = item.type === 'ticket' && item.id ? ' data-activity-ticket="' + item.id + '"' : '';
            html += '<li class="portal-admin-activity-item"' + click + '>' +
                '<span class="portal-admin-activity-icon"><i class="fa-solid ' + icon + '" aria-hidden="true"></i></span>' +
                '<div class="portal-admin-activity-body">' +
                '<strong>' + escapeHtml(item.title) + '</strong>' +
                '<span class="portal-admin-activity-meta">' + escapeHtml(item.meta) + '</span>' +
                '<time>' + escapeHtml(formatDate(item.at)) + '</time>' +
                '</div></li>';
        });
        return html + '</ul>';
    }

    function renderDashboard(data) {
        var convRate = data.usersTotal > 0
            ? Math.round((data.subscribersActive / data.usersTotal) * 100)
            : 0;
        var runtime = data.runtime || {};
        var dbOk = runtime.connected !== false;
        var pedagogyHint = (data.classroomMembers || 0) + ' élèves · ' + (data.professors || 0) + ' profs · ' + (data.creators || 0) + ' créateurs';
        var html = '<div class="portal-admin-dashboard">';
        html += '<div class="portal-admin-kpi-grid portal-admin-kpi-grid--6">';
        html += kpiCard({ label: 'Utilisateurs', value: String(data.usersTotal || 0), icon: 'fa-users', tone: 'blue', trendUp: true, hint: '+' + (data.usersNewWeek || 0) + ' cette semaine', href: 'users' });
        html += kpiCard({ label: 'Abonnements', value: String(data.subscribersActive || 0), icon: 'fa-credit-card', tone: 'green', hint: convRate + '% conversion', href: 'subscriptions', kpiId: 'subscribersActive' });
        html += kpiCard({ label: 'Support', value: String(data.ticketsOpen || 0), icon: 'fa-life-ring', tone: 'amber', hint: (data.ticketsAwaitingAdmin || 0) + ' en attente admin', href: 'tickets' });
        html += kpiCard({ label: 'Pédagogie', value: String(data.classroomsTotal || 0), icon: 'fa-graduation-cap', tone: 'violet', hint: pedagogyHint, href: 'classes' });
        html += kpiCard({ label: 'Catalogue', value: (data.catalogOsActive || 0) + '/' + (data.catalogOsTotal || 0), icon: 'fa-desktop', tone: 'blue', hint: (data.catalogModules || 0) + ' modules', href: 'os' });
        html += kpiStatusCard({ ok: dbOk });
        html += '</div>';

        html += '<div class="portal-admin-dashboard-grid">';
        html += '<div class="portal-admin-panel portal-admin-panel--chart">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Répartition des abonnements</h2>';
        html += '<button type="button" class="portal-admin-panel-link" data-admin-quick="subscriptions">Voir tout</button></div>';
        html += '<div data-admin-subscription-chart>';
        html += subscriptionDonut(data.subscriptionsByStatus);
        html += '</div>';
        html += '</div>';
        html += '<div class="portal-admin-panel">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Activité récente</h2>';
        html += '<button type="button" class="portal-admin-panel-link" data-admin-quick="audit">Journal</button></div>';
        html += activityFeed(data.recentAudit, data.recentTickets);
        html += '</div>';
        html += '</div>';

        html += '<div class="portal-admin-dashboard-grid portal-admin-dashboard-grid--tables">';
        html += '<div class="portal-admin-panel portal-admin-panel--grow">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Derniers tickets</h2>';
        html += '<button type="button" class="portal-admin-panel-link" data-admin-quick="tickets">Ouvrir</button></div>';
        html += ticketTable(data.recentTickets || [], true, { dashboard: true });
        html += '</div>';
        html += '<div class="portal-admin-panel portal-admin-panel--grow">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Derniers utilisateurs inscrits</h2>';
        html += '<button type="button" class="portal-admin-panel-link" data-admin-quick="users">Voir tout</button></div>';
        html += userTable((data.recentUsers || []).filter(function (u) { return !isAdminUser(u); }), true, { dashboard: true });
        html += '</div>';
        html += '</div>';

        html += '</div>';
        return html;
    }

    function userTable(users, compact, options) {
        options = options || {};
        if (!users.length) {
            return '<p class="portal-admin-empty">Aucun utilisateur.</p>';
        }
        var html = '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr>';
        if (options.dashboard) {
            html += '<th>Identifiant</th><th>Grade</th><th>Inscription</th>';
        } else {
            html += '<th>Identifiant</th><th>Grade</th><th>Abonnement</th>';
            if (!compact) {
                html += '<th>Compte</th><th>Inscription</th>';
            }
        }
        html += '</tr></thead><tbody>';
        users.forEach(function (u) {
            html += '<tr class="portal-admin-row-click" data-user-id="' + escapeHtml(u.id) + '">';
            html += '<td><code>' + escapeHtml(userPublicLabel(u)) + '</code></td>';
            html += '<td>' + gradeBadge(primaryGradeId(u)) + '</td>';
            if (options.dashboard) {
                html += '<td>' + escapeHtml(formatDate(u.createdAt)) + '</td>';
            } else {
                html += '<td>' + subscriptionBadge(u.subscriptionStatus || (u.subscription && u.subscription.status) || 'none') + '</td>';
                if (!compact) {
                    html += '<td>' + accountVerificationBadge(!!u.emailVerified) + '</td>';
                    html += '<td>' + escapeHtml(formatDate(u.createdAt)) + '</td>';
                }
            }
            html += '</tr>';
        });
        return html + '</tbody></table></div>';
    }

    function ticketTable(tickets, linkable, options) {
        options = options || {};
        if (!tickets.length) {
            return '<p class="portal-admin-empty">Aucun ticket.</p>';
        }
        var html = '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr>';
        if (options.dashboard) {
            html += '<th>ID</th><th>Sujet</th><th>Statut</th><th>Date</th>';
        } else {
            html += '<th>Sujet</th><th>Statut</th><th>Type</th>';
        }
        html += '</tr></thead><tbody>';
        tickets.forEach(function (t) {
            var cls = linkable ? ' class="portal-admin-row-click"' : '';
            var data = linkable ? ' data-ticket-id="' + t.id + '"' : '';
            html += '<tr' + cls + data + '>';
            if (options.dashboard) {
                var subject = String(t.subject || '');
                if (subject.length > 48) {
                    subject = subject.slice(0, 45) + '...';
                }
                html += '<td><code>#' + escapeHtml(String(t.id)) + '</code></td>';
                html += '<td><strong>' + escapeHtml(subject) + '</strong></td>';
                html += '<td>' + statusBadge(t.status) + '</td>';
                html += '<td>' + escapeHtml(formatDate(t.createdAt)) + '</td>';
            } else {
                html += '<td><strong>' + escapeHtml(t.subject) + '</strong>';
                if (t.userPublicId) {
                    html += '<br><span class="portal-admin-cell-muted"><code>#' + escapeHtml(t.userPublicId) + '</code></span>';
                }
                html += '</td>';
                html += '<td>' + statusBadge(t.status) + '</td>';
                html += '<td>' + escapeHtml(t.type) + '</td>';
            }
            html += '</tr>';
        });
        return html + '</tbody></table></div>';
    }

    function renderUserTabs() {
        var html = '<div class="portal-admin-tabs" role="tablist">';
        USER_TABS.forEach(function (tab) {
            var count = filterUsersForPanel(lastUsersData, 'users', tab.id).length;
            var active = tab.id === activeUserTab ? ' portal-admin-tab--active' : '';
            html += '<button type="button" class="portal-admin-tab' + active + '" role="tab" data-user-tab="' + tab.id + '" aria-selected="' + (tab.id === activeUserTab ? 'true' : 'false') + '">';
            html += escapeHtml(tab.label) + ' <span class="portal-admin-tab-count">' + count + '</span></button>';
        });
        return html + '</div>';
    }

    function renderUsersListPanel(users) {
        var filtered = filterUsersForPanel(users, usersPanelMode, activeUserTab);
        var html = '';
        if (usersPanelMode === 'users') {
            html += renderUserTabs();
        } else {
            html += '<p class="portal-admin-meta portal-admin-toolbar-hint">Comptes avec le rôle administrateur — distincts des utilisateurs du portail.</p>';
        }
        html += '<div data-admin-users-list>' + userTable(filtered, false) + '</div>';
        return html;
    }

    function renderUsers(data) {
        lastUsersData = data.users || [];
        usersPanelMode = 'users';
        activeUserTab = activeUserTab || 'all';
        var html = '<div class="portal-admin-toolbar" data-admin-users-panel>';
        html += '<div class="portal-admin-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
        html += '<input type="search" class="portal-input" placeholder="Rechercher par identifiant, e-mail ou nom…" data-admin-users-search></div>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--primary" data-admin-users-refresh><i class="fa-solid fa-rotate" aria-hidden="true"></i> Actualiser</button>';
        html += '</div>';
        html += '<div class="portal-admin-panel">' + renderUsersListPanel(lastUsersData) + '</div>';
        return html;
    }

    function renderAdmins(data) {
        lastUsersData = data.users || [];
        usersPanelMode = 'admins';
        var html = '<div class="portal-admin-toolbar" data-admin-users-panel>';
        html += '<div class="portal-admin-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
        html += '<input type="search" class="portal-input" placeholder="Rechercher un administrateur…" data-admin-users-search></div>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--primary" data-admin-users-refresh><i class="fa-solid fa-rotate" aria-hidden="true"></i> Actualiser</button>';
        html += '</div>';
        html += '<div class="portal-admin-panel">' + renderUsersListPanel(lastUsersData) + '</div>';
        return html;
    }

    function renderUserDetail(user) {
        if (!user) {
            return '<p class="portal-admin-empty">Utilisateur introuvable.</p>';
        }
        var html = '<h2 class="portal-admin-panel-title"><code>' + escapeHtml(userPublicLabel(user)) + '</code></h2>';
        html += '<p class="portal-admin-meta">' + escapeHtml(user.email) + '</p>';
        html += '<div class="portal-admin-detail-grid">';

        html += '<dl class="portal-admin-dl">';
        html += '<dt>Identifiant public</dt><dd><code>' + escapeHtml(userPublicLabel(user)) + '</code></dd>';
        html += '<dt>ID interne</dt><dd><code>#' + escapeHtml(user.id) + '</code></dd>';
        html += '<dt>Grade</dt><dd>' + gradeBadge(primaryGradeId(user)) + '</dd>';
        html += '<dt>Abonnement</dt><dd>' + subscriptionBadge((user.subscription && user.subscription.status) || 'none') + '</dd>';
        html += '<dt>E-mail vérifié</dt><dd>' + accountVerificationBadge(!!user.emailVerified) + '</dd>';
        html += '<dt>Compte</dt><dd>' + statusBadge(user.accountStatus === 'suspended' ? 'suspended' : 'compte_actif') + (user.blacklisted ? ' ' + statusBadge('blacklisted') : '') + '</dd>';
        html += '<dt>Inscription</dt><dd>' + escapeHtml(formatDate(user.createdAt)) + '</dd>';
        html += '<dt>Rôles</dt><dd>' + escapeHtml((user.roles || []).join(', ') || 'aucun') + '</dd>';
        if ((user.roles || []).indexOf('professeur') !== -1) {
            var usedClasses = user.classroomCount != null ? user.classroomCount : 0;
            var maxOverride = user.profMaxClassrooms != null ? escapeHtml(user.profMaxClassrooms) : '';
            var maxDefault = user.classroomMax != null ? escapeHtml(String(user.classroomMax)) : '';
            html += '<dt>Classes</dt><dd class="portal-admin-dd-inline">'
                + '<span data-prof-used>' + escapeHtml(String(usedClasses)) + '</span>/'
                + '<input type="number" class="portal-input portal-input--inline-num" min="0" data-prof-max-classrooms="' + user.id + '" value="' + maxOverride + '" placeholder="' + maxDefault + '" title="Max classes créables (vide = défaut contrat)" aria-label="Max classes créables">'
                + ' utilisées <span class="portal-admin-meta portal-admin-inline-status" data-prof-limit-status></span></dd>';
        }
        html += '</dl>';

        html += '<div class="portal-admin-toggle-group"><h3 class="portal-admin-toggle-group-title">Rôles</h3>';
        ROLE_TOGGLES.forEach(function (role) {
            var has = (user.roles || []).indexOf(role.id) !== -1;
            html += adminToggleRow({
                label: role.label,
                icon: role.icon,
                checked: has,
                attrs: {
                    'data-admin-role-toggle': role.id,
                    'data-admin-user-id': String(user.id),
                },
            });
        });
        html += '</div>';

        html += '<div class="portal-admin-toggle-group"><h3 class="portal-admin-toggle-group-title">Identité</h3>';
        html += adminEditableField({
            key: 'name',
            label: 'Nom affiché',
            value: user.displayName || '',
            userId: user.id,
            emptyLabel: 'Non défini',
        });
        html += adminEditableField({
            key: 'email',
            label: 'Adresse e-mail',
            value: user.email || '',
            userId: user.id,
            inputType: 'email',
            icon: 'fa-envelope',
        });
        html += '</div>';

        var suspended = user.accountStatus === 'suspended';
        html += '<div class="portal-admin-toggle-group"><h3 class="portal-admin-toggle-group-title">Compte</h3>';
        html += adminToggleRow({
            label: 'Compte actif',
            icon: 'fa-user-check',
            checked: !suspended,
            attrs: {
                'data-admin-account-toggle': '1',
                'data-admin-user-id': String(user.id),
            },
        });
        html += adminToggleRow({
            label: 'Liste noire (ban e-mail)',
            icon: 'fa-ban',
            checked: !!user.blacklisted,
            attrs: {
                'data-admin-blacklist-toggle': '1',
                'data-admin-user-id': String(user.id),
            },
        });
        if (!user.emailVerified) {
            html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-admin-btn-icon" data-admin-user-action="force_verify" data-admin-user-id="' + user.id + '"><i class="fa-solid fa-envelope-circle-check" aria-hidden="true"></i> Marquer l\'e-mail comme vérifié</button>';
        }
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-admin-btn-icon" data-admin-user-action="password_reset" data-admin-user-id="' + user.id + '"><i class="fa-solid fa-envelope" aria-hidden="true"></i> Envoyer e-mail changement MDP</button>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--danger" data-admin-user-action="delete" data-admin-user-id="' + user.id + '"><i class="fa-solid fa-trash" aria-hidden="true"></i> Supprimer le compte</button>';
        html += '</div>';
        html += '</div>';
        html += renderUserActivity(user);
        return html;
    }

    function adminEditableField(opts) {
        var key = String(opts.key);
        var value = opts.value || '';
        var inputType = opts.inputType || 'text';
        var icon = opts.icon || 'fa-pen-to-square';
        var displayValue = value !== ''
            ? escapeHtml(value)
            : '<span class="portal-admin-cell-muted">' + escapeHtml(opts.emptyLabel || 'Non défini') + '</span>';
        var html = '<div class="portal-admin-editable" data-admin-editable="' + escapeHtml(key) + '">';
        html += '<div class="portal-admin-editable-head">';
        html += '<span class="portal-admin-editable-label"><i class="fa-solid ' + escapeHtml(icon) + '" aria-hidden="true"></i> ' + escapeHtml(opts.label) + '</span>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-edit-toggle="' + escapeHtml(key) + '"><i class="fa-solid fa-pen" aria-hidden="true"></i> Modifier</button>';
        html += '</div>';
        html += '<p class="portal-admin-editable-value" data-edit-value>' + displayValue + '</p>';
        html += '<form class="portal-form portal-admin-editable-form" data-admin-editable-form="' + escapeHtml(key) + '" data-admin-user-id="' + escapeHtml(opts.userId) + '" hidden>';
        html += '<input class="portal-input" type="' + escapeHtml(inputType) + '" name="value" value="' + escapeHtml(value) + '"'
            + (opts.placeholder ? ' placeholder="' + escapeHtml(opts.placeholder) + '"' : '') + ' required>';
        html += '<div class="portal-admin-editable-actions">';
        html += '<button type="submit" class="portal-account-btn portal-account-btn--primary portal-account-btn--compact"><i class="fa-solid fa-check" aria-hidden="true"></i> Sauvegarder</button>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-edit-cancel><i class="fa-solid fa-xmark" aria-hidden="true"></i> Annuler</button>';
        html += '</div></form></div>';
        return html;
    }

    function userStatTiles(tiles) {
        var html = '<div class="portal-admin-stat-grid">';
        tiles.forEach(function (t) {
            html += '<div class="portal-admin-stat">';
            html += '<span class="portal-admin-stat-icon"><i class="fa-solid ' + escapeHtml(t.icon) + '" aria-hidden="true"></i></span>';
            html += '<span class="portal-admin-stat-body"><span class="portal-admin-stat-label">' + escapeHtml(t.label) + '</span>';
            html += '<strong class="portal-admin-stat-value">' + t.value + '</strong></span></div>';
        });
        return html + '</div>';
    }

    function renderUserActivity(user) {
        var a = user.activity;
        if (!a) {
            return '';
        }
        var html = '<div class="portal-admin-detail-section">';
        html += '<h3 class="portal-admin-toggle-group-title">Activité</h3>';
        var g = a.gamification || {};
        var usage = a.usageToday || [];
        var usageMinutes = usage.reduce(function (sum, u) { return sum + (Number(u.minutesUsed) || 0); }, 0);
        html += userStatTiles([
            { icon: 'fa-trophy', label: 'Niveau', value: (g.level || 1) + ' <small>(' + (g.xp || 0) + ' XP)</small>' },
            { icon: 'fa-medal', label: 'Badges', value: (g.badges ? g.badges.length : 0) + '/' + (g.badgeTotal || 0) },
            { icon: 'fa-chart-line', label: 'Modules suivis', value: (a.progress ? a.progress.length : 0) },
            { icon: 'fa-hourglass-half', label: 'OS aujourd\'hui', value: Math.round(usageMinutes) + ' min' },
            { icon: 'fa-cart-shopping', label: 'Achats', value: (a.purchases ? a.purchases.length : 0) },
            { icon: 'fa-palette', label: 'Skins', value: (a.skins ? a.skins.length : 0) },
        ]);

        if (a.classMembership) {
            html += '<p class="portal-admin-detail-line"><i class="fa-solid fa-chalkboard-user" aria-hidden="true"></i> Classe : <strong>' + escapeHtml(a.classMembership.name || ('#' + a.classMembership.classroomId)) + '</strong> <span class="portal-admin-cell-muted">depuis ' + escapeHtml(formatDate(a.classMembership.joinedAt)) + '</span></p>';
        }

        var billing = user.billing || {};
        if (billing.paymentMethod || billing.addressLine || billing.city) {
            html += '<h4 class="portal-admin-detail-subtitle">Facturation</h4><ul class="portal-admin-detail-list">';
            if (billing.paymentMethod) {
                html += '<li><i class="fa-solid fa-credit-card" aria-hidden="true"></i> ' + escapeHtml(billing.paymentMethod) + '</li>';
            }
            if (billing.addressLine || billing.postalCode || billing.city) {
                html += '<li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' + escapeHtml([billing.addressLine, billing.postalCode, billing.city].filter(Boolean).join(', ')) + '</li>';
            }
            html += '</ul>';
        }

        if (g.badges && g.badges.length) {
            html += '<h4 class="portal-admin-detail-subtitle">Badges obtenus</h4><div class="portal-admin-chip-row">';
            g.badges.forEach(function (b) {
                html += '<span class="portal-admin-chip"><i class="fa-solid fa-award" aria-hidden="true"></i> ' + escapeHtml(b) + '</span>';
            });
            html += '</div>';
        }

        if (a.progress && a.progress.length) {
            html += '<h4 class="portal-admin-detail-subtitle">Progression récente</h4>';
            html += '<div class="portal-admin-progress-list">';
            a.progress.slice(0, 6).forEach(function (p) {
                html += '<div class="portal-admin-progress-item"><div class="portal-admin-progress-head"><code>' + escapeHtml(p.mountId) + '</code><span>' + p.percent + '%</span></div>';
                html += '<div class="portal-admin-progress-track"><div class="portal-admin-progress-fill" style="width:' + p.percent + '%"></div></div></div>';
            });
            html += '</div>';
        }

        if (a.purchases && a.purchases.length) {
            html += '<h4 class="portal-admin-detail-subtitle">Modules achetés</h4><div class="portal-admin-chip-row">';
            a.purchases.forEach(function (p) {
                html += '<span class="portal-admin-chip"><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> ' + escapeHtml(p.moduleId) + '</span>';
            });
            html += '</div>';
        }

        if (a.skins && a.skins.length) {
            html += '<h4 class="portal-admin-detail-subtitle">Skins sauvegardés</h4><div class="portal-admin-chip-row">';
            a.skins.forEach(function (s) {
                html += '<span class="portal-admin-chip"><i class="fa-solid fa-palette" aria-hidden="true"></i> ' + escapeHtml(s.registryId) + '</span>';
            });
            html += '</div>';
        }

        if (usage.length) {
            html += '<h4 class="portal-admin-detail-subtitle">Consommation OS du jour</h4><div class="portal-admin-chip-row">';
            usage.forEach(function (u) {
                html += '<span class="portal-admin-chip"><code>' + escapeHtml(u.registryId) + '</code> ' + Math.round(u.minutesUsed) + '/' + (a.usageLimitMinutes || 15) + ' min</span>';
            });
            html += '</div>';
        }

        return html + '</div>';
    }

    function renderTicketTabs() {
        var html = '<div class="portal-admin-tabs" role="tablist">';
        TICKET_TABS.forEach(function (tab) {
            var count = filterTicketsByTab(lastTicketsData, tab.id).length;
            var active = tab.id === activeTicketTab ? ' portal-admin-tab--active' : '';
            html += '<button type="button" class="portal-admin-tab' + active + '" role="tab" data-ticket-tab="' + tab.id + '" aria-selected="' + (tab.id === activeTicketTab ? 'true' : 'false') + '">';
            html += escapeHtml(tab.label) + ' <span class="portal-admin-tab-count">' + count + '</span></button>';
        });
        return html + '</div>';
    }

    function renderTicketListRows(tickets) {
        if (!tickets.length) {
            return '<p class="portal-admin-empty">Aucun ticket dans cette catégorie.</p>';
        }
        var html = '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>ID</th><th>Sujet</th><th>Identifiant</th><th>Check auto</th><th>Statut</th></tr></thead><tbody>';
        tickets.forEach(function (t) {
            var rowCls = 'portal-admin-row-click' + (t.awaitingAdmin ? ' portal-admin-row--awaiting' : '');
            var subject = escapeHtml(t.subject);
            if (t.awaitingAdmin) {
                subject += ' <span class="portal-admin-reply-flag"><i class="fa-solid fa-reply" aria-hidden="true"></i> Réponse client</span>';
            }
            var autoCol = t.type === 'demande_module' && t.moduleSubmission
                ? moduleAutoBadge(t.moduleSubmission)
                : '<span class="portal-admin-cell-muted">—</span>';
            html += '<tr class="' + rowCls + '" data-ticket-id="' + t.id + '"><td>#' + t.id + '</td><td>' + subject + '</td><td><code>' + escapeHtml(userPublicLabel({ publicId: t.userPublicId, id: t.userId })) + '</code></td><td>' + autoCol + '</td><td>' + statusBadge(t.status) + '</td></tr>';
        });
        return html + '</tbody></table></div>';
    }

    function renderTickets(data) {
        lastTicketsData = data.tickets || [];
        updateTicketNavBadge(countActionableTickets(lastTicketsData));
        var filtered = filterTicketsByTab(lastTicketsData, activeTicketTab);
        var html = '<div class="portal-admin-panel">';
        html += renderTicketTabs();
        html += '<div data-admin-ticket-list>' + renderTicketListRows(filtered) + '</div>';
        html += '</div>';
        return html;
    }

    function ticketMessageBodyHtml(body) {
        if (global.CapsulePortalTicketComposer
            && typeof global.CapsulePortalTicketComposer.renderMessageBody === 'function') {
            return global.CapsulePortalTicketComposer.renderMessageBody(body || '');
        }
        return '<div class="portal-ticket-message-content">' + escapeHtml(body || '') + '</div>';
    }

    function ticketMessageHtml(msg) {
        var system = msg.authorRole === 'system' || msg.system;
        var role = msg.authorRole === 'admin' || system ? 'admin'
            : (msg.authorRole === 'internal' || msg.internal ? 'internal' : 'user');
        var roleClass = system ? 'admin portal-account-ticket-message--system' : role;
        var authorName = msg.authorName || (role === 'admin' ? 'Support CapsuleOS' : (role === 'internal' ? 'Analyse automatique' : 'Utilisateur'));
        var roleLabel = role === 'admin' ? 'Support' : (role === 'internal' ? 'Interne' : 'Client');
        var bodyHtml = system
            ? '<div class="portal-ticket-message-content"><i class="fa-solid fa-hand" aria-hidden="true"></i> ' + escapeHtml(msg.body || '') + '</div>'
            : ticketMessageBodyHtml(msg.body || '');
        return '<article class="portal-account-ticket-message portal-account-ticket-message--' + roleClass + '">'
            + '<header class="portal-account-ticket-message-head">'
            + '<span class="portal-account-ticket-message-author-line">'
            + '<span class="portal-account-ticket-message-author">' + escapeHtml(authorName) + '</span>'
            + '<span class="portal-account-badge portal-account-badge--message portal-admin-msg-role portal-admin-msg-role--' + role + '">' + escapeHtml(roleLabel) + '</span>'
            + '</span>'
            + '<time datetime="' + escapeHtml(msg.createdAt || '') + '">' + escapeHtml(formatDate(msg.createdAt)) + '</time>'
            + '</header>'
            + '<div class="portal-account-ticket-message-body">' + bodyHtml + '</div>'
            + '</article>';
    }

    function adminReplyComposerHtml() {
        if (global.CapsulePortalTicketComposer
            && typeof global.CapsulePortalTicketComposer.wrapTextareaHtml === 'function') {
            return global.CapsulePortalTicketComposer.wrapTextareaHtml(
                'class="portal-input" name="body" rows="3" required placeholder="Votre réponse au client…"',
            );
        }
        return '<textarea class="portal-input" name="body" rows="3" required placeholder="Votre réponse au client…"></textarea>';
    }

    function moduleAutoStatusLabel(status) {
        var map = {
            pending: 'En attente',
            running: 'En cours',
            passed: 'Conforme',
            failed: 'Non conforme',
        };
        return map[String(status || '')] || String(status || '');
    }

    function moduleAdminStatusLabel(status) {
        var map = {
            awaiting_review: 'En attente de revue',
            in_dev: 'Revue en dev',
            approved: 'Ajout approuvé',
            rejected: 'Ajout refusé',
            published: 'Publié',
        };
        return map[String(status || '')] || String(status || '');
    }

    function moduleBillingLabel(type) {
        var map = {
            free: 'Gratuit',
            subscriber: 'Inclus abonnement',
            purchase: 'Achat unitaire',
        };
        return map[String(type || '')] || String(type || '');
    }

    function moduleAutoBadge(sub) {
        if (!sub) {
            return '<span class="portal-admin-badge portal-admin-badge--muted">—</span>';
        }
        var status = String(sub.autoStatus || '');
        var cls = 'portal-admin-badge portal-admin-badge--module-auto-' + escapeHtml(status);
        var report = sub.autoReport || {};
        var checks = Array.isArray(report.checks) ? report.checks : [];
        var passed = checks.filter(function (c) { return c && c.ok; }).length;
        var label = moduleAutoStatusLabel(status);
        if (checks.length) {
            label += ' (' + passed + '/' + checks.length + ')';
        }
        return '<span class="' + cls + '">' + escapeHtml(label) + '</span>';
    }

    function renderModuleSubmissionPanel(sub, ticketClosed) {
        if (!sub) {
            return '<p class="portal-admin-empty">Soumission module introuvable.</p>';
        }
        var html = '<section class="portal-admin-module-submission">';
        html += '<h3 class="portal-admin-detail-subtitle">Soumission module</h3>';
        html += '<div class="portal-admin-module-submission-banner">' + moduleAutoBadge(sub) + '</div>';
        html += '<dl class="portal-admin-dl">';
        html += '<dt>Titre</dt><dd>' + escapeHtml(sub.moduleTitle || '') + '</dd>';
        html += '<dt>Mount ID</dt><dd><code>' + escapeHtml(sub.proposedMountId || '') + '</code></dd>';
        html += '<dt>Dépôt Git</dt><dd><a href="' + escapeHtml(sub.gitUrl || '') + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(sub.gitUrl || '') + '</a> (' + escapeHtml(sub.gitRef || 'main') + ')</dd>';
        html += '<dt>Modèle</dt><dd>' + escapeHtml(moduleBillingLabel(sub.billingType));
        if (sub.priceDisplay) {
            html += ' · ' + escapeHtml(sub.priceDisplay);
        }
        html += '</dd>';
        html += '<dt>Revue admin</dt><dd>' + escapeHtml(moduleAdminStatusLabel(sub.adminStatus)) + '</dd>';
        if (sub.adminNotes) {
            html += '<dt>Notes</dt><dd>' + escapeHtml(sub.adminNotes) + '</dd>';
        }
        if (sub.resolvedMountId) {
            html += '<dt>Publié sous</dt><dd><code>' + escapeHtml(sub.resolvedMountId) + '</code></dd>';
        }
        html += '</dl>';
        html += '<p class="portal-admin-meta">' + escapeHtml(sub.pitch || '') + '</p>';

        var report = sub.autoReport || {};
        var errors = Array.isArray(report.errors) ? report.errors : [];
        var warnings = Array.isArray(report.warnings) ? report.warnings : [];
        var checks = Array.isArray(report.checks) ? report.checks : [];
        if (checks.length || errors.length || warnings.length) {
            html += '<details class="portal-admin-module-report"><summary>Rapport validation automatique</summary>';
            if (errors.length) {
                html += '<ul class="portal-admin-module-errors">';
                errors.forEach(function (err) {
                    html += '<li>' + escapeHtml(err) + '</li>';
                });
                html += '</ul>';
            }
            if (warnings.length) {
                html += '<ul class="portal-admin-module-warnings">';
                warnings.forEach(function (warn) {
                    html += '<li>' + escapeHtml(warn) + '</li>';
                });
                html += '</ul>';
            }
            if (checks.length) {
                html += '<ul class="portal-admin-module-checks">';
                checks.forEach(function (check) {
                    var icon = check.ok ? 'fa-check' : 'fa-xmark';
                    html += '<li class="portal-admin-module-check' + (check.ok ? ' portal-admin-module-check--ok' : ' portal-admin-module-check--fail') + '">';
                    html += '<i class="fa-solid ' + icon + '" aria-hidden="true"></i> ';
                    html += escapeHtml(check.label || check.id || '');
                    if (check.detail) {
                        html += ' <span class="portal-admin-cell-muted">' + escapeHtml(check.detail) + '</span>';
                    }
                    html += '</li>';
                });
                html += '</ul>';
            }
            html += '</details>';
        }

        var adminStatus = String(sub.adminStatus || '');
        var autoPassed = String(sub.autoStatus || '') === 'passed';
        var canAct = !ticketClosed && adminStatus !== 'published';
        if (canAct) {
            html += '<div class="portal-admin-actions portal-admin-module-actions">';
            if (adminStatus === 'awaiting_review' || adminStatus === 'approved' || adminStatus === 'rejected') {
                var devLabel = adminStatus === 'rejected' ? 'Reprendre la revue' : 'Valider en dev';
                html += '<button type="button" class="portal-account-btn" data-module-take-dev="' + sub.id + '"><i class="fa-solid fa-code" aria-hidden="true"></i> ' + devLabel + '</button>';
            }
            if (adminStatus === 'in_dev') {
                html += '<button type="button" class="portal-account-btn portal-account-btn--primary" data-module-approve="' + sub.id + '"><i class="fa-solid fa-thumbs-up" aria-hidden="true"></i> Approuver l\'ajout</button>';
            }
            if (adminStatus === 'approved') {
                html += '<button type="button" class="portal-account-btn portal-account-btn--primary" data-module-publish="' + sub.id + '"'
                    + ' data-module-mount="' + escapeHtml(sub.proposedMountId || '') + '"'
                    + ' data-module-billing="' + escapeHtml(sub.billingType || '') + '"'
                    + ' data-module-price="' + escapeHtml(sub.priceDisplay || '') + '">'
                    + '<i class="fa-solid fa-upload" aria-hidden="true"></i> Publier dans le store</button>';
            }
            if (adminStatus !== 'rejected') {
                html += '<button type="button" class="portal-account-btn portal-account-btn--danger" data-module-reject="' + sub.id + '"><i class="fa-solid fa-ban" aria-hidden="true"></i> Refuser l\'ajout</button>';
            }
            html += '</div>';
        }
        html += '</section>';
        return html;
    }

    function renderTicketDetail(ticket) {
        if (!ticket) {
            return '<p class="portal-admin-empty">Ticket introuvable.</p>';
        }
        var status = String(ticket.status || '').toLowerCase();
        var closed = isTicketClosed(status);
        var roleRequest = ROLE_REQUEST_TYPES[ticket.type];
        var userId = ticket.userId || 0;
        var userName = userPublicLabel({ publicId: ticket.userPublicId, id: userId });

        var html = '<div class="portal-admin-ticket">';

        html += '<header class="portal-admin-ticket-head">';
        html += '<div class="portal-admin-ticket-head-main">';
        html += '<h2 class="portal-admin-panel-title">' + escapeHtml(ticket.subject) + '</h2>';
        html += '<div class="portal-admin-ticket-head-meta">';
        html += '<span class="portal-admin-badge portal-admin-badge--type">' + escapeHtml(ticketTypeLabel(ticket.type)) + '</span>';
        html += statusBadge(ticket.status);
        html += '<span class="portal-admin-ticket-id">#' + ticket.id + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<button type="button" class="portal-admin-ticket-user' + (userId ? '' : ' portal-admin-ticket-user--static') + '"'
            + (userId ? ' data-ticket-goto-user="' + escapeHtml(userId) + '"' : '') + '>'
            + '<span class="portal-admin-ticket-user-avatar" aria-hidden="true"><i class="fa-solid fa-user"></i></span>'
            + '<span class="portal-admin-ticket-user-body">'
            + '<span class="portal-admin-ticket-user-name"><code>' + escapeHtml(userName) + '</code></span>'
            + (ticket.userEmail ? '<span class="portal-admin-ticket-user-mail portal-admin-ticket-user-mail--hidden" hidden>' + escapeHtml(ticket.userEmail) + '</span>' : '')
            + '</span>'
            + (userId ? '<i class="fa-solid fa-arrow-right portal-admin-ticket-user-go" aria-hidden="true"></i>' : '')
            + '</button>';
        html += '</header>';

        if (ticket.awaitingAdmin) {
            html += '<p class="portal-admin-ticket-alert"><i class="fa-solid fa-reply" aria-hidden="true"></i> Le client a répondu — en attente de votre réponse.</p>';
        }

        if (ticket.type === 'demande_module') {
            html += renderModuleSubmissionPanel(ticket.moduleSubmission || null, closed);
        }

        var msgs = ticket.messages || [];
        html += '<div class="portal-account-ticket-messages portal-admin-ticket-thread" role="log">';
        if (!msgs.length) {
            html += '<p class="portal-admin-empty">Aucun message.</p>';
        } else {
            msgs.forEach(function (msg) {
                html += ticketMessageHtml(msg);
            });
        }
        html += '</div>';

        html += '<div class="portal-admin-ticket-footer">';
        if (isTicketNew(status)) {
            html += '<div class="portal-admin-actions"><button type="button" class="portal-account-btn portal-account-btn--primary" data-ticket-take-charge="' + ticket.id + '"><i class="fa-solid fa-hand" aria-hidden="true"></i> Prendre en charge</button></div>';
        } else if (!closed) {
            html += '<form class="portal-form portal-admin-reply-form" data-ticket-reply="' + ticket.id + '">';
            html += adminReplyComposerHtml();
            html += '<div class="portal-admin-actions">';
            html += '<button type="submit" class="portal-account-btn portal-account-btn--primary"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Répondre</button>';
            if (roleRequest && userId) {
                html += '<button type="button" class="portal-account-btn" data-ticket-goto-user="' + escapeHtml(userId) + '"><i class="fa-solid fa-user-gear" aria-hidden="true"></i> Gérer le rôle du compte</button>';
            }
            html += '<button type="button" class="portal-account-btn portal-account-btn--ghost" data-ticket-close="' + ticket.id + '"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Clôturer le ticket</button>';
            html += '</div></form>';
        } else {
            html += '<div class="portal-admin-actions"><button type="button" class="portal-account-btn" data-ticket-reopen="' + ticket.id + '"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Rouvrir le ticket</button></div>';
        }
        html += '</div>';

        html += '</div>';
        return html;
    }

    function subscriptionPeriodInput(userId, currentEnd) {
        var val = String(currentEnd || '').slice(0, 16).replace(' ', 'T');
        return '<input type="datetime-local" class="portal-input portal-input--compact" data-sub-period="' + escapeHtml(userId) + '" value="' + escapeHtml(val) + '">';
    }

    function subscriptionCancelCheckbox(userId, cancelAtPeriodEnd) {
        var checked = cancelAtPeriodEnd ? ' checked' : '';
        return '<label class="portal-admin-inline-check"><input type="checkbox" data-sub-cancel="' + escapeHtml(userId) + '"' + checked + '> Résilier en fin de période</label>';
    }

    function renderSubscriptions(data) {
        var subs = data.subscriptions || [];
        var html = '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr>';
        html += '<th>Identifiant</th><th>Statut</th><th>Fin période</th><th>Résiliation</th><th>Modifier statut</th></tr></thead><tbody>';
        if (!subs.length) {
            return html + '<tr><td colspan="5"><p class="portal-admin-empty">Aucun abonnement.</p></td></tr></tbody></table></div>';
        }
        subs.forEach(function (s) {
            html += '<tr><td><code>' + escapeHtml(userPublicLabel(s)) + '</code></td>';
            html += '<td>' + subscriptionBadge(s.status) + '</td>';
            html += '<td>' + subscriptionPeriodInput(s.userId, s.currentPeriodEnd) + '</td>';
            html += '<td>' + subscriptionCancelCheckbox(s.userId, s.cancelAtPeriodEnd) + '</td><td>';
            html += subscriptionStatusSelect(s.userId, s.status);
            html += '</td></tr>';
        });
        return html + '</tbody></table></div>';
    }

    function renderClassListRows(classes) {
        if (!classes.length) {
            return '<p class="portal-admin-empty">Aucune classe.</p>';
        }
        var html = '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Nom</th><th>Professeur</th><th>Places</th><th>Expiration</th></tr></thead><tbody>';
        classes.forEach(function (c) {
            html += '<tr class="portal-admin-row-click" data-class-id="' + c.id + '">';
            html += '<td><strong>' + escapeHtml(c.name) + '</strong></td>';
            html += '<td><code>' + escapeHtml(userPublicLabel({ publicId: c.teacherPublicId, id: c.teacherId })) + '</code></td>';
            html += '<td><span class="portal-admin-badge portal-admin-badge--active">' + c.memberCount + '/' + c.maxSlots + '</span></td>';
            html += '<td>' + escapeHtml(formatDate(c.inviteExpiresAt)) + '</td></tr>';
        });
        return html + '</tbody></table></div>';
    }

    function renderClassDetail(classroom, members) {
        if (!classroom) {
            return '<p class="portal-admin-empty">Classe introuvable.</p>';
        }
        var html = '<h2 class="portal-admin-panel-title">' + escapeHtml(classroom.name) + '</h2>';
        html += '<p class="portal-admin-meta">#' + classroom.id + ' · <code>' + escapeHtml(userPublicLabel({ publicId: classroom.teacherPublicId, id: classroom.teacherId })) + '</code></p>';
        html += '<dl class="portal-admin-dl">';
        html += '<dt>Places</dt><dd>' + classroom.memberCount + '/' + classroom.maxSlots + '</dd>';
        html += '<dt>Expiration invitation</dt><dd>' + escapeHtml(formatDate(classroom.inviteExpiresAt)) + '</dd>';
        html += '<dt>OS autorisés</dt><dd>' + escapeHtml((classroom.allowedOs || []).join(', ') || 'Tous') + '</dd>';
        html += '<dt>Modules autorisés</dt><dd>' + escapeHtml((classroom.allowedModules || []).join(', ') || 'Tous') + '</dd>';
        html += '</dl>';
        html += '<div class="portal-admin-actions">';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-class-extend="' + classroom.id + '"><i class="fa-solid fa-clock" aria-hidden="true"></i> Prolonger invitation</button>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--danger" data-class-delete="' + classroom.id + '"><i class="fa-solid fa-trash" aria-hidden="true"></i> Supprimer</button>';
        html += '</div>';
        html += '<h3 class="portal-admin-toggle-group-title">Membres</h3>';
        if (!members || !members.length) {
            html += '<p class="portal-admin-empty">Aucun élève inscrit.</p>';
        } else {
            html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Identifiant</th><th>Inscription</th><th></th></tr></thead><tbody>';
            members.forEach(function (m) {
                html += '<tr><td><code>' + escapeHtml(userPublicLabel({ publicId: m.public_id, id: m.user_id })) + '</code></td>';
                html += '<td>' + escapeHtml(formatDate(m.joined_at)) + '</td>';
                html += '<td><button type="button" class="portal-account-btn portal-account-btn--compact" data-class-remove-member="' + classroom.id + '" data-class-member-id="' + m.user_id + '">Retirer</button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderClasses(data) {
        lastClassesData = data.classrooms || [];
        var html = '<div class="portal-admin-panel" data-admin-classes-panel>';
        html += '<div data-admin-class-list>' + renderClassListRows(lastClassesData) + '</div>';
        html += '</div>';
        return html;
    }

    function normalizeOsStatusForSelect(status) {
        var key = String(status || 'stub').toLowerCase();
        if (key === 'hidden' || key === 'beta' || key === 'deprecated' || key === 'archived') {
            return 'stub';
        }
        for (var i = 0; i < OS_STATUS_OPTIONS.length; i += 1) {
            if (OS_STATUS_OPTIONS[i].value === key) {
                return key;
            }
        }
        return 'stub';
    }

    function filterOsBySearch(entries, query) {
        var q = String(query || '').trim().toLowerCase();
        if (!q) {
            return entries || [];
        }
        return (entries || []).filter(function (e) {
            return String(e.id || '').toLowerCase().indexOf(q) !== -1
                || String(e.displayName || '').toLowerCase().indexOf(q) !== -1
                || String(e.family || '').toLowerCase().indexOf(q) !== -1;
        });
    }

    function applyOsFilters(entries) {
        return sortOsEntries(
            filterOsBySearch(filterOsByTab(entries, activeOsTab), activeOsSearch),
            activeOsSort,
        );
    }

    function filterOsByTab(entries, tab) {
        var match = null;
        OS_TABS.forEach(function (t) {
            if (t.id === tab) {
                match = t.statuses;
            }
        });
        if (!match) {
            return entries || [];
        }
        return (entries || []).filter(function (e) {
            return match.indexOf(String(e.status || '').toLowerCase()) !== -1;
        });
    }

    function sortOsEntries(entries, sortId) {
        var list = (entries || []).slice();
        list.sort(function (a, b) {
            if (sortId === 'order') {
                var orderDiff = (Number(a.portalOrder) || 0) - (Number(b.portalOrder) || 0);
                if (orderDiff !== 0) {
                    return orderDiff;
                }
                return String(a.displayName || a.id || '').localeCompare(String(b.displayName || b.id || ''), 'fr', { sensitivity: 'base', numeric: true });
            }
            if (sortId === 'family') {
                var fam = String(a.family || '').localeCompare(String(b.family || ''), 'fr', { sensitivity: 'base' });
                if (fam !== 0) {
                    return fam;
                }
                return String(a.displayName || a.id || '').localeCompare(String(b.displayName || b.id || ''), 'fr', { sensitivity: 'base', numeric: true });
            }
            if (sortId === 'id') {
                return String(a.id || '').localeCompare(String(b.id || ''), 'fr', { sensitivity: 'base', numeric: true });
            }
            return String(a.displayName || a.id || '').localeCompare(String(b.displayName || b.id || ''), 'fr', { sensitivity: 'base', numeric: true });
        });
        return list;
    }

    function osStatusLabel(status) {
        var key = String(status || '').toLowerCase();
        if (key === 'hidden') {
            key = 'stub';
        }
        var map = {
            active: 'Actif',
            planned: 'À venir',
            stub: 'En dev',
            beta: 'Bêta',
            deprecated: 'Déprécié',
            archived: 'Archivé',
        };
        return map[key] || String(status || '');
    }

    function osStatusSelect(registryId, current) {
        var cur = normalizeOsStatusForSelect(current);
        var html = '<select class="portal-input portal-input--compact" data-os-status="' + escapeHtml(registryId) + '" data-current-status="' + escapeHtml(cur) + '" aria-label="Statut portail pour ' + escapeHtml(registryId) + '">';
        OS_STATUS_OPTIONS.forEach(function (opt) {
            html += '<option value="' + escapeHtml(opt.value) + '"' + (opt.value === cur ? ' selected' : '') + '>' + escapeHtml(opt.label) + '</option>';
        });
        return html + '</select>';
    }

    function osStatusBadge(status) {
        var key = String(status || '').toLowerCase();
        if (key === 'hidden') {
            key = 'stub';
        }
        var variant = key === 'active' ? 'active' : (key === 'planned' ? 'planned' : 'stub');
        return '<span class="portal-admin-badge portal-admin-badge--os-' + variant + '">' + escapeHtml(osStatusLabel(status)) + '</span>';
    }

    function renderOsTabs() {
        var html = '<div class="portal-admin-tabs" role="tablist">';
        OS_TABS.forEach(function (tab) {
            var count = filterOsByTab(lastOsData, tab.id).length;
            var active = tab.id === activeOsTab ? ' portal-admin-tab--active' : '';
            html += '<button type="button" class="portal-admin-tab' + active + '" role="tab" data-os-tab="' + tab.id + '" aria-selected="' + (tab.id === activeOsTab ? 'true' : 'false') + '">';
            html += escapeHtml(tab.label) + ' <span class="portal-admin-tab-count">' + count + '</span></button>';
        });
        return html + '</div>';
    }

    function renderOsToolbar() {
        var html = '<div class="portal-admin-toolbar portal-admin-toolbar--os">';
        html += '<div class="portal-admin-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
        html += '<input type="search" class="portal-input" placeholder="Rechercher par ID, nom ou famille…" data-os-search value="' + escapeHtml(activeOsSearch) + '"></div>';
        html += '<label class="portal-admin-toolbar-field"><span>Trier</span><select class="portal-input portal-input--compact" data-os-sort>';
        OS_SORT_OPTIONS.forEach(function (opt) {
            html += '<option value="' + escapeHtml(opt.id) + '"' + (opt.id === activeOsSort ? ' selected' : '') + '>' + escapeHtml(opt.label) + '</option>';
        });
        html += '</select></label>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-os-refresh><i class="fa-solid fa-rotate" aria-hidden="true"></i> Actualiser</button>';
        html += '</div>';
        html += '<p class="portal-admin-meta portal-admin-os-hint">Actif : visible sur le portail · À venir : carte grisée · En dev : masqué du catalogue public.</p>';
        return html;
    }

    function renderOsTableRows(entries) {
        if (!entries.length) {
            return '<p class="portal-admin-empty">Aucun système dans cette catégorie.</p>';
        }
        var html = '<div class="portal-admin-table-wrap"><table class="portal-admin-table portal-admin-table--os"><thead><tr>';
        html += '<th>Système</th><th>Famille</th><th>Statut</th><th>Vedette</th><th></th>';
        html += '</tr></thead><tbody>';
        entries.forEach(function (e) {
            var labelName = e.displayName || e.id;
            html += '<tr data-os-row="' + escapeHtml(e.id) + '">';
            html += '<td><div class="portal-admin-os-name"><strong>' + escapeHtml(labelName) + '</strong><code class="portal-admin-os-id">' + escapeHtml(e.id) + '</code></div></td>';
            html += '<td><span class="portal-admin-os-family">' + escapeHtml(e.family) + '</span></td>';
            html += '<td>' + osStatusBadge(e.status) + '</td>';
            html += '<td>' + (e.portalFeatured
                ? '<span class="portal-admin-os-vedette"><i class="fa-solid fa-star" aria-hidden="true"></i> Oui</span>'
                : '<span class="portal-admin-cell-muted">—</span>') + '</td>';
            html += '<td class="portal-admin-table-actions"><button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-os-edit="' + escapeHtml(e.id) + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button></td>';
            html += '</tr>';
        });
        return html + '</tbody></table></div>';
    }

    function renderOs(data) {
        lastOsData = data.entries || [];
        var filtered = applyOsFilters(lastOsData);
        var html = '<div class="portal-admin-panel portal-admin-panel--grow" data-admin-os-panel>';
        html += renderOsTabs();
        html += renderOsToolbar();
        html += '<div data-admin-os-list>' + renderOsTableRows(filtered) + '</div>';
        return html + '</div>';
    }

    function renderOsEditor(e) {
        var html = '<h2 class="portal-admin-panel-title">Modifier le système</h2>';
        html += '<p class="portal-admin-meta"><code>' + escapeHtml(e.id) + '</code> · ' + escapeHtml(e.family || '') + '</p>';
        html += '<form class="portal-form" data-os-editor-form>';
        html += '<label class="portal-field"><span>Nom affiché (portail)</span><input class="portal-input" name="displayName" value="' + escapeHtml(e.displayName || '') + '" placeholder="Nom affiché sur le portail"></label>';
        html += '<label class="portal-field"><span>Statut</span>' + osStatusSelect(e.id, e.status) + '</label>';
        html += '<label class="portal-field"><span>Ordre dans le portail</span><input type="number" class="portal-input" name="portalOrder" value="' + escapeHtml(String(e.portalOrder || 0)) + '" min="0"></label>';
        html += adminToggleRow({
            label: 'Mettre en vedette',
            icon: 'fa-star',
            checked: !!e.portalFeatured,
            attrs: { 'data-os-editor-featured': '' },
        });
        html += '<div class="portal-admin-confirm-actions">';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-os-editor-cancel>Annuler</button>';
        html += '<button type="submit" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>';
        html += '</div></form>';
        return html;
    }

    function runOsTasks(tasks) {
        return tasks.reduce(function (chain, task) {
            return chain.then(function () {
                return apiPost('catalog-os.php', task).then(function (res) {
                    if (res && res.error) {
                        throw new Error(res.error);
                    }
                });
            });
        }, Promise.resolve());
    }

    function openOsEditor(registryId) {
        var entry = null;
        for (var i = 0; i < lastOsData.length; i += 1) {
            if (lastOsData[i].id === registryId) {
                entry = lastOsData[i];
                break;
            }
        }
        if (!entry) {
            return;
        }
        var body = openAdminModal();
        body.innerHTML = renderOsEditor(entry);
        bindOsEditor(body, entry);
    }

    function bindOsEditor(body, entry) {
        var form = body.querySelector('[data-os-editor-form]');
        if (!form) {
            return;
        }
        var cancelBtn = form.querySelector('[data-os-editor-cancel]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeAdminModal);
        }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var displayName = form.displayName ? form.displayName.value.trim() : '';
            var orderInput = form.querySelector('[name="portalOrder"]');
            var portalOrder = orderInput ? (parseInt(orderInput.value, 10) || 0) : 0;
            var featuredToggle = form.querySelector('[data-os-editor-featured]');
            var portalFeatured = featuredToggle ? featuredToggle.checked : false;
            var statusSel = form.querySelector('[data-os-status]');
            var nextStatus = statusSel ? statusSel.value : '';
            var curStatus = normalizeOsStatusForSelect(entry.status);

            var tasks = [];
            var metaChanged = displayName !== (entry.displayName || '')
                || portalOrder !== (Number(entry.portalOrder) || 0)
                || portalFeatured !== !!entry.portalFeatured;
            if (metaChanged) {
                tasks.push({
                    action: 'update_portal_meta',
                    registryId: entry.id,
                    displayName: displayName,
                    portalOrder: portalOrder,
                    portalFeatured: portalFeatured,
                });
            }
            if (nextStatus && nextStatus !== curStatus) {
                tasks.push({ action: 'update_status', registryId: entry.id, status: nextStatus });
            }
            if (!tasks.length) {
                closeAdminModal();
                return;
            }
            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            runOsTasks(tasks).then(function () {
                closeAdminModal();
                loadView('os', true);
            }).catch(function (err) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                global.alert((err && err.message) || 'Impossible d\'enregistrer les modifications.');
            });
        });
    }

    function moduleRowHtml(m) {
        var title = m.title || m.mountId;
        var html = '<tr data-module-row="' + escapeHtml(m.mountId) + '">';
        html += '<td><div class="portal-admin-module-cell"><strong>' + escapeHtml(title) + '</strong><code>' + escapeHtml(m.mountId) + '</code></div></td>';
        html += '<td>' + escapeHtml(m.creatorName || 'CapsuleOS') + '</td>';
        html += '<td>' + moduleAccessBadge(m.access || 'subscriber') + '</td>';
        html += '<td>' + moduleBillingBadge(m) + '</td>';
        html += '<td>' + moduleCatalogBadge(!!m.inStore) + '</td>';
        html += '<td class="portal-admin-table-actions"><button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-module-edit="' + escapeHtml(m.mountId) + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button></td>';
        return html + '</tr>';
    }

    function renderModules(data) {
        lastModulesData = data.modules || [];
        lastModulesSource = data.source || '';
        var source = data.source ? '<p class="portal-admin-meta">Source : ' + escapeHtml(data.source) + '</p>' : '';
        var syncBtn = data.source === 'database'
            ? '<button type="button" class="portal-account-btn portal-account-btn--primary" data-module-sync><i class="fa-solid fa-rotate" aria-hidden="true"></i> Synchroniser depuis fichiers</button>'
            : '';
        var html = '<div class="portal-admin-toolbar">' + syncBtn + '</div>' + source;
        html += '<div class="portal-admin-table-wrap portal-admin-table-wrap--wide"><table class="portal-admin-table portal-admin-table--modules"><thead><tr>';
        html += '<th>Module</th><th>Créateur</th><th>Accès</th><th>Facturation</th><th>Catalogue</th><th></th>';
        html += '</tr></thead><tbody>';
        if (!lastModulesData.length) {
            return html + '<tr><td colspan="6"><p class="portal-admin-empty">Aucun module dans le catalogue.</p></td></tr></tbody></table></div>';
        }
        lastModulesData.forEach(function (m) {
            html += moduleRowHtml(m);
        });
        return html + '</tbody></table></div>';
    }

    function renderModuleEditor(m) {
        var billingMode = String(m.billingMode || 'subscription');
        var editableBilling = moduleBillingEditable(billingMode);
        var isPurchase = billingMode === 'purchase';
        var html = '<h2 class="portal-admin-panel-title">Modifier le module</h2>';
        html += '<p class="portal-admin-meta"><code>' + escapeHtml(m.mountId) + '</code> · ' + escapeHtml(m.creatorName || 'CapsuleOS') + '</p>';
        html += '<form class="portal-form" data-module-editor-form>';
        html += '<label class="portal-field"><span>Titre affiché</span><input class="portal-input" name="title" value="' + escapeHtml(m.title || '') + '" placeholder="Titre du module"></label>';
        html += '<label class="portal-field"><span>Accès</span>' + moduleAccessSelect(m.mountId, m.access || 'subscriber') + '</label>';
        if (editableBilling) {
            html += adminToggleRow({
                label: 'Achat à l\u2019unité (module payant)',
                icon: 'fa-cart-shopping',
                checked: isPurchase,
                attrs: { 'data-module-editor-paid': '' },
            });
            html += '<label class="portal-field" data-module-editor-price-field' + (isPurchase ? '' : ' hidden') + '><span>Prix</span><input class="portal-input" name="price" value="' + escapeHtml(m.priceRaw || '') + '" placeholder="ex. 9 €"></label>';
        } else {
            html += '<p class="portal-admin-meta">Facturation déterminée par l\u2019accès : <strong>' + escapeHtml(MODULE_BILLING_LABELS[billingMode] || billingMode) + '</strong>.</p>';
        }
        html += adminToggleRow({
            label: 'Visible dans le catalogue',
            icon: 'fa-store',
            checked: !!m.inStore,
            attrs: { 'data-module-editor-store': '' },
        });
        html += '<div class="portal-admin-confirm-actions">';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-module-editor-cancel>Annuler</button>';
        html += '<button type="submit" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>';
        html += '</div></form>';
        return html;
    }

    function runModuleTasks(tasks) {
        return tasks.reduce(function (chain, task) {
            return chain.then(function () {
                return apiPost('catalog-modules.php', task).then(function (res) {
                    if (res && res.error) {
                        throw new Error(res.error);
                    }
                });
            });
        }, Promise.resolve());
    }

    function openModuleEditor(mountId) {
        var m = null;
        for (var i = 0; i < lastModulesData.length; i += 1) {
            if (lastModulesData[i].mountId === mountId) {
                m = lastModulesData[i];
                break;
            }
        }
        if (!m) {
            return;
        }
        var body = openAdminModal();
        body.innerHTML = renderModuleEditor(m);
        bindModuleEditor(body, m);
    }

    function bindModuleEditor(body, m) {
        var form = body.querySelector('[data-module-editor-form]');
        if (!form) {
            return;
        }
        var paidToggle = form.querySelector('[data-module-editor-paid]');
        var priceField = form.querySelector('[data-module-editor-price-field]');
        if (paidToggle && priceField) {
            paidToggle.addEventListener('change', function () {
                priceField.hidden = !paidToggle.checked;
                if (paidToggle.checked) {
                    var input = priceField.querySelector('input');
                    if (input) {
                        input.focus();
                    }
                }
            });
        }
        var cancelBtn = form.querySelector('[data-module-editor-cancel]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeAdminModal);
        }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var tasks = [];
            var title = form.title ? form.title.value.trim() : '';
            if (title && title !== (m.title || '')) {
                tasks.push({ action: 'update_meta', mountId: m.mountId, title: title });
            }
            var accessSel = form.querySelector('[data-module-access]');
            if (accessSel && accessSel.value !== (m.access || 'subscriber')) {
                tasks.push({ action: 'update_access', mountId: m.mountId, access: accessSel.value });
            }
            if (moduleBillingEditable(m.billingMode)) {
                var paid = paidToggle && paidToggle.checked;
                var nextMode = paid ? 'purchase' : 'subscription';
                var priceInput = priceField ? priceField.querySelector('input') : null;
                var price = priceInput ? priceInput.value.trim() : '';
                if (paid && !price) {
                    global.alert('Indiquez un prix pour un module payant.');
                    return;
                }
                if (nextMode !== m.billingMode || (paid && price !== (m.priceRaw || ''))) {
                    var billingTask = { action: 'update_billing', mountId: m.mountId, billingMode: nextMode };
                    if (paid) {
                        billingTask.priceDisplay = price;
                    }
                    tasks.push(billingTask);
                }
            }
            var storeToggle = form.querySelector('[data-module-editor-store]');
            if (storeToggle && storeToggle.checked !== !!m.inStore) {
                tasks.push({ action: 'toggle_catalog', mountId: m.mountId, inCatalog: storeToggle.checked });
            }
            if (!tasks.length) {
                closeAdminModal();
                return;
            }
            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            runModuleTasks(tasks).then(function () {
                closeAdminModal();
                loadView('modules', true);
            }).catch(function (err) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                global.alert((err && err.message) || 'Échec de l\u2019enregistrement.');
            });
        });
    }

    function offerPriceText(plan) {
        if (plan.priceDisplay) {
            return plan.priceDisplay;
        }
        if (plan.priceMonthly != null && plan.priceMonthly !== '') {
            return (Number(plan.priceMonthly) / 100).toLocaleString('fr-FR') + ' € / mois';
        }
        return '—';
    }

    function offerSectionCard(offers) {
        var html = '<div class="portal-admin-offer-card portal-admin-offer-card--section">';
        html += '<div class="portal-admin-offer-card-head"><div>';
        html += '<div class="portal-admin-offer-card-kicker">En-tête de la section</div>';
        if (offers.sectionEyebrow) {
            html += '<div class="portal-admin-offer-card-eyebrow">' + escapeHtml(offers.sectionEyebrow) + '</div>';
        }
        html += '<div class="portal-admin-offer-card-title">' + escapeHtml(offers.sectionTitle || 'Sans titre') + '</div>';
        html += '</div>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-offers-edit-section><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button>';
        html += '</div>';
        html += '<p class="portal-admin-offer-card-desc">' + escapeHtml(offers.sectionLead || 'Aucune introduction.') + '</p>';
        return html + '</div>';
    }

    function offerPlanCard(plan) {
        var features = plan.features || [];
        var html = '<div class="portal-admin-offer-card portal-admin-offer-card--plan">';
        html += '<div class="portal-admin-offer-card-head"><div>';
        html += '<div class="portal-admin-offer-card-kicker">Offre</div>';
        html += '<div class="portal-admin-offer-card-title">' + escapeHtml(plan.label || plan.id) + '</div>';
        html += '<div class="portal-admin-offer-card-id"><code>' + escapeHtml(plan.id) + '</code></div>';
        html += '</div>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-offers-edit-plan="' + escapeHtml(plan.id) + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button>';
        html += '</div>';
        html += '<div class="portal-admin-offer-card-price">' + escapeHtml(offerPriceText(plan)) + '</div>';
        if (plan.description) {
            html += '<p class="portal-admin-offer-card-desc">' + escapeHtml(plan.description) + '</p>';
        }
        if (features.length) {
            html += '<ul class="portal-admin-offer-features">';
            features.forEach(function (f) {
                html += '<li><i class="fa-solid fa-check" aria-hidden="true"></i> ' + escapeHtml(f) + '</li>';
            });
            html += '</ul>';
        } else {
            html += '<p class="portal-admin-offer-card-empty">Aucune fonctionnalité listée.</p>';
        }
        return html + '</div>';
    }

    function renderOffers(data) {
        lastOffersData = data.offers || {};
        var offers = lastOffersData;
        var plans = offers.plans || [];
        var html = '<div class="portal-admin-offer-grid">';
        html += offerSectionCard(offers);
        plans.forEach(function (plan) {
            html += offerPlanCard(plan);
        });
        return html + '</div>';
    }

    function offerEditorActions() {
        return '<div class="portal-admin-confirm-actions">'
            + '<button type="button" class="portal-account-btn portal-account-btn--compact" data-offers-editor-cancel>Annuler</button>'
            + '<button type="submit" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>'
            + '</div>';
    }

    function bindOfferEditorForm(form, submit) {
        var body = form.closest('[data-admin-modal-body]') || form.parentNode;
        var cancel = body ? body.querySelector('[data-offers-editor-cancel]') : null;
        if (cancel) {
            cancel.addEventListener('click', closeAdminModal);
        }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            submit().then(function (res) {
                if (res && res.error) {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                    }
                    global.alert(res.error);
                    return;
                }
                closeAdminModal();
                loadView('offers', true);
                adminSaveToast({
                    title: 'Offre enregistrée',
                    message: 'Les modifications ont été sauvegardées.',
                });
            }).catch(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                global.alert('Échec de l\u2019enregistrement.');
            });
        });
    }

    function openOfferSectionEditor() {
        if (!lastOffersData) {
            return;
        }
        var offers = lastOffersData;
        var body = openAdminModal();
        var html = '<h2 class="portal-admin-panel-title">Modifier l\u2019en-tête</h2>';
        html += '<form class="portal-form" data-offers-section-form>';
        html += '<label class="portal-field"><span>Surtitre</span><input class="portal-input" name="sectionEyebrow" value="' + escapeHtml(offers.sectionEyebrow || '') + '"></label>';
        html += '<label class="portal-field"><span>Titre</span><input class="portal-input" name="sectionTitle" value="' + escapeHtml(offers.sectionTitle || '') + '"></label>';
        html += '<label class="portal-field"><span>Introduction</span><textarea class="portal-input" name="sectionLead" rows="3">' + escapeHtml(offers.sectionLead || '') + '</textarea></label>';
        html += offerEditorActions();
        body.innerHTML = html + '</form>';
        var form = body.querySelector('[data-offers-section-form]');
        if (!form) {
            return;
        }
        bindOfferEditorForm(form, function () {
            return apiPost('offers.php', {
                action: 'update_section',
                sectionEyebrow: form.sectionEyebrow.value,
                sectionTitle: form.sectionTitle.value,
                sectionLead: form.sectionLead.value,
            });
        });
    }

    function openOfferPlanEditor(planId) {
        if (!lastOffersData) {
            return;
        }
        var plans = lastOffersData.plans || [];
        var plan = null;
        for (var i = 0; i < plans.length; i += 1) {
            if (plans[i].id === planId) {
                plan = plans[i];
                break;
            }
        }
        if (!plan) {
            return;
        }
        var body = openAdminModal();
        var html = '<h2 class="portal-admin-panel-title">Modifier l\u2019offre</h2>';
        html += '<p class="portal-admin-meta"><code>' + escapeHtml(plan.id) + '</code></p>';
        html += '<form class="portal-form" data-offers-plan-form>';
        html += '<label class="portal-field"><span>Libellé</span><input class="portal-input" name="label" value="' + escapeHtml(plan.label || '') + '"></label>';
        html += '<label class="portal-field"><span>Description</span><textarea class="portal-input" name="description" rows="2">' + escapeHtml(plan.description || '') + '</textarea></label>';
        html += '<label class="portal-field"><span>Prix affiché</span><input class="portal-input" name="priceDisplay" value="' + escapeHtml(plan.priceDisplay || '') + '" placeholder="ex. 15 € ou Sur devis"><small class="portal-field-hint">Le montant mensuel est déduit automatiquement du nombre saisi (« 15 € » → 15, « Sur devis » → sans montant).</small></label>';
        html += '<div class="portal-field"><span>Fonctionnalités</span>' + listEditor({ variant: 'simple', items: plan.features || [], addLabel: 'Ajouter une fonctionnalité' }) + '</div>';
        html += offerEditorActions();
        body.innerHTML = html + '</form>';
        var form = body.querySelector('[data-offers-plan-form]');
        if (!form) {
            return;
        }
        var featuresEditor = form.querySelector('[data-list-editor]');
        bindListEditor(featuresEditor, { confirmRemove: true, removeItemLabel: 'cette fonctionnalité' });
        bindOfferEditorForm(form, function () {
            var nextFeatures = readListEditor(featuresEditor, 'simple');
            var priceDisplay = form.priceDisplay.value.trim();
            var priceMatch = priceDisplay.match(/-?\d+/);
            return apiPost('offers.php', {
                action: 'update_plan',
                planId: planId,
                label: form.label.value,
                description: form.description.value,
                priceMonthly: priceMatch ? parseInt(priceMatch[0], 10) : null,
                priceDisplay: priceDisplay,
                features: nextFeatures,
            });
        });
    }

    function contentLead(block) {
        if (!block) {
            return '';
        }
        if (block.lead) {
            return String(block.lead);
        }
        if (Array.isArray(block.paragraphs) && block.paragraphs[0]) {
            return String(block.paragraphs[0]);
        }
        return '';
    }

    function contentFeatures(block) {
        return Array.isArray(block && block.features) ? block.features : [];
    }

    function contentCardHead(section, label) {
        return '<div class="portal-admin-offer-card-head"><div>'
            + '<div class="portal-admin-offer-card-kicker">Section</div>'
            + '<div class="portal-admin-offer-card-title">' + escapeHtml(label) + '</div>'
            + '<div class="portal-admin-offer-card-id"><code>' + escapeHtml(section) + '</code></div>'
            + '</div>'
            + '<button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-content-edit="' + escapeHtml(section) + '">'
            + '<i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button>'
            + '</div>';
    }

    function contentHeroCard(block) {
        var html = '<div class="portal-admin-offer-card portal-admin-offer-card--section">';
        html += contentCardHead('hero', CONTENT_SECTION_LABELS.hero);
        html += '<div class="portal-admin-offer-card-price">' + escapeHtml(block.title || 'Sans titre') + '</div>';
        html += '<p class="portal-admin-offer-card-desc">' + escapeHtml(contentLead(block) || 'Aucune introduction.') + '</p>';
        html += '<ul class="portal-admin-offer-features">';
        if (block.ctaLabel) {
            html += '<li><i class="fa-solid fa-arrow-pointer" aria-hidden="true"></i> ' + escapeHtml(block.ctaLabel) + ' <span class="portal-admin-cell-muted">(' + escapeHtml(block.ctaHref || '') + ')</span></li>';
        }
        if (block.secondaryLabel) {
            html += '<li><i class="fa-solid fa-link" aria-hidden="true"></i> ' + escapeHtml(block.secondaryLabel) + ' <span class="portal-admin-cell-muted">(' + escapeHtml(block.secondaryHref || '') + ')</span></li>';
        }
        return html + '</ul></div>';
    }

    function contentAboutCard(block) {
        var features = contentFeatures(block);
        var html = '<div class="portal-admin-offer-card portal-admin-offer-card--plan">';
        html += contentCardHead('about', CONTENT_SECTION_LABELS.about);
        html += '<div class="portal-admin-offer-card-price">' + escapeHtml(block.title || 'Sans titre') + '</div>';
        html += '<p class="portal-admin-offer-card-desc">' + escapeHtml(contentLead(block) || 'Aucune introduction.') + '</p>';
        if (features.length) {
            html += '<ul class="portal-admin-offer-features">';
            features.forEach(function (feature) {
                var icon = normalizeContentFeatureIcon(feature.icon);
                html += '<li><i class="fa-solid fa-' + escapeHtml(icon) + '" aria-hidden="true"></i> <strong>' + escapeHtml(feature.title || '') + '</strong>';
                if (feature.description) {
                    html += '<span class="portal-admin-cell-muted"> · ' + escapeHtml(feature.description) + '</span>';
                }
                html += '</li>';
            });
            html += '</ul>';
        } else {
            html += '<p class="portal-admin-offer-card-empty">Aucun point fort listé.</p>';
        }
        return html + '</div>';
    }

    function contentParcoursCard(block) {
        var html = '<div class="portal-admin-offer-card portal-admin-offer-card--plan">';
        html += contentCardHead('parcours', CONTENT_SECTION_LABELS.parcours);
        if (block.eyebrow) {
            html += '<div class="portal-admin-offer-card-eyebrow">' + escapeHtml(block.eyebrow) + '</div>';
        }
        html += '<div class="portal-admin-offer-card-price">' + escapeHtml(block.title || 'Sans titre') + '</div>';
        html += '<p class="portal-admin-offer-card-desc">' + escapeHtml(contentLead(block) || 'Aucune introduction.') + '</p>';
        return html + '</div>';
    }

    function renderContent(data) {
        lastContentData = data.content || {};
        var content = lastContentData;
        var html = '<div class="portal-admin-offer-grid">';
        html += contentHeroCard(content.hero || {});
        html += contentAboutCard(content.about || {});
        html += contentParcoursCard(content.parcours || {});
        return html + '</div>';
    }

    function bindContentEditorForm(form, submit) {
        var body = form.closest('[data-admin-modal-body]') || form.parentNode;
        var cancel = body ? body.querySelector('[data-content-editor-cancel]') : null;
        if (cancel) {
            cancel.addEventListener('click', closeAdminModal);
        }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            submit().then(function (res) {
                if (res && res.error) {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                    }
                    global.alert(res.error);
                    return;
                }
                closeAdminModal();
                loadView('content', true);
                adminSaveToast({
                    title: 'Contenu enregistré',
                    message: 'La section a été mise à jour.',
                });
            }).catch(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                global.alert('Échec de l\u2019enregistrement.');
            });
        });
    }

    function contentEditorActions() {
        return '<div class="portal-admin-confirm-actions">'
            + '<button type="button" class="portal-account-btn portal-account-btn--compact" data-content-editor-cancel>Annuler</button>'
            + '<button type="submit" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>'
            + '</div>';
    }

    function openContentEditor(section) {
        if (!lastContentData || !CONTENT_SECTION_LABELS[section]) {
            return;
        }
        var block = lastContentData[section] || {};
        var body = openAdminModal();
        var html = '<h2 class="portal-admin-panel-title">Modifier · ' + escapeHtml(CONTENT_SECTION_LABELS[section]) + '</h2>';
        html += '<form class="portal-form" data-content-editor-form>';

        if (section === 'hero') {
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.title) + '</span><input class="portal-input" name="title" value="' + escapeHtml(block.title || '') + '"></label>';
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.lead) + '</span><textarea class="portal-input" name="lead" rows="3">' + escapeHtml(contentLead(block)) + '</textarea></label>';
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.ctaLabel) + '</span><input class="portal-input" name="ctaLabel" value="' + escapeHtml(block.ctaLabel || '') + '"></label>';
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.ctaHref) + '</span><input class="portal-input" name="ctaHref" value="' + escapeHtml(block.ctaHref || '') + '" placeholder="#choisir-os"></label>';
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.secondaryLabel) + '</span><input class="portal-input" name="secondaryLabel" value="' + escapeHtml(block.secondaryLabel || '') + '"></label>';
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.secondaryHref) + '</span><input class="portal-input" name="secondaryHref" value="' + escapeHtml(block.secondaryHref || '') + '" placeholder="#offres"></label>';
        } else if (section === 'about') {
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.title) + '</span><input class="portal-input" name="title" value="' + escapeHtml(block.title || '') + '"></label>';
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.lead) + '</span><textarea class="portal-input" name="lead" rows="4">' + escapeHtml(contentLead(block)) + '</textarea></label>';
            html += '<div class="portal-field"><span>Points forts</span>' + listEditor({ variant: 'feature', items: contentFeatures(block), addLabel: 'Ajouter un point fort' }) + '</div>';
        } else if (section === 'parcours') {
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.eyebrow) + '</span><input class="portal-input" name="eyebrow" value="' + escapeHtml(block.eyebrow || '') + '"></label>';
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.title) + '</span><input class="portal-input" name="title" value="' + escapeHtml(block.title || '') + '"></label>';
            html += '<label class="portal-field"><span>' + escapeHtml(CONTENT_FIELD_LABELS.lead) + '</span><textarea class="portal-input" name="lead" rows="3">' + escapeHtml(contentLead(block)) + '</textarea></label>';
        }

        html += contentEditorActions();
        body.innerHTML = html + '</form>';
        var form = body.querySelector('[data-content-editor-form]');
        if (!form) {
            return;
        }
        var featuresEditor = form.querySelector('[data-list-editor]');
        bindListEditor(featuresEditor, { confirmRemove: true, removeItemLabel: 'ce point fort' });
        bindContentEditorForm(form, function () {
            var fields = {};
            if (section === 'hero') {
                fields.title = form.title.value;
                fields.lead = form.lead.value;
                fields.ctaLabel = form.ctaLabel.value;
                fields.ctaHref = form.ctaHref.value;
                fields.secondaryLabel = form.secondaryLabel.value;
                fields.secondaryHref = form.secondaryHref.value;
            } else if (section === 'about') {
                fields.title = form.title.value;
                fields.lead = form.lead.value;
                fields.features = readListEditor(featuresEditor, 'feature');
            } else if (section === 'parcours') {
                fields.eyebrow = form.eyebrow.value;
                fields.title = form.title.value;
                fields.lead = form.lead.value;
            }
            return apiPost('content.php', { section: section, fields: fields });
        });
    }

    function renderAuditToolbar() {
        var html = '<div class="portal-admin-toolbar" data-admin-audit-toolbar>';
        html += '<label class="portal-admin-toolbar-field"><span>Action</span><select class="portal-input portal-input--compact" data-audit-filter>';
        html += '<option value="">Toutes</option>';
        Object.keys(AUDIT_LABELS).forEach(function (action) {
            var selected = auditFilterAction === action ? ' selected' : '';
            html += '<option value="' + escapeHtml(action) + '"' + selected + '>' + escapeHtml(AUDIT_LABELS[action]) + '</option>';
        });
        html += '</select></label>';
        html += '<div class="portal-admin-toolbar-actions">';
        if (auditOffset > 0) {
            html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-audit-prev>Précédent</button>';
        }
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-audit-next>Suivant</button>';
        html += '</div></div>';
        return html;
    }

    function renderAudit(data) {
        var entries = data.entries || [];
        lastAuditEntries = entries;
        var html = renderAuditToolbar();
        if (!entries.length) {
            return html + '<p class="portal-admin-empty">Aucune entrée d\'audit.</p>';
        }
        html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Date</th><th>Acteur</th><th>Action</th><th>Cible</th></tr></thead><tbody>';
        entries.forEach(function (e) {
            html += '<tr class="portal-admin-row-click" data-audit-entry-id="' + escapeHtml(e.id) + '" title="Voir le détail">';
            html += '<td>' + escapeHtml(formatDate(e.createdAt)) + '</td>';
            html += '<td>' + escapeHtml(userPublicLabel({ publicId: e.actorPublicId, id: e.actorUserId })) + '</td>';
            html += '<td>' + escapeHtml(auditLabel(e.action)) + '</td>';
            html += '<td>' + escapeHtml(auditTargetSummary(e)) + '</td></tr>';
        });
        return html + '</tbody></table></div>';
    }

    var RUNTIME_SOURCE_LABELS = {
        users: 'Utilisateurs',
        subscriptions: 'Abonnements',
        tickets: 'Tickets support',
        classrooms: 'Classes',
        progress: 'Progression',
        osCatalog: 'Catalogue OS',
        modulesCatalog: 'Catalogue modules',
        offers: 'Offres',
        portalContent: 'Contenu portail',
    };

    var RUNTIME_TABLE_LABELS = {
        users: 'Comptes utilisateurs',
        subscriptions: 'Abonnements',
        user_roles: 'Rôles attribués',
        support_tickets: 'Tickets support',
        support_ticket_messages: 'Messages support',
        classrooms: 'Classes',
        classroom_members: 'Membres de classe',
        module_progress: 'Progression modules',
        purchased_modules: 'Modules achetés',
        creator_module_submissions: 'Soumissions créateurs',
        os_usage_daily: 'Quotas OS (jour)',
        admin_audit_log: 'Journal d\'audit',
        schema_migrations: 'Migrations appliquées',
    };

    function runtimeSourceTypeLabel(type) {
        if (type === 'database') {
            return 'Base de données';
        }
        if (type === 'contract') {
            return 'Contrat JSON';
        }
        if (type === 'database+files') {
            return 'Base + fichiers';
        }
        return type || 'Source';
    }

    function renderRuntime(data) {
        if (!data || data.connected === false) {
            return '<div class="portal-admin-runtime portal-admin-runtime--error"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><div class="portal-admin-runtime-body"><strong>Base de données injoignable</strong><p>' + escapeHtml((data && data.error) || 'La connexion à la base a échoué.') + '</p></div></div>';
        }
        var sources = data.sources || {};
        var sourceKeys = Object.keys(sources);
        var tableRows = data.tableRows || {};
        var tableKeys = Object.keys(tableRows);
        var driverLabel = data.driver === 'pgsql' ? 'PostgreSQL' : 'SQLite';
        var schemaVersion = Number(data.schemaVersion || 0);
        var schemaTarget = Number(data.schemaTarget || schemaVersion);
        var upToDate = data.schemaUpToDate !== false && schemaVersion >= schemaTarget;
        var catalogLabel = data.relationalCatalog ? 'Base relationnelle' : 'Fichiers JSON';
        var totalRecords = tableKeys.reduce(function (sum, key) {
            return sum + (Number(tableRows[key]) || 0);
        }, 0);

        var html = '<div class="portal-admin-dashboard">';

        html += '<div class="portal-admin-runtime' + (upToDate ? '' : ' portal-admin-runtime--warn') + '">';
        html += '<i class="fa-solid ' + (upToDate ? 'fa-circle-check' : 'fa-triangle-exclamation') + '" aria-hidden="true"></i>';
        html += '<div class="portal-admin-runtime-body">';
        html += '<strong>' + (upToDate ? 'Système opérationnel' : 'Migration de schéma requise') + '</strong>';
        html += '<p>' + (upToDate
            ? 'Base ' + escapeHtml(driverLabel) + ' connectée et schéma à jour (v' + schemaVersion + ').'
            : 'Schéma en v' + schemaVersion + ', cible v' + schemaTarget + ' — appliquez les migrations ci-dessous.') + '</p>';
        html += '</div></div>';

        html += '<div class="portal-admin-kpi-grid portal-admin-kpi-grid--6">';
        html += kpiCard({ label: 'Base de données', value: 'Connectée', icon: 'fa-circle-check' });
        html += kpiCard({ label: 'Moteur', value: driverLabel, icon: 'fa-database' });
        html += kpiCard({ label: 'Schéma', value: 'v' + schemaVersion, icon: 'fa-layer-group', hint: upToDate ? 'À jour' : 'Cible v' + schemaTarget });
        html += kpiCard({ label: 'Catalogue modules', value: catalogLabel, icon: 'fa-cube' });
        html += kpiCard({ label: 'Enregistrements', value: formatInt(totalRecords), icon: 'fa-table-list', hint: tableKeys.length + ' tables' });
        if (data.phpVersion) {
            html += kpiCard({ label: 'PHP', value: data.phpVersion, icon: 'fa-code' });
        }
        html += '</div>';

        html += '<div class="portal-admin-dashboard-grid">';

        html += '<div class="portal-admin-panel">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Schéma de base de données</h2>';
        html += (upToDate
            ? '<span class="portal-admin-badge portal-admin-badge--account-verifie">À jour</span>'
            : '<span class="portal-admin-badge portal-admin-badge--sub-past_due">Migration requise</span>') + '</div>';
        html += '<dl class="portal-admin-dl">';
        html += '<dt>Moteur</dt><dd>' + escapeHtml(driverLabel) + '</dd>';
        html += '<dt>Version appliquée</dt><dd>v' + schemaVersion + '</dd>';
        html += '<dt>Version cible</dt><dd>v' + schemaTarget + '</dd>';
        html += '<dt>Source du catalogue</dt><dd>' + escapeHtml(catalogLabel) + '</dd>';
        html += '</dl>';
        html += '<p class="portal-admin-meta">Applique les migrations SQL manquantes et resynchronise le catalogue de modules. Opération sûre et idempotente.</p>';
        html += '<div class="portal-admin-actions"><button type="button" class="portal-account-btn portal-account-btn--primary" data-runtime-migrate><i class="fa-solid fa-rotate" aria-hidden="true"></i> Appliquer les migrations</button> <span class="portal-admin-inline-status" data-runtime-migrate-status></span></div>';
        html += '</div>';

        html += '<div class="portal-admin-panel">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Environnement serveur</h2></div>';
        html += '<dl class="portal-admin-dl">';
        html += '<dt>Version PHP</dt><dd>' + escapeHtml(data.phpVersion || '—') + '</dd>';
        html += '<dt>Heure serveur</dt><dd>' + escapeHtml(formatDate(data.serverTime) || '—') + '</dd>';
        html += '<dt>Fuseau horaire</dt><dd>' + escapeHtml(data.timezone || '—') + '</dd>';
        html += '<dt>Sources déclarées</dt><dd>' + sourceKeys.length + '</dd>';
        html += '</dl>';
        html += '</div></div>';

        html += '<div class="portal-admin-panel portal-admin-panel--grow">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Volumétrie des tables</h2></div>';
        if (!tableKeys.length) {
            html += '<p class="portal-admin-empty">Aucune table accessible.</p>';
        } else {
            html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Table</th><th>Identifiant</th><th class="portal-admin-cell-num">Lignes</th></tr></thead><tbody>';
            tableKeys.forEach(function (key) {
                html += '<tr><td>' + escapeHtml(RUNTIME_TABLE_LABELS[key] || key) + '</td>';
                html += '<td><code>' + escapeHtml(key) + '</code></td>';
                html += '<td class="portal-admin-cell-num">' + formatInt(tableRows[key]) + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';

        html += '<div class="portal-admin-panel portal-admin-panel--grow">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Sources de données</h2></div>';
        html += '<p class="portal-admin-meta">Origine de chaque domaine fonctionnel du portail.</p>';
        if (!sourceKeys.length) {
            html += '<p class="portal-admin-empty">Aucune source déclarée.</p>';
        } else {
            html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Domaine</th><th>Type</th><th>Emplacement</th></tr></thead><tbody>';
            sourceKeys.forEach(function (key) {
                var source = sources[key] || {};
                var target = source.table || source.path || '—';
                html += '<tr><td>' + escapeHtml(RUNTIME_SOURCE_LABELS[key] || key) + '</td>';
                html += '<td>' + escapeHtml(runtimeSourceTypeLabel(source.type)) + '</td>';
                html += '<td><code>' + escapeHtml(target) + '</code></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';

        html += '</div>';
        return html;
    }

    function renderUsage(data) {
        var html = '<p class="portal-admin-meta">Date : ' + escapeHtml(data.usageDate || '') + ' · Limite : ' + (data.limitMinutes || 15) + ' min/OS · Reset : ' + escapeHtml(formatDate(data.resetsAt)) + '</p>';
        var entries = data.entries || [];
        if (!entries.length) {
            return html + '<p class="portal-admin-empty">Aucune consommation enregistrée aujourd\'hui.</p>';
        }
        html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Sujet</th><th>OS</th><th>Utilisé</th><th>Restant</th></tr></thead><tbody>';
        entries.forEach(function (e) {
            html += '<tr><td>' + escapeHtml(e.userPublicId ? '#' + e.userPublicId : (e.userEmail || e.subjectKey)) + '</td>';
            html += '<td><code>' + escapeHtml(e.registryId) + '</code></td>';
            html += '<td>' + escapeHtml(String(e.minutesUsed)) + ' min</td>';
            html += '<td>' + escapeHtml(String(e.minutesRemaining)) + ' min</td></tr>';
        });
        html += '</tbody></table></div>';
        if ((data.total || 0) > usageOffset + entries.length) {
            html += '<div class="portal-admin-actions"><button type="button" class="portal-account-btn" data-usage-next>Charger plus</button></div>';
        }
        return html;
    }

    function renderProgress(data) {
        var entries = data.entries || [];
        var html = '<p class="portal-admin-meta">Total : ' + (data.total || 0) + ' entrées</p>';
        if (!entries.length) {
            return html + '<p class="portal-admin-empty">Aucune progression enregistrée.</p>';
        }
        html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Identifiant</th><th>Module</th><th>OS</th><th>Avancement</th><th>Mise à jour</th></tr></thead><tbody>';
        entries.forEach(function (e) {
            html += '<tr><td><code>' + escapeHtml(userPublicLabel(e)) + '</code></td>';
            html += '<td><code>' + escapeHtml(e.mountId) + '</code></td>';
            html += '<td>' + escapeHtml(e.registryId) + '</td>';
            html += '<td>' + e.doneCount + '/' + e.totalCount + ' (' + e.percent + '%)</td>';
            html += '<td>' + escapeHtml(formatDate(e.updatedAt)) + '</td></tr>';
        });
        return html + '</tbody></table></div>';
    }

    function renderGamification(data) {
        var html = '<p class="portal-admin-meta">Badges catalogue : ' + (data.badgeTotal || 0) + ' · XP/niveau : ' + ((data.contract && data.contract.xpPerLevel) || 100) + '</p>';
        var users = data.users || [];
        if (!users.length) {
            return html + '<p class="portal-admin-empty">Aucun utilisateur gamifié.</p>';
        }
        html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Identifiant</th><th>Niveau</th><th>XP</th><th>Badges</th></tr></thead><tbody>';
        users.forEach(function (u) {
            html += '<tr><td><code>' + escapeHtml(userPublicLabel(u)) + '</code></td>';
            html += '<td>' + u.level + '</td><td>' + u.xp + '</td>';
            html += '<td>' + (u.badgeCount || 0) + (u.badges && u.badges.length ? ' (' + escapeHtml(u.badges.join(', ')) + ')' : '') + '</td></tr>';
        });
        return html + '</tbody></table></div>';
    }

    function entCapBadge(on) {
        return on
            ? '<span class="portal-admin-badge portal-admin-badge--os-active">Oui</span>'
            : '<span class="portal-admin-cell-muted">Non</span>';
    }

    function entQuotaLabel(row) {
        var daily = row.maxMinutesPerOsPerDay;
        if (daily === null || typeof daily === 'undefined') {
            daily = row.maxMinutes;
        }
        if (daily === null || typeof daily === 'undefined') {
            return 'Illimité';
        }
        return daily + ' min/jour';
    }

    function renderEntitlements(data) {
        lastEntitlementsData = data.entitlements || {};
        var ent = lastEntitlementsData;
        var levels = ent.levels || [];
        var osSession = ent.osSession || {};
        var moduleAccess = ent.moduleAccess || {};

        var html = '<div class="portal-admin-panel">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Niveaux d\'accès</h2></div>';
        html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr>';
        html += '<th>Niveau</th><th>Plan</th><th>Quota OS</th><th>Modules pédago</th><th>Lancement apps</th><th></th>';
        html += '</tr></thead><tbody>';
        levels.forEach(function (lvl) {
            var id = lvl.id;
            var row = osSession[id] || {};
            html += '<tr>';
            html += '<td><div class="portal-admin-os-name"><strong>' + escapeHtml(lvl.label || id) + '</strong><code class="portal-admin-os-id">' + escapeHtml(id) + '</code></div></td>';
            html += '<td>' + escapeHtml(lvl.planId || '—') + '</td>';
            html += '<td>' + escapeHtml(entQuotaLabel(row)) + '</td>';
            html += '<td>' + entCapBadge(!!row.pedagogicalModules) + '</td>';
            html += '<td>' + entCapBadge(!!row.storeAppLaunch) + '</td>';
            html += '<td class="portal-admin-table-actions"><button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-ent-edit-level="' + escapeHtml(id) + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button></td>';
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';

        html += '<div class="portal-admin-panel">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Accès aux modules</h2></div>';
        html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr><th>Catégorie</th><th>Niveaux autorisés</th><th></th></tr></thead><tbody>';
        Object.keys(moduleAccess).forEach(function (key) {
            var allowed = moduleAccess[key] || [];
            var badges = allowed.length
                ? allowed.map(function (l) { return '<span class="portal-admin-badge portal-admin-badge--os-planned">' + escapeHtml(l) + '</span>'; }).join(' ')
                : '<span class="portal-admin-cell-muted">Aucun</span>';
            html += '<tr>';
            html += '<td><code>' + escapeHtml(key) + '</code></td>';
            html += '<td>' + badges + '</td>';
            html += '<td class="portal-admin-table-actions"><button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-ent-edit-access="' + escapeHtml(key) + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button></td>';
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';

        return html;
    }

    function entEditorActions() {
        return '<div class="portal-admin-confirm-actions">'
            + '<button type="button" class="portal-account-btn portal-account-btn--compact" data-ent-cancel>Annuler</button>'
            + '<button type="submit" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>'
            + '</div>';
    }

    function submitEntForm(form, payload) {
        var submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        apiPost('entitlements.php', payload).then(function (res) {
            if (res && res.error) {
                throw new Error(res.error);
            }
            closeAdminModal();
            loadView('entitlements', true);
        }).catch(function (err) {
            if (submitBtn) {
                submitBtn.disabled = false;
            }
            global.alert((err && err.message) || 'Impossible d\'enregistrer les modifications.');
        });
    }

    function openEntLevelEditor(levelId) {
        var ent = lastEntitlementsData || {};
        var levels = ent.levels || [];
        var lvl = null;
        for (var i = 0; i < levels.length; i += 1) {
            if (levels[i].id === levelId) {
                lvl = levels[i];
                break;
            }
        }
        if (!lvl) {
            return;
        }
        var row = (ent.osSession || {})[levelId] || {};
        var body = openAdminModal();
        var minutes = row.maxMinutesPerOsPerDay;
        if (minutes === null || typeof minutes === 'undefined') {
            minutes = row.maxMinutes;
        }
        var minutesValue = (minutes === null || typeof minutes === 'undefined') ? '' : String(minutes);
        var html = '<h2 class="portal-admin-panel-title">Modifier le niveau</h2>';
        html += '<p class="portal-admin-meta"><code>' + escapeHtml(lvl.id) + '</code></p>';
        html += '<form class="portal-form" data-ent-level-form>';
        html += '<label class="portal-field"><span>Libellé</span><input class="portal-input" name="label" value="' + escapeHtml(lvl.label || '') + '" placeholder="Nom du niveau"></label>';
        html += '<label class="portal-field"><span>Plan</span><input class="portal-input" name="planId" value="' + escapeHtml(lvl.planId || '') + '" placeholder="free, subscriber…"></label>';
        html += '<label class="portal-field"><span>Quota OS (minutes / jour, vide = illimité)</span><input type="number" class="portal-input" name="maxMinutes" min="0" value="' + escapeHtml(minutesValue) + '"></label>';
        html += adminToggleRow({ label: 'Tous les OS du catalogue', icon: 'fa-desktop', checked: !!row.allCatalogOs, attrs: { 'data-ent-cap': 'allCatalogOs' } });
        html += adminToggleRow({ label: 'Modules pédagogiques', icon: 'fa-graduation-cap', checked: !!row.pedagogicalModules, attrs: { 'data-ent-cap': 'pedagogicalModules' } });
        html += adminToggleRow({ label: 'Parcourir le magasin', icon: 'fa-store', checked: !!row.storeBrowse, attrs: { 'data-ent-cap': 'storeBrowse' } });
        html += adminToggleRow({ label: 'Lancer les apps', icon: 'fa-rocket', checked: !!row.storeAppLaunch, attrs: { 'data-ent-cap': 'storeAppLaunch' } });
        html += entEditorActions();
        html += '</form>';
        body.innerHTML = html;
        var form = body.querySelector('[data-ent-level-form]');
        bindEntModalCommon(body, form);
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var minutesRaw = form.maxMinutes ? form.maxMinutes.value.trim() : '';
            var minutesNum = minutesRaw === '' ? null : (parseInt(minutesRaw, 10) || 0);
            var payload = {
                action: 'update_level',
                levelId: lvl.id,
                label: form.label ? form.label.value.trim() : '',
                planId: form.planId ? form.planId.value.trim() : '',
                maxMinutesPerOsPerDay: minutesNum,
                maxMinutes: minutesNum,
            };
            form.querySelectorAll('[data-ent-cap]').forEach(function (cb) {
                payload[cb.getAttribute('data-ent-cap')] = cb.checked;
            });
            submitEntForm(form, payload);
        });
    }

    function openEntAccessEditor(key) {
        var ent = lastEntitlementsData || {};
        var allowed = (ent.moduleAccess || {})[key] || [];
        var levels = ent.levels || [];
        var body = openAdminModal();
        var html = '<h2 class="portal-admin-panel-title">Modifier l\'accès aux modules</h2>';
        html += '<p class="portal-admin-meta"><code>' + escapeHtml(key) + '</code> — niveaux autorisés à accéder à cette catégorie de modules.</p>';
        html += '<form class="portal-form" data-ent-access-form>';
        levels.forEach(function (lvl) {
            html += adminToggleRow({ label: (lvl.label || lvl.id) + ' (' + lvl.id + ')', checked: allowed.indexOf(lvl.id) !== -1, attrs: { 'data-ent-level': lvl.id } });
        });
        html += entEditorActions();
        html += '</form>';
        body.innerHTML = html;
        var form = body.querySelector('[data-ent-access-form]');
        bindEntModalCommon(body, form);
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var selected = [];
            form.querySelectorAll('[data-ent-level]').forEach(function (cb) {
                if (cb.checked) {
                    selected.push(cb.getAttribute('data-ent-level'));
                }
            });
            submitEntForm(form, { action: 'update_module_access', key: key, levels: selected });
        });
    }

    function bindEntModalCommon(body, form) {
        if (!form) {
            return;
        }
        var cancel = form.querySelector('[data-ent-cancel]');
        if (cancel) {
            cancel.addEventListener('click', closeAdminModal);
        }
    }

    function gradePermKeyForGrade(gradeId) {
        return GRADE_PERM_KEYS[String(gradeId || '')] || '';
    }

    function gradeFlagLabel(flag) {
        var meta = GRADE_PERMISSION_META[flag];
        return meta ? meta.label : flag;
    }

    function gradeBoolBadge(on, label) {
        var cls = on ? 'portal-admin-badge--visible' : 'portal-admin-badge--masque';
        var icon = on ? 'fa-check' : 'fa-xmark';
        return '<span class="portal-admin-badge ' + cls + '"><i class="fa-solid ' + icon + '" aria-hidden="true"></i> ' + escapeHtml(label) + '</span>';
    }

    function gradeCard(grade) {
        var permKey = gradePermKeyForGrade(grade.id);
        var caps = permKey && lastGradesData ? (lastGradesData.permissions || {})[permKey] : null;
        var html = '<div class="portal-admin-offer-card portal-admin-offer-card--plan">';
        html += '<div class="portal-admin-offer-card-head"><div>';
        html += '<div class="portal-admin-offer-card-kicker">Grade</div>';
        html += '<div class="portal-admin-offer-card-title">' + escapeHtml(grade.label || grade.id) + '</div>';
        html += '<div class="portal-admin-offer-card-id"><code>' + escapeHtml(grade.id) + '</code></div>';
        html += '</div>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-grade-edit="' + escapeHtml(grade.id) + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button>';
        html += '</div>';
        html += '<div class="portal-admin-grade-flags">';
        html += gradeBoolBadge(!!grade.requiresSubscription, 'Abonnement requis');
        html += gradeBoolBadge(!!grade.manualGrant, 'Attribution manuelle');
        html += '</div>';
        if (caps) {
            html += '<div class="portal-admin-grade-flags">';
            Object.keys(GRADE_PERMISSION_META).forEach(function (flag) {
                if (caps[flag]) {
                    html += gradeBoolBadge(true, gradeFlagLabel(flag));
                }
            });
            html += '</div>';
        } else if (!permKey) {
            html += '<p class="portal-admin-offer-card-empty">Droits hérités du grade de base (abonné ou utilisateur).</p>';
        }
        var sections = Array.isArray(grade.profileSections) ? grade.profileSections : [];
        if (sections.length) {
            html += '<p class="portal-admin-offer-card-desc"><span class="portal-admin-cell-muted">Sections profil :</span> ' + escapeHtml(sections.join(', ')) + '</p>';
        }
        return html + '</div>';
    }

    function renderGrades(data) {
        lastGradesData = {
            grades: data.grades || [],
            permissions: data.permissions || {},
        };
        var grades = lastGradesData.grades;
        var html = '<div class="portal-admin-offer-grid">';
        if (grades.length) {
            grades.forEach(function (grade) {
                html += gradeCard(grade);
            });
        } else {
            html += '<p class="portal-admin-empty">Aucun grade.</p>';
        }
        return html + '</div>';
    }

    function gradeEditorActions() {
        return '<div class="portal-admin-confirm-actions">'
            + '<button type="button" class="portal-account-btn portal-account-btn--compact" data-grade-cancel>Annuler</button>'
            + '<button type="submit" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>'
            + '</div>';
    }

    function runGradeTasks(tasks) {
        return tasks.reduce(function (chain, task) {
            return chain.then(function () {
                return apiPost('grades.php', task).then(function (res) {
                    if (res && res.error) {
                        throw new Error(res.error);
                    }
                });
            });
        }, Promise.resolve());
    }

    function submitGradeForm(form, tasks) {
        var submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        runGradeTasks(tasks).then(function () {
            closeAdminModal();
            loadView('grades', true);
        }).catch(function (err) {
            if (submitBtn) {
                submitBtn.disabled = false;
            }
            global.alert((err && err.message) || 'Impossible d\'enregistrer les modifications.');
        });
    }

    function openGradeEditor(gradeId) {
        var data = lastGradesData || {};
        var grades = data.grades || [];
        var grade = null;
        for (var i = 0; i < grades.length; i += 1) {
            if (grades[i].id === gradeId) {
                grade = grades[i];
                break;
            }
        }
        if (!grade) {
            return;
        }
        var permKey = gradePermKeyForGrade(grade.id);
        var caps = permKey ? (data.permissions || {})[permKey] || {} : null;
        var body = openAdminModal();
        var html = '<h2 class="portal-admin-panel-title">Modifier le grade</h2>';
        html += '<p class="portal-admin-meta"><code>' + escapeHtml(grade.id) + '</code></p>';
        html += '<form class="portal-form" data-grade-form>';
        html += '<label class="portal-field"><span>Libellé</span><input class="portal-input" name="label" value="' + escapeHtml(grade.label || '') + '" placeholder="Nom du grade"></label>';
        html += adminToggleRow({ label: 'Abonnement requis', icon: 'fa-credit-card', checked: !!grade.requiresSubscription, attrs: { 'data-grade-flag': 'requiresSubscription' } });
        html += adminToggleRow({ label: 'Attribution manuelle (via ticket / admin)', icon: 'fa-user-gear', checked: !!grade.manualGrant, attrs: { 'data-grade-flag': 'manualGrant' } });
        if (caps) {
            html += '<h3 class="portal-admin-panel-subtitle">Droits effectifs</h3>';
            html += '<p class="portal-admin-meta">Appliqués côté serveur pour <code>' + escapeHtml(permKey) + '</code>.</p>';
            Object.keys(GRADE_PERMISSION_META).forEach(function (flag) {
                var meta = GRADE_PERMISSION_META[flag];
                html += adminToggleRow({ label: meta.label, icon: meta.icon, checked: !!caps[flag], attrs: { 'data-grade-cap': flag } });
            });
        } else {
            html += '<p class="portal-admin-meta">Ce grade n\'a pas d\'ensemble de droits propre : les accès sont hérités du grade de base (abonné ou utilisateur).</p>';
        }
        html += gradeEditorActions();
        html += '</form>';
        body.innerHTML = html;
        var form = body.querySelector('[data-grade-form]');
        var cancel = form.querySelector('[data-grade-cancel]');
        if (cancel) {
            cancel.addEventListener('click', closeAdminModal);
        }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var tasks = [{
                action: 'update_grade',
                gradeId: grade.id,
                label: form.label ? form.label.value.trim() : '',
            }];
            form.querySelectorAll('[data-grade-flag]').forEach(function (cb) {
                tasks[0][cb.getAttribute('data-grade-flag')] = cb.checked;
            });
            if (permKey) {
                var perms = {};
                form.querySelectorAll('[data-grade-cap]').forEach(function (cb) {
                    perms[cb.getAttribute('data-grade-cap')] = cb.checked;
                });
                tasks.push({ action: 'update_permissions', key: permKey, permissions: perms });
            }
            submitGradeForm(form, tasks);
        });
    }

    function legalCard(section) {
        var paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
        var html = '<div class="portal-admin-offer-card portal-admin-offer-card--plan">';
        html += '<div class="portal-admin-offer-card-head"><div>';
        html += '<div class="portal-admin-offer-card-kicker">Texte légal</div>';
        html += '<div class="portal-admin-offer-card-title">' + escapeHtml(section.title || section.id || '') + '</div>';
        html += '<div class="portal-admin-offer-card-id"><code>' + escapeHtml(section.id || '') + '</code></div>';
        html += '</div>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-legal-edit="' + escapeHtml(section.id || '') + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button>';
        html += '</div>';
        if (paragraphs.length) {
            html += '<p class="portal-admin-offer-card-desc">' + escapeHtml(paragraphs[0]) + '</p>';
            html += '<p class="portal-admin-offer-card-empty">' + paragraphs.length + ' paragraphe' + (paragraphs.length > 1 ? 's' : '') + '.</p>';
        } else {
            html += '<p class="portal-admin-offer-card-empty">Aucun paragraphe.</p>';
        }
        return html + '</div>';
    }

    function a11yExcerpt(paragraphs) {
        var list = paragraphs || [];
        if (!list.length) {
            return '—';
        }
        var text = String(list[0] || '');
        if (text.length > 120) {
            return text.slice(0, 117) + '…';
        }
        return text;
    }

    function renderAccessibility(data) {
        var a11y = data.accessibility || {};
        lastAccessibilityData = a11y;
        var sections = a11y.sections || data.sections || [];

        var html = '<div class="portal-admin-panel">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Page publique</h2>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-a11y-edit-page><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button></div>';
        html += '<dl class="portal-admin-dl">';
        html += '<div><dt>Titre</dt><dd>' + escapeHtml(a11y.pageTitle || '—') + '</dd></div>';
        html += '<div><dt>Introduction</dt><dd>' + escapeHtml(a11y.intro || '—') + '</dd></div>';
        html += '<div><dt>E-mail de contact</dt><dd>' + escapeHtml(a11y.contactEmail || '—') + '</dd></div>';
        html += '</dl></div>';

        html += '<div class="portal-admin-panel portal-admin-panel--grow">';
        html += '<div class="portal-admin-panel-head"><h2 class="portal-admin-panel-title">Sections</h2></div>';
        html += '<div class="portal-admin-table-wrap"><table class="portal-admin-table"><thead><tr>';
        html += '<th>Section</th><th>ID</th><th>Extrait</th><th></th>';
        html += '</tr></thead><tbody>';
        sections.forEach(function (section) {
            var id = section.id || '';
            html += '<tr>';
            html += '<td><strong>' + escapeHtml(section.title || id) + '</strong></td>';
            html += '<td><code class="portal-admin-os-id">' + escapeHtml(id) + '</code></td>';
            html += '<td class="portal-admin-cell-muted">' + escapeHtml(a11yExcerpt(section.paragraphs)) + '</td>';
            html += '<td class="portal-admin-table-actions"><button type="button" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary" data-a11y-edit-section="' + escapeHtml(id) + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier</button></td>';
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';

        return html;
    }

    function a11yEditorActions() {
        return '<div class="portal-admin-confirm-actions">'
            + '<button type="button" class="portal-account-btn portal-account-btn--compact" data-a11y-cancel>Annuler</button>'
            + '<button type="submit" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>'
            + '</div>';
    }

    function bindA11yModalCommon(body, form) {
        if (!form) {
            return;
        }
        var cancel = form.querySelector('[data-a11y-cancel]');
        if (cancel) {
            cancel.addEventListener('click', closeAdminModal);
        }
    }

    function submitA11yForm(form, payload, toastMessage) {
        var submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        apiPost('accessibility.php', payload).then(function (res) {
            if (res && res.error) {
                throw new Error(res.error);
            }
            closeAdminModal();
            loadView('accessibility', true);
            adminSaveToast({
                title: 'Accessibilité enregistrée',
                message: toastMessage || 'Les modifications ont été enregistrées.',
            });
        }).catch(function (err) {
            if (submitBtn) {
                submitBtn.disabled = false;
            }
            global.alert((err && err.message) || 'Impossible d\'enregistrer les modifications.');
        });
    }

    function openA11yPageEditor() {
        var a11y = lastAccessibilityData || {};
        var body = openAdminModal();
        var html = '<h2 class="portal-admin-panel-title">Modifier la page accessibilité</h2>';
        html += '<form class="portal-form" data-a11y-page-form>';
        html += '<label class="portal-field"><span>Titre de la page</span><input class="portal-input" name="pageTitle" value="' + escapeHtml(a11y.pageTitle || '') + '"></label>';
        html += '<label class="portal-field"><span>Introduction</span><textarea class="portal-input" name="intro" rows="4">' + escapeHtml(a11y.intro || '') + '</textarea></label>';
        html += '<label class="portal-field"><span>E-mail de contact</span><input class="portal-input" type="email" name="contactEmail" value="' + escapeHtml(a11y.contactEmail || '') + '" placeholder="info@exemple.fr"></label>';
        html += a11yEditorActions();
        html += '</form>';
        body.innerHTML = html;
        var form = body.querySelector('[data-a11y-page-form]');
        bindA11yModalCommon(body, form);
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            submitA11yForm(form, {
                action: 'update_page',
                pageTitle: form.pageTitle ? form.pageTitle.value.trim() : '',
                intro: form.intro ? form.intro.value.trim() : '',
                contactEmail: form.contactEmail ? form.contactEmail.value.trim() : '',
            }, 'La page publique a été mise à jour.');
        });
    }

    function openA11ySectionEditor(sectionId) {
        var a11y = lastAccessibilityData || {};
        var sections = a11y.sections || [];
        var section = null;
        for (var i = 0; i < sections.length; i += 1) {
            if (sections[i].id === sectionId) {
                section = sections[i];
                break;
            }
        }
        if (!section) {
            return;
        }
        var paragraphs = section.paragraphs || [];
        var body = openAdminModal();
        var html = '<h2 class="portal-admin-panel-title">Modifier la section</h2>';
        html += '<p class="portal-admin-meta"><code>' + escapeHtml(sectionId) + '</code></p>';
        html += '<form class="portal-form" data-a11y-section-form>';
        html += '<label class="portal-field"><span>Titre</span><input class="portal-input" name="title" value="' + escapeHtml(section.title || '') + '"></label>';
        html += '<div class="portal-field"><span>Paragraphes</span>' + listEditor({ variant: 'simple', items: paragraphs, addLabel: 'Ajouter un paragraphe' }) + '</div>';
        html += a11yEditorActions();
        html += '</form>';
        body.innerHTML = html;
        var form = body.querySelector('[data-a11y-section-form]');
        var paragraphsEditor = form.querySelector('[data-list-editor]');
        bindListEditor(paragraphsEditor, { confirmRemove: true, removeItemLabel: 'ce paragraphe' });
        bindA11yModalCommon(body, form);
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            submitA11yForm(form, {
                action: 'update_section',
                sectionId: sectionId,
                title: form.title ? form.title.value.trim() : '',
                paragraphs: readListEditor(paragraphsEditor, 'simple'),
            }, 'La section a été mise à jour.');
        });
    }

    function renderLegal(data) {
        lastLegalData = data.sections || [];
        var html = '<div class="portal-admin-offer-grid">';
        if (lastLegalData.length) {
            lastLegalData.forEach(function (section) {
                html += legalCard(section);
            });
        } else {
            html += '<p class="portal-admin-empty">Aucune section légale.</p>';
        }
        return html + '</div>';
    }

    function legalParagraphBlock(text, index) {
        var num = index + 1;
        return '<div class="portal-admin-para-block" data-legal-para>'
            + '<div class="portal-admin-para-head">'
            + '<span class="portal-admin-para-label">Paragraphe ' + num + '</span>'
            + '<button type="button" class="portal-admin-para-remove" data-legal-para-remove aria-label="Supprimer ce paragraphe"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>'
            + '</div>'
            + '<textarea class="portal-input" data-legal-para-text rows="4">' + escapeHtml(text || '') + '</textarea>'
            + '</div>';
    }

    function legalRenumberParas(list) {
        var blocks = list.querySelectorAll('[data-legal-para]');
        for (var i = 0; i < blocks.length; i += 1) {
            var label = blocks[i].querySelector('.portal-admin-para-label');
            if (label) {
                label.textContent = 'Paragraphe ' + (i + 1);
            }
        }
    }

    function openLegalEditor(sectionId) {
        var section = null;
        for (var i = 0; i < lastLegalData.length; i += 1) {
            if (lastLegalData[i].id === sectionId) {
                section = lastLegalData[i];
                break;
            }
        }
        if (!section) {
            return;
        }
        var paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
        var body = openAdminModal();
        var html = '<h2 class="portal-admin-panel-title">Modifier le texte légal</h2>';
        html += '<p class="portal-admin-meta"><code>' + escapeHtml(section.id || '') + '</code></p>';
        html += '<form class="portal-form" data-legal-form>';
        html += '<label class="portal-field"><span>Titre</span><input class="portal-input" name="title" value="' + escapeHtml(section.title || '') + '"></label>';
        html += '<div class="portal-field"><span>Paragraphes</span>';
        html += '<div class="portal-admin-para-list" data-legal-para-list>';
        if (paragraphs.length) {
            paragraphs.forEach(function (p, idx) {
                html += legalParagraphBlock(p, idx);
            });
        } else {
            html += legalParagraphBlock('', 0);
        }
        html += '</div>';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-legal-para-add><i class="fa-solid fa-plus" aria-hidden="true"></i> Ajouter un paragraphe</button>';
        html += '</div>';
        html += '<div class="portal-admin-confirm-actions">';
        html += '<button type="button" class="portal-account-btn portal-account-btn--compact" data-legal-cancel>Annuler</button>';
        html += '<button type="submit" class="portal-account-btn portal-account-btn--compact portal-account-btn--primary"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>';
        html += '</div></form>';
        body.innerHTML = html;
        var form = body.querySelector('[data-legal-form]');
        var list = form.querySelector('[data-legal-para-list]');
        var cancel = form.querySelector('[data-legal-cancel]');
        if (cancel) {
            cancel.addEventListener('click', closeAdminModal);
        }
        var addBtn = form.querySelector('[data-legal-para-add]');
        if (addBtn) {
            addBtn.addEventListener('click', function () {
                var count = list.querySelectorAll('[data-legal-para]').length;
                list.insertAdjacentHTML('beforeend', legalParagraphBlock('', count));
                var blocks = list.querySelectorAll('[data-legal-para] [data-legal-para-text]');
                if (blocks.length) {
                    blocks[blocks.length - 1].focus();
                }
            });
        }
        list.addEventListener('click', function (ev) {
            var removeBtn = ev.target.closest('[data-legal-para-remove]');
            if (!removeBtn || !list.contains(removeBtn)) {
                return;
            }
            var blocks = list.querySelectorAll('[data-legal-para]');
            if (blocks.length <= 1) {
                var only = blocks[0] ? blocks[0].querySelector('[data-legal-para-text]') : null;
                if (only) {
                    only.value = '';
                }
                return;
            }
            var block = removeBtn.closest('[data-legal-para]');
            if (block) {
                block.parentNode.removeChild(block);
                legalRenumberParas(list);
            }
        });
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var title = form.title ? form.title.value.trim() : '';
            var paras = [];
            list.querySelectorAll('[data-legal-para-text]').forEach(function (ta) {
                var val = ta.value.trim();
                if (val) {
                    paras.push(val);
                }
            });
            if (!title) {
                global.alert('Le titre ne peut pas être vide.');
                return;
            }
            if (!paras.length) {
                global.alert('Ajoutez au moins un paragraphe.');
                return;
            }
            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            apiPost('legal.php', {
                action: 'update_section',
                sectionId: section.id,
                title: title,
                paragraphs: paras,
            }).then(function (res) {
                if (res && res.error) {
                    throw new Error(res.error);
                }
                closeAdminModal();
                loadView('legal', true);
            }).catch(function (err) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                global.alert((err && err.message) || 'Impossible d\'enregistrer les modifications.');
            });
        });
    }

    var loaders = {
        dashboard: function () { return apiGet('dashboard.php').then(renderDashboard); },
        users: function (query) {
            var params = ['limit=' + usersPageSize, 'offset=' + usersOffset];
            if (query) {
                params.unshift('q=' + encodeURIComponent(query));
            }
            return apiGet('users.php?' + params.join('&')).then(renderUsers);
        },
        admins: function (query) {
            var q = query ? '?q=' + encodeURIComponent(query) : '';
            return apiGet('users.php' + q).then(renderAdmins);
        },
        tickets: function () { return apiGet('tickets.php').then(renderTickets); },
        subscriptions: function () {
            return apiGet('subscriptions.php').then(function (data) {
                var subs = data.subscriptions || [];
                lastSubscriptionsData = subs;
                var live = global.CapsulePortalSubscriptionLive;
                if (live && typeof live.listFingerprint === 'function') {
                    lastSubscriptionsFingerprint = live.listFingerprint(subs);
                }
                return renderSubscriptions(data);
            });
        },
        classes: function () { return apiGet('classrooms.php').then(renderClasses); },
        os: function () { return apiGet('catalog-os.php').then(renderOs); },
        modules: function () { return apiGet('catalog-modules.php').then(renderModules); },
        offers: function () { return apiGet('offers.php').then(renderOffers); },
        content: function () { return apiGet('content.php').then(renderContent); },
        usage: function () { return apiGet('usage.php?limit=100&offset=' + usageOffset).then(renderUsage); },
        progress: function () { return apiGet('progress.php?limit=100&offset=' + progressOffset).then(renderProgress); },
        gamification: function () { return apiGet('gamification.php?limit=50&offset=' + gamificationOffset).then(renderGamification); },
        runtime: function () { return apiGet('runtime.php').then(renderRuntime); },
        entitlements: function () { return apiGet('entitlements.php').then(renderEntitlements); },
        grades: function () { return apiGet('grades.php').then(renderGrades); },
        legal: function () { return apiGet('legal.php').then(renderLegal); },
        accessibility: function () { return apiGet('accessibility.php').then(renderAccessibility); },
        audit: function () {
            var q = 'audit.php?limit=' + auditPageSize + '&offset=' + auditOffset;
            if (auditFilterAction) {
                q += '&action=' + encodeURIComponent(auditFilterAction);
            }
            return apiGet(q).then(renderAudit);
        },
    };

    function loadView(viewId, force, extra) {
        var el = panelEl(viewId);
        if (!el) {
            return;
        }
        currentView = viewId;
        if (loaded[viewId] && !force && viewId !== 'users' && viewId !== 'admins') {
            return;
        }
        var loader = loaders[viewId];
        if (!loader) {
            el.innerHTML = '<p class="portal-admin-empty">Section non disponible.</p>';
            return;
        }
        el.innerHTML = '<p class="portal-admin-loading"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Chargement…</p>';
        var arg = extra;
        loader(arg).then(function (html) {
            el.innerHTML = html;
            loaded[viewId] = true;
            bindPanel(viewId, el);
        }).catch(function () {
            el.innerHTML = '<p class="portal-admin-error" role="alert"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Erreur de chargement.</p>';
        });
    }

    function refreshOsList(panel) {
        var listEl = panel.querySelector('[data-admin-os-list]');
        if (listEl) {
            listEl.innerHTML = renderOsTableRows(applyOsFilters(lastOsData));
        }
    }

    function bindOsPanelInteractions(panel) {
        if (panel.dataset.osPanelBound === '1') {
            return;
        }
        panel.dataset.osPanelBound = '1';
        panel.addEventListener('click', function (ev) {
            var refreshBtn = ev.target.closest('[data-os-refresh]');
            if (refreshBtn && panel.contains(refreshBtn)) {
                loadView('os', true);
                return;
            }
            var editBtn = ev.target.closest('[data-os-edit]');
            if (editBtn && panel.contains(editBtn)) {
                openOsEditor(editBtn.getAttribute('data-os-edit'));
                return;
            }
            var tabBtn = ev.target.closest('[data-os-tab]');
            if (tabBtn && panel.contains(tabBtn)) {
                activeOsTab = tabBtn.getAttribute('data-os-tab') || 'active';
                panel.querySelectorAll('[data-os-tab]').forEach(function (btn) {
                    var on = btn.getAttribute('data-os-tab') === activeOsTab;
                    btn.classList.toggle('portal-admin-tab--active', on);
                    btn.setAttribute('aria-selected', on ? 'true' : 'false');
                });
                refreshOsList(panel);
            }
        });
        panel.addEventListener('input', function (ev) {
            var search = ev.target.closest('[data-os-search]');
            if (!search || !panel.contains(search)) {
                return;
            }
            activeOsSearch = search.value;
            refreshOsList(panel);
        });
        panel.addEventListener('change', function (ev) {
            var sortSel = ev.target.closest('[data-os-sort]');
            if (!sortSel || !panel.contains(sortSel)) {
                return;
            }
            activeOsSort = sortSel.value || 'order';
            refreshOsList(panel);
        });
    }

    function bindClassesPanel(panel) {
        if (panel.dataset.classesPanelBound === '1') {
            return;
        }
        panel.dataset.classesPanelBound = '1';
        panel.addEventListener('click', function (ev) {
            var row = ev.target.closest('[data-class-id]');
            if (row && panel.contains(row) && !ev.target.closest('[data-class-delete]') && !ev.target.closest('[data-class-extend]') && !ev.target.closest('[data-class-remove-member]')) {
                var id = row.getAttribute('data-class-id');
                apiGet('classrooms.php?id=' + encodeURIComponent(id)).then(function (data) {
                    var detail = openAdminModal();
                    detail.innerHTML = renderClassDetail(data.classroom, data.members);
                    bindClassDetail(detail, panel);
                });
                return;
            }
            var deleteBtn = ev.target.closest('[data-class-delete]');
            if (deleteBtn && panel.contains(deleteBtn)) {
                if (!global.confirm('Supprimer cette classe ?')) {
                    return;
                }
                apiPost('classrooms.php', {
                    action: 'delete_classroom',
                    classroomId: parseInt(deleteBtn.getAttribute('data-class-delete'), 10),
                }).then(function () { closeAdminModal(); loadView('classes', true); });
            }
        });
    }

    function bindClassDetail(detail, panel) {
        var extendBtn = detail.querySelector('[data-class-extend]');
        if (extendBtn) {
            extendBtn.addEventListener('click', function () {
                var classroomId = parseInt(extendBtn.getAttribute('data-class-extend'), 10);
                apiPost('classrooms.php', { action: 'extend_invite', classroomId: classroomId }).then(function (res) {
                    if (res.error) {
                        global.alert(res.error);
                        return;
                    }
                    apiGet('classrooms.php?id=' + classroomId).then(function (data) {
                        detail.innerHTML = renderClassDetail(data.classroom, data.members);
                        bindClassDetail(detail, panel);
                    });
                });
            });
        }
        detail.querySelectorAll('[data-class-remove-member]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var classroomId = parseInt(btn.getAttribute('data-class-remove-member'), 10);
                var userId = parseInt(btn.getAttribute('data-class-member-id'), 10);
                if (!global.confirm('Retirer cet élève de la classe ?')) {
                    return;
                }
                apiPost('classrooms.php', { action: 'remove_member', classroomId: classroomId, userId: userId }).then(function () {
                    apiGet('classrooms.php?id=' + classroomId).then(function (data) {
                        detail.innerHTML = renderClassDetail(data.classroom, data.members);
                        bindClassDetail(detail, panel);
                    });
                });
            });
        });
        var deleteBtn = detail.querySelector('[data-class-delete]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                if (!global.confirm('Supprimer cette classe ?')) {
                    return;
                }
                apiPost('classrooms.php', {
                    action: 'delete_classroom',
                    classroomId: parseInt(deleteBtn.getAttribute('data-class-delete'), 10),
                }).then(function () { closeAdminModal(); loadView('classes', true); });
            });
        }
    }

    function bindAuditPanel(el) {
        if (el.dataset.auditPanelBound !== '1') {
            el.dataset.auditPanelBound = '1';
            el.addEventListener('click', function (ev) {
                var row = ev.target.closest('[data-audit-entry-id]');
                if (!row || !el.contains(row)) {
                    return;
                }
                openAuditDetail(row.getAttribute('data-audit-entry-id'));
            });
        }
        var filter = el.querySelector('[data-audit-filter]');
        if (filter) {
            filter.addEventListener('change', function () {
                auditFilterAction = filter.value || '';
                auditOffset = 0;
                loadView('audit', true);
            });
        }
        var prev = el.querySelector('[data-audit-prev]');
        if (prev) {
            prev.addEventListener('click', function () {
                auditOffset = Math.max(0, auditOffset - auditPageSize);
                loadView('audit', true);
            });
        }
        var next = el.querySelector('[data-audit-next]');
        if (next) {
            next.addEventListener('click', function () {
                auditOffset += auditPageSize;
                loadView('audit', true);
            });
        }
    }

    function bindTicketListInteractions(panel) {
        if (panel.dataset.ticketListBound === '1') {
            return;
        }
        panel.dataset.ticketListBound = '1';
        panel.addEventListener('click', function (ev) {
            var tabBtn = ev.target.closest('[data-ticket-tab]');
            if (tabBtn && panel.contains(tabBtn)) {
                activeTicketTab = tabBtn.getAttribute('data-ticket-tab') || 'all';
                panel.querySelectorAll('[data-ticket-tab]').forEach(function (btn) {
                    var on = btn.getAttribute('data-ticket-tab') === activeTicketTab;
                    btn.classList.toggle('portal-admin-tab--active', on);
                    btn.setAttribute('aria-selected', on ? 'true' : 'false');
                });
                var list = panel.querySelector('[data-admin-ticket-list]');
                if (list) {
                    list.innerHTML = renderTicketListRows(filterTicketsByTab(lastTicketsData, activeTicketTab));
                }
                return;
            }
            var row = ev.target.closest('[data-ticket-id]');
            if (!row || !panel.contains(row)) {
                return;
            }
            var id = row.getAttribute('data-ticket-id');
            apiGet('tickets.php?id=' + encodeURIComponent(id)).then(function (data) {
                var detail = openAdminModal();
                mountTicketDetail(detail, data.ticket);
            });
        });
    }

    function refreshTicketListPanel(panel) {
        var tabsEl = panel.querySelector('.portal-admin-tabs');
        if (tabsEl) {
            tabsEl.outerHTML = renderTicketTabs();
        }
        var listEl = panel.querySelector('[data-admin-ticket-list]');
        if (listEl) {
            listEl.innerHTML = renderTicketListRows(filterTicketsByTab(lastTicketsData, activeTicketTab));
        }
    }

    function bindDashboardLinks(el) {
        el.querySelectorAll('[data-admin-quick]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                navTo(btn.getAttribute('data-admin-quick') || 'dashboard');
            });
        });
        el.querySelectorAll('[data-admin-kpi-link]').forEach(function (link) {
            link.addEventListener('click', function (ev) {
                ev.preventDefault();
                navTo(link.getAttribute('data-admin-kpi-link') || 'dashboard');
            });
        });
        el.querySelectorAll('[data-ticket-id]').forEach(function (row) {
            row.addEventListener('click', function () {
                navTo('tickets');
                setTimeout(function () {
                    var ticketEl = document.querySelector('[data-admin-panel="tickets"]');
                    if (!ticketEl) {
                        return;
                    }
                    loaded.tickets = false;
                    loadView('tickets', true);
                    setTimeout(function () {
                        var tr = ticketEl.querySelector('[data-ticket-id="' + row.getAttribute('data-ticket-id') + '"]');
                        if (tr) {
                            tr.click();
                        }
                    }, 400);
                }, 200);
            });
        });
        el.querySelectorAll('[data-activity-ticket]').forEach(function (item) {
            item.addEventListener('click', function () {
                var id = item.getAttribute('data-activity-ticket');
                navTo('tickets');
                setTimeout(function () {
                    loaded.tickets = false;
                    loadView('tickets', true);
                    setTimeout(function () {
                        var tr = document.querySelector('[data-ticket-id="' + id + '"]');
                        if (tr) {
                            tr.click();
                        }
                    }, 400);
                }, 200);
            });
        });
    }

    function openUserDetailById(id) {
        return apiGet('users.php?id=' + encodeURIComponent(id)).then(function (data) {
            if (data.error || !data.user) {
                global.alert(data.error || 'Utilisateur introuvable');
                return;
            }
            var detail = openAdminModal();
            detail.innerHTML = renderUserDetail(data.user);
            bindUserDetail(detail);
        });
    }

    function bindUserRows(panel) {
        panel.querySelectorAll('[data-user-id]').forEach(function (row) {
            if (row.dataset.userRowBound === '1') {
                return;
            }
            row.dataset.userRowBound = '1';
            row.addEventListener('click', function () {
                openUserDetailById(row.getAttribute('data-user-id'));
            });
        });
    }

    function refreshUsersListPanel(panel) {
        var listEl = panel.querySelector('[data-admin-users-list]');
        if (listEl) {
            listEl.innerHTML = userTable(filterUsersForPanel(lastUsersData, usersPanelMode, activeUserTab), false);
            bindUserRows(panel);
        }
        if (usersPanelMode === 'users') {
            var tabsEl = panel.querySelector('.portal-admin-tabs');
            if (tabsEl) {
                tabsEl.outerHTML = renderUserTabs();
            }
        }
    }

    function bindUsersPanel(el, viewId) {
        usersPanelMode = viewId === 'admins' ? 'admins' : 'users';
        if (el.dataset.usersPanelBound === '1') {
            bindUserRows(el);
            var searchExisting = el.querySelector('[data-admin-users-search]');
            if (searchExisting && pendingUserSearchQuery) {
                searchExisting.value = pendingUserSearchQuery;
                pendingUserSearchQuery = '';
            }
            return;
        }
        el.dataset.usersPanelBound = '1';
        bindUserRows(el);
        el.addEventListener('click', function (ev) {
            var tabBtn = ev.target.closest('[data-user-tab]');
            if (tabBtn && el.contains(tabBtn)) {
                activeUserTab = tabBtn.getAttribute('data-user-tab') || 'all';
                el.querySelectorAll('[data-user-tab]').forEach(function (btn) {
                    var on = btn.getAttribute('data-user-tab') === activeUserTab;
                    btn.classList.toggle('portal-admin-tab--active', on);
                    btn.setAttribute('aria-selected', on ? 'true' : 'false');
                });
                refreshUsersListPanel(el);
            }
        });
        var search = el.querySelector('[data-admin-users-search]');
        var searchTimer;
        if (search) {
            if (pendingUserSearchQuery) {
                search.value = pendingUserSearchQuery;
                pendingUserSearchQuery = '';
            }
            search.addEventListener('input', function () {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(function () {
                    var q = search.value.trim();
                    apiGet('users.php?q=' + encodeURIComponent(q)).then(function (data) {
                        lastUsersData = data.users || [];
                        refreshUsersListPanel(el);
                    });
                }, 300);
            });
        }
        var refresh = el.querySelector('[data-admin-users-refresh]');
        if (refresh) {
            refresh.addEventListener('click', function () {
                loaded[viewId] = false;
                loadView(viewId, true);
            });
        }
    }

    function bindRuntimePanel(el) {
        var btn = el.querySelector('[data-runtime-migrate]');
        if (!btn || btn.dataset.runtimeBound === '1') {
            return;
        }
        btn.dataset.runtimeBound = '1';
        btn.addEventListener('click', function () {
            var status = el.querySelector('[data-runtime-migrate-status]');
            btn.disabled = true;
            if (status) {
                status.textContent = 'Application en cours…';
            }
            apiPost('runtime.php', { action: 'run_migrations' }).then(function (res) {
                if (res.error) {
                    btn.disabled = false;
                    if (status) {
                        status.textContent = '';
                    }
                    global.alert(res.error);
                    return;
                }
                loadView('runtime', true);
            }).catch(function () {
                btn.disabled = false;
                if (status) {
                    status.textContent = 'Échec de la migration';
                }
            });
        });
    }

    function bindPanel(viewId, el) {
        if (viewId === 'dashboard') {
            bindDashboardLinks(el);
        }
        if (viewId === 'users' || viewId === 'admins') {
            bindUsersPanel(el, viewId);
        }
        if (viewId === 'tickets') {
            bindTicketListInteractions(el);
        }
        if (viewId === 'subscriptions') {
            el.querySelectorAll('[data-sub-status]').forEach(function (sel) {
                sel.addEventListener('change', function () {
                    apiPost('subscriptions.php', {
                        action: 'set_status',
                        userId: parseInt(sel.getAttribute('data-sub-status'), 10),
                        status: sel.value,
                    }).then(function () { loadView('subscriptions', true); });
                });
            });
            el.querySelectorAll('[data-sub-period]').forEach(function (input) {
                input.addEventListener('change', function () {
                    var userId = parseInt(input.getAttribute('data-sub-period'), 10);
                    var val = input.value ? input.value.replace('T', ' ') + ':00' : '';
                    apiPost('subscriptions.php', {
                        action: 'set_period_end',
                        userId: userId,
                        currentPeriodEnd: val,
                    }).then(function (res) {
                        if (res.error) {
                            global.alert(res.error);
                        }
                    });
                });
            });
            el.querySelectorAll('[data-sub-cancel]').forEach(function (input) {
                input.addEventListener('change', function () {
                    apiPost('subscriptions.php', {
                        action: 'set_cancel_at_period_end',
                        userId: parseInt(input.getAttribute('data-sub-cancel'), 10),
                        cancelAtPeriodEnd: input.checked,
                    });
                });
            });
        }
        if (viewId === 'classes') {
            bindClassesPanel(el);
        }
        if (viewId === 'os') {
            var osPanel = el.querySelector('[data-admin-os-panel]') || el;
            bindOsPanelInteractions(osPanel);
        }
        if (viewId === 'runtime') {
            bindRuntimePanel(el);
        }
        if (viewId === 'modules') {
            if (el.dataset.modulesPanelBound !== '1') {
                el.dataset.modulesPanelBound = '1';
                el.addEventListener('click', function (ev) {
                    var editBtn = ev.target.closest('[data-module-edit]');
                    if (editBtn && el.contains(editBtn)) {
                        openModuleEditor(editBtn.getAttribute('data-module-edit'));
                        return;
                    }
                    var syncBtn = ev.target.closest('[data-module-sync]');
                    if (syncBtn && el.contains(syncBtn)) {
                        syncBtn.disabled = true;
                        apiPost('catalog-modules.php', { action: 'sync_from_files' }).then(function (res) {
                            if (res.error) {
                                syncBtn.disabled = false;
                                global.alert(res.error);
                                return;
                            }
                            loadView('modules', true);
                        }).catch(function () {
                            syncBtn.disabled = false;
                            global.alert('Échec de la synchronisation.');
                        });
                    }
                });
            }
        }
        if (viewId === 'offers') {
            if (el.dataset.offersPanelBound !== '1') {
                el.dataset.offersPanelBound = '1';
                el.addEventListener('click', function (ev) {
                    var sectionBtn = ev.target.closest('[data-offers-edit-section]');
                    if (sectionBtn && el.contains(sectionBtn)) {
                        openOfferSectionEditor();
                        return;
                    }
                    var planBtn = ev.target.closest('[data-offers-edit-plan]');
                    if (planBtn && el.contains(planBtn)) {
                        openOfferPlanEditor(planBtn.getAttribute('data-offers-edit-plan'));
                    }
                });
            }
        }
        if (viewId === 'entitlements') {
            if (el.dataset.entPanelBound !== '1') {
                el.dataset.entPanelBound = '1';
                el.addEventListener('click', function (ev) {
                    var levelBtn = ev.target.closest('[data-ent-edit-level]');
                    if (levelBtn && el.contains(levelBtn)) {
                        openEntLevelEditor(levelBtn.getAttribute('data-ent-edit-level'));
                        return;
                    }
                    var accessBtn = ev.target.closest('[data-ent-edit-access]');
                    if (accessBtn && el.contains(accessBtn)) {
                        openEntAccessEditor(accessBtn.getAttribute('data-ent-edit-access'));
                    }
                });
            }
        }
        if (viewId === 'grades') {
            if (el.dataset.gradesPanelBound !== '1') {
                el.dataset.gradesPanelBound = '1';
                el.addEventListener('click', function (ev) {
                    var gradeBtn = ev.target.closest('[data-grade-edit]');
                    if (gradeBtn && el.contains(gradeBtn)) {
                        openGradeEditor(gradeBtn.getAttribute('data-grade-edit'));
                    }
                });
            }
        }
        if (viewId === 'legal') {
            if (el.dataset.legalPanelBound !== '1') {
                el.dataset.legalPanelBound = '1';
                el.addEventListener('click', function (ev) {
                    var legalBtn = ev.target.closest('[data-legal-edit]');
                    if (legalBtn && el.contains(legalBtn)) {
                        openLegalEditor(legalBtn.getAttribute('data-legal-edit'));
                    }
                });
            }
        }
        if (viewId === 'accessibility') {
            if (el.dataset.a11yPanelBound !== '1') {
                el.dataset.a11yPanelBound = '1';
                el.addEventListener('click', function (ev) {
                    var pageBtn = ev.target.closest('[data-a11y-edit-page]');
                    if (pageBtn && el.contains(pageBtn)) {
                        openA11yPageEditor();
                        return;
                    }
                    var sectionBtn = ev.target.closest('[data-a11y-edit-section]');
                    if (sectionBtn && el.contains(sectionBtn)) {
                        openA11ySectionEditor(sectionBtn.getAttribute('data-a11y-edit-section'));
                    }
                });
            }
        }
        if (viewId === 'content') {
            if (el.dataset.contentPanelBound !== '1') {
                el.dataset.contentPanelBound = '1';
                el.addEventListener('click', function (ev) {
                    var editBtn = ev.target.closest('[data-content-edit]');
                    if (editBtn && el.contains(editBtn)) {
                        openContentEditor(editBtn.getAttribute('data-content-edit'));
                    }
                });
            }
        }
        if (viewId === 'audit') {
            bindAuditPanel(el);
        }
        if (viewId === 'usage') {
            var usageNext = el.querySelector('[data-usage-next]');
            if (usageNext) {
                usageNext.addEventListener('click', function () {
                    usageOffset += 100;
                    loadView('usage', true);
                });
            }
        }
    }

    function bindUserDetail(detail) {
        function refreshUserDetail(data, revertInput) {
            if (data.error) {
                global.alert(data.error);
                if (typeof revertInput === 'function') {
                    revertInput();
                }
                return;
            }
            detail.innerHTML = renderUserDetail(data.user);
            bindUserDetail(detail);
            loaded.users = false;
        }

        var EDITABLE_ACTIONS = {
            name: { action: 'update_display_name', field: 'displayName' },
            email: { action: 'update_email', field: 'email' },
        };

        detail.querySelectorAll('[data-edit-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var wrap = btn.closest('[data-admin-editable]');
                if (!wrap) {
                    return;
                }
                var form = wrap.querySelector('[data-admin-editable-form]');
                var valueEl = wrap.querySelector('[data-edit-value]');
                if (form) {
                    form.hidden = false;
                    var input = form.querySelector('[name="value"]');
                    if (input) {
                        input.focus();
                        input.select();
                    }
                }
                if (valueEl) {
                    valueEl.hidden = true;
                }
                btn.hidden = true;
            });
        });

        detail.querySelectorAll('[data-edit-cancel]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var wrap = btn.closest('[data-admin-editable]');
                if (!wrap) {
                    return;
                }
                var form = wrap.querySelector('[data-admin-editable-form]');
                var valueEl = wrap.querySelector('[data-edit-value]');
                var toggle = wrap.querySelector('[data-edit-toggle]');
                if (form) {
                    form.hidden = true;
                }
                if (valueEl) {
                    valueEl.hidden = false;
                }
                if (toggle) {
                    toggle.hidden = false;
                }
            });
        });

        detail.querySelectorAll('[data-admin-editable-form]').forEach(function (form) {
            form.addEventListener('submit', function (ev) {
                ev.preventDefault();
                var key = form.getAttribute('data-admin-editable-form');
                var meta = EDITABLE_ACTIONS[key];
                if (!meta) {
                    return;
                }
                var userId = parseInt(form.getAttribute('data-admin-user-id'), 10);
                var input = form.querySelector('[name="value"]');
                var value = input ? input.value.trim() : '';
                if (value === '') {
                    return;
                }
                var payload = { action: meta.action, userId: userId };
                payload[meta.field] = value;
                apiPost('users.php', payload).then(function (data) {
                    refreshUserDetail(data);
                });
            });
        });

        detail.querySelectorAll('[data-admin-role-toggle]').forEach(function (input) {
            input.addEventListener('change', function () {
                var userId = parseInt(input.getAttribute('data-admin-user-id'), 10);
                var role = input.getAttribute('data-admin-role-toggle');
                var action = input.checked ? 'grant_role' : 'revoke_role';
                var previous = !input.checked;
                apiPost('users.php', { action: action, userId: userId, role: role }).then(function (data) {
                    refreshUserDetail(data, function () { input.checked = previous; });
                });
            });
        });

        detail.querySelectorAll('[data-admin-account-toggle]').forEach(function (input) {
            input.addEventListener('change', function () {
                var userId = parseInt(input.getAttribute('data-admin-user-id'), 10);
                var status = input.checked ? 'active' : 'suspended';
                var previous = !input.checked;
                apiPost('users.php', { action: 'set_account_status', userId: userId, status: status }).then(function (data) {
                    refreshUserDetail(data, function () { input.checked = previous; });
                });
            });
        });

        detail.querySelectorAll('[data-admin-blacklist-toggle]').forEach(function (input) {
            input.addEventListener('change', function () {
                var userId = parseInt(input.getAttribute('data-admin-user-id'), 10);
                var previous = !input.checked;
                if (input.checked && !global.confirm('Bannir cet e-mail et désactiver le compte ?')) {
                    input.checked = previous;
                    return;
                }
                var action = input.checked ? 'blacklist_user' : 'unblacklist_user';
                apiPost('users.php', { action: action, userId: userId }).then(function (data) {
                    refreshUserDetail(data, function () { input.checked = previous; });
                });
            });
        });

        var profLimitInput = detail.querySelector('[data-prof-max-classrooms]');
        var profLimitTimer;
        if (profLimitInput) {
            profLimitInput.addEventListener('input', function () {
                clearTimeout(profLimitTimer);
                profLimitTimer = setTimeout(function () {
                    var userId = parseInt(profLimitInput.getAttribute('data-prof-max-classrooms'), 10);
                    var maxVal = profLimitInput.value;
                    var statusEl = detail.querySelector('[data-prof-limit-status]');
                    if (statusEl) {
                        statusEl.textContent = 'Enregistrement…';
                    }
                    apiPost('users.php', {
                        action: 'set_prof_max_classrooms',
                        userId: userId,
                        max: maxVal === '' ? null : parseInt(maxVal, 10),
                    }).then(function (data) {
                        if (data.error) {
                            global.alert(data.error);
                            if (statusEl) {
                                statusEl.textContent = '';
                            }
                            return;
                        }
                        if (statusEl) {
                            statusEl.textContent = 'Enregistré';
                            setTimeout(function () { statusEl.textContent = ''; }, 2000);
                        }
                        if (data.user) {
                            profLimitInput.value = data.user.profMaxClassrooms != null ? data.user.profMaxClassrooms : '';
                            profLimitInput.placeholder = data.user.classroomMax != null ? String(data.user.classroomMax) : '';
                            var usedSpan = detail.querySelector('[data-prof-used]');
                            if (usedSpan && data.user.classroomCount != null) {
                                usedSpan.textContent = String(data.user.classroomCount);
                            }
                        }
                    });
                }, 500);
            });
        }

        detail.querySelectorAll('[data-admin-user-action]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var userId = parseInt(btn.getAttribute('data-admin-user-id'), 10);
                var userAction = btn.getAttribute('data-admin-user-action');
                if (userAction === 'delete') {
                    var titleEl = detail.querySelector('.portal-admin-panel-title');
                    var name = titleEl ? titleEl.textContent.trim() : '';
                    adminConfirm({
                        title: 'Supprimer le compte',
                        messageHtml: 'Le compte' + (name ? ' <strong>' + escapeHtml(name) + '</strong>' : '')
                            + ' et toutes ses données associées seront <strong>définitivement supprimés</strong>. Cette action est irréversible.',
                        confirmLabel: 'Supprimer définitivement',
                        cancelLabel: 'Annuler',
                        icon: 'fa-user-xmark',
                        danger: true,
                    }).then(function (ok) {
                        if (!ok) {
                            return;
                        }
                        apiPost('users.php', { action: 'delete_user', userId: userId }).then(function (data) {
                            if (data.error) {
                                global.alert(data.error);
                                return;
                            }
                            closeAdminModal();
                            loaded.users = false;
                            loadView('users', true);
                        });
                    });
                    return;
                }
                if (userAction === 'password_reset') {
                    apiPost('users.php', { action: 'request_password_reset', userId: userId }).then(function (data) {
                        if (data.error) {
                            global.alert(data.error);
                            return;
                        }
                        global.alert(data.message || 'E-mail envoyé.');
                    });
                    return;
                }
                if (userAction === 'force_verify') {
                    apiPost('users.php', { action: 'force_verify_email', userId: userId }).then(function (data) {
                        if (data.error) {
                            global.alert(data.error);
                            return;
                        }
                        if (data.user) {
                            detail.innerHTML = renderUserDetail(data.user);
                            bindUserDetail(detail);
                        }
                    });
                }
            });
        });
    }

    function bindTicketDetail(detail) {
        if (!detail) {
            return;
        }
        if (global.CapsulePortalTicketComposer
            && typeof global.CapsulePortalTicketComposer.bindComposer === 'function') {
            global.CapsulePortalTicketComposer.bindComposer(detail);
        }
        var takeBtn = detail.querySelector('[data-ticket-take-charge]');
        if (takeBtn) {
            takeBtn.addEventListener('click', function () {
                apiPost('tickets.php', {
                    action: 'take_charge',
                    ticketId: parseInt(takeBtn.getAttribute('data-ticket-take-charge'), 10),
                }).then(function (data) {
                    if (data.error) {
                        global.alert(data.error);
                        return;
                    }
                    mountTicketDetail(detail, data.ticket);
                    var ticketId = parseInt(takeBtn.getAttribute('data-ticket-take-charge'), 10);
                    lastTicketsData = lastTicketsData.map(function (t) {
                        return t.id === ticketId ? Object.assign({}, t, { status: data.ticket.status }) : t;
                    });
                    activeTicketTab = 'en_cours';
                    var ticketsPanel = document.querySelector('[data-admin-panel="tickets"]');
                    if (ticketsPanel) {
                        refreshTicketListPanel(ticketsPanel);
                    }
                    loaded.tickets = false;
                    loaded.dashboard = false;
                    refreshTicketBadge();
                });
            });
        }
        var form = detail.querySelector('[data-ticket-reply]');
        if (form) {
            form.addEventListener('submit', function (ev) {
                ev.preventDefault();
                var ticketId = parseInt(form.getAttribute('data-ticket-reply'), 10);
                apiPost('tickets.php', {
                    action: 'reply',
                    ticketId: ticketId,
                    body: form.body.value,
                }).then(function (data) {
                    mountTicketDetail(detail, data.ticket);
                    loaded.tickets = false;
                    loaded['dashboard'] = false;
                    refreshTicketBadge();
                });
            });
        }
        var closeBtn = detail.querySelector('[data-ticket-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                apiPost('tickets.php', {
                    action: 'close',
                    ticketId: parseInt(closeBtn.getAttribute('data-ticket-close'), 10),
                }).then(function (data) {
                    mountTicketDetail(detail, data.ticket);
                    loaded.tickets = false;
                    loaded['dashboard'] = false;
                    refreshTicketBadge();
                });
            });
        }
        detail.querySelectorAll('[data-ticket-goto-user]').forEach(function (gotoUserBtn) {
            gotoUserBtn.addEventListener('click', function () {
                var userId = gotoUserBtn.getAttribute('data-ticket-goto-user');
                if (!userId) {
                    return;
                }
                navTo('users');
                openUserDetailById(userId);
            });
        });
        var reopenBtn = detail.querySelector('[data-ticket-reopen]');
        if (reopenBtn) {
            reopenBtn.addEventListener('click', function () {
                apiPost('tickets.php', {
                    action: 'reopen',
                    ticketId: parseInt(reopenBtn.getAttribute('data-ticket-reopen'), 10),
                }).then(function (data) {
                    if (data.error) {
                        global.alert(data.error);
                        return;
                    }
                    mountTicketDetail(detail, data.ticket);
                    loaded.tickets = false;
                    loaded.dashboard = false;
                    refreshTicketBadge();
                });
            });
        }
        bindModuleSubmissionActions(detail);
    }

    function bindModuleSubmissionActions(detail) {
        if (!detail) {
            return;
        }
        var ticketId = parseInt(detail.getAttribute('data-admin-ticket-detail-id') || '0', 10);

        function reloadTicket() {
            if (!ticketId) {
                return;
            }
            apiGet('tickets.php?id=' + encodeURIComponent(String(ticketId))).then(function (data) {
                if (data && data.ticket) {
                    mountTicketDetail(detail, data.ticket);
                    loaded.tickets = false;
                    loaded.dashboard = false;
                    refreshTicketBadge();
                }
            });
        }

        var takeDevBtn = detail.querySelector('[data-module-take-dev]');
        if (takeDevBtn) {
            takeDevBtn.addEventListener('click', function () {
                apiPost('module-submissions.php', {
                    action: 'take_dev_review',
                    submissionId: parseInt(takeDevBtn.getAttribute('data-module-take-dev'), 10),
                }).then(function (data) {
                    if (data.error) {
                        global.alert(data.error);
                        return;
                    }
                    reloadTicket();
                });
            });
        }

        var approveBtn = detail.querySelector('[data-module-approve]');
        if (approveBtn) {
            approveBtn.addEventListener('click', function () {
                var submissionId = parseInt(approveBtn.getAttribute('data-module-approve'), 10);
                adminMessageForm({
                    title: 'Approuver l\'ajout du module',
                    intro: 'Rédigez le message qui confirme l\'approbation de l\'ajout de ce module. Il sera envoyé au créateur dans le ticket.',
                    label: 'Message d\'approbation de l\'ajout du module',
                    placeholder: 'Ex. : Votre module a été validé après tests en développement. Publication en cours.',
                    icon: 'fa-thumbs-up',
                    submitLabel: 'Envoyer l\'approbation',
                }).then(function (message) {
                    if (!message) {
                        return;
                    }
                    apiPost('module-submissions.php', {
                        action: 'approve_dev',
                        submissionId: submissionId,
                        message: message,
                    }).then(function (data) {
                        if (data && data.error) {
                            global.alert(data.error);
                            return;
                        }
                        adminSaveToast({
                            title: 'Ajout de module approuvé',
                            message: 'Le message d\'approbation a été envoyé au créateur dans le ticket.',
                        });
                        reloadTicket();
                    }).catch(function () {
                        global.alert('Échec de l\'approbation.');
                    });
                });
            });
        }

        var rejectBtn = detail.querySelector('[data-module-reject]');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', function () {
                var submissionId = parseInt(rejectBtn.getAttribute('data-module-reject'), 10);
                adminMessageForm({
                    title: 'Refuser l\'ajout du module',
                    intro: 'Indiquez la raison du refus de l\'ajout de ce module. Ce texte sera envoyé au créateur dans le ticket. Le fil reste ouvert pour qu\'il puisse corriger et répondre.',
                    label: 'Raison du refus de l\'ajout du module',
                    placeholder: 'Ex. : Le dépôt ne contient pas de module.json conforme au niveau demandé…',
                    icon: 'fa-ban',
                    danger: true,
                    submitLabel: 'Envoyer le motif de refus',
                }).then(function (message) {
                    if (!message) {
                        return;
                    }
                    apiPost('module-submissions.php', {
                        action: 'reject',
                        submissionId: submissionId,
                        message: message,
                    }).then(function (data) {
                        if (data && data.error) {
                            global.alert(data.error);
                            return;
                        }
                        adminSaveToast({
                            title: 'Ajout de module refusé',
                            message: 'La raison du refus a été envoyée au créateur dans le ticket.',
                        });
                        reloadTicket();
                    }).catch(function () {
                        global.alert('Échec du refus.');
                    });
                });
            });
        }

        var publishBtn = detail.querySelector('[data-module-publish]');
        if (publishBtn) {
            publishBtn.addEventListener('click', function () {
                var defaultMount = publishBtn.getAttribute('data-module-mount') || '';
                var mountId = global.prompt('Mount ID final (niveau/id) :', defaultMount);
                if (!mountId || !String(mountId).trim()) {
                    return;
                }
                if (!global.confirm('Publier le module sous « ' + mountId + ' » dans le store CapsuleOS ?')) {
                    return;
                }
                apiPost('module-submissions.php', {
                    action: 'publish_module',
                    submissionId: parseInt(publishBtn.getAttribute('data-module-publish'), 10),
                    mountId: String(mountId).trim(),
                    billingType: publishBtn.getAttribute('data-module-billing') || '',
                    priceDisplay: publishBtn.getAttribute('data-module-price') || '',
                }).then(function (data) {
                    if (data.error) {
                        global.alert(data.error);
                        return;
                    }
                    global.alert('Module publié : ' + (data.mountId || mountId));
                    reloadTicket();
                });
            });
        }
    }

    function searchUsers(query) {
        var q = String(query || '').trim();
        pendingUserSearchQuery = q;
        navTo('users');
        loadView('users', true, q);
    }

    function setupGlobalSearch() {
        var form = document.querySelector('[data-admin-search]');
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var input = form.querySelector('[data-admin-search-input]');
            if (input) {
                searchUsers(input.value);
            }
        });
    }

    function setupBell() {
        var bell = document.querySelector('[data-admin-bell]');
        if (!bell) {
            return;
        }
        bell.addEventListener('click', function () {
            navTo('tickets');
        });
    }

    global.CapsulePortalAdmin = {
        onView: function (viewId) {
            closeAdminModal();
            loadView(viewId, false);
        },
        reload: function (viewId) {
            loaded[viewId || currentView] = false;
            loadView(viewId || currentView, true);
        },
        openTicket: openTicketDetail,
        searchUsers: searchUsers,
    };

    setupGlobalSearch();
    setupBell();
    loadView('dashboard', false);
    startTicketPolling();
    global.addEventListener('pagehide', stopTicketPolling);
})(window);
