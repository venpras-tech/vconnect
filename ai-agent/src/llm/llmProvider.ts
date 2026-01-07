import { CancellationToken } from "vscode";

export interface ILLMProvider {
    listModels(baseUrl: string): Promise<string[]>;
    prompt(prompt: string, model: string, baseUrl: string, token: string | undefined, cancellationToken: CancellationToken): Promise<string>;
}