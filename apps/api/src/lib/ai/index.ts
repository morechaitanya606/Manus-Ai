import { env } from '../../config/env.js';
import { AIImageProvider } from './provider.js';
import { MockAIProvider } from './mockProvider.js';
import { OpenAIProvider } from './openaiProvider.js';
import { StableDiffusionProvider } from './stableDiffusionProvider.js';

export function buildAIProvider(): AIImageProvider {
  if (env.AI_PROVIDER === 'openai') {
    return new OpenAIProvider();
  }
  if (env.AI_PROVIDER === 'stable-diffusion') {
    return new StableDiffusionProvider();
  }
  return new MockAIProvider();
}
