<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Database;
use CapsuleOS\Portal\DatabaseMigrator;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\PortalRuntime;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    ApiJson::ok(PortalRuntime::status());
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

if ($action === 'run_migrations') {
    $before = PortalRuntime::status();
    try {
        $driver = Database::driver();
        $sqlitePath = $driver === 'sqlite' ? Config::sqlite() : null;
        DatabaseMigrator::migrate(Database::connection(), $driver, $sqlitePath);
    } catch (\Throwable $e) {
        ApiJson::error('Migration impossible : ' . $e->getMessage());
    }
    $after = PortalRuntime::status();
    AdminAuditRepository::log($actorId, 'runtime_migrate', 'runtime', 'schema_migrations', [
        'from' => $before['schemaVersion'] ?? null,
        'to' => $after['schemaVersion'] ?? null,
    ]);
    ApiJson::ok(['ok' => true, 'status' => $after]);
}

ApiJson::error('Action inconnue');
