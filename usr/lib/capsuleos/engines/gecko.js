(function (global) {
    'use strict';
    global.CapsuleEngineAdapter = {
        id: 'gecko',
        label: 'Gecko (Firefox)',
        prefixOrder: ['', '-webkit-'],
        preferEmbedOnFileProtocol: true
    };
}(typeof window !== 'undefined' ? window : globalThis));
