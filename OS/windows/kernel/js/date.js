'use strict';
function updateWindowsDateTime() {
    const el = document.getElementById('heure-date');
    if (!el) {
        return;
    }
    const date = new Date();
    el.textContent = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        + ' \u00a0 '
        + date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'numeric', day: 'numeric' });
}

updateWindowsDateTime();
setInterval(updateWindowsDateTime, 1000);
