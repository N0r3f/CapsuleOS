(function initThemeAtBoot() {
    const saved = localStorage.getItem('mint-theme');
    const theme = saved === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
})();

function initThemesApp() {
    const root = document.querySelector('#themes #themesApp');
    if (!root || root.dataset.initialized === 'true') {
        return;
    }

    const options = root.querySelectorAll('[data-theme-option]');
    const help = root.querySelector('[data-themes-help]');

    if (!options.length || !help) {
        return;
    }

    function applyTheme(theme) {
        const resolved = theme === 'light' ? 'light' : 'dark';
        document.documentElement.dataset.theme = resolved;
        localStorage.setItem('mint-theme', resolved);

        options.forEach(function syncOption(button) {
            const isActive = button.getAttribute('data-theme-option') === resolved;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });

        help.textContent = resolved === 'light'
            ? 'Le theme clair est actif.'
            : 'Le theme sombre est actif.';
    }

    options.forEach(function bindOption(button) {
        button.addEventListener('click', function onOptionClick() {
            applyTheme(button.getAttribute('data-theme-option'));
            if (typeof dispatchCapsuleTask === 'function') {
                dispatchCapsuleTask('change-theme');
            }
        });
    });

    applyTheme(document.documentElement.dataset.theme || 'dark');
    root.dataset.initialized = 'true';
}
