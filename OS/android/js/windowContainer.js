// Sélectionne tous les liens avec target="windowElement"
const links = document.querySelectorAll('a[target="windowElement"]')

// Sélectionne l'élément div#mainMenu
const mainMenu = document.getElementById('mainMenu')

// Sélectionne l'élément <a data-link="mainMenu">
const mainMenuToggle = document.querySelector('a[data-link="mainMenu"]')

function handleOpenwindow(link) {
	const container = document.querySelector(
		`div[data-link="${link.dataset.link}"]`
	)
	let shortcut = document.querySelector('#shortcut')

	if (container) {
		if (container.style.display === 'none') {
			container.style.display = 'flex'
			link.classList.add('active-link')
			// Ajouter la classe active à l'élément de fenêtre
			container.classList.add('active')
			shortcut.style.display = 'none'
		} else {
			container.style.display = 'none'
			// Retirer la classe active de l'élément de fenêtre
			container.classList.remove('active')
			container.classList.remove('windowElementActive')
			shortcut.style.display = 'flex'
		}
	}
}

// Lancer la fonction d'ouverture pour chaque lien
links.forEach((link) => {
	link.addEventListener('click', function (event) {
		event.preventDefault() // Empêche le comportement par défaut du lien
		handleOpenwindow(this) // Utilisez 'this' pour référencer l'élément de lien
	})
})
