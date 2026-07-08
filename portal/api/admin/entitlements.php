<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\ContractWriter;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Subscription\Entitlements;
use CapsuleOS\Portal\Usage\OsUsageRepository;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    ApiJson::ok([
        'entitlements' => Entitlements::contract(),
        'dailyOsLimitMinutes' => OsUsageRepository::dailyLimit(),
        'readOnly' => false,
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');
$contractPath = 'etc/capsuleos/contracts/portal-entitlements.json';
$gate = 'usr/lib/capsuleos/tools/validate-portal-contracts.mjs';

if ($action === 'update_level') {
    $levelId = (string) ($payload['levelId'] ?? '');
    if ($levelId === '') {
        ApiJson::error('levelId requis');
    }
    $result = ContractWriter::updateJson(
        $contractPath,
        static function (array $data) use ($levelId, $payload): array {
            foreach ($data['levels'] ?? [] as $i => $level) {
                if (!is_array($level) || ($level['id'] ?? '') !== $levelId) {
                    continue;
                }
                if (isset($payload['label'])) {
                    $data['levels'][$i]['label'] = trim((string) $payload['label']);
                }
                if (isset($payload['planId'])) {
                    $data['levels'][$i]['planId'] = trim((string) $payload['planId']);
                }
                break;
            }
            if (!isset($data['osSession']) || !is_array($data['osSession'])) {
                $data['osSession'] = [];
            }
            $row = is_array($data['osSession'][$levelId] ?? null) ? $data['osSession'][$levelId] : [];
            foreach (['maxMinutesPerOsPerDay', 'maxMinutes'] as $minuteKey) {
                if (array_key_exists($minuteKey, $payload)) {
                    $value = $payload[$minuteKey];
                    $row[$minuteKey] = ($value === null || $value === '') ? null : max(0, (int) $value);
                }
            }
            foreach (['allCatalogOs', 'pedagogicalModules', 'storeBrowse', 'storeAppLaunch'] as $flag) {
                if (array_key_exists($flag, $payload)) {
                    $row[$flag] = (bool) $payload[$flag];
                }
            }
            $data['osSession'][$levelId] = $row;
            return $data;
        },
        $gate,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'entitlements_update_level', 'entitlements', $levelId, []);
    ApiJson::ok(['ok' => true]);
}

if ($action === 'update_module_access') {
    $key = (string) ($payload['key'] ?? '');
    if ($key === '') {
        ApiJson::error('key requis');
    }
    $levels = is_array($payload['levels'] ?? null)
        ? array_values(array_unique(array_filter(array_map('strval', $payload['levels']))))
        : [];
    $result = ContractWriter::updateJson(
        $contractPath,
        static function (array $data) use ($key, $levels): array {
            if (!isset($data['moduleAccess']) || !is_array($data['moduleAccess'])) {
                $data['moduleAccess'] = [];
            }
            $data['moduleAccess'][$key] = $levels;
            return $data;
        },
        $gate,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'entitlements_update_module_access', 'entitlements', $key, []);
    ApiJson::ok(['ok' => true]);
}

ApiJson::error('Action inconnue');
