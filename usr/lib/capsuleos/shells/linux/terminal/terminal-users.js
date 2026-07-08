/**
 * Utilisateurs, groupes, permissions étendues — chown, chgrp, chmod, chattr, etc.
 */
(function initCapsuleTerminalUsers(global) {
    'use strict';

    function ensureOwners(state) {
        if (!state.fileOwners || typeof state.fileOwners !== 'object') {
            state.fileOwners = {};
        }
        return state.fileOwners;
    }

    function ensureGroups(state) {
        if (!state.groups || !Array.isArray(state.groups)) {
            state.groups = [state.user || 'user', 'users', 'sudo'];
        }
        return state.groups;
    }

    function ensureUsers(state) {
        if (!state.users || !Array.isArray(state.users)) {
            state.users = [{ name: state.user || 'user', home: state.home || '/home/public', groups: ['users'] }];
        }
        return state.users;
    }

    function ensureAttrs(state) {
        if (!state.fileAttrs || typeof state.fileAttrs !== 'object') {
            state.fileAttrs = {};
        }
        return state.fileAttrs;
    }

    function entryExists(state, fs, cwd, target, resolvePath, ensureFileContents) {
        const resolved = resolvePath(cwd, target);
        const directory = fs[cwd] || {};
        return Boolean(
            directory[target] || directory[`/${target}`] || fs[resolved]
            || ensureFileContents(state)[resolved] != null
        );
    }

    function isDirectory(fs, path) {
        return Boolean(fs[path] && typeof fs[path] === 'object');
    }

    function parseSymbolicChmod(mode, currentMode, isDir) {
        const base = currentMode || (isDir ? 'drwxr-xr-x' : '-rw-r--r--');
        const typeChar = base[0];
        let perms = base.slice(1);
        const parts = String(mode).match(/([augo]*)([+\-=])([rwx]+)/);
        if (!parts) {
            return null;
        }
        const who = parts[1] || 'a';
        const op = parts[2];
        const what = parts[3];
        const indices = [];
        if (!who || who.includes('a')) {
            indices.push(0, 1, 2);
        }
        if (who.includes('u')) {
            indices.push(0);
        }
        if (who.includes('g')) {
            indices.push(1);
        }
        if (who.includes('o')) {
            indices.push(2);
        }
        const unique = [...new Set(indices)];
        const permChars = perms.split('');
        unique.forEach((triad) => {
            const offset = triad * 3;
            'rwx'.split('').forEach((ch, idx) => {
                if (!what.includes(ch)) {
                    return;
                }
                const pos = offset + idx;
                if (op === '+') {
                    permChars[pos] = ch;
                } else if (op === '-') {
                    permChars[pos] = '-';
                } else if (op === '=') {
                    permChars[pos] = what.includes(ch) ? ch : '-';
                }
            });
        });
        return `${typeChar}${permChars.join('')}`;
    }

    function runChmod(state, args, helpers) {
        const mode = args[0];
        const target = args[1];
        if (!mode || !target) {
            return { error: true, lines: ['chmod: usage chmod <mode> <fichier>'] };
        }
        const fs = state.fs || {};
        const resolved = helpers.resolvePath(state.cwd, target);
        if (!entryExists(state, fs, state.cwd, target, helpers.resolvePath, helpers.ensureFileContents)) {
            return { error: true, lines: [`chmod: cannot access '${target}': No such file or directory`] };
        }
        const isDir = isDirectory(fs, resolved);
        const modes = helpers.ensureFileModes(state);
        let symbolic;
        if (/^[0-7]{3,4}$/.test(mode)) {
            const triadToSymbol = (value) => {
                const n = Number.parseInt(value, 10);
                return `${n & 4 ? 'r' : '-'}${n & 2 ? 'w' : '-'}${n & 1 ? 'x' : '-'}`;
            };
            const digits = mode.slice(-3);
            symbolic = `${isDir ? 'd' : '-'}${triadToSymbol(digits[0])}${triadToSymbol(digits[1])}${triadToSymbol(digits[2])}`;
        } else {
            symbolic = parseSymbolicChmod(mode, modes[resolved], isDir);
            if (!symbolic) {
                return { error: true, lines: [`chmod: mode invalide '${mode}'`] };
            }
        }
        modes[resolved] = symbolic;
        return { error: false, lines: [] };
    }

    function runChown(state, args, helpers) {
        const spec = args[0];
        const target = args[1];
        if (!spec || !target) {
            return { error: true, lines: ['chown: usage chown <user[:group]> <fichier>'] };
        }
        const fs = state.fs || {};
        const resolved = helpers.resolvePath(state.cwd, target);
        if (!entryExists(state, fs, state.cwd, target, helpers.resolvePath, helpers.ensureFileContents)) {
            return { error: true, lines: [`chown: cannot access '${target}': No such file or directory`] };
        }
        const parts = spec.split(':');
        ensureOwners(state)[resolved] = { user: parts[0], group: parts[1] || parts[0] };
        return { error: false, lines: [] };
    }

    function runChgrp(state, args, helpers) {
        const group = args[0];
        const target = args[1];
        if (!group || !target) {
            return { error: true, lines: ['chgrp: usage chgrp <groupe> <fichier>'] };
        }
        const fs = state.fs || {};
        const resolved = helpers.resolvePath(state.cwd, target);
        if (!entryExists(state, fs, state.cwd, target, helpers.resolvePath, helpers.ensureFileContents)) {
            return { error: true, lines: [`chgrp: cannot access '${target}': No such file or directory`] };
        }
        const owners = ensureOwners(state);
        owners[resolved] = Object.assign({}, owners[resolved], { group });
        return { error: false, lines: [] };
    }

    function runAdduser(state, args, helpers) {
        const name = args[0];
        if (!name) {
            return { error: true, lines: ['adduser: usage adduser <nom>'] };
        }
        const users = ensureUsers(state);
        if (users.some((user) => user.name === name)) {
            return { error: true, lines: [`adduser: user '${name}' already exists`] };
        }
        const home = `/home/${name}`;
        users.push({ name, home, groups: ['users'] });
        ensureGroups(state).push(name);
        const fs = state.fs || {};
        fs[home] = fs[home] || {};
        if (helpers.queueUserFsSync) {
            helpers.queueUserFsSync('mkdir', state, { name: home });
        }
        return { error: false, lines: [`Adding user '${name}' ...`, `Done.`] };
    }

    function runPasswd(state, args) {
        const name = args[0] || state.user;
        return {
            error: false,
            lines: [
                `Changing password for ${name}.`,
                'New password: ',
                'Retype new password: ',
                `passwd: password updated successfully (simulation).`,
            ],
        };
    }

    function runGroupadd(state, args) {
        const name = args[0];
        if (!name) {
            return { error: true, lines: ['groupadd: usage groupadd <groupe>'] };
        }
        const groups = ensureGroups(state);
        if (groups.includes(name)) {
            return { error: true, lines: [`groupadd: group '${name}' already exists`] };
        }
        groups.push(name);
        return { error: false, lines: [] };
    }

    function runChattr(state, args, helpers) {
        const flags = args.find((arg) => arg.startsWith('+') || arg.startsWith('-'));
        const target = args[args.length - 1];
        if (!flags || !target || target === flags) {
            return { error: true, lines: ['chattr: usage chattr +i <fichier>'] };
        }
        const fs = state.fs || {};
        const resolved = helpers.resolvePath(state.cwd, target);
        if (!entryExists(state, fs, state.cwd, target, helpers.resolvePath, helpers.ensureFileContents)) {
            return { error: true, lines: [`chattr: No such file or directory while trying to stat ${target}`] };
        }
        ensureAttrs(state)[resolved] = flags;
        return { error: false, lines: [] };
    }

    function runLsattr(state, args, helpers) {
        const target = args[0] || '.';
        const fs = state.fs || {};
        const resolved = helpers.resolvePath(state.cwd, target);
        if (!entryExists(state, fs, state.cwd, target, helpers.resolvePath, helpers.ensureFileContents)) {
            return { error: true, lines: [`lsattr: No such file or directory while trying to stat ${target}`] };
        }
        const attrs = ensureAttrs(state)[resolved] || '-------------e-------';
        const label = target === '.' ? basename(state.cwd) : target;
        return { error: false, lines: [`${attrs} ${label}`] };
    }

    function basename(path) {
        if (path === '/' || path === '~') {
            return path;
        }
        return String(path).split('/').filter(Boolean).pop() || path;
    }

    global.CapsuleTerminalUsers = {
        runChmod,
        runChown,
        runChgrp,
        runAdduser,
        runPasswd,
        runGroupadd,
        runChattr,
        runLsattr,
        ensureOwners,
        ensureUsers,
        ensureGroups,
        ensureAttrs,
    };
}(typeof window !== 'undefined' ? window : globalThis));
