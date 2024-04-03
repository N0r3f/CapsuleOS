document.addEventListener('DOMContentLoaded', function () {
    // Sélectionne le footer pour la délégation d'événements
    const footer = document.querySelector('footer');

    // Fonction pour basculer la visibilité des éléments du main
    function toggleVisibility(event) {
        // Vérifie si l'élément cliqué est un lien avec data-link
        if (event.target.matches('a[data-link]')) {
            event.preventDefault(); // Empêche le comportement par défaut du lien

            // Passer tous les éléments à display: none;
            document.querySelectorAll('main > .windowElement').forEach(element => {
                element.style.display = 'none';
            });

            // Trouver l'élément correspondant au data-link et le passer à display: block;
            const targetElement = document.querySelector(`#${event.target.dataset.link}`);
            if (targetElement) {
                targetElement.style.display = 'block';
            }
        }
    }

    // Ajouter un écouteur d'événements de clic sur le footer pour la délégation
    footer.addEventListener('click', toggleVisibility);
});
