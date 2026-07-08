<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$skinSaves = is_array($ctx->extra['skinSaves'] ?? null) ? $ctx->extra['skinSaves'] : [];
?>
<section class="portal-account-panel portal-account-skins" aria-labelledby="portal-account-skins-title">
    <h2 class="portal-account-panel-title" id="portal-account-skins-title">Skins personnalisés</h2>
    <p class="portal-account-panel-lead">Sauvegardes des personnalisations de bureau liées à votre compte Abonné.</p>
    <?php if ($skinSaves === []) : ?>
        <p class="portal-account-empty">Aucune sauvegarde de skin pour le moment.</p>
    <?php else : ?>
        <ul class="portal-account-skin-list" id="portal-account-skin-list">
            <?php foreach ($skinSaves as $skin) :
                if (!is_array($skin)) {
                    continue;
                }
                ?>
            <li class="portal-account-skin-item" data-skin-row>
                <div>
                    <p class="portal-account-skin-name"><?= $ctx->e((string) ($skin['label'] ?? '')) ?></p>
                    <p class="portal-account-skin-meta">Màj. <?= $ctx->e((string) ($skin['updatedAt'] ?? '')) ?></p>
                </div>
                <button type="button"
                        class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact"
                        data-skin-delete="<?= $ctx->e((string) ($skin['registryId'] ?? '')) ?>"
                        data-skin-label="<?= $ctx->e((string) ($skin['label'] ?? '')) ?>"
                        data-csrf="<?= $ctx->e($ctx->csrfToken) ?>">
                    Supprimer
                </button>
            </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</section>
