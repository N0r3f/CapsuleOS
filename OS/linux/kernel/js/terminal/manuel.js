(function initTerminalManual() {
    const active = (typeof window.getTerminalActiveCommands === 'function'
        ? window.getTerminalActiveCommands()
        : (window.CAPSULE_TERMINAL_ACTIVE_COMMANDS || {}));

    const manualEntries = Object.keys(active).reduce((acc, commandName) => {
        const entry = active[commandName] || {};
        acc[commandName] = {
            help: entry.help || `Commande ${commandName}`,
            examples: Array.isArray(entry.examples) && entry.examples.length > 0
                ? entry.examples
                : [commandName]
        };
        return acc;
    }, {});

    window.manuel = {
        man: manualEntries
    };
})();
