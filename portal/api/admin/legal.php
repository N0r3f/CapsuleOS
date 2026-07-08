<?php

declare(strict_types=1);

require __DIR__ . '/../../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Admin\AdminAuditRepository;
use CapsuleOS\Portal\Admin\AdminGuard;
use CapsuleOS\Portal\Admin\ContractWriter;
use CapsuleOS\Portal\Catalog\LegalCatalog;
use CapsuleOS\Portal\Http\ApiJson;

$actorId = AdminGuard::require();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$gate = 'usr/lib/capsuleos/tools/validate-portal-contracts.mjs';

if ($method === 'GET') {
    ApiJson::ok([
        'legal' => LegalCatalog::load(),
        'sections' => LegalCatalog::sections(),
        'footerLinks' => LegalCatalog::footerLinks(),
        'readOnly' => false,
    ]);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

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
        'etc/capsuleos/contracts/portal-legal.json',
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
    LegalCatalog::resetCache();
    AdminAuditRepository::log($actorId, 'legal_update_section', 'legal', $sectionId, []);
    ApiJson::ok(['ok' => true]);
}

ApiJson::error('Action inconnue');
