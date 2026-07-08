<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
/** @var list<array{class: string, label: string}>|null $badges */
$badgeList = $badges ?? portal_account_author_badges($ctx);
if ($badgeList === []) {
    return;
}
?>
<span class="portal-account-ticket-message-badges">
    <?php foreach ($badgeList as $badge) : ?>
    <span class="portal-account-badge portal-account-badge--title portal-account-badge--message <?= $ctx->e((string) ($badge['class'] ?? '')) ?>"><?= $ctx->e((string) ($badge['label'] ?? '')) ?></span>
    <?php endforeach; ?>
</span>
