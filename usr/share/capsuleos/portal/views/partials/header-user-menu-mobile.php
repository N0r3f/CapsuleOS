<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$displayName = $ctx->displayName();
$accountHref = portal_entry('account.php');
$adminHref = portal_entry('admin.php');
$logoutHref = portal_entry('logout.php');
$isAccountPage = basename($_SERVER['SCRIPT_NAME'] ?? '') === 'account.php';
$isAdminPage = basename($_SERVER['SCRIPT_NAME'] ?? '') === 'admin.php';
?>
<div class="header-mobile-menu-user-card">
    <span class="header-mobile-menu-user-avatar" aria-hidden="true">
        <i class="fa-solid fa-user"></i>
    </span>
    <span class="header-mobile-menu-user-meta">
        <span class="header-mobile-menu-user-eyebrow">Connecté</span>
        <span class="header-mobile-user-name" data-portal-auth-username><?= $ctx->e($displayName) ?></span>
    </span>
</div>
<ul class="header-mobile-menu-list" aria-labelledby="header-mobile-account-label">
    <li>
        <a class="header-mobile-menu-link<?= $isAccountPage ? ' header-mobile-menu-link--current' : '' ?>" href="<?= $ctx->e($accountHref) ?>"<?= $isAccountPage ? ' aria-current="page"' : '' ?>>
            <i class="fa-solid fa-id-card" aria-hidden="true"></i>
            <span>Mon profil</span>
        </a>
    </li>
    <?php if ($ctx->isAdmin()) : ?>
        <li>
            <a class="header-mobile-menu-link<?= $isAdminPage ? ' header-mobile-menu-link--current' : '' ?>" href="<?= $ctx->e($adminHref) ?>"<?= $isAdminPage ? ' aria-current="page"' : '' ?>>
                <i class="fa-solid fa-gauge" aria-hidden="true"></i>
                <span>Administration</span>
            </a>
        </li>
    <?php endif; ?>
    <li>
        <a class="header-mobile-menu-link header-mobile-menu-link--muted" href="<?= $ctx->e($logoutHref) ?>">
            <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
            <span>Se déconnecter</span>
        </a>
    </li>
</ul>
