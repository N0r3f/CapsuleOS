/**
 * Tray notifications + sons événements — effets org.cinnamon.desktop.notifications / org.cinnamon.sounds.
 */
(function initMintNotificationsSoundState(global) {
    'use strict';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function readNotificationsOn() {
        if (global.document.body.dataset.capsuleNotificationsEnabled === 'false') {
            return false;
        }
        var gs = global.CapsuleCinnamonGSettings;
        if (gs && typeof gs.getBool === 'function') {
            return gs.getBool('mint-notifications-enabled', true);
        }
        return true;
    }

    function readEventSoundsOn() {
        if (global.document.body.dataset.capsuleEventSounds === 'off') {
            return false;
        }
        var gs = global.CapsuleCinnamonGSettings;
        if (gs && typeof gs.getBool === 'function') {
            return gs.getBool('mint-event-sounds', true);
        }
        return true;
    }

    function applyNotifications(on) {
        global.document.body.dataset.capsuleNotificationsEnabled = on ? 'true' : 'false';
        var btn = global.document.getElementById('tray-btn-notifications');
        if (!btn) {
            return;
        }
        if (!on) {
            btn.hidden = true;
            btn.classList.add('mint-tray--vm-collapsed');
            return;
        }
        btn.hidden = false;
        btn.classList.remove('mint-tray--vm-collapsed');
        if (global.CapsuleMintPanelIdleTray && typeof global.CapsuleMintPanelIdleTray.refresh === 'function') {
            global.CapsuleMintPanelIdleTray.refresh();
        }
    }

    function applyEventSounds(on) {
        global.document.body.dataset.capsuleEventSounds = on ? 'on' : 'off';
    }

    function applyAll() {
        if (!isMint()) {
            return;
        }
        applyNotifications(readNotificationsOn());
        applyEventSounds(readEventSoundsOn());
    }

    if (global.document) {
        global.document.addEventListener('capsule:notifications-enabled-changed', applyAll);
        global.document.addEventListener('capsule:event-sounds-changed', applyAll);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', applyAll);
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', applyAll);
        } else {
            applyAll();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
