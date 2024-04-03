// Assurez-vous que finder est défini avant de l'utiliser
const finder = document.querySelector('.finder');

// Création de l'élément main
const mainElement = document.createElement('section');
mainElement.classList.add('finderMain');

// Création des éléments header, aside, section, et footer
const headerElement = document.createElement('header');
headerElement.classList.add('finderHeader');

const asideElement = document.createElement('aside');
asideElement.classList.add('finderAside');

const sectionElement = document.createElement('section');
sectionElement.classList.add('finderSection');

const footerElement = document.createElement('footer');
footerElement.classList.add('finderFooter');

// Ajout des éléments à l'élément main
mainElement.appendChild(headerElement);
mainElement.appendChild(asideElement);
mainElement.appendChild(sectionElement);
mainElement.appendChild(footerElement);

// Ajout de l'élément main à la div#finder après la div#windowHeader
finder.insertBefore(mainElement, windowHeader.nextSibling);
