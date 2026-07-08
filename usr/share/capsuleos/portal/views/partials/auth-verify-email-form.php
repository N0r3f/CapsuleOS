<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\Csrf;

$email = (string) ($ctx->extra['email'] ?? '');
$error = (string) ($ctx->extra['error'] ?? '');
$devCode = (string) ($ctx->extra['devCode'] ?? '');
$devCreds = Config::allowsLocalPreview() ? Config::devCredentials() : null;
?>
<?php if ($error !== '') : ?>
    <p class="portal-auth-error" role="alert"><?= $ctx->e($error) ?></p>
<?php endif; ?>
<p class="portal-verify-lead">Saisissez le code à 6 chiffres envoyé à <strong><?= $ctx->e($email) ?></strong>.</p>
<?php if ($devCreds !== null && $devCode !== '') : ?>
    <p class="portal-login-dev-notice">Mode dev - code : <code><?= $ctx->e($devCode) ?></code></p>
<?php endif; ?>
<form class="portal-form" method="post" action="<?= $ctx->e(portal_entry('verify-email.php')) ?>">
    <?= Csrf::input() ?>
    <label class="portal-field">
        <span class="portal-label">Adresse e-mail</span>
        <input class="portal-input" type="email" name="email" required autocomplete="email" value="<?= $ctx->e($email) ?>" readonly>
    </label>
    <label class="portal-field">
        <span class="portal-label">Code de vérification</span>
        <input class="portal-input portal-input--code" type="text" name="code" required autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" minlength="6" placeholder="000000"<?= $devCode !== '' ? ' value="' . $ctx->e($devCode) . '"' : '' ?>>
    </label>
    <button class="portal-submit" type="submit">Activer mon compte</button>
</form>
