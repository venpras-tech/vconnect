(function() {
    const vscode = acquireVsCodeApi();

    const promptInput = document.getElementById('prompt-input');
    const sendButton = document.getElementById('send-button');
    const messageList = document.getElementById('message-list');
    const modelSelector = document.getElementById('model-selector');
    const tokenInput = document.getElementById('token-input');
    const cancelButton = document.getElementById('cancel-button');
    const awaitingResponse = document.getElementById('awaiting-response');

    // Fetch models on load
    vscode.postMessage({ command: 'load' });

    cancelButton.addEventListener('click', () => {
        vscode.postMessage({ command: 'cancel' });
        cancelButton.classList.add('hidden');
        cancelButton.disabled = true; // Prevent multiple clicks
        awaitingResponse.classList.add('hidden');
    });

    sendButton.addEventListener('click', () => {
        const prompt = promptInput.value;
        const model = modelSelector.value;
        const token = tokenInput.value;
        if (prompt && model) {
            vscode.postMessage({
                command: 'prompt',
                text: prompt,
                model: model,
                token: token
            });

            const userMessage = document.createElement('div');
            userMessage.className = 'message user-message';
            userMessage.textContent = prompt;
            messageList.appendChild(userMessage);

            promptInput.value = '';
        }
    });

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'response-start':
                awaitingResponse.classList.remove('hidden');
                cancelButton.classList.remove('hidden');
                cancelButton.disabled = false;
                sendButton.disabled = true;
                break;
            case 'interactive-command': {
                const commandBlock = document.createElement('div');
                commandBlock.className = 'message assistant-message interactive-command-container';
                commandBlock.innerHTML = `
                    <p>The model wants to run the following command:</p>
                    <pre class="command-text">${escapeHtml(message.commandText)}</pre>
                    <div class="interactive-buttons">
                        <button class="execute-button">Execute</button>
                        <button class="ignore-button">Ignore</button>
                    </div>
                `;

                commandBlock.querySelector('.execute-button').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'command-decision',
                        decision: 'execute',
                        commandId: message.commandId
                    });
                    commandBlock.querySelector('.interactive-buttons').innerHTML = '<p>Executing...</p>';
                });

                commandBlock.querySelector('.ignore-button').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'command-decision',
                        decision: 'ignore',
                        commandId: message.commandId
                    });
                    commandBlock.querySelector('.interactive-buttons').innerHTML = '<p>Ignored.</p>';
                });

                messageList.appendChild(commandBlock);
                messageList.scrollTop = messageList.scrollHeight;
                return;
            }
            case 'command-output-start': {
                findOrCreateOutputBlock(message.commandId);
                return;
            }
            case 'command-output-chunk': {
                const outputBlock = findOrCreateOutputBlock(message.commandId);
                const span = document.createElement('span');
                span.className = message.stream === 'stderr' ? 'stderr-chunk' : 'stdout-chunk';
                span.textContent = message.chunk;
                outputBlock.appendChild(span);
                messageList.scrollTop = messageList.scrollHeight; // Auto-scroll
                return;
            }
            case 'command-output-end': {
                const outputBlock = findOrCreateOutputBlock(message.commandId);
                const exitCode = document.createElement('div');
                exitCode.className = 'exit-code';
                exitCode.textContent = `Command exited with code ${message.code}.`;
                outputBlock.parentNode.appendChild(exitCode);
                return;
            }
            case 'response':
                const assistantMessage = document.createElement('div');
                assistantMessage.className = 'message assistant-message';
                // Use `marked` to render Markdown content
                assistantMessage.innerHTML = marked.parse(message.text);
                messageList.appendChild(assistantMessage);
                messageList.scrollTop = messageList.scrollHeight;

                // Re-enable input and button
                promptInput.disabled = false;
                sendButton.disabled = false;
                promptInput.focus();
                cancelButton.classList.add('hidden');
                break;
            case 'response-end':
                awaitingResponse.classList.add('hidden');
                cancelButton.classList.add('hidden');
                sendButton.disabled = false;
                break;
            case 'execution-start':
                awaitingResponse.classList.remove('hidden');
                cancelButton.classList.remove('hidden');
                cancelButton.disabled = false;
                break;
            case 'plan':
                const planMessage = document.createElement('div');
                planMessage.className = 'message plan-message';
                // Use `marked` to render Markdown content, which might contain formatting
                planMessage.innerHTML = marked.parse("Thinking...\n\n" + message.text);
                messageList.appendChild(planMessage);
                messageList.scrollTop = messageList.scrollHeight;
                break;
            case 'load':
                modelSelector.innerHTML = '';
                message.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    if (model === message.selectedModel) {
                        option.selected = true;
                    }
                    modelSelector.appendChild(option);
                });
                if (message.token) {
                    tokenInput.value = message.token;
                }
                break;
        }
    });

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, '"')
            .replace(/'/g, "&#039;");
    }
    
    function findOrCreateOutputBlock(commandId) {
        let outputContainer = document.getElementById(`cmd-out-${commandId}`);
        if (!outputContainer) {
            const container = document.createElement('div');
            container.className = 'message assistant-message command-output-container';

            const title = document.createElement('p');
            title.textContent = 'Command Output:';
            container.appendChild(title);

            const pre = document.createElement('pre');
            pre.id = `cmd-out-${commandId}`;
            container.appendChild(pre);

            messageList.appendChild(container);
            return pre;
        }
        return outputContainer;
    }
}());
