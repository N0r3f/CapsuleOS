const GNOME_SETTINGS_PANEL_LABELS = {
    wifi: 'Wi-Fi',
    network: 'Réseau',
    bluetooth: 'Bluetooth',
    appearance: 'Apparence',
    background: 'Arrière-plan',
    notifications: 'Notifications',
    search: 'Recherche',
    multitasking: 'Multitâche',
    sound: 'Son',
    power: 'Alimentation',
    displays: 'Écrans',
    mouse: 'Souris et pavé tactile',
    keyboard: 'Clavier',
    printers: 'Imprimantes',
    accessibility: 'Accessibilité',
    privacy: 'Confidentialité',
    sharing: 'Partage',
    about: 'À propos de',
};

let pendingGnomeSettingsPanel = null;

function refreshAdwSliderFill(slider) {
    if (!slider) {
        return;
    }
    const min = Number(slider.min || 0);
    const max = Number(slider.max || 100);
    const value = Number(slider.value || 0);
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--gcc-accent').trim() || '#3584e4';
    const track = 'color-mix(in srgb, currentColor 14%, transparent)';
    slider.style.background = `linear-gradient(to right, ${accent} ${pct}%, ${track} ${pct}%)`;
}

function refreshAllAdwSliders(root) {
    const scope = root || document;
    scope.querySelectorAll('.adw-slider').forEach(refreshAdwSliderFill);
}

function applySettingsPreference(key, value) {
    const parity = window.CapsuleGnomeSettingsParity;
    if (parity && typeof parity.applySelect === 'function') {
        parity.applySelect(key, value, document.querySelector('#themes #themesApp'));
        return;
    }
    const storage = window.CapsuleThemeStorage;
    if (!storage) {
        return;
    }
    const handlers = {
        'display-resolution': storage.applyDisplayResolution,
        'display-scale': storage.applyDisplayScale,
        'display-orientation': storage.applyDisplayOrientation,
    };
    if (typeof handlers[key] === 'function') {
        handlers[key](value);
    }
}

function syncSettingsUiFromStorage(root) {
    const parity = window.CapsuleGnomeSettingsParity;
    if (parity && typeof parity.syncPanelUi === 'function') {
        parity.syncPanelUi(root);
    }
    refreshAllAdwSliders(root);
}

function setCapsuleSettingsPanel(panelId) {
    pendingGnomeSettingsPanel = panelId || null;
}

function resolveGnomeSettingsPanelLabel(panelId) {
    return GNOME_SETTINGS_PANEL_LABELS[panelId] || 'Paramètres';
}

function activateGnomeSettingsPanel(root, panelId) {
    if (!root) {
        return;
    }

    const resolvedPanel = panelId && root.querySelector(`[data-gnome-settings-panel="${panelId}"]`)
        ? panelId
        : 'appearance';

    root.querySelectorAll('.gnome-settings__panel[data-gnome-settings-panel]').forEach((panel) => {
        const isActive = panel.getAttribute('data-gnome-settings-panel') === resolvedPanel;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
    });

    root.querySelectorAll('.gnome-settings__navitem[data-gnome-settings-panel]').forEach((item) => {
        const isActive = item.getAttribute('data-gnome-settings-panel') === resolvedPanel;
        item.classList.toggle('is-active', isActive);
        if (isActive) {
            item.setAttribute('aria-current', 'page');
        } else {
            item.removeAttribute('aria-current');
        }
    });

    root.dataset.activeGnomePanel = resolvedPanel;
}

function bindGnomeSettingsNavigation(root) {
    if (!root || root.dataset.gnomeNavBound === 'true') {
        return;
    }

    root.querySelectorAll('.gnome-settings__navitem[data-gnome-settings-panel]').forEach((item) => {
        item.addEventListener('click', () => {
            activateGnomeSettingsPanel(root, item.getAttribute('data-gnome-settings-panel'));
        });
    });

    const searchInput = root.querySelector('.gnome-settings__search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const parity = window.CapsuleGnomeSettingsParity;
            const query = searchInput.value;
            let firstPanel = null;
            if (parity && typeof parity.filterSettingsSearch === 'function') {
                firstPanel = parity.filterSettingsSearch(root, query);
            } else {
                const q = query.trim().toLowerCase();
                root.querySelectorAll('.gnome-settings__navitem[data-gnome-settings-panel]').forEach((item) => {
                    const label = item.textContent.trim().toLowerCase();
                    const match = !q || label.includes(q);
                    item.hidden = !match;
                    if (match && !firstPanel) {
                        firstPanel = item.getAttribute('data-gnome-settings-panel');
                    }
                });
            }
            if (query.trim() && firstPanel) {
                activateGnomeSettingsPanel(root, firstPanel);
            }
        });
    }

    root.dataset.gnomeNavBound = 'true';
}

function bindSettingsSwitches(root) {
    if (!root || root.dataset.gnomeSwitchesBound === 'true') {
        return;
    }

    const parity = window.CapsuleGnomeSettingsParity;

    root.querySelectorAll('.adw-switch').forEach((toggle) => {
        if (toggle.dataset.switchBound === 'true') {
            return;
        }
        toggle.dataset.switchBound = 'true';
        toggle.addEventListener('click', () => {
            const isOn = toggle.getAttribute('aria-checked') === 'true';
            const nextOn = !isOn;
            const target = toggle.getAttribute('data-settings-switch');
            if (target && parity && typeof parity.applySwitch === 'function') {
                parity.applySwitch(target, nextOn, root);
                return;
            }
            toggle.setAttribute('aria-checked', nextOn ? 'true' : 'false');
            toggle.classList.toggle('is-on', nextOn);
        });
    });

    root.querySelectorAll('.adw-slider').forEach((slider) => {
        refreshAdwSliderFill(slider);
        if (slider.dataset.sliderBound === 'true') {
            return;
        }
        slider.dataset.sliderBound = 'true';
        slider.addEventListener('input', () => {
            refreshAdwSliderFill(slider);
            const sliderId = slider.getAttribute('data-settings-slider');
            if (sliderId && parity && typeof parity.applySlider === 'function') {
                parity.applySlider(sliderId, slider.value, root);
            }
        });
    });

    root.querySelectorAll('[data-settings-select]').forEach((row) => {
        if (row.dataset.selectBound === 'true') {
            return;
        }
        row.dataset.selectBound = 'true';
        row.addEventListener('click', () => {
            if (parity && typeof parity.cycleSelect === 'function') {
                parity.cycleSelect(row, root);
                return;
            }
            const options = (row.getAttribute('data-settings-select') || '').split('|');
            const valueEl = row.querySelector('.adw-row__value');
            if (!valueEl || options.length < 2) {
                return;
            }
            const current = valueEl.textContent.trim();
            const idx = options.indexOf(current);
            const next = options[(idx + 1) % options.length];
            valueEl.textContent = next;
            const applyKey = row.getAttribute('data-settings-apply');
            if (applyKey) {
                applySettingsPreference(applyKey, next);
            }
        });
    });

    syncSettingsUiFromStorage(root);
    root.dataset.gnomeSwitchesBound = 'true';
}

function consumePendingGnomeSettingsPanel(fallback) {
    const panelId = pendingGnomeSettingsPanel || fallback || 'appearance';
    if (pendingGnomeSettingsPanel) {
        pendingGnomeSettingsPanel = null;
    }
    return panelId;
}

function markActiveWallpaperTile(grid, wallpaperId) {
    if (!grid) {
        return;
    }
    grid.querySelectorAll('.gnome-settings-wallpaper[data-wallpaper-id]').forEach((tile) => {
        tile.classList.toggle('is-active', tile.dataset.wallpaperId === wallpaperId);
    });
}

function buildWallpaperGrid(root) {
    const grid = root ? root.querySelector('[data-wallpaper-grid]') : document.querySelector('[data-wallpaper-grid]');
    const storage = window.CapsuleThemeStorage;
    if (!grid || !storage || typeof storage.getWallpaperCatalog !== 'function') {
        return;
    }

    const bodyId = document.body ? document.body.id : '';
    const catalog = storage.getWallpaperCatalog(bodyId);
    const activeId = document.documentElement.dataset.gnomeWallpaper || storage.readSavedWallpaper();
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

    grid.querySelectorAll('.gnome-settings-wallpaper[data-wallpaper-id]').forEach((node) => node.remove());

    catalog.forEach((entry) => {
        const background = entry.type === 'color'
            ? storage.resolveWallpaperEntry(entry, theme)
            : (typeof storage.resolveWallpaperThumb === 'function'
                ? storage.resolveWallpaperThumb(entry, theme)
                : storage.resolveWallpaperEntry(entry, theme));
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gnome-settings-wallpaper cs-wallpaper-thumb';
        btn.classList.add(entry.type === 'color' ? 'gnome-settings-wallpaper--solid' : 'gnome-settings-wallpaper--photo');
        btn.dataset.wallpaperId = entry.id;
        btn.setAttribute('role', 'listitem');
        btn.setAttribute('aria-label', entry.label);
        if (entry.type === 'color') {
            btn.style.background = background;
        } else {
            btn.style.backgroundImage = background;
            btn.style.backgroundSize = 'cover';
            btn.style.backgroundPosition = 'center';
        }
        const label = document.createElement('span');
        label.className = 'gnome-settings-wallpaper__label';
        label.textContent = entry.label;
        btn.appendChild(label);
        if (entry.id === activeId) {
            btn.classList.add('is-active');
        }
        btn.addEventListener('click', () => {
            if (typeof storage.applyWallpaper === 'function') {
                storage.applyWallpaper(entry.id, bodyId);
            }
            markActiveWallpaperTile(grid, entry.id);
        });
        grid.appendChild(btn);
    });

    const addBtn = grid.querySelector('.gnome-settings-wallpaper--add');
    if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = 'true';
        addBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.addEventListener('change', () => {
                const file = input.files && input.files[0];
                if (!file) {
                    return;
                }
                const objectUrl = URL.createObjectURL(file);
                if (typeof storage.applyCustomWallpaper === 'function') {
                    storage.applyCustomWallpaper(objectUrl);
                }
                markActiveWallpaperTile(grid, 'custom');
            });
            input.click();
        });
    }
}

function syncAccentChipRings(chips, activeId) {
    const palette = (window.CapsuleThemeStorage && window.CapsuleThemeStorage.GNOME_ACCENT_COLORS) || {};
    chips.forEach((chip) => {
        const accentId = chip.getAttribute('data-accent-chip');
        const color = palette[accentId];
        if (accentId === activeId && color) {
            chip.style.setProperty('--accent-chip-ring', color);
        } else {
            chip.style.removeProperty('--accent-chip-ring');
        }
    });
}

function bindAccentChips(root) {
    const storage = window.CapsuleThemeStorage;
    const chips = root.querySelectorAll('[data-accent-chip]');
    if (!chips.length || !storage || typeof storage.applyAccentColor !== 'function') {
        return;
    }

    const saved = storage.readSavedAccent();
    chips.forEach((chip) => {
        if (chip.dataset.accentBound === 'true') {
            return;
        }
        chip.dataset.accentBound = 'true';
        const accentId = chip.getAttribute('data-accent-chip');
        const isActive = accentId === saved;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-checked', isActive ? 'true' : 'false');
        chip.removeAttribute('disabled');
        chip.addEventListener('click', () => {
            const resolved = storage.applyAccentColor(accentId);
            chips.forEach((entry) => {
                const active = entry.getAttribute('data-accent-chip') === accentId;
                entry.classList.toggle('is-active', active);
                entry.setAttribute('aria-checked', active ? 'true' : 'false');
            });
            syncAccentChipRings(chips, resolved);
            const settingsRoot = document.querySelector('#themes #themesApp');
            refreshAllAdwSliders(settingsRoot);
            if (typeof window.refreshQuickSettingsVolumeFill === 'function') {
                window.refreshQuickSettingsVolumeFill();
            }
        });
    });
    syncAccentChipRings(chips, saved);
}

function activateKdeSettingsPanel(root, panelId) {
    if (!root) {
        return;
    }
    const view = root.dataset.kdeSettingsView || 'hub';
    if (view !== 'hub') {
        return;
    }
    const hub = root.querySelector('[data-kde-settings-surface="hub"]');
    if (!hub) {
        return;
    }
    const resolved = panelId && hub.querySelector(`[data-kde-panel-content="${panelId}"]`)
        ? panelId
        : 'quick-settings';
    hub.querySelectorAll('[data-kde-panel-content]').forEach((panel) => {
        const active = panel.getAttribute('data-kde-panel-content') === resolved;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
    });
    hub.querySelectorAll('[data-kde-panel]').forEach((item) => {
        if (item.disabled) {
            return;
        }
        const active = item.getAttribute('data-kde-panel') === resolved;
        item.classList.toggle('is-active', active);
        if (active) {
            item.setAttribute('aria-current', 'page');
        } else {
            item.removeAttribute('aria-current');
        }
    });
    root.dataset.activeKdePanel = resolved;
}

function bindKdeSettingsNavigation(root) {
    if (!root || root.dataset.kdeNavBound === 'true') {
        return;
    }
    root.dataset.kdeNavBound = 'true';
    root.querySelectorAll('[data-kde-panel]:not([disabled])').forEach((item) => {
        item.addEventListener('click', () => {
            activateKdeSettingsPanel(root, item.getAttribute('data-kde-panel'));
        });
    });
}

function syncKdeSettingsUiFromStorage(root) {
    if (!root) {
        return;
    }
    const kc = window.CapsuleKdeKconfig;
    const storage = window.CapsuleThemeStorage || {};
    const bodyId = document.body ? document.body.id : 'kde-neon';
    const theme = typeof storage.readSavedTheme === 'function'
        ? storage.readSavedTheme(bodyId)
        : (localStorage.getItem('kde-neon-theme') || document.documentElement.dataset.theme || 'light');
    root.querySelectorAll('[data-kde-theme-option]').forEach((btn) => {
        const active = btn.getAttribute('data-kde-theme-option') === theme;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    const panelHeight = kc ? kc.getCapsule('plasmashellrc::PanelHeight', '40') : '40';
    const heightSelect = root.querySelector('[data-kde-setting="kde-panel-height"]');
    if (heightSelect) {
        heightSelect.value = panelHeight;
    }
    const animOn = kc ? kc.getBool('kwinrc::Windows/animate', true) : true;
    const animSwitch = root.querySelector('[data-kde-setting="kde-window-animations"]');
    if (animSwitch) {
        animSwitch.classList.toggle('is-on', animOn);
        animSwitch.setAttribute('aria-checked', animOn ? 'true' : 'false');
    }
    const clickFocusPolicy = kc ? kc.getCapsule('kwinrc::Windows/FocusPolicy', 'ClickToFocus') : 'ClickToFocus';
    const clickFocusOn = clickFocusPolicy === 'ClickToFocus';
    const clickFocusSwitch = root.querySelector('[data-kde-setting="kde-click-to-focus"]');
    if (clickFocusSwitch) {
        clickFocusSwitch.classList.toggle('is-on', clickFocusOn);
        clickFocusSwitch.setAttribute('aria-checked', clickFocusOn ? 'true' : 'false');
    }
    const focusStealLevel = kc ? kc.getCapsule('kwinrc::Windows/FocusStealingPreventionLevel', '0') : '0';
    const focusStealOn = focusStealLevel === '1' || focusStealLevel === 'true';
    const focusStealSwitch = root.querySelector('[data-kde-setting="kde-focus-stealing"]');
    if (focusStealSwitch) {
        focusStealSwitch.classList.toggle('is-on', focusStealOn);
        focusStealSwitch.setAttribute('aria-checked', focusStealOn ? 'true' : 'false');
    }
    const contrastOn = kc ? kc.getBool('kdeglobals::KDE/contrast', false) : false;
    const contrastSwitch = root.querySelector('[data-kde-setting="kde-a11y-high-contrast"]');
    if (contrastSwitch) {
        contrastSwitch.classList.toggle('is-on', contrastOn);
        contrastSwitch.setAttribute('aria-checked', contrastOn ? 'true' : 'false');
    }
    const reducedMotionOn = kc ? !kc.getBool('kdeglobals::KDE/AnimationDurationFactor', true) : false;
    const reducedMotionSwitch = root.querySelector('[data-kde-setting="kde-reduced-motion"]');
    if (reducedMotionSwitch) {
        reducedMotionSwitch.classList.toggle('is-on', reducedMotionOn);
        reducedMotionSwitch.setAttribute('aria-checked', reducedMotionOn ? 'true' : 'false');
    }
    const desktopIconsOn = kc ? kc.getBool('plasma-org.kde.plasma.desktop-appletsrc::DesktopIcons/Enabled', true) : true;
    const desktopIconsSwitch = root.querySelector('[data-kde-setting="kde-desktop-icons"]');
    if (desktopIconsSwitch) {
        desktopIconsSwitch.classList.toggle('is-on', desktopIconsOn);
        desktopIconsSwitch.setAttribute('aria-checked', desktopIconsOn ? 'true' : 'false');
    }
    const desktopAlign = kc ? kc.getCapsule('plasma-org.kde.plasma.desktop-appletsrc::DesktopIcons/Arrangement', '0') : '0';
    const alignSelect = root.querySelector('[data-kde-setting="kde-desktop-align"]');
    if (alignSelect) {
        alignSelect.value = desktopAlign === '1' ? 'right' : 'left';
    }
    if (window.CapsuleKdeSettingsParity && typeof window.CapsuleKdeSettingsParity.bindControls === 'function') {
        window.CapsuleKdeSettingsParity.bindControls(root);
    }
}

function resolveKdeSettingsRoot(container) {
    const scope = container || document.querySelector('#themes');
    if (!scope) {
        return null;
    }
    return scope.querySelector('[data-kde-settings-root]')
        || scope.querySelector('#kdeSystemSettingsShell')
        || scope.querySelector('#kdeSystemSettingsApp');
}

function bindKdeThemeChoices(root) {
    if (!root || root.dataset.kdeThemeBound === 'true') {
        return;
    }
    root.dataset.kdeThemeBound = 'true';
    const storage = window.CapsuleThemeStorage || {};
    const bodyId = document.body ? document.body.id : 'kde-neon';
    root.querySelectorAll('[data-kde-theme-option]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-kde-theme-option') === 'dark' ? 'dark' : 'light';
            document.documentElement.dataset.theme = theme;
            if (typeof storage.persistTheme === 'function') {
                storage.persistTheme(theme, bodyId);
            } else {
                localStorage.setItem('kde-neon-theme', theme);
            }
            root.querySelectorAll('[data-kde-theme-option]').forEach((entry) => {
                const active = entry.getAttribute('data-kde-theme-option') === theme;
                entry.classList.toggle('is-active', active);
                entry.setAttribute('aria-checked', active ? 'true' : 'false');
            });
            if (window.CapsuleKdeSettingsParity
                && window.CapsuleKdeSettingsParity.EFFECT_HANDLERS
                && typeof window.CapsuleKdeSettingsParity.EFFECT_HANDLERS['kde-global-theme'] === 'function') {
                window.CapsuleKdeSettingsParity.EFFECT_HANDLERS['kde-global-theme'](theme);
            }
        });
    });
}

function handleKdeSettingsWindowOpened(container) {
    const root = resolveKdeSettingsRoot(container);
    if (!root) {
        return;
    }
    const panelId = root.dataset.activeKdePanel
        || (root.dataset.kdeSettingsView === 'kcm-display' ? 'display-config' : 'quick-settings');
    activateKdeSettingsPanel(root, panelId);
    bindKdeThemeChoices(root);
    syncKdeSettingsUiFromStorage(root);
    if (window.CapsuleKdeSettingsNav) {
        if (typeof window.CapsuleKdeSettingsNav.bindNavigation === 'function') {
            window.CapsuleKdeSettingsNav.bindNavigation(root);
        }
        if (typeof window.CapsuleKdeSettingsNav.updateWindowTitle === 'function') {
            window.CapsuleKdeSettingsNav.updateWindowTitle();
        }
    }
}

function initKdeSettingsApp(container) {
    handleKdeSettingsWindowOpened(container || document.querySelector('#themes'));
}

function handleGnomeSettingsWindowOpened(container) {
    const root = container ? container.querySelector('#themesApp') : null;
    if (!root || !root.classList.contains('gnome-settings')) {
        return;
    }

    const panelId = consumePendingGnomeSettingsPanel('appearance');
    activateGnomeSettingsPanel(root, panelId);
    bindGnomeSettingsNavigation(root);
    bindSettingsSwitches(root);
    buildWallpaperGrid(root);
    bindAccentChips(root);
    initThemesApp();
}

if (typeof window !== 'undefined') {
    window.setCapsuleSettingsPanel = setCapsuleSettingsPanel;
    window.buildWallpaperGrid = buildWallpaperGrid;
    window.initKdeSettingsApp = initKdeSettingsApp;
    window.resolveKdeSettingsRoot = resolveKdeSettingsRoot;
    document.addEventListener('capsule:window-opened', (event) => {
        if (!event.detail || event.detail.slotId !== 'themes') {
            return;
        }
        handleGnomeSettingsWindowOpened(event.detail.container);
        handleKdeSettingsWindowOpened(event.detail.container);
        if (document.body && document.body.id === 'mint') {
            if (document.getElementById('cinnamonSettingsApp')) {
                return;
            }
            initThemesApp();
            const panelId = consumePendingGnomeSettingsPanel(null);
            if (panelId === 'background') {
                const section = document.querySelector('[data-mint-wallpaper-section]');
                if (section) {
                    window.setTimeout(() => section.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);
                }
            }
        }
    });
    document.addEventListener('capsule:gnome-theme-changed', () => {
        const root = document.querySelector('#themes #themesApp');
        if (root) {
            buildWallpaperGrid(root);
        }
    });
    document.addEventListener('capsule:wallpaper-changed', (event) => {
        const root = document.querySelector('#themes #themesApp');
        if (root && event.detail && event.detail.wallpaperId) {
            markActiveWallpaperTile(root.querySelector('[data-wallpaper-grid]'), event.detail.wallpaperId);
        }
    });
    document.addEventListener('capsule:accent-changed', (event) => {
        const root = document.querySelector('#themes #themesApp');
        if (!root || !event.detail) {
            return;
        }
        const chips = root.querySelectorAll('[data-accent-chip]');
        chips.forEach((chip) => {
            const active = chip.getAttribute('data-accent-chip') === event.detail.accentId;
            chip.classList.toggle('is-active', active);
            chip.setAttribute('aria-checked', active ? 'true' : 'false');
        });
        syncAccentChipRings(chips, event.detail.accentId);
        refreshAllAdwSliders(root);
        if (typeof window.refreshQuickSettingsVolumeFill === 'function') {
            window.refreshQuickSettingsVolumeFill();
        }
    });
}

(function initGnomeAppearanceAtBoot() {
    'use strict';

    const storage = window.CapsuleThemeStorage || {};
    const bodyId = document.body ? document.body.id : '';
    const themeKey = typeof storage.getThemeStorageKey === 'function'
        ? storage.getThemeStorageKey(bodyId)
        : 'mint-theme';
    const savedTheme = typeof storage.readSavedTheme === 'function'
        ? storage.readSavedTheme(bodyId)
        : localStorage.getItem(themeKey);
    const savedContrast = localStorage.getItem('mint-contrast-mode');
    const savedFontScale = localStorage.getItem('mint-font-scale');
    const isGnomeShell = typeof storage.isGnomeShell === 'function'
        ? storage.isGnomeShell(bodyId)
        : false;
    var profileDefault = typeof storage.getProfileDefaultTheme === 'function'
        ? storage.getProfileDefaultTheme(bodyId)
        : null;
    const defaultTheme = profileDefault || (bodyId === 'mint' || isGnomeShell || themeKey === 'cosmic-theme' ? 'dark' : 'light');
    const resolvedTheme = savedTheme === 'light' ? 'light' : (savedTheme === 'dark' ? 'dark' : defaultTheme);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.contrastMode = savedContrast === 'high' ? 'high' : 'normal';
    document.documentElement.dataset.fontScale = ['110', '125'].includes(savedFontScale) ? savedFontScale : '100';

    if (isGnomeShell && typeof storage.applyAccentColor === 'function') {
        storage.applyAccentColor(storage.readSavedAccent());
    }
    if ((isGnomeShell || bodyId === 'mint') && typeof storage.applyWallpaper === 'function') {
        storage.applyWallpaper(storage.readSavedWallpaper(), bodyId);
    }
    if (isGnomeShell && typeof storage.applyGnomeShellPreferences === 'function') {
        storage.applyGnomeShellPreferences();
    }
})();

function resolveThemesAppearanceRoot(root) {
    return root.querySelector('#gnomeSettingsAppearance')
        || root.querySelector('[data-gnome-settings-panel="appearance"]')
        || root;
}

function resolveThemesAccessibilityRoot(root) {
    return root.querySelector('#gnomeSettingsAccessibility')
        || root.querySelector('[data-gnome-settings-panel="accessibility"]')
        || root;
}

let capsuleThemeUiState = null;

function resolveCapsuleThemeDefault() {
    const bodyId = document.body ? document.body.id : '';
    const storage = window.CapsuleThemeStorage || {};
    const isGnomeShell = typeof storage.isGnomeShell === 'function' && storage.isGnomeShell(bodyId);
    var profileDefault = typeof storage.getProfileDefaultTheme === 'function'
        ? storage.getProfileDefaultTheme(bodyId)
        : null;
    return profileDefault || (bodyId === 'mint' || isGnomeShell ? 'dark' : 'light');
}

function resolveCapsuleThemeCurrent() {
    const theme = document.documentElement.dataset.theme;
    if (theme === 'light' || theme === 'dark') {
        return theme;
    }
    const storage = window.CapsuleThemeStorage || {};
    const saved = typeof storage.readSavedTheme === 'function'
        ? storage.readSavedTheme(document.body ? document.body.id : '')
        : null;
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    return resolveCapsuleThemeDefault();
}

function syncMintStyleChrome(themesRoot, theme) {
    if (!themesRoot) {
        return;
    }
    const styleName = theme === 'light' ? 'Mint-Y-Aqua' : 'Mint-Y-Dark-Aqua';
    const label = themesRoot.querySelector('.themes-app__select span');
    if (label) {
        label.textContent = styleName;
    }
    themesRoot.querySelectorAll('[data-mint-style]').forEach((entry) => {
        entry.classList.toggle('is-active', entry.getAttribute('data-mint-style') === styleName);
    });
    const gtkEl = themesRoot.querySelector('[data-themes-gtk]');
    const iconsEl = themesRoot.querySelector('[data-themes-icons]');
    if (gtkEl) {
        gtkEl.textContent = theme === 'light' ? 'Mint-Y-Aqua' : 'Mint-Y-Dark';
    }
    if (iconsEl) {
        iconsEl.textContent = styleName.indexOf('Aqua') >= 0 ? 'Mint-Y-Aqua' : 'Mint-Y-Sand';
    }
}

function applyCapsuleDocumentTheme(theme, themesRoot) {
    const storage = window.CapsuleThemeStorage || {};
    const resolved = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.themeTransition = 'on';
    document.documentElement.dataset.theme = resolved;
    if (typeof storage.persistTheme === 'function') {
        storage.persistTheme(resolved, document.body ? document.body.id : '');
    } else {
        const key = typeof storage.getThemeStorageKey === 'function'
            ? storage.getThemeStorageKey(document.body ? document.body.id : '')
            : 'mint-theme';
        localStorage.setItem(key, resolved);
    }

    const state = capsuleThemeUiState;
    const uiRoot = themesRoot || (state && state.root);
    if (state && state.options) {
        state.options.forEach((button) => {
            const isActive = button.getAttribute('data-theme-option') === resolved;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }
    const appearanceRoot = uiRoot ? resolveThemesAppearanceRoot(uiRoot) : null;
    const help = appearanceRoot && appearanceRoot.querySelector('[data-themes-help]');
    if (help) {
        help.textContent = resolved === 'light'
            ? 'Le thème clair est actif.'
            : 'Le thème sombre est actif.';
    }
    syncMintStyleChrome(uiRoot, resolved);

    if (document.body && document.body.id === 'mint') {
        const gtkTheme = resolved === 'light' ? 'Mint-Y-Aqua' : 'Mint-Y-Dark-Aqua';
        if (document.body.dataset) {
            document.body.dataset.capsuleGtkTheme = gtkTheme;
        }
        const cinnamonGs = window.CapsuleCinnamonGSettings;
        if (cinnamonGs && typeof cinnamonGs.setCapsule === 'function') {
            cinnamonGs.setCapsule('mint-gtk-theme', gtkTheme);
        }
        document.dispatchEvent(new CustomEvent('capsule:gtk-theme-changed', { detail: { theme: gtkTheme } }));
    }

    if (typeof storage.applyWallpaper === 'function') {
        const wpId = document.documentElement.dataset.gnomeWallpaper || storage.readSavedWallpaper();
        storage.applyWallpaper(wpId, document.body ? document.body.id : '');
        if (uiRoot && typeof buildWallpaperGrid === 'function') {
            buildWallpaperGrid(uiRoot);
        }
    }
    document.dispatchEvent(new CustomEvent('capsule:gnome-theme-changed', { detail: { theme: resolved } }));
    window.setTimeout(() => {
        delete document.documentElement.dataset.themeTransition;
    }, 320);
    return resolved;
}

function bindMintStyleSelect(root) {
    const selectBtn = root.querySelector('.themes-app__select');
    if (!selectBtn || selectBtn.dataset.mintStyleBound === 'true') {
        return;
    }
    let popover = root.querySelector('#themes-style-popover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'themes-style-popover';
        popover.className = 'themes-style-popover';
        popover.hidden = true;
        popover.setAttribute('role', 'listbox');
        popover.setAttribute('aria-label', 'Styles Cinnamon');
        const styles = ['Mint-Y-Dark-Aqua', 'Mint-Y-Aqua', 'Mint-Y-Dark', 'Mint-Y'];
        styles.forEach((styleName) => {
            const opt = document.createElement('button');
            opt.type = 'button';
            opt.className = 'themes-style-popover__item' + (styleName === 'Mint-Y-Dark-Aqua' ? ' is-active' : '');
            opt.setAttribute('data-mint-style', styleName);
            opt.setAttribute('role', 'option');
            opt.textContent = styleName;
            popover.appendChild(opt);
        });
        const control = selectBtn.parentElement;
        if (control) {
            control.appendChild(popover);
        }
    }
    selectBtn.dataset.mintStyleBound = 'true';
    selectBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const open = popover.hidden;
        popover.hidden = !open;
        selectBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    popover.querySelectorAll('[data-mint-style]').forEach((opt) => {
        opt.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const styleName = opt.getAttribute('data-mint-style');
            const label = selectBtn.querySelector('span');
            if (label) {
                label.textContent = styleName;
            }
            popover.querySelectorAll('[data-mint-style]').forEach((entry) => {
                entry.classList.toggle('is-active', entry === opt);
            });
            const gtkEl = root.querySelector('[data-themes-gtk]');
            const iconsEl = root.querySelector('[data-themes-icons]');
            if (gtkEl) {
                gtkEl.textContent = styleName.indexOf('Dark') >= 0 ? 'Mint-Y-Dark' : 'Mint-Y-Aqua';
            }
            if (iconsEl) {
                iconsEl.textContent = styleName.indexOf('Aqua') >= 0 ? 'Mint-Y-Aqua' : 'Mint-Y-Sand';
            }
            applyCapsuleDocumentTheme(styleName.indexOf('Dark') >= 0 ? 'dark' : 'light', root);
            popover.hidden = true;
            selectBtn.setAttribute('aria-expanded', 'false');
        });
    });
    document.addEventListener('click', (event) => {
        if (popover.hidden) {
            return;
        }
        if (popover.contains(event.target) || event.target === selectBtn) {
            return;
        }
        popover.hidden = true;
        selectBtn.setAttribute('aria-expanded', 'false');
    });
}

function initThemesApp() {
    const root = document.querySelector('#themes #themesApp')
        || document.querySelector('#cinnamonSettingsApp #themesApp');
    if (!root) {
        return;
    }

    bindMintStyleSelect(root);
    bindGnomeSettingsNavigation(root);
    bindSettingsSwitches(root);
    buildWallpaperGrid(root);
    bindAccentChips(root);

    if (root.classList.contains('gnome-settings')) {
        const panelId = consumePendingGnomeSettingsPanel(root.dataset.activeGnomePanel || 'appearance');
        activateGnomeSettingsPanel(root, panelId);
    }

    if (root.dataset.initialized === 'true') {
        applyCapsuleDocumentTheme(resolveCapsuleThemeCurrent(), root);
        return;
    }

    const appearanceRoot = resolveThemesAppearanceRoot(root);
    const accessibilityRoot = resolveThemesAccessibilityRoot(root);
    const options = appearanceRoot.querySelectorAll('[data-theme-option]');
    const contrastOptions = accessibilityRoot.querySelectorAll('[data-contrast-option]');
    const fontScaleOptions = accessibilityRoot.querySelectorAll('[data-font-scale-option]');
    const storage = window.CapsuleThemeStorage || {};

    if (!options.length) {
        return;
    }

    capsuleThemeUiState = { root, options };

    function applyContrast(mode) {
        const resolved = typeof storage.applyContrastMode === 'function'
            ? storage.applyContrastMode(mode)
            : (mode === 'high' ? 'high' : 'normal');

        contrastOptions.forEach(function syncContrast(button) {
            const isActive = button.getAttribute('data-contrast-option') === resolved;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }

    function applyFontScale(scale) {
        const resolved = typeof storage.applyFontScale === 'function'
            ? storage.applyFontScale(scale)
            : (['110', '125'].includes(scale) ? scale : '100');

        fontScaleOptions.forEach(function syncScale(button) {
            const isActive = button.getAttribute('data-font-scale-option') === resolved;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }

    options.forEach(function bindOption(button) {
        button.addEventListener('click', function onOptionClick() {
            applyCapsuleDocumentTheme(button.getAttribute('data-theme-option'), root);
            if (typeof dispatchCapsuleTask === 'function') {
                dispatchCapsuleTask('change-theme');
            }
        });
    });

    contrastOptions.forEach(function bindContrast(button) {
        button.addEventListener('click', function onContrastClick() {
            applyContrast(button.getAttribute('data-contrast-option'));
        });
    });

    fontScaleOptions.forEach(function bindFontScale(button) {
        button.addEventListener('click', function onFontScaleClick() {
            applyFontScale(button.getAttribute('data-font-scale-option'));
        });
    });

    applyCapsuleDocumentTheme(resolveCapsuleThemeCurrent(), root);
    if (contrastOptions.length) {
        applyContrast(document.documentElement.dataset.contrastMode || 'normal');
    }
    if (fontScaleOptions.length) {
        applyFontScale(document.documentElement.dataset.fontScale || '100');
    }
    root.dataset.initialized = 'true';
}
