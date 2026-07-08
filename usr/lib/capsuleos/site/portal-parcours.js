/**
 * Parcours portail — rendu dev + modale choix OS (dev et PHP).
 */
(function () {
    'use strict';

    const modal = document.getElementById('parcours-os-modal');
    const list = document.getElementById('parcours-os-list');
    const closeBtn = document.getElementById('parcours-os-modal-close');
    const root = document.querySelector('[data-portal-parcours-root]');
    const data = window.CapsulePortalModules;

    const resolveEntitlement = () => {
        if (window.CAPSULE_PORTAL_ENTITLEMENT) {
            return window.CAPSULE_PORTAL_ENTITLEMENT;
        }
        if (window.CAPSULE_PORTAL_MODE === 'dev') {
            return 'subscriber';
        }
        return 'anonymous';
    };

    const canAccessModule = (entitlement, access) => {
        const map = (data && data.moduleAccess) || { subscriber: ['subscriber'] };
        const allowed = map[access] || [];
        return Array.isArray(allowed) && allowed.includes(entitlement);
    };

    const isModuleLocked = (module) => !canAccessModule(resolveEntitlement(), module.access || 'subscriber');

    const esc = (value) => {
        const el = document.createElement('span');
        el.textContent = value == null ? '' : String(value);
        return el.innerHTML;
    };

    const launchHref = (facade, mountId) => {
        const sep = facade.includes('?') ? '&' : '?';
        return `${facade}${sep}mnt=${encodeURIComponent(mountId)}`;
    };

    const renderCard = (module) => {
        const locked = isModuleLocked(module);
        const cardClass = 'parcours-card' + (locked ? ' parcours-card--locked' : '');
        let cta = '';
        if (locked) {
            cta = `<button type="button" class="parcours-cta parcours-cta--locked" data-portal-auth-modal="register"><span class="parcours-lock" aria-hidden="true">🔒</span> ${esc(module.accessLabel)}</button>`;
        } else if (!module.compatibleOs || module.compatibleOs.length === 0) {
            cta = '<p class="parcours-card-empty">Aucun système compatible actif.</p>';
        } else if (module.compatibleOs.length === 1) {
            const os = module.compatibleOs[0];
            cta = `<a class="parcours-cta" href="${esc(launchHref(os.facade, module.mountId))}">Démarrer — ${esc(os.displayName)}</a>`;
        } else {
            cta = `<button type="button" class="parcours-cta parcours-cta--pick" data-parcours-pick data-mount-id="${esc(module.mountId)}" data-module-title="${esc(module.title)}" data-compatible-os="${esc(JSON.stringify(module.compatibleOs))}">Choisir un système</button>`;
        }
        return `
            <article class="${cardClass}" data-mount-id="${esc(module.mountId)}">
                <div class="parcours-card-head">
                    <h4 class="parcours-card-title">${esc(module.title)}</h4>
                    <span class="parcours-access parcours-access--${esc(module.access)}">${esc(module.accessLabel)}</span>
                </div>
                ${module.description ? `<p class="parcours-card-desc">${esc(module.description)}</p>` : ''}
                <p class="parcours-card-meta">${module.scenarioCount} scénario${module.scenarioCount > 1 ? 's' : ''}</p>
                ${cta}
            </article>`;
    };

    if (root && data) {
        root.innerHTML = `
            <h2 class="parcours-title" id="parcours-title">${esc(data.sectionTitle)}</h2>
            ${data.sectionLead ? `<p class="parcours-lead">${esc(data.sectionLead)}</p>` : ''}
            ${(data.levels || []).map((level) => `
                <div class="parcours-level">
                    <h3 class="parcours-level-title">${esc(level.label)}</h3>
                    <div class="parcours-grid">
                        ${(level.modules || []).map(renderCard).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    const openModal = (mountId, title, osList) => {
        const titleEl = document.getElementById('parcours-os-modal-title');
        if (titleEl) {
            titleEl.textContent = title ? `Choisir un système — ${title}` : 'Choisir un système';
        }
        if (list) {
            list.innerHTML = osList.map((os) => `
                <li><a class="parcours-os-link" href="${esc(launchHref(os.facade, mountId))}">${esc(os.displayName)}</a></li>
            `).join('');
        }
        if (modal && typeof modal.showModal === 'function') {
            modal.showModal();
        }
    };

    document.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-parcours-pick]');
        if (!btn) {
            return;
        }
        let osList = [];
        try {
            osList = JSON.parse(btn.getAttribute('data-compatible-os') || '[]');
        } catch (_) { /* ignore */ }
        openModal(btn.getAttribute('data-mount-id') || '', btn.getAttribute('data-module-title') || '', osList);
    });

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.close());
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    }
}());
