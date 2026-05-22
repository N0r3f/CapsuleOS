(function initLinuxArchTerminalProfile() {
    window.CAPSULE_TERMINAL_PROFILES = window.CAPSULE_TERMINAL_PROFILES || {};
    window.CAPSULE_TERMINAL_PROFILES['linux:arch'] = {
        id: 'linux:arch',
        osFamily: 'linux',
        distro: 'arch',
        displayName: 'Linux Arch',
        commands: [
            'man', 'cd', 'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find',
            'touch', 'mkdir', 'mv', 'rm', 'rmdir', 'clear', 'history', 'whoami', 'uname',
            'exit', 'ps', 'kill', 'ping', 'curl', 'sudo', 'ssh', 'nano', 'less', 'dd',
            'crontab', 'pacman'
        ],
        packageManagers: ['pacman']
    };
})();
