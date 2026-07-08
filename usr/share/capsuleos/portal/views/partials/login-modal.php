<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\Csrf;

$loginError = (string) ($ctx->extra['loginError'] ?? '');
$registerError = (string) ($ctx->extra['registerError'] ?? '');
$registerEmail = (string) ($ctx->extra['registerEmail'] ?? '');
$registerDisplayName = (string) ($ctx->extra['registerDisplayName'] ?? '');
$verifyEmail = (string) ($ctx->extra['verifyEmail'] ?? '');
$verifyError = (string) ($ctx->extra['verifyError'] ?? '');
$verifyDevCode = (string) ($ctx->extra['verifyDevCode'] ?? '');
$devCreds = Config::allowsLocalPreview() ? Config::devCredentials() : null;
$loginEmail = (string) ($ctx->extra['loginEmail'] ?? ($devCreds ? $devCreds['defaultEmail'] : ''));
$openOnLoad = !empty($ctx->extra['openLoginModal']);
$modalView = (string) ($ctx->extra['modalView'] ?? 'login');
if (!in_array($modalView, ['login', 'register', 'verify'], true)) {
    $modalView = 'login';
}
$minLen = AuthService::minPasswordLength();
$modalTitle = match ($modalView) {
    'register' => 'Créer un compte',
    'verify' => 'Vérifier votre e-mail',
    default => 'Connexion',
};
?>
<dialog class="portal-login-modal" id="portal-login-modal" aria-labelledby="portal-login-modal-title"<?= $openOnLoad ? ' data-open-on-load' : '' ?> data-open-view="<?= $ctx->e($modalView) ?>">
    <div class="portal-login-modal-panel">
        <div class="portal-login-modal-head">
            <h2 class="portal-login-modal-title" id="portal-login-modal-title"><?= $ctx->e($modalTitle) ?></h2>
            <button type="button" class="portal-login-modal-close" id="portal-login-modal-close" aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

        <div class="portal-login-modal-view" data-portal-modal-view="login"<?= $modalView !== 'login' ? ' hidden' : '' ?>>
            <p class="portal-auth-error" id="portal-login-error" role="alert"<?= $loginError === '' ? ' hidden' : '' ?>><?= $loginError !== '' ? $ctx->e($loginError) : '' ?></p>
            <?php if ($devCreds !== null && $loginError === '') : ?>
                <p class="portal-login-dev-notice">Profil test : <code><?= $ctx->e($devCreds['defaultEmail']) ?></code> / <code><?= $ctx->e($devCreds['defaultPassword']) ?></code> (préremplis).</p>
            <?php endif; ?>
            <form class="portal-form" method="post" action="<?= $ctx->e(portal_entry('login.php')) ?>">
                <?= Csrf::input() ?>
                <input type="hidden" name="from_modal" value="1">
                <input type="hidden" name="redirect" value="<?= $ctx->e(portal_entry('index.php')) ?>">
                <label class="portal-field">
                    <span class="portal-label">Adresse e-mail</span>
                    <input class="portal-input" type="email" name="email" required autocomplete="email" value="<?= $ctx->e($loginEmail) ?>">
                </label>
                <label class="portal-field">
                    <span class="portal-label">Mot de passe</span>
                    <input class="portal-input" type="password" name="password" required autocomplete="current-password"<?= $devCreds ? ' value="' . $ctx->e($devCreds['defaultPassword']) . '"' : '' ?>>
                </label>
                <button class="portal-submit" type="submit">Se connecter</button>
            </form>
            <p class="portal-auth-switch">Pas encore de compte ? <button type="button" class="portal-auth-switch-btn" data-portal-modal-switch="register">Créer un compte</button></p>
        </div>

        <div class="portal-login-modal-view" data-portal-modal-view="register"<?= $modalView !== 'register' ? ' hidden' : '' ?>>
            <p class="portal-auth-error" id="portal-register-error" role="alert"<?= $registerError === '' ? ' hidden' : '' ?>><?= $registerError !== '' ? $ctx->e($registerError) : '' ?></p>
            <form class="portal-form" method="post" action="<?= $ctx->e(portal_entry('register.php')) ?>" data-portal-min-password="<?= (int) $minLen ?>">
                <?= Csrf::input() ?>
                <input type="hidden" name="from_modal" value="1">
                <label class="portal-field">
                    <span class="portal-label">Adresse e-mail</span>
                    <input class="portal-input" type="email" name="email" required autocomplete="email" value="<?= $ctx->e($registerEmail) ?>">
                </label>
                <label class="portal-field">
                    <span class="portal-label">Nom d'utilisateur</span>
                    <input class="portal-input" type="text" name="display_name" required maxlength="60" autocomplete="username" value="<?= $ctx->e($registerDisplayName) ?>">
                </label>
                <label class="portal-field">
                    <span class="portal-label">Mot de passe (min. <?= (int) $minLen ?> caractères)</span>
                    <input class="portal-input" type="password" name="password" required autocomplete="new-password" minlength="<?= (int) $minLen ?>">
                </label>
                <label class="portal-field">
                    <span class="portal-label">Confirmer le mot de passe</span>
                    <input class="portal-input" type="password" name="password_confirm" required autocomplete="new-password" minlength="<?= (int) $minLen ?>">
                </label>
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/legal-consent-field.php'; ?>
                <button class="portal-submit" type="submit">Créer mon compte</button>
            </form>
            <p class="portal-auth-switch">Déjà inscrit ? <button type="button" class="portal-auth-switch-btn" data-portal-modal-switch="login">Se connecter</button></p>
        </div>

        <div class="portal-login-modal-view" data-portal-modal-view="verify"<?= $modalView !== 'verify' ? ' hidden' : '' ?>>
            <?php if ($verifyError !== '') : ?>
                <p class="portal-auth-error" id="portal-verify-error" role="alert"><?= $ctx->e($verifyError) ?></p>
            <?php else : ?>
                <p class="portal-auth-error" id="portal-verify-error" role="alert" hidden></p>
            <?php endif; ?>
            <p class="portal-verify-lead">Un code à 6 chiffres a été envoyé à <strong id="portal-verify-email-display"><?= $ctx->e($verifyEmail) ?></strong>.</p>
            <?php if ($devCreds !== null && $verifyDevCode !== '') : ?>
                <p class="portal-login-dev-notice">Mode dev - code : <code id="portal-verify-dev-code"><?= $ctx->e($verifyDevCode) ?></code></p>
            <?php else : ?>
                <p class="portal-login-dev-notice" id="portal-verify-dev-code-wrap" hidden>Mode dev - code : <code id="portal-verify-dev-code"></code></p>
            <?php endif; ?>
            <form class="portal-form" id="portal-verify-form" method="post" action="<?= $ctx->e(portal_entry('verify-email.php')) ?>">
                <?= Csrf::input() ?>
                <input type="hidden" name="from_modal" value="1">
                <input type="hidden" name="email" id="portal-verify-email" value="<?= $ctx->e($verifyEmail) ?>">
                <label class="portal-field">
                    <span class="portal-label">Code de vérification</span>
                    <input class="portal-input portal-input--code" type="text" name="code" id="portal-verify-code" required autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" minlength="6" placeholder="000000"<?= $verifyDevCode !== '' ? ' value="' . $ctx->e($verifyDevCode) . '"' : '' ?>>
                </label>
                <button class="portal-submit" type="submit">Activer mon compte</button>
            </form>
            <p class="portal-auth-switch">Code non reçu ? <button type="button" class="portal-auth-switch-btn" id="portal-verify-resend">Renvoyer le code</button></p>
            <p class="portal-auth-switch">Déjà vérifié ? <button type="button" class="portal-auth-switch-btn" data-portal-modal-switch="login">Se connecter</button></p>
        </div>
    </div>
</dialog>
