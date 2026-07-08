<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$offers = $ctx->offers;
$sectionEyebrow = (string) ($offers['sectionEyebrow'] ?? 'Nos Forfaits');
$sectionTitle = (string) ($offers['sectionTitle'] ?? 'Choisir votre Forfait');
$sectionLead = (string) ($offers['sectionLead'] ?? '');
$plans = is_array($offers['plans'] ?? null) ? $offers['plans'] : [];
$isStatic = ($ctx->extra['staticDev'] ?? false) === true;

/**
 * @param array<string, mixed> $plan
 */
$resolveCtaHref = static function (array $plan) use ($ctx, $isStatic): string {
    $cta = is_array($plan['cta'] ?? null) ? $plan['cta'] : [];
    $href = (string) ($cta['href'] ?? '#');
    if ($isStatic && (str_contains($href, 'subscribe') || str_contains($href, 'register'))) {
        return '#';
    }
    if (!empty($cta['requiresAuth']) && !$ctx->isLoggedIn()) {
        $fallback = (string) ($cta['fallbackHref'] ?? portal_entry('register.php'));
        return str_contains($fallback, 'register') ? portal_entry('register.php') : $fallback;
    }
    if (str_starts_with($href, '#')) {
        return $href;
    }
    if (str_contains($href, 'subscribe')) {
        return portal_entry('subscribe.php');
    }
    if (str_contains($href, 'register')) {
        return portal_entry('register.php');
    }
    return $href;
};
?>
        <section class="plans" id="offres" aria-labelledby="plans-title" data-portal-offers-version="<?= (int) ($offers['version'] ?? 1) ?>">
            <div class="plans-inner">
                <?php if ($sectionEyebrow !== '') : ?>
                    <p class="plans-eyebrow"><?= $ctx->e($sectionEyebrow) ?></p>
                <?php endif; ?>
                <h2 class="plans-title" id="plans-title"><?= $ctx->e($sectionTitle) ?></h2>
                <?php if ($sectionLead !== '') : ?>
                    <p class="plans-lead"><?= $ctx->e($sectionLead) ?></p>
                <?php endif; ?>
                <div class="plans-grid">
                    <?php foreach ($plans as $plan) :
                        if (!is_array($plan)) {
                            continue;
                        }
                        $planId = (string) ($plan['id'] ?? '');
                        $featured = !empty($plan['featured']);
                        $cardClass = 'plans-card plans-card--' . preg_replace('/[^a-z0-9_-]/', '', $planId);
                        if ($featured) {
                            $cardClass .= ' plans-card--featured';
                        }
                        $price = (int) ($plan['priceMonthly'] ?? 0);
                        $pricePeriod = (string) ($plan['pricePeriod'] ?? '/mois');
                        $cta = is_array($plan['cta'] ?? null) ? $plan['cta'] : [];
                        $ctaHref = $resolveCtaHref($plan);
                        $ctaLabel = (string) ($cta['label'] ?? 'Choisir');
                        $features = is_array($plan['features'] ?? null) ? $plan['features'] : [];
                        $description = (string) ($plan['description'] ?? '');
                        $featuresEyebrow = (string) ($plan['featuresEyebrow'] ?? 'Inclus');
                        $priceDisplay = (string) ($plan['priceDisplay'] ?? $price . ' €');
                        ?>
                    <article class="<?= $cardClass ?>">
                        <div class="plans-card-head">
                            <?php if ($featured) : ?>
                                <p class="plans-badge">Recommandé</p>
                            <?php endif; ?>
                            <h3 class="plans-card-title"><?= $ctx->e((string) ($plan['label'] ?? '')) ?></h3>
                            <?php if ($description !== '') : ?>
                                <p class="plans-card-desc"><?= $ctx->e($description) ?></p>
                            <?php endif; ?>
                            <p class="plans-price">
                                <span class="plans-price-amount"><?= $ctx->e($priceDisplay) ?></span>
                                <?php if ($pricePeriod !== '') : ?>
                                    <span class="plans-price-period"><?= $ctx->e($pricePeriod) ?></span>
                                <?php endif; ?>
                            </p>
                            <a class="plans-cta<?= $featured ? ' plans-cta--primary' : '' ?>"
                               href="<?= $ctx->e($ctaHref) ?>"
                               <?php if ($isStatic && str_starts_with($ctaHref, '#')) : ?>
                                   data-portal-dev-stub
                                   title="Disponible avec portal/index.php (PHP)"
                               <?php endif; ?>
                            ><?= $ctx->e($ctaLabel) ?><?php if (!$featured && $planId === 'education') : ?> <i class="fa-solid fa-arrow-right plans-cta-icon" aria-hidden="true"></i><?php endif; ?></a>
                        </div>
                        <div class="plans-card-body">
                            <p class="plans-features-eyebrow"><?= $ctx->e($featuresEyebrow) ?></p>
                            <ul class="plans-features">
                                <?php foreach ($features as $feature) : ?>
                                    <li>
                                        <span class="plans-feature-icon"><i class="fa-solid fa-check" aria-hidden="true"></i></span>
                                        <span class="plans-feature-text"><?= $ctx->e((string) $feature) ?></span>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
