<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Http\Csrf;

$token = (string) ($ctx->extra['token'] ?? '');
$error = (string) ($ctx->extra['error'] ?? '');
$guest = !empty($ctx->extra['guest']);
$invitePreview = is_array($ctx->extra['invitePreview'] ?? null) ? $ctx->extra['invitePreview'] : null;
$inviteExpired = $invitePreview !== null && !empty($invitePreview['expired']);
$canJoin = !$guest && $token !== '' && $invitePreview !== null && !$inviteExpired;
?>
<?php if ($token === '') : ?>
    <p class="portal-auth-error" role="alert">Lien d'invitation manquant ou invalide.</p>
<?php elseif ($invitePreview === null) : ?>
    <p class="portal-auth-error" role="alert">Invitation invalide ou lien incorrect.</p>
<?php else : ?>
    <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-join-class-invite-card.php'; ?>

    <?php if ($guest) : ?>
        <?php if (!$inviteExpired) : ?>
        <section class="portal-join-class-auth" aria-labelledby="portal-join-class-auth-title">
            <h3 class="portal-join-class-auth-title" id="portal-join-class-auth-title">Connexion requise</h3>
            <p class="portal-account-panel-lead">Connectez-vous ou créez un compte pour rejoindre cette classe.</p>
            <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-login-form.php'; ?>
            <p class="portal-auth-switch">Pas encore de compte ? <a href="<?= $ctx->e(portal_entry('register.php')) ?>">Créer un compte</a></p>
        </section>
        <?php elseif ($error === '') : ?>
            <p class="portal-auth-error" role="alert">Cette invitation n'est plus valide. Demandez un nouveau lien à votre professeur.</p>
        <?php endif; ?>
    <?php elseif ($canJoin) : ?>
        <p class="portal-account-panel-lead">Confirmez pour rejoindre cette classe.</p>
        <form class="portal-form" method="post" action="<?= $ctx->e(portal_entry('join-class.php') . '?token=' . rawurlencode($token)) ?>">
            <?= Csrf::input() ?>
            <input type="hidden" name="token" value="<?= $ctx->e($token) ?>">
            <button class="portal-submit" type="submit">Rejoindre la classe</button>
        </form>
    <?php elseif ($inviteExpired && $error === '') : ?>
        <p class="portal-auth-error" role="alert">Cette invitation n'est plus valide. Demandez un nouveau lien à votre professeur.</p>
    <?php endif; ?>

    <?php if ($error !== '') : ?>
        <p class="portal-auth-error" role="alert"><?= $ctx->e($error) ?></p>
    <?php endif; ?>
<?php endif; ?>
