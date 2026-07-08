<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Config;

$isGamified = $ctx->showSection('gamification');
$gam = is_array($ctx->extra['gamification'] ?? null) ? $ctx->extra['gamification'] : null;
$isFreeHeader = !$isGamified;

if ($isFreeHeader) {
    $level = 1;
    $percent = 100;
    $xpInLevel = 0;
    $xpForLevel = 100;
} elseif ($gam === null) {
    return;
} else {
    $level = (int) ($gam['level'] ?? 1);
    $percent = (int) ($gam['percent'] ?? 0);
    $xpInLevel = (int) ($gam['xpInLevel'] ?? 0);
    $xpForLevel = (int) ($gam['xpForLevel'] ?? 100);
}

$hexOffset = $isFreeHeader ? 0 : (100 - min(100, max(0, $percent)));
$hexPath = 'M50 8 L90.693 31.5 L90.693 78.5 L50 102 L9.307 78.5 L9.307 31.5 Z';
$layoutClass = 'portal-account-xp-layout' . ($isFreeHeader ? ' portal-account-xp-layout--free' : '');
$hexAriaLabel = $isFreeHeader
    ? 'Compte gratuit'
    : 'Progression vers le niveau ' . (string) ($level + 1);
?>
<div class="<?= $layoutClass ?>">
    <div class="portal-account-xp-hex-wrap"<?= Config::isDev() && $isGamified ? ' data-dev-xp-progress' : '' ?><?= Config::isDev() && $isFreeHeader ? ' data-dev-xp-progress-free' : '' ?> role="progressbar" aria-valuenow="<?= $percent ?>" aria-valuemin="0" aria-valuemax="100" aria-label="<?= $ctx->e($hexAriaLabel) ?>">
        <svg class="portal-account-xp-hex-svg" viewBox="0 0 100 110" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <path class="portal-account-xp-hex-bg" d="<?= $hexPath ?>"></path>
            <path class="portal-account-xp-hex-track" d="<?= $hexPath ?>" pathLength="100"></path>
            <path class="portal-account-xp-hex-progress"<?= Config::isDev() ? ' data-dev-xp-hex-progress' : '' ?> d="<?= $hexPath ?>" pathLength="100" stroke-dasharray="100" stroke-dashoffset="<?= $hexOffset ?>"></path>
        </svg>
        <?php if ($isFreeHeader) : ?>
        <span class="portal-account-xp-hex-level portal-account-xp-hex-level--free"<?= Config::isDev() ? ' data-dev-xp-level-icon' : '' ?> aria-hidden="true">
            <i class="fa-solid fa-user"></i>
        </span>
        <?php if (Config::isDev()) : ?>
        <span class="portal-account-xp-hex-level" data-dev-xp-level hidden>1</span>
        <?php endif; ?>
        <?php else : ?>
        <span class="portal-account-xp-hex-level"<?= Config::isDev() ? ' data-dev-xp-level' : '' ?>><?= $level ?></span>
        <?php if (Config::isDev()) : ?>
        <span class="portal-account-xp-hex-level portal-account-xp-hex-level--free" data-dev-xp-level-icon hidden aria-hidden="true">
            <i class="fa-solid fa-user"></i>
        </span>
        <?php endif; ?>
        <?php endif; ?>
    </div>
    <div class="portal-account-xp-info">
        <h1 class="portal-auth-title portal-auth-title--welcome portal-auth-title--in-xp" id="auth-title">
            <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-identity-line.php'; ?>
        </h1>
        <?php if (!$isFreeHeader) : ?>
        <p class="portal-account-xp-meta"<?= Config::isDev() ? ' data-dev-xp-meta' : '' ?>><?= $xpInLevel ?> / <?= $xpForLevel ?> XP pour le niveau suivant</p>
        <?php elseif (Config::isDev()) : ?>
        <p class="portal-account-xp-meta" data-dev-xp-meta hidden>0 / 100 XP pour le niveau suivant</p>
        <?php endif; ?>
    </div>
</div>
