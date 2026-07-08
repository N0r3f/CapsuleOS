<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$headerDevClass = '';
$showProgress = $ctx->showSection('gamification')
    || $ctx->showSection('progress')
    || $ctx->showSection('student')
    || $ctx->showSection('skins');
$showPurchases = $ctx->showSection('purchases');
$showClasses = $ctx->showSection('teacher');
$showModules = $ctx->showSection('creator');
?>
<div class="portal-account" data-portal-account data-portal-account-path="<?= $ctx->e(portal_entry('account.php')) ?>" data-csrf="<?= $ctx->e($ctx->csrfToken) ?>" data-portal-api-base="<?= $ctx->e(portal_entry('api/')) ?>" data-portal-display-name="<?= $ctx->e($ctx->displayName()) ?>" data-portal-subscriber="<?= $ctx->isSubscriber() ? '1' : '0' ?>" data-portal-subscription-history="<?= ($ctx->isSubscriber() || \CapsuleOS\Portal\User\UserRepository::hasSubscriptionHistory((int) ($ctx->user['id'] ?? 0))) ? '1' : '0' ?>" data-portal-author-badges="<?= $ctx->e(json_encode(portal_account_author_badges($ctx), JSON_UNESCAPED_UNICODE)) ?>">
    <header class="portal-account-header<?= $headerDevClass ?>">
        <div class="portal-account-header-main">
            <p class="portal-account-eyebrow">Espace personnel</p>
            <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-xp-summary.php'; ?>
        </div>
    </header>

    <div class="portal-account-body">
        <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-nav.php'; ?>

        <div class="portal-account-views">
            <section class="portal-account-view" id="account-view-overview" data-account-view="overview"
                role="tabpanel" aria-labelledby="portal-account-nav-overview">
                <div class="portal-account-panel-row">
                    <?php if ($ctx->showSection('usage')) {
                        include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-usage.php';
                    } ?>
                    <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-subscription-overview.php'; ?>
                </div>
            </section>

            <?php if ($showProgress) : ?>
            <section class="portal-account-view" id="account-view-progress" data-account-view="progress" hidden
                role="tabpanel" aria-labelledby="portal-account-nav-progress">
                <div class="portal-account-view-stack">
                    <?php if ($ctx->showSection('student')) {
                        include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-student.php';
                    } ?>
                    <?php if ($ctx->showSection('gamification') || $ctx->showSection('progress')) : ?>
                    <div class="portal-account-panel-row portal-account-progress-row">
                        <?php if ($ctx->showSection('gamification')) {
                            include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-gamification.php';
                        } ?>
                        <?php if ($ctx->showSection('progress')) {
                            include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-progress.php';
                        } ?>
                    </div>
                    <?php endif; ?>
                    <?php if ($ctx->showSection('skins')) {
                        include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-skins.php';
                    } ?>
                </div>
            </section>
            <?php endif; ?>

            <?php if ($showPurchases) : ?>
            <section class="portal-account-view" id="account-view-purchases" data-account-view="purchases" hidden
                role="tabpanel" aria-labelledby="portal-account-nav-purchases">
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-purchases.php'; ?>
            </section>
            <?php endif; ?>

            <?php if ($showClasses) : ?>
            <section class="portal-account-view" id="account-view-classes" data-account-view="classes" hidden
                role="tabpanel" aria-labelledby="portal-account-nav-classes">
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-teacher.php'; ?>
            </section>
            <?php endif; ?>

            <?php if ($showModules) : ?>
            <section class="portal-account-view" id="account-view-modules" data-account-view="modules" hidden
                role="tabpanel" aria-labelledby="portal-account-nav-modules">
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-creator.php'; ?>
            </section>
            <?php endif; ?>

            <section class="portal-account-view" id="account-view-support" data-account-view="support" hidden
                role="tabpanel" aria-labelledby="portal-account-nav-support">
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-support-view.php'; ?>
            </section>

            <section class="portal-account-view" id="account-view-settings" data-account-view="settings" hidden
                role="tabpanel" aria-labelledby="portal-account-nav-settings">
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-settings-view.php'; ?>
            </section>
        </div>
    </div>
    <?php if ($showClasses) {
        include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-classroom-create-modal.php';
    } ?>
    <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-settings-confirm-modal.php'; ?>
</div>
