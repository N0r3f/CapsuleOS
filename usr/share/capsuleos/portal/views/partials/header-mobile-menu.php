<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$indexBase = portal_entry('index.php');
$assetBase = portal_asset('usr/share/capsuleos/assets/images/common/capsule.webp');
?>
<dialog class="header-mobile-menu" id="header-mobile-menu">
    <div class="header-mobile-menu-panel">
        <header class="header-mobile-menu-head">
            <a class="header-home" href="<?= $ctx->e($indexBase) ?>" title="Accueil">
                <img class="header-home-icon" src="<?= $ctx->e($assetBase) ?>" alt="Logo de La Capsule">
                <span class="header-home-label">CapsuleOS</span>
            </a>
            <button type="button" class="header-menu-close" aria-label="Fermer le menu" id="header-menu-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </header>

        <div class="header-mobile-menu-body">
            <nav class="header-mobile-menu-section" aria-label="Sections du site">
                <p class="header-mobile-menu-label" id="header-mobile-nav-label">Navigation</p>
                <ul class="header-mobile-menu-list" aria-labelledby="header-mobile-nav-label">
                    <li>
                        <a class="header-mobile-menu-link" href="<?= $ctx->e($indexBase) ?>#a-propos">
                            <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                            <span>À propos</span>
                        </a>
                    </li>
                    <li>
                        <a class="header-mobile-menu-link" href="<?= $ctx->e($indexBase) ?>#offres">
                            <i class="fa-solid fa-tags" aria-hidden="true"></i>
                            <span>Offres</span>
                        </a>
                    </li>
                    <li>
                        <a class="header-mobile-menu-link" href="<?= $ctx->e($indexBase) ?>#parcours">
                            <i class="fa-solid fa-route" aria-hidden="true"></i>
                            <span>Parcours</span>
                        </a>
                    </li>
                    <li>
                        <a class="header-mobile-menu-link" href="<?= $ctx->e($indexBase) ?>#choisir-os">
                            <i class="fa-solid fa-desktop" aria-hidden="true"></i>
                            <span>Systèmes</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <div class="header-mobile-menu-section">
                <p class="header-mobile-menu-label" id="header-mobile-prefs-label">Préférences</p>
                <ul class="header-mobile-menu-list" aria-labelledby="header-mobile-prefs-label">
                    <li>
                        <button type="button" class="header-mobile-menu-link header-a11y-toggle" id="header-a11y-toggle-mobile" data-a11y-panel-toggle aria-expanded="false" aria-controls="a11y-panel" aria-label="Accessibilité" title="Accessibilité">
                            <i class="fa-solid fa-universal-access" aria-hidden="true"></i>
                            <span>Accessibilité</span>
                        </button>
                    </li>
                </ul>
            </div>

            <?php if ($ctx->isLoggedIn()) : ?>
                <div class="header-mobile-menu-section header-mobile-menu-section--account">
                    <p class="header-mobile-menu-label" id="header-mobile-account-label">Compte</p>
                    <?php include CAPSULE_PORTAL_VIEWS . '/partials/header-user-menu-mobile.php'; ?>
                </div>
            <?php else : ?>
                <div class="header-mobile-menu-section header-mobile-menu-section--account">
                    <button type="button" class="header-mobile-menu-cta" id="header-mobile-login-btn">
                        <span>Connexion</span>
                        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </button>
                </div>
            <?php endif; ?>
        </div>
    </div>
</dialog>
