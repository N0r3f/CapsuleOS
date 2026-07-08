<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\Csrf;

$devCreds = Config::allowsLocalPreview() ? Config::devCredentials() : null;
$emailValue = (string) ($ctx->extra['email'] ?? ($devCreds ? $devCreds['defaultEmail'] : ''));
$joinPending = !empty($ctx->extra['joinPending']);
?>
<?php if ($joinPending) : ?>
    <p class="portal-account-panel-lead" role="status">Connectez-vous pour rejoindre la classe à laquelle vous avez été invité.</p>
<?php endif; ?>
<form class="portal-form" method="post" action="<?= $ctx->e(portal_entry('login.php')) ?>">
    <?= Csrf::input() ?>
    <?php if ($devCreds !== null) : ?>
        <p class="portal-login-dev-notice">Profil test : <code><?= $ctx->e($devCreds['defaultEmail']) ?></code> / <code><?= $ctx->e($devCreds['defaultPassword']) ?></code> (préremplis).</p>
    <?php endif; ?>
    <label class="portal-field">
        <span class="portal-label">Adresse e-mail</span>
        <input class="portal-input" type="email" name="email" required autocomplete="email" value="<?= $ctx->e($emailValue) ?>">
    </label>
    <label class="portal-field">
        <span class="portal-label">Mot de passe</span>
        <input class="portal-input" type="password" name="password" required autocomplete="current-password"<?= $devCreds ? ' value="' . $ctx->e($devCreds['defaultPassword']) . '"' : '' ?>>
    </label>
    <button class="portal-submit" type="submit">Se connecter</button>
</form>
<p class="portal-auth-switch">Pas encore de compte ? <a href="<?= $ctx->e(portal_entry('register.php')) ?>">Créer un compte</a></p>
<p class="portal-auth-switch"><a href="<?= $ctx->e(portal_entry('index.php')) ?>">Retour à l'accueil</a></p>
