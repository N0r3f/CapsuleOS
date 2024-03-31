document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('a[target="lien"]');
    const windowContainer = document.getElementById('windowContainer');
    const mainElement = document.querySelector('main');

    let zIndex = 5;
    let openWindows = [];
    let offset = 0; // Initialise le décalage pour les nouvelles fenêtres

    images.forEach(img => {
        img.addEventListener('click', function (event) {
            event.preventDefault();

            // Vérifie si aucune fenêtre n'est ouverte
            if (openWindows.length === 0) {
                // Réinitialise l'offset pour positionner la première fenêtre au milieu de l'écran
                // (Ajustez cette valeur en fonction de la taille de votre fenêtre et de l'écran)
                offset = (window.innerWidth - windowContainer.offsetHeight) / 16;
                offset = (window.innerHeight - windowContainer.offsetHeight) / 16;
            }

            // Supprime les éléments <section> existants dans le <main>
            const sections = mainElement.querySelectorAll('section');
            sections.forEach(section => section.remove());

            // Vérifie si une fenêtre pour cet <a> est déjà ouverte
            const existingWindow = openWindows.find(win => win.querySelector('#windowIframe').src === this.href);
            if (existingWindow) {
                existingWindow.style.display = 'block';
                return;
            }

            // Crée une nouvelle fenêtre pour chaque clic
            const newWindow = windowContainer.cloneNode(true);
            newWindow.style.zIndex = ++zIndex;
            newWindow.style.top = `${offset}px`; // Applique le décalage en haut
            mainElement.appendChild(newWindow);

            newWindow.querySelector('#windowIframe').src = this.href;

            const windowTitle = newWindow.querySelector('#windowTitle');
            windowTitle.textContent = this.title;

            newWindow.style.display = 'block';

            this.style.borderBottom = '1px solid white';

            openWindows.push(newWindow);

            offset += 30; // Incrémente le décalage pour les prochaines fenêtres

            makeDraggable(newWindow);
        });
    });

    // Gestion des boutons de rétricissement et de fermeture pour toutes les fenêtres
    document.addEventListener('click', function (event) {
        if (event.target.matches('#minimizeBtn') || event.target.matches('#closeBtn')) {
            const window = event.target.closest('#windowContainer');
            window.style.display = 'none';

            images.forEach(img => {
                img.style.borderBottom = '';

                openWindows = openWindows.filter(win => win !== window);
            });
        }

        if (event.target.matches('#resizeBtn')) {
            const window = event.target.closest('#windowContainer');
            if (window.style.width === '100%' && window.style.height === '100%') {
                window.style.width = '';
                window.style.height = '';
                window.style.position = '';
                window.style.top = '';
                window.style.left = '';
            } else {
                window.style.width = '100%';
                window.style.height = '100%';
                window.style.position = 'relative';
                window.style.top = '0';
                window.style.left = '0';
            }
        }
    });
});
