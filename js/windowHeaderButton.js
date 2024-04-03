document.addEventListener('click', function (event) {
    if (event.target.matches('#minimizeBtn') || event.target.matches('#closeBtn')) {
        const windowElement = event.target.closest('#windowElement');
        windowElement.style.display = 'none';

        // Trouver le lien correspondant
        const link = document.querySelector(`a[data-link="${windowElement.dataset.link}"]`);

        // Si le bouton cliqué est #closeBtn, retirer la classe active-link
        if (event.target.matches('#closeBtn') && link) {
            link.classList.remove('active-link');
        }
    }
        // Convertir windowHeader en tableau avant d'utiliser forEach
        Array.from(windowHeader).forEach(img => {
            img.style.borderBottom = '';

            openWindows = openWindows.filter(win => win !== windowElement);
        });
    
    if (event.target.matches('#resizeBtn')) {
        const windowElement = event.target.closest('#windowElement');
        if (windowElement.style.width === '100%' && windowElement.style.height === '100%') {
            windowElement.style.width = '';
            windowElement.style.height = '';
            windowElement.style.position = '';
            windowElement.style.top = '';
            windowElement.style.left = '';
        } else {
            windowElement.style.width = '100%';
            windowElement.style.height = '100%';
            windowElement.style.position = 'relative';
            windowElement.style.top = '0';
            windowElement.style.left = '0';
        }
    }
});
