'use strict';
function updateWin95Clock() {
    const el = document.getElementById('heure-date');
    if (!el) {
        return;
    }
    el.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

updateWin95Clock();
setInterval(updateWin95Clock, 1000);
