<?php
/**
 * Cases à cocher OS et modules pour création / édition de classe.
 *
 * @var \CapsuleOS\Portal\PortalContext $ctx
 * @var list<array<string, mixed>> $osCatalog
 * @var array{levels?: list<array<string, mixed>>} $modulesCatalog
 * @var list<string> $allowedOs
 * @var list<string> $allowedModules
 * @var string $classroomAccessMode create|edit
 */
$classroomAccessMode = $classroomAccessMode ?? 'create';
$isEdit = $classroomAccessMode === 'edit';

$freeModules = [];
$paidModules = [];
foreach ($modulesCatalog['levels'] ?? [] as $level) {
    if (!is_array($level)) {
        continue;
    }
    foreach ($level['modules'] ?? [] as $mod) {
        if (!is_array($mod)) {
            continue;
        }
        $access = (string) ($mod['access'] ?? 'free');
        if (in_array($access, ['subscriber', 'class'], true)) {
            $paidModules[] = $mod;
        } else {
            $freeModules[] = $mod;
        }
    }
}

$osChecked = static function (string $osId) use ($isEdit, $allowedOs): string {
    if (!$isEdit) {
        return '';
    }
    return ($allowedOs !== [] && in_array($osId, $allowedOs, true)) || $allowedOs === [] ? ' checked' : '';
};

$moduleChecked = static function (string $mountId) use ($isEdit, $allowedModules): string {
    if (!$isEdit) {
        return '';
    }
    return ($allowedModules !== [] && in_array($mountId, $allowedModules, true)) || $allowedModules === [] ? ' checked' : '';
};

$renderModuleChecks = static function (array $modules) use ($ctx, $moduleChecked): void {
    foreach ($modules as $mod) {
        if (!is_array($mod)) {
            continue;
        }
        $mid = (string) ($mod['mountId'] ?? '');
        if ($mid === '') {
            continue;
        }
        $access = (string) ($mod['access'] ?? 'free');
        ?>
        <label class="portal-account-check portal-account-check--module">
            <input type="checkbox" name="allowedModules" value="<?= $ctx->e($mid) ?>"<?= $moduleChecked($mid) ?>>
            <span class="portal-account-check-label"><?= $ctx->e((string) ($mod['title'] ?? $mid)) ?></span>
            <span class="portal-account-module-access portal-account-module-access--<?= $ctx->e($access) ?>"><?= $ctx->e((string) ($mod['accessLabel'] ?? '')) ?></span>
        </label>
        <?php
    }
};
?>
<fieldset class="portal-account-fieldset">
    <legend class="portal-label">OS autorisés<?= $isEdit ? '' : ' (vide = tous)' ?></legend>
    <p class="portal-account-fieldset-hint">Les élèves pourront lancer uniquement les systèmes cochés.</p>
    <div class="portal-account-check-grid">
        <?php foreach ($osCatalog as $os) :
            if (!is_array($os)) {
                continue;
            }
            $oid = (string) ($os['id'] ?? '');
            if ($oid === '') {
                continue;
            }
            ?>
        <label class="portal-account-check"><input type="checkbox" name="allowedOs" value="<?= $ctx->e($oid) ?>"<?= $osChecked($oid) ?>> <?= $ctx->e((string) ($os['displayName'] ?? '')) ?></label>
        <?php endforeach; ?>
    </div>
</fieldset>
<?php if ($freeModules !== []) : ?>
<fieldset class="portal-account-fieldset">
    <legend class="portal-label">Modules gratuits<?= $isEdit ? '' : ' (vide = tous)' ?></legend>
    <p class="portal-account-fieldset-hint">Parcours accessibles sans achat individuel.</p>
    <div class="portal-account-check-grid">
        <?php $renderModuleChecks($freeModules); ?>
    </div>
</fieldset>
<?php endif; ?>
<?php if ($paidModules !== []) : ?>
<fieldset class="portal-account-fieldset">
    <legend class="portal-label">Modules payants<?= $isEdit ? '' : ' (vide = tous)' ?></legend>
    <p class="portal-account-fieldset-hint">Parcours réservés aux abonnés, débloqués pour la classe via cette sélection.</p>
    <div class="portal-account-check-grid">
        <?php $renderModuleChecks($paidModules); ?>
    </div>
</fieldset>
<?php endif; ?>
