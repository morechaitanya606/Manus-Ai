import sharp from 'sharp';

export interface MockupInput {
  designImage: Buffer;
  apparelTemplate: Buffer;
  placementX: number;
  placementY: number;
  scale: number;
}

export async function renderMockup(input: MockupInput): Promise<Buffer> {
  const template = sharp(input.apparelTemplate).resize(1200, 1200);
  const designMeta = await sharp(input.designImage).metadata();
  const width = Math.max(120, Math.floor((designMeta.width ?? 600) * input.scale));
  const height = Math.max(120, Math.floor((designMeta.height ?? 600) * input.scale));

  const designLayer = await sharp(input.designImage)
    .resize(width, height)
    .modulate({ brightness: 0.95, saturation: 1.05 })
    .webp({ quality: 90 })
    .toBuffer();

  return template
    .composite([
      {
        input: designLayer,
        left: Math.max(0, Math.floor(input.placementX)),
        top: Math.max(0, Math.floor(input.placementY)),
        blend: 'overlay'
      }
    ])
    .webp({ quality: 88 })
    .toBuffer();
}
