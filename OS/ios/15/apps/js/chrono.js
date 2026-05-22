
let secondes = 0, minutes = 0;
const chronometre = document.getElementById('chrono');

function incrementerTemps() {
    secondes++;
    if (secondes === 60) {
        secondes = 0;
        minutes++;
    }
    miseAJourAffichage();
}

function miseAJourAffichage() {
    const mm = minutes.toString().padStart(2, '0');
    const ss = secondes.toString().padStart(2, '0');
    chronometre.textContent = `${mm}:${ss}`;
}

incrementerTemps(); // Démarrage automatique du chronomètre
setInterval(incrementerTemps, 1000); // Mettre à jour toutes les secondes
