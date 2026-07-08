/**
 * Simulation gestionnaires de paquets — sorties par famille × locale (Lj_fr défaut).
 * Session uniquement : état dans state.packageState (non persisté).
 */
(function initCapsuleTerminalPackageManagers(global) {
    'use strict';

    const CATALOG = {
        debian: [
            'bash', 'coreutils', 'grep', 'sed', 'curl', 'vim', 'nano', 'git', 'htop', 'openssl', 'cowsay',
        ],
        redhat: [
            'bash', 'coreutils', 'grep', 'sed', 'curl', 'vim-enhanced', 'nano', 'git', 'htop', 'openssl',
        ],
        suse: [
            'bash', 'coreutils', 'grep', 'sed', 'curl', 'vim', 'nano', 'git', 'htop', 'openssl',
        ],
        arch: [
            'bash', 'coreutils', 'grep', 'sed', 'curl', 'vim', 'nano', 'git', 'htop', 'openssl',
        ],
    };

    const result = (lines, error) => ({
        lines: Array.isArray(lines) ? lines : [String(lines || '')],
        error: Boolean(error),
    });

    const localeOf = () => {
        const raw = String(
            (typeof global !== 'undefined' && global.CAPSULE_LOCALE)
            || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang
                ? `${document.documentElement.lang}-${document.documentElement.lang.toUpperCase()}`
                : '')
            || 'fr-FR',
        ).toLowerCase();
        if (raw.startsWith('en')) {
            return 'en-US';
        }
        return 'fr-FR';
    };

    const familyOf = (profile) => String((profile && profile.distro) || 'debian').toLowerCase();

    const ensurePackageState = (state, profile) => {
        const family = familyOf(profile);
        if (!state.packageState) {
            const base = CATALOG[family] || CATALOG.debian;
            state.packageState = {
                family,
                installed: new Set(base),
                metadataRefreshed: false,
            };
        }
        return state.packageState;
    };

    const hostLabel = (profile) => {
        const distro = familyOf(profile);
        if (distro === 'redhat') {
            return 'mirror.capsuleos.local';
        }
        if (distro === 'suse') {
            return 'download.opensuse.org';
        }
        if (distro === 'arch') {
            return 'mirror.archlinux.org';
        }
        return 'archive.ubuntu.com';
    };

    const findPackage = (name, pkgState) => {
        const needle = String(name || '').toLowerCase();
        if (!needle) {
            return null;
        }
        const all = [...pkgState.installed, ...(CATALOG[pkgState.family] || CATALOG.debian)];
        return all.find((pkg) => pkg.toLowerCase() === needle || pkg.toLowerCase().includes(needle)) || null;
    };

    const installPackage = (pkgState, name, locale) => {
        const pkg = findPackage(name, pkgState);
        if (!pkg) {
            if (locale === 'fr-FR') {
                return result([`Erreur : Impossible de trouver un paquet correspondant à ${name}`], true);
            }
            return result([`E: Unable to locate package ${name}`], true);
        }
        if (pkgState.installed.has(pkg)) {
            if (locale === 'fr-FR') {
                return result([`Le paquet ${pkg} est déjà installé dans sa dernière version disponible.`]);
            }
            return result([`${pkg} is already the newest version.`]);
        }
        pkgState.installed.add(pkg);
        if (locale === 'fr-FR') {
            return result([
                'Mise à jour et installation des paquets...',
                'Dépendances résolues.',
                'Paquets à installer :',
                `  ${pkg}-1.0.0-1capsule.x86_64`,
                'Transaction effectuée.',
                `Installation de ${pkg} ...`,
            ]);
        }
        return result([
            'Reading package lists... Done',
            'Building dependency tree... Done',
            'The following NEW packages will be installed:',
            `  ${pkg}`,
            '0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.',
            'Need to get 0 B of archives.',
            'After this operation, 0 B of additional disk space will be used.',
            `Setting up ${pkg} ...`,
            'Processing triggers for man-db ...',
        ]);
    };

    const removePackage = (pkgState, name, locale) => {
        const pkg = findPackage(name, pkgState);
        if (!pkg || !pkgState.installed.has(pkg)) {
            if (locale === 'fr-FR') {
                return result([`Paquet « ${name} » non installé, donc non supprimé`], true);
            }
            return result([`Package '${name}' is not installed, so not removed`], true);
        }
        if (['bash', 'coreutils'].includes(pkg)) {
            if (locale === 'fr-FR') {
                return result([`Erreur : Refus de supprimer le paquet essentiel ${pkg}.`], true);
            }
            return result([`E: Refusing to remove essential package ${pkg}.`], true);
        }
        pkgState.installed.delete(pkg);
        if (locale === 'fr-FR') {
            return result([`Suppression de ${pkg} ...`, 'Exécution des déclencheurs pour man-db ...']);
        }
        return result([`Removing ${pkg} ...`, 'Processing triggers for man-db ...']);
    };

    const searchPackages = (pkgState, term, locale) => {
        const needle = String(term || '').toLowerCase();
        const pool = new Set([...(CATALOG[pkgState.family] || CATALOG.debian), ...pkgState.installed]);
        const matches = [...pool].filter((pkg) => !needle || pkg.toLowerCase().includes(needle)).sort();
        if (!matches.length) {
            if (locale === 'fr-FR') {
                return result([`Aucun paquet trouvé pour « ${term} ».`]);
            }
            return result([`No packages found matching '${term}'.`]);
        }
        return result(matches.map((pkg) => {
            const status = pkgState.installed.has(pkg) ? 'installed' : 'candidate';
            if (locale === 'fr-FR') {
                const label = status === 'installed' ? 'installé' : 'candidat';
                return `${pkg}.x86_64 : paquet simulé CapsuleOS (${label})`;
            }
            return `${pkg} - CapsuleOS simulated package (${status})`;
        }));
    };

    const runAptFamily = (cmd, args, state, profile) => {
        const locale = localeOf();
        const pkgState = ensurePackageState(state, profile);
        const sub = args[0];
        const host = hostLabel(profile);

        if (sub === 'update' || (cmd === 'apt-get' && sub === 'update')) {
            pkgState.metadataRefreshed = true;
            return result([
                `Hit:1 http://${host}/ubuntu noble InRelease`,
                `Get:2 http://security.${host}/ubuntu noble-security InRelease [126 kB]`,
                'Reading package lists... Done',
            ]);
        }
        if (sub === 'upgrade' || sub === 'full-upgrade' || (cmd === 'apt-get' && sub === 'upgrade')) {
            return result([
                'Reading package lists... Done',
                'Building dependency tree... Done',
                'Reading state information... Done',
                '0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.',
            ]);
        }
        if (sub === 'install') {
            return installPackage(pkgState, args[1], locale);
        }
        if (sub === 'remove' || sub === 'purge') {
            return removePackage(pkgState, args[1], locale);
        }
        if (sub === 'search') {
            return searchPackages(pkgState, args[1], locale);
        }
        if (sub === 'show') {
            const pkg = findPackage(args[1], pkgState);
            if (!pkg) {
                return result([`N: Unable to locate package ${args[1]}`], true);
            }
            return result([
                `Package: ${pkg}`,
                'Version: 1.0.0-1capsule',
                'Priority: optional',
                'Maintainer: CapsuleOS <dev@capsuleos.local>',
            ]);
        }
        if (sub === 'list' && (args[1] === '--upgradable' || args.includes('--upgradable'))) {
            if (locale === 'fr-FR') {
                return result([
                    'En train de lister…',
                    'accountsservice/resolute-updates 23.13.9-8ubuntu5.1 amd64 [pouvant être mis à jour depuis : 23.13.9-8ubuntu5]',
                    'base-files/resolute-updates 14ubuntu6.1 amd64 [pouvant être mis à jour depuis : 14ubuntu6]',
                    'gir1.2-accountsservice-1.0/resolute-updates 23.13.9-8ubuntu5.1 amd64 [pouvant être mis à jour depuis : 23.13.9-8ubuntu5]',
                ]);
            }
            return result([
                'Listing...',
                'accountsservice/resolute-updates 23.13.9-8ubuntu5.1 amd64 [upgradable from: 23.13.9-8ubuntu5]',
                'base-files/resolute-updates 14ubuntu6.1 amd64 [upgradable from: 14ubuntu6]',
            ]);
        }
        if (cmd === 'apturl') {
            return result([`apturl: ouverture simulée de ${args.join(' ') || 'app://package'}`]);
        }
        if (cmd === 'aptitude') {
            return result([`aptitude: ${args.join(' ') || 'update'} (interface simulée — utilisez apt)`]);
        }
        return result([`${cmd}: usage — update | upgrade | install <pkg> | remove <pkg> | search <term>`], true);
    };

    const runDpkg = (args, state, profile) => {
        const locale = localeOf();
        const pkgState = ensurePackageState(state, profile);
        if (args[0] === '-l') {
            const lines = [...pkgState.installed].sort().map((pkg) => `ii  ${pkg}  1.0.0-1capsule  amd64  simulated package`);
            return result(['Desired=Unknown/Install/Remove/Purge/Hold', 'Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend', ...lines]);
        }
        if (args[0] === '-i' && args[1]) {
            const name = args[1].replace(/\.deb$/i, '');
            return installPackage(pkgState, name, locale);
        }
        return result(['dpkg: usage — dpkg -l | dpkg -i <package.deb>'], true);
    };

    const runDnfFr = (args, state, profile) => {
        const pkgState = ensurePackageState(state, profile);
        const sub = args[0];
        const complete = 'Terminé !';

        if (sub === 'check-update' || sub === 'makecache') {
            pkgState.metadataRefreshed = true;
            return result([
                'Rocky Linux 10 - BaseOS                          13 kB/s | 4.3 kB     00:00',
                'Rocky Linux 10 - AppStream                      2.3 MB/s | 2.2 MB     00:00',
                'Rocky Linux 10 - CRB                            786 kB/s | 495 kB     00:00',
                "Dernière vérification de l'expiration des métadonnées effectuée il y a 0:00:00.",
            ]);
        }
        if (sub === 'update' || sub === 'upgrade') {
            return result([
                "Dernière vérification de l'expiration des métadonnées effectuée il y a 0:00:00.",
                'Dépendances résolues.',
                'Il n\'y a rien à faire.',
                complete,
            ]);
        }
        if (sub === 'install') {
            const out = installPackage(pkgState, args[1], 'fr-FR');
            out.lines.push(complete);
            return out;
        }
        if (sub === 'remove') {
            const out = removePackage(pkgState, args[1], 'fr-FR');
            out.lines.push(complete);
            return out;
        }
        if (sub === 'search') {
            return searchPackages(pkgState, args.slice(1).join(' ') || args[1], 'fr-FR');
        }
        if (sub === 'info' && args[1]) {
            const pkg = findPackage(args[1], pkgState);
            if (!pkg) {
                return result(['Erreur : Aucun paquet correspondant à lister'], true);
            }
            return result([
                `Nom          : ${pkg}`,
                'Version      : 1.0.0-1capsule',
                'Architecture : x86_64',
            ]);
        }
        return result(['dnf : usage — check-update | install <pkg> | remove <pkg> | search <terme> | info <pkg>'], true);
    };

    const runDnfEn = (args, state, profile) => {
        const pkgState = ensurePackageState(state, profile);
        const host = hostLabel(profile);
        const sub = args[0];

        if (sub === 'check-update' || sub === 'makecache') {
            pkgState.metadataRefreshed = true;
            return result([
                `CapsuleOS ${profile.displayName || 'Linux'}`,
                'Last metadata expiration check: 0:00:00 ago.',
                'Metadata cache created.',
                `Repository ${host} is up to date.`,
            ]);
        }
        if (sub === 'update' || sub === 'upgrade') {
            return result([
                'Last metadata expiration check: 0:00:00 ago.',
                'Dependencies resolved.',
                'Nothing to do.',
                'Complete!',
            ]);
        }
        if (sub === 'install') {
            const out = installPackage(pkgState, args[1], 'en-US');
            out.lines.push('Complete!');
            return out;
        }
        if (sub === 'remove') {
            const out = removePackage(pkgState, args[1], 'en-US');
            out.lines.push('Complete!');
            return out;
        }
        if (sub === 'search') {
            return searchPackages(pkgState, args.slice(1).join(' ') || args[1], 'en-US');
        }
        if (sub === 'info' && args[1]) {
            const pkg = findPackage(args[1], pkgState);
            if (!pkg) {
                return result(['Error: No matching Packages to list'], true);
            }
            return result([`Name         : ${pkg}`, 'Version      : 1.0.0-1capsule', 'Architecture : x86_64']);
        }
        return result(['dnf: usage — check-update | install <pkg> | remove <pkg> | search <term> | info <pkg>'], true);
    };

    const runDnf = (args, state, profile) => (
        localeOf() === 'fr-FR' ? runDnfFr(args, state, profile) : runDnfEn(args, state, profile)
    );

    const runZypper = (args, state, profile) => {
        const locale = localeOf();
        const pkgState = ensurePackageState(state, profile);
        const sub = args[0];

        if (sub === 'refresh' || sub === 'ref') {
            pkgState.metadataRefreshed = true;
            return result([
                'Retrieving repository \'oss\' metadata .............................[done]',
                'Building repository \'oss\' cache ..................................[done]',
            ]);
        }
        if (sub === 'update' || sub === 'up') {
            return result(['Loading repository data...', 'Reading installed packages...', 'Nothing to do.']);
        }
        if (sub === 'install' || sub === 'in') {
            return installPackage(pkgState, args[1], locale);
        }
        if (sub === 'remove' || sub === 'rm') {
            return removePackage(pkgState, args[1], locale);
        }
        if (sub === 'search' || sub === 'se') {
            return searchPackages(pkgState, args.slice(1).join(' ') || args[1], locale);
        }
        return result(['zypper: usage — refresh | update | install <pkg> | remove <pkg> | search <term>'], true);
    };

    const runRpm = (args, state, profile) => {
        const pkgState = ensurePackageState(state, profile);
        if (args[0] === '-qa') {
            return result([...pkgState.installed].sort().map((pkg) => `${pkg}-1.0.0-1capsule.x86_64`));
        }
        if (args[0] === '-qi' && args[1]) {
            const pkg = findPackage(args[1], pkgState);
            if (!pkg) {
                const locale = localeOf();
                if (locale === 'fr-FR') {
                    return result([`le paquet ${args[1]} n'est pas installé`], true);
                }
                return result([`package ${args[1]} is not installed`], true);
            }
            return result([`Name        : ${pkg}`, 'Version     : 1.0.0', 'Release     : 1capsule', 'Architecture: x86_64']);
        }
        return result(['rpm: usage — rpm -qa | rpm -qi <pkg>'], true);
    };

    const runPacman = (args, state, profile) => {
        const locale = localeOf();
        const pkgState = ensurePackageState(state, profile);
        const flags = args.filter((a) => a.startsWith('-')).join('');
        const rest = args.filter((a) => !a.startsWith('-'));

        if (flags.includes('S') && flags.includes('y') && flags.includes('u')) {
            pkgState.metadataRefreshed = true;
            return result([
                ':: Synchronizing package databases...',
                ' core is up to date',
                ' extra is up to date',
                ':: Starting full system upgrade...',
                ' there is nothing to do',
            ]);
        }
        if (flags.includes('S') && rest[0]) {
            return installPackage(pkgState, rest[0], locale);
        }
        if (flags.includes('Ss') || (flags.includes('s') && flags.includes('S'))) {
            return searchPackages(pkgState, rest.join(' '), locale);
        }
        if (flags.includes('R') && rest[0]) {
            return removePackage(pkgState, rest[0], locale);
        }
        if (flags.includes('Q') && flags.includes('l')) {
            return result([...pkgState.installed].sort().map((pkg) => `${pkg} 1.0.0-1`));
        }
        return result(['pacman: usage — pacman -Syu | pacman -S <pkg> | pacman -Ss <term> | pacman -Q'], true);
    };

    function run(cmd, args, state, profile) {
        const name = String(cmd || '').toLowerCase();
        switch (name) {
            case 'apt':
            case 'apt-get':
            case 'aptitude':
            case 'apturl':
                return runAptFamily(name, args, state, profile);
            case 'dpkg':
                return runDpkg(args, state, profile);
            case 'dnf':
            case 'yum':
                return runDnf(args, state, profile);
            case 'zypper':
                return runZypper(args, state, profile);
            case 'rpm':
                return runRpm(args, state, profile);
            case 'pacman':
                return runPacman(args, state, profile);
            default:
                return result([`${cmd}: gestionnaire non simulé`], true);
        }
    }

    global.CapsuleTerminalPackageManagers = { run, localeOf };
}(typeof window !== 'undefined' ? window : globalThis));
