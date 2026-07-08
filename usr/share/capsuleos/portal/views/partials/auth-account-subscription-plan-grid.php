<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\User\UserRepository;

$subscription = is_array($ctx->extra['subscription'] ?? null) ? $ctx->extra['subscription'] : null;
$periodEnd = is_array($subscription) ? (string) ($subscription['current_period_end'] ?? '') : '';
$cancelAtEnd = is_array($subscription) && !empty($subscription['cancel_at_period_end']);
$userId = (int) ($ctx->user['id'] ?? 0);
$isSubscriber = $ctx->isSubscriber();
$isExpired = $userId > 0 && UserRepository::isSubscriptionExpired($userId);
$plusPlan = null;
foreach ($ctx->offers['plans'] ?? [] as $plan) {
    if (is_array($plan) && ($plan['id'] ?? '') === 'subscriber') {
        $plusPlan = $plan;
        break;
    }
}
$plusPrice = is_array($plusPlan) ? (string) ($plusPlan['priceDisplay'] ?? '15 €') : '15 €';
$periodLabel = $periodEnd !== '' ? portal_format_datetime_fr($periodEnd) : '-';
$periodDisplay = portal_subscription_end_display($periodEnd, $isExpired, $cancelAtEnd);
$cycleProgress = portal_subscription_cycle_progress($periodEnd);
$ringOffset = 100 - min(100, max(0, $cycleProgress));
$ringReached = $isExpired || ($periodEnd !== '' && $cycleProgress >= 100);
$invoicePreviewLimit = 2;
$invoiceFullCount = 12;
$allInvoices = portal_subscription_billing_history($periodEnd, $plusPrice, $invoiceFullCount);
$previewInvoices = array_slice($allInvoices, 0, $invoicePreviewLimit);
$hasMoreInvoices = count($allInvoices) > $invoicePreviewLimit;
$user = is_array($ctx->user ?? null) ? $ctx->user : [];
$displayName = $ctx->displayName();
$email = trim((string) ($user['email'] ?? ''));
$billing = is_array($ctx->extra['billing'] ?? null) ? $ctx->extra['billing'] : [];
$paymentMethod = trim((string) ($billing['paymentMethod'] ?? 'Carte Visa ···· 4242'));
$addressLine = trim((string) ($billing['addressLine'] ?? '12 rue de la Capsule'));
$postalCode = trim((string) ($billing['postalCode'] ?? '75001'));
$city = trim((string) ($billing['city'] ?? 'Paris'));
$calendarIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/></svg>';
?>
<div class="portal-account-plan-grid" data-subscription-plan-grid>
    <article class="portal-account-plan-card portal-account-plan-card--plan">
        <h3 class="portal-account-plan-card-title">Forfait</h3>
        <?php if ($isExpired) : ?>
        <p class="portal-account-plan-card-value" data-subscription-plan-value>Gratuit</p>
        <p class="portal-account-plan-card-meta" data-subscription-plan-meta>Ancien abonné Abonné<?= $periodEnd !== '' ? ' · terminé le ' . $ctx->e(portal_format_datetime_fr($periodEnd)) : '' ?></p>
        <p class="portal-account-plan-card-foot">
            Statut :
            <span class="portal-account-sub-renewal-status portal-account-sub-renewal-status--expired" data-subscription-renewal-status>Terminé</span>
        </p>
        <?php else : ?>
        <p class="portal-account-plan-card-value portal-account-plan-plus" data-subscription-plan-value>Abonné</p>
        <p class="portal-account-plan-card-meta" data-subscription-plan-meta>Utilisation OS : <span class="portal-account-unlimited">Illimitée</span></p>
        <p class="portal-account-plan-card-foot">
            Renouvellement auto :
            <span class="portal-account-sub-renewal-status<?= $cancelAtEnd ? ' portal-account-sub-renewal-status--cancelled' : ' portal-account-sub-renewal-status--active' ?>" data-subscription-renewal-status><?= $cancelAtEnd ? 'Annulé' : 'Actif' ?></span>
        </p>
        <?php endif; ?>
    </article>

    <article class="portal-account-plan-card portal-account-plan-card--billing">
        <h3 class="portal-account-plan-card-title" data-subscription-billing-title><?= $isExpired ? 'Dernière période' : 'Prochain paiement' ?></h3>
        <div class="portal-account-plan-renewal">
            <div class="portal-account-plan-renewal-ring<?= $ringReached ? ' portal-account-plan-renewal-ring--reached' : '' ?>" role="progressbar" aria-valuenow="<?= (int) $cycleProgress ?>" aria-valuemin="0" aria-valuemax="100" aria-label="Progression vers le renouvellement">
                <svg class="portal-account-plan-renewal-ring-svg" viewBox="0 0 48 48" aria-hidden="true">
                    <defs>
                        <linearGradient id="portal-plan-renewal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#f5e6a8"></stop>
                            <stop offset="55%" stop-color="#e8c547"></stop>
                            <stop offset="100%" stop-color="#c9a227"></stop>
                        </linearGradient>
                    </defs>
                    <circle class="portal-account-plan-renewal-ring-track" cx="24" cy="24" r="20" pathLength="100"></circle>
                    <circle class="portal-account-plan-renewal-ring-progress" cx="24" cy="24" r="20" pathLength="100" stroke-dasharray="100" stroke-dashoffset="<?= (int) $ringOffset ?>" data-subscription-cycle-progress></circle>
                    <circle class="portal-account-plan-renewal-ring-reached" cx="24" cy="24" r="20" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0" aria-hidden="true"></circle>
                </svg>
                <span class="portal-account-plan-renewal-icon"><?= $calendarIcon ?></span>
            </div>
            <div class="portal-account-plan-renewal-text">
                <p class="portal-account-plan-renewal-date" data-subscription-period-end><?= $ctx->e($periodDisplay) ?></p>
                <p class="portal-account-plan-renewal-label" data-subscription-period-label><?= $isExpired ? 'Date et heure de fin' : 'Date et heure de renouvellement' ?></p>
            </div>
        </div>
        <dl class="portal-account-plan-payment-dl">
            <div class="portal-account-plan-payment-row">
                <dt><?= $isExpired ? 'Tarif Abonné' : 'Paiement (par mois)' ?></dt>
                <dd><?= $ctx->e($plusPrice) ?></dd>
            </div>
            <div class="portal-account-plan-payment-row">
                <dt data-subscription-next-billing-label><?= $isExpired ? 'Montant facturé' : 'Prochaine facturation' ?></dt>
                <dd data-subscription-next-billing><?= $ctx->e($periodDisplay) ?></dd>
            </div>
        </dl>
    </article>

    <article class="portal-account-plan-card portal-account-plan-card--history">
        <h3 class="portal-account-plan-card-title">Historique de facturation</h3>
        <?php if ($allInvoices === []) : ?>
            <p class="portal-account-empty">Aucune facture enregistrée.</p>
        <?php else : ?>
            <?php
            $invoices = $previewInvoices;
            include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-invoice-list.php';
            ?>
            <?php if ($hasMoreInvoices) : ?>
            <button type="button" class="portal-account-btn portal-account-btn--link portal-account-invoice-history-open" data-portal-account-modal-open="invoice-history">
                Voir tout l'historique (<?= count($allInvoices) ?>)
            </button>
            <?php endif; ?>
        <?php endif; ?>
    </article>

    <article class="portal-account-plan-card portal-account-plan-card--details">
        <h3 class="portal-account-plan-card-title">Détails de l'abonnement</h3>
        <p class="portal-account-plan-details-line">
            <span class="portal-account-plan-details-name"><?= $ctx->e($displayName) ?></span>
            <span class="portal-account-plan-details-sep" aria-hidden="true">·</span>
            <span class="portal-account-plan-details-email"><?= $ctx->e($email) ?></span>
        </p>
        <p class="portal-account-plan-details-line portal-account-plan-details-payment"><?= $ctx->e($paymentMethod) ?></p>
        <p class="portal-account-plan-details-line portal-account-plan-details-address">
            <?= $ctx->e($postalCode) ?> <?= $ctx->e($city) ?> · <?= $ctx->e($addressLine) ?>
        </p>
    </article>
</div>
<?php if ($hasMoreInvoices) {
    include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-invoice-history-modal.php';
} ?>
