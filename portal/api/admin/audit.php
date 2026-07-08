<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Http\ApiJson;

AdminGuard::require();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    ApiJson::ok([
        'entries' => AdminAuditRepository::list([
            'action' => (string) ($_GET['action'] ?? ''),
            'limit' => isset($_GET['limit']) ? (int) $_GET['limit'] : 100,
            'offset' => isset($_GET['offset']) ? (int) $_GET['offset'] : 0,
        ]),
    ]);
}

ApiJson::error('Méthode non autorisée', 405);
