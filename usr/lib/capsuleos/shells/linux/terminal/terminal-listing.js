/**
 * Listing terminal partagé (ls multi-colonnes) — L1 format + L3 rendu DOM.
 * Réf. contrat etc/capsuleos/contracts/terminal-output-fidelity.json (To₁, To₂, To₃).
 * Chrome / skins : tokens CSS uniquement — pas de layout listing dans home/.
 */
(function initCapsuleTerminalListing(global) {
    'use strict';

    const DEFAULT_COLUMN_COUNT = 5;
    const DEFAULT_COLUMN_PADDING = 2;

    function formatNames(names, options) {
        options = options || {};
        const columnCount = options.columnCount || DEFAULT_COLUMN_COUNT;
        const padding = options.columnPadding || DEFAULT_COLUMN_PADDING;
        const sorted = (Array.isArray(names) ? names : [])
            .map((name) => String(name || '').trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'fr'));
        if (!sorted.length) {
            return { lines: ['.'], columnWidth: 1, columnCount: columnCount };
        }
        const columnWidth = Math.max(...sorted.map((name) => name.length), 1) + padding;
        const lines = [];
        for (let index = 0; index < sorted.length; index += columnCount) {
            lines.push(
                sorted.slice(index, index + columnCount)
                    .map((name) => name.padEnd(columnWidth))
                    .join('')
            );
        }
        return { lines: lines, columnWidth: columnWidth, columnCount: columnCount };
    }

    function splitNames(line, columnWidth) {
        const text = String(line || '');
        const width = Number(columnWidth) > 0 ? Number(columnWidth) : 0;
        if (!width || !text.length) {
            return text.trim().split(/\s+/).filter(Boolean);
        }
        const names = [];
        for (let index = 0; index < text.length; index += width) {
            const chunk = text.slice(index, index + width).trimEnd();
            if (chunk) {
                names.push(chunk);
            }
        }
        return names.length ? names : text.trim().split(/\s+/).filter(Boolean);
    }

    function inferColumnWidth(lines, fallbackWidth) {
        if (Number(fallbackWidth) > 0) {
            return Number(fallbackWidth);
        }
        const names = (lines || []).flatMap((line) => splitNames(line, 0));
        if (!names.length) {
            return 10;
        }
        return Math.max(...names.map((name) => name.length)) + DEFAULT_COLUMN_PADDING;
    }

    function resolveColumnCssVar(bodyId) {
        if (bodyId === 'popos') {
            return '--popos-terminal-ls-col-width';
        }
        if (bodyId === 'mint') {
            return '--mint-terminal-ls-col-width';
        }
        return '--terminal-ls-col-width';
    }

    function isListingDirectory(session, name) {
        if (!global.CapsuleTerminal || !session || !session.state) {
            return false;
        }
        const state = session.state;
        const resolved = global.CapsuleTerminal.resolvePath(state.cwd, name, state.home);
        return Boolean(state.fs[resolved] && typeof state.fs[resolved] === 'object');
    }

    function renderLine(output, line, session, columnWidthCh) {
        if (!output || typeof document === 'undefined') {
            return;
        }
        const row = document.createElement('div');
        row.className = 'capsule-terminal__line capsule-terminal__line--listing';

        const code = document.createElement('code');
        const bodyId = global.document && global.document.body ? global.document.body.id : '';
        const lsVar = resolveColumnCssVar(bodyId);
        const width = Number(columnWidthCh) > 0 ? Number(columnWidthCh) : 0;
        if (width) {
            code.style.setProperty(lsVar, `${width}ch`);
        }

        const names = splitNames(line, width);
        names.forEach((name) => {
            const cleanName = name.startsWith('/') ? name.slice(1) : name;
            const span = document.createElement('span');
            span.textContent = cleanName;
            span.className = isListingDirectory(session, cleanName)
                ? 'capsule-terminal__dir'
                : 'capsule-terminal__file';
            if (width) {
                span.style.width = `${width}ch`;
            }
            code.appendChild(span);
        });

        row.appendChild(code);
        output.appendChild(row);
    }

    global.CapsuleTerminalListing = {
        DEFAULT_COLUMN_COUNT: DEFAULT_COLUMN_COUNT,
        DEFAULT_COLUMN_PADDING: DEFAULT_COLUMN_PADDING,
        formatNames: formatNames,
        splitNames: splitNames,
        inferColumnWidth: inferColumnWidth,
        resolveColumnCssVar: resolveColumnCssVar,
        isListingDirectory: isListingDirectory,
        renderLine: renderLine,
    };
}(typeof window !== 'undefined' ? window : globalThis));
