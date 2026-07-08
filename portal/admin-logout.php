<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AdminAuthService;

AdminAuthService::logout();
portal_admin_redirect('login');
