/**
 * Informations système — mount, lscpu, lshw, shutdown, reboot.
 */
(function initCapsuleTerminalSystemInfo(global) {
    'use strict';

    const FILESYSTEMS = {
        mint: [
            { device: '/dev/sda2', mount: '/', type: 'ext4', total: '98,4 Go', used: '26,3 Go (27 %)' },
        ],
        rocky: [
            { device: '/dev/mapper/rl-root', mount: '/', type: 'xfs', total: '42,1 Go', used: '26,1 Go (62 %)' },
            { device: '/dev/sda1', mount: '/boot', type: 'xfs', total: '1,0 Go', used: '0,4 Go (40 %)' },
        ],
        ubuntu: [
            { device: '/dev/sda2', mount: '/', type: 'ext4', total: '98,4 Go', used: '32,1 Go (33 %)' },
            { device: 'tmpfs', mount: '/run', type: 'tmpfs', total: '3,9 Go', used: '128 Mo (3 %)' },
        ],
    };

    const CPU_INFO = {
        mint: ['Architecture: x86_64', 'CPU(s): 4', 'Model name: Intel(R) Core(TM) i5-8250U', 'Thread(s) per core: 2'],
        rocky: ['Architecture: x86_64', 'CPU(s): 2', 'Model name: QEMU Virtual CPU', 'Thread(s) per core: 1'],
        ubuntu: ['Architecture: x86_64', 'CPU(s): 4', 'Model name: Intel(R) Core(TM) i7-8550U', 'Thread(s) per core: 2'],
    };

    function bodyId() {
        return global.document && global.document.body ? String(global.document.body.id || '').toLowerCase() : 'ubuntu';
    }

    function runMount() {
        const body = bodyId();
        const mounts = FILESYSTEMS[body] || FILESYSTEMS.ubuntu;
        const lines = mounts.map((entry) => {
            return `${entry.device} on ${entry.mount} type ${entry.type} (rw,relatime)`;
        });
        return { error: false, lines };
    }

    function runUmount(args) {
        const target = args[0];
        if (!target) {
            return { error: true, lines: ['umount: usage umount <point-de-montage>'] };
        }
        return {
            error: false,
            lines: [`umount: ${target} démonté (simulation — le clone reste actif).`],
        };
    }

    function runLscpu() {
        const body = bodyId();
        const lines = CPU_INFO[body] || CPU_INFO.ubuntu;
        return { error: false, lines };
    }

    function runLshw(args) {
        const short = args.includes('-short');
        if (short) {
            return {
                error: false,
                lines: [
                    'capsule-kvm',
                    '    description: Computer',
                    '    product: CapsuleOS Virtual Machine',
                    '    vendor: CapsuleOS',
                    '  *-cpu',
                    '       description: CPU',
                    '  *-memory',
                    '       description: System Memory',
                    '         size: 8GiB',
                ],
            };
        }
        return {
            error: false,
            lines: [
                'capsule-kvm',
                '    description: CapsuleOS simulated hardware',
                '    physical id: 0',
            ],
        };
    }

    function runShutdown(args) {
        const now = args.includes('-h') || args.includes('now') || args[0] === 'now';
        return {
            error: false,
            lines: now
                ? ['Shutdown scheduled (simulation).', 'CapsuleOS : le bureau simulé reste ouvert pour la pédagogie.']
                : ['shutdown: usage shutdown -h now'],
        };
    }

    function runReboot() {
        return {
            error: false,
            lines: [
                'Reboot scheduled (simulation).',
                'CapsuleOS : le bureau simulé reste ouvert pour la pédagogie.',
            ],
        };
    }

    global.CapsuleTerminalSystemInfo = {
        runMount,
        runUmount,
        runLscpu,
        runLshw,
        runShutdown,
        runReboot,
        FILESYSTEMS,
    };
}(typeof window !== 'undefined' ? window : globalThis));
