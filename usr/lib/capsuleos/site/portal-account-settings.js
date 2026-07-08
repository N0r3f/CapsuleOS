/**
 * Paramètres compte : affichage lecture puis édition au clic sur Modifier.
 */
(function () {
    'use strict';

    function fieldRoot(node) {
        return node && node.closest ? node.closest('[data-settings-field]') : null;
    }

    function closeField(field, resetForm) {
        if (!field) {
            return;
        }
        var read = field.querySelector('[data-settings-read]');
        var panel = field.querySelector('[data-settings-edit-panel]');
        var form = panel ? panel.querySelector('form') : null;
        if (panel) {
            panel.hidden = true;
        }
        if (read) {
            read.hidden = false;
        }
        if (resetForm && form) {
            form.reset();
        }
    }

    function closeAllFields(exceptField) {
        document.querySelectorAll('[data-settings-field]').forEach(function (field) {
            if (exceptField && field === exceptField) {
                return;
            }
            closeField(field, true);
        });
    }

    function openField(field) {
        if (!field) {
            return;
        }
        closeAllFields(field);
        var read = field.querySelector('[data-settings-read]');
        var panel = field.querySelector('[data-settings-edit-panel]');
        if (read) {
            read.hidden = true;
        }
        if (panel) {
            panel.hidden = false;
            var firstInput = panel.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
            if (window.CapsulePortalPasswordFields) {
                window.CapsulePortalPasswordFields.enhance(panel);
            }
        }
    }

    function bindField(field) {
        if (!field || field.getAttribute('data-settings-field-bound') === '1') {
            return;
        }
        field.setAttribute('data-settings-field-bound', '1');
        var editBtn = field.querySelector('[data-settings-edit]');
        if (editBtn) {
            editBtn.addEventListener('click', function () {
                openField(field);
            });
        }
        field.querySelectorAll('[data-settings-cancel]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeField(field, true);
            });
        });
    }

    function init(root) {
        var scope = root || document;
        scope.querySelectorAll('[data-settings-field]').forEach(bindField);
    }

    window.CapsulePortalAccountSettings = {
        init: init,
        openField: openField,
        closeField: closeField,
        closeAll: closeAllFields,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            init();
        });
    } else {
        init();
    }
}());
