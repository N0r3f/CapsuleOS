<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$showProgress = $ctx->showSection('gamification')
    || $ctx->showSection('progress')
    || $ctx->showSection('student')
    || $ctx->showSection('skins');
$showPurchases = $ctx->showSection('purchases');
$showClasses = $ctx->showSection('teacher');
$showModules = $ctx->showSection('creator');
?>
<nav class="portal-account-nav" aria-label="Sections du compte">
    <ul class="portal-account-nav-list" role="tablist">
        <li class="portal-account-nav-item" role="presentation">
            <button type="button" class="portal-account-nav-link" role="tab" id="portal-account-nav-overview"
                aria-controls="account-view-overview" aria-selected="true" data-account-nav="overview">
                Mon compte
            </button>
        </li>
        <?php if ($showProgress) : ?>
        <li class="portal-account-nav-item" role="presentation" data-account-nav-item="progress">
            <button type="button" class="portal-account-nav-link" role="tab" id="portal-account-nav-progress"
                aria-controls="account-view-progress" aria-selected="false" data-account-nav="progress" tabindex="-1">
                Ma progression
            </button>
        </li>
        <?php endif; ?>
        <?php if ($showPurchases) : ?>
        <li class="portal-account-nav-item" role="presentation" data-account-nav-item="purchases">
            <button type="button" class="portal-account-nav-link" role="tab" id="portal-account-nav-purchases"
                aria-controls="account-view-purchases" aria-selected="false" data-account-nav="purchases" tabindex="-1">
                Mes achats
            </button>
        </li>
        <?php endif; ?>
        <?php if ($showClasses) : ?>
        <li class="portal-account-nav-item" role="presentation" data-account-nav-item="classes">
            <button type="button" class="portal-account-nav-link" role="tab" id="portal-account-nav-classes"
                aria-controls="account-view-classes" aria-selected="false" data-account-nav="classes" tabindex="-1">
                <span class="portal-account-nav-link-label">Mes classes</span>
                <?php
                $contract = is_array($ctx->extra['gradeContract'] ?? null) ? $ctx->extra['gradeContract'] : [];
                $classMaxPerTeacher = (int) ($ctx->extra['teacherClassMax'] ?? ($contract['classMaxPerTeacher'] ?? 1));
                $classCount = (int) ($ctx->extra['teacherClassCount'] ?? 0);
                ?>
                <span class="portal-account-nav-meta" data-portal-nav-class-slots><?= (int) $classCount ?>/<?= (int) $classMaxPerTeacher ?></span>
            </button>
        </li>
        <?php endif; ?>
        <?php if ($showModules) : ?>
        <li class="portal-account-nav-item" role="presentation" data-account-nav-item="modules">
            <button type="button" class="portal-account-nav-link" role="tab" id="portal-account-nav-modules"
                aria-controls="account-view-modules" aria-selected="false" data-account-nav="modules" tabindex="-1">
                Mes modules
            </button>
        </li>
        <?php endif; ?>
        <li class="portal-account-nav-item" role="presentation" data-account-nav-item="support">
            <button type="button" class="portal-account-nav-link" role="tab" id="portal-account-nav-support"
                aria-controls="account-view-support" aria-selected="false" data-account-nav="support" tabindex="-1">
                Support
                <span class="portal-account-nav-badge" data-portal-support-badge hidden></span>
            </button>
        </li>
        <li class="portal-account-nav-item" role="presentation">
            <button type="button" class="portal-account-nav-link" role="tab" id="portal-account-nav-settings"
                aria-controls="account-view-settings" aria-selected="false" data-account-nav="settings" tabindex="-1">
                Paramètres
            </button>
        </li>
        <li class="portal-account-nav-item portal-account-nav-item--logout" role="presentation">
            <a class="portal-account-nav-logout" href="<?= $ctx->e(portal_entry('logout.php')) ?>">Se déconnecter</a>
        </li>
    </ul>
</nav>
