/**
 * Analyse pipelines et redirections (> >> |) pour le shell virtuel.
 */
(function initCapsuleTerminalShellParse(global) {
    'use strict';

    const stripQuotes = (value) => String(value || '').replace(/^['"]|['"]$/g, '').trim();

    function splitPipeline(raw) {
        const segments = [];
        let current = '';
        let inSingle = false;
        let inDouble = false;

        for (let index = 0; index < raw.length; index += 1) {
            const ch = raw[index];
            if (ch === "'" && !inDouble) {
                inSingle = !inSingle;
                current += ch;
                continue;
            }
            if (ch === '"' && !inSingle) {
                inDouble = !inDouble;
                current += ch;
                continue;
            }
            if (ch === '|' && !inSingle && !inDouble) {
                if (current.trim()) {
                    segments.push(current.trim());
                }
                current = '';
                continue;
            }
            current += ch;
        }
        if (current.trim()) {
            segments.push(current.trim());
        }
        return segments;
    }

    function parseRedirectSegment(segment) {
        const trimmed = String(segment || '').trim();
        if (!trimmed) {
            return { command: '', outFile: null, append: false };
        }

        const appendMatch = trimmed.match(/^(.*)>>(.+)$/);
        if (appendMatch) {
            const command = appendMatch[1].trim();
            const outFile = stripQuotes(appendMatch[2].trim().split(/\s+/)[0]);
            return { command, outFile, append: true };
        }

        const writeMatch = trimmed.match(/^(.*)>(.+)$/);
        if (writeMatch) {
            const command = writeMatch[1].trim();
            const outFile = stripQuotes(writeMatch[2].trim().split(/\s+/)[0]);
            return { command, outFile, append: false };
        }

        return { command: trimmed, outFile: null, append: false };
    }

    function parse(raw) {
        const segments = splitPipeline(raw);
        const stages = segments.map(parseRedirectSegment);
        const hasPipe = stages.length > 1;
        const hasRedirect = stages.some((stage) => stage.outFile);
        let type = 'simple';
        if (hasPipe) {
            type = 'pipeline';
        } else if (hasRedirect) {
            type = 'redirect';
        }
        return { type, stages };
    }

    global.CapsuleTerminalShell = {
        parse,
        splitPipeline,
        parseRedirectSegment,
    };
}(typeof window !== 'undefined' ? window : globalThis));
