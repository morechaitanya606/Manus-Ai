export interface GenerateDesignInput {
  prompt: string;
  tenantId: string;
  userId: string;
}

export interface GeneratedDesign {
  imageUrl: string;
  provider: string;
  metadata?: Record<string, unknown>;
}

export interface AIImageProvider {
  generate(input: GenerateDesignInput): Promise<GeneratedDesign>;
}
