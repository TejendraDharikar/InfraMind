import { z } from 'zod';

export const ServerStatusSchema = z.enum(['stable', 'warning', 'unhealthy', 'offline']);

export const GetServersQuerySchema = z.object({
  status: ServerStatusSchema.optional(),
  limit: z.coerce.number().default(100),
  offset: z.coerce.number().default(0),
});

export const CreateServerBodySchema = z.object({
  name: z.string(),
  hostName: z.string(),
  status: ServerStatusSchema.default('stable'),
});

export const UpdateServerBodySchema = z.object({
  name: z.string().optional(),
  hostName: z.string().optional(),
  status: ServerStatusSchema.optional(),
});

export type GetServersQuery = z.infer<typeof GetServersQuerySchema>;
export type CreateServerBody = z.infer<typeof CreateServerBodySchema>;
export type UpdateServerBody = z.infer<typeof UpdateServerBodySchema>;
