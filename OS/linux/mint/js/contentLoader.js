const divs = document.querySelectorAll('div[data-link]');

divs.forEach(div => {
    const id = div.getAttribute('data-link');
    const htmlFile = `./apps/${id}.html`;
    const cssFile = `./apps/style/${id}.css`;

    Promise.all([
        fetch(htmlFile).then(response => response.text()),
        fetch(cssFile).then(response => response.text())
    ])
        .then(([html, css]) => {
            div.innerHTML = html;

            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            document.head.appendChild(style);

            if (id === 'nemo') {
                initNemoContainer();
            }
            if (id === 'terminal') {
                initTerminalWhenReady();
            }

            // Charge le contenu du "Dossier personnel" par défaut
            loadDirectory('./apps/system/Dossier personnel/');
        })

        .catch(error => console.error('Erreur lors du chargement des fichiers:', error));
});
