/**
 * Opérations FS récursives — cp -r, rm -r/-rf.
 */
(function initCapsuleTerminalFsOps(global) {
    'use strict';

    function isDirectory(fs, path) {
        return Boolean(fs[path] && typeof fs[path] === 'object');
    }

    function getListing(fs, path) {
        const directory = fs[path];
        return directory && typeof directory === 'object' ? Object.keys(directory) : [];
    }

    function deepCopyDirectory(fs, sourcePath, destPath) {
        const source = fs[sourcePath] || {};
        fs[destPath] = JSON.parse(JSON.stringify(source));
        getListing(fs, sourcePath).forEach((name) => {
            const childSource = sourcePath === '/' ? `/${name}` : `${sourcePath}/${name}`;
            const childDest = destPath === '/' ? `/${name}` : `${destPath}/${name}`;
            if (isDirectory(fs, childSource)) {
                deepCopyDirectory(fs, childSource, childDest);
            }
        });
    }

    function copyRecursive(fs, state, cwd, source, destination, resolvePath, ensureFileContents) {
        const sourceResolved = resolvePath(cwd, source);
        const destResolved = resolvePath(cwd, destination);
        const directory = fs[cwd] || {};
        const fileContents = ensureFileContents(state);
        const hasSource = directory[source] || directory[`/${source}`] || fs[sourceResolved]
            || fileContents[sourceResolved] != null;
        if (!hasSource) {
            return { error: `cp: cannot stat '${source}': No such file or directory` };
        }
        if (isDirectory(fs, sourceResolved)) {
            fs[destResolved] = fs[destResolved] || {};
            deepCopyDirectory(fs, sourceResolved, destResolved);
            const destName = destination.split('/').pop();
            if (!directory[destName]) {
                directory[destName] = {};
            }
            Object.keys(fileContents).forEach((key) => {
                if (key === sourceResolved || key.startsWith(`${sourceResolved}/`)) {
                    const suffix = key.slice(sourceResolved.length);
                    fileContents[`${destResolved}${suffix}`] = fileContents[key];
                }
            });
        } else {
            fileContents[destResolved] = fileContents[sourceResolved] || '';
            const destName = destination.split('/').pop();
            if (!directory[destName]) {
                directory[destName] = {};
            }
        }
        return { ok: true, source, destination };
    }

    function removeRecursive(fs, state, cwd, target, resolvePath, ensureFileContents) {
        const resolved = resolvePath(cwd, target);
        const directory = fs[cwd] || {};
        const exists = directory[target] || directory[`/${target}`] || fs[resolved]
            || ensureFileContents(state)[resolved] != null;
        if (!exists) {
            return { error: `rm: cannot remove '${target}': No such file or directory` };
        }
        const fileContents = ensureFileContents(state);
        const modes = state.fileModes || {};
        const symlinks = state.symlinks || {};

        function purgePath(path) {
            delete fs[path];
            delete fileContents[path];
            delete modes[path];
            delete symlinks[path];
            if (isDirectory(fs, path)) {
                getListing(fs, path).forEach((name) => {
                    const child = path === '/' ? `/${name}` : `${path}/${name}`;
                    purgePath(child);
                });
            }
        }

        purgePath(resolved);
        if (fs[cwd]) {
            delete fs[cwd][target];
            delete fs[cwd][`/${target}`];
        }
        return { ok: true, name: target };
    }

    function parseRmArgs(args) {
        let recursive = false;
        let force = false;
        const operands = [];
        (args || []).forEach((arg) => {
            if (arg.startsWith('-')) {
                if (arg.includes('r')) {
                    recursive = true;
                }
                if (arg.includes('f')) {
                    force = true;
                }
                return;
            }
            operands.push(arg);
        });
        return { recursive, force, operands };
    }

    function parseCpArgs(args) {
        let recursive = false;
        const operands = [];
        (args || []).forEach((arg) => {
            if (arg === '-r' || arg === '-R' || arg === '--recursive') {
                recursive = true;
                return;
            }
            if (!arg.startsWith('-')) {
                operands.push(arg);
            }
        });
        return { recursive, source: operands[0], destination: operands[1] };
    }

    global.CapsuleTerminalFsOps = {
        copyRecursive,
        removeRecursive,
        parseRmArgs,
        parseCpArgs,
        isDirectory,
    };
}(typeof window !== 'undefined' ? window : globalThis));
