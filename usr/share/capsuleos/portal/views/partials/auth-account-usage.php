<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$usageSummary = is_array($ctx->extra['usageSummary'] ?? null) ? $ctx->extra['usageSummary'] : [];
$limitMinutes = (int) ($ctx->extra['limitMinutes'] ?? 15);
$resetsAt = (string) ($ctx->extra['resetsAt'] ?? '');
?>
<section class="portal-account-panel portal-account-usage" aria-labelledby="portal-account-usage-title">
    <h2 class="portal-account-panel-title" id="portal-account-usage-title">Temps d'utilisation</h2>
    <p class="portal-account-panel-lead">Forfait gratuite : <?= (int) $limitMinutes ?> minutes par OS et par jour. Prochain reset à minuit.</p>
    <?php if ($usageSummary === []) : ?>
        <p class="portal-account-empty">Aucune session OS enregistrée aujourd'hui. Tous les systèmes du catalogue sont disponibles jusqu'à la limite.</p>
        <ul class="portal-account-usage-list">
            <li class="portal-account-usage-item">
                <span class="portal-account-usage-label">Temps restant par OS</span>
                <div class="portal-account-progress-bar" role="progressbar" aria-valuenow="<?= (int) $limitMinutes ?>" aria-valuemin="0" aria-valuemax="<?= (int) $limitMinutes ?>">
                    <span class="portal-account-progress-bar-fill portal-account-progress-bar-fill--full" style="width: 100%"></span>
                </div>
                <span class="portal-account-usage-meta"><?= (int) $limitMinutes ?> min restantes</span>
            </li>
        </ul>
    <?php else : ?>
        <ul class="portal-account-usage-list">
            <?php foreach ($usageSummary as $item) :
                if (!is_array($item)) {
                    continue;
                }
                $remaining = (float) ($item['minutesRemaining'] ?? 0);
                $used = (float) ($item['minutesUsed'] ?? 0);
                $percent = $limitMinutes > 0 ? (int) round(($used / $limitMinutes) * 100) : 0;
                $rid = (string) ($item['registryId'] ?? '');
                $label = $rid;
                foreach ($ctx->extra['osCatalog'] ?? [] as $os) {
                    if (is_array($os) && ($os['id'] ?? '') === $rid) {
                        $label = (string) ($os['displayName'] ?? $rid);
                        break;
                    }
                }
                ?>
            <li class="portal-account-usage-item">
                <span class="portal-account-usage-label"><?= $ctx->e($label) ?></span>
                <div class="portal-account-progress-bar" role="progressbar" aria-valuenow="<?= $percent ?>" aria-valuemin="0" aria-valuemax="100">
                    <span class="portal-account-progress-bar-fill" style="width: <?= min(100, $percent) ?>%"></span>
                </div>
                <span class="portal-account-usage-meta"><?= (int) ceil($remaining) ?> min restantes · <?= (int) round($used) ?> min utilisées</span>
            </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
    <?php if ($resetsAt !== '') : ?>
        <p class="portal-account-usage-reset">Prochaine remise à zéro : <?= $ctx->e(portal_format_date_fr(substr($resetsAt, 0, 10))) ?></p>
    <?php endif; ?>
</section>
