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
        cwd: state.cwd
    };
}

function getDirectoryEntries(fs, path) {
    const directory = fs[path];
    return directory && typeof directory === 'object' ? Object.keys(directory) : [];
}

function isUbuntuGnomeTerminal() {
    return typeof document !== 'undefined' && document.body && document.body.id === 'ubuntu';
}

function usesGnomeStyleLsListing() {
    if (typeof document === 'undefined' || !document.body) {
        return false;
    }
    const bodyId = document.body.id;
    return bodyId === 'ubuntu' || bodyId === 'popos';
}

/** Colonnes type GNOME Terminal (réf. terminal.png) - noms sans slash initial. */
function formatGnomeLsLines(fs, targetPath) {
    const names = getDirectoryListing(fs, targetPath)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'fr'));
    if (!names.length) {
        return ['.'];
    }
    const columnCount = 5;
    const lines = [];
    for (let index = 0; index < names.length; index += columnCount) {
        lines.push(names.slice(index, index + columnCount).join('  '));
    }
    return lines;
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
    return Object.keys(directory).map((name) => name.startsWith('/') ? name.slice(1) : name);
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

function readFileContent(state, fs, cwd, target, resolvePath) {
    if (!target) {
        return { error: 'opérande fichier manquant' };
    }
    const resolved = entryPath(cwd, target, resolvePath);
    if (isDirectory(fs, resolved)) {
        return { error: `${target}: Est un dossier` };
    }
    const parentDir = fs[cwd] || {};
    const inCurrentDir = Object.prototype.hasOwnProperty.call(parentDir, target)
        || Object.prototype.hasOwnProperty.call(parentDir, `/${target}`);
    if (!inCurrentDir && !ensureFileContents(state)[resolved]) {
        return { error: `${target}: Aucun fichier ou dossier de ce type` };
    }
    const fileContents = ensureFileContents(state);
    const content = fileContents[resolved] || `Fichier simulé: ${basename(resolved)}\nCapsuleOS Terminal`;
    return { content, resolved };
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

function executeTerminalCommand(state, command, helpers = {}) {
    const fs = state.fs || (typeof fileSystem !== 'undefined' ? fileSystem : {});
    const resolvePath = helpers.resolvePath || ((cwd, target) => target.startsWith('/') ? target : `${cwd}/${target}`);
    const rawCommand = String(command || '');
    const parts = splitCommand(rawCommand);
    const [cmd, ...args] = parts;

    if (!cmd) {
        return formatCommandResult(state, rawCommand, []);
    }

    if (!isCommandAvailable(cmd)) {
        return formatCommandResult(state, rawCommand, [`Commande inexistante : ${cmd}`, 'Essayez la commande : man'], { error: true });
    }

    switch (cmd) {
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
            return formatCommandResult(state, rawCommand, [`cd: ${target}: Aucun fichier ou dossier de ce type`], { error: true });
        }
        case 'ls': {
            const targetPath = args[0] ? resolvePath(state.cwd, args[0]) : state.cwd;
            if (!isDirectory(fs, targetPath)) {
                const targetLabel = args[0] || targetPath;
                return formatCommandResult(state, rawCommand, [`ls: impossible d'accéder à '${targetLabel}': Aucun fichier ou dossier de ce type`], { error: true });
            }
            if (usesGnomeStyleLsListing()) {
                return formatCommandResult(state, rawCommand, formatGnomeLsLines(fs, targetPath), {
                    listing: true
                });
            }
            return formatCommandResult(state, rawCommand, [getDirectoryListing(fs, targetPath).join('  ') || '.'], {
                listing: true
            });
        }
        case 'pwd':
            return formatCommandResult(state, rawCommand, [state.cwd]);
        case 'echo':
            return formatCommandResult(state, rawCommand, [args.join(' ')]);
        case 'cat': {
            const file = readFileContent(state, fs, state.cwd, args[0], resolvePath);
            if (file.error) {
                return formatCommandResult(state, rawCommand, [`cat: ${file.error}`], { error: true });
            }
            return formatCommandResult(state, rawCommand, String(file.content).split('\n'));
        }
        case 'head': {
            const count = parseLineCount(args, 10);
            const fileArg = args[0] === '-n' ? args[2] : args[0];
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
            const file = readFileContent(state, fs, state.cwd, fileArg, resolvePath);
            if (file.error) {
                return formatCommandResult(state, rawCommand, [`tail: ${file.error}`], { error: true });
            }
            const lines = String(file.content).split('\n');
            return formatCommandResult(state, rawCommand, lines.slice(Math.max(0, lines.length - count)));
        }
        case 'grep': {
            const pattern = args[0];
            const fileArg = args[1];
            if (!pattern || !fileArg) {
                return formatCommandResult(state, rawCommand, ['grep: usage grep <motif> <fichier>'], { error: true });
            }
            const file = readFileContent(state, fs, state.cwd, fileArg, resolvePath);
            if (file.error) {
                return formatCommandResult(state, rawCommand, [`grep: ${file.error}`], { error: true });
            }
            const matches = String(file.content)
                .split('\n')
                .filter((line) => line.toLowerCase().includes(pattern.toLowerCase()));
            return formatCommandResult(
                state,
                rawCommand,
                matches.length > 0 ? matches : [`Aucune correspondance pour '${pattern}'.`]
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
            return formatCommandResult(state, rawCommand, [`Dossier ${dirName} créé.`]);
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
            return formatCommandResult(state, rawCommand, [`${source} déplacé vers ${destination}.`]);
        }
        case 'rm': {
            const fileName = args[0];
            if (!fileName) {
                return formatCommandResult(state, rawCommand, ['rm: opérande fichier manquant'], { error: true });
            }
            const directory = fs[state.cwd] || {};
            if (!directory[fileName] && !directory[`/${fileName}`] && !fs[resolvePath(state.cwd, fileName)]) {
                return formatCommandResult(state, rawCommand, [`Fichier ${fileName} non trouvé.`], { error: true });
            }
            removeEntry(fs, state.cwd, fileName, resolvePath);
            delete ensureFileContents(state)[entryPath(state.cwd, fileName, resolvePath)];
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
            return formatCommandResult(state, rawCommand, [`Dossier ${dirName} supprimé.`]);
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
        case 'ps':
            return formatCommandResult(state, rawCommand, ['PID   TTY      TIME     CMD', '1001  pts/0    00:00    bash', '1120  pts/0    00:00    capsule-daemon']);
        case 'kill':
            return formatCommandResult(state, rawCommand, [args[0] ? `Signal envoyé au processus ${args[0]} (simulation).` : 'kill: usage kill <pid>'], { error: !args[0] });
        case 'ping':
            return formatCommandResult(
                state,
                rawCommand,
                args[0]
                    ? [`PING ${args[0]} (simulation): 56(84) bytes of data.`, `64 bytes from ${args[0]}: icmp_seq=1 ttl=64 time=0.123 ms`, '', '--- ping statistics ---', '1 packets transmitted, 1 received, 0% packet loss']
                    : ['ping: usage ping <hôte>'],
                { error: !args[0] }
            );
        case 'curl':
            return formatCommandResult(
                state,
                rawCommand,
                args[0] ? [`curl: téléchargement simulé de ${args[0]}`, 'HTTP/2 200 OK', '<html>...</html>'] : ['curl: usage curl <url>'],
                { error: !args[0] }
            );
        case 'sudo':
            return formatCommandResult(state, rawCommand, ['sudo: mode simulation, privilèges non requis dans CapsuleOS.']);
        case 'ssh':
            return formatCommandResult(state, rawCommand, ['ssh: connexion distante non disponible (simulation pédagogique).']);
        case 'nano':
            return formatCommandResult(state, rawCommand, ['nano: éditeur interactif non simulé.']);
        case 'less':
            return formatCommandResult(state, rawCommand, ['less: pagination interactive non simulée.']);
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
        case 'zypper':
        case 'rpm':
        case 'pacman':
            if (!isCommandAvailable(cmd)) {
                return packageManagerNotAvailable(state, rawCommand, cmd);
            }
            return formatCommandResult(state, rawCommand, [`${cmd}: exécution simulée pour le profil ${getActiveProfile().distro || 'linux'}.`]);
        default:
            return formatCommandResult(state, rawCommand, [`Commande inexistante : ${cmd}`, 'Essayez la commande : man'], { error: true });
    }
}

function executeCommand(command, session) {
    const terminalSession = session || (window.CapsuleTerminal && window.CapsuleTerminal.createSession({
        fs: typeof fileSystem !== 'undefined' ? fileSystem : {}
    }));
    return terminalSession ? terminalSession.execute(command) : null;
}

window.executeTerminalCommand = executeTerminalCommand;