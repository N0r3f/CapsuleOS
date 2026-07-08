<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$homeHref = portal_entry('index.php') . ($ctx->isLoggedIn() ? '' : '#acceuil');
$assetBase = portal_asset('usr/share/capsuleos/assets/images/common/capsule.webp');
$indexBase = portal_entry('index.php');
?>
<header class="header">
    <nav class="header-bar" aria-label="Navigation globale">
        <div class="header-brand">
            <a class="header-home" href="<?= $ctx->e($homeHref) ?>" title="Accueil">
                <img class="header-home-icon" src="<?= $ctx->e($assetBase) ?>" alt="Logo de La Capsule">
                <span class="header-home-label">CapsuleOS</span>
            </a>
        </div>

        <button type="button" class="header-menu-toggle" aria-expanded="false" aria-controls="header-mobile-menu" id="header-menu-toggle">
            <span class="sr-only">Ouvrir le menu</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>

        <div class="header-nav-desktop">
            <div class="header-nav-items">
                <div class="header-nav-links" aria-label="Sections du site">
                    <a class="header-nav-link" href="<?= $ctx->e($indexBase) ?>#a-propos">À propos</a>
                    <a class="header-nav-link" href="<?= $ctx->e($indexBase) ?>#offres">Offres</a>
                    <a class="header-nav-link" href="<?= $ctx->e($indexBase) ?>#parcours">Parcours</a>
                    <a class="header-nav-link" href="<?= $ctx->e($indexBase) ?>#choisir-os">Systèmes</a>
                </div>
                <div class="header-nav-utils">
                    <button type="button" class="header-nav-link header-a11y-toggle" id="header-a11y-toggle" data-a11y-panel-toggle aria-expanded="false" aria-controls="a11y-panel" aria-label="Accessibilité" title="Accessibilité">
                        Accessibilité
                    </button>
                    <div class="header-auth">
                        <?php if ($ctx->isLoggedIn()) : ?>
                            <?php include CAPSULE_PORTAL_VIEWS . '/partials/header-user-menu.php'; ?>
                        <?php else : ?>
                            <?php include CAPSULE_PORTAL_VIEWS . '/partials/header-login-btn.php'; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <?php include CAPSULE_PORTAL_VIEWS . '/partials/header-mobile-menu.php'; ?>
</header>
<?php include CAPSULE_PORTAL_VIEWS . '/partials/a11y-panel.php'; ?>
<?php include CAPSULE_PORTAL_VIEWS . '/partials/header-login-trigger.php'; ?>
