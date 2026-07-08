/**
 * Bus Se-Shell transversal — hauteur panel et relais applet visibility (tous toolkits Linux).
 * Contrat : etc/capsuleos/contracts/settings-effects-chain.json → layerConsumers.Se-Shell
 */
(function initCapsuleSeShellBus(global) {
    'use strict';

    const doc = global.document;
    if (!doc || !doc.body) {
        return;
    }

    const guards = global.CapsuleSeToolkitGuards;

    function toolkit() {
        if (guards && typeof guards.bodyId === 'function') {
            if (guards.isMint()) return 'mint';
            if (guards.isPlasma()) return 'plasma';
            if (guards.isGnomeShell()) return 'gnome';
        }
        return '';
    }

    function resolveHeightPx(detail) {
        const raw = detail && (detail.heightPx !== undefined ? detail.heightPx : detail.height);
        const parsed = parseInt(String(raw || '40'), 10);
        return Number.isFinite(parsed) ? parsed : 40;
    }

    function applyPanelHeight(detail) {
        const px = resolveHeightPx(detail || {});
        const body = doc.body;
        const pxStr = `${px}px`;
        body.dataset.capsulePanelHeight = String(px);

        switch (toolkit()) {
            case 'mint':
                body.style.setProperty('--mint-panel-height', pxStr);
                break;
            case 'plasma':
                body.dataset.plasmaPanelHeight = String(px);
                body.style.setProperty('--kde-plasma-panel-height', pxStr);
                body.style.setProperty('--taskbar-height', pxStr);
                break;
            case 'gnome':
                body.style.setProperty('--gnome-panel-height', pxStr);
                body.style.setProperty('--ubuntu-dock-item', `calc(${pxStr} * 0.95)`);
                break;
            default:
                body.style.setProperty('--taskbar-height', pxStr);
        }
    }

    function bootstrapFromDataset() {
        const stored = doc.body.dataset.plasmaPanelHeight || doc.body.dataset.capsulePanelHeight;
        if (stored) {
            applyPanelHeight({ height: stored });
        }
    }

    doc.addEventListener('capsule:panel-height-changed', function onPanelHeight(event) {
        applyPanelHeight((event && event.detail) || {});
    });

    bootstrapFromDataset();
    global.CapsuleSeShellBus = {
        applyPanelHeight: applyPanelHeight,
        bootstrapFromDataset: bootstrapFromDataset
    };
}(typeof window !== 'undefined' ? window : globalThis));
