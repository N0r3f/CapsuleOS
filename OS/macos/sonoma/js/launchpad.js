// Fonction pour charger et inclure les styles CSS du menu
function loadMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `

main>section {
    display: var(--f);
    flex-flow: var(--rw);
    align-items: var(--sa);
    justify-content: var(--sa);
    width: var(--w80);
    height: var(--a);
    margin-top: calc(var(--head) / 8);
}

main>section>nav { 
    display: var(--f);
    flex-flow: var(--rnw);
    align-items: var(--c);
    justify-content: var(--c);
    width: var(--full);
    height: calc(var(--head) * 2);
    margin-top: var(--z);
}

main>section>nav>input[type="search"] {
    width: calc(var(--head) * 8);
    height: calc(var(--head) / 1.2);
    margin-top: var(--head);
    border-radius: calc(var(--head) / 6);
    border: var(--sonofoot);
    font-size: calc(var(--head) / 3);
    text-align: var(--c);
    color: var(--texte);
    background: var(--sonofoot);
    backdrop-filter: var(--blaunch);
}

main>section>nav>input[type="search"]:focus {
    outline: var(--n);
}

main>section>a {
    margin: calc(var(--head) / 1.4);
}

main>section>a,
main>section>a>figure>img {
    display: var(--f);
    flex-flow: var(--rnw);
    align-items: var(--c);
    justify-content: var(--c);
    width: calc(var(--head) * 3);
    height: calc(var(--head) * 3);
}

main>section>a>figure {
    display: var(--f);
    flex-flow: var(--cnw);
    align-items: var(--c);
    justify-content: var(--sa);
    width: var(--full);
    height: var(--full);
    font-size: calc(var(--head) / 4);
    font-weight: var(--wb);
}`;
    document.head.appendChild(style);
}

// Fonction pour créer les éléments HTML
function createMenuElements() {
    const existingMain = document.querySelector('main');
    let main;

    if (existingMain) {
        main = existingMain;
    } else {
        main = document.createElement('main');
        document.body.appendChild(main);
    }

    // Sélectionne tous les iframes #windowIframe dans le main
    const iframes = main.querySelectorAll('#windowIframe');

    // Parcourt chaque iframe
    iframes.forEach(iframe => {
        // Vérifie si le src de l'iframe est vide
        if (iframe.src === '') {
            // Trouve le conteneur parent #windowContainer et le supprime
            const container = iframe.closest('#windowContainer');
            if (container) {
                container.remove();
            }
        }
    });

    // Nettoie le contenu du main après avoir traité les iframes
    main.innerHTML = '\
    <div id="windowContainer" class="resize-drag" style="display: none; position: fixed;">\
    <div id="windowHeader">\
    <nav>\
    <button id="closeBtn"></button>\
    <button id = "minimizeBtn" ></button >\
    <button id="resizeBtn"></button>\
    </nav >\
    <span id="windowTitle"></span>\
    <nav></nav>\
    </div >\
    <iframe id="windowIframe" src="" frameborder="0" name="lien" rel="noopener noreferrer" sandbox="allow-same-origin allow-popups allow-scripts" allowfullscreen="" loading="lazy">\
    </iframe>\
    </div>';

    // Créer le premier <section> pour le champ de recherche
    const section1 = document.createElement('section');
    const nav1 = document.createElement('nav');
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = '🔍 \u00a0 Search';
    searchInput.autocapitalize = 'none';
    searchInput.autocorrect = 'off';
    nav1.appendChild(searchInput);
    section1.appendChild(nav1);
    main.appendChild(section1);

    // Créer le deuxième <section> pour les liens
    const section2 = document.createElement('section');
    addLinksToSection2(section2);
    main.appendChild(section2);
}

// Fonction pour ajouter tous les liens à la deuxième section
function addLinksToSection2(section2) {
    const linksData = [
        { href: './pages/appstore.html', target: 'lien', title: 'Accéder à l\'App store', imgSrc: './media/img/dock/appStore.png', imgAlt: 'App store', figcaption: 'App Store' },
        { href: 'https://lacapsule.org/ressources/index.php', target: 'lien', title: 'Moteur de recherche', imgSrc: './media/img/dock/safari.png', imgAlt: 'Safari', figcaption: 'Safari' },
        { href: './pages/mail.html', target: 'lien', title: 'Accéder à la boîte mail', imgSrc: './media/img/dock/mail.png', imgAlt: 'Mail', figcaption: 'Mail' },
        { href: './pages/contacts.html', target: 'lien', title: 'Accéder aux contacts', imgSrc: './media/img/dock/contacts.png', imgAlt: 'Contacts', figcaption: 'Contact' },
        { href: './pages/calendrier.html', target: 'lien', title: 'Calendrier', imgSrc: './media/img/dock/calendar.png', imgAlt: 'Calendrier', figcaption: 'Calendrier' },
        { href: './pages/reminders.html', target: 'lien', title: 'Rappel de tâches', imgSrc: './media/img/dock/reminders.png', imgAlt: 'Tâches', figcaption: 'Rappel' },
        { href: './pages/notes.html', target: 'lien', title: 'Ouvrir Notes', imgSrc: './media/img/dock/notes.png', imgAlt: 'Notes', figcaption: 'Notes' },
        { href: './pages/facetime.html', target: 'lien', title: 'Ouvrir Facetime', imgSrc: './media/img/dock/faceTime.png', imgAlt: 'Facetime', figcaption: 'Facetime' },
        { href: './pages/messages.html', target: 'lien', title: 'Ouvrir Messages', imgSrc: './media/img/dock/messages.png', imgAlt: 'Messages', figcaption: 'Messages' },
        { href: 'https://maps.google.com/maps?q=2880%20Broadway,%20Amol&t=&z=13&ie=UTF8&iwloc=&output=embed', target: 'lien', title: 'Map', imgSrc: './media/img/dock/maps.png', imgAlt: 'Ouvrir Plan', figcaption: 'Plan' },
        { href: './pages/findMy.html', target: 'lien', title: 'Localiser mon appareil', imgSrc: './media/img/dock/findMy.png', imgAlt: 'Localisation', figcaption: 'Localiser' },
        { href: './pages/photoBooth.html', target: 'lien', title: 'Photo Booth', imgSrc: './media/img/dock/photoBooth.png', imgAlt: 'Localisation', figcaption: 'Photo booth' },
        { href: './pages/photo.html', target: 'lien', title: 'Photos', imgSrc: './media/img/dock/photos.png', imgAlt: 'Galerie photos', figcaption: 'Photos' },
        { href: './pages/preview.html', target: 'lien', title: 'Preview', imgSrc: './media/img/dock/preview.png', imgAlt: 'Preview', figcaption: 'Preview' },
        { href: './pages/musique.html', target: 'lien', title: 'Musique', imgSrc: './media/img/dock/music.png', imgAlt: 'Musique', figcaption: 'Musique' },
        { href: './pages/podcast.html', target: 'lien', title: 'Podcast', imgSrc: './media/img/dock/podcasts.png', imgAlt: 'Podcast', figcaption: 'Podcast' },
        { href: './pages/tv.html', target: 'lien', title: 'TV', imgSrc: './media/img/dock/TV.png', imgAlt: 'TV', figcaption: 'TV' },
        { href: './pages/dictaphone.html', target: 'lien', title: 'Dictaphone', imgSrc: './media/img/dock/voiceMemos.png', imgAlt: 'Dictaphone', figcaption: 'Dictaphone' },
        { href: './pages/meteo.html', target: 'lien', title: 'Météo', imgSrc: './media/img/dock/weather.png', imgAlt: 'Météo', figcaption: 'Météo' },
        { href: './pages/nouvelles.html', target: 'lien', title: 'Nouvelles', imgSrc: './media/img/dock/news.png', imgAlt: 'Nouvelles', figcaption: 'Nouvelles' },
        { href: './pages/bourse.html', target: 'lien', title: 'Bourses', imgSrc: './media/img/dock/stocks.png', imgAlt: 'Bourses', figcaption: 'Bourses' },
        { href: './pages/livres.html', target: 'lien', title: 'Livres', imgSrc: './media/img/dock/books.png', imgAlt: 'Livres', figcaption: 'Livres' },
        { href: './pages/dictionnaire.html', target: 'lien', title: 'Dictionnaire', imgSrc: './media/img/dock/dictionary.png', imgAlt: 'Dictionnaire', figcaption: 'Dictionnaire' },
        { href: './pages/calculatrice.html', target: 'lien', title: 'Calculatrice', imgSrc: './media/img/dock/calculator.png', imgAlt: 'Calculatrice', figcaption: 'Calculatrice' },
        { href: './pages/freeform.html', target: 'lien', title: 'Freeform', imgSrc: './media/img/dock/freeform.png', imgAlt: 'Freeform', figcaption: 'Freeform' },
        { href: './pages/home.html', target: 'lien', title: 'Home', imgSrc: './media/img/dock/home.png', imgAlt: 'Home', figcaption: 'Home' },
        { href: './pages/horloge.html', target: 'lien', title: 'Horloge', imgSrc: './media/img/dock/clock.png', imgAlt: 'Horloge', figcaption: 'Horloge' },
        { href: './pages/siri.html', target: 'lien', title: 'Siri', imgSrc: './media/img/dock/siri.png', imgAlt: 'Siri', figcaption: 'Siri' },
        { href: './pages/parametres.html', target: 'lien', title: 'Paramètres', imgSrc: './media/img/dock/settings.png', imgAlt: 'Paramètres', figcaption: 'Paramètres' },
        { href: './pages/pages.html', target: 'lien', title: 'Pages', imgSrc: './media/img/dock/pages.png', imgAlt: 'Pages', figcaption: 'Pages' },
        { href: './pages/numbers.html', target: 'lien', title: 'Numbers', imgSrc: './media/img/dock/numbers.png', imgAlt: 'Numbers', figcaption: 'Numbers' },
        { href: './pages/keynotes.html', target: 'lien', title: 'Keynotes', imgSrc: './media/img/dock/keynote.png', imgAlt: 'Keynotes', figcaption: 'Keynotes' },
    ];

    linksData.forEach(linkData => {
        const a = document.createElement('a');
        a.href = linkData.href;
        a.target = linkData.target;
        a.title = linkData.title;

        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = linkData.imgSrc;
        img.alt = linkData.imgAlt;
        img.title = linkData.title;
        figure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = linkData.figcaption;
        figure.appendChild(figcaption);

        a.appendChild(figure);
        section2.appendChild(a);
    });
}

// Ajoutez le code d'écoute d'événements ici
document.addEventListener('DOMContentLoaded', function () {
    const launchpadLink = document.querySelector('a[href="./pages/launchpad.html"]');
    if (launchpadLink) {
        launchpadLink.addEventListener('click', function (event) {
            event.preventDefault();
            createMenuElements();
        });
    }
});

// Appeler les fonctions pour charger les styles et créer les éléments
loadMenuStyles();