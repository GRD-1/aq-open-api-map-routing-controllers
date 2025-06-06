import { MetadataArgsStorage } from "routing-controllers";
import {
  IOpenAPIMapConfig,
  IClass,
  IOpenAPISpec,
  IOperationMetadata,
} from "../types";
import { DEFAULT_OPENAPI_SCHEMAS } from "../configs/schemas";
import {
  SchemaObject,
  ReferenceObject,
} from "routing-controllers-openapi/node_modules/openapi3-ts/dist/model";

export function createFilteredMetadataStorage(
  storage: MetadataArgsStorage,
  config: IOpenAPIMapConfig
): MetadataArgsStorage {
  const newStorage = new MetadataArgsStorage();

  newStorage.controllers = storage.controllers.filter((ctrl) =>
    config.controllers.some(
      (c) => ctrl.target === c || ctrl.target.prototype instanceof c
    )
  );

  newStorage.actions = storage.actions.filter((action) =>
    config.controllers.some(
      (c) => action.target === c || action.target.prototype instanceof c
    )
  );

  newStorage.params = storage.params.filter((param) =>
    config.controllers.some((c) => {
      const target =
        typeof param.object === "function"
          ? param.object
          : param.object.constructor;
      return target === c || target.prototype instanceof c;
    })
  );

  newStorage.responseHandlers = storage.responseHandlers.filter((handler) =>
    config.controllers.some(
      (c) => handler.target === c || handler.target.prototype instanceof c
    )
  );

  // Preserve other storage properties
  newStorage.middlewares = storage.middlewares;
  newStorage.interceptors = storage.interceptors;
  newStorage.uses = storage.uses;
  newStorage.useInterceptors = storage.useInterceptors;

  return newStorage;
}

export function processControllerMetadata(
  controller: IClass,
  operation: IOperationMetadata,
  methodName: string
): void {
  const openApiResponses =
    Reflect.getMetadata(
      "openapi:responses",
      controller.prototype,
      methodName
    ) || [];

  openApiResponses.forEach((responseMetadata: any) => {
    if (!operation.responses) {
      operation.responses = {};
    }

    const { statusCode, description, schema, contentType } = responseMetadata;
    if (!operation.responses[statusCode]) {
      operation.responses[statusCode] = {
        description: description || "",
        content: contentType
          ? {
              [contentType]: {},
            }
          : undefined,
      };
    }

    if (schema && contentType) {
      if (!operation.responses[statusCode].content) {
        operation.responses[statusCode].content = {};
      }
      if (!operation.responses[statusCode].content[contentType]) {
        operation.responses[statusCode].content[contentType] = {};
      }

      // If schema is a reference to DEFAULT_OPENAPI_SCHEMAS
      if (typeof schema === "string" && DEFAULT_OPENAPI_SCHEMAS[schema]) {
        operation.responses[statusCode].content[contentType].schema =
          DEFAULT_OPENAPI_SCHEMAS[schema];
      } else {
        operation.responses[statusCode].content[contentType].schema = schema;
      }
    }
  });

  const openApiMetadata =
    Reflect.getMetadata("openapi", controller.prototype, methodName) ||
    Reflect.getMetadata(
      "routing-controllers:openapi",
      controller.prototype,
      methodName
    );

  if (openApiMetadata?.security) {
    operation.security = openApiMetadata.security;
  } else {
    delete operation.security;
  }
}

export function updateControllerMetadata(
  controller: IClass,
  metadata: any,
  spec: IOpenAPISpec
): void {
  const controllerName = controller.name
    .replace("Controller", "")
    .split(/(?=[A-Z])/)
    .join(" ");
  const tagName = metadata.tags?.[0] || controllerName;

  let tag = spec.tags.find((t) => t.name === tagName);
  if (!tag) {
    tag = { name: tagName, description: metadata.description };
    spec.tags.push(tag);
  } else {
    tag.description = metadata.description;
  }

  Object.entries(spec.paths || {}).forEach(([, pathItem]) => {
    Object.entries(pathItem).forEach(([, operation]) => {
      if (operation.operationId?.startsWith(`${controller.name}.`)) {
        operation.tags = [tagName];
        const methodName = operation.operationId.split(".").pop();
        if (methodName) {
          processControllerMetadata(
            controller,
            operation as IOperationMetadata,
            methodName
          );
        }
      }
    });
  });

  const controllerOpenApi =
    Reflect.getMetadata("openapi", controller) ||
    Reflect.getMetadata("routing-controllers:openapi", controller);

  if (controllerOpenApi) {
    if (controllerOpenApi.components?.securitySchemes) {
      if (!spec.components) spec.components = {};
      if (!spec.components.securitySchemes)
        spec.components.securitySchemes = {};
      Object.assign(
        spec.components.securitySchemes,
        controllerOpenApi.components.securitySchemes
      );
    }

    if (controllerOpenApi.security) {
      spec.security = controllerOpenApi.security;
    }
  }
}
