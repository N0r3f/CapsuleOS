/**
 * Profil shell virtuel — sous-ensemble ~/.bashrc (Linux pédagogique).
 * Charge alias, PS1 et LS_COLORS depuis le FS manifeste (fileContents).
 */
(function initCapsuleTerminalBashrc(global) {
    'use strict';

    const stripQuotes = (value) => {
        const text = String(value || '').trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            return text.slice(1, -1);
        }
        return text;
    };

    const parseBashrc = (content) => {
        const aliases = {};
        const exportsMap = {};
        let ps1 = null;
        let lsColors = null;

        String(content || '').split('\n').forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                return;
            }

            const aliasMatch = trimmed.match(/^alias\s+([A-Za-z0-9_.-]+)=(.+)$/);
            if (aliasMatch) {
                aliases[aliasMatch[1]] = stripQuotes(aliasMatch[2]);
                return;
            }

            const exportAlias = trimmed.match(/^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.+)$/);
            if (exportAlias) {
                const key = exportAlias[1];
                const value = stripQuotes(exportAlias[2]);
                exportsMap[key] = value;
                if (key === 'PS1') {
                    ps1 = value;
                }
                if (key === 'LS_COLORS') {
                    lsColors = value;
                }
                return;
            }

            const ps1Match = trimmed.match(/^PS1=(.+)$/);
            if (ps1Match) {
                ps1 = stripQuotes(ps1Match[1]);
            }
        });

        return { aliases, exports: exportsMap, ps1, lsColors };
    };

    const pathLabel = (state) => {
        const home = global.CapsuleTerminal
            ? global.CapsuleTerminal.normalizePath(state.home || '/')
            : String(state.home || '/');
        const cwd = global.CapsuleTerminal
            ? global.CapsuleTerminal.normalizePath(state.cwd || '/')
            : String(state.cwd || '/');
        if (cwd === '/') {
            return '/';
        }
        if (home !== '/' && cwd === home) {
            return '~';
        }
        if (home !== '/' && cwd.startsWith(`${home}/`)) {
            return `~/${cwd.substring(home.length + 1)}`;
        }
        return `/${cwd.replace(/^\//, '')}`;
    };

    const resolvePs1 = (template, state) => {
        const text = String(template || '');
        const basename = (() => {
            const label = pathLabel(state);
            if (label === '~' || label === '/') {
                return label;
            }
            const parts = label.split('/');
            return parts[parts.length - 1] || label;
        })();

        return text
            .replace(/\\u/g, state.user || 'user')
            .replace(/\\h/g, state.host || 'host')
            .replace(/\\H/g, state.host || 'host')
            .replace(/\\w/g, pathLabel(state))
            .replace(/\\W/g, basename)
            .replace(/\\\$/g, '$')
            .replace(/\\#/g, '#');
    };

    const readBashrcContent = (state) => {
        const contents = state.fileContents || {};
        const home = global.CapsuleTerminal
            ? global.CapsuleTerminal.normalizePath(state.home || '/')
            : String(state.home || '/');
        const candidates = [
            `${home}/.bashrc`,
            '~/.bashrc',
            '/home/user/.bashrc',
        ];
        for (let index = 0; index < candidates.length; index += 1) {
            const key = candidates[index];
            if (contents[key]) {
                return String(contents[key]);
            }
        }
        return '';
    };

    const applyToState = (state) => {
        const content = readBashrcContent(state);
        if (!content) {
            return null;
        }
        const parsed = parseBashrc(content);
        state.shellEnv = Object.assign({}, state.shellEnv || {}, parsed);
        return parsed;
    };

    const expandAliases = (command, aliases) => {
        const raw = String(command || '').trim();
        if (!raw || !aliases || typeof aliases !== 'object') {
            return raw;
        }
        const spaceIndex = raw.indexOf(' ');
        const head = spaceIndex === -1 ? raw : raw.slice(0, spaceIndex);
        const tail = spaceIndex === -1 ? '' : raw.slice(spaceIndex + 1);
        if (!Object.prototype.hasOwnProperty.call(aliases, head)) {
            return raw;
        }
        const expanded = String(aliases[head] || '').trim();
        return tail ? `${expanded} ${tail}` : expanded;
    };

    global.CapsuleTerminalBashrc = {
        parseBashrc,
        applyToState,
        resolvePs1,
        expandAliases,
        readBashrcContent,
    };
}(typeof window !== 'undefined' ? window : globalThis));
