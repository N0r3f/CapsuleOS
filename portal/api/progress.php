<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Catalog\ModuleCatalogReader;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\Progress\ProgressRepository;
use CapsuleOS\Portal\User\UserRepository;

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$userId = AuthService::currentUserId();

if ($method === 'GET' && ($_GET['action'] ?? '') === 'csrf') {
    echo json_encode(['csrf' => Csrf::token()], JSON_THROW_ON_ERROR);
    exit;
}

if ($userId === null) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté'], JSON_THROW_ON_ERROR);
    exit;
}

$mountId = (string) ($_GET['mountId'] ?? $_POST['mountId'] ?? '');

if ($method === 'GET') {
    if ($mountId !== '') {
        $row = ProgressRepository::find($userId, $mountId);
        echo json_encode(['progress' => $row], JSON_THROW_ON_ERROR);
        exit;
    }
    $rows = ProgressRepository::listForUser($userId);
    $enriched = [];
    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $entitlement = UserRepository::entitlementLevel($userId);
        $module = ModuleCatalogReader::moduleByMountId((string) ($row['mount_id'] ?? ''), $entitlement);
        $enriched[] = [
            'mountId' => (string) ($row['mount_id'] ?? ''),
            'registryId' => (string) ($row['registry_id'] ?? ''),
            'storageKey' => (string) ($row['storage_key'] ?? ''),
            'doneCount' => (int) ($row['done_count'] ?? 0),
            'totalCount' => (int) ($row['total_count'] ?? 0),
            'updatedAt' => (string) ($row['updated_at'] ?? ''),
            'title' => is_array($module) ? (string) ($module['title'] ?? '') : (string) ($row['mount_id'] ?? ''),
            'levelLabel' => is_array($module) ? (string) ($module['level'] ?? '') : '',
        ];
    }
    echo json_encode(['progress' => $enriched], JSON_THROW_ON_ERROR);
    exit;
}

if ($method === 'DELETE' || ($method === 'POST' && ($_POST['_method'] ?? '') === 'DELETE')) {
    if (!Csrf::validate($_POST[Csrf::fieldName()] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) {
        http_response_code(403);
        echo json_encode(['error' => 'CSRF invalide'], JSON_THROW_ON_ERROR);
        exit;
    }
    if ($mountId === '') {
        http_response_code(400);
        echo json_encode(['error' => 'mountId requis'], JSON_THROW_ON_ERROR);
        exit;
    }
    ProgressRepository::delete($userId, $mountId);
    echo json_encode(['ok' => true], JSON_THROW_ON_ERROR);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw !== false ? $raw : '', true);
    if (!is_array($payload)) {
        $payload = $_POST;
    }
    if (!Csrf::validate($payload[Csrf::fieldName()] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) {
        http_response_code(403);
        echo json_encode(['error' => 'CSRF invalide'], JSON_THROW_ON_ERROR);
        exit;
    }
    $mountId = (string) ($payload['mountId'] ?? '');
    $registryId = (string) ($payload['registryId'] ?? '');
    $storageKey = (string) ($payload['storageKey'] ?? '');
    $state = $payload['state'] ?? [];
    $doneCount = (int) ($payload['doneCount'] ?? 0);
    $totalCount = (int) ($payload['totalCount'] ?? 0);
    if ($mountId === '' || !is_array($state)) {
        http_response_code(400);
        echo json_encode(['error' => 'Données invalides'], JSON_THROW_ON_ERROR);
        exit;
    }
    ProgressRepository::upsert($userId, $mountId, $registryId, $storageKey, $state, $doneCount, $totalCount);
    echo json_encode(['ok' => true], JSON_THROW_ON_ERROR);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée'], JSON_THROW_ON_ERROR);
