// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OllamaProvider } from './llm/OllamaProvider';
import { TextEncoder, TextDecoder } from 'util';
import { LLMConnectionError } from './llm/errors';
import { exec } from 'child_process';

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
                case 'load':
                    try {
                        const models = await this._llmProvider.listModels();
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
                // To avoid sending overly large files, truncate if necessary
                const maxChars = 8000; // Approx. 2k tokens
                if (fullText.length > maxChars) {
                    context += `// Full content (truncated):\n${fullText.substring(0, maxChars)}...\n\n`;
                } else {
                    context += `// Full content:\n${fullText}\n\n`;
                }
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

            const plan = await this._llmProvider.prompt(planPrompt, message.model, message.token);
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

**File Action Format:**
Use a fenced code block with the 'file' identifier and the relative path from the project root.
Example:
\`\`\`file:src/new-feature.js
console.log("This is a new feature.");
\`\`\`

**Command Action Format:**
Use a fenced code block with the 'command' identifier. The command should be ready to execute.
Example:
\`\`\`command
npm install lodash
\`\`\`

Provide all necessary actions to complete the task.
`;
            const actionsResponse = await this._llmProvider.prompt(actPrompt, message.model, message.token);
            
            // For visibility, let the user see the generated actions
            webviewView.webview.postMessage({ command: 'response', text: `**Generated Actions:**\n${actionsResponse}` });

            await this.executeActions(actionsResponse, webviewView);

    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof LLMConnectionError) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(error);
        vscode.window.showErrorMessage(`Error during AI agent processing: ${errorMessage}`);
        webviewView.webview.postMessage({ command: 'response', text: `Error: ${errorMessage}` });
    }
}

private async executeActions(actionsResponse: string, webviewView: vscode.WebviewView) {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri;
        if (!workspaceRoot) {
            webviewView.webview.postMessage({ command: 'response', text: "No workspace folder is open. Cannot execute actions." });
            return;
        }

        const actionRegex = /^\`\`\`(\w+)(?::([\w./\\-]+))?\r?\n([\s\S]*?)\r?\n^\`\`\`/gm;
        const actions = [...actionsResponse.matchAll(actionRegex)];
        const actionsExecuted = [];
    
        for (const match of actions) {
            const actionType = match[1];
            const actionArg = match[2];
            const actionContent = match[3];
    
            try {
                if (actionType === 'file') {
                    if (!actionArg) {
                        throw new Error('File action requires a path argument.');
                    }
                    const filePath = vscode.Uri.joinPath(workspaceRoot, actionArg);
                    let fileExists = false;
                    try {
                        await vscode.workspace.fs.stat(filePath);
                        fileExists = true;
                    } catch {
                        // File doesn't exist
                    }

                    if (fileExists) {
                        // File exists, show diff and ask for confirmation
                        const originalContent = new TextDecoder().decode(await vscode.workspace.fs.readFile(filePath));
                        const newContent = actionContent;

                        const originalContentUri = vscode.Uri.file(filePath.fsPath).with({ scheme: 'file-original', query: `original=${filePath.toString()}` });
                        this._originalFileContentProvider.setOriginalContent(originalContentUri, originalContent);

                        await vscode.commands.executeCommand('vscode.diff',
                            originalContentUri,
                            filePath,
                            `Original vs. Proposed Changes for ${actionArg}`
                        );

                        const choice = await vscode.window.showInformationMessage(
                            `Apply changes to ${actionArg}?`,
                            { modal: true },
                            'Apply',
                            'Cancel'
                        );

                        if (choice === 'Apply') {
                            await vscode.workspace.fs.writeFile(filePath, new TextEncoder().encode(newContent));
                            actionsExecuted.push(`✅ Modified file: ${actionArg}`);
                        } else {
                            actionsExecuted.push(`❌ Canceled modification of file: ${actionArg}`);
                        }
                    } else {
                        // File doesn't exist, create it
                        await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(filePath, '..'));
                        await vscode.workspace.fs.writeFile(filePath, new TextEncoder().encode(actionContent));
                        actionsExecuted.push(`✅ Created file: ${actionArg}`);
                    }
                } else if (actionType === 'command') {
                    try {
                        const output = await new Promise<string>((resolve, reject) => {
                            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                            const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : undefined;

                            exec(actionContent, { cwd }, (error, stdout, stderr) => {
                                if (error) {
                                    const errorMessage = `Command failed: ${error.message}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
                                    reject(new Error(errorMessage));
                                    return;
                                }
                                let result = '';
                                if (stdout) {
                                    result += `STDOUT:\n${stdout}\n`;
                                }
                                if (stderr) {
                                    result += `STDERR:\n${stderr}\n`;
                                }
                                resolve(result.trim() || 'Command executed successfully with no output.');
                            });
                        });
                        actionsExecuted.push(`✅ Executed command: \`${actionContent.split(/\r?\n/)[0]}\`\n\n**Output:**\n\`\`\`\n${output}\n\`\`\``);
                    } catch (error: any) {
                        actionsExecuted.push(`❌ Error executing command \`${actionContent.split(/\r?\n/)[0]}\`:\n\n**Error:**\n\`\`\`\n${error.message}\n\`\`\``);
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
                <div class="controls-container">
                    <select id="model-selector"></select>
                    <input type="password" id="token-input" placeholder="Optional: Enter token"/>
                </div>
                <div id="input-container">
                    <textarea id="prompt-input" placeholder="Ask a question..."></textarea>
                    <button id="send-button">Send</button>
                </div>
            </div>
   <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}

