<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\Subscription\GradeResolver;
use CapsuleOS\Portal\Usage\OsUsageRepository;

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$userId = AuthService::currentUserId();
$anonFp = (string) ($_GET['fingerprint'] ?? $_POST['fingerprint'] ?? '');
$registryId = (string) ($_GET['registryId'] ?? $_POST['registryId'] ?? '');

$resolved = $userId !== null ? GradeResolver::forUser($userId) : GradeResolver::forAnonymous();
$subjectKey = OsUsageRepository::subjectKey($userId, $anonFp);
$limit = OsUsageRepository::dailyLimit();
$unlimited = !empty($resolved['permissions']['osQuotaUnlimited']);

if ($method === 'GET') {
    $used = $registryId !== '' ? OsUsageRepository::minutesUsed($subjectKey, $registryId) : 0.0;
    $remaining = $unlimited ? null : max(0.0, (float) $limit - $used);
    ApiJson::ok([
        'unlimited' => $unlimited,
        'limitMinutes' => $limit,
        'minutesUsed' => $used,
        'minutesRemaining' => $remaining,
        'resetsAt' => OsUsageRepository::resetsAt(),
        'summary' => $unlimited ? [] : OsUsageRepository::summaryForSubject($subjectKey, $limit),
        'permissions' => GradeResolver::toClientPayload($resolved),
    ]);
}

if ($method === 'POST') {
    $payload = ApiJson::readJsonBody();
    if ($userId === null && $anonFp === '') {
        ApiJson::error('Fingerprint requis pour visiteur anonyme', 401);
    }
    if ($unlimited) {
        ApiJson::ok(['ok' => true, 'unlimited' => true]);
    }
    if ($registryId === '') {
        ApiJson::error('registryId requis');
    }
    $minutes = (float) ($payload['minutes'] ?? 1);
    $newTotal = OsUsageRepository::addMinutes($subjectKey, $registryId, $minutes);
    $remaining = max(0.0, (float) $limit - $newTotal);
    $allowed = $remaining > 0 || $newTotal <= (float) $limit;
    ApiJson::ok([
        'ok' => true,
        'minutesUsed' => $newTotal,
        'minutesRemaining' => $remaining,
        'allowed' => $allowed,
        'resetsAt' => OsUsageRepository::resetsAt(),
    ]);
}

ApiJson::error('Méthode non autorisée', 405);
