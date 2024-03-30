document.addEventListener('DOMContentLoaded', function () {
    const mainElement = document.querySelector('main');
    const images = document.querySelectorAll('footer menu a');
    const windowContainer = document.getElementById('windowContainer');
    const windowIframe = document.getElementById('windowIframe');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const closeBtn = document.getElementById('closeBtn');

    let zIndex = 5; // Valeur de base pour la première fenêtre
    let openWindows = []; // Tableau pour suivre les fenêtres ouvertes

    images.forEach(img => {
        img.addEventListener('click', function (event) {
            event.preventDefault();

            // Vérifie si une fenêtre pour cet <a> est déjà ouverte
            const existingWindow = openWindows.find(win => win.querySelector('#windowIframe').src === this.href);
            if (existingWindow) {
                // Si ouverte, réaffiche la fenêtre et ne fait rien d'autre
                existingWindow.style.display = 'block';
                return;
            }

            // Crée une nouvelle fenêtre pour chaque clic
            const newWindow = windowContainer.cloneNode(true);
            newWindow.style.zIndex = ++zIndex; // Incrémente le z-index pour chaque nouvelle fenêtre
            mainElement.appendChild(newWindow); // Ajoute la nouvelle fenêtre à <main>

            // Définit la source de l'iframe avec l'URL du lien
            newWindow.querySelector('#windowIframe').src = this.href;

            // Récupère le titre de l'élément <a> et l'affiche dans le #windowHeader
            const windowTitle = newWindow.querySelector('#windowTitle');
            windowTitle.textContent = this.title;

            // Affiche la nouvelle fenêtre
            newWindow.style.display = 'block';

            // Ajoute un border-bottom à l'élément <a>
            this.style.borderBottom = '1px solid white';

            // Ajoute la fenêtre ouverte au tableau de suivi
            openWindows.push(newWindow);

            // Rendre la newWindow draggable et gérer les événements de drag and drop
            makeDraggable(newWindow);
        });
    });

    // Gestion des boutons de rétricissement et de fermeture pour toutes les fenêtres
    document.addEventListener('click', function (event) {
        if (event.target.matches('#minimizeBtn') || event.target.matches('#closeBtn')) {
            const window = event.target.closest('#windowContainer');
            window.style.display = 'none';

            // Supprime le border-bottom de tous les éléments <a>
            images.forEach(img => {
                img.style.borderBottom = '';

                // Supprime la fenêtre du tableau de suivi
                openWindows = openWindows.filter(win => win !== window);
            });
        }

        // Gestionnaire d'événements pour le bouton de redimensionnement
        if (event.target.matches('#resizeBtn')) {
            const window = event.target.closest('#windowContainer');
            // Vérifie si la fenêtre est en plein écran
            if (window.style.width === '100%' && window.style.height === '100%') {
                // Reprend la dimension d'origine
                window.style.width = '';
                window.style.height = '';
                window.style.position = '';
                window.style.top = '';
                window.style.left = '';
            } else {
                // Ajuste la fenêtre pour qu'elle prenne 100% de la largeur et de la hauteur du <main>
                window.style.width = '100%';
                window.style.height = '100%';
                window.style.position = 'absolute';
                window.style.top = '0';
                window.style.left = '0';
            }
        }
    });
});