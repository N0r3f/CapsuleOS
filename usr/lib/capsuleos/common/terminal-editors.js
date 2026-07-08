/**
 * Éditeurs terminal partagés (nano / vim MVP) — CapsuleOS.
 * Importable par linux, macOS, BSD, Android, UNIX (shells …/terminal).
 *
 * API : window.CapsuleTerminalEditors
 *   prepareCommand(state, cmd, args, helpers) → résultat executeCommand (+ openEditor)
 *   openNano(path, options) / openVim(path, options)
 *   mountInTerminal(host, session, spec, callbacks)
 */
(function initCapsuleTerminalEditors(global) {
    'use strict';

    const STORAGE_NANO_SEEN = 'capsule-terminal-editor-nano-seen';
    const STORAGE_VIM_SEEN = 'capsule-terminal-editor-vim-seen';

    const STRINGS = {
        en: {
            nanoHeader: (name) => `GNU nano — ${name}`,
            nanoFooter1: '^G Get Help  ^O Write Out  ^X Exit',
            nanoFooter2: '^K Cut Text  ^U Uncut Text  ^W Where Is',
            nanoBanner: 'Press ^X to exit nano',
            nanoWrote: (name) => `Wrote ${name}`,
            nanoClosed: (name) => `File ${name} closed.`,
            nanoSavePrompt: 'Save modified buffer (Answering No will DISCARD changes)?',
            nanoSavePromptKeys: ' Y Yes   N No',
            nanoHelpTitle: 'GNU nano — Shortcuts',
            nanoHelpBody: [
                '^G  Get Help          ^O  Write Out (save)',
                '^X  Exit              ^K  Cut Text (line)',
                '^U  Uncut Text        ^W  Where Is (search)',
                '',
                'Exit: ^X — if modified, answer Y to save or N to discard.',
                'Press ^G again or Esc to close this help.'
            ],
            nanoSearchPrompt: 'Search:',
            nanoSearchNotFound: 'Search pattern not found',
            vimHeader: (name) => `Vim — ${name}`,
            vimModeNormal: '-- NORMAL --',
            vimModeInsert: '-- INSERT --',
            vimModeCommand: '-- COMMAND --',
            vimBanner: 'Press i to insert, :q to quit, ? for help',
            vimHelpTitle: 'Vim — Basic commands',
            vimHelpBody: [
                'NORMAL mode (default):',
                '  i, a     enter INSERT mode',
                '  :        enter COMMAND mode',
                '  ?        show this help',
                '  Esc, ^[  return to NORMAL',
                '',
                'INSERT mode:',
                '  Esc, ^[  return to NORMAL',
                '',
                'COMMAND mode (:):',
                '  :w       write (save)',
                '  :q       quit (fails if modified)',
                '  :wq      write and quit',
                '  :q!      quit without saving',
                '  :help    show this help',
                '',
                'Press Esc to close this help.'
            ],
            vimWrote: (name) => `"${name}" written`,
            vimClosed: (name) => `Vim : ${name} closed.`,
            vimWq: (name) => `Vim : "${name}" written and closed.`,
            vimDiscarded: 'Vim : changes discarded.',
            vimUnsaved: 'No write since last change (add ! to override)',
            vimUnknownCmd: (cmd) => `E492: Not an editor command: ${cmd}`
        },
        fr: {
            nanoHeader: (name) => `GNU nano — ${name}`,
            nanoFooter1: '^G Aide  ^O Écrire  ^X Quitter',
            nanoFooter2: '^K Couper  ^U Coller  ^W Chercher',
            nanoBanner: 'Appuyez sur ^X pour quitter nano',
            nanoWrote: (name) => `Écrit ${name}`,
            nanoClosed: (name) => `Fichier ${name} fermé.`,
            nanoSavePrompt: 'Enregistrer le fichier modifié (Non = abandonner) ?',
            nanoSavePromptKeys: ' O Oui   N Non',
            nanoHelpTitle: 'GNU nano — Raccourcis',
            nanoHelpBody: [
                '^G  Aide              ^O  Écrire (enregistrer)',
                '^X  Quitter           ^K  Couper (ligne)',
                '^U  Coller            ^W  Chercher',
                '',
                'Quitter : ^X — si modifié, O pour enregistrer ou N pour abandonner.',
                'Appuyez à nouveau sur ^G ou Échap pour fermer cette aide.'
            ],
            nanoSearchPrompt: 'Rechercher :',
            nanoSearchNotFound: 'Motif introuvable',
            vimHeader: (name) => `Vim — ${name}`,
            vimModeNormal: '-- NORMAL --',
            vimModeInsert: '-- INSERT --',
            vimModeCommand: '-- COMMAND --',
            vimBanner: 'Appuyez sur i pour insérer, :q pour quitter, ? pour l\'aide',
            vimHelpTitle: 'Vim — Commandes de base',
            vimHelpBody: [
                'Mode NORMAL (par défaut) :',
                '  i, a     entrer en mode INSERT',
                '  :        entrer en mode COMMANDE',
                '  ?        afficher cette aide',
                '  Échap, ^[  revenir en NORMAL',
                '',
                'Mode INSERT :',
                '  Échap, ^[  revenir en NORMAL',
                '',
                'Mode COMMANDE (:) :',
                '  :w       enregistrer',
                '  :q       quitter (échoue si modifié)',
                '  :wq      enregistrer et quitter',
                '  :q!      quitter sans enregistrer',
                '  :help    afficher cette aide',
                '',
                'Appuyez sur Échap pour fermer cette aide.'
            ],
            vimWrote: (name) => `"${name}" écrit`,
            vimClosed: (name) => `Vim : ${name} fermé.`,
            vimWq: (name) => `Vim : "${name}" écrit et fermé.`,
            vimDiscarded: 'Vim : modifications abandonnées.',
            vimUnsaved: 'Modifications non enregistrées (:wq ou :w puis :q)',
            vimUnknownCmd: (cmd) => `E492: Commande inconnue : ${cmd}`
        }
    };

    function editorLocale() {
        const lang = String(
            (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
            || (typeof navigator !== 'undefined' && navigator.language)
            || 'en'
        ).toLowerCase();
        return lang.startsWith('fr') ? 'fr' : 'en';
    }

    function t(key, ...args) {
        const locale = editorLocale();
        const bucket = STRINGS[locale] || STRINGS.en;
        const value = bucket[key];
        return typeof value === 'function' ? value(...args) : value;
    }

    function normalizePath(path) {
        const normalized = String(path || '/').replace(/\/+/g, '/');
        return normalized.length > 1 ? normalized.replace(/\/+$/, '') : '/';
    }

    function basename(path) {
        return String(path || '').split('/').filter(Boolean).pop() || '';
    }

    function dirname(path) {
        const normalized = normalizePath(path);
        if (normalized === '/') {
            return '/';
        }
        const parts = normalized.split('/').filter(Boolean);
        parts.pop();
        return parts.length ? normalizePath(`/${parts.join('/')}`) : '/';
    }

    function ensureFileContents(state) {
        if (!state.fileContents || typeof state.fileContents !== 'object') {
            state.fileContents = {};
        }
        return state.fileContents;
    }

    function fsIsDir(fs, path) {
        const node = fs[path];
        return Boolean(node && typeof node === 'object');
    }

    function isTextFileName(name) {
        if (global.CapsuleVirtualShell && typeof global.CapsuleVirtualShell.isTextFileName === 'function') {
            return global.CapsuleVirtualShell.isTextFileName(name);
        }
        const dot = String(name || '').lastIndexOf('.');
        if (dot <= 0) {
            return true;
        }
        return ['txt', 'md', 'log', 'sh', 'json', 'csv', 'xml', 'html', 'css', 'js'].includes(String(name).slice(dot + 1).toLowerCase());
    }

    function entryPath(cwd, target, resolvePath) {
        return resolvePath(cwd, target || '');
    }

    function loadFileForEditor(state, fs, cwd, target, resolvePath, cmd) {
        if (!target) {
            if (cmd === 'vim') {
                return { error: 'fichier requis (ex. vim notes.txt)' };
            }
            const untitled = 'untitled.txt';
            return {
                isNew: true,
                resolved: entryPath(cwd, untitled, resolvePath),
                content: '',
                displayName: untitled
            };
        }
        const resolved = entryPath(cwd, target, resolvePath);
        if (fsIsDir(fs, resolved)) {
            return { error: `${target}: Is a directory` };
        }
        const name = basename(resolved) || target;
        if (!isTextFileName(name)) {
            return { error: `${target}: Binary file` };
        }
        const parentDir = fs[cwd] || {};
        const inCwd = Object.prototype.hasOwnProperty.call(parentDir, target)
            || Object.prototype.hasOwnProperty.call(parentDir, `/${target}`);
        const fileContents = ensureFileContents(state);
        const hasContent = fileContents[resolved] != null;
        const hasHref = Boolean((state.fileHrefs || {})[resolved]);
        if (!inCwd && !hasContent && !hasHref) {
            return {
                isNew: true,
                resolved,
                content: '',
                displayName: name
            };
        }
        const content = hasContent
            ? String(fileContents[resolved])
            : `Fichier simulé: ${name}\nCapsuleOS Terminal`;
        return { resolved, content, displayName: name, isNew: false };
    }

    function saveFileFromEditor(state, fs, resolved, content) {
        const fileContents = ensureFileContents(state);
        fileContents[resolved] = content;
        const parent = dirname(resolved);
        const name = basename(resolved);
        if (!fs[parent]) {
            fs[parent] = {};
        }
        if (!Object.prototype.hasOwnProperty.call(fs[parent], name)) {
            fs[parent][name] = {};
        }
        return { saved: true, resolved };
    }

    function resolveEditorCssHref() {
        if (typeof document === 'undefined') {
            return 'usr/share/capsuleos/themes/linux/terminal-editors.css';
        }
        const path = document.location.pathname || '';
        const segments = path.split('/').filter(Boolean);
        if (segments.length && /\.[a-z0-9]+$/i.test(segments[segments.length - 1])) {
            segments.pop();
        }
        const prefix = segments.length > 0 ? `${'../'.repeat(segments.length)}` : '';
        return `${prefix}usr/share/capsuleos/themes/linux/terminal-editors.css`;
    }

    function ensureEditorStylesheetFixed() {
        if (typeof document === 'undefined') {
            return;
        }
        const id = 'capsule-terminal-editors-css';
        if (document.getElementById(id)) {
            return;
        }
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = resolveEditorCssHref();
        document.head.appendChild(link);
    }

    function ctrlLetter(event, letter) {
        if (!event.ctrlKey || event.metaKey || event.altKey) {
            return false;
        }
        const key = String(event.key || '').toLowerCase();
        return key === letter.toLowerCase()
            || event.code === `Key${letter.toUpperCase()}`;
    }

    function isEscapeKey(event) {
        return event.key === 'Escape'
            || (event.ctrlKey && (event.key === '[' || event.key === 'Escape'));
    }

    function preventBrowserCtrlShortcuts(event) {
        if (!event.ctrlKey || event.metaKey) {
            return;
        }
        const key = String(event.key || '').toLowerCase();
        const blocked = ['s', 'w', 'g', 'o', 'x', 'k', 'u', 'f', 'h', 'p', 'n', 'r', 'z', 'a', 'c', 'v'];
        if (blocked.includes(key) || (key === '[' && event.ctrlKey)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    function getLineBounds(text, index) {
        const start = text.lastIndexOf('\n', Math.max(0, index - 1)) + 1;
        const nextBreak = text.indexOf('\n', index);
        const end = nextBreak === -1 ? text.length : nextBreak;
        return { start, end, line: text.slice(start, end) };
    }

    function markEditorSeen(storageKey) {
        try {
            global.localStorage.setItem(storageKey, '1');
        } catch (err) {
            /* ignore */
        }
    }

    function hasEditorBeenSeen(storageKey) {
        try {
            return global.localStorage.getItem(storageKey) === '1';
        } catch (err) {
            return false;
        }
    }

    function prepareCommand(state, cmd, args, helpers) {
        const fs = state.fs || {};
        const resolvePath = helpers.resolvePath || ((cwd, target) => target);
        const rawCommand = helpers.rawCommand || `${cmd} ${args.join(' ')}`.trim();
        const format = helpers.formatCommandResult || ((s, c, lines, opts) => ({
            command: c,
            lines,
            error: Boolean(opts && opts.error),
            cwd: s.cwd
        }));

        const fileArg = args[0];
        const loaded = loadFileForEditor(state, fs, state.cwd, fileArg, resolvePath, cmd);
        if (loaded.error) {
            return format(state, rawCommand, [`${cmd}: ${loaded.error}`], { error: true });
        }

        return format(state, rawCommand, [`Ouverture de ${loaded.displayName} dans ${cmd}…`], {
            openEditor: {
                mode: cmd,
                resolved: loaded.resolved,
                displayName: loaded.displayName,
                content: loaded.content,
                isNew: Boolean(loaded.isNew),
                rawCommand
            }
        });
    }

    function createHelpOverlay(title, lines) {
        const overlay = document.createElement('div');
        overlay.className = 'capsule-terminal-editor__help';
        overlay.setAttribute('role', 'dialog');
        overlay.hidden = true;

        const titleEl = document.createElement('div');
        titleEl.className = 'capsule-terminal-editor__help-title';
        titleEl.textContent = title;

        const body = document.createElement('pre');
        body.className = 'capsule-terminal-editor__help-body';
        body.textContent = lines.join('\n');

        overlay.appendChild(titleEl);
        overlay.appendChild(body);
        return { overlay, body, titleEl };
    }

    function createOverlay(mode, spec) {
        const root = document.createElement('div');
        root.className = `capsule-terminal-editor capsule-terminal-editor--${mode}`;
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-label', mode === 'vim' ? 'Vim' : 'GNU nano');

        const header = document.createElement('div');
        header.className = 'capsule-terminal-editor__header';
        header.textContent = mode === 'vim'
            ? t('vimHeader', spec.displayName)
            : t('nanoHeader', spec.displayName);

        const banner = document.createElement('div');
        banner.className = 'capsule-terminal-editor__banner';
        banner.hidden = true;

        const buffer = document.createElement('textarea');
        buffer.className = 'capsule-terminal-editor__buffer';
        buffer.value = spec.content || '';
        buffer.setAttribute('spellcheck', 'false');
        buffer.setAttribute('autocomplete', 'off');

        const message = document.createElement('div');
        message.className = 'capsule-terminal-editor__message';
        message.hidden = true;

        const nanoFooter = document.createElement('div');
        nanoFooter.className = 'capsule-terminal-editor__nano-footer';
        if (mode === 'nano') {
            const row1 = document.createElement('div');
            row1.className = 'capsule-terminal-editor__nano-footer-row';
            row1.textContent = t('nanoFooter1');
            const row2 = document.createElement('div');
            row2.className = 'capsule-terminal-editor__nano-footer-row';
            row2.textContent = t('nanoFooter2');
            nanoFooter.appendChild(row1);
            nanoFooter.appendChild(row2);
        } else {
            nanoFooter.hidden = true;
        }

        const vimHint = document.createElement('div');
        vimHint.className = 'capsule-terminal-editor__vim-hint';
        vimHint.hidden = mode !== 'vim';

        const status = document.createElement('div');
        status.className = 'capsule-terminal-editor__status';

        const cmdline = document.createElement('div');
        cmdline.className = 'capsule-terminal-editor__cmdline';

        const help = createHelpOverlay('', []);

        root.appendChild(header);
        root.appendChild(banner);
        root.appendChild(buffer);
        root.appendChild(message);
        root.appendChild(nanoFooter);
        root.appendChild(vimHint);
        root.appendChild(status);
        root.appendChild(cmdline);
        root.appendChild(help.overlay);

        return {
            root,
            header,
            banner,
            buffer,
            message,
            nanoFooter,
            vimHint,
            status,
            cmdline,
            help
        };
    }

    function mountInTerminal(host, session, spec, callbacks) {
        if (!host || !session) {
            return null;
        }
        ensureEditorStylesheetFixed();
        host.dataset.terminalEditorActive = 'true';

        const mode = spec.mode === 'vim' ? 'vim' : 'nano';
        const ui = createOverlay(mode, spec);
        host.style.position = host.style.position || 'relative';
        host.appendChild(ui.root);

        let dirty = false;
        let closed = false;
        const initial = ui.buffer.value;
        let helpOpen = false;
        let nanoPrompt = null;
        let nanoSearchTerm = '';
        let nanoCutBuffer = '';

        const fs = session.state.fs || {};
        const resolvePath = (cwd, target) => (
            global.CapsuleTerminal
                ? global.CapsuleTerminal.resolvePath(cwd, target, session.state.home)
                : target
        );

        function finish(lines, options) {
            if (closed) {
                return;
            }
            closed = true;
            ui.root.remove();
            delete host.dataset.terminalEditorActive;
            if (typeof callbacks.onClose === 'function') {
                callbacks.onClose({ lines: lines || [], error: Boolean(options && options.error) });
            }
        }

        function setMessage(text, isError) {
            if (!text) {
                ui.message.hidden = true;
                ui.message.textContent = '';
                ui.message.classList.remove('capsule-terminal-editor__message--error');
                return;
            }
            ui.message.hidden = false;
            ui.message.textContent = text;
            ui.message.classList.toggle('capsule-terminal-editor__message--error', Boolean(isError));
        }

        function setCmdline(text) {
            if (!text) {
                ui.cmdline.textContent = '';
                ui.root.classList.remove('capsule-terminal-editor--prompt');
                return;
            }
            ui.cmdline.textContent = text;
            ui.root.classList.add('capsule-terminal-editor--prompt');
        }

        function showHelp(title, lines) {
            helpOpen = true;
            ui.help.titleEl.textContent = title;
            ui.help.body.textContent = lines.join('\n');
            ui.help.overlay.hidden = false;
            ui.root.classList.add('capsule-terminal-editor--help-open');
        }

        function hideHelp() {
            helpOpen = false;
            ui.help.overlay.hidden = true;
            ui.root.classList.remove('capsule-terminal-editor--help-open');
        }

        function doSave() {
            saveFileFromEditor(session.state, fs, spec.resolved, ui.buffer.value);
            dirty = false;
            setMessage(t('nanoWrote', spec.displayName), false);
            return true;
        }

        ui.buffer.addEventListener('input', () => {
            dirty = ui.buffer.value !== initial;
            if (dirty) {
                ui.header.classList.add('capsule-terminal-editor__header--modified');
            } else {
                ui.header.classList.remove('capsule-terminal-editor__header--modified');
            }
        });

        if (mode === 'nano') {
            if (!hasEditorBeenSeen(STORAGE_NANO_SEEN)) {
                ui.banner.textContent = t('nanoBanner');
                ui.banner.hidden = false;
                markEditorSeen(STORAGE_NANO_SEEN);
            }

            function clearNanoPrompt() {
                nanoPrompt = null;
                setCmdline('');
            }

            function attemptNanoExit() {
                if (!dirty) {
                    finish([t('nanoClosed', spec.displayName)]);
                    return;
                }
                nanoPrompt = 'exit-save';
                setCmdline(`${t('nanoSavePrompt')}${t('nanoSavePromptKeys')}`);
            }

            function handleNanoPromptKey(event) {
                if (!nanoPrompt) {
                    return false;
                }
                event.preventDefault();
                event.stopPropagation();
                const key = String(event.key || '').toLowerCase();
                if (nanoPrompt === 'exit-save') {
                    const yes = key === 'y' || key === 'o';
                    const no = key === 'n';
                    if (yes) {
                        doSave();
                        clearNanoPrompt();
                        finish([t('nanoClosed', spec.displayName)]);
                        return true;
                    }
                    if (no) {
                        clearNanoPrompt();
                        finish([t('nanoClosed', spec.displayName)]);
                        return true;
                    }
                    if (isEscapeKey(event)) {
                        clearNanoPrompt();
                        return true;
                    }
                }
                if (nanoPrompt === 'search') {
                    if (event.key === 'Enter') {
                        const term = nanoSearchTerm;
                        clearNanoPrompt();
                        nanoSearchTerm = '';
                        if (!term) {
                            return true;
                        }
                        const haystack = ui.buffer.value;
                        const from = ui.buffer.selectionStart;
                        const idx = haystack.indexOf(term, from);
                        const wrapIdx = idx === -1 ? haystack.indexOf(term) : idx;
                        if (wrapIdx === -1) {
                            setMessage(t('nanoSearchNotFound'), true);
                        } else {
                            ui.buffer.focus();
                            ui.buffer.setSelectionRange(wrapIdx, wrapIdx + term.length);
                            setMessage('');
                        }
                        return true;
                    }
                    if (isEscapeKey(event)) {
                        nanoSearchTerm = '';
                        clearNanoPrompt();
                        return true;
                    }
                    if (event.key === 'Backspace') {
                        nanoSearchTerm = nanoSearchTerm.slice(0, -1);
                        setCmdline(`${t('nanoSearchPrompt')} ${nanoSearchTerm}`);
                        return true;
                    }
                    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                        nanoSearchTerm += event.key;
                        setCmdline(`${t('nanoSearchPrompt')} ${nanoSearchTerm}`);
                        return true;
                    }
                }
                return true;
            }

            ui.buffer.addEventListener('keydown', (event) => {
                preventBrowserCtrlShortcuts(event);

                if (helpOpen) {
                    if (isEscapeKey(event) || ctrlLetter(event, 'g')) {
                        event.preventDefault();
                        hideHelp();
                    }
                    return;
                }

                if (handleNanoPromptKey(event)) {
                    return;
                }

                if (ctrlLetter(event, 'g')) {
                    event.preventDefault();
                    showHelp(t('nanoHelpTitle'), t('nanoHelpBody'));
                    return;
                }
                if (ctrlLetter(event, 'o')) {
                    event.preventDefault();
                    doSave();
                    return;
                }
                if (ctrlLetter(event, 'x')) {
                    event.preventDefault();
                    attemptNanoExit();
                    return;
                }
                if (ctrlLetter(event, 'k')) {
                    event.preventDefault();
                    const pos = ui.buffer.selectionStart;
                    const bounds = getLineBounds(ui.buffer.value, pos);
                    nanoCutBuffer = bounds.line;
                    if (bounds.end < ui.buffer.value.length) {
                        ui.buffer.value = ui.buffer.value.slice(0, bounds.start) + ui.buffer.value.slice(bounds.end + 1);
                    } else if (bounds.start > 0) {
                        ui.buffer.value = ui.buffer.value.slice(0, bounds.start - 1) + ui.buffer.value.slice(bounds.end);
                        ui.buffer.setSelectionRange(bounds.start - 1, bounds.start - 1);
                    } else {
                        ui.buffer.value = '';
                    }
                    ui.buffer.dispatchEvent(new Event('input', { bubbles: true }));
                    return;
                }
                if (ctrlLetter(event, 'u')) {
                    event.preventDefault();
                    if (nanoCutBuffer) {
                        const pos = ui.buffer.selectionStart;
                        const before = ui.buffer.value.slice(0, pos);
                        const after = ui.buffer.value.slice(pos);
                        ui.buffer.value = before + nanoCutBuffer + after;
                        ui.buffer.setSelectionRange(pos + nanoCutBuffer.length, pos + nanoCutBuffer.length);
                        ui.buffer.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    return;
                }
                if (ctrlLetter(event, 'w')) {
                    event.preventDefault();
                    nanoPrompt = 'search';
                    nanoSearchTerm = '';
                    setCmdline(`${t('nanoSearchPrompt')} `);
                    return;
                }
            });
        } else {
            let vimMode = 'normal';
            let cmdBuffer = '';

            if (!hasEditorBeenSeen(STORAGE_VIM_SEEN)) {
                ui.vimHint.textContent = t('vimBanner');
                ui.vimHint.hidden = false;
                markEditorSeen(STORAGE_VIM_SEEN);
            }

            function setVimStatus(text, isError) {
                ui.status.textContent = text;
                ui.status.classList.toggle('capsule-terminal-editor__status--error', Boolean(isError));
                ui.status.classList.toggle('capsule-terminal-editor__status--mode', !isError && Boolean(text));
            }

            function updateVimChrome() {
                ui.root.classList.toggle('capsule-terminal-editor--vim-normal', vimMode === 'normal');
                ui.root.classList.toggle('capsule-terminal-editor--vim-insert', vimMode === 'insert');
                ui.root.classList.toggle('capsule-terminal-editor--vim-command', vimMode === 'command');
                ui.buffer.classList.toggle('capsule-terminal-editor__buffer--readonly', vimMode !== 'insert');

                if (vimMode === 'insert') {
                    setVimStatus(t('vimModeInsert'));
                    ui.buffer.readOnly = false;
                    setCmdline('');
                } else if (vimMode === 'normal') {
                    setVimStatus(t('vimModeNormal'));
                    ui.buffer.readOnly = true;
                    setCmdline('');
                } else {
                    setVimStatus(t('vimModeCommand'));
                    ui.buffer.readOnly = true;
                    setCmdline(`:${cmdBuffer}`);
                }
            }

            updateVimChrome();

            function showVimHelp() {
                showHelp(t('vimHelpTitle'), t('vimHelpBody'));
            }

            function runVimCommand(line) {
                const trimmed = String(line || '').replace(/^:/, '').trim();
                if (trimmed === 'w' || trimmed === 'write') {
                    doSave();
                    setVimStatus(t('vimWrote', spec.displayName));
                    vimMode = 'normal';
                    updateVimChrome();
                    return;
                }
                if (trimmed === 'q' || trimmed === 'quit') {
                    if (dirty) {
                        setVimStatus(t('vimUnsaved'), true);
                        vimMode = 'normal';
                        updateVimChrome();
                        return;
                    }
                    finish([t('vimClosed', spec.displayName)]);
                    return;
                }
                if (trimmed === 'wq' || trimmed === 'x') {
                    doSave();
                    finish([t('vimWq', spec.displayName)]);
                    return;
                }
                if (trimmed === 'q!') {
                    finish([t('vimDiscarded')]);
                    return;
                }
                if (trimmed === 'help') {
                    showVimHelp();
                    vimMode = 'normal';
                    updateVimChrome();
                    return;
                }
                setVimStatus(t('vimUnknownCmd', trimmed), true);
                vimMode = 'normal';
                updateVimChrome();
            }

            ui.buffer.addEventListener('keydown', (event) => {
                preventBrowserCtrlShortcuts(event);

                if (helpOpen) {
                    if (isEscapeKey(event)) {
                        event.preventDefault();
                        hideHelp();
                        updateVimChrome();
                    }
                    return;
                }

                if (vimMode === 'insert') {
                    if (isEscapeKey(event)) {
                        event.preventDefault();
                        vimMode = 'normal';
                        updateVimChrome();
                    }
                    return;
                }

                if (vimMode === 'command') {
                    event.preventDefault();
                    if (isEscapeKey(event)) {
                        cmdBuffer = '';
                        vimMode = 'normal';
                        updateVimChrome();
                        return;
                    }
                    if (event.key === 'Enter') {
                        runVimCommand(cmdBuffer);
                        cmdBuffer = '';
                        return;
                    }
                    if (event.key === 'Backspace') {
                        cmdBuffer = cmdBuffer.slice(0, -1);
                        setCmdline(`:${cmdBuffer}`);
                        return;
                    }
                    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                        cmdBuffer += event.key;
                        setCmdline(`:${cmdBuffer}`);
                    }
                    return;
                }

                event.preventDefault();

                if (event.key === '?') {
                    showVimHelp();
                    return;
                }
                if (event.key === 'i' || event.key === 'a') {
                    vimMode = 'insert';
                    ui.buffer.readOnly = false;
                    if (event.key === 'a') {
                        const end = ui.buffer.value.length;
                        ui.buffer.setSelectionRange(end, end);
                    }
                    updateVimChrome();
                    return;
                }
                if (event.key === ':') {
                    vimMode = 'command';
                    cmdBuffer = '';
                    updateVimChrome();
                }
            });
        }

        ui.buffer.focus();
        return { close: finish, save: doSave };
    }

    function openNano(path, options) {
        const session = options && options.session;
        if (!session) {
            return null;
        }
        const helpers = {
            resolvePath: (cwd, target) => global.CapsuleTerminal.resolvePath(cwd, target, session.state.home),
            rawCommand: `nano ${path || ''}`.trim(),
            formatCommandResult: (state, cmd, lines, opts) => ({
                command: cmd,
                lines,
                error: Boolean(opts && opts.error),
                openEditor: opts && opts.openEditor
            })
        };
        const result = prepareCommand(session.state, 'nano', path ? [path] : [], helpers);
        if (!result.openEditor) {
            return result;
        }
        return mountInTerminal(options.host, session, result.openEditor, options.callbacks || {});
    }

    function openVim(path, options) {
        const session = options && options.session;
        if (!session) {
            return null;
        }
        const helpers = {
            resolvePath: (cwd, target) => global.CapsuleTerminal.resolvePath(cwd, target, session.state.home),
            rawCommand: `vim ${path || ''}`.trim(),
            formatCommandResult: (state, cmd, lines, opts) => ({
                command: cmd,
                lines,
                error: Boolean(opts && opts.error),
                openEditor: opts && opts.openEditor
            })
        };
        const result = prepareCommand(session.state, 'vim', path ? [path] : [], helpers);
        if (!result.openEditor) {
            return result;
        }
        return mountInTerminal(options.host, session, result.openEditor, options.callbacks || {});
    }

    global.CapsuleTerminalEditors = {
        loadFileForEditor,
        saveFileFromEditor,
        prepareCommand,
        mountInTerminal,
        openNano,
        openVim,
        ensureEditorStylesheet: ensureEditorStylesheetFixed,
        editorLocale
    };
})(typeof window !== 'undefined' ? window : globalThis);
