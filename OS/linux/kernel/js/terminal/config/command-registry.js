/**
 * Registre central des commandes terminal.
 * La disponibilité finale est filtrée par profil actif (OS + distro).
 */
(function initTerminalCommandRegistry() {
    const registry = {
        man: {
            help: "Affiche le manuel d'une commande",
            examples: ['man ls', 'man grep']
        },
        cd: {
            help: 'Change le répertoire courant',
            examples: ['cd /home/user', 'cd ..', 'cd ~']
        },
        ls: {
            help: 'Liste les fichiers et répertoires',
            examples: ['ls', 'ls /home/user']
        },
        pwd: {
            help: 'Affiche le répertoire de travail actuel',
            examples: ['pwd']
        },
        echo: {
            help: 'Affiche les arguments fournis',
            examples: ['echo Hello', 'echo $USER']
        },
        cat: {
            help: 'Affiche le contenu de fichiers',
            examples: ['cat notes.txt']
        },
        head: {
            help: "Affiche les premières lignes d'un fichier",
            examples: ['head notes.txt', 'head -n 5 notes.txt']
        },
        tail: {
            help: "Affiche les dernières lignes d'un fichier",
            examples: ['tail notes.txt', 'tail -n 5 notes.txt']
        },
        grep: {
            help: 'Recherche un motif dans un fichier',
            examples: ["grep todo notes.txt", "grep 'Capsule' readme.txt"]
        },
        find: {
            help: 'Recherche des fichiers par nom',
            examples: ['find .', "find /home/user -name '*.txt'"]
        },
        touch: {
            help: 'Crée un fichier vide',
            examples: ['touch memo.txt']
        },
        mkdir: {
            help: 'Crée un nouveau répertoire',
            examples: ['mkdir docs']
        },
        mv: {
            help: 'Déplace ou renomme des fichiers',
            examples: ['mv old.txt new.txt', 'mv notes.txt /tmp']
        },
        rm: {
            help: 'Supprime un fichier ou un dossier',
            examples: ['rm file.txt', 'rm dossier']
        },
        rmdir: {
            help: 'Supprime un dossier vide',
            examples: ['rmdir dossier']
        },
        clear: {
            help: "Efface l'écran du terminal",
            examples: ['clear']
        },
        history: {
            help: "Affiche l'historique des commandes",
            examples: ['history']
        },
        whoami: {
            help: "Affiche l'utilisateur actuel",
            examples: ['whoami']
        },
        uname: {
            help: 'Affiche des informations système',
            examples: ['uname', 'uname -a']
        },
        exit: {
            help: 'Ferme la session terminal',
            examples: ['exit']
        },
        ps: {
            help: 'Affiche les processus simulés',
            examples: ['ps']
        },
        kill: {
            help: 'Termine un processus simulé',
            examples: ['kill 1001']
        },
        ping: {
            help: 'Teste la connectivité réseau (simulation)',
            examples: ['ping capsuleos.local']
        },
        curl: {
            help: 'Télécharge une ressource (simulation)',
            examples: ['curl https://example.org']
        },
        sudo: {
            help: 'Exécute une commande avec privilèges (simulation)',
            examples: ['sudo apt update']
        },
        ssh: {
            help: 'Connexion distante (simulation)',
            examples: ['ssh user@host']
        },
        nano: {
            help: 'Éditeur terminal (simulation)',
            examples: ['nano notes.txt']
        },
        less: {
            help: 'Visualise un fichier page par page (simulation)',
            examples: ['less notes.txt']
        },
        dd: {
            help: 'Copie bas niveau (simulation)',
            examples: ['dd if=/dev/zero of=disk.img bs=1M count=1']
        },
        crontab: {
            help: 'Planifie des tâches (simulation)',
            examples: ['crontab -l', 'crontab -e']
        },
        cinnamon: {
            help: 'Lance un environnement desktop (simulation)',
            examples: ['cinnamon']
        },
        apt: {
            help: 'Gestionnaire de paquets Debian/Ubuntu',
            examples: ['apt update', 'apt install vim']
        },
        'apt-get': {
            help: 'Gestionnaire de paquets Debian/Ubuntu',
            examples: ['apt-get update', 'apt-get install vim']
        },
        aptitude: {
            help: 'Interface avancée APT (Debian/Ubuntu)',
            examples: ['aptitude update']
        },
        apturl: {
            help: 'Ouvre une URL de paquet (simulation)',
            examples: ['apturl show app://package']
        },
        dpkg: {
            help: 'Gestionnaire paquets bas niveau Debian',
            examples: ['dpkg -i package.deb']
        },
        dnf: {
            help: 'Gestionnaire de paquets Red Hat/Fedora',
            examples: ['dnf check-update', 'dnf install vim']
        },
        zypper: {
            help: 'Gestionnaire de paquets openSUSE',
            examples: ['zypper refresh', 'zypper install vim']
        },
        rpm: {
            help: 'Gestionnaire paquets bas niveau Red Hat',
            examples: ['rpm -qa']
        },
        pacman: {
            help: 'Gestionnaire de paquets Arch Linux',
            examples: ['pacman -Syu', 'pacman -S vim']
        }
    };

    window.CAPSULE_TERMINAL_COMMAND_REGISTRY = registry;
})();
