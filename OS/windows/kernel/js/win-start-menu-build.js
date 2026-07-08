/**
 * Menu Démarrer minimal (versions noyau) : raccourcis partagés + bouton alimentation → accueil CapsuleOS.
 * Ignoré si #menu est déjà rempli (ex. Windows 11 + demarrer.js).
 */
'use strict';
(function () {
    const menu = document.getElementById('menu');
    if (!menu || menu.childElementCount > 0) {
        return;
    }

    const pagesBase = window.CAPSULE_WIN_PAGES_BASE || '../../shared/pages';
    const siteHome = window.CAPSULE_WIN_SITE_HOME || '../../../../index.html';
    const shutIcon = '../../../../usr/share/capsuleos/assets/images/toolkits/windows/settings.svg';
    const pickKey = window.CAPSULE_PICK_OS || 'windows';

    const programs = [
        {
            href: `${pagesBase}/explorateur.html`,
            title: 'Explorateur de fichiers',
            icon: '../../../../usr/share/capsuleos/assets/images/toolkits/windows/folder.svg',
            label: 'Explorateur de fichiers'
        },
        {
            href: `${pagesBase}/settings.html`,
            title: 'Paramètres',
            icon: '../../../../usr/share/capsuleos/assets/images/toolkits/windows/settings.svg',
            label: 'Paramètres'
        }
    ];

    const section = document.createElement('section');
    section.className = 'win-start-menu';

    const list = document.createElement('ul');
    list.className = 'win-start-menu__programs';

    programs.forEach((entry) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = entry.href;
        link.target = 'lien';
        link.title = entry.title;

        const img = document.createElement('img');
        img.src = entry.icon;
        img.alt = '';

        const label = document.createElement('span');
        label.textContent = entry.label;

        link.appendChild(img);
        link.appendChild(label);
        item.appendChild(link);
        list.appendChild(item);
    });

    const menuFooter = document.createElement('footer');
    menuFooter.className = 'win-start-menu__footer';

    const powerBtn = document.createElement('button');
    powerBtn.type = 'button';
    powerBtn.className = 'win-start-menu__power';
    powerBtn.title = 'Éteindre et retourner à l’accueil CapsuleOS';
    powerBtn.setAttribute('aria-label', 'Éteindre');

    const powerImg = document.createElement('img');
    powerImg.src = typeof resolveCapsuleResourceUrl === 'function'
        ? resolveCapsuleResourceUrl(shutIcon)
        : shutIcon;
    powerImg.alt = '';

    powerBtn.appendChild(powerImg);
    powerBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (window.CapsulePickReturn) {
            window.CapsulePickReturn.redirectToPickHome(pickKey, siteHome);
            return;
        }
        window.location.href = `${siteHome.split('#')[0].split('?')[0]}?pick=${encodeURIComponent(pickKey)}#choisir-os`;
    });

    menuFooter.appendChild(powerBtn);
    section.appendChild(list);
    section.appendChild(menuFooter);
    menu.appendChild(section);
})();
