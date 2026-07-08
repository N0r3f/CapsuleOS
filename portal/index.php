<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\PortalContext;

$joinToken = portal_join_token_from_session();
if ($joinToken !== '' && AuthService::currentUserId() === null) {
    portal_redirect('./join-class.php?token=' . rawurlencode($joinToken));
}

$extra = [];
if (!empty($_SESSION['portal_login_error'])) {
    $extra['loginError'] = (string) $_SESSION['portal_login_error'];
    unset($_SESSION['portal_login_error']);
}
if (!empty($_SESSION['portal_login_email'])) {
    $extra['loginEmail'] = (string) $_SESSION['portal_login_email'];
    unset($_SESSION['portal_login_email']);
}
if (!empty($_SESSION['portal_register_error'])) {
    $extra['registerError'] = (string) $_SESSION['portal_register_error'];
    unset($_SESSION['portal_register_error']);
}
if (!empty($_SESSION['portal_register_email'])) {
    $extra['registerEmail'] = (string) $_SESSION['portal_register_email'];
    unset($_SESSION['portal_register_email']);
}
if (isset($_SESSION['portal_register_display_name'])) {
    $extra['registerDisplayName'] = (string) $_SESSION['portal_register_display_name'];
    unset($_SESSION['portal_register_display_name']);
}
if (!empty($_SESSION['portal_verify_email'])) {
    $extra['verifyEmail'] = (string) $_SESSION['portal_verify_email'];
    unset($_SESSION['portal_verify_email']);
}
if (!empty($_SESSION['portal_verify_error'])) {
    $extra['verifyError'] = (string) $_SESSION['portal_verify_error'];
    unset($_SESSION['portal_verify_error']);
}
if (!empty($_SESSION['portal_verify_dev_code'])) {
    $extra['verifyDevCode'] = (string) $_SESSION['portal_verify_dev_code'];
    unset($_SESSION['portal_verify_dev_code']);
}
if ($extra !== []) {
    $extra['openLoginModal'] = true;
    if (!empty($extra['verifyEmail'])) {
        $extra['modalView'] = 'verify';
    } else {
        $extra['modalView'] = !empty($extra['registerError']) ? 'register' : 'login';
    }
}

$ctx = PortalContext::fromRequest('CapsuleOS');
if ($extra !== []) {
    $ctx = PortalContext::withExtra($ctx, $extra);
}
include CAPSULE_PORTAL_VIEWS . '/layout.php';
