(function (global) {
    'use strict';
    global.CapsuleEngineAdapter = {
        id: 'chromium-blink',
        label: 'Chromium / Blink',
        prefixOrder: ['-webkit-', ''],
        preferEmbedOnFileProtocol: true
    };
}(typeof window !== 'undefined' ? window : globalThis));
