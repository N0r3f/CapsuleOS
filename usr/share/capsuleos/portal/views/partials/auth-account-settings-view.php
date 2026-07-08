<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
?>
<section class="portal-account-panel portal-account-settings-view" data-account-subnav-scope="settings" aria-labelledby="portal-account-settings-view-title">
    <h2 class="portal-account-panel-title portal-account-panel-title--visually-hidden" id="portal-account-settings-view-title">Paramètres</h2>
    <nav class="portal-account-subnav" aria-label="Paramètres du compte">
        <ul class="portal-account-subnav-list" data-account-subnav-list role="tablist">
            <li class="portal-account-subnav-item" role="presentation">
                <button type="button" class="portal-account-subnav-link portal-account-subnav-link--active" role="tab"
                    id="portal-account-subnav-subscription" aria-controls="account-subview-subscription"
                    aria-selected="true" data-account-sub-nav="subscription">Abonnement</button>
            </li>
            <li class="portal-account-subnav-item" role="presentation">
                <button type="button" class="portal-account-subnav-link" role="tab"
                    id="portal-account-subnav-account" aria-controls="account-subview-account"
                    aria-selected="false" data-account-sub-nav="account" tabindex="-1">Compte</button>
            </li>
        </ul>
    </nav>
    <div class="portal-account-subviews" data-account-subviews>
        <div class="portal-account-subview" id="account-subview-subscription" data-account-sub-view="subscription"
            role="tabpanel" aria-labelledby="portal-account-subnav-subscription">
            <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-subscription-settings.php'; ?>
        </div>
        <div class="portal-account-subview" id="account-subview-account" data-account-sub-view="account" hidden
            role="tabpanel" aria-labelledby="portal-account-subnav-account">
            <section class="portal-account-panel" aria-labelledby="portal-account-account-settings-title">
                <h2 class="portal-account-panel-title" id="portal-account-account-settings-title">Compte</h2>
                <?php include CAPSULE_PORTAL_VIEWS . '/partials/auth-account-settings.php'; ?>
            </section>
        </div>
    </div>
</section>
