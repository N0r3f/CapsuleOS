<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Http\Csrf;
$minLen = AuthService::minPasswordLength();
$joinPending = !empty($ctx->extra['joinPending']);
?>
<?php if ($joinPending) : ?>
    <p class="portal-account-panel-lead" role="status">Créez votre compte pour rejoindre la classe à laquelle vous avez été invité.</p>
<?php endif; ?>
<form class="portal-form" method="post" action="<?= $ctx->e(portal_entry('register.php')) ?>" data-portal-min-password="<?= (int) $minLen ?>">
    <?= Csrf::input() ?>
    <label class="portal-field">
        <span class="portal-label">Adresse e-mail</span>
        <input class="portal-input" type="email" name="email" required autocomplete="email" value="<?= $ctx->e((string) ($ctx->extra['email'] ?? '')) ?>">
    </label>
    <label class="portal-field">
        <span class="portal-label">Nom d'utilisateur</span>
        <input class="portal-input" type="text" name="display_name" required maxlength="60" autocomplete="username" value="<?= $ctx->e((string) ($ctx->extra['display_name'] ?? '')) ?>">
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
<p class="portal-auth-switch">Déjà inscrit ? <a href="<?= $ctx->e(portal_entry('login.php')) ?>">Se connecter</a></p>
<p class="portal-auth-switch"><a href="<?= $ctx->e(portal_entry('index.php')) ?>">Retour à l'accueil</a></p>
