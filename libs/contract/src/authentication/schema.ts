import z from "zod";

export const UserAndAdminDataSchema = z.discriminatedUnion("userType", [
  z.object({
    userType: z.literal("user"),
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  z.object({
    userType: z.literal("admin"),
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  z.object({
    userType: z.literal("superadmin"),
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
]);

export type TUserAndAdminDataSchema = z.infer<typeof UserAndAdminDataSchema>;
