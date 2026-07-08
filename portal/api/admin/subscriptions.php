<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\UserAdminRepository;
use CapsuleOS\Portal\Database;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\SqlDialect;
use CapsuleOS\Portal\User\UserRepository;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    UserRepository::expireStaleSubscriptions();
    $stmt = Database::connection()->query(
        'SELECT s.*, u.email, u.display_name, u.public_id FROM subscriptions s JOIN users u ON u.id = s.user_id ORDER BY s.updated_at DESC LIMIT 200',
    );
    $rows = $stmt ? array_values(array_filter($stmt->fetchAll(), 'is_array')) : [];
    $subs = [];
    foreach ($rows as $row) {
        $subs[] = [
            'userId' => (int) ($row['user_id'] ?? 0),
            'email' => (string) ($row['email'] ?? ''),
            'displayName' => (string) ($row['display_name'] ?? ''),
            'publicId' => portal_user_public_id($row),
            'status' => (string) ($row['status'] ?? 'none'),
            'currentPeriodEnd' => (string) ($row['current_period_end'] ?? ''),
            'cancelAtPeriodEnd' => (bool) ((int) ($row['cancel_at_period_end'] ?? 0)),
            'updatedAt' => (string) ($row['updated_at'] ?? ''),
        ];
    }
    ApiJson::ok(['subscriptions' => $subs]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$userId = (int) ($payload['userId'] ?? 0);
if ($userId <= 0) {
    ApiJson::error('Utilisateur invalide');
}
$action = (string) ($payload['action'] ?? '');

if ($action === 'set_status') {
    $status = (string) ($payload['status'] ?? '');
    $allowed = ['none', 'active', 'past_due', 'canceled'];
    if (!in_array($status, $allowed, true)) {
        ApiJson::error('Statut invalide');
    }
    $now = SqlDialect::nowExpr();
    $stmt = Database::connection()->prepare(
        'UPDATE subscriptions SET status = :status, updated_at = ' . $now . ' WHERE user_id = :uid',
    );
    $stmt->execute(['status' => $status, 'uid' => $userId]);
    AdminAuditRepository::log($actorId, 'subscription_set_status', 'user', (string) $userId, ['status' => $status]);
    ApiJson::ok(['ok' => true, 'subscription' => UserRepository::subscription($userId)]);
}

if ($action === 'set_period_end') {
    $end = trim((string) ($payload['currentPeriodEnd'] ?? ''));
    $now = SqlDialect::nowExpr();
    $stmt = Database::connection()->prepare(
        'UPDATE subscriptions SET current_period_end = :end, updated_at = ' . $now . ' WHERE user_id = :uid',
    );
    $stmt->execute(['end' => $end !== '' ? $end : null, 'uid' => $userId]);
    AdminAuditRepository::log($actorId, 'subscription_set_period_end', 'user', (string) $userId, ['currentPeriodEnd' => $end]);
    ApiJson::ok(['ok' => true, 'subscription' => UserRepository::subscription($userId)]);
}

if ($action === 'set_cancel_at_period_end') {
    $cancel = !empty($payload['cancelAtPeriodEnd']);
    UserRepository::setCancelAtPeriodEnd($userId, $cancel);
    AdminAuditRepository::log($actorId, 'subscription_cancel_flag', 'user', (string) $userId, ['cancelAtPeriodEnd' => $cancel]);
    ApiJson::ok(['ok' => true, 'subscription' => UserRepository::subscription($userId)]);
}

ApiJson::error('Action inconnue');
