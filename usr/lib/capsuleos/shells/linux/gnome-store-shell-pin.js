/**
 * Épinglage shell après installation magasin — écoute capsule:store-app-installed.
 * Révèle les lanceurs overview/dash masqués (data-store-pin) et enregistre la recherche overview.
 */
(function initCapsuleGnomeStoreShellPin(global) {
    'use strict';

    var GNOME_BODY_IDS = { alma: true, rocky: true, fedora: true, ubuntu: true };
    var ASSET_PREFIX = '../../../usr/share/capsuleos/assets/images/toolkits/gnome/apps/';

    var STORE_PIN_BY_SLOT = {
        file_roller: {
            label: 'Gestionnaire d\'archives',
            icon: ASSET_PREFIX + 'org.gnome.FileRoller',
            overview: true
        },
        librewriter: {
            label: 'LibreOffice Writer',
            icon: ASSET_PREFIX + 'overview/libreoffice-writer.svg',
            overview: true,
            dash: true
        },
        libreoffice_startcenter: {
            label: 'LibreOffice',
            icon: ASSET_PREFIX + 'libreoffice-startcenter',
            overview: true,
            dash: true
        },
        librecalc: {
            label: 'LibreOffice Calc',
            icon: ASSET_PREFIX + 'overview/libreoffice-calc.svg',
            overview: true
        },
        libreoffice_impress: {
            label: 'LibreOffice Impress',
            icon: ASSET_PREFIX + 'overview/libreoffice-impress.svg',
            overview: true
        },
        libreoffice_draw: {
            label: 'LibreOffice Draw',
            icon: ASSET_PREFIX + 'libreoffice-draw',
            overview: true
        },
        calendar: {
            label: 'Agenda',
            icon: ASSET_PREFIX + 'dash/org.gnome.Calendar.svg',
            overview: true,
            dash: true
        },
        thunderbird: {
            label: 'Thunderbird',
            icon: ASSET_PREFIX + 'thunderbird',
            overview: true
        },
        transmission: {
            label: 'Transmission',
            icon: ASSET_PREFIX + 'transmission-gtk',
            overview: true
        },
        rhythmbox: {
            label: 'Rhythmbox',
            icon: ASSET_PREFIX + 'org.gnome.Rhythmbox3',
            overview: true
        },
        lecteur_multimedia: {
            label: 'Lecteur vidéos',
            icon: ASSET_PREFIX + 'io.github.celluloid_player.Celluloid',
            overview: true
        },
        drawing: {
            label: 'Drawing',
            icon: ASSET_PREFIX + 'com.github.maoschanz.drawing',
            overview: true
        },
        simple_scan: {
            label: 'Numériseur simple',
            icon: ASSET_PREFIX + 'overview/org.gnome.SimpleScan.svg',
            overview: true
        },
        warpinator: {
            label: 'Warpinator',
            icon: ASSET_PREFIX + 'org.x.Warpinator',
            overview: true
        },
        timeshift: {
            label: 'Timeshift',
            icon: ASSET_PREFIX + 'timeshift-gtk',
            overview: true
        }
    };

    function isGnomeShell() {
        var bodyId = global.document && global.document.body ? global.document.body.id : '';
        return !!GNOME_BODY_IDS[bodyId];
    }

    function revealOverviewPin(slotId) {
        var selector = '[data-store-pin="' + slotId + '"]';
        global.document.querySelectorAll(selector).forEach(function reveal(el) {
            el.hidden = false;
            el.removeAttribute('aria-hidden');
        });
    }

    function appendOverviewApp(slotId, label, iconPath) {
        var grid = global.document.querySelector('[data-overview-apps-grid]');
        if (!grid || grid.querySelector('[data-overview-link="' + slotId + '"]')) {
            return;
        }
        var btn = global.document.createElement('button');
        btn.type = 'button';
        btn.className = 'fedora-overview__app';
        btn.setAttribute('data-overview-link', slotId);
        btn.setAttribute('data-store-pin', slotId);
        btn.setAttribute('aria-label', label);
        var img = global.document.createElement('img');
        img.src = iconPath;
        img.alt = '';
        btn.appendChild(img);
        var span = global.document.createElement('span');
        span.textContent = label.length > 10 ? label.slice(0, 9) + '…' : label;
        btn.appendChild(span);
        grid.appendChild(btn);
    }

    function appendDashApp(slotId, label, iconPath) {
        var dash = global.document.querySelector('.fedora-overview__dash');
        if (!dash || dash.querySelector('[data-overview-link="' + slotId + '"]')) {
            return;
        }
        var btn = global.document.createElement('button');
        btn.type = 'button';
        btn.className = 'fedora-overview__dash-item';
        btn.setAttribute('data-overview-link', slotId);
        btn.setAttribute('data-store-pin', slotId);
        btn.setAttribute('aria-label', label);
        var img = global.document.createElement('img');
        img.src = iconPath;
        img.alt = '';
        btn.appendChild(img);
        var appsBtn = dash.querySelector('[data-overview-apps]');
        if (appsBtn) {
            dash.insertBefore(btn, appsBtn);
        } else {
            dash.appendChild(btn);
        }
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
        var storeApi = global.CapsuleGnomeStore;
        var entry = storeApi && typeof storeApi.getStoreAppEntry === 'function'
            ? storeApi.getStoreAppEntry(appId)
            : null;
        if (entry && entry.relatedSlots && entry.relatedSlots.length) {
            var ri;
            for (ri = 0; ri < entry.relatedSlots.length; ri += 1) {
                pushSlot(entry.relatedSlots[ri]);
            }
            pushSlot(entry.storeSlot);
            return slots;
        }
        if (detail && detail.slot) {
            pushSlot(detail.slot);
        } else if (entry && entry.slot) {
            pushSlot(entry.slot);
        }
        return slots;
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
        var si;
        for (si = 0; si < slots.length; si += 1) {
            var slotId = slots[si];
            var config = STORE_PIN_BY_SLOT[slotId];
            revealOverviewPin(slotId);
            if (config) {
                if (config.overview) {
                    appendOverviewApp(slotId, config.label, config.icon);
                }
                if (config.dash) {
                    appendDashApp(slotId, config.label, config.icon);
                }
            }
        }
        if (global.CapsuleTaskbarLauncherState && typeof global.CapsuleTaskbarLauncherState.refresh === 'function') {
            global.CapsuleTaskbarLauncherState.refresh();
        }
    }

    function init() {
        if (!isGnomeShell()) {
            return;
        }
        var storeApi = global.CapsuleGnomeStore;
        if (!storeApi || typeof storeApi.resolveRegistryId !== 'function') {
            return;
        }
        var registryId = storeApi.resolveRegistryId();
        var meta = storeApi.loadStoreInstalledMeta(registryId);
        var ids = meta.appIds || [];
        var i;
        for (i = 0; i < ids.length; i += 1) {
            var entry = storeApi.getStoreAppEntry(ids[i]);
            if (entry && entry.relatedSlots && entry.relatedSlots.length) {
                pinStoreApp({ appId: ids[i], slot: entry.slot, storeSlot: entry.storeSlot });
            } else if (entry && entry.slot) {
                pinStoreApp({ appId: ids[i], slot: entry.slot });
            }
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
