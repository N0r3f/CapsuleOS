<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$welcomeName = !empty($ctx->extra['welcomeName'])
    ? (string) $ctx->extra['welcomeName']
    : $ctx->displayName();
$publicTag = portal_user_public_tag($ctx->user);
$planBadgeClass = $ctx->isSubscriber() ? 'portal-account-badge--plus' : 'portal-account-badge--free';
$gradeBadges = is_array($ctx->extra['gradeBadges'] ?? null) ? $ctx->extra['gradeBadges'] : [];
$extraGradeBadges = [];
foreach ($gradeBadges as $grade) {
    if (in_array($grade, ['utilisateur', 'abonne', 'visiteur'], true)) {
        continue;
    }
    $extraGradeBadges[] = $grade;
}
?>
<span class="portal-auth-title-line">
    <span class="portal-auth-title-accent" data-portal-account-name><?= $ctx->e($welcomeName) ?></span><?php if ($publicTag !== '') : ?><span class="portal-auth-title-discriminator" data-portal-account-tag><?= $ctx->e($publicTag) ?></span><?php endif; ?>
    <span class="portal-auth-title-badges">
        <span class="portal-account-badge portal-account-badge--title <?= $planBadgeClass ?>" data-portal-title-plan-badge><?= $ctx->e($ctx->planLabel) ?></span>
        <?php foreach ($extraGradeBadges as $grade) :
            $mod = 'portal-account-badge--' . preg_replace('/[^a-z0-9_]/', '', $grade);
            ?>
        <span class="portal-account-badge portal-account-badge--title <?= $ctx->e($mod) ?>"><?= $ctx->e(ucfirst(str_replace('_', ' ', $grade))) ?></span>
        <?php endforeach; ?>
        <span data-portal-grade-badges></span>
    </span>
</span>
