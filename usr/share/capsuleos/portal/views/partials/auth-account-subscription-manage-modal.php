<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$subscription = is_array($ctx->extra['subscription'] ?? null) ? $ctx->extra['subscription'] : null;
$periodEnd = is_array($subscription) ? (string) ($subscription['current_period_end'] ?? '') : '';
$cancelAtEnd = is_array($subscription) && !empty($subscription['cancel_at_period_end']);
$periodLabel = $periodEnd !== '' ? portal_format_datetime_fr($periodEnd) : 'la fin de la période en cours';
$periodDisplay = $periodEnd !== ''
    ? portal_subscription_period_display($periodEnd, $cancelAtEnd)
    : 'la fin de la période en cours';
$closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<dialog class="portal-account-modal portal-account-modal--confirm" id="portal-account-subscription-manage-modal" aria-labelledby="portal-account-subscription-manage-title">
    <div class="portal-account-modal-panel">
        <div class="portal-account-modal-head">
            <h2 class="portal-account-modal-title" id="portal-account-subscription-manage-title">Gérer l'abonnement</h2>
            <button type="button" class="portal-account-modal-close" data-portal-account-modal-close aria-label="Fermer"><?= $closeIcon ?></button>
        </div>
        <div class="portal-account-modal-body">
            <dl class="portal-account-dl portal-account-dl--compact">
                <div class="portal-account-dl-row">
                    <dt>Renouvellement</dt>
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
                <p class="portal-account-modal-lead" data-subscription-manage-lead><?php if ($cancelAtEnd) :
                    if ($periodEnd !== '') : ?>
                    Votre abonnement Abonné se terminera le <span class="portal-account-sub-date"><?= $ctx->e(portal_format_datetime_fr($periodEnd)) ?></span>.
                    <?php else : ?>
                    Votre abonnement Abonné se terminera à la fin de la période en cours.
                    <?php endif;
                else : ?>
                    Votre abonnement Abonné se renouvelle automatiquement chaque mois.
                <?php endif; ?></p>
                <div class="portal-account-modal-actions">
                    <button type="button" class="portal-account-btn portal-account-btn--ghost" data-portal-account-modal-close>Fermer</button>
                    <button type="button" class="portal-account-btn portal-account-btn--danger" data-subscription-show-cancel-confirm<?= $cancelAtEnd ? ' hidden' : '' ?>>Annuler le renouvellement</button>
                    <button type="button" class="portal-account-btn portal-account-btn--primary" data-subscription-reactivate<?= $cancelAtEnd ? '' : ' hidden' ?>>Réactiver le renouvellement</button>
                </div>
            </div>

            <div class="portal-account-sub-manage-view" data-subscription-manage-view="confirm-cancel" hidden>
                <p class="portal-account-modal-lead">Vous conserverez Abonné jusqu'au <span class="portal-account-sub-date" data-subscription-cancel-period><?= $ctx->e($periodLabel) ?></span>. Aucun prélèvement ne sera effectué après cette date.</p>
                <div class="portal-account-modal-actions">
                    <button type="button" class="portal-account-btn portal-account-btn--ghost" data-subscription-manage-back>Retour</button>
                    <button type="button" class="portal-account-btn portal-account-btn--danger" data-subscription-cancel-confirm>Confirmer l'annulation</button>
                </div>
            </div>
        </div>
    </div>
</dialog>
