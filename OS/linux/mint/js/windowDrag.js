const makeDraggable = (element) => {
    let isDragging = false;
    let offsetX, offsetY;

    const headerElement = element.querySelector('#windowHeader');
    if (headerElement) {
        headerElement.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Empêche la sélection de texte
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });
    } else {
        element.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Empêche la sélection de texte
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault(); // Empêche la sélection de texte
            // Obtenez les limites du parent main
            const mainElement = document.querySelector('object');
            const mainRect = mainElement.getBoundingClientRect();

            // Calculez les nouvelles positions de la fenêtre
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Limitez la position de la fenêtre aux limites du parent main
            newX = Math.max(mainRect.left, Math.min(newX, mainRect.right - element.offsetWidth));
            newY = Math.max(mainRect.top, Math.min(newY, mainRect.bottom - element.offsetHeight));

            // Mettez à jour la position de la fenêtre
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        }
        document.addEventListener('click', function(event) {
            // Supprimer la classe active de tous les éléments
            document.querySelectorAll('.windowElement' , '#windowContainer').forEach(function(element) {
                element.classList.remove('windowElementActive');
            });
        
            // Ajouter la classe active à l'élément cliqué
            const clickedElement = event.target.closest('.windowElement' , '#windowContainer');
            if (clickedElement) {
                clickedElement.classList.add('windowElementActive');
            }
        });
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
};
