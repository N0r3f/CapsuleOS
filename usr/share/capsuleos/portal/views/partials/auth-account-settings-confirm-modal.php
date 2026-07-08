<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<dialog class="portal-account-modal portal-account-modal--confirm portal-account-settings-confirm-modal" id="portal-account-settings-confirm-modal" aria-labelledby="portal-account-settings-confirm-title" aria-describedby="portal-account-settings-confirm-message">
    <div class="portal-account-modal-panel">
        <button type="button" class="portal-account-modal-close portal-account-settings-confirm-close" data-settings-confirm-close aria-label="Fermer"><?= $closeIcon ?></button>
        <div class="portal-account-modal-head portal-account-settings-confirm-head">
            <div class="portal-account-settings-confirm-icon portal-account-settings-confirm-icon--success" data-settings-confirm-icon aria-hidden="true">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h2 class="portal-account-modal-title" id="portal-account-settings-confirm-title" data-settings-confirm-title>Modification enregistrée</h2>
        </div>
        <div class="portal-account-modal-body portal-account-settings-confirm-body">
            <p class="portal-account-modal-lead" id="portal-account-settings-confirm-message" data-settings-confirm-message></p>
            <div class="portal-account-modal-actions">
                <button type="button" class="portal-account-btn portal-account-btn--primary" data-settings-confirm-ok>OK</button>
            </div>
        </div>
    </div>
</dialog>
