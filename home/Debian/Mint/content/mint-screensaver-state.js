/**
 * État économiseur d'écran — icône tray + datasets body (org.cinnamon.desktop.screensaver).
 */
(function initMintScreensaverState(global) {
    'use strict';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function readIdleOn() {
        if (global.document.body.dataset.capsuleScreensaverIdle === 'false') {
            return false;
        }
        var gs = global.CapsuleCinnamonGSettings;
        if (gs && typeof gs.getBool === 'function') {
            return gs.getBool('mint-screensaver-idle', true);
        }
        return global.document.body.dataset.capsuleScreensaverIdle !== 'false';
    }

    function readLockDelay() {
        var raw = global.document.body.dataset.capsuleLockDelay;
        if (raw != null && raw !== '') {
            return String(raw);
        }
        var gs = global.CapsuleCinnamonGSettings;
        if (gs && typeof gs.getCapsule === 'function') {
            return gs.getCapsule('mint-screensaver-lock-delay', '0');
        }
        return '0';
    }

    function apply() {
        if (!isMint()) {
            return;
        }
        var idleOn = readIdleOn();
        var delay = readLockDelay();
        global.document.body.dataset.capsuleScreensaverIdle = idleOn ? 'true' : 'false';
        global.document.body.dataset.capsuleLockDelay = delay;
        var btn = global.document.getElementById('tray-btn-screensaver');
        if (btn) {
            btn.hidden = !idleOn;
            btn.dataset.lockDelay = delay;
            btn.setAttribute('aria-label', idleOn
                ? "Économiseur d'écran actif"
                : "Économiseur d'écran désactivé");
            btn.title = idleOn
                ? "Économiseur d'écran — verrouillage " + (delay === '0' ? 'immédiat' : delay + ' s')
                : "Économiseur d'écran désactivé";
        }
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        global.document.addEventListener('capsule:screensaver-idle-changed', apply);
        global.document.addEventListener('capsule:screensaver-lock-delay-changed', apply);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', apply);
        apply();
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }
}(typeof window !== 'undefined' ? window : globalThis));
