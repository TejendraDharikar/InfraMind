import { z } from 'zod';

export const CreateWebhookBodySchema = z.object({
  name: z.string(),
  url: z.string().url(),
  events: z.string(),
  isActive: z.boolean().default(true).optional(),
});

export type CreateWebhookBody = z.infer<typeof CreateWebhookBodySchema>;
