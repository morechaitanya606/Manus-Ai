import { z } from 'zod';

export const tenantSlugParams = z.object({
  slug: z.string().min(2)
});
