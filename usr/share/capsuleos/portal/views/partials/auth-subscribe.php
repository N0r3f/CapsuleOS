<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$plusPlan = null;
foreach ($ctx->offers['plans'] ?? [] as $plan) {
    if (is_array($plan) && ($plan['id'] ?? '') === 'subscriber') {
        $plusPlan = $plan;
        break;
    }
}
$price = is_array($plusPlan) ? (string) ($plusPlan['priceDisplay'] ?? '15 €') : '15 €';
?>
<div class="portal-subscribe">
    <p class="portal-subscribe-lead">
        Abonné : <strong><?= $ctx->e($price) ?>/mois</strong> : débloque l'ensemble des parcours pédagogiques,
        la progression sauvegardée et le catalogue complet des systèmes.
    </p>
    <?php if ($ctx->isSubscriber()) : ?>
        <p class="portal-account-note">Votre abonnement est déjà actif.</p>
    <?php else : ?>
        <p class="portal-subscribe-notice" role="status">
            Le paiement en ligne sera disponible prochainement. En attendant, votre compte est créé et prêt pour l'activation Abonné.
        </p>
    <?php endif; ?>
    <?php if (is_array($plusPlan) && is_array($plusPlan['features'] ?? null)) : ?>
        <ul class="plans-features portal-subscribe-features">
            <?php foreach ($plusPlan['features'] as $feature) : ?>
                <li><?= $ctx->e((string) $feature) ?></li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
    <p class="portal-auth-switch">
        <a href="<?= $ctx->e(portal_entry('legal.php')) ?>#donnees-bancaires">Données bancaires & RGPD</a>
        · <a href="<?= $ctx->e(portal_entry('account.php')) ?>">Mon compte</a>
        · <a href="<?= $ctx->e(portal_entry('index.php')) ?>">Retour à l'accueil</a>
    </p>
</div>
