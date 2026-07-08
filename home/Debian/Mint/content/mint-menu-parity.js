/**
 * Parité menu Cinnamon Mint v3 — données uniquement (libellés FR, icônes, dataLink).
 * Layout : mainMenu.skin.css · comportement : mainMenu.js (noyau).
 */
(function applyMintMenuParity() {
    'use strict';

    var panelIcon = './assets/images/vendors/mint/panel/';

    if (typeof MENU_SHORTCUTS !== 'undefined') {
        MENU_SHORTCUTS.calculator = {
            dataLink: 'calculator',
            icon: panelIcon + 'org.gnome.Calculator.webp'
        };
        MENU_SHORTCUTS.agenda = {
            dataLink: 'calendar',
            icon: panelIcon + 'org.gnome.Calendar.webp'
        };
        MENU_SHORTCUTS['text-editor'] = {
            dataLink: 'text_editor',
            icon: panelIcon + 'accessories-text-editor.webp'
        };
        MENU_SHORTCUTS['software-manager'] = {
            dataLink: 'mintinstall',
            icon: panelIcon + 'mintinstall.webp'
        };
        MENU_SHORTCUTS['system-settings'] = {
            dataLink: 'themes',
            icon: panelIcon + 'preferences-desktop-theme.webp'
        };
    }

    var CS_PANEL_BY_NAME = {
        'Accessibilité': 'accessibility',
        'Actions': 'actions',
        'Administration du système': 'system-info',
        'Advanced Network Configuration': 'network',
        'Adaptateurs Bluetooth': 'bluetooth',
        'Affichage': 'display',
        'Applets': 'applets',
        'Applications lancées au démarrage': 'startup',
        'Applications par défaut': 'default',
        'Bureau': 'desktop',
        'Choix des polices': 'fonts',
        'Clavier': 'keyboard',
        'Clavier visuel': 'accessibility',
        'Comptes en ligne': 'online-accounts',
        'Préférences IBus': 'input-method',
        'Coins intelligents': 'hotcorner',
        'Couleur': 'color',
        'Date et heure': 'calendar',
        'Desklets': 'desklets',
        'Détails du compte': 'user',
        'Économiseur d\'écran': 'screensaver',
        'Économiseur d’écran': 'screensaver',
        'Effets': 'effects',
        'Empreintes digitales': 'fingerprints',
        'Espaces de travail': 'workspaces',
        'Extensions': 'extensions',
        'Fenêtre de connexion': 'login-window',
        'Fenêtres': 'windows',
        'Firewall Configuration': 'firewall',
        'Fonds d\'écran': 'backgrounds',
        'Fonds d’écran': 'backgrounds',
        'Fonts': 'fonts',
        'Général': 'general',
        'Gestes': 'gestures',
        'Gestion de l\'alimentation': 'power',
        'Gestion de l’alimentation': 'power',
        'Gestionnaire Bluetooth': 'bluetooth',
        'Langues': 'languages',
        'Méthode de saisie': 'input-method',
        'Mode nuit': 'nightlight',
        'Notifications': 'notifications',
        'Panneau': 'panel',
        'Paramètres du système': 'general',
        'Protection des renseignements personnels': 'privacy',
        'Réseau': 'network',
        'Son': 'sound',
        'Souris et pavé tactile': 'mouse',
        'Tablette graphique': 'wacom',
        'Thèmes': 'themes',
        'Thunderbolt': 'thunderbolt',
        'Utilisateurs et groupes': 'users',
        'Disks': 'disks',
        'Disques': 'disks',
        'Printers': 'printers',
        'Imprimantes': 'printers',
        'Passwords and Keys': 'passwords',
        'Mots de passe et clés': 'passwords',
        'Sources de logiciels': 'software-sources',
        'Renseignements sur le système': 'system-info',
        'Informations système': 'system-info',
        'Onboard': 'accessibility'
    };

    /* Filets de sécurité si la donnée générée arrive en anglais —
       les libellés cibles suivent la vérité VM (linux-mint-menu-entries-vm.json). */
    var FRENCH_APP_NAMES = {
        'Calculator': 'Calculatrice',
        'Calendar': 'Agenda',
        'Archive Manager': 'Gestionnaire d\'archives',
        'Firefox': 'Firefox',
        'Files': 'Fichiers',
        'Library': 'Bibliothèque',
        'Welcome Screen': 'Écran d\'accueil',
        'Text Editor': 'Éditeur de texte',
        'Drawing': 'Dessin',
        'Document Scanner': 'Numériseur de documents',
        'Disk Usage Analyzer': 'Analyseur d’utilisation des disques',
        'Update Manager': 'Gestionnaire de mise à jour',
        'Software Manager': 'Logithèque',
        'System Monitor': 'Moniteur système'
    };

    if (typeof MENU_APPS !== 'undefined' && MENU_APPS.length) {
        MENU_APPS.forEach(function patchApp(app) {
            if (FRENCH_APP_NAMES[app.name]) {
                app.name = FRENCH_APP_NAMES[app.name];
            }
            if (CS_PANEL_BY_NAME[app.name] && app.dataLink === 'themes' && !app.csPanel) {
                app.csPanel = CS_PANEL_BY_NAME[app.name];
            }
            if (app.name === 'Calculatrice') {
                app.dataLink = 'calculator';
                app.icon = panelIcon + 'org.gnome.Calculator.webp';
            }
            if (app.name === 'Éditeur de texte') {
                app.dataLink = 'text_editor';
                app.icon = panelIcon + 'accessories-text-editor.webp';
            }
            if (app.name === 'Logithèque') {
                app.dataLink = 'mintinstall';
                app.icon = panelIcon + 'mintinstall.webp';
            }
            if (app.name === 'System Monitor' || app.name === 'Moniteur système') {
                app.dataLink = 'system_monitor';
                app.name = 'Moniteur système';
                app.icon = './assets/images/toolkits/cinnamon/apps/org.gnome.SystemMonitor';
            }
            if (app.name === 'Thèmes') {
                app.icon = panelIcon + 'preferences-desktop-theme.webp';
            }
            if (app.name === 'LibreOffice Writer') {
                app.dataLink = 'libreoffice_startcenter';
                app.icon = panelIcon + 'libreoffice-writer.webp';
            }
            if (app.name === 'LibreOffice') {
                app.dataLink = 'libreoffice_startcenter';
            }
            if (app.name === 'LibreOffice Draw') {
                app.dataLink = 'libreoffice_draw';
            }
            if (app.name === 'LibreOffice Impress') {
                app.dataLink = 'libreoffice_impress';
            }
            if (app.name === 'LibreOffice Calc') {
                app.dataLink = 'librecalc';
                app.icon = './assets/images/toolkits/cinnamon/apps/libreoffice-calc';
            }
            if (app.name === 'Capture d\'écran') {
                app.dataLink = 'screenshot';
            }
            if (app.name === 'Dessin') {
                app.dataLink = 'drawing';
                app.icon = './assets/images/toolkits/cinnamon/apps/com.github.maoschanz.drawing';
            }
            if (app.name === 'Gestionnaire d\'archives') {
                app.dataLink = 'file_roller';
                app.icon = './assets/images/toolkits/cinnamon/apps/org.gnome.FileRoller';
            }
            if (app.name === 'Gestionnaire de pilotes') {
                app.dataLink = 'mintdrivers';
                app.icon = './assets/images/toolkits/cinnamon/apps/mintdrivers';
            }
            if (app.name === 'Analyseur d’utilisation des disques' || app.name === 'Disk Usage Analyzer') {
                app.dataLink = 'baobab';
                app.icon = './assets/images/toolkits/cinnamon/apps/org.gnome.baobab';
            }
            if (app.name === 'Applications web' || app.name === 'Applications Web') {
                app.dataLink = 'webapp_manager';
                app.name = 'Applications Web';
                app.icon = './assets/images/toolkits/cinnamon/apps/webapp-manager';
            }
            if (app.name === 'Écran d\'accueil' || app.name === 'Écran d\'accueil Mint') {
                app.dataLink = 'mintwelcome';
                app.icon = './assets/images/toolkits/cinnamon/apps/mintwelcome';
            }
            if (app.name === 'Hypnotix') {
                app.dataLink = 'hypnotix';
            }
            if (app.name === 'Notes') {
                app.dataLink = 'sticky';
            }
            if (app.name === 'Outil de sauvegarde') {
                app.dataLink = 'mintbackup';
            }
            if (app.name === 'Renommeur de fichiers' || app.name === 'Renommer fichiers') {
                app.dataLink = 'bulky';
            }
            if (app.name === 'Messagerie Thunderbird') {
                app.dataLink = 'thunderbird';
            }
            if (app.name === 'Timeshift') {
                app.dataLink = 'timeshift';
            }
            if (app.name === 'Transmission') {
                app.dataLink = 'transmission';
            }
            if (app.name === 'Warpinator') {
                app.dataLink = 'warpinator';
            }
            if (app.name === 'Bibliothèque') {
                app.dataLink = 'thingy';
            }
            if (app.name === 'Table de caractères') {
                app.dataLink = 'gucharmap';
            }
            if (app.name === 'Numérisation de documents') {
                app.dataLink = 'simple_scan';
            }
            if (app.name === 'Rhythmbox') {
                app.dataLink = 'rhythmbox';
            }
            if (app.name === 'Disks' || app.name === 'Disques') {
                app.dataLink = 'gnome_disks';
                app.name = 'Disques';
                app.icon = './assets/images/toolkits/cinnamon/apps/org.gnome.DiskUtility';
            }
            if (app.name === 'Créateur de clé USB') {
                app.dataLink = 'mintstick';
            }
            if (app.name === 'Formateur de clé USB') {
                app.dataLink = 'mintstick_format';
            }
            if (app.name === 'Fonts' || app.name === 'Polices') {
                app.dataLink = 'font_viewer';
                app.name = 'Polices';
            }
            if (app.name === 'Lecteur vidéo' || app.name === 'Celluloid') {
                app.dataLink = 'lecteur_multimedia';
                app.icon = './assets/images/toolkits/cinnamon/apps/io.github.celluloid_player.Celluloid';
            }
            if (app.name === 'Numériseur de documents' || app.name === 'Numérisation de documents') {
                app.dataLink = 'simple_scan';
            }
            if (app.name === 'Agenda') {
                app.icon = panelIcon + 'org.gnome.Calendar.webp';
            }
        });

        var hasScreenshot = false;
        var hasPowerStats = false;
        var hasColorSelect = false;
        var ai;
        for (ai = 0; ai < MENU_APPS.length; ai++) {
            if (/^Capture d['’]écran$/.test(MENU_APPS[ai].name)) {
                hasScreenshot = true;
            }
            if (/^Statistiques d(e l)?['’]alimentation$/.test(MENU_APPS[ai].name)) {
                hasPowerStats = true;
            }
            if (MENU_APPS[ai].name === 'Sélecteur de couleur') {
                hasColorSelect = true;
            }
        }
        if (!hasScreenshot) {
            MENU_APPS.push({
                catId: 'access',
                icon: './assets/images/toolkits/cinnamon/apps/org.gnome.Screenshot',
                name: 'Capture d\'écran',
                desc: 'Prenez une photo de l\'écran',
                dataLink: 'screenshot'
            });
        }
        if (!hasPowerStats) {
            MENU_APPS.push({
                catId: 'prefs',
                icon: './assets/images/toolkits/cinnamon/apps/cinnamon-settings-power',
                name: 'Statistiques d\'alimentation',
                desc: 'Power Statistics',
                dataLink: 'power_stats'
            });
        }
        if (!hasColorSelect) {
            MENU_APPS.push({
                catId: 'access',
                icon: './assets/images/toolkits/cinnamon/apps/cinnamon-color-panel',
                name: 'Sélecteur de couleur',
                desc: 'Color selection dialog',
                dataLink: 'mate_color_select'
            });
        }
    }
})();
