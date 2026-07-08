(function (global) {
    'use strict';
    global.CapsuleEngineAdapter = {
        id: 'legacy-mshtml',
        label: 'Trident / EdgeHTML (non supporté)',
        supported: false,
        message: 'CapsuleOS requiert un navigateur moderne (ES6). Trident et EdgeHTML ne sont pas supportés.'
    };
}(typeof window !== 'undefined' ? window : globalThis));
