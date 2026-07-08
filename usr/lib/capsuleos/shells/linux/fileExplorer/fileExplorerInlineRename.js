/**
 * Renommage inline Nautilus — édition sur place du libellé (F2, menu, nouveau dossier).
 */
(function initFileExplorerInlineRename(global) {
    'use strict';

    let activeRename = null;

    const usesAdvancedExplorerOps = () => (
        typeof global.usesAdvancedExplorerOps === 'function' && global.usesAdvancedExplorerOps()
    );

    const getRenameLabelNode = (link) => {
        if (!link) {
            return null;
        }
        return link.querySelector('.nemo-app__item-name')
            || link.querySelector('span:not(.nemo-app__item-body):not(.nemo-app__item-modified):not(.nemo-app__item-size):not(.nemo-app__item-meta)')
            || null;
    };

    const splitRenameParts = (filename, isFolder) => {
        const name = String(filename || '');
        if (isFolder) {
            return { editValue: name, suffix: '' };
        }
        const dot = name.lastIndexOf('.');
        if (dot <= 0) {
            return { editValue: name, suffix: '' };
        }
        return {
            editValue: name.slice(0, dot),
            suffix: name.slice(dot),
        };
    };

    const showRenameError = (message) => {
        if (!message) {
            return;
        }
        if (typeof global.showNautilusToast === 'function') {
            global.showNautilusToast(message);
            return;
        }
        global.alert(message);
    };

    const cancelInlineRename = (restoreOriginal = true) => {
        if (!activeRename) {
            return;
        }
        const { link, input, labelNode, suffixNode, originalName } = activeRename;
        if (input && input.parentNode) {
            input.remove();
        }
        if (suffixNode && suffixNode.parentNode) {
            suffixNode.remove();
        }
        if (labelNode) {
            labelNode.hidden = false;
            labelNode.classList.remove('nemo-app__item-name--renaming-host');
            if (restoreOriginal) {
                labelNode.textContent = originalName;
            }
        }
        if (link) {
            link.classList.remove('nemo-app__item--renaming');
            link.removeAttribute('draggable');
            link.setAttribute('draggable', 'true');
        }
        activeRename = null;
    };

    const selectItemLink = (link) => {
        if (!link) {
            return;
        }
        const grid = link.closest('.nemo-app__content-grid, .nemoElement');
        if (grid) {
            grid.querySelectorAll('.nemo-app__item--selected').forEach((el) => {
                el.classList.remove('nemo-app__item--selected');
            });
        }
        link.classList.add('nemo-app__item--selected');
        if (typeof global.updateNautilusSelectionStatus === 'function') {
            global.updateNautilusSelectionStatus(link);
        }
    };

    const commitInlineRename = async () => {
        if (!activeRename) {
            return { ok: false };
        }
        const {
            link, input, suffixNode, parentPath, oldName, suffix, isFolder,
        } = activeRename;
        const editValue = String(input.value || '').trim();
        if (!editValue) {
            showRenameError('Le nom ne peut pas être vide.');
            input.focus();
            input.select();
            return { ok: false };
        }
        const nextName = isFolder ? editValue : `${editValue}${suffix}`;
        if (nextName === oldName) {
            cancelInlineRename(true);
            return { ok: true, unchanged: true };
        }
        if (typeof global.pushExplorerUndoSnapshot === 'function') {
            global.pushExplorerUndoSnapshot();
        }
        let result = { ok: false };
        if (typeof global.renameExplorerItem === 'function') {
            result = await global.renameExplorerItem(parentPath, oldName, nextName);
        }
        cancelInlineRename(false);
        if (!result || !result.ok) {
            showRenameError((result && result.message) || 'Impossible de renommer cet élément.');
            if (typeof global.renderDirectory === 'function' && global.fileExplorerState) {
                global.renderDirectory(global.fileExplorerState.currentPath, {
                    pane: global.fileExplorerState.activePane || 'primary',
                });
            }
            return result || { ok: false };
        }
        global.requestAnimationFrame(() => {
            const root = link.closest('.windowElement[data-link="nemo"]')
                || (typeof global.getExplorerWindowSlot === 'function' ? global.getExplorerWindowSlot() : null);
            const selector = `a[data-item-name="${CSS.escape(nextName)}"][data-item-folder-path="${CSS.escape(parentPath)}"]`;
            const refreshed = root && root.querySelector(selector);
            if (refreshed) {
                selectItemLink(refreshed);
            }
        });
        return result;
    };

    const buildRenameField = (link, labelNode, parts, isFolder) => {
        const input = global.document.createElement('input');
        input.type = 'text';
        input.className = 'nemo-app__item-rename-input';
        input.value = parts.editValue;
        input.setAttribute('aria-label', 'Renommer');
        input.spellcheck = false;

        let suffixNode = null;
        if (!isFolder && parts.suffix) {
            suffixNode = global.document.createElement('span');
            suffixNode.className = 'nemo-app__item-rename-suffix';
            suffixNode.textContent = parts.suffix;
        }

        labelNode.textContent = '';
        labelNode.classList.add('nemo-app__item-name--renaming-host');
        if (suffixNode) {
            const wrap = global.document.createElement('span');
            wrap.className = 'nemo-app__item-rename-wrap';
            wrap.appendChild(input);
            wrap.appendChild(suffixNode);
            labelNode.appendChild(wrap);
        } else {
            labelNode.appendChild(input);
        }

        link.classList.add('nemo-app__item--renaming');
        link.setAttribute('draggable', 'false');

        input.addEventListener('keydown', (event) => {
            event.stopPropagation();
            if (event.key === 'Enter') {
                event.preventDefault();
                commitInlineRename();
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                cancelInlineRename(true);
            }
        });
        input.addEventListener('blur', () => {
            global.setTimeout(() => {
                if (activeRename && activeRename.input === input) {
                    commitInlineRename();
                }
            }, 0);
        });
        input.addEventListener('click', (event) => event.stopPropagation());
        input.addEventListener('mousedown', (event) => event.stopPropagation());

        input.focus();
        input.select();

        return { input, suffixNode };
    };

    const resolveRenameParentPath = (link) => {
        if (!link || !link.dataset) {
            return '';
        }
        const folderPath = link.dataset.itemFolderPath || '';
        const state = global.fileExplorerState;
        if (folderPath
            && typeof global.isCapsuleVirtualPlace === 'function'
            && global.isCapsuleVirtualPlace(folderPath)) {
            return (state && state.currentPath) || folderPath;
        }
        if (typeof global.CapsuleExplorerVfs !== 'undefined'
            && global.CapsuleExplorerVfs.isExplorerVfsPath
            && global.CapsuleExplorerVfs.isExplorerVfsPath(folderPath)) {
            return '';
        }
        return folderPath || (state && state.currentPath) || '';
    };

    const canRenameLink = (link) => {
        if (!link || !link.dataset || !link.dataset.itemName) {
            return false;
        }
        const parentPath = resolveRenameParentPath(link);
        if (!parentPath) {
            return false;
        }
        if (typeof global.isCapsuleVirtualPlace === 'function' && global.isCapsuleVirtualPlace(parentPath)) {
            return false;
        }
        if (typeof global.CapsuleExplorerVfs !== 'undefined'
            && global.CapsuleExplorerVfs.isExplorerVfsPath
            && global.CapsuleExplorerVfs.isExplorerVfsPath(parentPath)) {
            return false;
        }
        return true;
    };

    function startExplorerInlineRename(link) {
        if (!usesAdvancedExplorerOps() || !link) {
            return { ok: false };
        }
        if (activeRename) {
            cancelInlineRename(true);
        }
        if (!canRenameLink(link)) {
            showRenameError('Impossible de renommer cet élément ici.');
            return { ok: false };
        }
        selectItemLink(link);
        const labelNode = getRenameLabelNode(link);
        if (!labelNode) {
            return { ok: false };
        }
        const isFolder = link.dataset.itemType === 'folder';
        const oldName = link.dataset.itemName;
        const parentPath = resolveRenameParentPath(link);
        const parts = splitRenameParts(oldName, isFolder);
        const { input, suffixNode } = buildRenameField(link, labelNode, parts, isFolder);
        activeRename = {
            link,
            input,
            suffixNode,
            labelNode,
            parentPath,
            oldName,
            suffix: parts.suffix,
            isFolder,
            originalName: oldName,
        };
        return { ok: true };
    }

    function scheduleExplorerInlineRename(itemName, parentPath) {
        if (!itemName || !parentPath) {
            return;
        }
        global.requestAnimationFrame(() => {
            global.setTimeout(() => {
                const root = typeof global.getExplorerWindowSlot === 'function'
                    ? global.getExplorerWindowSlot()
                    : global.document.getElementById('nemo');
                if (!root) {
                    return;
                }
                const selector = `a[data-item-name="${CSS.escape(itemName)}"][data-item-folder-path="${CSS.escape(parentPath)}"]`;
                const link = root.querySelector(selector);
                if (link) {
                    startExplorerInlineRename(link);
                }
            }, 30);
        });
    }

    function bindFileExplorerInlineRename(root) {
        if (!usesAdvancedExplorerOps() || !root) {
            return;
        }
        if (root.dataset.feInlineRenameBound === 'true') {
            return;
        }
        root.addEventListener('keydown', (event) => {
            if (event.key !== 'F2') {
                return;
            }
            if (event.target && event.target.closest('.nemo-app__item-rename-input')) {
                return;
            }
            if (root.querySelector('.nemo-app__item--renaming')) {
                return;
            }
            event.preventDefault();
            const selected = root.querySelector('a.nemo-app__item--selected[data-item-name]');
            if (selected && typeof global.startExplorerInlineRename === 'function') {
                global.startExplorerInlineRename(selected);
                return;
            }
            if (typeof global.renameExplorerSelection === 'function') {
                global.renameExplorerSelection();
            }
        });
        root.dataset.feInlineRenameBound = 'true';
    }

    global.bindFileExplorerInlineRename = bindFileExplorerInlineRename;
    global.startExplorerInlineRename = startExplorerInlineRename;
    global.scheduleExplorerInlineRename = scheduleExplorerInlineRename;
    global.cancelExplorerInlineRename = cancelInlineRename;

    if (global.document) {
        global.document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && activeRename) {
                event.preventDefault();
                event.stopPropagation();
                cancelInlineRename(true);
            }
        }, true);
        global.document.addEventListener('capsule:slot-injected', (event) => {
            if ((event.detail || {}).slotId === 'nemo') {
                global.setTimeout(() => bindFileExplorerInlineRename(event.detail.container), 0);
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
