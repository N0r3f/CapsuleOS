<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Auth\EmailVerificationService;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\PortalContext;

if (AuthService::currentUserId() !== null) {
    portal_redirect_after_auth();
}

$error = '';
$email = EmailVerificationService::pendingEmail() ?? (string) ($_POST['email'] ?? '');
$devCode = '';
if (!empty($_SESSION['portal_verify_dev_code'])) {
    $devCode = (string) $_SESSION['portal_verify_dev_code'];
    unset($_SESSION['portal_verify_dev_code']);
}
$fromModal = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = (string) ($_POST['email'] ?? $email);
    $fromModal = !empty($_POST['from_modal']);
    $result = AuthService::verifyEmail(
        $email,
        (string) ($_POST['code'] ?? ''),
        (string) ($_POST[Csrf::fieldName()] ?? ''),
    );
    if ($result['ok']) {
        portal_redirect_after_auth();
    }
    $error = (string) ($result['error'] ?? 'Vérification impossible.');
    if ($fromModal) {
        $_SESSION['portal_verify_error'] = $error;
        $_SESSION['portal_verify_email'] = $email;
        portal_redirect('./index.php');
    }
}

$ctx = PortalContext::fromRequest('Vérifier votre e-mail · CapsuleOS');
portal_render('layout-auth.php', $ctx, [
    'heading' => 'Vérifier votre e-mail',
    'error' => $error,
    'email' => $email,
    'devCode' => $devCode,
    'authPartial' => 'auth-verify-email-form.php',
    'joinPending' => portal_join_token_from_session() !== '',
]);
