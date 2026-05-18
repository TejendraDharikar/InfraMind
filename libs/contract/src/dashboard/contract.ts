import { initContract } from "@ts-rest/core";
import { ErrorSchema } from "../common";
import { DashboardSummarySchema } from "./schema";

const c = initContract();

export const dashboardContract = c.router({
  getDashboardSummary: {
    method: "GET",
    path: "/dashboard/summary",
    responses: {
      200: DashboardSummarySchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get dashboard summary data",
  },
});
