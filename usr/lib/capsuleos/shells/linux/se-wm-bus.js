/**
 * Bus Se-WM transversal — espaces de travail dynamiques (relais sémantique).
 * Contrat : etc/capsuleos/contracts/settings-effects-chain.json → layerConsumers.Se-WM
 */
(function initCapsuleSeWmBus(global) {
    'use strict';

    const doc = global.document;
    if (!doc || !doc.body) {
        return;
    }

    function applyDynamicWorkspaces(detail) {
        const dynamic = Boolean(detail && (detail.dynamic !== undefined ? detail.dynamic : detail.enabled));
        doc.body.dataset.capsuleDynamicWorkspaces = dynamic ? 'true' : 'false';
    }

    doc.addEventListener('capsule:dynamic-workspaces-changed', function onDynamicWorkspaces(event) {
        applyDynamicWorkspaces((event && event.detail) || {});
    });

    global.CapsuleSeWmBus = { applyDynamicWorkspaces: applyDynamicWorkspaces };
}(typeof window !== 'undefined' ? window : globalThis));
