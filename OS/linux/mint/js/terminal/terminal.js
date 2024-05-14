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
        let terminalContainer = document.getElementById('terminalContainer');
        terminalContainer.appendChild(inputContainer);
    }
    // Vérifiez si l'élément 'output' existe déjà
    if (!output) {
        // Si non, créez l'élément 'output'
        output = document.createElement('div');
        output.id = 'output';

        // Ajoutez l'élément 'output' au terminalContainer
        let terminalContainer = document.getElementById('terminalContainer');
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
