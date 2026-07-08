<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Catalog\AccessibilityCatalog;
use CapsuleOS\Portal\PortalContext;

$a11y = AccessibilityCatalog::load();
$pageTitle = (string) ($a11y['pageTitle'] ?? 'Accessibilité');
$ctx = PortalContext::fromRequest($pageTitle . ' · CapsuleOS');
portal_render('layout-accessibility.php', $ctx, [
    'accessibility' => $a11y,
    'pageHeading' => $pageTitle,
]);
