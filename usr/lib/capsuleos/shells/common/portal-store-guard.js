/**
 * Garde-fou magasins OS : navigation autorisée, installation/lancement bloqués en gratuit.
 */
(function () {
    'use strict';

    const perms = window.CAPSULE_PORTAL_PERMISSIONS || {};
    const canLaunch = perms.storeAppLaunch !== false;

    if (canLaunch) {
        return;
    }

    function blockAction(event) {
        const target = event.target.closest('button, a, [role="button"]');
        if (!target) {
            return;
        }
        const label = (target.textContent || '').toLowerCase();
        const blocked = ['installer', 'install', 'lancer', 'launch', 'open', 'ouvrir', 'obtenir', 'get'].some((w) => label.includes(w));
        if (!blocked) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        alert('Les applications du magasin nécessitent Abonné ou une classe active.');
    }

    document.addEventListener('click', blockAction, true);

    document.querySelectorAll('[data-discover-install], [data-um-install], .gnome-software__install, .kde-discover-card__install').forEach((el) => {
        el.setAttribute('aria-disabled', 'true');
        el.classList.add('portal-store-guard-disabled');
    });
}());
