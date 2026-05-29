// Sélectionne tous les liens avec target="windowElement"
const links = document.querySelectorAll('a[target="windowElement"]');
const windowElements = document.querySelectorAll('.windowElement');
let zCounter = 50;
const WINDOW_TITLE_MAP = {
    profile: 'À Propos',
    librewriter: 'Sans nom 1 - LibreOffice Writer',
};

function activateWindow(container) {
    if (!container) {
        return;
    }

    document.querySelectorAll('.windowElementActive').forEach((win) => {
        win.classList.remove('windowElementActive');
    });

    container.classList.add('windowElementActive');
    container.style.zIndex = `${++zCounter}`;
}

// Création de la div#windowHeader
const windowHeader = document.createElement("div");
const left = document.createElement("nav");
const title = document.createElement("span");
const right = document.createElement("nav");
const minimizeBtn = document.createElement("button");
const maximizeBtn = document.createElement("button");
const closeBtn = document.createElement("button");

// Ajout du contenu HTML pour la div#windowHeader
windowHeader.id = "windowHeader";
windowHeader.style.minWidth = "calc(var(--full) - calc(var(--head) / 20))";

title.id = "windowTitle";
// Utilisez document.title pour obtenir le titre de la page par défaut
title.textContent = document.title;

minimizeBtn.id = "minimizeBtn";
maximizeBtn.id = "resizeBtn";
closeBtn.id = "closeBtn";

windowHeader.appendChild(left);
windowHeader.appendChild(title);
windowHeader.appendChild(right);
right.appendChild(minimizeBtn);
right.appendChild(maximizeBtn);
right.appendChild(closeBtn);

function isKdeFamily() {
    const skinKey = typeof window !== 'undefined' ? window.CAPSULE_EMBED_SKIN_KEY : null;
    const explorerTemplate = typeof window !== 'undefined' ? window.CAPSULE_EXPLORER_TEMPLATE : null;
    const bodyId = typeof document !== 'undefined' && document.body ? document.body.id : null;

    if (explorerTemplate === 'dolphin') {
        return true;
    }
    if (skinKey === 'opensuse' || skinKey === 'mxkde') {
        return true;
    }
    return bodyId === 'opensuse' || bodyId === 'mx-kde';
}

function applyKdeWindowHeaderIcons(container) {
    if (!container || !isKdeFamily()) {
        return;
    }
    const base = (typeof window !== 'undefined' && window.CAPSULE_SKIN_BASE)
        ? String(window.CAPSULE_SKIN_BASE).replace(/\/+$/, '')
        : '.';
    const header = container.querySelector('#windowHeader');
    if (!header) {
        return;
    }
    const minBtn = header.querySelector('#minimizeBtn');
    const resBtn = header.querySelector('#resizeBtn');
    const clsBtn = header.querySelector('#closeBtn');

    if (minBtn) {
        minBtn.style.backgroundImage = `url(${base}/media/img/header/minimize.svg)`;
    }
    if (resBtn) {
        resBtn.style.backgroundImage = `url(${base}/media/img/header/window-restore.svg)`;
        resBtn.style.backgroundSize = 'calc(var(--head) / 2.55)';
    }
    if (clsBtn) {
        clsBtn.style.backgroundImage = `url(${base}/media/img/header/window-close.svg)`;
    }
}

function handleOpenwindow(link) {
	const container = document.querySelector(`div[data-link="${link.dataset.link}"]`);

    if (container) {
        const isGnomeStartMenu = link.dataset.link === 'mainMenu'
            && !!container.querySelector('#menu-gnome-root');

        if (container.style.display === "none") {
            container.style.display = "flex";
            container.style.position = 'fixed';
            if (!isGnomeStartMenu && !container.querySelector('#windowHeader')) {
                container.insertBefore(windowHeader.cloneNode(true), container.firstChild);
            }
            applyKdeWindowHeaderIcons(container);
            link.classList.add('active-link');
            activateWindow(container);
            // Utiliser le data-link pour mettre à jour le windowTitle
            const windowTitle = container.querySelector('#windowTitle');
            if (windowTitle) {
                const resolved = typeof window.getResolvedWindowTitle === 'function'
                    ? window.getResolvedWindowTitle(link.dataset.link)
                    : null;
                windowTitle.textContent = resolved || WINDOW_TITLE_MAP[link.dataset.link] || link.dataset.link;
            }
            if (!isGnomeStartMenu) {
                // Rendre la fenêtre déplacable
                if (container.dataset.dragInit !== 'true') {
                    makeDraggable(container);
                }
                // Rendre la fenêtre redimensionnable
                if (container.dataset.resizeInit !== 'true') {
                    makeResizable(container);
                    container.dataset.resizeInit = 'true';
                }
            }
        } else {
            container.style.display = "none";
            // Retirer la classe active de l'élément de fenêtre
            container.classList.remove('active');
            container.classList.remove('windowElementActive');
            container.style.zIndex = '5';
            link.classList.remove('active-link');
        }
    }
}

// Lancer la fonction d'ouverture pour chaque lien
const WINDOW_TASK_MAP = {
    nemo: 'open-nemo',
    firefox: 'open-firefox',
    terminal: 'open-terminal',
    mainMenu: 'open-menu',
    visionneur_images: 'open-viewer',
    visionneur_pdf: 'open-viewer',
    lecteur_multimedia: 'open-viewer',
    profile: 'open-profile',
};

links.forEach((link) => {
	link.addEventListener("click", function (event) {
		event.preventDefault(); // Empêche le comportement par défaut du lien
		handleOpenwindow(this); // Utilisez 'this' pour référencer l'élément de lien
		const taskId = WINDOW_TASK_MAP[this.dataset.link];
		if (taskId && typeof dispatchCapsuleTask === 'function') {
			dispatchCapsuleTask(taskId);
		}
	})
})

function createVirtualLauncher(dataLink) {
    return {
        dataset: { link: dataLink },
        classList: {
            add() {},
            remove() {},
        },
    };
}

function openWindowByDataLink(dataLink) {
    if (!dataLink) {
        return false;
    }

    const container = document.querySelector(`div[data-link="${dataLink}"]`);
    if (!container) {
        return false;
    }

    const launcher = document.querySelector(`a[target="windowElement"][data-link="${dataLink}"]`) || createVirtualLauncher(dataLink);
    const isVisible = container.style.display !== 'none';

    if (isVisible) {
        activateWindow(container);
        launcher.classList.add('active-link');
        return true;
    }

    if (typeof handleOpenwindow !== 'function') {
        return false;
    }

    handleOpenwindow(launcher);
    applyKdeWindowHeaderIcons(container);

    if (dataLink === 'update_manager' && typeof window.initUpdateManagerApp === 'function') {
        window.initUpdateManagerApp();
    }

    const windowTitle = container.querySelector('#windowTitle');
    if (windowTitle) {
        const resolved = typeof window.getResolvedWindowTitle === 'function'
            ? window.getResolvedWindowTitle(dataLink)
            : null;
        windowTitle.textContent = resolved || WINDOW_TITLE_MAP[dataLink] || dataLink;
    }

    return container.style.display !== 'none';
}

window.openWindowByDataLink = openWindowByDataLink;

// Fonction pour rendre une fenêtre redimensionnable
function makeResizable(element) {
	const resizer = new Resizer(element);
	return resizer;
}

windowElements.forEach((windowElement) => {
    windowElement.addEventListener('mousedown', () => {
        if (windowElement.style.display !== 'none') {
            activateWindow(windowElement);
        }
    });
});
