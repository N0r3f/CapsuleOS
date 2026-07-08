<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Support\TicketRepository;

$allTickets = is_array($ctx->extra['tickets'] ?? null) ? $ctx->extra['tickets'] : [];
$ticketsJson = [];
foreach ($allTickets as $ticket) {
    if (!is_array($ticket)) {
        continue;
    }
    $ticketsJson[] = TicketRepository::formatTicketForApi($ticket);
}
?>
<section class="portal-account-panel portal-account-support-view" data-account-subnav-scope="support"
    data-portal-all-tickets="<?= $ctx->e(json_encode($ticketsJson, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_UNESCAPED_UNICODE)) ?>"
    aria-labelledby="portal-account-support-view-title">
    <h2 class="portal-account-panel-title portal-account-panel-title--visually-hidden" id="portal-account-support-view-title">Support</h2>
    <nav class="portal-account-subnav" aria-label="Support et tickets">
        <ul class="portal-account-subnav-list" data-account-subnav-list role="tablist">
            <li class="portal-account-subnav-item" role="presentation">
                <button type="button" class="portal-account-subnav-link portal-account-subnav-link--active" role="tab"
                    id="portal-account-subnav-support" aria-controls="account-subview-support"
                    aria-selected="true" data-account-sub-nav="support">Nouvelle demande</button>
            </li>
        </ul>
    </nav>
    <div class="portal-account-subviews" data-account-subviews>
        <div class="portal-account-subview" id="account-subview-support" data-account-sub-view="support"
            role="tabpanel" aria-labelledby="portal-account-subnav-support">
            <section class="portal-account-panel" aria-labelledby="portal-account-support-title">
                <h2 class="portal-account-panel-title" id="portal-account-support-title">Nouvelle demande</h2>
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-tickets.php'; ?>
            </section>
        </div>
    </div>
</section>
