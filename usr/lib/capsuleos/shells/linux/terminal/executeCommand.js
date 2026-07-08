'use strict';
function splitCommand(command) {
    return String(command || '').trim().split(/\s+/).filter(Boolean);
}

function parseLineCount(args, fallbackValue) {
    if (args[0] === '-n' && args[1]) {
        const parsed = Number.parseInt(args[1], 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
    }
    return fallbackValue;
}

function formatCommandResult(state, command, lines, options = {}) {
    return {
        command,
        prompt: options.prompt || (window.CapsuleTerminal ? window.CapsuleTerminal.formatPrompt(state) : ''),
        lines: Array.isArray(lines) ? lines : String(lines || '').split('\n'),
        error: Boolean(options.error),
        clear: Boolean(options.clear),
        listing: Boolean(options.listing),
        listingColumnWidth: Number(options.listingColumnWidth) > 0 ? Number(options.listingColumnWidth) : 0,
        openEditor: options.openEditor || null,
        cwd: state.cwd
    };
}

function queueUserFsSync(op, state, extra) {
    if (!window.CapsuleUserFs || typeof window.CapsuleUserFs.syncFromTerminal !== 'function') {
        return;
    }
    const payload = Object.assign({ op, cwd: state.cwd }, extra || {});
    Promise.resolve(window.CapsuleUserFs.syncFromTerminal(payload)).catch(() => {});
}

function getDirectoryEntries(fs, path) {
    const directory = fs[path];
    return directory && typeof directory === 'object' ? Object.keys(directory) : [];
}

function isUbuntuGnomeTerminal() {
    return typeof document !== 'undefined' && document.body && document.body.id === 'ubuntu';
}

function basename(path) {
    return String(path || '').split('/').filter(Boolean).pop() || '/';
}

function isDirectory(fs, path) {
    return Boolean(fs[path] && typeof fs[path] === 'object');
}

function entryPath(cwd, target, resolvePath) {
    return resolvePath(cwd, target || '');
}

function getDirectoryListing(fs, path) {
    const directory = fs[path];
    if (!directory || typeof directory !== 'object') {
        return [];
    }
    const seen = new Set();
    return Object.keys(directory)
        .map((name) => (name.startsWith('/') ? name.slice(1) : name))
        .filter((name) => {
            if (!name || seen.has(name)) {
                return false;
            }
            seen.add(name);
            return true;
        });
}

function resolveSlashSafeCdPath(state, fs, target, resolvePath) {
    if (!target || !target.startsWith('/')) {
        return null;
    }

    const suffix = target.slice(1);
    if (!suffix) {
        return null;
    }

    const candidates = [];
    if (state.cwd) {
        candidates.push(resolvePath(state.cwd, suffix));
    }
    if (state.home) {
        candidates.push(resolvePath(state.home, suffix));
    }
    candidates.push(resolvePath('/home', suffix));

    for (let index = 0; index < candidates.length; index += 1) {
        const candidate = candidates[index];
        if (isDirectory(fs, candidate)) {
            return candidate;
        }
    }

    return null;
}

function ensureFileContents(state) {
    if (!state.fileContents || typeof state.fileContents !== 'object') {
        state.fileContents = {};
    }
    return state.fileContents;
}

function isTextFileName(name) {
    if (typeof window !== 'undefined' && window.CapsuleVirtualShell && typeof window.CapsuleVirtualShell.isTextFileName === 'function') {
        return window.CapsuleVirtualShell.isTextFileName(name);
    }
    const dot = String(name || '').lastIndexOf('.');
    if (dot <= 0) {
        return true;
    }
    return ['txt', 'md', 'log', 'sh', 'json', 'csv', 'xml', 'html', 'css', 'js'].includes(String(name).slice(dot + 1).toLowerCase());
}

function isBinaryPath(state, resolved, target) {
    const name = basename(resolved) || target;
    if (!isTextFileName(name)) {
        return true;
    }
    const fileContents = ensureFileContents(state);
    if (fileContents[resolved] != null) {
        return false;
    }
    const hrefs = state.fileHrefs || {};
    return Boolean(hrefs[resolved]);
}

function readFileContent(state, fs, cwd, target, resolvePath) {
    if (!target) {
        return { error: 'missing file operand' };
    }
    const resolved = entryPath(cwd, target, resolvePath);
    if (isDirectory(fs, resolved)) {
        return { error: `${target}: Is a directory` };
    }
    const parentDir = fs[cwd] || {};
    const inCurrentDir = Object.prototype.hasOwnProperty.call(parentDir, target)
        || Object.prototype.hasOwnProperty.call(parentDir, `/${target}`);
    const fileContents = ensureFileContents(state);
    if (!inCurrentDir && fileContents[resolved] == null && !(state.fileHrefs || {})[resolved]) {
        return { error: `${target}: No such file or directory` };
    }
    if (isBinaryPath(state, resolved, target)) {
        return { error: `${target}: Binary file` };
    }
    const content = fileContents[resolved] || `Fichier simulé: ${basename(resolved)}\nCapsuleOS Terminal`;
    return { content, resolved };
}

function ensureFileModes(state) {
    if (!state.fileModes || typeof state.fileModes !== 'object') {
        state.fileModes = {};
    }
    return state.fileModes;
}

function expandShellVars(state, text) {
    const home = state.home || '/home/public';
    const replacements = {
        '$USER': state.user || 'user',
        '$HOME': home,
        '$HOSTNAME': state.host || 'host',
        '$PWD': state.cwd || '/',
    };
    let output = String(text || '');
    Object.keys(replacements).forEach((token) => {
        output = output.split(token).join(replacements[token]);
    });
    if (output.includes('~')) {
        output = output.replace(/~\//g, `${home}/`).replace(/^~$/g, home);
    }
    return output;
}

function buildCommandHelpers(state, fs, resolvePath) {
    return {
        resolvePath,
        ensureFileContents,
        ensureFileModes,
        queueUserFsSync,
        readFileContent: (session, target) => readFileContent(session, fs, session.cwd, target, resolvePath),
        executeCommand: (session, command, innerHelpers) => runSingleTerminalCommand(session, command, innerHelpers || { resolvePath }, {}),
    };
}

function resolveEntryMode(state, fs, resolved, isDir) {
    const modes = ensureFileModes(state);
    if (modes[resolved]) {
        return modes[resolved];
    }
    return isDir ? 'drwxr-xr-x' : '-rw-r--r--';
}

function formatLsLongLine(fs, dirPath, name, state) {
    const resolved = dirPath === '/' ? `/${name}` : `${dirPath}/${name}`;
    const isDir = isDirectory(fs, resolved);
    const mode = resolveEntryMode(state, fs, resolved, isDir);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const dateStr = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, ' ')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const size = String(isDir ? 4096 : 0).padStart(8, ' ');
    return `${mode} 1 ${state.user} ${state.user} ${size} ${dateStr} ${name}`;
}

function getActiveProfile() {
    if (typeof window.getTerminalActiveProfile === 'function') {
        return window.getTerminalActiveProfile() || {};
    }
    return window.CAPSULE_TERMINAL_ACTIVE_PROFILE || {};
}

function getActiveCommands() {
    if (typeof window.getTerminalActiveCommands === 'function') {
        return window.getTerminalActiveCommands() || {};
    }
    return window.CAPSULE_TERMINAL_ACTIVE_COMMANDS || {};
}

function getManualEntries() {
    if (typeof manuel !== 'undefined' && manuel.man) {
        return manuel.man;
    }
    return {};
}

function isCommandAvailable(commandName) {
    const activeCommands = getActiveCommands();
    return Boolean(activeCommands[commandName]);
}

function addDirectory(fs, cwd, name, resolvePath) {
    const path = resolvePath(cwd, name);
    if (!fs[cwd]) {
        fs[cwd] = {};
    }
    fs[cwd][name] = {};
    fs[path] = fs[path] || {};
}

function removeEntry(fs, cwd, name, resolvePath) {
    const path = resolvePath(cwd, name);
    if (fs[cwd]) {
        delete fs[cwd][name];
        delete fs[cwd][`/${name}`];
    }
    delete fs[path];
}

function runPackageManagerCommand(state, rawCommand, cmd, args) {
    if (typeof window.CapsuleTerminalPackageManagers === 'object'
        && typeof window.CapsuleTerminalPackageManagers.run === 'function') {
        const outcome = window.CapsuleTerminalPackageManagers.run(cmd, args, state, getActiveProfile());
        return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
    }
    return formatCommandResult(
        state,
        rawCommand,
        [`${cmd}: module terminal-package-managers.js non chargé.`],
        { error: true }
    );
}

function applyOutputRedirect(state, fs, resolvePath, targetFile, lines, append) {
    if (!targetFile) {
        return;
    }
    const resolved = entryPath(state.cwd, targetFile, resolvePath);
    const fileName = basename(resolved) || targetFile;
    const directory = fs[state.cwd] || {};
    if (!fs[state.cwd]) {
        fs[state.cwd] = directory;
    }
    if (!directory[fileName] && !directory[`/${fileName}`]) {
        directory[fileName] = {};
    }
    const fileContents = ensureFileContents(state);
    const text = (lines || []).join('\n');
    if (append && fileContents[resolved] != null && fileContents[resolved] !== '') {
        fileContents[resolved] = `${String(fileContents[resolved]).replace(/\n$/, '')}\n${text}`;
    } else {
        fileContents[resolved] = text;
    }
    queueUserFsSync('touch', state, { name: fileName });
}

function packageManagerNotAvailable(state, rawCommand, cmd) {
    const profile = getActiveProfile();
    const profileLabel = profile.displayName || `${profile.osFamily || 'linux'} ${profile.distro || ''}`.trim();
    return formatCommandResult(
        state,
        rawCommand,
        [
            `${cmd}: commande non disponible sur ce profil (${profileLabel}).`,
            'Utilisez man pour voir les commandes actives de cette distro.'
        ],
        { error: true }
    );
}

function runSingleTerminalCommand(state, command, helpers, runOptions) {
    const fs = state.fs || (typeof fileSystem !== 'undefined' ? fileSystem : {});
    const resolvePath = helpers.resolvePath || ((cwd, target) => target.startsWith('/') ? target : `${cwd}/${target}`);
    const options = runOptions || {};
    const stdinLines = Array.isArray(options.stdinLines) ? options.stdinLines : null;
    let rawCommand = String(command || '');
    if (state.shellEnv && state.shellEnv.aliases && window.CapsuleTerminalBashrc
        && typeof window.CapsuleTerminalBashrc.expandAliases === 'function') {
        rawCommand = window.CapsuleTerminalBashrc.expandAliases(rawCommand, state.shellEnv.aliases);
    }
    const parts = splitCommand(rawCommand);
    const [cmd, ...args] = parts;

    if (!cmd) {
        return formatCommandResult(state, rawCommand, []);
    }

    if (!isCommandAvailable(cmd)) {
        return formatCommandResult(state, rawCommand, [`${cmd}: command not found`], { error: true });
    }

    switch (cmd) {
        case 'help': {
            const activeCommands = getActiveCommands();
            const names = Object.keys(activeCommands).sort((a, b) => a.localeCompare(b));
            const lines = [
                'CapsuleOS virtual shell — available commands:',
                ...names.map((name) => {
                    const entry = activeCommands[name] || {};
                    const summary = entry.help || '';
                    return `  ${name.padEnd(14)}${summary}`;
                }),
                '',
                'Type `man <command>` for details.'
            ];
            return formatCommandResult(state, rawCommand, lines);
        }
        case 'man': {
            const commandHelpMap = getManualEntries();
            if (args.length === 0) {
                const commandNames = Object.keys(commandHelpMap);
                return formatCommandResult(
                    state,
                    rawCommand,
                    ['Commandes disponibles :', ...commandNames, 'Utilisation : man [commande]']
                );
            }
            const commandHelp = commandHelpMap[args[0]];
            if (!commandHelp) {
                return formatCommandResult(state, rawCommand, [`Aucune aide disponible pour ${args[0]}`], { error: true });
            }
            return formatCommandResult(
                state,
                rawCommand,
                [
                    `${args[0]} : ${commandHelp.help}`,
                    "Exemples d'utilisation :",
                    ...commandHelp.examples.map((example) => ` ${example}`)
                ]
            );
        }
        case 'cd': {
            const target = args[0] || '~';
            let nextPath = resolvePath(state.cwd, target);
            if (!isDirectory(fs, nextPath)) {
                const slashSafePath = resolveSlashSafeCdPath(state, fs, target, resolvePath);
                if (slashSafePath) {
                    nextPath = slashSafePath;
                }
            }
            if (isDirectory(fs, nextPath)) {
                state.cwd = nextPath;
                return formatCommandResult(state, rawCommand, []);
            }
            return formatCommandResult(state, rawCommand, [`cd: ${target}: No such file or directory`], { error: true });
        }
        case 'ls': {
            const longFormat = args.some((arg) => arg === '-l' || arg === '-la' || arg === '-al' || arg === '-1l');
            const pathArgs = args.filter((arg) => !arg.startsWith('-'));
            const targetPath = pathArgs[0] ? resolvePath(state.cwd, pathArgs[0]) : state.cwd;
            if (!isDirectory(fs, targetPath)) {
                const targetLabel = pathArgs[0] || targetPath;
                return formatCommandResult(state, rawCommand, [`ls: cannot access '${targetLabel}': No such file or directory`], { error: true });
            }
            if (longFormat) {
                const names = getDirectoryListing(fs, targetPath)
                    .filter(Boolean)
                    .sort((a, b) => a.localeCompare(b, 'fr'));
                const lines = [`total ${names.length}`, ...names.map((name) => formatLsLongLine(fs, targetPath, name, state))];
                return formatCommandResult(state, rawCommand, lines.length > 1 ? lines : ['total 0']);
            }
            const listingNames = getDirectoryListing(fs, targetPath).filter(Boolean);
            const listing = window.CapsuleTerminalListing
                ? window.CapsuleTerminalListing.formatNames(listingNames)
                : { lines: [listingNames.join('  ') || '.'], columnWidth: 0 };
            return formatCommandResult(state, rawCommand, listing.lines, {
                listing: true,
                listingColumnWidth: listing.columnWidth,
            });
        }
        case 'pwd':
            return formatCommandResult(state, rawCommand, [state.cwd]);
        case 'echo':
            return formatCommandResult(state, rawCommand, [expandShellVars(state, args.join(' '))]);
        case 'cat': {
            if (!args[0] && stdinLines) {
                return formatCommandResult(state, rawCommand, stdinLines);
            }
            const file = readFileContent(state, fs, state.cwd, args[0], resolvePath);
            if (file.error) {
                return formatCommandResult(state, rawCommand, [`cat: ${file.error}`], { error: true });
            }
            return formatCommandResult(state, rawCommand, String(file.content).split('\n'));
        }
        case 'head': {
            const count = parseLineCount(args, 10);
            const fileArg = args[0] === '-n' ? args[2] : args[0];
            if (!fileArg && stdinLines) {
                return formatCommandResult(state, rawCommand, stdinLines.slice(0, count));
            }
            const file = readFileContent(state, fs, state.cwd, fileArg, resolvePath);
            if (file.error) {
                return formatCommandResult(state, rawCommand, [`head: ${file.error}`], { error: true });
            }
            const lines = String(file.content).split('\n').slice(0, count);
            return formatCommandResult(state, rawCommand, lines);
        }
        case 'tail': {
            const count = parseLineCount(args, 10);
            const fileArg = args[0] === '-n' ? args[2] : args[0];
            if (!fileArg && stdinLines) {
                return formatCommandResult(state, rawCommand, stdinLines.slice(Math.max(0, stdinLines.length - count)));
            }
            const file = readFileContent(state, fs, state.cwd, fileArg, resolvePath);
            if (file.error) {
                return formatCommandResult(state, rawCommand, [`tail: ${file.error}`], { error: true });
            }
            const lines = String(file.content).split('\n');
            return formatCommandResult(state, rawCommand, lines.slice(Math.max(0, lines.length - count)));
        }
        case 'grep': {
            const flags = args.filter((arg) => arg.startsWith('-')).join('');
            const patternArgs = args.filter((arg) => !arg.startsWith('-'));
            const pattern = patternArgs[0];
            const fileArg = patternArgs[1];
            if (!pattern) {
                return formatCommandResult(state, rawCommand, ['grep: usage grep <motif> [fichier]'], { error: true });
            }
            const caseInsensitive = flags.includes('i');
            const invert = flags.includes('v');
            const recursive = flags.includes('r');
            let sourceLines = stdinLines;
            if (fileArg) {
                const file = readFileContent(state, fs, state.cwd, fileArg, resolvePath);
                if (file.error) {
                    return formatCommandResult(state, rawCommand, [`grep: ${file.error}`], { error: true });
                }
                sourceLines = String(file.content).split('\n');
                if (recursive && window.CapsuleTerminalFsOps && window.CapsuleTerminalFsOps.isDirectory(fs, file.resolved)) {
                    const extra = [];
                    const walk = (dirPath, prefix) => {
                        const names = getDirectoryListing(fs, dirPath);
                        names.forEach((name) => {
                            const child = dirPath === '/' ? `/${name}` : `${dirPath}/${name}`;
                            const label = prefix ? `${prefix}/${name}` : name;
                            if (window.CapsuleTerminalFsOps.isDirectory(fs, child)) {
                                walk(child, label);
                            } else {
                                const childFile = readFileContent(state, fs, state.cwd, child.replace(/^\//, ''), resolvePath);
                                if (!childFile.error) {
                                    String(childFile.content).split('\n').forEach((line) => extra.push(`${label}:${line}`));
                                }
                            }
                        });
                    };
                    walk(file.resolved, fileArg);
                    sourceLines = extra;
                }
            }
            if (!sourceLines) {
                return formatCommandResult(state, rawCommand, ['grep: opérande fichier manquant'], { error: true });
            }
            const needle = caseInsensitive ? pattern.toLowerCase() : pattern;
            const matches = sourceLines.filter((line) => {
                const haystack = caseInsensitive ? line.toLowerCase() : line;
                const found = haystack.includes(needle);
                return invert ? !found : found;
            });
            return formatCommandResult(
                state,
                rawCommand,
                matches.length > 0 ? matches : (invert ? sourceLines : [`Aucune correspondance pour '${pattern}'.`])
            );
        }
        case 'find': {
            const start = args[0] && !args[0].startsWith('-') ? resolvePath(state.cwd, args[0]) : state.cwd;
            const pattern = args[0] === '-name' ? args[1] : (args[1] === '-name' ? args[2] : null);
            if (!isDirectory(fs, start)) {
                return formatCommandResult(state, rawCommand, [`find: ${start}: Aucun fichier ou dossier de ce type`], { error: true });
            }
            const names = getDirectoryListing(fs, start);
            if (!pattern) {
                return formatCommandResult(state, rawCommand, names.map((name) => `${start}/${name}`));
            }
            const normalizedPattern = pattern.replace(/\*/g, '').toLowerCase();
            const filtered = names.filter((name) => name.toLowerCase().includes(normalizedPattern));
            return formatCommandResult(
                state,
                rawCommand,
                filtered.length > 0 ? filtered.map((name) => `${start}/${name}`) : [`Aucun résultat pour ${pattern}`]
            );
        }
        case 'touch': {
            const fileName = args[0];
            if (!fileName) {
                return formatCommandResult(state, rawCommand, ['touch: opérande fichier manquant'], { error: true });
            }
            const directory = fs[state.cwd] || {};
            if (!fs[state.cwd]) {
                fs[state.cwd] = directory;
            }
            if (directory[fileName] || directory[`/${fileName}`]) {
                return formatCommandResult(state, rawCommand, [`Fichier ${fileName} existe déjà.`]);
            }
            directory[fileName] = {};
            ensureFileContents(state)[entryPath(state.cwd, fileName, resolvePath)] = '';
            queueUserFsSync('touch', state, { name: fileName });
            return formatCommandResult(state, rawCommand, [`Fichier ${fileName} créé.`]);
        }
        case 'mkdir': {
            const dirName = args[0];
            if (!dirName) {
                return formatCommandResult(state, rawCommand, ['mkdir: opérande dossier manquant'], { error: true });
            }
            const directory = fs[state.cwd] || {};
            if (directory[dirName] || fs[resolvePath(state.cwd, dirName)]) {
                return formatCommandResult(state, rawCommand, [`Dossier ${dirName} existe déjà.`]);
            }
            addDirectory(fs, state.cwd, dirName, resolvePath);
            queueUserFsSync('mkdir', state, { name: dirName });
            return formatCommandResult(state, rawCommand, [`Dossier ${dirName} créé.`]);
        }
        case 'cp': {
            const fsOps = window.CapsuleTerminalFsOps;
            if (fsOps && typeof fsOps.parseCpArgs === 'function') {
                const parsed = fsOps.parseCpArgs(args);
                if (parsed.recursive && parsed.source && parsed.destination) {
                    const outcome = fsOps.copyRecursive(fs, state, state.cwd, parsed.source, parsed.destination, resolvePath, ensureFileContents);
                    if (outcome.error) {
                        return formatCommandResult(state, rawCommand, [outcome.error], { error: true });
                    }
                    queueUserFsSync('cp', state, { source: parsed.source, dest: parsed.destination });
                    return formatCommandResult(state, rawCommand, []);
                }
            }
            const source = args[0];
            const destination = args[1];
            if (!source || !destination) {
                return formatCommandResult(state, rawCommand, ['cp: usage cp <source> <destination>'], { error: true });
            }
            const directory = fs[state.cwd] || {};
            const sourceResolved = entryPath(state.cwd, source, resolvePath);
            const destinationResolved = entryPath(state.cwd, destination, resolvePath);
            const hasSource = directory[source] || directory[`/${source}`] || fs[sourceResolved]
                || ensureFileContents(state)[sourceResolved] != null;
            if (!hasSource) {
                return formatCommandResult(state, rawCommand, [`cp: cannot stat '${source}': No such file or directory`], { error: true });
            }
            if (isDirectory(fs, sourceResolved)) {
                fs[destinationResolved] = JSON.parse(JSON.stringify(fs[sourceResolved] || {}));
            } else {
                const fileContents = ensureFileContents(state);
                fileContents[destinationResolved] = fileContents[sourceResolved] || '';
                const modes = ensureFileModes(state);
                if (modes[sourceResolved]) {
                    modes[destinationResolved] = modes[sourceResolved];
                }
            }
            if (!directory[destination]) {
                directory[destination] = isDirectory(fs, sourceResolved) ? {} : {};
            }
            queueUserFsSync('cp', state, { source, dest: destination });
            return formatCommandResult(state, rawCommand, []);
        }
        case 'mv': {
            const source = args[0];
            const destination = args[1];
            if (!source || !destination) {
                return formatCommandResult(state, rawCommand, ['mv: usage mv <source> <destination>'], { error: true });
            }
            const directory = fs[state.cwd] || {};
            const sourceResolved = entryPath(state.cwd, source, resolvePath);
            const destinationResolved = entryPath(state.cwd, destination, resolvePath);
            if (!directory[source] && !directory[`/${source}`] && !fs[sourceResolved] && !ensureFileContents(state)[sourceResolved]) {
                return formatCommandResult(state, rawCommand, [`mv: impossible d'évaluer '${source}'`], { error: true });
            }

            const isDir = Boolean(fs[sourceResolved]);
            if (isDir) {
                fs[destinationResolved] = fs[sourceResolved];
                delete fs[sourceResolved];
            } else {
                const fileContents = ensureFileContents(state);
                fileContents[destinationResolved] = fileContents[sourceResolved] || '';
                delete fileContents[sourceResolved];
            }
            delete directory[source];
            delete directory[`/${source}`];
            directory[destination] = {};
            queueUserFsSync('mv', state, { source, dest: destination });
            return formatCommandResult(state, rawCommand, [`${source} déplacé vers ${destination}.`]);
        }
        case 'rm': {
            const fsOps = window.CapsuleTerminalFsOps;
            if (fsOps && typeof fsOps.parseRmArgs === 'function') {
                const parsed = fsOps.parseRmArgs(args);
                if (parsed.recursive && parsed.operands.length) {
                    const lines = [];
                    parsed.operands.forEach((operand) => {
                        const outcome = fsOps.removeRecursive(fs, state, state.cwd, operand, resolvePath, ensureFileContents);
                        if (outcome.error && !parsed.force) {
                            lines.push(outcome.error);
                        } else if (outcome.ok) {
                            queueUserFsSync('rm', state, { name: operand });
                        }
                    });
                    return formatCommandResult(state, rawCommand, lines, { error: lines.some((line) => line.startsWith('rm:')) });
                }
            }
            const fileName = args.find((arg) => !arg.startsWith('-'));
            if (!fileName) {
                return formatCommandResult(state, rawCommand, ['rm: opérande fichier manquant'], { error: true });
            }
            const directory = fs[state.cwd] || {};
            if (!directory[fileName] && !directory[`/${fileName}`] && !fs[resolvePath(state.cwd, fileName)]) {
                return formatCommandResult(state, rawCommand, [`Fichier ${fileName} non trouvé.`], { error: true });
            }
            removeEntry(fs, state.cwd, fileName, resolvePath);
            delete ensureFileContents(state)[entryPath(state.cwd, fileName, resolvePath)];
            queueUserFsSync('rm', state, { name: fileName });
            return formatCommandResult(state, rawCommand, [`Fichier ${fileName} supprimé.`]);
        }
        case 'rmdir': {
            const dirName = args[0];
            if (!dirName) {
                return formatCommandResult(state, rawCommand, ['rmdir: opérande dossier manquant'], { error: true });
            }
            const directoryPath = entryPath(state.cwd, dirName, resolvePath);
            if (!isDirectory(fs, directoryPath)) {
                return formatCommandResult(state, rawCommand, [`rmdir: ${dirName}: Aucun fichier ou dossier de ce type`], { error: true });
            }
            const children = getDirectoryListing(fs, directoryPath);
            if (children.length > 0) {
                return formatCommandResult(state, rawCommand, [`rmdir: échec suppression '${dirName}': Dossier non vide`], { error: true });
            }
            delete fs[directoryPath];
            if (fs[state.cwd]) {
                delete fs[state.cwd][dirName];
                delete fs[state.cwd][`/${dirName}`];
            }
            queueUserFsSync('rmdir', state, { name: dirName });
            return formatCommandResult(state, rawCommand, [`Dossier ${dirName} supprimé.`]);
        }
        case 'wc': {
            const linesOnly = args.includes('-l');
            const fileArg = args.find((arg) => !arg.startsWith('-'));
            let text = '';
            if (!fileArg && stdinLines) {
                text = stdinLines.join('\n');
            } else if (!fileArg) {
                return formatCommandResult(state, rawCommand, ['wc: opérande fichier manquant'], { error: true });
            } else {
                const file = readFileContent(state, fs, state.cwd, fileArg, resolvePath);
                if (file.error) {
                    return formatCommandResult(state, rawCommand, [`wc: ${file.error}`], { error: true });
                }
                text = String(file.content);
            }
            const lineCount = text.length ? text.split('\n').length : 0;
            const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
            const charCount = text.length;
            const label = fileArg || '';
            if (linesOnly) {
                return formatCommandResult(state, rawCommand, [label ? `${lineCount} ${label}` : `${lineCount}`]);
            }
            return formatCommandResult(state, rawCommand, [label
                ? `${lineCount} ${wordCount} ${charCount} ${label}`
                : `${lineCount} ${wordCount} ${charCount}`]);
        }
        case 'sort': {
            const fileArg = args.find((arg) => !arg.startsWith('-'));
            let lines = stdinLines;
            if (fileArg) {
                const file = readFileContent(state, fs, state.cwd, fileArg, resolvePath);
                if (file.error) {
                    return formatCommandResult(state, rawCommand, [`sort: ${file.error}`], { error: true });
                }
                lines = String(file.content).split('\n');
            }
            if (!lines) {
                return formatCommandResult(state, rawCommand, ['sort: opérande fichier manquant'], { error: true });
            }
            const sorted = lines.slice().sort((a, b) => a.localeCompare(b, 'fr'));
            return formatCommandResult(state, rawCommand, sorted);
        }
        case 'chmod': {
            const helpers = buildCommandHelpers(state, fs, resolvePath);
            if (window.CapsuleTerminalUsers && typeof window.CapsuleTerminalUsers.runChmod === 'function') {
                const outcome = window.CapsuleTerminalUsers.runChmod(state, args, helpers);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['chmod: module terminal-users.js non chargé.'], { error: true });
        }
        case 'clear':
            return formatCommandResult(state, rawCommand, [], { clear: true });
        case 'history':
            return formatCommandResult(state, rawCommand, state.history.map((entry, index) => `${index + 1}  ${entry}`));
        case 'whoami':
            return formatCommandResult(state, rawCommand, [state.user]);
        case 'uname':
            return formatCommandResult(state, rawCommand, [state.kernelName || 'CapsuleOS Linux']);
        case 'exit':
            return formatCommandResult(state, rawCommand, ['Session terminal terminée (simulation).']);
        case 'ps': {
            if (window.CapsuleTerminalProcesses && typeof window.CapsuleTerminalProcesses.runPs === 'function') {
                const outcome = window.CapsuleTerminalProcesses.runPs(state, args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['PID   TTY      TIME     CMD', '1001  pts/0    00:00    bash']);
        }
        case 'top': {
            if (window.CapsuleTerminalProcesses && typeof window.CapsuleTerminalProcesses.runTop === 'function') {
                const outcome = window.CapsuleTerminalProcesses.runTop(state);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['top: module terminal-processes.js non chargé.'], { error: true });
        }
        case 'pgrep': {
            if (window.CapsuleTerminalProcesses && typeof window.CapsuleTerminalProcesses.runPgrep === 'function') {
                const outcome = window.CapsuleTerminalProcesses.runPgrep(state, args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['pgrep: module terminal-processes.js non chargé.'], { error: true });
        }
        case 'killall': {
            if (window.CapsuleTerminalProcesses && typeof window.CapsuleTerminalProcesses.runKillall === 'function') {
                const outcome = window.CapsuleTerminalProcesses.runKillall(state, args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['killall: module terminal-processes.js non chargé.'], { error: true });
        }
        case 'nice': {
            if (window.CapsuleTerminalProcesses && typeof window.CapsuleTerminalProcesses.runNice === 'function') {
                const outcome = window.CapsuleTerminalProcesses.runNice(state, args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['nice: module terminal-processes.js non chargé.'], { error: true });
        }
        case 'kill': {
            if (window.CapsuleTerminalProcesses && typeof window.CapsuleTerminalProcesses.runKill === 'function') {
                const outcome = window.CapsuleTerminalProcesses.runKill(state, args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, [args[0] ? `Signal envoyé au processus ${args[0]} (simulation).` : 'kill: usage kill <pid>'], { error: !args[0] });
        }
        case 'ping': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runPing === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runPing(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(
                state,
                rawCommand,
                args[0]
                    ? [`PING ${args[0]} (simulation): 56(84) bytes of data.`, `64 bytes from ${args[0]}: icmp_seq=1 ttl=64 time=0.123 ms`, '', '--- ping statistics ---', '1 packets transmitted, 1 received, 0% packet loss']
                    : ['ping: usage ping <hôte>'],
                { error: !args[0] }
            );
        }
        case 'curl': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runCurl === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runCurl(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(
                state,
                rawCommand,
                args[0] ? [`curl: téléchargement simulé de ${args[0]}`, 'HTTP/2 200 OK', '<html>...</html>'] : ['curl: usage curl <url>'],
                { error: !args[0] }
            );
        }
        case 'wget': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runWget === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runWget(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['wget: module terminal-network.js non chargé.'], { error: true });
        }
        case 'ip': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runIp === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runIp(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['ip: module terminal-network.js non chargé.'], { error: true });
        }
        case 'netstat': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runNetstat === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runNetstat(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['netstat: module terminal-network.js non chargé.'], { error: true });
        }
        case 'traceroute': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runTraceroute === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runTraceroute(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['traceroute: module terminal-network.js non chargé.'], { error: true });
        }
        case 'route': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runRoute === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runRoute();
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['route: module terminal-network.js non chargé.'], { error: true });
        }
        case 'dig': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runDig === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runDig(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['dig: module terminal-network.js non chargé.'], { error: true });
        }
        case 'ftp': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runFtp === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runFtp(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['ftp: module terminal-network.js non chargé.'], { error: true });
        }
        case 'sftp': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runSftp === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runSftp(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['sftp: module terminal-network.js non chargé.'], { error: true });
        }
        case 'sudo': {
            const remainder = args.join(' ').trim();
            if (!remainder) {
                return formatCommandResult(state, rawCommand, ['usage: sudo <commande>']);
            }
            const prefix = [`[sudo] password for ${state.user}: *******`];
            const inner = runSingleTerminalCommand(state, remainder, helpers, {});
            return formatCommandResult(state, rawCommand, prefix.concat(inner.lines || []), {
                error: inner.error,
                clear: inner.clear,
                listing: inner.listing,
                listingColumnWidth: inner.listingColumnWidth,
                openEditor: inner.openEditor,
            });
        }
        case 'ssh': {
            if (window.CapsuleTerminalNetwork && typeof window.CapsuleTerminalNetwork.runSsh === 'function') {
                const outcome = window.CapsuleTerminalNetwork.runSsh(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['ssh: connexion distante non disponible (simulation pédagogique).']);
        }
        case 'ln': {
            if (window.CapsuleTerminalLinks && typeof window.CapsuleTerminalLinks.run === 'function') {
                const outcome = window.CapsuleTerminalLinks.run(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['ln: module terminal-links.js non chargé.'], { error: true });
        }
        case 'diff': {
            if (window.CapsuleTerminalTextCompare && typeof window.CapsuleTerminalTextCompare.runDiff === 'function') {
                const outcome = window.CapsuleTerminalTextCompare.runDiff(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['diff: module terminal-text-compare.js non chargé.'], { error: true });
        }
        case 'cmp': {
            if (window.CapsuleTerminalTextCompare && typeof window.CapsuleTerminalTextCompare.runCmp === 'function') {
                const outcome = window.CapsuleTerminalTextCompare.runCmp(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['cmp: module terminal-text-compare.js non chargé.'], { error: true });
        }
        case 'zip': {
            if (window.CapsuleTerminalArchives && typeof window.CapsuleTerminalArchives.runZip === 'function') {
                const outcome = window.CapsuleTerminalArchives.runZip(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['zip: module terminal-archives.js non chargé.'], { error: true });
        }
        case 'unzip': {
            if (window.CapsuleTerminalArchives && typeof window.CapsuleTerminalArchives.runUnzip === 'function') {
                const outcome = window.CapsuleTerminalArchives.runUnzip(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['unzip: module terminal-archives.js non chargé.'], { error: true });
        }
        case 'tar': {
            if (window.CapsuleTerminalArchives && typeof window.CapsuleTerminalArchives.runTar === 'function') {
                const outcome = window.CapsuleTerminalArchives.runTar(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['tar: module terminal-archives.js non chargé.'], { error: true });
        }
        case 'chown': {
            if (window.CapsuleTerminalUsers && typeof window.CapsuleTerminalUsers.runChown === 'function') {
                const outcome = window.CapsuleTerminalUsers.runChown(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['chown: module terminal-users.js non chargé.'], { error: true });
        }
        case 'chgrp': {
            if (window.CapsuleTerminalUsers && typeof window.CapsuleTerminalUsers.runChgrp === 'function') {
                const outcome = window.CapsuleTerminalUsers.runChgrp(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['chgrp: module terminal-users.js non chargé.'], { error: true });
        }
        case 'adduser':
        case 'useradd': {
            if (window.CapsuleTerminalUsers && typeof window.CapsuleTerminalUsers.runAdduser === 'function') {
                const outcome = window.CapsuleTerminalUsers.runAdduser(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['adduser: module terminal-users.js non chargé.'], { error: true });
        }
        case 'passwd': {
            if (window.CapsuleTerminalUsers && typeof window.CapsuleTerminalUsers.runPasswd === 'function') {
                const outcome = window.CapsuleTerminalUsers.runPasswd(state, args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['passwd: module terminal-users.js non chargé.'], { error: true });
        }
        case 'groupadd': {
            if (window.CapsuleTerminalUsers && typeof window.CapsuleTerminalUsers.runGroupadd === 'function') {
                const outcome = window.CapsuleTerminalUsers.runGroupadd(state, args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['groupadd: module terminal-users.js non chargé.'], { error: true });
        }
        case 'chattr': {
            if (window.CapsuleTerminalUsers && typeof window.CapsuleTerminalUsers.runChattr === 'function') {
                const outcome = window.CapsuleTerminalUsers.runChattr(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['chattr: module terminal-users.js non chargé.'], { error: true });
        }
        case 'lsattr': {
            if (window.CapsuleTerminalUsers && typeof window.CapsuleTerminalUsers.runLsattr === 'function') {
                const outcome = window.CapsuleTerminalUsers.runLsattr(state, args, buildCommandHelpers(state, fs, resolvePath));
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['lsattr: module terminal-users.js non chargé.'], { error: true });
        }
        case 'mount': {
            if (window.CapsuleTerminalSystemInfo && typeof window.CapsuleTerminalSystemInfo.runMount === 'function') {
                const outcome = window.CapsuleTerminalSystemInfo.runMount();
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['mount: module terminal-system-info.js non chargé.'], { error: true });
        }
        case 'umount': {
            if (window.CapsuleTerminalSystemInfo && typeof window.CapsuleTerminalSystemInfo.runUmount === 'function') {
                const outcome = window.CapsuleTerminalSystemInfo.runUmount(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['umount: module terminal-system-info.js non chargé.'], { error: true });
        }
        case 'shutdown': {
            if (window.CapsuleTerminalSystemInfo && typeof window.CapsuleTerminalSystemInfo.runShutdown === 'function') {
                const outcome = window.CapsuleTerminalSystemInfo.runShutdown(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['shutdown: module terminal-system-info.js non chargé.'], { error: true });
        }
        case 'reboot': {
            if (window.CapsuleTerminalSystemInfo && typeof window.CapsuleTerminalSystemInfo.runReboot === 'function') {
                const outcome = window.CapsuleTerminalSystemInfo.runReboot();
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['reboot: module terminal-system-info.js non chargé.'], { error: true });
        }
        case 'lscpu': {
            if (window.CapsuleTerminalSystemInfo && typeof window.CapsuleTerminalSystemInfo.runLscpu === 'function') {
                const outcome = window.CapsuleTerminalSystemInfo.runLscpu();
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['lscpu: module terminal-system-info.js non chargé.'], { error: true });
        }
        case 'lshw': {
            if (window.CapsuleTerminalSystemInfo && typeof window.CapsuleTerminalSystemInfo.runLshw === 'function') {
                const outcome = window.CapsuleTerminalSystemInfo.runLshw(args);
                return formatCommandResult(state, rawCommand, outcome.lines, { error: outcome.error });
            }
            return formatCommandResult(state, rawCommand, ['lshw: module terminal-system-info.js non chargé.'], { error: true });
        }
        case 'nano':
        case 'vim': {
            if (typeof window !== 'undefined'
                && window.CapsuleTerminalEditors
                && typeof window.CapsuleTerminalEditors.prepareCommand === 'function') {
                return window.CapsuleTerminalEditors.prepareCommand(state, cmd, args, {
                    resolvePath,
                    rawCommand,
                    formatCommandResult
                });
            }
            return formatCommandResult(
                state,
                rawCommand,
                [`${cmd}: éditeur indisponible (charger common/terminal-editors.js).`],
                { error: true }
            );
        }
        case 'less': {
            const file = readFileContent(state, fs, state.cwd, args[0], resolvePath);
            if (file.error) {
                return formatCommandResult(state, rawCommand, [`less: ${file.error}`], { error: true });
            }
            return formatCommandResult(state, rawCommand, String(file.content).split('\n'));
        }
        case 'dd':
            return formatCommandResult(state, rawCommand, ['dd: opération bas niveau simulée.']);
        case 'crontab':
            return formatCommandResult(state, rawCommand, ['crontab: planification non persistante (simulation).']);
        case 'cinnamon':
            return formatCommandResult(state, rawCommand, ['cinnamon: environnement déjà simulé dans l’interface graphique.']);
        case 'apt':
        case 'apt-get':
        case 'aptitude':
        case 'apturl':
        case 'dpkg':
        case 'dnf':
        case 'yum':
        case 'zypper':
        case 'rpm':
        case 'pacman':
            if (!isCommandAvailable(cmd)) {
                return packageManagerNotAvailable(state, rawCommand, cmd);
            }
            return runPackageManagerCommand(state, rawCommand, cmd, args);
        default:
            return formatCommandResult(state, rawCommand, [`${cmd}: command not found`], { error: true });
    }
}

function executeTerminalCommand(state, command, helpers = {}) {
    const fs = state.fs || (typeof fileSystem !== 'undefined' ? fileSystem : {});
    const resolvePath = helpers.resolvePath || ((cwd, target) => target.startsWith('/') ? target : `${cwd}/${target}`);
    const rawCommand = String(command || '').trim();
    if (!rawCommand) {
        return formatCommandResult(state, rawCommand, []);
    }

    const shell = typeof window !== 'undefined' ? window.CapsuleTerminalShell : null;
    const parsed = shell && typeof shell.parse === 'function' ? shell.parse(rawCommand) : null;
    const stages = parsed && Array.isArray(parsed.stages) ? parsed.stages : [{ command: rawCommand, outFile: null, append: false }];
    const isCompound = parsed && (parsed.type === 'pipeline' || parsed.type === 'redirect');

    if (!isCompound) {
        return runSingleTerminalCommand(state, rawCommand, helpers, {});
    }

    let stdinLines = null;
    let lastResult = formatCommandResult(state, rawCommand, []);

    for (let index = 0; index < stages.length; index += 1) {
        const stage = stages[index];
        if (!stage.command) {
            continue;
        }
        const isLast = index === stages.length - 1;
        lastResult = runSingleTerminalCommand(state, stage.command, helpers, { stdinLines });
        if (lastResult.error) {
            lastResult.command = rawCommand;
            return lastResult;
        }

        if (stage.outFile) {
            applyOutputRedirect(state, fs, resolvePath, stage.outFile, lastResult.lines, stage.append);
            lastResult = formatCommandResult(state, rawCommand, []);
        } else if (!isLast) {
            stdinLines = lastResult.lines || [];
        }
    }

    lastResult.command = rawCommand;
    return lastResult;
}

function executeCommand(command, session) {
    const terminalSession = session || (window.CapsuleTerminal && window.CapsuleTerminal.createSession({
        fs: typeof fileSystem !== 'undefined' ? fileSystem : {}
    }));
    return terminalSession ? terminalSession.execute(command) : null;
}

window.executeTerminalCommand = executeTerminalCommand;