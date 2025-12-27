(function() {
    const vscode = acquireVsCodeApi();

    const promptInput = document.getElementById('prompt-input');
    const sendButton = document.getElementById('send-button');
    const messageList = document.getElementById('message-list');
    const modelSelector = document.getElementById('model-selector');
    const tokenInput = document.getElementById('token-input');

    // Fetch models on load
    vscode.postMessage({ command: 'load' });

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

            // Disable input and button
            promptInput.disabled = true;
            sendButton.disabled = true;

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
            case 'response':
                const assistantMessage = document.createElement('div');
                assistantMessage.className = 'message assistant-message';
                assistantMessage.textContent = message.text;
                messageList.appendChild(assistantMessage);
                messageList.scrollTop = messageList.scrollHeight;

                // Re-enable input and button
                promptInput.disabled = false;
                sendButton.disabled = false;
                promptInput.focus();
                break;
            case 'plan':
                const planMessage = document.createElement('div');
                planMessage.className = 'message plan-message';
                planMessage.textContent = "Thinking...\n\n" + message.text;
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
}());
