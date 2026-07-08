<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$error = (string) ($ctx->extra['error'] ?? '');
$asset = static fn (string $path): string => portal_asset($path);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="/">
    <link rel="shortcut icon" href="<?= $asset('usr/share/capsuleos/assets/images/common/capsule.webp') ?>" type="image/x-icon">
    <link rel="stylesheet" href="<?= $asset('usr/share/capsuleos/themes/portal/imports.css') ?>">
    <link rel="stylesheet" href="<?= $asset('usr/share/capsuleos/themes/portal/style.css') ?>">
    <title><?= $ctx->e($ctx->pageTitle) ?></title>
</head>
<body class="portal-auth portal-admin-gate">
    <main class="portal-admin-gate-main">
        <div class="portal-auth-wrap portal-admin-gate-wrap">
            <section class="portal-auth-card portal-admin-gate-card" aria-labelledby="admin-gate-title">
                <p class="portal-admin-gate-eyebrow">CapsuleOS</p>
                <h1 class="portal-auth-title" id="admin-gate-title"><?= $ctx->e((string) ($ctx->extra['heading'] ?? 'Connexion administrateur')) ?></h1>
                <?php if ($error !== '') : ?>
                    <p class="portal-auth-error" role="alert"><?= $ctx->e($error) ?></p>
                <?php endif; ?>
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/' . ($ctx->extra['authPartial'] ?? 'auth-admin-login-form.php'); ?>
            </section>
        </div>
    </main>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-password-fields.js') ?>"></script>
</body>
</html>
