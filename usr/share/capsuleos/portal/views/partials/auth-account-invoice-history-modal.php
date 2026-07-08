<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
/** @var list<array{date: string, amount: string}> $allInvoices */
if (!isset($allInvoices) || $allInvoices === []) {
    return;
}
$closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<dialog class="portal-account-modal portal-account-modal--invoices" id="portal-account-invoice-history-modal" aria-labelledby="portal-account-invoice-history-title">
    <div class="portal-account-modal-panel">
        <div class="portal-account-modal-head">
            <h2 class="portal-account-modal-title" id="portal-account-invoice-history-title">Historique de facturation</h2>
            <button type="button" class="portal-account-modal-close" data-portal-account-modal-close aria-label="Fermer"><?= $closeIcon ?></button>
        </div>
        <div class="portal-account-modal-body portal-account-modal-body--invoices">
            <?php
            $invoices = $allInvoices;
            include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-invoice-list.php';
            ?>
        </div>
    </div>
</dialog>
