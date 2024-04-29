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
                if (link.textContent.includes('~') || link.textContent.includes('..') || link.textContent.includes('Dossier_personnel')) {
                    return; // Ignore les liens qui permettent de remonter dans le système de fichiers
                }

                // Récupération du nom de l'élément
                let name = link.textContent.replace(/\.[^/.]+$/, '').replace(/(?<=\D)(?=\d)|(?<=\d)(?=\D)/g, ' ').split(' ')[0].replace(/[~]+/g, 'Home').replace(/ /g, '\n');

                // Ajout des détails comme attribut data-details
                const details = link.textContent.replace(/[^0-9\,\:\/]/g, "").replace(/(\d{2}\/\d{2}\/\d{4})(\d{2}:\d{2}:\d{2})/g, '$1 $2').replace(/ /g, '\n');

                // Récupération du chemin de l'image correspondant
                let imagePath = fileSystemLink.files[name]?.image; // Utilisez 'let' au lieu de 'const'
                
                // Bloc logique de détection d'extension de fichier et d'application d'icône
                const extension = link.href.match(/\.([^.]+)$/)[1]; // Extrait l'extension du fichier

                switch (extension) {
                    // Logique pour les types de Documents écrits
                    case 'pdf':
                        imagePath = fileSystemLink.files.pdf.image;
                        break;
                    case 'doc':
                        imagePath = fileSystemLink.files.doc.image;
                        break;
                    case 'txt':
                        imagePath = fileSystemLink.files.txt.image;
                        break;
                    case 'sh':
                        imagePath = fileSystemLink.files.sh.image;
                        break;
                    case 'html':
                        imagePath = fileSystemLink.files.html.image;
                        break;
                    case 'css':
                        imagePath = fileSystemLink.files.css.image;
                        break;
                    case 'js':
                        imagePath = fileSystemLink.files.js.image;
                        break;
                    // Logique pour les types de Documents audio
                    case 'ogg':
                        imagePath = fileSystemLink.files.ogg.image;
                        break;
                    case 'mp3':
                        imagePath = fileSystemLink.files.mp3.image;
                        break;
                    case 'wav':
                        imagePath = fileSystemLink.files.wav.image;
                        break;
                    // Logique pour les types de Documents video
                    case 'mp4':
                        imagePath = fileSystemLink.files.mp4.image;
                        break;
                    case 'avi':
                        imagePath = fileSystemLink.files.avi.image;
                        break;
                    // Logique pour les types de Documents photo
                    case 'jpeg':
                        imagePath = fileSystemLink.files.jpeg.image;
                        break;
                    case 'jpg':
                        imagePath = fileSystemLink.files.jpg.image;
                        break;
                    case 'png':
                        imagePath = fileSystemLink.files.png.image;
                        break;
                    case 'webp':
                        imagePath = fileSystemLink.files.webp.image;
                        break;
                    default:
                    // Logique par défaut pour les autres types de fichiers
                }
                // Vérifiez si le lien pointe vers un répertoire dans "Dossier_personnel"
                if (!link.href.includes('Dossier_personnel')) {
                    return; // Ignore les liens qui ne pointent pas vers "Dossier_personnel"
                }

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
