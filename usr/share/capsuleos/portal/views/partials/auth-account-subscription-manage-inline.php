<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\User\UserRepository;

$subscription = is_array($ctx->extra['subscription'] ?? null) ? $ctx->extra['subscription'] : null;
$periodEnd = is_array($subscription) ? (string) ($subscription['current_period_end'] ?? '') : '';
$cancelAtEnd = is_array($subscription) && !empty($subscription['cancel_at_period_end']);
$userId = (int) ($ctx->user['id'] ?? 0);
$isExpired = $userId > 0 && UserRepository::isSubscriptionExpired($userId);
$periodLabel = $periodEnd !== '' ? portal_format_datetime_fr($periodEnd) : 'la fin de la période en cours';
$periodDisplay = $periodEnd !== ''
    ? portal_subscription_end_display($periodEnd, $isExpired, $cancelAtEnd)
    : 'la fin de la période en cours';
$subscribeUrl = portal_entry('subscribe.php');
?>
<section class="portal-account-panel portal-account-sub-manage<?= $isExpired ? ' portal-account-sub-manage--expired' : '' ?>" data-subscription-manage-section>
    <div data-subscription-active-manage<?= $isExpired ? ' hidden' : '' ?>>
        <h3 class="portal-account-subtitle" id="portal-account-sub-manage-title">Renouvellement</h3>
        <dl class="portal-account-dl portal-account-dl--compact">
            <div class="portal-account-dl-row">
                <dt data-subscription-manage-period-label>Prochain renouvellement</dt>
                <dd data-subscription-manage-period><?= $ctx->e($periodDisplay) ?></dd>
            </div>
            <div class="portal-account-dl-row">
                <dt>Renouvellement auto</dt>
                <dd>
                    <span class="portal-account-sub-renewal-status<?= $cancelAtEnd ? ' portal-account-sub-renewal-status--cancelled' : ' portal-account-sub-renewal-status--active' ?>" data-subscription-manage-status><?= $cancelAtEnd ? 'Annulé' : 'Actif' ?></span>
                </dd>
            </div>
        </dl>

        <div class="portal-account-sub-manage-view" data-subscription-manage-view="overview">
            <p class="portal-account-panel-lead" data-subscription-manage-lead><?php if ($cancelAtEnd) :
                if ($periodEnd !== '') : ?>
                Votre abonnement Abonné se terminera le <span class="portal-account-sub-date"><?= $ctx->e(portal_format_datetime_fr($periodEnd)) ?></span>.
                <?php else : ?>
                Votre abonnement Abonné se terminera à la fin de la période en cours.
                <?php endif;
            else : ?>
                Votre abonnement Abonné se renouvelle automatiquement chaque mois.
            <?php endif; ?></p>
            <div class="portal-account-sub-manage-actions" data-subscription-active-actions>
                <button type="button" class="portal-account-btn portal-account-btn--danger" data-subscription-show-cancel-confirm<?= $cancelAtEnd ? ' hidden' : '' ?>>Annuler le renouvellement</button>
                <button type="button" class="portal-account-btn portal-account-btn--primary" data-subscription-reactivate<?= $cancelAtEnd ? '' : ' hidden' ?>>Réactiver le renouvellement</button>
            </div>
        </div>

        <div class="portal-account-sub-manage-view" data-subscription-manage-view="confirm-cancel" hidden>
            <p class="portal-account-panel-lead">Vous conserverez Abonné jusqu'au <span class="portal-account-sub-date" data-subscription-cancel-period><?= $ctx->e($periodLabel) ?></span>. Aucun prélèvement ne sera effectué après cette date.</p>
            <div class="portal-account-sub-manage-actions">
                <button type="button" class="portal-account-btn portal-account-btn--ghost" data-subscription-manage-back>Retour</button>
                <button type="button" class="portal-account-btn portal-account-btn--danger" data-subscription-cancel-confirm>Confirmer l'annulation</button>
            </div>
        </div>
    </div>

    <div data-subscription-expired-manage<?= $isExpired ? '' : ' hidden' ?> aria-labelledby="portal-account-sub-resubscribe-title">
        <h3 class="portal-account-subtitle" id="portal-account-sub-resubscribe-title">Reprendre l'abonnement</h3>
        <p class="portal-account-panel-lead" data-subscription-expired-lead>
            Votre forfait Abonné n'est plus actif<?php if ($periodEnd !== '') : ?> depuis le <span class="portal-account-sub-date" data-subscription-expired-date><?= $ctx->e(portal_format_datetime_fr($periodEnd)) ?></span><?php endif; ?>.
            Votre compte est repassé en <strong>gratuit</strong> (quota OS journalier).
            L'historique de facturation et vos coordonnées de paiement restent consultables ci-dessus.
        </p>
        <div class="portal-account-sub-manage-actions">
            <a class="portal-account-btn portal-account-btn--primary" href="<?= $ctx->e($subscribeUrl) ?>" data-subscription-resubscribe>Relancer l'abonnement</a>
        </div>
    </div>
</section>
