import z from "zod";

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  role: z.string(),
  organization: z.string(),
  subscription: z.string(),
  status: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type TClientSchema = z.infer<typeof ClientSchema>;

export const ClientRegisterSchema = ClientSchema.extend({
  password: z.string(),
  confirmPassword: z.string(),
});

export type TClientRegisterSchema = z.infer<typeof ClientRegisterSchema>;
export const ClientUpdateSchema = ClientSchema.extend({
  password: z.string(),
  confirmPassword: z.string(),
});

export const VerifyClientSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type TClientUpdateSchema = z.infer<typeof ClientUpdateSchema>;

export const ClientLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type TClientLoginSchema = z.infer<typeof ClientLoginSchema>;

export const ClientLogoutSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type TClientLogoutSchema = z.infer<typeof ClientLogoutSchema>;

export const ClientForgotPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
});

export type TClientForgotPasswordSchema = z.infer<
  typeof ClientForgotPasswordSchema
>;

export const ClientRegisterResponseSchema = z.object({
  message: z.string(),
});

export type TClientRegisterResponseSchema = z.infer<
  typeof ClientRegisterResponseSchema
>;
