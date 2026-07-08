'use strict';
// Généré depuis root/docs/inventaires/linux-kde-neon-kickoff-apps.json (VM lab)
// Regénérer : node root/tools/lab/generate-kde-neon-kickoff-data.mjs

const MENU_CATS = [
    {
        id: "favorites",
        label: "Favoris",
        icon: "./assets/images/vendors/neon/kickoff/actions/favorite.svg"
    },
    {
        id: "all",
        label: "Toutes les applications",
        icon: "./assets/images/vendors/neon/kickoff/actions/application-menu.svg"
    },
    {
        id: "help",
        label: "Aide",
        icon: "./assets/images/vendors/neon/kickoff/actions/help-about.svg",
        decorative: true,
        disabled: true
    },
    {
        id: "bureau",
        label: "Bureautique",
        icon: "./assets/images/vendors/neon/kickoff/actions/office-chart-area.svg"
    },
    {
        id: "dev",
        label: "Développement",
        icon: "./assets/images/vendors/neon/kickoff/actions/project-development.svg"
    },
    {
        id: "graph",
        label: "Graphisme",
        icon: "./assets/images/vendors/neon/kickoff/actions/graphics.svg"
    },
    {
        id: "internet",
        label: "Internet",
        icon: "./assets/images/vendors/neon/kickoff/actions/internet-services.svg"
    },
    {
        id: "sonvideo",
        label: "Multimédia",
        icon: "./assets/images/vendors/neon/kickoff/actions/view-media-playlist.svg"
    },
    {
        id: "system",
        label: "Système",
        icon: "./assets/images/vendors/neon/kickoff/actions/preferences-system-symbolic.svg"
    },
    {
        id: "utilities",
        label: "Utilitaires",
        icon: "./assets/images/vendors/neon/kickoff/actions/preferences-other.svg"
    }
];

const MENU_SHORTCUTS = {
    home: {
        dataLink: "nemo",
        directory: "./apps/system/Dossier_personnel"
    },
    desktop: {
        dataLink: "nemo",
        directory: "./apps/system/Dossier_personnel/Bureau"
    },
    documents: {
        dataLink: "nemo",
        directory: "./apps/system/Dossier_personnel/Documents"
    },
    downloads: {
        dataLink: "nemo",
        directory: "./apps/system/Dossier_personnel/Téléchargements"
    },
    pictures: {
        dataLink: "nemo",
        directory: "./apps/system/Dossier_personnel/Images"
    },
    music: {
        dataLink: "nemo",
        directory: "./apps/system/Dossier_personnel/Musique"
    },
    videos: {
        dataLink: "nemo",
        directory: "./apps/system/Dossier_personnel/Vidéos"
    },
    trash: {
        dataLink: "nemo",
        directory: "./apps/system/Dossier_personnel/Corbeille"
    }
};

const MENU_APPS = [
    {
        catId: "favorites",
        desktop: "firefox.desktop",
        icon: "./assets/images/vendors/neon/kickoff/firefox.png",
        name: "Firefox",
        desc: "Navigateur rapide et privé",
        dataLink: "firefox"
    },
    {
        catId: "favorites",
        desktop: "systemsettings.desktop",
        icon: "./assets/images/vendors/neon/kickoff/preferences-system.svg",
        name: "Configuration du système",
        desc: "Configurer le comportement et l\'apparence du système",
        dataLink: "themes"
    },
    {
        catId: "favorites",
        desktop: "org.kde.dolphin.desktop",
        icon: "./assets/images/vendors/neon/kickoff/org.kde.dolphin.svg",
        name: "Dolphin",
        desc: "Gérer vos fichiers",
        dataLink: "nemo"
    },
    {
        catId: "favorites",
        desktop: "org.kde.discover.desktop",
        icon: "./assets/images/vendors/neon/kickoff/plasmadiscover.png",
        name: "Discover",
        desc: "Installer et supprimer des applications et des modules complémentaires",
        dataLink: "update_manager"
    },
    {
        catId: "bureau",
        desktop: "org.kde.okular.desktop",
        icon: "./assets/images/vendors/neon/kickoff/okular.png",
        name: "Okular",
        desc: "Afficheur de document universel",
        dataLink: "visionneur_pdf"
    },
    {
        catId: "dev",
        desktop: "org.kde.kuserfeedback-console.desktop",
        icon: "./assets/images/vendors/neon/kickoff/system-search.svg",
        name: "Console de retours des utilisateurs",
        desc: "Outil d\'analyse et d\'administration pour les serveurs pour les retours des utilisateurs.",
        dataLink: "checklist"
    },
    {
        catId: "dev",
        desktop: "org.kde.kate.desktop",
        icon: "./assets/images/vendors/neon/kickoff/kate.png",
        name: "Kate",
        desc: "Éditeur de texte avancé de KDE",
        dataLink: "text_editor"
    },
    {
        catId: "graph",
        desktop: "org.kde.gwenview.desktop",
        icon: "./assets/images/vendors/neon/kickoff/gwenview.png",
        name: "Gwenview",
        desc: "Un afficheur simple d\'images",
        dataLink: "visionneur_images"
    },
    {
        catId: "internet",
        desktop: "firefox.desktop",
        icon: "./assets/images/vendors/neon/kickoff/firefox.png",
        name: "Firefox",
        desc: "Navigateur rapide et privé",
        dataLink: "firefox"
    },
    {
        catId: "internet",
        desktop: "org.kde.kdeconnect.nonplasma.desktop",
        icon: "./assets/images/vendors/neon/kickoff/kdeconnect.svg",
        name: "Indicateur de KDEConnect",
        desc: "Afficher les informations de vos périphériques",
        dataLink: "kdeconnect"
    },
    {
        catId: "internet",
        desktop: "org.kde.kdeconnect.app.desktop",
        icon: "./assets/images/vendors/neon/kickoff/kdeconnect.svg",
        name: "KDEConnect",
        desc: "Unifiez vos périphériques",
        dataLink: "kdeconnect"
    },
    {
        catId: "internet",
        desktop: "org.kde.kdeconnect.sms.desktop",
        icon: "./assets/images/vendors/neon/kickoff/kdeconnect.svg",
        name: "SMS par KDEConnect",
        desc: "Lire et envoyer des SMS à partir des périphériques connectés",
        dataLink: "kdeconnect"
    },
    {
        catId: "sonvideo",
        desktop: "vlc.desktop",
        icon: "./assets/images/vendors/neon/kickoff/vlc.png",
        name: "Lecteur multimédia VLC",
        desc: "Lit, capture, diffuse vos flux multimédias",
        dataLink: "lecteur_multimedia"
    },
    {
        catId: "system",
        desktop: "org.kde.plasma-welcome.desktop",
        icon: "./assets/images/vendors/neon/neon-logo.svg",
        name: "Centre d'accueil",
        desc: "Bienvenue dans KDE Neon",
        dataLink: "plasma_welcome"
    },
    {
        catId: "system",
        desktop: "org.kde.drkonqi.coredump.gui.desktop",
        icon: "./assets/images/vendors/neon/kickoff/tools-report-bug.svg",
        name: "Afficheur de processus plantés",
        desc: "Présente un affichage détaillé des plantages antérieurs",
        dataLink: "checklist"
    },
    {
        catId: "system",
        desktop: "org.kde.kinfocenter.desktop",
        icon: "./assets/images/vendors/neon/kickoff/hwinfo.svg",
        name: "Centre d\'informations",
        desc: "En savoir plus sur le matériel et l\'état du système",
        dataLink: "kinfocenter"
    },
    {
        catId: "system",
        desktop: "org.kde.discover.desktop",
        icon: "./assets/images/vendors/neon/kickoff/plasmadiscover.png",
        name: "Discover",
        desc: "Installer et supprimer des applications et des modules complémentaires",
        dataLink: "update_manager"
    },
    {
        catId: "system",
        desktop: "org.kde.dolphin.desktop",
        icon: "./assets/images/vendors/neon/kickoff/org.kde.dolphin.svg",
        name: "Dolphin",
        desc: "Gérer vos fichiers",
        dataLink: "nemo"
    },
    {
        catId: "system",
        desktop: "org.kde.partitionmanager.desktop",
        icon: "./assets/images/vendors/neon/kickoff/partitionmanager.svg",
        name: "Gestionnaire de partitions de KDE",
        desc: "Gérer les disques, les partitions et les systèmes de fichiers",
        dataLink: "partition_manager"
    },
    {
        catId: "system",
        desktop: "org.kde.keepsecret.desktop",
        icon: "./assets/images/vendors/neon/kickoff/kwalletmanager.png",
        name: "KeepSecret",
        desc: "Gérer des mots de passe",
        dataLink: "kwallet"
    },
    {
        catId: "system",
        desktop: "org.kde.konsole.desktop",
        icon: "./assets/images/vendors/neon/kickoff/utilities-terminal.svg",
        name: "Konsole",
        desc: "Ligne de commande",
        dataLink: "terminal"
    },
    {
        catId: "system",
        desktop: "org.kde.kwalletmanager.desktop",
        icon: "./assets/images/vendors/neon/kickoff/kwalletmanager.png",
        name: "KWalletManager",
        desc: "Enregistrez et gérez vos mots de passe",
        dataLink: "kwallet"
    },
    {
        catId: "system",
        desktop: "org.kde.plasma-systemmonitor.desktop",
        icon: "./assets/images/vendors/neon/kickoff/utilities-system-monitor.svg",
        name: "Surveillance du système",
        desc: "Surveiller l\'utilisation des applications et des ressources du système",
        dataLink: "system_monitor"
    },
    {
        catId: "system",
        desktop: "org.gnome.Terminal.desktop",
        icon: "./assets/images/vendors/neon/kickoff/org.gnome.Terminal.svg",
        name: "Terminal",
        desc: "Use the command line",
        dataLink: "terminal"
    },
    {
        catId: "system",
        desktop: "org.kde.kmenuedit.desktop",
        icon: "./assets/images/vendors/neon/kickoff/kmenuedit.png",
        name: "Éditeur de menus",
        desc: "Modifier la présentation des applications dans les lanceurs d\'applications",
        dataLink: "kmenuedit"
    },
    {
        catId: "utilities",
        desktop: "org.kde.ark.desktop",
        icon: "./assets/images/vendors/neon/kickoff/ark.png",
        name: "Ark",
        desc: "Travailler avec des archives de fichiers",
        dataLink: "ark"
    },
    {
        catId: "utilities",
        desktop: "yelp.desktop",
        icon: "./assets/images/vendors/neon/kickoff/org.gnome.Yelp.png",
        name: "Help",
        desc: "Get help with GNOME",
        dataLink: "profile"
    },
    {
        catId: "utilities",
        desktop: "org.kde.spectacle.desktop",
        icon: "./assets/images/vendors/neon/kickoff/spectacle.svg",
        name: "Spectacle",
        desc: "Effectuer des captures d\'écran et des enregistrements d\'écran",
        dataLink: "spectacle"
    },
    {
        catId: "utilities",
        desktop: "org.kde.plasma.emojier.desktop",
        icon: "./assets/images/vendors/neon/kickoff/preferences-desktop-emoticons.svg",
        name: "Sélecteur d\'émoticônes",
        desc: "Copier les émoticônes dans le presse-papier",
        dataLink: "profile"
    },
    {
        catId: "utilities",
        desktop: "info.desktop",
        icon: "./assets/images/vendors/neon/kickoff/dialog-information.svg",
        name: "TeXInfo",
        desc: "The viewer for TexInfo documents",
        dataLink: "profile"
    },
    {
        catId: "utilities",
        desktop: "vim.desktop",
        icon: "./assets/images/vendors/neon/kickoff/gvim.png",
        name: "Vim",
        desc: "Éditer des fichiers texte",
        dataLink: "text_editor"
    }
];
