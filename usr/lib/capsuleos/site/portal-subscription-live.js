/**
 * Abonnement — synchronisation rapide client + utilitaires admin.
 */
(function (global) {
    'use strict';

    var POLL_MS = 6000;
    var accountPollTimer = null;
    var lastAccountFingerprint = '';
    var lastAccountSubscriber = null;

    var MONTHS_FR = [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
    ];

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatDateFr(iso) {
        if (!iso) {
            return '-';
        }
        var d = new Date(iso);
        if (isNaN(d.getTime())) {
            return '-';
        }
        return d.getDate() + ' ' + MONTHS_FR[d.getMonth()] + ' ' + d.getFullYear();
    }

    function formatDateTimeFr(iso) {
        if (!iso) {
            return '-';
        }
        var d = new Date(iso);
        if (isNaN(d.getTime())) {
            return '-';
        }
        var hours = String(d.getHours()).padStart(2, '0');
        var minutes = String(d.getMinutes()).padStart(2, '0');
        return formatDateFr(iso) + ' à ' + hours + ':' + minutes;
    }

    function formatPeriodDisplay(iso, cancelAtEnd) {
        if (!iso) {
            return '-';
        }
        var formatted = formatDateTimeFr(iso);
        return cancelAtEnd ? 'fin le ' + formatted : formatted;
    }

    function cycleProgress(iso) {
        if (!iso) {
            return 0;
        }
        var end = new Date(iso).getTime();
        if (isNaN(end)) {
            return 0;
        }
        var start = new Date(end);
        start.setMonth(start.getMonth() - 1);
        var startMs = start.getTime();
        var span = Math.max(1, end - startMs);
        var now = Date.now();
        var elapsed = Math.min(span, Math.max(0, now - startMs));
        return Math.round((elapsed / span) * 100);
    }

    function fingerprint(sub) {
        if (!sub || typeof sub !== 'object') {
            return 'none';
        }
        return [
            sub.status || 'none',
            sub.currentPeriodEnd || '',
            sub.cancelAtPeriodEnd ? '1' : '0',
        ].join('|');
    }

    function listFingerprint(subs) {
        return (subs || []).map(function (s) {
            if (!s) {
                return '';
            }
            return [
                s.userId,
                s.status || 'none',
                s.currentPeriodEnd || '',
                s.cancelAtPeriodEnd ? '1' : '0',
                s.updatedAt || '',
            ].join(':');
        }).sort().join('|');
    }

    function listSummary(subs) {
        var byStatus = { none: 0, active: 0, past_due: 0, canceled: 0 };
        (subs || []).forEach(function (s) {
            if (!s) {
                return;
            }
            var key = s.status || 'none';
            if (Object.prototype.hasOwnProperty.call(byStatus, key)) {
                byStatus[key] += 1;
            }
        });
        return {
            byStatus: byStatus,
            activeCount: byStatus.active,
        };
    }

    function setRenewalStatusEl(el, cancelled) {
        if (!el) {
            return;
        }
        el.textContent = cancelled ? 'Annulé' : 'Actif';
        el.className = 'portal-account-sub-renewal-status '
            + (cancelled ? 'portal-account-sub-renewal-status--cancelled' : 'portal-account-sub-renewal-status--active');
    }

    function setManageLead(el, cancelAtEnd, periodEndFormatted) {
        if (!el) {
            return;
        }
        if (cancelAtEnd) {
            if (periodEndFormatted && periodEndFormatted !== '-') {
                el.innerHTML = 'Votre abonnement Abonné se terminera le <span class="portal-account-sub-date">'
                    + escapeHtml(periodEndFormatted) + '</span>.';
                return;
            }
            el.textContent = 'Votre abonnement Abonné se terminera à la fin de la période en cours.';
            return;
        }
        el.textContent = 'Votre abonnement Abonné se renouvelle automatiquement chaque mois.';
    }

    function syncRenewalButtons(cancelled) {
        document.querySelectorAll('[data-subscription-show-cancel-confirm]').forEach(function (btn) {
            btn.hidden = cancelled;
        });
        document.querySelectorAll('[data-subscription-reactivate]').forEach(function (btn) {
            btn.hidden = !cancelled;
        });
    }

    function updateCycleRing(cyclePercent) {
        var reached = cyclePercent >= 100;
        document.querySelectorAll('[data-subscription-cycle-progress]').forEach(function (el) {
            el.setAttribute('stroke-dashoffset', String(100 - cyclePercent));
            var ring = el.closest('[role="progressbar"]');
            if (ring) {
                ring.setAttribute('aria-valuenow', String(cyclePercent));
                ring.classList.toggle('portal-account-plan-renewal-ring--reached', reached);
            }
        });
    }

    function isSubscriptionExpiredSub(sub) {
        if (!sub || typeof sub !== 'object') {
            return false;
        }
        if (sub.isExpired) {
            return true;
        }
        if (sub.hasHistory && !sub.isSubscriber) {
            return true;
        }
        var status = String(sub.status || 'none');
        return status === 'past_due' || status === 'canceled';
    }

    function formatEndDisplay(iso, isExpired, cancelAtEnd) {
        if (!iso) {
            return '-';
        }
        var formatted = formatDateTimeFr(iso);
        if (isExpired) {
            return formatted;
        }
        return cancelAtEnd ? 'fin le ' + formatted : formatted;
    }

    function setTerminatedStatusEl(el) {
        if (!el) {
            return;
        }
        el.textContent = 'Terminé';
        el.className = 'portal-account-sub-renewal-status portal-account-sub-renewal-status--expired';
    }

    function applyExpiredSubscriptionUi(sub) {
        var periodEndFormatted = sub.periodEndFormatted || formatDateTimeFr(sub.currentPeriodEnd);
        var periodText = sub.periodDisplay || formatEndDisplay(sub.currentPeriodEnd, true, false);
        var settingsRoot = document.querySelector('.portal-account-subscription-settings');

        if (settingsRoot) {
            settingsRoot.setAttribute('data-subscription-ui', 'expired');
        }

        document.querySelectorAll('[data-subscription-plan-value]').forEach(function (el) {
            el.textContent = 'Gratuit';
            el.classList.remove('portal-account-plan-plus');
        });
        document.querySelectorAll('[data-subscription-plan-meta]').forEach(function (el) {
            if (periodEndFormatted && periodEndFormatted !== '-') {
                el.textContent = 'Ancien abonné Abonné · terminé le ' + periodEndFormatted;
            } else {
                el.textContent = 'Ancien abonné Abonné';
            }
        });
        document.querySelectorAll(
            '[data-subscription-renewal-status], [data-subscription-overview-status]',
        ).forEach(function (el) {
            setTerminatedStatusEl(el);
        });
        document.querySelectorAll('[data-subscription-billing-title]').forEach(function (el) {
            el.textContent = 'Dernière période';
        });
        document.querySelectorAll('[data-subscription-period-label]').forEach(function (el) {
            el.textContent = 'Date et heure de fin';
        });
        document.querySelectorAll('[data-subscription-next-billing-label]').forEach(function (el) {
            el.textContent = 'Montant facturé';
        });
        document.querySelectorAll(
            '[data-subscription-period-end], [data-subscription-next-billing]',
        ).forEach(function (el) {
            el.textContent = periodText;
        });
        document.querySelectorAll('[data-subscription-expired-date]').forEach(function (el) {
            el.textContent = periodEndFormatted !== '-' ? periodEndFormatted : '';
        });
        document.querySelectorAll('[data-subscription-overview-period]').forEach(function (el) {
            if (periodEndFormatted && periodEndFormatted !== '-') {
                el.textContent = 'Abonné · terminé le ' + periodEndFormatted;
            } else {
                el.textContent = 'Abonné';
            }
        });
        document.querySelectorAll('[data-subscription-active-manage]').forEach(function (el) {
            el.hidden = true;
        });
        document.querySelectorAll('[data-subscription-expired-manage]').forEach(function (el) {
            el.hidden = false;
        });
        document.querySelectorAll('[data-subscription-manage-section]').forEach(function (el) {
            el.classList.add('portal-account-sub-manage--expired');
        });
        updateCycleRing(100);
    }

    function applyAccountSubscription(payload) {
        var sub = payload && payload.subscription ? payload.subscription : {};
        if (isSubscriptionExpiredSub(sub)) {
            applyExpiredSubscriptionUi(sub);
            return;
        }
        var cancelled = !!sub.cancelAtPeriodEnd;
        var periodText = sub.periodDisplay || formatPeriodDisplay(sub.currentPeriodEnd, cancelled);
        var periodEndFormatted = sub.periodEndFormatted || formatDateTimeFr(sub.currentPeriodEnd);
        var cyclePercent = sub.cycleProgress != null ? Number(sub.cycleProgress) : cycleProgress(sub.currentPeriodEnd);

        document.querySelectorAll(
            '[data-subscription-manage-period], [data-subscription-overview-period],'
            + ' [data-subscription-period-end], [data-subscription-next-billing]',
        ).forEach(function (el) {
            el.textContent = periodText;
        });
        document.querySelectorAll(
            '[data-subscription-manage-status], [data-subscription-renewal-status], [data-subscription-overview-status]',
        ).forEach(function (el) {
            setRenewalStatusEl(el, cancelled);
        });
        document.querySelectorAll('[data-subscription-manage-lead]').forEach(function (el) {
            setManageLead(el, cancelled, periodEndFormatted);
        });
        document.querySelectorAll('[data-subscription-cancel-period]').forEach(function (el) {
            el.textContent = periodEndFormatted !== '-' ? periodEndFormatted : 'la fin de la période en cours';
        });
        syncRenewalButtons(cancelled);
        updateCycleRing(cyclePercent);
    }

    function accountApiUrl() {
        var root = document.querySelector('[data-portal-account]:not([data-portal-account-dev])');
        if (!root) {
            return '';
        }
        var base = root.getAttribute('data-portal-api-base') || 'portal/api/';
        if (!base.endsWith('/')) {
            base += '/';
        }
        return '/' + base.replace(/^\/+/, '') + 'account.php';
    }

    function notifyExpired() {
        var live = global.CapsulePortalTicketLive;
        if (live && typeof live.showToast === 'function') {
            live.showToast({
                title: 'Abonnement terminé',
                message: 'Votre accès Abonné a expiré. Relancez votre abonnement depuis cette page pour retrouver tous les avantages.',
                icon: 'fa-credit-card',
                variant: 'account',
            });
        }
    }

    function pollAccount(options) {
        var opts = options || {};
        var url = accountApiUrl();
        if (!url) {
            return Promise.resolve(null);
        }
        return fetch(url, { credentials: 'include' })
            .then(function (res) {
                return res.json().catch(function () { return {}; });
            })
            .then(function (data) {
                if (!data || data.error) {
                    return null;
                }
                var sub = data.subscription || {};
                var fp = fingerprint(sub);
                var accountRoot = document.querySelector('[data-portal-account]:not([data-portal-account-dev])');
                var isSubscriber = !!sub.isSubscriber;
                var subscriberChanged = lastAccountSubscriber !== null && lastAccountSubscriber !== isSubscriber;

                if (fp !== lastAccountFingerprint || subscriberChanged) {
                    var hadPrevious = lastAccountFingerprint !== '';
                    lastAccountFingerprint = fp;
                    applyAccountSubscription(data);
                    if (accountRoot) {
                        accountRoot.setAttribute('data-portal-subscriber', isSubscriber ? '1' : '0');
                    }
                    if (hadPrevious && lastAccountSubscriber && !isSubscriber) {
                        notifyExpired();
                        var keepPanel = accountRoot
                            && accountRoot.getAttribute('data-portal-subscription-history') === '1';
                        if (!keepPanel) {
                            global.setTimeout(function () {
                                global.location.reload();
                            }, 1400);
                        } else if (isSubscriptionExpiredSub(sub)) {
                            applyExpiredSubscriptionUi(sub);
                            if (accountRoot) {
                                accountRoot.setAttribute('data-portal-subscription-history', '1');
                            }
                        }
                    }
                } else {
                    updateCycleRing(
                        sub.cycleProgress != null ? Number(sub.cycleProgress) : cycleProgress(sub.currentPeriodEnd),
                    );
                }

                lastAccountSubscriber = isSubscriber;
                if (opts.initial && accountRoot) {
                    accountRoot.setAttribute('data-portal-subscriber', isSubscriber ? '1' : '0');
                }
                return data;
            })
            .catch(function () {
                return null;
            });
    }

    function startAccountPolling() {
        if (accountPollTimer || !accountApiUrl()) {
            return;
        }
        pollAccount({ initial: true });
        accountPollTimer = global.setInterval(function () {
            if (document.hidden) {
                return;
            }
            pollAccount({ auto: true });
        }, POLL_MS);
    }

    function stopAccountPolling() {
        if (accountPollTimer) {
            global.clearInterval(accountPollTimer);
            accountPollTimer = null;
        }
    }

    global.CapsulePortalSubscriptionLive = {
        POLL_MS: POLL_MS,
        fingerprint: fingerprint,
        listFingerprint: listFingerprint,
        listSummary: listSummary,
        formatDateFr: formatDateFr,
        formatDateTimeFr: formatDateTimeFr,
        formatPeriodDisplay: formatPeriodDisplay,
        cycleProgress: cycleProgress,
        applyExpiredSubscriptionUi: applyExpiredSubscriptionUi,
        applyAccountSubscription: applyAccountSubscription,
        pollAccount: pollAccount,
        startAccountPolling: startAccountPolling,
        stopAccountPolling: stopAccountPolling,
    };

    if (accountApiUrl()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startAccountPolling);
        } else {
            startAccountPolling();
        }
        global.addEventListener('pagehide', stopAccountPolling);
    }
}(typeof window !== 'undefined' ? window : globalThis));
