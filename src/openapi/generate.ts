import "reflect-metadata";
import fs from "fs";
import path from "path";

import { getMetadataArgsStorage } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import {
  ReferenceObject,
  SchemaObject,
  SecuritySchemeObject,
} from "routing-controllers-openapi/node_modules/openapi3-ts/dist/model";

import { DEFAULT_OPENAPI_SCHEMAS } from "./configs/schemas";

import { IOpenAPIMapConfig, IOpenAPISpec } from "./types";

import { allConfig } from "./configs/all.config";
import {
  updateSchemaRefs,
  addSchemaWithDependencies,
  processSchemaAliases,
} from "./utils/schema.utils";
import {
  createFilteredMetadataStorage,
  updateControllerMetadata,
} from "./utils/metadata.utils";

export function generateOpenAPISpec(config: IOpenAPIMapConfig): IOpenAPISpec {
  // Get and filter metadata storage
  const storage = getMetadataArgsStorage();
  const newStorage = createFilteredMetadataStorage(storage, config);

  // Generate schemas from validation metadata
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: "#/components/schemas/",
  }) as Record<string, SchemaObject | ReferenceObject>;

  // Initialize tracking maps
  const schemaAliases = new Map<string, string>();
  const responseTypes = new Map<string, any>();
  const responseSchemas = new Map<string, SchemaObject | ReferenceObject>();
  const requestBodyUpdates = new Map<string, string>();
  const filteredSchemas: Record<string, SchemaObject | ReferenceObject> = {};

  // Process controller metadata and collect schemas
  config.controllers.forEach((controller) => {
    Object.getOwnPropertyNames(controller.prototype).forEach((methodName) => {
      const responseAliases = (Reflect.getMetadata(
        "openapi:response:aliases",
        controller.prototype,
        methodName
      ) || {}) as Record<string, string>;
      const requestAliases = (Reflect.getMetadata(
        "openapi:request:aliases",
        controller.prototype,
        methodName
      ) || {}) as Record<string, string>;
      const responseType = Reflect.getMetadata(
        "routing-controllers:response-type",
        controller.prototype,
        methodName
      );
      const requestType = Reflect.getMetadata(
        "routing-controllers:request-type",
        controller.prototype,
        methodName
      );

      // Process response type and aliases
      if (responseType) {
        const methodKey = `${controller.name}.${methodName}`;
        responseTypes.set(methodKey, responseType);

        if (
          Object.keys(responseAliases).length === 0 &&
          schemas[responseType.name]
        ) {
          addSchemaWithDependencies(
            schemas[responseType.name],
            responseType.name,
            schemas,
            filteredSchemas
          );
        }

        Object.entries(responseAliases).forEach(([typeName, alias]) => {
          processSchemaAliases(
            typeName,
            alias,
            schemas,
            schemaAliases,
            filteredSchemas,
            responseSchemas
          );
        });
      }

      // Process request type and aliases
      if (requestType) {
        if (
          Object.keys(requestAliases).length === 0 &&
          schemas[requestType.name]
        ) {
          addSchemaWithDependencies(
            schemas[requestType.name],
            requestType.name,
            schemas,
            filteredSchemas
          );
        }

        Object.entries(requestAliases).forEach(([typeName, alias]) => {
          processSchemaAliases(
            typeName,
            alias,
            schemas,
            schemaAliases,
            filteredSchemas
          );
        });

        const mainRequestAlias = requestAliases[requestType.name];
        if (mainRequestAlias) {
          requestBodyUpdates.set(requestType.name, mainRequestAlias);
        }
      }
    });
  });

  // Generate initial OpenAPI spec
  const spec = routingControllersToSpec(
    newStorage,
    {
      controllers: config.controllers,
      routePrefix: "",
      defaults: {
        paramOptions: {
          required: true,
        },
      },
      classTransformer: true,
      validation: true,
      development: false,
    },
    {
      components: {
        schemas: { ...schemas, ...DEFAULT_OPENAPI_SCHEMAS },
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter your JWT token in the format: Bearer <token>",
          } as SecuritySchemeObject,
        },
      },
      info: config.info,
      tags: [],
    }
  ) as IOpenAPISpec;

  // Process paths and update references
  Object.values(spec.paths).forEach((pathItem) => {
    Object.values(pathItem).forEach((operation: any) => {
      if (operation.requestBody?.description) {
        const alias = requestBodyUpdates.get(operation.requestBody.description);
        if (alias) {
          operation.requestBody.description = alias;
        }
      }
    });
  });

  // Process controller metadata and update spec
  config.controllers.forEach((controller) => {
    const metadata = Reflect.getMetadata("openapi:controller:desc", controller);
    if (metadata) {
      updateControllerMetadata(controller, metadata, spec);
    }
  });

  // Update schema references
  updateSchemaRefs(spec, schemaAliases);
  spec.components = spec.components || {};
  spec.components.schemas = filteredSchemas;

  // Write spec to file
  const outputDir = path.dirname(config.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(config.outputPath, JSON.stringify(spec, null, 2));
  console.log("OpenAPI specification has been generated successfully!");
  console.log(`File written to: ${config.outputPath}`);

  return spec;
}

if (require.main === module) {
  generateOpenAPISpec(allConfig);
}
