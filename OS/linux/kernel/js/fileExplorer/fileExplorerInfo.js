const fileExplorerSystemLink = {
    'files': {
        //////////////////////////// DOSSIER ////////////////////////////////
        "Dossier_personnel": { 
            "image": "./media/img/elements/nemo/folder.png"
        },
        "Documents": { 
            "image": "./media/img/elements/nemo/folder-documents.png"
        },
        "Images": { 
            "image": "./media/img/elements/nemo/folder-pictures.png"
        },
        "Musique": { 
            "image": "./media/img/elements/nemo/folder-music.png"
        },
        "Public": { 
            "image": "./media/img/elements/nemo/folder-publicshare.png"
        },
        "Téléchargements": { 
            "image": "./media/img/elements/nemo/folder-download.png"
        },
        "Vidéos": { 
            "image": "./media/img/elements/nemo/folder-videos.png"
        },
        ///////////////////////////// TEXTE /////////////////////////////////
        "pdf": { 
            "image": "./media/img/mimeTypes/application-pdf.png",
            "link": "/*.pdf"
        },
        "doc": { 
            "image": "./media/img/mimeTypes/application-vnd.ms-word.png",
            "link": "/*.docx"
        },
        "txt": { 
            "image": "./media/img/mimeTypes/text-x-generic.png",
            "link": "/*.txt"
        },
        "sh": { 
            "image": "./media/img/mimeTypes/text-x-script.png",
            "link": "/*.sh"
        },
        "html": { 
            "image": "./media/img/mimeTypes/text-html.png",
            "link": "/*.html"
        },
        "css": { 
            "image": "./media/img/mimeTypes/text-css.png",
            "link": "/*.css"
        },
        "js": { 
            "image": "./media/img/mimeTypes/application-javascript.png",
            "link": "/*.js"
        },
        ///////////////////////////// AUDIO ///////////////////////////////// 
        "ogg": { 
            "image": "./media/img/mimeTypes/audio-x-generic.png",
            "link": "/*.ogg"
        },
        "mp3": { 
            "image": "./media/img/mimeTypes/audio-x-generic.png",
            "link": "/*.mp3"
        },
        "wav": { 
            "image": "./media/img/mimeTypes/audio-x-generic.png",
            "link": "/*.wav"
        },
        ///////////////////////////// VIDEO ///////////////////////////////
        "mp4": { 
            "image": "./media/img/mimeTypes/video-x-generic.png",
            "link": "/*.mp4"
        },
        "avi": { 
            "image": "./media/img/mimeTypes/video-x-generic.png",
            "link": "/*.avi"
        },
        ///////////////////////////// PHOTO ///////////////////////////////
        "jpeg": { 
            "image": "./media/img/mimeTypes/image-x-generic.png",
            "link": "/*.jpeg"
        },
        "jpg": { 
            "image": "./media/img/mimeTypes/image-x-generic.png",
            "link": "/*.jpg"
        },
        "png": { 
            "image": "./media/img/mimeTypes/image-x-generic.png",
            "link": "/*.png"
        },
        "webp": { 
            "image": "./media/img/mimeTypes/image-x-generic.png",
            "link": "/*.webp"
        },
        ///////////////////// AUTRES TYPES DE LIENS ///////////////////////
        "OS": {
            "image": "../../../../../assets/accueil.svg",
            "link": "../../../../../index.html",
            "détails": [
                "Choisir une distrib"
            ]
        },
        "linux": {
            "image": "../../../../../media/img/linux.webp",
            "link": "../../../../../OS/linux/families/debian/mint/index.html",
            "détails": [
                "Tester une distrib Linux"
            ]
        },
        "mint": {
            "image": "../../../../../media/img/Mint.png",
            "link": "../../../../../OS/linux/families/debian/mint/index.html",
            "détails": [
                "Tester Mint"
            ]
        },
        "apps": {
            "image": "./media/img/apps/mintinstall.png",
            "link": "../../../../../OS/linux/shared/apps/logithèque.html",
            "détails": [
                "Ouvrir la logithèque"
            ]
        },
        "system": {
            "image": "./media/img/elements/nemo/folder.png",
            "détails": [
                "Tester Linux"
            ]
        },
        "Retour": { 
            "image": "./media/img/elements/nemo/undo.svg"
        },
        "Parent": { 
            "image": "./media/img/elements/nemo/undo.svg"
        },
        "Home": { 
            "image": "./media/img/elements/nemo/user-home-symbolic.svg"
        },
        "bsd": { 
            "image": "../../../../../media/img/bsd.webp",
            "link": "../../../../../OS/bsd/ghost/index.html"
        },
        "macos": { 
            "image": "../../../../../media/img/macos.webp",
            "link": "../../../../../OS/macos/sonoma/index.html"
        },
        "windows": { 
            "image": "../../../../../media/img/windows.webp",
            "link": "../../../../../OS/windows/11/index.html"
        },
    }
};

const fileSystemLink = fileExplorerSystemLink;
