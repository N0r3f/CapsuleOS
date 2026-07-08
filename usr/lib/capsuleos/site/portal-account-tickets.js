/**
 * Tickets support : onglets dynamiques et fil de discussion.
 */
(function (global) {
    'use strict';

    function isClosed(status) {
        var s = String(status || '').toLowerCase();
        return s === 'clos' || s === 'ferme' || s === 'fermé' || s === 'closed';
    }

    function statusLabel(status) {
        var labels = {
            ouvert: 'Ouvert',
            en_cours: 'En cours',
            clos: 'Clos',
            closed: 'Clos',
            ferme: 'Clos',
            fermé: 'Clos',
        };
        var key = String(status || '').toLowerCase();
        return labels[key] || String(status || '');
    }

    var TICKET_TYPE_LABELS = {
        support: 'Support',
        demande_createur: 'Demande du rôle Créateur',
        demande_module: 'Demande d\'ajout de module',
    };

    function ticketTypeLabel(type) {
        return TICKET_TYPE_LABELS[type] || String(type || '');
    }

    function closedTicketsSorted(tickets) {
        return (tickets || []).filter(function (t) {
            return t && isClosed(t.status);
        }).sort(function (a, b) {
            var keyA = Number(ticketKey(a));
            var keyB = Number(ticketKey(b));
            if (keyA !== keyB) {
                return keyB - keyA;
            }
            var dateA = String(a.createdAt || a.created_at || '');
            var dateB = String(b.createdAt || b.created_at || '');
            return dateB.localeCompare(dateA);
        });
    }

    function ticketKey(ticket) {
        return ticket.number != null ? ticket.number : ticket.id;
    }

    function subId(ticket) {
        return 'ticket-' + ticketKey(ticket);
    }

    function tabLabel(ticket) {
        return 'Ticket ' + ticketKey(ticket);
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatDateTimeFr(iso, formatDateFr) {
        if (!iso) {
            return '-';
        }
        var d = new Date(iso);
        if (isNaN(d.getTime())) {
            return String(iso);
        }
        var dateLabel = typeof formatDateFr === 'function'
            ? formatDateFr(iso)
            : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        var hours = String(d.getHours()).padStart(2, '0');
        var minutes = String(d.getMinutes()).padStart(2, '0');
        return dateLabel + ' à ' + hours + ':' + minutes;
    }

    function ticketMessages(ticket, displayName) {
        if (Array.isArray(ticket.messages) && ticket.messages.length) {
            return ticket.messages;
        }
        if (!ticket.body) {
            return [];
        }
        return [{
            authorRole: 'user',
            authorName: displayName || 'Utilisateur',
            body: ticket.body,
            createdAt: ticket.createdAt || ticket.created_at || '',
        }];
    }

    function authorBadgesHtml(badges) {
        if (!badges || !badges.length) {
            return '';
        }
        return '<span class="portal-account-ticket-message-badges">'
            + badges.map(function (badge) {
                var mod = badge.className || badge.class || '';
                return '<span class="portal-account-badge portal-account-badge--title portal-account-badge--message '
                    + escapeHtml(mod) + '">' + escapeHtml(badge.label || '') + '</span>';
            }).join('')
            + '</span>';
    }

    function renderMessageBody(text) {
        if (global.CapsulePortalTicketComposer
            && typeof global.CapsulePortalTicketComposer.renderMessageBody === 'function') {
            return global.CapsulePortalTicketComposer.renderMessageBody(text);
        }
        return '<div class="portal-ticket-message-content">' + escapeHtml(text || '') + '</div>';
    }

    function messageHtml(msg, formatDateFr, authorBadges) {
        var system = msg.authorRole === 'system' || msg.system;
        var role = msg.authorRole === 'admin' || system ? 'admin' : 'user';
        var roleClass = system ? 'admin portal-account-ticket-message--system' : role;
        var badges = role === 'user' ? (msg.authorBadges || authorBadges) : null;
        var authorName = msg.authorName || (role === 'admin' ? 'Support CapsuleOS' : 'Utilisateur');
        var bodyHtml = system
            ? '<div class="portal-ticket-message-content"><i class="fa-solid fa-hand" aria-hidden="true"></i> ' + escapeHtml(msg.body || '') + '</div>'
            : renderMessageBody(msg.body || '');
        return '<article class="portal-account-ticket-message portal-account-ticket-message--' + roleClass + '">'
            + '<header class="portal-account-ticket-message-head">'
            + '<span class="portal-account-ticket-message-author-line">'
            + '<span class="portal-account-ticket-message-author">' + escapeHtml(authorName) + '</span>'
            + authorBadgesHtml(badges)
            + '</span>'
            + '<time datetime="' + escapeHtml(msg.createdAt || '') + '">'
            + escapeHtml(formatDateTimeFr(msg.createdAt, formatDateFr)) + '</time>'
            + '</header>'
            + '<div class="portal-account-ticket-message-body">' + bodyHtml + '</div>'
            + '</article>';
    }

    function lastMessageRole(ticket) {
        if (ticket && ticket.lastMessageRole) {
            return String(ticket.lastMessageRole).toLowerCase();
        }
        var msgs = ticketMessages(ticket);
        if (!msgs.length) {
            return '';
        }
        return String(msgs[msgs.length - 1].authorRole || '').toLowerCase();
    }

    function canUserReply(ticket) {
        if (!ticket || isClosed(ticket.status)) {
            return false;
        }
        var role = lastMessageRole(ticket);
        return role === 'admin' || role === 'support';
    }

    function replyFormHtml(ticket) {
        var composer = global.CapsulePortalTicketComposer;
        var textareaBlock = composer && typeof composer.wrapTextareaHtml === 'function'
            ? composer.wrapTextareaHtml(
                'class="portal-input portal-textarea" name="body" rows="3" maxlength="4000" required'
                + ' placeholder="Répondez au support…"',
            )
            : '<textarea class="portal-input portal-textarea" name="body" rows="3" maxlength="4000" required'
            + ' placeholder="Répondez au support…"></textarea>';
        return '<form class="portal-form portal-account-ticket-reply-form" data-ticket-reply-form'
            + ' data-ticket-id="' + escapeHtml(String(ticket.id || '')) + '">'
            + '<p class="portal-account-ticket-reply-label">Votre réponse</p>'
            + textareaBlock
            + '<button type="submit" class="portal-submit portal-submit--compact">Envoyer la réponse</button>'
            + '</form>';
    }

    function subnavList() {
        var scope = document.querySelector('[data-account-subnav-scope="support"]');
        return scope ? scope.querySelector('[data-account-subnav-list]') : null;
    }

    function subviewsRoot() {
        var scope = document.querySelector('[data-account-subnav-scope="support"]');
        return scope ? scope.querySelector('[data-account-subviews]') : null;
    }

    function parseListItemHtml(html) {
        var template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    function openTicketsForNav(tickets) {
        return (tickets || []).filter(function (t) {
            return t && !isClosed(t.status);
        }).sort(function (a, b) {
            var keyA = Number(ticketKey(a));
            var keyB = Number(ticketKey(b));
            if (keyA !== keyB) {
                return keyA - keyB;
            }
            var dateA = String(a.createdAt || a.created_at || '');
            var dateB = String(b.createdAt || b.created_at || '');
            return dateA.localeCompare(dateB);
        });
    }

    function subnavItemHtml(ticket) {
        var sid = subId(ticket);
        return '<li class="portal-account-subnav-item" role="presentation" data-ticket-subnav-item>'
            + '<button type="button" class="portal-account-subnav-link portal-account-subnav-link--ticket" role="tab"'
            + ' id="portal-account-subnav-' + sid + '" aria-controls="account-subview-' + sid + '"'
            + ' aria-selected="false" data-account-sub-nav="' + sid + '" tabindex="-1">'
            + escapeHtml(tabLabel(ticket)) + '</button></li>';
    }

    function historiqueSubnavHtml() {
        return '<li class="portal-account-subnav-item" role="presentation" data-ticket-historique-tab>'
            + '<button type="button" class="portal-account-subnav-link portal-account-subnav-link--historique" role="tab"'
            + ' id="portal-account-subnav-historique" aria-controls="account-subview-historique"'
            + ' aria-selected="false" data-account-sub-nav="historique" tabindex="-1">Historique</button></li>';
    }

    function historiqueSubviewHtml() {
        return '<div class="portal-account-subview" id="account-subview-historique" data-account-sub-view="historique"'
            + ' data-ticket-historique-subview hidden role="tabpanel" aria-labelledby="portal-account-subnav-historique">'
            + '<section class="portal-account-panel portal-account-historique-panel" aria-labelledby="portal-ticket-historique-title">'
            + '<h2 class="portal-account-panel-title" id="portal-ticket-historique-title" data-ticket-historique-heading>Historique</h2>'
            + '<p class="portal-account-panel-lead" data-ticket-historique-lead">Tickets clos. Ouvrez un fil pour relire les échanges.</p>'
            + '<div class="portal-account-ticket-history" data-ticket-history-panel>'
            + '<div data-ticket-history-list></div>'
            + '<div data-ticket-history-detail hidden></div>'
            + '</div></section></div>';
    }

    function insertHistoriqueTab() {
        var ul = subnavList();
        var container = subviewsRoot();
        if (!ul || !container || ul.querySelector('[data-ticket-historique-tab]')) {
            return;
        }
        var openItems = ul.querySelectorAll('[data-ticket-subnav-item]');
        var anchor = openItems.length
            ? openItems[openItems.length - 1]
            : null;
        if (!anchor) {
            var supportBtn = ul.querySelector('[data-account-sub-nav="support"]');
            anchor = supportBtn ? supportBtn.closest('li') : null;
        }
        var li = parseListItemHtml(historiqueSubnavHtml());
        if (anchor) {
            anchor.insertAdjacentElement('afterend', li);
        } else {
            ul.appendChild(li);
        }
        if (!container.querySelector('[data-ticket-historique-subview]')) {
            container.appendChild(parseListItemHtml(historiqueSubviewHtml()));
        }
    }

    function insertTicketSubnav(ticket) {
        var ul = subnavList();
        if (!ul) {
            return null;
        }
        var li = parseListItemHtml(subnavItemHtml(ticket));
        var openItems = ul.querySelectorAll('[data-ticket-subnav-item]');
        if (openItems.length) {
            openItems[openItems.length - 1].insertAdjacentElement('afterend', li);
            return li;
        }
        var supportBtn = ul.querySelector('[data-account-sub-nav="support"]');
        if (supportBtn) {
            supportBtn.closest('li').insertAdjacentElement('afterend', li);
        } else {
            ul.appendChild(li);
        }
        return li;
    }

    function threadMessagesHtml(ticket, displayName, formatDateFr, authorBadges) {
        return ticketMessages(ticket, displayName).map(function (msg) {
            return messageHtml(msg, formatDateFr, authorBadges);
        }).join('');
    }

    function threadFooterHtml(ticket, options) {
        var opts = options || {};
        var closed = opts.closed || isClosed(ticket.status);
        if (closed) {
            return '<p class="portal-account-ticket-status portal-account-ticket-status--closed">'
                + '<span class="portal-account-badge portal-account-badge--ticket-closed">'
                + escapeHtml(statusLabel(ticket.status)) + '</span></p>';
        }
        var html = '';
        if (canUserReply(ticket)) {
            html += replyFormHtml(ticket);
        } else {
            html += '<p class="portal-account-ticket-sla">Le support peut prendre entre 24 et 48 h pour répondre.</p>';
        }
        if (opts.devCloseTicket) {
            html += '<button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact"'
                + ' data-dev-close-ticket="' + escapeHtml(String(ticket.id || '')) + '">'
                + 'Simuler clôture (dev)</button>';
            html += '<button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact"'
                + ' data-dev-admin-reply="' + escapeHtml(String(ticket.id || '')) + '">'
                + 'Simuler réponse support (dev)</button>';
        }
        return html;
    }

    function moduleSubmissionStatusBanner(ticket) {
        if (!ticket || ticket.type !== 'demande_module' || !ticket.moduleSubmission) {
            return '';
        }
        var sub = ticket.moduleSubmission;
        var auto = String(sub.autoStatus || '');
        var admin = String(sub.adminStatus || '');
        var label = '';
        var mod = 'portal-account-module-status';
        if (admin === 'published') {
            label = 'Votre module a été publié dans le store.';
            mod += ' portal-account-module-status--published';
        } else if (admin === 'rejected') {
            label = 'L\'ajout de votre module a été refusé. La raison est indiquée dans les messages ci-dessous — corrigez puis répondez pour poursuivre la revue.';
            mod += ' portal-account-module-status--rejected';
        } else if (admin === 'approved') {
            label = 'L\'ajout de votre module a été approuvé. Le détail est indiqué dans les messages ci-dessous — publication en cours par l\'équipe.';
            mod += ' portal-account-module-status--approved';
        } else if (admin === 'in_dev') {
            label = 'L\'équipe teste votre module en environnement de développement.';
            mod += ' portal-account-module-status--dev';
        } else if (auto === 'pending' || auto === 'running') {
            label = 'Analyse automatique du dépôt Git en cours…';
            mod += ' portal-account-module-status--pending';
        } else {
            label = 'Votre demande est en revue par l\'équipe CapsuleOS.';
            mod += ' portal-account-module-status--review';
        }
        return '<p class="' + mod + '" role="status"><i class="fa-solid fa-cube" aria-hidden="true"></i> '
            + escapeHtml(label) + '</p>';
    }

    function threadPanelHtml(ticket, displayName, formatDateFr, authorBadges, options) {
        var opts = options || {};
        var sid = subId(ticket);
        var closed = opts.closed || isClosed(ticket.status);
        var statusBanner = moduleSubmissionStatusBanner(ticket);
        var msgsHtml = threadMessagesHtml(ticket, displayName, formatDateFr, authorBadges);
        var threadClass = 'portal-account-panel portal-account-ticket-thread'
            + (closed ? ' portal-account-ticket-thread--closed' : '');
        return '<div class="portal-account-subview" id="account-subview-' + sid + '" data-account-sub-view="' + sid + '"'
            + ' data-ticket-subview' + (closed ? ' data-ticket-closed' : '') + ' hidden role="tabpanel"'
            + ' aria-labelledby="portal-account-subnav-' + sid + '">'
            + '<section class="' + threadClass + '" aria-labelledby="portal-ticket-title-' + sid + '">'
            + '<h2 class="portal-account-panel-title" id="portal-ticket-title-' + sid + '">'
            + '<span class="portal-account-ticket-subject-label">Sujet :</span> '
            + escapeHtml(ticket.subject || '') + '</h2>'
            + statusBanner
            + '<div class="portal-account-ticket-messages" role="log" aria-live="polite">' + msgsHtml + '</div>'
            + threadFooterHtml(ticket, opts)
            + '</section></div>';
    }

    function historyListItemHtml(ticket, formatDateFr) {
        return '<li class="portal-account-ticket-item portal-account-ticket-item--history">'
            + '<div class="portal-account-ticket-item-main">'
            + '<p class="portal-account-ticket-subject">' + escapeHtml(ticket.subject || '') + '</p>'
            + '<p class="portal-account-ticket-meta">'
            + '<span>' + escapeHtml(ticketTypeLabel(ticket.type || '')) + '</span> · '
            + '<span>' + escapeHtml(statusLabel(ticket.status)) + '</span> · '
            + '<span>' + escapeHtml(formatDateTimeFr(ticket.createdAt || ticket.created_at, formatDateFr)) + '</span>'
            + '</p></div>'
            + '<button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact"'
            + ' data-ticket-history-open="' + escapeHtml(subId(ticket)) + '">Voir les échanges</button>'
            + '</li>';
    }

    function historyListHtml(closedTickets, formatDateFr) {
        if (!closedTickets.length) {
            return '<p class="portal-account-empty">Aucun ticket fermé pour le moment.</p>';
        }
        var html = '<ul class="portal-account-ticket-list portal-account-ticket-list--history">';
        closedTickets.forEach(function (ticket) {
            html += historyListItemHtml(ticket, formatDateFr);
        });
        return html + '</ul>';
    }

    function historyDetailHtml(ticket, displayName, formatDateFr, authorBadges) {
        var sid = subId(ticket);
        var msgsHtml = threadMessagesHtml(ticket, displayName, formatDateFr, authorBadges);
        return '<div class="portal-account-ticket-history-detail" data-ticket-history-detail data-ticket-history-detail-for="' + sid + '">'
            + '<button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact portal-account-ticket-history-back"'
            + ' data-ticket-history-back>'
            + '<i class="fa-solid fa-arrow-left portal-account-ticket-history-back-icon" aria-hidden="true"></i>'
            + 'Retour à la liste</button>'
            + '<section class="portal-account-panel portal-account-ticket-thread portal-account-ticket-thread--closed"'
            + ' aria-labelledby="portal-ticket-history-title-' + sid + '">'
            + '<h3 class="portal-account-subtitle" id="portal-ticket-history-title-' + sid + '">'
            + '<span class="portal-account-ticket-subject-label">Sujet :</span> '
            + escapeHtml(ticket.subject || '') + '</h3>'
            + '<p class="portal-account-ticket-meta portal-account-ticket-meta--history">'
            + '<span>' + escapeHtml(ticketTypeLabel(ticket.type || '')) + '</span> · '
            + '<span>' + escapeHtml(statusLabel(ticket.status)) + '</span> · '
            + '<span>' + escapeHtml(formatDateTimeFr(ticket.createdAt || ticket.created_at, formatDateFr)) + '</span>'
            + '</p>'
            + '<div class="portal-account-ticket-messages" role="log">' + msgsHtml + '</div>'
            + threadFooterHtml(ticket, { closed: true })
            + '</section></div>';
    }

    function historiqueSection(panel) {
        return panel ? panel.closest('.portal-account-historique-panel') : null;
    }

    function hideHistoriqueDetail(panel) {
        if (!panel) {
            return;
        }
        var listRoot = panel.querySelector('[data-ticket-history-list]');
        var detailRoot = panel.querySelector('[data-ticket-history-detail]');
        var section = historiqueSection(panel);
        if (!listRoot || !detailRoot) {
            return;
        }
        listRoot.hidden = false;
        detailRoot.hidden = true;
        detailRoot.innerHTML = '';
        if (section) {
            var heading = section.querySelector('[data-ticket-historique-heading]');
            var lead = section.querySelector('[data-ticket-historique-lead]');
            if (heading) {
                heading.hidden = false;
            }
            if (lead) {
                lead.hidden = false;
            }
        }
    }

    function showHistoriqueDetail(panel, ticket, options) {
        var opts = options || {};
        var listRoot = panel.querySelector('[data-ticket-history-list]');
        var detailRoot = panel.querySelector('[data-ticket-history-detail]');
        var section = historiqueSection(panel);
        if (!listRoot || !detailRoot || !ticket) {
            return;
        }
        detailRoot.innerHTML = historyDetailHtml(
            ticket,
            opts.displayName || 'Utilisateur',
            opts.formatDateFr,
            opts.authorBadges || null,
        );
        listRoot.hidden = true;
        detailRoot.hidden = false;
        if (section) {
            var heading = section.querySelector('[data-ticket-historique-heading]');
            var lead = section.querySelector('[data-ticket-historique-lead]');
            if (heading) {
                heading.hidden = true;
            }
            if (lead) {
                lead.hidden = true;
            }
        }
        var backBtn = detailRoot.querySelector('[data-ticket-history-back]');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                hideHistoriqueDetail(panel);
            });
        }
        if (global.CapsulePortalAccountNav) {
            global.CapsulePortalAccountNav.activate('support', { sub: 'historique' });
        }
    }

    function findTicketBySubId(tickets, targetSubId) {
        return (tickets || []).find(function (ticket) {
            return ticket && subId(ticket) === targetSubId;
        }) || null;
    }

    function bindTicketHistory(panel, tickets, options) {
        if (!panel) {
            return;
        }
        var opts = options || {};
        hideHistoriqueDetail(panel);
        panel.querySelectorAll('[data-ticket-history-open]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetSubId = btn.getAttribute('data-ticket-history-open') || '';
                var ticket = findTicketBySubId(tickets, targetSubId);
                if (!ticket) {
                    return;
                }
                showHistoriqueDetail(panel, ticket, opts);
            });
        });
    }

    function renderTicketHistory(panel, tickets, options) {
        if (!panel) {
            return;
        }
        var opts = options || {};
        var listRoot = panel.querySelector('[data-ticket-history-list]');
        if (!listRoot) {
            return;
        }
        var closedTickets = closedTicketsSorted(tickets);
        listRoot.innerHTML = historyListHtml(closedTickets, opts.formatDateFr);
        bindTicketHistory(panel, tickets, opts);
    }

    function readCsrfToken() {
        var csrfEl = document.querySelector('[data-csrf]');
        if (csrfEl) {
            return csrfEl.getAttribute('data-csrf') || '';
        }
        var meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : '';
    }

    function postTicketReply(ticketId, body) {
        var payload = {
            action: 'reply',
            ticketId: ticketId,
            body: body,
            _csrf: readCsrfToken(),
        };
        return fetch(accountApiBase() + 'tickets.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': readCsrfToken(),
            },
            body: JSON.stringify(payload),
        }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    throw new Error(data.error || 'Échec envoi réponse');
                }
                return data;
            });
        });
    }

    function updateTicketInScope(ticket) {
        var scope = document.querySelector('[data-account-subnav-scope="support"]');
        if (!scope || !ticket) {
            return;
        }
        var raw = scope.getAttribute('data-portal-all-tickets') || '[]';
        var tickets;
        try {
            tickets = JSON.parse(raw);
        } catch (_) {
            tickets = [];
        }
        if (!Array.isArray(tickets)) {
            tickets = [];
        }
        var found = false;
        tickets = tickets.map(function (row) {
            if (row && String(row.id) === String(ticket.id)) {
                found = true;
                return ticket;
            }
            return row;
        });
        if (!found) {
            tickets.unshift(ticket);
        }
        scope.setAttribute('data-portal-all-tickets', JSON.stringify(tickets));
    }

    function refreshTicketThreadSubview(ticket, displayName, formatDateFr, authorBadges, options) {
        var sid = subId(ticket);
        var subview = document.querySelector('[data-account-sub-view="' + sid + '"]');
        if (!subview) {
            return;
        }
        var thread = subview.querySelector('.portal-account-ticket-thread');
        if (!thread) {
            return;
        }
        var msgsEl = thread.querySelector('.portal-account-ticket-messages');
        var statusEl = thread.querySelector('.portal-account-module-status');
        var statusHtml = moduleSubmissionStatusBanner(ticket);
        if (statusHtml) {
            if (statusEl) {
                statusEl.outerHTML = statusHtml;
            } else if (msgsEl) {
                msgsEl.insertAdjacentHTML('beforebegin', statusHtml);
            }
        } else if (statusEl) {
            statusEl.remove();
        }
        if (msgsEl) {
            msgsEl.innerHTML = threadMessagesHtml(ticket, displayName, formatDateFr, authorBadges);
        }
        var footerNodes = thread.querySelectorAll(
            '.portal-account-ticket-sla, .portal-account-ticket-status, .portal-account-ticket-reply-form, [data-dev-close-ticket], [data-dev-admin-reply]',
        );
        footerNodes.forEach(function (node) {
            node.remove();
        });
        var footerWrap = document.createElement('div');
        footerWrap.innerHTML = threadFooterHtml(ticket, options || {});
        while (footerWrap.firstChild) {
            thread.appendChild(footerWrap.firstChild);
        }
        bindTicketReplyForms(thread, {
            displayName: displayName,
            formatDateFr: formatDateFr,
            authorBadges: authorBadges,
            options: options || {},
        });
        if (global.CapsulePortalTicketComposer) {
            global.CapsulePortalTicketComposer.bindComposer(thread);
        }
    }

    function bindTicketReplyForms(root, context) {
        var scope = root || document;
        var ctx = context || {};
        scope.querySelectorAll('[data-ticket-reply-form]:not([data-ticket-reply-bound])').forEach(function (form) {
            form.setAttribute('data-ticket-reply-bound', '1');
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                var ticketIdRaw = form.getAttribute('data-ticket-id') || '';
                var ticketId = /^\d+$/.test(ticketIdRaw) ? parseInt(ticketIdRaw, 10) : ticketIdRaw;
                var bodyField = form.querySelector('[name="body"]');
                var body = bodyField ? String(bodyField.value || '').trim() : '';
                if (!ticketId || !body) {
                    return;
                }
                var submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                }
                var onSuccess = function (updatedTicket) {
                    updateTicketInScope(updatedTicket);
                    refreshTicketThreadSubview(
                        updatedTicket,
                        ctx.displayName || 'Utilisateur',
                        ctx.formatDateFr,
                        ctx.authorBadges || null,
                        ctx.options || {},
                    );
                    var msgsEl = form.closest('.portal-account-ticket-thread');
                    if (msgsEl) {
                        var log = msgsEl.querySelector('.portal-account-ticket-messages');
                        if (log && typeof log.scrollTop === 'number') {
                            log.scrollTop = log.scrollHeight;
                        }
                    }
                };
                if (document.querySelector('[data-portal-account-dev]')) {
                    if (global.CapsulePortalDevStore
                        && typeof global.CapsulePortalDevStore.replyTicket === 'function') {
                        var devTicket = global.CapsulePortalDevStore.replyTicket(ticketId, body);
                        if (!devTicket) {
                            global.alert('Impossible d\'envoyer la réponse.');
                            if (submitBtn) {
                                submitBtn.disabled = false;
                            }
                            return;
                        }
                        form.reset();
                        onSuccess(devTicket);
                        if (submitBtn) {
                            submitBtn.disabled = false;
                        }
                        return;
                    }
                }
                postTicketReply(ticketId, body).then(function (data) {
                    if (data && data.ticket) {
                        form.reset();
                        onSuccess(data.ticket);
                    }
                }).catch(function (err) {
                    global.alert(err && err.message ? err.message : 'Échec envoi réponse');
                }).finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                    }
                });
            });
        });
    }

    function bindTicketComposers(root) {
        if (global.CapsulePortalTicketComposer
            && typeof global.CapsulePortalTicketComposer.bindComposer === 'function') {
            global.CapsulePortalTicketComposer.bindComposer(root || document);
        }
    }

    function insertTicketSubview(container, ticket, displayName, formatDateFr, authorBadges, options) {
        var panel = parseListItemHtml(threadPanelHtml(ticket, displayName, formatDateFr, authorBadges, options));
        var subviews = container.querySelectorAll('[data-ticket-subview]');
        if (subviews.length) {
            subviews[subviews.length - 1].insertAdjacentElement('afterend', panel);
        } else {
            container.appendChild(panel);
        }
        bindTicketReplyForms(panel, {
            displayName: displayName,
            formatDateFr: formatDateFr,
            authorBadges: authorBadges,
            options: options || {},
        });
        bindTicketComposers(panel);
    }

    function clearDynamicTabs() {
        document.querySelectorAll('[data-ticket-subnav-item]').forEach(function (el) {
            el.remove();
        });
        document.querySelectorAll('[data-ticket-historique-tab]').forEach(function (el) {
            el.remove();
        });
        document.querySelectorAll('[data-ticket-subview]').forEach(function (el) {
            el.remove();
        });
        document.querySelectorAll('[data-ticket-historique-subview]').forEach(function (el) {
            el.remove();
        });
    }

    function syncTicketTabs(state, options) {
        var opts = options || {};
        var tickets = (state && state.tickets) || state || [];
        if (!Array.isArray(tickets) && state && state.tickets) {
            tickets = state.tickets;
        }
        if (!Array.isArray(tickets)) {
            tickets = [];
        }
        var displayName = opts.displayName || 'Utilisateur';
        var formatDateFr = opts.formatDateFr;
        var authorBadges = opts.authorBadges || null;
        var container = subviewsRoot();
        if (!container) {
            return;
        }
        clearDynamicTabs();
        openTicketsForNav(tickets).forEach(function (ticket) {
            insertTicketSubnav(ticket);
            insertTicketSubview(container, ticket, displayName, formatDateFr, authorBadges, {
                devCloseTicket: !!opts.devCloseTicket,
            });
        });
        insertHistoriqueTab();
        var historyPanel = container.querySelector('[data-ticket-history-panel]');
        if (historyPanel) {
            renderTicketHistory(historyPanel, tickets, opts);
        }
        bindTicketReplyForms(container, {
            displayName: displayName,
            formatDateFr: formatDateFr,
            authorBadges: authorBadges,
            options: {
                devCloseTicket: !!opts.devCloseTicket,
            },
        });
        bindTicketComposers(container);
    }

    function syncOpenTicketTabs(state, options) {
        syncTicketTabs(state, options);
    }

    function mountTicketTab(ticket, displayName, formatDateFr, authorBadges, options) {
        var container = subviewsRoot();
        if (!container || !ticket) {
            return;
        }
        var sid = subId(ticket);
        if (document.querySelector('[data-account-sub-view="' + sid + '"]')) {
            return;
        }
        insertTicketSubnav(ticket);
        insertTicketSubview(container, ticket, displayName, formatDateFr, authorBadges, options);
    }

    function readAuthorBadgesFromAccountRoot() {
        var root = document.querySelector('[data-portal-account], [data-portal-account-dev]');
        if (!root) {
            return [];
        }
        try {
            var parsed = JSON.parse(root.getAttribute('data-portal-author-badges') || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    }

    var LOCKED_SUBJECT_TYPES = {
        demande_createur: true,
        demande_module: true,
    };

    function syncTicketTypeSubject(form) {
        if (!form) {
            return;
        }
        var typeSelect = form.querySelector('[name="type"]');
        var subjectField = form.querySelector('[name="subject"]');
        var hintEl = form.querySelector('[data-ticket-type-hint]');
        if (!typeSelect || !subjectField) {
            return;
        }
        var typeId = typeSelect.value;
        var opt = typeSelect.options[typeSelect.selectedIndex];
        var preset = opt ? opt.getAttribute('data-default-subject') : null;
        var hint = opt ? opt.getAttribute('data-hint') : null;
        var locked = !!LOCKED_SUBJECT_TYPES[typeId];
        if (preset) {
            subjectField.value = preset;
        }
        subjectField.readOnly = locked;
        subjectField.classList.toggle('portal-input--readonly', locked);
        if (locked) {
            subjectField.setAttribute('aria-readonly', 'true');
        } else {
            subjectField.removeAttribute('aria-readonly');
        }
        if (hintEl) {
            if (hint) {
                hintEl.textContent = hint;
                hintEl.hidden = false;
            } else {
                hintEl.textContent = '';
                hintEl.hidden = true;
            }
        }
    }

    function bindTicketTypeSubject(form) {
        if (!form) {
            return;
        }
        var typeSelect = form.querySelector('[name="type"]');
        if (!typeSelect || typeSelect.getAttribute('data-ticket-type-bound') === '1') {
            return;
        }
        typeSelect.setAttribute('data-ticket-type-bound', '1');
        typeSelect.addEventListener('change', function () {
            syncTicketTypeSubject(form);
        });
        syncTicketTypeSubject(form);
    }

    function clearTicketTabs(scope) {
        if (!scope) {
            return;
        }
        scope.querySelectorAll('[data-ticket-subnav-item]').forEach(function (el) {
            el.remove();
        });
        scope.querySelectorAll('[data-ticket-historique-tab]').forEach(function (el) {
            el.remove();
        });
        scope.querySelectorAll('[data-ticket-subview]').forEach(function (el) {
            if (el.getAttribute('data-account-sub-view') !== 'support') {
                el.remove();
            }
        });
        scope.querySelectorAll('[data-ticket-historique-subview]').forEach(function (el) {
            el.remove();
        });
    }

    function findTicketById(tickets, ticketId) {
        return (tickets || []).find(function (ticket) {
            return ticket && String(ticket.id) === String(ticketId);
        }) || null;
    }

    function markTicketSeenBySub(targetSubId) {
        var scope = document.querySelector('[data-account-subnav-scope="support"]');
        if (!scope || !targetSubId) {
            return;
        }
        var tickets = readTicketsFromScope(scope);
        var ticket = (tickets || []).find(function (row) {
            return row && subId(row) === targetSubId;
        });
        if (!ticket) {
            return;
        }
        var live = ticketLiveApi();
        if (live) {
            live.markTicketSeen(ticket);
            updateSupportUnreadBadge(tickets);
        }
    }

    function ticketLiveApi() {
        return global.CapsulePortalTicketLive || null;
    }

    function openTicketIdsKey(tickets) {
        return openTicketsForNav(tickets).map(function (ticket) {
            return String(ticket.id);
        }).join(',');
    }

    function readTicketsFromScope(scope) {
        if (!scope) {
            return [];
        }
        var raw = scope.getAttribute('data-portal-all-tickets') || '[]';
        try {
            var parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    }

    function isSupportViewVisible() {
        var supportView = document.querySelector('[data-account-view="support"]');
        return !!(supportView && !supportView.hidden);
    }

    function isViewingTicketSub(ticket) {
        if (!isSupportViewVisible() || !ticket) {
            return false;
        }
        var activeSub = activeSupportSubId();
        return activeSub === subId(ticket);
    }

    function notifyAdminReply(ticket, options) {
        var opts = options || {};
        var live = ticketLiveApi();
        if (!live || !ticket) {
            return;
        }
        if (isViewingTicketSub(ticket)) {
            live.markTicketSeen(ticket);
            return;
        }
        if (opts.silent) {
            return;
        }
        live.showToast({
            title: 'Réponse du support',
            message: ticket.subject || ('Ticket ' + ticketKey(ticket)),
            icon: 'fa-headset',
            actionLabel: 'Voir',
            onAction: function () {
                if (global.CapsulePortalAccountNav) {
                    global.CapsulePortalAccountNav.activate('support', { sub: subId(ticket) });
                }
            },
        });
    }

    function updateSupportUnreadBadge(tickets) {
        var live = ticketLiveApi();
        if (!live) {
            return;
        }
        live.updateAccountSupportBadge(live.countUnreadAdminReplies(tickets));
    }

    function applyTicketsLiveUpdate(tickets, options) {
        var opts = options || {};
        var scope = document.querySelector('[data-account-subnav-scope="support"]');
        if (!scope) {
            return;
        }
        var live = ticketLiveApi();
        var oldTickets = readTicketsFromScope(scope);
        var oldMap = {};
        oldTickets.forEach(function (ticket) {
            if (ticket && ticket.id != null) {
                oldMap[String(ticket.id)] = live
                    ? live.listFingerprint(ticket)
                    : String(ticket.messageCount || 0);
            }
        });
        var displayName = opts.displayName || 'Utilisateur';
        var accountRoot = document.querySelector('[data-portal-account]');
        if (accountRoot) {
            displayName = accountRoot.getAttribute('data-portal-display-name') || displayName;
        }
        var authorBadges = opts.authorBadges || readAuthorBadgesFromAccountRoot();
        var threadOptions = { devCloseTicket: !!opts.devCloseTicket };
        var structuralChange = openTicketIdsKey(oldTickets) !== openTicketIdsKey(tickets);
        var supportVisible = isSupportViewVisible();

        tickets.forEach(function (ticket) {
            if (!ticket || ticket.id == null) {
                return;
            }
            var id = String(ticket.id);
            var nextFp = live ? live.listFingerprint(ticket) : '';
            var prevFp = oldMap[id];
            if (prevFp && prevFp !== nextFp) {
                var role = live ? live.lastMessageRole(ticket) : lastMessageRole(ticket);
                if (role === 'admin' || role === 'support') {
                    notifyAdminReply(ticket, { silent: opts.initial });
                }
                if (supportVisible && document.querySelector('[data-account-sub-view="' + subId(ticket) + '"]')) {
                    refreshTicketThreadSubview(ticket, displayName, opts.formatDateFr, authorBadges, threadOptions);
                    if (isViewingTicketSub(ticket)) {
                        var thread = document.querySelector('[data-account-sub-view="' + subId(ticket) + '"]');
                        var log = thread ? thread.querySelector('.portal-account-ticket-messages') : null;
                        if (log) {
                            log.scrollTop = log.scrollHeight;
                        }
                        if (live) {
                            live.markTicketSeen(ticket);
                        }
                    }
                }
            }
        });

        scope.setAttribute('data-portal-all-tickets', JSON.stringify(tickets));
        updateSupportUnreadBadge(tickets);

        if (!supportVisible) {
            return;
        }

        if (structuralChange) {
            scope.removeAttribute('data-portal-tickets-synced');
            syncTicketTabs(tickets, {
                displayName: displayName,
                authorBadges: authorBadges,
                devCloseTicket: !!opts.devCloseTicket,
            });
            scope.setAttribute('data-portal-tickets-synced', '1');
            var sub = opts.activeSubId || activeSupportSubId();
            if (sub && global.CapsulePortalAccountNav
                && typeof global.CapsulePortalAccountNav.activateSub === 'function') {
                global.CapsulePortalAccountNav.activateSub('support', sub, { updateHash: false });
            }
            return;
        }

        var historyPanel = scope.querySelector('[data-ticket-history-panel]');
        if (historyPanel) {
            renderTicketHistory(historyPanel, tickets, {
                displayName: displayName,
                formatDateFr: opts.formatDateFr,
                authorBadges: authorBadges,
            });
        }
    }

    var AUTO_REFRESH_MS = 6000;
    var autoRefreshTimer = null;

    function activeSupportSubId() {
        var scope = document.querySelector('[data-account-subnav-scope="support"]');
        if (!scope) {
            return null;
        }
        var activeBtn = scope.querySelector('[data-account-sub-nav][aria-selected="true"]');
        return activeBtn ? activeBtn.getAttribute('data-account-sub-nav') : null;
    }

    function accountApiBase() {
        var accountRoot = document.querySelector('[data-portal-account]');
        return accountRoot
            ? (accountRoot.getAttribute('data-portal-api-base') || 'portal/api/')
            : 'portal/api/';
    }

    function refreshFromApi(activeSubId, options) {
        var scope = document.querySelector('[data-account-subnav-scope="support"]');
        if (!scope || document.querySelector('[data-portal-account-dev]')) {
            return Promise.resolve();
        }
        var opts = options || {};
        var restoreSub = activeSubId != null ? activeSubId : null;
        return fetch(accountApiBase() + 'tickets.php', { credentials: 'include', cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('tickets unavailable');
                }
                return res.json();
            })
            .then(function (data) {
                var accountRoot = document.querySelector('[data-portal-account]');
                var displayName = accountRoot
                    ? (accountRoot.getAttribute('data-portal-display-name') || 'Utilisateur')
                    : 'Utilisateur';
                applyTicketsLiveUpdate(data.tickets || [], {
                    activeSubId: restoreSub || activeSupportSubId(),
                    displayName: displayName,
                    authorBadges: readAuthorBadgesFromAccountRoot(),
                    initial: !!opts.initial,
                });
            })
            .catch(function () {
                // conserver l’affichage serveur si l’API échoue
            });
    }

    function startAutoRefresh() {
        if (autoRefreshTimer || !document.querySelector('[data-portal-account]')) {
            return;
        }
        refreshFromApi(activeSupportSubId(), { initial: true });
        autoRefreshTimer = setInterval(function () {
            if (document.hidden) {
                return;
            }
            refreshFromApi(activeSupportSubId(), { auto: true });
        }, AUTO_REFRESH_MS);
    }

    function stopAutoRefresh() {
        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
            autoRefreshTimer = null;
        }
    }

    function initTicketHistoryPanels() {
        if (document.querySelector('[data-portal-account-dev]')) {
            return;
        }
        var scope = document.querySelector('[data-account-subnav-scope="support"]');
        if (!scope || scope.getAttribute('data-portal-tickets-synced') === '1') {
            return;
        }
        var raw = scope.getAttribute('data-portal-all-tickets') || '[]';
        var tickets;
        try {
            tickets = JSON.parse(raw);
        } catch (_) {
            tickets = [];
        }
        if (!Array.isArray(tickets)) {
            tickets = [];
        }
        var accountRoot = document.querySelector('[data-portal-account]');
        var displayName = accountRoot
            ? (accountRoot.getAttribute('data-portal-display-name') || 'Utilisateur')
            : 'Utilisateur';
        syncTicketTabs(tickets, {
            displayName: displayName,
            authorBadges: readAuthorBadgesFromAccountRoot(),
        });
        scope.setAttribute('data-portal-tickets-synced', '1');
        updateSupportUnreadBadge(tickets);
        startAutoRefresh();
    }

    global.CapsulePortalTickets = {
        isClosed: isClosed,
        statusLabel: statusLabel,
        closedTicketsSorted: closedTicketsSorted,
        subId: subId,
        tabLabel: tabLabel,
        formatDateTimeFr: formatDateTimeFr,
        readAuthorBadges: readAuthorBadgesFromAccountRoot,
        syncOpenTicketTabs: syncOpenTicketTabs,
        syncTicketTabs: syncTicketTabs,
        mountTicketTab: mountTicketTab,
        threadPanelHtml: threadPanelHtml,
        historyListHtml: historyListHtml,
        renderTicketHistory: renderTicketHistory,
        bindTicketHistory: bindTicketHistory,
        showHistoriqueDetail: showHistoriqueDetail,
        hideHistoriqueDetail: hideHistoriqueDetail,
        bindTicketTypeSubject: bindTicketTypeSubject,
        syncTicketTypeSubject: syncTicketTypeSubject,
        canUserReply: canUserReply,
        bindTicketReplyForms: bindTicketReplyForms,
        bindTicketComposers: bindTicketComposers,
        refreshTicketThreadSubview: refreshTicketThreadSubview,
        applyTicketsLiveUpdate: applyTicketsLiveUpdate,
        markTicketSeen: function (ticket) {
            var live = ticketLiveApi();
            if (live) {
                live.markTicketSeen(ticket);
                updateSupportUnreadBadge(readTicketsFromScope(
                    document.querySelector('[data-account-subnav-scope="support"]'),
                ));
            }
        },
        markTicketSeenBySub: markTicketSeenBySub,
        findTicketById: findTicketById,
        refreshFromApi: refreshFromApi,
        initPanels: initTicketHistoryPanels,
        startAutoRefresh: startAutoRefresh,
        stopAutoRefresh: stopAutoRefresh,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTicketHistoryPanels);
    } else {
        initTicketHistoryPanels();
    }

    window.addEventListener('pagehide', stopAutoRefresh);
}(typeof window !== 'undefined' ? window : globalThis));
