(function initMxKdeKonsoleTerminalChrome() {
    if (!document.body || document.body.id !== 'mx-kde') {
        return;
    }

    const PROMPT_PATTERN = /^([^@]+)@([^:]+):([^$]+)\$ $/;

    const colorizePromptText = (text) => {
        const match = String(text || '').match(PROMPT_PATTERN);
        if (!match) {
            return null;
        }

        const [, user, host, path] = match;
        return [
            `<span class="konsole-prompt__line">`,
            `<span class="konsole-prompt__user">${user}</span>`,
            `<span class="konsole-prompt__at">@</span>`,
            `<span class="konsole-prompt__host">${host}</span>`,
            `<span class="konsole-prompt__colon">:</span>`,
            `<span class="konsole-prompt__path">${path}</span>`,
            `</span>`,
            `<span class="konsole-prompt__dollar">$ </span>`
        ].join('');
    };

    const applyPromptMarkup = (element) => {
        if (!element) {
            return;
        }

        const text = element.textContent;
        const markup = colorizePromptText(text);
        if (!markup) {
            return;
        }

        const hasColoredMarkup = Boolean(element.querySelector('.konsole-prompt__user'));
        if (hasColoredMarkup && element.dataset.konsolePromptText === text) {
            return;
        }

        element.dataset.konsolePromptText = text;
        element.innerHTML = markup;
    };

    const bindToolbar = (root) => {
        root.querySelectorAll('.capsule-terminal-toolbar__btn[data-konsole-action]').forEach((button) => {
            if (button.dataset.konsoleToolbarBound === 'true') {
                return;
            }

            button.dataset.konsoleToolbarBound = 'true';
            button.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
            });
        });
    };

    const scrollTranscript = (root) => {
        const app = root.querySelector('[data-terminal-app], .capsule-terminal');
        if (!app) {
            return;
        }

        app.scrollTop = app.scrollHeight;
    };

    const observeTerminal = (root) => {
        const prompt = root.querySelector('[data-terminal-prompt], #prompt');
        const output = root.querySelector('[data-terminal-output], #output');

        if (prompt) {
            applyPromptMarkup(prompt);
            const promptObserver = new MutationObserver(() => {
                applyPromptMarkup(prompt);
            });
            promptObserver.observe(prompt, { childList: true, characterData: true, subtree: true });
        }

        if (output) {
            const outputObserver = new MutationObserver(() => {
                output.querySelectorAll('.capsule-terminal__prompt-copy').forEach((copy) => {
                    applyPromptMarkup(copy);
                });
                scrollTranscript(root);
            });
            outputObserver.observe(output, { childList: true, subtree: true, characterData: true });
        }

        bindToolbar(root);
        scrollTranscript(root);
    };

    const scan = () => {
        const windowElement = document.querySelector('div[data-link="terminal"]');
        if (!windowElement) {
            return false;
        }

        const shell = windowElement.querySelector('#terminalContainer, .capsule-terminal-shell');
        if (!shell) {
            return false;
        }

        observeTerminal(shell);
        return true;
    };

    if (!scan()) {
        const bootObserver = new MutationObserver(() => {
            if (scan()) {
                bootObserver.disconnect();
            }
        });
        bootObserver.observe(document.body, { childList: true, subtree: true });
    }
})();
