/**
 * Modale de confirmation réutilisable (suppressions, actions sensibles).
 * Génère sa propre <dialog> ; renvoie une Promise<boolean>.
 */
(function (global) {
    'use strict';

    var DIALOG_ID = 'portal-account-confirm-modal';
    var ICONS = {
        danger: '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>',
        warning: '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',
    };
    var TONES = ['danger', 'warning'];
    var current = null;

    function buildDialog() {
        var dialog = global.document.getElementById(DIALOG_ID);
        if (dialog) {
            return dialog;
        }
        dialog = global.document.createElement('dialog');
        dialog.id = DIALOG_ID;
        dialog.className = 'portal-account-modal portal-account-modal--confirm portal-account-confirm-modal';
        dialog.setAttribute('aria-labelledby', 'portal-account-confirm-title');
        dialog.setAttribute('aria-describedby', 'portal-account-confirm-message');
        dialog.innerHTML = ''
            + '<div class="portal-account-modal-panel">'
            + '<div class="portal-account-modal-head portal-account-confirm-head">'
            + '<div class="portal-account-confirm-icon portal-account-confirm-icon--danger" data-confirm-icon aria-hidden="true"></div>'
            + '<h2 class="portal-account-modal-title" id="portal-account-confirm-title" data-confirm-title>Confirmer la suppression</h2>'
            + '</div>'
            + '<div class="portal-account-modal-body portal-account-confirm-body">'
            + '<p class="portal-account-modal-lead" id="portal-account-confirm-message" data-confirm-message></p>'
            + '<div class="portal-account-modal-actions">'
            + '<button type="button" class="portal-account-btn portal-account-btn--ghost" data-confirm-cancel>Annuler</button>'
            + '<button type="button" class="portal-account-btn portal-account-btn--danger" data-confirm-accept>Supprimer</button>'
            + '</div></div></div>';
        global.document.body.appendChild(dialog);
        bindDialog(dialog);
        return dialog;
    }

    function resolveCurrent(result) {
        var pending = current;
        current = null;
        if (pending && typeof pending.resolve === 'function') {
            pending.resolve(result);
        }
    }

    function closeDialog(dialog, result) {
        if (dialog && dialog.open && typeof dialog.close === 'function') {
            dialog.close();
        }
        resolveCurrent(!!result);
    }

    function bindDialog(dialog) {
        dialog.querySelector('[data-confirm-cancel]').addEventListener('click', function () {
            closeDialog(dialog, false);
        });
        dialog.querySelector('[data-confirm-accept]').addEventListener('click', function () {
            closeDialog(dialog, true);
        });
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog) {
                closeDialog(dialog, false);
            }
        });
        dialog.addEventListener('cancel', function (event) {
            event.preventDefault();
            closeDialog(dialog, false);
        });
    }

    function show(options) {
        var opts = options || {};
        var dialog = buildDialog();

        if (current) {
            resolveCurrent(false);
        }

        var tone = TONES.indexOf(opts.tone) === -1 ? 'danger' : opts.tone;
        var iconEl = dialog.querySelector('[data-confirm-icon]');
        var titleEl = dialog.querySelector('[data-confirm-title]');
        var messageEl = dialog.querySelector('[data-confirm-message]');
        var acceptBtn = dialog.querySelector('[data-confirm-accept]');
        var cancelBtn = dialog.querySelector('[data-confirm-cancel]');

        if (iconEl) {
            iconEl.className = 'portal-account-confirm-icon portal-account-confirm-icon--' + tone;
            iconEl.innerHTML = ICONS[tone] || ICONS.danger;
        }
        if (titleEl) {
            titleEl.textContent = opts.title || 'Confirmer la suppression';
        }
        if (messageEl) {
            messageEl.textContent = opts.message || 'Cette action est définitive.';
        }
        if (acceptBtn) {
            acceptBtn.textContent = opts.confirmLabel || 'Supprimer';
            acceptBtn.className = 'portal-account-btn portal-account-btn--' + (opts.confirmVariant || 'danger');
        }
        if (cancelBtn) {
            cancelBtn.textContent = opts.cancelLabel || 'Annuler';
        }

        return new Promise(function (resolve) {
            current = { resolve: resolve };
            if (typeof dialog.showModal === 'function') {
                dialog.showModal();
                if (acceptBtn) {
                    acceptBtn.focus();
                }
            } else {
                resolveCurrent(global.confirm(opts.message || 'Confirmer ?'));
            }
        });
    }

    global.CapsulePortalConfirm = {
        show: show,
    };
}(typeof window !== 'undefined' ? window : globalThis));
