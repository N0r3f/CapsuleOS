var messagesList = document.querySelector('.messages-list')

document.onload = () => {
	fetch('./ressources/messages.json')
		.then((response) => {
			console.log('Messages chargés avec succés')
			return response.json()
		})
		.then((messages) => {
			for (const message of messages) {
				createMessage(message.expediteur, message.contenu)
			}
		})
}

function createMessage(expediteur, message) {
	//Création des balises
	let messageItem = document.createElement('div')
	let messageIcone = document.createElement('div')

	let messageImage = document.createElement('img')
	messageImage.setAttribute('src', './../assets/icones/default.png')
	messageImage.setAttribute('alt', 'Icône de contact')

	let messageContent = document.createElement('div')

	let messageExpediteur = document.createElement('span')
	let messageText = document.createElement('p')

	//Ajout des classes aux éléments
	messageItem.classList.add('message')
	messageIcone.classList.add('message-icone')
	messageContent.classList.add('message-content')
	messageExpediteur.classList.add('message-exp')
	messageText.classList.add('message-text')

	//Ajout des données
	messageExpediteur.innerText = expediteur
	messageText.innerText = message

	// assemblage des éléments
	messagesList.appendChild(messageItem)
	messageItem.appendChild(messageIcone)
	messageIcone.appendChild(messageImage)
	messageItem.appendChild(messageContent)
	messageContent.appendChild(messageExpediteur)
	messageContent.appendChild(messageText)
}
