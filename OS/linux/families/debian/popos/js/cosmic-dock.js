/**
 * Dock Cosmic - état actif des épinglages (fenêtre visible uniquement).
 */
(function () {
    var dock = document.querySelector('.cosmic-dock');
    if (!dock) return;

    function isWindowVisible(link) {
        var win = document.querySelector('.windowElement[data-link="' + link + '"]');
        return !!(win && win.style.display !== 'none');
    }

    function setActive(link) {
        dock.querySelectorAll('.cosmic-dock__item[data-link]').forEach(function (el) {
            el.classList.toggle('cosmic-dock__item--active', el.getAttribute('data-link') === link);
        });
    }

    function clearActive() {
        dock.querySelectorAll('.cosmic-dock__item--active').forEach(function (el) {
            el.classList.remove('cosmic-dock__item--active');
        });
    }

    function syncActiveForLink(link) {
        if (!link) return;
        if (isWindowVisible(link)) setActive(link);
        else clearActive();
    }

    dock.querySelectorAll('.cosmic-dock__item[data-link]').forEach(function (item) {
        item.addEventListener('click', function () {
            var link = item.getAttribute('data-link');
            if (!link) return;
            syncActiveForLink(link);
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.matches('#closeBtn')) return;
        var win = e.target.closest('.windowElement');
        if (!win || !win.dataset.link) return;
        clearActive();
    });

    document.addEventListener('capsule-window-opened', function (e) {
        if (e.detail && e.detail.link) setActive(e.detail.link);
    });
})();
