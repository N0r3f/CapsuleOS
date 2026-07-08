<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\PortalContext;

AdminGuard::require();

$ctx = PortalContext::fromRequest('Administration · CapsuleOS');
portal_render('layout-admin.php', $ctx, [
    'bodyClass' => 'portal-admin-page',
    'layoutWide' => true,
    'heading' => 'Administration',
    'adminPartial' => 'admin/shell.php',
    'sections' => AdminGuard::sections(),
]);
