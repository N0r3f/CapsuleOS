/**
 * Comparaison de fichiers texte — diff, cmp.
 */
(function initCapsuleTerminalTextCompare(global) {
    'use strict';

    function runDiff(state, args, helpers) {
        const fileA = args[0];
        const fileB = args[1];
        if (!fileA || !fileB) {
            return { error: true, lines: ['diff: usage diff <fichier1> <fichier2>'] };
        }
        const read = helpers.readFileContent;
        const a = read(state, fileA);
        if (a.error) {
            return { error: true, lines: [`diff: ${a.error}`] };
        }
        const b = read(state, fileB);
        if (b.error) {
            return { error: true, lines: [`diff: ${b.error}`] };
        }
        const linesA = String(a.content).split('\n');
        const linesB = String(b.content).split('\n');
        if (linesA.join('\n') === linesB.join('\n')) {
            return { error: false, lines: [] };
        }
        const output = [];
        const max = Math.max(linesA.length, linesB.length);
        for (let i = 0; i < max; i += 1) {
            const la = linesA[i];
            const lb = linesB[i];
            if (la !== lb) {
                if (la != null) {
                    output.push(`< ${la}`);
                }
                if (lb != null) {
                    output.push(`> ${lb}`);
                }
            }
        }
        return { error: false, lines: output.length ? output : [`Files ${fileA} and ${fileB} differ`] };
    }

    function runCmp(state, args, helpers) {
        const fileA = args[0];
        const fileB = args[1];
        if (!fileA || !fileB) {
            return { error: true, lines: ['cmp: usage cmp <fichier1> <fichier2>'] };
        }
        const read = helpers.readFileContent;
        const a = read(state, fileA);
        if (a.error) {
            return { error: true, lines: [`cmp: ${a.error}`] };
        }
        const b = read(state, fileB);
        if (b.error) {
            return { error: true, lines: [`cmp: ${b.error}`] };
        }
        const contentA = String(a.content);
        const contentB = String(b.content);
        if (contentA === contentB) {
            return { error: false, lines: [] };
        }
        const minLen = Math.min(contentA.length, contentB.length);
        let offset = 0;
        for (; offset < minLen; offset += 1) {
            if (contentA.charCodeAt(offset) !== contentB.charCodeAt(offset)) {
                break;
            }
        }
        const line = contentA.slice(0, offset).split('\n').length;
        const col = offset - contentA.slice(0, offset).lastIndexOf('\n');
        return {
            error: false,
            lines: [`${fileA} ${fileB} differ: byte ${offset + 1}, line ${line}`],
        };
    }

    global.CapsuleTerminalTextCompare = {
        runDiff,
        runCmp,
    };
}(typeof window !== 'undefined' ? window : globalThis));
