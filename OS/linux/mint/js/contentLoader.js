document.addEventListener('DOMContentLoaded', function() {
    // Sélection de toutes les divs avec un attribut data-link
    const divs = document.querySelectorAll('div[data-link]');

    divs.forEach(div => {
        const id = div.getAttribute('data-link');
        const htmlFile = `./pages/${id}.html`;
        const cssFile = `./style/pages/${id}.css`;

        // Chargement du contenu HTML
        fetch(htmlFile)
            .then(response => response.text())
            .then(html => {
                div.innerHTML = html;
            })
            .catch(error => console.error('Erreur lors du chargement du fichier HTML:', error));

        // Chargement de la feuille de style CSS
        fetch(cssFile)
            .then(response => response.text())
            .then(css => {
                const style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = css;
                document.head.appendChild(style);
            })
            .catch(error => console.error('Erreur lors du chargement du fichier CSS:', error));
    });
});
