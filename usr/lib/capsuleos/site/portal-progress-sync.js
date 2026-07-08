/**
 * Sync progression parcours (localStorage checklist) ↔ compte portail.
 */
(function () {
    'use strict';

    const API = '/portal/api/progress.php';
    let csrfToken = '';
    let saveTimer = null;

    const mntFromUrl = () => {
        try {
            return new URLSearchParams(window.location.search).get('mnt') || '';
        } catch (_) {
            return '';
        }
    };

    const registryId = () => {
        if (window.CAPSULE_SKIN_PROFILE_APPLIED && typeof window.CAPSULE_SKIN_PROFILE_APPLIED === 'string') {
            return window.CAPSULE_SKIN_PROFILE_APPLIED;
        }
        return document.body && document.body.id ? document.body.id : '';
    };

    const fetchCsrf = async () => {
        const res = await fetch(`${API}?action=csrf`, { credentials: 'include' });
        if (!res.ok) {
            return false;
        }
        const data = await res.json();
        csrfToken = data.csrf || '';
        return csrfToken !== '';
    };

    const restoreProgress = async (mountId) => {
        const res = await fetch(`${API}?mountId=${encodeURIComponent(mountId)}`, { credentials: 'include' });
        if (!res.ok) {
            return;
        }
        const data = await res.json();
        const row = data.progress;
        if (!row || !row.storage_key || !row.progress_json) {
            return;
        }
        try {
            localStorage.setItem(row.storage_key, row.progress_json);
        } catch (_) { /* ignore */ }
    };

    const pushProgress = async (detail) => {
        const mountId = mntFromUrl();
        if (!mountId || !detail || !detail.storageKey) {
            return;
        }
        if (!csrfToken && !(await fetchCsrf())) {
            return;
        }
        const state = detail.state || {};
        const doneCount = Object.keys(state).filter((k) => state[k]).length;
        const totalCount = 8;
        await fetch(API, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            body: JSON.stringify({
                mountId,
                registryId: registryId(),
                storageKey: detail.storageKey,
                state,
                doneCount,
                totalCount,
                _csrf: csrfToken,
            }),
        });
        if (doneCount > 0) {
            fetch('/portal/api/gamification.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
                body: JSON.stringify({ action: 'add_xp', _csrf: csrfToken }),
            }).catch(() => {});
        }
    };

    const scheduleSave = (detail) => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            pushProgress(detail).catch(() => {});
        }, 800);
    };

    const init = async () => {
        const mountId = mntFromUrl();
        if (!mountId) {
            return;
        }
        try {
            await restoreProgress(mountId);
            document.dispatchEvent(new CustomEvent('capsule:progress-restored'));
        } catch (_) { /* non connecté */ }
        document.addEventListener('capsule:checklist-saved', (event) => {
            scheduleSave(event.detail);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { init(); });
    } else {
        init();
    }
}());
