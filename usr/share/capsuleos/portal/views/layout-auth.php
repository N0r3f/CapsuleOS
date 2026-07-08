<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Http\Csrf;
$error = (string) ($ctx->extra['error'] ?? '');
$asset = static fn (string $path): string => portal_asset($path);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="../">
    <link rel="shortcut icon" href="<?= $asset('usr/share/capsuleos/assets/images/common/capsule.webp') ?>" type="image/x-icon">
    <link rel="stylesheet" href="<?= $asset('usr/share/capsuleos/themes/portal/style.css') ?>">
    <title><?= $ctx->e($ctx->pageTitle) ?></title>
</head>
<body class="portal-auth<?= !empty($ctx->extra['bodyClass']) ? ' ' . $ctx->e((string) $ctx->extra['bodyClass']) : '' ?>">
    <main>
        <?php include CAPSULE_PORTAL_VIEWS . '/partials/header.php'; ?>
        <div class="portal-auth-wrap<?= !empty($ctx->extra['layoutWide']) ? ' portal-auth-wrap--wide' : '' ?>">
            <section class="portal-auth-card" aria-labelledby="auth-title">
                <?php if (empty($ctx->extra['welcomeName'])) : ?>
                <h1 class="portal-auth-title" id="auth-title"><?= $ctx->e((string) ($ctx->extra['heading'] ?? $ctx->pageTitle)) ?></h1>
                <?php endif; ?>
                <?php if ($error !== '' && empty($ctx->extra['errorInPartial'])) : ?>
                    <p class="portal-auth-error" role="alert"><?= $ctx->e($error) ?></p>
                <?php endif; ?>
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/' . ($ctx->extra['authPartial'] ?? 'auth-login-form.php'); ?>
            </section>
        </div>
    </main>
    <?php include CAPSULE_PORTAL_VIEWS . '/partials/footer.php'; ?>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-site-home.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/header-nav.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-login-modal.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-password-fields.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-confirm.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-progress.js') ?>"></script>
    <?php if (($ctx->extra['authPartial'] ?? '') === 'auth-account.php') : ?>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-nav.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-ticket-live.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-subscription-live.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-ticket-composer.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-tickets.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-classroom-live.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-creator.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-modals.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-badge-ui.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-badge-board.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-settings.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account-settings-confirm.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-account.js') ?>"></script>
    <?php endif; ?>
</body>
</html>
