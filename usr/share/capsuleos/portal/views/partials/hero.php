<?php
use CapsuleOS\Portal\Catalog\PortalContentReader;
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$hero = PortalContentReader::section('hero');
$heroTitle = (string) ($hero['title'] ?? 'CapsuleOS');
$heroLead = (string) ($hero['lead'] ?? "Un site pour tester des systèmes d'exploitation, les appréhender en jouant et choisir vos préférences entre Linux, Windows, macOS, BSD, iOS et Android. Gratuit, léger et accessible à tous, y compris hors ligne.");
$ctaLabel = (string) ($hero['ctaLabel'] ?? 'Choisir un système');
$ctaHref = (string) ($hero['ctaHref'] ?? '#choisir-os');
$secondaryLabel = (string) ($hero['secondaryLabel'] ?? 'Voir les offres');
$secondaryHref = (string) ($hero['secondaryHref'] ?? '#offres');
?>
            <section class="hero">
                <div class="hero-body">
                    <div class="hero-content">
                        <h1 class="hero-title"><?= $ctx->e($heroTitle) ?></h1>
                        <p class="hero-lead">
                            <?= $ctx->e($heroLead) ?>
                        </p>
                        <div class="hero-actions">
                            <a class="hero-btn" href="<?= $ctx->e($ctaHref) ?>"><?= $ctx->e($ctaLabel) ?></a>
                            <a class="hero-link" href="<?= $ctx->e($secondaryHref) ?>"><?= $ctx->e($secondaryLabel) ?> <span aria-hidden="true">→</span></a>
                        </div>
                    </div>
                </div>
            </section>
