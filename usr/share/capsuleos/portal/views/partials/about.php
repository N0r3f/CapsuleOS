<?php
use CapsuleOS\Portal\Catalog\PortalContentReader;
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$about = PortalContentReader::section('about');
$aboutTitle = (string) ($about['title'] ?? "Une nouvelle façon d'appréhender le numérique");
$aboutLead = (string) ($about['lead'] ?? '');
if ($aboutLead === '' && is_array($about['paragraphs'] ?? null) && isset($about['paragraphs'][0])) {
    $aboutLead = (string) $about['paragraphs'][0];
}
if ($aboutLead === '') {
    $aboutLead = "CapsuleOS propose des bureaux simulés pour s'approprier les interfaces, s'entraîner aux usages courants et gagner en autonomie face aux démarches en ligne, par le jeu et l'expérimentation, sans installation lourde.";
}
$aboutFeatures = is_array($about['features'] ?? null) ? $about['features'] : [];
if (!$aboutFeatures) {
    $aboutFeatures = [
        [
            'title' => 'Jouer pour apprendre',
            'description' => 'La gamification vous invite à explorer menus, fenêtres et applications à votre rythme, pour découvrir un OS sans pression.',
        ],
        [
            'title' => 'Choisir son environnement',
            'description' => 'Linux, Windows, macOS, BSD, iOS et Android : testez plusieurs bureaux, comparez leurs habitudes et identifiez vos préférences.',
        ],
        [
            'title' => 'Léger et accessible',
            'description' => 'HTML, CSS et JavaScript uniquement : le site reste gratuit, peu gourmand en ressources et pensé pour tourner sur la plupart des postes.',
        ],
        [
            'title' => 'Hors ligne possible',
            'description' => 'Après un premier chargement, un service worker et des gabarits embarqués permettent de continuer à utiliser les environnements sans connexion.',
        ],
    ];
}
$aboutIcons = [
    '<path d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" stroke-linecap="round" stroke-linejoin="round"/>',
    '<path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" stroke-linecap="round" stroke-linejoin="round"/>',
    '<path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" stroke-linecap="round" stroke-linejoin="round"/>',
    '<path d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0ZM3.75 3.75l16.5 16.5" stroke-linecap="round" stroke-linejoin="round"/>',
];
?>
        <section class="about" id="a-propos" aria-labelledby="about-title">
            <div class="about-inner">
                <div class="about-header">
                    <h2 class="about-title" id="about-title"><?= $ctx->e($aboutTitle) ?></h2>
                    <p class="about-lead">
                        <?= $ctx->e($aboutLead) ?>
                    </p>
                </div>

                <div class="about-features-wrap">
                    <dl class="about-features">
                        <?php foreach ($aboutFeatures as $index => $feature) :
                            if (!is_array($feature)) {
                                continue;
                            }
                            $featureTitle = trim((string) ($feature['title'] ?? ''));
                            $featureDesc = trim((string) ($feature['description'] ?? ''));
                            if ($featureTitle === '') {
                                continue;
                            }
                            $featureIcon = trim((string) ($feature['icon'] ?? ''));
                            if ($featureIcon !== '' && preg_match('/^[a-z0-9-]+$/', $featureIcon)) {
                                $iconPath = null;
                            } else {
                                $featureIcon = '';
                                $iconPath = $aboutIcons[$index % count($aboutIcons)];
                            }
                            ?>
                        <div class="about-feature">
                            <dt class="about-feature-term">
                                <div class="about-feature-icon" aria-hidden="true">
                                    <?php if ($featureIcon !== '') : ?>
                                    <i class="fa-solid fa-<?= $ctx->e($featureIcon) ?>"></i>
                                    <?php else : ?>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <?= $iconPath ?>
                                    </svg>
                                    <?php endif; ?>
                                </div>
                                <?= $ctx->e($featureTitle) ?>
                            </dt>
                            <?php if ($featureDesc !== '') : ?>
                            <dd class="about-feature-desc">
                                <?= $ctx->e($featureDesc) ?>
                            </dd>
                            <?php endif; ?>
                        </div>
                        <?php endforeach; ?>
                    </dl>
                </div>
            </div>
        </section>
