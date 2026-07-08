'use strict';
const MENU_CATS = [
    { id: 'all', label: 'Applications récentes', icon: './assets/images/toolkits/kde/category/applications-other.png' },
    { id: 'recent_files', label: 'Fichiers récents', icon: './assets/images/toolkits/kde/category/preferences-desktop-default-applications.png', decorative: true, disabled: true },
    { id: 'help', label: 'Aide', icon: './assets/images/toolkits/kde/category/applications-accessories.png', decorative: true, disabled: true },
    { id: 'bureau', label: 'Bureautique', icon: './assets/images/toolkits/kde/category/applications-office.png' },
    { id: 'dev', label: 'Développement', icon: './assets/images/toolkits/kde/category/applications-development.png', decorative: true, disabled: true },
    { id: 'graph', label: 'Graphisme', icon: './assets/images/toolkits/kde/category/applications-graphics.png' },
    { id: 'internet', label: 'Internet', icon: './assets/images/toolkits/kde/category/applications-internet.png' },
    { id: 'games', label: 'Jeux', icon: './assets/images/toolkits/kde/category/applications-games.png', decorative: true, disabled: true },
    { id: 'sonvideo', label: 'Multimédia', icon: './assets/images/toolkits/kde/category/applications-multimedia.png' },
    { id: 'mxtools', label: 'MX Outils - MX Tools', icon: './assets/images/toolkits/kde/category/preferences-desktop-tweaks.png' },
    { id: 'science', label: 'Sciences et mathématiques', icon: './assets/images/toolkits/kde/category/applications-science.png', decorative: true, disabled: true },
    { id: 'system', label: 'Système', icon: './assets/images/toolkits/kde/category/applications-system.png' },
    { id: 'utilities', label: 'Utilitaires', icon: './assets/images/toolkits/kde/category/applications-utilities.png' },
    { id: 'session', label: 'État d\'allumage / session', icon: './assets/images/toolkits/kde/category/cs-desktop.png', decorative: true, disabled: true },
];

const MENU_SHORTCUTS = {
    desktop: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Bureau',
    },
    downloads: {
        dataLink: 'nemo',
        directory: './apps/system/Dossier_personnel/Téléchargements',
    },
};

const MENU_APPS = [
    { catId: 'utilities', icon: './assets/images/toolkits/kde/apps/accessories-calculator.png', name: 'Calculatrice', desc: 'Effectuez des calculs', dataLink: null },
    { catId: 'utilities', icon: './assets/images/toolkits/kde/apps/accessories-text-editor.png', name: 'Éditeur de texte', desc: 'Éditez des fichiers texte', dataLink: 'text_editor' },
    { catId: 'utilities', icon: './assets/images/toolkits/kde/apps/archive-manager.png', name: 'Gestionnaire d\'archives', desc: 'Créez et modifiez des archives', dataLink: null },
    { catId: 'utilities', icon: './assets/images/toolkits/kde/apps/accessories-system-cleaner.png', name: 'Outil de nettoyage', desc: 'Nettoyez le système', dataLink: null },
    { catId: 'bureau', icon: './assets/images/toolkits/kde/apps/libreoffice-calc.png', name: 'LibreOffice Calc', desc: 'Tableur', dataLink: null },
    { catId: 'bureau', icon: './assets/images/toolkits/kde/apps/libreoffice-writer.webp', name: 'LibreOffice Writer', desc: 'Traitement de texte', dataLink: 'librewriter' },
    { catId: 'graph', icon: './assets/images/toolkits/kde/apps/gimp.png', name: 'GIMP', desc: 'Éditeur d\'images avancé', dataLink: null },
    { catId: 'graph', icon: './assets/images/toolkits/kde/apps/inkscape.png', name: 'Inkscape', desc: 'Éditeur de graphiques vectoriels', dataLink: null },
    { catId: 'graph', icon: './assets/images/toolkits/kde/apps/multimedia-photo-viewer.png', name: 'Visionneur d\'images', desc: 'Visionnez vos photos', dataLink: 'visionneur_images' },
    { catId: 'graph', icon: './assets/images/toolkits/kde/apps/okular.png', name: 'Visionneur de documents', desc: 'Lisez vos fichiers PDF', dataLink: 'visionneur_pdf' },
    { catId: 'graph', icon: './assets/images/toolkits/kde/apps/accessories-painting.png', name: 'Dessin', desc: 'Créez des illustrations', dataLink: null },
    { catId: 'internet', icon: './assets/images/toolkits/kde/apps/firefox.webp', name: 'Firefox', desc: 'Naviguez sur le web', dataLink: 'firefox' },
    { catId: 'sonvideo', icon: './assets/images/toolkits/kde/apps/multimedia-audio-player.png', name: 'Lecteur audio', desc: 'Écoutez de la musique', dataLink: null },
    { catId: 'sonvideo', icon: './assets/images/toolkits/kde/apps/multimedia-video-player.png', name: 'Lecteur vidéo', desc: 'Regardez des vidéos', dataLink: 'lecteur_multimedia' },
    { catId: 'sonvideo', icon: './assets/images/toolkits/kde/apps/audio-equalizer.png', name: 'Égaliseur audio', desc: 'Ajustez le son', dataLink: null },
    { catId: 'system', icon: './assets/images/toolkits/kde/apps/preferences-system.png', name: 'Paramètres du système', desc: 'Configurer le système', dataLink: null },
    { catId: 'system', icon: './assets/images/toolkits/kde/apps/preferences-desktop-wallpaper.png', name: 'Arrière-plans', desc: 'Changer le fond d\'écran', dataLink: null },
    { catId: 'system', icon: './assets/images/toolkits/kde/apps/preferences-desktop-theme.png', name: 'Thèmes', desc: 'Personnaliser l\'apparence', dataLink: 'themes' },
    { catId: 'system', icon: './assets/images/toolkits/kde/apps/preferences-system-sound.png', name: 'Son', desc: 'Configurer le volume et les périphériques', dataLink: null },
    { catId: 'system', icon: './assets/images/toolkits/kde/apps/utilities-terminal.png', name: 'Terminal', desc: 'Émulateur de terminal', dataLink: 'terminal' },
    { catId: 'system', icon: './assets/images/toolkits/kde/apps/user-info.png', name: 'À propos - MX Linux KDE', desc: 'Infos et évaluation de la distro', dataLink: 'profile' },
    { catId: 'mxtools', icon: './assets/images/toolkits/kde/apps/plasmadiscover.svg', name: 'Discover', desc: 'Installer des logiciels', dataLink: 'update_manager' },
    { catId: 'mxtools', icon: './assets/images/toolkits/kde/apps/mx-tools.svg', name: 'Missions MX', desc: 'Missions de découverte', dataLink: 'checklist' },
];
