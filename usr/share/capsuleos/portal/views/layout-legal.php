<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$asset = static fn (string $path): string => portal_asset($path);
$legal = is_array($ctx->extra['legal'] ?? null) ? $ctx->extra['legal'] : [];
$pageHeading = (string) ($ctx->extra['pageHeading'] ?? 'Informations légales');
$sections = is_array($legal['sections'] ?? null) ? $legal['sections'] : [];
$controller = is_array($legal['controller'] ?? null) ? $legal['controller'] : [];
$contactEmail = (string) ($controller['contactEmail'] ?? 'contact@lacapsule.org');
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
<body class="portal-auth portal-legal-page">
    <main>
        <?php include CAPSULE_PORTAL_VIEWS . '/partials/header.php'; ?>
        <div class="portal-auth-wrap portal-auth-wrap--wide">
            <article class="portal-legal" aria-labelledby="portal-legal-title">
                <header class="portal-legal-header">
                    <h1 class="portal-legal-title" id="portal-legal-title"><?= $ctx->e($pageHeading) ?></h1>
                    <p class="portal-legal-intro">
                        Transparence sur le traitement de vos données lors de l'utilisation de CapsuleOS
                        (compte, progression, abonnement Abonné). Dernière mise à jour : juin 2026.
                        Contact : <a href="mailto:<?= $ctx->e($contactEmail) ?>"><?= $ctx->e($contactEmail) ?></a>
                    </p>
                    <?php if ($sections !== []) : ?>
                        <nav class="portal-legal-toc" aria-label="Sommaire">
                            <ul class="portal-legal-toc-list">
                                <?php foreach ($sections as $section) :
                                    if (!is_array($section)) {
                                        continue;
                                    }
                                    $id = (string) ($section['id'] ?? '');
                                    ?>
                                <li><a href="#<?= $ctx->e($id) ?>"><?= $ctx->e((string) ($section['title'] ?? '')) ?></a></li>
                                <?php endforeach; ?>
                            </ul>
                        </nav>
                    <?php endif; ?>
                </header>

                <?php foreach ($sections as $section) :
                    if (!is_array($section)) {
                        continue;
                    }
                    $id = (string) ($section['id'] ?? '');
                    $paragraphs = is_array($section['paragraphs'] ?? null) ? $section['paragraphs'] : [];
                    ?>
                <section class="portal-legal-section" id="<?= $ctx->e($id) ?>" aria-labelledby="portal-legal-<?= $ctx->e($id) ?>-title">
                    <h2 class="portal-legal-section-title" id="portal-legal-<?= $ctx->e($id) ?>-title"><?= $ctx->e((string) ($section['title'] ?? '')) ?></h2>
                    <?php foreach ($paragraphs as $paragraph) : ?>
                        <p class="portal-legal-text"><?= $ctx->e((string) $paragraph) ?></p>
                    <?php endforeach; ?>
                </section>
                <?php endforeach; ?>

                <p class="portal-legal-back">
                    <a class="portal-account-btn portal-account-btn--ghost" href="<?= $ctx->e(portal_entry('index.php')) ?>">Retour à l'accueil</a>
                </p>
            </article>
        </div>
    </main>
    <?php include CAPSULE_PORTAL_VIEWS . '/partials/footer.php'; ?>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-site-home.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/header-nav.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-login-modal.js') ?>"></script>
    <script src="<?= $asset('usr/lib/capsuleos/site/portal-password-fields.js') ?>"></script>
</body>
</html>
