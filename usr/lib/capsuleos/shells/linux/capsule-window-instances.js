/**
 * Instances multiples de fenêtres (terminal Ptyxis, etc.) — cumul sans toggle dock.
 */
(function initCapsuleWindowInstances(global) {
    'use strict';

    const MULTI_INSTANCE_SLOTS = new Set(['terminal', 'nemo']);

    let instanceSeq = 1;

    function isMultiInstanceSlot(slotId) {
        return MULTI_INSTANCE_SLOTS.has(slotId);
    }

    function isSecondaryInstance(windowElement) {
        return !!(windowElement && windowElement.dataset && windowElement.dataset.capsuleWindowInstance);
    }

    function stripWindowChromeInitFlags(root) {
        if (!root) {
            return;
        }
        const wipeClone = (node) => {
            if (!node || !node.dataset) {
                return;
            }
            Object.keys(node.dataset).forEach((key) => {
                delete node.dataset[key];
            });
        };
        wipeClone(root);
        root.querySelectorAll('*').forEach(wipeClone);
    }

    function resetInstanceContainerState(container) {
        if (!container || !container.dataset) {
            return;
        }
        [
            'terminalTabsInit',
            'sizeInit',
            'cascadeInit',
            'fedoraTerminalObserver',
            'terminalMenuOutsideClose',
        ].forEach((key) => {
            delete container.dataset[key];
        });
    }

    function resolvePrototype(slotId) {
        if (!slotId || typeof document === 'undefined') {
            return null;
        }
        const byId = document.getElementById(slotId);
        if (byId && byId.classList && byId.classList.contains('windowElement')) {
            return byId;
        }
        return document.querySelector(`.windowElement[data-link="${slotId}"]:not([data-capsule-window-instance])`);
    }

    function resolveDesktopRoot() {
        return document.querySelector('object#desktop, #desktop');
    }

    function createWindowShell(slotId, prototype) {
        const instanceId = `${slotId}-${instanceSeq++}`;
        const container = document.createElement('div');
        container.className = 'windowElement';
        if (prototype.classList && prototype.classList.length) {
            prototype.classList.forEach((className) => {
                if (className) {
                    container.classList.add(className);
                }
            });
        }
        container.dataset.link = slotId;
        resetInstanceContainerState(container);
        container.dataset.capsuleWindowInstance = instanceId;
        container.id = `capsule-win-${instanceId}`;
        container.style.display = 'none';
        container.style.position = '';
        container.style.left = '';
        container.style.top = '';
        container.style.width = '';
        container.style.height = '';
        container.style.bottom = '';
        container.style.right = '';
        container.style.zIndex = '';

        const protoHeader = prototype.querySelector(':scope > #windowHeader');
        if (protoHeader) {
            const header = protoHeader.cloneNode(true);
            stripWindowChromeInitFlags(header);
            container.appendChild(header);
        } else if (global.CapsuleWindowShell && typeof global.CapsuleWindowShell.ensureMacHeader === 'function') {
            global.CapsuleWindowShell.ensureMacHeader(container);
        }

        return container;
    }

    function openNew(slotId) {
        if (!isMultiInstanceSlot(slotId)) {
            return Promise.resolve(false);
        }
        const prototype = resolvePrototype(slotId);
        const desktop = resolveDesktopRoot();
        if (!prototype || !desktop) {
            return Promise.resolve(false);
        }
        if (typeof global.reloadCapsuleSlot !== 'function') {
            console.warn('CapsuleOS: reloadCapsuleSlot indisponible (contentLoader.js ?)');
            return Promise.resolve(false);
        }

        const container = createWindowShell(slotId, prototype);
        desktop.appendChild(container);

        if (global.CapsuleWindowShell && typeof global.CapsuleWindowShell.bindFocusForWindow === 'function') {
            global.CapsuleWindowShell.bindFocusForWindow(container);
        }

        return global.reloadCapsuleSlot(container, slotId)
            .then(() => {
                if (slotId === 'terminal' && typeof global.initTerminalForContainer === 'function') {
                    global.initTerminalForContainer(container);
                }
                if (global.CapsuleWindowShell && typeof global.CapsuleWindowShell.openWindowContainer === 'function') {
                    return global.CapsuleWindowShell.openWindowContainer(container, slotId);
                }
                if (typeof global.openWindowByDataLink === 'function') {
                    return global.openWindowByDataLink(slotId);
                }
                return false;
            })
            .catch((error) => {
                console.error('CapsuleOS: échec ouverture nouvelle fenêtre', slotId, error);
                container.remove();
                return false;
            });
    }

    function openNewWindowByDataLink(dataLink) {
        const result = openNew(dataLink);
        if (result && typeof result.then === 'function') {
            return result;
        }
        return result;
    }

    function cleanupClosedInstance(event) {
        const detail = event && event.detail ? event.detail : {};
        const container = detail.container;
        if (!container || !isSecondaryInstance(container)) {
            return;
        }
        if (global.CapsuleWindowMemory && typeof global.CapsuleWindowMemory.purge === 'function') {
            global.CapsuleWindowMemory.purge(container);
        }
        container.remove();
        if (typeof global.CapsuleTaskbarWindowList !== 'undefined'
            && typeof global.CapsuleTaskbarWindowList.refresh === 'function') {
            global.CapsuleTaskbarWindowList.refresh();
        }
    }

    if (typeof document !== 'undefined') {
        document.addEventListener('capsule:window-closed', cleanupClosedInstance);
    }

    global.CapsuleWindowInstances = {
        openNew: openNew,
        isMultiInstanceSlot: isMultiInstanceSlot,
        isSecondaryInstance: isSecondaryInstance,
    };
    global.openNewWindowByDataLink = openNewWindowByDataLink;
}(typeof window !== 'undefined' ? window : globalThis));
