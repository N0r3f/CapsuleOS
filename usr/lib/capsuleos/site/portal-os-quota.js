/**
 * Quota OS portail : 15 min par OS et par jour (Forfait gratuite).
 */
(function () {
    'use strict';

    var API = '/portal/api/os-usage.php';
    var HEARTBEAT_MS = 60000;
    var FINGERPRINT_KEY = 'capsule_portal_anon_fp';

    function getFingerprint() {
        try {
            var fp = localStorage.getItem(FINGERPRINT_KEY);
            if (!fp) {
                fp = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random();
                localStorage.setItem(FINGERPRINT_KEY, fp);
            }
            return fp;
        } catch (_) {
            return 'anon-fallback';
        }
    }

    function getRegistryId() {
        var params = new URLSearchParams(window.location.search);
        var fromQuery = params.get('registry') || params.get('registryId');
        if (fromQuery) {
            return fromQuery;
        }
        if (document.body && document.body.id) {
            return document.body.id;
        }
        var match = window.location.pathname.match(/OS\/[^/]+\/([^/]+)/);
        return match ? match[1] : 'unknown-os';
    }

    function ensureBanner() {
        var banner = document.getElementById('portal-os-quota-banner');
        if (banner) {
            return banner;
        }
        banner = document.createElement('div');
        banner.id = 'portal-os-quota-banner';
        banner.className = 'portal-os-quota';
        banner.setAttribute('role', 'status');
        banner.innerHTML = '<span class="portal-os-quota-text"></span><a class="portal-os-quota-cta" href="/portal/subscribe.php">Abonné</a>';
        document.body.insertBefore(banner, document.body.firstChild);
        return banner;
    }

    function setBlocked(blocked) {
        document.documentElement.classList.toggle('portal-os-quota-blocked', blocked);
        var overlay = document.getElementById('portal-os-quota-overlay');
        if (blocked && !overlay) {
            var el = document.createElement('div');
            el.id = 'portal-os-quota-overlay';
            el.className = 'portal-os-quota-overlay';
            el.innerHTML = '<div class="portal-os-quota-overlay-card"><h2>Temps d\'utilisation épuisé</h2><p>Vous avez atteint la limite gratuite pour ce système aujourd\'hui (15 min par OS et par jour).</p><a href="/portal/subscribe.php">Passer à Abonné</a><a href="/portal/account.php">Mon compte</a></div>';
            document.body.appendChild(el);
        } else if (!blocked && overlay) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    function applyPermissions(data) {
        if (!data || !data.permissions) {
            return;
        }
        window.CAPSULE_PORTAL_PERMISSIONS = data.permissions.permissions || data.permissions;
    }

    function fetchQuota() {
        var registryId = getRegistryId();
        var fp = getFingerprint();
        var url = API + '?registryId=' + encodeURIComponent(registryId) + '&fingerprint=' + encodeURIComponent(fp);
        return fetch(url, { credentials: 'include' }).then(function (res) {
            if (!res.ok) {
                return null;
            }
            return res.json();
        });
    }

    function heartbeat() {
        var registryId = getRegistryId();
        var fp = getFingerprint();
        return fetch(API, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registryId: registryId, fingerprint: fp, minutes: 1 }),
        }).then(function (res) {
            return res.ok ? res.json() : null;
        });
    }

    function updateBanner(data) {
        var banner = ensureBanner();
        var text = banner.querySelector('.portal-os-quota-text');
        if (!text || !data) {
            return;
        }
        var perms = data.permissions || {};
        var permInner = perms.permissions || perms;
        if (data.unlimited || (data.permissions && data.permissions.osQuota && data.permissions.osQuota.unlimited) || permInner.osQuotaUnlimited) {
            banner.hidden = true;
            setBlocked(false);
            return;
        }
        applyPermissions(data);
        banner.hidden = false;
        var remaining = data.minutesRemaining;
        if (remaining === null || remaining === undefined) {
            remaining = (data.permissions && data.permissions.osQuota) ? data.permissions.osQuota.limitMinutes : 15;
        }
        text.textContent = 'Temps restant aujourd\'hui : ' + Math.ceil(remaining) + ' min';
        setBlocked(Number(remaining) <= 0);
    }

    function init() {
        fetchQuota().then(function (data) {
            if (!data) {
                return;
            }
            applyPermissions(data);
            var perms = data.permissions || {};
            var permInner = perms.permissions || perms;
            if (data.unlimited || permInner.osQuotaUnlimited) {
                return;
            }
            updateBanner(data);
            setInterval(function () {
                heartbeat().then(function (beat) {
                    if (beat) {
                        updateBanner(beat);
                    }
                });
            }, HEARTBEAT_MS);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
