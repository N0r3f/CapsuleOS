<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\UserAdminRepository;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\User\RoleRepository;
use CapsuleOS\Portal\User\UserAccountPolicy;
use CapsuleOS\Portal\User\UserRepository;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $userId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($userId > 0) {
        $detail = UserAdminRepository::findDetail($userId);
        if ($detail === null) {
            ApiJson::error('Utilisateur introuvable', 404);
        }
        ApiJson::ok(['user' => $detail]);
    }
    ApiJson::ok([
        'users' => UserAdminRepository::list([
            'q' => (string) ($_GET['q'] ?? ''),
            'limit' => isset($_GET['limit']) ? (int) $_GET['limit'] : 50,
            'offset' => isset($_GET['offset']) ? (int) $_GET['offset'] : 0,
        ]),
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');
$targetUserId = (int) ($payload['userId'] ?? 0);
if ($targetUserId <= 0) {
    ApiJson::error('Utilisateur invalide');
}

$allowedRoles = ['createur', 'professeur', AdminGuard::role()];

if ($action === 'grant_role') {
    $role = (string) ($payload['role'] ?? '');
    if (!in_array($role, $allowedRoles, true)) {
        ApiJson::error('Rôle invalide');
    }
    RoleRepository::grant($targetUserId, $role, 'admin:' . $actorId);
    AdminAuditRepository::log($actorId, 'grant_role', 'user', (string) $targetUserId, ['role' => $role]);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'revoke_role') {
    $role = (string) ($payload['role'] ?? '');
    if (!in_array($role, $allowedRoles, true)) {
        ApiJson::error('Rôle invalide');
    }
    if ($role === AdminGuard::role()) {
        $remaining = UserAdminRepository::countAdmins();
        $hasRole = RoleRepository::hasRole($targetUserId, $role);
        if ($hasRole && $remaining <= 1) {
            ApiJson::error('Impossible de révoquer le dernier administrateur');
        }
    }
    RoleRepository::revoke($targetUserId, $role);
    AdminAuditRepository::log($actorId, 'revoke_role', 'user', (string) $targetUserId, ['role' => $role]);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'update_display_name') {
    $name = trim((string) ($payload['displayName'] ?? ''));
    if ($name === '') {
        ApiJson::error('Nom requis');
    }
    $stmt = \CapsuleOS\Portal\Database::connection()->prepare(
        'UPDATE users SET display_name = :name WHERE id = :id',
    );
    $stmt->execute(['name' => $name, 'id' => $targetUserId]);
    AdminAuditRepository::log($actorId, 'update_display_name', 'user', (string) $targetUserId, ['displayName' => $name]);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'update_email') {
    $email = strtolower(trim((string) ($payload['email'] ?? '')));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ApiJson::error('E-mail invalide');
    }
    $current = UserRepository::findById($targetUserId);
    if ($current === null) {
        ApiJson::error('Utilisateur introuvable', 404);
    }
    if (strtolower((string) ($current['email'] ?? '')) === $email) {
        ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
    }
    if (!UserRepository::updateEmail($targetUserId, $email)) {
        ApiJson::error('Cet e-mail est déjà utilisé');
    }
    AdminAuditRepository::log($actorId, 'update_email', 'user', (string) $targetUserId, ['email' => $email]);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'force_verify_email') {
    UserRepository::markEmailVerified($targetUserId);
    \CapsuleOS\Portal\Auth\EmailVerificationRepository::deleteForUser($targetUserId);
    AdminAuditRepository::log($actorId, 'force_verify_email', 'user', (string) $targetUserId, []);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'set_account_status') {
    $status = (string) ($payload['status'] ?? '');
    if ($targetUserId === $actorId && $status === 'suspended') {
        ApiJson::error('Impossible de désactiver votre propre compte');
    }
    UserAccountPolicy::setAccountStatus($targetUserId, $status);
    AdminAuditRepository::log($actorId, 'set_account_status', 'user', (string) $targetUserId, ['status' => $status]);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'blacklist_user') {
    $user = UserRepository::findById($targetUserId);
    if ($user === null) {
        ApiJson::error('Utilisateur introuvable', 404);
    }
    if ($targetUserId === $actorId) {
        ApiJson::error('Impossible de bannir votre propre compte');
    }
    $email = (string) ($user['email'] ?? '');
    UserAccountPolicy::blacklistEmail($email, 'admin:' . $actorId);
    UserAccountPolicy::setAccountStatus($targetUserId, 'suspended');
    AdminAuditRepository::log($actorId, 'blacklist_user', 'user', (string) $targetUserId, ['email' => $email]);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'unblacklist_user') {
    $user = UserRepository::findById($targetUserId);
    if ($user === null) {
        ApiJson::error('Utilisateur introuvable', 404);
    }
    UserAccountPolicy::unblacklistEmail((string) ($user['email'] ?? ''));
    AdminAuditRepository::log($actorId, 'unblacklist_user', 'user', (string) $targetUserId, []);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'request_password_reset') {
    $user = UserRepository::findById($targetUserId);
    if ($user === null) {
        ApiJson::error('Utilisateur introuvable', 404);
    }
    AdminAuditRepository::log($actorId, 'password_reset_email', 'user', (string) $targetUserId, [
        'email' => (string) ($user['email'] ?? ''),
    ]);
    ApiJson::ok([
        'ok' => true,
        'message' => 'E-mail de réinitialisation envoyé (simulation en environnement de développement).',
        'user' => UserAdminRepository::findDetail($targetUserId),
    ]);
}

if ($action === 'set_prof_max_classrooms') {
    $max = $payload['max'] ?? null;
    $maxInt = $max === null || $max === '' ? null : max(0, (int) $max);
    UserAccountPolicy::setProfMaxClassrooms($targetUserId, $maxInt);
    AdminAuditRepository::log($actorId, 'set_prof_max_classrooms', 'user', (string) $targetUserId, ['max' => $maxInt]);
    ApiJson::ok(['ok' => true, 'user' => UserAdminRepository::findDetail($targetUserId)]);
}

if ($action === 'delete_user') {
    if ($targetUserId === $actorId) {
        ApiJson::error('Impossible de supprimer votre propre compte');
    }
    if (RoleRepository::hasRole($targetUserId, AdminGuard::role())) {
        $remaining = UserAdminRepository::countAdmins();
        if ($remaining <= 1) {
            ApiJson::error('Impossible de supprimer le dernier administrateur');
        }
    }
    $user = UserRepository::findById($targetUserId);
    if ($user === null) {
        ApiJson::error('Utilisateur introuvable', 404);
    }
    UserAccountPolicy::deleteUser($targetUserId);
    AdminAuditRepository::log($actorId, 'delete_user', 'user', (string) $targetUserId, [
        'email' => (string) ($user['email'] ?? ''),
    ]);
    ApiJson::ok(['ok' => true, 'deleted' => true]);
}

ApiJson::error('Action inconnue');
