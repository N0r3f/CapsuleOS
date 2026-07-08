(function initLinuxRedHatTerminalProfile() {
    'use strict';

    const builder = window.CapsuleTerminalProfileBuilder;
    if (!builder || typeof builder.registerLinuxFamily !== 'function') {
        console.warn('CapsuleOS: charger command-core.js et terminal-profile-builder.js avant redhat.js');
        return;
    }
    builder.registerLinuxFamily('redhat', {
        displayName: 'Linux Red Hat-like',
        familyCommands: ['dnf', 'yum', 'rpm'],
        packageManagers: ['dnf', 'yum', 'rpm'],
    });
})();
