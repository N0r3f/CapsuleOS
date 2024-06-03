// Sélectionnez tous les éléments <a> qui contiennent des éléments <p> avec la classe.number
var anchorElements = document.querySelectorAll('a');

// Sélectionnez l'élément input
var inputField = document.querySelector('input[type="text"]');

// Parcourez chaque élément <a> et ajoutez un écouteur d'événements click
anchorElements.forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        // Empêchez l'action par défaut du lien (si nécessaire)
        e.preventDefault();

        // Trouvez le premier <p> enfant avec la classe.number à l'intérieur de l'élément <a> cliqué
        var numberParagraph = this.querySelector('.number');
        if (numberParagraph) { // Vérifie si un élément.number existe
            var numberText = numberParagraph.textContent; // Obtenez le texte de l'élément.number

            // Ajoutez le texte à l'élément input
            inputField.value += numberText;
        }
    });
});

document.querySelector('input[type="text"]').addEventListener('input', function() {
    if (this.value.length > 16) {
        this.value = this.value.substring(0, 16); // Tronque le texte à 16 caractères
    }
});



// Sélectionnez toutes les images dont l'attribut alt est "effacer"
var deleteImages = document.querySelectorAll('img[alt="Effacer"]');

// Sélectionnez l'élément input
var inputField = document.querySelector('input[type="text"]');

// Parcourez chaque image et ajoutez un écouteur d'événements click
deleteImages.forEach(function(image) {
    image.addEventListener('click', function(e) {
        // Empêchez l'action par défaut du lien (si nécessaire)
        e.preventDefault();

        // Retirez un caractère de l'élément input
        if (inputField.value.length > 0) {
            inputField.value = inputField.value.slice(0, -1);
        }
    });
});
