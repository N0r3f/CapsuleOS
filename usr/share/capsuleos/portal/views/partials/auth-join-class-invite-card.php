<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$preview = is_array($ctx->extra['invitePreview'] ?? null) ? $ctx->extra['invitePreview'] : null;
if ($preview === null || trim((string) ($preview['className'] ?? '')) === '') {
    return;
}
$className = (string) ($preview['className'] ?? '');
$teacherName = trim((string) ($preview['teacherName'] ?? ''));
$expiresLabel = trim((string) ($preview['expiresLabel'] ?? ''));
$expired = !empty($preview['expired']);
$moduleLabels = is_array($preview['moduleLabels'] ?? null) ? $preview['moduleLabels'] : [];
$modulesAll = !empty($preview['modulesAll']);
$osLabels = is_array($preview['osLabels'] ?? null) ? $preview['osLabels'] : [];
$osAll = !empty($preview['osAll']);
$benefits = is_array($preview['benefits'] ?? null) ? $preview['benefits'] : [];
?>
<article class="portal-join-class-card" aria-labelledby="portal-join-class-card-title">
    <p class="portal-join-class-card-eyebrow">Invitation à rejoindre</p>

    <div class="portal-join-class-card-facts">
        <div class="portal-join-class-card-fact">
            <span class="portal-join-class-card-label" id="portal-join-class-card-title">Nom de la classe</span>
            <span class="portal-join-class-card-value"><?= $ctx->e($className) ?></span>
        </div>
        <?php if ($teacherName !== '') : ?>
        <div class="portal-join-class-card-fact">
            <span class="portal-join-class-card-label">Professeur</span>
            <span class="portal-join-class-card-value portal-join-class-card-value--with-icon">
                <i class="fa-solid fa-user portal-join-class-card-icon" aria-hidden="true"></i>
                <?= $ctx->e($teacherName) ?>
            </span>
        </div>
        <?php endif; ?>
    </div>

    <section class="portal-join-class-card-section" aria-labelledby="portal-join-class-os-title">
        <h3 class="portal-join-class-card-section-title" id="portal-join-class-os-title">Systèmes autorisés</h3>
        <?php if ($osAll) : ?>
            <p class="portal-join-class-card-section-lead">Tous les bureaux simulés du catalogue.</p>
        <?php elseif ($osLabels !== []) : ?>
            <ul class="portal-join-class-card-list">
                <?php foreach ($osLabels as $label) : ?>
                    <li><?= $ctx->e((string) $label) ?></li>
                <?php endforeach; ?>
            </ul>
        <?php else : ?>
            <p class="portal-join-class-card-section-lead">Aucun système sélectionné pour le moment.</p>
        <?php endif; ?>
    </section>

    <section class="portal-join-class-card-section" aria-labelledby="portal-join-class-modules-title">
        <h3 class="portal-join-class-card-section-title" id="portal-join-class-modules-title">Modules autorisés</h3>
        <?php if ($modulesAll) : ?>
            <p class="portal-join-class-card-section-lead">Tous les parcours pédagogiques du catalogue.</p>
        <?php elseif ($moduleLabels !== []) : ?>
            <ul class="portal-join-class-card-list">
                <?php foreach ($moduleLabels as $label) : ?>
                    <li><?= $ctx->e((string) $label) ?></li>
                <?php endforeach; ?>
            </ul>
        <?php else : ?>
            <p class="portal-join-class-card-section-lead">Aucun module sélectionné pour le moment.</p>
        <?php endif; ?>
    </section>

    <?php if ($benefits !== []) : ?>
    <section class="portal-join-class-card-section portal-join-class-card-section--benefits" aria-labelledby="portal-join-class-benefits-title">
        <h3 class="portal-join-class-card-section-title" id="portal-join-class-benefits-title">Ce que donne l'accès à la classe</h3>
        <ul class="portal-join-class-card-list portal-join-class-card-list--benefits">
            <?php foreach ($benefits as $benefit) :
                if (!is_string($benefit) || trim($benefit) === '') {
                    continue;
                }
                ?>
            <li><?= $ctx->e($benefit) ?></li>
            <?php endforeach; ?>
        </ul>
    </section>
    <?php endif; ?>

    <?php if ($expiresLabel !== '' && $expiresLabel !== '-') : ?>
    <p class="portal-join-class-card-meta<?= $expired ? ' portal-join-class-card-meta--expired' : '' ?>">
        <?php if ($expired) : ?>
            Invitation expirée le <?= $ctx->e($expiresLabel) ?>
        <?php else : ?>
            Valide jusqu'au <?= $ctx->e($expiresLabel) ?>
        <?php endif; ?>
    </p>
    <?php endif; ?>
</article>
