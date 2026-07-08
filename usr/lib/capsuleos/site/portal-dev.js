/**
 * Portail dev (index.html) — connexion uniquement via API PHP (make init + make dev).
 */
(function () {
    'use strict';

    var DEV_EMAIL = window.CAPSULE_PORTAL_DEV_EMAIL || window.CAPSULE_PORTAL_DEV_USER || 'abonne@capsuleos.local';
    var DEV_DISPLAY_NAME = window.CAPSULE_PORTAL_DEV_DISPLAY_NAME || 'Abonné';
    var DEV_PASSWORD = window.CAPSULE_PORTAL_DEV_PASSWORD || 'test123456789';
    var LOGIN_FAILURE_MSG = window.CAPSULE_PORTAL_LOGIN_FAILURE_MSG
        || 'Connexion impossible. Vérifiez vos identifiants et réessayez.';
    var LEGACY_SESSION_KEY = 'capsule_portal_dev_session';
    var LEGACY_ACCOUNT_KEY = 'capsule_portal_dev_account';
    var HOME_URL = './index.html';
    var ACCOUNT_PHP_URL = '/portal/account.php';
    var AUTH_API = '/portal/api/auth.php';

    var backendAvailable = false;
    var backendUser = null;
    var backendCsrf = '';

    function clearFictionalAuth() {
        try {
            sessionStorage.removeItem(LEGACY_SESSION_KEY);
            localStorage.removeItem(LEGACY_ACCOUNT_KEY);
        } catch (_) {
            // ignore
        }
    }

    function devDisplayName() {
        if (backendUser) {
            return backendUser.displayName || backendUser.email || DEV_DISPLAY_NAME;
        }
        return DEV_DISPLAY_NAME;
    }

    function isAccountPage() {
        return /(?:^|\/)account\.html$/i.test(window.location.pathname);
    }

    function isLoggedIn() {
        return Boolean(backendAvailable && backendUser);
    }

    function logout() {
        if (!backendAvailable || !backendCsrf) {
            window.location.href = HOME_URL;
            return;
        }
        fetch(AUTH_API, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': backendCsrf },
            body: JSON.stringify({ action: 'logout', _csrf: backendCsrf }),
        }).finally(function () {
            backendUser = null;
            window.location.href = HOME_URL;
        });
    }

    function syncAccountLinks() {
        document.querySelectorAll('a[href="./account.html"], a[href="account.html"], a[href="/account.html"]').forEach(function (link) {
            link.setAttribute('href', ACCOUNT_PHP_URL);
        });
    }

    function syncBackendBanner() {
        var banner = document.getElementById('portal-backend-offline');
        if (!banner) {
            return;
        }
        banner.hidden = backendAvailable;
    }

    function redirectAfterAuth() {
        window.location.href = ACCOUNT_PHP_URL;
    }

    function syncAuthUi() {
        var loggedIn = isLoggedIn();
        var label = devDisplayName();
        document.querySelectorAll('[data-portal-auth-guest]').forEach(function (el) {
            el.hidden = loggedIn;
        });
        document.querySelectorAll('[data-portal-auth-user]').forEach(function (el) {
            el.hidden = !loggedIn;
        });
        document.querySelectorAll('[data-portal-auth-username], .header-user-menu-name, .header-mobile-user-name').forEach(function (el) {
            el.textContent = label;
        });
        document.querySelectorAll('[data-portal-account-email]').forEach(function (el) {
            el.textContent = backendUser ? (backendUser.email || '') : '';
        });
        document.querySelectorAll('[data-portal-account-name]').forEach(function (el) {
            el.textContent = label;
        });
        syncAccountLinks();
        syncBackendBanner();
        document.querySelectorAll('[data-portal-dev-only]').forEach(function (el) {
            el.hidden = !backendAvailable;
        });
        if (isAccountPage()) {
            window.location.replace(backendAvailable ? ACCOUNT_PHP_URL : HOME_URL);
        }
    }

    function authGet(action) {
        return fetch(AUTH_API + '?action=' + encodeURIComponent(action), { credentials: 'include' })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('backend unavailable');
                }
                return res.json();
            });
    }

    function authPost(body) {
        return fetch(AUTH_API, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': body._csrf || backendCsrf,
            },
            body: JSON.stringify(body),
        }).then(function (res) {
            return res.json().then(function (data) {
                if (!res.ok) {
                    var err = new Error(data.error || LOGIN_FAILURE_MSG);
                    err.payload = data;
                    throw err;
                }
                return data;
            });
        });
    }

    function openVerifyModal(email, options) {
        if (window.CapsulePortalAuthModal && typeof window.CapsulePortalAuthModal.openVerify === 'function') {
            window.CapsulePortalAuthModal.openVerify(email, options || {});
            return;
        }
        var modal = document.getElementById('portal-login-modal');
        if (modal && typeof modal.showModal === 'function') {
            modal.showModal();
        }
    }

    function probeBackend() {
        return authGet('session').then(function (data) {
            backendAvailable = true;
            backendCsrf = data.csrf || '';
            clearFictionalAuth();
            if (data.loggedIn && data.user) {
                backendUser = data.user;
            }
            window.CAPSULE_PORTAL_BACKEND = true;
            syncAuthUi();
        }).catch(function () {
            backendAvailable = false;
            backendUser = null;
            window.CAPSULE_PORTAL_BACKEND = false;
            syncAuthUi();
        });
    }

    document.querySelectorAll('[data-portal-dev-logout]').forEach(function (btn) {
        btn.addEventListener('click', logout);
    });

    document.querySelectorAll('[data-portal-dev-stub]').forEach(function (el) {
        if (el.closest('[data-portal-account-dev]')) {
            return;
        }
        el.addEventListener('click', function (event) {
            if (backendAvailable) {
                return;
            }
            event.preventDefault();
            window.alert('Backend PHP indisponible. Lancez make init puis make dev.');
        });
    });

    function getLoginErrorEl() {
        return document.getElementById('portal-login-error');
    }

    function showLoginError(message) {
        var errorEl = getLoginErrorEl();
        if (!errorEl) {
            return;
        }
        errorEl.textContent = message || LOGIN_FAILURE_MSG;
        errorEl.hidden = false;
    }

    function hideLoginError() {
        var errorEl = getLoginErrorEl();
        if (!errorEl) {
            return;
        }
        errorEl.hidden = true;
    }

    function hideRegisterError() {
        var errorEl = document.getElementById('portal-register-error');
        if (errorEl) {
            errorEl.hidden = true;
        }
    }

    function showRegisterError(message) {
        var errorEl = document.getElementById('portal-register-error');
        if (!errorEl) {
            window.alert(message || 'Inscription impossible.');
            return;
        }
        errorEl.textContent = message || 'Inscription impossible.';
        errorEl.hidden = false;
        if (window.CapsulePortalAuthModal && typeof window.CapsulePortalAuthModal.open === 'function') {
            window.CapsulePortalAuthModal.open('register', { keepLoginError: true });
        }
    }

    function syncDevLoginForm() {
        var loginForm = document.getElementById('portal-login-form-dev');
        if (!loginForm) {
            return;
        }
        var emailInput = loginForm.querySelector('[name="email"]');
        var passwordInput = loginForm.querySelector('[name="password"]');
        if (emailInput && !emailInput.value) {
            emailInput.value = DEV_EMAIL;
        }
        if (passwordInput && !passwordInput.value) {
            passwordInput.value = DEV_PASSWORD;
        }
        document.querySelectorAll('[data-portal-dev-cred="email"]').forEach(function (el) {
            el.textContent = DEV_EMAIL;
        });
        document.querySelectorAll('[data-portal-dev-cred="password"]').forEach(function (el) {
            el.textContent = DEV_PASSWORD;
        });
    }

    function bindLoginForm() {
        var loginForm = document.getElementById('portal-login-form-dev');
        if (!loginForm) {
            return;
        }
        var emailInput = loginForm.querySelector('[name="email"]');
        var passwordInput = loginForm.querySelector('[name="password"]');
        loginForm.addEventListener('input', hideLoginError);
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!backendAvailable) {
                showLoginError('Backend indisponible. Lancez make init puis make dev.');
                return;
            }
            var email = emailInput ? String(emailInput.value).trim() : '';
            var password = passwordInput ? String(passwordInput.value) : '';
            authGet('csrf').then(function (csrfData) {
                backendCsrf = csrfData.csrf || backendCsrf;
                return authPost({
                    action: 'login',
                    email: email,
                    password: password,
                    _csrf: backendCsrf,
                });
            }).then(function (data) {
                backendUser = data.user || null;
                hideLoginError();
                syncAuthUi();
                var modal = document.getElementById('portal-login-modal');
                if (modal && modal.open && typeof modal.close === 'function') {
                    modal.close();
                }
                redirectAfterAuth();
            }).catch(function (err) {
                if (err.payload && err.payload.emailNotVerified) {
                    hideLoginError();
                    openVerifyModal(err.payload.email || email, { error: err.message });
                    return;
                }
                showLoginError(err.message);
                if (emailInput) {
                    emailInput.focus();
                }
            });
        });
    }

    function bindRegisterForm() {
        var registerForm = document.getElementById('portal-register-form-dev');
        if (!registerForm) {
            return;
        }
        registerForm.addEventListener('input', hideRegisterError);
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            hideRegisterError();
            if (!backendAvailable) {
                showRegisterError('Backend indisponible. Lancez make init puis make dev.');
                return;
            }
            if (!registerForm.checkValidity()) {
                registerForm.reportValidity();
                return;
            }
            var displayNameInput = registerForm.querySelector('[name="display_name"]');
            var emailInput = registerForm.querySelector('[name="email"]');
            var passwordInput = registerForm.querySelector('[name="password"]');
            var passwordConfirmInput = registerForm.querySelector('[name="password_confirm"]');
            var privacyInput = registerForm.querySelector('[name="privacy_consent"]');
            authGet('csrf').then(function (csrfData) {
                backendCsrf = csrfData.csrf || backendCsrf;
                return authPost({
                    action: 'register',
                    displayName: displayNameInput ? String(displayNameInput.value).trim() : '',
                    email: emailInput ? String(emailInput.value).trim() : '',
                    password: passwordInput ? String(passwordInput.value) : '',
                    passwordConfirm: passwordConfirmInput ? String(passwordConfirmInput.value) : '',
                    privacyConsent: privacyInput ? privacyInput.checked : true,
                    _csrf: backendCsrf,
                });
            }).then(function (data) {
                hideRegisterError();
                openVerifyModal(data.email || (emailInput ? String(emailInput.value).trim() : ''), {
                    devCode: data.devCode || null,
                });
            }).catch(function (err) {
                showRegisterError(err.message || 'Inscription impossible.');
            });
        });
    }

    function bindVerifyForm() {
        var verifyForm = document.getElementById('portal-verify-form-dev') || document.getElementById('portal-verify-form');
        if (!verifyForm) {
            return;
        }
        verifyForm.addEventListener('submit', function (event) {
            if (!backendAvailable) {
                return;
            }
            event.preventDefault();
            var emailInput = verifyForm.querySelector('[name="email"]') || document.getElementById('portal-verify-email');
            var codeInput = verifyForm.querySelector('[name="code"]') || document.getElementById('portal-verify-code');
            authGet('csrf').then(function (csrfData) {
                backendCsrf = csrfData.csrf || backendCsrf;
                return authPost({
                    action: 'verify_email',
                    email: emailInput ? String(emailInput.value).trim() : '',
                    code: codeInput ? String(codeInput.value).trim() : '',
                    _csrf: backendCsrf,
                });
            }).then(function (data) {
                backendUser = data.user || null;
                syncAuthUi();
                var modal = document.getElementById('portal-login-modal');
                if (modal && modal.open && typeof modal.close === 'function') {
                    modal.close();
                }
                redirectAfterAuth();
            }).catch(function (err) {
                var verifyError = document.getElementById('portal-verify-error');
                if (verifyError) {
                    verifyError.textContent = err.message || 'Vérification impossible.';
                    verifyError.hidden = false;
                } else {
                    window.alert(err.message || 'Vérification impossible.');
                }
            });
        });
    }

    probeBackend().then(function () {
        syncDevLoginForm();
        bindLoginForm();
        bindRegisterForm();
        bindVerifyForm();
    });
}());
