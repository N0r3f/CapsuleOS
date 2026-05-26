(function initLinuxSuseTerminalProfile() {
    window.CAPSULE_TERMINAL_PROFILES = window.CAPSULE_TERMINAL_PROFILES || {};
    window.CAPSULE_TERMINAL_PROFILES['linux:suse'] = {
        id: 'linux:suse',
        osFamily: 'linux',
        distro: 'suse',
        displayName: 'Linux openSUSE-like',
        commands: [
            'man', 'cd', 'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find',
            'touch', 'mkdir', 'mv', 'rm', 'rmdir', 'clear', 'history', 'whoami', 'uname',
            'exit', 'ps', 'kill', 'ping', 'curl', 'sudo', 'ssh', 'nano', 'less', 'dd',
            'crontab', 'zypper', 'rpm'
        ],
        packageManagers: ['zypper', 'rpm']
    };
})();
