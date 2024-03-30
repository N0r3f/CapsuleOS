// Fonction pour mettre à jour l'heure et la date
function updateDateTime() {
    var date = new Date();
    var dateTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' \u00a0 ' +
    date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'numeric', day: 'numeric' });
    document.getElementById('heure-date').innerHTML = dateTime;
}

// Mettre à jour l'heure et la date toutes les secondes
setInterval(updateDateTime, 1000);