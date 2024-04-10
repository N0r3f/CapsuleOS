let output, commandInput, prompt;
let currentPath = '/';

function updatePrompt() {
    prompt.textContent = `user@host:/${currentPath.substring(1)}$ `;
}

function createNewInput() {
    const newInput = document.createElement('input');
    newInput.id = 'command';
    newInput.type = 'text';
    return newInput;
}

function splitResultIntoElements(result) {
    return result.split('\n');
}

function executeCommand(command) {
    const [cmd, ...args] = command.split(' ');
    const outputLine = document.createElement('div');

    let result;
    switch (cmd) {
        case 'man':
            if (args.length === 0) {
                result = "Utilisation : man [commande]";
            } else {
                const commandHelp = manuel.man[args[0]];
                if (commandHelp) {
                    const helpText = `${args[0]} : ${commandHelp.help}\nExemples d'utilisation :`;
                    const examples = commandHelp.examples.map(example => `  ${example}`).join('\n');
                    result = `${helpText}\n${examples}`;
                } else {
                    result = `Aucune aide disponible pour ${args[0]}`;
                }
            }
            break;
        case 'cd':
            if (args.length === 0) {
                currentPath = '/';
                result = "Dossier racine";
            } else {
                let newPath;
                if (args[0] === '..') {
                    // Remonter d'un niveau
                    const pathParts = currentPath.split('/');
                    pathParts.pop(); // Retire le dernier élément du chemin
                    newPath = pathParts.join('/');
                    if (newPath === '') {
                        newPath = '/'; // Assure que le chemin ne devient pas vide
                    }
                } else if (args[0].startsWith('/')) {
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
            updatePrompt();
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
            const file = args[0];
            if (fileSystem[currentPath][file]) {
                delete fileSystem[currentPath][file]; // Supprime le fichier de l'objet fileSystem
                result = `Fichier ${file} supprimé.`;
            } else {
                result = `Fichier ${file} non trouvé.`;
            }
            break;
        case 'clear':
            // Effacer tous les éléments enfants de l'élément 'output'
            while (output.firstChild) {
                output.removeChild(output.firstChild);
            } 
            const firstInputContainer = document.getElementById('input');
            if (firstInputContainer) {
                firstInputContainer.remove();
            }
            break;
        default:
            result = `command not found : ${cmd}`;
    }

    if (cmd !== 'clear') {
        const resultElements = splitResultIntoElements(result);

        resultElements.forEach(element => {
            const codeElement = document.createElement('code');
            codeElement.textContent = element;
            outputLine.appendChild(codeElement);
        });

        output.appendChild(outputLine);
        output.scrollTop = output.scrollHeight;
    }

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

    // Vérifiez si l'élément 'input' existe déjà
    let inputContainer = document.getElementById('input');
    if (!inputContainer) {
        // Si non, créez le premier input et prompt
        inputContainer = document.createElement('div');
        inputContainer.id = 'input';

        prompt = document.createElement('span');
        prompt.id = 'prompt';
        prompt.textContent = `user@host:/$ `;
        inputContainer.appendChild(prompt);

        commandInput = createNewInput();
        inputContainer.appendChild(commandInput);

        // Ajoutez le conteneur d'input au terminalContainer
        const terminalContainer = document.getElementById('terminalContainer');
        terminalContainer.appendChild(inputContainer);
    }
    // Vérifiez si l'élément 'output' existe déjà
    if (!output) {
        // Si non, créez l'élément 'output'
        output = document.createElement('div');
        output.id = 'output';

        // Ajoutez l'élément 'output' au terminalContainer
        const terminalContainer = document.getElementById('terminalContainer');
        terminalContainer.appendChild(output);
    }

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
