/**
 * Applique le fond d'écran utilisateur si présent sous
 * ../../../../usr/share/capsuleos/assets/images/toolkits/windows/ (wallpaper.*, fond.jpg).
 * Sinon conserve le dégradé / couleur de shell.css.
 */
'use strict';
(function () {
    const main = document.querySelector('main');
    if (!main) {
        return;
    }

    const candidates = [
        '../../../../usr/share/capsuleos/assets/images/toolkits/windows/wallpaper.jpg',
        '../../../../usr/share/capsuleos/assets/images/toolkits/windows/wallpaper.webp',
        '../../../../usr/share/capsuleos/assets/images/toolkits/windows/wallpaper.png',
        '../../../../usr/share/capsuleos/assets/images/toolkits/windows/fond.jpg'
    ];

    function tryNext(index) {
        if (index >= candidates.length) {
            return;
        }
        const url = candidates[index];
        const probe = new Image();
        probe.onload = function () {
            main.style.backgroundImage = `url("${url}")`;
            main.style.backgroundSize = 'cover';
            main.style.backgroundPosition = 'center';
            main.style.backgroundRepeat = 'no-repeat';
        };
        probe.onerror = function () {
            tryNext(index + 1);
        };
        probe.src = url;
    }

    tryNext(0);
})();
