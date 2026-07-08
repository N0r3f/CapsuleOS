/**
 * Tray Cinnamon — masque les icônes les moins prioritaires si le panel manque de place ;
 * l'horloge reste toujours visible (parity systray overflow).
 */
(function initMintTrayOverflow(global) {
    'use strict';

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function isCollapsible(btn) {
        if (!btn || btn.id === 'taskbar-clock-trigger') {
            return false;
        }
        if (btn.hasAttribute('hidden')) {
            return false;
        }
        if (btn.classList.contains('mint-tray--vm-collapsed')) {
            return false;
        }
        if (btn.classList.contains('mint-tray-popover') || btn.classList.contains('sticky-applet')) {
            return false;
        }
        return btn.classList.contains('taskbar-tray__btn') || btn.classList.contains('taskbar-tray__btn--keyboard-label');
    }

    function getCollapsibleButtons(tray) {
        var nodes = tray.querySelectorAll('.taskbar-tray__btn, .taskbar-tray__btn--keyboard-label');
        var out = [];
        var i;
        for (i = 0; i < nodes.length; i += 1) {
            if (isCollapsible(nodes[i])) {
                out.push(nodes[i]);
            }
        }
        return out;
    }

    function isClockVisible(panel, clock) {
        if (!clock) {
            return true;
        }
        var panelRect = panel.getBoundingClientRect();
        var clockRect = clock.getBoundingClientRect();
        return clockRect.right <= panelRect.right + 0.5
            && clockRect.left >= panelRect.left - 0.5
            && clockRect.width > 0;
    }

    function clearOverflowMarks(buttons) {
        var i;
        for (i = 0; i < buttons.length; i += 1) {
            buttons[i].classList.remove('mint-tray--overflow-hidden');
        }
    }

    function layout() {
        var panel = global.document.getElementById('tableau');
        var tray = global.document.getElementById('system-tray');
        var clock = global.document.getElementById('taskbar-clock-trigger');
        if (!panel || !tray || !clock) {
            return;
        }
        var buttons = getCollapsibleButtons(tray);
        clearOverflowMarks(buttons);
        var idx = 0;
        while (!isClockVisible(panel, clock) && idx < buttons.length) {
            buttons[idx].classList.add('mint-tray--overflow-hidden');
            idx += 1;
        }
    }

    function scheduleLayout() {
        global.requestAnimationFrame(layout);
    }

    function bind() {
        if (!isMint()) {
            return;
        }
        var panel = global.document.getElementById('tableau');
        if (!panel) {
            return;
        }
        scheduleLayout();
        global.addEventListener('resize', scheduleLayout);
        if (typeof global.ResizeObserver === 'function') {
            var observer = new global.ResizeObserver(scheduleLayout);
            observer.observe(panel);
            var tray = global.document.getElementById('system-tray');
            if (tray) {
                observer.observe(tray);
            }
        }
        global.document.addEventListener('capsule:applet-visibility-changed', scheduleLayout);
        global.document.addEventListener('capsule:screensaver-idle-changed', scheduleLayout);
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', scheduleLayout);
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }
}(typeof window !== 'undefined' ? window : globalThis));
