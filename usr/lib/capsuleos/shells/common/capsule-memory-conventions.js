/**
 * CapsuleOS — conventions de profils mémoire (noyau).
 *
 * Deux niveaux principaux :
 * - PERSISTENT : choix utilisateur long terme, fichiers/dossiers créés, réglages système.
 * - SESSION    : état de fenêtre émulée, purgé à capsule:window-closed.
 *
 * Chaque application déclare ce qui relève de chaque niveau (singularité respectée).
 */
(function initCapsuleMemoryConventions(global) {
    'use strict';

    const TIERS = Object.freeze({
        PERSISTENT: 'persistent',
        SESSION: 'session',
    });

    /**
     * Catalogue documentaire par slot (data-link).
     * session / persistent : listes des domaines de données (pas des clés localStorage).
     */
    const SLOT_PROFILES = Object.freeze({
        terminal: Object.freeze({
            label: 'Terminal Ptyxis',
            session: Object.freeze([
                'onglets',
                'sortie-commandes',
                'historique-session',
                'cwd-session',
                'brouillon-commande',
            ]),
            persistent: Object.freeze([]),
        }),
        nemo: Object.freeze({
            label: 'Nautilus / explorateur',
            session: Object.freeze([
                'onglets-fenetre',
                'navigation-fenetre',
                'recherche-dossier',
                'mode-affichage-fenetre',
            ]),
            persistent: Object.freeze([
                'manifeste-dossiers',
                'corbeille',
                'favoris-nautilus',
                'fichiers-créés',
                'dossiers-créés',
            ]),
        }),
        firefox: Object.freeze({
            label: 'Firefox émulé',
            session: Object.freeze([
                'onglets',
                'historique-navigation',
                'recherches-barre-adresse',
                'état-pages',
            ]),
            persistent: Object.freeze([]),
        }),
        themes: Object.freeze({
            label: 'Paramètres apparence',
            session: Object.freeze([]),
            persistent: Object.freeze([
                'thème',
                'fond-ecran',
                'contraste',
                'échelle-police',
            ]),
        }),
        gsettings: Object.freeze({
            label: 'Réglages GNOME (gsettings)',
            session: Object.freeze([]),
            persistent: Object.freeze(['clés-gsettings-utilisateur']),
        }),
        checklist: Object.freeze({
            label: 'Missions / checklist',
            session: Object.freeze([]),
            persistent: Object.freeze(['progression-missions']),
        }),
        text_editor: Object.freeze({
            label: 'Éditeur de texte',
            session: Object.freeze(['document-ouvert-non-enregistré']),
            persistent: Object.freeze(['fichiers-enregistrés']),
        }),
    });

    function getSlotProfile(slotId) {
        return SLOT_PROFILES[slotId] || null;
    }

    function tierAllowsPurgeOnClose(tier) {
        return tier === TIERS.SESSION;
    }

    global.CapsuleMemoryConventions = {
        TIERS,
        SLOT_PROFILES,
        getSlotProfile,
        tierAllowsPurgeOnClose,
    };
}(typeof window !== 'undefined' ? window : globalThis));
