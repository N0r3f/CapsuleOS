/**
 * Alias legacy Cinnamon/Mint/GNOME — même catalogue que fileExplorerCatalog.js.
 * Sur Plasma/KDE : charger fileExplorerCatalog.js uniquement (cloisonnement toolkit).
 * Remappés au runtime par CapsuleExplorerIconBase (GNOME Adwaita, KDE, …).
 */
'use strict';
const fileExplorerSystemLink = {
    'files': {
        //////////////////////////// DOSSIER ////////////////////////////////
        "Dossier_personnel": {
            "image": "./assets/icons/cinnamon/nemo/folder.png"
        },
        "Bureau": {
            "image": "./assets/icons/cinnamon/nemo/user-desktop.png"
        },
        "Documents": {
            "image": "./assets/icons/cinnamon/nemo/folder-documents.png"
        },
        "Images": {
            "image": "./assets/icons/cinnamon/nemo/folder-pictures.png"
        },
        "Musique": {
            "image": "./assets/icons/cinnamon/nemo/folder-music.png"
        },
        "Modèles": {
            "image": "./assets/icons/cinnamon/nemo/folder-templates.png"
        },
        "Public": {
            "image": "./assets/icons/cinnamon/nemo/folder-publicshare.png"
        },
        "Téléchargements": {
            "image": "./assets/icons/cinnamon/nemo/folder-download.png"
        },
        "Vidéos": {
            "image": "./assets/icons/cinnamon/nemo/folder-videos.png"
        },
        ///////////////////////////// TEXTE /////////////////////////////////
        "pdf": {
            "image": "./assets/icons/kde/mimeTypes/x-office-document.svg",
            "link": "/*.pdf"
        },
        "doc": {
            "image": "./assets/icons/kde/mimeTypes/x-office-document.svg",
            "link": "/*.docx"
        },
        "docx": {
            "image": "./assets/icons/kde/mimeTypes/x-office-document.svg",
            "link": "/*.docx"
        },
        "md": {
            "image": "./assets/icons/kde/mimeTypes/text-x-generic.svg",
            "link": "/*.md"
        },
        "txt": {
            "image": "./assets/icons/kde/mimeTypes/text-x-generic.svg",
            "link": "/*.txt"
        },
        "sh": {
            "image": "./assets/icons/kde/mimeTypes/text-x-script.svg",
            "link": "/*.sh"
        },
        "html": {
            "image": "./assets/icons/kde/mimeTypes/text-html.svg",
            "link": "/*.html"
        },
        "css": {
            "image": "./assets/icons/kde/mimeTypes/text-x-generic.svg",
            "link": "/*.css"
        },
        "js": {
            "image": "./assets/icons/kde/mimeTypes/application-x-generic.svg",
            "link": "/*.js"
        },
        "svg": {
            "image": "./assets/icons/kde/mimeTypes/image-x-generic.svg",
            "link": "/*.svg"
        },
        ///////////////////////////// AUDIO /////////////////////////////////
        "ogg": {
            "image": "./assets/icons/kde/mimeTypes/audio-x-generic.svg",
            "link": "/*.ogg"
        },
        "mp3": {
            "image": "./assets/icons/kde/mimeTypes/audio-x-generic.svg",
            "link": "/*.mp3"
        },
        "wav": {
            "image": "./assets/icons/kde/mimeTypes/audio-x-generic.svg",
            "link": "/*.wav"
        },
        ///////////////////////////// VIDEO ///////////////////////////////
        "mp4": {
            "image": "./assets/icons/kde/mimeTypes/video-x-generic.svg",
            "link": "/*.mp4"
        },
        "avi": {
            "image": "./assets/icons/kde/mimeTypes/video-x-generic.svg",
            "link": "/*.avi"
        },
        ///////////////////////////// PHOTO ///////////////////////////////
        "jpeg": {
            "image": "./assets/icons/kde/mimeTypes/image-x-generic.svg",
            "link": "/*.jpeg"
        },
        "jpg": {
            "image": "./assets/icons/kde/mimeTypes/image-x-generic.svg",
            "link": "/*.jpg"
        },
        "png": {
            "image": "./assets/icons/kde/mimeTypes/image-x-generic.svg",
            "link": "/*.png"
        },
        "webp": {
            "image": "./assets/icons/kde/mimeTypes/image-x-generic.svg",
            "link": "/*.webp"
        },
        ///////////////////// AUTRES TYPES DE LIENS ///////////////////////
        "OS": {
            "image": "../usr/share/capsuleos/assets/images/common/accueil.svg",
            "link": "../../../index.html",
            "détails": [
                "Choisir une distrib"
            ]
        },
        "linux": {
            "image": "../usr/share/capsuleos/assets/images/platforms/brands/linux.webp",
            "link": "../../../OS/linux/index.html",
            "détails": [
                "Tester une distrib Linux"
            ]
        },
        "mint": {
            "image": "../usr/share/capsuleos/assets/images/platforms/pick-os/linux/mint.png",
            "link": "../../../OS/linux/families/debian/mint/index.html",
            "détails": [
                "Tester Mint"
            ]
        },
        "apps": {
            "image": "./assets/images/toolkits/cinnamon/apps/mintinstall.png",
            "link": "../../../usr/share/capsuleos/linux/apps/mainMenu.html",
            "détails": [
                "Ouvrir la logithèque"
            ]
        },
        "system": {
            "image": "./assets/icons/cinnamon/nemo/folder.png",
            "détails": [
                "Tester Linux"
            ]
        },
        "Retour": { 
            "image": "./assets/icons/cinnamon/nemo/undo.svg"
        },
        "Parent": { 
            "image": "./assets/icons/cinnamon/nemo/undo.svg"
        },
        "Home": { 
            "image": "./assets/icons/cinnamon/nemo/user-home-symbolic.svg"
        },
        "bsd": { 
            "image": "../usr/share/capsuleos/assets/images/platforms/brands/bsd.webp",
            "link": "../../../../../OS/bsd/ghost/index.html"
        },
        "macos": { 
            "image": "../usr/share/capsuleos/assets/images/platforms/brands/macos.webp",
            "link": "../../../../../OS/macos/sonoma/index.html"
        },
        "windows": { 
            "image": "../usr/share/capsuleos/assets/images/platforms/brands/windows.webp",
            "link": "../../../../../OS/windows/index.html"
        },
    }
};

const fileSystemLink = fileExplorerSystemLink;
if (typeof window !== 'undefined') {
    window.fileExplorerSystemLink = fileExplorerSystemLink;
    window.fileSystemLink = fileSystemLink;
}
