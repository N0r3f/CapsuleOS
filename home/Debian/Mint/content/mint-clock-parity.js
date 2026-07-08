/**
 * Horloge panel Cinnamon — format 24h / date / secondes (org.cinnamon.desktop.interface).
 */
(function initMintClockParity(global) {
    'use strict';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function readBool(datasetKey, fallback) {
        if (!global.document.body) {
            return fallback;
        }
        var raw = global.document.body.dataset[datasetKey];
        if (raw === 'true') {
            return true;
        }
        if (raw === 'false') {
            return false;
        }
        return fallback;
    }

    function formatClock(now) {
        var use24 = readBool('capsuleClockUse24h', true);
        var showDate = readBool('capsuleClockShowDate', false);
        var showSeconds = readBool('capsuleClockShowSeconds', false);
        var opts = { hour: '2-digit', minute: '2-digit', hour12: !use24 };
        if (showSeconds) {
            opts.second = '2-digit';
        }
        var time = now.toLocaleTimeString('fr-FR', opts);
        if (!showDate) {
            return time;
        }
        var date = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        return date + ' ' + time;
    }

    function tick() {
        if (!isMint()) {
            return;
        }
        var clock = global.document.getElementById('taskbar-clock');
        if (!clock) {
            return;
        }
        var now = new Date();
        clock.textContent = formatClock(now);
        clock.setAttribute('datetime', now.toISOString());
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        tick();
        global.setInterval(tick, 1000);
        global.document.addEventListener('capsule:clock-format-changed', tick);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', tick);
    }

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', bind);
        } else {
            bind();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
