document.addEventListener('DOMContentLoaded', function () {
    const clock = document.getElementById('taskbar-clock');
    const dateLabel = document.getElementById('taskbar-date');
    const legacy = document.getElementById('heure-date');

    function tick() {
        const now = new Date();
        const shortTime = now.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (clock) {
            clock.textContent = shortTime;
            clock.setAttribute('datetime', now.toISOString());
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