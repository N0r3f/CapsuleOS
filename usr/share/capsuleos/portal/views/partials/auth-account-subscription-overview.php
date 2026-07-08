<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\User\UserRepository;

$isSubscriber = $ctx->isSubscriber();
$userId = (int) ($ctx->user['id'] ?? 0);
$hasSubscriptionHistory = $userId > 0 && UserRepository::hasSubscriptionHistory($userId);
$isExpired = $userId > 0 && UserRepository::isSubscriptionExpired($userId);
$subscription = is_array($ctx->extra['subscription'] ?? null) ? $ctx->extra['subscription'] : null;
$periodEnd = is_array($subscription) ? (string) ($subscription['current_period_end'] ?? '') : '';
$cancelAtEnd = is_array($subscription) && !empty($subscription['cancel_at_period_end']);
$plusPlan = null;
foreach ($ctx->offers['plans'] ?? [] as $plan) {
    if (is_array($plan) && ($plan['id'] ?? '') === 'subscriber') {
        $plusPlan = $plan;
        break;
    }
}
$plusPrice = is_array($plusPlan) ? (string) ($plusPlan['priceDisplay'] ?? '15 €') : '15 €';
$plusFeatures = is_array($plusPlan) && is_array($plusPlan['features'] ?? null) ? $plusPlan['features'] : [];
$periodDisplay = portal_subscription_end_display($periodEnd, $isExpired, $cancelAtEnd);
?>
<section class="portal-account-panel" aria-labelledby="portal-account-plan-title">
    <div class="portal-account-panel-head">
        <h2 class="portal-account-panel-title" id="portal-account-plan-title"><?= ($isSubscriber || $isExpired) ? 'Votre Forfait' : 'Abonnement' ?></h2>
        <?php if ($isSubscriber || $isExpired) : ?>
        <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-account-nav="settings" data-account-sub-nav="subscription"><?= $isExpired ? 'Voir l\'historique' : 'Gérer l\'abonnement' ?></button>
        <?php endif; ?>
    </div>
    <?php if ($isSubscriber) : ?>
        <dl class="portal-account-dl">
            <div class="portal-account-dl-row">
                <dt>Forfait</dt>
                <dd><span class="portal-account-plan-plus">Abonnée</span></dd>
            </div>
            <div class="portal-account-dl-row">
                <dt>Renouvellement</dt>
                <dd data-subscription-overview-period><?= $ctx->e($periodDisplay) ?></dd>
            </div>
            <div class="portal-account-dl-row">
                <dt>Renouvellement auto</dt>
                <dd>
                    <span class="portal-account-sub-renewal-status<?= $cancelAtEnd ? ' portal-account-sub-renewal-status--cancelled' : ' portal-account-sub-renewal-status--active' ?>" data-subscription-overview-status><?= $cancelAtEnd ? 'Annulé' : 'Actif' ?></span>
                </dd>
            </div>
        </dl>
    <?php elseif ($isExpired) : ?>
        <dl class="portal-account-dl">
            <div class="portal-account-dl-row">
                <dt>Forfait</dt>
                <dd data-subscription-plan-value>Gratuit</dd>
            </div>
            <div class="portal-account-dl-row">
                <dt>Dernier abonnement</dt>
                <dd data-subscription-overview-period><?= $periodEnd !== '' ? 'Abonné · terminé le ' . $ctx->e(portal_format_datetime_fr($periodEnd)) : 'Abonné' ?></dd>
            </div>
            <div class="portal-account-dl-row">
                <dt>Statut</dt>
                <dd>
                    <span class="portal-account-sub-renewal-status portal-account-sub-renewal-status--expired" data-subscription-overview-status>Terminé</span>
                </dd>
            </div>
        </dl>
        <div class="portal-account-sub-manage-actions">
            <a class="portal-account-btn portal-account-btn--primary" href="<?= $ctx->e(portal_entry('subscribe.php')) ?>" data-subscription-resubscribe>Relancer l'abonnement</a>
        </div>
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
</section>
