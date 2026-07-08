<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\ContractWriter;
use CapsuleOS\Portal\Catalog\AccessibilityCatalog;
use CapsuleOS\Portal\Http\ApiJson;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$gate = 'usr/lib/capsuleos/tools/validate-portal-contracts.mjs';

if ($method === 'GET') {
    ApiJson::ok([
        'accessibility' => AccessibilityCatalog::load(),
        'sections' => AccessibilityCatalog::sections(),
        'readOnly' => false,
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

if ($action === 'update_page') {
    $pageTitle = trim((string) ($payload['pageTitle'] ?? ''));
    $intro = trim((string) ($payload['intro'] ?? ''));
    $contactEmail = trim((string) ($payload['contactEmail'] ?? ''));
    if ($pageTitle === '') {
        ApiJson::error('Le titre de page ne peut pas être vide.');
    }
    if ($intro === '') {
        ApiJson::error('L\'introduction ne peut pas être vide.');
    }
    if ($contactEmail === '' || !filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
        ApiJson::error('Adresse e-mail de contact invalide.');
    }
    $result = ContractWriter::updateJson(
        'etc/capsuleos/contracts/portal-accessibility.json',
        static function (array $data) use ($pageTitle, $intro, $contactEmail): array {
            $data['pageTitle'] = $pageTitle;
            $data['intro'] = $intro;
            $data['contactEmail'] = $contactEmail;
            return $data;
        },
        $gate,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AccessibilityCatalog::resetCache();
    AdminAuditRepository::log($actorId, 'accessibility_update_page', 'accessibility', 'page', []);
    ApiJson::ok(['ok' => true, 'accessibility' => AccessibilityCatalog::load()]);
}

if ($action === 'update_section') {
    $sectionId = trim((string) ($payload['sectionId'] ?? ''));
    if ($sectionId === '') {
        ApiJson::error('sectionId requis');
    }
    $title = trim((string) ($payload['title'] ?? ''));
    $paragraphs = is_array($payload['paragraphs'] ?? null) ? $payload['paragraphs'] : [];
    $cleanParagraphs = array_values(array_filter(
        array_map(static fn ($p): string => trim((string) $p), $paragraphs),
        static fn (string $p): bool => $p !== '',
    ));
    if ($title === '') {
        ApiJson::error('Le titre ne peut pas être vide.');
    }
    if ($cleanParagraphs === []) {
        ApiJson::error('Ajoutez au moins un paragraphe.');
    }
    $result = ContractWriter::updateJson(
        'etc/capsuleos/contracts/portal-accessibility.json',
        static function (array $data) use ($sectionId, $title, $cleanParagraphs): array {
            $found = false;
            foreach ($data['sections'] ?? [] as $i => $section) {
                if (!is_array($section) || ($section['id'] ?? '') !== $sectionId) {
                    continue;
                }
                $data['sections'][$i]['title'] = $title;
                $data['sections'][$i]['paragraphs'] = $cleanParagraphs;
                $found = true;
                break;
            }
            if (!$found) {
                throw new \RuntimeException('Section introuvable: ' . $sectionId);
            }
            return $data;
        },
        $gate,
    );
    if (!$result['ok']) {
        ApiJson::error((string) ($result['error'] ?? 'Échec mise à jour'));
    }
    AccessibilityCatalog::resetCache();
    AdminAuditRepository::log($actorId, 'accessibility_update_section', 'accessibility', $sectionId, []);
    ApiJson::ok(['ok' => true, 'accessibility' => AccessibilityCatalog::load()]);
}

ApiJson::error('Action inconnue');
