/**
 * Shim compat — délègue à CapsuleWindow (capsule-window.js).
 * @param {HTMLElement} element
 * @param {{ requireHeader?: boolean }} [options]
 */
'use strict';
const makeDraggable = (element, options = {}) => {
    if (typeof CapsuleWindow !== 'undefined' && CapsuleWindow.enableDrag) {
        CapsuleWindow.enableDrag(element, options);
        return;
    }
    console.warn('CapsuleOS: charger capsule-window.js avant window-drag.js');
};
