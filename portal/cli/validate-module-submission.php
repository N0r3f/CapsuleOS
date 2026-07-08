<?php

declare(strict_types=1);

define('CAPSULE_PORTAL_CLI', true);
require dirname(__DIR__, 2) . '/srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Creator\ModuleSubmissionValidator;

$id = isset($argv[1]) ? (int) $argv[1] : 0;
if ($id <= 0) {
    fwrite(STDERR, "Usage: php validate-module-submission.php <submissionId>\n");
    exit(1);
}
ModuleSubmissionValidator::run($id);
