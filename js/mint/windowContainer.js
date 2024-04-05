document.addEventListener('DOMContentLoaded', function () {
    // Sélectionne tous les liens avec target="windowElement"
    const links = document.querySelectorAll('a[target="windowElement"]');

    // Création de la div#windowHeader
    const windowHeader = document.createElement('div');
    const left = document.createElement('nav');
    const closeBtn = document.createElement('button');
    const minimizeBtn = document.createElement('button');
    const maximizeBtn = document.createElement('button');
    const title = document.createElement('span');
    const right = document.createElement('nav');

    // Ajout du contenu HTML pour la div#windowHeader
    windowHeader.id = 'windowHeader';
    windowHeader.style.minWidth = 'calc(var(--head) * 16)';

    closeBtn.id = 'closeBtn';
    minimizeBtn.id = 'minimizeBtn';
    maximizeBtn.id = 'resizeBtn';

    title.id = 'windowTitle';
    // Utilisez document.title pour obtenir le titre de la page par défaut
    title.textContent = document.title;

    windowHeader.appendChild(left);
    windowHeader.appendChild(title);
    windowHeader.appendChild(right);
    right.appendChild(closeBtn);
    right.appendChild(minimizeBtn);
    right.appendChild(maximizeBtn);
    
    function handleOpenwindow(link) {
        const container = document.querySelector(`div[data-link="${link.dataset.link}"]`);
        
        if (container) {
            if (container.style.display === "none") {
                container.style.display = "block";
                if (!container.querySelector('#windowHeader')) {
                    container.insertBefore(windowHeader.cloneNode(true), container.firstChild);
                }        
                link.classList.add('active-link');
                // Ajouter la classe active à l'élément de fenêtre
                container.classList.add('active');
                // Utiliser le data-link pour mettre à jour le windowTitle
                const windowTitle = container.querySelector('#windowTitle');
                if (windowTitle) {
                    windowTitle.textContent = link.dataset.link;
                }
                // Rendre la fenêtre déplacable
                makeDraggable(container);
                // Rendre la fenêtre redimensionnable
                makeResizable(container);
            } else {
                container.style.display = "none";
                // Retirer la classe active de l'élément de fenêtre
                container.classList.remove('active');
                container.classList.remove('windowElementActive');
            }
        }
    }

    // Lancer la fonction d'ouverture pour chaque lien
    links.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Empêche le comportement par défaut du lien
            handleOpenwindow(this); // Utilisez 'this' pour référencer l'élément de lien
        });
    });

    // Fonction pour rendre une fenêtre redimensionnable
    function makeResizable(element) {
        const resizer = new Resizer(element);
    }
});
