(function initLinuxRedHatTerminalProfile() {
    window.CAPSULE_TERMINAL_PROFILES = window.CAPSULE_TERMINAL_PROFILES || {};
    window.CAPSULE_TERMINAL_PROFILES['linux:redhat'] = {
        id: 'linux:redhat',
        osFamily: 'linux',
        distro: 'redhat',
        displayName: 'Linux Red Hat-like',
        commands: [
            'man', 'cd', 'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find',
            'touch', 'mkdir', 'mv', 'rm', 'rmdir', 'clear', 'history', 'whoami', 'uname',
            'exit', 'ps', 'kill', 'ping', 'curl', 'sudo', 'ssh', 'nano', 'less', 'dd',
            'crontab', 'dnf', 'rpm'
        ],
        packageManagers: ['dnf', 'rpm']
    };
})();
