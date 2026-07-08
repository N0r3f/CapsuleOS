<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Catalog\OsRegistryReader;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Skin\SkinSaveRepository;
use CapsuleOS\Portal\Subscription\GradeResolver;

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$userId = ApiJson::requireAuth();

$resolved = GradeResolver::forUser($userId);
if (empty($resolved['permissions']['persistSkinSaves'])) {
    ApiJson::error('Sauvegarde skins réservée aux abonnés Abonné', 403);
}

$registryId = (string) ($_GET['registryId'] ?? '');

if ($method === 'GET') {
    $items = [];
    foreach (SkinSaveRepository::listForUser($userId) as $row) {
        if (!is_array($row)) {
            continue;
        }
        $rid = (string) ($row['registry_id'] ?? '');
        $label = $rid;
        $facade = OsRegistryReader::facadeFor($rid);
        if ($facade !== null) {
            $entries = OsRegistryReader::listForPortal();
            foreach ($entries as $entry) {
                if (is_array($entry) && ($entry['id'] ?? '') === $rid) {
                    $label = (string) ($entry['displayName'] ?? $rid);
                    break;
                }
            }
        }
        $items[] = [
            'registryId' => $rid,
            'label' => $label,
            'updatedAt' => (string) ($row['updated_at'] ?? ''),
        ];
    }
    ApiJson::ok(['skins' => $items]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);

if ($method === 'POST') {
    $registryId = (string) ($payload['registryId'] ?? '');
    $skinPayload = $payload['payload'] ?? [];
    if ($registryId === '' || !is_array($skinPayload)) {
        ApiJson::error('Données invalides');
    }
    SkinSaveRepository::upsert($userId, $registryId, $skinPayload);
    ApiJson::ok(['ok' => true]);
}

if ($method === 'DELETE' || ($method === 'POST' && ($payload['action'] ?? '') === 'delete')) {
    if ($registryId === '') {
        $registryId = (string) ($payload['registryId'] ?? '');
    }
    if ($registryId === '') {
        ApiJson::error('registryId requis');
    }
    SkinSaveRepository::delete($userId, $registryId);
    ApiJson::ok(['ok' => true]);
}

ApiJson::error('Méthode non autorisée', 405);
