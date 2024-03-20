const menu = document.querySelector('i img');
const display = document.getElementById('menu');

// Fonction pour activer le menu
const menuActive = () => {
    if (display.classList.contains('visible')) {
        display.classList.remove('visible');
    } else {
        display.classList.add('visible');
    }
}

// Fonction pour désactiver le menu lors d'un clic en dehors
document.body.addEventListener("click", function(event) {
    if (event.target !== menu && !display.contains(event.target)) {
        display.classList.remove('visible');
    }
});

// Ajout d'un écouteur d'événements pour activer/désactiver le menu
menu.addEventListener("click", menuActive);

