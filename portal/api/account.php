<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\User\UserRepository;

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET' && ($_GET['action'] ?? '') === 'csrf') {
    ApiJson::ok(['csrf' => Csrf::token()]);
}

$userId = ApiJson::requireAuth();
$user = UserRepository::findById($userId);
if ($user === null) {
    ApiJson::error('Utilisateur introuvable', 404);
}

if ($method === 'GET') {
    $sub = UserRepository::subscription($userId);
    $entitlement = UserRepository::entitlementLevel($userId);
    $status = is_array($sub) ? (string) ($sub['status'] ?? 'none') : 'none';
    $periodEnd = is_array($sub) ? (string) ($sub['current_period_end'] ?? '') : '';
    $cancelAtEnd = is_array($sub) && !empty($sub['cancel_at_period_end']);
    $hasHistory = UserRepository::hasSubscriptionHistory($userId);
    $isExpired = UserRepository::isSubscriptionExpired($userId);
    ApiJson::ok([
        'displayName' => (string) ($user['display_name'] ?? ''),
        'publicId' => portal_user_public_id($user),
        'email' => (string) ($user['email'] ?? ''),
        'createdAt' => (string) ($user['created_at'] ?? ''),
        'entitlement' => $entitlement,
        'subscription' => [
            'status' => $status,
            'currentPeriodEnd' => $periodEnd,
            'cancelAtPeriodEnd' => $cancelAtEnd,
            'isSubscriber' => $entitlement === 'subscriber',
            'hasHistory' => $hasHistory,
            'isExpired' => $isExpired,
            'periodDisplay' => portal_subscription_end_display($periodEnd, $isExpired, $cancelAtEnd),
            'periodEndFormatted' => $periodEnd !== '' ? portal_format_datetime_fr($periodEnd) : '-',
            'cycleProgress' => portal_subscription_cycle_progress($periodEnd),
        ],
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

if ($method === 'POST' && $action === 'update_profile') {
    $displayName = trim((string) ($payload['displayName'] ?? ''));
    if ($displayName !== '') {
        UserRepository::updateDisplayName($userId, $displayName);
    }
    ApiJson::ok(['ok' => true]);
}

if ($method === 'POST' && $action === 'update_email') {
    $email = trim((string) ($payload['email'] ?? ''));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ApiJson::error('Adresse e-mail invalide');
    }
    if (!UserRepository::updateEmail($userId, $email)) {
        ApiJson::error('Cette adresse e-mail est déjà utilisée');
    }
    ApiJson::ok(['ok' => true]);
}

if ($method === 'POST' && $action === 'request_email_change') {
    $email = strtolower(trim((string) ($payload['email'] ?? '')));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ApiJson::error('Adresse e-mail invalide');
    }
    $current = strtolower((string) ($user['email'] ?? ''));
    if ($email === $current) {
        ApiJson::error('Cette adresse est déjà votre e-mail actuel');
    }
    $existing = UserRepository::findByEmail($email);
    if ($existing !== null && (int) ($existing['id'] ?? 0) !== $userId) {
        ApiJson::error('Cette adresse e-mail est déjà utilisée');
    }
    ApiJson::ok([
        'ok' => true,
        'pendingConfirmation' => true,
        'message' => 'Un e-mail de confirmation a été envoyé à la nouvelle adresse.',
    ]);
}

if ($method === 'POST' && $action === 'update_password') {
    $currentPassword = (string) ($payload['currentPassword'] ?? '');
    $password = (string) ($payload['password'] ?? '');
    $passwordConfirm = (string) ($payload['passwordConfirm'] ?? '');
    if ($password !== $passwordConfirm) {
        ApiJson::error('Les nouveaux mots de passe ne correspondent pas');
    }
    if (!AuthService::verifyPassword($currentPassword, (string) ($user['password_hash'] ?? ''))) {
        ApiJson::error('Mot de passe actuel incorrect');
    }
    $minLen = 12;
    $securityPath = Config::contracts() . '/portal-security.json';
    if (is_file($securityPath)) {
        $sec = json_decode((string) file_get_contents($securityPath), true);
        if (is_array($sec)) {
            $minLen = (int) ($sec['password']['minLength'] ?? 12);
        }
    }
    if (strlen($password) < $minLen) {
        ApiJson::error('Mot de passe trop court (minimum ' . $minLen . ' caractères)');
    }
    UserRepository::updatePassword($userId, $password);
    ApiJson::ok(['ok' => true]);
}

if ($method === 'POST' && $action === 'cancel_renewal') {
    $cancel = !empty($payload['cancel']);
    UserRepository::setCancelAtPeriodEnd($userId, $cancel);
    ApiJson::ok(['ok' => true, 'cancelAtPeriodEnd' => $cancel]);
}

if ($method === 'POST' && $action === 'update_billing') {
    $paymentMethod = trim((string) ($payload['paymentMethod'] ?? ''));
    if ($paymentMethod === '') {
        ApiJson::error('Moyen de paiement requis');
    }
    if (mb_strlen($paymentMethod) > 80) {
        ApiJson::error('Libellé trop long (80 caractères maximum)');
    }
    UserRepository::updateBilling($userId, ['paymentMethod' => $paymentMethod]);
    ApiJson::ok(['ok' => true, 'paymentMethod' => $paymentMethod]);
}

if ($method === 'POST' && $action === 'remove_payment_method') {
    UserRepository::updateBilling($userId, ['paymentMethod' => '']);
    ApiJson::ok(['ok' => true]);
}

if ($method === 'POST' && $action === 'delete_account') {
    AuthService::logout();
    UserRepository::deleteAccount($userId);
    ApiJson::ok(['ok' => true]);
}

ApiJson::error('Action inconnue', 400);
