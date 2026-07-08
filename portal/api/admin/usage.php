<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Usage\OsUsageRepository;

AdminGuard::require();

$date = (string) ($_GET['date'] ?? OsUsageRepository::todayDate());
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
$offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;

ApiJson::ok([
    'usageDate' => $date,
    'limitMinutes' => OsUsageRepository::dailyLimit(),
    'resetsAt' => OsUsageRepository::resetsAt(),
    'total' => OsUsageRepository::countForDate($date),
    'entries' => OsUsageRepository::listForAdmin([
        'date' => $date,
        'limit' => $limit,
        'offset' => $offset,
    ]),
]);
