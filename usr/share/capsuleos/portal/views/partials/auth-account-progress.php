<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$progressItems = is_array($ctx->extra['progressItems'] ?? null) ? $ctx->extra['progressItems'] : [];
$indexBase = portal_entry('index.php');
?>
<section class="portal-account-panel portal-account-progress" aria-labelledby="portal-account-progress-title">
    <h2 class="portal-account-panel-title" id="portal-account-progress-title">Progression des quêtes</h2>
    <p class="portal-account-panel-lead">Sauvegardes automatiques pendant les parcours. Reprenez ou supprimez une progression.</p>
    <?php if ($progressItems === []) : ?>
        <p class="portal-account-empty" id="portal-account-progress-empty">Aucune progression enregistrée. Lancez un parcours depuis la <a href="<?= $ctx->e($indexBase) ?>#parcours">section Parcours</a>.</p>
    <?php else : ?>
        <ul class="portal-account-progress-list" id="portal-account-progress-list">
            <?php foreach ($progressItems as $item) :
                if (!is_array($item)) {
                    continue;
                }
                ?>
            <li class="portal-account-progress-item" data-progress-row>
                <div class="portal-account-progress-main">
                    <p class="portal-account-progress-name"><?= $ctx->e((string) ($item['title'] ?? '')) ?></p>
                    <p class="portal-account-progress-meta">
                        <?php if ((string) ($item['levelLabel'] ?? '') !== '') : ?>
                            <span><?= $ctx->e((string) $item['levelLabel']) ?></span> ·
                        <?php endif; ?>
                        <span><?= (int) ($item['doneCount'] ?? 0) ?> / <?= (int) ($item['totalCount'] ?? 0) ?> missions</span>
                        <?php if ((string) ($item['updatedAt'] ?? '') !== '-') : ?>
                            · <span>Màj. <?= $ctx->e((string) $item['updatedAt']) ?></span>
                        <?php endif; ?>
                    </p>
                    <div class="portal-account-progress-bar" role="progressbar" aria-valuenow="<?= (int) ($item['percent'] ?? 0) ?>" aria-valuemin="0" aria-valuemax="100">
                        <span class="portal-account-progress-bar-fill" style="width: <?= (int) ($item['percent'] ?? 0) ?>%"></span>
                    </div>
                </div>
                <div class="portal-account-progress-actions">
                    <?php if (!empty($item['resumeHref'])) : ?>
                        <a class="portal-account-btn portal-account-btn--primary portal-account-btn--compact" href="<?= $ctx->e((string) $item['resumeHref']) ?>">Reprendre</a>
                    <?php endif; ?>
                    <button type="button"
                            class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact"
                            data-progress-delete="<?= $ctx->e((string) ($item['mountId'] ?? '')) ?>"
                            data-progress-label="<?= $ctx->e((string) ($item['title'] ?? '')) ?>"
                            data-csrf="<?= $ctx->e($ctx->csrfToken) ?>">
                        Supprimer
                    </button>
                </div>
            </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</section>
