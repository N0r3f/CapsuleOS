/**
 * Indicateur espaces de travail Cinnamon — visible si extension deskgrid activée (parity VM).
 */
(function initMintWorkspaceIndicator(global) {
    'use strict';

    var DESKGRID_UUID = 'deskgrid@cinnamon.org';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function gs() {
        return global.CapsuleCinnamonGSettings;
    }

    function listHasToken(items, token) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            if (items[i].indexOf(token) !== -1) {
                return true;
            }
        }
        return false;
    }

    function readDeskgridEnabled() {
        var store = gs();
        if (store && typeof store.getBool === 'function') {
            return store.getBool('mint-extension-deskgrid', false);
        }
        var raw = global.document.body && global.document.body.dataset.capsuleEnabledExtensions;
        if (!raw) {
            return false;
        }
        try {
            return listHasToken(JSON.parse(raw), DESKGRID_UUID);
        } catch (e) {
            return false;
        }
    }

    function readDynamic() {
        if (global.document.body.dataset.capsuleDynamicWorkspaces === 'true') {
            return true;
        }
        var store = gs();
        if (store && typeof store.getBool === 'function') {
            return store.getBool('mint-dynamic-workspaces', false);
        }
        return false;
    }

    function readCount() {
        var raw = global.document.body.dataset.capsuleWorkspaceCount;
        if (raw) {
            return Math.max(1, parseInt(raw, 10) || 4);
        }
        var store = gs();
        if (store && typeof store.getCapsule === 'function') {
            return Math.max(1, parseInt(store.getCapsule('mint-number-workspaces', '4'), 10) || 4);
        }
        return 4;
    }

    function hideRoot(root) {
        root.textContent = '';
        root.hidden = true;
        root.setAttribute('aria-hidden', 'true');
    }

    function render() {
        var root = global.document.getElementById('mint-workspace-indicator');
        if (!root || !isMint()) {
            return;
        }
        if (!readDeskgridEnabled()) {
            hideRoot(root);
            return;
        }
        var dynamic = readDynamic();
        var count = readCount();
        root.textContent = '';
        root.dataset.mode = dynamic ? 'dynamic' : 'fixed';
        root.dataset.workspaceCount = String(count);
        root.hidden = false;
        root.setAttribute('aria-hidden', 'false');
        if (dynamic) {
            var dyn = global.document.createElement('span');
            dyn.className = 'mint-workspace-indicator__dot is-active';
            dyn.title = 'Espaces dynamiques';
            root.appendChild(dyn);
            return;
        }
        var i;
        for (i = 0; i < count; i += 1) {
            var dot = global.document.createElement('span');
            dot.className = 'mint-workspace-indicator__dot' + (i === 0 ? ' is-active' : '');
            dot.title = 'Espace ' + (i + 1);
            root.appendChild(dot);
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        global.document.addEventListener('capsule:dynamic-workspaces-changed', render);
        global.document.addEventListener('capsule:number-workspaces-changed', render);
        global.document.addEventListener('capsule:extensions-enabled-changed', render);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail) {
                render();
                return;
            }
            if (event.detail.key === 'enabled-extensions'
                || event.detail.capsuleKey === 'mint-extension-deskgrid') {
                render();
            }
        });
        render();
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }
}(typeof window !== 'undefined' ? window : globalThis));
