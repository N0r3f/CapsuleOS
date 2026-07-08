<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<dialog class="portal-account-modal" id="portal-account-tickets-modal" aria-labelledby="portal-account-tickets-modal-title">
    <div class="portal-account-modal-panel">
        <div class="portal-account-modal-head">
            <h2 class="portal-account-modal-title" id="portal-account-tickets-modal-title">Support et demandes</h2>
            <button type="button" class="portal-account-modal-close" data-portal-account-modal-close aria-label="Fermer"><?= $closeIcon ?></button>
        </div>
        <div class="portal-account-modal-body">
            <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-tickets.php'; ?>
        </div>
    </div>
</dialog>

<dialog class="portal-account-modal portal-account-modal--settings" id="portal-account-settings-modal" aria-labelledby="portal-account-settings-modal-title">
    <div class="portal-account-modal-panel">
        <div class="portal-account-modal-head">
            <h2 class="portal-account-modal-title" id="portal-account-settings-modal-title">Paramètres du compte</h2>
            <button type="button" class="portal-account-modal-close" data-portal-account-modal-close aria-label="Fermer"><?= $closeIcon ?></button>
        </div>
        <div class="portal-account-modal-body">
            <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-settings.php'; ?>
        </div>
    </div>
</dialog>
