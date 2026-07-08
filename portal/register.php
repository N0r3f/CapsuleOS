<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Catalog\LegalCatalog;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\PortalContext;

if (AuthService::currentUserId() !== null) {
    portal_redirect_after_auth();
}

$error = '';
$email = '';
$displayName = '';
$fromModal = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = (string) ($_POST['email'] ?? '');
    $displayName = trim((string) ($_POST['display_name'] ?? ''));
    $fromModal = !empty($_POST['from_modal']);
    $result = AuthService::register(
        $email,
        (string) ($_POST['password'] ?? ''),
        (string) ($_POST['password_confirm'] ?? ''),
        (string) ($_POST[Csrf::fieldName()] ?? ''),
        !empty($_POST[LegalCatalog::consentRegisterField()]),
        $displayName,
    );
    if ($result['ok']) {
        $_SESSION['portal_verify_email'] = strtolower(trim($email));
        if (!empty($result['devCode'])) {
            $_SESSION['portal_verify_dev_code'] = (string) $result['devCode'];
        }
        if ($fromModal) {
            portal_redirect('./index.php');
        }
        portal_redirect('./verify-email.php');
    }
    $error = (string) ($result['error'] ?? 'Erreur lors de la création du compte.');
    if ($fromModal) {
        $_SESSION['portal_register_error'] = $error;
        $_SESSION['portal_register_email'] = $email;
        $_SESSION['portal_register_display_name'] = $displayName;
        portal_redirect('./index.php');
    }
}

$ctx = PortalContext::fromRequest('Créer un compte · CapsuleOS');
portal_render('layout-auth.php', $ctx, [
    'heading' => 'Créer un compte',
    'error' => $error,
    'email' => $email,
    'display_name' => $displayName,
    'authPartial' => 'auth-register-form.php',
    'joinPending' => portal_join_token_from_session() !== '',
]);
