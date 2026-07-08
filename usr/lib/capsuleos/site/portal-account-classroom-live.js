/**
 * Liste élèves classe : actualisation manuelle et polling (5 s) modale ouverte.
 */
(function (global) {
    'use strict';

    var POLL_MS = 5000;
    var MODAL_ID = 'portal-account-classroom-detail-modal';
    var timer = null;
    var lastMembersKey = '';

    var REFRESH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
        + '<path d="M1 4v6h6" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M23 20v-6h-6" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var REMOVE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">'
        + '<path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>';

    function escapeHtml(value) {
        var el = document.createElement('span');
        el.textContent = value;
        return el.innerHTML;
    }

    function isDevMode() {
        return !!global.CapsulePortalDevStore && !!document.querySelector('[data-dev-classroom-detail-root]');
    }

    function getModal() {
        return document.getElementById(MODAL_ID);
    }

    function getMembersRoot() {
        var modal = getModal();
        return modal ? modal.querySelector('[data-classroom-members-root]') : null;
    }

    function getCsrf() {
        var el = document.querySelector('[data-csrf]');
        if (el) {
            return el.getAttribute('data-csrf') || '';
        }
        var meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : '';
    }

    function apiPost(url, body) {
        var payload = {};
        var key;
        for (key in body) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                payload[key] = body[key];
            }
        }
        payload._csrf = getCsrf();
        return fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
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

    function membersKey(members) {
        return (members || []).map(function (m) {
            return String(m.userId || m.user_id || m.id || '') + ':' + String(m.publicId || m.public_id || '');
        }).join('|');
    }

    function memberName(member) {
        var publicId = String(member.publicId || member.public_id || '').trim();
        if (publicId !== '') {
            return '#' + publicId;
        }
        var userId = member.userId != null ? member.userId : member.user_id;
        if (userId) {
            return '#' + userId;
        }
        return 'Élève';
    }

    function memberId(member) {
        if (member.userId != null) {
            return String(member.userId);
        }
        if (member.user_id != null) {
            return String(member.user_id);
        }
        return String(member.id || '');
    }

    function renderMembersHtml(members, classroomId) {
        if (!members || members.length === 0) {
            if (isDevMode()) {
                return '<p class="portal-account-empty">Aucun élève. Partagez le lien d\'invitation.</p>'
                    + '<form class="portal-form" data-dev-add-member style="margin-top:0.5rem">'
                    + '<label class="portal-field"><span class="portal-label">Simuler un élève (dev)</span>'
                    + '<input class="portal-input" type="text" name="name" placeholder="Nom élève" required></label>'
                    + '<button type="submit" class="portal-submit portal-submit--compact">Ajouter élève test</button></form>';
            }
            return '<p class="portal-account-empty">Aucun élève pour le moment.</p>';
        }

        var html = '<ul class="portal-account-member-list" data-classroom-id="' + escapeHtml(String(classroomId || '')) + '">';
        members.forEach(function (member) {
            var name = memberName(member);
            var id = memberId(member);
            var removeTitle = 'Retirer ' + name;
            html += '<li class="portal-account-member-item">'
                + '<span class="portal-account-member-name" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</span>'
                + '<button type="button" class="portal-account-member-remove" title="' + escapeHtml(removeTitle)
                + '" aria-label="' + escapeHtml(removeTitle) + '" data-member-remove="' + escapeHtml(id) + '">'
                + REMOVE_ICON + '</button></li>';
        });
        html += '</ul>';
        return html;
    }

    function getActiveClassroomId() {
        var modal = getModal();
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

    function updateSeatsCount(count, maxSlots, classroomId) {
        var selector = '[data-classroom-seats-count]';
        if (classroomId) {
            selector = '[data-classroom-seats-count][data-classroom-id="' + String(classroomId) + '"]';
        }
        document.querySelectorAll(selector).forEach(function (el) {
            el.textContent = String(count) + '/' + String(maxSlots);
        });
    }

    function bindDevAddMemberForm(root) {
        if (!isDevMode() || !root) {
            return;
        }
        var form = root.querySelector('[data-dev-add-member]');
        if (!form || form.getAttribute('data-members-bound') === '1') {
            return;
        }
        form.setAttribute('data-members-bound', '1');
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var fd = new FormData(form);
            var name = String(fd.get('name') || 'Élève test').trim();
            global.CapsulePortalDevStore.addMember(name, name.toLowerCase().replace(/\s+/g, '.') + '@dev.local');
            refresh(true);
        });
    }

    function applyMembersUpdate(members, maxSlots, classroomId) {
        var root = getMembersRoot();
        if (!root) {
            return;
        }
        var key = membersKey(members) + '/' + String(maxSlots);
        if (key === lastMembersKey) {
            return;
        }
        lastMembersKey = key;
        root.innerHTML = renderMembersHtml(members, classroomId);
        updateSeatsCount((members || []).length, maxSlots, classroomId || getActiveClassroomId());
        bindDevAddMemberForm(root);
    }

    function fetchAndApply() {
        if (isDevMode()) {
            var state = global.CapsulePortalDevStore.load();
            if (!state.classroom) {
                return Promise.resolve();
            }
            applyMembersUpdate(state.classroom.members || [], state.classroom.maxSlots, state.classroom.id || 0);
            return Promise.resolve();
        }

        return fetch('/portal/api/classroom.php' + (function () {
            var classroomId = getActiveClassroomId();
            return classroomId > 0 ? ('?classroomId=' + encodeURIComponent(String(classroomId))) : '';
        }()), { credentials: 'include' })
            .then(function (res) {
                return res.json().catch(function () { return {}; });
            })
            .then(function (data) {
                if (!data || !data.classroom) {
                    return;
                }
                applyMembersUpdate(data.members || [], data.classroom.maxSlots, data.classroom.id);
            })
            .catch(function () { /* silencieux en polling */ });
    }

    function spinIconButton(btn) {
        if (!btn) {
            return;
        }
        btn.classList.add('is-spinning');
        window.setTimeout(function () {
            btn.classList.remove('is-spinning');
        }, 600);
    }

    function showCopyCursorPopup(event, label) {
        if (!event) {
            return;
        }
        var modal = event.target.closest('dialog') || getModal();
        var host = modal || document.body;
        var popup = document.createElement('span');
        popup.className = 'portal-account-copy-cursor-popup';
        popup.textContent = label || 'copier !';
        popup.setAttribute('role', 'status');
        popup.style.left = event.clientX + 'px';
        popup.style.top = event.clientY + 'px';
        host.appendChild(popup);
        window.requestAnimationFrame(function () {
            popup.classList.add('portal-account-copy-cursor-popup--visible');
        });
        window.setTimeout(function () {
            popup.classList.remove('portal-account-copy-cursor-popup--visible');
            window.setTimeout(function () {
                popup.remove();
            }, 180);
        }, 1100);
    }

    function fallbackCopyText(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (_) { /* ignore */ }
        textarea.remove();
    }

    function inviteUrlFromLink(linkEl) {
        if (!linkEl) {
            return '';
        }
        return linkEl.getAttribute('data-dev-invite-url')
            || linkEl.getAttribute('data-invite-url')
            || (linkEl.textContent || '').trim();
    }

    function copyInviteFromLink(linkEl, event) {
        if (!linkEl) {
            return;
        }
        var url = inviteUrlFromLink(linkEl);
        if (!url) {
            return;
        }
        showCopyCursorPopup(event);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).catch(function () {
                fallbackCopyText(url);
            });
            return;
        }
        fallbackCopyText(url);
    }

    function syncMembers() {
        lastMembersKey = '';
        if (!getMembersRoot()) {
            return Promise.resolve();
        }
        return fetchAndApply();
    }

    function refresh(manual) {
        var modal = getModal();
        if (!manual && (!modal || !modal.open)) {
            return Promise.resolve();
        }
        if (!getMembersRoot()) {
            return Promise.resolve();
        }
        if (manual) {
            spinIconButton(modal ? modal.querySelector('[data-classroom-members-refresh]') : null);
        }
        lastMembersKey = '';
        return fetchAndApply();
    }

    function start() {
        stop();
        lastMembersKey = '';
        refresh(false);
        timer = window.setInterval(function () {
            refresh(false);
        }, POLL_MS);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        lastMembersKey = '';
    }

    function confirmMemberRemove(name) {
        var message = name
            ? 'Retirer ' + name + ' de la classe ? L\'élève conserve sa progression.'
            : 'Retirer cet élève de la classe ? L\'élève conserve sa progression.';
        if (global.CapsulePortalConfirm && global.CapsulePortalConfirm.show) {
            return global.CapsulePortalConfirm.show({
                tone: 'warning',
                title: 'Retirer l\'élève',
                message: message,
                confirmLabel: 'Retirer',
            });
        }
        return Promise.resolve(global.confirm(message));
    }

    function handleMemberRemove(btn) {
        var memberItem = btn.closest('.portal-account-member-item');
        var nameEl = memberItem ? memberItem.querySelector('.portal-account-member-name') : null;
        var name = nameEl ? (nameEl.textContent || '').trim() : '';

        if (isDevMode()) {
            confirmMemberRemove(name).then(function (confirmed) {
                if (!confirmed) {
                    return;
                }
                global.CapsulePortalDevStore.removeMember(btn.getAttribute('data-member-remove') || '');
                refresh(true);
            });
            return;
        }

        var userId = Number(btn.getAttribute('data-member-remove'));
        if (!userId) {
            return;
        }
        confirmMemberRemove(name).then(function (confirmed) {
            if (!confirmed) {
                return;
            }
            apiPost('/portal/api/classroom.php', {
                action: 'remove_member',
                classroomId: getActiveClassroomId(),
                userId: userId,
            })
                .then(function () {
                    lastMembersKey = '';
                    return refresh(true);
                })
                .catch(function (err) {
                    window.alert(err.message);
                });
        });
    }

    function bindModal(modal) {
        if (!modal || modal.getAttribute('data-classroom-live-bound') === '1') {
            return;
        }
        modal.setAttribute('data-classroom-live-bound', '1');
        modal.addEventListener('click', function (event) {
            var inviteLink = event.target.closest('[data-invite-copy-link], [data-dev-invite-copy-link]');
            if (inviteLink) {
                event.preventDefault();
                copyInviteFromLink(inviteLink, event);
                return;
            }
            if (event.target.closest('[data-classroom-members-refresh]')) {
                refresh(true);
                return;
            }
            var removeBtn = event.target.closest('[data-member-remove]');
            if (removeBtn) {
                handleMemberRemove(removeBtn);
            }
        });
    }

    var modal = getModal();
    if (modal) {
        bindModal(modal);
    }

    global.CapsulePortalClassroomLive = {
        start: start,
        stop: stop,
        refresh: function () { refresh(true); },
        syncMembers: syncMembers,
        spinIcon: spinIconButton,
        showCopyPopup: showCopyCursorPopup,
        copyInviteFromLink: copyInviteFromLink,
        resetMembersKey: function () { lastMembersKey = ''; },
        bindModal: bindModal,
    };
}(typeof window !== 'undefined' ? window : globalThis));
