<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Support\TicketRepository;
use CapsuleOS\Portal\User\RoleRepository;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $ticketId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($ticketId > 0) {
        $ticket = TicketRepository::findById($ticketId);
        if ($ticket === null) {
            ApiJson::error('Ticket introuvable', 404);
        }
        ApiJson::ok(['ticket' => TicketRepository::formatTicketForApi($ticket, true, true)]);
    }
    ApiJson::ok([
        'tickets' => array_map(
            static fn (array $row): array => TicketRepository::formatTicketForApi($row, false),
            TicketRepository::listAll([
                'status' => (string) ($_GET['status'] ?? ''),
                'type' => (string) ($_GET['type'] ?? ''),
                'limit' => isset($_GET['limit']) ? (int) $_GET['limit'] : 100,
                'offset' => isset($_GET['offset']) ? (int) $_GET['offset'] : 0,
            ]),
        ),
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');
$ticketId = (int) ($payload['ticketId'] ?? 0);
if ($ticketId <= 0) {
    ApiJson::error('Ticket invalide');
}
$ticket = TicketRepository::findById($ticketId);
if ($ticket === null) {
    ApiJson::error('Ticket introuvable', 404);
}

if ($action === 'reply') {
    $body = trim((string) ($payload['body'] ?? ''));
    if ($body === '') {
        ApiJson::error('Message requis');
    }
    $currentStatus = strtolower((string) ($ticket['status'] ?? ''));
    if ($currentStatus === 'ouvert') {
        ApiJson::error('Prenez le ticket en charge avant de répondre.');
    }
    TicketRepository::addMessage($ticketId, 'admin', $actorId, $body);
    AdminAuditRepository::log($actorId, 'ticket_reply', 'ticket', (string) $ticketId, []);
    $updated = TicketRepository::findById($ticketId);
    ApiJson::ok(['ok' => true, 'ticket' => $updated !== null ? TicketRepository::formatTicketForApi($updated, true, true) : null]);
}

if ($action === 'close') {
    TicketRepository::updateStatus($ticketId, 'ferme');
    AdminAuditRepository::log($actorId, 'ticket_close', 'ticket', (string) $ticketId, []);
    $updated = TicketRepository::findById($ticketId);
    ApiJson::ok(['ok' => true, 'ticket' => $updated !== null ? TicketRepository::formatTicketForApi($updated, true, true) : null]);
}

if ($action === 'take_charge') {
    $currentStatus = strtolower((string) ($ticket['status'] ?? ''));
    if (TicketRepository::isClosed($currentStatus)) {
        ApiJson::error('Ce ticket est déjà clôturé');
    }
    if ($currentStatus === 'en_cours') {
        ApiJson::error('Ce ticket est déjà en cours de traitement');
    }
    TicketRepository::updateStatus($ticketId, 'en_cours');
    TicketRepository::addSystemMessage($ticketId, 'Ticket pris en charge par le support CapsuleOS.');
    AdminAuditRepository::log($actorId, 'ticket_take_charge', 'ticket', (string) $ticketId, []);
    $updated = TicketRepository::findById($ticketId);
    ApiJson::ok(['ok' => true, 'ticket' => $updated !== null ? TicketRepository::formatTicketForApi($updated, true, true) : null]);
}

if ($action === 'reopen') {
    TicketRepository::updateStatus($ticketId, 'ouvert');
    AdminAuditRepository::log($actorId, 'ticket_reopen', 'ticket', (string) $ticketId, []);
    $updated = TicketRepository::findById($ticketId);
    ApiJson::ok(['ok' => true, 'ticket' => $updated !== null ? TicketRepository::formatTicketForApi($updated, true, true) : null]);
}

if ($action === 'grant_createur') {
    $userId = (int) ($ticket['user_id'] ?? 0);
    if ($userId > 0) {
        RoleRepository::grant($userId, 'createur', 'admin:' . $actorId);
        AdminAuditRepository::log($actorId, 'grant_role', 'user', (string) $userId, ['role' => 'createur', 'via' => 'ticket']);
    }
    TicketRepository::updateStatus($ticketId, 'ferme');
    AdminAuditRepository::log($actorId, 'ticket_close', 'ticket', (string) $ticketId, ['grantCreateur' => true]);
    $updated = TicketRepository::findById($ticketId);
    ApiJson::ok(['ok' => true, 'ticket' => $updated !== null ? TicketRepository::formatTicketForApi($updated, true, true) : null]);
}

ApiJson::error('Action inconnue');
