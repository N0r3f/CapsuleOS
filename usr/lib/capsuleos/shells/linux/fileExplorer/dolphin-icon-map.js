/**
 * Icônes Dolphin/KDE centralisées (usr/share/capsuleos/assets/icons/kde).
 * Préfixe logique ./icons/kde/ résolu via CapsuleResource.resolve().
 */
(function initCapsuleDolphinIconMap(global) {
    'use strict';

    const KDE = './icons/kde';
    const PLACES = `${KDE}/places32`;
    const GENERIC_FILE = `${KDE}/mimeTypes/application-x-generic.svg`;

    global.CAPSULE_FILE_EXPLORER_ICON_MAP = {
        folder: `${PLACES}/folder.svg`,
        Dossier_personnel: `${PLACES}/folder.svg`,
        Bureau: `${PLACES}/user-desktop.svg`,
        Documents: `${PLACES}/folder-documents.svg`,
        Images: `${PLACES}/folder-pictures.svg`,
        Musique: `${PLACES}/folder-sound.svg`,
        Public: `${PLACES}/folder-publicshare.svg`,
        'Téléchargements': `${PLACES}/folder-download.svg`,
        'Vidéos': `${PLACES}/folder-videos.svg`,
        'Modèles': `${PLACES}/folder-templates.svg`,
        file: GENERIC_FILE,
        pdf: GENERIC_FILE,
        doc: GENERIC_FILE,
        txt: GENERIC_FILE,
        sh: GENERIC_FILE,
        html: GENERIC_FILE,
        css: GENERIC_FILE,
        js: GENERIC_FILE,
        ogg: GENERIC_FILE,
        mp3: GENERIC_FILE,
        wav: GENERIC_FILE,
        mp4: GENERIC_FILE,
        avi: GENERIC_FILE,
        jpeg: GENERIC_FILE,
        jpg: GENERIC_FILE,
        png: GENERIC_FILE,
        webp: GENERIC_FILE
    };
}(typeof window !== 'undefined' ? window : globalThis));
