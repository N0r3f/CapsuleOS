<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Auth\AdminAuthService;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\PortalContext;

if (AdminGuard::isAdmin()) {
    portal_admin_redirect('dashboard');
}

$error = '';
$email = '';
if (!empty($_SESSION['portal_admin_login_error'])) {
    $error = (string) $_SESSION['portal_admin_login_error'];
    unset($_SESSION['portal_admin_login_error']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = (string) ($_POST['email'] ?? '');
    $result = AdminAuthService::login(
        $email,
        (string) ($_POST['password'] ?? ''),
        (string) ($_POST[Csrf::fieldName()] ?? ''),
    );
    if ($result['ok']) {
        portal_admin_redirect('dashboard');
    }
    $error = (string) ($result['error'] ?? 'Identifiants invalides.');
}

$ctx = PortalContext::fromRequest('Connexion administrateur · CapsuleOS');
portal_render('layout-admin-gate.php', $ctx, [
    'heading' => 'Connexion administrateur',
    'error' => $error,
    'email' => $email,
    'authPartial' => 'auth-admin-login-form.php',
]);
