/**
 * @deprecated Charger shells/common/capsule-window-context.js (alias CapsuleLinuxWindowContext conservé).
 */
'use strict';
(function loadLinuxWindowContextShim() {
    if (typeof CapsuleWindowContext !== 'undefined') {
        return;
    }
    console.warn('CapsuleOS: charger shells/common/capsule-window-context.js avant linux-window-context.js');
}());
