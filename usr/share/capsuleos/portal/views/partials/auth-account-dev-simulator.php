<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
use CapsuleOS\Portal\Config;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\Subscription\DevGradeSimulator;

if (!Config::isDev()) {
    return;
}

$current = DevGradeSimulator::currentSimGrade();
$simTitle = 'Simulation dev';
$labels = [
    'auto' => 'Réel (base de données)',
    'utilisateur' => 'Utilisateur gratuit',
    'abonne' => 'Abonné',
    'professeur' => 'Professeur',
    'createur' => 'Créateur',
    'eleve' => 'Élève (classe active)',
];
?>
<aside class="portal-account-header-aside portal-account-dev-sim" aria-labelledby="portal-account-dev-sim-title">
    <h2 class="portal-account-panel-title" id="portal-account-dev-sim-title"><?= $ctx->e($simTitle) ?></h2>
    <form class="portal-form portal-account-dev-sim-form" method="post" action="<?= $ctx->e(portal_entry('account.php')) ?>">
        <?= Csrf::input() ?>
        <input type="hidden" name="dev_sim_grade" value="1">
        <div class="portal-field">
            <select class="portal-input" name="grade" aria-labelledby="portal-account-dev-sim-title">
                <?php foreach (DevGradeSimulator::allowedGrades() as $grade) : ?>
                    <option value="<?= $ctx->e($grade) ?>"<?= $current === $grade ? ' selected' : '' ?>><?= $ctx->e($labels[$grade] ?? $grade) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <button type="submit" class="portal-submit portal-submit--compact">Appliquer</button>
    </form>
</aside>
