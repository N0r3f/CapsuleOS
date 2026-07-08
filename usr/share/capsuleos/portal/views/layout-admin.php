<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Auth\AdminAuthService;

$asset = static fn (string $path): string => portal_asset($path);
$assetVersion = static function (string $path) use ($asset): string {
    $abs = CAPSULE_PORTAL_ROOT . '/' . ltrim($path, '/');
    $v = is_file($abs) ? (string) filemtime($abs) : '1';
    return $asset($path) . '?v=' . rawurlencode($v);
};
$adminUser = AdminAuthService::currentUser();
$adminUserPayload = is_array($adminUser)
    ? [
        'email' => (string) ($adminUser['email'] ?? ''),
        'displayName' => (string) ($adminUser['display_name'] ?? ''),
    ]
    : null;
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="/">
    <link rel="shortcut icon" href="<?= $asset('usr/share/capsuleos/assets/images/common/capsule.webp') ?>" type="image/x-icon">
    <link rel="stylesheet" href="<?= $assetVersion('usr/share/capsuleos/themes/portal/imports.css') ?>">
    <link rel="stylesheet" href="<?= $assetVersion('usr/share/capsuleos/themes/portal/style.css') ?>">
    <title><?= $ctx->e($ctx->pageTitle) ?></title>
</head>
<body class="portal-admin-app">
    <main class="portal-admin-app-main">
        <?php include CAPSULE_PORTAL_VIEWS . '/' . ($ctx->extra['adminPartial'] ?? 'admin/shell.php'); ?>
    </main>
    <script>
        window.CAPSULE_PORTAL_CSRF = <?= json_encode($ctx->csrfToken, JSON_THROW_ON_ERROR) ?>;
        window.CAPSULE_PORTAL_ADMIN_SECTIONS = <?= json_encode($ctx->extra['sections'] ?? [], JSON_THROW_ON_ERROR) ?>;
        window.CAPSULE_PORTAL_ADMIN_USER = <?= json_encode($adminUserPayload, JSON_THROW_ON_ERROR) ?>;
    </script>
    <script src="<?= $assetVersion('usr/lib/capsuleos/site/portal-admin-nav.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-password-fields.js') ?>"></script>
    <script src="<?= $assetVersion('usr/lib/capsuleos/site/portal-ticket-live.js') ?>"></script>
    <script src="<?= $assetVersion('usr/lib/capsuleos/site/portal-subscription-live.js') ?>"></script>
    <script src="<?= $assetVersion('usr/lib/capsuleos/site/portal-ticket-composer.js') ?>"></script>
    <script src="<?= $assetVersion('usr/lib/capsuleos/site/portal-admin.js') ?>"></script>
</body>
</html>
