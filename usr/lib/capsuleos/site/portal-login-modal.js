/**
 * Modale portail — connexion / inscription (bascule in-modal).
 */
'use strict';
(function () {
    const modal = document.getElementById('portal-login-modal');
    const closeBtn = document.getElementById('portal-login-modal-close');
    const mobileMenu = document.getElementById('header-mobile-menu');
    const titleEl = document.getElementById('portal-login-modal-title');

    if (!modal) {
        return;
    }

    const openButtons = [
        document.getElementById('header-login-btn'),
        document.getElementById('header-mobile-login-btn'),
    ].filter(Boolean);

    const VIEW_LABELS = {
        login: 'Connexion',
        register: 'Créer un compte',
        verify: 'Vérifier votre e-mail',
    };

    const loginErrorEl = document.getElementById('portal-login-error');
    const registerErrorEl = document.getElementById('portal-register-error');

    const hideLoginError = () => {
        if (loginErrorEl) {
            loginErrorEl.hidden = true;
        }
    };

    const hideRegisterError = () => {
        if (registerErrorEl) {
            registerErrorEl.hidden = true;
        }
    };

    const switchView = (view) => {
        const target = VIEW_LABELS[view] ? view : 'login';
        modal.querySelectorAll('[data-portal-modal-view]').forEach((panel) => {
            panel.hidden = panel.getAttribute('data-portal-modal-view') !== target;
        });
        if (titleEl) {
            titleEl.textContent = VIEW_LABELS[target];
        }
        modal.setAttribute('data-active-view', target);
        if (target !== 'login') {
            hideLoginError();
        }
        if (target !== 'register') {
            hideRegisterError();
        }
        if (window.CapsulePortalPasswordFields) {
            window.CapsulePortalPasswordFields.enhance(modal);
        }
        if (target === 'verify') {
            const codeInput = modal.querySelector('#portal-verify-code');
            if (codeInput) {
                requestAnimationFrame(() => codeInput.focus());
            }
        }
    };

    const closeMobileMenu = () => {
        if (mobileMenu && mobileMenu.open) {
            mobileMenu.close();
            const toggle = document.getElementById('header-menu-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        }
    };

    const openModal = (view, options = {}) => {
        closeMobileMenu();
        const initial = view || modal.getAttribute('data-open-view') || 'login';
        switchView(initial);
        if (!options.keepLoginError) {
            hideLoginError();
        }
        if (typeof modal.showModal === 'function') {
            modal.showModal();
        }
    };

    const openVerifyView = (email, options = {}) => {
        const emailInput = modal.querySelector('#portal-verify-email');
        const emailDisplay = modal.querySelector('#portal-verify-email-display');
        if (emailInput) {
            emailInput.value = email || '';
        }
        if (emailDisplay) {
            emailDisplay.textContent = email || '';
        }
        if (options.devCode) {
            const devWrap = modal.querySelector('#portal-verify-dev-code-wrap');
            const devCodeEl = modal.querySelector('#portal-verify-dev-code');
            if (devWrap) {
                devWrap.hidden = false;
            }
            if (devCodeEl) {
                devCodeEl.textContent = String(options.devCode);
            }
            const codeInput = modal.querySelector('#portal-verify-code');
            if (codeInput) {
                codeInput.value = String(options.devCode);
            }
        }
        if (options.error) {
            const verifyError = modal.querySelector('#portal-verify-error');
            if (verifyError) {
                verifyError.textContent = String(options.error);
                verifyError.hidden = false;
            }
        }
        openModal('verify', options);
    };

    window.CapsulePortalAuthModal = {
        open: openModal,
        openVerify: openVerifyView,
        switchView,
    };

    const closeModal = () => {
        if (modal.open) {
            modal.close();
        }
        switchView('login');
    };

    openButtons.forEach((btn) => {
        btn.addEventListener('click', () => openModal('login'));
    });

    document.addEventListener('click', (event) => {
        const authTrigger = event.target.closest('[data-portal-auth-modal]');
        if (authTrigger) {
            event.preventDefault();
            openModal(authTrigger.getAttribute('data-portal-auth-modal'));
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    modal.addEventListener('click', (event) => {
        const switchBtn = event.target.closest('[data-portal-modal-switch]');
        if (!switchBtn) {
            return;
        }
        event.preventDefault();
        switchView(switchBtn.getAttribute('data-portal-modal-switch'));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.open) {
            closeModal();
        }
    });

    if (modal.hasAttribute('data-open-on-load')) {
        requestAnimationFrame(() => openModal(undefined, { keepLoginError: true }));
    }

    const resendBtn = document.getElementById('portal-verify-resend');
    if (resendBtn && resendBtn.dataset.verifyResendBound !== '1') {
        resendBtn.dataset.verifyResendBound = '1';
        resendBtn.addEventListener('click', async () => {
            const emailInput = document.getElementById('portal-verify-email');
            const email = emailInput ? String(emailInput.value).trim() : '';
            if (!email) {
                return;
            }
            try {
                const csrfRes = await fetch('/portal/api/auth.php?action=csrf', { credentials: 'include' });
                const csrfData = await csrfRes.json();
                const res = await fetch('/portal/api/auth.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfData.csrf || '',
                    },
                    body: JSON.stringify({
                        action: 'resend_verification',
                        email,
                        _csrf: csrfData.csrf || '',
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Envoi impossible.');
                }
                if (data.devCode) {
                    const devWrap = document.getElementById('portal-verify-dev-code-wrap');
                    const devCodeEl = document.getElementById('portal-verify-dev-code');
                    const codeInput = document.getElementById('portal-verify-code');
                    if (devWrap) {
                        devWrap.hidden = false;
                    }
                    if (devCodeEl) {
                        devCodeEl.textContent = String(data.devCode);
                    }
                    if (codeInput) {
                        codeInput.value = String(data.devCode);
                    }
                }
            } catch (error) {
                const verifyError = document.getElementById('portal-verify-error');
                if (verifyError) {
                    verifyError.textContent = error instanceof Error ? error.message : 'Envoi impossible.';
                    verifyError.hidden = false;
                }
            }
        });
    }
}());
