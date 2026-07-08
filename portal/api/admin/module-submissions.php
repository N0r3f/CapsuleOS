<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Creator\ModuleSubmissionPublisher;
use CapsuleOS\Portal\Creator\ModuleSubmissionRepository;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Support\TicketRepository;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $submissionId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($submissionId > 0) {
        $row = ModuleSubmissionRepository::findById($submissionId);
        if ($row === null) {
            ApiJson::error('Soumission introuvable', 404);
        }
        ApiJson::ok(['submission' => ModuleSubmissionRepository::formatForApi($row)]);
    }
    ApiJson::ok([
        'submissions' => array_map(
            static fn (array $row): array => ModuleSubmissionRepository::formatForApi($row),
            ModuleSubmissionRepository::listAll([
                'autoStatus' => (string) ($_GET['autoStatus'] ?? ''),
                'adminStatus' => (string) ($_GET['adminStatus'] ?? ''),
                'limit' => isset($_GET['limit']) ? (int) $_GET['limit'] : 100,
            ]),
        ),
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');
$submissionId = (int) ($payload['submissionId'] ?? 0);
if ($submissionId <= 0) {
    ApiJson::error('Soumission invalide');
}
$submission = ModuleSubmissionRepository::findById($submissionId);
if ($submission === null) {
    ApiJson::error('Soumission introuvable', 404);
}
$ticketId = (int) ($submission['ticket_id'] ?? 0);

if ($action === 'take_dev_review') {
    ModuleSubmissionRepository::setAdminStatus($submissionId, 'in_dev');
    if ($ticketId > 0) {
        TicketRepository::updateStatus($ticketId, 'en_cours');
    }
    AdminAuditRepository::log($actorId, 'module_submission_dev', 'submission', (string) $submissionId, []);
    ApiJson::ok(['ok' => true, 'submission' => ModuleSubmissionRepository::formatForApi(
        ModuleSubmissionRepository::findById($submissionId) ?? $submission,
    )]);
}

if ($action === 'approve_dev') {
    $message = trim((string) ($payload['message'] ?? ''));
    if ($message === '') {
        ApiJson::error('Message d\'approbation de l\'ajout du module requis');
    }
    ModuleSubmissionRepository::setAdminStatus($submissionId, 'approved', $message);
    if ($ticketId > 0) {
        TicketRepository::updateStatus($ticketId, 'en_cours');
        $ticketBody = "Approbation de l'ajout du module\n\n" . $message;
        TicketRepository::addMessage($ticketId, 'admin', $actorId, $ticketBody);
    }
    AdminAuditRepository::log($actorId, 'module_submission_approve', 'submission', (string) $submissionId, []);
    ApiJson::ok(['ok' => true, 'submission' => ModuleSubmissionRepository::formatForApi(
        ModuleSubmissionRepository::findById($submissionId) ?? $submission,
    )]);
}

if ($action === 'reject') {
    $message = trim((string) ($payload['message'] ?? $payload['notes'] ?? ''));
    if ($message === '') {
        ApiJson::error('Raison du refus de l\'ajout du module requise');
    }
    ModuleSubmissionRepository::setAdminStatus($submissionId, 'rejected', $message);
    if ($ticketId > 0) {
        // Le ticket reste ouvert : le créateur peut répondre et corriger son module.
        TicketRepository::updateStatus($ticketId, 'en_cours');
        $ticketBody = "Refus de l'ajout du module\n\n" . $message;
        TicketRepository::addMessage($ticketId, 'admin', $actorId, $ticketBody);
    }
    AdminAuditRepository::log($actorId, 'module_submission_reject', 'submission', (string) $submissionId, ['notes' => $message]);
    ApiJson::ok(['ok' => true, 'submission' => ModuleSubmissionRepository::formatForApi(
        ModuleSubmissionRepository::findById($submissionId) ?? $submission,
    )]);
}

if ($action === 'publish_module') {
    $overrides = [];
    if (!empty($payload['mountId'])) {
        $overrides['mountId'] = trim((string) $payload['mountId']);
    }
    if (!empty($payload['billingType'])) {
        $overrides['billingType'] = trim((string) $payload['billingType']);
    }
    if (array_key_exists('priceDisplay', $payload)) {
        $overrides['priceDisplay'] = trim((string) $payload['priceDisplay']);
    }
    $result = ModuleSubmissionPublisher::publish($submissionId, $actorId, $overrides);
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Publication échouée'));
    }
    ApiJson::ok([
        'ok' => true,
        'mountId' => (string) ($result['mountId'] ?? ''),
        'submission' => ModuleSubmissionRepository::formatForApi(
            ModuleSubmissionRepository::findById($submissionId) ?? $submission,
        ),
    ]);
}

ApiJson::error('Action inconnue');
