/**
 * Noyau commun du terminal CapsuleOS.
 * Ne manipule pas le DOM : l'UI de chaque distro consomme ses résultats.
 */
(function initCapsuleTerminalCore() {
    const normalizePath = (path) => {
        const normalized = String(path || '/').replace(/\/+/g, '/');
        return normalized.length > 1 ? normalized.replace(/\/+$/, '') : '/';
    };

    const resolvePath = (cwd, target, home = '/') => {
        if (!target || target === '.') {
            return normalizePath(cwd);
        }
        if (target === '~') {
            return normalizePath(home);
        }
        if (target.startsWith('~/')) {
            return normalizePath(`${home}/${target.substring(2)}`);
        }

        const basePath = target.startsWith('/') ? '/' : normalizePath(cwd);
        const rawPath = target.startsWith('/') ? target : `${basePath}/${target}`;
        const parts = String(rawPath).split('/');
        const stack = [];

        parts.forEach((part) => {
            if (!part || part === '.') {
                return;
            }
            if (part === '..') {
                if (stack.length > 0) {
                    stack.pop();
                }
                return;
            }
            stack.push(part);
        });

        return normalizePath(`/${stack.join('/')}`);
    };

    const formatPrompt = (state) => {
        const home = normalizePath(state.home || '/');
        let pathLabel = state.cwd === '/' ? '/' : `/${state.cwd.substring(1)}`;
        if (home !== '/' && state.cwd === home) {
            pathLabel = '~';
        } else if (home !== '/' && state.cwd.startsWith(`${home}/`)) {
            pathLabel = `~/${state.cwd.substring(home.length + 1)}`;
        }
        return `${state.user}@${state.host}:${pathLabel}$ `;
    };

    const createSession = (options = {}) => {
        const home = normalizePath(options.home || options.cwd || '/');
        const state = {
            cwd: normalizePath(options.cwd || home),
            home,
            user: options.user || 'user',
            host: options.host || 'host',
            history: [],
            fs: options.fs || (typeof fileSystem !== 'undefined' ? fileSystem : {}),
            fileContents: options.fileContents || {},
            kernelName: options.kernelName || 'CapsuleOS Linux'
        };

        return {
            state,
            execute(command) {
                const raw = String(command || '');
                state.history.push(raw);
                if (typeof window.executeTerminalCommand !== 'function') {
                    return {
                        command: raw,
                        prompt: formatPrompt(state),
                        lines: ['Terminal: moteur de commandes indisponible.'],
                        error: true,
                        clear: false,
                        cwd: state.cwd
                    };
                }
                return window.executeTerminalCommand(state, raw, {
                    normalizePath,
                    resolvePath: (cwd, target) => resolvePath(cwd, target, state.home),
                    formatPrompt
                });
            },
            getPrompt() {
                return formatPrompt(state);
            },
            getCwd() {
                return state.cwd;
            },
            setCwd(path) {
                state.cwd = normalizePath(path);
            },
            getHistory() {
                return state.history.slice();
            }
        };
    };

    window.CapsuleTerminal = {
        createSession,
        normalizePath,
        resolvePath,
        formatPrompt
    };
})();
