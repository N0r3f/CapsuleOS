<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Classroom\ClassroomRepository;
use CapsuleOS\Portal\Http\ApiJson;

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$userId = ApiJson::requireAuth();

if ($method === 'GET') {
    $membership = ClassroomRepository::membershipForUser($userId);
    ApiJson::ok([
        'active' => $membership !== null,
        'className' => is_array($membership) ? (string) ($membership['classroom_name'] ?? '') : '',
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$token = trim((string) ($payload['token'] ?? ''));

if ($token === '') {
    ApiJson::error('Token d\'invitation requis');
}

$classroom = ClassroomRepository::findByInviteToken($token);
if ($classroom === null) {
    ApiJson::error('Invitation invalide', 404);
}

if (strtotime((string) ($classroom['invite_expires_at'] ?? '')) < time()) {
    ApiJson::error('Invitation expirée', 410);
}

if ((int) ($classroom['teacher_id'] ?? 0) === $userId) {
    ApiJson::error('Vous ne pouvez pas rejoindre votre propre classe');
}

$ok = ClassroomRepository::addMember((int) ($classroom['id'] ?? 0), $userId);
if (!$ok) {
    ApiJson::error('Impossible de rejoindre la classe (places ou déjà membre d\'une classe)');
}

ApiJson::ok([
    'ok' => true,
    'className' => (string) ($classroom['name'] ?? ''),
], 201);
