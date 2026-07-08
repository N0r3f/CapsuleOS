/**
 * Active la skin « classic95 » dans les pages iframe (Windows 9x / classic).
 */
'use strict';
(function () {
    const params = new URLSearchParams(window.location.search);
    let useClassic = params.get('skin') === 'classic95';

    function parentUsesClassicSkin() {
        try {
            const parentBody = window.parent && window.parent.document && window.parent.document.body;
            if (!parentBody) {
                return false;
            }
            const shell = parentBody.getAttribute('data-win-shell') || '';
            if (shell.indexOf('classic') !== -1) {
                return true;
            }
            const version = parentBody.getAttribute('data-win-version') || '';
            return version === '95' || version === '98' || version === 'me' || version === '2000';
        } catch (err) {
            return false;
        }
    }

    if (!useClassic) {
        useClassic = parentUsesClassicSkin();
    }

    if (!useClassic) {
        return;
    }

    document.documentElement.classList.add('win95-page');

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../apps/style/pages.classic95.css';
    document.head.appendChild(link);
})();
