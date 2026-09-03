import z from "zod";

export const ErrorSchema = z.object({
  message: z.string(),
});

export type ErrorSchema = z.infer<typeof ErrorSchema>;

export const SuccessSchema = z.object({
  message: z.string(),
});

export type SuccessSchema = z.infer<typeof SuccessSchema>;

export const PaginationInputSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  search: z.string().nullable(),
});

export type TPaginationInputSchema = z.infer<typeof PaginationInputSchema>;

export const PaginationResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
});

export type TPaginationResponseSchema<T> = z.infer<
  typeof PaginationResponseSchema
>;

export const userTypeSchema = z.enum(["superadmin", "user"]);
export type TUserTypeSchema = z.infer<typeof userTypeSchema>;
