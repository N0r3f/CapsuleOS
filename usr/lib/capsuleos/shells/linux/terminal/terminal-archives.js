/**
 * Archives simulées — zip, unzip, tar.
 */
(function initCapsuleTerminalArchives(global) {
    'use strict';

    function ensureArchives(state) {
        if (!state.archives || typeof state.archives !== 'object') {
            state.archives = {};
        }
        return state.archives;
    }

    function basename(path) {
        return String(path || '').split('/').filter(Boolean).pop() || path;
    }

    function readMembers(state, helpers, names) {
        const members = {};
        names.forEach((name) => {
            const file = helpers.readFileContent(state, name);
            if (!file.error) {
                members[name] = String(file.content);
            }
        });
        return members;
    }

    function runZip(state, args, helpers) {
        const archiveName = args[args.length - 1];
        const sources = args.slice(0, -1).filter((arg) => !arg.startsWith('-'));
        if (!archiveName || !sources.length) {
            return { error: true, lines: ['zip: usage zip <archive.zip> <fichiers...>'] };
        }
        const members = readMembers(state, helpers, sources);
        if (!Object.keys(members).length) {
            return { error: true, lines: ['zip: aucun fichier valide à archiver'] };
        }
        const resolved = helpers.resolvePath(state.cwd, archiveName);
        const archives = ensureArchives(state);
        archives[resolved] = { type: 'zip', members };
        const directory = state.fs[state.cwd] || {};
        if (!state.fs[state.cwd]) {
            state.fs[state.cwd] = directory;
        }
        directory[basename(archiveName)] = {};
        if (helpers.queueUserFsSync) {
            helpers.queueUserFsSync('touch', state, { name: basename(archiveName) });
        }
        const lines = Object.keys(members).map((name) => `  adding: ${name}`);
        lines.push(`zip: ${archiveName} créé (${Object.keys(members).length} fichiers)`);
        return { error: false, lines };
    }

    function runUnzip(state, args, helpers) {
        const archiveName = args.find((arg) => !arg.startsWith('-'));
        if (!archiveName) {
            return { error: true, lines: ['unzip: usage unzip <archive.zip>'] };
        }
        const resolved = helpers.resolvePath(state.cwd, archiveName);
        const archives = ensureArchives(state);
        const archive = archives[resolved];
        if (!archive || archive.type !== 'zip') {
            return { error: true, lines: [`unzip: cannot find or open ${archiveName}`] };
        }
        const fileContents = helpers.ensureFileContents(state);
        const directory = state.fs[state.cwd] || {};
        if (!state.fs[state.cwd]) {
            state.fs[state.cwd] = directory;
        }
        const lines = [];
        Object.keys(archive.members).forEach((name) => {
            const memberResolved = helpers.resolvePath(state.cwd, name);
            fileContents[memberResolved] = archive.members[name];
            directory[basename(name)] = {};
            lines.push(`  inflating: ${name}`);
            if (helpers.queueUserFsSync) {
                helpers.queueUserFsSync('touch', state, { name: basename(name) });
            }
        });
        return { error: false, lines };
    }

    function runTar(state, args, helpers) {
        const flags = (args[0] || '').replace(/^-/, '');
        if (flags.includes('c')) {
            const archiveName = args[args.length - 1];
            const sources = args.slice(1, -1).filter((arg) => !arg.startsWith('-'));
            if (!archiveName || !sources.length) {
                return { error: true, lines: ['tar: usage tar -cvf <archive.tar> <fichiers...>'] };
            }
            const members = readMembers(state, helpers, sources);
            const resolved = helpers.resolvePath(state.cwd, archiveName);
            ensureArchives(state)[resolved] = { type: 'tar', members };
            const directory = state.fs[state.cwd] || {};
            if (!state.fs[state.cwd]) {
                state.fs[state.cwd] = directory;
            }
            directory[basename(archiveName)] = {};
            const lines = Object.keys(members).map((name) => name);
            return { error: false, lines };
        }
        if (flags.includes('x')) {
            const archiveName = args[args.length - 1];
            if (!archiveName) {
                return { error: true, lines: ['tar: usage tar -xvf <archive.tar>'] };
            }
            const resolved = helpers.resolvePath(state.cwd, archiveName);
            const archive = ensureArchives(state)[resolved];
            if (!archive) {
                return { error: true, lines: [`tar: ${archiveName}: Cannot open: No such file or directory`] };
            }
            const fileContents = helpers.ensureFileContents(state);
            const directory = state.fs[state.cwd] || {};
            Object.keys(archive.members).forEach((name) => {
                fileContents[helpers.resolvePath(state.cwd, name)] = archive.members[name];
                directory[basename(name)] = {};
            });
            return { error: false, lines: Object.keys(archive.members) };
        }
        return { error: true, lines: ['tar: options -cvf ou -xvf supportées'] };
    }

    global.CapsuleTerminalArchives = {
        runZip,
        runUnzip,
        runTar,
        ensureArchives,
    };
}(typeof window !== 'undefined' ? window : globalThis));
