<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Creator\ModuleSubmissionRepository;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\User\RoleRepository;

header('Content-Type: application/json; charset=utf-8');
$userId = ApiJson::requireAuth();

if (!RoleRepository::hasRole($userId, 'createur')) {
    ApiJson::error('Rôle Créateur requis', 403);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET') {
    ApiJson::error('Méthode non autorisée', 405);
}

$submissionId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($submissionId > 0) {
    $row = ModuleSubmissionRepository::findById($submissionId);
    if ($row === null || (int) ($row['user_id'] ?? 0) !== $userId) {
        ApiJson::error('Soumission introuvable', 404);
    }
    ApiJson::ok(['submission' => ModuleSubmissionRepository::formatForClientApi($row)]);
}

$out = [];
foreach (ModuleSubmissionRepository::listForUser($userId) as $row) {
    $out[] = ModuleSubmissionRepository::formatForClientApi($row);
}

ApiJson::ok([
    'submissions' => $out,
    'contract' => ModuleSubmissionRepository::contract(),
]);
