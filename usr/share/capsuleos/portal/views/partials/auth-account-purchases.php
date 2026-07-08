<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$purchases = is_array($ctx->extra['purchases'] ?? null) ? $ctx->extra['purchases'] : [];
?>
<section class="portal-account-panel portal-account-purchases" aria-labelledby="portal-account-purchases-title">
    <h2 class="portal-account-panel-title" id="portal-account-purchases-title">Mes achats</h2>
    <?php if ($purchases === []) : ?>
        <p class="portal-account-empty">Aucun module store acheté pour le moment.</p>
    <?php else : ?>
        <ul class="portal-account-purchase-list">
            <?php foreach ($purchases as $purchase) :
                if (!is_array($purchase)) {
                    continue;
                }
                $title = trim((string) ($purchase['title'] ?? $purchase['module_id'] ?? ''));
                $creatorName = trim((string) ($purchase['creatorName'] ?? ''));
                $purchasedLabel = portal_format_date_fr((string) ($purchase['purchased_at'] ?? ''));
                ?>
            <li class="portal-account-purchase-item">
                <div class="portal-account-purchase-main">
                    <p class="portal-account-purchase-title"><?= $ctx->e($title) ?></p>
                    <?php if ($creatorName !== '') : ?>
                    <p class="portal-account-purchase-creator">Créé par <?= $ctx->e($creatorName) ?></p>
                    <?php endif; ?>
                </div>
                <span class="portal-account-purchase-meta">
                    <span class="portal-account-purchase-date">Acheté le : <?= $ctx->e($purchasedLabel) ?></span>
                </span>
            </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</section>
