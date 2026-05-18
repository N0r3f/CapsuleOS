function createMessage(expediteur, message) {
    const messagesList = document.querySelector('.messages-list');
    if (!messagesList) {
        return;
    }

    const messageItem = document.createElement('div');
    const messageIcone = document.createElement('div');

    const messageImage = document.createElement('img');
    messageImage.setAttribute('src', './assets/icones/default.png');
    messageImage.setAttribute('alt', 'Icône de contact');

    const messageContent = document.createElement('div');

    const messageExpediteur = document.createElement('span');
    const messageText = document.createElement('p');

    messageItem.classList.add('message');
    messageIcone.classList.add('message-icone');
    messageContent.classList.add('message-content');
    messageExpediteur.classList.add('message-exp');
    messageText.classList.add('message-text');

    messageExpediteur.innerText = expediteur;
    messageText.innerText = message;

    messagesList.appendChild(messageItem);
    messageItem.appendChild(messageIcone);
    messageIcone.appendChild(messageImage);
    messageItem.appendChild(messageContent);
    messageContent.appendChild(messageExpediteur);
    messageContent.appendChild(messageText);
}

window.initCapsuleAndroidMessages = function initCapsuleAndroidMessages() {
    const messagesList = document.querySelector('.messages-list');
    if (!messagesList) {
        return;
    }

    const appendFromJson = (messages) => {
        if (!Array.isArray(messages)) {
            return;
        }
        messages.forEach((m) => {
            if (m && m.expediteur != null && m.contenu != null) {
                createMessage(m.expediteur, m.contenu);
            }
        });
    };

    const useEmbed = () => {
        if (typeof window === 'undefined' || !Array.isArray(window.CAPSULE_ANDROID_MESSAGES_EMBED)) {
            return false;
        }
        if (window.CAPSULE_FORCE_APP_EMBED === true) {
            return true;
        }
        if (typeof location !== 'undefined' && location.protocol === 'file:') {
            return true;
        }
        return false;
    };

    if (useEmbed()) {
        appendFromJson(window.CAPSULE_ANDROID_MESSAGES_EMBED);
        return;
    }

    fetch('./ressources/messages.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then((messages) => {
            appendFromJson(messages);
        })
        .catch((err) => {
            console.error('Messages: échec du chargement', err);
        });
};
