/**
 * Lanceurs Linux — sync UI (running-link / active-link) + sonde lab partagée.
 * Mint : barre footer. GNOME (Fedora, Rocky, …) : dock #tableau.fedora-dock.
 * Source de vérité : fenêtres .windowElement (pas les classes du dock seules).
 */
(function initCapsuleLauncherDockState(global) {
    'use strict';

    const LAUNCHER_SELECTOR = [
        'footer nav a[target="windowElement"]',
        '#tableau.fedora-dock a[target="windowElement"]',
        'aside.fedora-dock a[target="windowElement"]',
    ].join(', ');

    const PANEL_SLOTS = ['nemo', 'firefox', 'terminal'];

    function isLinuxLauncherPanel() {
        if (global.CAPSULE_WINDOW_FAMILY === 'linux') {
            return true;
        }
        const bodyId = typeof document !== 'undefined' && document.body ? document.body.id : '';
        return bodyId === 'mint' || bodyId === 'fedora' || bodyId === 'rocky';
    }

    function isWindowVisible(container) {
        if (!container || container.style.display === 'none') {
            return false;
        }
        if (typeof getComputedStyle === 'function') {
            return getComputedStyle(container).display !== 'none';
        }
        return true;
    }

    function isWindowRunning(container) {
        return !!(container && container.dataset.capsuleRunning === 'true');
    }

    function launcherRunning(container) {
        return isWindowRunning(container) || isWindowVisible(container);
    }

    function launcherActive(container) {
        return isWindowVisible(container)
            && container.classList.contains('windowElementActive');
    }

    function markWindowRunning(container) {
        if (container) {
            container.dataset.capsuleRunning = 'true';
        }
    }

    function clearWindowRunning(container) {
        if (container && container.dataset) {
            delete container.dataset.capsuleRunning;
        }
    }

    const OVERVIEW_DASH_SELECTOR = '.fedora-overview__dash-item[data-overview-link]';

    function resolveSlotContainer(slotId) {
        return (global.CapsuleWindowShell
            && typeof global.CapsuleWindowShell.resolveWindowSlot === 'function'
            && global.CapsuleWindowShell.resolveWindowSlot(slotId))
            || document.querySelector(`.windowElement[data-link="${slotId}"]`);
    }

    function syncOverviewDash() {
        document.querySelectorAll(OVERVIEW_DASH_SELECTOR).forEach((btn) => {
            const slotId = btn.getAttribute('data-overview-link');
            if (!slotId) {
                return;
            }
            const container = resolveSlotContainer(slotId);
            const running = launcherRunning(container);
            const focused = launcherActive(container);
            btn.classList.toggle('is-running', running);
            btn.classList.toggle('is-focused', focused);
            if (focused) {
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.removeAttribute('aria-pressed');
            }
        });
    }

    function syncGroupedWindowList() {
        document.querySelectorAll('.taskbar-window-list__btn').forEach((btn) => {
            const slotId = btn.dataset ? btn.dataset.windowLink : '';
            if (!slotId) {
                return;
            }
            const container = resolveSlotContainer(slotId);
            const running = launcherRunning(container);
            const focused = launcherActive(container);
            btn.classList.toggle('is-running', running);
            if (!btn.classList.contains('is-minimized')) {
                btn.classList.toggle('is-active', focused);
            }
        });
    }

    function syncLaunchers() {
        if (!isLinuxLauncherPanel()) {
            return;
        }
        document.querySelectorAll(LAUNCHER_SELECTOR).forEach((link) => {
            const slotId = link.dataset ? link.dataset.link : link.getAttribute('data-link');
            if (!slotId) {
                return;
            }
            if (document.body && document.body.id === 'mint'
                && link.classList.contains('mint-panel__launcher')) {
                return;
            }
            const container = resolveSlotContainer(slotId);
            const isMainMenu = slotId === 'mainMenu';
            const running = isMainMenu ? isWindowVisible(container) : launcherRunning(container);
            const focused = launcherActive(container);
            link.classList.toggle('running-link', running && !isMainMenu);
            link.classList.toggle('active-link', focused);
        });
        syncOverviewDash();
        syncGroupedWindowList();
    }

    function resolveProbeToolkit() {
        const bodyId = typeof document !== 'undefined' && document.body ? document.body.id : '';
        if (bodyId === 'mint') {
            return 'capsule-cinnamon';
        }
        if (bodyId === 'fedora' || bodyId === 'rocky') {
            return 'capsule-gnome';
        }
        return 'capsule-linux';
    }

    function explorerCurrentPath() {
        const nemo = document.querySelector('.windowElement[data-link="nemo"]');
        const g = global;
        if (typeof g.fileExplorerState !== 'undefined' && g.fileExplorerState.currentPath) {
            return g.fileExplorerState.currentPath;
        }
        if (nemo && typeof g.getExplorerCurrentPath === 'function') {
            return g.getExplorerCurrentPath('nemo') || '';
        }
        if (nemo) {
            const pathEl = nemo.querySelector('[data-role="current-path"], .nemo-path, #nemo-path-label, #nemo-path');
            if (pathEl) {
                return pathEl.textContent || '';
            }
        }
        return '';
    }

    function collectLauncherProbeState() {
        const launchers = {};
        const windows = [];
        let focused = null;

        PANEL_SLOTS.forEach((slot) => {
            const container = document.querySelector(`.windowElement[data-link="${slot}"]`);
            if (!container) {
                return;
            }
            const running = launcherRunning(container);
            const active = launcherActive(container);
            launchers[slot] = { running: running, active: active };
            if (isWindowVisible(container)) {
                const state = active ? 'focused' : 'normal';
                const entry = {
                    id: container.id || slot,
                    title: container.getAttribute('data-title') || slot,
                    wmClass: slot,
                    slot: slot,
                    state: state,
                };
                windows.push(entry);
                if (active) {
                    focused = { wmClass: slot, slot: slot, title: entry.title };
                }
            }
        });

        return {
            toolkit: resolveProbeToolkit(),
            timestamp: new Date().toISOString(),
            focused: focused,
            windows: windows,
            launchers: launchers,
            explorer: { nemo: { currentPath: explorerCurrentPath() } },
            actions: { last: 'state' },
        };
    }

    function scheduleSync() {
        global.requestAnimationFrame(syncLaunchers);
    }

    function init() {
        if (!isLinuxLauncherPanel()) {
            return;
        }

        syncLaunchers();

        document.addEventListener('mousedown', (event) => {
            const target = event.target.closest('.windowElement');
            if (target) {
                scheduleSync();
            }
        });

        document.addEventListener('capsule:window-opened', (event) => {
            const container = event.detail ? event.detail.container : null;
            markWindowRunning(container);
            scheduleSync();
        });

        document.addEventListener('capsule:window-closed', (event) => {
            const container = event.detail ? event.detail.container : null;
            clearWindowRunning(container);
            scheduleSync();
        });

        document.addEventListener('capsule:window-hidden', (event) => {
            const container = event.detail ? event.detail.container : null;
            if (container && container.dataset && container.dataset.link === 'mainMenu') {
                clearWindowRunning(container);
            }
            scheduleSync();
        });

        [
            'capsule:window-minimized',
            'capsule:window-focused',
        ].forEach((eventName) => {
            document.addEventListener(eventName, scheduleSync);
        });

        global.CapsuleTaskbarLauncherState = {
            initialized: true,
            refresh: syncLaunchers,
            markRunning: markWindowRunning,
            clearRunning: clearWindowRunning,
        };

        global.CapsuleLauncherProbe = {
            collectState: collectLauncherProbeState,
            refresh: syncLaunchers,
        };
    }

    if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
}(typeof window !== 'undefined' ? window : globalThis));
