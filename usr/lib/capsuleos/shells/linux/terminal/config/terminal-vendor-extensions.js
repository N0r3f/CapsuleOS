/**
 * Singularités vendor — commandes hors famille paquets (DE, outils distro-spécifiques).
 * Contrat : etc/capsuleos/contracts/terminal-commands.json → layers.vendorExtensions
 */
(function initTerminalVendorExtensions(global) {
    'use strict';

    const builder = global.CapsuleTerminalProfileBuilder;
    if (!builder || typeof builder.registerVendorCommands !== 'function') {
        console.warn('CapsuleOS: charger terminal-profile-builder.js avant terminal-vendor-extensions.js');
        return;
    }

    builder.registerVendorCommands('mint', ['cinnamon']);
}(typeof window !== 'undefined' ? window : globalThis));
