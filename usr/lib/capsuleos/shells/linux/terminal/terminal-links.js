/**
 * Liens symboliques simulés — ln, ln -s.
 */
(function initCapsuleTerminalLinks(global) {
    'use strict';

    function ensureSymlinks(state) {
        if (!state.symlinks || typeof state.symlinks !== 'object') {
            state.symlinks = {};
        }
        return state.symlinks;
    }

    function run(state, args, helpers) {
        const fs = state.fs || {};
        const resolvePath = helpers.resolvePath;
        const cwd = state.cwd;
        let symbolic = false;
        const operands = [];
        (args || []).forEach((arg) => {
            if (arg === '-s' || arg === '--symbolic') {
                symbolic = true;
                return;
            }
            if (!arg.startsWith('-')) {
                operands.push(arg);
            }
        });
        const target = operands[0];
        const linkName = operands[1];
        if (!target || !linkName) {
            return { error: true, lines: ['ln: usage ln [-s] <cible> <lien>'] };
        }
        const linkResolved = resolvePath(cwd, linkName);
        const directory = fs[cwd] || {};
        if (directory[linkName] || directory[`/${linkName}`] || fs[linkResolved]) {
            return { error: true, lines: [`ln: failed to create symbolic link '${linkName}': File exists`] };
        }
        if (!fs[cwd]) {
            fs[cwd] = directory;
        }
        directory[linkName] = {};
        const symlinks = ensureSymlinks(state);
        symlinks[linkResolved] = {
            target: target,
            symbolic: symbolic,
        };
        if (helpers.queueUserFsSync) {
            helpers.queueUserFsSync('ln', state, { name: linkName, target });
        }
        return { error: false, lines: [] };
    }

    function resolveLinkTarget(state, resolved) {
        const symlinks = state.symlinks || {};
        const entry = symlinks[resolved];
        return entry ? entry.target : null;
    }

    global.CapsuleTerminalLinks = {
        run,
        resolveLinkTarget,
        ensureSymlinks,
    };
}(typeof window !== 'undefined' ? window : globalThis));
