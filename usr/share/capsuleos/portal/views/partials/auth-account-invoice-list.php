<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
/** @var list<array{date: string, amount: string}> $invoices */
if (!isset($invoices) || $invoices === []) {
    return;
}
?>
<ul class="portal-account-invoice-list">
    <?php foreach ($invoices as $invoice) :
        if (!is_array($invoice)) {
            continue;
        }
        ?>
    <li class="portal-account-invoice-item">
        <span class="portal-account-invoice-date"><?= $ctx->e((string) ($invoice['date'] ?? '')) ?></span>
        <span class="portal-account-invoice-amount"><?= $ctx->e((string) ($invoice['amount'] ?? '')) ?></span>
    </li>
    <?php endforeach; ?>
</ul>
