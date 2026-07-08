/**
 * Espace créateur :
 *  - champs de soumission structurés dans le formulaire ticket (type demande_module) ;
 *  - panneau « Mes modules » listant les modules publiés et les demandes en cours.
 */
(function (global) {
    'use strict';

    var ALLOWED_GIT_HOSTS = ['github.com', 'gitlab.com', 'codeberg.org'];
    var pollTimer = null;

    function apiBase() {
        var accountRoot = document.querySelector('[data-portal-account]');
        var base = accountRoot ? (accountRoot.getAttribute('data-portal-api-base') || 'portal/api/') : 'portal/api/';
        if (!base.endsWith('/')) {
            base += '/';
        }
        return '/' + base.replace(/^\/+/, '');
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function fieldValue(form, name) {
        var el = form.querySelector('[name="' + name + '"]');
        if (!el) {
            return '';
        }
        if (el.type === 'radio') {
            var checked = form.querySelector('[name="' + name + '"]:checked');
            return checked ? String(checked.value || '') : '';
        }
        return String(el.value || '').trim();
    }

    function isAllowedGitUrl(url) {
        if (!/^https:\/\//i.test(url) || url.indexOf('@') !== -1) {
            return false;
        }
        var host = '';
        try {
            host = new global.URL(url).hostname.toLowerCase().replace(/^www\./, '');
        } catch (err) {
            return false;
        }
        return ALLOWED_GIT_HOSTS.indexOf(host) !== -1;
    }

    function collectSubmission(form) {
        if (!form) {
            return { ok: false, error: 'Formulaire introuvable' };
        }
        var submission = {
            moduleTitle: fieldValue(form, 'moduleTitle'),
            requestedLevel: fieldValue(form, 'requestedLevel'),
            gitUrl: fieldValue(form, 'gitUrl'),
            gitRef: fieldValue(form, 'gitRef') || 'main',
            billingType: fieldValue(form, 'billingType') || 'subscriber',
            priceDisplay: fieldValue(form, 'priceDisplay'),
            pitch: fieldValue(form, 'body'),
        };
        if (!submission.moduleTitle) {
            return { ok: false, error: 'Titre du module requis' };
        }
        if (!submission.requestedLevel) {
            return { ok: false, error: 'Niveau pédagogique requis' };
        }
        if (!isAllowedGitUrl(submission.gitUrl)) {
            return { ok: false, error: 'URL Git invalide (HTTPS public GitHub, GitLab ou Codeberg)' };
        }
        if (submission.billingType === 'purchase' && !submission.priceDisplay) {
            return { ok: false, error: 'Prix requis pour un module payant' };
        }
        if (!submission.pitch) {
            return { ok: false, error: 'Description du module requise' };
        }
        return { ok: true, submission: submission };
    }

    function syncPriceField(form) {
        var priceField = form.querySelector('[data-ticket-price-field]');
        if (!priceField) {
            return;
        }
        var selected = form.querySelector('[name="billingType"]:checked');
        priceField.hidden = !(selected && selected.value === 'purchase');
    }

    function syncSubmissionFields(form) {
        if (!form) {
            return;
        }
        var block = form.querySelector('[data-ticket-submission-fields]');
        if (!block) {
            return;
        }
        var typeSelect = form.querySelector('[name="type"]');
        var isModule = typeSelect && typeSelect.value === 'demande_module';
        block.hidden = !isModule;
        var messageLabel = form.querySelector('[data-ticket-message-label]');
        if (messageLabel) {
            messageLabel.textContent = isModule ? 'Description du module' : 'Message';
        }
        if (isModule) {
            syncPriceField(form);
        }
    }

    function bindTicketForm() {
        var form = document.querySelector('[data-ticket-form]');
        if (!form || form.getAttribute('data-creator-bound') === '1') {
            return;
        }
        if (!form.querySelector('[data-ticket-submission-fields]')) {
            return;
        }
        form.setAttribute('data-creator-bound', '1');
        var typeSelect = form.querySelector('[name="type"]');
        if (typeSelect) {
            typeSelect.addEventListener('change', function () {
                syncSubmissionFields(form);
            });
        }
        form.addEventListener('change', function (event) {
            if (event.target && event.target.name === 'billingType') {
                syncPriceField(form);
            }
        });
        syncSubmissionFields(form);
    }

    function billingLabel(type) {
        var map = { free: 'Gratuit', subscriber: 'Inclus abonnement', purchase: 'Achat unitaire' };
        return map[String(type || '')] || String(type || '');
    }

    function autoStatusLabel(status) {
        var map = {
            pending: 'En attente',
            running: 'Validation en cours…',
            passed: 'Conforme',
            failed: 'Non conforme',
        };
        return map[String(status || '')] || String(status || '');
    }

    function adminStatusLabel(status) {
        var map = {
            awaiting_review: 'En attente de revue',
            in_dev: 'Revue en cours',
            approved: 'Ajout approuvé',
            rejected: 'Ajout refusé',
            published: 'Publié',
        };
        return map[String(status || '')] || String(status || '');
    }

    function publishedItemHtml(sub) {
        var mount = sub.resolvedMountId || sub.proposedMountId || '';
        var html = '<li class="portal-account-creator-item portal-account-creator-item--published">'
            + '<div class="portal-account-creator-item-head">'
            + '<strong>' + escapeHtml(sub.moduleTitle || mount) + '</strong>'
            + '<span class="portal-account-badge portal-account-badge--published">En store</span>'
            + '</div>'
            + '<p class="portal-account-meta"><code>' + escapeHtml(mount) + '</code> · '
            + escapeHtml(billingLabel(sub.billingType));
        if (sub.priceDisplay) {
            html += ' · ' + escapeHtml(sub.priceDisplay);
        }
        html += '</p></li>';
        return html;
    }

    function pendingItemHtml(sub) {
        var mount = sub.proposedMountId || '';
        var html = '<li class="portal-account-creator-item">'
            + '<div class="portal-account-creator-item-head">'
            + '<strong>' + escapeHtml(sub.moduleTitle || sub.requestedLevel || 'Module') + '</strong>'
            + '<span class="portal-account-badge portal-account-badge--auto-' + escapeHtml(sub.autoStatus) + '">'
            + escapeHtml(autoStatusLabel(sub.autoStatus)) + '</span>'
            + '</div>'
            + '<p class="portal-account-meta">'
            + (mount
                ? '<code>' + escapeHtml(mount) + '</code> · '
                : '<span class="portal-account-meta--muted">Identifiant attribué par l\u2019équipe</span> · ')
            + escapeHtml(adminStatusLabel(sub.adminStatus)) + '</p>';
        if (sub.adminStatus === 'rejected' && sub.adminNotes) {
            html += '<p class="portal-account-meta portal-account-meta--error">Raison du refus de l\'ajout : ' + escapeHtml(sub.adminNotes) + '</p>';
        } else if (sub.autoStatus === 'failed') {
            html += '<p class="portal-account-meta portal-account-meta--error">L\'analyse automatique a relevé des écarts — l\'équipe vous répondra dans le ticket.</p>';
        }
        html += '</li>';
        return html;
    }

    function renderModules(submissions) {
        var publishedRoot = document.querySelector('[data-creator-published-list]');
        var pendingRoot = document.querySelector('[data-creator-pending-list]');
        if (!publishedRoot || !pendingRoot) {
            return false;
        }
        var published = [];
        var pending = [];
        (submissions || []).forEach(function (sub) {
            if (sub.adminStatus === 'published') {
                published.push(sub);
            } else {
                pending.push(sub);
            }
        });
        publishedRoot.innerHTML = published.length
            ? '<ul class="portal-account-creator-list">' + published.map(publishedItemHtml).join('') + '</ul>'
            : '<p class="portal-account-empty">Aucun module publié pour le moment.</p>';
        pendingRoot.innerHTML = pending.length
            ? '<ul class="portal-account-creator-list">' + pending.map(pendingItemHtml).join('') + '</ul>'
            : '<p class="portal-account-empty">Aucune demande en cours.</p>';
        return pending.some(function (sub) {
            return sub.autoStatus === 'pending' || sub.autoStatus === 'running';
        });
    }

    function loadModules() {
        if (!document.querySelector('[data-portal-creator-panel]')) {
            return;
        }
        fetch(apiBase() + 'creator-submissions.php', { credentials: 'include', cache: 'no-store' })
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                if (!data || data.error) {
                    return;
                }
                var needsPoll = renderModules(data.submissions || []);
                if (needsPoll && !pollTimer) {
                    pollTimer = global.setInterval(loadModules, 6000);
                } else if (!needsPoll && pollTimer) {
                    global.clearInterval(pollTimer);
                    pollTimer = null;
                }
            })
            .catch(function () {
                var publishedRoot = document.querySelector('[data-creator-published-list]');
                if (publishedRoot) {
                    publishedRoot.innerHTML = '<p class="portal-account-empty">Impossible de charger les modules.</p>';
                }
            });
    }

    function onTicketSubmitted(form) {
        if (form) {
            syncSubmissionFields(form);
        }
        loadModules();
    }

    global.CapsulePortalCreator = {
        collectSubmission: collectSubmission,
        onTicketSubmitted: onTicketSubmitted,
        reloadModules: loadModules,
        syncFields: syncSubmissionFields,
    };

    function init() {
        bindTicketForm();
        loadModules();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : globalThis);
