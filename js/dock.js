document.addEventListener('DOMContentLoaded', function () {
    // Sélectionner toutes les images dans le footer
    const images = document.querySelectorAll('footer a');

    // Ajouter un écouteur d'événements pour chaque image
    images.forEach(function (img) {
        img.addEventListener('mouseover', function () {
            // Trouver les images adjacentes
            const prevImg = img.previousElementSibling;
            const nextImg = img.nextElementSibling;

            // Ajouter la classe pour la mise à l'échelle
            if (prevImg) prevImg.classList.add('scale-effect');
            if (nextImg) nextImg.classList.add('scale-effect');
        });

        img.addEventListener('mouseout', function () {
            // Trouver les images adjacentes
            const prevImg = img.previousElementSibling;
            const nextImg = img.nextElementSibling;

            // Retirer la classe pour rétablir l'échelle
            if (prevImg) prevImg.classList.remove('scale-effect');
            if (nextImg) nextImg.classList.remove('scale-effect');
        });
    });
});
