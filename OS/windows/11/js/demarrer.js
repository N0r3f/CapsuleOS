
// Fonction pour charger et inclure les styles CSS du menu
function loadMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
    html {
        width: var(--full);
        height: var(--full);
        margin: var(--z);
        height: var(--z);
        color: var(--texte);
    }
    
    section {
        display: var(--f);
        flex-flow: var(--cnw);
        align-items: var(--c);
        justify-content: var(--c);
        width: var(--full);
        height: var(--full);
        border-radius: calc(var(--head) / 2);
        background: var(--t);
    }
    
    nav {
        display: var(--f);
        flex-flow: var(--rw);
        align-items: var(--c);
        justify-content: var(--sb);
        width: calc(var(--head) * 14);
        height: var(--a);
        margin-top: var(--head);
        border-radius: calc(var(--head) / 2);
    }
    
    section>nav>a {
        width: var(--head);
        height: var(--head);
    }
    
    section>nav>a>img {
        width: var(--head);
        height: var(--head);
        transition: var(--eas2);
    }
    
    section>nav>a>img:hover {
        transform: scale(.9);
    }
    
    section>nav:nth-child(1) {
        width: calc(var(--full) - var(--full) / 10);
        height: calc(var(--head) * 1.5);
        margin-top: var(--z);
    }
    
    input[type="search"] {
        width: var(--full);
        height: calc(var(--head) / 1.2);
        margin-top: var(--head);
        padding-left: var(--head);
        border-radius: calc(var(--head) / 2);
        border: var(--bor-mnw);
        background: var(--ndembk2);
        font-size: calc(var(--head) / 3);
        color: var(--ph);
    }
    
    nav:nth-child(1):before {
        content: url(./media/img/loupe.webp);
        display: var(--fr);
        position: var(--abs);
        width: calc(var(--head) / 3);
        height: calc(var(--head) / 3);
        margin-top: calc(var(--head) + var(--head) / 8);
        margin-left: calc(var(--head) / 2.8);
        filter: var(--inv);
    } 
    
    input[type="search"]:focus {
        outline: var(--n);
    }
    
    section>nav:nth-child(2) {
        height: var(--head);
    }
    
    section>nav:nth-child(2)>p {
        width: var(--head);
        font-weight: var(--wb);
    }
    
    section>nav:nth-child(2)>a {
        width: calc(var(--head) * 4.7);
        height: calc(var(--head) / 1.8);
    }
    
    section>nav:nth-child(2)>a>button {
        width: calc(var(--head) * 4.7);
        height: calc(var(--head) / 1.8);
        border: var(--z);
        border-radius: calc(var(--head) / 10);
        font-size: calc(var(--head) / 2.8);
        color: var(--texte);
        background: var(--winmnbk);
    }
    
    section>nav:nth-child(3) {
        align-items: var(--fs);
        justify-content: var(--fs);
        height: calc(var(--head) * 6);
        margin-top: calc(var(--head) / 2);
        gap: calc(var(--head) / 2);
    }
    
    section>nav:nth-child(3)>a {
        width: calc(var(--head) * 2);
        height: calc(var(--head) * 2);
    }

    section>nav:nth-child(3)>a>figure {
        display: var(--f);
        flex-flow: var(--cnw);
        align-items: var(--c);
        justify-content: var(--fs);
        width: calc(var(--head) * 2);
        height: calc(var(--head) * 2);
        margin: var(--s); 
        gap: calc(var(--head) / 7);
    }
    
    section>nav:nth-child(3)>a>figure>img {
        width: var(--head);
        height: var(--head);
    }
    
    section>nav:nth-child(3)>a>figure>figcaption {
        font-size: calc(var(--head) / 3);
        text-align: var(--c);
    }
    
    section>nav:nth-child(4) {
        height: calc(var(--head) * 1.1);
        margin: var(--z);
        font-weight: var(--wb);
    }
    
    section>nav:nth-child(5) {
        display: var(--f);
        flex-flow: var(--cnw);
        align-items: var(--sa);
        justify-content: var(--fs);
        height: calc(var(--head) * 4.4);
        margin-top: calc(var(--head) / 2);
        gap: var(--head);
    }
    
    section>nav:nth-child(5)>a,
    section>nav:nth-child(5)>a>figure {
        width: calc(var(--head) * 5 + var(--head) / 2);
        height: var(--head);
        margin: var(--z);
    }
    
    section>nav:nth-child(5)>a>figure {
        display: var(--f);
        flex-flow: var(--cw);
        align-items: var(--fs);
        justify-content: var(--fs);
    }
    
    section>nav:nth-child(5)>a>figure>img {
        width: var(--head);
        height: var(--head);
    }
    
    section>nav:nth-child(5)>a>figure>figcaption {
        font-size: calc(var(--head) / 2.8);
    }
    
    section>nav:nth-child(5)>a>figure>figcaption>p {
        margin: calc(var(--head) / 18) calc(var(--head) / 12) var(--z) calc(var(--head) / 6);
    }
    
    section>nav:nth-child(5)>a>figure>figcaption>p:nth-child(1) {
        font-size: calc(var(--head) / 2.6);
        font-weight: var(--wb);
    }
    
    section>nav:nth-child(6) {
        width: var(--full);
        height: calc(var(--head) * 2);
        margin: var(--z);
        border-radius: var(--z) var(--z) calc(var(--head) / 3) calc(var(--head) / 3);
        background: var(--ndembk2);
    }
    
    section>nav:nth-child(6)>a,
    section>nav:nth-child(6)>a>figure {
        width: calc(var(--head) * 3);
        height: var(--head);
    }
    
    section>nav:nth-child(6)>a:nth-child(1)>figure {
        display: var(--f);
        flex-flow: var(--rnw);
        align-items: var(--c);
        justify-content: var(--sb);
        margin-top: var(--z);
    }
    
    section>nav:nth-child(6)>a>figure>img {
        width: var(--head);
        height: var(--head);
    }
    
    section>nav:nth-child(6)>a:nth-child(2) {
        display: var(--f);
        flex-flow: var(--rnw);
        align-items: var(--c);
        justify-content: var(--fs);
        width: calc(var(--head) * 2);
    }

    section>nav:nth-child(6)>a:nth-child(2)>figure {
        display: var(--f);
        flex-flow: var(--rnw);
        align-items: var(--c);
        justify-content: var(--fs);
        margin-left: var(--z);
    }

    section>nav:nth-child(6)>a:nth-child(2)>figure>img {
        width: calc(var(--head) / 1.4);
        height: calc(var(--head) / 1.4);
        filter: var(--inv);
    }
    `;
    document.head.appendChild(style);
}

// Fonction pour créer un élément <nav> avec un <input type="search">
function createSearchNav() {
    const nav = document.createElement('nav');
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Rechercher des applications, des paramètres et des documents';
    nav.appendChild(input);
    return nav;
}

// Fonction pour créer un élément <nav> avec un <p> et un <a> avec un <button>
function createPinnedNav() {
    const nav = document.createElement('nav');
    const p = document.createElement('p');
    p.textContent = 'Épinglé';
    nav.appendChild(p);

    const a = document.createElement('a');
    a.href = './applications.html';
    a.target = 'lien';
    a.title = 'Ouvrir le menu des applications';

    const button = document.createElement('button');
    button.textContent = 'Toutes les applications \u00a0 > ';
    a.appendChild(button);
    nav.appendChild(a);

    return nav;
}

// Fonction pour créer un élément <nav> avec plusieurs <a> contenant des <figure>
function createNavWithFigures(figuresData) {
    const nav = document.createElement('nav');
    figuresData.forEach(figureData => {
        const a = document.createElement('a');
        a.href = figureData.href;
        a.target = 'lien';
        a.title = figureData.title;

        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = figureData.imgSrc;
        img.alt = figureData.alt;
        img.title = figureData.title;
        figure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        // Création des paragraphes pour le figcaption uniquement pour l'élément spécifique
        if (figureData.href === './aide.html') {
            figureData.paragraphs.forEach(paragraphText => {
                const p = document.createElement('p');
                p.textContent = paragraphText;
                figcaption.appendChild(p);
            });
        } else {
            figcaption.textContent = figureData.caption;
        }
        figure.appendChild(figcaption);

        a.appendChild(figure);
        nav.appendChild(a);
    });
    return nav;
}

// Fonction pour créer un élément <nav> avec un <p>
function createNavWithParagraph(text) {
    const nav = document.createElement('nav');
    const p = document.createElement('p');
    p.textContent = text;
    nav.appendChild(p);
    return nav;
}

// Fonction principale pour créer la section avec tous les éléments <nav>
function createMenuSection() {
    const section = document.createElement('section');

    // Ajouter le premier <nav> avec <input type="search">
    section.appendChild(createSearchNav());

    // Ajouter le deuxième <nav> avec <p> et <a>
    section.appendChild(createPinnedNav());

    // Ajouter le troisième <nav> avec plusieurs <a> contenant des <figure>
    const figuresData = [
        { href: 'https://www.google.com/webhp?igu=1', title: 'Edge', imgSrc: './media/img/edge.png', alt: 'edge', caption: 'Edge' },
        { href: './settings.html', title: 'Paramètres', imgSrc: './media/img/settings.png', alt: 'paramètres', caption: 'Paramètres' },
        { href: './office.html', title: 'Office 365', imgSrc: './media/img/365.png', alt: 'Office 365', caption: 'Office 365' },
        { href: './explorateur.html', title: 'Explorateur de fichiers', imgSrc: './media/img/folder.png', alt: 'Dossiers', caption: 'Explorateur de fichiers' }
    ];
    section.appendChild(createNavWithFigures(figuresData));

    // Ajouter le quatrième <nav> avec un <p>
    section.appendChild(createNavWithParagraph('Nos recommandations'));

    // Ajouter le cinquième <nav> avec un <a> contenant une <figure>
    const aideFiguresData = [
        { href: './aide.html', title: 'Aide à propos de Windows', imgSrc: './media/img/aide.png', alt: 'Aide', caption: 'Aide à propos de Windows', paragraphs: [ 'Prise en main', 'Bienvenue dans Windows' ]}
    ];
    section.appendChild(createNavWithFigures(aideFiguresData));

    // Ajouter le sixième <nav> avec un <a> contenant une <figure> et un <a> avec une <img>
    const userFiguresData = [
        { href: './user.html', title: 'Paramètres des comptes utilisateurs', imgSrc: './media/img/user.png', alt: 'Utilisateur', caption: 'Utilisateur' },
        { href: './eteindre.html', title: 'éteindre, redémarrer ou mettre en veille', imgSrc: './media/img/shut.png', alt: 'éteindre', caption: '' }
    ];
    section.appendChild(createNavWithFigures(userFiguresData));

    // Ajouter la section au document
    document.getElementById('menu').appendChild(section);
}

// Appeler la fonction pour créer la section avec tous les éléments <nav>
createMenuSection();

// Appeler la fonction pour charger les styles du menu après la création des éléments HTML
loadMenuStyles();
