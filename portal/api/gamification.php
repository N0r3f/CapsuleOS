<?php

declare(strict_types=1);

require __DIR__ . '/../../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Gamification\GamificationRepository;
use CapsuleOS\Portal\Http\ApiJson;
use CapsuleOS\Portal\Store\PurchasedModuleRepository;
use CapsuleOS\Portal\Subscription\GradeResolver;

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$userId = ApiJson::requireAuth();

$resolved = GradeResolver::forUser($userId);
$showGamification = !empty($resolved['permissions']['showGamification']);

if ($method === 'GET') {
    $data = ['showGamification' => $showGamification];
    if ($showGamification) {
        $row = GamificationRepository::getOrCreate($userId);
        $xp = (int) ($row['xp'] ?? 0);
        $progress = GamificationRepository::xpProgress($xp);
        $earned = GamificationRepository::badges($userId);
        $catalog = GamificationRepository::badgeCatalog();
        $badges = [];
        foreach ($catalog as $badge) {
            $badges[] = array_merge($badge, [
                'earned' => in_array($badge['id'], $earned, true),
            ]);
        }
        $data['xp'] = $xp;
        $data['level'] = $progress['level'];
        $data['xpInLevel'] = $progress['xpInLevel'];
        $data['xpForLevel'] = $progress['xpForLevel'];
        $data['percent'] = $progress['percent'];
        $data['badges'] = $badges;
        $data['badgeCount'] = count($earned);
        $data['badgeTotal'] = GamificationRepository::badgeTotal();
    }
    $purchases = [];
    foreach (PurchasedModuleRepository::listForUser($userId) as $p) {
        if (!is_array($p)) {
            continue;
        }
        $purchases[] = [
            'moduleId' => (string) ($p['module_id'] ?? ''),
            'purchasedAt' => (string) ($p['purchased_at'] ?? ''),
        ];
    }
    $data['purchases'] = $purchases;
    ApiJson::ok($data);
}

$payload = ApiJson::readJsonBody();
ApiJson::requireCsrf($payload);
$action = (string) ($payload['action'] ?? '');

if ($action === 'add_xp') {
    if (!$showGamification) {
        ApiJson::error('Gamification non disponible', 403);
    }
    $amount = (int) ($payload['amount'] ?? 0);
    $contract = GamificationRepository::contract();
    $default = (int) ($contract['xpPerMission'] ?? 10);
    if ($amount <= 0) {
        $amount = $default;
    }
    $result = GamificationRepository::addXp($userId, $amount);
    $progress = GamificationRepository::xpProgress($result['xp']);
    ApiJson::ok(['ok' => true, 'xp' => $result['xp'], 'level' => $progress['level'], 'percent' => $progress['percent']]);
}

if ($action === 'add_badge') {
    if (!$showGamification) {
        ApiJson::error('Gamification non disponible', 403);
    }
    $badgeId = (string) ($payload['badgeId'] ?? '');
    if ($badgeId === '') {
        ApiJson::error('badgeId requis');
    }
    GamificationRepository::addBadge($userId, $badgeId);
    ApiJson::ok(['ok' => true]);
}

ApiJson::error('Action inconnue', 400);
