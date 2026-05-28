/**
 * openSUSE Tumbleweed - thème Plasma clair unique (réf. desk.png).
 */
(function lockOpensuseLightTheme() {
    if (!document.body || document.body.id !== 'opensuse') {
        return;
    }

    function enforceLightTheme() {
        document.documentElement.dataset.theme = 'light';
        try {
            localStorage.setItem('mint-theme', 'light');
        } catch (err) {
            /* file:// ou quota */
        }
    }

    enforceLightTheme();

    document.addEventListener('DOMContentLoaded', enforceLightTheme);

    if (typeof window.MutationObserver === 'function') {
        var observer = new MutationObserver(function onThemeMutation() {
            if (document.documentElement.dataset.theme !== 'light') {
                enforceLightTheme();
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
})();
