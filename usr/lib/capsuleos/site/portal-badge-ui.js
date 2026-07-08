/**
 * Rendu des badges gamification portail (grille d'icônes, infobulle au clic).
 */
(function () {
    'use strict';

    var TONES = ['gold', 'green', 'blue', 'purple', 'orange', 'teal', 'violet', 'rose', 'cyan'];

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function badgeIconClass(badge) {
        var family = badge.iconFamily === 'brands' ? 'fa-brands' : 'fa-solid';
        var icon = String(badge.icon || 'award').replace(/[^a-z0-9-]/g, '') || 'award';
        return family + ' fa-' + icon;
    }

    function badgeTone(badge) {
        var tone = String(badge.tone || 'blue').replace(/[^a-z]/g, '');
        return TONES.indexOf(tone) !== -1 ? tone : 'blue';
    }

    function renderBadgeTile(badge, earned) {
        var mod = earned ? ' portal-account-badge-tile--earned' : ' portal-account-badge-tile--locked';
        var tone = badgeTone(badge);
        return '<li class="portal-account-badge-cell">'
            + '<button type="button"'
            + ' class="portal-account-badge-tile portal-account-badge-tile--tone-' + tone + mod + '"'
            + ' data-portal-badge-tile'
            + ' data-badge-label="' + escapeHtml(badge.label || '') + '"'
            + ' data-badge-desc="' + escapeHtml(badge.description || '') + '"'
            + ' aria-label="' + escapeHtml(badge.label || '') + '"'
            + ' aria-expanded="false">'
            + '<span class="portal-account-badge-tile-icon" aria-hidden="true">'
            + '<i class="' + badgeIconClass(badge) + '"></i>'
            + '</span>'
            + '</button>'
            + '</li>';
    }

    function renderBadgeBoard(catalog, earnedIds) {
        var earned = Array.isArray(earnedIds) ? earnedIds : [];
        var html = '<div class="portal-account-badge-board" data-portal-badge-board>'
            + '<ul class="portal-account-badge-grid">';
        (catalog || []).forEach(function (badge) {
            if (!badge || !badge.id) {
                return;
            }
            html += renderBadgeTile(badge, earned.indexOf(badge.id) !== -1);
        });
        html += '</ul>'
            + '<div class="portal-account-badge-popover" data-portal-badge-popover hidden role="status" aria-live="polite">'
            + '<p class="portal-account-badge-popover-label" data-portal-badge-popover-label></p>'
            + '<p class="portal-account-badge-popover-desc" data-portal-badge-popover-desc></p>'
            + '</div>'
            + '</div>';
        return html;
    }

    function renderBadgeGrid(catalog, earnedIds) {
        return renderBadgeBoard(catalog, earnedIds);
    }

    window.CapsulePortalBadgeUi = {
        badgeIconClass: badgeIconClass,
        badgeTone: badgeTone,
        renderBadgeTile: renderBadgeTile,
        renderBadgeBoard: renderBadgeBoard,
        renderBadgeGrid: renderBadgeGrid,
    };
}());
