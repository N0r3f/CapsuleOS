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
$path = Config::contracts() . '/portal-offers.json';

if ($method === 'GET') {
    if (!is_file($path)) {
        ApiJson::error('Contrat offres introuvable', 500);
    }
    $data = json_decode((string) file_get_contents($path), true);
    ApiJson::ok(['offers' => is_array($data) ? $data : []]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

if ($action === 'update_plan') {
    $planId = (string) ($payload['planId'] ?? '');
    if ($planId === '') {
        ApiJson::error('planId requis');
    }
    $result = ContractWriter::updateJson(
        'etc/capsuleos/contracts/portal-offers.json',
        static function (array $data) use ($planId, $payload): array {
            foreach ($data['plans'] ?? [] as $i => $plan) {
                if (!is_array($plan) || ($plan['id'] ?? '') !== $planId) {
                    continue;
                }
                if (isset($payload['label'])) {
                    $data['plans'][$i]['label'] = trim((string) $payload['label']);
                }
                if (isset($payload['description'])) {
                    $data['plans'][$i]['description'] = trim((string) $payload['description']);
                }
                if (array_key_exists('priceMonthly', $payload)) {
                    $val = $payload['priceMonthly'];
                    $data['plans'][$i]['priceMonthly'] = $val === null ? null : (int) $val;
                }
                if (isset($payload['priceDisplay'])) {
                    $data['plans'][$i]['priceDisplay'] = trim((string) $payload['priceDisplay']);
                }
                if (isset($payload['features']) && is_array($payload['features'])) {
                    $data['plans'][$i]['features'] = array_values(array_filter(array_map('strval', $payload['features'])));
                }
                break;
            }
            return $data;
        },
        'usr/lib/capsuleos/tools/validate-portal-contracts.mjs',
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'offers_update_plan', 'plan', $planId, []);
    ApiJson::ok(['ok' => true]);
}

if ($action === 'update_section') {
    $result = ContractWriter::updateJson(
        'etc/capsuleos/contracts/portal-offers.json',
        static function (array $data) use ($payload): array {
            if (isset($payload['sectionEyebrow'])) {
                $data['sectionEyebrow'] = trim((string) $payload['sectionEyebrow']);
            }
            if (isset($payload['sectionTitle'])) {
                $data['sectionTitle'] = trim((string) $payload['sectionTitle']);
            }
            if (isset($payload['sectionLead'])) {
                $data['sectionLead'] = trim((string) $payload['sectionLead']);
            }
            return $data;
        },
        'usr/lib/capsuleos/tools/validate-portal-contracts.mjs',
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'offers_update_section', 'offers', 'section', []);
    ApiJson::ok(['ok' => true]);
}

ApiJson::error('Action inconnue');
