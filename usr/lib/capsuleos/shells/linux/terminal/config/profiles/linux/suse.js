(function initLinuxSuseTerminalProfile() {
    'use strict';

    const builder = window.CapsuleTerminalProfileBuilder;
    if (!builder || typeof builder.registerLinuxFamily !== 'function') {
        console.warn('CapsuleOS: charger command-core.js et terminal-profile-builder.js avant suse.js');
        return;
    }
    builder.registerLinuxFamily('suse', {
        displayName: 'Linux openSUSE-like',
        familyCommands: ['zypper', 'rpm'],
        packageManagers: ['zypper', 'rpm'],
    });
})();
