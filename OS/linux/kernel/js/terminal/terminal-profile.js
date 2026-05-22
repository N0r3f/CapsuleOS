(function initCapsuleTerminalProfile() {
    const inferDistro = () => {
        const fromWindow = typeof window !== 'undefined' ? window.CAPSULE_TERMINAL_PROFILE : '';
        if (fromWindow) {
            return String(fromWindow).toLowerCase();
        }
        if (typeof document !== 'undefined' && document.body) {
            const bodyId = String(document.body.id || '').toLowerCase();
            if (bodyId === 'fedora') {
                return 'redhat';
            }
            if (bodyId === 'ubuntu' || bodyId === 'mint') {
                return 'debian';
            }
        }
        return 'debian';
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

    const registry = (typeof window !== 'undefined' && window.CAPSULE_TERMINAL_COMMAND_REGISTRY) || {};
    const activeCommands = (profile.commands || [])
        .filter((name) => registry[name])
        .reduce((acc, name) => {
            acc[name] = registry[name];
            return acc;
        }, {});

    window.CAPSULE_TERMINAL_ACTIVE_PROFILE = profile;
    window.CAPSULE_TERMINAL_ACTIVE_COMMANDS = activeCommands;
    window.getTerminalActiveProfile = () => window.CAPSULE_TERMINAL_ACTIVE_PROFILE;
    window.getTerminalActiveCommands = () => window.CAPSULE_TERMINAL_ACTIVE_COMMANDS;
})();
