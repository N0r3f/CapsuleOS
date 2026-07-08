/**
 * Modale de confirmation : paramètres compte (nom, e-mail, mot de passe).
 */
(function (global) {
    'use strict';

    var ICONS = {
        success: '<i class="fa-solid fa-circle-check" aria-hidden="true"></i>',
        pending: '<i class="fa-solid fa-envelope-circle-check" aria-hidden="true"></i>',
        error: '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i>',
    };

    var TONES = ['success', 'pending', 'error'];

    function modal() {
        return document.getElementById('portal-account-settings-confirm-modal');
    }

    function closeModal(dialog) {
        if (dialog && dialog.open && typeof dialog.close === 'function') {
            dialog.close();
        }
    }

    function bindOnce(dialog) {
        if (!dialog || dialog.getAttribute('data-settings-confirm-bound') === '1') {
            return;
        }
        dialog.setAttribute('data-settings-confirm-bound', '1');
        dialog.querySelectorAll('[data-settings-confirm-close], [data-settings-confirm-ok]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeModal(dialog);
            });
        });
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog) {
                closeModal(dialog);
            }
        });
        dialog.addEventListener('cancel', function (event) {
            event.preventDefault();
            closeModal(dialog);
        });
    }

    function show(options) {
        var opts = options || {};
        var dialog = modal();
        if (!dialog) {
            window.alert(opts.message || opts.title || 'OK');
            return;
        }
        bindOnce(dialog);

        var tone = opts.tone || 'success';
        if (TONES.indexOf(tone) === -1) {
            tone = 'success';
        }

        var iconEl = dialog.querySelector('[data-settings-confirm-icon]');
        var titleEl = dialog.querySelector('[data-settings-confirm-title]');
        var messageEl = dialog.querySelector('[data-settings-confirm-message]');
        var okBtn = dialog.querySelector('[data-settings-confirm-ok]');

        if (iconEl) {
            iconEl.className = 'portal-account-settings-confirm-icon portal-account-settings-confirm-icon--' + tone;
            iconEl.innerHTML = ICONS[tone] || ICONS.success;
        }
        if (titleEl) {
            titleEl.textContent = opts.title || 'Modification enregistrée';
        }
        if (messageEl) {
            messageEl.textContent = opts.message || '';
        }
        if (okBtn) {
            okBtn.textContent = opts.okLabel || 'OK';
        }

        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        }
    }

    function fallbackAlert(message) {
        window.alert(message);
    }

    global.CapsulePortalSettingsConfirm = {
        show: show,
        nameUpdated: function () {
            show({
                tone: 'success',
                title: 'Nom mis à jour',
                message: 'Votre nom affiché a été enregistré.',
            });
        },
        emailPending: function (message) {
            show({
                tone: 'pending',
                title: 'Confirmation envoyée',
                message: message || 'Un e-mail de confirmation a été envoyé à la nouvelle adresse pour valider le changement.',
            });
        },
        passwordUpdated: function () {
            show({
                tone: 'success',
                title: 'Mot de passe mis à jour',
                message: 'Votre nouveau mot de passe est actif. Utilisez-le lors de votre prochaine connexion.',
            });
        },
        error: function (message) {
            show({
                tone: 'error',
                title: 'Modification impossible',
                message: message || 'Une erreur est survenue. Réessayez dans un instant.',
            });
        },
        alertError: function (message) {
            if (modal()) {
                this.error(message);
                return;
            }
            fallbackAlert(message);
        },
        classroomCreated: function (name) {
            show({
                tone: 'success',
                title: 'Classe créée',
                message: name
                    ? 'La classe « ' + name + ' » est prête. Partagez le lien d\'invitation à vos élèves.'
                    : 'Votre classe est prête. Partagez le lien d\'invitation à vos élèves.',
            });
        },
        classroomUpdated: function (name) {
            show({
                tone: 'success',
                title: 'Classe mise à jour',
                message: name
                    ? 'Les paramètres de la classe « ' + name + ' » ont été enregistrés.'
                    : 'Les paramètres de la classe ont été enregistrés.',
            });
        },
        classroomDeleted: function (name) {
            show({
                tone: 'success',
                title: 'Classe supprimée',
                message: name
                    ? 'La classe « ' + name + ' » a été supprimée.'
                    : 'La classe a été supprimée.',
            });
        },
    };
}(typeof window !== 'undefined' ? window : globalThis));
