/**
 * Shim compat — Resizer défini par capsule-window.js.
 * Ce fichier existe pour conserver l’ordre de chargement historique.
 */
'use strict';
if (typeof Resizer === 'undefined') {
    console.warn('CapsuleOS: charger capsule-window.js avant resizeWindow.js');
}
