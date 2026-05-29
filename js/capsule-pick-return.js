(function (global) {
    'use strict';

    const VALID_PICK_KEYS = new Set(['linux', 'windows', 'macos', 'bsd', 'ios', 'android']);

    const resolvePickKey = (pickKey) => {
        if (pickKey && VALID_PICK_KEYS.has(pickKey)) return pickKey;
        if (global.CAPSULE_PICK_OS && VALID_PICK_KEYS.has(global.CAPSULE_PICK_OS)) {
            return global.CAPSULE_PICK_OS;
        }
        return null;
    };

    const getSiteHomeBase = (homeHref) => {
        const href = homeHref || global.CAPSULE_SITE_HOME || './index.html';
        return String(href).split('#')[0].split('?')[0];
    };

    const buildHomePickUrl = (homeHref, pickKey) => {
        const base = getSiteHomeBase(homeHref);
        const key = resolvePickKey(pickKey);
        if (!key) return `${base}#choisir-os`;
        return `${base}?pick=${encodeURIComponent(key)}#choisir-os`;
    };

    const redirectToPickHome = (pickKey, homeHref) => {
        global.location.href = buildHomePickUrl(homeHref, pickKey);
    };

    global.CapsulePickReturn = {
        buildHomePickUrl,
        redirectToPickHome
    };
})(typeof window !== 'undefined' ? window : globalThis);
