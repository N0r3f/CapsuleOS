<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
/** @var array<string, mixed> $badge */
/** @var bool $earned */
$iconClass = portal_gamification_badge_icon_class($badge);
$tone = portal_gamification_badge_tone($badge);
$label = (string) ($badge['label'] ?? '');
$description = (string) ($badge['description'] ?? '');
$mod = $earned ? ' portal-account-badge-tile--earned' : ' portal-account-badge-tile--locked';
?>
<li class="portal-account-badge-cell">
    <button type="button"
        class="portal-account-badge-tile portal-account-badge-tile--tone-<?= $ctx->e($tone) ?><?= $mod ?>"
        data-portal-badge-tile
        data-badge-label="<?= $ctx->e($label) ?>"
        data-badge-desc="<?= $ctx->e($description) ?>"
        aria-label="<?= $ctx->e($label) ?>"
        aria-expanded="false">
        <span class="portal-account-badge-tile-icon" aria-hidden="true">
            <i class="<?= $ctx->e($iconClass) ?>"></i>
        </span>
    </button>
</li>
