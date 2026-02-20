import { AIImageProvider, GenerateDesignInput, GeneratedDesign } from './provider.js';

export class MockAIProvider implements AIImageProvider {
  async generate(input: GenerateDesignInput): Promise<GeneratedDesign> {
    const encodedPrompt = encodeURIComponent(input.prompt.slice(0, 48));
    return {
      imageUrl: `https://picsum.photos/seed/${encodedPrompt}/1024/1024`,
      provider: 'mock',
      metadata: {
        note: 'Mock provider used. Configure OPENAI_API_KEY or STABLE_DIFFUSION_API_KEY for real generation.'
      }
    };
  }
}
