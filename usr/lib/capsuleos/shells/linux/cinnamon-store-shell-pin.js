/**
 * Épinglage menu Cinnamon après installation magasin — écoute capsule:store-app-installed.
 * Socle multi-distro : body mint aujourd'hui ; futurs OS toolkit cinnamon via CAPSULE_SKIN_PROFILE_ID.
 */
(function initCapsuleCinnamonStoreShellPin(global) {
    'use strict';

    var CINNAMON_BODY_IDS = { mint: true };

    var STORE_PIN_BY_SLOT = {
        file_roller: { slot: 'file_roller', menuMatch: 'FileRoller' },
        calendar: { slot: 'calendar', menuMatch: 'Calendar' },
        thunderbird: { slot: 'thunderbird', menuMatch: 'thunderbird' },
        transmission: { slot: 'transmission', menuMatch: 'transmission-gtk' },
        rhythmbox: { slot: 'rhythmbox', menuMatch: 'Rhythmbox3' },
        lecteur_multimedia: { slot: 'lecteur_multimedia', menuMatch: 'Celluloid' },
        drawing: { slot: 'drawing', menuMatch: 'maoschanz.drawing' },
        simple_scan: { slot: 'simple_scan', menuMatch: 'simple-scan' },
        warpinator: { slot: 'warpinator', menuMatch: 'Warpinator' },
        timeshift: { slot: 'timeshift', menuMatch: 'timeshift-gtk' },
        librewriter: { slot: 'librewriter', menuMatch: 'libreoffice-writer' },
        librecalc: { slot: 'librecalc', menuMatch: 'libreoffice-calc' },
        libreoffice_impress: { slot: 'libreoffice_impress', menuMatch: 'libreoffice-impress' },
        libreoffice_draw: { slot: 'libreoffice_draw', menuMatch: 'libreoffice-draw' },
        libreoffice_startcenter: { slot: 'libreoffice_startcenter', menuMatch: 'libreoffice-startcenter' },
        snapshot: { slot: 'snapshot', menuMatch: 'org.gnome.Snapshot' },
        simple_scan: { slot: 'simple_scan', menuMatch: 'simple-scan' }
    };

    function isCinnamonShell() {
        var bodyId = global.document && global.document.body ? global.document.body.id : '';
        return !!CINNAMON_BODY_IDS[bodyId];
    }

    function getStoreApi() {
        if (global.CapsuleCinnamonStore) {
            return global.CapsuleCinnamonStore;
        }
        return global.CapsuleMintStore || null;
    }

    function enableMenuSlot(slotId) {
        var pin = STORE_PIN_BY_SLOT[slotId];
        if (!pin || !global.MENU_APPS) {
            return false;
        }
        var apps = global.MENU_APPS;
        var i;
        var changed = false;
        for (i = 0; i < apps.length; i += 1) {
            if (apps[i].dataLink === pin.slot) {
                return false;
            }
        }
        for (i = 0; i < apps.length; i += 1) {
            var app = apps[i];
            if (app.dataLink) {
                continue;
            }
            if (pin.menuMatch && app.icon && app.icon.indexOf(pin.menuMatch) !== -1) {
                app.dataLink = pin.slot;
                changed = true;
                break;
            }
        }
        return changed;
    }

    function collectInstallSlots(appId, detail) {
        var slots = [];
        var seen = {};
        function pushSlot(slotId) {
            if (!slotId || seen[slotId]) {
                return;
            }
            seen[slotId] = true;
            slots.push(slotId);
        }
        var storeApi = getStoreApi();
        var entry = storeApi && typeof storeApi.getStoreAppEntry === 'function'
            ? storeApi.getStoreAppEntry(appId)
            : null;
        if (entry && entry.relatedSlots && entry.relatedSlots.length) {
            var ri;
            for (ri = 0; ri < entry.relatedSlots.length; ri += 1) {
                pushSlot(entry.relatedSlots[ri]);
            }
            pushSlot(entry.storeSlot || entry.slot);
            return slots;
        }
        if (detail && detail.slot) {
            pushSlot(detail.slot);
        } else if (entry && entry.slot) {
            pushSlot(entry.slot);
        }
        if (entry && entry.storeSlot) {
            pushSlot(entry.storeSlot);
        }
        return slots;
    }

    function refreshCinnamonMenu() {
        if (typeof global.document === 'undefined' || typeof global.document.dispatchEvent !== 'function') {
            return;
        }
        global.document.dispatchEvent(new CustomEvent('capsule:cinnamon-store-menu-pin'));
    }

    function pinStoreApp(detail) {
        if (!detail) {
            return;
        }
        var appId = detail.appId || '';
        var slots = collectInstallSlots(appId, detail);
        if (!slots.length && detail.slot) {
            slots = [detail.slot];
        }
        var changed = false;
        var si;
        for (si = 0; si < slots.length; si += 1) {
            if (enableMenuSlot(slots[si])) {
                changed = true;
            }
        }
        if (changed) {
            refreshCinnamonMenu();
        }
        if (global.CapsuleTaskbarLauncherState && typeof global.CapsuleTaskbarLauncherState.refresh === 'function') {
            global.CapsuleTaskbarLauncherState.refresh();
        }
    }

    function init() {
        if (!isCinnamonShell()) {
            return;
        }
        var storeApi = getStoreApi();
        if (!storeApi || typeof storeApi.resolveRegistryId !== 'function') {
            return;
        }
        global.document.addEventListener('capsule:store-app-installed', function onStoreInstall(event) {
            pinStoreApp(event.detail || {});
        });
    }

    if (typeof global.document !== 'undefined' && global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        global.setTimeout(init, 0);
    }
}(typeof window !== 'undefined' ? window : globalThis));
