<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\Csrf;

$devCreds = Config::allowsLocalPreview() ? Config::devCredentials() : null;
$adminPath = Config::contracts() . '/portal-admin.json';
$adminSeedEmail = 'admin@capsuleos.local';
if (is_file($adminPath)) {
    $adminJson = json_decode((string) file_get_contents($adminPath), true);
    if (is_array($adminJson['seedDevAdmin'] ?? null)) {
        $adminSeedEmail = (string) ($adminJson['seedDevAdmin']['email'] ?? $adminSeedEmail);
    }
}
$emailValue = (string) ($ctx->extra['email'] ?? ($devCreds ? $adminSeedEmail : ''));
?>
<p class="portal-account-panel-lead">Accès réservé aux comptes administrateur.</p>
<form class="portal-form" method="post" action="<?= $ctx->e(portal_admin_paths()['login']) ?>">
    <?= Csrf::input() ?>
    <?php if ($devCreds !== null) : ?>
        <p class="portal-login-dev-notice">Connexion admin uniquement (séparée du portail) : <code><?= $ctx->e($adminSeedEmail) ?></code> / <code><?= $ctx->e($devCreds['defaultPassword']) ?></code></p>
    <?php endif; ?>
    <label class="portal-field">
        <span class="portal-label">Adresse e-mail</span>
        <input class="portal-input" type="email" name="email" required autocomplete="username" value="<?= $ctx->e($emailValue) ?>">
    </label>
    <label class="portal-field">
        <span class="portal-label">Mot de passe</span>
        <input class="portal-input" type="password" name="password" required autocomplete="current-password"<?= $devCreds ? ' value="' . $ctx->e($devCreds['defaultPassword']) . '"' : '' ?>>
    </label>
    <button class="portal-submit" type="submit">Connexion administrateur</button>
</form>
