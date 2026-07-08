'use strict';
const MENU_CATS = [
    // Icônes monochromes cohérentes (pas de dossiers, pas de dégradés).
    { id: 'favorites', label: 'Favoris', icon: './assets/images/toolkits/kde/category/favorites.svg' },
    { id: 'all', label: 'Toutes les applications', icon: './assets/images/toolkits/kde/category/mono-apps.svg' },
    { id: 'recent', label: 'Récents', icon: './assets/images/toolkits/kde/category/mono-recent.svg', decorative: true, disabled: true },
    { id: 'bureau', label: 'Bureautique', icon: './assets/images/toolkits/kde/category/mono-office.svg' },
    { id: 'dev', label: 'Développement', icon: './assets/images/toolkits/kde/category/mono-dev.svg' },
    { id: 'education', label: 'Éducation', icon: './assets/images/toolkits/kde/category/mono-education.svg' },
    { id: 'graph', label: 'Graphisme', icon: './assets/images/toolkits/kde/category/mono-graphics.svg' },
    { id: 'internet', label: 'Internet', icon: './assets/images/toolkits/kde/category/mono-internet.svg' },
    { id: 'games', label: 'Jeux', icon: './assets/images/toolkits/kde/category/mono-games.svg' },
    { id: 'sonvideo', label: 'Multimédia', icon: './assets/images/toolkits/kde/category/mono-multimedia.svg' },
    { id: 'system', label: 'Système', icon: './assets/images/toolkits/kde/category/mono-system.svg' },
    { id: 'utilities', label: 'Utilitaires', icon: './assets/images/toolkits/kde/category/mono-utilities.svg' },
];

const MENU_SHORTCUTS = {
    home: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel',
    },
    desktop: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Bureau',
    },
    documents: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Documents',
    },
    downloads: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Téléchargements',
    },
    pictures: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Images',
    },
    music: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Musique',
    },
    videos: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Vidéos',
    },
    trash: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Corbeille',
    },
};

const MENU_APPS = [
    { catId: 'favorites', icon: './assets/images/toolkits/kde/apps/firefox.svg', name: 'Firefox', desc: 'Navigateur Web', dataLink: 'firefox' },
    { catId: 'favorites', icon: './assets/images/toolkits/kde/apps/libreoffice-writer.svg', name: 'LibreOffice Writer', desc: 'Traitement de texte', dataLink: 'librewriter' },
    { catId: 'favorites', icon: './assets/images/toolkits/kde/apps/dolphin.svg', name: 'Dolphin', desc: 'Gestionnaire de fichiers', dataLink: 'nemo' },
    { catId: 'favorites', icon: './assets/images/toolkits/kde/apps/systemsettings.svg', name: 'Configuration du système', desc: 'Paramètres Plasma', dataLink: 'themes' },
    { catId: 'favorites', icon: './assets/images/toolkits/kde/apps/terminal.svg', name: 'Konsole', desc: 'Terminal', dataLink: 'terminal' },
    { catId: 'favorites', icon: './assets/images/toolkits/kde/apps/discover.svg', name: 'Discover', desc: 'Gestionnaire de logiciels', dataLink: 'checklist' },

    { catId: 'internet', icon: './assets/images/toolkits/kde/apps/firefox.svg', name: 'Firefox ESR', desc: 'Navigateur Web', dataLink: 'firefox' },
    { catId: 'internet', icon: './assets/images/toolkits/kde/apps/terminal.svg', name: 'SSH', desc: 'Connexion distante', },
    { catId: 'internet', icon: './assets/images/toolkits/kde/apps/dolphin.svg', name: 'Téléchargements', desc: 'Accéder au dossier Téléchargements', dataLink: { dataLink: 'nemo', directory: './apps/system/Dossier_personnel/Téléchargements' } },

    { catId: 'bureau', icon: './assets/images/toolkits/kde/apps/libreoffice-writer.svg', name: 'LibreOffice Writer', desc: 'Traitement de texte', dataLink: 'librewriter' },
    { catId: 'bureau', icon: './assets/images/toolkits/kde/apps/libreoffice-writer.svg', name: 'LibreOffice Calc', desc: 'Tableur', },
    { catId: 'bureau', icon: './assets/images/toolkits/kde/apps/libreoffice-writer.svg', name: 'LibreOffice Impress', desc: 'Présentation', },

    { catId: 'graph', icon: './assets/images/toolkits/kde/apps/systemsettings.svg', name: 'Visionneuse d’images', desc: 'Ouvrir une image', dataLink: 'visionneur_images' },
    { catId: 'graph', icon: './assets/images/toolkits/kde/apps/systemsettings.svg', name: 'Éditeur d’images', desc: 'Retouche photo', },

    { catId: 'sonvideo', icon: './assets/images/toolkits/kde/apps/systemsettings.svg', name: 'Lecteur multimédia', desc: 'Audio/Vidéo', dataLink: 'lecteur_multimedia' },
    { catId: 'sonvideo', icon: './assets/images/toolkits/kde/apps/systemsettings.svg', name: 'Visionneuse PDF', desc: 'Ouvrir un PDF', dataLink: 'visionneur_pdf' },

    { catId: 'dev', icon: './assets/images/toolkits/kde/apps/terminal.svg', name: 'Éditeur de code', desc: 'Coder rapidement', },
    { catId: 'dev', icon: './assets/images/toolkits/kde/apps/terminal.svg', name: 'Git', desc: 'Contrôle de version', },
    { catId: 'education', icon: './assets/images/toolkits/kde/apps/discover.svg', name: 'Calculatrice', desc: 'Calculs rapides', },
    { catId: 'education', icon: './assets/images/toolkits/kde/apps/discover.svg', name: 'Table périodique', desc: 'Chimie', },
    { catId: 'games', icon: './assets/images/toolkits/kde/apps/discover.svg', name: 'Démineur', desc: 'Classique', },
    { catId: 'games', icon: './assets/images/toolkits/kde/apps/discover.svg', name: 'Solitaire', desc: 'Cartes', },

    { catId: 'utilities', icon: './assets/images/toolkits/kde/apps/dolphin.svg', name: 'Fichiers', desc: 'Gestionnaire de fichiers', dataLink: 'nemo' },
    { catId: 'utilities', icon: './assets/images/toolkits/kde/apps/terminal.svg', name: 'Terminal', desc: 'Ligne de commande', dataLink: 'terminal' },
    { catId: 'utilities', icon: './assets/images/toolkits/kde/apps/systemsettings.svg', name: 'Thèmes', desc: 'Changer l’apparence', dataLink: 'themes' },

    { catId: 'system', icon: './assets/images/vendors/debian/debian-logo.svg', name: 'À propos - Debian KDE', desc: 'Infos distro', dataLink: 'profile' },
    { catId: 'system', icon: './assets/icons/kde/nemo/checkbox.svg', name: 'Missions Debian KDE', desc: 'Missions de découverte', dataLink: 'checklist' },
    { catId: 'system', icon: './assets/images/toolkits/kde/apps/systemsettings.svg', name: 'Gestionnaire de tâches', desc: 'Surveiller le système', },
    { catId: 'system', icon: './assets/images/toolkits/kde/apps/systemsettings.svg', name: 'Mises à jour', desc: 'Mettre à jour le système', },
];

