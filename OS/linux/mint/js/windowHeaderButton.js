document.addEventListener('click', function (event) {

    if (event.target.matches('#minimizeBtn') || event.target.matches('#closeBtn')) {
        const windowElement = event.target.closest('.windowElement');
        windowElement.style.display = 'none';
        windowElement.style.zIndex = '5'; // Réinitialiser le z-index à 5 lors de la minimisation

        // Trouver le lien correspondant
        const link = document.querySelector(`a[data-link="${windowElement.dataset.link}"]`);

        // Si le bouton cliqué est #closeBtn, retirer la classe active-link
        if (event.target.matches('#closeBtn') && link) {
            link.classList.remove('active-link');
        }
    }

    if (event.target.matches('#resizeBtn')) {
        const windowElement = event.target.closest('.windowElement');
        // Augmenter le z-index pour que la fenêtre apparaisse au-dessus des autres fenêtres ouvertes
        windowElement.style.zIndex = '10'; // Assurez-vous que ce z-index est supérieur à celui des autres fenêtres ouvertes

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
