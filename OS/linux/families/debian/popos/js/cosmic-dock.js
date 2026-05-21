/**
 * Dock Cosmic — état actif des épinglages.
 */
(function () {
    var dock = document.querySelector('.cosmic-dock');
    if (!dock) return;

    function setActive(link) {
        dock.querySelectorAll('.cosmic-dock__item[data-link]').forEach(function (el) {
            el.classList.toggle('cosmic-dock__item--active', el.getAttribute('data-link') === link);
        });
    }

    dock.querySelectorAll('.cosmic-dock__item[data-link]').forEach(function (item) {
        item.addEventListener('click', function () {
            var link = item.getAttribute('data-link');
            if (link) setActive(link);
        });
    });

    document.addEventListener('capsule-window-opened', function (e) {
        if (e.detail && e.detail.link) setActive(e.detail.link);
    });
})();
