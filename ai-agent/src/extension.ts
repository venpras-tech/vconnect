// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OllamaProvider } from './llm/OllamaProvider';
import { TextEncoder, TextDecoder } from 'util';
import { LLMConnectionError } from './llm/errors';
import { exec, spawn } from 'child_process';
import * as crypto from 'crypto';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "ai-agent" is now active!');

    const llmProvider = new OllamaProvider();
	const originalFileContentProvider = new OriginalFileContentProvider();
    const provider = new ChatViewProvider(context.extensionUri, llmProvider, context, originalFileContentProvider);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider));
	
	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider('file-original', originalFileContentProvider)
	);

    let disposable = vscode.commands.registerCommand('ai-agent.showChat', () => {
        // This command can be used to programmatically show the view
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(
        vscode.commands.registerCommand('ai-agent.showSettings', () => {
            SettingsPanel.createOrShow(context.extensionUri, context);
        })
    );
}

class SettingsPanel {
    public static currentPanel: SettingsPanel | undefined;

    public static readonly viewType = 'aiAgentSettings';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _context: vscode.ExtensionContext;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SettingsPanel.currentPanel) {
            SettingsPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            SettingsPanel.viewType,
            'AI Agent Settings',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri, context);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri, context);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._context = context;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'save':
                        await this._context.globalState.update('llm.url', message.url);
                        await this._context.globalState.update('llm.token', message.token);
                        await this._context.globalState.update('llm.model', message.model);
                        vscode.window.showInformationMessage('AI Agent settings saved.');
                        this._panel.dispose();
                        break;
                    case 'cancel':
                        this._panel.dispose();
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        SettingsPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = 'AI Agent Settings';
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const url = this._context.globalState.get('llm.url') || '';
        const token = this._context.globalState.get('llm.token') || '';
        const model = this._context.globalState.get('llm.model') || '';

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Agent Settings</title>
                <style>
                    body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); }
                    .container { padding: 20px; }
                    .form-group { margin-bottom: 15px; }
                    label { display: block; margin-bottom: 5px; }
                    input { width: 100%; padding: 8px; border: 1px solid var(--vscode-input-border); background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); }
                    .buttons { margin-top: 20px; }
                    button { padding: 10px 15px; border: none; cursor: pointer; }
                    #save-btn { background-color: var(--vscode-button-background); color: var(--vscode-button-foreground); }
                    #cancel-btn { background-color: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); margin-left: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>AI Agent Settings</h1>
                    <div class="form-group">
                        <label for="url">LLM API URL</label>
                        <input type="text" id="url" value="${url}">
                    </div>
                    <div class="form-group">
                        <label for="token">Token</label>
                        <input type="password" id="token" value="${token}">
                    </div>
                    <div class="form-group">
                        <label for="model">Model</label>
                        <input type="text" id="model" value="${model}">
                    </div>
                    <div class="buttons">
                        <button id="save-btn">Save</button>
                        <button id="cancel-btn">Cancel</button>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('save-btn').addEventListener('click', () => {
                        const url = document.getElementById('url').value;
                        const token = document.getElementById('token').value;
                        const model = document.getElementById('model').value;
                        vscode.postMessage({ command: 'save', url, token, model });
                    });
                    document.getElementById('cancel-btn').addEventListener('click', () => {
                        vscode.postMessage({ command: 'cancel' });
                    });
                </script>
            </body>
            </html>`;
    }
}

class OriginalFileContentProvider implements vscode.TextDocumentContentProvider {
    private originalContent: Map<string, string> = new Map();

    // Emitter and event for handling content updates
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    readonly onDidChange = this._onDidChange.event;

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.originalContent.get(uri.toString()) || '';
    }

    setOriginalContent(uri: vscode.Uri, content: string): void {
        this.originalContent.set(uri.toString(), content);
        // Fire an event to notify VS Code that the content of the URI has changed.
        this._onDidChange.fire(uri);
    }
}

class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiAgentView';

    private _view?: vscode.WebviewView;

    private _cancellationTokenSource: vscode.CancellationTokenSource | undefined;
    private _pendingCommands: Map<string, (decision: string) => void> = new Map();

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _llmProvider: OllamaProvider,
        private readonly _context: vscode.ExtensionContext,
  private readonly _originalFileContentProvider: OriginalFileContentProvider
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message: any) => {
            switch (message.command) {
                case 'command-decision': {
                    const resolver = this._pendingCommands.get(message.commandId);
                    if (resolver) {
                        resolver(message.decision);
                        this._pendingCommands.delete(message.commandId);
                    }
                    return;
                }
                case 'load':
                    try {
                        const url = this._context.globalState.get('llm.url') as string || '';
                        const models = await this._llmProvider.listModels(url);
                        const savedModel = this._context.globalState.get('selectedModel');
                        const savedToken = this._context.globalState.get('token');
                        webviewView.webview.postMessage({
                            command: 'load',
                            models: models,
                            selectedModel: savedModel,
                            token: savedToken
                        });
                    } catch (error) {
                        if (error instanceof LLMConnectionError) {
                            vscode.window.showErrorMessage(error.message);
                        } else {
                            vscode.window.showErrorMessage('An unknown error occurred while fetching models.');
                        }
                        console.error('Error fetching models:', error);
                        webviewView.webview.postMessage({ command: 'load', models: [] });
                    }
                    return;
                case 'prompt':
                    const context = await this._gatherContext();
                    await this.handleUserPrompt(webviewView, message, context);
                    return;
               case 'cancel':
                   if (this._cancellationTokenSource) {
                       this._cancellationTokenSource.cancel();
                       this._cancellationTokenSource.dispose();
                       this._cancellationTokenSource = undefined;
                       webviewView.webview.postMessage({ command: 'response', text: 'Task canceled by user.' });
                   }
                   return;
            }
        });
    }

    private async _gatherContext(): Promise<string> {
        let context = '';
        const activeEditor = vscode.window.activeTextEditor;
    
        // 1. Add active editor's selection or full content
        if (activeEditor) {
            const selection = activeEditor.selection;
            const document = activeEditor.document;
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            const relativePath = workspaceFolder ? vscode.workspace.asRelativePath(document.uri) : document.uri.fsPath;
            
            context += `// Active file: ${relativePath}\n\n`;

            if (!selection.isEmpty) {
                context += `// Selected text:\n${document.getText(selection)}\n\n`;
            } else {
                const fullText = document.getText();
                context += `// Full content:\n${fullText}\n\n`;
            }
        }
    
        // 2. Add content of other visible editors
        const otherEditors = vscode.window.visibleTextEditors.filter((editor: vscode.TextEditor) => editor !== activeEditor);
        if (otherEditors.length > 0) {
            context += '---\n\n// Other open files:\n\n';
            for (const editor of otherEditors) {
                const document = editor.document;
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
                const relativePath = workspaceFolder ? vscode.workspace.asRelativePath(document.uri) : document.uri.fsPath;
                context += `// File: ${relativePath}\n\n`;
                context += `${document.getText()}\n\n`; // Consider truncating this as well if needed
            }
        }
    
        return context;
    }

    private async handleUserPrompt(webviewView: vscode.WebviewView, message: any, context: string) {
        if (this._cancellationTokenSource) {
            // A task is already running
            vscode.window.showInformationMessage('A task is already in progress. Please wait for it to complete or cancel it.');
            return;
        }

        this._cancellationTokenSource = new vscode.CancellationTokenSource();
        const token = this._cancellationTokenSource.token;
        webviewView.webview.postMessage({ command: 'response-start' });

        // 1. Plan
        const planPrompt = `
You are an expert AI assistant. A user has requested the following task:
---
${message.text}
---
Based on the user's request and the following code context, generate a step-by-step plan to accomplish the task.
---
${context}
---
Your output should only be the plan, with no additional commentary.
`;

        try {
            // Save the selected model and token for the next session
            await this._context.globalState.update('selectedModel', message.model);
            await this._context.globalState.update('token', message.token);

            if (token.isCancellationRequested) return;
            const url = this._context.globalState.get('llm.url') as string || '';
            const plan = await this._llmProvider.prompt(planPrompt, message.model, url, message.token, token);
            if (token.isCancellationRequested) return;
            webviewView.webview.postMessage({ command: 'plan', text: plan });

            // 2. Act
            const actPrompt = `
You are an expert AI assistant. Based on the user's request, the provided context, and the following plan, generate the necessary actions to accomplish the task.

**User Request:**
${message.text}

**Code Context:**
---
${context}
---

**Plan:**
---
${plan}
---

Generate the actions required to execute the plan. Your output must be only the actions, with no additional commentary.
Actions can be creating/modifying files or running terminal commands.

**File Creation Format:**
To create a new file, use a fenced code block with the 'file' identifier and the relative path from the project root. This action will fail if the file already exists.
Example of creating a file:
\`\`\`file:src/new-feature.js
console.log("This is a new feature.");
\`\`\`

**File Patch Format:**
To modify an existing file, use a 'file-patch' block. Inside, provide one or more \`[SEARCH]\` and \`[REPLACE]\` blocks. The \`[SEARCH]\` block must be an *exact* match of the content to be replaced, including indentation and newlines.
Example of patching a file with a single change:
\`\`\`file-patch:src/existing-feature.js
[SEARCH]
// This is an old comment
[/SEARCH]
[REPLACE]
// This is an updated comment
[/REPLACE]
\`\`\`

**Command Action Format:**
Use a fenced code block with the 'command' identifier. The command should be ready to execute.
Example:
\`\`\`command
npm install lodash
\`\`\`

Provide all necessary actions to complete the task.
`;
            if (token.isCancellationRequested) return;
            const actionsResponse = await this._llmProvider.prompt(actPrompt, message.model, url, message.token, token);
            if (token.isCancellationRequested) return;
            
            // For visibility, let the user see the generated actions
            webviewView.webview.postMessage({ command: 'response', text: `**Generated Actions:**\n${actionsResponse}` });

            webviewView.webview.postMessage({ command: 'execution-start' });
            await this.executeActions(actionsResponse, webviewView, token, message);

    } catch (error) {
        if (token.isCancellationRequested) {
            // If cancellation was requested, the error might be due to a canceled request.
            // We can choose to suppress the error message in this case.
            console.log('Task was canceled. Suppressing error.');
            return; // Exit gracefully
        }
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof LLMConnectionError) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(error);
        vscode.window.showErrorMessage(`Error during AI agent processing: ${errorMessage}`);
        webviewView.webview.postMessage({ command: 'response', text: `Error: ${errorMessage}` });
    } finally {
        if (this._cancellationTokenSource) {
            this._cancellationTokenSource.dispose();
            this._cancellationTokenSource = undefined;
        }
        webviewView.webview.postMessage({ command: 'response-end' });
    }
}

private async executeActions(actionsResponse: string, webviewView: vscode.WebviewView, token: vscode.CancellationToken, message: any) {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri;
        if (!workspaceRoot) {
            webviewView.webview.postMessage({ command: 'response', text: "No workspace folder is open. Cannot execute actions." });
            return;
        }

        const actionRegex = /^\`\`\`(\w+)(?::([\w./\\-]+))?\r?\n([\s\S]*?)\r?\n^\`\`\`/gm;
        const actions = [...actionsResponse.matchAll(actionRegex)];
        const actionsExecuted = [];
    
        for (let i = 0; i < actions.length; i++) {
            const match = actions[i];
            if (token.isCancellationRequested) {
                actionsExecuted.push('⏹️ Task execution canceled.');
                break;
            }
            const actionType = match[1];
            const actionArg = match[2];
            let actionContent = match[3];
    
            try {
                                if (actionType === 'file-patch') {
                                    if (!actionArg) {
                                        throw new Error('File patch action requires a path argument.');
                                    }
                                    const filePath = vscode.Uri.joinPath(workspaceRoot, actionArg);
                                    let originalContent;
                                    try {
                                        originalContent = new TextDecoder().decode(await vscode.workspace.fs.readFile(filePath));
                                    } catch (e) {
                                         throw new Error(`File not found for patching: ${actionArg}`);
                                    }
                
                                    const patchRegex = /\[SEARCH\]\r?\n([\s\S]*?)\r?\n\[\/SEARCH\]\r?\n\[REPLACE\]\r?\n([\s\S]*?)\r?\n\[\/REPLACE\]/g;
                                    const patches = [...actionContent.matchAll(patchRegex)];
                
                                    if (patches.length === 0) {
                                        throw new Error(`Invalid patch format for ${actionArg}. Could not find any [SEARCH]/[REPLACE] blocks.`);
                                    }
                
                                    let patchedContent = originalContent;
                                    let patchesApplied = 0;
                                    for (const patch of patches) {
                                        const searchContent = patch[1];
                                        const replaceContent = patch[2];
                                        if (patchedContent.includes(searchContent)) {
                                            patchedContent = patchedContent.replace(searchContent, replaceContent);
                                            patchesApplied++;
                                        } else {
                                            // Immediately show a diff of what has been applied so far and then throw
                                            const diffMessage = `Failed to apply all patches for ${actionArg}. ${patchesApplied} of ${patches.length} applied. SEARCH block not found.`;
                                            vscode.window.showErrorMessage(diffMessage);
                                            // Show a diff of the partially patched file
                                            const originalContentUri = vscode.Uri.file(filePath.fsPath).with({ scheme: 'file-original' });
                                            this._originalFileContentProvider.setOriginalContent(originalContentUri, originalContent);
                                            const tempFilePath = filePath.with({ path: filePath.path + '.tmp-patch' });
                                            await vscode.workspace.fs.writeFile(tempFilePath, new TextEncoder().encode(patchedContent));
                                            await vscode.commands.executeCommand('vscode.diff', originalContentUri, tempFilePath, `Partially Patched: ${actionArg}`);
                                            // Don't delete the temp file so user can inspect it
                                            throw new Error(`SEARCH block not found in ${actionArg} for patch #${patchesApplied + 1}. File content may have changed or the SEARCH block is incorrect.`);
                                        }
                                    }
                
                                    const originalContentUri = vscode.Uri.file(filePath.fsPath).with({ scheme: 'file-original' });
                                    this._originalFileContentProvider.setOriginalContent(originalContentUri, originalContent);
                                    
                                    const tempFilePath = filePath.with({ path: filePath.path + '.tmp-patch' });
                                    await vscode.workspace.fs.writeFile(tempFilePath, new TextEncoder().encode(patchedContent));
                
                                    await vscode.commands.executeCommand('vscode.diff',
                                        originalContentUri,
                                        tempFilePath,
                                        `Proposed Changes for ${actionArg}`
                                    );
                
                                    const choice = await vscode.window.showInformationMessage(
                                        `Apply patch to ${actionArg}?`,
                                        { modal: true },
                                        'Apply',
                                        'Cancel'
                                    );
                                    
                                    await vscode.workspace.fs.delete(tempFilePath);
                
                                    if (choice === 'Apply') {
                                        await vscode.workspace.fs.writeFile(filePath, new TextEncoder().encode(patchedContent));
                                        actionsExecuted.push(`✅ Patched file: ${actionArg}`);
                                    } else {
                                        actionsExecuted.push(`❌ Canceled patch of file: ${actionArg}`);
                                    }
                
                                } else if (actionType === 'file') {
                                    if (!actionArg) {
                                        throw new Error('File action requires a path argument.');
                                    }
                                    const filePath = vscode.Uri.joinPath(workspaceRoot, actionArg);
                                    
                                    let fileExists = false;
                                    try {
                                        await vscode.workspace.fs.stat(filePath);
                                        fileExists = true;
                                    } catch { /* File doesn't exist, which is expected */ }
                
                                    if (fileExists) {
                                        throw new Error(`File ${actionArg} already exists. Use 'file-patch' to modify it.`);
                                    } else {
                                        await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(filePath, '..'));
                                        await vscode.workspace.fs.writeFile(filePath, new TextEncoder().encode(actionContent));
                                        actionsExecuted.push(`✅ Created file: ${actionArg}`);
                                    }
                                } else if (actionType === 'command') {
                    const commandId = crypto.randomUUID();
                    webviewView.webview.postMessage({
                        command: 'interactive-command',
                        commandText: actionContent,
                        commandId: commandId,
                    });

                    const userDecision = await new Promise<string>(resolve => {
                        const cancellationListener = token.onCancellationRequested(() => {
                            resolve('cancel');
                        });
                        this._pendingCommands.set(commandId, (decision) => {
                            cancellationListener.dispose();
                            resolve(decision);
                        });
                    });

                    if (this._pendingCommands.has(commandId)) {
                        this._pendingCommands.delete(commandId);
                    }

                    if (userDecision === 'execute') {
                        let commandSuccess = false;
                        while (!commandSuccess) {
                            if (token.isCancellationRequested) {
                                actionsExecuted.push(`⏹️ Command \`${actionContent.split(/\r?\n/)[0]}\` canceled before execution.`);
                                break;
                            };
                            try {
                                webviewView.webview.postMessage({ command: 'command-output-start', commandId });
                                await this.streamCommandOutput(actionContent, commandId, webviewView, token);
                                actionsExecuted.push(`✅ Executed command: \`${actionContent.split(/\r?\n/)[0]}\``);
                                commandSuccess = true;
                            } catch (error: any) {
                                if (token.isCancellationRequested) {
                                    actionsExecuted.push(`⏹️ Command \`${actionContent.split(/\r?\n/)[0]}\` canceled.`);
                                    break;
                                }
                                
                                actionsExecuted.push(`❌ Error executing command \`${actionContent.split(/\r?\n/)[0]}\`:\n\n**Error:**\n\`\`\`\n${error.message}\n\`\`\``);
                                
                                const choice = await vscode.window.showErrorMessage(
                                    `Command failed: ${actionContent.split(/\r?\n/)[0]}`,
                                    { modal: true },
                                    'Retry',
                                    'Fix',
                                    'Skip',
                                    'Abort'
                                );
    
                                if (choice === 'Retry') {
                                    actionsExecuted.push('⏳ Retrying command...');
                                } else if (choice === 'Fix') {
                                    actionsExecuted.push('🤖 AI is attempting to fix the command...');
                                    webviewView.webview.postMessage({ command: 'response', text: '🤖 AI is attempting to fix the command...' });
                                    const fixPrompt = `
You are an expert AI assistant. A command you previously generated has failed. Analyze the failed command and the error message to provide a corrected command.

**Original Task:**
${message.text}

**Failed Command:**
\`\`\`
${actionContent}
\`\`\`

**Error Message:**
\`\`\`
${error.message}
\`\`\`

Your output should be ONLY the corrected command, with no additional commentary or code fences.
`;
                                    try {
                                        const url = this._context.globalState.get('llm.url') as string || '';
                                        const fixedCommand = await this._llmProvider.prompt(fixPrompt, message.model, url, message.token, token);
                                        const newCommand = fixedCommand.trim();

                                        if (newCommand && newCommand !== actionContent) {
                                            actionContent = newCommand;
                                            actionsExecuted.push(`🤖 AI suggested a fix:\n\`\`\`command\n${actionContent}\n\`\`\``);
                                            webviewView.webview.postMessage({ command: 'response', text: `🤖 AI suggested a fix:\n\`\`\`command\n${actionContent}\n\`\`\`` });
                                        } else {
                                            actionsExecuted.push(`🤖 AI could not find a fix. Retrying original command.`);
                                            webviewView.webview.postMessage({ command: 'response', text: `🤖 AI could not find a fix. Retrying original command.` });
                                        }
                                    } catch (fixError: any) {
                                        actionsExecuted.push(`❌ Error while trying to fix command: ${fixError.message}`);
                                        webviewView.webview.postMessage({ command: 'response', text: `❌ Error while trying to fix command: ${fixError.message}` });
                                    }
                                } else if (choice === 'Skip') {
                                    actionsExecuted.push('⏭️ Skipping command.');
                                    commandSuccess = true;
                                } else {
                                    actionsExecuted.push('⏹️ Aborting task execution.');
                                    if (this._cancellationTokenSource) {
                                        this._cancellationTokenSource.cancel();
                                    }
                                    break;
                                }
                            }
                        }
                    } else if (userDecision === 'ignore') {
                        actionsExecuted.push(`⏭️ Skipped command: \`${actionContent.split(/\r?\n/)[0]}\``);
                    } else { // 'cancel'
                        actionsExecuted.push(`⏹️ Canceled before executing command: \`${actionContent.split(/\r?\n/)[0]}\``);
                    }
                } else {
                    actionsExecuted.push(`⚠️ Unknown action type: ${actionType}`);
                }
            } catch (error: any) {
                actionsExecuted.push(`❌ Error executing action '${actionType}' for '${actionArg || ''}': ${error.message}`);
                console.error(`Action execution error:`, error);
            }
        }
    
        if (actionsExecuted.length > 0) {
            webviewView.webview.postMessage({ command: 'response', text: `**Execution Summary:**\n\n${actionsExecuted.join('\n\n')}` });
        } else if (actions.length === 0) {
            webviewView.webview.postMessage({ command: 'response', text: "No actionable steps were generated from the plan." });
        }
    }

    private streamCommandOutput(command: string, commandId: string, webviewView: vscode.WebviewView, token: vscode.CancellationToken): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : undefined;
            const shell = vscode.workspace.getConfiguration('ai-agent.terminal').get<string>('shell') || undefined;

            const childProcess = spawn(command, {
                cwd,
                shell: true, // Use shell to handle complex commands (e.g., with pipes)
                stdio: ['pipe', 'pipe', 'pipe'] // Pipe stdout and stderr
            });

            const sendChunk = (chunk: any, stream: 'stdout' | 'stderr') => {
                webviewView.webview.postMessage({
                    command: 'command-output-chunk',
                    commandId,
                    stream,
                    chunk: chunk.toString()
                });
            };

            childProcess.stdout.on('data', (data) => sendChunk(data, 'stdout'));
            childProcess.stderr.on('data', (data) => sendChunk(data, 'stderr'));

            childProcess.on('close', (code) => {
                webviewView.webview.postMessage({ command: 'command-output-end', commandId, code });
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command exited with code ${code}`));
                }
            });

            childProcess.on('error', (err) => {
                reject(err);
            });

            token.onCancellationRequested(() => {
                childProcess.kill();
                reject(new Error('Command canceled by user.'));
            });
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <link href="${styleUri}" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            <title>AI Agent</title>
        </head>
        <body>
            <div id="chat-container">
                <div id="message-list"></div>
                <div id="awaiting-response" class="hidden">
                    <div class="dot dot1"></div>
                    <div class="dot dot2"></div>
                    <div class="dot dot3"></div>
                </div>
                <div class="controls-container">
                    <select id="model-selector"></select>
                    <input type="password" id="token-input" placeholder="Optional: Enter token"/>
                </div>
                <div id="input-container">
                    <textarea id="prompt-input" placeholder="Ask a question..."></textarea>
                    <button id="send-button">Send</button>
                    <button id="cancel-button" class="hidden" style="margin-left: 10px;">Cancel</button>
                </div>
            </div>
   <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}

