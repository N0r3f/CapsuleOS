<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AdminAuthService;
use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Support\TicketMedia;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$userId = AuthService::currentUserId();
$adminUserId = AdminAuthService::currentUserId();

if ($method === 'GET') {
    $mediaId = trim((string) ($_GET['id'] ?? ''));
    if ($mediaId === '') {
        http_response_code(400);
        echo 'Identifiant requis';
        exit;
    }
    TicketMedia::serve(
        $mediaId,
        $userId !== null ? $userId : 0,
        $adminUserId,
    );
}

$uploaderId = $userId ?? $adminUserId;
if ($uploaderId === null || $uploaderId <= 0) {
    ApiJson::error('Non connecté', 401);
}

ApiJson::requireCsrf($_POST);

$file = $_FILES['file'] ?? null;
if (!is_array($file)) {
    ApiJson::error('Fichier requis');
}

try {
    $stored = TicketMedia::store($uploaderId, $file);
} catch (\InvalidArgumentException $e) {
    ApiJson::error($e->getMessage());
} catch (\Throwable $e) {
    ApiJson::error('Échec envoi capture', 500);
}

ApiJson::ok([
    'ok' => true,
    'media' => $stored,
    'url' => (string) ($stored['url'] ?? ''),
]);
