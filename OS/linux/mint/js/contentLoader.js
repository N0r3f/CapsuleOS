const divs = document.querySelectorAll('div[data-link]');

divs.forEach(div => {
    const id = div.getAttribute('data-link');
    const htmlFile = `./apps/${id}.html`;
    const cssFile = `./apps/style/${id}.css`;

    Promise.all([
        fetch(htmlFile, { cache: 'no-store' }).then(response => response.text()),
        fetch(cssFile, { cache: 'no-store' }).then(response => response.text())
    ])
        .then(([html, css]) => {
            div.innerHTML = html;

            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            document.head.appendChild(style);

            if (id === 'nemo') {
                initNemoContainer();
                // Charge le contenu du "Dossier personnel" par défaut pour Nemo.
                if (typeof loadDirectory === 'function') {
                    loadDirectory('./apps/system/Dossier_personnel');
                }
            }
            if (id === 'terminal') {
                initTerminalWhenReady();
            }
            if (id === 'mainMenu') {
                if (typeof initMainMenu === 'function') initMainMenu();
            }

            if (id === 'firefox') {
                if (typeof initMintFirefoxBrowser === 'function') initMintFirefoxBrowser();
            }

            if (id === 'themes') {
                if (typeof initThemesApp === 'function') initThemesApp();
            }

            if (id === 'profile') {
                if (typeof initProfileApp === 'function') initProfileApp();
            }

            if (id === 'checklist') {
                if (typeof initChecklistApp === 'function') initChecklistApp();

                        if (id === 'librewriter') {
                            if (typeof initLibreWriter === 'function') initLibreWriter();
                        }
            }

            if (
                (id === 'visionneur_images' || id === 'visionneur_pdf' || id === 'lecteur_multimedia')
                && typeof renderMintViewer === 'function'
            ) {
                renderMintViewer(id);
            }
        })

        .catch(error => {
            console.error('Erreur lors du chargement des fichiers:', error);

            if (window.location.protocol === 'file:') {
                div.innerHTML = '<section style="padding:12px;font-family:sans-serif;">Chargement bloque en mode file://. Lance un serveur local (ex: python3 -m http.server) puis ouvre http://localhost:8000/OS/linux/mint/index.html</section>';
            }
        });
});
