/**
 * Compte portail : tickets, classe, paramètres, skins, abonnement.
 */
(function () {
    'use strict';

    function bindNumericInputs(root) {
        var scope = root || document;
        scope.querySelectorAll('[data-numeric-input]').forEach(function (input) {
            if (input.getAttribute('data-numeric-bound') === '1') {
                return;
            }
            input.setAttribute('data-numeric-bound', '1');
            input.addEventListener('keydown', function (event) {
                if (['e', 'E', '+', '-', '.', ',', ' '].indexOf(event.key) !== -1) {
                    event.preventDefault();
                }
            });
            input.addEventListener('input', function () {
                var cleaned = input.value.replace(/\D/g, '');
                if (cleaned !== input.value) {
                    input.value = cleaned;
                }
                var max = Number(input.getAttribute('data-numeric-max') || 999);
                if (cleaned !== '' && Number(cleaned) > max) {
                    input.value = String(max);
                }
            });
            input.addEventListener('blur', function () {
                var min = Number(input.getAttribute('data-numeric-min') || 0);
                var max = Number(input.getAttribute('data-numeric-max') || 999);
                var n = parseInt(input.value, 10);
                if (isNaN(n)) {
                    input.value = '';
                    return;
                }
                if (n < min) {
                    input.value = String(min);
                }
                if (n > max) {
                    input.value = String(max);
                }
            });
        });
    }

    bindNumericInputs();

    var csrfEl = document.querySelector('[data-csrf]');
    var CSRF = csrfEl ? csrfEl.getAttribute('data-csrf') : '';
    if (!CSRF) {
        var meta = document.querySelector('meta[name="csrf-token"]');
        CSRF = meta ? meta.content : '';
    }

    function apiUrl(path) {
        var accountRoot = document.querySelector('[data-portal-account]');
        var base = accountRoot ? (accountRoot.getAttribute('data-portal-api-base') || 'portal/api/') : 'portal/api/';
        if (!base.endsWith('/')) {
            base += '/';
        }
        return '/' + base.replace(/^\/+/, '') + String(path || '').replace(/^\/+/, '');
    }

    function apiPost(url, body) {
        var payload = {};
        var key;
        for (key in body) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                payload[key] = body[key];
            }
        }
        payload._csrf = CSRF;
        return fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF },
            body: JSON.stringify(payload),
        }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    throw new Error(data.error || 'Erreur serveur');
                }
                return data;
            });
        });
    }

    var ACCOUNT_TAB_HASH = {
        classes: 'classes',
        overview: 'compte',
        progress: 'progression',
        purchases: 'achats',
        modules: 'modules',
        support: 'support',
        settings: 'parametres',
    };

    var CLASS_CARD_PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
        + '<path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>';

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function stayOnAccountTab(viewId) {
        if (window.CapsulePortalAccountNav) {
            window.CapsulePortalAccountNav.activate(viewId, { updateHash: true });
            return;
        }
        var hash = ACCOUNT_TAB_HASH[viewId] || viewId || 'classes';
        if (window.location.hash.replace(/^#/, '') !== hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search + '#' + hash);
        }
    }

    function apiGet(url) {
        return fetch(url, { credentials: 'include' }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    throw new Error(data.error || 'Erreur serveur');
                }
                return data;
            });
        });
    }

    var MODAL_CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
        + '<path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var REGEN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
        + '<path d="M1 4v6h6" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M23 20v-6h-6" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var MEMBER_REMOVE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">'
        + '<path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>';

    function flattenModulesCatalog(modulesCatalog) {
        var free = [];
        var paid = [];
        (modulesCatalog.levels || []).forEach(function (level) {
            (level.modules || []).forEach(function (mod) {
                if (!mod || !mod.mountId) {
                    return;
                }
                var access = mod.access || 'free';
                if (access === 'subscriber' || access === 'class') {
                    paid.push(mod);
                } else {
                    free.push(mod);
                }
            });
        });
        return { free: free, paid: paid };
    }

    function buildClassroomAccessFieldsetsHtml(osCatalog, modulesCatalog, allowedOs, allowedModules, limits) {
        var minSlots = (limits && limits.minSlots) || 2;
        var maxSlots = (limits && limits.maxSlots) || 32;
        var osList = osCatalog || [];
        var allowedOsList = allowedOs || [];
        var allowedModulesList = allowedModules || [];
        var split = flattenModulesCatalog(modulesCatalog || {});

        function osChecked(osId) {
            return (allowedOsList.length && allowedOsList.indexOf(osId) !== -1) || allowedOsList.length === 0 ? ' checked' : '';
        }
        function moduleChecked(mountId) {
            return (allowedModulesList.length && allowedModulesList.indexOf(mountId) !== -1) || allowedModulesList.length === 0 ? ' checked' : '';
        }
        function moduleChecks(modules, legend, hint) {
            if (!modules.length) {
                return '';
            }
            var html = '<fieldset class="portal-account-fieldset"><legend class="portal-label">' + legend + '</legend>'
                + '<p class="portal-account-fieldset-hint">' + hint + '</p><div class="portal-account-check-grid">';
            modules.forEach(function (mod) {
                html += '<label class="portal-account-check portal-account-check--module"><input type="checkbox" name="allowedModules" value="'
                    + escapeHtml(mod.mountId) + '"' + moduleChecked(mod.mountId) + '>'
                    + '<span class="portal-account-check-label">' + escapeHtml(mod.title || mod.mountId) + '</span>'
                    + '<span class="portal-account-module-access portal-account-module-access--' + escapeHtml(mod.access || 'free') + '">'
                    + escapeHtml(mod.accessLabel || '') + '</span></label>';
            });
            return html + '</div></fieldset>';
        }

        var html = '<fieldset class="portal-account-fieldset"><legend class="portal-label">OS autorisés</legend>'
            + '<p class="portal-account-fieldset-hint">Les élèves pourront lancer uniquement les systèmes cochés.</p>'
            + '<div class="portal-account-check-grid">';
        osList.forEach(function (os) {
            if (!os || !os.id) {
                return;
            }
            html += '<label class="portal-account-check"><input type="checkbox" name="allowedOs" value="' + escapeHtml(os.id) + '"'
                + osChecked(os.id) + '> ' + escapeHtml(os.displayName || os.id) + '</label>';
        });
        html += '</div></fieldset>';
        html += moduleChecks(split.free, 'Modules gratuits', 'Parcours accessibles sans achat individuel.');
        html += moduleChecks(split.paid, 'Modules payants', 'Parcours réservés aux abonnés, débloqués pour la classe via cette sélection.');
        return html;
    }

    function renderMembersPreviewHtml(members, classroomId) {
        if (!members || !members.length) {
            return '<p class="portal-account-empty">Aucun élève pour le moment.</p>';
        }
        var html = '<ul class="portal-account-member-list" data-classroom-id="' + escapeHtml(String(classroomId || '')) + '">';
        members.forEach(function (member) {
            var rawPublic = String(member.publicId || member.public_id || '').trim();
            var name;
            if (rawPublic) {
                name = '#' + rawPublic;
            } else {
                var userId = member.userId != null ? member.userId : member.user_id;
                name = userId ? ('#' + userId) : 'Élève';
            }
            var userId = member.userId != null ? member.userId : member.user_id;
            var removeTitle = 'Retirer ' + name;
            html += '<li class="portal-account-member-item"><span class="portal-account-member-name" title="' + escapeHtml(name) + '">'
                + escapeHtml(name) + '</span><button type="button" class="portal-account-member-remove" title="' + escapeHtml(removeTitle)
                + '" aria-label="' + escapeHtml(removeTitle) + '" data-member-remove="' + escapeHtml(String(userId || '')) + '">'
                + MEMBER_REMOVE_ICON + '</button></li>';
        });
        return html + '</ul>';
    }

    function buildClassroomDetailBodyHtml(state) {
        var classroom = state.classroom;
        var members = state.members || [];
        var limits = state.limits || { minSlots: 2, maxSlots: 32 };
        var inviteUrl = classroom.inviteUrl || buildInviteUrl(classroom.inviteToken || '');
        var inviteCopyTitle = 'Cliquer pour copier : ' + inviteUrl;
        var expiresLabel = classroom.inviteExpiresLabel || '';
        var expiresText = expiresLabel ? ('Expire le ' + expiresLabel) : '';

        return '<div class="portal-account-class-detail"><div class="portal-account-invite"><label class="portal-label">Lien d\'invitation</label>'
            + '<div class="portal-account-invite-row"><button type="button" class="portal-account-invite-link" data-invite-url="'
            + escapeHtml(inviteUrl) + '" data-invite-copy-link title="' + escapeHtml(inviteCopyTitle) + '">'
            + escapeHtml(inviteUrl) + '</button>'
            + '<button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-invite-copy>Copier</button></div>'
            + '<div class="portal-account-invite-expiry"><span class="portal-account-invite-expiry-date" data-invite-expires">'
            + escapeHtml(expiresText) + '</span>'
            + '<button type="button" class="portal-account-invite-regen" data-invite-regenerate title="Régénérer le lien" aria-label="Régénérer le lien">'
            + REGEN_ICON + '</button></div></div>'
            + '<div class="portal-account-members-section"><div class="portal-account-members-head">'
            + '<h3 class="portal-account-subtitle">Élèves inscrits</h3>'
            + '<button type="button" class="portal-account-members-refresh" data-classroom-members-refresh title="Actualiser la liste" aria-label="Actualiser la liste">'
            + REGEN_ICON + '</button></div><div data-classroom-members-root>'
            + renderMembersPreviewHtml(members, classroom.id) + '</div></div>'
            + '<details class="portal-account-details"><summary>Configurer la classe</summary>'
            + '<form class="portal-form portal-account-teacher-form" data-classroom-update>'
            + '<input type="hidden" name="classroomId" value="' + escapeHtml(String(classroom.id || '')) + '">'
            + '<label class="portal-field"><span class="portal-label">Nom</span>'
            + '<input class="portal-input" type="text" name="name" required value="' + escapeHtml(classroom.name || '') + '"></label>'
            + '<label class="portal-field"><span class="portal-label">Places</span>'
            + '<input class="portal-input" type="text" name="maxSlots" inputmode="numeric" pattern="[0-9]*" data-numeric-input data-numeric-min="'
            + escapeHtml(String(limits.minSlots || 2)) + '" data-numeric-max="' + escapeHtml(String(limits.maxSlots || 32))
            + '" required value="' + escapeHtml(String(classroom.maxSlots || '')) + '"></label>'
            + buildClassroomAccessFieldsetsHtml(state.osCatalog, state.modulesCatalog, classroom.allowedOs, classroom.allowedModules, limits)
            + '<button type="submit" class="portal-submit">Enregistrer</button></form></details>'
            + '<div class="portal-account-class-detail-danger"><button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--danger" data-classroom-delete>Supprimer la classe</button></div></div>';
    }

    function mountClassroomDetailModal(state) {
        if (!state || !state.classroom) {
            return;
        }
        removeClassroomDetailModal();
        var host = document.querySelector('[data-portal-account]');
        if (!host) {
            return;
        }
        var classroom = state.classroom;
        var modalMarkup = '<dialog class="portal-account-modal portal-account-modal--classroom" id="portal-account-classroom-detail-modal" aria-labelledby="portal-account-classroom-detail-title">'
            + '<div class="portal-account-modal-panel"><div class="portal-account-modal-head">'
            + '<h2 class="portal-account-modal-title" id="portal-account-classroom-detail-title">' + escapeHtml(classroom.name || 'Classe') + '</h2>'
            + '<button type="button" class="portal-account-modal-close" data-portal-account-modal-close aria-label="Fermer">' + MODAL_CLOSE_ICON + '</button>'
            + '</div><div class="portal-account-modal-body">' + buildClassroomDetailBodyHtml(state) + '</div></div></dialog>';
        host.insertAdjacentHTML('beforeend', modalMarkup);
        var modal = document.getElementById('portal-account-classroom-detail-modal');
        if (modal && classroom.id) {
            modal.setAttribute('data-classroom-id', String(classroom.id));
        }
        if (window.CapsulePortalAccountModals) {
            window.CapsulePortalAccountModals.bindModal(modal);
        }
        if (window.CapsulePortalClassroomLive) {
            window.CapsulePortalClassroomLive.bindModal(modal);
            window.CapsulePortalClassroomLive.resetMembersKey();
            window.CapsulePortalClassroomLive.syncMembers();
        }
        bindNumericInputs(modal);
    }

    function loadClassroomDetail(classroomId) {
        var base = apiUrl('classroom.php');
        var sep = base.indexOf('?') === -1 ? '?' : '&';
        var url = base + sep + 'classroomId=' + encodeURIComponent(String(classroomId)) + '&_=' + Date.now();
        return apiGet(url).then(function (data) {
            if (!data.classroom) {
                throw new Error('Classe introuvable');
            }
            mountClassroomDetailModal({
                classroom: data.classroom,
                members: data.members || [],
                osCatalog: data.osCatalog || [],
                modulesCatalog: data.modulesCatalog || { levels: [] },
                limits: data.limits || { minSlots: 2, maxSlots: 32 },
            });
            if (window.CapsulePortalAccountModals) {
                window.CapsulePortalAccountModals.open('classroom-detail');
            }
            return data;
        });
    }

    function refreshTeacherClassroomPanel(options) {
        options = options || {};
        var base = apiUrl('classroom.php');
        var sep = base.indexOf('?') === -1 ? '?' : '&';
        var url = base + sep + '_=' + Date.now();
        return apiGet(url).then(function (data) {
            var classrooms = data.classrooms || (data.classroom ? [data.classroom] : []);
            renderTeacherClassGrid(classrooms, data.limits || {});
            if (options.openClassroomId) {
                return loadClassroomDetail(options.openClassroomId);
            }
            stayOnAccountTab('classes');
            return data;
        });
    }

    function updateClassNavSlots(used, max) {
        var el = document.querySelector('[data-portal-nav-class-slots]');
        if (el) {
            el.textContent = String(used) + '/' + String(max);
        }
        var panel = document.querySelector('[data-teacher-panel]');
        if (panel) {
            panel.setAttribute('data-teacher-class-count', String(used));
            panel.setAttribute('data-teacher-class-max', String(max));
        }
    }

    function buildClassroomCardHtml(classroom) {
        var name = classroom.name || 'Classe';
        var count = classroom.memberCount != null ? classroom.memberCount : 0;
        var maxSlots = classroom.maxSlots || 0;
        var id = classroom.id || '';
        return '<button type="button" class="portal-account-class-card portal-account-class-card--active" data-classroom-open="'
            + escapeHtml(String(id)) + '" aria-label="Ouvrir ' + escapeHtml(name) + '">'
            + '<h3 class="portal-account-class-card-title">' + escapeHtml(name) + '</h3>'
            + '<p class="portal-account-class-card-seats"><span class="portal-account-class-card-seats-count" data-classroom-seats-count data-classroom-id="'
            + escapeHtml(String(id)) + '">' + count + '/' + maxSlots + '</span> places</p></button>';
    }

    function renderTeacherClassGrid(classrooms, limits) {
        classrooms = classrooms || [];
        limits = limits || {};
        var maxClassrooms = limits.maxClassrooms != null ? Number(limits.maxClassrooms) : 1;
        var classroomCount = limits.classroomCount != null ? Number(limits.classroomCount) : classrooms.length;
        var canCreate = limits.canCreate != null ? !!limits.canCreate : (classroomCount < maxClassrooms);
        updateClassNavSlots(classroomCount, maxClassrooms);
        var panel = document.querySelector('[data-teacher-panel]');
        if (!panel) {
            return;
        }
        var grid = panel.querySelector('.portal-account-class-grid');
        if (!grid) {
            return;
        }
        var html = '';
        classrooms.forEach(function (classroom) {
            html += buildClassroomCardHtml(classroom);
        });
        if (canCreate) {
            html += '<button type="button" class="portal-account-class-card portal-account-class-card--add" data-portal-account-modal-open="classroom-create" aria-label="Créer une classe">'
                + '<span class="portal-account-class-card-plus" aria-hidden="true">' + CLASS_CARD_PLUS_SVG + '</span>'
                + '<span class="portal-account-class-card-add-label">Nouvelle classe</span></button>';
        } else if (!classrooms.length) {
            html = '<p class="portal-admin-empty">Limite de classes atteinte (' + classroomCount + '/' + maxClassrooms + ').</p>';
        }
        grid.innerHTML = html;
    }

    function removeClassroomDetailModal() {
        if (window.CapsulePortalClassroomLive) {
            window.CapsulePortalClassroomLive.stop();
        }
        var detailModal = document.getElementById('portal-account-classroom-detail-modal');
        if (detailModal) {
            if (detailModal.open && typeof detailModal.close === 'function') {
                detailModal.close();
            }
            detailModal.remove();
        }
    }

    function applyTeacherClassroomEmpty() {
        if (window.CapsulePortalAccountModals) {
            window.CapsulePortalAccountModals.close('classroom-detail');
        }
        removeClassroomDetailModal();
        var panel = document.querySelector('[data-teacher-panel]');
        var maxClassrooms = panel ? parseInt(panel.getAttribute('data-teacher-class-max') || '1', 10) : 1;
        var classroomCount = panel ? parseInt(panel.getAttribute('data-teacher-class-count') || '0', 10) : 0;
        renderTeacherClassGrid([], {
            maxClassrooms: maxClassrooms,
            classroomCount: Math.max(0, classroomCount - 1),
            canCreate: Math.max(0, classroomCount - 1) < maxClassrooms,
        });
        stayOnAccountTab('classes');
    }

    function getModalClassroomId(modal) {
        modal = modal || document.getElementById('portal-account-classroom-detail-modal');
        if (!modal) {
            return 0;
        }
        var attr = modal.getAttribute('data-classroom-id');
        if (attr) {
            return parseInt(attr, 10) || 0;
        }
        var hidden = modal.querySelector('input[name="classroomId"]');
        return hidden ? parseInt(hidden.value, 10) || 0 : 0;
    }

    var ticketForm = document.querySelector('[data-ticket-form]');
    if (ticketForm) {
        if (window.CapsulePortalTickets) {
            window.CapsulePortalTickets.bindTicketTypeSubject(ticketForm);
        }
        ticketForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!ticketForm.checkValidity()) {
                ticketForm.reportValidity();
                return;
            }
            var fd = new FormData(ticketForm);
            var ticketType = fd.get('type');
            var ticketPayload = {
                type: ticketType,
                subject: fd.get('subject'),
                body: fd.get('body'),
            };
            if (ticketType === 'demande_module' && window.CapsulePortalCreator
                && typeof window.CapsulePortalCreator.collectSubmission === 'function') {
                var collected = window.CapsulePortalCreator.collectSubmission(ticketForm);
                if (!collected.ok) {
                    alert(collected.error || 'Soumission module invalide');
                    return;
                }
                ticketPayload.submission = collected.submission;
            }
            apiPost(apiUrl('tickets.php'), ticketPayload).then(function (data) {
                ticketForm.reset();
                if (window.CapsulePortalCreator
                    && typeof window.CapsulePortalCreator.onTicketSubmitted === 'function') {
                    window.CapsulePortalCreator.onTicketSubmitted(ticketForm);
                }
                var ticketsApi = window.CapsulePortalTickets;
                var accountRoot = document.querySelector('[data-portal-account]');
                var displayName = accountRoot
                    ? (accountRoot.getAttribute('data-portal-display-name') || 'Utilisateur')
                    : 'Utilisateur';
                if (ticketsApi && data.ticket) {
                    ticketsApi.mountTicketTab(
                        data.ticket,
                        displayName,
                        null,
                        ticketsApi.readAuthorBadges(),
                    );
                    if (window.CapsulePortalAccountNav) {
                        window.CapsulePortalAccountNav.activate('support', { sub: ticketsApi.subId(data.ticket) });
                    }
                    return;
                }
                window.location.reload();
            }).catch(function (err) {
                alert(err.message);
            });
        });
    }

    document.querySelectorAll('[data-ticket-prefill]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var form = document.querySelector('[data-ticket-form]');
            if (!form) {
                return;
            }
            if (window.CapsulePortalAccountNav) {
                window.CapsulePortalAccountNav.activate('support', { sub: 'support' });
            } else if (window.CapsulePortalAccountModals) {
                window.CapsulePortalAccountModals.open('tickets');
            }
            form.querySelector('[name="type"]').value = btn.getAttribute('data-ticket-prefill') || 'support';
            form.querySelector('[name="subject"]').value = btn.getAttribute('data-ticket-subject') || '';
            if (window.CapsulePortalTickets) {
                window.CapsulePortalTickets.syncTicketTypeSubject(form);
            }
            if (window.CapsulePortalCreator
                && typeof window.CapsulePortalCreator.syncFields === 'function') {
                window.CapsulePortalCreator.syncFields(form);
            }
            var bodyField = form.querySelector('[name="body"]');
            if (bodyField) {
                bodyField.focus();
            }
        });
    });

    function closeSettingsField(fieldKey) {
        if (!window.CapsulePortalAccountSettings) {
            return;
        }
        var field = document.querySelector('[data-settings-field="' + fieldKey + '"]');
        if (field) {
            window.CapsulePortalAccountSettings.closeField(field, true);
        }
    }

    function updateSettingsDisplay(selector, value, emptyLabel) {
        document.querySelectorAll(selector).forEach(function (el) {
            el.textContent = value || emptyLabel || '-';
        });
    }

    function syncAccountIdentity(displayName, email) {
        var resolvedEmail = email;
        if (resolvedEmail === null) {
            var emailEl = document.querySelector('[data-portal-account-email]');
            resolvedEmail = emailEl ? (emailEl.textContent || '').trim() : '';
        }
        document.querySelectorAll('[data-portal-account-name], [data-portal-auth-username], .header-user-menu-name').forEach(function (el) {
            el.textContent = displayName || resolvedEmail || 'Utilisateur';
        });
        if (email !== null) {
            document.querySelectorAll('[data-portal-account-email]').forEach(function (el) {
                el.textContent = email || '';
            });
        }
        var accountRoot = document.querySelector('[data-portal-account]');
        if (accountRoot && displayName) {
            accountRoot.setAttribute('data-portal-display-name', displayName);
        }
    }

    function settingsConfirm() {
        return window.CapsulePortalSettingsConfirm || null;
    }

    function settingsError(message) {
        var confirmApi = settingsConfirm();
        if (confirmApi) {
            confirmApi.alertError(message);
            return;
        }
        alert(message);
    }

    function classroomConfirm() {
        return window.CapsulePortalSettingsConfirm || null;
    }

    function classroomSuccess(kind, name) {
        var confirmApi = classroomConfirm();
        if (!confirmApi) {
            var fallback = {
                created: 'Classe créée.',
                updated: 'Classe mise à jour.',
                deleted: 'Classe supprimée.',
            };
            alert(fallback[kind] || 'Opération réussie.');
            return;
        }
        if (kind === 'created') {
            confirmApi.classroomCreated(name);
        } else if (kind === 'updated') {
            confirmApi.classroomUpdated(name);
        } else if (kind === 'deleted') {
            confirmApi.classroomDeleted(name);
        }
    }

    function classroomError(message) {
        var confirmApi = classroomConfirm();
        if (confirmApi) {
            confirmApi.alertError(message);
            return;
        }
        alert(message);
    }

    function confirmDelete(options) {
        if (window.CapsulePortalConfirm && window.CapsulePortalConfirm.show) {
            return window.CapsulePortalConfirm.show(options);
        }
        var opts = options || {};
        return Promise.resolve(window.confirm(opts.message || 'Confirmer la suppression ?'));
    }

    var nameForm = document.querySelector('[data-settings-name]');
    if (nameForm) {
        nameForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!nameForm.checkValidity()) {
                nameForm.reportValidity();
                return;
            }
            var fd = new FormData(nameForm);
            var displayName = String(fd.get('displayName') || '').trim();
            apiPost(apiUrl('account.php'), { action: 'update_profile', displayName: displayName })
                .then(function () {
                    updateSettingsDisplay('[data-settings-display-name]', displayName, 'Non renseigné');
                    syncAccountIdentity(displayName, null);
                    closeSettingsField('display-name');
                    var confirmApi = settingsConfirm();
                    if (confirmApi) {
                        confirmApi.nameUpdated();
                    } else {
                        alert('Nom enregistré.');
                    }
                })
                .catch(function (err) { settingsError(err.message); });
        });
    }

    var emailForm = document.querySelector('[data-settings-email]');
    if (emailForm) {
        emailForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!emailForm.checkValidity()) {
                emailForm.reportValidity();
                return;
            }
            var fd = new FormData(emailForm);
            apiPost(apiUrl('account.php'), { action: 'request_email_change', email: fd.get('email') })
                .then(function (data) {
                    closeSettingsField('email');
                    var confirmApi = settingsConfirm();
                    if (confirmApi) {
                        confirmApi.emailPending(data.message);
                    } else {
                        alert(data.message || 'Un e-mail de confirmation a été envoyé à la nouvelle adresse.');
                    }
                })
                .catch(function (err) { settingsError(err.message); });
        });
    }

    var passwordForm = document.querySelector('[data-settings-password]');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!passwordForm.checkValidity()) {
                passwordForm.reportValidity();
                return;
            }
            var fd = new FormData(passwordForm);
            var password = String(fd.get('password') || '');
            var passwordConfirm = String(fd.get('passwordConfirm') || '');
            if (password !== passwordConfirm) {
                settingsError('Les nouveaux mots de passe ne correspondent pas.');
                return;
            }
            apiPost(apiUrl('account.php'), {
                action: 'update_password',
                currentPassword: fd.get('currentPassword'),
                password: password,
                passwordConfirm: passwordConfirm,
            }).then(function () {
                closeSettingsField('password');
                var confirmApi = settingsConfirm();
                if (confirmApi) {
                    confirmApi.passwordUpdated();
                } else {
                    alert('Mot de passe mis à jour.');
                }
            }).catch(function (err) { settingsError(err.message); });
        });
    }

    function syncPaymentMethodDisplay(value) {
        var label = value || 'Aucun moyen enregistré';
        document.querySelectorAll('[data-settings-display-payment]').forEach(function (el) {
            el.textContent = label;
        });
        document.querySelectorAll('.portal-account-plan-details-payment').forEach(function (el) {
            el.textContent = value || '-';
        });
        document.querySelectorAll('[data-settings-field="payment-method"] [data-settings-edit]').forEach(function (btn) {
            btn.textContent = value ? 'Modifier' : 'Ajouter';
        });
        document.querySelectorAll('[data-settings-payment-remove]').forEach(function (btn) {
            btn.hidden = !value;
        });
    }

    var paymentForm = document.querySelector('[data-settings-payment]');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!paymentForm.checkValidity()) {
                paymentForm.reportValidity();
                return;
            }
            var fd = new FormData(paymentForm);
            var paymentMethod = String(fd.get('paymentMethod') || '').trim();
            apiPost(apiUrl('account.php'), { action: 'update_billing', paymentMethod: paymentMethod })
                .then(function () {
                    syncPaymentMethodDisplay(paymentMethod);
                    closeSettingsField(document.querySelector('[data-settings-field="payment-method"]'), true);
                })
                .catch(function (err) { settingsError(err.message); });
        });
    }

    document.querySelectorAll('[data-settings-payment-remove]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            confirmDelete({
                title: 'Supprimer le moyen de paiement',
                message: 'Le moyen de paiement enregistré sera supprimé de votre compte.',
                confirmLabel: 'Supprimer',
            }).then(function (confirmed) {
                if (!confirmed) {
                    return;
                }
                apiPost(apiUrl('account.php'), { action: 'remove_payment_method' })
                    .then(function () {
                        syncPaymentMethodDisplay('');
                        var input = document.querySelector('[data-settings-payment] [name="paymentMethod"]');
                        if (input) {
                            input.value = '';
                        }
                        closeSettingsField(document.querySelector('[data-settings-field="payment-method"]'), true);
                    })
                    .catch(function (err) { settingsError(err.message); });
            });
        });
    });

    var deleteBtn = document.querySelector('[data-account-delete]');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
            confirmDelete({
                title: 'Supprimer le compte',
                message: 'Votre compte et toutes vos données seront définitivement supprimés. Cette action est irréversible.',
                confirmLabel: 'Supprimer mon compte',
            }).then(function (confirmed) {
                if (!confirmed) {
                    return;
                }
                apiPost(apiUrl('account.php'), { action: 'delete_account' })
                    .then(function () { window.location.href = '/portal/index.php'; })
                    .catch(function (err) { alert(err.message); });
            });
        });
    }

    function subscriptionUiExpired() {
        var root = document.querySelector('.portal-account-subscription-settings');
        return root && root.getAttribute('data-subscription-ui') === 'expired';
    }

    function showSubscriptionManageView(view) {
        document.querySelectorAll('[data-subscription-manage-view]').forEach(function (el) {
            el.hidden = el.getAttribute('data-subscription-manage-view') !== view;
        });
    }

    function syncRenewalActionButtons(cancelled) {
        if (typeof cancelled !== 'boolean') {
            var statusEl = document.querySelector('[data-subscription-manage-status]');
            if (!statusEl) {
                return;
            }
            cancelled = (statusEl.textContent || '').trim() === 'Annulé';
        }
        document.querySelectorAll('[data-subscription-show-cancel-confirm]').forEach(function (btn) {
            btn.hidden = cancelled;
        });
        document.querySelectorAll('[data-subscription-reactivate]').forEach(function (btn) {
            btn.hidden = !cancelled;
        });
    }

    function setRenewalStatusClass(el, cancelled) {
        if (!el) {
            return;
        }
        el.textContent = cancelled ? 'Annulé' : 'Actif';
        el.className = 'portal-account-sub-renewal-status '
            + (cancelled ? 'portal-account-sub-renewal-status--cancelled' : 'portal-account-sub-renewal-status--active');
    }

    function applyRenewalState(cancelled) {
        document.querySelectorAll('[data-subscription-manage-status], [data-subscription-renewal-status], [data-subscription-overview-status]').forEach(function (el) {
            setRenewalStatusClass(el, cancelled);
        });
        syncRenewalActionButtons(cancelled);
        if (window.CapsulePortalAccountNav) {
            var hash = window.location.hash.replace(/^#/, '');
            if (hash.indexOf('parametres/') === 0) {
                window.CapsulePortalAccountNav.activate('settings', { sub: 'subscription', updateHash: false });
            }
        }
    }

    if (!subscriptionUiExpired()) {
        syncRenewalActionButtons();

        document.querySelectorAll('[data-subscription-show-cancel-confirm]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showSubscriptionManageView('confirm-cancel');
            });
        });

        document.querySelectorAll('[data-subscription-manage-back]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showSubscriptionManageView('overview');
            });
        });

        document.querySelectorAll('[data-subscription-cancel-confirm]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                apiPost(apiUrl('account.php'), {
                    action: 'cancel_renewal',
                    cancel: true,
                }).then(function () {
                    showSubscriptionManageView('overview');
                    applyRenewalState(true);
                    if (window.CapsulePortalSubscriptionLive && window.CapsulePortalSubscriptionLive.pollAccount) {
                        window.CapsulePortalSubscriptionLive.pollAccount();
                    }
                }).catch(function (err) {
                    alert(err.message);
                });
            });
        });

        document.querySelectorAll('[data-subscription-reactivate]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                apiPost(apiUrl('account.php'), {
                    action: 'cancel_renewal',
                    cancel: false,
                }).then(function () {
                    showSubscriptionManageView('overview');
                    applyRenewalState(false);
                    if (window.CapsulePortalSubscriptionLive && window.CapsulePortalSubscriptionLive.pollAccount) {
                        window.CapsulePortalSubscriptionLive.pollAccount();
                    }
                }).catch(function (err) {
                    alert(err.message);
                });
            });
        });
    }

    document.querySelectorAll('[data-skin-delete]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var registryId = btn.getAttribute('data-skin-delete') || '';
            var label = btn.getAttribute('data-skin-label') || 'ce skin';
            if (!registryId) {
                return;
            }
            confirmDelete({
                title: 'Supprimer la sauvegarde',
                message: 'La sauvegarde « ' + label + ' » sera supprimée.',
                confirmLabel: 'Supprimer',
            }).then(function (confirmed) {
                if (!confirmed) {
                    return;
                }
                apiPost(apiUrl('skins.php'), { action: 'delete', registryId: registryId })
                    .then(function () {
                        var row = btn.closest('[data-skin-row]');
                        if (row) {
                            row.remove();
                        }
                    })
                    .catch(function (err) { alert(err.message); });
            });
        });
    });

    var createForm = document.querySelector('[data-classroom-create]');
    if (createForm) {
        createForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var fd = new FormData(createForm);
            var allowedOs = [];
            var allowedModules = [];
            var maxSlots = parseInt(String(fd.get('maxSlots') || ''), 10);
            createForm.querySelectorAll('[name="allowedOs"]:checked').forEach(function (el) {
                allowedOs.push(el.value);
            });
            createForm.querySelectorAll('[name="allowedModules"]:checked').forEach(function (el) {
                allowedModules.push(el.value);
            });
            if (!maxSlots || maxSlots < 2 || maxSlots > 32) {
                classroomError('Nombre de places : entre 2 et 32.');
                return;
            }
            var className = String(fd.get('name') || '').trim();
            apiPost(apiUrl('classroom.php'), {
                action: 'create',
                name: className,
                maxSlots: maxSlots,
                allowedOs: allowedOs,
                allowedModules: allowedModules,
            }).then(function (data) {
                if (window.CapsulePortalAccountModals) {
                    window.CapsulePortalAccountModals.close('classroom-create');
                }
                createForm.reset();
                return refreshTeacherClassroomPanel({ openClassroomId: data.id }).then(function () {
                    classroomSuccess('created', className);
                });
            }).catch(function (err) { classroomError(err.message); });
        });
    }

    document.addEventListener('submit', function (event) {
        var updateForm = event.target.closest('[data-classroom-update]');
        if (!updateForm) {
            return;
        }
        event.preventDefault();
        var fd = new FormData(updateForm);
        var allowedOs = [];
        var allowedModules = [];
        var className = String(fd.get('name') || '').trim();
        updateForm.querySelectorAll('[name="allowedOs"]:checked').forEach(function (el) {
            allowedOs.push(el.value);
        });
        updateForm.querySelectorAll('[name="allowedModules"]:checked').forEach(function (el) {
            allowedModules.push(el.value);
        });
        apiPost(apiUrl('classroom.php'), {
            action: 'update',
            classroomId: Number(fd.get('classroomId')),
            name: className,
            maxSlots: Number(fd.get('maxSlots')),
            allowedOs: allowedOs,
            allowedModules: allowedModules,
        }).then(function () {
            return refreshTeacherClassroomPanel();
        }).then(function () {
            classroomSuccess('updated', className);
        }).catch(function (err) { classroomError(err.message); });
    });

    function buildInviteUrl(token) {
        var link = document.querySelector('[data-invite-url]');
        var base = '';
        if (link) {
            base = (link.getAttribute('data-invite-url') || '').split('?')[0];
        }
        if (!base || base.indexOf('://') === -1) {
            base = window.location.origin + '/portal/join-class.php';
        }
        return base + '?token=' + encodeURIComponent(token);
    }

    function copyInviteUrl(linkEl, event) {
        if (window.CapsulePortalClassroomLive && window.CapsulePortalClassroomLive.copyInviteFromLink) {
            window.CapsulePortalClassroomLive.copyInviteFromLink(linkEl, event);
            return;
        }
        if (!linkEl) {
            return;
        }
        var url = linkEl.getAttribute('data-invite-url') || linkEl.textContent.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url);
        }
    }

    function formatInviteExpiryFr(date) {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function updateInviteExpiryLabel(scope) {
        var root = scope || document;
        var expiresEl = root.querySelector ? root.querySelector('[data-invite-expires]') : null;
        if (!expiresEl) {
            expiresEl = document.querySelector('[data-invite-expires]');
        }
        if (!expiresEl) {
            return;
        }
        var d = new Date();
        d.setDate(d.getDate() + 7);
        expiresEl.textContent = 'Expire le ' + formatInviteExpiryFr(d);
    }

    document.addEventListener('click', function (event) {
        var openBtn = event.target.closest('[data-classroom-open]');
        if (openBtn) {
            event.preventDefault();
            var classroomId = openBtn.getAttribute('data-classroom-open') || '';
            if (!classroomId) {
                return;
            }
            loadClassroomDetail(classroomId).catch(function (err) {
                alert(err.message);
            });
            return;
        }
        var copyBtn = event.target.closest('[data-invite-copy]');
        if (copyBtn) {
            var modal = copyBtn.closest('#portal-account-classroom-detail-modal');
            var link = modal ? modal.querySelector('[data-invite-url]') : document.querySelector('[data-invite-url]');
            copyInviteUrl(link, event);
            return;
        }
        var regenBtn = event.target.closest('[data-invite-regenerate]');
        if (regenBtn) {
            if (window.CapsulePortalClassroomLive) {
                window.CapsulePortalClassroomLive.spinIcon(regenBtn);
            }
            apiPost(apiUrl('classroom.php'), {
                action: 'regenerate_invite',
                classroomId: getModalClassroomId(regenBtn.closest('#portal-account-classroom-detail-modal')),
            })
                .then(function (data) {
                    var modal = regenBtn.closest('#portal-account-classroom-detail-modal');
                    var link = modal ? modal.querySelector('[data-invite-url]') : document.querySelector('[data-invite-url]');
                    if (link && data.inviteToken) {
                        var newUrl = buildInviteUrl(data.inviteToken);
                        link.setAttribute('data-invite-url', newUrl);
                        link.textContent = newUrl;
                        link.title = 'Cliquer pour copier : ' + newUrl;
                    }
                    updateInviteExpiryLabel(regenBtn.closest('#portal-account-classroom-detail-modal'));
                    alert('Lien régénéré (valide 7 jours).');
                })
                .catch(function (err) { alert(err.message); });
            return;
        }
        var deleteBtn = event.target.closest('[data-classroom-delete]');
        if (!deleteBtn) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        var detailModal = deleteBtn.closest('#portal-account-classroom-detail-modal');
        var className = '';
        var titleEl = detailModal ? detailModal.querySelector('#portal-account-classroom-detail-title') : null;
        if (titleEl) {
            className = (titleEl.textContent || '').trim();
        }
        confirmDelete({
            title: 'Supprimer la classe',
            message: className
                ? 'La classe « ' + className + ' » sera supprimée. Les élèves conservent leur progression.'
                : 'Cette classe sera supprimée. Les élèves conservent leur progression.',
            confirmLabel: 'Supprimer la classe',
        }).then(function (confirmed) {
            if (!confirmed) {
                return;
            }
            apiPost(apiUrl('classroom.php'), {
                action: 'delete',
                classroomId: getModalClassroomId(detailModal),
            })
                .then(function () {
                    removeClassroomDetailModal();
                    return refreshTeacherClassroomPanel();
                })
                .then(function () {
                    classroomSuccess('deleted', className);
                })
                .catch(function (err) { classroomError(err.message); });
        });
        return;
    });

    if (document.querySelector('[data-teacher-panel]')) {
        global.CapsulePortalAccount = global.CapsulePortalAccount || {};
        global.CapsulePortalAccount.refreshTeacherClassroom = refreshTeacherClassroomPanel;
        global.CapsulePortalAccount.openClassroomDetail = loadClassroomDetail;
    }
}());
