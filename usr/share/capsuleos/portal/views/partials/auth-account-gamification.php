<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$gam = is_array($ctx->extra['gamification'] ?? null) ? $ctx->extra['gamification'] : null;
$badgeCatalog = is_array($ctx->extra['badgeCatalog'] ?? null) ? $ctx->extra['badgeCatalog'] : [];
if ($gam === null) {
    return;
}
$earnedCount = count($gam['badges'] ?? []);
$total = (int) ($gam['badgeTotal'] ?? 30);
?>
<section class="portal-account-panel portal-account-xp" aria-labelledby="portal-account-xp-title">
    <h2 class="portal-account-panel-title" id="portal-account-xp-title">Badges <span class="portal-account-badge-count"><?= (int) $earnedCount ?>/<?= (int) $total ?></span></h2>
    <?php if ($badgeCatalog === []) : ?>
        <p class="portal-account-empty">Aucun badge disponible pour le moment.</p>
    <?php else : ?>
        <div class="portal-account-badge-board" data-portal-badge-board>
            <ul class="portal-account-badge-grid">
                <?php foreach ($badgeCatalog as $badge) :
                    if (!is_array($badge)) {
                        continue;
                    }
                    $earned = !empty($badge['earned']);
                    include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-badge-item.php';
                endforeach; ?>
            </ul>
            <div class="portal-account-badge-popover" data-portal-badge-popover hidden role="status" aria-live="polite">
                <p class="portal-account-badge-popover-label" data-portal-badge-popover-label></p>
                <p class="portal-account-badge-popover-desc" data-portal-badge-popover-desc></p>
            </div>
        </div>
    <?php endif; ?>
</section>
