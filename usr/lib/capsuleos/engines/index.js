/**
 * Dispatch moteur navigateur — charge l'adaptateur selon CapsuleBrowserCapabilities.engine.
 */
(function (global) {
    'use strict';

    const ENGINE_MODULES = {
        'chromium-blink': './chromium-blink.js',
        gecko: './gecko.js',
        webkit: './webkit.js',
        trident: './legacy-mshtml.js',
        edgehtml: './legacy-mshtml.js',
        unknown: './chromium-blink.js'
    };

    function resolveEngineModule(engine) {
        return ENGINE_MODULES[engine] || ENGINE_MODULES.unknown;
    }

    global.CapsuleEngineRegistry = {
        resolveEngineModule,
        ENGINE_MODULES
    };
}(typeof window !== 'undefined' ? window : globalThis));
