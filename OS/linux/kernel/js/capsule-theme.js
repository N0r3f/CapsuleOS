/**
 * Application optionnelle de variables CSS depuis un objet ou localStorage.
 * Clés doivent commencer par "--". Aucune dépendance réseau (STRICT_CONTRACT §11).
 */
(function initCapsuleTheme() {
    const STORAGE_KEY = 'capsuleCssVars';

    function applyVars(vars) {
        if (!vars || typeof vars !== 'object') {
            return;
        }
        const root = document.documentElement;
        Object.keys(vars).forEach((key) => {
            if (key.indexOf('--') === 0 && typeof vars[key] === 'string') {
                root.style.setProperty(key, vars[key]);
            }
        });
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            applyVars(JSON.parse(raw));
        }
    } catch (e) {
        /* ignore parse / stockage indisponible */
    }

    window.applyCapsuleCssVars = applyVars;
    window.CAPSULE_THEME_STORAGE_KEY = STORAGE_KEY;
}());
