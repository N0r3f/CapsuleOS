<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Catalog\ModuleCatalogReader;
use CapsuleOS\Portal\Catalog\OsRegistryReader;
use CapsuleOS\Portal\Classroom\ClassroomRepository;
use CapsuleOS\Portal\Gamification\GamificationRepository;
use CapsuleOS\Portal\PortalContext;
use CapsuleOS\Portal\Progress\ProgressRepository;
use CapsuleOS\Portal\Skin\SkinSaveRepository;
use CapsuleOS\Portal\Store\PurchasedModuleRepository;
use CapsuleOS\Portal\Subscription\GradeResolver;
use CapsuleOS\Portal\Support\TicketRepository;
use CapsuleOS\Portal\Usage\OsUsageRepository;
use CapsuleOS\Portal\User\RoleRepository;
use CapsuleOS\Portal\User\UserRepository;

if (AuthService::currentUserId() === null) {
    portal_redirect('./login.php');
}

if (\CapsuleOS\Portal\Config::isDev() && $_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['dev_sim_grade'])) {
    if (\CapsuleOS\Portal\Http\Csrf::validate($_POST[\CapsuleOS\Portal\Http\Csrf::fieldName()] ?? null)) {
        \CapsuleOS\Portal\Subscription\DevGradeSimulator::setSimGrade((string) ($_POST['grade'] ?? 'auto'));
    }
    portal_redirect('./account.php');
}

$ctx = PortalContext::fromRequest('Mon compte · CapsuleOS');
$userId = (int) ($ctx->user['id'] ?? 0);
$gradeContext = $ctx->gradeContext;
$permissions = $ctx->permissions();

$progressItems = [];
if ($ctx->showSection('progress')) {
    foreach (ProgressRepository::listForUser($userId) as $row) {
        if (!is_array($row)) {
            continue;
        }
        $mountId = (string) ($row['mount_id'] ?? '');
        $module = ModuleCatalogReader::moduleByMountId($mountId, $ctx->entitlementLevel);
        $registryId = (string) ($row['registry_id'] ?? '');
        $facade = $registryId !== '' ? OsRegistryReader::facadeFor($registryId) : null;
        if ($facade === null && is_array($module) && !empty($module['compatibleOs'][0]['facade'])) {
            $facade = (string) $module['compatibleOs'][0]['facade'];
        }
        $resumeHref = null;
        if ($facade !== null && $mountId !== '') {
            $sep = str_contains($facade, '?') ? '&' : '?';
            $resumeHref = portal_asset($facade) . $sep . 'mnt=' . rawurlencode($mountId);
        }
        $done = (int) ($row['done_count'] ?? 0);
        $total = (int) ($row['total_count'] ?? 0);
        $progressItems[] = [
            'mountId' => $mountId,
            'title' => is_array($module) ? (string) ($module['title'] ?? $mountId) : $mountId,
            'levelLabel' => is_array($module) ? (string) ($module['levelLabel'] ?? $module['level'] ?? '') : '',
            'doneCount' => $done,
            'totalCount' => $total,
            'percent' => $total > 0 ? (int) round(($done / $total) * 100) : 0,
            'updatedAt' => portal_format_date_fr((string) ($row['updated_at'] ?? '')),
            'resumeHref' => $resumeHref,
        ];
    }
}

$subscription = UserRepository::subscription($userId);
$billing = UserRepository::billing($userId);
$subjectKey = OsUsageRepository::subjectKey($userId, null);
$limitMinutes = OsUsageRepository::dailyLimit();
$usageSummary = !empty($permissions['osQuotaUnlimited'])
    ? []
    : OsUsageRepository::summaryForSubject($subjectKey, $limitMinutes);

$tickets = TicketRepository::listForUser($userId);
$ticketTypes = GradeResolver::ticketTypesForUser($userId);

$gamification = null;
$badgeCatalog = [];
if ($ctx->showSection('gamification')) {
    $row = GamificationRepository::getOrCreate($userId);
    $xp = (int) ($row['xp'] ?? 0);
    $gamification = array_merge(GamificationRepository::xpProgress($xp), [
        'badges' => GamificationRepository::badges($userId),
        'badgeTotal' => GamificationRepository::badgeTotal(),
    ]);
    $earned = GamificationRepository::badges($userId);
    foreach (GamificationRepository::badgeCatalog() as $badge) {
        $badgeCatalog[] = array_merge($badge, ['earned' => in_array($badge['id'], $earned, true)]);
    }
}

$skinSaves = [];
if ($ctx->showSection('skins')) {
    foreach (SkinSaveRepository::listForUser($userId) as $skin) {
        if (!is_array($skin)) {
            continue;
        }
        $rid = (string) ($skin['registry_id'] ?? '');
        $label = $rid;
        foreach (OsRegistryReader::listForPortal() as $os) {
            if (($os['id'] ?? '') === $rid) {
                $label = (string) ($os['displayName'] ?? $rid);
                break;
            }
        }
        $skinSaves[] = [
            'registryId' => $rid,
            'label' => $label,
            'updatedAt' => portal_format_date_fr((string) ($skin['updated_at'] ?? '')),
        ];
    }
}

$purchasesRaw = PurchasedModuleRepository::listForUser($userId);
$purchases = [];
foreach ($purchasesRaw as $purchaseRow) {
    if (!is_array($purchaseRow)) {
        continue;
    }
    $moduleId = (string) ($purchaseRow['module_id'] ?? '');
    $module = $moduleId !== '' ? ModuleCatalogReader::moduleByMountId($moduleId, $ctx->entitlementLevel) : null;
    $title = is_array($module) ? trim((string) ($module['title'] ?? '')) : '';
    if ($title === '') {
        $title = $moduleId;
    }
    $creatorName = is_array($module) ? trim((string) ($module['creatorName'] ?? '')) : '';
    $purchases[] = [
        'module_id' => $moduleId,
        'purchased_at' => (string) ($purchaseRow['purchased_at'] ?? ''),
        'title' => $title,
        'creatorName' => $creatorName,
    ];
}

$classMembership = ClassroomRepository::membershipForUser($userId);
$teacherClassrooms = [];
if (RoleRepository::hasRole($userId, 'professeur')) {
    foreach (ClassroomRepository::listByTeacher($userId) as $row) {
        if (!is_array($row)) {
            continue;
        }
        $teacherClassrooms[] = [
            'classroom' => $row,
            'memberCount' => ClassroomRepository::memberCount((int) ($row['id'] ?? 0)),
        ];
    }
}
$teacherClassCount = RoleRepository::hasRole($userId, 'professeur')
    ? ClassroomRepository::countByTeacher($userId)
    : 0;
$teacherClassMax = RoleRepository::hasRole($userId, 'professeur')
    ? ClassroomRepository::maxClassroomsForTeacher($userId)
    : 0;

$gradeBadges = [];
foreach ($gradeContext['grades'] ?? [] as $grade) {
    $gradeBadges[] = (string) $grade;
}

$welcomeName = $ctx->displayName();

portal_render('layout-auth.php', $ctx, [
    'welcomeName' => $welcomeName,
    'pageTitle' => 'Bienvenue ' . $welcomeName . ' · CapsuleOS',
    'authPartial' => 'auth-account.php',
    'bodyClass' => 'portal-account-page',
    'layoutWide' => true,
    'progressItems' => $progressItems,
    'subscription' => $subscription,
    'billing' => $billing,
    'usageSummary' => $usageSummary,
    'limitMinutes' => $limitMinutes,
    'resetsAt' => OsUsageRepository::resetsAt(),
    'tickets' => $tickets,
    'ticketTypes' => $ticketTypes,
    'gamification' => $gamification,
    'badgeCatalog' => $badgeCatalog,
    'skinSaves' => $skinSaves,
    'purchases' => $purchases,
    'classMembership' => $classMembership,
    'teacherClassrooms' => $teacherClassrooms,
    'teacherClassCount' => $teacherClassCount,
    'teacherClassMax' => $teacherClassMax,
    'osCatalog' => OsRegistryReader::listForPortal(),
    'modulesCatalogFlat' => $ctx->modulesCatalog,
    'gradeBadges' => $gradeBadges,
    'gradeContract' => GradeResolver::gradesContract(),
]);
