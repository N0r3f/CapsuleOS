/**
 * Modales compte : classe, compat navigation Paramètres.
 */
(function (global) {
    'use strict';

    var MODAL_TO_NAV = {
        tickets: { view: 'support', sub: 'support' },
        settings: { view: 'settings', sub: 'account' },
        'subscription-manage': { view: 'settings', sub: 'subscription' },
    };

    var MODAL_IDS = {
        'classroom-create': 'portal-account-classroom-create-modal',
        'classroom-detail': 'portal-account-classroom-detail-modal',
        'invoice-history': 'portal-account-invoice-history-modal',
    };

    function openViaNav(name) {
        var target = MODAL_TO_NAV[name];
        if (target && global.CapsulePortalAccountNav) {
            global.CapsulePortalAccountNav.activate(target.view, { sub: target.sub });
            return true;
        }
        return false;
    }

    function getModal(name) {
        var id = MODAL_IDS[name];
        return id ? document.getElementById(id) : null;
    }

    function closeModal(modal) {
        if (modal && modal.open) {
            if (modal.id === MODAL_IDS['classroom-detail'] && global.CapsulePortalClassroomLive) {
                global.CapsulePortalClassroomLive.stop();
            }
            modal.close();
        }
    }

    function openModal(name) {
        if (openViaNav(name)) {
            return;
        }
        var modal = getModal(name);
        if (!modal || typeof modal.showModal !== 'function') {
            return;
        }
        modal.showModal();
        if (name === 'classroom-detail' && global.CapsulePortalClassroomLive) {
            global.CapsulePortalClassroomLive.start();
        }
    }

    function bindModal(modal) {
        if (!modal || modal.getAttribute('data-portal-modal-bound') === '1') {
            return;
        }
        modal.setAttribute('data-portal-modal-bound', '1');
        modal.querySelectorAll('[data-portal-account-modal-close]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeModal(modal);
            });
        });
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
        modal.addEventListener('cancel', function (event) {
            event.preventDefault();
            closeModal(modal);
        });
    }

    document.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-portal-account-modal-open]');
        if (!btn) {
            return;
        }
        openModal(btn.getAttribute('data-portal-account-modal-open') || '');
    });

    Object.keys(MODAL_IDS).forEach(function (key) {
        bindModal(getModal(key));
    });

    global.CapsulePortalAccountModals = {
        open: openModal,
        close: function (name) {
            closeModal(getModal(name));
        },
        bindModal: bindModal,
    };
}(typeof window !== 'undefined' ? window : globalThis));
