import axios, { AxiosError } from 'axios';
import { CancellationToken } from 'vscode';
import { ILLMProvider } from './llmProvider';
import { LLMConnectionError } from './errors';

export class OllamaProvider implements ILLMProvider {
    async listModels(baseUrl: string): Promise<string[]> {
        try {
            const response = await axios.get(`${baseUrl}/api/tags`);
            return response.data.models.map((model: any) => model.name);
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new LLMConnectionError(`Failed to fetch models from Ollama at ${baseUrl}. Please ensure Ollama is running and accessible.`, error);
            }
            throw new LLMConnectionError('An unknown error occurred while fetching models.', error as Error);
        }
    }

    async prompt(prompt: string, model: string, baseUrl: string, token: string | undefined, cancellationToken: CancellationToken): Promise<string> {
        const controller = new AbortController();
        cancellationToken.onCancellationRequested(() => {
            controller.abort();
        });

        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.post(`${baseUrl}/api/generate`, {
                model: model,
                prompt: prompt,
                stream: false,
            }, { headers, signal: controller.signal });
            return response.data.response;
        } catch (error) {
            if (axios.isCancel(error)) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new LLMConnectionError(`Failed to communicate with Ollama at ${baseUrl}. Please ensure the model is available and the service is running correctly.`, error);
            }
            throw new LLMConnectionError('An unknown error occurred while communicating with the LLM.', error as Error);
        }
    }
}

