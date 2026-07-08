/**
 * Couche gsettings simulée Cinnamon — persistance schema::key alignée VM Mint.
 * Source bindings : cinnamon-gsettings-bindings.js (matrice parity).
 */
(function initCapsuleCinnamonGSettings(global) {
    'use strict';

    var STORAGE_PREFIX = 'cinnamon-gsettings::';
    var SEEDED_FLAG = 'cinnamon-gsettings::baseline-seeded-v1';

    var BINDINGS = global.CAPSULE_CINNAMON_GSETTINGS_BINDINGS && typeof global.CAPSULE_CINNAMON_GSETTINGS_BINDINGS === 'object'
        ? global.CAPSULE_CINNAMON_GSETTINGS_BINDINGS
        : {};

    var BASELINE = {
        'org.nemo.desktop::show-desktop-icons': 'true',
        'org.nemo.desktop::home-icon-visible': 'true',
        'org.nemo.desktop::trash-icon-visible': 'true',
        'org.cinnamon.desktop.interface::enable-animations': 'true',
        'org.cinnamon.desktop.wm.preferences::button-layout': "':minimize,maximize,close'",
        'org.cinnamon.desktop.wm.preferences::action-double-click-titlebar': "'toggle-maximize'",
        'org.cinnamon.desktop.wm.preferences::focus-mode': "'click'",
        'org.cinnamon::panels-height': "['1:40']",
        'org.cinnamon::panels-autohide': "['1:false']",
        'org.cinnamon.muffin::dynamic-workspaces': 'false',
        'org.cinnamon::number-workspaces': 'uint32 4',
        'org.cinnamon.desktop.screensaver::idle-activation-enabled': 'true',
        'org.cinnamon.desktop.screensaver::lock-delay': 'uint32 0',
        'org.cinnamon.muffin::unredirect-fullscreen-windows': 'true',
        'org.cinnamon.desktop.notifications::display-notifications': 'true',
        'org.cinnamon.sounds::enabled': 'true',
        'org.gnome.desktop.a11y.interface::high-contrast': 'false',
        'org.cinnamon.desktop.interface::text-scaling-factor': '1.0',
        'org.cinnamon::hotcorner-layout': "['expo:false:0', 'scale:false:0', 'scale:false:0', 'desktop:false:0']",
        'org.cinnamon::enabled-applets': "['panel1:left:0:menu@cinnamon.org:0', 'panel1:left:1:separator@cinnamon.org:1', 'panel1:left:2:grouped-window-list@cinnamon.org:2', 'panel1:right:0:systray@cinnamon.org:3', 'panel1:right:1:xapp-status@cinnamon.org:4', 'panel1:right:2:notifications@cinnamon.org:5', 'panel1:right:3:printers@cinnamon.org:6', 'panel1:right:4:removable-drives@cinnamon.org:7', 'panel1:right:5:keyboard@cinnamon.org:8', 'panel1:right:6:favorites@cinnamon.org:9', 'panel1:right:7:network@cinnamon.org:10', 'panel1:right:8:sound@cinnamon.org:11', 'panel1:right:9:power@cinnamon.org:12', 'panel1:right:10:calendar@cinnamon.org:13', 'panel1:right:11:cornerbar@cinnamon.org:14']",
        'org.cinnamon.desktop.peripherals.keyboard::repeat': 'true',
        'org.cinnamon.desktop.peripherals.keyboard::numlock-state': 'true',
        'org.cinnamon.desktop.peripherals.mouse::left-handed': 'false',
        'org.cinnamon.desktop.peripherals.mouse::natural-scroll': 'false',
        'org.cinnamon.settings-daemon.plugins.power::sleep-display-ac': 'uint32 1800',
        'org.cinnamon.settings-daemon.plugins.power::button-power': "'interactive'",
        'org.cinnamon.desktop.privacy::remember-recent-files': 'true',
        'org.cinnamon.desktop.privacy::recent-files-max-age': '7',
        'org.cinnamon.desktop.interface::font-name': "'Ubuntu 10'",
        'org.cinnamon.settings-daemon.plugins.xsettings::antialiasing': "'rgba'",
        'org.cinnamon.settings-daemon.peripherals.touchscreen::orientation-lock': 'true',
        'org.cinnamon.muffin.x11::fractional-scale-mode': "'scale-ui-down'",
        'org.cinnamon.desktop.interface::clock-use-24h': 'true',
        'org.cinnamon.desktop.interface::clock-show-date': 'false',
        'org.cinnamon.desktop.interface::clock-show-seconds': 'false',
        'org.cinnamon::startup-applications': '@as []',
        'org.cinnamon::enabled-extensions': '@as []',
        'org.cinnamon.desktop.media-handling::autorun-never': 'false',
        'org.cinnamon.desktop.default-applications.terminal::exec': "'gnome-terminal'",
        'org.cinnamon::desklet-snap': 'true',
        'org.cinnamon::desklet-snap-interval': '25',
        'org.cinnamon::lock-desklets': 'false',
        'org.cinnamon.gestures::enabled': 'false',
        'org.gnome.system.locale::region': "'fr_FR.UTF-8'",
        'org.gnome.online-accounts::whitelisted-providers': "['all']",
        'org.cinnamon::account-realname-sim': "'capsule'",
        'org.cinnamon::nemo-actions-parity-sim': 'false',
        'org.cinnamon.desktop.interface::gtk-theme': "'Mint-Y-Dark-Aqua'",
        'org.cinnamon.desktop.interface::icon-theme': "'Mint-Y-Sand'",
        'org.cinnamon.desktop.background::picture-options': "'zoom'",
        'org.cinnamon.desktop.background::picture-opacity': 'uint32 100',
        'org.cinnamon.settings-daemon.plugins.color::night-light-enabled': 'false',
        'org.cinnamon.desktop.input-sources::per-window': 'false',
        'org.cinnamon.desktop.input-sources::show-all-sources': 'false',
        'com.linuxmint.install::search-in-category': 'true',
        'com.linuxmint.install::allow-unverified-flatpaks': 'false',
        'com.linuxmint.report::automonitor': 'true',
        'com.linuxmint.report::autorefresh': 'true',
        'org.blueman.network::nap-enable': 'false',
        'org.cinnamon.settings-daemon.plugins.color::recalibrate-display-threshold': '0',
        'org.cinnamon.settings-daemon.plugins.color::recalibrate-printer-threshold': '0',
        'org.gnome.system.proxy::mode': 'none',
        'org.gnome.nm-applet::show-applet': 'true',
        'org.cinnamon.desktop.lockdown::disable-printing': 'false',
        'org.ubuntu.ufw::enabled': 'false',
        'org.ubuntu.ufw::logging': 'low',
        'org.freedesktop.bolt1.Manager::AuthMode': 'enabled'
    };

    var HOTCORNER_DEFAULT = "['expo:false:0', 'scale:false:0', 'scale:false:0', 'desktop:false:0']";

    var APPLET_RESTORE = {
        'calendar@cinnamon.org': 'panel1:right:10:calendar@cinnamon.org:13',
        'notifications@cinnamon.org': 'panel1:right:2:notifications@cinnamon.org:5',
        'cornerbar@cinnamon.org': 'panel1:right:11:cornerbar@cinnamon.org:14'
    };

    var STARTUP_RESTORE = {
        'firefox.desktop': 'firefox.desktop',
        'nemo.desktop': 'nemo.desktop'
    };

    var EXTENSION_RESTORE = {
        'deskgrid@cinnamon.org': 'deskgrid@cinnamon.org'
    };

    function parseStrv(raw) {
        var items = [];
        var re = /'([^']+)'/g;
        var m;
        while ((m = re.exec(String(raw || ''))) !== null) {
            items.push(m[1]);
        }
        return items;
    }

    function serializeStrv(items) {
        return '[' + items.map(function (item) { return "'" + item + "'"; }).join(', ') + ']';
    }

    function parseHotcornerItems(raw) {
        var items = parseStrv(raw);
        while (items.length < 4) {
            items.push('expo:false:0');
        }
        return items.slice(0, 4);
    }

    function hotcornerSegment(items, cornerIdx) {
        var parts = (items[cornerIdx] || 'expo:false:0').split(':');
        return {
            action: parts[0] || 'expo',
            enabled: parts[1] === 'true',
            delay: parts[2] || '0'
        };
    }

    function updateHotcornerSegment(raw, cornerIdx, field, value) {
        var items = parseHotcornerItems(raw);
        var seg = hotcornerSegment(items, cornerIdx);
        if (field === 'enabled') {
            seg.enabled = Boolean(value);
        } else if (field === 'action') {
            seg.action = value || 'expo';
        }
        items[cornerIdx] = seg.action + ':' + (seg.enabled ? 'true' : 'false') + ':' + seg.delay;
        return serializeStrv(items);
    }

    function appletListHasToken(items, token) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            if (items[i].indexOf(token) !== -1) {
                return true;
            }
        }
        return false;
    }

    function updateAppletList(raw, token, enabled) {
        var items = parseStrv(raw);
        var filtered = items.filter(function (entry) {
            return entry.indexOf(token) === -1;
        });
        if (enabled && APPLET_RESTORE[token]) {
            filtered.push(APPLET_RESTORE[token]);
        }
        return serializeStrv(filtered);
    }

    function updateStrvList(raw, token, enabled, restoreMap) {
        var items = parseStrv(raw);
        var filtered = items.filter(function (entry) {
            return entry.indexOf(token) === -1;
        });
        if (enabled && restoreMap[token]) {
            filtered.push(restoreMap[token]);
        }
        return filtered.length ? serializeStrv(filtered) : '@as []';
    }

    function storageKey(schema, key) {
        return STORAGE_PREFIX + schema + '::' + key;
    }

    function parseBool(raw) {
        var v = String(raw || '').trim().toLowerCase();
        return v === 'true' || v === "'true'" || v === 'on' || v === '1';
    }

    function stripGvariant(raw) {
        var s = String(raw || '');
        if (s.charAt(0) === "'" && s.charAt(s.length - 1) === "'") {
            return s.slice(1, -1);
        }
        return s;
    }

    function parseUint32(raw) {
        var m = String(raw || '').match(/uint32\s+(\d+)/i);
        if (m) {
            return Number(m[1]);
        }
        var digits = String(raw || '').replace(/[^\d]/g, '');
        return digits ? Number(digits) : 0;
    }

    var MAPS = {
        boolOnOff: {
            toCapsule: function (raw) { return parseBool(raw) ? 'on' : 'off'; },
            fromCapsule: function (capsule) { return capsule === 'on' ? 'true' : 'false'; }
        },
        passthrough: {
            toCapsule: function (raw) { return stripGvariant(raw); },
            fromCapsule: function (capsule) { return "'" + String(capsule).replace(/'/g, '') + "'"; }
        },
        buttonLayout: {
            toCapsule: function (raw) { return stripGvariant(raw); },
            fromCapsule: function (capsule) { return "'" + capsule + "'"; }
        },
        wmTitleAction: {
            toCapsule: function (raw) { return stripGvariant(raw); },
            fromCapsule: function (capsule) { return "'" + capsule + "'"; }
        },
        panelsHeight: {
            toCapsule: function (raw) {
                var m = String(raw || '').match(/1:(\d+)/);
                return m ? '1:' + m[1] : '1:40';
            },
            fromCapsule: function (capsule) { return "['" + capsule + "']"; }
        },
        panelsAutohide: {
            toCapsule: function (raw) {
                return /false/.test(String(raw)) ? 'off' : 'on';
            },
            fromCapsule: function (capsule) {
                return capsule === 'on' ? "['1:true']" : "['1:false']";
            }
        },
        uint32: {
            toCapsule: function (raw) { return String(parseUint32(raw)); },
            fromCapsule: function (capsule) { return 'uint32 ' + parseUint32(capsule); }
        },
        int32: {
            toCapsule: function (raw) {
                var m = String(raw || '').match(/int32\s+(-?\d+)/i);
                if (m) {
                    return m[1];
                }
                return String(parseInt(String(raw || '0'), 10) || 0);
            },
            fromCapsule: function (capsule) { return String(parseInt(capsule, 10) || 0); }
        },
        textScalingLarge: {
            toCapsule: function (raw) {
                var n = parseFloat(String(raw || '1.0'));
                return n >= 1.2 ? 'on' : 'off';
            },
            fromCapsule: function (capsule) {
                return capsule === 'on' ? '1.25' : '1.0';
            }
        }
    };

    function mapToCapsule(binding, raw, fallback) {
        if (binding.map === 'hotcornerEnable') {
            var cornerEnable = parseInt(binding.effectArg, 10) || 0;
            return hotcornerSegment(parseHotcornerItems(raw), cornerEnable).enabled ? 'on' : 'off';
        }
        if (binding.map === 'hotcornerAction') {
            var cornerAction = parseInt(binding.effectArg, 10) || 0;
            return hotcornerSegment(parseHotcornerItems(raw), cornerAction).action || fallback;
        }
        if (binding.map === 'appletEnabled') {
            return appletListHasToken(parseStrv(raw), binding.effectArg) ? 'on' : 'off';
        }
        if (binding.map === 'startupAppEnabled' || binding.map === 'extensionEnabled'
            || binding.map === 'oaWhitelistAll') {
            return appletListHasToken(parseStrv(raw), binding.effectArg) ? 'on' : 'off';
        }
        var mapper = MAPS[binding.map];
        if (mapper && typeof mapper.toCapsule === 'function') {
            return mapper.toCapsule(raw);
        }
        return stripGvariant(raw);
    }

    function mapFromCapsule(binding, capsuleValue, currentRaw) {
        if (binding.map === 'hotcornerEnable') {
            var cornerEnable = parseInt(binding.effectArg, 10) || 0;
            return updateHotcornerSegment(currentRaw || HOTCORNER_DEFAULT, cornerEnable, 'enabled', capsuleValue === 'on');
        }
        if (binding.map === 'hotcornerAction') {
            var cornerAction = parseInt(binding.effectArg, 10) || 0;
            return updateHotcornerSegment(currentRaw || HOTCORNER_DEFAULT, cornerAction, 'action', capsuleValue);
        }
        if (binding.map === 'appletEnabled') {
            return updateAppletList(currentRaw, binding.effectArg, capsuleValue === 'on');
        }
        if (binding.map === 'startupAppEnabled') {
            return updateStrvList(currentRaw, binding.effectArg, capsuleValue === 'on', STARTUP_RESTORE);
        }
        if (binding.map === 'extensionEnabled') {
            return updateStrvList(currentRaw, binding.effectArg, capsuleValue === 'on', EXTENSION_RESTORE);
        }
        if (binding.map === 'oaWhitelistAll') {
            return updateStrvList(currentRaw, binding.effectArg, capsuleValue === 'on', { all: 'all' });
        }
        var mapper = MAPS[binding.map];
        if (mapper && typeof mapper.fromCapsule === 'function') {
            return mapper.fromCapsule(capsuleValue);
        }
        return String(capsuleValue);
    }

    function dispatch(name, detail) {
        if (typeof global.document !== 'undefined') {
            global.document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
        }
    }

    function getRaw(schema, key) {
        return global.localStorage.getItem(storageKey(schema, key));
    }

    function setRaw(schema, key, raw) {
        var prev = getRaw(schema, key);
        global.localStorage.setItem(storageKey(schema, key), raw);
        if (prev !== raw) {
            dispatch('capsule:cinnamon-gsettings-changed', { schema: schema, key: key, value: raw, previous: prev });
        }
        return raw;
    }

    function hasBinding(capsuleKey) {
        return Boolean(BINDINGS[capsuleKey]);
    }

    function getBinding(capsuleKey) {
        return BINDINGS[capsuleKey] || null;
    }

    function getCapsule(capsuleKey, fallback) {
        var binding = getBinding(capsuleKey);
        if (!binding) {
            var legacy = global.localStorage.getItem(capsuleKey);
            return legacy != null && legacy !== '' ? legacy : fallback;
        }
        var raw = getRaw(binding.schema, binding.key);
        if (raw == null || raw === '') {
            return fallback;
        }
        var mapped = mapToCapsule(binding, raw, fallback);
        return mapped != null && mapped !== '' ? mapped : fallback;
    }

    function setCapsule(capsuleKey, capsuleValue) {
        var binding = getBinding(capsuleKey);
        global.localStorage.setItem(capsuleKey, capsuleValue);
        if (!binding) {
            return capsuleValue;
        }
        var currentRaw = getRaw(binding.schema, binding.key);
        var raw = mapFromCapsule(binding, capsuleValue, currentRaw);
        setRaw(binding.schema, binding.key, raw);
        return capsuleValue;
    }

    function getBool(capsuleKey, fallback) {
        var v = getCapsule(capsuleKey, fallback ? 'on' : 'off');
        return v === 'on' || v === 'true';
    }

    function setBool(capsuleKey, on) {
        return setCapsule(capsuleKey, on ? 'on' : 'off');
    }

    function seedBaseline() {
        if (global.localStorage.getItem(SEEDED_FLAG) === '1') {
            return;
        }
        Object.keys(BASELINE).forEach(function (compound) {
            var parts = compound.split('::');
            if (parts.length === 2 && getRaw(parts[0], parts[1]) == null) {
                setRaw(parts[0], parts[1], BASELINE[compound]);
            }
        });
        global.localStorage.setItem(SEEDED_FLAG, '1');
    }

    global.CapsuleCinnamonGSettings = {
        getCapsule: getCapsule,
        setCapsule: setCapsule,
        getBool: getBool,
        setBool: setBool,
        hasBinding: hasBinding,
        getBinding: getBinding,
        getRaw: getRaw,
        setRaw: setRaw,
        seedBaseline: seedBaseline,
        parseHotcornerItems: parseHotcornerItems,
        parseStrv: parseStrv,
        MAPS: MAPS
    };

    seedBaseline();
}(typeof window !== 'undefined' ? window : globalThis));
