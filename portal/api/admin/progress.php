<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Progress\ProgressRepository;

AdminGuard::require();

$userId = isset($_GET['userId']) ? (int) $_GET['userId'] : 0;
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
$offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
$filters = ['limit' => $limit, 'offset' => $offset];
if ($userId > 0) {
    $filters['userId'] = $userId;
}

ApiJson::ok([
    'total' => ProgressRepository::countAll($userId > 0 ? $userId : null),
    'entries' => ProgressRepository::listAll($filters),
]);
