export interface ILLMProvider {
    listModels(): Promise<string[]>;
    prompt(prompt: string, model: string, token?: string): Promise<string>;
}