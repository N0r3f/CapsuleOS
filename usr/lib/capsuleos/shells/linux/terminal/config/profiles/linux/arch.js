(function initLinuxArchTerminalProfile() {
    'use strict';

    const builder = window.CapsuleTerminalProfileBuilder;
    if (!builder || typeof builder.registerLinuxFamily !== 'function') {
        console.warn('CapsuleOS: charger command-core.js et terminal-profile-builder.js avant arch.js');
        return;
    }
    builder.registerLinuxFamily('arch', {
        displayName: 'Linux Arch',
        familyCommands: ['pacman'],
        packageManagers: ['pacman'],
    });
})();
