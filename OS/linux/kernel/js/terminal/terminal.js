function terminalQuery(root, selector, fallbackSelector) {
    if (root.matches && root.matches(selector)) {
        return root;
    }
    if (fallbackSelector && root.matches && root.matches(fallbackSelector)) {
        return root;
    }
    return root.querySelector(selector) || (fallbackSelector ? root.querySelector(fallbackSelector) : null);
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

function renderTerminalLine(output, text, className) {
    const row = document.createElement('div');
    row.className = className || 'capsule-terminal__line';

    const code = document.createElement('code');
    code.textContent = text;
    row.appendChild(code);
    output.appendChild(row);
}

function hostHasColoredTerminalChrome(node) {
    const host = node && node.closest ? node.closest('[data-link="terminal"], #terminal') : null;
    return Boolean(
        host && (
            host.classList.contains('terminal-window--gnome')
            || host.classList.contains('terminal-window--cosmic')
            || (document.body && document.body.id === 'ubuntu')
        )
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
    const targets = [elements.output, elements.app, elements.app.parentElement].filter(Boolean);
    targets.forEach((target) => {
        target.scrollTop = target.scrollHeight;
    });
}

function updateTerminalPrompt(elements, session) {
    const promptText = session.getPrompt();
    paintTerminalPrompt(elements.prompt, promptText);
    const windowElement = elements.app.closest('.windowElement');
    syncGnomeTerminalTitle(windowElement, promptText);
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

function createFedoraTerminalTabs(windowElement) {
    const tabs = document.createElement('div');
    tabs.className = 'fedora-terminal-tabs';
    tabs.setAttribute('aria-label', 'Onglets du terminal');

    const firstTab = document.createElement('button');
    firstTab.type = 'button';
    firstTab.className = 'fedora-terminal-tabs__tab';
    firstTab.textContent = 'fed@fedora:~';

    const activeTab = document.createElement('button');
    activeTab.type = 'button';
    activeTab.className = 'fedora-terminal-tabs__tab fedora-terminal-tabs__tab--active';
    activeTab.textContent = 'fed@fedora:~';

    const close = document.createElement('span');
    close.className = 'fedora-terminal-tabs__close';
    close.setAttribute('aria-hidden', 'true');
    close.textContent = '×';
    activeTab.appendChild(close);

    tabs.appendChild(firstTab);
    tabs.appendChild(activeTab);
    const header = windowElement.querySelector('#windowHeader');
    windowElement.insertBefore(tabs, header ? header.nextSibling : windowElement.firstChild);
    return tabs;
}

function isGnomeTerminalChrome() {
    return Boolean(document.body && (document.body.id === 'ubuntu' || document.body.id === 'popos'));
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

function isListingDirectory(session, name) {
    if (!window.CapsuleTerminal || !session || !session.state) {
        return false;
    }
    const { fs, cwd, home } = session.state;
    const resolved = window.CapsuleTerminal.resolvePath(cwd, name, home);
    if (fs[resolved] && typeof fs[resolved] === 'object') {
        return true;
    }
    const parent = fs[cwd];
    if (parent && typeof parent === 'object') {
        if (Object.prototype.hasOwnProperty.call(parent, name)) {
            return typeof parent[name] === 'object';
        }
        const slashName = `/${name}`;
        if (Object.prototype.hasOwnProperty.call(parent, slashName)) {
            return typeof parent[slashName] === 'object';
        }
    }
    return false;
}

function getListingColumnWidth(lines) {
    const names = lines.flatMap((line) => (
        String(line || '').trim().split(/\s+/).filter(Boolean)
    )).map((name) => (name.startsWith('/') ? name.slice(1) : name));
    if (!names.length) {
        return 10;
    }
    const longest = Math.max(...names.map((name) => name.length));
    return longest + 3;
}

function renderListingLine(output, line, session, columnWidthCh) {
    const row = document.createElement('div');
    row.className = 'capsule-terminal__line capsule-terminal__line--listing';

    const code = document.createElement('code');
    if (columnWidthCh) {
        const lsVar = document.body && document.body.id === 'popos'
            ? '--popos-terminal-ls-col-width'
            : '--ubuntu-terminal-ls-col-width';
        code.style.setProperty(lsVar, `${columnWidthCh}ch`);
    }
    const names = String(line || '').trim().split(/\s+/).filter(Boolean);
    const gnomeListing = isGnomeTerminalChrome();
    names.forEach((name, index) => {
        const cleanName = name.startsWith('/') ? name.slice(1) : name;
        const span = document.createElement('span');
        span.textContent = cleanName;
        if (gnomeListing || isListingDirectory(session, cleanName)) {
            span.className = 'capsule-terminal__dir';
        }
        code.appendChild(span);
        if (index < names.length - 1) {
            code.appendChild(document.createTextNode('  '));
        }
    });
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
    } else if (windowElement.dataset.gnomeTerminalObserver !== 'true') {
        windowElement.dataset.gnomeTerminalObserver = 'true';
        const observer = new MutationObserver(() => {
            if (applyChrome()) {
                observer.disconnect();
                refreshGnomeTerminalPromptChrome();
            }
        });
        observer.observe(windowElement, { childList: true });
    }
}

function decorateFedoraTerminalWindow(container) {
    if (!document.body || document.body.id !== 'fedora') {
        return;
    }

    const windowElement = container.closest('.windowElement');
    if (!windowElement || windowElement.dataset.link !== 'terminal') {
        return;
    }

    windowElement.classList.add('terminal-window--fedora');

    const applyChrome = () => {
        const header = windowElement.querySelector('#windowHeader');
        if (!header) {
            return false;
        }
        if (header.dataset.fedoraTerminalChrome === 'true') {
            return true;
        }

        header.dataset.fedoraTerminalChrome = 'true';
        const navs = header.querySelectorAll('nav');
        const left = navs[0];
        const right = navs[1];
        const title = header.querySelector('#windowTitle');
        if (title) {
            title.textContent = 'fed@fedora:~';
        }

        if (left) {
            left.innerHTML = '';
            const addTab = createFedoraTerminalButton('fedora-terminal-header__button fedora-terminal-header__button--add', 'Nouvel onglet', '+');
            addTab.setAttribute('aria-pressed', 'false');
            left.appendChild(addTab);
            addTab.addEventListener('click', (event) => {
                event.stopPropagation();
                windowElement.classList.add('terminal-window--multitab');
                addTab.setAttribute('aria-pressed', 'true');
                if (!windowElement.querySelector('.fedora-terminal-tabs')) {
                    createFedoraTerminalTabs(windowElement);
                }
            });
        }

        if (right && !right.querySelector('.fedora-terminal-header__button--grid')) {
            const grid = createFedoraTerminalButton('fedora-terminal-header__button fedora-terminal-header__button--grid', 'Vue en grille');
            right.insertBefore(grid, right.firstChild);
        }

        return true;
    };

    if (!applyChrome() && windowElement.dataset.fedoraTerminalObserver !== 'true') {
        windowElement.dataset.fedoraTerminalObserver = 'true';
        const observer = new MutationObserver(() => {
            if (applyChrome()) {
                observer.disconnect();
            }
        });
        observer.observe(windowElement, { childList: true });
    }
}

function initTerminal() {
    initTerminalWhenReady();
}

function initTerminalWhenReady() {
    const host = document.querySelector('[data-link="terminal"]') || document;
    const container = document.getElementById('terminalContainer') || host.querySelector('[data-terminal-app]');

    if (!container || !window.CapsuleTerminal || typeof window.executeTerminalCommand !== 'function') {
        setTimeout(initTerminalWhenReady, 100);
        return;
    }

    const elements = ensureTerminalShell(container);
    decorateGnomeTerminalWindow(container);
    decorateFedoraTerminalWindow(container);
    if (elements.app.dataset.terminalReady === 'true') {
        elements.commandInput.focus();
        return;
    }

    const activeProfile = typeof window.getTerminalActiveProfile === 'function'
        ? window.getTerminalActiveProfile()
        : (window.CAPSULE_TERMINAL_ACTIVE_PROFILE || {});
    const kernelName = activeProfile.osFamily === 'linux'
        ? `CapsuleOS Linux (${activeProfile.distro || 'generic'})`
        : `CapsuleOS ${activeProfile.osFamily || 'OS'}`;

    const session = window.CapsuleTerminal.createSession({
        cwd: window.CAPSULE_TERMINAL_HOME || '/',
        home: window.CAPSULE_TERMINAL_HOME || '/',
        user: window.CAPSULE_TERMINAL_USER || 'user',
        host: window.CAPSULE_TERMINAL_HOST || 'host',
        fs: typeof fileSystem !== 'undefined' ? fileSystem : {},
        fileContents: (typeof window !== 'undefined' && window.CAPSULE_TERMINAL_FILE_CONTENTS) || {},
        kernelName
    });

    elements.app.dataset.terminalReady = 'true';
    elements.app.__capsuleTerminalSession = session;
    updateTerminalPrompt(elements, session);
    scrollTerminalToBottom(elements);

    elements.app.addEventListener('click', () => {
        elements.commandInput.focus();
    });

    elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const command = elements.commandInput.value;
        const promptBeforeExecute = session.getPrompt();
        const result = session.execute(command);

        if (result && result.clear) {
            elements.output.innerHTML = '';
        } else {
            renderExecutedCommand(elements.output, promptBeforeExecute, command);
            const listingColWidth = result.listing
                ? getListingColumnWidth(result.lines || [])
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
        updateTerminalPrompt(elements, session);
        scrollTerminalToBottom(elements);
        requestAnimationFrame(() => scrollTerminalToBottom(elements));
        elements.commandInput.focus();
    });

    elements.commandInput.focus();
}
