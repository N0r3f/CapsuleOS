(function () {
    const catalog = {
        linux: {
            label: 'Linux',
            distros: [
                { name: 'Linux Mint (Cinnamon)', href: './OS/linux/families/debian/mint/index.html', icon: './OS/linux/families/debian/mint/assets/mint.webp' },
                { name: 'Ubuntu 25.10', href: './OS/linux/families/debian/ubuntu/index.html', icon: './OS/linux/families/debian/ubuntu/media/img/assets/ubuntu-logo.svg' },
                { name: 'Pop!_OS', href: './OS/linux/families/debian/popos/index.html', icon: './OS/linux/families/debian/popos/media/img/assets/pop-logo.png' },
                { name: 'MX Linux KDE', href: './OS/linux/families/debian/mx-kde/index.html', icon: './OS/linux/families/debian/mx-kde/media/img/assets/mx-logo.png' },
                { name: 'Debian KDE (Plasma)', href: './OS/linux/families/debian/debian-kde/index.html', icon: './OS/linux/families/debian/debian-kde/assets/debian-logo.svg' },
                { name: 'openSUSE Tumbleweed', href: './OS/linux/families/suse/opensuse/index.html', icon: './OS/linux/families/suse/opensuse/media/img/assets/opensuse-logo.svg' },
                { name: 'Fedora Workstation', href: './OS/linux/families/redhat/fedora/index.html', icon: './OS/linux/families/redhat/fedora/media/img/assets/fedora-logo.svg' }
            ]
        },
        windows: {
            label: 'Windows',
            distros: [
                { name: 'Windows 11', href: './OS/windows/11/index.html', icon: './OS/windows/11/media/img/win11.png' }
            ]
        },
        macos: {
            label: 'macOS',
            distros: [
                { name: 'macOS Sonoma', href: './OS/macos/sonoma/index.html', icon: './media/img/macos.webp' }
            ]
        },
        bsd: {
            label: 'BSD',
            distros: []
        },
        ios: {
            label: 'iOS',
            distros: [
                { name: 'iOS 15', href: './OS/ios/15/index.html', icon: './OS/ios/15/assets/apple.svg' }
            ]
        },
        android: {
            label: 'Android',
            distros: [
                { name: 'Android', href: './OS/android/index.html', icon: './OS/android/assets/icones/android.png' }
            ]
        }
    };

    const modal = document.getElementById('pick-modal');
    const modalTitle = document.getElementById('pick-modal-title');
    const modalList = document.getElementById('pick-modal-list');
    const modalClose = document.getElementById('pick-modal-close');
    const cards = document.querySelectorAll('.pick-card');

    if (!modal || !modalTitle || !modalList) return;

    let activeCard = null;

    const openModalForOs = (osKey, card) => {
        if (!osKey || !catalog[osKey]) return;

        if (activeCard && activeCard !== card) {
            activeCard.classList.remove('is-selected');
            activeCard.setAttribute('aria-pressed', 'false');
        }

        if (card) {
            activeCard = card;
            card.classList.add('is-selected');
            card.setAttribute('aria-pressed', 'true');
        } else {
            activeCard = null;
        }

        renderDistros(osKey);
        modal.showModal();
    };

    const closeModal = () => {
        modal.close();
        if (activeCard) {
            activeCard.classList.remove('is-selected');
            activeCard.setAttribute('aria-pressed', 'false');
            activeCard = null;
        }
    };

    const renderDistros = (osKey) => {
        const entry = catalog[osKey];
        if (!entry) return;

        modalTitle.textContent = entry.label;
        modalList.replaceChildren();

        if (entry.distros.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'pick-modal-empty';
            empty.textContent = 'Aucune distribution disponible pour le moment.';
            modalList.appendChild(empty);
            return;
        }

        entry.distros.forEach((distro) => {
            const item = document.createElement('li');
            item.className = 'pick-modal-item';

            const link = document.createElement('a');
            link.className = 'pick-modal-card';
            link.href = distro.href;
            link.title = distro.name;

            const icon = document.createElement('img');
            icon.className = 'pick-modal-card-icon';
            icon.src = distro.icon;
            icon.alt = '';
            icon.loading = 'lazy';

            const label = document.createElement('span');
            label.className = 'pick-modal-card-label';
            label.textContent = distro.name;

            link.appendChild(icon);
            link.appendChild(label);
            item.appendChild(link);
            modalList.appendChild(item);
        });
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            const osKey = card.dataset.os;
            openModalForOs(osKey, card);
        });
    });

    const pickKey = new URLSearchParams(location.search).get('pick');
    if (pickKey && catalog[pickKey]) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const card = document.querySelector(`.pick-card[data-os="${pickKey}"]`);
                openModalForOs(pickKey, card);
                if (location.search.includes('pick=')) {
                    history.replaceState(null, '', `${location.pathname}#choisir-os`);
                }
            });
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.open) closeModal();
    });
})();
