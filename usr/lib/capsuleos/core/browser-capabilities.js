/**
 * CapsuleBrowserCapabilities — détection moteur et capacités runtime.
 * Moteurs : Chromium/Blink, Gecko, WebKit ; Trident/EdgeHTML hors périmètre ES6.
 */
(function (global) {
    'use strict';

    function detectEngine() {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        if (/Edg\//.test(ua)) {
            return 'chromium-blink';
        }
        if (/Firefox\//.test(ua) && !/Seamonkey/.test(ua)) {
            return 'gecko';
        }
        if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) {
            return 'chromium-blink';
        }
        if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
            return 'webkit';
        }
        if (/Trident\//.test(ua) || /MSIE /.test(ua)) {
            return 'trident';
        }
        if (/Edge\//.test(ua)) {
            return 'edgehtml';
        }
        return 'unknown';
    }

    function probe(name) {
        switch (name) {
            case 'clipboard':
                return !!(navigator && navigator.clipboard && navigator.clipboard.writeText);
            case 'serviceWorker':
                return 'serviceWorker' in navigator;
            case 'customEvent':
                return typeof CustomEvent === 'function';
            case 'maskImage':
                return typeof CSS !== 'undefined' && CSS.supports && (
                    CSS.supports('mask-image', 'linear-gradient(black, transparent)')
                    || CSS.supports('-webkit-mask-image', 'linear-gradient(black, transparent)')
                );
            case 'backdropFilter':
                return typeof CSS !== 'undefined' && CSS.supports && (
                    CSS.supports('backdrop-filter', 'blur(2px)')
                    || CSS.supports('-webkit-backdrop-filter', 'blur(2px)')
                );
            case 'fileProtocolEmbed':
                return typeof location !== 'undefined' && location.protocol === 'file:';
            default:
                return false;
        }
    }

    const engine = detectEngine();
    const legacy = engine === 'trident' || engine === 'edgehtml';
    const supported = !legacy && engine !== 'unknown';

    const capabilities = {
        clipboard: probe('clipboard'),
        serviceWorker: probe('serviceWorker'),
        customEvent: probe('customEvent'),
        maskImage: probe('maskImage'),
        backdropFilter: probe('backdropFilter'),
        fileProtocolEmbed: probe('fileProtocolEmbed')
    };

    const CapsuleBrowserCapabilities = {
        engine,
        legacy,
        supported,
        capabilities,
        probe,
        meets(min) {
            if (!min || typeof min !== 'object') {
                return true;
            }
            return Object.keys(min).every((k) => min[k] !== true || capabilities[k] === true);
        },
        warnIfLegacy() {
            if (legacy && typeof console !== 'undefined') {
                console.warn('[CapsuleOS] Moteur legacy (Trident/EdgeHTML) hors périmètre ES6.');
            }
        }
    };

    global.CapsuleBrowserCapabilities = CapsuleBrowserCapabilities;
    CapsuleBrowserCapabilities.warnIfLegacy();
}(typeof window !== 'undefined' ? window : globalThis));
