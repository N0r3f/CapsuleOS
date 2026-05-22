(function initMacosTerminalProfile() {
    window.CAPSULE_TERMINAL_PROFILES = window.CAPSULE_TERMINAL_PROFILES || {};
    window.CAPSULE_TERMINAL_PROFILES['macos:default'] = {
        id: 'macos:default',
        osFamily: 'macos',
        distro: 'default',
        displayName: 'macOS shell',
        commands: ['man', 'cd', 'ls', 'pwd', 'echo', 'history', 'whoami', 'uname', 'clear', 'exit']
    };
})();
