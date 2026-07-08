<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Classroom\ClassroomRepository;
use CapsuleOS\Portal\Database;
use CapsuleOS\Portal\Http\ApiJson;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $classroomId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($classroomId > 0) {
        $classroom = ClassroomRepository::findById($classroomId);
        if ($classroom === null) {
            ApiJson::error('Classe introuvable', 404);
        }
        ApiJson::ok([
            'classroom' => ClassroomRepository::formatForAdmin($classroom),
            'members' => ClassroomRepository::members($classroomId),
        ]);
    }
    ApiJson::ok(['classrooms' => ClassroomRepository::listAll()]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');
$classroomId = (int) ($payload['classroomId'] ?? 0);

if ($action === 'delete_classroom' && $classroomId > 0) {
    Database::connection()->prepare('DELETE FROM classrooms WHERE id = :id')->execute(['id' => $classroomId]);
    AdminAuditRepository::log($actorId, 'classroom_delete', 'classroom', (string) $classroomId, []);
    ApiJson::ok(['ok' => true]);
}

if ($action === 'remove_member' && $classroomId > 0) {
    $memberId = (int) ($payload['userId'] ?? 0);
    if ($memberId <= 0) {
        ApiJson::error('Membre invalide');
    }
    ClassroomRepository::adminRemoveMember($classroomId, $memberId);
    AdminAuditRepository::log($actorId, 'classroom_remove_member', 'classroom', (string) $classroomId, ['userId' => $memberId]);
    ApiJson::ok(['ok' => true, 'members' => ClassroomRepository::members($classroomId)]);
}

if ($action === 'extend_invite' && $classroomId > 0) {
    $classroom = ClassroomRepository::findById($classroomId);
    if ($classroom === null) {
        ApiJson::error('Classe introuvable', 404);
    }
    $token = ClassroomRepository::adminRegenerateInvite($classroomId);
    AdminAuditRepository::log($actorId, 'classroom_extend_invite', 'classroom', (string) $classroomId, []);
    ApiJson::ok(['ok' => true, 'inviteToken' => $token]);
}

ApiJson::error('Action inconnue');
