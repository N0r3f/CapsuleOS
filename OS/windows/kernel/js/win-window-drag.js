/**
 * Shim Windows — délègue au noyau CapsuleWindow (requireHeader).
 */
'use strict';
const makeDraggable = (element) => {
    if (typeof CapsuleWindow !== 'undefined' && CapsuleWindow.enableDrag) {
        CapsuleWindow.enableDrag(element, { requireHeader: true });
        return;
    }
    console.warn('CapsuleOS: charger capsule-window.js avant win-window-drag.js');
};
