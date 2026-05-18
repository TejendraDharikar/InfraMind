import { initContract } from "@ts-rest/core";
import { ErrorSchema } from "../common";
import {
  ClientRegisterResponseSchema,
  ClientRegisterSchema,
  VerifyClientSchema,
} from "./schema";
import z from "zod";

const c = initContract();

export const clientContract = c.router({
  registerClient: {
    method: "POST",
    path: "/client/client-management/registerClient",
    body: ClientRegisterSchema,
    responses: {
      200: ClientRegisterResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Register a new client",
  },
  verifyClient: {
    method: "POST",
    path: "/client/client-management/verifyClient",
    responses: {
      200: VerifyClientSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    body: z.object({
      otp: z.string(),
      clientId: z.string(),
    }),
    summary: "Verify a client",
  },
});
