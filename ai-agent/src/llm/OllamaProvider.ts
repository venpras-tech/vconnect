import axios, { AxiosError } from 'axios';
import { ILLMProvider } from './llmProvider';
import { LLMConnectionError } from './errors';

export class OllamaProvider implements ILLMProvider {
    private readonly baseUrl = 'http://localhost:11434'; // Default Ollama URL

    async listModels(): Promise<string[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`);
            return response.data.models.map((model: any) => model.name);
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new LLMConnectionError(`Failed to fetch models from Ollama at ${this.baseUrl}. Please ensure Ollama is running and accessible.`, error);
            }
            throw new LLMConnectionError('An unknown error occurred while fetching models.', error as Error);
        }
    }

    async prompt(prompt: string, model: string, token?: string): Promise<string> {
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: model,
                prompt: prompt,
                stream: false,
            }, { headers });
            return response.data.response;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new LLMConnectionError(`Failed to communicate with Ollama at ${this.baseUrl}. Please ensure the model is available and the service is running correctly.`, error);
            }
            throw new LLMConnectionError('An unknown error occurred while communicating with the LLM.', error as Error);
        }
    }
}

