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

function renderExecutedCommand(output, promptText, command) {
    const row = document.createElement('div');
    row.className = 'capsule-terminal__line capsule-terminal__line--command';

    const promptCode = document.createElement('code');
    promptCode.className = 'capsule-terminal__prompt-copy';
    promptCode.textContent = promptText;
    row.appendChild(promptCode);

    const commandCode = document.createElement('code');
    commandCode.className = 'capsule-terminal__command-copy';
    commandCode.textContent = command;
    row.appendChild(commandCode);

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
    elements.prompt.textContent = session.getPrompt();
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
            (result.lines || []).forEach((line) => {
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
