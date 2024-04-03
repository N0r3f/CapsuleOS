// Sélectionner les éléments
const padContainer = document.querySelector('.padContainer');
const pad1 = document.querySelector('.pad_1');
const pad2 = document.querySelector('.pad_2');

// Fonction pour ajuster la margin-left du padContainer
function adjustMarginLeft(event) {
 if (event.target.classList.contains('pad_1')) {
    padContainer.style.marginLeft = '0';
 } else if (event.target.classList.contains('pad_2')) {
    padContainer.style.marginLeft = '-100vw';
 }
}

// Ajouter des écouteurs d'événements
pad1.addEventListener('click', adjustMarginLeft);
pad2.addEventListener('click', adjustMarginLeft);


