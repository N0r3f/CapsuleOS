<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$classroom = is_array($ctx->extra['teacherClassroom'] ?? null) ? $ctx->extra['teacherClassroom'] : null;
if ($classroom === null) {
    return;
}
$members = is_array($ctx->extra['teacherMembers'] ?? null) ? $ctx->extra['teacherMembers'] : [];
$osCatalog = is_array($ctx->extra['osCatalog'] ?? null) ? $ctx->extra['osCatalog'] : [];
$contract = is_array($ctx->extra['gradeContract'] ?? null) ? $ctx->extra['gradeContract'] : [];
$minSlots = (int) ($contract['classMinSlots'] ?? 2);
$maxSlots = (int) ($contract['classMaxSlots'] ?? 32);
$allowedOs = json_decode((string) ($classroom['allowed_os_json'] ?? '[]'), true);
if (!is_array($allowedOs)) {
    $allowedOs = [];
}
$allowedModules = json_decode((string) ($classroom['allowed_modules_json'] ?? '[]'), true);
if (!is_array($allowedModules)) {
    $allowedModules = [];
}
$modulesCatalog = is_array($ctx->extra['modulesCatalogFlat'] ?? null) ? $ctx->extra['modulesCatalogFlat'] : [];
$classroomAccessMode = 'edit';
$inviteUrl = portal_absolute_url('join-class.php', [
    'token' => (string) ($classroom['invite_token'] ?? ''),
]);
$inviteExpiresLabel = portal_format_date_fr((string) ($classroom['invite_expires_at'] ?? ''));
$inviteCopyTitle = 'Cliquer pour copier : ' . $inviteUrl;
$regenIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 4v6h6" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 20v-6h-6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<div class="portal-account-class-detail">
    <div class="portal-account-invite">
        <label class="portal-label">Lien d'invitation</label>
        <div class="portal-account-invite-row">
            <button type="button"
                    class="portal-account-invite-link"
                    data-invite-url="<?= $ctx->e($inviteUrl) ?>"
                    data-invite-copy-link
                    title="<?= $ctx->e($inviteCopyTitle) ?>"><?= $ctx->e($inviteUrl) ?></button>
            <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-invite-copy>Copier</button>
        </div>
        <div class="portal-account-invite-expiry">
            <span class="portal-account-invite-expiry-date" data-invite-expires>Expire le <?= $ctx->e($inviteExpiresLabel) ?></span>
            <button type="button" class="portal-account-invite-regen" data-invite-regenerate title="Régénérer le lien" aria-label="Régénérer le lien"><?= $regenIcon ?></button>
        </div>
    </div>
    <div class="portal-account-members-section">
        <div class="portal-account-members-head">
            <h3 class="portal-account-subtitle">Élèves inscrits</h3>
            <button type="button" class="portal-account-members-refresh" data-classroom-members-refresh title="Actualiser la liste" aria-label="Actualiser la liste"><?= $regenIcon ?></button>
        </div>
        <div data-classroom-members-root>
    <?php if ($members === []) : ?>
        <p class="portal-account-empty">Aucun élève pour le moment.</p>
    <?php else : ?>
        <ul class="portal-account-member-list" data-classroom-id="<?= (int) ($classroom['id'] ?? 0) ?>">
            <?php foreach ($members as $member) :
                if (!is_array($member)) {
                    continue;
                }
                $name = portal_user_anon_label($member);
                ?>
            <li class="portal-account-member-item">
                <span class="portal-account-member-name" title="<?= $ctx->e($name) ?>"><?= $ctx->e($name) ?></span>
                <?php $removeTitle = 'Retirer ' . $name; ?>
                <button type="button"
                        class="portal-account-member-remove"
                        title="<?= $ctx->e($removeTitle) ?>"
                        aria-label="<?= $ctx->e($removeTitle) ?>"
                        data-member-remove="<?= (int) ($member['user_id'] ?? 0) ?>">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
                </button>
            </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
        </div>
    </div>
    <details class="portal-account-details">
        <summary>Configurer la classe</summary>
        <form class="portal-form portal-account-teacher-form" data-classroom-update>
            <input type="hidden" name="classroomId" value="<?= (int) ($classroom['id'] ?? 0) ?>">
            <label class="portal-field">
                <span class="portal-label">Nom</span>
                <input class="portal-input" type="text" name="name" required value="<?= $ctx->e((string) ($classroom['name'] ?? '')) ?>">
            </label>
            <label class="portal-field">
                <span class="portal-label">Places</span>
                <input class="portal-input" type="text" name="maxSlots" inputmode="numeric" pattern="[0-9]*" data-numeric-input data-numeric-min="<?= (int) $minSlots ?>" data-numeric-max="<?= (int) $maxSlots ?>" required value="<?= (int) ($classroom['max_slots'] ?? 0) ?>">
            </label>
            <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-classroom-access-fieldsets.php'; ?>
            <button type="submit" class="portal-submit">Enregistrer</button>
        </form>
    </details>
    <div class="portal-account-class-detail-danger">
        <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--danger" data-classroom-delete>Supprimer la classe</button>
    </div>
</div>
