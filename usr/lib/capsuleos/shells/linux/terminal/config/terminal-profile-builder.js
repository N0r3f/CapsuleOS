/**
 * Construction des profils terminal : noyau + extensions famille (+ vendor via terminal-profile.js).
 */
(function initTerminalProfileBuilder(global) {
    'use strict';

    const coreCommands = () => (
        Array.isArray(global.CAPSULE_TERMINAL_CORE_COMMANDS)
            ? global.CAPSULE_TERMINAL_CORE_COMMANDS.slice()
            : []
    );

    const mergeUnique = (base, extra) => {
        const seen = new Set(base);
        const out = base.slice();
        (extra || []).forEach((name) => {
            const key = String(name || '').trim();
            if (!key || seen.has(key)) {
                return;
            }
            seen.add(key);
            out.push(key);
        });
        return out;
    };

    /** @type {Record<string, string[]>} */
    const vendorExtensions = Object.create(null);

    function registerVendorCommands(vendorHint, commands) {
        const key = String(vendorHint || '').toLowerCase();
        if (!key) {
            return;
        }
        vendorExtensions[key] = mergeUnique(vendorExtensions[key] || [], commands);
    }

    function registerLinuxFamily(familyId, options) {
        const opts = options || {};
        const family = String(familyId || '').toLowerCase();
        if (!family) {
            return null;
        }
        const familyCommands = opts.familyCommands || opts.commands || [];
        const commands = mergeUnique(coreCommands(), familyCommands);
        const profile = {
            id: `linux:${family}`,
            osFamily: 'linux',
            distro: family,
            displayName: opts.displayName || `Linux ${family}`,
            commands,
            packageManagers: opts.packageManagers || [],
            layers: {
                core: coreCommands(),
                family: familyCommands.slice(),
            },
        };
        global.CAPSULE_TERMINAL_PROFILES = global.CAPSULE_TERMINAL_PROFILES || {};
        global.CAPSULE_TERMINAL_PROFILES[profile.id] = profile;
        return profile;
    }

    function resolveVendorExtensions(vendorHint) {
        const key = String(vendorHint || '').toLowerCase();
        return vendorExtensions[key] ? vendorExtensions[key].slice() : [];
    }

    function listVendorExtensionKeys() {
        return Object.keys(vendorExtensions);
    }

    global.CapsuleTerminalProfileBuilder = {
        registerLinuxFamily,
        registerVendorCommands,
        resolveVendorExtensions,
        listVendorExtensionKeys,
        mergeUnique,
    };
}(typeof window !== 'undefined' ? window : globalThis));
