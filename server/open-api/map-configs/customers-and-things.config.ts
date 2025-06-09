import { IOpenAPIMapConfig } from "../types";
import ThingsController from "../../things/things.controller";
import CustomersController from "../../customers/customers.controller";
import path from "path";
import { OPENAPI_CONFIG } from "../config";

export const customersAndThingsConfig: IOpenAPIMapConfig = {
  controllers: [ThingsController, CustomersController],
  info: {
    title: "AQ Open API Map - Customers and Things Controllers",
    version: "1.0.0",
    description: "API documentation for Customers and Things controllers",
  },
  outputPath: path.join(
    process.cwd(),
    OPENAPI_CONFIG.OUTPUT_FOLDER,
    "customers-and-things.json"
  ),
};
