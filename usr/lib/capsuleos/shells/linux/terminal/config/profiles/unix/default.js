(function initUnixTerminalProfile() {
    'use strict';

    window.CAPSULE_TERMINAL_PROFILES = window.CAPSULE_TERMINAL_PROFILES || {};
    window.CAPSULE_TERMINAL_PROFILES['unix:default'] = {
        id: 'unix:default',
        osFamily: 'unix',
        distro: 'default',
        displayName: 'UNIX shell',
        commands: [
            'help', 'man', 'cd', 'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find',
            'touch', 'mkdir', 'mv', 'rm', 'rmdir', 'clear', 'history', 'whoami', 'uname',
            'exit', 'nano', 'vim', 'less'
        ]
    };
})();
