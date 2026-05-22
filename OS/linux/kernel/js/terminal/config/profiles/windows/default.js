(function initWindowsTerminalProfile() {
    window.CAPSULE_TERMINAL_PROFILES = window.CAPSULE_TERMINAL_PROFILES || {};
    window.CAPSULE_TERMINAL_PROFILES['windows:default'] = {
        id: 'windows:default',
        osFamily: 'windows',
        distro: 'default',
        displayName: 'Windows shell',
        commands: ['man', 'whoami', 'history', 'clear', 'exit']
    };
})();
