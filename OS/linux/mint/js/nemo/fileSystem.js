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
                // Filtrer ~ et ..
                // Récupération du nom de l'élément
                const name = link.textContent.replace(/\.[^/.]+$/, '').replace(/(?<=\D)(?=\d)|(?<=\d)(?=\D)/g, ' ').split(' ')[0].replace(/[..]+/g, 'Retour').replace(/[~]+/g, 'Home').replace(/ /g, '\n');

                // Ajout des détails comme attribut data-details
                const details = link.textContent.replace(/[^0-9\,\:\/]/g, "").replace(/(\d{2}\/\d{2}\/\d{4})(\d{2}:\d{2}:\d{2})/g, '$1 $2').replace(/ /g, '\n');
                
                // Récupération du chemin de l'image correspondant
                const imagePath = fileSystemLink.files[name]?.image;

                const linkFromJson = fileSystemLink.files[name]?.link;
                // Création de l'élément <a>
                const newLinkHref = document.createElement('a');
                // Définition de l'attribut href avec le lien récupéré
                newLinkHref.setAttribute('href', linkFromJson);

                const newLink = document.createElement('a');
                newLink.setAttribute('data-details', details);
                newLink.href = link.href;

                // Création de l'élément image et définition de son attribut src
                const img = document.createElement('img');
                img.src = imagePath; // Utilisation du chemin récupéré
                img.alt = name; // Ajout d'un texte alternatif pour l'accessibilité
                newLink.appendChild(img); // Ajout de l'image à l'élément <a>

                // Ajout du texte au lien
                newLink.appendChild(document.createTextNode(name));

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
loadDirectory('../../apps/system/Dossier personnel');