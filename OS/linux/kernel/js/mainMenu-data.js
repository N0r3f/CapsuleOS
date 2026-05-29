const MENU_CATS = [
    { id: 'all',      label: 'Toutes les applications' },
    { id: 'access',   label: 'Accessoires' },
    { id: 'bureau',   label: 'Bureautique' },
    { id: 'graph',    label: 'Graphisme' },
    { id: 'internet', label: 'Internet' },
    { id: 'sonvideo', label: 'Son et vidéo' },
    { id: 'prefs',    label: 'Préférences' },
    { id: 'admin',    label: 'Administration' },
    { id: 'recent',   label: 'Fichiers récents' },
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
    // Accessoires
    { catId: 'access',   icon: './media/img/apps/accessories-calculator.png',      name: 'Calculatrice',                desc: 'Effectuez des calculs',                    dataLink: null        },
    { catId: 'access',   icon: './media/img/apps/accessories-text-editor.png',     name: 'Éditeur de texte',            desc: 'Éditez des fichiers texte',                dataLink: null        },
    { catId: 'access',   icon: './media/img/apps/archive-manager.png',             name: 'Gestionnaire d\'archives',    desc: 'Créez et modifiez des archives',           dataLink: null        },
    { catId: 'access',   icon: './media/img/apps/accessories-system-cleaner.png',  name: 'Outil de nettoyage',          desc: 'Nettoyez le système',                      dataLink: null        },
    // Bureautique
    { catId: 'bureau',   icon: './media/img/apps/libreoffice-calc.png',            name: 'LibreOffice Calc',            desc: 'Tableur',                                  dataLink: null        },
    { catId: 'bureau',   icon: './media/img/apps/libreoffice-writer.png',          name: 'LibreOffice Writer',          desc: 'Traitement de texte',                      dataLink: 'librewriter' },
    // Graphisme
    { catId: 'graph',    icon: './media/img/apps/gimp.png',                        name: 'GIMP',                        desc: 'Éditeur d\'images avancé',                 dataLink: null        },
    { catId: 'graph',    icon: './media/img/apps/inkscape.png',                    name: 'Inkscape',                    desc: 'Éditeur de graphiques vectoriels',          dataLink: null        },
    { catId: 'graph',    icon: './media/img/apps/multimedia-photo-viewer.png',     name: 'Visionneur d\'images',        desc: 'Visionnez vos photos',                     dataLink: 'visionneur_images' },
    { catId: 'graph',    icon: './media/img/apps/okular.png',                       name: 'Visionneur de documents',     desc: 'Lisez vos fichiers PDF',                   dataLink: 'visionneur_pdf'    },
    { catId: 'graph',    icon: './media/img/apps/accessories-painting.png',        name: 'Dessin',                      desc: 'Créez des illustrations',                  dataLink: null        },
    // Internet
    { catId: 'internet', icon: './media/img/apps/firefox.png',                     name: 'Firefox',                     desc: 'Naviguez sur le web',                      dataLink: 'firefox'   },
    // Son et vidéo
    { catId: 'sonvideo', icon: './media/img/apps/multimedia-audio-player.png',     name: 'Lecteur audio',               desc: 'Écoutez de la musique',                    dataLink: null        },
    { catId: 'sonvideo', icon: './media/img/apps/multimedia-video-player.png',     name: 'Lecteur vidéo',               desc: 'Regardez des vidéos',                      dataLink: 'lecteur_multimedia' },
    { catId: 'sonvideo', icon: './media/img/apps/audio-equalizer.png',             name: 'Égaliseur audio',             desc: 'Ajustez le son',                           dataLink: null        },
    // Préférences
    { catId: 'prefs',    icon: './media/img/apps/preferences-system.png',          name: 'Paramètres du système',       desc: 'Configurer le système',                    dataLink: null        },
    { catId: 'prefs',    icon: './media/img/apps/preferences-desktop-wallpaper.png', name: 'Arrière-plans',             desc: 'Changer le fond d\'écran',                 dataLink: null        },
    { catId: 'prefs',    icon: './media/img/apps/preferences-desktop-theme.png',   name: 'Thèmes',                      desc: 'Personnaliser l\'apparence',               dataLink: 'themes'    },
    { catId: 'prefs',    icon: './media/img/apps/preferences-system-sound.png',    name: 'Son',                         desc: 'Configurer le volume et les périphériques', dataLink: null       },
    // Administration
    { catId: 'admin',    icon: './media/img/apps/yast.png',                        name: 'Administration du système',   desc: 'Configurer le système',                    dataLink: null        },
    { catId: 'admin',    icon: './media/img/apps/utilities-terminal.png',          name: 'Terminal',                    desc: 'Émulateur de terminal',                    dataLink: 'terminal'  },
    { catId: 'admin',    icon: './media/img/apps/preferences-system.png',          name: 'Gestionnaire de mise à jour', desc: 'Installer les mises à jour',               dataLink: 'update_manager' },
    { catId: 'admin',    icon: './media/img/apps/mintinstall.png',                 name: 'Logithèque',                  desc: 'Installer des logiciels',                  dataLink: null        },
    { catId: 'admin',    icon: './media/img/apps/user-info.png',                   name: 'Profil Linux Mint',           desc: 'Infos et évaluation de la distro',        dataLink: 'profile'   },
];
