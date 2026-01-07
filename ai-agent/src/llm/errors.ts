export class LLMConnectionError extends Error {
    constructor(message: string, public cause?: Error) {
        super(message);
        this.name = 'LLMConnectionError';
    }
}