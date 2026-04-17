(function initThemeAtBoot() {
    const savedTheme = localStorage.getItem('mint-theme');
    const savedContrast = localStorage.getItem('mint-contrast-mode');
    const savedFontScale = localStorage.getItem('mint-font-scale');
    document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.contrastMode = savedContrast === 'high' ? 'high' : 'normal';
    document.documentElement.dataset.fontScale = ['110', '125'].includes(savedFontScale) ? savedFontScale : '100';
})();

function initThemesApp() {
    const root = document.querySelector('#themes #themesApp');
    if (!root) {
        return;
    }

    ensureExtendedThemeControls(root);

    if (root.dataset.initialized === 'true') {
        return;
    }

    const options = root.querySelectorAll('[data-theme-option]');
    const contrastOptions = root.querySelectorAll('[data-contrast-option]');
    const fontScaleOptions = root.querySelectorAll('[data-font-scale-option]');
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

    function applyContrast(mode) {
        const resolved = mode === 'high' ? 'high' : 'normal';
        document.documentElement.dataset.contrastMode = resolved;
        localStorage.setItem('mint-contrast-mode', resolved);

        contrastOptions.forEach(function syncContrast(button) {
            const isActive = button.getAttribute('data-contrast-option') === resolved;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }

    function applyFontScale(scale) {
        const resolved = ['110', '125'].includes(scale) ? scale : '100';
        document.documentElement.dataset.fontScale = resolved;
        localStorage.setItem('mint-font-scale', resolved);

        fontScaleOptions.forEach(function syncScale(button) {
            const isActive = button.getAttribute('data-font-scale-option') === resolved;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }

    options.forEach(function bindOption(button) {
        button.addEventListener('click', function onOptionClick() {
            applyTheme(button.getAttribute('data-theme-option'));
            if (typeof dispatchCapsuleTask === 'function') {
                dispatchCapsuleTask('change-theme');
            }
        });
    });

    contrastOptions.forEach(function bindContrast(button) {
        button.addEventListener('click', function onContrastClick() {
            applyContrast(button.getAttribute('data-contrast-option'));
        });
    });

    fontScaleOptions.forEach(function bindFontScale(button) {
        button.addEventListener('click', function onFontScaleClick() {
            applyFontScale(button.getAttribute('data-font-scale-option'));
        });
    });

    applyTheme(document.documentElement.dataset.theme || 'dark');
    applyContrast(document.documentElement.dataset.contrastMode || 'normal');
    applyFontScale(document.documentElement.dataset.fontScale || '100');
    root.dataset.initialized = 'true';
}

function hasExtendedThemeControls(root) {
    return !!root.querySelector('[data-contrast-option]')
        && !!root.querySelector('[data-font-scale-option]');
}

function ensureExtendedThemeControls(root) {
    if (hasExtendedThemeControls(root)) {
        return;
    }

    root.insertAdjacentHTML('beforeend', `
        <section class="themes-app__section">
            <h2 class="themes-app__label">Contraste</h2>
            <div class="themes-app__cards" role="radiogroup" aria-label="Mode contraste">
                <button type="button" class="themes-contrast-card" data-contrast-option="normal" role="radio" aria-checked="true">
                    <span class="themes-card__title">Standard</span>
                </button>
                <button type="button" class="themes-contrast-card" data-contrast-option="high" role="radio" aria-checked="false">
                    <span class="themes-card__title">Renforce</span>
                </button>
            </div>
        </section>

        <section class="themes-app__section">
            <h2 class="themes-app__label">Taille du texte</h2>
            <div class="themes-app__scale" role="radiogroup" aria-label="Taille du texte">
                <button type="button" class="themes-scale-button" data-font-scale-option="100" role="radio" aria-checked="true">100%</button>
                <button type="button" class="themes-scale-button" data-font-scale-option="110" role="radio" aria-checked="false">110%</button>
                <button type="button" class="themes-scale-button" data-font-scale-option="125" role="radio" aria-checked="false">125%</button>
            </div>
        </section>
    `);
}
