/**
 * Chrome fenêtre — registre providers et header template.
 * Résolution toolkit : CapsuleWindowHeaderContext (etc/capsuleos/contracts/window-chrome-contexts.json).
 */
(function initCapsuleWindowChrome(global) {
    'use strict';

    const providers = {};
    const targetsApi = () => global.CapsuleWindowDragTargets;

    function headerCtx() {
        return global.CapsuleWindowHeaderContext || null;
    }

    function isKdeFamily() {
        const ctx = headerCtx();
        if (ctx && typeof ctx.isKdeFamily === 'function') {
            return ctx.isKdeFamily();
        }
        return false;
    }

    function isNautilusFamilyExplorer() {
        const ctx = headerCtx();
        if (ctx && typeof ctx.isNautilusFamilyExplorer === 'function') {
            return ctx.isNautilusFamilyExplorer();
        }
        return false;
    }

    function isDolphinExplorerSlot(slotId) {
        const ctx = headerCtx();
        if (ctx && typeof ctx.isDolphinExplorerSlot === 'function') {
            return ctx.isDolphinExplorerSlot(slotId);
        }
        return false;
    }

    function isNautilusFamilySlot(slotId) {
        const ctx = headerCtx();
        if (ctx && typeof ctx.isNautilusFamilySlot === 'function') {
            return ctx.isNautilusFamilySlot(slotId);
        }
        return false;
    }

    function isFileRollerGtkCsdSlot(slotId) {
        const ctx = headerCtx();
        if (ctx && typeof ctx.resolveChromeProviderId === 'function') {
            return ctx.resolveChromeProviderId(slotId) === 'file-roller-gtk';
        }
        return slotId === 'file_roller';
    }

    function resolveChromeProviderId(slotId) {
        const ctx = headerCtx();
        if (ctx && typeof ctx.resolveChromeProviderId === 'function') {
            return ctx.resolveChromeProviderId(slotId);
        }
        if (slotId === 'nemo') {
            return 'nemo';
        }
        return 'default';
    }

    const LIBADWAITA_CSD_ANCHORS = {
        calculator: '.gnome-calc__header',
        text_editor: '.xed-app__menubar',
        calendar: '.gnome-calendar-app__header',
        clocks: '.gnome-clocks__header',
        update_manager: '.gnome-software__titlebar',
        profile: '.gnome-app__window-chrome',
        checklist: '.checklist-app__header',
        librewriter: '.lw-menubar',
        librecalc: '.lc-menubar',
        libreoffice_startcenter: '.mint-app__header',
        libreoffice_impress: '.lim-app__toolbar',
        libreoffice_draw: '.ldr-app__toolbar',
        themes: '.gnome-settings__headerbar',
        visionneur_images: '.viewer-app__toolbar',
        visionneur_pdf: '.viewer-app__toolbar',
        lecteur_multimedia: '.celluloid-app__menubar',
        snapshot: '.gnome-snapshot__header',
        screenshot: '.gnome-shot__headerbar',
        baobab: '.gnome-baobab__header',
        system_monitor: '.gnome-sysmon__header',
        tour: '.gnome-tour__header',
        characters: '.gnome-characters__header',
        thunderbird: '.tbd-app__menubar',
        transmission: '.trm-app__toolbar',
        rhythmbox: '.rb-app__header',
        drawing: '.drawing-app__menubar',
        simple_scan: '.scn-app__header',
        warpinator: '.wrp-app__header',
        timeshift: '.tsh-app__header',
    };

    const LIBADWAITA_DEDICATED_CHROME_ROW_SLOTS = {
        profile: true,
    };

    function resolveLibadwaitaAnchor(container, slotId) {
        if (LIBADWAITA_DEDICATED_CHROME_ROW_SLOTS[slotId]) {
            const root = container.querySelector(':scope > main, :scope > section');
            if (!root) {
                return null;
            }
            let row = root.querySelector(':scope > .gnome-app__window-chrome');
            if (!row) {
                row = document.createElement('header');
                row.className = 'gnome-app__window-chrome';
                row.setAttribute('aria-label', 'Barre de titre');
                root.insertBefore(row, root.firstChild);
            }
            return row;
        }
        const anchorSelector = LIBADWAITA_CSD_ANCHORS[slotId];
        return anchorSelector ? container.querySelector(anchorSelector) : null;
    }

    function ensureLibadwaitaHeaderEnd(anchor) {
        let end = anchor.querySelector(':scope > .gnome-app__header-end');
        if (!end) {
            end = document.createElement('div');
            end.className = 'gnome-app__header-end';
            anchor.appendChild(end);
        }
        return end;
    }

    function ensureLibadwaitaDragFill(anchor) {
        let fill = anchor.querySelector(':scope > .gnome-app__header-fill');
        if (!fill) {
            fill = document.createElement('div');
            fill.className = 'gnome-app__header-fill';
            fill.setAttribute('data-window-drag-region', '');
            const end = anchor.querySelector(':scope > .gnome-app__header-end');
            if (end) {
                anchor.insertBefore(fill, end);
            } else {
                anchor.appendChild(fill);
            }
        }
        return fill;
    }

    function ensureGs50SoftwareControlsWrap(host) {
        let csdWrap = host.querySelector(':scope > .gnome-app__window-controls');
        if (!csdWrap) {
            csdWrap = document.createElement('div');
            csdWrap.className = 'gnome-app__window-controls';
            csdWrap.setAttribute('role', 'group');
            csdWrap.setAttribute('aria-label', 'Contrôles de fenêtre');
            host.appendChild(csdWrap);
        }
        return csdWrap;
    }

    function resolvesGs50SoftwareChrome(container) {
        const root = container.querySelector('#updateManagerApp.update-manager--gnome');
        if (!root || !container.querySelector('[data-um-gnome-chrome-actions]')) {
            return false;
        }
        if (root.dataset.umGnomeChrome === 'gs50-tabs') {
            return true;
        }
        const body = container.ownerDocument && container.ownerDocument.body;
        const gs50BodyIds = { fedora: true, rocky: true, alma: true, ubuntu: true, anduinos: true };
        return !!(body && gs50BodyIds[body.id]);
    }

    function ensureGs50SoftwareHeaderDrag(container) {
        const shell = container.querySelector('.gnome-software');
        if (!shell || !resolvesGs50SoftwareChrome(container)) {
            return;
        }
        let drag = shell.querySelector('[data-um-gnome-header-drag]');
        if (!drag) {
            drag = document.createElement('div');
            drag.className = 'gnome-software__header-drag window-drag-region';
            drag.setAttribute('data-um-gnome-header-drag', '');
            drag.setAttribute('data-window-drag-region', '');
            drag.setAttribute('aria-hidden', 'true');
            shell.insertBefore(drag, shell.firstChild);
        }
    }

    function reparentGs50SoftwareControls(container, header, gs50Actions) {
        gs50Actions.hidden = false;
        const csdWrap = ensureGs50SoftwareControlsWrap(gs50Actions);
        const buttons = [
            header.querySelector('#minimizeBtn'),
            header.querySelector('#resizeBtn'),
            header.querySelector('#closeBtn'),
        ];
        buttons.forEach((btn) => {
            if (btn && !csdWrap.contains(btn)) {
                csdWrap.appendChild(btn);
            }
        });
        const strayEnd = container.querySelector('.gnome-software__titlebar > .gnome-app__header-end');
        if (strayEnd) {
            strayEnd.querySelectorAll('button').forEach((btn) => {
                if (!csdWrap.contains(btn)) {
                    csdWrap.appendChild(btn);
                }
            });
            const strayWrap = strayEnd.querySelector('.gnome-app__window-controls');
            if (strayWrap && !strayWrap.childElementCount) {
                strayWrap.remove();
            }
            if (!strayEnd.childElementCount) {
                strayEnd.remove();
            }
        }
        ensureGs50SoftwareHeaderDrag(container);
    }

    function relocateLibadwaitaWindowControls(container, slotId) {
        const header = container.querySelector(':scope > #windowHeader');
        const anchor = resolveLibadwaitaAnchor(container, slotId);
        const gs50Actions = slotId === 'update_manager'
            ? container.querySelector('[data-um-gnome-chrome-actions]')
            : null;
        if (!header || !anchor) {
            return false;
        }
        if (header.dataset.libadwaitaCsd === 'true') {
            if (gs50Actions) {
                reparentGs50SoftwareControls(container, header, gs50Actions);
            }
            return true;
        }

        header.dataset.libadwaitaCsd = 'true';
        container.classList.add('gnome-app--csd');

        let csdWrap;
        if (gs50Actions) {
            csdWrap = ensureGs50SoftwareControlsWrap(gs50Actions);
        } else {
            const headerEnd = ensureLibadwaitaHeaderEnd(anchor);
            ensureLibadwaitaDragFill(anchor);
            csdWrap = headerEnd.querySelector('.gnome-app__window-controls');
            if (!csdWrap) {
                csdWrap = document.createElement('div');
                csdWrap.className = 'gnome-app__window-controls';
                csdWrap.setAttribute('role', 'group');
                csdWrap.setAttribute('aria-label', 'Contrôles de fenêtre');
                headerEnd.appendChild(csdWrap);
            }
        }

        const minBtn = header.querySelector('#minimizeBtn');
        const maxBtn = header.querySelector('#resizeBtn');
        const closeBtn = header.querySelector('#closeBtn');
        [minBtn, maxBtn, closeBtn].forEach((btn) => {
            if (btn) {
                csdWrap.appendChild(btn);
            }
        });

        const title = header.querySelector('#windowTitle');
        if (title) {
            title.setAttribute('aria-hidden', 'true');
        }

        if (gs50Actions) {
            reparentGs50SoftwareControls(container, header, gs50Actions);
        }

        return true;
    }

    function relocateNautilusWindowControls(container) {
        const header = container.querySelector(':scope > #windowHeader');
        const trailing = container.querySelector(
            '.nautilus-app__headerbar.nemo-app__toolbar .nautilus-app__trailing'
        );
        if (!header || !trailing) {
            return false;
        }
        if (header.dataset.nautilusCsd === 'true') {
            return true;
        }

        header.dataset.nautilusCsd = 'true';
        container.classList.add('gnome-app--csd');

        let csdWrap = trailing.querySelector(':scope > .gnome-app__window-controls');
        if (!csdWrap) {
            csdWrap = document.createElement('div');
            csdWrap.className = 'gnome-app__window-controls';
            csdWrap.setAttribute('role', 'group');
            csdWrap.setAttribute('aria-label', 'Contrôles de fenêtre');
            trailing.appendChild(csdWrap);
        }

        const minBtn = header.querySelector('#minimizeBtn');
        const maxBtn = header.querySelector('#resizeBtn');
        const closeBtn = header.querySelector('#closeBtn');
        [minBtn, maxBtn, closeBtn].forEach((btn) => {
            if (btn) {
                csdWrap.appendChild(btn);
            }
        });

        const title = header.querySelector('#windowTitle');
        if (title) {
            title.setAttribute('aria-hidden', 'true');
        }

        const integratedClose = trailing.querySelector('.nautilus-app__window-close');
        if (integratedClose) {
            integratedClose.hidden = true;
        }

        return true;
    }

    function relocateFileRollerWindowControls(container) {
        const header = container.querySelector(':scope > #windowHeader');
        const headerEnd = container.querySelector('.fr-app__header-end');
        if (!header || !headerEnd) {
            return false;
        }
        if (header.dataset.fileRollerCsd === 'true') {
            return true;
        }

        header.dataset.fileRollerCsd = 'true';
        container.classList.add('file-roller--csd');

        let csdWrap = headerEnd.querySelector('.fr-app__window-controls');
        if (!csdWrap) {
            csdWrap = document.createElement('div');
            csdWrap.className = 'fr-app__window-controls';
            csdWrap.setAttribute('role', 'group');
            csdWrap.setAttribute('aria-label', 'Contrôles de fenêtre');
            headerEnd.appendChild(csdWrap);
        }

        const minBtn = header.querySelector('#minimizeBtn');
        const maxBtn = header.querySelector('#resizeBtn');
        const closeBtn = header.querySelector('#closeBtn');
        [minBtn, maxBtn, closeBtn].forEach((btn) => {
            if (btn) {
                csdWrap.appendChild(btn);
            }
        });

        const title = header.querySelector('#windowTitle');
        if (title) {
            title.setAttribute('aria-hidden', 'true');
        }

        const appTitle = container.querySelector('.fr-app__title');
        if (appTitle && !appTitle.hasAttribute('data-window-drag-region')) {
            appTitle.setAttribute('data-window-drag-region', '');
        }

        return true;
    }

    function createHeaderTemplate() {
        const windowHeader = document.createElement('div');
        const left = document.createElement('nav');
        const title = document.createElement('span');
        const right = document.createElement('nav');
        const minimizeBtn = document.createElement('button');
        const maximizeBtn = document.createElement('button');
        const closeBtn = document.createElement('button');

        windowHeader.id = 'windowHeader';
        windowHeader.style.minWidth = '0';
        windowHeader.style.width = '100%';
        windowHeader.style.boxSizing = 'border-box';

        title.id = 'windowTitle';
        title.textContent = document.title;

        minimizeBtn.id = 'minimizeBtn';
        maximizeBtn.id = 'resizeBtn';
        closeBtn.id = 'closeBtn';

        windowHeader.appendChild(left);
        windowHeader.appendChild(title);
        windowHeader.appendChild(right);
        right.appendChild(minimizeBtn);
        right.appendChild(maximizeBtn);
        right.appendChild(closeBtn);

        return windowHeader;
    }

    let headerTemplate = null;

    function getHeaderTemplate() {
        if (!headerTemplate) {
            headerTemplate = createHeaderTemplate();
        }
        return headerTemplate;
    }

    function applyKdeWindowHeaderIcons(container) {
        const ctx = headerCtx();
        const useKde = ctx && typeof ctx.shouldUseKdeHeaderIcons === 'function'
            ? ctx.shouldUseKdeHeaderIcons()
            : isKdeFamily();
        if (!container || !useKde) {
            return;
        }
        const headerIconUrl = (file) => {
            const logical = `./assets/images/toolkits/kde/header/${file}`;
            if (typeof global.resolveCapsuleResourceUrl === 'function') {
                return global.resolveCapsuleResourceUrl(logical);
            }
            const toolkitBase = global.CAPSULE_TOOLKIT_ASSETS_BASE
                || (global.CAPSULE_ASSETS_BASE
                    ? `${String(global.CAPSULE_ASSETS_BASE).replace(/\/+$/, '')}/images/toolkits/kde`
                    : null);
            return toolkitBase ? `${toolkitBase}/header/${file}` : logical;
        };
        const header = container.querySelector('#windowHeader');
        if (!header) {
            return;
        }
        const minBtn = header.querySelector('#minimizeBtn');
        const resBtn = header.querySelector('#resizeBtn');
        const clsBtn = header.querySelector('#closeBtn');

        if (minBtn) {
            minBtn.style.backgroundImage = `url("${headerIconUrl('minimize.svg')}")`;
        }
        if (resBtn) {
            resBtn.style.backgroundImage = `url("${headerIconUrl('window-restore.svg')}")`;
            resBtn.style.backgroundSize = 'calc(var(--head) / 2.55)';
        }
        if (clsBtn) {
            clsBtn.style.backgroundImage = `url("${headerIconUrl('window-close.svg')}")`;
        }
    }

    function applyPassthroughChromeHeader(header) {
        const api = targetsApi();
        if (!header) {
            return;
        }
        if (api && typeof api.markDragPassthrough === 'function') {
            api.markDragPassthrough(header);
        } else {
            header.setAttribute('data-window-drag-handle', '');
            header.setAttribute('data-window-drag-passthrough', 'true');
        }
        if (api && typeof api.ensureHeaderDragFill === 'function') {
            api.ensureHeaderDragFill(header);
        }
    }

    function ensureMuffinTitleBarVisible(container) {
        if (!container) {
            return;
        }
        container.classList.remove('file-roller--csd', 'gnome-app--csd');
        const header = container.querySelector(':scope > #windowHeader');
        if (!header) {
            return;
        }
        header.hidden = false;
        header.removeAttribute('aria-hidden');
        header.style.removeProperty('display');
    }

    function resolveFirefoxGnomeTabsbar(container) {
        if (!container) {
            return null;
        }
        return container.querySelector(
            '.capsule-browser__tabsbar[data-firefox-gnome-tabstrip], .capsule-browser__tabsbar'
        );
    }

    function stripHeaderDragOverlay(header) {
        if (!header) {
            return;
        }
        header.querySelectorAll('.window-drag-region--header-fill').forEach((node) => {
            node.remove();
        });
        header.removeAttribute('data-window-drag-handle');
        header.removeAttribute('data-window-drag-passthrough');
        const title = header.querySelector('#windowTitle');
        if (title) {
            title.removeAttribute('data-window-drag-region');
        }
    }

    function cleanupFirefoxGnomeStrayHeader(container) {
        if (!container || container.dataset.link !== 'firefox') {
            return null;
        }
        const integrated = container.querySelector(
            '#windowHeader.firefox-window-controls--fedora, .capsule-browser__tabsbar #windowHeader'
        );
        container.querySelectorAll(':scope > #windowHeader').forEach((header) => {
            if (integrated && header !== integrated) {
                header.remove();
            }
        });
        return integrated || container.querySelector('#windowHeader');
    }

    function applyFirefoxGnomeDragPolicy(container) {
        const tabsbar = resolveFirefoxGnomeTabsbar(container);
        const header = cleanupFirefoxGnomeStrayHeader(container);

        if (tabsbar) {
            if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                targetsApi().markDragPassthrough(tabsbar);
            } else {
                tabsbar.setAttribute('data-window-drag-handle', '');
                tabsbar.setAttribute('data-window-drag-passthrough', 'true');
            }
        }

        if (header) {
            stripHeaderDragOverlay(header);
        }
    }

    function syncFirefoxGnomeChrome(container) {
        if (!container || container.dataset.link !== 'firefox') {
            return;
        }
        applyFirefoxGnomeDragPolicy(container);
    }

    function applyDragHandlePolicy(container, slotId, providerId) {
        const header = container.querySelector(':scope > #windowHeader');
        const appHandle = container.querySelector('[data-window-drag-handle]');
        const ctx = headerCtx();
        const unifiedExplorer = ctx
            && typeof ctx.usesUnifiedExplorerTitleBar === 'function'
            && ctx.usesUnifiedExplorerTitleBar()
            && slotId === (ctx.EXPLORER_SLOT || 'nemo');

        if (providerId === 'nemo-gnome') {
            if (header) {
                applyPassthroughChromeHeader(header);
            }
            const nautilusHeader = container.querySelector(
                '.nautilus-app__win-head, .nautilus-app__headerbar, #nemoHeaderContainer'
            );
            if (nautilusHeader) {
                if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                    targetsApi().markDragPassthrough(nautilusHeader);
                } else {
                    nautilusHeader.setAttribute('data-window-drag-handle', '');
                    nautilusHeader.setAttribute('data-window-drag-passthrough', 'true');
                }
            } else if (appHandle) {
                if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                    targetsApi().markDragPassthrough(appHandle);
                } else {
                    appHandle.setAttribute('data-window-drag-handle', '');
                    appHandle.setAttribute('data-window-drag-passthrough', 'true');
                }
            }
            return;
        }

        if (providerId === 'dolphin' && header) {
            header.setAttribute('data-window-drag-handle', '');
            header.removeAttribute('data-window-drag-passthrough');
            return;
        }

        if (providerId === 'nemo') {
            if (unifiedExplorer && header && appHandle) {
                header.setAttribute('data-window-drag-handle', '');
                header.removeAttribute('data-window-drag-passthrough');
                appHandle.removeAttribute('data-window-drag-handle');
                appHandle.removeAttribute('data-window-drag-passthrough');
                return;
            }
            if (appHandle && header) {
                applyPassthroughChromeHeader(appHandle);
                header.removeAttribute('data-window-drag-handle');
                header.removeAttribute('data-window-drag-passthrough');
                return;
            }
            if (header) {
                header.setAttribute('data-window-drag-handle', '');
                header.removeAttribute('data-window-drag-passthrough');
            }
            return;
        }

        if (providerId === 'terminal-gnome' && header) {
            if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                targetsApi().markDragPassthrough(header);
            } else {
                header.setAttribute('data-window-drag-handle', '');
                header.setAttribute('data-window-drag-passthrough', 'true');
            }
            return;
        }

        if (providerId === 'firefox-gnome') {
            applyFirefoxGnomeDragPolicy(container);
            return;
        }

        if (providerId === 'cinnamon' || providerId === 'default') {
            ensureMuffinTitleBarVisible(container);
        }

        if (providerId === 'file-roller-gtk') {
            const headerbar = container.querySelector('.fr-app__headerbar');
            if (headerbar) {
                if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                    targetsApi().markDragPassthrough(headerbar);
                } else {
                    headerbar.setAttribute('data-window-drag-handle', '');
                    headerbar.setAttribute('data-window-drag-passthrough', 'true');
                }
            }
            if (header) {
                header.removeAttribute('data-window-drag-handle');
                header.removeAttribute('data-window-drag-passthrough');
                header.setAttribute('aria-hidden', 'true');
            }
            return;
        }

        if (providerId === 'libadwaita-gnome') {
            if (slotId === 'update_manager' && resolvesGs50SoftwareChrome(container)) {
                ensureGs50SoftwareHeaderDrag(container);
                const shell = container.querySelector('.gnome-software');
                if (shell) {
                    if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                        targetsApi().markDragPassthrough(shell);
                    } else {
                        shell.setAttribute('data-window-drag-handle', '');
                        shell.setAttribute('data-window-drag-passthrough', 'true');
                    }
                }
                const titlebar = container.querySelector('.gnome-software__titlebar');
                if (titlebar) {
                    titlebar.removeAttribute('data-window-drag-handle');
                    titlebar.removeAttribute('data-window-drag-passthrough');
                }
                if (header) {
                    header.removeAttribute('data-window-drag-handle');
                    header.removeAttribute('data-window-drag-passthrough');
                    header.setAttribute('aria-hidden', 'true');
                }
                return;
            }
            const anchorSelector = LIBADWAITA_CSD_ANCHORS[slotId];
            const anchor = anchorSelector ? container.querySelector(anchorSelector) : null;
            if (anchor) {
                if (targetsApi() && typeof targetsApi().markDragPassthrough === 'function') {
                    targetsApi().markDragPassthrough(anchor);
                } else {
                    anchor.setAttribute('data-window-drag-handle', '');
                    anchor.setAttribute('data-window-drag-passthrough', 'true');
                }
            }
            if (header) {
                header.removeAttribute('data-window-drag-handle');
                header.removeAttribute('data-window-drag-passthrough');
                header.setAttribute('aria-hidden', 'true');
            }
            return;
        }

        if (header) {
            header.setAttribute('data-window-drag-handle', '');
            header.removeAttribute('data-window-drag-passthrough');
            if (targetsApi() && typeof targetsApi().ensureHeaderDragFill === 'function') {
                targetsApi().ensureHeaderDragFill(header);
            }
        }
    }

    providers.default = {
        id: 'default',
        ensureHeader(container) {
            let header = container.querySelector(':scope > #windowHeader');
            if (!header) {
                header = getHeaderTemplate().cloneNode(true);
                container.insertBefore(header, container.firstChild);
            }
            return header;
        },
        afterInject(container, slotId) {
            applyKdeWindowHeaderIcons(container);
            applyDragHandlePolicy(container, slotId, 'default');
        },
    };

    providers.dolphin = {
        id: 'dolphin',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            applyKdeWindowHeaderIcons(container);
            applyDragHandlePolicy(container, slotId, 'dolphin');
        },
    };

    providers.nemo = {
        id: 'nemo',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            applyKdeWindowHeaderIcons(container);
            applyDragHandlePolicy(container, slotId, 'nemo');
        },
    };

    providers['nemo-gnome'] = {
        id: 'nemo-gnome',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            relocateNautilusWindowControls(container);
            applyKdeWindowHeaderIcons(container);
            applyDragHandlePolicy(container, slotId, 'nemo-gnome');
        },
    };

    providers.cinnamon = {
        id: 'cinnamon',
        ensureHeader(container) {
            const header = providers.default.ensureHeader(container);
            ensureMuffinTitleBarVisible(container);
            return header;
        },
        afterInject(container, slotId) {
            ensureMuffinTitleBarVisible(container);
            applyDragHandlePolicy(container, slotId, 'cinnamon');
        },
    };

    providers['firefox-gnome'] = {
        id: 'firefox-gnome',
        ensureHeader(container) {
            const existing = container.querySelector('#windowHeader');
            if (existing) {
                return existing;
            }
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            applyDragHandlePolicy(container, slotId, 'firefox-gnome');
        },
    };

    providers['terminal-gnome'] = {
        id: 'terminal-gnome',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            applyDragHandlePolicy(container, slotId, 'terminal-gnome');
        },
    };
    providers['terminal-cosmic'] = providers.default;

    providers['file-roller-gtk'] = {
        id: 'file-roller-gtk',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            relocateFileRollerWindowControls(container);
            applyDragHandlePolicy(container, slotId, 'file-roller-gtk');
        },
    };

    providers['libadwaita-gnome'] = {
        id: 'libadwaita-gnome',
        ensureHeader(container) {
            return providers.default.ensureHeader(container);
        },
        afterInject(container, slotId) {
            relocateLibadwaitaWindowControls(container, slotId);
            applyDragHandlePolicy(container, slotId, 'libadwaita-gnome');
        },
    };

    function registerChromeProvider(id, provider) {
        providers[id] = provider;
    }

    function getChromeProvider(slotId) {
        const id = resolveChromeProviderId(slotId);
        return providers[id] || providers.default;
    }

    function ensureHeader(container, slotId) {
        if (!container || slotId === 'mainMenu') {
            return null;
        }
        const isGnomeStartMenu = slotId === 'mainMenu'
            && !!container.querySelector('#menu-gnome-root');
        if (isGnomeStartMenu) {
            return null;
        }
        const provider = getChromeProvider(slotId);
        return provider.ensureHeader(container);
    }

    function stampChromeToolkitAttributes(container, slotId) {
        if (!container) {
            return;
        }
        const ctx = headerCtx();
        if (!ctx) {
            return;
        }
        const toolkitId = typeof ctx.resolveToolkitId === 'function'
            ? ctx.resolveToolkitId()
            : '';
        const providerId = resolveChromeProviderId(slotId);
        if (toolkitId) {
            container.setAttribute('data-window-chrome-toolkit', toolkitId);
        }
        if (providerId) {
            container.setAttribute('data-window-chrome-provider', providerId);
        }
    }

    function afterInject(container, slotId) {
        const provider = getChromeProvider(slotId);
        if (typeof provider.afterInject === 'function') {
            provider.afterInject(container, slotId);
        }
        stampChromeToolkitAttributes(container, slotId);
    }

    global.CapsuleWindowChrome = {
        registerChromeProvider,
        getChromeProvider,
        resolveChromeProviderId,
        ensureHeader,
        afterInject,
        syncFirefoxGnomeChrome,
        applyKdeWindowHeaderIcons,
        getHeaderTemplate,
        isKdeFamily,
        isNautilusFamilyExplorer,
        isDolphinExplorerSlot,
        isNautilusFamilySlot,
    };
}(typeof window !== 'undefined' ? window : globalThis));
