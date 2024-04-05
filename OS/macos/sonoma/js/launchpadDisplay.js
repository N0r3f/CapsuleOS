document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelectorAll(`div[data-link="${link.dataset.link}"]`);
    // Sélectionne le footer pour la délégation d'événements
    

    const footer = document.querySelector('footer');

    const padContainer = document.querySelector('.padContainer');
    const padSearchBar = document.querySelector('.search');
    const padFooter = document.querySelector('.launchPadFoot');
    const padIcons = padContainer.querySelectorAll('a');

    var isDisplayed = Boolean(false);

    // Fonction pour basculer la visibilité des éléments du main
    function toggleVisibility(event) {
        // Vérifie si l'élément cliqué est un lien avec data-link
        if (event.target.matches('a[data-link]')) {
            event.preventDefault(); // Empêche le comportement par défaut du lien

            // Passer tous les éléments à display: none;
            document.querySelectorAll('.windowElement').forEach(elements => {
                elements.style.display = 'none';
            });

            // Trouver l'élément correspondant au data-link et le passer à display: block;
            const targetElement = document.querySelector(`div[data-link="launchpad"]`);
            if (targetElement) {
                targetElement.style.display = 'block';
                windowElements.style.display = 'none';
            }

            if(padContainer.style.display != 'none')
            {
                isDisplayed = true;
            }
            if(isDisplayed == false)
            {
                padContainer.style.display = 'none',
                padSearchBar.style.display = 'none',
                padFooter.style.display = 'none'
                
            }
        }
    }

    // Ajouter un écouteur d'événements de clic sur le footer pour la délégation
    footer.addEventListener('click', toggleVisibility);

    padIcons.forEach(padIcon => {
        padIcon.addEventListener('click', e => 
        console.log(isDisplayed))});
});
