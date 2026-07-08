<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\ContractWriter;
use CapsuleOS\Portal\Catalog\PortalContentReader;
use CapsuleOS\Portal\Http\ApiJson;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    ApiJson::ok(['content' => PortalContentReader::load()]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$section = (string) ($payload['section'] ?? '');
$allowed = ['hero', 'about', 'parcours'];
if (!in_array($section, $allowed, true)) {
    ApiJson::error('Section invalide');
}

$result = ContractWriter::updateJson(
    'etc/capsuleos/contracts/portal-content.json',
    static function (array $data) use ($section, $payload): array {
        $block = is_array($data[$section] ?? null) ? $data[$section] : [];
        $fields = is_array($payload['fields'] ?? null) ? $payload['fields'] : [];
        foreach ($fields as $key => $value) {
            if ($key === 'paragraphs' && is_array($value)) {
                $block['paragraphs'] = array_values(array_filter(array_map('strval', $value)));
            } elseif ($key === 'features' && is_array($value)) {
                $features = [];
                foreach ($value as $feature) {
                    if (!is_array($feature)) {
                        continue;
                    }
                    $title = trim((string) ($feature['title'] ?? ''));
                    $description = trim((string) ($feature['description'] ?? ''));
                    if ($title === '') {
                        continue;
                    }
                    $icon = trim((string) ($feature['icon'] ?? ''));
                    if ($icon !== '' && !preg_match('/^[a-z0-9-]+$/', $icon)) {
                        $icon = '';
                    }
                    $row = ['title' => $title, 'description' => $description];
                    if ($icon !== '') {
                        $row['icon'] = $icon;
                    }
                    $features[] = $row;
                }
                $block['features'] = $features;
            } elseif ($key === 'lead' && is_string($value)) {
                $lead = trim($value);
                $block['lead'] = $lead;
                $block['paragraphs'] = $lead !== '' ? [$lead] : [];
            } elseif (is_string($key)) {
                $block[$key] = is_string($value) ? trim($value) : $value;
            }
        }
        $data[$section] = $block;
        return $data;
    },
    'usr/lib/capsuleos/tools/validate-portal-contracts.mjs',
);
if (!$result['ok']) {
    ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
}
PortalContentReader::resetCache();
AdminAuditRepository::log($actorId, 'content_update', 'content', $section, []);
ApiJson::ok(['ok' => true, 'content' => PortalContentReader::load()]);
