<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$isSubscriber = $ctx->isSubscriber();
$plusPlan = null;
foreach ($ctx->offers['plans'] ?? [] as $plan) {
    if (is_array($plan) && ($plan['id'] ?? '') === 'subscriber') {
        $plusPlan = $plan;
        break;
    }
}
$plusPrice = is_array($plusPlan) ? (string) ($plusPlan['priceDisplay'] ?? '15 €') : '15 €';
$plusFeatures = is_array($plusPlan) && is_array($plusPlan['features'] ?? null) ? $plusPlan['features'] : [];
?>
<section class="portal-account-panel" aria-labelledby="portal-account-plan-title">
    <h2 class="portal-account-panel-title" id="portal-account-plan-title"><?= $isSubscriber ? 'Plan détails' : 'Abonnement' ?></h2>
    <?php if ($isSubscriber) : ?>
        <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-subscription-plan-grid.php'; ?>
    <?php else : ?>
        <dl class="portal-account-dl">
            <div class="portal-account-dl-row">
                <dt>Forfait</dt>
                <dd>Gratuit</dd>
            </div>
            <div class="portal-account-dl-row">
                <dt>Statut</dt>
                <dd class="portal-account-dl-status"><span>Compte gratuit</span><span class="portal-account-status-dot" aria-hidden="true"></span></dd>
            </div>
        </dl>
        <div class="portal-account-upgrade portal-account-upgrade--inline">
            <p class="portal-account-upgrade-eyebrow">Passer à Abonné</p>
            <p class="portal-account-upgrade-price"><span class="portal-account-upgrade-amount"><?= $ctx->e($plusPrice) ?></span><span class="portal-account-upgrade-period">/mois</span></p>
            <?php if ($plusFeatures !== []) : ?>
                <ul class="portal-account-upgrade-features">
                    <?php foreach ($plusFeatures as $feature) : ?>
                        <li><?= $ctx->e((string) $feature) ?></li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
            <a class="portal-account-btn portal-account-btn--primary" href="<?= $ctx->e(portal_entry('subscribe.php')) ?>">Découvrir Abonné</a>
        </div>
    <?php endif; ?>
    <?php if (!$ctx->showSection('usage')) {
        include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-quick-actions.php';
    } ?>
</section>
