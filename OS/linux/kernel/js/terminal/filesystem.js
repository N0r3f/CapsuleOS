const defaultRoot = {
    '/bin': {},
    '/home': {},
    '/media': {},
    '/proc': {},
    '/sbin': {},
    swapfile: {},
    '/tmp': {},
    '/boot': {},
    '/dev': {},
    '/lib': {},
    '/libx32': {},
    '/lost+found': {},
    '/opt': {},
    '/run': {},
    '/srv': {},
    '/timeshift': {},
    '/var': {}
};

function getTerminalProfileCommands() {
    if (typeof window.getTerminalActiveProfile === 'function') {
        const profile = window.getTerminalActiveProfile() || {};
        return Array.isArray(profile.commands) ? profile.commands : [];
    }
    return [];
}

function buildBinEntries() {
    const commands = getTerminalProfileCommands();
    const bin = {};
    commands.forEach((command) => {
        bin[command] = {};
    });
    return bin;
}

function getTerminalActiveDistro() {
    if (typeof window.getTerminalActiveProfile === 'function') {
        const profile = window.getTerminalActiveProfile() || {};
        return String(profile.distro || '').toLowerCase();
    }
    return '';
}

function buildHomeEntries() {
    const distro = getTerminalActiveDistro();
    const homeEntries = {
        '/user': {}
    };
    if (distro === 'redhat') {
        homeEntries['/fed'] = {};
    }
    return homeEntries;
}

const debianUserHomeChildren = {
    '/Bureau': {},
    '/Documents': {},
    '/Images': {},
    '/Modèles': {},
    '/Musique': {},
    '/Public': {},
    '/Téléchargements': {},
    '/Vidéos': {},
};

const fileSystem = {
    '/': {
        ...defaultRoot
    },
    '/bin' : buildBinEntries(),
    '/home': buildHomeEntries(),
    '/user': debianUserHomeChildren,
    '/home/user': debianUserHomeChildren,
    ...(getTerminalActiveDistro() === 'redhat'
        ? {
            '/home/fed': {
                '/Bureau': {},
                '/Documents': {},
                '/Images': {},
                '/Téléchargements': {},
            }
        }
        : {}),
    '/media' : {
        '/disque amovible' : {},
    },
    '/proc' : {
        'diskstats' : {},
        'interrupts' : {},
        'kcore' : {},
        '/driver' : {},
        'locks' : {},
        'meminfo' : {},
        '/mounts' : {},
        '/net' : {},
        'partitions' : {},
        'swaps' : {},
    },
    '/sbin': {
        'add-apt-key' : {},
        'blkid' : {},
        'casper-login' : {},
        'chroot' : {},
        'cron' : {},
        'dmidcode' : {},
        'fdisk' : {},
        'grub-install' : {},
        'ifconfig' : {},
        'iptable' : {},
        'lvm' : {},
        'update-grub' : {},
        'wpa-cli' : {},
        'xfs-repair': {},
    },
    '/tmp': {
        'lavie.exe': {},
        'Emmanuel_Macron.pdf': {},
        'COVID-19.dll': {},
        'Windows11.bat': {},
        'trojan_au_secours': {},
    },
    '/usr': {
        '/bin': {},
        '/lib': {},
    },
};

window.CAPSULE_TERMINAL_FILE_CONTENTS = {
    '/home/user/Documents/readme.txt': 'Bienvenue dans le terminal CapsuleOS.\nUtilisez man pour voir les commandes disponibles.\nCe contenu est simulé pour l’apprentissage.',
    '/home/fed/Documents/readme.txt': 'Fedora Workstation - Terminal CapsuleOS\nCommandes pédagogiques disponibles via man.\nProfil Red Hat actif.'
};