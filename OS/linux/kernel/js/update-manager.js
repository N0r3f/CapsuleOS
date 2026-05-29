/**
 * Update Manager (simulation) — UI only.
 * - Tabs: switch active panel label (placeholder)
 * - Install button: clears update badge in shell (if present)
 */
(function initUpdateManagerApp() {
    function findRoot() {
        return document.getElementById('updateManagerApp');
    }

    function detectLayout() {
        const root = findRoot();
        if (!root) {
            return;
        }
        const isPopOs = typeof document !== 'undefined'
            && document.body
            && (document.body.id === 'popos'
                || (typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY === 'popos'));
        const isOpenSuse = typeof document !== 'undefined'
            && document.body
            && (document.body.id === 'opensuse'
                || (typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY === 'opensuse'));

        if (isPopOs) {
            root.dataset.umLayout = 'cosmic';
            return;
        }
        if (isOpenSuse) {
            root.dataset.umLayout = 'kde';
            return;
        }
        root.dataset.umLayout = root.dataset.umLayout || 'mint';
    }

    function bindTrayOnce() {
        const trayBtn = document.querySelector('[data-update-manager-tray]');
        if (!trayBtn || trayBtn.dataset.umTrayInit === 'true') {
            return;
        }
        trayBtn.dataset.umTrayInit = 'true';
        trayBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof window.openWindowByDataLink === 'function') {
                window.openWindowByDataLink('update_manager');
            }
        });
    }

    function setStatus(text) {
        const el = document.getElementById('um-status-text');
        if (el) {
            el.textContent = text;
        }
    }

    function setTrayBadgeVisible(isVisible) {
        const trayBtn = document.querySelector('[data-update-manager-tray]');
        if (!trayBtn) {
            return;
        }
        trayBtn.dataset.hasUpdates = isVisible ? 'true' : 'false';
        trayBtn.setAttribute('aria-label', isVisible ? 'Mises à jour disponibles' : 'Aucune mise à jour');
    }

    function setActiveTab(tabId) {
        const root = findRoot();
        if (!root) {
            return;
        }
        root.querySelectorAll('[data-um-tab]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.getAttribute('data-um-tab') === tabId);
        });
        const panel = root.querySelector('#um-panel');
        if (!panel) {
            return;
        }
        const labelMap = {
            info: 'Renseignements',
            packages: 'Paquets',
            changelog: 'Journal des changements'
        };
        const label = labelMap[tabId] || 'Renseignements';
        panel.innerHTML = `<p class="update-manager__placeholder">${label} (simulation).</p>`;
    }

    function onAction(action) {
        if (action === 'install') {
            setTrayBadgeVisible(false);
            setStatus('Installation terminée (simulation).');
            return;
        }
        if (action === 'refresh') {
            setStatus('Liste actualisée (simulation).');
            return;
        }
        if (action === 'selectAll') {
            setStatus('Tout sélectionné (simulation).');
            return;
        }
        if (action === 'clear') {
            setStatus('Sélection effacée (simulation).');
        }
    }

    function bindOnce() {
        const root = findRoot();
        if (!root || root.dataset.umInit === 'true') {
            return;
        }
        if (root.classList.contains('update-manager--ubuntu')) {
            root.dataset.umInit = 'true';
            root.addEventListener('click', (event) => {
                const action = event.target.closest('[data-um-ubuntu-action]');
                if (!action || !root.contains(action)) {
                    return;
                }
                event.preventDefault();
                const id = action.getAttribute('data-um-ubuntu-action');
                if (id === 'check') {
                    setStatus('Recherche de mises à jour… (simulation)');
                    return;
                }
                if (id === 'updateAll') {
                    setStatus('Toutes les mises à jour installées (simulation).');
                    setTrayBadgeVisible(false);
                    return;
                }
                if (id === 'updateOne') {
                    setStatus('Mise à jour installée (simulation).');
                }
            });
            return;
        }
        detectLayout();

        root.dataset.umInit = 'true';

        if (root.dataset.umLayout === 'cosmic') {
            root.addEventListener('click', (event) => {
                const action = event.target.closest('[data-um-cosmic-action]');
                if (action && root.contains(action)) {
                    event.preventDefault();
                    setStatus('Mises à jour vérifiées (simulation).');
                }
            });
            return;
        }

        if (root.dataset.umLayout === 'kde') {
            const isMxKde = typeof document !== 'undefined'
                && document.body
                && (document.body.id === 'mx-kde'
                    || (typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY === 'mxkde'));
            if (isMxKde) {
                const badge = root.querySelector('.kde-updates__badge');
                if (badge) {
                    badge.textContent = '3';
                    badge.setAttribute('aria-label', '3 mises à jour');
                }
            }
            root.addEventListener('click', (event) => {
                const action = event.target.closest('[data-um-kde-action]');
                if (action && root.contains(action)) {
                    event.preventDefault();
                    const id = action.getAttribute('data-um-kde-action');
                    if (id === 'refresh') {
                        setStatus('Mises à jour rafraîchies (simulation).');
                    } else {
                        setStatus('Toutes les mises à jour installées (simulation).');
                        setTrayBadgeVisible(false);
                    }
                }
            });
            return;
        }

        root.addEventListener('click', (event) => {
            const tab = event.target.closest('[data-um-tab]');
            if (tab && root.contains(tab)) {
                event.preventDefault();
                setActiveTab(tab.getAttribute('data-um-tab'));
                return;
            }
            const tool = event.target.closest('[data-um-action]');
            if (tool && root.contains(tool)) {
                event.preventDefault();
                onAction(tool.getAttribute('data-um-action'));
            }
        });

        setActiveTab('info');
    }

    window.initUpdateManagerApp = bindOnce;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindTrayOnce);
    } else {
        bindTrayOnce();
    }
})();

