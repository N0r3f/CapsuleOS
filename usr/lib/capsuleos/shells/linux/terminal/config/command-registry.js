/**
 * Registre central des commandes terminal.
 * La disponibilité finale est filtrée par profil actif (OS + distro).
 */
'use strict';
(function initTerminalCommandRegistry() {
    const registry = {
        help: {
            help: 'Liste les commandes disponibles sur ce profil',
            examples: ['help']
        },
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
        cp: {
            help: 'Copie des fichiers ou répertoires',
            examples: ['cp notes.txt notes.bak', 'cp -r dossier dossier-copy']
        },
        mv: {
            help: 'Déplace ou renomme des fichiers',
            examples: ['mv old.txt new.txt', 'mv notes.txt /tmp']
        },
        wc: {
            help: 'Compte lignes, mots et octets',
            examples: ['wc notes.txt', 'wc -l notes.txt']
        },
        sort: {
            help: 'Trie les lignes d’un fichier texte',
            examples: ['sort names.txt']
        },
        chmod: {
            help: 'Modifie les permissions (simulation)',
            examples: ['chmod 644 notes.txt', 'chmod u+x script.sh']
        },
        chown: {
            help: 'Modifie le propriétaire d’un fichier',
            examples: ['chown capsule fichier.txt', 'chown capsule:users fichier.txt']
        },
        chgrp: {
            help: 'Modifie le groupe d’un fichier',
            examples: ['chgrp users fichier.txt']
        },
        chattr: {
            help: 'Modifie les attributs étendus (simulation)',
            examples: ['chattr +i fichier.txt']
        },
        lsattr: {
            help: 'Affiche les attributs étendus',
            examples: ['lsattr fichier.txt']
        },
        adduser: {
            help: 'Ajoute un utilisateur (simulation)',
            examples: ['adduser alice']
        },
        useradd: {
            help: 'Ajoute un utilisateur (simulation)',
            examples: ['useradd bob']
        },
        passwd: {
            help: 'Modifie un mot de passe (simulation)',
            examples: ['passwd', 'passwd alice']
        },
        groupadd: {
            help: 'Crée un groupe (simulation)',
            examples: ['groupadd devs']
        },
        ln: {
            help: 'Crée un lien vers un fichier ou répertoire',
            examples: ['ln -s cible lien', 'ln fichier hardlink']
        },
        diff: {
            help: 'Compare deux fichiers texte',
            examples: ['diff a.txt b.txt']
        },
        cmp: {
            help: 'Compare deux fichiers octet par octet',
            examples: ['cmp a.txt b.txt']
        },
        zip: {
            help: 'Compresse des fichiers dans une archive zip',
            examples: ['zip archive.zip doc1.txt doc2.txt']
        },
        unzip: {
            help: 'Décompresse une archive zip',
            examples: ['unzip archive.zip']
        },
        tar: {
            help: 'Crée ou extrait des archives tar',
            examples: ['tar -cvf archive.tar docs/', 'tar -xvf archive.tar']
        },
        rm: {
            help: 'Supprime un fichier ou un dossier',
            examples: ['rm file.txt', 'rm -r dossier']
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
            examples: ['ps', 'ps aux']
        },
        top: {
            help: 'Vue dynamique des processus (simulation)',
            examples: ['top']
        },
        pgrep: {
            help: 'Recherche un PID par nom de processus',
            examples: ['pgrep bash']
        },
        killall: {
            help: 'Termine des processus par nom',
            examples: ['killall firefox']
        },
        nice: {
            help: 'Exécute une commande avec une priorité',
            examples: ['nice -n 10 ./script.sh']
        },
        kill: {
            help: 'Termine un processus simulé',
            examples: ['kill 1001']
        },
        wget: {
            help: 'Télécharge un fichier depuis Internet (simulation)',
            examples: ['wget https://example.org/file.txt']
        },
        ip: {
            help: 'Affiche ou configure les interfaces réseau (simulation)',
            examples: ['ip a', 'ip link']
        },
        netstat: {
            help: 'Affiche les connexions réseau (simulation)',
            examples: ['netstat -tuln']
        },
        traceroute: {
            help: 'Trace le chemin réseau vers un hôte (simulation)',
            examples: ['traceroute example.org']
        },
        route: {
            help: 'Affiche la table de routage (simulation)',
            examples: ['route -n']
        },
        dig: {
            help: 'Interroge le DNS (simulation)',
            examples: ['dig capsuleos.local']
        },
        ftp: {
            help: 'Transfert de fichiers FTP (simulation)',
            examples: ['ftp ftp.example.org']
        },
        sftp: {
            help: 'Transfert de fichiers SFTP (simulation)',
            examples: ['sftp user@host']
        },
        mount: {
            help: 'Affiche les systèmes de fichiers montés (simulation)',
            examples: ['mount']
        },
        umount: {
            help: 'Démonte un système de fichiers (simulation)',
            examples: ['umount /mnt/usb']
        },
        shutdown: {
            help: 'Arrête le système (simulation)',
            examples: ['shutdown -h now']
        },
        reboot: {
            help: 'Redémarre le système (simulation)',
            examples: ['reboot']
        },
        lscpu: {
            help: 'Affiche les informations processeur',
            examples: ['lscpu']
        },
        lshw: {
            help: 'Affiche les informations matériel',
            examples: ['lshw -short']
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
            help: 'Éditeur texte simple (^O enregistrer, ^X quitter)',
            examples: ['nano notes.txt', 'nano ~/Documents/readme.md']
        },
        vim: {
            help: 'Éditeur modal (i insertion, :w :q :wq)',
            examples: ['vim notes.txt', 'vim config.sh']
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
        yum: {
            help: 'Gestionnaire de paquets Red Hat (alias DNF)',
            examples: ['yum check-update', 'yum install vim']
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
