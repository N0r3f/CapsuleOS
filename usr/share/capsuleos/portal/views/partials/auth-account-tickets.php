<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Creator\ModuleSubmissionRepository;

$ticketTypes = is_array($ctx->extra['ticketTypes'] ?? null) ? $ctx->extra['ticketTypes'] : [];
$groupedTypes = [];
$hasModuleType = false;
foreach ($ticketTypes as $type) {
    if (!is_array($type)) {
        continue;
    }
    if ((string) ($type['id'] ?? '') === 'demande_module') {
        $hasModuleType = true;
    }
    $group = trim((string) ($type['group'] ?? ''));
    $groupedTypes[$group][] = $type;
}
$submissionContract = $hasModuleType ? ModuleSubmissionRepository::contract() : [];
$submissionLevels = is_array($submissionContract['levels'] ?? null) ? $submissionContract['levels'] : [];
$submissionBilling = is_array($submissionContract['billingTypes'] ?? null) ? $submissionContract['billingTypes'] : [];
?>
<form class="portal-form portal-account-ticket-form" data-ticket-form>
    <label class="portal-field portal-field--type">
        <span class="portal-label">Type de demande</span>
        <div class="portal-select portal-select--ticket-type">
            <select class="portal-input portal-input--select" name="type" required data-ticket-type-select>
                <?php foreach ($groupedTypes as $groupLabel => $types) :
                    $hasGroup = $groupLabel !== '';
                    if ($hasGroup) : ?>
                <optgroup label="<?= $ctx->e($groupLabel) ?>">
                    <?php endif;
                    foreach ($types as $type) :
                        $typeId = (string) ($type['id'] ?? '');
                        if ($typeId === '') {
                            continue;
                        }
                        $hint = trim((string) ($type['hint'] ?? ''));
                        $defaultSubject = trim((string) ($type['defaultSubject'] ?? ''));
                        ?>
                    <option value="<?= $ctx->e($typeId) ?>"<?php
                        if ($defaultSubject !== '') :
                            ?> data-default-subject="<?= $ctx->e($defaultSubject) ?>"<?php
                        endif;
                        if ($hint !== '') :
                            ?> data-hint="<?= $ctx->e($hint) ?>"<?php
                        endif; ?>><?= $ctx->e((string) ($type['label'] ?? '')) ?></option>
                    <?php endforeach;
                    if ($hasGroup) : ?>
                </optgroup>
                    <?php endif;
                endforeach; ?>
            </select>
        </div>
        <p class="portal-ticket-type-hint" data-ticket-type-hint hidden></p>
    </label>
    <label class="portal-field">
        <span class="portal-label" data-ticket-subject-label>Sujet</span>
        <input class="portal-input" type="text" name="subject" required maxlength="120">
    </label>
    <?php if ($hasModuleType) : ?>
    <fieldset class="portal-field portal-ticket-module-fields" data-ticket-submission-fields hidden>
        <legend class="portal-label">Détails du module</legend>
        <label class="portal-field">
            <span class="portal-label">Titre du module</span>
            <input class="portal-input" type="text" name="moduleTitle" maxlength="120" placeholder="Découverte du terminal" data-ticket-submission-input>
        </label>
        <label class="portal-field">
            <span class="portal-label">Niveau pédagogique</span>
            <select class="portal-input" name="requestedLevel" data-ticket-submission-input>
                <option value="">Choisir…</option>
                <?php foreach ($submissionLevels as $levelId) : ?>
                <option value="<?= $ctx->e((string) $levelId) ?>"><?= $ctx->e(ucfirst((string) $levelId)) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label class="portal-field">
            <span class="portal-label">Dépôt Git (HTTPS)</span>
            <input class="portal-input" type="url" name="gitUrl" placeholder="https://github.com/vous/mon-module" data-ticket-submission-input>
        </label>
        <label class="portal-field">
            <span class="portal-label">Branche ou tag</span>
            <input class="portal-input" type="text" name="gitRef" value="main" maxlength="120" data-ticket-submission-input>
        </label>
        <fieldset class="portal-field portal-ticket-module-billing">
            <legend class="portal-label">Modèle commercial</legend>
            <?php foreach ($submissionBilling as $bt) :
                if (!is_array($bt)) {
                    continue;
                }
                $bid = (string) ($bt['id'] ?? '');
                $blabel = (string) ($bt['label'] ?? $bid);
                ?>
            <label class="portal-radio-line">
                <input type="radio" name="billingType" value="<?= $ctx->e($bid) ?>"<?= $bid === 'subscriber' ? ' checked' : '' ?> data-ticket-submission-input>
                <span><?= $ctx->e($blabel) ?></span>
            </label>
            <?php endforeach; ?>
        </fieldset>
        <label class="portal-field" data-ticket-price-field hidden>
            <span class="portal-label">Prix affiché</span>
            <input class="portal-input" type="text" name="priceDisplay" maxlength="24" placeholder="15 €" data-ticket-submission-input>
        </label>
    </fieldset>
    <?php endif; ?>
    <label class="portal-field portal-field--message">
        <span class="portal-label" data-ticket-message-label>Message</span>
        <div class="portal-ticket-composer" data-ticket-composer>
            <div class="portal-ticket-composer-toolbar" role="toolbar" aria-label="Ajouter un lien ou une capture">
                <button type="button" class="portal-ticket-composer-btn" data-ticket-insert-link title="Insérer un lien" aria-label="Insérer un lien">
                    <i class="fa-solid fa-link" aria-hidden="true"></i>
                    <span class="portal-ticket-composer-btn-label">Lien</span>
                </button>
                <button type="button" class="portal-ticket-composer-btn" data-ticket-insert-screenshot title="Insérer une capture d'écran" aria-label="Insérer une capture d'écran">
                    <i class="fa-solid fa-image" aria-hidden="true"></i>
                    <span class="portal-ticket-composer-btn-label">Capture</span>
                </button>
                <input type="file" class="portal-ticket-composer-file" data-ticket-screenshot-input accept="image/png,image/jpeg,image/gif,image/webp" hidden>
            </div>
            <textarea class="portal-input portal-textarea" name="body" rows="4" maxlength="4000" required></textarea>
        </div>
    </label>
    <button type="submit" class="portal-submit">Envoyer</button>
</form>
