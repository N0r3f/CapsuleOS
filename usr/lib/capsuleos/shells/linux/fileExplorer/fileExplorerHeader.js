/**
 * Menubar explorateur (.menuHeader / .listeSousMenu).
 * Appeler bindFileExplorerMenubar(slot explorateur) après injection du gabarit (contentLoader).
 */
'use strict';
(function initFileExplorerMenubar() {
    const EXPLORER_WINDOW_SLOT_SELECTOR = 'div.windowElement[data-link="nemo"]';
    const EXPLORER_WINDOW_SLOT_QUERIES = [
        '.windowElement.windowElementActive[data-link="nemo"]',
        EXPLORER_WINDOW_SLOT_SELECTOR,
        `object#desktop ${EXPLORER_WINDOW_SLOT_SELECTOR}`,
        `#desktop ${EXPLORER_WINDOW_SLOT_SELECTOR}`,
        'div.windowElement#nemo[data-link="nemo"]',
    ];

    const isExplorerSlotElement = (node) => (
        node
        && node.nodeType === 1
        && node.tagName === 'DIV'
        && node.classList
        && node.classList.contains('windowElement')
        && node.getAttribute('data-link') === 'nemo'
        && typeof node.querySelector === 'function'
    );

    function getExplorerWindowSlot() {
        if (typeof document === 'undefined') {
            return null;
        }
        if (typeof window.getActiveExplorerWindowRoot === 'function') {
            const tracked = window.getActiveExplorerWindowRoot();
            if (isExplorerSlotElement(tracked)) {
                return tracked;
            }
        }
        for (let index = 0; index < EXPLORER_WINDOW_SLOT_QUERIES.length; index += 1) {
            const candidate = document.querySelector(EXPLORER_WINDOW_SLOT_QUERIES[index]);
            if (isExplorerSlotElement(candidate)) {
                return candidate;
            }
        }
        const byId = document.getElementById('nemo');
        if (isExplorerSlotElement(byId)) {
            return byId;
        }
        return null;
    }

    if (typeof window !== 'undefined') {
        window.getExplorerWindowSlot = getExplorerWindowSlot;
        window.EXPLORER_WINDOW_SLOT_SELECTOR = EXPLORER_WINDOW_SLOT_SELECTOR;
    }
    const getMenuItemLabel = (link) => {
        if (!link) {
            return '';
        }
        const li = link.querySelector('li');
        return ((li == null ? void 0 : li.textContent) || link.textContent || '').replace(/\s+/g, ' ').trim();
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

        const menubar = scope.querySelector('.nemo-app__menubar');
        if (!menubar || typeof window.getComputedStyle !== 'function') {
            return;
        }
        if (window.getComputedStyle(menubar).display === 'none') {
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
