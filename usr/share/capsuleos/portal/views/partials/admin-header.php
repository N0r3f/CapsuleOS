<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
?>
<header class="portal-admin-bar" role="banner">
    <div class="portal-admin-bar-inner">
        <p class="portal-admin-bar-title">CapsuleOS · Administration</p>
        <a class="portal-admin-bar-logout" href="<?= $ctx->e(portal_admin_paths()['logout']) ?>">Se déconnecter</a>
    </div>
</header>
