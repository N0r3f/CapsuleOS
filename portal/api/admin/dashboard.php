<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\DashboardStats;
use CapsuleOS\Portal\Http\ApiJson;

AdminGuard::require();
ApiJson::ok(DashboardStats::summary());
