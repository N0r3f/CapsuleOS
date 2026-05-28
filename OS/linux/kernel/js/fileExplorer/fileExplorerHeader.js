/**
 * Menubar explorateur (.menuHeader / .listeSousMenu).
 * Appeler bindFileExplorerMenubar(#nemo) après injection du gabarit (contentLoader).
 */
(function initFileExplorerMenubar() {
    const getMenuItemLabel = (link) => {
        if (!link) {
            return '';
        }
        const li = link.querySelector('li');
        return (li?.textContent || link.textContent || '').replace(/\s+/g, ' ').trim();
    };

    const closeAllSubmenus = (scope, except) => {
        if (!scope) {
            return;
        }
        scope.querySelectorAll('.listeSousMenu').forEach((menu) => {
            if (menu !== except) {
                menu.style.display = 'none';
            }
        });
    };

    const runMenuAction = (label, context, scope) => {
        const resolver = typeof window.resolveFileExplorerMenuAction === 'function'
            ? window.resolveFileExplorerMenuAction
            : null;
        if (resolver) {
            const handled = resolver(label, context, scope);
            if (handled !== false) {
                return;
            }
        }

        const refresh = window.refreshFileExplorerDirectory || window.refreshExplorerDirectory;
        if (label === 'Actualiser' && typeof refresh === 'function') {
            refresh();
            return;
        }

        const closeWin = window.closeFileExplorerWindow;
        if (label === 'Fermer' && typeof closeWin === 'function') {
            closeWin();
        }
    };

    const bindFileExplorerMenubar = (scope) => {
        if (!scope) {
            return;
        }

        const menubar = scope.querySelector('.nemo-app__menubar, .menuOutils');
        if (!menubar) {
            return;
        }

        if (menubar.dataset.feMenubarBound !== 'true') {
            menubar.querySelectorAll('.menuHeader > li').forEach((li) => {
                const trigger = li.querySelector(':scope > a');
                const submenu = li.querySelector(':scope > .listeSousMenu');
                if (!trigger) {
                    return;
                }

                trigger.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (submenu) {
                        const isOpen = submenu.style.display === 'block';
                        closeAllSubmenus(scope);
                        submenu.style.display = isOpen ? 'none' : 'block';
                        return;
                    }
                    runMenuAction(getMenuItemLabel(trigger), { type: 'top', li, trigger }, scope);
                    closeAllSubmenus(scope);
                });
            });

            menubar.querySelectorAll('.listeSousMenu a').forEach((link) => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const label = getMenuItemLabel(link);
                    runMenuAction(label, { type: 'item', link }, scope);
                    closeAllSubmenus(scope);
                });
            });

            menubar.dataset.feMenubarBound = 'true';
        }

        if (scope.dataset.feMenubarOutsideClose !== 'true') {
            document.addEventListener('click', (event) => {
                if (!scope.contains(event.target)) {
                    closeAllSubmenus(scope);
                }
            });
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeAllSubmenus(scope);
                }
            });
            scope.dataset.feMenubarOutsideClose = 'true';
        }

        scope.dataset.feMenubarInit = 'true';
    };

    window.getFileExplorerMenuItemLabel = getMenuItemLabel;
    window.bindFileExplorerMenubar = bindFileExplorerMenubar;
    window.closeFileExplorerSubmenus = closeAllSubmenus;
})();
