<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Catalog\LegalCatalog;

$field = LegalCatalog::consentRegisterField();
$anchor = LegalCatalog::consentPrivacyAnchor();
$label = LegalCatalog::consentRegisterLabel();
$privacyHref = portal_entry('legal.php') . '#' . $anchor;
$parts = preg_split('/(politique de confidentialité)/iu', $label, 2);
?>
<label class="portal-consent">
    <input class="portal-consent-input" type="checkbox" name="<?= $ctx->e($field) ?>" value="1" required>
    <span class="portal-consent-label">
        <?php if (is_array($parts) && count($parts) === 2) : ?>
            <?= $ctx->e($parts[0]) ?><a href="<?= $ctx->e($privacyHref) ?>" target="_blank" rel="noopener noreferrer">politique de confidentialité</a><?= $ctx->e($parts[1]) ?>
        <?php else : ?>
            <?= $ctx->e($label) ?> <a href="<?= $ctx->e($privacyHref) ?>" target="_blank" rel="noopener noreferrer">En savoir plus</a>
        <?php endif; ?>
    </span>
</label>
