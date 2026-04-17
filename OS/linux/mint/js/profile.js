function initProfileApp() {
    const root = document.querySelector('#profile #profileApp');
    if (!root || root.dataset.initialized === 'true') {
        return;
    }
    if (typeof DISTRO_PROFILE === 'undefined') {
        return;
    }

    const p = DISTRO_PROFILE;

    document.getElementById('profile-name').textContent = p.name;
    document.getElementById('profile-version').textContent = p.version;
    document.getElementById('profile-tagline').textContent = p.tagline;
    document.getElementById('profile-description').textContent = p.description;

    const urlEl = document.getElementById('profile-url');
    urlEl.href = p.url;
    urlEl.textContent = 'Découvrir ' + p.name + ' ↗';

    const MAX_STARS = 5;
    root.querySelectorAll('[data-stat]').forEach(function renderStat(el) {
        const key = el.getAttribute('data-stat');
        const val = p.stats[key] || 0;
        el.textContent = '★'.repeat(val) + '☆'.repeat(MAX_STARS - val);
        el.setAttribute('aria-label', val + ' étoiles sur ' + MAX_STARS);
    });

    const highlightsList = document.getElementById('profile-highlights');
    highlightsList.innerHTML = '';
    (p.highlights || []).forEach(function renderHighlight(item) {
        const li = document.createElement('li');
        li.className = 'profile-highlight';
        li.innerHTML =
            '<span class="profile-highlight__icon" aria-hidden="true">' + item.icon + '</span>' +
            '<span>' + item.text + '</span>';
        highlightsList.appendChild(li);
    });

    root.dataset.initialized = 'true';
}
