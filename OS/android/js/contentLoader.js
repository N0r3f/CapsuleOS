const divs = document.querySelectorAll('div[data-link]');

const shouldUseAndroidEmbed = (id) => {
    const embed = typeof window !== 'undefined' && window.CAPSULE_ANDROID_APP_EMBED;
    if (!embed || !embed[id]) {
        return false;
    }
    if (typeof window !== 'undefined' && window.CAPSULE_FORCE_APP_EMBED === true) {
        return true;
    }
    if (typeof location !== 'undefined' && location.protocol === 'file:') {
        return true;
    }
    return false;
};

const loadAndroidSlot = (id) => {
    const embed = typeof window !== 'undefined' && window.CAPSULE_ANDROID_APP_EMBED;
    if (shouldUseAndroidEmbed(id) && embed && embed[id]) {
        const { html, css } = embed[id];
        return Promise.resolve({ html, css });
    }

    const htmlFile = `./apps/${id}.html`;
    const cssFile = `./apps/style/${id}.css`;

    return Promise.all([
        fetch(htmlFile).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${htmlFile}`);
            }
            return response.text();
        }),
        fetch(cssFile).then((response) => (response.ok ? response.text() : ''))
    ]).then(([html, css]) => ({ html, css }));
};

divs.forEach((div) => {
    const id = div.getAttribute('data-link');

    loadAndroidSlot(id)
        .then(({ html, css }) => {
            div.innerHTML = html;

            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            document.head.appendChild(style);

            if (id === 'messages' && typeof window.initCapsuleAndroidMessages === 'function') {
                window.initCapsuleAndroidMessages();
            }
        })

        .catch((error) => {
            console.error('Erreur lors du chargement des fichiers:', error);
            div.innerHTML = '<section style="padding:12px;font-family:sans-serif;">Impossible de charger ce module.</section>';
        });
});
