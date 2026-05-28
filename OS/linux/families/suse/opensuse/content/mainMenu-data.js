const MENU_CATS = [
    { id: 'favorites', label: 'Favoris', icon: './media/img/category/favorites.svg' },
    { id: 'all', label: 'Toutes les applications', icon: './media/img/category/applications-all.svg' },
    { id: 'help', label: 'Aide', icon: './media/img/category/applications-accessories.svg', decorative: true, disabled: true },
    { id: 'bureau', label: 'Bureautique', icon: './media/img/category/applications-office.svg' },
    { id: 'dev', label: 'Développement', icon: './media/img/category/applications-development.svg', decorative: true, disabled: true },
    { id: 'education', label: 'Éducation', icon: './media/img/category/applications-education.svg', decorative: true, disabled: true },
    { id: 'graph', label: 'Graphisme', icon: './media/img/category/applications-graphics.svg' },
    { id: 'internet', label: 'Internet', icon: './media/img/category/applications-internet.svg' },
    { id: 'games', label: 'Jeux', icon: './media/img/category/applications-games.svg', decorative: true, disabled: true },
    { id: 'sonvideo', label: 'Multimédia', icon: './media/img/category/applications-multimedia.svg' },
    { id: 'system', label: 'Système', icon: './media/img/category/applications-system.svg' },
    { id: 'utilities', label: 'Utilitaires', icon: './media/img/category/applications-utilities.svg' },
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
    { catId: 'favorites', icon: './media/img/apps/firefox.svg', name: 'Firefox', desc: 'Navigateur Web', dataLink: 'firefox' },
    { catId: 'favorites', icon: './media/img/apps/kontact.svg', name: 'Kontact', desc: 'Courriel et agenda', dataLink: null },
    { catId: 'favorites', icon: './media/img/apps/libreoffice-writer.svg', name: 'LibreOffice Writer', desc: 'Traitement de texte', dataLink: 'librewriter' },
    { catId: 'favorites', icon: './media/img/apps/org.kde.dolphin.svg', name: 'Dolphin', desc: 'Gestionnaire de fichiers', dataLink: 'nemo' },
    { catId: 'favorites', icon: './media/img/apps/kate.svg', name: 'Kate', desc: 'Éditeur de texte avancé', dataLink: null },
    { catId: 'favorites', icon: './media/img/apps/systemsettings.svg', name: 'Configuration du système', desc: 'Paramètres Plasma', dataLink: 'themes' },
    { catId: 'favorites', icon: './media/img/apps/help-center.svg', name: 'Centre d\'aide', desc: 'Documentation KDE', dataLink: null },
    { catId: 'favorites', icon: './media/img/apps/konsole.svg', name: 'Konsole', desc: 'Terminal', dataLink: 'terminal' },
    { catId: 'internet', icon: './media/img/apps/firefox.svg', name: 'Firefox', desc: 'Navigateur Web', dataLink: 'firefox' },
    { catId: 'utilities', icon: './media/img/apps/yast-firewall.svg', name: 'YaST Firewall', desc: 'Firewall', dataLink: null },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-main.png', name: 'LibreOffice', desc: 'Bureau', dataLink: null },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-draw.png', name: 'LibreOffice Draw', desc: 'Programme de dessin', dataLink: null },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-writer.svg', name: 'LibreOffice Writer', desc: 'Traitement de texte', dataLink: 'librewriter' },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-impress.png', name: 'LibreOffice Impress', desc: 'Présentation', dataLink: null },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-calc.png', name: 'LibreOffice Calc', desc: 'Classeur', dataLink: null },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-base.png', name: 'LibreOffice Base', desc: 'Développement de base de données', dataLink: null },
    { catId: 'bureau', icon: './media/img/apps/libreoffice-math.png', name: 'LibreOffice Math', desc: 'Éditeur de formule', dataLink: null },
    { catId: 'system', icon: './media/img/apps/systemsettings.svg', name: 'Configuration du système', desc: 'Configurer le système', dataLink: 'themes' },
    { catId: 'system', icon: './media/img/apps/org.kde.dolphin.svg', name: 'Dolphin', desc: 'Gestionnaire de fichiers', dataLink: 'nemo' },
    { catId: 'system', icon: './media/img/apps/konsole.svg', name: 'Konsole', desc: 'Émulateur de terminal', dataLink: 'terminal' },
    { catId: 'system', icon: './media/img/apps/yast-sysconfig.svg', name: 'YaST Sysconfig Editor', desc: 'Sysconfig Editor', dataLink: null },
    { catId: 'system', icon: './media/img/apps/user-info.png', name: 'À propos - openSUSE Tumbleweed', desc: 'Infos distro', dataLink: 'profile' },
    { catId: 'system', icon: './media/img/apps/mx-tools.svg', name: 'Missions openSUSE', desc: 'Missions de découverte', dataLink: 'checklist' },
];
