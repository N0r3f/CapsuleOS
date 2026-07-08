<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\PortalContext;

if (!empty($_GET['join']) && ($joinToken = portal_join_token_from_session()) !== '') {
    portal_redirect('./join-class.php?token=' . rawurlencode($joinToken));
}

if (AuthService::currentUserId() !== null) {
    portal_redirect_after_auth();
}

$error = '';
$email = '';
$fromModal = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = (string) ($_POST['email'] ?? '');
    $fromModal = !empty($_POST['from_modal']);
    $result = AuthService::login(
        $email,
        (string) ($_POST['password'] ?? ''),
        (string) ($_POST[Csrf::fieldName()] ?? ''),
    );
    if ($result['ok']) {
        portal_redirect_after_auth();
    }
    $error = (string) ($result['error'] ?? 'Erreur de connexion.');
    if ($fromModal) {
        $_SESSION['portal_login_error'] = $error;
        $_SESSION['portal_login_email'] = $email;
        if (!empty($result['emailNotVerified'])) {
            $_SESSION['portal_verify_email'] = (string) ($result['email'] ?? $email);
            unset($_SESSION['portal_login_error']);
            $_SESSION['portal_verify_error'] = $error;
        }
        portal_redirect('./index.php');
    }
}

$ctx = PortalContext::fromRequest('Connexion · CapsuleOS');
portal_render('layout-auth.php', $ctx, [
    'heading' => 'Connexion',
    'error' => $error,
    'email' => $email,
    'authPartial' => 'auth-login-form.php',
    'joinPending' => !empty($_GET['join']) || portal_join_token_from_session() !== '',
]);
