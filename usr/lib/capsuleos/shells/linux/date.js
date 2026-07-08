'use strict';
document.addEventListener('DOMContentLoaded', function () {
    const clock = document.getElementById('taskbar-clock');
    const dateLabel = document.getElementById('taskbar-date');
    const legacy = document.getElementById('heure-date');

    function tick() {
        if (document.body && document.body.id === 'mint') {
            return;
        }
        const now = new Date();
        const isPopos = document.body && document.body.id === 'popos';
        const shortTime = now.toLocaleTimeString('fr-FR', isPopos
            ? { hour: '2-digit', minute: '2-digit', hour12: false }
            : { hour: '2-digit', minute: '2-digit' });

        if (clock) {
            clock.textContent = shortTime;
            clock.setAttribute('datetime', now.toISOString());
        }

        const shellDate = document.getElementById('rocky-clock-date')
            || document.getElementById('fedora-clock-date')
            || document.getElementById('popos-clock-date');
        if (shellDate) {
            shellDate.textContent = now.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
            });
        }

        if (dateLabel) {
            dateLabel.textContent = now.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        if (legacy) {
            legacy.innerHTML = now.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) + ' \u00a0 ' + shortTime;
        }
    }

    tick();
    setInterval(tick, 1000);
});