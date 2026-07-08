/**
 * Parité Paramètres GNOME — persistance, effets shell, alignement gsettings VM (RL10).
 * Chaque contrôle `data-settings-switch` / `data-settings-apply` / slider référencé ici.
 */
(function initGnomeSettingsParity(global) {
    'use strict';

    const GNOME_BODY_IDS = new Set(['rocky', 'fedora', 'alma', 'ubuntu', 'anduinos']);

    function isGnomeShell() {
        const id = global.document && global.document.body ? global.document.body.id : '';
        return GNOME_BODY_IDS.has(id);
    }

    function gsettingsStore() {
        return global.CapsuleGnomeGSettings;
    }

    function readBool(key, fallback) {
        const gs = gsettingsStore();
        if (gs && gs.hasBinding(key)) {
            return gs.getBool(key, fallback);
        }
        const saved = global.localStorage.getItem(key);
        if (saved === 'on' || saved === 'true') {
            return true;
        }
        if (saved === 'off' || saved === 'false') {
            return false;
        }
        return fallback;
    }

    function persistBool(key, on) {
        const gs = gsettingsStore();
        if (gs && gs.hasBinding(key)) {
            gs.setBool(key, on);
            return on;
        }
        global.localStorage.setItem(key, on ? 'on' : 'off');
        return on;
    }

    function readPref(key, fallback) {
        const gs = gsettingsStore();
        if (gs && gs.hasBinding(key)) {
            return gs.getCapsule(key, fallback);
        }
        return global.localStorage.getItem(key) || fallback;
    }

    function persistPref(key, value) {
        const gs = gsettingsStore();
        if (gs && gs.hasBinding(key)) {
            gs.setCapsule(key, value);
            return value;
        }
        global.localStorage.setItem(key, value);
        return value;
    }

    function dispatch(name, detail) {
        if (global.document && typeof global.CustomEvent === 'function') {
            global.document.dispatchEvent(new global.CustomEvent(name, { detail: detail || {} }));
        }
    }

    function setSwitchUi(root, id, on) {
        if (!root) {
            return;
        }
        const toggle = root.querySelector(`[data-settings-switch="${id}"]`);
        if (!toggle) {
            return;
        }
        toggle.setAttribute('aria-checked', on ? 'true' : 'false');
        toggle.classList.toggle('is-on', on);
    }

    function syncDndChrome(on, root) {
        global.document.documentElement.dataset.dndEnabled = on ? 'on' : 'off';
        const qsTile = global.document.querySelector('.quick-settings__tile-icon--dnd');
        if (qsTile && qsTile.closest('.quick-settings__tile')) {
            qsTile.closest('.quick-settings__tile').classList.toggle('quick-settings__tile--active', on);
        }
        const settingsRoot = root || global.document.querySelector('#themes #themesApp');
        if (settingsRoot) {
            setSwitchUi(settingsRoot, 'dnd', on);
        }
        dispatch('capsule:dnd-changed', { enabled: on });
    }

    function setSelectUi(root, id, label) {
        if (!root) {
            return;
        }
        const valueEl = root.querySelector(`[data-settings-value="${id}"]`);
        if (valueEl) {
            valueEl.textContent = label;
            return;
        }
        const row = root.querySelector(`[data-settings-apply="${id}"]`);
        const fallback = row ? row.querySelector('.adw-row__value') : null;
        if (fallback) {
            fallback.textContent = label;
        }
    }

    const SWITCH_HANDLERS = {
        wifi: {
            key: 'gnome-wifi-enabled',
            defaultOn: true,
            vm: 'rfkill (simulé)',
            apply(on, root) {
                persistBool(this.key, on);
                if (root) {
                    const list = root.querySelector('[data-wifi-networks]');
                    const status = root.querySelector('[data-wifi-status]');
                    if (list) {
                        list.hidden = !on;
                    }
                    if (status) {
                        status.hidden = on;
                    }
                }
                global.document.documentElement.dataset.wifiEnabled = on ? 'on' : 'off';
            },
        },
        bluetooth: {
            key: 'gnome-bluetooth-enabled',
            defaultOn: true,
            vm: 'rfkill-bluetooth',
            apply(on, root) {
                persistBool(this.key, on);
                if (root) {
                    const list = root.querySelector('[data-bluetooth-devices]');
                    const empty = root.querySelector('[data-bluetooth-empty]');
                    if (list) {
                        list.hidden = !on;
                    }
                    if (empty) {
                        empty.hidden = on;
                    }
                }
                global.document.documentElement.dataset.bluetoothEnabled = on ? 'on' : 'off';
            },
        },
        'night-light': {
            key: 'gnome-night-light',
            defaultOn: false,
            vm: 'org.gnome.settings-daemon.plugins.color night-light-enabled',
            apply(on) {
                const storage = global.CapsuleThemeStorage;
                if (storage && typeof storage.applyNightLight === 'function') {
                    storage.applyNightLight(on);
                } else {
                    persistBool(this.key, on);
                    global.document.documentElement.dataset.nightLight = on ? 'on' : 'off';
                }
            },
        },
        notifications: {
            key: 'gnome-notifications-enabled',
            defaultOn: true,
            vm: 'org.gnome.desktop.notifications show-banners',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.notificationsEnabled = on ? 'on' : 'off';
                dispatch('capsule:notifications-changed', { enabled: on });
            },
        },
        dnd: {
            key: 'gnome-dnd-enabled',
            defaultOn: false,
            vm: 'shell DND (session)',
            apply(on, root) {
                persistBool(this.key, on);
                syncDndChrome(on, root);
            },
        },
        'lock-notifications': {
            key: 'gnome-lock-notifications',
            defaultOn: true,
            vm: 'org.gnome.desktop.notifications show-in-lock-screen',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.lockNotifications = on ? 'on' : 'off';
            },
        },
        'search-history': {
            key: 'gnome-search-history',
            defaultOn: true,
            vm: 'org.gnome.desktop.search-providers disabled @as []',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.searchHistory = on ? 'on' : 'off';
                dispatch('capsule:search-providers-changed');
            },
        },
        'search-files': {
            key: 'gnome-search-files',
            defaultOn: true,
            vm: 'Nautilus search provider',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.searchFiles = on ? 'on' : 'off';
                dispatch('capsule:search-providers-changed');
            },
        },
        'search-apps': {
            key: 'gnome-search-apps',
            defaultOn: true,
            vm: 'Shell app search',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.searchApps = on ? 'on' : 'off';
                dispatch('capsule:search-providers-changed');
            },
        },
        'search-calculator': {
            key: 'gnome-search-calculator',
            defaultOn: true,
            vm: 'gnome-calculator search provider',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.searchCalculator = on ? 'on' : 'off';
                dispatch('capsule:search-providers-changed');
            },
        },
        touchpad: {
            key: 'gnome-touchpad-enabled',
            defaultOn: true,
            vm: 'org.gnome.desktop.peripherals.touchpad send-events enabled',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.touchpadEnabled = on ? 'on' : 'off';
            },
        },
        'tap-to-click': {
            key: 'gnome-tap-to-click',
            defaultOn: true,
            vm: 'org.gnome.desktop.peripherals.touchpad tap-to-click true',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.tapToClick = on ? 'on' : 'off';
            },
        },
        location: {
            key: 'gnome-privacy-location',
            defaultOn: false,
            vm: 'GeoClue (simulé)',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.privacyLocation = on ? 'on' : 'off';
            },
        },
        camera: {
            key: 'gnome-privacy-camera',
            defaultOn: true,
            vm: 'org.gnome.desktop.privacy disable-camera false',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.privacyCamera = on ? 'on' : 'off';
            },
        },
        microphone: {
            key: 'gnome-privacy-microphone',
            defaultOn: true,
            vm: 'org.gnome.desktop.privacy disable-microphone false',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.privacyMicrophone = on ? 'on' : 'off';
            },
        },
        'auto-lock': {
            key: 'gnome-auto-lock',
            defaultOn: true,
            vm: 'org.gnome.desktop.screensaver lock-enabled',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.autoLock = on ? 'on' : 'off';
            },
        },
        sharing: {
            key: 'gnome-sharing-enabled',
            defaultOn: false,
            vm: 'gnome-sharing-panel',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.sharingEnabled = on ? 'on' : 'off';
            },
        },
        'file-sharing': {
            key: 'gnome-file-sharing',
            defaultOn: false,
            vm: 'gnome-user-share',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.fileSharing = on ? 'on' : 'off';
            },
        },
        'screen-sharing': {
            key: 'gnome-screen-sharing',
            defaultOn: false,
            vm: 'RDP/VNC (simulé)',
            apply(on) {
                persistBool(this.key, on);
                global.document.documentElement.dataset.screenSharing = on ? 'on' : 'off';
            },
        },
    };

    const SELECT_HANDLERS = {
        'display-resolution': {
            delegate: 'CapsuleThemeStorage.applyDisplayResolution',
            vm: 'xrandr / mutter (simulé)',
        },
        'display-scale': {
            delegate: 'CapsuleThemeStorage.applyDisplayScale',
            vm: 'experimental-features scale-monitor-framebuffer',
        },
        'display-orientation': {
            delegate: 'CapsuleThemeStorage.applyDisplayOrientation',
            vm: 'mutter monitor rotation',
        },
        'display-refresh': {
            key: 'gnome-display-refresh',
            default: '60,00 Hz',
            vm: 'mutter refresh rate',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.displayRefresh = label.replace(',', '.').replace(' Hz', '');
            },
        },
        'dynamic-workspaces': {
            key: 'gnome-dynamic-workspaces',
            default: 'Activé',
            vm: 'org.gnome.mutter dynamic-workspaces false',
            apply(label) {
                persistPref(this.key, label);
                const on = label === 'Activé';
                global.document.documentElement.dataset.dynamicWorkspaces = on ? 'on' : 'off';
                global.document.documentElement.dataset.workspacesSpring = 'on';
                if (global.CapsuleGnomeWorkspaces && typeof global.CapsuleGnomeWorkspaces.reconfigure === 'function') {
                    global.CapsuleGnomeWorkspaces.reconfigure();
                }
                global.setTimeout(() => {
                    delete global.document.documentElement.dataset.workspacesSpring;
                }, 360);
                dispatch('capsule:workspaces-config-changed', { dynamic: on });
            },
        },
        'workspace-indicator': {
            key: 'gnome-workspace-indicator',
            default: 'Toujours',
            vm: 'org.gnome.shell workspace indicator',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.workspaceIndicator = label;
            },
        },
        'hot-corner': {
            key: 'gnome-hot-corner',
            default: 'Activé',
            vm: 'org.gnome.desktop.interface enable-hot-corners true',
            apply(label) {
                persistPref(this.key, label);
                const on = label === 'Activé';
                global.document.documentElement.dataset.hotCorners = on ? 'on' : 'off';
                dispatch('capsule:hot-corners-changed', { enabled: on });
            },
        },
        'apps-all-workspaces': {
            key: 'gnome-apps-all-workspaces',
            default: 'Activé',
            vm: 'org.gnome.shell app-switcher current-workspace-only',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.appsAllWorkspaces = label === 'Activé' ? 'on' : 'off';
            },
        },
        'sound-output': {
            key: 'gnome-sound-output',
            default: 'Haut-parleurs intégrés',
            vm: 'pipewire default sink',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.soundOutput = label;
            },
        },
        'sound-input': {
            key: 'gnome-sound-input',
            default: 'Micro intégré',
            vm: 'pipewire default source',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.soundInput = label;
            },
        },
        'sound-alert': {
            key: 'gnome-sound-alert',
            default: 'Ding',
            vm: 'org.gnome.desktop.sound theme-name freedesktop',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.soundAlert = label;
                const storage = global.CapsuleThemeStorage;
                if (storage) {
                    persistBool('gnome-event-sounds', label !== 'Aucun');
                }
                global.document.documentElement.dataset.eventSounds = label !== 'Aucun' ? 'on' : 'off';
            },
        },
        'power-mode': {
            key: 'gnome-power-mode',
            default: 'Équilibré',
            vm: 'power-profiles-daemon',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.powerMode = label;
                const sub = global.document.querySelector('.quick-settings__tile-icon--performance');
                if (sub) {
                    const tile = sub.closest('.quick-settings__tile');
                    const subtext = tile ? tile.querySelector('.quick-settings__tile-subtext') : null;
                    if (subtext) {
                        subtext.textContent = label.length > 12 ? `${label.slice(0, 10)}…` : label;
                    }
                }
            },
        },
        'power-dim': {
            key: 'gnome-power-dim-screen',
            default: '1 heure',
            vm: 'org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 3600',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.powerDimScreen = label;
            },
        },
        'power-sleep': {
            key: 'gnome-power-sleep',
            default: 'Jamais',
            vm: 'org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type nothing',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.powerSleep = label;
            },
        },
        'mouse-handedness': {
            key: 'gnome-mouse-handedness',
            default: 'Gauche',
            vm: 'org.gnome.desktop.peripherals.mouse left-handed false',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.mouseHandedness = label;
            },
        },
        'scroll-direction': {
            key: 'gnome-scroll-direction',
            default: 'Naturel',
            vm: 'org.gnome.desktop.peripherals.touchpad natural-scroll true',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.scrollDirection = label;
            },
        },
        'keyboard-layout': {
            key: 'gnome-keyboard-layout',
            default: 'Français',
            vm: 'org.gnome.desktop.input-sources sources',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.keyboardLayout = label;
            },
        },
        'keyboard-repeat': {
            key: 'gnome-keyboard-repeat-delay',
            default: '500 ms',
            vm: 'org.gnome.desktop.peripherals.keyboard delay 500',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.keyboardRepeatDelay = label;
            },
        },
        'lock-delay': {
            key: 'gnome-lock-delay',
            default: 'Immédiatement',
            vm: 'org.gnome.desktop.screensaver lock-delay',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.lockDelay = label;
            },
        },
        'network-identity': {
            key: 'gnome-network-identity',
            default: 'Automatique (DHCP)',
            vm: 'NM ipv4.method auto',
            apply(label) {
                persistPref(this.key, label);
                global.document.documentElement.dataset.networkIdentity = label;
            },
        },
    };

    function mergeVmSettingsBaseline() {
        const raw = global.CAPSULE_VM_SETTINGS_BASELINE;
        if (!raw || typeof raw !== 'object') {
            return;
        }
        Object.entries(raw).forEach(([id, meta]) => {
            const value = meta && typeof meta === 'object' ? meta.capsuleExpected : meta;
            if (value == null || value === '') {
                return;
            }
            if (SWITCH_HANDLERS[id]) {
                if (value === 'on' || value === 'off') {
                    SWITCH_HANDLERS[id].defaultOn = value === 'on';
                }
                return;
            }
            if (SELECT_HANDLERS[id] && typeof value === 'string') {
                SELECT_HANDLERS[id].default = value;
                return;
            }
            if (SLIDER_HANDLERS[id]) {
                const num = Number(value);
                if (Number.isFinite(num)) {
                    SLIDER_HANDLERS[id].default = num;
                }
            }
        });
    }

    const SLIDER_HANDLERS = {
        volume: {
            key: 'mint-volume',
            default: 72,
            vm: 'org.gnome.settings-daemon.plugins.media-keys volume-step 6',
            apply(value, root) {
                const pct = Math.max(0, Math.min(100, Number(value) || 0));
                persistPref(this.key, String(pct));
                if (root) {
                    const volumeValue = root.querySelector('[data-sound-volume]');
                    if (volumeValue) {
                        volumeValue.textContent = `${pct} %`;
                    }
                }
                if (typeof global.syncVolumeFromSettings === 'function') {
                    global.syncVolumeFromSettings(pct);
                }
            },
        },
        'pointer-speed': {
            key: 'gnome-pointer-speed',
            default: 50,
            vm: 'org.gnome.desktop.peripherals.mouse speed 0.0',
            apply(value) {
                const pct = Math.max(0, Math.min(100, Number(value) || 0));
                persistPref(this.key, String(pct));
                global.document.documentElement.style.setProperty('--gnome-pointer-speed-factor', String(0.5 + pct / 100));
                global.document.documentElement.dataset.pointerSpeed = String(pct);
            },
        },
    };

    mergeVmSettingsBaseline();

    function applySwitch(id, on, root) {
        const handler = SWITCH_HANDLERS[id];
        if (!handler) {
            return;
        }
        handler.apply.call(handler, on, root);
        setSwitchUi(root, id, on);
    }

    function applySelect(id, label, root) {
        const handler = SELECT_HANDLERS[id];
        if (!handler) {
            return;
        }
        if (handler.delegate) {
            const storage = global.CapsuleThemeStorage;
            const method = id === 'display-resolution' ? 'applyDisplayResolution'
                : id === 'display-scale' ? 'applyDisplayScale'
                    : 'applyDisplayOrientation';
            if (storage && typeof storage[method] === 'function') {
                storage[method](label);
            }
        } else if (typeof handler.apply === 'function') {
            handler.apply.call(handler, label);
        }
        setSelectUi(root, id, label);
    }

    function applySlider(id, value, root) {
        const handler = SLIDER_HANDLERS[id];
        if (!handler) {
            return;
        }
        handler.apply.call(handler, value, root);
    }

    function cycleSelect(row, root) {
        const applyId = row.getAttribute('data-settings-apply');
        if (!applyId) {
            return null;
        }
        const options = (row.getAttribute('data-settings-select') || '').split('|');
        const valueEl = row.querySelector('.adw-row__value');
        if (!valueEl || options.length < 2) {
            return null;
        }
        const current = valueEl.textContent.trim();
        const idx = options.indexOf(current);
        const next = options[(idx + 1) % options.length];
        valueEl.textContent = next;
        applySelect(applyId, next, root);
        return next;
    }

    function cycleSelectById(id, root) {
        const scope = root || global.document;
        const row = scope.querySelector(`[data-settings-apply="${id}"]`);
        if (!row) {
            return null;
        }
        return cycleSelect(row, root);
    }

    function filterSettingsSearch(root, query) {
        if (!root) {
            return null;
        }
        const q = String(query || '').trim().toLowerCase();
        let firstMatchPanel = null;

        root.querySelectorAll('.gnome-settings__navitem[data-gnome-settings-panel]').forEach((item) => {
            const panelId = item.getAttribute('data-gnome-settings-panel');
            const label = item.textContent.trim().toLowerCase();
            const panel = root.querySelector(`.gnome-settings__panel[data-gnome-settings-panel="${panelId}"]`);
            let panelMatch = false;

            if (panel) {
                panel.querySelectorAll('.adw-row').forEach((row) => {
                    const title = row.querySelector('.adw-row__title');
                    const text = title ? title.textContent.trim().toLowerCase() : '';
                    const hit = Boolean(q && text.includes(q));
                    row.classList.toggle('is-search-hit', hit);
                    if (hit) {
                        panelMatch = true;
                    }
                });
                if (q) {
                    const sectionLabels = [...panel.querySelectorAll('.gnome-settings__section-label, .gnome-settings__panel-title')]
                        .map((el) => el.textContent.trim().toLowerCase());
                    if (sectionLabels.some((text) => text.includes(q))) {
                        panelMatch = true;
                    }
                }
            }

            const match = !q || label.includes(q) || panelMatch;
            item.hidden = !match;
            if (match && !firstMatchPanel) {
                firstMatchPanel = panelId;
            }
        });

        return firstMatchPanel;
    }

    function syncPanelUi(root) {
        if (!root) {
            return;
        }
        Object.keys(SWITCH_HANDLERS).forEach((id) => {
            const handler = SWITCH_HANDLERS[id];
            const on = readBool(handler.key, handler.defaultOn);
            setSwitchUi(root, id, on);
            if (id === 'wifi' || id === 'bluetooth') {
                handler.apply.call(handler, on, root);
            }
        });
        Object.keys(SELECT_HANDLERS).forEach((id) => {
            const handler = SELECT_HANDLERS[id];
            const label = readPref(handler.key, handler.default);
            setSelectUi(root, id, label);
            if (id === 'hot-corner' && typeof handler.apply === 'function') {
                handler.apply.call(handler, label);
            }
        });
        const vol = readPref('mint-volume', '72');
        const volSlider = root.querySelector('#gnomeSettingsSound .adw-slider');
        if (volSlider) {
            volSlider.value = vol;
            const volLabel = root.querySelector('[data-sound-volume]');
            if (volLabel) {
                volLabel.textContent = `${vol} %`;
            }
        }
        const ptr = readPref('gnome-pointer-speed', '50');
        const ptrSlider = root.querySelector('#gnomeSettingsMouse .adw-slider');
        if (ptrSlider) {
            ptrSlider.value = ptr;
        }
    }

    function applyAllPreferencesAtBoot() {
        if (!isGnomeShell()) {
            return;
        }
        const root = null;
        Object.entries(SWITCH_HANDLERS).forEach(([id, handler]) => {
            const on = readBool(handler.key, handler.defaultOn);
            handler.apply.call(handler, on, root);
        });
        Object.entries(SELECT_HANDLERS).forEach(([id, handler]) => {
            const label = readPref(handler.key, handler.default);
            if (handler.delegate) {
                applySelect(id, label, root);
            } else if (typeof handler.apply === 'function') {
                handler.apply.call(handler, label);
            }
        });
        Object.entries(SLIDER_HANDLERS).forEach(([id, handler]) => {
            const val = readPref(handler.key, String(handler.default));
            handler.apply.call(handler, val, root);
        });
    }

    function isSearchProviderEnabled(provider) {
        const map = {
            apps: 'search-apps',
            files: 'search-files',
            calculator: 'search-calculator',
            history: 'search-history',
        };
        const switchId = map[provider];
        if (!switchId || !SWITCH_HANDLERS[switchId]) {
            return true;
        }
        const handler = SWITCH_HANDLERS[switchId];
        return readBool(handler.key, handler.defaultOn);
    }

    function filterSearchCatalog(catalog) {
        return catalog.filter((item) => {
            if (item.dataLink === 'calculator') {
                return isSearchProviderEnabled('calculator');
            }
            if (item.dataLink === 'nemo') {
                return isSearchProviderEnabled('files');
            }
            return isSearchProviderEnabled('apps');
        });
    }

    global.CapsuleGnomeSettingsParity = {
        SWITCH_HANDLERS,
        SELECT_HANDLERS,
        SLIDER_HANDLERS,
        syncDndChrome,
        applySwitch,
        applySelect,
        applySlider,
        cycleSelect,
        cycleSelectById,
        filterSettingsSearch,
        syncPanelUi,
        applyAllPreferencesAtBoot,
        isSearchProviderEnabled,
        filterSearchCatalog,
        readBool,
        persistBool,
        mergeVmSettingsBaseline,
    };

    if (typeof global.document !== 'undefined') {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', applyAllPreferencesAtBoot);
        } else {
            applyAllPreferencesAtBoot();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
