/**
 * Tickets support — toasts, empreintes et suivi des non-lus (client + admin).
 */
(function (global) {
    'use strict';

    var SEEN_KEY = 'capsule_portal_tickets_seen';
    var TOAST_ROOT_ID = 'portal-ticket-toast-root';
    var toastSeq = 0;

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function lastMessageRole(ticket) {
        if (!ticket) {
            return '';
        }
        if (ticket.lastMessageRole) {
            return String(ticket.lastMessageRole).toLowerCase();
        }
        var msgs = ticket.messages;
        if (!Array.isArray(msgs) || !msgs.length) {
            return '';
        }
        return String(msgs[msgs.length - 1].authorRole || '').toLowerCase();
    }

    function listFingerprint(ticket) {
        if (!ticket) {
            return '';
        }
        return [
            ticket.id,
            ticket.status || '',
            ticket.messageCount != null ? ticket.messageCount : (ticket.messages || []).length,
            lastMessageRole(ticket),
        ].join('|');
    }

    function detailFingerprint(ticket) {
        if (!ticket) {
            return '';
        }
        var msgs = Array.isArray(ticket.messages) ? ticket.messages : [];
        var last = msgs.length ? msgs[msgs.length - 1] : null;
        return [
            ticket.id,
            ticket.status || '',
            msgs.length,
            last ? (last.id || last.createdAt || '') : '',
            last ? (last.authorRole || '') : '',
        ].join('|');
    }

    function readSeenMap() {
        try {
            var parsed = JSON.parse(global.sessionStorage.getItem(SEEN_KEY) || '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    function writeSeenMap(map) {
        try {
            global.sessionStorage.setItem(SEEN_KEY, JSON.stringify(map || {}));
        } catch (_) {
            // sessionStorage indisponible
        }
    }

    function markTicketSeen(ticket) {
        if (!ticket || ticket.id == null) {
            return;
        }
        var map = readSeenMap();
        map[String(ticket.id)] = listFingerprint(ticket);
        writeSeenMap(map);
        return map;
    }

    function isUnreadAdminReply(ticket) {
        if (!ticket || ticket.id == null) {
            return false;
        }
        var role = lastMessageRole(ticket);
        if (role !== 'admin' && role !== 'support') {
            return false;
        }
        var status = String(ticket.status || '').toLowerCase();
        if (status === 'clos' || status === 'ferme' || status === 'fermé' || status === 'closed') {
            return false;
        }
        var seen = readSeenMap();
        return seen[String(ticket.id)] !== listFingerprint(ticket);
    }

    function countUnreadAdminReplies(tickets) {
        return (tickets || []).reduce(function (count, ticket) {
            return isUnreadAdminReply(ticket) ? count + 1 : count;
        }, 0);
    }

    function ensureToastRoot() {
        var root = document.getElementById(TOAST_ROOT_ID);
        if (root) {
            return root;
        }
        root = document.createElement('div');
        root.id = TOAST_ROOT_ID;
        root.className = 'portal-ticket-toast-root';
        root.setAttribute('aria-live', 'polite');
        root.setAttribute('aria-relevant', 'additions');
        document.body.appendChild(root);
        return root;
    }

    function showToast(options) {
        var opts = options || {};
        var root = ensureToastRoot();
        toastSeq += 1;
        var toastId = 'portal-ticket-toast-' + toastSeq;
        var icon = opts.icon || 'fa-bell';
        var toast = document.createElement('div');
        toast.className = 'portal-ticket-toast'
            + (opts.variant ? ' portal-ticket-toast--' + opts.variant : '');
        toast.id = toastId;
        toast.setAttribute('role', 'status');
        toast.innerHTML = '<div class="portal-ticket-toast-icon" aria-hidden="true">'
            + '<i class="fa-solid ' + escapeHtml(icon) + '"></i></div>'
            + '<div class="portal-ticket-toast-body">'
            + '<p class="portal-ticket-toast-title">' + escapeHtml(opts.title || 'Notification') + '</p>'
            + (opts.message
                ? '<p class="portal-ticket-toast-message">' + escapeHtml(opts.message) + '</p>'
                : '')
            + '</div>'
            + '<button type="button" class="portal-ticket-toast-close" data-ticket-toast-close aria-label="Fermer">'
            + '<i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
        if (opts.actionLabel) {
            var actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.className = 'portal-ticket-toast-action';
            actionBtn.textContent = opts.actionLabel;
            actionBtn.addEventListener('click', function () {
                if (typeof opts.onAction === 'function') {
                    opts.onAction();
                }
                removeToast(toast);
            });
            toast.querySelector('.portal-ticket-toast-body').appendChild(actionBtn);
        }
        toast.querySelector('[data-ticket-toast-close]').addEventListener('click', function () {
            removeToast(toast);
        });
        root.appendChild(toast);
        global.requestAnimationFrame(function () {
            toast.classList.add('portal-ticket-toast--visible');
        });
        var ttl = typeof opts.durationMs === 'number' ? opts.durationMs : 12000;
        var timer = global.setTimeout(function () {
            removeToast(toast);
        }, ttl);
        toast.setAttribute('data-ticket-toast-timer', String(timer));
        return toast;
    }

    function removeToast(toast) {
        if (!toast || !toast.parentNode) {
            return;
        }
        var timer = toast.getAttribute('data-ticket-toast-timer');
        if (timer) {
            global.clearTimeout(Number(timer));
        }
        toast.classList.remove('portal-ticket-toast--visible');
        global.setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 220);
    }

    function updateAccountSupportBadge(count) {
        var badge = document.querySelector('[data-portal-support-badge]');
        if (!badge) {
            return;
        }
        var n = Number(count) || 0;
        if (n > 0) {
            badge.textContent = n > 99 ? '99+' : String(n);
            badge.hidden = false;
            badge.setAttribute('aria-label', n + ' réponse(s) support non lue(s)');
        } else {
            badge.hidden = true;
            badge.textContent = '';
            badge.removeAttribute('aria-label');
        }
    }

    global.CapsulePortalTicketLive = {
        listFingerprint: listFingerprint,
        detailFingerprint: detailFingerprint,
        lastMessageRole: lastMessageRole,
        readSeenMap: readSeenMap,
        markTicketSeen: markTicketSeen,
        isUnreadAdminReply: isUnreadAdminReply,
        countUnreadAdminReplies: countUnreadAdminReplies,
        updateAccountSupportBadge: updateAccountSupportBadge,
        showToast: showToast,
        removeToast: removeToast,
    };
}(typeof window !== 'undefined' ? window : globalThis));
