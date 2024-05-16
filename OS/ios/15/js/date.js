document.addEventListener('DOMContentLoaded', function () {
// Fonction pour mettre à jour l'heure et la date
function updateDateTime() {
    var date = new Date();
    var dateTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('heure').innerHTML = dateTime;
}

// Mettre à jour l'heure et la date toutes les secondes
setInterval(updateDateTime, 1000);
});