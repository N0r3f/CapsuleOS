(function initLinuxDebianTerminalProfile() {
    window.CAPSULE_TERMINAL_PROFILES = window.CAPSULE_TERMINAL_PROFILES || {};
    window.CAPSULE_TERMINAL_PROFILES['linux:debian'] = {
        id: 'linux:debian',
        osFamily: 'linux',
        distro: 'debian',
        displayName: 'Linux Debian-like',
        commands: [
            'man', 'cd', 'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find',
            'touch', 'mkdir', 'mv', 'rm', 'rmdir', 'clear', 'history', 'whoami', 'uname',
            'exit', 'ps', 'kill', 'ping', 'curl', 'sudo', 'ssh', 'nano', 'less', 'dd',
            'crontab', 'cinnamon', 'apt', 'apt-get', 'aptitude', 'apturl', 'dpkg'
        ],
        packageManagers: ['apt', 'apt-get', 'aptitude', 'apturl', 'dpkg']
    };
})();
