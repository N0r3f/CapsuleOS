document.addEventListener('DOMContentLoaded', function () {
    // Sélectionne tous les liens avec target="windowElement"
    const links = document.querySelectorAll('a[target="xedElement"]');

    function handleOpenwindow(link) {
        const container = document.querySelector(`section[data-link="${link.dataset.link}"]`);
        
        if (container) {
            if (container.style.display === "none") {
                container.style.display = "flex";
            
                // Ajouter la classe active à l'élément de fenêtre
                container.classList.add('active');
            } else {
                container.style.display = "none";
                // Retirer la classe active de l'élément de fenêtre
                container.classList.remove('active');
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
});
