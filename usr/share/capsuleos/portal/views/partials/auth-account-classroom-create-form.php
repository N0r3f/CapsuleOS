<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$contract = is_array($ctx->extra['gradeContract'] ?? null) ? $ctx->extra['gradeContract'] : [];
$minSlots = (int) ($contract['classMinSlots'] ?? 2);
$maxSlots = (int) ($contract['classMaxSlots'] ?? 32);
$osCatalog = is_array($ctx->extra['osCatalog'] ?? null) ? $ctx->extra['osCatalog'] : [];
$modulesCatalog = is_array($ctx->extra['modulesCatalogFlat'] ?? null) ? $ctx->extra['modulesCatalogFlat'] : [];
$formId = (string) ($ctx->extra['classroomCreateFormId'] ?? 'classroom-create');
$allowedOs = [];
$allowedModules = [];
$classroomAccessMode = 'create';
?>
<form class="portal-form portal-account-teacher-form" id="<?= $ctx->e($formId) ?>" data-classroom-create>
    <label class="portal-field">
        <span class="portal-label">Nom de la classe</span>
        <input class="portal-input" type="text" name="name" required maxlength="80" placeholder="Ex. Linux débutants" autocomplete="off">
    </label>
    <label class="portal-field">
        <span class="portal-label">Nombre de places (<?= (int) $minSlots ?> à <?= (int) $maxSlots ?>)</span>
        <input class="portal-input" type="text" name="maxSlots" inputmode="numeric" pattern="[0-9]*" data-numeric-input data-numeric-min="<?= (int) $minSlots ?>" data-numeric-max="<?= (int) $maxSlots ?>" required placeholder="Ex. 24" autocomplete="off">
    </label>
    <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-classroom-access-fieldsets.php'; ?>
    <button type="submit" class="portal-submit">Créer la classe</button>
</form>
