/**
 * Menu utilisateur connecté — dropdown navbar desktop.
 */
'use strict';
(function () {
    const closeMenu = (menu) => {
        const trigger = menu.querySelector('.header-user-menu-trigger');
        const panel = menu.querySelector('.header-user-menu-panel');
        menu.classList.remove('is-open');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
        if (panel) {
            panel.hidden = true;
        }
    };

    const closeAll = (except) => {
        document.querySelectorAll('[data-header-user-menu].is-open').forEach((menu) => {
            if (menu !== except) {
                closeMenu(menu);
            }
        });
    };

    document.querySelectorAll('[data-header-user-menu]').forEach((menu) => {
        const trigger = menu.querySelector('.header-user-menu-trigger');
        const panel = menu.querySelector('.header-user-menu-panel');
        if (!trigger || !panel) {
            return;
        }

        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            const willOpen = panel.hidden;
            closeAll(menu);
            if (willOpen) {
                menu.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
                panel.hidden = false;
            } else {
                closeMenu(menu);
            }
        });

        panel.addEventListener('click', (event) => {
            if (event.target.closest('.header-user-menu-item')) {
                closeMenu(menu);
            }
        });
    });

    document.addEventListener('click', () => closeAll(null));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAll(null);
        }
    });
}());
