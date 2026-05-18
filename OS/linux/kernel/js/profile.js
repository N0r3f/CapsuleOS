function initProfileApp() {
    const root = document.querySelector('#profile #profileApp');
    if (!root || root.dataset.initialized === 'true') {
        return;
    }

    const p = (typeof window !== 'undefined' && window.CAPSULE_DISTRO_PROFILE)
        || (typeof DISTRO_PROFILE !== 'undefined' ? DISTRO_PROFILE : null);

    if (!p) {
        return;
    }

    const logoEl = root.querySelector('.profile-app__logo');
    if (logoEl && p.logo) {
        logoEl.src = p.logo;
        logoEl.alt = p.logoAlt || ('Logo ' + p.name);
    }

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
