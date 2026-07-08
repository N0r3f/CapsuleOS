<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Catalog\PortalContentReader;
$catalog = $ctx->modulesCatalog;
$contentParcours = PortalContentReader::section('parcours');
$sectionTitle = (string) ($contentParcours['title'] ?? $catalog['sectionTitle'] ?? 'Parcours pédagogiques');
$sectionLead = (string) ($contentParcours['lead'] ?? $catalog['sectionLead'] ?? '');
$sectionEyebrow = (string) ($contentParcours['eyebrow'] ?? '');
$levels = is_array($catalog['levels'] ?? null) ? $catalog['levels'] : [];
$isLoggedIn = $ctx->isLoggedIn();
$loginHref = portal_entry('login.php');
$subscribeHref = portal_entry('subscribe.php');

$launchHref = static function (string $facade, string $mountId): string {
    $sep = str_contains($facade, '?') ? '&' : '?';
    return portal_asset($facade) . $sep . 'mnt=' . rawurlencode($mountId);
};

$lockedCta = static function (array $module) use ($isLoggedIn, $loginHref, $subscribeHref): array {
    $access = (string) ($module['access'] ?? 'free');
    if ($access === 'subscriber') {
        if (!$isLoggedIn) {
            return ['label' => 'Passer à Abonné', 'modal' => 'register'];
        }
        return ['label' => 'Passer à Abonné', 'href' => $subscribeHref];
    }
    if ($access === 'registered' && !$isLoggedIn) {
        return ['label' => 'Créer un compte', 'modal' => 'register'];
    }
    if (!$isLoggedIn) {
        return ['label' => 'Se connecter', 'modal' => 'login'];
    }
    return ['label' => 'Se connecter', 'href' => $loginHref];
};
?>
        <section class="parcours" id="parcours" aria-labelledby="parcours-title">
            <div class="parcours-inner">
                <h2 class="parcours-title" id="parcours-title"><?= $ctx->e($sectionTitle) ?></h2>
                <?php if ($sectionLead !== '') : ?>
                    <p class="parcours-lead"><?= $ctx->e($sectionLead) ?></p>
                <?php endif; ?>

                <?php foreach ($levels as $level) :
                    if (!is_array($level)) {
                        continue;
                    }
                    $levelLabel = (string) ($level['label'] ?? '');
                    $modules = is_array($level['modules'] ?? null) ? $level['modules'] : [];
                    if ($modules === []) {
                        continue;
                    }
                    ?>
                <div class="parcours-level">
                    <h3 class="parcours-level-title"><?= $ctx->e($levelLabel) ?></h3>
                    <div class="parcours-grid">
                        <?php foreach ($modules as $module) :
                            if (!is_array($module)) {
                                continue;
                            }
                            $locked = !empty($module['locked']);
                            $mountId = (string) ($module['mountId'] ?? '');
                            $compatibleOs = is_array($module['compatibleOs'] ?? null) ? $module['compatibleOs'] : [];
                            $cardClass = 'parcours-card' . ($locked ? ' parcours-card--locked' : '');
                            ?>
                        <article class="<?= $cardClass ?>" data-mount-id="<?= $ctx->e($mountId) ?>">
                            <div class="parcours-card-head">
                                <h4 class="parcours-card-title"><?= $ctx->e((string) ($module['title'] ?? '')) ?></h4>
                                <span class="parcours-access parcours-access--<?= $ctx->e((string) ($module['access'] ?? 'free')) ?>">
                                    <?= $ctx->e((string) ($module['accessLabel'] ?? '')) ?>
                                </span>
                            </div>
                            <?php if ((string) ($module['description'] ?? '') !== '') : ?>
                                <p class="parcours-card-desc"><?= $ctx->e((string) $module['description']) ?></p>
                            <?php endif; ?>
                            <p class="parcours-card-meta">
                                <?= (int) ($module['scenarioCount'] ?? 0) ?> scénario<?= (int) ($module['scenarioCount'] ?? 0) > 1 ? 's' : '' ?>
                            </p>
                            <?php if ($locked) :
                                $cta = $lockedCta($module);
                                ?>
                                <?php if (!empty($cta['modal'])) : ?>
                                <button type="button"
                                        class="parcours-cta parcours-cta--locked"
                                        data-portal-auth-modal="<?= $ctx->e((string) $cta['modal']) ?>">
                                    <span class="parcours-lock" aria-hidden="true">🔒</span>
                                    <?= $ctx->e($cta['label']) ?>
                                </button>
                                <?php else : ?>
                                <a class="parcours-cta parcours-cta--locked" href="<?= $ctx->e((string) $cta['href']) ?>">
                                    <span class="parcours-lock" aria-hidden="true">🔒</span>
                                    <?= $ctx->e($cta['label']) ?>
                                </a>
                                <?php endif; ?>
                            <?php elseif ($compatibleOs === []) : ?>
                                <p class="parcours-card-empty">Aucun système compatible actif.</p>
                            <?php elseif (count($compatibleOs) === 1) :
                                $os = $compatibleOs[0];
                                ?>
                                <a class="parcours-cta" href="<?= $ctx->e($launchHref((string) $os['facade'], $mountId)) ?>">Démarrer : <?= $ctx->e((string) $os['displayName']) ?></a>
                            <?php else : ?>
                                <button type="button"
                                        class="parcours-cta parcours-cta--pick"
                                        data-parcours-pick
                                        data-mount-id="<?= $ctx->e($mountId) ?>"
                                        data-module-title="<?= $ctx->e((string) ($module['title'] ?? '')) ?>"
                                        data-compatible-os="<?= $ctx->e(json_encode($compatibleOs, JSON_UNESCAPED_UNICODE)) ?>">
                                    Choisir un système
                                </button>
                            <?php endif; ?>
                        </article>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <dialog class="parcours-modal" id="parcours-os-modal" aria-labelledby="parcours-os-modal-title">
                <div class="parcours-modal-panel">
                    <div class="parcours-modal-head">
                        <h3 class="parcours-modal-title" id="parcours-os-modal-title">Choisir un système</h3>
                        <button type="button" class="parcours-modal-close" id="parcours-os-modal-close" aria-label="Fermer">×</button>
                    </div>
                    <ul class="parcours-os-list" id="parcours-os-list"></ul>
                </div>
            </dialog>
        </section>
