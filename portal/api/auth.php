<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Auth\EmailVerificationService;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\User\UserRepository;

header('Content-Type: application/json; charset=utf-8');
$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$action = (string) ($_GET['action'] ?? $_POST['action'] ?? '');

if ($method === 'GET' && $action === 'csrf') {
    ApiJson::ok(['csrf' => Csrf::token()]);
}

if ($method === 'GET' && $action === 'session') {
    $userId = AuthService::currentUserId();
    if ($userId === null) {
        ApiJson::ok([
            'loggedIn' => false,
            'csrf' => Csrf::token(),
        ]);
    }
    $user = UserRepository::findById($userId);
    ApiJson::ok([
        'loggedIn' => true,
        'csrf' => Csrf::token(),
        'user' => [
            'id' => $userId,
            'email' => (string) ($user['email'] ?? ''),
            'displayName' => (string) ($user['display_name'] ?? ''),
        ],
    ]);
}

if ($method !== 'POST') {
    ApiJson::error('Méthode non autorisée', 405);
}

$payload = ApiJson::readJsonBody();
$action = (string) ($payload['action'] ?? $action);
$csrf = (string) ($payload['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');

if ($action === 'login') {
    $result = AuthService::login(
        (string) ($payload['email'] ?? ''),
        (string) ($payload['password'] ?? ''),
        $csrf,
    );
    if (!$result['ok']) {
        $extra = [];
        if (!empty($result['emailNotVerified'])) {
            $extra['emailNotVerified'] = true;
            $extra['email'] = (string) ($result['email'] ?? '');
        }
        ApiJson::error((string) ($result['error'] ?? 'Connexion impossible'), 401, $extra);
    }
    $userId = AuthService::currentUserId();
    $user = $userId !== null ? UserRepository::findById($userId) : null;
    ApiJson::ok([
        'ok' => true,
        'user' => [
            'id' => $userId,
            'email' => (string) ($user['email'] ?? ''),
            'displayName' => (string) ($user['display_name'] ?? ''),
        ],
    ]);
}

if ($action === 'logout') {
    AuthService::logout();
    ApiJson::ok(['ok' => true]);
}

if ($action === 'register') {
    $result = AuthService::register(
        (string) ($payload['email'] ?? ''),
        (string) ($payload['password'] ?? ''),
        (string) ($payload['passwordConfirm'] ?? $payload['password_confirm'] ?? ''),
        $csrf,
        !empty($payload['privacyConsent']) || !empty($payload['privacy_consent']),
        (string) ($payload['displayName'] ?? $payload['display_name'] ?? ''),
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Inscription impossible'), 400);
    }
    ApiJson::ok([
        'ok' => true,
        'needsVerification' => true,
        'email' => (string) ($result['email'] ?? ''),
        'devCode' => $result['devCode'] ?? null,
    ]);
}

if ($action === 'verify_email') {
    $result = AuthService::verifyEmail(
        (string) ($payload['email'] ?? ''),
        (string) ($payload['code'] ?? ''),
        $csrf,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Vérification impossible'), 400);
    }
    $userId = AuthService::currentUserId();
    $user = $userId !== null ? UserRepository::findById($userId) : null;
    ApiJson::ok([
        'ok' => true,
        'user' => [
            'id' => $userId,
            'email' => (string) ($user['email'] ?? ''),
            'displayName' => (string) ($user['display_name'] ?? ''),
        ],
    ]);
}

if ($action === 'resend_verification') {
    $result = EmailVerificationService::resend((string) ($payload['email'] ?? ''), $csrf);
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Envoi impossible'), 400);
    }
    ApiJson::ok([
        'ok' => true,
        'devCode' => $result['devCode'] ?? null,
    ]);
}

ApiJson::error('Action inconnue', 400);
