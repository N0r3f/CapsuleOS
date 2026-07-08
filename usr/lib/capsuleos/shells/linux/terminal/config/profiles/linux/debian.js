(function initLinuxDebianTerminalProfile() {
    'use strict';

    const builder = window.CapsuleTerminalProfileBuilder;
    if (!builder || typeof builder.registerLinuxFamily !== 'function') {
        console.warn('CapsuleOS: charger command-core.js et terminal-profile-builder.js avant debian.js');
        return;
    }
    builder.registerLinuxFamily('debian', {
        displayName: 'Linux Debian-like',
        familyCommands: ['apt', 'apt-get', 'aptitude', 'apturl', 'dpkg'],
        packageManagers: ['apt', 'apt-get', 'aptitude', 'apturl', 'dpkg'],
    });
})();
