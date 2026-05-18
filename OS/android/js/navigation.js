const home = document.querySelector('.home')
const back = document.querySelector('.back')
const apps = document.querySelector('.apps')
const containers = document.querySelectorAll('.windowElement')
const nav = document.querySelector('#navigation')

home.addEventListener('click', () => {
	let shortcut = document.querySelector('#shortcut')
	containers.forEach((container) => {
		container.style.display = 'none'
		shortcut.style.display = 'flex'
		nav.style.background = 'none'
	})
})
