<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Gamification\GamificationRepository;
use CapsuleOS\Portal\Http\ApiJson;

AdminGuard::require();

$query = (string) ($_GET['q'] ?? '');
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 50;
$offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;

ApiJson::ok([
    'badgeCatalog' => GamificationRepository::badgeCatalog(),
    'badgeTotal' => GamificationRepository::badgeTotal(),
    'contract' => [
        'xpPerLevel' => (int) (GamificationRepository::contract()['xpPerLevel'] ?? 100),
        'maxLevel' => (int) (GamificationRepository::contract()['maxLevel'] ?? 50),
    ],
    'total' => GamificationRepository::countForAdmin($query !== '' ? $query : null),
    'users' => GamificationRepository::listForAdmin([
        'q' => $query,
        'limit' => $limit,
        'offset' => $offset,
    ]),
]);
