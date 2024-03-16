// Fonction pour mettre à jour l'heure et la date
function updateDateTime() {
    var date = new Date();
    var dateTime = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' +
        date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('heure-date').innerHTML = dateTime;
}

// Mettre à jour l'heure et la date toutes les secondes
setInterval(updateDateTime, 1000);