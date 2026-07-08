/**
 * Processus simulés partagés terminal ↔ Moniteur système.
 */
(function initCapsuleTerminalProcesses(global) {
    'use strict';

    const PROCESSES_BY_BODY = {
        mint: [
            { name: 'bash', user: 'capsule', pid: '1001', cpu: '0.1', mem: '4.2', nice: '0', cmd: 'bash' },
            { name: 'cinnamon', user: 'capsule', pid: '1842', cpu: '4.2', mem: '142.3', nice: '0', cmd: 'cinnamon' },
            { name: 'firefox', user: 'capsule', pid: '4521', cpu: '2.8', mem: '512.1', nice: '0', cmd: 'firefox' },
            { name: 'nemo', user: 'capsule', pid: '3890', cpu: '0.5', mem: '48.2', nice: '0', cmd: 'nemo' },
            { name: 'ptyxis', user: 'capsule', pid: '4102', cpu: '0.1', mem: '24.6', nice: '0', cmd: 'ptyxis' },
            { name: 'Xorg', user: 'capsule', pid: '1120', cpu: '3.4', mem: '88.0', nice: '0', cmd: 'Xorg' },
        ],
        rocky: [
            { name: 'bash', user: 'capsule', pid: '1001', cpu: '0.1', mem: '4.2', nice: '0', cmd: 'bash' },
            { name: 'gnome-shell', user: 'capsule', pid: '1842', cpu: '5.2', mem: '312.4', nice: '0', cmd: 'gnome-shell' },
            { name: 'ptyxis', user: 'capsule', pid: '4102', cpu: '0.1', mem: '24.6', nice: '0', cmd: 'ptyxis' },
            { name: 'nautilus', user: 'capsule', pid: '3890', cpu: '0.3', mem: '58.1', nice: '0', cmd: 'nautilus' },
            { name: 'systemd', user: 'capsule', pid: '2104', cpu: '0.0', mem: '18.5', nice: '0', cmd: 'systemd --user' },
            { name: 'mutter', user: 'capsule', pid: '1120', cpu: '2.6', mem: '128.0', nice: '0', cmd: 'mutter' },
        ],
        ubuntu: [
            { name: 'bash', user: 'capsule', pid: '1001', cpu: '0.1', mem: '4.2', nice: '0', cmd: 'bash' },
            { name: 'gnome-shell', user: 'capsule', pid: '1842', cpu: '5.2', mem: '312.4', nice: '0', cmd: 'gnome-shell' },
            { name: 'ptyxis', user: 'capsule', pid: '4102', cpu: '0.1', mem: '24.6', nice: '0', cmd: 'ptyxis' },
            { name: 'nautilus', user: 'capsule', pid: '3890', cpu: '0.3', mem: '58.1', nice: '0', cmd: 'nautilus' },
            { name: 'firefox', user: 'capsule', pid: '4521', cpu: '8.1', mem: '890.2', nice: '0', cmd: 'firefox' },
            { name: 'mutter', user: 'capsule', pid: '1120', cpu: '2.6', mem: '128.0', nice: '0', cmd: 'mutter' },
        ],
    };

    const DEFAULT_PROCESSES = PROCESSES_BY_BODY.ubuntu;

    function bodyId() {
        return global.document && global.document.body ? String(global.document.body.id || '').toLowerCase() : '';
    }

    function cloneList(list) {
        return (list || []).map((entry) => Object.assign({}, entry));
    }

    function ensureProcesses(state) {
        if (!state.processes || !Array.isArray(state.processes.list)) {
            const body = bodyId();
            const seed = PROCESSES_BY_BODY[body] || DEFAULT_PROCESSES;
            state.processes = { list: cloneList(seed) };
        }
        return state.processes.list;
    }

    function getProcessCatalog(body) {
        return cloneList(PROCESSES_BY_BODY[body] || DEFAULT_PROCESSES);
    }

    function runPs(state, args) {
        const list = ensureProcesses(state);
        const aux = args.includes('aux') || args.includes('-ef');
        if (aux) {
            const header = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND';
            const lines = list.map((proc) => {
                const user = String(proc.user || 'user').padEnd(10);
                const pid = String(proc.pid).padStart(5);
                const cpu = String(proc.cpu).padStart(4);
                const mem = String(proc.mem).padStart(4);
                return `${user}${pid} ${cpu} ${mem}  12345  4096 pts/0    S+   10:00   0:00 ${proc.cmd || proc.name}`;
            });
            return { error: false, lines: [header, ...lines] };
        }
        const header = '  PID TTY          TIME CMD';
        const lines = list.slice(0, 6).map((proc) => ` ${String(proc.pid).padStart(4)} pts/0    00:00:00 ${proc.cmd || proc.name}`);
        return { error: false, lines: [header, ...lines] };
    }

    function runPgrep(state, args) {
        const pattern = args.find((arg) => !arg.startsWith('-'));
        if (!pattern) {
            return { error: true, lines: ['pgrep: usage pgrep <nom>'] };
        }
        const list = ensureProcesses(state);
        const matches = list.filter((proc) => (proc.name || proc.cmd || '').includes(pattern));
        if (!matches.length) {
            return { error: false, lines: [] };
        }
        return { error: false, lines: matches.map((proc) => proc.pid) };
    }

    function runKill(state, args) {
        const pid = args.find((arg) => !arg.startsWith('-'));
        if (!pid) {
            return { error: true, lines: ['kill: usage kill <pid>'] };
        }
        const list = ensureProcesses(state);
        const index = list.findIndex((proc) => String(proc.pid) === String(pid));
        if (index < 0) {
            return { error: true, lines: [`kill: (${pid}) - No such process`] };
        }
        list.splice(index, 1);
        return { error: false, lines: [] };
    }

    function runKillall(state, args) {
        const name = args[0];
        if (!name) {
            return { error: true, lines: ['killall: usage killall <nom>'] };
        }
        const list = ensureProcesses(state);
        const before = list.length;
        state.processes.list = list.filter((proc) => (proc.name || proc.cmd) !== name);
        if (state.processes.list.length === before) {
            return { error: true, lines: [`${name}: no process found`] };
        }
        return { error: false, lines: [] };
    }

    function runNice(state, args) {
        const niceIndex = args.indexOf('-n');
        const value = niceIndex >= 0 ? args[niceIndex + 1] : null;
        const cmdStart = niceIndex >= 0 ? niceIndex + 2 : 0;
        const cmd = args.slice(cmdStart).join(' ');
        if (!cmd) {
            return { error: true, lines: ['nice: usage nice -n <priorité> <commande>'] };
        }
        return {
            error: false,
            lines: [`nice: priorité ${value || '10'} appliquée (simulation)`, `nice: exécution simulée de « ${cmd} »`],
        };
    }

    function runTop(state) {
        const list = ensureProcesses(state);
        const header = [
            'top - 10:00:01 up  1:23,  1 user,  load average: 0.15, 0.10, 0.05',
            'Tasks: ' + list.length + ' total,   1 running,  ' + (list.length - 1) + ' sleeping,   0 stopped,   0 zombie',
            '%Cpu(s):  3.2 us,  1.0 sy,  0.0 ni, 95.8 id,  0.0 wa',
            'MiB Mem :   8192.0 total,   4096.0 free,   2048.0 used,   2048.0 buff/cache',
            'PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
        ];
        const lines = list.slice(0, 8).map((proc) => {
            const pid = String(proc.pid).padStart(5);
            const user = String(proc.user || 'user').padEnd(9);
            return `${pid} ${user}  20   ${String(proc.nice || '0').padStart(2)}  123456  ${String(proc.mem).padStart(6)}   4096 S   ${String(proc.cpu).padStart(4)}   1.2   0:00.10 ${proc.cmd || proc.name}`;
        });
        lines.push('', '(simulation — tapez q pour quitter dans un vrai terminal)');
        return { error: false, lines: header.concat(lines) };
    }

    global.CapsuleTerminalProcesses = {
        ensureProcesses,
        getProcessCatalog,
        runPs,
        runPgrep,
        runKill,
        runKillall,
        runNice,
        runTop,
        PROCESSES_BY_BODY,
    };
}(typeof window !== 'undefined' ? window : globalThis));
