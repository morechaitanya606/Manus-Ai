import { AIImageProvider, GenerateDesignInput, GeneratedDesign } from './provider.js';
import { env } from '../../config/env.js';

export class StableDiffusionProvider implements AIImageProvider {
  async generate(input: GenerateDesignInput): Promise<GeneratedDesign> {
    if (!env.STABLE_DIFFUSION_API_KEY) {
      throw new Error('STABLE_DIFFUSION_API_KEY is not configured');
    }

    const fallback = encodeURIComponent(input.prompt.slice(0, 48));
    return {
      imageUrl: `https://picsum.photos/seed/sd-${fallback}/1024/1024`,
      provider: 'stable-diffusion',
      metadata: {
        mode: 'placeholder-response'
      }
    };
  }
}
