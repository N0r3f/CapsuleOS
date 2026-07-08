<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Creator\ModuleSubmissionRepository;
use CapsuleOS\Portal\Creator\ModuleSubmissionValidator;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Subscription\GradeResolver;
use CapsuleOS\Portal\Support\TicketRepository;
use CapsuleOS\Portal\User\RoleRepository;

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$userId = ApiJson::requireAuth();

if ($method === 'GET') {
    $tickets = [];
    foreach (TicketRepository::listForUser($userId) as $row) {
        if (!is_array($row)) {
            continue;
        }
        $formatted = TicketRepository::formatTicketForApi($row);
        if (($formatted['type'] ?? '') === 'demande_module') {
            $sub = ModuleSubmissionRepository::findByTicketId((int) ($row['id'] ?? 0));
            if (is_array($sub)) {
                $formatted['moduleSubmission'] = ModuleSubmissionRepository::formatForApi($sub);
            }
        }
        $tickets[] = $formatted;
    }
    ApiJson::ok([
        'tickets' => $tickets,
        'types' => GradeResolver::ticketTypesForUser($userId),
        'submissionContract' => ModuleSubmissionRepository::contract(),
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);

$action = (string) ($payload['action'] ?? 'create');

if ($action === 'reply') {
    $ticketId = (int) ($payload['ticketId'] ?? 0);
    $body = trim((string) ($payload['body'] ?? ''));
    if ($ticketId <= 0) {
        ApiJson::error('Ticket invalide');
    }
    if ($body === '') {
        ApiJson::error('Message requis');
    }
    $ticket = TicketRepository::findForUser($ticketId, $userId);
    if ($ticket === null) {
        ApiJson::error('Ticket introuvable', 404);
    }
    if (TicketRepository::isClosed((string) ($ticket['status'] ?? ''))) {
        ApiJson::error('Ticket fermé');
    }
    TicketRepository::addMessage($ticketId, 'user', $userId, $body);
    $updated = TicketRepository::findForUser($ticketId, $userId);
    ApiJson::ok([
        'ok' => true,
        'ticket' => $updated !== null ? TicketRepository::formatTicketForApi($updated) : null,
    ]);
}

$type = (string) ($payload['type'] ?? 'support');
$subject = trim((string) ($payload['subject'] ?? ''));
$body = trim((string) ($payload['body'] ?? ''));

$allowedTypes = array_map(
    static fn ($t) => is_array($t) ? (string) ($t['id'] ?? '') : '',
    GradeResolver::ticketTypesForUser($userId),
);
if (!in_array($type, $allowedTypes, true)) {
    ApiJson::error('Type de ticket invalide');
}

$submissionPayload = is_array($payload['submission'] ?? null) ? $payload['submission'] : null;
if ($type === 'demande_module') {
    if (!RoleRepository::hasRole($userId, 'createur')) {
        ApiJson::error('Rôle Créateur requis', 403);
    }
    if ($submissionPayload === null) {
        ApiJson::error('Soumission module requise');
    }
    $validationError = ModuleSubmissionRepository::validateSubmissionPayload($submissionPayload);
    if ($validationError !== null) {
        ApiJson::error($validationError);
    }
    if ($subject === '') {
        $subject = 'Demande d\'ajout de module';
    }
    $body = ModuleSubmissionRepository::buildTicketBody($submissionPayload);
} else {
    if ($subject === '') {
        ApiJson::error('Sujet requis');
    }
    if ($body === '') {
        ApiJson::error('Message requis');
    }
}

$id = TicketRepository::create($userId, $type, $subject, $body);
$submissionId = 0;
if ($type === 'demande_module' && $submissionPayload !== null) {
    $submissionId = ModuleSubmissionRepository::create($id, $userId, $submissionPayload);
    ModuleSubmissionValidator::queue($submissionId);
}

$created = TicketRepository::findForUser($id, $userId);
$ticketOut = $created !== null ? TicketRepository::formatTicketForApi($created) : [
    'id' => $id,
    'type' => $type,
    'subject' => $subject,
    'body' => $body,
    'status' => 'ouvert',
    'createdAt' => gmdate('Y-m-d H:i:s'),
    'messages' => [],
];
if ($submissionId > 0) {
    $sub = ModuleSubmissionRepository::findById($submissionId);
    if (is_array($sub)) {
        $ticketOut['moduleSubmission'] = ModuleSubmissionRepository::formatForApi($sub);
    }
}

ApiJson::ok([
    'ok' => true,
    'submissionId' => $submissionId > 0 ? $submissionId : null,
    'ticket' => $ticketOut,
], 201);
