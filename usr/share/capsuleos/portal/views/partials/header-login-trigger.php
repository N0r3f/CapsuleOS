<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
if (!$ctx->isLoggedIn()) {
    include CAPSULE_PORTAL_VIEWS . '/partials/login-modal.php';
}
?>
