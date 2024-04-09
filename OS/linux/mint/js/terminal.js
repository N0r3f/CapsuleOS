let output, commandInput, prompt;
const fileSystem = {
    '/': {
        '/bin': {},
        '/home': {},
        '/lib64': {},
        '/media': {},
        '/proc': {},
        '/sbin': {},
        '/swapfile': {},
        '/tmp': {},
        '/boot': {},
        '/dev': {},
        '/lib': {},
        '/libx32': {},
        '/lost+found': {},
        '/opt': {},
        '/run': {},
        '/srv': {},
        '/timeshift': {},
        '/var': {},
    },
    '/home': {
        '/user': {},
    },
    '/usr': {
        '/bin': {},
        '/lib': {},
    },
};

let currentPath = '/';

function updatePrompt() {
    prompt.textContent = `user@host:/${currentPath.substring(1)} $ `;
}

function createNewInput() {
    const newInput = document.createElement('input');
    newInput.id = 'command';
    newInput.type = 'text';
    return newInput;
}

function executeCommand(command) {
    const [cmd, ...args] = command.split(' ');
    const outputLine = document.createElement('div');

    let result;
    switch (cmd) {
        case 'cd':
            if (args.length === 0) {
                currentPath = '/';
                result = "Dossier racine";
            } else {
                let newPath;
                if (args[0].startsWith('/')) {
                    // Chemin absolu
                    newPath = args[0];
                } else {
                    // Chemin relatif
                    newPath = `${currentPath}/${args[0]}`;
                }
                // Normaliser le chemin pour éviter les doubles slashs
                newPath = newPath.replace(/\/+/g, '/');
                if (fileSystem[newPath]) {
                    currentPath = newPath;
                    result = `Dossier changé en ${newPath}`;
                } else {
                    result = `bash: cd: ${args[0]}: No such file or directory`;
                }
            }
            break;
        case 'ls':
            const files = Object.keys(fileSystem[currentPath]);
            result = files.join(' \u00a0');
            break;
        case 'pwd':
            result = currentPath;
            break;
        case 'echo':
            result = args.join(' \u00a0');
            break;
        case 'cat':
            // Simule l'affichage du contenu d'un fichier
            result = "Contenu du fichier";
            break;
        case 'touch':
            // Simule la création d'un fichier
            const fileName = args[0];
            if (!fileSystem[currentPath][fileName]) {
                fileSystem[currentPath][fileName] = {}; // Ajoute un fichier vide
                result = `Fichier ${fileName} créé.`;
            } else {
                result = `Fichier ${fileName} existe déjà.`;
            }
            break;
        case 'mkdir':
            // Simule la création d'un dossier
            const dirName = args[0];
            if (!fileSystem[currentPath][dirName]) {
                fileSystem[currentPath][dirName] = {}; // Ajoute un dossier vide
                result = `Dossier ${dirName} créé.`;
            } else {
                result = `Dossier ${dirName} existe déjà.`;
            }
            break;
        case 'rm':
            // Simule la suppression d'un fichier
            result = `Fichier ${args[0]} supprimé.`;
            break;
        default:
            result = `command not found: ${cmd}`;
    }

    outputLine.textContent = result;
    output.appendChild(outputLine);
    output.scrollTop = output.scrollHeight;

    // Créer un nouveau div pour le prompt et l'input
    const newInputContainer = document.createElement('div');
    newInputContainer.id = 'input';
    const newPrompt = document.createElement('span');
    newPrompt.textContent = prompt.textContent;
    newPrompt.id = 'prompt';
    newInputContainer.appendChild(newPrompt);
    const newInput = createNewInput();
    newInputContainer.appendChild(newInput);
    output.appendChild(newInputContainer);

    // Mettre à jour commandInput avec le nouvel input
    commandInput = newInput;

    // Appeler focus() sur le nouvel input pour basculer le curseur dessus
    commandInput.focus();

    // Attacher l'événement keydown au nouvel input
    commandInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const command = commandInput.value;
            executeCommand(command);
            commandInput.value = '';
            output.scrollTop = output.scrollHeight;
        }
    });
}

function initTerminalWhenReady() {
    output = document.getElementById('output');
    commandInput = document.getElementById('command');
    prompt = document.getElementById('prompt');

    if (output && commandInput && prompt) {
        initTerminal();
    } else {
        setTimeout(initTerminalWhenReady, 100);
    }
}

function initTerminal() {
    commandInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const command = commandInput.value;
            executeCommand(command);
            commandInput.value = '';
            output.scrollTop = output.scrollHeight;
        }
    });
}
