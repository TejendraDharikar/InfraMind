import { initContract } from "@ts-rest/core";
import { ErrorSchema } from "../common";
import { UserAndAdminDataSchema } from "./schema";

const c = initContract();

export const authenticationContract = c.router({
  getUserAndAdminData: {
    method: "GET",
    path: "/userAndAdmin",
    responses: {
      200: UserAndAdminDataSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get user and admin data",
  },
});
