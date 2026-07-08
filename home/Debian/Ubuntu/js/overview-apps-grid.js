/**
 * Hydrate la grille « Afficher les applications » depuis CAPSULE_OVERVIEW_APPS_GRID.
 * Source : generate-overview-apps-grid.mjs
 */
'use strict';
(function hydrateOverviewAppsGrid() {
    const gridRoot = document.querySelector('.fedora-overview__apps-grid');
    const grid = window.CAPSULE_OVERVIEW_APPS_GRID;
    if (!gridRoot || !grid || !Array.isArray(grid.apps) || !grid.apps.length) {
        return;
    }

    const resolveIcon = (src) => {
        if (typeof window.resolveCapsuleResourceUrl === 'function') {
            return window.resolveCapsuleResourceUrl(src);
        }
        if (window.CapsuleResource && typeof window.CapsuleResource.resolve === 'function') {
            return window.CapsuleResource.resolve(src);
        }
        return src;
    };

    gridRoot.innerHTML = '';
    grid.apps.forEach((app) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fedora-overview__app';
        button.setAttribute('aria-label', app.labelFr || app.labelShort || 'Application');
        if (app.dataLink) {
            button.setAttribute('data-overview-link', app.dataLink);
        }

        const img = document.createElement('img');
        img.src = resolveIcon(app.icon);
        img.alt = '';

        const label = document.createElement('span');
        label.textContent = app.labelShort || app.labelFr || '';

        button.appendChild(img);
        button.appendChild(label);
        gridRoot.appendChild(button);
    });
})();
