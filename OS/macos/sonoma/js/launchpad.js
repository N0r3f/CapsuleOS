// Fonction pour charger le contenu HTML
async function loadHTML(url) {
    const response = await fetch(url);
    return response.text();
}

// Fonction pour charger les styles CSS
async function loadCSS(url) {
    const response = await fetch(url);
    return response.text();
}

// Fonction pour générer la div et y intégrer le contenu HTML et les styles CSS
async function openInDiv(htmlUrl, cssUrl) {
    const htmlContent = await loadHTML(htmlUrl);
    const cssContent = await loadCSS(cssUrl);

    // Créer la div
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.zIndex = '1000'; // Assurez-vous que la div est au-dessus des autres éléments

    // Intégrer le contenu HTML
    div.innerHTML = htmlContent;

    // Intégrer les styles CSS
    const style = document.createElement('style');
    style.textContent = cssContent;
    div.appendChild(style);

    // Ajouter la div au DOM
    document.body.appendChild(div);
}

// Ajouter un écouteur d'événements sur les liens
document.querySelectorAll('a[href="../pages/launchpad.html"]').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Empêcher la navigation normale
        openInDiv('../pages/launchpad.html', '../style/launchpad.css');
    });
});
