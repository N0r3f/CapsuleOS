/**
 * Index des options et sous-commandes terminal — complétion Tab uniquement.
 * Règle : n’indexer que les flags/sous-commandes réellement implémentés (executeCommand + modules).
 * Contrat : etc/capsuleos/contracts/terminal-commands.json
 */
(function initCapsuleTerminalCommandOptions(global) {
    'use strict';

    const OPTION_FLAGS = Object.freeze({
        ls: ['-l', '-a', '-la', '-al', '-1'],
        grep: ['-i', '-v', '-r', '-ri', '-ir', '-rv', '-vr'],
        rm: ['-r', '-f', '-rf', '-fr'],
        cp: ['-r', '-R', '--recursive'],
        ln: ['-s', '--symbolic'],
        head: ['-n'],
        tail: ['-n'],
        find: ['-name'],
        ps: ['aux', '-ef'],
        netstat: ['-tuln', '-tulpn'],
        ip: ['a', 'addr', 'link'],
        nice: ['-n'],
        tar: ['-cvf', '-xvf'],
        zip: ['-r'],
        unzip: ['-l', '-o'],
        chmod: [],
        chown: [],
        chgrp: [],
        chattr: ['+i', '-i'],
        wget: ['-O'],
        curl: ['-O', '-L'],
        ping: ['-c'],
        kill: ['-9', '-15'],
        killall: ['-9'],
        lshw: ['-short'],
        shutdown: ['-h', 'now'],
    });

    const SUBCOMMANDS = Object.freeze({
        apt: ['update', 'upgrade', 'install', 'remove', 'purge', 'search', 'show', 'list'],
        'apt-get': ['update', 'upgrade', 'install', 'remove', 'purge', 'search', 'show'],
        dpkg: ['-l', '-i', '-r', '--list'],
        dnf: ['check-update', 'install', 'remove', 'search', 'info', 'update'],
        yum: ['check-update', 'install', 'remove', 'search', 'info', 'update'],
        zypper: ['refresh', 'update', 'install', 'remove', 'search', 'info'],
        rpm: ['-qa', '-qi', '-q'],
        pacman: ['-Syu', '-S', '-Ss', '-R', '-Q', '-Ql'],
        sudo: [],
    });

    const PACKAGE_MANAGER_COMMANDS = new Set([
        'apt', 'apt-get', 'dnf', 'yum', 'zypper', 'pacman', 'dpkg', 'rpm',
    ]);

    function isCommandActive(name) {
        const key = String(name || '').toLowerCase();
        if (!key) {
            return false;
        }
        if (typeof global.getTerminalActiveCommands === 'function') {
            return Boolean(global.getTerminalActiveCommands()[key]);
        }
        const active = global.CAPSULE_TERMINAL_ACTIVE_COMMANDS || {};
        return Boolean(active[key]);
    }

    function getOptions(command) {
        const key = String(command || '').toLowerCase();
        if (!isCommandActive(key)) {
            return [];
        }
        const flags = OPTION_FLAGS[key];
        if (flags && flags.length) {
            return flags.slice();
        }
        const subs = SUBCOMMANDS[key];
        if (subs && subs.length && subs.every((entry) => entry.startsWith('-'))) {
            return subs.slice();
        }
        return [];
    }

    function getSubcommands(command) {
        const key = String(command || '').toLowerCase();
        if (!isCommandActive(key)) {
            return [];
        }
        const subs = SUBCOMMANDS[key];
        if (!subs || !subs.length) {
            return [];
        }
        if (subs.every((entry) => entry.startsWith('-'))) {
            return [];
        }
        return subs.slice();
    }

    function hasSubcommands(command) {
        return getSubcommands(command).length > 0;
    }

    function matchOptions(command, prefix) {
        const needle = String(prefix || '');
        return getOptions(command).filter((flag) => flag.startsWith(needle));
    }

    function matchSubcommands(command, prefix) {
        const needle = String(prefix || '').toLowerCase();
        return getSubcommands(command).filter((sub) => sub.toLowerCase().startsWith(needle));
    }

    function isPackageManager(command) {
        return PACKAGE_MANAGER_COMMANDS.has(String(command || '').toLowerCase());
    }

    global.CapsuleTerminalCommandOptions = {
        OPTION_FLAGS,
        SUBCOMMANDS,
        getOptions,
        getSubcommands,
        hasSubcommands,
        matchOptions,
        matchSubcommands,
        isPackageManager,
        isCommandActive,
    };
}(typeof window !== 'undefined' ? window : globalThis));
