import { AIImageProvider, GenerateDesignInput, GeneratedDesign } from './provider.js';
import { env } from '../../config/env.js';

export class OpenAIProvider implements AIImageProvider {
  async generate(input: GenerateDesignInput): Promise<GeneratedDesign> {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Provider call intentionally abstracted for portability.
    // Replace with the current OpenAI image generation request as needed.
    const fallback = encodeURIComponent(input.prompt.slice(0, 48));
    return {
      imageUrl: `https://picsum.photos/seed/openai-${fallback}/1024/1024`,
      provider: 'openai',
      metadata: {
        mode: 'placeholder-response'
      }
    };
  }
}
