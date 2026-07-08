<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Catalog\ModuleCatalogReader;
use CapsuleOS\Portal\Catalog\OsRegistryReader;
use CapsuleOS\Portal\Classroom\ClassroomRepository;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Subscription\GradeResolver;
use CapsuleOS\Portal\User\RoleRepository;

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$userId = ApiJson::requireAuth();

if (!RoleRepository::hasRole($userId, 'professeur')) {
    ApiJson::error('Grade Professeur requis', 403);
}

/** @param array<string, mixed> $classroom */
function portal_classroom_payload(array $classroom): array
{
    $classroomId = (int) ($classroom['id'] ?? 0);
    $inviteToken = (string) ($classroom['invite_token'] ?? '');

    return [
        'id' => $classroomId,
        'name' => (string) ($classroom['name'] ?? ''),
        'maxSlots' => (int) ($classroom['max_slots'] ?? 0),
        'memberCount' => ClassroomRepository::memberCount($classroomId),
        'inviteToken' => $inviteToken,
        'inviteExpiresAt' => (string) ($classroom['invite_expires_at'] ?? ''),
        'inviteUrl' => portal_absolute_url('join-class.php', ['token' => $inviteToken]),
        'inviteExpiresLabel' => portal_format_date_fr((string) ($classroom['invite_expires_at'] ?? '')),
        'allowedOs' => ClassroomRepository::decodeJsonList((string) ($classroom['allowed_os_json'] ?? '[]')),
        'allowedModules' => ClassroomRepository::decodeJsonList((string) ($classroom['allowed_modules_json'] ?? '[]')),
    ];
}

/** @return list<array<string, mixed>> */
function portal_classroom_members(int $classroomId): array
{
    $members = [];
    foreach (ClassroomRepository::members($classroomId) as $m) {
        if (!is_array($m)) {
            continue;
        }
        $members[] = [
            'userId' => (int) ($m['user_id'] ?? 0),
            'email' => (string) ($m['email'] ?? ''),
            'displayName' => (string) ($m['display_name'] ?? ''),
            'publicId' => portal_user_public_id($m),
            'joinedAt' => (string) ($m['joined_at'] ?? ''),
        ];
    }

    return $members;
}

/** @param array<string, mixed> $payload */
function portal_resolve_teacher_classroom(int $userId, array $payload): ?array
{
    $classroomId = (int) ($payload['classroomId'] ?? 0);
    if ($classroomId > 0) {
        return ClassroomRepository::findOwnedByTeacher($classroomId, $userId);
    }

    $classrooms = ClassroomRepository::listByTeacher($userId);
    if (count($classrooms) === 1) {
        return $classrooms[0];
    }

    return null;
}

if ($method === 'GET') {
    $classrooms = ClassroomRepository::listByTeacher($userId);
    $classroomsPayload = array_map('portal_classroom_payload', $classrooms);

    $requestedId = isset($_GET['classroomId']) ? (int) $_GET['classroomId'] : 0;
    $detailRow = null;
    if ($requestedId > 0) {
        $detailRow = ClassroomRepository::findOwnedByTeacher($requestedId, $userId);
    } elseif (count($classrooms) === 1) {
        $detailRow = $classrooms[0];
    }

    $classroomPayload = null;
    $members = [];
    if ($detailRow !== null) {
        $classroomPayload = portal_classroom_payload($detailRow);
        $members = portal_classroom_members((int) ($detailRow['id'] ?? 0));
    }

    $contract = GradeResolver::gradesContract();
    $gradeContext = GradeResolver::forUser($userId);
    $entitlement = (string) ($gradeContext['entitlement'] ?? 'anonymous');
    $classroomCount = ClassroomRepository::countByTeacher($userId);
    $maxClassrooms = ClassroomRepository::maxClassroomsForTeacher($userId);
    ApiJson::ok([
        'classrooms' => $classroomsPayload,
        'classroom' => $classroomPayload,
        'members' => $members,
        'osCatalog' => OsRegistryReader::listForPortal(),
        'modulesCatalog' => ModuleCatalogReader::catalogFor($entitlement),
        'limits' => [
            'maxSlots' => (int) ($contract['classMaxSlots'] ?? 32),
            'minSlots' => (int) ($contract['classMinSlots'] ?? 2),
            'maxClassrooms' => $maxClassrooms,
            'classroomCount' => $classroomCount,
            'canCreate' => $classroomCount < $maxClassrooms,
        ],
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

$contract = GradeResolver::gradesContract();
$minSlots = (int) ($contract['classMinSlots'] ?? 2);
$maxSlots = (int) ($contract['classMaxSlots'] ?? 32);

if ($action === 'create') {
    if (!ClassroomRepository::canCreateClassroom($userId)) {
        $max = ClassroomRepository::maxClassroomsForTeacher($userId);
        ApiJson::error('Limite de classes atteinte (' . $max . ' autorisée' . ($max > 1 ? 's' : '') . ')');
    }
    $name = trim((string) ($payload['name'] ?? ''));
    $slots = (int) ($payload['maxSlots'] ?? 0);
    if ($name === '') {
        ApiJson::error('Nom de classe requis');
    }
    if ($slots < $minSlots || $slots > $maxSlots) {
        ApiJson::error('Places invalides (' . $minSlots . ' à ' . $maxSlots . ')');
    }
    $allowedOs = is_array($payload['allowedOs'] ?? null) ? $payload['allowedOs'] : [];
    $allowedModules = is_array($payload['allowedModules'] ?? null) ? $payload['allowedModules'] : [];
    $id = ClassroomRepository::create($userId, $name, $slots, $allowedOs, $allowedModules);
    $created = ClassroomRepository::findById($id);
    ApiJson::ok(['ok' => true, 'id' => $id, 'inviteToken' => (string) ($created['invite_token'] ?? '')], 201);
}

$classroom = portal_resolve_teacher_classroom($userId, $payload);

if ($action === 'update' && $classroom !== null) {
    $classroomId = (int) ($classroom['id'] ?? 0);
    $name = trim((string) ($payload['name'] ?? $classroom['name'] ?? ''));
    $slots = (int) ($payload['maxSlots'] ?? $classroom['max_slots'] ?? 0);
    if ($slots < $minSlots || $slots > $maxSlots) {
        ApiJson::error('Places invalides');
    }
    $allowedOs = is_array($payload['allowedOs'] ?? null)
        ? $payload['allowedOs']
        : ClassroomRepository::decodeJsonList((string) ($classroom['allowed_os_json'] ?? '[]'));
    $allowedModules = is_array($payload['allowedModules'] ?? null)
        ? $payload['allowedModules']
        : ClassroomRepository::decodeJsonList((string) ($classroom['allowed_modules_json'] ?? '[]'));
    ClassroomRepository::update($classroomId, $userId, $name, $slots, $allowedOs, $allowedModules);
    ApiJson::ok(['ok' => true]);
}

if ($action === 'regenerate_invite' && $classroom !== null) {
    $token = ClassroomRepository::regenerateInvite((int) $classroom['id'], $userId);
    if ($token === null) {
        ApiJson::error('Impossible de régénérer le lien');
    }
    ApiJson::ok(['ok' => true, 'inviteToken' => $token]);
}

if ($action === 'remove_member' && $classroom !== null) {
    $memberId = (int) ($payload['userId'] ?? 0);
    if ($memberId <= 0) {
        ApiJson::error('userId requis');
    }
    ClassroomRepository::removeMember((int) $classroom['id'], $memberId, $userId);
    ApiJson::ok(['ok' => true]);
}

if ($action === 'delete' && $classroom !== null) {
    ClassroomRepository::delete((int) $classroom['id'], $userId);
    ApiJson::ok(['ok' => true]);
}

if (in_array($action, ['update', 'regenerate_invite', 'remove_member', 'delete'], true) && $classroom === null) {
    ApiJson::error('classroomId requis', 400);
}

ApiJson::error('Action inconnue', 400);
