(function (global) {
    'use strict';
    global.CapsuleEngineAdapter = {
        id: 'webkit',
        label: 'WebKit (Safari)',
        prefixOrder: ['-webkit-', ''],
        preferEmbedOnFileProtocol: true
    };
}(typeof window !== 'undefined' ? window : globalThis));
