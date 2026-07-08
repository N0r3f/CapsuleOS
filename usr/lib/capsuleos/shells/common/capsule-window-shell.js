/**
 * Shell fenêtres CapsuleOS — cycle ouverture macOS Sonoma (référence).
 * À chaque ouverture : chrome + drag + resize (force), activation z-index.
 */
(function initCapsuleWindowShell(global) {
    'use strict';

    const ctxApi = () => global.CapsuleWindowContext || global.CapsuleLinuxWindowContext;

    let macHeaderTemplate = null;
    let config = {};

    function createMacHeaderTemplate() {
        const windowHeader = document.createElement('div');
        const left = document.createElement('nav');
        const closeBtn = document.createElement('button');
        const minimizeBtn = document.createElement('button');
        const maximizeBtn = document.createElement('button');
        const title = document.createElement('span');
        const right = document.createElement('nav');

        windowHeader.id = 'windowHeader';
        windowHeader.style.minWidth = 'calc(var(--head) * 16)';

        closeBtn.id = 'closeBtn';
        minimizeBtn.id = 'minimizeBtn';
        maximizeBtn.id = 'resizeBtn';
        title.id = 'windowTitle';
        title.textContent = document.title || '';

        windowHeader.appendChild(left);
        left.appendChild(closeBtn);
        left.appendChild(minimizeBtn);
        left.appendChild(maximizeBtn);
        windowHeader.appendChild(title);
        windowHeader.appendChild(right);

        return windowHeader;
    }

    function getMacHeaderTemplate() {
        if (!macHeaderTemplate) {
            macHeaderTemplate = createMacHeaderTemplate();
        }
        return macHeaderTemplate;
    }

    function ensureMacHeader(container) {
        if (!container) {
            return null;
        }
        const existing = container.querySelector(':scope > #windowHeader');
        if (existing) {
            return existing;
        }
        const header = getMacHeaderTemplate().cloneNode(true);
        container.insertBefore(header, container.firstChild);
        return header;
    }

    function activateWindow(container) {
        if (typeof global.CapsuleWindow !== 'undefined' && global.CapsuleWindow.activateWindow) {
            global.CapsuleWindow.activateWindow(container);
            return;
        }
        if (!container) {
            return;
        }
        document.querySelectorAll('.windowElementActive').forEach((win) => {
            win.classList.remove('windowElementActive');
        });
        container.classList.add('windowElementActive');
        container.classList.add('active');
    }

    function isHidden(container) {
        return !container || container.style.display === 'none';
    }

    function resolveTitle(slotId, link) {
        if (typeof config.resolveTitle === 'function') {
            return config.resolveTitle(slotId, link);
        }
        if (typeof global.getResolvedWindowTitle === 'function') {
            const resolved = global.getResolvedWindowTitle(slotId);
            if (resolved) {
                return resolved;
            }
        }
        const map = config.titleMap || {};
        return map[slotId] || slotId;
    }

    function applyChromeAndInteraction(container, slotId) {
        const api = ctxApi();
        if (api && typeof api.ensureWindowChrome === 'function') {
            api.ensureWindowChrome(container, slotId, { force: true, initInteraction: true });
            return;
        }
        ensureMacHeader(container);
        if (typeof global.makeDraggable === 'function') {
            global.makeDraggable(container);
        }
        if (typeof global.makeResizable === 'function') {
            global.makeResizable(container);
        } else if (typeof global.Resizer === 'function') {
            new global.Resizer(container);
        }
    }

    function shouldSkip(slotId, container) {
        const api = ctxApi();
        if (api && typeof api.shouldSkipWindowChrome === 'function') {
            return api.shouldSkipWindowChrome(container, slotId);
        }
        return false;
    }

    function showContainer(container, slotId) {
        const api = ctxApi();
        const skipSlots = api && typeof api.getContext === 'function'
            ? api.getContext().skipSlots
            : null;
        const isPanelSlot = skipSlots && skipSlots.has && skipSlots.has(slotId);
        if (isPanelSlot) {
            container.style.display = 'block';
        } else if (config.useStylesheetDisplay === true) {
            /* Laisser le skin (ex. grid CSD Nautilus Rocky) piloter display via CSS */
            container.style.removeProperty('display');
        } else {
            container.style.display = config.displayOnOpen || 'flex';
        }
        if (config.positionOnOpen) {
            container.style.position = config.positionOnOpen;
        }
    }

    function hideContainer(container, link) {
        const applyHide = () => {
            container.style.display = 'none';
            container.classList.remove('active');
            container.classList.remove('windowElementActive');
            if (config.resetZIndexOnClose !== false) {
                container.style.zIndex = '5';
            }
            if (typeof document !== 'undefined' && typeof CustomEvent === 'function') {
                document.dispatchEvent(new CustomEvent('capsule:window-hidden', {
                    detail: { container: container, slotId: container.dataset.link },
                }));
            }
        };

        if (typeof global.capsuleBeforeWindowHide === 'function') {
            global.capsuleBeforeWindowHide(container, applyHide);
        } else {
            applyHide();
        }
    }

    function resolveWindowSlot(slotId) {
        if (!slotId || typeof document === 'undefined') {
            return null;
        }
        const selectors = [
            `div.windowElement[data-link="${slotId}"]`,
            `#desktop .windowElement[data-link="${slotId}"]`,
            `object#desktop .windowElement[data-link="${slotId}"]`,
            `.windowElement[data-link="${slotId}"]`,
            `div[data-link="${slotId}"]`,
        ];
        for (let index = 0; index < selectors.length; index += 1) {
            const node = document.querySelector(selectors[index]);
            if (node && node.classList && node.classList.contains('windowElement')) {
                return node;
            }
        }
        const desktop = document.querySelector('object#desktop, #desktop');
        if (desktop && typeof desktop.querySelector === 'function') {
            const scoped = desktop.querySelector(`.windowElement[data-link="${slotId}"]`)
                || desktop.querySelector(`div[data-link="${slotId}"]`);
            if (scoped && scoped.classList && scoped.classList.contains('windowElement')) {
                return scoped;
            }
        }
        const byId = document.getElementById(slotId);
        if (byId && byId.classList && byId.classList.contains('windowElement')) {
            return byId;
        }
        return null;
    }

    function ensureLauncherHref(link) {
        if (!link) {
            return;
        }
        const href = link.getAttribute('href');
        if (!href) {
            link.setAttribute('href', '#');
        }
    }

    function handleOpen(link) {
        const slotId = link.dataset ? link.dataset.link : link.getAttribute('data-link');
        const container = resolveWindowSlot(slotId)
            || document.querySelector(config.containerSelector || `div[data-link="${slotId}"]`);

        if (!container) {
            return false;
        }

        if (isHidden(container)) {
            showContainer(container, slotId);

            if (typeof config.beforeOpen === 'function') {
                config.beforeOpen(container, slotId, link);
            }

            if (!shouldSkip(slotId, container)) {
                applyChromeAndInteraction(container, slotId);
                const windowTitle = container.querySelector('#windowTitle');
                if (windowTitle) {
                    windowTitle.textContent = resolveTitle(slotId, link);
                }
            }

            if (typeof config.onOpen === 'function') {
                config.onOpen(container, slotId, link);
            }

            activateWindow(container);

            if (typeof config.afterOpen === 'function') {
                config.afterOpen(container, slotId, link);
            }

            if (typeof document !== 'undefined' && typeof CustomEvent === 'function') {
                document.dispatchEvent(new CustomEvent('capsule:window-opened', {
                    detail: { container: container, slotId: slotId },
                }));
                document.dispatchEvent(new CustomEvent('capsule:window-focused', {
                    detail: { container: container, slotId: slotId },
                }));
            }
            return true;
        }

        const isFocused = container.classList.contains('windowElementActive');
        if (isFocused) {
            hideContainer(container, link);
            if (typeof document !== 'undefined' && typeof CustomEvent === 'function') {
                document.dispatchEvent(new CustomEvent('capsule:window-minimized', {
                    detail: { container: container, slotId: slotId },
                }));
            }
            if (typeof config.onClose === 'function') {
                config.onClose(container, slotId, link);
            }
            return false;
        }

        activateWindow(container);
        if (typeof document !== 'undefined' && typeof CustomEvent === 'function') {
            document.dispatchEvent(new CustomEvent('capsule:window-focused', {
                detail: { container: container, slotId: slotId },
            }));
        }
        return true;
    }

    function isWindowLauncherLink(link) {
        if (!link || link.getAttribute('target') !== 'windowElement') {
            return false;
        }
        if (link.closest('#voletnemo, .nemo-app__sidebar, .dolphin-sidebar, main#gestionnaire')) {
            return false;
        }
        const slotId = link.getAttribute('data-link');
        if (!slotId) {
            return false;
        }
        return !!resolveWindowSlot(slotId);
    }

    function registerLinks() {
        const linkSelector = config.linkSelector || 'a[target="windowElement"]';
        const links = document.querySelectorAll(linkSelector);
        links.forEach((link) => {
            if (!isWindowLauncherLink(link)) {
                return;
            }
            ensureLauncherHref(link);
            if (link.dataset.capsuleWindowBound === 'true') {
                return;
            }
            link.dataset.capsuleWindowBound = 'true';
            link.addEventListener('click', function (event) {
                event.preventDefault();
                handleOpen(this);
                const slotId = this.dataset.link;
                const taskMap = config.taskMap || {};
                const taskId = taskMap[slotId];
                if (taskId && typeof global.dispatchCapsuleTask === 'function') {
                    global.dispatchCapsuleTask(taskId);
                }
            });
        });
    }

    function bindFocusForWindow(windowElement) {
        if (!windowElement || windowElement.dataset.capsuleFocusBound === 'true') {
            return;
        }
        windowElement.dataset.capsuleFocusBound = 'true';
        windowElement.addEventListener('mousedown', () => {
            if (!isHidden(windowElement)) {
                activateWindow(windowElement);
                if (typeof document !== 'undefined' && typeof CustomEvent === 'function') {
                    document.dispatchEvent(new CustomEvent('capsule:window-focused', {
                        detail: {
                            container: windowElement,
                            slotId: windowElement.dataset.link,
                        },
                    }));
                }
            }
        });
    }

    function bindFocusOnMousedown() {
        const winSelector = config.windowSelector || '.windowElement';
        const desktop = document.querySelector('object#desktop, #desktop');
        const windows = desktop && typeof desktop.querySelectorAll === 'function'
            ? desktop.querySelectorAll(winSelector)
            : document.querySelectorAll(winSelector);
        windows.forEach(bindFocusForWindow);
    }

    function openWindowContainer(container, slotId, link) {
        if (!container) {
            return false;
        }
        const launcher = link || {
            dataset: { link: slotId },
            classList: { add() {}, remove() {} },
        };

        showContainer(container, slotId);

        if (typeof config.beforeOpen === 'function') {
            config.beforeOpen(container, slotId, launcher);
        }

        if (!shouldSkip(slotId, container)) {
            applyChromeAndInteraction(container, slotId);
            const windowTitle = container.querySelector('#windowTitle');
            if (windowTitle) {
                windowTitle.textContent = resolveTitle(slotId, launcher);
            }
        }

        if (typeof config.onOpen === 'function') {
            config.onOpen(container, slotId, launcher);
        }

        activateWindow(container);

        if (typeof config.afterOpen === 'function') {
            config.afterOpen(container, slotId, launcher);
        }

        if (typeof document !== 'undefined' && typeof CustomEvent === 'function') {
            document.dispatchEvent(new CustomEvent('capsule:window-opened', {
                detail: { container: container, slotId: slotId },
            }));
            document.dispatchEvent(new CustomEvent('capsule:window-focused', {
                detail: { container: container, slotId: slotId },
            }));
        }
        return true;
    }

    function openByDataLink(dataLink) {
        if (!dataLink) {
            return false;
        }
        const container = resolveWindowSlot(dataLink);
        if (!container) {
            return false;
        }
        const link = document.querySelector(`a[target="windowElement"][data-link="${dataLink}"]`)
            || {
                dataset: { link: dataLink },
                classList: { add() {}, remove() {} },
            };

        return handleOpen(link);
    }

    function init(userConfig) {
        config = userConfig || {};
        const run = () => {
            registerLinks();
            bindFocusOnMousedown();
            const api = ctxApi();
            if (api && typeof api.boot === 'function') {
                api.boot();
            }
        };

        if (typeof document !== 'undefined') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', run);
            } else {
                run();
            }
        }
    }

    global.CapsuleWindowShell = {
        init: init,
        handleOpen: handleOpen,
        openByDataLink: openByDataLink,
        openWindowContainer: openWindowContainer,
        resolveWindowSlot: resolveWindowSlot,
        activateWindow: activateWindow,
        bindFocusForWindow: bindFocusForWindow,
        ensureMacHeader: ensureMacHeader,
        applyChromeAndInteraction: applyChromeAndInteraction,
    };

    global.handleOpenwindow = handleOpen;
    global.openWindowByDataLink = openByDataLink;
    global.ensureWindowChromeAfterSlotInject = function (container, slotId) {
        const api = ctxApi();
        if (api && typeof api.ensureChromeAfterSlotInject === 'function') {
            api.ensureChromeAfterSlotInject(container, slotId);
        }
    };
}(typeof window !== 'undefined' ? window : globalThis));
