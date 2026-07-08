/**
 * Réseau pédagogique — wget, ip, netstat, dig, ssh, etc. (CapsuleOnly).
 */
(function initCapsuleTerminalNetwork(global) {
    'use strict';

    function basename(path) {
        return String(path || '').split('/').filter(Boolean).pop() || 'download';
    }

    function runWget(state, args, helpers) {
        const url = args.find((arg) => !arg.startsWith('-'));
        if (!url) {
            return { error: true, lines: ['wget: usage wget <url>'] };
        }
        const fileName = basename(url.split('?')[0]) || 'index.html';
        const directory = state.fs[state.cwd] || {};
        if (!state.fs[state.cwd]) {
            state.fs[state.cwd] = directory;
        }
        directory[fileName] = {};
        const resolved = helpers.resolvePath(state.cwd, fileName);
        helpers.ensureFileContents(state)[resolved] = `<!-- Téléchargement simulé depuis ${url} -->\n`;
        if (helpers.queueUserFsSync) {
            helpers.queueUserFsSync('touch', state, { name: fileName });
        }
        return {
            error: false,
            lines: [
                `--2026-06-10 10:00:01--  ${url}`,
                `Resolving ${url}... simulation.`,
                `Saving to: ‘${fileName}’`,
                '',
                `${fileName}           [ <=>                ]  1.23K  --.-KB/s    in 0s`,
                '',
                `2026-06-10 10:00:01 (12.3 MB/s) - ‘${fileName}’ saved`,
            ],
        };
    }

    function runIp(args) {
        const sub = args[0] || 'a';
        if (sub === 'a' || sub === 'addr') {
            return {
                error: false,
                lines: [
                    '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000',
                    '    inet 127.0.0.1/8 scope host lo',
                    '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000',
                    '    inet 192.168.122.10/24 brd 192.168.122.255 scope global dynamic eth0',
                ],
            };
        }
        if (sub === 'link') {
            return {
                error: false,
                lines: [
                    '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000',
                    '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000',
                ],
            };
        }
        return { error: true, lines: ['ip: sous-commande non supportée (a, link)'] };
    }

    function runNetstat(args) {
        if (args.includes('-tuln') || args.includes('-tulpn')) {
            return {
                error: false,
                lines: [
                    'Active Internet connections (only servers)',
                    'Proto Recv-Q Send-Q Local Address           Foreign Address         State',
                    'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN',
                    'tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN',
                    'tcp6       0      0 :::80                   :::*                    LISTEN',
                ],
            };
        }
        return { error: true, lines: ['netstat: usage netstat -tuln'] };
    }

    function runTraceroute(args) {
        const host = args[0];
        if (!host) {
            return { error: true, lines: ['traceroute: usage traceroute <hôte>'] };
        }
        return {
            error: false,
            lines: [
                `traceroute to ${host} (93.184.216.34), 30 hops max, 60 byte packets`,
                ' 1  gateway (192.168.122.1)  0.412 ms  0.389 ms  0.371 ms',
                ' 2  isp-core (10.0.0.1)  5.123 ms  5.098 ms  5.087 ms',
                ` 3  ${host} (93.184.216.34)  12.456 ms  12.401 ms  12.388 ms`,
            ],
        };
    }

    function runRoute() {
        return {
            error: false,
            lines: [
                'Kernel IP routing table',
                'Destination     Gateway         Genmask         Flags Metric Ref    Use Iface',
                '0.0.0.0         192.168.122.1   0.0.0.0         UG    100    0        0 eth0',
                '192.168.122.0   0.0.0.0         255.255.255.0   U     100    0        0 eth0',
            ],
        };
    }

    function runDig(args) {
        const name = args.find((arg) => !arg.startsWith('-')) || 'capsuleos.local';
        return {
            error: false,
            lines: [
                `; <<>> DiG 9.16 <<>> ${name}`,
                ';; ANSWER SECTION:',
                `${name}.             300     IN      A       192.168.122.10`,
                '',
                ';; Query time: 4 msec',
            ],
        };
    }

    function runPing(args) {
        const host = args[0];
        if (!host) {
            return { error: true, lines: ['ping: usage ping <hôte>'] };
        }
        return {
            error: false,
            lines: [
                `PING ${host} (192.168.122.10) 56(84) bytes of data.`,
                `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.412 ms`,
                `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.389 ms`,
                `64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.371 ms`,
                '',
                `--- ${host} ping statistics ---`,
                '3 packets transmitted, 3 received, 0% packet loss, time 2003ms',
            ],
        };
    }

    function runSsh(args) {
        const target = args[0];
        if (!target) {
            return { error: true, lines: ['ssh: usage ssh user@host'] };
        }
        return {
            error: false,
            lines: [
                `The authenticity of host '${target}' can't be established.`,
                'ECDSA key fingerprint is SHA256:CapsuleOS/simulation.',
                `Are you sure you want to continue connecting (yes/no/[fingerprint])? yes`,
                `Warning: Permanently added '${target}' (ECDSA) to the list of known hosts.`,
                `${target}'s password: `,
                'ssh: connexion distante simulée — session non ouverte dans CapsuleOS.',
            ],
        };
    }

    function runFtp(args) {
        const host = args[0] || 'ftp.example.org';
        return {
            error: false,
            lines: [
                `Connected to ${host}.`,
                '220 Welcome to CapsuleOS FTP simulation.',
                'Name (ftp.example.org:user): anonymous',
                '230 Login successful.',
                'ftp> ls',
                '-rw-r--r--   1 ftp  ftp      1234 Jun 10 10:00 readme.txt',
                'ftp> quit',
                '221 Goodbye.',
            ],
        };
    }

    function runSftp(args) {
        const target = args[0];
        if (!target) {
            return { error: true, lines: ['sftp: usage sftp user@host'] };
        }
        return {
            error: false,
            lines: [
                `Connecting to ${target}...`,
                'sftp> ls',
                'readme.txt  data/',
                'sftp> quit',
            ],
        };
    }

    function runCurl(args) {
        const url = args[0];
        if (!url) {
            return { error: true, lines: ['curl: usage curl <url>'] };
        }
        return {
            error: false,
            lines: [`curl: téléchargement simulé de ${url}`, 'HTTP/2 200 OK', '<html>...</html>'],
        };
    }

    global.CapsuleTerminalNetwork = {
        runWget,
        runIp,
        runNetstat,
        runTraceroute,
        runRoute,
        runDig,
        runPing,
        runSsh,
        runFtp,
        runSftp,
        runCurl,
    };
}(typeof window !== 'undefined' ? window : globalThis));
