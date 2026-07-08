<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
/** @var array<string, mixed> $ticket */
$ticketId = (int) ($ticket['id'] ?? 0);
$subId = portal_ticket_sub_id($ticketId);
$subject = (string) ($ticket['subject'] ?? '');
$body = (string) ($ticket['body'] ?? '');
$createdAt = (string) ($ticket['created_at'] ?? '');
$authorName = $ctx->displayName();
?>
<div class="portal-account-subview" id="account-subview-<?= $ctx->e($subId) ?>" data-account-sub-view="<?= $ctx->e($subId) ?>"
    data-ticket-subview hidden role="tabpanel" aria-labelledby="portal-account-subnav-<?= $ctx->e($subId) ?>">
    <section class="portal-account-panel portal-account-ticket-thread" aria-labelledby="portal-ticket-title-<?= $ctx->e($subId) ?>">
        <h2 class="portal-account-panel-title" id="portal-ticket-title-<?= $ctx->e($subId) ?>"><span class="portal-account-ticket-subject-label">Sujet :</span> <?= $ctx->e($subject) ?></h2>
        <div class="portal-account-ticket-messages" role="log" aria-live="polite">
            <article class="portal-account-ticket-message portal-account-ticket-message--user">
                <header class="portal-account-ticket-message-head">
                    <span class="portal-account-ticket-message-author-line">
                        <span class="portal-account-ticket-message-author"><?= $ctx->e($authorName) ?></span>
                        <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-author-badges.php'; ?>
                    </span>
                    <time datetime="<?= $ctx->e($createdAt) ?>"><?= $ctx->e(portal_format_datetime_fr($createdAt)) ?></time>
                </header>
                <p class="portal-account-ticket-message-body"><?= $ctx->e($body) ?></p>
            </article>
        </div>
        <p class="portal-account-ticket-sla">Le support peut prendre entre 24 et 48 h pour répondre.</p>
    </section>
</div>
