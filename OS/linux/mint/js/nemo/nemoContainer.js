function initNemoContainer() {
    let nemoLinks;

    function initNemoWhenReady() {
        if (!nemoLinks) {
            nemoLinks = document.querySelectorAll('a[target="nemoElement"]');
        }

        if (nemoLinks.length > 0) {
            initNemo();
        } else {
            setTimeout(initNemoWhenReady, 100);
        }
    }

    function initNemo() {
        // Lancer la fonction d'ouverture pour chaque lien
        nemoLinks.forEach(link => {
            link.addEventListener("click", function (event) {
                event.preventDefault(); // Empêche le comportement par défaut du lien
                handleOpenwindow(this); // Utilisez 'this' pour référencer l'élément de lien
            });
        });
    }

    function handleOpenwindow(link) {
        const container = document.querySelector(`section[data-link="${link.dataset.link}"]`);

        if (container) {
            if (container.style.display === "none") {
                container.style.display = "flex";

                // Ajouter la classe active à l'élément de fenêtre
                container.classList.add('nemoActive');
            } else {
                container.style.display = "none";
                // Retirer la classe active de l'élément de fenêtre
                container.classList.remove('nemoActive');
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNemoWhenReady();
    });
}
