const MENU_CATS = [
    { id: 'all', label: 'Applications récentes', icon: './media/img/category/applications-other.png' },
    { id: 'recent_files', label: 'Fichiers récents', icon: './media/img/category/preferences-desktop-default-applications.png', decorative: true, disabled: true },
    { id: 'help', label: 'Aide', icon: './media/img/category/applications-accessories.png', decorative: true, disabled: true },
    { id: 'bureau', label: 'Bureautique', icon: './media/img/category/applications-office.png' },
    { id: 'dev', label: 'Développement', icon: './media/img/category/applications-development.png', decorative: true, disabled: true },
    { id: 'graph', label: 'Graphisme', icon: './media/img/category/applications-graphics.png' },
    { id: 'internet', label: 'Internet', icon: './media/img/category/applications-internet.png' },
    { id: 'games', label: 'Jeux', icon: './media/img/category/applications-games.png', decorative: true, disabled: true },
    { id: 'sonvideo', label: 'Multimédia', icon: './media/img/category/applications-multimedia.png' },
    { id: 'mxtools', label: 'MX Outils - MX Tools', icon: './media/img/category/preferences-desktop-tweaks.png' },
    { id: 'science', label: 'Sciences et mathématiques', icon: './media/img/category/applications-science.png', decorative: true, disabled: true },
    { id: 'system', label: 'Système', icon: './media/img/category/applications-system.png' },
    { id: 'utilities', label: 'Utilitaires', icon: './media/img/category/applications-utilities.png' },
    { id: 'session', label: 'État d\'allumage / session', icon: './media/img/category/cs-desktop.png', decorative: true, disabled: true },
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
    { catId: 'utilities', icon: './media/img/apps/accessories-calculator.png', name: 'Calculatrice', desc: 'Effectuez des calculs', dataLink: null },
    { catId: 'utilities', icon: './media/img/apps/accessories-text-editor.png', name: 'Éditeur de texte', desc: 'Éditez des fichiers texte', dataLink: null },
    { catId: 'utilities', icon: './media/img/apps/archive-manager.png', name: 'Gestionnaire d\'archives', desc: 'Créez et modifiez des archives', dataLink: null },
    { catId: 'utilities', icon: './media/img/apps/accessories-system-cleaner.png', name: 'Outil de nettoyage', desc: 'Nettoyez le système', dataLink: null },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-calc.png', name: 'LibreOffice Calc', desc: 'Tableur', dataLink: null },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-writer.png', name: 'LibreOffice Writer', desc: 'Traitement de texte', dataLink: 'librewriter' },
    { catId: 'graph', icon: './media/img/apps/gimp.png', name: 'GIMP', desc: 'Éditeur d\'images avancé', dataLink: null },
    { catId: 'graph', icon: './media/img/apps/inkscape.png', name: 'Inkscape', desc: 'Éditeur de graphiques vectoriels', dataLink: null },
    { catId: 'graph', icon: './media/img/apps/multimedia-photo-viewer.png', name: 'Visionneur d\'images', desc: 'Visionnez vos photos', dataLink: 'visionneur_images' },
    { catId: 'graph', icon: './media/img/apps/okular.png', name: 'Visionneur de documents', desc: 'Lisez vos fichiers PDF', dataLink: 'visionneur_pdf' },
    { catId: 'graph', icon: './media/img/apps/accessories-painting.png', name: 'Dessin', desc: 'Créez des illustrations', dataLink: null },
    { catId: 'internet', icon: './media/img/apps/firefox.png', name: 'Firefox', desc: 'Naviguez sur le web', dataLink: 'firefox' },
    { catId: 'sonvideo', icon: './media/img/apps/multimedia-audio-player.png', name: 'Lecteur audio', desc: 'Écoutez de la musique', dataLink: null },
    { catId: 'sonvideo', icon: './media/img/apps/multimedia-video-player.png', name: 'Lecteur vidéo', desc: 'Regardez des vidéos', dataLink: 'lecteur_multimedia' },
    { catId: 'sonvideo', icon: './media/img/apps/audio-equalizer.png', name: 'Égaliseur audio', desc: 'Ajustez le son', dataLink: null },
    { catId: 'system', icon: './media/img/apps/preferences-system.png', name: 'Paramètres du système', desc: 'Configurer le système', dataLink: null },
    { catId: 'system', icon: './media/img/apps/preferences-desktop-wallpaper.png', name: 'Arrière-plans', desc: 'Changer le fond d\'écran', dataLink: null },
    { catId: 'system', icon: './media/img/apps/preferences-desktop-theme.png', name: 'Thèmes', desc: 'Personnaliser l\'apparence', dataLink: 'themes' },
    { catId: 'system', icon: './media/img/apps/preferences-system-sound.png', name: 'Son', desc: 'Configurer le volume et les périphériques', dataLink: null },
    { catId: 'system', icon: './media/img/apps/utilities-terminal.png', name: 'Terminal', desc: 'Émulateur de terminal', dataLink: 'terminal' },
    { catId: 'system', icon: './media/img/apps/user-info.png', name: 'À propos - MX Linux KDE', desc: 'Infos et évaluation de la distro', dataLink: 'profile' },
    { catId: 'mxtools', icon: './media/img/apps/mintinstall.png', name: 'Logithèque', desc: 'Installer des logiciels', dataLink: null },
    { catId: 'mxtools', icon: './media/img/apps/mx-tools.svg', name: 'Missions MX', desc: 'Missions de découverte', dataLink: 'checklist' },
];
