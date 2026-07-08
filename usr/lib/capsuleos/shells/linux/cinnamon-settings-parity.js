/**
 * Parité cinnamon-settings — contrôles VM, persistance gsettings simulée, effets shell.
 * Matrice : root/tools/lab/cinnamon-settings-parity-matrix.json
 */
(function initCinnamonSettingsParity(global) {
    'use strict';

    var MATRIX_PANELS = [
        {
            id: 'desktop',
            label: 'Bureau',
            controls: [
                { id: 'show-desktop-icons', type: 'switch', label: 'Afficher les icônes du bureau', capsuleKey: 'mint-desktop-show-icons' },
                { id: 'home-icon', type: 'switch', label: "Afficher l'icône Dossier personnel", capsuleKey: 'mint-desktop-home-icon' },
                { id: 'trash-icon', type: 'switch', label: "Afficher l'icône Corbeille", capsuleKey: 'mint-desktop-trash-icon' }
            ]
        },
        {
            id: 'effects',
            label: 'Effets',
            controls: [
                { id: 'enable-animations', type: 'switch', label: 'Activer les animations', capsuleKey: 'mint-enable-animations' }
            ]
        },
        {
            id: 'windows',
            label: 'Fenêtres',
            controls: [
                { id: 'button-layout', type: 'select', label: 'Disposition des boutons de la barre de titre', capsuleKey: 'mint-wm-button-layout', options: [
                    { value: ':minimize,maximize,close', label: 'À droite (Mint)' },
                    { value: 'close,minimize,maximize:', label: 'À gauche' }
                ]},
                { id: 'action-double-click', type: 'select', label: 'Double-clic sur la barre de titre', capsuleKey: 'mint-wm-dblclick-titlebar', options: [
                    { value: 'toggle-maximize', label: 'Agrandir / restaurer' },
                    { value: 'maximize', label: 'Agrandir' },
                    { value: 'menu', label: 'Menu contextuel' },
                    { value: 'none', label: 'Aucune action' }
                ]},
                { id: 'focus-mode', type: 'select', label: 'Mode de focus des fenêtres', capsuleKey: 'mint-wm-focus-mode', options: [
                    { value: 'click', label: 'Cliquer pour prendre le focus' },
                    { value: 'mouse', label: 'Survol pour prendre le focus' }
                ]}
            ]
        },
        {
            id: 'panel',
            label: 'Barre des tâches',
            controls: [
                { id: 'panels-height', type: 'select', label: 'Hauteur de la barre des tâches', capsuleKey: 'mint-panel-height', options: [
                    { value: '1:24', label: '24 px' },
                    { value: '1:32', label: '32 px' },
                    { value: '1:40', label: '40 px (VM)' },
                    { value: '1:48', label: '48 px' }
                ]},
                { id: 'panels-autohide', type: 'switch', label: 'Masquer automatiquement la barre des tâches', capsuleKey: 'mint-panel-autohide' }
            ]
        },
        {
            id: 'workspaces',
            label: 'Espaces de travail',
            controls: [
                { id: 'dynamic-workspaces', type: 'switch', label: 'Espaces de travail dynamiques', capsuleKey: 'mint-dynamic-workspaces' },
                { id: 'number-workspaces', type: 'select', label: "Nombre d'espaces de travail", capsuleKey: 'mint-number-workspaces', options: [
                    { value: '2', label: '2' },
                    { value: '4', label: '4' },
                    { value: '6', label: '6' }
                ]}
            ]
        },
        {
            id: 'screensaver',
            label: "Économiseur d'écran",
            controls: [
                { id: 'idle-activation', type: 'switch', label: "Activer l'économiseur d'écran", capsuleKey: 'mint-screensaver-idle' },
                { id: 'lock-delay', type: 'select', label: 'Délai avant verrouillage', capsuleKey: 'mint-screensaver-lock-delay', options: [
                    { value: '0', label: 'Immédiatement' },
                    { value: '300', label: '5 minutes' },
                    { value: '600', label: '10 minutes' }
                ]}
            ]
        },
        {
            id: 'general',
            label: 'Général',
            controls: [
                { id: 'unredirect-fullscreen', type: 'switch', label: 'Désactiver la composition pour les fenêtres plein écran', capsuleKey: 'mint-unredirect-fullscreen' }
            ]
        },
        {
            id: 'notifications',
            label: 'Notifications',
            controls: [
                { id: 'display-notifications', type: 'switch', label: 'Afficher les notifications', capsuleKey: 'mint-notifications-enabled' }
            ]
        },
        {
            id: 'sound',
            label: 'Son',
            controls: [
                { id: 'event-sounds', type: 'switch', label: "Activer les sons d'événements", capsuleKey: 'mint-event-sounds' }
            ]
        },
        {
            id: 'accessibility',
            label: 'Accessibilité',
            controls: [
                { id: 'high-contrast', type: 'switch', label: 'Contraste élevé', capsuleKey: 'mint-a11y-high-contrast' },
                { id: 'large-text', type: 'switch', label: 'Texte agrandi', capsuleKey: 'mint-a11y-large-text' }
            ]
        },
        {
            id: 'hotcorner',
            label: 'Coins intelligents',
            controls: [
                { id: 'hotcorner-tl-enable', type: 'switch', label: 'Activer le coin supérieur gauche', capsuleKey: 'mint-hotcorner-0-enabled' },
                { id: 'hotcorner-tl-action', type: 'select', label: 'Action coin supérieur gauche', capsuleKey: 'mint-hotcorner-0-action', options: [
                    { value: 'expo', label: 'Afficher tous les espaces' },
                    { value: 'scale', label: 'Afficher toutes les fenêtres' },
                    { value: 'desktop', label: 'Afficher le bureau' },
                    { value: 'none', label: 'Aucune action' }
                ]},
                { id: 'hotcorner-tr-enable', type: 'switch', label: 'Activer le coin supérieur droit', capsuleKey: 'mint-hotcorner-1-enabled' },
                { id: 'hotcorner-tr-action', type: 'select', label: 'Action coin supérieur droit', capsuleKey: 'mint-hotcorner-1-action', options: [
                    { value: 'expo', label: 'Afficher tous les espaces' },
                    { value: 'scale', label: 'Afficher toutes les fenêtres' },
                    { value: 'desktop', label: 'Afficher le bureau' },
                    { value: 'none', label: 'Aucune action' }
                ]},
                { id: 'hotcorner-bl-enable', type: 'switch', label: 'Activer le coin inférieur gauche', capsuleKey: 'mint-hotcorner-2-enabled' },
                { id: 'hotcorner-bl-action', type: 'select', label: 'Action coin inférieur gauche', capsuleKey: 'mint-hotcorner-2-action', options: [
                    { value: 'expo', label: 'Afficher tous les espaces' },
                    { value: 'scale', label: 'Afficher toutes les fenêtres' },
                    { value: 'desktop', label: 'Afficher le bureau' },
                    { value: 'none', label: 'Aucune action' }
                ]},
                { id: 'hotcorner-br-enable', type: 'switch', label: 'Activer le coin inférieur droit', capsuleKey: 'mint-hotcorner-3-enabled' },
                { id: 'hotcorner-br-action', type: 'select', label: 'Action coin inférieur droit', capsuleKey: 'mint-hotcorner-3-action', options: [
                    { value: 'expo', label: 'Afficher tous les espaces' },
                    { value: 'scale', label: 'Afficher toutes les fenêtres' },
                    { value: 'desktop', label: 'Afficher le bureau' },
                    { value: 'none', label: 'Aucune action' }
                ]}
            ]
        },
        {
            id: 'applets',
            label: 'Applets',
            controls: [
                { id: 'applet-calendar', type: 'switch', label: 'Calendrier', capsuleKey: 'mint-applet-calendar' },
                { id: 'applet-notifications', type: 'switch', label: 'Notifications', capsuleKey: 'mint-applet-notifications' },
                { id: 'applet-cornerbar', type: 'switch', label: 'Afficher le bureau', capsuleKey: 'mint-applet-cornerbar' }
            ]
        },
        {
            id: 'keyboard',
            label: 'Clavier',
            controls: [
                { id: 'key-repeat', type: 'switch', label: 'Activer la répétition des touches', capsuleKey: 'mint-kbd-repeat' },
                { id: 'numlock-state', type: 'switch', label: 'Verrouillage numérique activé', capsuleKey: 'mint-kbd-numlock' }
            ]
        },
        {
            id: 'mouse',
            label: 'Souris et pavé tactile',
            controls: [
                { id: 'left-handed', type: 'switch', label: 'Gaucher (boutons inversés)', capsuleKey: 'mint-mouse-left-handed' },
                { id: 'natural-scroll', type: 'switch', label: 'Inverser le sens de défilement', capsuleKey: 'mint-mouse-natural-scroll' }
            ]
        },
        {
            id: 'power',
            label: "Gestion de l'alimentation",
            controls: [
                { id: 'sleep-display-ac', type: 'select', label: "Éteindre l'écran après inactivité (secteur)", capsuleKey: 'mint-power-sleep-display', options: [
                    { value: '600', label: '10 minutes' },
                    { value: '1800', label: '30 minutes (VM)' },
                    { value: '0', label: 'Jamais' }
                ]},
                { id: 'button-power', type: 'select', label: "Lorsque le bouton d'alimentation est pressé", capsuleKey: 'mint-power-button-action', options: [
                    { value: 'interactive', label: 'Demander une action' },
                    { value: 'suspend', label: 'Mettre en veille' },
                    { value: 'shutdown', label: 'Éteindre' }
                ]}
            ]
        },
        {
            id: 'privacy',
            label: 'Confidentialité',
            controls: [
                { id: 'remember-recent-files', type: 'switch', label: 'Mémoriser les fichiers récemment utilisés', capsuleKey: 'mint-privacy-remember-recent' },
                { id: 'recent-files-max-age', type: 'select', label: 'Durée de mémorisation (jours)', capsuleKey: 'mint-privacy-recent-max-age', options: [
                    { value: '7', label: '7 jours (VM)' },
                    { value: '30', label: '30 jours' },
                    { value: '1', label: '1 jour' }
                ]}
            ]
        },
        {
            id: 'fonts',
            label: 'Choix des polices',
            controls: [
                { id: 'font-name', type: 'select', label: 'Police par défaut', capsuleKey: 'mint-font-interface', options: [
                    { value: 'Ubuntu 10', label: 'Ubuntu 10 (VM)' },
                    { value: 'Ubuntu 11', label: 'Ubuntu 11' },
                    { value: 'Noto Sans 10', label: 'Noto Sans 10' }
                ]},
                { id: 'antialiasing', type: 'select', label: 'Anticrénelage', capsuleKey: 'mint-font-antialiasing', options: [
                    { value: 'rgba', label: 'RGBA (VM)' },
                    { value: 'grayscale', label: 'Niveaux de gris' },
                    { value: 'none', label: 'Aucun' }
                ]}
            ]
        },
        {
            id: 'display',
            label: 'Affichage',
            controls: [
                { id: 'orientation-lock', type: 'switch', label: "Désactiver la rotation automatique de l'écran", capsuleKey: 'mint-display-orientation-lock' },
                { id: 'fractional-scale-mode', type: 'select', label: "Mode de mise à l'échelle fractionnée", capsuleKey: 'mint-display-fractional-scale', options: [
                    { value: 'scale-ui-down', label: "Réduire l'interface (VM)" },
                    { value: 'scale-up', label: 'Agrandir le contenu' }
                ]}
            ]
        },
        {
            id: 'calendar',
            label: 'Date et heure',
            controls: [
                { id: 'clock-use-24h', type: 'switch', label: 'Utiliser le format 24 h', capsuleKey: 'mint-clock-24h' },
                { id: 'clock-show-date', type: 'switch', label: 'Afficher la date', capsuleKey: 'mint-clock-show-date' },
                { id: 'clock-show-seconds', type: 'switch', label: 'Afficher les secondes', capsuleKey: 'mint-clock-show-seconds' }
            ]
        },
        {
            id: 'startup',
            label: 'Applications lancées au démarrage',
            controls: [
                { id: 'startup-firefox', type: 'switch', label: 'Firefox', capsuleKey: 'mint-startup-firefox' },
                { id: 'startup-nemo', type: 'switch', label: 'Nemo', capsuleKey: 'mint-startup-nemo' }
            ]
        },
        {
            id: 'extensions',
            label: 'Extensions',
            controls: [
                { id: 'extension-deskgrid', type: 'switch', label: 'DeskGrid (extension bureau)', capsuleKey: 'mint-extension-deskgrid' }
            ]
        },
        {
            id: 'default',
            label: 'Applications par défaut',
            controls: [
                { id: 'autorun-never', type: 'switch', label: 'Ne jamais lancer automatiquement les médias amovibles', capsuleKey: 'mint-default-autorun-never' },
                { id: 'default-terminal', type: 'select', label: 'Terminal par défaut', capsuleKey: 'mint-default-terminal', options: [
                    { value: 'gnome-terminal', label: 'Terminal GNOME (VM)' },
                    { value: 'mate-terminal', label: 'Terminal MATE' }
                ]}
            ]
        },
        {
            id: 'desklets',
            label: 'Desklets',
            controls: [
                { id: 'desklet-snap', type: 'switch', label: 'Aligner les desklets sur la grille', capsuleKey: 'mint-desklet-snap' },
                { id: 'desklet-snap-interval', type: 'select', label: 'Largeur de la grille (px)', capsuleKey: 'mint-desklet-snap-interval', options: [
                    { value: '25', label: '25 (VM)' },
                    { value: '50', label: '50' }
                ]},
                { id: 'lock-desklets', type: 'switch', label: 'Verrouiller les desklets en place', capsuleKey: 'mint-desklet-lock' }
            ]
        },
        {
            id: 'gestures',
            label: 'Gestes',
            controls: [
                { id: 'gestures-enabled', type: 'switch', label: 'Activer les gestes', capsuleKey: 'mint-gestures-enabled' }
            ]
        },
        {
            id: 'languages',
            label: 'Langues',
            controls: [
                { id: 'system-locale', type: 'select', label: 'Langue du système', capsuleKey: 'mint-locale-lang', options: [
                    { value: 'fr_FR.UTF-8', label: 'Français (VM — /etc/default/locale)' },
                    { value: 'en_US.UTF-8', label: 'English (US)' }
                ]}
            ]
        },
        {
            id: 'online-accounts',
            label: 'Comptes en ligne',
            controls: [
                { id: 'oa-whitelist-all', type: 'switch', label: 'Autoriser tous les fournisseurs en ligne', capsuleKey: 'mint-oa-whitelist-all' }
            ]
        },
        {
            id: 'user',
            label: 'Détails du compte',
            controls: [
                { id: 'account-realname', type: 'select', label: 'Nom affiché', capsuleKey: 'mint-user-realname', options: [
                    { value: 'capsule', label: 'capsule (VM)' },
                    { value: 'Utilisateur Mint', label: 'Utilisateur Mint' }
                ]}
            ]
        },
        {
            id: 'actions',
            label: 'Actions',
            controls: [
                { id: 'nemo-actions-enabled', type: 'switch', label: 'Activer les actions Nemo personnalisées', capsuleKey: 'mint-nemo-actions-enabled' }
            ]
        },
        {
            id: 'themes',
            label: 'Thèmes',
            controls: [
                { id: 'gtk-theme', type: 'select', label: 'Thème GTK', capsuleKey: 'mint-gtk-theme', options: [
                    { value: 'Mint-Y-Dark-Aqua', label: 'Mint-Y-Dark-Aqua (VM)' },
                    { value: 'Mint-Y-Aqua', label: 'Mint-Y-Aqua' }
                ]},
                { id: 'icon-theme', type: 'select', label: 'Thème des icônes', capsuleKey: 'mint-icon-theme', options: [
                    { value: 'Mint-Y-Sand', label: 'Mint-Y-Sand (VM)' },
                    { value: 'Mint-X', label: 'Mint-X' }
                ]}
            ]
        },
        {
            id: 'backgrounds',
            label: "Fonds d'écran",
            controls: [
                { id: 'picture-options', type: 'select', label: 'Style du fond', capsuleKey: 'mint-bg-picture-options', options: [
                    { value: 'zoom', label: 'Zoom (VM)' },
                    { value: 'scaled', label: "Mis à l'échelle" }
                ]},
                { id: 'picture-opacity', type: 'select', label: 'Opacité du fond (%)', capsuleKey: 'mint-bg-picture-opacity', options: [
                    { value: '100', label: '100 (VM)' },
                    { value: '80', label: '80' }
                ]}
            ]
        },
        {
            id: 'nightlight',
            label: 'Éclairage nocturne',
            controls: [
                { id: 'night-light-enabled', type: 'switch', label: "Activer l'éclairage nocturne", capsuleKey: 'mint-night-light-enabled' }
            ]
        },
        {
            id: 'input-method',
            label: 'Méthode de saisie',
            controls: [
                { id: 'input-per-window', type: 'switch', label: 'Disposition différente pour chaque fenêtre', capsuleKey: 'mint-input-per-window' },
                { id: 'input-show-all', type: 'switch', label: 'Afficher toutes les sources de saisie', capsuleKey: 'mint-input-show-all' }
            ]
        },
        {
            id: 'software-sources',
            label: 'Sources de logiciels',
            controls: [
                { id: 'search-in-category', type: 'switch', label: 'Rechercher dans la catégorie', capsuleKey: 'mint-install-search-category' },
                { id: 'allow-unverified-flatpaks', type: 'switch', label: 'Autoriser les Flatpak non vérifiés', capsuleKey: 'mint-install-unverified-flatpaks' }
            ]
        },
        {
            id: 'system-info',
            label: 'Informations système',
            controls: [
                { id: 'report-automonitor', type: 'switch', label: 'Surveillance automatique du matériel', capsuleKey: 'mint-report-automonitor' },
                { id: 'report-autorefresh', type: 'switch', label: 'Actualisation automatique du rapport', capsuleKey: 'mint-report-autorefresh' }
            ]
        },
        {
            id: 'bluetooth',
            label: 'Bluetooth',
            controls: [
                { id: 'bluetooth-nap', type: 'switch', label: 'Partage de connexion réseau (NAP)', capsuleKey: 'mint-bluetooth-nap' }
            ]
        },
        {
            id: 'color',
            label: 'Couleur',
            controls: [
                { id: 'recalibrate-display', type: 'select', label: 'Seuil recalibrage écran', capsuleKey: 'mint-color-recalibrate-display', options: [
                    { value: '0', label: '0 (VM)' },
                    { value: '100', label: '100' }
                ]},
                { id: 'recalibrate-printer', type: 'select', label: 'Seuil recalibrage imprimante', capsuleKey: 'mint-color-recalibrate-printer', options: [
                    { value: '0', label: '0 (VM)' },
                    { value: '100', label: '100' }
                ]}
            ]
        },
        {
            id: 'network',
            label: 'Réseau',
            controls: [
                { id: 'proxy-mode', type: 'select', label: 'Mode proxy système', capsuleKey: 'mint-proxy-mode', options: [
                    { value: 'none', label: 'Aucun (VM)' },
                    { value: 'manual', label: 'Manuel' },
                    { value: 'auto', label: 'Automatique' }
                ]},
                { id: 'nm-show-applet', type: 'switch', label: "Afficher l'applet réseau", capsuleKey: 'mint-nm-show-applet' }
            ]
        },
        {
            id: 'printers',
            label: 'Imprimantes',
            controls: [
                { id: 'applet-printers', type: 'switch', label: 'Applet imprimantes dans le panneau', capsuleKey: 'mint-applet-printers' },
                { id: 'lockdown-printing', type: 'switch', label: "Désactiver l'impression", capsuleKey: 'mint-lockdown-disable-printing' }
            ]
        },
        {
            id: 'firewall',
            label: 'Pare-feu',
            controls: [
                { id: 'ufw-enabled', type: 'switch', label: 'Activer le pare-feu (UFW)', capsuleKey: 'mint-ufw-enabled' },
                { id: 'ufw-logging', type: 'select', label: 'Niveau de journalisation UFW', capsuleKey: 'mint-ufw-logging', options: [
                    { value: 'low', label: 'Faible (VM)' },
                    { value: 'medium', label: 'Moyen' }
                ]}
            ]
        },
        {
            id: 'thunderbolt',
            label: 'Thunderbolt',
            controls: [
                { id: 'bolt-auth-mode', type: 'select', label: "Mode d'authentification Bolt", capsuleKey: 'mint-thunderbolt-auth-mode', options: [
                    { value: 'enabled', label: 'Activé (VM)' },
                    { value: 'disabled', label: 'Désactivé' }
                ]}
            ]
        }
    ];

    var WIRED_PANELS = {};
    var pi;
    for (pi = 0; pi < MATRIX_PANELS.length; pi += 1) {
        WIRED_PANELS[MATRIX_PANELS[pi].id] = true;
    }

    function gs() {
        return global.CapsuleCinnamonGSettings;
    }

    function isMint() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function hasRealPanel(panelId) {
        if (panelId === 'themes') {
            return false;
        }
        return Boolean(WIRED_PANELS[panelId]);
    }

    function setSwitchUi(toggle, on) {
        toggle.setAttribute('aria-checked', on ? 'true' : 'false');
        toggle.classList.toggle('is-on', on);
    }

    function applyWindowAnimations(on) {
        if (!global.document || !global.document.body) {
            return;
        }
        global.document.body.dataset.capsuleAnimations = on ? 'on' : 'off';
        dispatch('capsule:window-animations-changed', { enabled: on });
    }

    function applyDesktopIconsVisibility(on) {
        var container = global.document.querySelector('.desktop-shortcuts');
        if (container) {
            container.style.display = on ? '' : 'none';
            container.setAttribute('aria-hidden', on ? 'false' : 'true');
        }
        dispatch('capsule:desktop-icons-visibility-changed', { visible: on });
    }

    function applyDesktopIconKind(kind, on) {
        var shortcut = global.document.querySelector('.desktop-shortcut[data-desktop-icon="' + kind + '"]');
        if (!shortcut) {
            return;
        }
        shortcut.hidden = !on;
        shortcut.setAttribute('aria-hidden', on ? 'false' : 'true');
        dispatch('capsule:desktop-icon-kind-changed', { kind: kind, visible: on });
    }

    function applyPanelHeight(token) {
        var m = String(token || '1:40').match(/:(\d+)/);
        var px = m ? m[1] + 'px' : '40px';
        if (global.document && global.document.body) {
            global.document.body.style.setProperty('--mint-panel-height', px);
            global.document.body.style.setProperty('--taskbar-height', px);
        }
        dispatch('capsule:panel-height-changed', { heightPx: parseInt(px, 10) });
    }

    function applyPanelAutohide(on) {
        var footer = global.document.querySelector('footer.taskbar, footer#taskbar, footer nav');
        var bar = footer && footer.closest('footer') ? footer.closest('footer') : global.document.querySelector('footer');
        if (bar) {
            bar.classList.toggle('mint-panel--autohide', on);
            bar.dataset.panelAutohide = on ? 'true' : 'false';
        }
        dispatch('capsule:panel-autohide-changed', { autohide: on });
    }

    function applyWindowButtonLayout(layout) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleButtonLayout = layout;
        }
        dispatch('capsule:wm-button-layout-changed', { layout: layout });
    }

    function applyWmDoubleClick(action) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleDblclickTitlebar = action;
        }
        dispatch('capsule:wm-dblclick-titlebar-changed', { action: action });
    }

    function applyWmFocusMode(mode) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleFocusMode = mode;
        }
        dispatch('capsule:wm-focus-mode-changed', { mode: mode });
    }

    function applyDynamicWorkspaces(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleDynamicWorkspaces = on ? 'true' : 'false';
        }
        dispatch('capsule:dynamic-workspaces-changed', { dynamic: on });
    }

    function applyNumberWorkspaces(n) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleWorkspaceCount = String(n);
        }
        dispatch('capsule:number-workspaces-changed', { count: Number(n) });
    }

    function applyScreensaverIdle(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleScreensaverIdle = on ? 'true' : 'false';
        }
        dispatch('capsule:screensaver-idle-changed', { idle: on });
    }

    function applyScreensaverLockDelay(seconds) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleLockDelay = String(seconds);
        }
        dispatch('capsule:screensaver-lock-delay-changed', { delaySeconds: Number(seconds) });
    }

    function applyUnredirectFullscreen(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleUnredirectFullscreen = on ? 'true' : 'false';
        }
    }

    function applyNotificationsEnabled(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleNotificationsEnabled = on ? 'true' : 'false';
        }
        dispatch('capsule:notifications-enabled-changed', { enabled: on });
    }

    function applyEventSounds(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleEventSounds = on ? 'on' : 'off';
        }
        dispatch('capsule:event-sounds-changed', { enabled: on });
    }

    function applyA11yHighContrast(on) {
        var storage = global.CapsuleThemeStorage;
        if (storage && typeof storage.applyContrastMode === 'function') {
            storage.applyContrastMode(on ? 'high' : 'normal');
        } else if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.contrastMode = on ? 'high' : 'normal';
        }
        dispatch('capsule:a11y-contrast-changed', { high: on });
    }

    function applyA11yLargeText(on) {
        var storage = global.CapsuleThemeStorage;
        if (storage && typeof storage.applyFontScale === 'function') {
            storage.applyFontScale(on ? '125' : '100');
        } else if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.fontScale = on ? '125' : '100';
        }
        dispatch('capsule:a11y-font-scale-changed', { large: on });
    }

    function applyHotcornerLayout() {
        dispatch('capsule:hotcorner-layout-changed', {});
    }

    function applyAppletVisibility() {
        dispatch('capsule:applet-visibility-changed', {});
    }

    function applyKeyboardRepeat(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleKbdRepeat = on ? 'on' : 'off';
        }
        dispatch('capsule:keyboard-repeat-changed', { enabled: on });
    }

    function applyKeyboardNumlock(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleNumlock = on ? 'on' : 'off';
        }
        dispatch('capsule:keyboard-numlock-changed', { enabled: on });
    }

    function applyMouseLeftHanded(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleMouseLeftHanded = on ? 'true' : 'false';
        }
        dispatch('capsule:mouse-left-handed-changed', { leftHanded: on });
    }

    function applyMouseNaturalScroll(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleNaturalScroll = on ? 'true' : 'false';
        }
        dispatch('capsule:mouse-natural-scroll-changed', { naturalScroll: on });
    }

    function applyPowerSleepDisplay(seconds) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleSleepDisplayAc = String(seconds);
        }
        dispatch('capsule:power-sleep-display-changed', { seconds: Number(seconds) });
    }

    function applyPowerButtonAction(action) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleButtonPower = action;
        }
        dispatch('capsule:power-button-action-changed', { action: action });
    }

    function applyPrivacyRememberRecent(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleRememberRecent = on ? 'true' : 'false';
        }
        dispatch('capsule:privacy-remember-recent-changed', { enabled: on });
    }

    function applyPrivacyRecentMaxAge(days) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleRecentMaxAge = String(days);
        }
        dispatch('capsule:privacy-recent-max-age-changed', { days: Number(days) });
    }

    function applyInterfaceFont(fontName) {
        var mint = global.document.getElementById('mint');
        if (mint) {
            mint.style.fontFamily = '"' + String(fontName).replace(/"/g, '') + '", sans-serif';
        }
        if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.capsuleInterfaceFont = fontName;
        }
        dispatch('capsule:interface-font-changed', { font: fontName });
    }

    function applyFontAntialiasing(mode) {
        if (global.document && global.document.documentElement) {
            global.document.documentElement.dataset.capsuleAntialiasing = mode;
        }
        dispatch('capsule:font-antialiasing-changed', { mode: mode });
    }

    function applyDisplayOrientationLock(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleOrientationLock = on ? 'true' : 'false';
        }
        dispatch('capsule:display-orientation-lock-changed', { locked: on });
    }

    function applyDisplayFractionalScale(mode) {
        var storage = global.CapsuleThemeStorage;
        if (storage && typeof storage.applyDisplayScale === 'function') {
            storage.applyDisplayScale(mode === 'scale-ui-down' ? '125 %' : '100 %');
        }
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleFractionalScale = mode;
        }
        dispatch('capsule:display-fractional-scale-changed', { mode: mode });
    }

    function applyClockUse24h(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleClockUse24h = on ? 'true' : 'false';
        }
        dispatch('capsule:clock-format-changed', {});
    }

    function applyClockShowDate(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleClockShowDate = on ? 'true' : 'false';
        }
        dispatch('capsule:clock-format-changed', {});
    }

    function applyClockShowSeconds(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleClockShowSeconds = on ? 'true' : 'false';
        }
        dispatch('capsule:clock-format-changed', {});
    }

    function applyStartupApps() {
        dispatch('capsule:startup-apps-changed', {});
    }

    function applyExtensionsEnabled() {
        dispatch('capsule:extensions-enabled-changed', {});
    }

    function applyDefaultAutorunNever(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleAutorunNever = on ? 'true' : 'false';
        }
        dispatch('capsule:default-apps-changed', {});
    }

    function applyDefaultTerminal(exec) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleDefaultTerminal = exec || 'gnome-terminal';
        }
        dispatch('capsule:default-apps-changed', {});
    }

    function applyDeskletSnap(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleDeskletSnap = on ? 'true' : 'false';
        }
        dispatch('capsule:desklets-changed', {});
    }

    function applyDeskletSnapInterval(px) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleDeskletSnapInterval = String(px || '25');
        }
        dispatch('capsule:desklets-changed', {});
    }

    function applyDeskletLock(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleDeskletLock = on ? 'true' : 'false';
        }
        dispatch('capsule:desklets-changed', {});
    }

    function applyGesturesEnabled(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleGesturesEnabled = on ? 'true' : 'false';
        }
        dispatch('capsule:gestures-changed', {});
    }

    function applySystemLocale(lang) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleSystemLocale = lang || 'fr_FR.UTF-8';
        }
        dispatch('capsule:locale-changed', {});
    }

    function applyOnlineAccountsWhitelist() {
        dispatch('capsule:online-accounts-changed', {});
    }

    function applyUserRealname(name) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleUserRealname = name || 'capsule';
        }
        dispatch('capsule:user-account-changed', {});
    }

    function applyNemoActionsEnabled(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleNemoActionsEnabled = on ? 'true' : 'false';
        }
        dispatch('capsule:nemo-actions-changed', {});
    }

    function applyGtkTheme(theme) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleGtkTheme = theme || 'Mint-Y-Dark-Aqua';
        }
        if (global.document && global.document.documentElement) {
            var isDark = !theme || String(theme).indexOf('Dark') >= 0;
            global.document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
            var storage = global.CapsuleThemeStorage;
            if (storage && typeof storage.persistTheme === 'function') {
                storage.persistTheme(isDark ? 'dark' : 'light', global.document.body ? global.document.body.id : '');
            }
        }
        dispatch('capsule:gtk-theme-changed', { theme: theme });
        dispatch('capsule:gnome-theme-changed', { theme: global.document.documentElement.dataset.theme });
    }

    function applyIconTheme(theme) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleIconTheme = theme || 'Mint-Y-Sand';
        }
        dispatch('capsule:icon-theme-changed', { theme: theme });
    }

    function applyBgPictureOptions(mode) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleBgPictureOptions = mode || 'zoom';
        }
        dispatch('capsule:background-gsettings-changed', {});
    }

    function applyBgPictureOpacity(opacity) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleBgPictureOpacity = String(opacity || '100');
        }
        dispatch('capsule:background-gsettings-changed', {});
    }

    function applyNightLightEnabled(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleNightLightEnabled = on ? 'true' : 'false';
        }
        dispatch('capsule:nightlight-changed', {});
    }

    function applyInputPerWindow(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleInputPerWindow = on ? 'true' : 'false';
        }
        dispatch('capsule:input-method-changed', {});
    }

    function applyInputShowAllSources(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleInputShowAll = on ? 'true' : 'false';
        }
        dispatch('capsule:input-method-changed', {});
    }

    function applyInstallSearchCategory(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleInstallSearchCategory = on ? 'true' : 'false';
        }
        dispatch('capsule:install-settings-changed', {});
    }

    function applyInstallUnverifiedFlatpaks(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleInstallUnverifiedFlatpaks = on ? 'true' : 'false';
        }
        dispatch('capsule:install-settings-changed', {});
    }

    function applyReportAutomonitor(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleReportAutomonitor = on ? 'true' : 'false';
        }
        dispatch('capsule:system-report-changed', {});
    }

    function applyReportAutorefresh(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleReportAutorefresh = on ? 'true' : 'false';
        }
        dispatch('capsule:system-report-changed', {});
    }

    function applyBluetoothNap(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleBluetoothNap = on ? 'true' : 'false';
        }
        dispatch('capsule:bluetooth-changed', {});
    }

    function applyColorRecalibrateDisplay(value) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleColorRecalibrateDisplay = String(value || '0');
        }
        dispatch('capsule:color-calibration-changed', {});
    }

    function applyColorRecalibratePrinter(value) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleColorRecalibratePrinter = String(value || '0');
        }
        dispatch('capsule:color-calibration-changed', {});
    }

    function applyProxyMode(mode) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleProxyMode = mode || 'none';
        }
        dispatch('capsule:network-proxy-changed', {});
    }

    function applyNmShowApplet(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleNmShowApplet = on ? 'true' : 'false';
        }
        dispatch('capsule:nm-applet-changed', {});
    }

    function applyLockdownDisablePrinting(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleLockdownDisablePrinting = on ? 'true' : 'false';
        }
        dispatch('capsule:lockdown-printing-changed', {});
    }

    function applyUfwEnabled(on) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleUfwEnabled = on ? 'true' : 'false';
        }
        dispatch('capsule:ufw-changed', {});
    }

    function applyUfwLogging(level) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleUfwLogging = level || 'low';
        }
        dispatch('capsule:ufw-changed', {});
    }

    function applyThunderboltAuthMode(mode) {
        if (global.document && global.document.body) {
            global.document.body.dataset.capsuleThunderboltAuthMode = mode || 'enabled';
        }
        dispatch('capsule:thunderbolt-changed', {});
    }

    function dispatch(name, detail) {
        if (typeof global.document !== 'undefined') {
            global.document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
        }
    }

    var EFFECT_HANDLERS = {
        'mint-desktop-show-icons': function (v) { applyDesktopIconsVisibility(v === 'on'); },
        'mint-desktop-home-icon': function (v) { applyDesktopIconKind('home', v === 'on'); },
        'mint-desktop-trash-icon': function (v) { applyDesktopIconKind('trash', v === 'on'); },
        'mint-enable-animations': function (v) { applyWindowAnimations(v === 'on'); },
        'mint-panel-height': function (v) { applyPanelHeight(v); },
        'mint-panel-autohide': function (v) { applyPanelAutohide(v === 'on'); },
        'mint-wm-button-layout': function (v) { applyWindowButtonLayout(v); },
        'mint-wm-dblclick-titlebar': function (v) { applyWmDoubleClick(v); },
        'mint-wm-focus-mode': function (v) { applyWmFocusMode(v); },
        'mint-dynamic-workspaces': function (v) { applyDynamicWorkspaces(v === 'on'); },
        'mint-number-workspaces': function (v) { applyNumberWorkspaces(v); },
        'mint-screensaver-idle': function (v) { applyScreensaverIdle(v === 'on'); },
        'mint-screensaver-lock-delay': function (v) { applyScreensaverLockDelay(v); },
        'mint-unredirect-fullscreen': function (v) { applyUnredirectFullscreen(v === 'on'); },
        'mint-notifications-enabled': function (v) { applyNotificationsEnabled(v === 'on'); },
        'mint-event-sounds': function (v) { applyEventSounds(v === 'on'); },
        'mint-a11y-high-contrast': function (v) { applyA11yHighContrast(v === 'on'); },
        'mint-a11y-large-text': function (v) { applyA11yLargeText(v === 'on'); },
        'mint-hotcorner-0-enabled': applyHotcornerLayout,
        'mint-hotcorner-0-action': applyHotcornerLayout,
        'mint-hotcorner-1-enabled': applyHotcornerLayout,
        'mint-hotcorner-1-action': applyHotcornerLayout,
        'mint-hotcorner-2-enabled': applyHotcornerLayout,
        'mint-hotcorner-2-action': applyHotcornerLayout,
        'mint-hotcorner-3-enabled': applyHotcornerLayout,
        'mint-hotcorner-3-action': applyHotcornerLayout,
        'mint-applet-calendar': applyAppletVisibility,
        'mint-applet-notifications': applyAppletVisibility,
        'mint-applet-cornerbar': applyAppletVisibility,
        'mint-kbd-repeat': function (v) { applyKeyboardRepeat(v === 'on'); },
        'mint-kbd-numlock': function (v) { applyKeyboardNumlock(v === 'on'); },
        'mint-mouse-left-handed': function (v) { applyMouseLeftHanded(v === 'on'); },
        'mint-mouse-natural-scroll': function (v) { applyMouseNaturalScroll(v === 'on'); },
        'mint-power-sleep-display': function (v) { applyPowerSleepDisplay(v); },
        'mint-power-button-action': function (v) { applyPowerButtonAction(v); },
        'mint-privacy-remember-recent': function (v) { applyPrivacyRememberRecent(v === 'on'); },
        'mint-privacy-recent-max-age': function (v) { applyPrivacyRecentMaxAge(v); },
        'mint-font-interface': function (v) { applyInterfaceFont(v); },
        'mint-font-antialiasing': function (v) { applyFontAntialiasing(v); },
        'mint-display-orientation-lock': function (v) { applyDisplayOrientationLock(v === 'on'); },
        'mint-display-fractional-scale': function (v) { applyDisplayFractionalScale(v); },
        'mint-clock-24h': function (v) { applyClockUse24h(v === 'on'); },
        'mint-clock-show-date': function (v) { applyClockShowDate(v === 'on'); },
        'mint-clock-show-seconds': function (v) { applyClockShowSeconds(v === 'on'); },
        'mint-startup-firefox': applyStartupApps,
        'mint-startup-nemo': applyStartupApps,
        'mint-extension-deskgrid': applyExtensionsEnabled,
        'mint-default-autorun-never': function (v) { applyDefaultAutorunNever(v === 'on'); },
        'mint-default-terminal': applyDefaultTerminal,
        'mint-desklet-snap': function (v) { applyDeskletSnap(v === 'on'); },
        'mint-desklet-snap-interval': applyDeskletSnapInterval,
        'mint-desklet-lock': function (v) { applyDeskletLock(v === 'on'); },
        'mint-gestures-enabled': function (v) { applyGesturesEnabled(v === 'on'); },
        'mint-locale-lang': applySystemLocale,
        'mint-oa-whitelist-all': applyOnlineAccountsWhitelist,
        'mint-user-realname': applyUserRealname,
        'mint-nemo-actions-enabled': function (v) { applyNemoActionsEnabled(v === 'on'); },
        'mint-gtk-theme': applyGtkTheme,
        'mint-icon-theme': applyIconTheme,
        'mint-bg-picture-options': applyBgPictureOptions,
        'mint-bg-picture-opacity': applyBgPictureOpacity,
        'mint-night-light-enabled': function (v) { applyNightLightEnabled(v === 'on'); },
        'mint-input-per-window': function (v) { applyInputPerWindow(v === 'on'); },
        'mint-input-show-all': function (v) { applyInputShowAllSources(v === 'on'); },
        'mint-install-search-category': function (v) { applyInstallSearchCategory(v === 'on'); },
        'mint-install-unverified-flatpaks': function (v) { applyInstallUnverifiedFlatpaks(v === 'on'); },
        'mint-report-automonitor': function (v) { applyReportAutomonitor(v === 'on'); },
        'mint-report-autorefresh': function (v) { applyReportAutorefresh(v === 'on'); },
        'mint-bluetooth-nap': function (v) { applyBluetoothNap(v === 'on'); },
        'mint-color-recalibrate-display': applyColorRecalibrateDisplay,
        'mint-color-recalibrate-printer': applyColorRecalibratePrinter,
        'mint-proxy-mode': applyProxyMode,
        'mint-nm-show-applet': function (v) { applyNmShowApplet(v === 'on'); },
        'mint-applet-printers': applyAppletVisibility,
        'mint-lockdown-disable-printing': function (v) { applyLockdownDisablePrinting(v === 'on'); },
        'mint-ufw-enabled': function (v) { applyUfwEnabled(v === 'on'); },
        'mint-ufw-logging': applyUfwLogging,
        'mint-thunderbolt-auth-mode': applyThunderboltAuthMode
    };

    function applyCapsuleKey(capsuleKey, value) {
        var store = gs();
        if (store) {
            store.setCapsule(capsuleKey, value);
        }
        if (EFFECT_HANDLERS[capsuleKey]) {
            EFFECT_HANDLERS[capsuleKey](value);
        }
    }

    function syncControlFromStore(controlEl) {
        var store = gs();
        if (!store || !controlEl) {
            return;
        }
        var capsuleKey = controlEl.getAttribute('data-cs-capsule-key');
        if (!capsuleKey) {
            return;
        }
        if (controlEl.classList.contains('cs-switch')) {
            setSwitchUi(controlEl, store.getBool(capsuleKey, true));
            return;
        }
        if (controlEl.tagName === 'SELECT') {
            var val = store.getCapsule(capsuleKey, controlEl.options[0] ? controlEl.options[0].value : '');
            controlEl.value = val;
        }
    }

    function buildSwitchRow(ctrl) {
        var row = global.document.createElement('div');
        row.className = 'cs-row cs-row--parity';
        var span = global.document.createElement('span');
        span.className = 'cs-row__label';
        span.textContent = ctrl.label;
        var sw = global.document.createElement('button');
        sw.type = 'button';
        sw.className = 'cs-switch';
        sw.setAttribute('role', 'switch');
        sw.setAttribute('data-cs-capsule-key', ctrl.capsuleKey);
        sw.setAttribute('aria-checked', 'false');
        row.appendChild(span);
        row.appendChild(sw);
        return row;
    }

    function buildSelectRow(ctrl) {
        var row = global.document.createElement('div');
        row.className = 'cs-row cs-row--parity cs-row--select';
        var span = global.document.createElement('span');
        span.className = 'cs-row__label';
        span.textContent = ctrl.label;
        var select = global.document.createElement('select');
        select.className = 'cs-select';
        select.setAttribute('data-cs-capsule-key', ctrl.capsuleKey);
        var oi;
        for (oi = 0; oi < (ctrl.options || []).length; oi += 1) {
            var opt = global.document.createElement('option');
            opt.value = ctrl.options[oi].value;
            opt.textContent = ctrl.options[oi].label;
            select.appendChild(opt);
        }
        row.appendChild(span);
        row.appendChild(select);
        return row;
    }

    function findMatrixPanel(panelId) {
        var i;
        for (i = 0; i < MATRIX_PANELS.length; i += 1) {
            if (MATRIX_PANELS[i].id === panelId) {
                return MATRIX_PANELS[i];
            }
        }
        return null;
    }

    function buildPanel(panelsRoot, panelId, label) {
        var spec = findMatrixPanel(panelId);
        if (!spec) {
            return null;
        }
        var existing = panelsRoot.querySelector('[data-cs-panel="' + panelId + '"]');
        if (existing && existing.dataset.csParityBuilt === 'true') {
            return existing;
        }
        if (existing) {
            existing.remove();
        }
        var section = global.document.createElement('section');
        section.className = 'cs-panel cs-panel--parity';
        section.setAttribute('data-cs-panel', panelId);
        section.setAttribute('data-cs-parity-built', 'true');
        section.dataset.csParityBuilt = 'true';
        section.setAttribute('hidden', 'hidden');
        section.setAttribute('aria-label', label || spec.label);
        var ci;
        for (ci = 0; ci < spec.controls.length; ci += 1) {
            var ctrl = spec.controls[ci];
            section.appendChild(ctrl.type === 'select' ? buildSelectRow(ctrl) : buildSwitchRow(ctrl));
        }
        if (panelId === 'backgrounds') {
            section.classList.add('cs-backgrounds');
            var ui = global.CapsuleCinnamonSettingsUi;
            if (ui && typeof ui.appendBackgroundsWallpaperPicker === 'function') {
                ui.appendBackgroundsWallpaperPicker(section);
            }
        }
        panelsRoot.appendChild(section);
        return section;
    }

    function bindControls(root) {
        if (!root) {
            return;
        }
        root.querySelectorAll('.cs-switch[data-cs-capsule-key]').forEach(function (toggle) {
            if (toggle.dataset.csParityBound === 'true') {
                syncControlFromStore(toggle);
                return;
            }
            toggle.dataset.csParityBound = 'true';
            syncControlFromStore(toggle);
            toggle.addEventListener('click', function () {
                var on = toggle.getAttribute('aria-checked') !== 'true';
                setSwitchUi(toggle, on);
                applyCapsuleKey(toggle.getAttribute('data-cs-capsule-key'), on ? 'on' : 'off');
            });
        });
        root.querySelectorAll('select.cs-select[data-cs-capsule-key]').forEach(function (select) {
            if (select.dataset.csParityBound === 'true') {
                syncControlFromStore(select);
                return;
            }
            select.dataset.csParityBound = 'true';
            syncControlFromStore(select);
            select.addEventListener('change', function () {
                applyCapsuleKey(select.getAttribute('data-cs-capsule-key'), select.value);
            });
        });
    }

    function applyAllEffectsFromStore() {
        var store = gs();
        if (!store) {
            return;
        }
        Object.keys(EFFECT_HANDLERS).forEach(function (capsuleKey) {
            var binding = store.getBinding(capsuleKey);
            var fallback = 'off';
            if (binding && binding.map === 'uint32') {
                fallback = '4';
            }
            if (binding && binding.map === 'panelsHeight') {
                fallback = '1:40';
            }
            if (binding && binding.map === 'buttonLayout') {
                fallback = ':minimize,maximize,close';
            }
            EFFECT_HANDLERS[capsuleKey](store.getCapsule(capsuleKey, fallback));
        });
    }

    function syncAll(root) {
        if (!root) {
            return;
        }
        bindControls(root);
    }

    function initOnBoot() {
        if (!isMint()) {
            return;
        }
        var store = gs();
        if (store && typeof store.seedBaseline === 'function') {
            store.seedBaseline();
        }
        applyAllEffectsFromStore();
        global.document.addEventListener('capsule:cinnamon-gsettings-changed', function () {
            applyAllEffectsFromStore();
        });
    }

    global.CapsuleCinnamonSettingsParity = {
        hasRealPanel: hasRealPanel,
        buildPanel: buildPanel,
        bindControls: bindControls,
        syncAll: syncAll,
        applyAllEffectsFromStore: applyAllEffectsFromStore,
        applyCapsuleKey: applyCapsuleKey,
        wiredPanelIds: Object.keys(WIRED_PANELS)
    };

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', initOnBoot);
        } else {
            initOnBoot();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
