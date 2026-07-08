<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$isSubscriber = $ctx->isSubscriber();
?>
<div class="portal-account-usage-actions" data-portal-account-quick-actions>
    <?php if ($isSubscriber) : ?>
    <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-portal-account-modal-open="subscription-manage" aria-haspopup="dialog" aria-controls="portal-account-subscription-manage-modal">Gérer l'abonnement</button>
    <?php endif; ?>
    <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-portal-account-modal-open="tickets" aria-haspopup="dialog" aria-controls="portal-account-tickets-modal">Support et demandes</button>
    <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-portal-account-modal-open="settings" aria-haspopup="dialog" aria-controls="portal-account-settings-modal">Paramètres du compte</button>
</div>
