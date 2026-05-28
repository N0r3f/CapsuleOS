/**
 * Lancement d’apps Pop!_OS - partagé launcher / Applications.
 */
(function (global) {
    function open(link) {
        if (!link) {
            return false;
        }
        var target = document.querySelector('.windowElement[data-link="' + link + '"]');
        if (target && typeof global.openWindowByDataLink === 'function') {
            global.openWindowByDataLink(link);
            return true;
        }
        if (target && typeof global.openWindow === 'function') {
            global.openWindow(link);
            return true;
        }
        var dockLink = document.querySelector('.cosmic-dock__item[data-link="' + link + '"]');
        if (dockLink) {
            dockLink.click();
            return true;
        }
        return false;
    }

    global.CosmicAppLaunch = { open: open };
})(typeof window !== 'undefined' ? window : this);
