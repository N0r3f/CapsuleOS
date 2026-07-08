<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$sections = is_array($ctx->extra['sections'] ?? null) ? $ctx->extra['sections'] : [];
$labels = [
    'dashboard' => 'Tableau de bord',
    'users' => 'Utilisateurs',
    'admins' => 'Administrateurs',
    'subscriptions' => 'Abonnements',
    'tickets' => 'Tickets',
    'os' => 'Systèmes',
    'modules' => 'Modules',
    'offers' => 'Offres',
    'content' => 'Contenu',
    'classes' => 'Classes',
    'usage' => 'Quotas OS',
    'progress' => 'Progression',
    'gamification' => 'Gamification',
    'runtime' => 'Santé',
    'entitlements' => 'Droits',
    'grades' => 'Grades',
    'legal' => 'Légal',
    'accessibility' => 'Accessibilité',
    'audit' => 'Audit',
];
$icons = [
    'dashboard' => 'fa-gauge-high',
    'users' => 'fa-users',
    'admins' => 'fa-user-shield',
    'subscriptions' => 'fa-credit-card',
    'tickets' => 'fa-life-ring',
    'os' => 'fa-desktop',
    'modules' => 'fa-cube',
    'offers' => 'fa-tags',
    'content' => 'fa-file-lines',
    'classes' => 'fa-chalkboard-user',
    'usage' => 'fa-hourglass-half',
    'progress' => 'fa-chart-line',
    'gamification' => 'fa-trophy',
    'runtime' => 'fa-server',
    'entitlements' => 'fa-key',
    'grades' => 'fa-user-tag',
    'legal' => 'fa-scale-balanced',
    'accessibility' => 'fa-universal-access',
    'audit' => 'fa-clipboard-list',
];
$groups = [
    'Principal' => ['dashboard'],
    'Gestion' => ['users', 'admins', 'subscriptions', 'classes', 'tickets', 'usage', 'progress', 'gamification'],
    'Contenu' => ['os', 'modules'],
    'Configuration' => ['offers', 'entitlements', 'grades', 'content', 'legal', 'accessibility'],
    'Système' => ['runtime', 'audit'],
];
$logoutPath = portal_admin_paths()['logout'];
$siteHomePath = portal_entry('index.php');
?>
<div class="portal-admin" data-portal-admin-root>
    <div class="portal-admin-sidebar-backdrop" data-admin-sidebar-backdrop hidden></div>
    <aside class="portal-admin-sidebar" id="portal-admin-sidebar" aria-label="Navigation administration">
        <div class="portal-admin-sidebar-brand">
            <img src="<?= $ctx->e(portal_asset('usr/share/capsuleos/assets/images/common/capsule.webp')) ?>" alt="" width="32" height="32" class="portal-admin-sidebar-logo">
            <div class="portal-admin-sidebar-brand-text">
                <strong>CapsuleOS</strong>
                <span>Administration</span>
            </div>
        </div>
        <nav class="portal-admin-nav" aria-label="Sections" data-admin-nav-accordion>
            <?php $groupIndex = 0;
            foreach ($groups as $groupLabel => $groupSections) :
                $visible = array_values(array_filter($groupSections, static fn (string $s): bool => in_array($s, $sections, true)));
                if ($visible === []) {
                    continue;
                }
                $groupOpen = in_array('dashboard', $visible, true);
                $groupId = 'portal-admin-nav-group-' . $groupIndex;
                $groupIndex++;
                ?>
            <div class="portal-admin-nav-group<?= $groupOpen ? ' is-open' : '' ?>" data-admin-nav-group>
                <h2 class="portal-admin-nav-group-heading">
                    <button type="button" class="portal-admin-nav-group-toggle"
                        aria-expanded="<?= $groupOpen ? 'true' : 'false' ?>"
                        aria-controls="<?= $ctx->e($groupId) ?>"
                        data-admin-nav-toggle>
                        <span class="portal-admin-nav-group-label"><?= $ctx->e($groupLabel) ?></span>
                        <i class="fa-solid fa-chevron-down portal-admin-nav-group-chevron" aria-hidden="true"></i>
                    </button>
                </h2>
                <div class="portal-admin-nav-group-panel" id="<?= $ctx->e($groupId) ?>" data-admin-nav-panel<?= $groupOpen ? '' : ' inert' ?>>
                    <ul class="portal-admin-nav-list" role="tablist">
                        <?php foreach ($visible as $section) :
                            $icon = $icons[$section] ?? 'fa-circle';
                            ?>
                        <li class="portal-admin-nav-item" role="presentation">
                            <button type="button" class="portal-admin-nav-link" role="tab"
                                id="portal-admin-nav-<?= $ctx->e($section) ?>"
                                aria-controls="portal-admin-view-<?= $ctx->e($section) ?>"
                                aria-selected="<?= $section === 'dashboard' ? 'true' : 'false' ?>"
                                data-admin-nav="<?= $ctx->e($section) ?>"
                                <?= $section !== 'dashboard' ? ' tabindex="-1"' : '' ?>>
                                <i class="fa-solid <?= $ctx->e($icon) ?>" aria-hidden="true"></i>
                                <span><?= $ctx->e($labels[$section] ?? $section) ?></span>
                                <?php if ($section === 'tickets') : ?>
                                <span class="portal-admin-nav-badge" data-admin-nav-badge="tickets" hidden>0</span>
                                <?php endif; ?>
                            </button>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
            <?php endforeach; ?>
        </nav>
        <div class="portal-admin-sidebar-footer">
            <div class="portal-admin-sidebar-identity" data-admin-sidebar-identity hidden>
                <span class="portal-admin-avatar" data-admin-sidebar-avatar aria-hidden="true"></span>
                <div class="portal-admin-sidebar-identity-text">
                    <strong data-admin-sidebar-name></strong>
                    <span data-admin-sidebar-email></span>
                </div>
            </div>
            <a class="portal-admin-sidebar-logout" href="<?= $ctx->e($siteHomePath) ?>">
                <i class="fa-solid fa-house" aria-hidden="true"></i>
                <span>Retour au site</span>
            </a>
            <a class="portal-admin-sidebar-logout" href="<?= $ctx->e($logoutPath) ?>">
                <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                <span>Se déconnecter</span>
            </a>
        </div>
    </aside>
    <div class="portal-admin-main">
        <header class="portal-admin-topbar">
            <button type="button" class="portal-admin-nav-toggle" data-admin-sidebar-toggle aria-label="Ouvrir la navigation" aria-controls="portal-admin-sidebar" aria-expanded="false">
                <i class="fa-solid fa-bars" aria-hidden="true"></i>
            </button>
            <div class="portal-admin-topbar-head">
                <h1 class="portal-admin-topbar-title" id="portal-admin-page-title">Tableau de bord</h1>
                <p class="portal-admin-topbar-subtitle" id="portal-admin-page-subtitle">Vue d'ensemble de la plateforme</p>
            </div>
            <form class="portal-admin-search portal-admin-search--topbar" data-admin-search role="search">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input type="search" class="portal-input" name="q" placeholder="Rechercher par UID, e-mail ou nom…" data-admin-search-input aria-label="Rechercher un utilisateur">
            </form>
            <div class="portal-admin-topbar-actions">
                <button type="button" class="portal-admin-bell" data-admin-bell title="Notifications support" aria-label="Tickets en attente">
                    <i class="fa-solid fa-bell" aria-hidden="true"></i>
                    <span class="portal-admin-bell-dot" data-admin-bell-dot hidden></span>
                </button>
                <button type="button" class="portal-admin-topbar-btn" data-admin-refresh title="Actualiser la vue">
                    <i class="fa-solid fa-rotate" aria-hidden="true"></i>
                    <span>Actualiser</span>
                </button>
                <div class="portal-admin-user-chip" data-admin-user-chip hidden>
                    <i class="fa-solid fa-user-shield" aria-hidden="true"></i>
                    <span data-admin-user-label></span>
                </div>
            </div>
        </header>
        <div class="portal-admin-views">
            <?php foreach ($sections as $section) :
                $section = (string) $section;
                ?>
            <section class="portal-admin-view" role="tabpanel"
                id="portal-admin-view-<?= $ctx->e($section) ?>"
                data-admin-view="<?= $ctx->e($section) ?>"
                aria-labelledby="portal-admin-nav-<?= $ctx->e($section) ?>"
                <?= $section !== 'dashboard' ? ' hidden' : '' ?>>
                <div class="portal-admin-view-inner" data-admin-panel="<?= $ctx->e($section) ?>">
                    <p class="portal-admin-loading"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Chargement…</p>
                </div>
            </section>
            <?php endforeach; ?>
        </div>
    </div>
</div>
