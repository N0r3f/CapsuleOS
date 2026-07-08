<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\ContractWriter;
use CapsuleOS\Portal\Catalog\ModuleCatalogAdminFormatter;
use CapsuleOS\Portal\Catalog\ModuleCatalogAdminLister;
use CapsuleOS\Portal\Catalog\ModuleCatalogRepository;
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\ModuleCatalogSync;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$root = Config::root();
$relational = Config::usesRelationalCatalog() && ModuleCatalogRepository::isAvailable();

if ($method === 'GET') {
    $modules = ModuleCatalogAdminLister::listAll($root, $relational);
    ApiJson::ok([
        'modules' => ModuleCatalogAdminFormatter::enrichAll($modules),
        'source' => $relational ? 'database' : 'files',
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

if ($action === 'sync_from_files') {
    if (!$relational) {
        ApiJson::error('Sync catalogue réservée au mode PostgreSQL');
    }
    $count = ModuleCatalogSync::syncFromFiles();
    AdminAuditRepository::log($actorId, 'module_catalog_sync', 'catalog', 'portal_module_catalog', ['count' => $count]);
    ApiJson::ok(['ok' => true, 'synced' => $count]);
}

$mountId = trim((string) ($payload['mountId'] ?? ''));
if ($mountId === '' || !preg_match('#^[a-z0-9_-]+/[a-z0-9_-]+$#', $mountId)) {
    ApiJson::error('mountId invalide');
}
$parts = explode('/', $mountId, 2);
$manifestRel = 'mnt/' . $parts[0] . '/' . $parts[1] . '/module.json';
$manifestPath = $root . '/' . $manifestRel;
if (!is_file($manifestPath) && !$relational) {
    ApiJson::error('Module introuvable', 404);
}
$gate = 'usr/lib/capsuleos/tools/validate-pedagogical-modules.mjs';

if ($action === 'update_access') {
    $access = (string) ($payload['access'] ?? '');
    $allowed = ['free', 'registered', 'subscriber', 'class'];
    if (!in_array($access, $allowed, true)) {
        ApiJson::error('Accès invalide');
    }
    if ($relational) {
        if (!ModuleCatalogRepository::updateAccess($mountId, $access)) {
            ModuleCatalogSync::syncFromFiles();
            ModuleCatalogRepository::updateAccess($mountId, $access);
        }
    }
    $result = ContractWriter::updateJson(
        $manifestRel,
        static function (array $data) use ($access): array {
            $data['access'] = $access;
            return $data;
        },
        is_file($root . '/' . $gate) ? $gate : null,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'module_update_access', 'module', $mountId, ['access' => $access]);
    ApiJson::ok(['ok' => true]);
}

if ($action === 'update_meta') {
    $title = trim((string) ($payload['title'] ?? ''));
    $description = trim((string) ($payload['description'] ?? ''));
    $registryIds = $payload['registryIds'] ?? null;
    if ($relational) {
        ModuleCatalogRepository::updateMeta(
            $mountId,
            $title !== '' ? $title : null,
            $description !== '' ? $description : null,
            is_array($registryIds) ? $registryIds : null,
        );
    }
    $result = ContractWriter::updateJson(
        $manifestRel,
        static function (array $data) use ($title, $description, $registryIds): array {
            if ($title !== '') {
                $data['title'] = $title;
            }
            if ($description !== '') {
                $data['description'] = $description;
            }
            if (is_array($registryIds)) {
                $data['registryIds'] = array_values(array_filter(array_map('strval', $registryIds)));
            }
            return $data;
        },
        is_file($root . '/' . $gate) ? $gate : null,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'module_update_meta', 'module', $mountId, ['title' => $title]);
    ApiJson::ok(['ok' => true]);
}

if ($action === 'update_price') {
    $priceDisplay = trim((string) ($payload['priceDisplay'] ?? ''));
    $result = ContractWriter::updateJson(
        $manifestRel,
        static function (array $data) use ($priceDisplay): array {
            if ($priceDisplay === '') {
                unset($data['priceDisplay'], $data['price'], $data['modulePrice']);
                return $data;
            }
            $data['priceDisplay'] = $priceDisplay;
            $data['price'] = $priceDisplay;
            unset($data['modulePrice']);
            return $data;
        },
        is_file($root . '/' . $gate) ? $gate : null,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'module_update_price', 'module', $mountId, ['priceDisplay' => $priceDisplay]);
    $row = ModuleCatalogAdminLister::rowForMount($root, $mountId, $relational);
    if ($row === null) {
        ApiJson::error('Module introuvable', 404);
    }
    ApiJson::ok(['ok' => true, 'module' => ModuleCatalogAdminFormatter::enrich($row)]);
}

if ($action === 'update_billing') {
    $mode = (string) ($payload['billingMode'] ?? '');
    if (!in_array($mode, ['subscription', 'purchase'], true)) {
        ApiJson::error('Mode de facturation invalide');
    }
    $priceDisplay = trim((string) ($payload['priceDisplay'] ?? ''));
    if ($mode === 'purchase' && $priceDisplay === '') {
        ApiJson::error('Indiquez un prix pour un module en achat payant.');
    }
    if ($relational) {
        ModuleCatalogRepository::updateAccess($mountId, 'subscriber');
    }
    $result = ContractWriter::updateJson(
        $manifestRel,
        static function (array $data) use ($mode, $priceDisplay): array {
            $data['access'] = 'subscriber';
            if ($mode === 'subscription') {
                unset($data['priceDisplay'], $data['price'], $data['modulePrice']);
                return $data;
            }
            $data['priceDisplay'] = $priceDisplay;
            $data['price'] = $priceDisplay;
            unset($data['modulePrice']);
            return $data;
        },
        is_file($root . '/' . $gate) ? $gate : null,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'module_update_billing', 'module', $mountId, [
        'billingMode' => $mode,
        'priceDisplay' => $priceDisplay,
    ]);
    $row = ModuleCatalogAdminLister::rowForMount($root, $mountId, $relational);
    if ($row === null) {
        ApiJson::error('Module introuvable', 404);
    }
    ApiJson::ok(['ok' => true, 'module' => ModuleCatalogAdminFormatter::enrich($row)]);
}

if ($action === 'toggle_catalog') {
    $inCatalog = !empty($payload['inCatalog']);
    if ($relational) {
        ModuleCatalogRepository::setInCatalog($mountId, $inCatalog);
    }
    $catalogRel = 'mnt/catalog.json';
    $result = ContractWriter::updateJson(
        $catalogRel,
        static function (array $data) use ($parts, $inCatalog): array {
            $levelPath = $parts[0];
            $moduleId = $parts[1];
            $found = false;
            foreach ($data['levels'] ?? [] as $li => $levelEntry) {
                if (!is_array($levelEntry)) {
                    continue;
                }
                $path = (string) ($levelEntry['path'] ?? $levelEntry['id'] ?? '');
                if ($path !== $levelPath) {
                    continue;
                }
                $mods = is_array($levelEntry['modules'] ?? null) ? $levelEntry['modules'] : [];
                $mods = array_values(array_filter(array_map('strval', $mods)));
                if ($inCatalog) {
                    if (!in_array($moduleId, $mods, true)) {
                        $mods[] = $moduleId;
                    }
                } else {
                    $mods = array_values(array_filter($mods, static fn (string $m): bool => $m !== $moduleId));
                }
                $data['levels'][$li]['modules'] = $mods;
                $found = true;
                break;
            }
            if (!$found && $inCatalog) {
                $data['levels'][] = ['id' => $levelPath, 'path' => $levelPath, 'modules' => [$moduleId]];
            }
            return $data;
        },
        is_file($root . '/' . $gate) ? $gate : null,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AdminAuditRepository::log($actorId, 'module_toggle_catalog', 'module', $mountId, ['inCatalog' => $inCatalog]);
    ApiJson::ok(['ok' => true]);
}

ApiJson::error('Action inconnue');
