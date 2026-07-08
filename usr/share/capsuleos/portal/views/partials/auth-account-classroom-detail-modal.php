<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$classroom = is_array($ctx->extra['teacherClassroom'] ?? null) ? $ctx->extra['teacherClassroom'] : null;
if ($classroom === null) {
    return;
}
$closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<dialog class="portal-account-modal portal-account-modal--classroom" id="portal-account-classroom-detail-modal" aria-labelledby="portal-account-classroom-detail-title">
    <div class="portal-account-modal-panel">
        <div class="portal-account-modal-head">
            <h2 class="portal-account-modal-title" id="portal-account-classroom-detail-title"><?= $ctx->e((string) ($classroom['name'] ?? 'Classe')) ?></h2>
            <button type="button" class="portal-account-modal-close" data-portal-account-modal-close aria-label="Fermer"><?= $closeIcon ?></button>
        </div>
        <div class="portal-account-modal-body">
            <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-classroom-detail-body.php'; ?>
        </div>
    </div>
</dialog>
