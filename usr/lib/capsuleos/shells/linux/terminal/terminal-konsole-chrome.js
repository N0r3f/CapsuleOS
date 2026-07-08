(function initKonsoleTerminalChrome() {
    'use strict';

    const KONSOLE_BODY_IDS = new Set(['kde-neon', 'opensuse', 'mx-kde', 'debian-kde']);
    if (!document.body || !KONSOLE_BODY_IDS.has(document.body.id)) {
        return;
    }

    const PROMPT_PATTERN = /^([^@]+)@([^:]+):([^$#]+)([$#]) $/;

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const buildPromptMarkup = (user, host, path, sigil) => [
        `<span class="konsole-prompt__line">`,
        `<span class="konsole-prompt__user">${escapeHtml(user)}</span>`,
        `<span class="konsole-prompt__at">@</span>`,
        `<span class="konsole-prompt__host">${escapeHtml(host)}</span>`,
        `<span class="konsole-prompt__colon">:</span>`,
        `<span class="konsole-prompt__path">${escapeHtml(path)}</span>`,
        `<span class="konsole-prompt__dollar">${escapeHtml(sigil)} </span>`,
        `</span>`
    ].join('');

    const colorizePromptText = (text) => {
        const match = String(text || '').match(PROMPT_PATTERN);
        if (!match) {
            return null;
        }

        const [, user, host, path, sigil] = match;
        return buildPromptMarkup(user, host, path, sigil);
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

    const applyCommandLineMarkup = (element) => {
        if (!element || element.querySelector('.konsole-prompt__user')) {
            return;
        }

        const text = String(element.textContent || '');
        const match = text.match(/^([^@]+)@([^:]+):([^$#]+)([$#] )(.*)$/);
        if (!match) {
            return;
        }

        const [, user, host, path, sigil, command] = match;
        const sigilChar = sigil.trim();
        element.dataset.konsolePromptText = text;
        element.innerHTML = `${buildPromptMarkup(user, host, path, sigilChar)}${command ? escapeHtml(command) : ''}`;
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

    const colorizeOutput = (output) => {
        output.querySelectorAll('.capsule-terminal__prompt-copy').forEach((copy) => {
            applyPromptMarkup(copy);
        });
        output.querySelectorAll('.capsule-terminal__command-line').forEach((line) => {
            applyCommandLineMarkup(line);
        });
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
            colorizeOutput(output);
            const outputObserver = new MutationObserver(() => {
                colorizeOutput(output);
                scrollTranscript(root);
            });
            outputObserver.observe(output, { childList: true, subtree: true, characterData: true });
        }

        bindToolbar(root);
        scrollTranscript(root);

        if (document.body && document.body.id === 'kde-neon' && prompt && output
            && !output.querySelector('.capsule-terminal__line')) {
            prompt.textContent = '';
        }
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
