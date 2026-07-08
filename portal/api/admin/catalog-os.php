<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\ContractWriter;
use CapsuleOS\Portal\Catalog\OsRegistryReader;
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\ApiJson;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $registry = OsRegistryReader::load();
    $entries = is_array($registry['entries'] ?? null) ? $registry['entries'] : [];
    $out = [];
    foreach ($entries as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $out[] = [
            'id' => (string) ($entry['id'] ?? ''),
            'displayName' => (string) ($entry['displayName'] ?? ''),
            'family' => (string) ($entry['family'] ?? ''),
            'status' => (string) ($entry['status'] ?? ''),
            'tier' => (string) ($entry['tier'] ?? ''),
            'portalOrder' => (int) ($entry['portalOrder'] ?? 0),
            'portalFeatured' => !empty($entry['portalFeatured']),
        ];
    }
    usort($out, static fn (array $a, array $b): int => ($a['portalOrder'] <=> $b['portalOrder']) ?: strcmp($a['displayName'], $b['displayName']));
    ApiJson::ok(['entries' => $out]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$registryId = (string) ($payload['registryId'] ?? '');
if ($registryId === '') {
    ApiJson::error('registryId requis');
}
$action = (string) ($payload['action'] ?? '');

// Gate structurelle rapide : ces écritures ne touchent qu'aux métadonnées de
// présentation portail (statut, ordre, vedette, nom). On valide que le registre
// reste structurellement cohérent sans relancer les gates noyau lourdes
// (façades, embeds, taxonomie) de validate-capsule.mjs qui prennent ~50 s et
// dépassent le max_execution_time PHP.
$quickGateRel = 'usr/lib/capsuleos/tools/validate-os-registry-quick.mjs';
$quickGate = Config::root() . '/' . $quickGateRel;
$gateScript = is_file($quickGate) ? $quickGateRel : null;

$rebuildPickOs = static function (): ?string {
    $pickOsBuild = Config::root() . '/usr/lib/capsuleos/tools/build-pick-os.mjs';
    if (!is_file($pickOsBuild)) {
        return null;
    }
    $cmd = 'node ' . escapeshellarg($pickOsBuild) . ' 2>&1';
    exec($cmd, $pickOsOut, $pickOsCode);
    if ($pickOsCode !== 0) {
        return implode("\n", $pickOsOut) ?: 'Échec régénération pick-os.js';
    }
    return null;
};

if ($action === 'update_status') {
    $status = (string) ($payload['status'] ?? '');
    $allowed = ['active', 'planned', 'stub'];
    if ($status === 'hidden') {
        $status = 'stub';
    }
    if (!in_array($status, $allowed, true)) {
        ApiJson::error('Statut invalide');
    }
    $result = ContractWriter::updateJson(
        'etc/capsuleos/os-registry.json',
        static function (array $data) use ($registryId, $status): array {
            foreach ($data['entries'] ?? [] as $i => $entry) {
                if (is_array($entry) && ($entry['id'] ?? '') === $registryId) {
                    $data['entries'][$i]['status'] = $status;
                    break;
                }
            }
            return $data;
        },
        $gateScript,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    OsRegistryReader::resetCache();
    AdminAuditRepository::log($actorId, 'os_update_status', 'os', $registryId, ['status' => $status]);
    $pickOsError = $rebuildPickOs();
    ApiJson::ok($pickOsError !== null ? ['ok' => true, 'warning' => $pickOsError] : ['ok' => true]);
}

if ($action === 'update_portal_meta') {
    $displayName = trim((string) ($payload['displayName'] ?? ''));
    $portalOrder = (int) ($payload['portalOrder'] ?? 0);
    $portalFeatured = !empty($payload['portalFeatured']);
    $result = ContractWriter::updateJson(
        'etc/capsuleos/os-registry.json',
        static function (array $data) use ($registryId, $displayName, $portalOrder, $portalFeatured): array {
            foreach ($data['entries'] ?? [] as $i => $entry) {
                if (is_array($entry) && ($entry['id'] ?? '') === $registryId) {
                    if ($displayName !== '') {
                        $data['entries'][$i]['displayName'] = $displayName;
                    }
                    $data['entries'][$i]['portalOrder'] = $portalOrder;
                    $data['entries'][$i]['portalFeatured'] = $portalFeatured;
                    break;
                }
            }
            return $data;
        },
        $gateScript,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    OsRegistryReader::resetCache();
    AdminAuditRepository::log($actorId, 'os_update_meta', 'os', $registryId, [
        'displayName' => $displayName,
        'portalOrder' => $portalOrder,
        'portalFeatured' => $portalFeatured,
    ]);
    $pickOsError = $rebuildPickOs();
    ApiJson::ok($pickOsError !== null ? ['ok' => true, 'warning' => $pickOsError] : ['ok' => true]);
}

ApiJson::error('Action inconnue');
