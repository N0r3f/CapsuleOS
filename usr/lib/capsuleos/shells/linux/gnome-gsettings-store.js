/**
 * Couche gsettings simulée côté navigateur — persistance schema::key alignée VM GNOME.
 * Source bindings : root/tools/lab/gnome-settings-parity-matrix.json
 */
(function initCapsuleGnomeGSettings(global) {
    'use strict';

    const STORAGE_PREFIX = 'gsettings::';
    const MIGRATED_FLAG = 'gsettings::capsule-migrated-v2';
    const SEEDED_FLAG = 'gsettings::baseline-seeded-v1';

    const SEARCH_SCHEMA = 'org.gnome.desktop.search-providers';
    const SEARCH_KEY = 'disabled';

    /** @type {Record<string, { controlId: string, schema: string, key: string, map: string, providerId?: string }>} */
    const BINDINGS_BY_CAPSULE_KEY = global.CAPSULE_GSETTINGS_BINDINGS && typeof global.CAPSULE_GSETTINGS_BINDINGS === 'object'
        ? global.CAPSULE_GSETTINGS_BINDINGS
        : {};

    const SECONDARY_RAW_SYNC = {
        'org.gnome.desktop.background::picture-uri': {
            key: 'picture-uri-dark',
            derive(primaryRaw, capsuleValue) {
                const uri = stripGvariant(primaryRaw || capsuleValue || '');
                if (!uri) {
                    return null;
                }
                if (uri.includes('-day.')) {
                    return `'${uri.replace('-day.', '-night.')}'`;
                }
                if (uri.includes('-light.')) {
                    return `'${uri.replace('-light.', '-night.')}'`;
                }
                return `'${uri}'`;
            },
        },
    };

    const monitorListeners = new Set();

    function parseBool(raw) {
        const v = String(raw || '').trim().toLowerCase();
        return v === 'true' || v === "'true'" || v === 'on' || v === '1';
    }

    function stripGvariant(raw) {
        const s = String(raw || '');
        if (s.startsWith("'") && s.endsWith("'")) {
            return s.slice(1, -1);
        }
        return s;
    }

    function parseUint32(raw) {
        const m = String(raw || '').match(/uint32\s+(\d+)/i);
        if (m) {
            return Number(m[1]);
        }
        const digits = String(raw || '').replace(/[^\d]/g, '');
        return digits ? Number(digits) : 0;
    }

    function parseDisabledArray(raw) {
        const trimmed = String(raw || '').trim();
        if (!trimmed || trimmed === '@as []' || trimmed === '[]') {
            return [];
        }
        const matches = trimmed.match(/'([^']+)'/g);
        return matches ? matches.map((entry) => entry.slice(1, -1)) : [];
    }

    function formatDisabledArray(ids) {
        if (!ids.length) {
            return '@as []';
        }
        return `@as [${ids.map((id) => `'${id}'`).join(', ')}]`;
    }

    function isSearchProviderBinding(binding) {
        return binding && binding.map === 'searchProviderToggle' && binding.providerId;
    }

    function getSearchProviderRaw(binding) {
        return getRaw(binding.schema, binding.key) || '@as []';
    }

    function getSearchProviderOn(binding) {
        const disabled = parseDisabledArray(getSearchProviderRaw(binding));
        return !disabled.includes(binding.providerId);
    }

    function setSearchProviderOn(binding, on) {
        let disabled = parseDisabledArray(getSearchProviderRaw(binding));
        if (on) {
            disabled = disabled.filter((id) => id !== binding.providerId);
        } else if (!disabled.includes(binding.providerId)) {
            disabled.push(binding.providerId);
        }
        disabled.sort();
        setRaw(binding.schema, binding.key, formatDisabledArray(disabled));
    }

    const MAPS = {
        boolOnOff: {
            toCapsule(raw) {
                return parseBool(raw) ? 'on' : 'off';
            },
            fromCapsule(capsule) {
                return capsule === 'on' ? 'true' : 'false';
            },
        },
        enabledLabelFr: {
            toCapsule(raw) {
                return parseBool(raw) ? 'Activé' : 'Désactivé';
            },
            fromCapsule(capsule) {
                return capsule === 'Activé' ? 'true' : 'false';
            },
        },
        workspaceOnlyInverted: {
            toCapsule(raw) {
                return parseBool(raw) ? 'Désactivé' : 'Activé';
            },
            fromCapsule(capsule) {
                return capsule === 'Activé' ? 'false' : 'true';
            },
        },
        mouseHandedness: {
            toCapsule(raw) {
                return parseBool(raw) ? 'Droit' : 'Gauche';
            },
            fromCapsule(capsule) {
                return capsule === 'Droit' ? 'true' : 'false';
            },
        },
        scrollDirection: {
            toCapsule(raw) {
                return parseBool(raw) ? 'Naturel' : 'Standard';
            },
            fromCapsule(capsule) {
                return capsule === 'Naturel' ? 'true' : 'false';
            },
        },
        touchpadEnabled: {
            toCapsule(raw) {
                const enabled = String(raw).includes('enabled');
                return enabled ? 'on' : 'off';
            },
            fromCapsule(capsule) {
                return capsule === 'on' ? "'enabled'" : "'disabled'";
            },
        },
        privacyInverted: {
            toCapsule(raw) {
                return parseBool(raw) ? 'off' : 'on';
            },
            fromCapsule(capsule) {
                return capsule === 'on' ? 'false' : 'true';
            },
        },
        colorScheme: {
            toCapsule(raw) {
                const scheme = stripGvariant(raw).toLowerCase();
                return scheme.includes('light') ? 'light' : 'dark';
            },
            fromCapsule(capsule) {
                return capsule === 'light' ? "'prefer-light'" : "'prefer-dark'";
            },
        },
        accentColor: {
            toCapsule(raw) {
                return stripGvariant(raw);
            },
            fromCapsule(capsule) {
                return `'${capsule || 'blue'}'`;
            },
        },
        soundTheme: {
            toCapsule(raw) {
                const theme = stripGvariant(raw);
                return ['freedesktop', 'default', 'gnome'].includes(theme) ? 'Ding' : theme;
            },
            fromCapsule(capsule) {
                if (capsule === 'Aucun') {
                    return "'freedesktop'";
                }
                return capsule === 'Ding' ? "'freedesktop'" : `'${capsule}'`;
            },
        },
        textScalingPercent: {
            toCapsule(raw) {
                const factor = Number(raw);
                if (!Number.isFinite(factor)) {
                    return null;
                }
                return `${Math.round(factor * 100)} %`;
            },
            fromCapsule(capsule) {
                const pct = Number(String(capsule).replace(/[^\d]/g, ''));
                return String((Number.isFinite(pct) ? pct : 100) / 100);
            },
        },
        fontScalePercent: {
            toCapsule(raw) {
                const factor = Number(raw);
                if (!Number.isFinite(factor)) {
                    return '100';
                }
                const pct = Math.round(factor * 100);
                if (pct >= 125) {
                    return '125';
                }
                if (pct >= 110) {
                    return '110';
                }
                return '100';
            },
            fromCapsule(capsule) {
                const pct = Number(String(capsule).replace(/[^\d]/g, '')) || 100;
                return String(pct / 100);
            },
        },
        pointerSpeedPercent: {
            toCapsule(raw) {
                const speed = Number(raw);
                if (!Number.isFinite(speed)) {
                    return '50';
                }
                const pct = Math.round((speed + 1.0) * 50);
                return String(Math.max(0, Math.min(100, pct)));
            },
            fromCapsule(capsule) {
                const pct = Number(capsule) || 50;
                return String((pct / 50) - 1.0);
            },
        },
        keyboardDelayMs: {
            toCapsule(raw) {
                const sec = parseUint32(raw);
                return sec ? `${sec} ms` : null;
            },
            fromCapsule(capsule) {
                const ms = Number(String(capsule).replace(/[^\d]/g, '')) || 500;
                return `uint32 ${ms}`;
            },
        },
        lockDelayFr: {
            toCapsule(raw) {
                const sec = parseUint32(raw);
                if (sec === 0) {
                    return 'Immédiatement';
                }
                if (sec <= 60) {
                    return '1 minute';
                }
                return '5 minutes';
            },
            fromCapsule(capsule) {
                if (capsule === 'Immédiatement') {
                    return 'uint32 0';
                }
                if (capsule === '1 minute') {
                    return 'uint32 60';
                }
                return 'uint32 300';
            },
        },
        powerDimTimeout: {
            toCapsule(raw) {
                const sec = Number(raw);
                if (!Number.isFinite(sec)) {
                    return null;
                }
                const mapping = {
                    300: '5 minutes',
                    600: '10 minutes',
                    900: '15 minutes',
                    3600: '1 heure',
                    0: 'Jamais',
                };
                return mapping[sec] || `${sec}s`;
            },
            fromCapsule(capsule) {
                const reverse = {
                    '5 minutes': '300',
                    '10 minutes': '600',
                    '15 minutes': '900',
                    '1 heure': '3600',
                    Jamais: '0',
                };
                return reverse[capsule] || '900';
            },
        },
        powerSleepType: {
            toCapsule(raw) {
                const val = stripGvariant(raw);
                const mapping = { suspend: '30 minutes', hibernate: '1 heure', nothing: 'Jamais' };
                return mapping[val] || val;
            },
            fromCapsule(capsule) {
                const reverse = {
                    '30 minutes': "'suspend'",
                    '1 heure': "'hibernate'",
                    Jamais: "'nothing'",
                };
                return reverse[capsule] || "'suspend'";
            },
        },
        keyboardLayoutFr: {
            toCapsule(raw) {
                const lower = String(raw).toLowerCase();
                if (lower.includes('fr')) {
                    return 'Français';
                }
                if (lower.includes('bepo')) {
                    return 'Français (BÉPO)';
                }
                return 'English (US)';
            },
            fromCapsule(capsule) {
                if (capsule === 'Français (BÉPO)') {
                    return "[('xkb', 'fr+bepo')]";
                }
                if (capsule === 'Français') {
                    return "[('xkb', 'fr+oss')]";
                }
                return "[('xkb', 'us')]";
            },
        },
        gtkHighContrast: {
            toCapsule(raw) {
                const theme = stripGvariant(raw).toLowerCase().replace(/[-_]/g, '');
                return theme.includes('highcontrast') ? 'high' : 'normal';
            },
            fromCapsule(capsule) {
                return capsule === 'high' ? "'HighContrast'" : "'Adwaita'";
            },
        },
        powerProfile: {
            toCapsule(raw) {
                const profile = stripGvariant(raw).toLowerCase();
                const mapping = {
                    performance: 'Performance',
                    balanced: 'Équilibré',
                    'power-saver': "Économie d'énergie",
                };
                return mapping[profile] || stripGvariant(raw);
            },
            fromCapsule(capsule) {
                const reverse = {
                    Performance: 'performance',
                    'Équilibré': 'balanced',
                    "Économie d'énergie": 'power-saver',
                };
                return `'${reverse[capsule] || 'balanced'}'`;
            },
        },
        wallpaperUri: {
            toCapsule(raw) {
                return stripGvariant(raw);
            },
            fromCapsule(capsule) {
                if (String(capsule).startsWith('file://') || String(capsule).startsWith('/')) {
                    const pathValue = String(capsule).startsWith('file://') ? capsule : `file://${capsule}`;
                    return `'${pathValue}'`;
                }
                return `'file:///usr/share/backgrounds/rocky-default-10-${capsule}-day.png'`;
            },
        },
    };

    function storageKey(schema, key) {
        return `${STORAGE_PREFIX}${schema}::${key}`;
    }

    function dispatch(name, detail) {
        if (global.document && typeof global.CustomEvent === 'function') {
            global.document.dispatchEvent(new global.CustomEvent(name, { detail: detail || {} }));
        }
    }

    function notifyMonitors(schema, key, raw, previous) {
        monitorListeners.forEach((listener) => {
            if (listener.schema === schema && listener.key === key) {
                listener.fn({ schema, key, value: raw, previous });
            }
        });
    }

    function syncSecondaryRaw(schema, key, raw, capsuleValue) {
        const pair = `${schema}::${key}`;
        const rule = SECONDARY_RAW_SYNC[pair];
        if (!rule) {
            return;
        }
        const derived = rule.derive(raw, capsuleValue);
        if (derived != null) {
            setRaw(schema, rule.key, derived, { skipSecondary: true });
        }
    }

    function getRaw(schema, key) {
        return global.localStorage.getItem(storageKey(schema, key));
    }

    function setRaw(schema, key, raw, options) {
        const prev = getRaw(schema, key);
        global.localStorage.setItem(storageKey(schema, key), raw);
        if (prev !== raw) {
            dispatch('capsule:gsettings-changed', { schema, key, value: raw, previous: prev });
            notifyMonitors(schema, key, raw, prev);
        }
        if (!options || !options.skipSecondary) {
            syncSecondaryRaw(schema, key, raw, options && options.capsuleValue);
        }
        return raw;
    }

    function get(schema, key) {
        return getRaw(schema, key);
    }

    function set(schema, key, raw) {
        return setRaw(schema, key, raw);
    }

    function hasBinding(capsuleKey) {
        return Boolean(BINDINGS_BY_CAPSULE_KEY[capsuleKey]);
    }

    function getBinding(capsuleKey) {
        return BINDINGS_BY_CAPSULE_KEY[capsuleKey] || null;
    }

    function legacyToCapsule(capsuleKey, legacy) {
        if (legacy == null || legacy === '') {
            return null;
        }
        if (legacy === 'on' || legacy === 'true') {
            return 'on';
        }
        if (legacy === 'off' || legacy === 'false') {
            return 'off';
        }
        if (capsuleKey === 'gnome-theme' || capsuleKey === 'mint-theme') {
            return legacy === 'light' || legacy === 'dark' ? legacy : null;
        }
        return legacy;
    }

    function mirrorLegacy(capsuleKey, capsuleValue) {
        if (capsuleKey === 'mint-theme') {
            const themeKey = 'gnome-theme';
            if (capsuleValue === 'light' || capsuleValue === 'dark') {
                global.localStorage.setItem(themeKey, capsuleValue);
            }
        }
        global.localStorage.setItem(capsuleKey, capsuleValue);
    }

    function getCapsule(capsuleKey, fallback) {
        const binding = getBinding(capsuleKey);
        if (!binding) {
            const legacy = global.localStorage.getItem(capsuleKey);
            return legacy != null && legacy !== '' ? legacy : fallback;
        }
        if (isSearchProviderBinding(binding)) {
            return getSearchProviderOn(binding) ? 'on' : 'off';
        }
        let raw = getRaw(binding.schema, binding.key);
        if (raw == null || raw === '') {
            const legacy = global.localStorage.getItem(capsuleKey);
            const legacyCapsule = legacyToCapsule(capsuleKey, legacy);
            if (legacyCapsule != null) {
                setCapsule(capsuleKey, legacyCapsule);
                return legacyCapsule;
            }
            return fallback;
        }
        const mapper = MAPS[binding.map];
        if (mapper && typeof mapper.toCapsule === 'function') {
            const mapped = mapper.toCapsule(raw);
            return mapped != null && mapped !== '' ? mapped : fallback;
        }
        return raw;
    }

    function setCapsule(capsuleKey, capsuleValue) {
        const binding = getBinding(capsuleKey);
        mirrorLegacy(capsuleKey, capsuleValue);
        if (!binding) {
            return capsuleValue;
        }
        if (isSearchProviderBinding(binding)) {
            setSearchProviderOn(binding, capsuleValue === 'on');
            dispatch('capsule:search-providers-changed', { capsuleKey, enabled: capsuleValue === 'on' });
            return capsuleValue;
        }
        const mapper = MAPS[binding.map];
        const raw = mapper && typeof mapper.fromCapsule === 'function'
            ? mapper.fromCapsule(capsuleValue)
            : String(capsuleValue);
        setRaw(binding.schema, binding.key, raw, { capsuleValue });
        if (capsuleKey === 'gnome-sound-alert') {
            setRaw('org.gnome.desktop.sound', 'event-sounds', capsuleValue === 'Aucun' ? 'false' : 'true', { skipSecondary: true });
            mirrorLegacy('gnome-event-sounds', capsuleValue === 'Aucun' ? 'off' : 'on');
        }
        return capsuleValue;
    }

    function getBool(capsuleKey, fallback) {
        const v = getCapsule(capsuleKey, fallback === true || fallback === 'on' ? 'on' : 'off');
        if (v === 'on' || v === 'true') {
            return true;
        }
        if (v === 'off' || v === 'false') {
            return false;
        }
        return Boolean(fallback);
    }

    function setBool(capsuleKey, on) {
        return setCapsule(capsuleKey, on ? 'on' : 'off');
    }

    function onChanged(schema, key, fn) {
        const listener = { schema, key, fn };
        monitorListeners.add(listener);
        return () => monitorListeners.delete(listener);
    }

    function listSchema(schema) {
        const prefix = `${STORAGE_PREFIX}${schema}::`;
        const out = {};
        for (let i = 0; i < global.localStorage.length; i += 1) {
            const k = global.localStorage.key(i);
            if (k && k.startsWith(prefix)) {
                const itemKey = k.slice(prefix.length);
                out[itemKey] = global.localStorage.getItem(k);
            }
        }
        return out;
    }

    function exportSnapshot() {
        const out = {};
        const seen = new Set();
        Object.values(BINDINGS_BY_CAPSULE_KEY).forEach((binding) => {
            const pair = `${binding.schema}::${binding.key}`;
            if (seen.has(pair)) {
                return;
            }
            seen.add(pair);
            const raw = getRaw(binding.schema, binding.key);
            if (raw != null) {
                out[pair] = raw;
            }
        });
        const darkUri = getRaw('org.gnome.desktop.background', 'picture-uri-dark');
        if (darkUri != null) {
            out['org.gnome.desktop.background::picture-uri-dark'] = darkUri;
        }
        return out;
    }

    function importSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
            return;
        }
        Object.entries(snapshot).forEach(([pair, raw]) => {
            const idx = pair.indexOf('::');
            if (idx < 1) {
                return;
            }
            setRaw(pair.slice(0, idx), pair.slice(idx + 2), String(raw), { skipSecondary: pair.includes('picture-uri-dark') });
        });
    }

    function importFromVmPlaybook(playbook) {
        const panels = playbook && playbook.panels ? playbook.panels : [];
        panels.forEach((panel) => {
            const snapshot = panel.gsettingsAfter || panel.gsettingsBefore;
            if (!snapshot || typeof snapshot !== 'object') {
                return;
            }
            Object.entries(snapshot).forEach(([pair, raw]) => {
                const idx = pair.indexOf('::');
                if (idx < 1 || raw == null) {
                    return;
                }
                setRaw(pair.slice(0, idx), pair.slice(idx + 2), String(raw), { skipSecondary: true });
            });
        });
    }

    function migrateLegacyStorage() {
        if (global.localStorage.getItem(MIGRATED_FLAG) === '1') {
            return;
        }
        global.localStorage.removeItem('gsettings::capsule-migrated-v1');
        Object.keys(BINDINGS_BY_CAPSULE_KEY).forEach((capsuleKey) => {
            const binding = BINDINGS_BY_CAPSULE_KEY[capsuleKey];
            if (isSearchProviderBinding(binding)) {
                const legacy = global.localStorage.getItem(capsuleKey);
                if (legacy === 'on' || legacy === 'off') {
                    setSearchProviderOn(binding, legacy === 'on');
                }
                return;
            }
            const legacy = global.localStorage.getItem(capsuleKey);
            if (legacy == null || legacy === '') {
                return;
            }
            if (getRaw(binding.schema, binding.key)) {
                return;
            }
            const capsule = legacyToCapsule(capsuleKey, legacy);
            if (capsule != null) {
                setCapsule(capsuleKey, capsule);
            }
        });
        global.localStorage.setItem(MIGRATED_FLAG, '1');
    }

    function seedFromVmBaseline() {
        if (global.localStorage.getItem(SEEDED_FLAG) === '1') {
            return;
        }
        const baseline = global.CAPSULE_VM_SETTINGS_BASELINE;
        if (!baseline || typeof baseline !== 'object') {
            return;
        }
        Object.values(baseline).forEach((entry) => {
            if (!entry || !entry.schema || !entry.key || entry.capsuleExpected == null) {
                return;
            }
            if (getRaw(entry.schema, entry.key)) {
                return;
            }
            setCapsule(entry.capsuleKey || entry.id, String(entry.capsuleExpected));
        });
        global.localStorage.setItem(SEEDED_FLAG, '1');
    }

    function init() {
        if (!Object.keys(BINDINGS_BY_CAPSULE_KEY).length) {
            if (typeof global.console !== 'undefined' && global.console.warn) {
                global.console.warn('CapsuleGnomeGSettings: CAPSULE_GSETTINGS_BINDINGS absent — charger gnome-gsettings-bindings.js avant le store.');
            }
            return;
        }
        migrateLegacyStorage();
        seedFromVmBaseline();
    }

    global.CapsuleGnomeGSettings = {
        BINDINGS_BY_CAPSULE_KEY,
        MAPS,
        SEARCH_SCHEMA,
        SEARCH_KEY,
        hasBinding,
        getBinding,
        get,
        set,
        getRaw,
        setRaw,
        getCapsule,
        setCapsule,
        getBool,
        setBool,
        onChanged,
        listSchema,
        exportSnapshot,
        importSnapshot,
        importFromVmPlaybook,
        parseDisabledArray,
        formatDisabledArray,
        init,
        storageKey,
    };

    init();
}(typeof window !== 'undefined' ? window : globalThis));
