/**
 * Interactions grille Nautilus — sélection, focus, double-clic pour ouvrir.
 * Simple clic = sélectionner + focus ; double-clic = ouvrir (dossier/fichier).
 */
(function initFileExplorerNautilusItemInteraction(global) {
    'use strict';

    const isNautilusGnome = () => (
        typeof global.isNautilusGnomeTemplate === 'function' && global.isNautilusGnomeTemplate()
    );

    const focusExplorerItem = (link) => {
        if (!link || typeof link.focus !== 'function') {
            return;
        }
        try {
            link.focus({ preventScroll: true });
        } catch (error) {
            link.focus();
        }
    };

    const activateExplorerItem = (link, item, path) => {
        if (!link || !item) {
            return;
        }
        if (item.networkUri) {
            if (typeof global.connectNautilusNetworkServer === 'function') {
                global.connectNautilusNetworkServer(item.networkUri);
            }
            global.alert(`Connexion à ${item.networkUri}`);
            return;
        }
        if (item.type === 'folder') {
            const targetPath = item.path || item.targetPath || link.dataset.itemTargetPath;
            const explorerRoot = link.closest('.windowElement[data-link="nemo"]');
            if (typeof global.exitNautilusSearchChrome === 'function') {
                global.exitNautilusSearchChrome({ render: false });
            }
            if (targetPath && typeof global.navigateToFileExplorerDirectory === 'function') {
                global.navigateToFileExplorerDirectory(targetPath, {
                    updateHistory: true,
                    explorerRoot: explorerRoot || undefined,
                });
            }
            return;
        }
        const fileHref = item.href || link.dataset.itemHref || `${path}/${item.name}`;
        const resolveViewerHref = typeof global.resolveCapsuleResourceUrl === 'function'
            ? global.resolveCapsuleResourceUrl
            : (href) => {
                try {
                    return new URL(href, global.location.href).href;
                } catch (error) {
                    return href;
                }
            };
        const resolvedHref = resolveViewerHref(fileHref);
        const extension = item.extension
            || (item.name && item.name.includes('.') ? item.name.split('.').pop().toLowerCase() : '');
        const getTarget = global.getFileViewerTargetByExtension || global.getMintViewerTargetByExtension;
        const appId = typeof getTarget === 'function' ? getTarget(extension) : null;
        if (appId) {
            const openViewer = global.openFileInViewer || global.openMintFileInViewer;
            if (typeof openViewer === 'function') {
                openViewer(resolvedHref, extension, item.name);
            }
            return;
        }
        global.open(resolvedHref, '_blank', 'noopener,noreferrer');
    };

    const bindRenameOnLabel = (link, labelNode) => {
        if (!labelNode || labelNode.dataset.nemoRenameDblBound === 'true') {
            return;
        }
        labelNode.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!link.classList.contains('nemo-app__item--selected')) {
                return;
            }
            if (typeof global.startExplorerInlineRename === 'function') {
                global.startExplorerInlineRename(link);
            }
        });
        labelNode.dataset.nemoRenameDblBound = 'true';
    };

    function attachNautilusGridItemHandlers(itemLink, item, path, options = {}) {
        if (!isNautilusGnome() || !itemLink || itemLink.dataset.nemoItemInteractionBound === 'true') {
            return;
        }

        const selectGridItem = typeof options.selectGridItem === 'function'
            ? options.selectGridItem
            : () => {};

        itemLink.href = '#';
        itemLink.setAttribute('tabindex', '0');
        itemLink.setAttribute('role', 'option');
        if (item.type === 'folder') {
            itemLink.classList.add('nemo-app__item--folder');
        }

        const labelNode = itemLink.querySelector('.nemo-app__item-name')
            || itemLink.querySelector('span:not(.nemo-app__item-body):not(.nemo-app__item-modified):not(.nemo-app__item-size):not(.nemo-app__item-meta)');
        if (labelNode && !labelNode.classList.contains('nemo-app__item-name')) {
            labelNode.classList.add('nemo-app__item-name');
        }
        bindRenameOnLabel(itemLink, labelNode);

        itemLink.addEventListener('mousedown', (event) => {
            if (event.button !== 0) {
                return;
            }
            if (event.target.closest('.nemo-app__item-rename-input')) {
                return;
            }
            selectGridItem();
            focusExplorerItem(itemLink);
        });

        itemLink.addEventListener('click', (event) => {
            if (event.button !== 0 && event.type === 'click') {
                return;
            }
            if (event.target.closest('.nemo-app__item-rename-input')) {
                return;
            }
            if (event.detail > 1) {
                return;
            }
            event.preventDefault();
            selectGridItem();
            focusExplorerItem(itemLink);
        });

        itemLink.addEventListener('dblclick', (event) => {
            if (event.target.closest('.nemo-app__item-rename-input')) {
                return;
            }
            if (event.target.closest('.nemo-app__item-name') && itemLink.classList.contains('nemo-app__item--selected')) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            selectGridItem();
            focusExplorerItem(itemLink);
            activateExplorerItem(itemLink, item, path);
        });

        itemLink.addEventListener('keydown', (event) => {
            if (event.target.closest('.nemo-app__item-rename-input')) {
                return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (event.key === ' ') {
                    selectGridItem();
                    focusExplorerItem(itemLink);
                    return;
                }
                selectGridItem();
                focusExplorerItem(itemLink);
                activateExplorerItem(itemLink, item, path);
            }
        });

        itemLink.addEventListener('focus', () => {
            if (typeof global.updateNautilusSelectionStatus === 'function') {
                global.updateNautilusSelectionStatus(itemLink);
            }
        });

        itemLink.dataset.nemoItemInteractionBound = 'true';
    }

    const bindExplorerGridFocusClear = (root) => {
        const grid = root && root.querySelector('.nemoElement, .nemo-app__content-grid');
        if (!grid || grid.dataset.nemoGridFocusClear === 'true') {
            return;
        }
        grid.addEventListener('mousedown', (event) => {
            if (event.target.closest('a[data-item-name]')) {
                return;
            }
            grid.querySelectorAll('a[data-item-name].nemo-app__item--selected').forEach((link) => {
                link.classList.remove('nemo-app__item--selected');
            });
            if (typeof global.updateNautilusSelectionStatus === 'function') {
                global.updateNautilusSelectionStatus(null);
            }
        });
        grid.dataset.nemoGridFocusClear = 'true';
    };

    function bindFileExplorerNautilusItemInteraction(root) {
        if (!isNautilusGnome()) {
            return;
        }
        const slot = root || (typeof global.getExplorerWindowSlot === 'function'
            ? global.getExplorerWindowSlot()
            : global.document.getElementById('nemo'));
        if (slot) {
            bindExplorerGridFocusClear(slot);
        }
    }

    global.attachNautilusGridItemHandlers = attachNautilusGridItemHandlers;
    global.activateNautilusExplorerItem = activateExplorerItem;
    global.bindFileExplorerNautilusItemInteraction = bindFileExplorerNautilusItemInteraction;

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', (event) => {
            if ((event.detail || {}).slotId === 'nemo') {
                global.setTimeout(() => bindFileExplorerNautilusItemInteraction(event.detail.container), 0);
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
