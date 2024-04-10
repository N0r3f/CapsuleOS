const manuel = {
    'man': {
        "apt": { 
            "help": "Gestionnaire de paquets pour Debian/Ubuntu",
            "examples": [
                "apt update",
                "apt install <package-name>"
            ]
        },
        "apt-get": { 
            "help": "Gestionnaire de paquets pour Debian/Ubuntu",
            "examples": [
                "apt-get update",
                "apt-get install <package-name>"
            ]
        },
        "aptitude": { 
            "help": "Gestionnaire de paquets pour Debian/Ubuntu",
            "examples": [
                "aptitude update",
                "aptitude install <package-name>"
            ]
        },
        "apturl": { 
            "help": "Ouvre des URL de paquets dans le navigateur",
            "examples": [
                "apturl show <package-url>"
            ]
        },
        "cat": { 
            "help": "Affiche le contenu de fichiers",
            "examples": [
                "cat file.txt",
                "cat file1.txt file2.txt"
            ]
        },
        "cinnamon": { 
            "help": "Démarre l'environnement de bureau Cinnamon",
            "examples": [
                "cinnamon"
            ]
        },
        "clear": { 
            "help": "Efface l'écran du terminal",
            "examples": [
                "clear"
            ]
        },
        "crontab": { 
            "help": "Gestionnaire de tâches planifiées",
            "examples": [
                "crontab -e",
                "crontab -l"
            ]
        },
        "curl": { 
            "help": "Transfère des données avec URL",
            "examples": [
                "curl http://example.com",
                "curl -O http://example.com/file.txt"
            ]
        },
        "dd": { 
            "help": "Copie et convertit les données",
            "examples": [
                "dd if=/dev/zero of=/tmp/zeroes bs=1M count=10",
                "dd if=/dev/sda of=/tmp/sda.img"
            ]
        },
        "dpkg": { 
            "help": "Gestionnaire de paquets pour Debian/Ubuntu",
            "examples": [
                "dpkg -i package.deb",
                "dpkg -r package-name"
            ]
        },
        "echo": { 
            "help": "Affiche les arguments fournis",
            "examples": [
                "echo Hello, World!",
                "echo $USER"
            ]
        },
        "exit": { 
            "help": "Quitte le terminal",
            "examples": [
                "exit"
            ]
        },
        "find": { 
            "help": "Recherche des fichiers dans le système de fichiers",
            "examples": [
                "find / -name '*.txt'",
                "find . -type f -size +1M"
            ]
        },
        "grep": { 
            "help": "Recherche des motifs dans les fichiers",
            "examples": [
                "grep 'pattern' file.txt",
                "grep -r 'pattern' /path/to/directory"
            ]
        },
        "head": { 
            "help": "Affiche les premières lignes d'un fichier",
            "examples": [
                "head file.txt",
                "head -n 10 file.txt"
            ]
        },
        "history": { 
            "help": "Affiche l'historique des commandes",
            "examples": [
                "history"
            ]
        },
        "kill": { 
            "help": "Envoie un signal à un processus",
            "examples": [
                "kill -9 1234",
                "killall process-name"
            ]
        },
        "less": { 
            "help": "Affiche le contenu d'un fichier page par page",
            "examples": [
                "less file.txt",
                "less +F file.txt"
            ]
        },
        "ls": { 
            "help": "Liste les fichiers et répertoires",
            "examples": [
                "ls",
                "ls -l"
            ]
        },
        "man": { 
            "help": "Affiche le manuel d'une commande",
            "examples": [
                "man ls",
                "man 3 printf"
            ]
        },
        "mkdir": { 
            "help": "Crée un nouveau répertoire",
            "examples": [
                "mkdir new-directory",
                "mkdir -p path/to/new-directory"
            ]
        },
        "mv": { 
            "help": "Déplace ou renomme des fichiers",
            "examples": [
                "mv old-name.txt new-name.txt",
                "mv *.txt /path/to/directory"
            ]
        },
        "nano": { 
            "help": "Éditeur de texte en ligne de commande",
            "examples": [
                "nano file.txt",
                "nano -B file.txt"
            ]
        },
        "ping": { 
            "help": "Envoie des paquets ICMP à un hôte",
            "examples": [
                "ping google.com",
                "ping -c 4 google.com"
            ]
        },
        "ps": { 
            "help": "Affiche les processus en cours d'exécution",
            "examples": [
                "ps",
                "ps aux"
            ]
        },
        "pwd": { 
            "help": "Affiche le répertoire de travail actuel",
            "examples": [
                "pwd"
            ]
        },
        "rm": { 
            "help": "Supprime des fichiers ou des répertoires",
            "examples": [
                "rm file.txt",
                "rm -r directory"
            ]
        },
        "rmdir": { 
            "help": "Supprime un répertoire vide",
            "examples": [
                "rmdir directory"
            ]
        },
        "ssh": { 
            "help": "Connexion sécurisée à un serveur distant",
            "examples": [
                "ssh user@host",
                "ssh -p 2222 user@host"
            ]
        },
        "sudo": { 
            "help": "Exécute une commande avec les privilèges de superutilisateur",
            "examples": [
                "sudo apt-get update",
                "sudo nano /etc/hosts"
            ]
        },
        "tail": { 
            "help": "Affiche les dernières lignes d'un fichier",
            "examples": [
                "tail file.txt",
                "tail -n 10 file.txt"
            ]
        },
        "touch": { 
            "help": "Crée un fichier vide",
            "examples": [
                "touch new-file.txt"
            ]
        },
        "uname": { 
            "help": "Affiche des informations sur le système",
            "examples": [
                "uname -a",
                "uname -r"
            ]
        },
        "whoami": { 
            "help": "Affiche l'utilisateur actuel",
            "examples": [
                "whoami"
            ]
        }
    },
};
