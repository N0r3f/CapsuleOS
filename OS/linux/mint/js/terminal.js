let output, commandInput, prompt;
const fileSystem = {
    '/': {
        'home': {},
        'usr': {},
        'tmp': {},
    },
    '/home': {
        'user': {},
    },
    '/usr': {
        'bin': {},
        'lib': {},
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
    if (cmd === 'cd') {
        if (args.length === 0) {
            currentPath = '/';
            result = "Dossier racine";
        } else {
            const newPath = `${currentPath}/${args[0]}`;
            if (fileSystem[newPath]) {
                currentPath = newPath;
                result = `Dossier changé en ${newPath}`;
            } else {
                result = `bash: cd: ${args[0]}: No such file or directory`;
            }
        }
    } else if (cmd === 'ls') {
        const files = Object.keys(fileSystem[currentPath]);
        result = files.join('\n');
    } else {
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

