(function initCapsuleTerminalProfile() {
    'use strict';

    const REDHAT_VENDOR_HINTS = new Set(['rocky', 'alma', 'fedora', 'redhat', 'rhel']);

    const bodyId = typeof document !== 'undefined' && document.body
        ? String(document.body.id || '').toLowerCase()
        : '';

    const normalizeCommandDistro = (hint) => {
        const raw = String(hint || '').toLowerCase();
        if (REDHAT_VENDOR_HINTS.has(raw)) {
            return 'redhat';
        }
        if (raw === 'opensuse' || raw === 'suse') {
            return 'suse';
        }
        if (raw) {
            return raw;
        }
        if (bodyId === 'fedora' || bodyId === 'rocky' || bodyId === 'alma') {
            return 'redhat';
        }
        if (bodyId === 'ubuntu' || bodyId === 'mint' || bodyId === 'popos' || bodyId === 'anduinos') {
            return 'debian';
        }
        if (bodyId === 'opensuse') {
            return 'suse';
        }
        return 'debian';
    };

    const inferDistro = () => {
        const fromWindow = typeof window !== 'undefined' ? window.CAPSULE_TERMINAL_PROFILE : '';
        if (fromWindow) {
            return normalizeCommandDistro(fromWindow);
        }
        return normalizeCommandDistro('');
    };

    const applyTerminalIdentity = () => {
        if (typeof window === 'undefined') {
            return;
        }
        const identityByBody = {
            rocky: { user: 'capsule', host: 'rocky' },
            fedora: { user: 'capsule', host: 'fedora' },
            alma: { user: 'capsule', host: 'alma' },
            ubuntu: { user: 'capsule', host: 'ubuntu' },
            anduinos: { user: 'capsule', host: 'anduinos' },
            mint: { user: 'capsule', host: 'mint' },
            'mx-kde': { user: 'mx-linux', host: 'mx' },
            'kde-neon': { user: 'capsule', host: 'capsule-kvm' },
            opensuse: { user: 'capsule', host: 'opensuse' },
        };
        const identity = identityByBody[bodyId];
        if (!identity) {
            return;
        }
        if (!window.CAPSULE_TERMINAL_USER) {
            window.CAPSULE_TERMINAL_USER = identity.user;
        }
        if (!window.CAPSULE_TERMINAL_HOST) {
            window.CAPSULE_TERMINAL_HOST = identity.host;
        }
    };

    const osFamily = typeof window !== 'undefined' && window.CAPSULE_TERMINAL_OS_FAMILY
        ? String(window.CAPSULE_TERMINAL_OS_FAMILY).toLowerCase()
        : 'linux';
    const distro = inferDistro();
    const profileId = `${osFamily}:${distro}`;
    const profiles = (typeof window !== 'undefined' && window.CAPSULE_TERMINAL_PROFILES) || {};
    const profile = profiles[profileId] || profiles[`${osFamily}:default`] || profiles['linux:debian'] || {
        id: profileId,
        osFamily,
        distro,
        displayName: `${osFamily}/${distro}`,
        commands: ['man', 'ls', 'pwd', 'echo', 'clear', 'history', 'whoami', 'uname']
    };

    const FAMILY_PROFILE_HINTS = new Set(['debian', 'redhat', 'suse', 'arch', 'linux', 'default']);

    const resolveVendorHint = () => {
        const profileHint = typeof window !== 'undefined' && window.CAPSULE_TERMINAL_PROFILE
            ? String(window.CAPSULE_TERMINAL_PROFILE).toLowerCase()
            : '';
        if (profileHint && !FAMILY_PROFILE_HINTS.has(profileHint)) {
            return profileHint;
        }
        return bodyId || profileHint;
    };

    const vendorHint = resolveVendorHint();
    const builder = typeof window !== 'undefined' ? window.CapsuleTerminalProfileBuilder : null;
    const vendorCommands = builder && typeof builder.resolveVendorExtensions === 'function'
        ? builder.resolveVendorExtensions(vendorHint)
        : [];
    const mergedCommands = builder && typeof builder.mergeUnique === 'function'
        ? builder.mergeUnique(profile.commands || [], vendorCommands)
        : (profile.commands || []).concat(vendorCommands);

    const registry = (typeof window !== 'undefined' && window.CAPSULE_TERMINAL_COMMAND_REGISTRY) || {};
    const activeCommands = mergedCommands
        .filter((name) => registry[name])
        .reduce((acc, name) => {
            acc[name] = registry[name];
            return acc;
        }, {});

    applyTerminalIdentity();

    window.CAPSULE_TERMINAL_ACTIVE_PROFILE = Object.assign({}, profile, {
        commands: mergedCommands,
        vendorCommands,
    });
    window.CAPSULE_TERMINAL_ACTIVE_COMMANDS = activeCommands;
    window.getTerminalActiveProfile = () => window.CAPSULE_TERMINAL_ACTIVE_PROFILE;
    window.getTerminalActiveCommands = () => window.CAPSULE_TERMINAL_ACTIVE_COMMANDS;
})();
