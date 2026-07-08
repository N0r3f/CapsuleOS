/**
 * Coins intelligents Cinnamon — déclenchement expo / scale / bureau depuis org.cinnamon hotcorner-layout.
 */
(function initMintHotcornerEffects(global) {
    'use strict';

    var EDGE_PX = 6;
    var COOLDOWN_MS = 900;
    var lastTrigger = 0;

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function gs() {
        return global.CapsuleCinnamonGSettings;
    }

    function readCorners() {
        var store = gs();
        var items = [];
        if (store && typeof store.parseHotcornerItems === 'function') {
            var raw = store.getRaw('org.cinnamon', 'hotcorner-layout');
            items = store.parseHotcornerItems(raw);
        }
        var out = [];
        var i;
        for (i = 0; i < 4; i += 1) {
            var seg = (items[i] || 'expo:false:0').split(':');
            out.push({
                action: seg[0] || 'expo',
                enabled: seg[1] === 'true',
                delay: parseInt(seg[2], 10) || 0
            });
        }
        return out;
    }

    function syncDataset() {
        if (!global.document || !global.document.body) {
            return;
        }
        global.document.body.dataset.capsuleHotcornerLayout = JSON.stringify(readCorners());
    }

    function hideAllWindows() {
        var btn = global.document.getElementById('tray-btn-cornerbar');
        if (btn && typeof btn.click === 'function') {
            btn.click();
            return;
        }
        var list = global.document.querySelectorAll('#desktop > .windowElement[data-link]');
        var i;
        for (i = 0; i < list.length; i += 1) {
            var w = list[i];
            if (w.id === 'mainMenu' || w.style.display === 'none') {
                continue;
            }
            w.style.display = 'none';
        }
    }

    function showExpo() {
        if (!global.document.body) {
            return;
        }
        global.document.body.classList.add('mint-hotcorner-expo');
        global.setTimeout(function () {
            global.document.body.classList.remove('mint-hotcorner-expo');
        }, 1600);
    }

    function runAction(action) {
        if (!action || action === 'none') {
            return;
        }
        if (action === 'scale' && global.CapsuleCinnamonAltTab && typeof global.CapsuleCinnamonAltTab.open === 'function') {
            global.CapsuleCinnamonAltTab.open();
            return;
        }
        if (action === 'desktop') {
            hideAllWindows();
            return;
        }
        if (action === 'expo') {
            showExpo();
        }
    }

    function cornerAt(x, y) {
        var w = global.innerWidth;
        var h = global.innerHeight;
        var left = x <= EDGE_PX;
        var right = x >= w - EDGE_PX;
        var top = y <= EDGE_PX;
        var bottom = y >= h - EDGE_PX;
        if (top && left) {
            return 0;
        }
        if (top && right) {
            return 1;
        }
        if (bottom && left) {
            return 2;
        }
        if (bottom && right) {
            return 3;
        }
        return -1;
    }

    function onPointerMove(event) {
        if (!isMint()) {
            return;
        }
        var now = Date.now();
        if (now - lastTrigger < COOLDOWN_MS) {
            return;
        }
        var idx = cornerAt(event.clientX, event.clientY);
        if (idx < 0) {
            return;
        }
        var corners = readCorners();
        var cfg = corners[idx];
        if (!cfg || !cfg.enabled || !cfg.action || cfg.action === 'none') {
            return;
        }
        lastTrigger = now;
        if (cfg.delay > 0) {
            global.setTimeout(function () { runAction(cfg.action); }, cfg.delay);
        } else {
            runAction(cfg.action);
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        syncDataset();
        global.document.addEventListener('pointermove', onPointerMove);
        global.document.addEventListener('capsule:hotcorner-layout-changed', syncDataset);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function (event) {
            if (!event.detail || event.detail.key !== 'hotcorner-layout') {
                return;
            }
            syncDataset();
        });
    }

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', bind);
        } else {
            bind();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
