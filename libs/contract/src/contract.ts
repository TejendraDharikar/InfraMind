import { initContract } from "@ts-rest/core";
import { authenticationContract } from "./authentication/contract";
import { dashboardContract } from "./dashboard/contract";
import { clientContract } from "./client/contract";
import { inframindContract } from "./inframind/contract";

const c = initContract();

type ContractType = {
  authentication: typeof authenticationContract;
  dashboard: typeof dashboardContract;
  client: typeof clientContract;
  inframind: typeof inframindContract;
};

export const contract: ContractType = c.router({
  authentication: authenticationContract,
  dashboard: dashboardContract,
  client: clientContract,
  inframind: inframindContract,
});
