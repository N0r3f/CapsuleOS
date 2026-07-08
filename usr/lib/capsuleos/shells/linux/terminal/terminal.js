'use strict';
function terminalQuery(root, selector, fallbackSelector) {
    if (root.matches && root.matches(selector)) {
        return root;
    }
    const nested = root.querySelector(selector);
    if (nested) {
        return nested;
    }
    return fallbackSelector ? root.querySelector(fallbackSelector) : null;
}

function createTerminalElement(tag, className, dataName) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (dataName) {
        element.setAttribute(dataName, '');
    }
    return element;
}

function ensureTerminalShell(container) {
    let app = terminalQuery(container, '[data-terminal-app]', '#terminalContainer');
    if (!app) {
        app = createTerminalElement('section', 'capsule-terminal', 'data-terminal-app');
        container.appendChild(app);
    }

    let output = terminalQuery(app, '[data-terminal-output]', '#output');
    if (!output) {
        output = createTerminalElement('div', 'capsule-terminal__output', 'data-terminal-output');
        output.id = 'output';
        app.appendChild(output);
    }

    let form = terminalQuery(app, '[data-terminal-form]', '#input');
    if (!form) {
        form = createTerminalElement('form', 'capsule-terminal__input', 'data-terminal-form');
        form.id = 'input';
        app.appendChild(form);
    }

    let prompt = terminalQuery(form, '[data-terminal-prompt]', '#prompt');
    if (!prompt) {
        prompt = createTerminalElement('span', 'capsule-terminal__prompt', 'data-terminal-prompt');
        prompt.id = 'prompt';
        form.appendChild(prompt);
    }

    let commandInput = terminalQuery(form, '[data-terminal-command]', '#command');
    if (!commandInput) {
        commandInput = createTerminalElement('input', 'capsule-terminal__command', 'data-terminal-command');
        commandInput.id = 'command';
        commandInput.type = 'text';
        commandInput.autocomplete = 'off';
        commandInput.spellcheck = false;
        form.appendChild(commandInput);
    }

    return { app, output, form, prompt, commandInput };
}

function resolveTerminalLineClassName(text, className) {
    if (className) {
        return className;
    }
    const trimmed = String(text || '').trim();
    if (trimmed === 'Terminé !' || trimmed === 'Complete!') {
        return 'capsule-terminal__line capsule-terminal__line--success';
    }
    return 'capsule-terminal__line';
}

function renderTerminalLine(output, text, className) {
    const row = document.createElement('div');
    row.className = resolveTerminalLineClassName(text, className);

    const code = document.createElement('code');
    code.textContent = text;
    row.appendChild(code);
    output.appendChild(row);
}

const PTYXIS_TERMINAL_BODY_IDS = new Set(['rocky', 'fedora', 'alma', 'ubuntu', 'anduinos']);

function usesPtyxisTerminalChrome() {
    return Boolean(document.body && PTYXIS_TERMINAL_BODY_IDS.has(document.body.id));
}

function hostHasColoredTerminalChrome(node) {
    const host = node && node.closest ? node.closest('[data-link="terminal"], #terminal') : null;
    if (!host) {
        return false;
    }
    if (usesPtyxisTerminalChrome() && host.dataset.link === 'terminal') {
        return true;
    }
    return Boolean(
        host.classList.contains('terminal-window--gnome')
        || host.classList.contains('terminal-window--cosmic')
        || host.classList.contains('terminal-window--fedora')
        || (document.body && document.body.id === 'ubuntu')
    );
}

function appendPromptSegments(parent, text) {
    const trimmed = String(text || '').replace(/\s+$/, '');
    const match = trimmed.match(/^(.+@[^:]+)(:)([^$]+)(\$\s*)$/);
    if (!match) {
        parent.appendChild(document.createTextNode(trimmed));
        return;
    }
    const userHost = document.createElement('span');
    userHost.className = 'capsule-terminal__prompt-user';
    userHost.textContent = match[1];
    const colon = document.createElement('span');
    colon.className = 'capsule-terminal__prompt-colon';
    colon.textContent = match[2];
    const pathSeg = document.createElement('span');
    pathSeg.className = 'capsule-terminal__prompt-path-seg';
    pathSeg.textContent = match[3];
    const dollar = document.createElement('span');
    dollar.className = 'capsule-terminal__prompt-dollar';
    dollar.textContent = match[4];
    parent.append(userHost, colon, pathSeg, dollar);
}

function renderExecutedCommand(output, promptText, command) {
    const row = document.createElement('div');
    row.className = 'capsule-terminal__line capsule-terminal__line--command';

    const lineCode = document.createElement('code');
    lineCode.className = 'capsule-terminal__command-line';
    const prompt = String(promptText || '').replace(/\s+$/, '');
    const cmd = String(command || '').trim();
    if (hostHasColoredTerminalChrome(output)) {
        appendPromptSegments(lineCode, prompt);
        if (cmd) {
            lineCode.appendChild(document.createTextNode(` ${cmd}`));
        }
    } else {
        lineCode.textContent = cmd ? `${prompt} ${cmd}` : prompt;
    }
    row.appendChild(lineCode);

    output.appendChild(row);
}

function scrollTerminalToBottom(elements) {
    if (!elements || !elements.output) {
        return;
    }
    const app = elements.app;
    if (usesPtyxisTerminalChrome() && app) {
        const fitsInView = app.scrollHeight <= app.clientHeight + 1;
        if (fitsInView) {
            app.scrollTop = 0;
            if (elements.output) {
                elements.output.scrollTop = 0;
            }
            if (app.parentElement) {
                app.parentElement.scrollTop = 0;
            }
            return;
        }
    }
    const targets = [elements.output, app, app && app.parentElement].filter(Boolean);
    targets.forEach((target) => {
        target.scrollTop = target.scrollHeight;
    });
}

function updateTerminalPrompt(elements, session) {
    const promptText = session.getPrompt();
    paintTerminalPrompt(elements.prompt, promptText);
    const windowElement = elements.app.closest('.windowElement');
    syncGnomeTerminalTitle(windowElement, promptText);
    syncTerminalGnomeDataset(windowElement);
}

function createFedoraTerminalButton(className, label, text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    if (text) {
        button.textContent = text;
    }
    return button;
}

function resolveFedoraTerminalPrompt() {
    const profile = typeof window.CAPSULE_TERMINAL_PROFILE === 'string'
        ? window.CAPSULE_TERMINAL_PROFILE
        : '';
    const bodyId = document.body && document.body.id ? document.body.id : '';
    if (bodyId === 'rocky' || profile === 'rocky') {
        return 'capsule@rocky:~';
    }
    if (bodyId === 'alma' || profile === 'alma') {
        return 'capsule@alma:~';
    }
    if (bodyId === 'ubuntu' || profile === 'ubuntu') {
        return 'capsule@ubuntu:~';
    }
    if (bodyId === 'fedora' || profile === 'fedora') {
        return 'capsule@fedora:~';
    }
    if (bodyId === 'anduinos' || profile === 'anduinos') {
        return 'capsule@anduinos:~';
    }
    return 'capsule@fedora:~';
}

function supportsTerminalGnomeDataset() {
    return usesPtyxisTerminalChrome();
}

function syncTerminalGnomeDataset(windowElement) {
    if (!supportsTerminalGnomeDataset()) {
        return;
    }
    const win = windowElement && windowElement.dataset && windowElement.dataset.link === 'terminal'
        ? windowElement
        : (windowElement && windowElement.closest
            ? windowElement.closest('.windowElement[data-link="terminal"]')
            : null)
        || document.querySelector('.windowElement.windowElementActive[data-link="terminal"]')
        || document.querySelector('.windowElement[data-link="terminal"]');
    if (!win) {
        return;
    }
    const app = win.querySelector('[data-terminal-app]');
    const session = app && app.__capsuleTerminalSession;
    const tabState = win.__capsuleTerminalTabState;
    const promptText = session && typeof session.getPrompt === 'function'
        ? session.getPrompt()
        : `${resolveFedoraTerminalPrompt()}$ `;
    const tabCount = tabState && Array.isArray(tabState.tabs) ? tabState.tabs.length : 1;
    const activeTabId = tabState && tabState.activeTabId ? tabState.activeTabId : 'tab-1';
    const cwd = session && session.state ? session.state.cwd : '/';
    const history = session && session.state && Array.isArray(session.state.history)
        ? session.state.history
        : [];
    const lastCmd = history.length ? history[history.length - 1] : '';
    const ready = app && app.dataset.terminalReady === 'true';
    const markers = [
        win.querySelector('[data-terminal-gnome-root]'),
        win.querySelector('#terminalContainer'),
        app,
    ].filter(Boolean);
    markers.forEach((node) => {
        node.dataset.terminalGnomeInit = ready ? 'true' : 'false';
        node.dataset.terminalGnomePrompt = String(promptText).replace(/\$\s*$/, '').trim();
        node.dataset.terminalGnomeTabCount = String(tabCount);
        node.dataset.terminalGnomeActiveTabId = activeTabId;
        node.dataset.terminalGnomeCwd = cwd;
        node.dataset.ptyxisGnomeProvider = 'ptyxis-gnome';
        node.dataset.terminalGnomeChrome = 'ptyxis';
        if (lastCmd) {
            node.dataset.terminalGnomeLastCommand = lastCmd;
        }
    });
}

function ensureFedoraTerminalWindowControls(header) {
    if (!header) {
        return;
    }
    const right = header.querySelectorAll('nav')[1];
    if (!right || right.querySelector('.fedora-terminal-header__window-controls')) {
        return;
    }
    const controls = document.createElement('div');
    controls.className = 'fedora-terminal-header__window-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Contrôles de fenêtre');
    ['#minimizeBtn', '#resizeBtn', '#closeBtn'].forEach((selector) => {
        const button = header.querySelector(selector);
        if (button) {
            controls.appendChild(button);
        }
    });
    if (controls.childElementCount) {
        right.appendChild(controls);
    }
}

function ensureFedoraTerminalTabsSlot(header) {
    let tabsSlot = header.querySelector('.fedora-terminal-header__tabs');
    if (!tabsSlot) {
        tabsSlot = document.createElement('div');
        tabsSlot.className = 'fedora-terminal-header__tabs';
        tabsSlot.setAttribute('data-window-drag-region', '');
        const title = header.querySelector('#windowTitle');
        const navs = header.querySelectorAll('nav');
        const right = navs[1] || null;
        if (right) {
            header.insertBefore(tabsSlot, right);
        } else if (title) {
            header.insertBefore(tabsSlot, title);
        } else {
            header.appendChild(tabsSlot);
        }
    }
    return tabsSlot;
}

function ensureFedoraTerminalTabsChrome(windowElement, header) {
    ensureFedoraTerminalTabsSlot(header);
    const legacyTabs = windowElement.querySelector(':scope > .fedora-terminal-tabs');
    if (legacyTabs) {
        legacyTabs.remove();
    }
}

let fedoraTerminalOpenMenu = null;
let fedoraTerminalOpenMenuAnchor = null;

function closeFedoraTerminalMenu() {
    if (fedoraTerminalOpenMenu) {
        fedoraTerminalOpenMenu.hidden = true;
    }
    if (fedoraTerminalOpenMenuAnchor) {
        fedoraTerminalOpenMenuAnchor.setAttribute('aria-expanded', 'false');
    }
    fedoraTerminalOpenMenu = null;
    fedoraTerminalOpenMenuAnchor = null;
}

function resolveTerminalAboutLabel() {
    if (usesPtyxisTerminalChrome()) {
        return 'À propos de Ptyxis';
    }
    return 'À propos du terminal';
}

function ensureMintTerminalPrefsDialog(windowElement) {
    if (!windowElement) {
        return null;
    }
    let dialog = windowElement.querySelector('#mint-terminal-prefs');
    if (dialog) {
        return dialog;
    }
    dialog = document.createElement('div');
    dialog.id = 'mint-terminal-prefs';
    dialog.className = 'terminal-prefs fedora-terminal-popover';
    dialog.hidden = true;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-label', 'Préférences du terminal');
    dialog.innerHTML = [
        '<div class="terminal-prefs__tabs" role="tablist">',
        '<button type="button" class="terminal-prefs__tab is-active" data-terminal-prefs-tab="general">Général</button>',
        '<button type="button" class="terminal-prefs__tab" data-terminal-prefs-tab="colors">Couleurs</button>',
        '<button type="button" class="terminal-prefs__tab" data-terminal-prefs-tab="compat">Compatibilité</button>',
        '</div>',
        '<div class="terminal-prefs__panel" data-terminal-prefs-panel="general">',
        '<p>Profil par défaut : capsule@mint</p>',
        '</div>',
        '<div class="terminal-prefs__panel" data-terminal-prefs-panel="colors" hidden>',
        '<p>Schéma Mint Yaru intégré</p>',
        '</div>',
        '<div class="terminal-prefs__panel" data-terminal-prefs-panel="compat" hidden>',
        '<p>Compatibilité bash 5.1</p>',
        '</div>',
        '<button type="button" class="terminal-prefs__close" data-terminal-prefs-close>Fermer</button>',
    ].join('');
    windowElement.appendChild(dialog);
    dialog.querySelectorAll('[data-terminal-prefs-tab]').forEach((tabBtn) => {
        tabBtn.addEventListener('click', () => {
            dialog.querySelectorAll('[data-terminal-prefs-tab]').forEach((node) => {
                node.classList.toggle('is-active', node === tabBtn);
            });
            dialog.querySelectorAll('[data-terminal-prefs-panel]').forEach((panel) => {
                panel.hidden = panel.getAttribute('data-terminal-prefs-panel') !== tabBtn.dataset.terminalPrefsTab;
            });
        });
    });
    dialog.querySelector('[data-terminal-prefs-close]').addEventListener('click', () => {
        dialog.hidden = true;
    });
    return dialog;
}

function openMintTerminalPrefs(windowElement) {
    const dialog = ensureMintTerminalPrefsDialog(windowElement);
    if (dialog) {
        dialog.hidden = false;
    }
}

function createFedoraTerminalMenu(windowElement) {
    let menu = windowElement.querySelector('#fedora-terminal-main-menu');
    if (menu) {
        return menu;
    }

    menu = document.createElement('div');
    menu.id = 'fedora-terminal-main-menu';
    menu.className = 'fedora-terminal-popover';
    menu.hidden = true;
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Menu du terminal');

    const entries = [
        { action: 'new-tab', label: 'Nouvel onglet' },
        { action: 'new-window', label: 'Nouvelle fenêtre' },
        { type: 'separator' },
        { action: 'preferences', label: 'Préférences…' },
        { action: 'shortcuts', label: 'Raccourcis clavier…' },
        { type: 'separator' },
        { action: 'about', label: resolveTerminalAboutLabel() },
    ];

    entries.forEach((entry) => {
        if (entry.type === 'separator') {
            const sep = document.createElement('div');
            sep.className = 'fedora-terminal-popover__separator';
            sep.setAttribute('role', 'separator');
            menu.appendChild(sep);
            return;
        }
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'fedora-terminal-popover__item';
        item.setAttribute('role', 'menuitem');
        item.dataset.terminalMenuAction = entry.action;
        item.textContent = entry.label;
        menu.appendChild(item);
    });

    windowElement.appendChild(menu);
    return menu;
}

function openFedoraTerminalMenu(menu, anchor) {
    if (!menu || !anchor) {
        return;
    }
    closeFedoraTerminalMenu();
    menu.hidden = false;
    const anchorRect = anchor.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const left = Math.max(8, Math.min(anchorRect.right - menuRect.width, window.innerWidth - menuRect.width - 8));
    const top = Math.min(anchorRect.bottom + 4, window.innerHeight - menuRect.height - 8);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    anchor.setAttribute('aria-expanded', 'true');
    fedoraTerminalOpenMenu = menu;
    fedoraTerminalOpenMenuAnchor = anchor;
}

function runFedoraTerminalMenuAction(action, windowElement, header) {
    if (action === 'new-tab') {
        if (typeof window.openTerminalTab === 'function') {
            window.openTerminalTab();
        }
        return;
    }
    if (action === 'new-window') {
        if (typeof window.openNewWindowByDataLink === 'function') {
            window.openNewWindowByDataLink('terminal');
        } else if (typeof window.openWindowByDataLink === 'function') {
            window.openWindowByDataLink('terminal', { newWindow: true });
        }
        return;
    }
    if (action === 'preferences') {
        if (document.body && document.body.id === 'mint') {
            openMintTerminalPrefs(windowElement);
            return;
        }
        if (typeof window.openWindowByDataLink === 'function') {
            window.openWindowByDataLink('themes');
        }
        return;
    }
    if (action === 'shortcuts') {
        const shortcuts = [
            'Ctrl+Shift+T — Nouvel onglet',
            'Ctrl+Shift+W — Fermer l’onglet',
            'Ctrl+Shift+N — Nouvelle fenêtre',
            'Ctrl+Shift+F — Rechercher',
        ].join('\n');
        window.alert(shortcuts);
        return;
    }
    if (action === 'about') {
        const bodyId = document.body && document.body.id ? document.body.id : 'linux';
        window.alert(`${resolveTerminalAboutLabel()}\nTerminal simulé CapsuleOS (profil ${bodyId}).`);
    }
}

function bindFedoraTerminalMenu(windowElement, header, menuButton) {
    if (!windowElement || !header || !menuButton || menuButton.dataset.terminalMenuBound === 'true') {
        return;
    }
    menuButton.dataset.terminalMenuBound = 'true';
    const menu = createFedoraTerminalMenu(windowElement);

    menuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!menu.hidden && fedoraTerminalOpenMenu === menu) {
            closeFedoraTerminalMenu();
            return;
        }
        openFedoraTerminalMenu(menu, menuButton);
    });

    menu.addEventListener('click', (event) => {
        const item = event.target.closest('[data-terminal-menu-action]');
        if (!item) {
            return;
        }
        event.stopPropagation();
        runFedoraTerminalMenuAction(item.dataset.terminalMenuAction, windowElement, header);
        closeFedoraTerminalMenu();
    });

    if (document.documentElement.dataset.terminalMenuOutsideClose !== 'true') {
        document.documentElement.dataset.terminalMenuOutsideClose = 'true';
        document.addEventListener('click', () => closeFedoraTerminalMenu());
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeFedoraTerminalMenu();
            }
        });
    }
}

function bindGnomeTerminalChromeInteractions(windowElement) {
    const header = windowElement.querySelector('#windowHeader');
    if (!header || header.dataset.gnomeTerminalInteractions === 'true') {
        return;
    }
    header.dataset.gnomeTerminalInteractions = 'true';

    const newTabBtn = header.querySelector('.gnome-terminal-header__button--new-tab');
    if (newTabBtn) {
        newTabBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (typeof window.openTerminalTab === 'function') {
                window.openTerminalTab();
            }
        });
    }

    const searchBtn = header.querySelector('.gnome-terminal-header__button--search');
    if (searchBtn) {
        searchBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const command = windowElement.querySelector('#command, [data-terminal-command]');
            if (command) {
                command.focus();
                if (typeof command.select === 'function') {
                    command.select();
                }
            }
        });
    }

    let menuBtn = header.querySelector('.gnome-terminal-header__button--menu');
    if (!menuBtn) {
        menuBtn = createFedoraTerminalButton(
            'gnome-terminal-header__button gnome-terminal-header__button--menu',
            'Menu'
        );
        const right = header.querySelectorAll('nav')[1];
        const minimize = right && right.querySelector('#minimizeBtn');
        if (right) {
            if (minimize) {
                right.insertBefore(menuBtn, minimize);
            } else {
                right.appendChild(menuBtn);
            }
        }
    }
    bindFedoraTerminalMenu(windowElement, header, menuBtn);
}

function isGnomeTerminalChrome() {
    return Boolean(document.body && (document.body.id === 'ubuntu' || document.body.id === 'popos' || document.body.id === 'mint'));
}

function isCosmicTerminalChrome() {
    return Boolean(document.body && document.body.id === 'popos');
}

function paintTerminalPrompt(promptEl, text) {
    if (!promptEl) {
        return;
    }
    const colored = hostHasColoredTerminalChrome(promptEl);
    const isActivePrompt = Boolean(promptEl.closest('[data-terminal-form], #input'));
    if (colored && isActivePrompt && text.match(/^(.+@[^:]+)(:)([^$]+)(\$\s*)$/)) {
        promptEl.textContent = '';
        appendPromptSegments(promptEl, text);
        return;
    }
    promptEl.textContent = text;
}

function paintGnomeTerminalTitle(titleEl, promptText) {
    if (!titleEl) {
        return;
    }
    const text = String(promptText || '').replace(/\$\s*$/, '');
    const match = text.match(/^(.+@[^:]+)(:.*)$/);
    if (!match) {
        titleEl.textContent = text;
        return;
    }
    titleEl.textContent = '';
    const userHost = document.createElement('span');
    userHost.className = 'capsule-terminal__title-user';
    userHost.textContent = match[1];
    const rest = document.createElement('span');
    rest.className = 'capsule-terminal__title-rest';
    rest.textContent = match[2];
    titleEl.append(userHost, rest);
}

function syncGnomeTerminalTitle(windowElement, promptText) {
    if (!windowElement || !isGnomeTerminalChrome()) {
        return;
    }
    const title = windowElement.querySelector('#windowTitle');
    paintGnomeTerminalTitle(title, promptText);
}

function getListingColumnWidth(lines, fallbackWidth) {
    if (window.CapsuleTerminalListing && typeof window.CapsuleTerminalListing.inferColumnWidth === 'function') {
        return window.CapsuleTerminalListing.inferColumnWidth(lines, fallbackWidth);
    }
    const names = (lines || []).flatMap((line) => (
        String(line || '').trim().split(/\s+/).filter(Boolean)
    )).map((name) => (name.startsWith('/') ? name.slice(1) : name));
    if (!names.length) {
        return 10;
    }
    return Math.max(...names.map((name) => name.length)) + 3;
}

function renderListingLine(output, line, session, columnWidthCh) {
    if (window.CapsuleTerminalListing && typeof window.CapsuleTerminalListing.renderLine === 'function') {
        window.CapsuleTerminalListing.renderLine(output, line, session, columnWidthCh);
        return;
    }
    const row = document.createElement('div');
    row.className = 'capsule-terminal__line capsule-terminal__line--listing';
    const code = document.createElement('code');
    code.textContent = String(line || '');
    row.appendChild(code);
    output.appendChild(row);
}

function decorateCosmicTerminalWindow(container) {
    if (!isCosmicTerminalChrome()) {
        return;
    }

    const windowElement = container.closest('.windowElement');
    if (!windowElement || windowElement.dataset.link !== 'terminal') {
        return;
    }

    windowElement.classList.add('terminal-window--cosmic');

    const applyChrome = () => {
        const header = windowElement.querySelector('#windowHeader');
        if (!header) {
            return false;
        }
        if (header.dataset.cosmicTerminalChrome === 'true') {
            return true;
        }

        header.dataset.cosmicTerminalChrome = 'true';
        const navs = header.querySelectorAll('nav');
        const left = navs[0];
        const right = navs[1];

        if (left) {
            left.innerHTML = '';
            ['Fichier', 'Modifier', 'Affichage'].forEach((label) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'cosmic-terminal-header__menu';
                item.textContent = label;
                item.tabIndex = -1;
                left.appendChild(item);
            });
        }

        if (right) {
            right.querySelectorAll('.gnome-terminal-header__button').forEach((node) => node.remove());
            const addTab = createFedoraTerminalButton(
                'cosmic-terminal-header__button cosmic-terminal-header__button--new-tab',
                'Nouvel onglet',
                ''
            );
            const minimize = right.querySelector('#minimizeBtn');
            if (minimize) {
                right.insertBefore(addTab, minimize);
            } else {
                right.appendChild(addTab);
            }
        }

        return true;
    };

    const refreshCosmicTerminalPromptChrome = () => {
        const app = windowElement.querySelector('[data-terminal-app]');
        if (!app || !app.__capsuleTerminalSession) {
            return;
        }
        const promptText = app.__capsuleTerminalSession.getPrompt();
        const promptEl = windowElement.querySelector('[data-terminal-prompt], #prompt');
        if (promptEl) {
            paintTerminalPrompt(promptEl, promptText);
        }
        syncGnomeTerminalTitle(windowElement, promptText);
    };

    if (applyChrome()) {
        refreshCosmicTerminalPromptChrome();
    } else if (windowElement.dataset.cosmicTerminalObserver !== 'true') {
        windowElement.dataset.cosmicTerminalObserver = 'true';
        const observer = new MutationObserver(() => {
            if (applyChrome()) {
                observer.disconnect();
                refreshCosmicTerminalPromptChrome();
            }
        });
        observer.observe(windowElement, { childList: true });
    }
}

function decorateGnomeTerminalWindow(container) {
    if (!isGnomeTerminalChrome()) {
        return;
    }

    const windowElement = container.closest('.windowElement');
    if (!windowElement || windowElement.dataset.link !== 'terminal') {
        return;
    }

    if (isCosmicTerminalChrome()) {
        decorateCosmicTerminalWindow(container);
        return;
    }

    if (usesPtyxisTerminalChrome()) {
        return;
    }

    windowElement.classList.add('terminal-window--gnome');

    const applyChrome = () => {
        const header = windowElement.querySelector('#windowHeader');
        if (!header) {
            return false;
        }
        if (header.dataset.gnomeTerminalChrome === 'true') {
            return true;
        }

        header.dataset.gnomeTerminalChrome = 'true';
        const navs = header.querySelectorAll('nav');
        const left = navs[0];
        const right = navs[1];

        if (left) {
            left.innerHTML = '';
            const addTab = createFedoraTerminalButton(
                'gnome-terminal-header__button gnome-terminal-header__button--new-tab',
                'Nouvel onglet',
                ''
            );
            left.appendChild(addTab);
        }

        if (right) {
            const existingChrome = right.querySelectorAll('.gnome-terminal-header__button');
            existingChrome.forEach((node) => node.remove());

            const search = createFedoraTerminalButton(
                'gnome-terminal-header__button gnome-terminal-header__button--search',
                'Rechercher'
            );
            const menu = createFedoraTerminalButton(
                'gnome-terminal-header__button gnome-terminal-header__button--menu',
                'Menu'
            );
            const minimize = right.querySelector('#minimizeBtn');
            if (minimize) {
                right.insertBefore(search, minimize);
                right.insertBefore(menu, minimize);
            } else {
                right.appendChild(search);
                right.appendChild(menu);
            }
        }

        return true;
    };

    const refreshGnomeTerminalPromptChrome = () => {
        const app = windowElement.querySelector('[data-terminal-app]');
        if (!app || !app.__capsuleTerminalSession) {
            return;
        }
        const promptText = app.__capsuleTerminalSession.getPrompt();
        const promptEl = windowElement.querySelector('[data-terminal-prompt], #prompt');
        if (promptEl) {
            paintTerminalPrompt(promptEl, promptText);
        }
        syncGnomeTerminalTitle(windowElement, promptText);
    };

    if (applyChrome()) {
        refreshGnomeTerminalPromptChrome();
        bindGnomeTerminalChromeInteractions(windowElement);
        if (document.body && document.body.id === 'mint' && typeof window.scheduleTerminalTabsBind === 'function') {
            window.scheduleTerminalTabsBind(windowElement);
        }
    } else if (windowElement.dataset.gnomeTerminalObserver !== 'true') {
        windowElement.dataset.gnomeTerminalObserver = 'true';
        const observer = new MutationObserver(() => {
            if (applyChrome()) {
                observer.disconnect();
                refreshGnomeTerminalPromptChrome();
                bindGnomeTerminalChromeInteractions(windowElement);
                if (document.body && document.body.id === 'mint' && typeof window.scheduleTerminalTabsBind === 'function') {
                    window.scheduleTerminalTabsBind(windowElement);
                }
            }
        });
        observer.observe(windowElement, { childList: true });
    }
}

function decorateFedoraTerminalWindow(container) {
    if (!usesPtyxisTerminalChrome()) {
        return;
    }

    const windowElement = container.closest('.windowElement');
    if (!windowElement || windowElement.dataset.link !== 'terminal') {
        return;
    }

    windowElement.classList.remove('terminal-window--gnome');
    windowElement.classList.add('terminal-window--fedora', 'terminal-window--csd');

    const refreshFedoraTerminalPromptChrome = () => {
        const app = windowElement.querySelector('[data-terminal-app]');
        const promptEl = windowElement.querySelector('[data-terminal-prompt], #prompt');
        if (!promptEl) {
            return;
        }
        const promptText = app && app.__capsuleTerminalSession && typeof app.__capsuleTerminalSession.getPrompt === 'function'
            ? app.__capsuleTerminalSession.getPrompt()
            : promptEl.textContent;
        paintTerminalPrompt(promptEl, promptText);
    };

    refreshFedoraTerminalPromptChrome();

    const applyChrome = () => {
        const header = windowElement.querySelector('#windowHeader');
        if (!header) {
            return false;
        }
        if (header.dataset.fedoraTerminalChrome === 'true') {
            ensureFedoraTerminalWindowControls(header);
            return true;
        }

        header.dataset.fedoraTerminalChrome = 'true';
        header.classList.add('fedora-terminal-header');
        const navs = header.querySelectorAll('nav');
        const left = navs[0];
        const right = navs[1];
        const title = header.querySelector('#windowTitle');
        if (title) {
            title.hidden = true;
            title.setAttribute('aria-hidden', 'true');
        }

        // Sauver les contrôles fenêtre (nav gauche du gabarit) avant de vider left.
        ensureFedoraTerminalWindowControls(header);

        if (left) {
            left.innerHTML = '';
            const addTab = createFedoraTerminalButton(
                'fedora-terminal-header__button fedora-terminal-header__button--add',
                'Nouvel onglet',
                '+'
            );
            addTab.setAttribute('aria-pressed', 'false');
            left.appendChild(addTab);
            addTab.addEventListener('click', (event) => {
                event.stopPropagation();
                if (typeof window.openTerminalTab === 'function') {
                    window.openTerminalTab();
                }
            });
        }

        if (right && !right.querySelector('.fedora-terminal-header__button--grid')) {
            const grid = createFedoraTerminalButton(
                'fedora-terminal-header__button fedora-terminal-header__button--grid',
                'Vue en grille'
            );
            right.insertBefore(grid, right.firstChild);
        }

        if (right && !right.querySelector('.fedora-terminal-header__button--menu')) {
            const menu = createFedoraTerminalButton(
                'fedora-terminal-header__button fedora-terminal-header__button--menu',
                'Menu'
            );
            const anchor = right.querySelector('.fedora-terminal-header__window-controls')
                || right.querySelector('#minimizeBtn');
            if (anchor) {
                right.insertBefore(menu, anchor);
            } else {
                right.appendChild(menu);
            }
            bindFedoraTerminalMenu(windowElement, header, menu);
        }

        ensureFedoraTerminalTabsChrome(windowElement, header);
        if (typeof window.scheduleTerminalTabsBind === 'function') {
            window.scheduleTerminalTabsBind(windowElement);
        }
        refreshFedoraTerminalPromptChrome();
        return true;
    };

    if (!applyChrome() && windowElement.dataset.fedoraTerminalObserver !== 'true') {
        windowElement.dataset.fedoraTerminalObserver = 'true';
        const observer = new MutationObserver(() => {
            if (applyChrome()) {
                observer.disconnect();
                refreshFedoraTerminalPromptChrome();
                if (typeof window.scheduleTerminalTabsBind === 'function') {
                    window.scheduleTerminalTabsBind(windowElement);
                }
            }
        });
        observer.observe(windowElement, { childList: true });
    } else if (typeof window.scheduleTerminalTabsBind === 'function') {
        window.scheduleTerminalTabsBind(windowElement);
    }
}

function initTerminal() {
    initTerminalWhenReady();
}

function bindTerminalCommandHistory(commandInput, session) {
    let historyIndex = -1;
    let draftLine = '';

    commandInput.addEventListener('keydown', (event) => {
        const entries = session.state.history || [];
        if (event.key === 'ArrowUp') {
            if (!entries.length) {
                return;
            }
            event.preventDefault();
            if (historyIndex === -1) {
                draftLine = commandInput.value;
            }
            if (historyIndex < entries.length - 1) {
                historyIndex += 1;
                commandInput.value = entries[entries.length - 1 - historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            if (historyIndex === -1) {
                return;
            }
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex -= 1;
                commandInput.value = entries[entries.length - 1 - historyIndex];
            } else {
                historyIndex = -1;
                commandInput.value = draftLine;
            }
        }
    });

    commandInput.addEventListener('input', () => {
        historyIndex = -1;
        draftLine = '';
    });
}

function resetTerminalHistoryCursor(commandInput) {
    commandInput.dispatchEvent(new Event('input'));
}

function initTerminalForContainer(windowElement) {
    const host = windowElement && windowElement.classList && windowElement.classList.contains('windowElement')
        ? windowElement
        : (windowElement && windowElement.closest ? windowElement.closest('.windowElement') : null);
    if (!host || host.dataset.link !== 'terminal') {
        return;
    }

    const container = host.querySelector('#terminalContainer') || host.querySelector('[data-terminal-app]');

    if (!container || !window.CapsuleTerminal || typeof window.executeTerminalCommand !== 'function') {
        setTimeout(() => initTerminalForContainer(host), 100);
        return;
    }

    const elements = ensureTerminalShell(container);
    decorateGnomeTerminalWindow(container);
    decorateFedoraTerminalWindow(container);
    const forceFresh = window.CAPSULE_TERMINAL_FORCE_FRESH === true
        || (window.CAPSULE_TERMINAL_LAUNCH_CWD != null && window.CAPSULE_TERMINAL_LAUNCH_CWD !== '');
    if (forceFresh && elements.app.dataset.terminalReady === 'true') {
        if (typeof window.purgeTerminalWindowRuntime === 'function') {
            window.purgeTerminalWindowRuntime(host);
        }
    } else if (elements.app.dataset.terminalReady === 'true') {
        const session = elements.app.__capsuleTerminalSession;
        if (typeof window.scheduleTerminalTabsBind === 'function' && session) {
            window.scheduleTerminalTabsBind(host);
        }
        if (host.classList.contains('windowElementActive')) {
            elements.commandInput.focus();
        }
        return;
    }

    if (elements.app.dataset.terminalBooting === 'true') {
        return;
    }
    elements.app.dataset.terminalBooting = 'true';

    const activeProfile = typeof window.getTerminalActiveProfile === 'function'
        ? window.getTerminalActiveProfile()
        : (window.CAPSULE_TERMINAL_ACTIVE_PROFILE || {});
    const kernelName = activeProfile.osFamily === 'linux'
        ? `CapsuleOS Linux (${activeProfile.distro || 'generic'})`
        : `CapsuleOS ${activeProfile.osFamily || 'OS'}`;

    const bootTerminal = async () => {
        if (elements.output) {
            elements.output.innerHTML = '';
        }
        if (elements.commandInput) {
            elements.commandInput.value = '';
            elements.commandInput.disabled = false;
        }

        const baseFs = typeof fileSystem !== 'undefined' ? fileSystem : {};
        let fileContents = (typeof window !== 'undefined' && window.CAPSULE_TERMINAL_FILE_CONTENTS) || {};
        let fileHrefs = {};

        if (window.CapsuleVirtualShell && typeof window.CapsuleVirtualShell.prepareTerminalFilesystem === 'function') {
            const hydration = await window.CapsuleVirtualShell.prepareTerminalFilesystem(baseFs);
            fileContents = hydration.fileContents || fileContents;
            fileHrefs = hydration.fileHrefs || fileHrefs;
        }

        const session = window.CapsuleTerminal.createSession({
            cwd: consumeTerminalLaunchCwd(),
            home: window.CAPSULE_TERMINAL_HOME || '/',
            user: window.CAPSULE_TERMINAL_USER || 'user',
            host: window.CAPSULE_TERMINAL_HOST || 'host',
            fs: baseFs,
            fileContents,
            fileHrefs,
            kernelName
        });

        elements.app.dataset.terminalReady = 'true';
        delete elements.app.dataset.terminalBooting;
        elements.app.__capsuleTerminalSession = session;
        updateTerminalPrompt(elements, session);
        if (!usesPtyxisTerminalChrome() || elements.output.childElementCount > 0) {
            scrollTerminalToBottom(elements);
        } else if (elements.app) {
            elements.app.scrollTop = 0;
        }

        elements.app.addEventListener('click', () => {
            elements.commandInput.focus();
        });

        bindTerminalCommandHistory(elements.commandInput, session);

        if (window.CapsuleTerminalCompletion
            && typeof window.CapsuleTerminalCompletion.bindTabCompletion === 'function') {
            window.CapsuleTerminalCompletion.bindTabCompletion(
                elements.commandInput,
                session,
                elements.output
            );
        }

        elements.form.addEventListener('submit', (event) => {
            event.preventDefault();
            const command = elements.commandInput.value;
            const promptBeforeExecute = session.getPrompt();
            const result = session.execute(command);

            const renderResultLines = (lines, isError) => {
                (lines || []).forEach((line) => {
                    renderTerminalLine(
                        elements.output,
                        line,
                        isError ? 'capsule-terminal__line capsule-terminal__line--error' : 'capsule-terminal__line'
                    );
                });
            };

            if (result && result.clear) {
                elements.output.innerHTML = '';
            } else {
                renderExecutedCommand(elements.output, promptBeforeExecute, command);
                if (result && result.openEditor && window.CapsuleTerminalEditors
                    && typeof window.CapsuleTerminalEditors.mountInTerminal === 'function') {
                    renderResultLines(result.lines, result.error);
                    elements.commandInput.disabled = true;
                    window.CapsuleTerminalEditors.mountInTerminal(elements.app, session, result.openEditor, {
                        onClose(closed) {
                            elements.commandInput.disabled = false;
                            renderResultLines(closed.lines, closed.error);
                            updateTerminalPrompt(elements, session);
                            scrollTerminalToBottom(elements);
                            if (typeof window.syncTerminalTabs === 'function') {
                                window.syncTerminalTabs(host);
                            }
                            elements.commandInput.focus();
                        }
                    });
                    elements.commandInput.value = '';
                    resetTerminalHistoryCursor(elements.commandInput);
                    return;
                }
                const listingColWidth = result.listing
                    ? getListingColumnWidth(result.lines || [], result.listingColumnWidth)
                    : 0;
                (result.lines || []).forEach((line) => {
                    if (result.listing) {
                        renderListingLine(elements.output, line, session, listingColWidth);
                        return;
                    }
                    renderTerminalLine(
                        elements.output,
                        line,
                        result.error ? 'capsule-terminal__line capsule-terminal__line--error' : 'capsule-terminal__line'
                    );
                });
            }

            elements.commandInput.value = '';
            resetTerminalHistoryCursor(elements.commandInput);
            updateTerminalPrompt(elements, session);
            scrollTerminalToBottom(elements);
            requestAnimationFrame(() => scrollTerminalToBottom(elements));
            if (typeof window.syncTerminalTabs === 'function') {
                window.syncTerminalTabs(host);
            }
            syncTerminalGnomeDataset(host);
            elements.commandInput.focus();
        });

        if (typeof window.scheduleTerminalTabsBind === 'function') {
            window.scheduleTerminalTabsBind(host);
        }
        syncTerminalGnomeDataset(host);
        delete window.CAPSULE_TERMINAL_FORCE_FRESH;

        if (host.classList.contains('windowElementActive')) {
            elements.commandInput.focus();
        }
    };

    bootTerminal().catch((error) => {
        console.error('CapsuleOS: échec initialisation terminal', error);
        delete elements.app.dataset.terminalBooting;
        setTimeout(() => initTerminalForContainer(host), 200);
    });
}

function initTerminalWhenReady() {
    const windows = document.querySelectorAll('.windowElement[data-link="terminal"]');
    if (!windows.length) {
        setTimeout(initTerminalWhenReady, 100);
        return;
    }
    windows.forEach((windowElement) => initTerminalForContainer(windowElement));
}

function mapExplorerPathToTerminalCwd(explorerPath) {
    const normalizeTerminalPath = (path) => (
        window.CapsuleTerminal && typeof window.CapsuleTerminal.normalizePath === 'function'
            ? window.CapsuleTerminal.normalizePath(path)
            : path
    );
    if (window.CapsuleExplorerVfs && typeof window.CapsuleExplorerVfs.manifestPathToTerminalPath === 'function') {
        return normalizeTerminalPath(window.CapsuleExplorerVfs.manifestPathToTerminalPath(explorerPath));
    }
    const normalizeExplorerPath = typeof window.normalizeDirectoryPathForExplorer === 'function'
        ? window.normalizeDirectoryPathForExplorer
        : (path) => path;
    const explorerKey = normalizeExplorerPath(explorerPath);
    const place = window.CAPSULE_PLACE_FILESYSTEM;
    if (!explorerPath || explorerKey === place) {
        return '/';
    }
    if (window.CapsuleExplorerVfs && typeof window.CapsuleExplorerVfs.explorerPathToTerminalPath === 'function') {
        const vfsPath = window.CapsuleExplorerVfs.explorerPathToTerminalPath(explorerKey);
        if (vfsPath) {
            return normalizeTerminalPath(vfsPath);
        }
    }
    const manifestRoot = typeof window.getFileExplorerRoot === 'function'
        ? String(window.getFileExplorerRoot()).replace(/\/+$/, '')
        : '';
    const home = window.CAPSULE_TERMINAL_HOME || window.CAPSULE_USER_HOME || '/home/public';
    const key = String(explorerKey).replace(/\/+$/, '');
    if (!key || key === manifestRoot) {
        return normalizeTerminalPath(home);
    }
    if (manifestRoot && key.indexOf(`${manifestRoot}/`) === 0) {
        return normalizeTerminalPath(`${home}${key.slice(manifestRoot.length)}`);
    }
    return normalizeTerminalPath(home);
}

function consumeTerminalLaunchCwd() {
    const home = window.CAPSULE_TERMINAL_HOME || window.CAPSULE_USER_HOME || '/home/public';
    if (window.CAPSULE_TERMINAL_LAUNCH_CWD == null || window.CAPSULE_TERMINAL_LAUNCH_CWD === '') {
        if (window.CapsuleTerminal && typeof window.CapsuleTerminal.normalizePath === 'function') {
            return window.CapsuleTerminal.normalizePath(home);
        }
        return home;
    }
    const cwd = mapExplorerPathToTerminalCwd(window.CAPSULE_TERMINAL_LAUNCH_CWD);
    delete window.CAPSULE_TERMINAL_LAUNCH_CWD;
    if (window.CapsuleTerminal && typeof window.CapsuleTerminal.normalizePath === 'function') {
        return window.CapsuleTerminal.normalizePath(cwd);
    }
    return cwd;
}

function openTerminalWithExplorerContext(explorerPath) {
    if (explorerPath != null && explorerPath !== '') {
        window.CAPSULE_TERMINAL_LAUNCH_CWD = explorerPath;
    } else {
        delete window.CAPSULE_TERMINAL_LAUNCH_CWD;
    }
    window.CAPSULE_TERMINAL_FORCE_FRESH = true;
    if (typeof window.openNewWindowByDataLink === 'function') {
        return window.openNewWindowByDataLink('terminal');
    }
    if (typeof window.openWindowByDataLink === 'function') {
        return window.openWindowByDataLink('terminal');
    }
    return false;
}

if (typeof window !== 'undefined') {
    window.updateTerminalPrompt = updateTerminalPrompt;
    window.scrollTerminalToBottom = scrollTerminalToBottom;
    window.resolveFedoraTerminalPrompt = resolveFedoraTerminalPrompt;
    window.supportsTerminalGnomeDataset = supportsTerminalGnomeDataset;
    window.syncTerminalGnomeDataset = syncTerminalGnomeDataset;
    window.initTerminalForContainer = initTerminalForContainer;
    window.initTerminalWhenReady = initTerminalWhenReady;
    window.mapExplorerPathToTerminalCwd = mapExplorerPathToTerminalCwd;
    window.consumeTerminalLaunchCwd = consumeTerminalLaunchCwd;
    window.openTerminalWithExplorerContext = openTerminalWithExplorerContext;
}
