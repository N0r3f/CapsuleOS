'use strict';
document.addEventListener('DOMContentLoaded', function () {
    const mainElement = document.querySelector('main');
    const images = document.querySelectorAll('a[target="lien"]');
    const windowContainer = document.getElementById('windowContainer');
    let zIndex = 5;
    let openWindows = [];
    let topOffset = 0;
    let leftOffset = 0;

    images.forEach(img => {
        img.addEventListener('click', function (event) {
            event.preventDefault();

            if (openWindows.length === 0) {
                const winWidth = windowContainer.offsetWidth;
                const winHeight = windowContainer.offsetHeight;
                topOffset = Math.max(0, Math.floor((window.innerHeight - winHeight) / 2));
                leftOffset = Math.max(0, Math.floor((window.innerWidth - winWidth) / 2));
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
            newWindow.style.top = `${topOffset}px`;
            newWindow.style.left = `${leftOffset}px`;
            mainElement.appendChild(newWindow);

            newWindow.querySelector('#windowIframe').src = this.href;

            const windowTitle = newWindow.querySelector('#windowTitle');
            windowTitle.textContent = this.title;

            newWindow.style.display = 'block';

            this.style.borderBottom = '1px solid white';

            openWindows.push(newWindow);

            topOffset += 30;

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
                window.style.top = '-50px';
                window.style.left = '0';
            }
        }
    });
});
