<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Catalog\LegalCatalog;
use CapsuleOS\Portal\PortalContext;

$legal = LegalCatalog::load();
$pageTitle = (string) ($legal['pageTitle'] ?? 'Informations légales');
$ctx = PortalContext::fromRequest($pageTitle . ' · CapsuleOS');
portal_render('layout-legal.php', $ctx, [
    'legal' => $legal,
    'pageHeading' => $pageTitle,
]);
