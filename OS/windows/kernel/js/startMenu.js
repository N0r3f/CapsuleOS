/**
 * Menu Démarrer — toggle visibilité #menu.
 */
'use strict';
(function () {
    const menuTrigger = document.querySelector('footer menu .taskbar-start, footer menu i.taskbar-start');
    const display = document.getElementById('menu');

    if (!menuTrigger || !display) {
        return;
    }

    const menuActive = function () {
        display.classList.toggle('visible');
    };

    document.body.addEventListener('click', function (event) {
        if (event.target !== menuTrigger && !display.contains(event.target)) {
            display.classList.remove('visible');
        }
    });

    menuTrigger.addEventListener('click', menuActive);
})();
