/**
 * Menu Démarrer Windows 95 (bandeau vertical + entrées classiques).
 */
'use strict';
(function () {
    const menu = document.getElementById('menu');
    if (!menu || menu.childElementCount > 0) {
        return;
    }

    const pagesBase = window.CAPSULE_WIN_PAGES_BASE || '../../shared/pages';
    const siteHome = window.CAPSULE_WIN_SITE_HOME || '../../../../index.html';
    const pickKey = window.CAPSULE_PICK_OS || 'windows';

    const items = [
        {
            href: `${pagesBase}/explorateur.html`,
            title: 'Explorateur Windows',
            icon: '../../../../usr/share/capsuleos/assets/images/toolkits/windows/95/folder.svg',
            label: 'Explorateur Windows',
            arrow: true
        },
        {
            href: `${pagesBase}/settings.html`,
            title: 'Panneau de configuration',
            icon: '../../../../usr/share/capsuleos/assets/images/toolkits/windows/95/settings.svg',
            label: 'Panneau de configuration',
            arrow: true
        },
        { sep: true },
        {
            href: `${pagesBase}/aide.html`,
            title: 'Aide',
            icon: '../../../../usr/share/capsuleos/assets/images/toolkits/windows/95/aide.png',
            label: 'Aide',
            arrow: false
        }
    ];

    const shell = document.createElement('div');
    shell.className = 'win95-start-menu';

    const banner = document.createElement('div');
    banner.className = 'win95-start-menu__banner';
    banner.textContent = 'Windows 95';
    banner.setAttribute('aria-hidden', 'true');

    const list = document.createElement('div');
    list.className = 'win95-start-menu__items';

    items.forEach((entry) => {
        if (entry.sep) {
            const sep = document.createElement('div');
            sep.className = 'win95-start-menu__sep';
            sep.setAttribute('role', 'separator');
            list.appendChild(sep);
            return;
        }

        const wrap = document.createElement('div');
        wrap.className = 'win95-start-menu__item-wrap';

        const link = document.createElement('a');
        link.className = 'win95-start-menu__item' + (entry.arrow ? ' win95-start-menu__item--arrow' : '');
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
        wrap.appendChild(link);
        list.appendChild(wrap);
    });

    const sepEnd = document.createElement('div');
    sepEnd.className = 'win95-start-menu__sep';
    list.appendChild(sepEnd);

    const shutdown = document.createElement('button');
    shutdown.type = 'button';
    shutdown.className = 'win95-start-menu__item win95-start-menu__shutdown';
    shutdown.title = 'Arrêter Windows et retourner à l’accueil CapsuleOS';

    const shutImg = document.createElement('img');
    shutImg.src = '../../../../usr/share/capsuleos/assets/images/toolkits/windows/shared/shut.png';
    shutImg.alt = '';

    const shutLabel = document.createElement('span');
    shutLabel.textContent = 'Arrêter Windows…';

    shutdown.appendChild(shutImg);
    shutdown.appendChild(shutLabel);
    shutdown.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (window.CapsulePickReturn) {
            window.CapsulePickReturn.redirectToPickHome(pickKey, siteHome);
            return;
        }
        window.location.href = `${siteHome.split('#')[0].split('?')[0]}?pick=${encodeURIComponent(pickKey)}#choisir-os`;
    });

    list.appendChild(shutdown);
    shell.appendChild(banner);
    shell.appendChild(list);
    menu.appendChild(shell);
})();
