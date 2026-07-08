<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$teacherClassrooms = is_array($ctx->extra['teacherClassrooms'] ?? null) ? $ctx->extra['teacherClassrooms'] : [];
$contract = is_array($ctx->extra['gradeContract'] ?? null) ? $ctx->extra['gradeContract'] : [];
$minSlots = (int) ($contract['classMinSlots'] ?? 2);
$maxSlots = (int) ($contract['classMaxSlots'] ?? 32);
$classMaxPerTeacher = (int) ($ctx->extra['teacherClassMax'] ?? ($contract['classMaxPerTeacher'] ?? 1));
$classCount = (int) ($ctx->extra['teacherClassCount'] ?? count($teacherClassrooms));
$canCreateClass = $classCount < $classMaxPerTeacher;
?>
<section class="portal-account-panel portal-account-teacher" aria-labelledby="portal-account-teacher-title" data-teacher-panel data-teacher-class-max="<?= (int) $classMaxPerTeacher ?>" data-teacher-class-count="<?= (int) $classCount ?>">
    <h2 class="portal-account-panel-title" id="portal-account-teacher-title">Mes classes</h2>
    <p class="portal-account-panel-lead">Créez votre classe, invitez vos élèves par lien (de <?= (int) $minSlots ?> à <?= (int) $maxSlots ?> places, invitation valide 7 jours).</p>

    <div class="portal-account-class-grid">
        <?php foreach ($teacherClassrooms as $entry) :
            if (!is_array($entry)) {
                continue;
            }
            $classroom = is_array($entry['classroom'] ?? null) ? $entry['classroom'] : null;
            if ($classroom === null) {
                continue;
            }
            $memberCount = (int) ($entry['memberCount'] ?? 0);
            $classMaxSlots = (int) ($classroom['max_slots'] ?? 0);
            $classroomId = (int) ($classroom['id'] ?? 0);
            ?>
        <button type="button" class="portal-account-class-card portal-account-class-card--active" data-classroom-open="<?= $classroomId ?>" aria-label="Ouvrir <?= $ctx->e((string) ($classroom['name'] ?? 'la classe')) ?>">
            <h3 class="portal-account-class-card-title"><?= $ctx->e((string) ($classroom['name'] ?? '')) ?></h3>
            <p class="portal-account-class-card-seats"><span class="portal-account-class-card-seats-count" data-classroom-seats-count data-classroom-id="<?= $classroomId ?>"><?= $memberCount ?>/<?= $classMaxSlots ?></span> places</p>
        </button>
        <?php endforeach; ?>
        <?php if ($canCreateClass) : ?>
        <button type="button" class="portal-account-class-card portal-account-class-card--add" data-portal-account-modal-open="classroom-create" aria-label="Créer une classe">
            <span class="portal-account-class-card-plus" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
            </span>
            <span class="portal-account-class-card-add-label">Nouvelle classe</span>
        </button>
        <?php elseif ($teacherClassrooms === []) : ?>
        <p class="portal-admin-empty">Limite de classes atteinte (<?= (int) $classCount ?>/<?= (int) $classMaxPerTeacher ?>).</p>
        <?php endif; ?>
    </div>
</section>
