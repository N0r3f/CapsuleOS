/**
 * Champs mot de passe portail — affichage/masquage et indicateur de robustesse.
 */
(function () {
    'use strict';

    var STRENGTH_LABELS = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];

    function minLengthFor(input) {
        var fromInput = parseInt(input.getAttribute('minlength') || '', 10);
        if (!Number.isNaN(fromInput) && fromInput > 0) {
            return fromInput;
        }
        var form = input.closest('form');
        if (form) {
            var fromForm = parseInt(form.getAttribute('data-portal-min-password') || '', 10);
            if (!Number.isNaN(fromForm) && fromForm > 0) {
                return fromForm;
            }
        }
        return 12;
    }

    function scorePassword(value, minLen) {
        if (!value) {
            return 0;
        }
        var score = 0;
        if (value.length >= minLen) {
            score += 1;
        }
        if (value.length >= minLen + 4) {
            score += 1;
        }
        if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
            score += 1;
        }
        if (/\d/.test(value)) {
            score += 1;
        }
        if (/[^A-Za-z0-9]/.test(value)) {
            score += 1;
        }
        return Math.min(4, score);
    }

    function wrapPasswordInput(input) {
        if (!input || input.dataset.portalPasswordEnhanced === '1') {
            return;
        }
        if (input.closest('.portal-password-wrap')) {
            input.dataset.portalPasswordEnhanced = '1';
            return;
        }
        input.dataset.portalPasswordEnhanced = '1';

        var wrap = document.createElement('div');
        wrap.className = 'portal-password-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'portal-password-toggle';
        toggle.setAttribute('aria-label', 'Afficher le mot de passe');
        toggle.setAttribute('aria-pressed', 'false');
        toggle.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
        toggle.addEventListener('click', function () {
            var visible = input.type === 'text';
            input.type = visible ? 'password' : 'text';
            toggle.setAttribute('aria-pressed', visible ? 'false' : 'true');
            toggle.setAttribute('aria-label', visible ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
            var icon = toggle.querySelector('i');
            if (icon) {
                icon.className = visible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
            }
        });
        wrap.appendChild(toggle);
    }

    function isConfirmPasswordField(input) {
        var name = String(input.getAttribute('name') || '').toLowerCase();
        return name.indexOf('confirm') !== -1;
    }

    function isNewPasswordField(input) {
        return input.getAttribute('autocomplete') === 'new-password';
    }

    function addStrengthMeter(input) {
        if (!isNewPasswordField(input) || isConfirmPasswordField(input)) {
            return;
        }
        if (input.dataset.portalStrengthBound === '1') {
            return;
        }
        input.dataset.portalStrengthBound = '1';

        var field = input.closest('.portal-field') || input.parentElement;
        if (!field) {
            return;
        }
        var minLen = minLengthFor(input);

        var meter = document.createElement('div');
        meter.className = 'portal-password-strength';
        meter.setAttribute('aria-live', 'polite');
        meter.innerHTML = ''
            + '<div class="portal-password-strength-track" aria-hidden="true">'
            + '<span class="portal-password-strength-bar"></span>'
            + '</div>'
            + '<p class="portal-password-strength-label"></p>';
        field.appendChild(meter);

        var bar = meter.querySelector('.portal-password-strength-bar');
        var label = meter.querySelector('.portal-password-strength-label');

        var update = function () {
            var score = scorePassword(input.value, minLen);
            meter.dataset.level = String(score);
            if (bar) {
                bar.style.width = score ? String((score / 4) * 100) + '%' : '0%';
            }
            if (!label) {
                return;
            }
            if (!input.value) {
                label.textContent = 'Au moins ' + minLen + ' caractères.';
                return;
            }
            label.textContent = STRENGTH_LABELS[score] || '';
        };

        input.addEventListener('input', update);
        update();
    }

    function bindPasswordMatch(form) {
        if (!form || form.dataset.portalPasswordMatchBound === '1') {
            return;
        }
        var passwords = Array.prototype.slice.call(form.querySelectorAll('input[type="password"]'));
        var primary = passwords.find(function (input) {
            return isNewPasswordField(input) && !isConfirmPasswordField(input);
        });
        var confirm = passwords.find(function (input) {
            return isConfirmPasswordField(input);
        });
        if (!primary || !confirm) {
            return;
        }
        form.dataset.portalPasswordMatchBound = '1';

        var field = confirm.closest('.portal-field') || confirm.parentElement;
        if (!field) {
            return;
        }
        var hint = document.createElement('p');
        hint.className = 'portal-password-match';
        hint.hidden = true;
        field.appendChild(hint);

        var update = function () {
            if (!confirm.value) {
                hint.hidden = true;
                return;
            }
            if (primary.value === confirm.value) {
                hint.textContent = 'Les mots de passe correspondent.';
                hint.dataset.state = 'ok';
                hint.hidden = false;
                return;
            }
            hint.textContent = 'Les mots de passe ne correspondent pas.';
            hint.dataset.state = 'error';
            hint.hidden = false;
        };

        primary.addEventListener('input', update);
        confirm.addEventListener('input', update);
    }

    function enhance(root) {
        var scope = root || document;
        scope.querySelectorAll('input.portal-input[type="password"]').forEach(function (input) {
            wrapPasswordInput(input);
            addStrengthMeter(input);
        });
        scope.querySelectorAll('form').forEach(bindPasswordMatch);
    }

    window.CapsulePortalPasswordFields = {
        enhance: enhance,
        scorePassword: scorePassword,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            enhance();
        });
    } else {
        enhance();
    }
}());
