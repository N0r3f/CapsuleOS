document.addEventListener('DOMContentLoaded', function() {
    const loadDirectory = (directory) => {
        fetch(directory)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const links = doc.querySelectorAll('a');
                const nemoElement = document.querySelector('.nemoElement');
                nemoElement.innerHTML = ''; // Vide le contenu actuel
                links.forEach(link => {
                    const newLink = document.createElement('a');
                    newLink.href = link.href;
                    newLink.textContent = link.textContent;
                    newLink.addEventListener('click', (event) => {
                        event.preventDefault(); // Empêche le comportement par défaut du lien
                        loadDirectory(newLink.href); // Charge le nouveau répertoire
                    });
                    nemoElement.appendChild(newLink);
                });
            })
            .catch(error => console.error('Erreur lors de la récupération des fichiers:', error));
    };

    // Charge le contenu du "Dossier personnel" par défaut
    loadDirectory('./system/Dossier personnel');
});
