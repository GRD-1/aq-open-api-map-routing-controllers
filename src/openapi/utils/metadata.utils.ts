import { MetadataArgsStorage } from 'routing-controllers';
import { OpenAPIMapConfig } from '../types';
import { DEFAULT_OPENAPI_SCHEMAS } from '../configs/schemas';
import { SchemaObject, ReferenceObject } from 'routing-controllers-openapi/node_modules/openapi3-ts/dist/model';

export interface OperationMetadata {
  responses?: {
    [key: string]: {
      description: string;
      content?: {
        [key: string]: {
          schema?: SchemaObject | ReferenceObject;
        };
      };
    };
  };
  security?: Array<{ [key: string]: string[] }>;
  [key: string]: any;
}

export function createFilteredMetadataStorage(storage: MetadataArgsStorage, config: OpenAPIMapConfig): MetadataArgsStorage {
  const newStorage = new MetadataArgsStorage();

  newStorage.controllers = storage.controllers.filter(ctrl =>
    config.controllers.some(c => ctrl.target === c || ctrl.target.prototype instanceof c),
  );

  newStorage.actions = storage.actions.filter(action =>
    config.controllers.some(c => action.target === c || action.target.prototype instanceof c),
  );

  newStorage.params = storage.params.filter(param =>
    config.controllers.some(c => {
      const target = typeof param.object === 'function' ? param.object : param.object.constructor;
      return target === c || target.prototype instanceof c;
    }),
  );

  newStorage.responseHandlers = storage.responseHandlers.filter(handler =>
    config.controllers.some(c => handler.target === c || handler.target.prototype instanceof c),
  );

  // Preserve other storage properties
  newStorage.middlewares = storage.middlewares;
  newStorage.interceptors = storage.interceptors;
  newStorage.uses = storage.uses;
  newStorage.useInterceptors = storage.useInterceptors;

  return newStorage;
}

export function processControllerMetadata(
  controller: Function,
  operation: OperationMetadata,
  methodName: string,
): void {
  const openApiResponses = Reflect.getMetadata('openapi:responses', controller.prototype, methodName) || [];
  
  openApiResponses.forEach((responseMetadata: any) => {
    if (!operation.responses) {
      operation.responses = {};
    }

    const { statusCode, description, schema, contentType } = responseMetadata;
    if (!operation.responses[statusCode]) {
      operation.responses[statusCode] = {
        description: description || '',
        content: contentType ? {
          [contentType]: {}
        } : undefined
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
      if (typeof schema === 'string' && DEFAULT_OPENAPI_SCHEMAS[schema]) {
        operation.responses[statusCode].content[contentType].schema = DEFAULT_OPENAPI_SCHEMAS[schema];
      } else {
        operation.responses[statusCode].content[contentType].schema = schema;
      }
    }
  });

  const openApiMetadata = Reflect.getMetadata('openapi', controller.prototype, methodName) ||
    Reflect.getMetadata('routing-controllers:openapi', controller.prototype, methodName);

  if (openApiMetadata?.security) {
    operation.security = openApiMetadata.security;
  } else {
    delete operation.security;
  }
} 