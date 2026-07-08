<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$accountHref = portal_entry('account.php');
$isAccountPage = basename($_SERVER['SCRIPT_NAME'] ?? '') === 'account.php';
?>
<a class="header-profile-link<?= $isAccountPage ? ' header-profile-link--current' : '' ?>"
   href="<?= $ctx->e($accountHref) ?>"
   <?= $isAccountPage ? ' aria-current="page"' : '' ?>>
    <i class="fa-solid fa-user header-profile-link-icon" aria-hidden="true"></i>
    <span class="header-profile-link-label">Mon profil</span>
</a>
