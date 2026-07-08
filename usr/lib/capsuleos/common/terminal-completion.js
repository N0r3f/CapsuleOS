/**
 * Complétion Tab du prompt terminal CapsuleOS (commandes, options, sous-commandes, chemins).
 * API : window.CapsuleTerminalCompletion
 */
(function initCapsuleTerminalCompletion(global) {
    'use strict';

    const DOUBLE_TAB_MS = 450;

    function getOptionsApi() {
        return global.CapsuleTerminalCommandOptions || null;
    }

    function getActiveCommands() {
        if (typeof global.getTerminalActiveCommands === 'function') {
            return Object.keys(global.getTerminalActiveCommands() || {}).sort();
        }
        return Object.keys(global.CAPSULE_TERMINAL_ACTIVE_COMMANDS || {}).sort();
    }

    function escapeForDisplay(text) {
        return String(text || '')
            .replace(/\\/g, '\\\\')
            .replace(/ /g, '\\ ')
            .replace(/(["'$`!&|;<>*?[\](){}])/g, '\\$1');
    }

    function normalizeEntryName(key) {
        const name = String(key || '');
        return name.startsWith('/') ? name.slice(1) : name;
    }

    function isDirectoryEntry(fs, path) {
        const node = fs[path];
        return node !== undefined && node !== null && typeof node === 'object';
    }

    function listDirectoryEntries(fs, dirPath) {
        const node = fs[dirPath];
        if (!node || typeof node !== 'object') {
            return [];
        }
        const seen = new Set();
        const entries = [];
        Object.keys(node).forEach((key) => {
            const name = normalizeEntryName(key);
            if (!name || seen.has(name)) {
                return;
            }
            seen.add(name);
            const childPath = dirPath === '/'
                ? `/${name}`
                : `${dirPath}/${name}`;
            const isDir = isDirectoryEntry(fs, childPath)
                || (Object.prototype.hasOwnProperty.call(node, key)
                    && typeof node[key] === 'object'
                    && node[key] !== null);
            entries.push({ name, isDir });
        });
        return entries.sort((a, b) => a.name.localeCompare(b));
    }

    function commonPrefix(strings) {
        if (!strings.length) {
            return '';
        }
        let prefix = strings[0];
        for (let i = 1; i < strings.length; i += 1) {
            const value = strings[i];
            let j = 0;
            while (j < prefix.length && j < value.length && prefix[j] === value[j]) {
                j += 1;
            }
            prefix = prefix.slice(0, j);
            if (!prefix) {
                break;
            }
        }
        return prefix;
    }

    function tokenizeAfterCommand(afterCommand) {
        const trimmed = String(afterCommand || '').replace(/\s+$/, '');
        if (!trimmed) {
            return { tokens: [], lastToken: '', priorTokens: [] };
        }
        const tokens = trimmed.split(/\s+/).filter(Boolean);
        const lastTokenMatch = afterCommand.match(/(?:^|\s)([^\s]*)$/);
        const lastToken = lastTokenMatch ? lastTokenMatch[1] : '';
        const priorTokens = tokens.slice(0, Math.max(0, tokens.length - (lastToken ? 1 : 0)));
        return { tokens, lastToken, priorTokens };
    }

    function subcommandResolved(command, priorTokens, lastToken) {
        const api = getOptionsApi();
        if (!api || typeof api.getSubcommands !== 'function') {
            return false;
        }
        const subs = api.getSubcommands(command);
        return priorTokens.some((token) => subs.includes(token))
            || subs.includes(lastToken);
    }

    function parseInputLine(line) {
        const raw = String(line || '');
        const leading = raw.length - raw.trimStart().length;
        const trimmed = raw.trimStart();
        const firstSpace = trimmed.search(/\s/);
        if (firstSpace === -1) {
            return {
                phase: 'command',
                commandPrefix: trimmed,
                replaceStart: leading,
                replaceEnd: raw.length,
            };
        }

        const command = trimmed.slice(0, firstSpace);
        const afterCommand = trimmed.slice(firstSpace + 1);
        const { lastToken, priorTokens } = tokenizeAfterCommand(afterCommand);
        const tokenStartInTrimmed = trimmed.length - lastToken.length;
        const replaceStart = leading + tokenStartInTrimmed;
        const replaceEnd = raw.length;

        const api = getOptionsApi();

        if (lastToken.startsWith('-')) {
            return {
                phase: 'option',
                command,
                tokenPrefix: lastToken,
                priorTokens,
                replaceStart,
                replaceEnd,
            };
        }

        if (api && typeof api.getOptions === 'function') {
            const bareOptions = api.getOptions(command).filter((entry) => !entry.startsWith('-'));
            if (bareOptions.length && !subcommandResolved(command, priorTokens, lastToken)
                && bareOptions.some((entry) => entry.startsWith(lastToken))) {
                return {
                    phase: 'option',
                    command,
                    tokenPrefix: lastToken,
                    priorTokens,
                    replaceStart,
                    replaceEnd,
                };
            }
        }

        if (api && typeof api.hasSubcommands === 'function' && api.hasSubcommands(command)
            && !subcommandResolved(command, priorTokens, lastToken)) {
            const onlyFlagsBefore = priorTokens.every((token) => token.startsWith('-'));
            if (onlyFlagsBefore || priorTokens.length === 0) {
                return {
                    phase: 'subcommand',
                    command,
                    tokenPrefix: lastToken,
                    priorTokens,
                    replaceStart,
                    replaceEnd,
                };
            }
        }

        return {
            phase: 'path',
            command,
            pathPrefix: lastToken,
            priorTokens,
            replaceStart,
            replaceEnd,
        };
    }

    function resolvePathBase(session, pathPrefix) {
        const state = session.state;
        const resolvePath = global.CapsuleTerminal && global.CapsuleTerminal.resolvePath
            ? (cwd, target) => global.CapsuleTerminal.resolvePath(cwd, target, state.home)
            : (cwd, target) => target;
        const { cwd, fs, home } = state;
        const slashIndex = pathPrefix.lastIndexOf('/');
        if (slashIndex === -1) {
            return { baseDir: cwd, namePrefix: pathPrefix, dirPrefix: '' };
        }
        const dirPart = pathPrefix.slice(0, slashIndex);
        const namePrefix = pathPrefix.slice(slashIndex + 1);
        const dirTarget = dirPart || '.';
        const baseDir = resolvePath(cwd, dirTarget, home);
        if (!isDirectoryEntry(fs, baseDir)) {
            return null;
        }
        const dirPrefix = dirPart ? `${dirPart}/` : '';
        return { baseDir, namePrefix, dirPrefix };
    }

    function completionSuffix(entry, isDir) {
        return isDir ? `${entry.name}/` : entry.name;
    }

    function matchCommandCompletions(prefix) {
        const needle = String(prefix || '').toLowerCase();
        return getActiveCommands().filter((name) => name.startsWith(needle));
    }

    function matchOptionCompletions(command, prefix) {
        const api = getOptionsApi();
        if (!api || typeof api.matchOptions !== 'function') {
            return [];
        }
        return api.matchOptions(command, prefix);
    }

    function matchSubcommandCompletions(command, prefix) {
        const api = getOptionsApi();
        if (!api || typeof api.matchSubcommands !== 'function') {
            return [];
        }
        return api.matchSubcommands(command, prefix);
    }

    function matchPathCompletions(session, pathPrefix) {
        const resolved = resolvePathBase(session, pathPrefix);
        if (!resolved) {
            return { matches: [], dirPrefix: '', namePrefix: pathPrefix };
        }
        const { baseDir, namePrefix, dirPrefix } = resolved;
        const { fs } = session.state;
        const needle = namePrefix.toLowerCase();
        const matches = listDirectoryEntries(fs, baseDir)
            .filter((entry) => entry.name.toLowerCase().startsWith(needle))
            .map((entry) => ({
                value: `${dirPrefix}${completionSuffix(entry, entry.isDir)}`,
                display: `${dirPrefix}${completionSuffix(entry, entry.isDir)}`,
            }));
        return { matches, dirPrefix, namePrefix };
    }

    function applyCompletion(input, replaceStart, replaceEnd, completed, addTrailingSpace) {
        const raw = String(input.value || '');
        const suffix = addTrailingSpace ? ' ' : '';
        const next = `${raw.slice(0, replaceStart)}${completed}${suffix}${raw.slice(replaceEnd)}`;
        input.value = next;
        const cursor = replaceStart + completed.length + suffix.length;
        input.setSelectionRange(cursor, cursor);
    }

    function renderMatchListing(output, lines) {
        if (!output || !lines.length) {
            return;
        }
        const row = document.createElement('div');
        row.className = 'capsule-terminal__line capsule-terminal__line--completion';
        const code = document.createElement('code');
        code.textContent = lines.join('  ');
        row.appendChild(code);
        output.appendChild(row);
    }

    function createTabState() {
        return {
            lastAt: 0,
            lastKey: '',
            listedKey: '',
        };
    }

    function currentTokenPrefix(parsed) {
        if (parsed.phase === 'command') {
            return parsed.commandPrefix;
        }
        if (parsed.phase === 'option' || parsed.phase === 'subcommand') {
            return parsed.tokenPrefix;
        }
        return parsed.pathPrefix;
    }

    function handleTabCompletion(input, session, output, tabState) {
        if (!input || input.disabled || document.activeElement !== input) {
            return false;
        }
        const host = input.closest('[data-terminal-app]');
        if (host && host.querySelector('.capsule-terminal-editor')) {
            return false;
        }

        const parsed = parseInputLine(input.value);
        let matches = [];
        let replaceValue = '';
        let listKey = '';
        let addTrailingSpace = false;

        if (parsed.phase === 'command') {
            const names = matchCommandCompletions(parsed.commandPrefix);
            matches = names.map((name) => ({ value: name, display: name }));
            listKey = `cmd:${parsed.commandPrefix}`;
            if (names.length === 1) {
                replaceValue = names[0];
                addTrailingSpace = true;
            } else if (names.length > 1) {
                const shared = commonPrefix(names);
                if (shared.length > parsed.commandPrefix.length) {
                    replaceValue = shared;
                }
            }
        } else if (parsed.phase === 'option') {
            const flags = matchOptionCompletions(parsed.command, parsed.tokenPrefix);
            matches = flags.map((flag) => ({ value: flag, display: flag }));
            listKey = `opt:${parsed.command}:${parsed.tokenPrefix}`;
            if (flags.length === 1) {
                replaceValue = flags[0];
                addTrailingSpace = true;
            } else if (flags.length > 1) {
                const shared = commonPrefix(flags);
                if (shared.length > parsed.tokenPrefix.length) {
                    replaceValue = shared;
                }
            }
        } else if (parsed.phase === 'subcommand') {
            const subs = matchSubcommandCompletions(parsed.command, parsed.tokenPrefix);
            matches = subs.map((sub) => ({ value: sub, display: sub }));
            listKey = `sub:${parsed.command}:${parsed.tokenPrefix}`;
            if (subs.length === 1) {
                replaceValue = subs[0];
                addTrailingSpace = true;
            } else if (subs.length > 1) {
                const shared = commonPrefix(subs);
                if (shared.length > parsed.tokenPrefix.length) {
                    replaceValue = shared;
                }
            }
        } else {
            const { matches: pathMatches, namePrefix } = matchPathCompletions(session, parsed.pathPrefix);
            matches = pathMatches;
            listKey = `path:${parsed.pathPrefix}`;
            if (pathMatches.length === 1) {
                replaceValue = pathMatches[0].value;
            } else if (pathMatches.length > 1) {
                const values = pathMatches.map((m) => m.value);
                const shared = commonPrefix(values);
                if (shared.length > parsed.pathPrefix.length) {
                    replaceValue = shared;
                }
            }
            if (!pathMatches.length && namePrefix && parsed.pathPrefix.endsWith('/')) {
                return false;
            }
        }

        const now = Date.now();
        const isDoubleTab = tabState.lastKey === listKey
            && (now - tabState.lastAt) <= DOUBLE_TAB_MS
            && matches.length > 1;

        tabState.lastAt = now;
        tabState.lastKey = listKey;

        if (isDoubleTab && tabState.listedKey !== listKey) {
            tabState.listedKey = listKey;
            const displayLine = matches.map((m) => escapeForDisplay(m.display)).join('  ');
            renderMatchListing(output, [displayLine]);
            if (typeof output.scrollTop === 'number') {
                output.scrollTop = output.scrollHeight;
            }
            return true;
        }

        tabState.listedKey = '';

        const prefix = currentTokenPrefix(parsed);
        if (replaceValue && replaceValue !== prefix) {
            applyCompletion(input, parsed.replaceStart, parsed.replaceEnd, replaceValue, addTrailingSpace);
            return true;
        }

        if (matches.length > 1) {
            return true;
        }

        return matches.length > 0;
    }

    function bindTabCompletion(commandInput, session, output) {
        const tabState = createTabState();
        commandInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Tab' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
                return;
            }
            const handled = handleTabCompletion(commandInput, session, output, tabState);
            if (handled) {
                event.preventDefault();
            }
        });
        commandInput.addEventListener('input', () => {
            tabState.lastKey = '';
            tabState.listedKey = '';
        });
    }

    global.CapsuleTerminalCompletion = {
        bindTabCompletion,
        handleTabCompletion,
        parseInputLine,
        escapeForDisplay,
        getActiveCommands,
        matchCommandCompletions,
        matchOptionCompletions,
        matchSubcommandCompletions,
        matchPathCompletions,
    };
}(typeof window !== 'undefined' ? window : globalThis));
