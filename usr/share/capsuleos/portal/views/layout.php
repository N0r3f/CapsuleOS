<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$bodyClass = $ctx->extra['bodyClass'] ?? '';
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
    <script src="<?= $asset('usr/lib/capsuleos/core/capsule-a11y-bootstrap.js') ?>"></script>
</head>
<body<?= $bodyClass !== '' ? ' class="' . $ctx->e($bodyClass) . '"' : '' ?>>
    <main>
        <?php include CAPSULE_PORTAL_VIEWS . '/partials/content-home.php'; ?>
    </main>
    <?php include CAPSULE_PORTAL_VIEWS . '/partials/footer.php'; ?>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-site-home.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/core/capsule-a11y.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/a11y-panel.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/core/browser-capabilities.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/capsule-pick-return.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/header-nav.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-login-modal.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-password-fields.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-parcours.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/pick-os.js') ?>"></script>
    <script>
        if (
            'serviceWorker' in navigator
            && location.protocol !== 'file:'
            && !window.CapsuleBrowserCapabilities?.capabilities?.fileProtocolEmbed
        ) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js').catch(() => {});
            });
        }
    </script>
</body>
</html>
