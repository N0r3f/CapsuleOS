window.onload = function () {
    var urlParams = new URLSearchParams(window.location.search);
    var numero = urlParams.get('numero'); // Récupère la valeur du paramètre 'numero'

    // Trouve l'élément contenant "LaCapsule" et remplace le texte par le numéro
    var elements = document.querySelectorAll('*'); // Sélectionne tous les éléments
    elements.forEach(function (element) {
        if (element.textContent === 'Appel') { // Vérifie si le contenu textuel de l'élément est exactement "Appel"
            element.textContent = numero; // Remplace le texte
        }
    });

    if (!numero) {
        console.error('Le numéro n\'a pas été trouvé dans l\'URL.');
    }
};    