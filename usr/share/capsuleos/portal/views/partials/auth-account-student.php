<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$membership = is_array($ctx->extra['classMembership'] ?? null) ? $ctx->extra['classMembership'] : null;
?>
<section class="portal-account-panel portal-account-student" aria-labelledby="portal-account-student-title">
    <h2 class="portal-account-panel-title" id="portal-account-student-title">Classe</h2>
    <?php if ($membership !== null) : ?>
        <p class="portal-account-student-status">
            <span class="portal-account-badge portal-account-badge--student">Élève</span>
            Classe : <strong><?= $ctx->e((string) ($membership['classroom_name'] ?? '')) ?></strong>
        </p>
        <p class="portal-account-panel-lead">Votre classe débloque l'utilisation illimitée des OS autorisés et la progression pédagogique.</p>
    <?php endif; ?>
</section>
