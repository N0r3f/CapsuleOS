<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\ContractWriter;
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\ApiJson;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$contractPath = 'etc/capsuleos/contracts/portal-grades.json';
$gate = 'usr/lib/capsuleos/tools/validate-portal-contracts.mjs';

/** Clés de permission booléennes pilotant les droits côté serveur (GradeResolver). */
$permissionFlags = [
    'osQuotaUnlimited',
    'storeBrowse',
    'storeAppLaunch',
    'storeModules',
    'pedagogicalModules',
    'showGamification',
    'persistSkinSaves',
    'canPurchaseModules',
];

if ($method === 'GET') {
    $path = Config::contracts() . '/portal-grades.json';
    if (!is_file($path)) {
        ApiJson::error('Contrat grades introuvable', 500);
    }
    $data = json_decode((string) file_get_contents($path), true);
    if (!is_array($data)) {
        ApiJson::error('Contrat grades invalide', 500);
    }
    ApiJson::ok([
        'grades' => $data['grades'] ?? [],
        'permissions' => $data['permissions'] ?? [],
        'permissionFlags' => $permissionFlags,
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

if ($action === 'update_grade') {
    $gradeId = trim((string) ($payload['gradeId'] ?? ''));
    if ($gradeId === '') {
        ApiJson::error('gradeId requis');
    }
    $result = ContractWriter::updateJson(
        $contractPath,
        static function (array $data) use ($gradeId, $payload): array {
            $found = false;
            foreach ($data['grades'] ?? [] as $i => $grade) {
                if (!is_array($grade) || ($grade['id'] ?? '') !== $gradeId) {
                    continue;
                }
                if (isset($payload['label'])) {
                    $data['grades'][$i]['label'] = trim((string) $payload['label']);
                }
                if (array_key_exists('requiresSubscription', $payload)) {
                    $data['grades'][$i]['requiresSubscription'] = (bool) $payload['requiresSubscription'];
                }
                if (array_key_exists('manualGrant', $payload)) {
                    $data['grades'][$i]['manualGrant'] = (bool) $payload['manualGrant'];
                }
                $found = true;
                break;
            }
            if (!$found) {
                throw new \RuntimeException('Grade introuvable: ' . $gradeId);
            }
            return $data;
        },
        $gate,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'grades_update_grade', 'grade', $gradeId, []);
    ApiJson::ok(['ok' => true]);
}

if ($action === 'update_permissions') {
    $key = trim((string) ($payload['key'] ?? ''));
    if ($key === '') {
        ApiJson::error('key requise');
    }
    $caps = is_array($payload['permissions'] ?? null) ? $payload['permissions'] : [];
    $result = ContractWriter::updateJson(
        $contractPath,
        static function (array $data) use ($key, $caps, $permissionFlags): array {
            $permissions = is_array($data['permissions'] ?? null) ? $data['permissions'] : [];
            if (!isset($permissions[$key]) || !is_array($permissions[$key])) {
                throw new \RuntimeException('Ensemble de permissions introuvable: ' . $key);
            }
            foreach ($permissionFlags as $flag) {
                if (array_key_exists($flag, $caps)) {
                    $permissions[$key][$flag] = (bool) $caps[$flag];
                }
            }
            $data['permissions'] = $permissions;
            return $data;
        },
        $gate,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'grades_update_permissions', 'grade', $key, []);
    ApiJson::ok(['ok' => true]);
}

ApiJson::error('Action inconnue');
