import 'reflect-metadata';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { OpenAPIObject, ResponseObject, ParameterObject, SecuritySchemeObject, ComponentsObject, SchemaObject, ReferenceObject } from 'routing-controllers-openapi/node_modules/openapi3-ts/dist/model/OpenApi';
import fs from 'fs';
import path from 'path';
import { OpenAPIMapConfig } from './types';
import { MetadataArgsStorage } from 'routing-controllers';

interface OpenAPISpec extends OpenAPIObject {
  tags: Array<{ name: string; description: string }>;
  paths: {
    [path: string]: {
      [method: string]: {
        operationId?: string;
        tags?: string[];
        security?: Array<{ [key: string]: string[] }>;
        [key: string]: any;
      };
    };
  };
  components?: ComponentsObject;
}

function findSchemaRefs(obj: any, refs: Set<string>) {
  if (!obj || typeof obj !== 'object') return;
  
  if (obj.$ref && typeof obj.$ref === 'string') {
    const match = obj.$ref.match(/#\/components\/schemas\/([^/]+)/);
    if (match) {
      refs.add(match[1]);
    }
  }
  
  for (const value of Object.values(obj)) {
    findSchemaRefs(value, refs);
  }
}

export function generateOpenAPISpec(config: OpenAPIMapConfig) {
  console.log('config', config);
  // Get metadata from routing-controllers
  const storage = getMetadataArgsStorage();
  
  // Create a new storage instance with filtered metadata
  const newStorage = new MetadataArgsStorage();
  
  // Filter and copy controller metadata
  newStorage.controllers = storage.controllers.filter(ctrl => 
    config.controllers.some(c => ctrl.target === c || ctrl.target.prototype instanceof c)
  );
  
  // Filter and copy action metadata
  newStorage.actions = storage.actions.filter(action => 
    config.controllers.some(c => action.target === c || action.target.prototype instanceof c)
  );
  
  // Filter and copy param metadata
  newStorage.params = storage.params.filter(param => 
    config.controllers.some(c => {
      const target = typeof param.object === 'function' ? param.object : param.object.constructor;
      return target === c || target.prototype instanceof c;
    })
  );
  
  // Filter and copy response handler metadata
  newStorage.responseHandlers = storage.responseHandlers.filter(handler => 
    config.controllers.some(c => handler.target === c || handler.target.prototype instanceof c)
  );

  // Copy other metadata as is since they're not controller-specific
  newStorage.middlewares = storage.middlewares;
  newStorage.interceptors = storage.interceptors;
  newStorage.uses = storage.uses;
  newStorage.useInterceptors = storage.useInterceptors;

  const schemas = validationMetadatasToSchemas() as Record<string, SchemaObject | ReferenceObject>;
  const usedSchemas = new Set<string>();

  // Generate initial spec with schemas
  const spec = routingControllersToSpec(
    newStorage,
    { 
      controllers: config.controllers,
      routePrefix: '/api/v1',
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
        schemas,
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token in the format: Bearer <token>'
          } as SecuritySchemeObject
        }
      },
      info: config.info,
      tags: []
    },
  ) as OpenAPISpec;

  // Add controller metadata to tags and collect used schemas
  config.controllers.forEach(controller => {
    const metadata = Reflect.getMetadata('openapi:controller:desc', controller);
    if (metadata) {
      const controllerName = controller.name.replace('Controller', '').split(/(?=[A-Z])/).join(' ');
      const tagName = metadata.tags?.[0] || controllerName;
      
      // Find existing tag or create one
      let tag = spec.tags.find(t => t.name === tagName);
      if (!tag) {
        tag = { name: tagName, description: metadata.description };
        spec.tags.push(tag);
      } else {
        tag.description = metadata.description;
      }

      // Process each method in the controller
      Object.entries(spec.paths || {}).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
          if (operation.operationId?.startsWith(controller.name + '.')) {
            operation.tags = [tagName];
            
            const methodName = operation.operationId.split('.').pop();
            if (methodName) {
              // Collect schemas from request body
              if (operation.requestBody?.content?.['application/json']?.schema) {
                findSchemaRefs(operation.requestBody.content['application/json'].schema, usedSchemas);
              }

              // Collect schemas from responses
              if (operation.responses) {
                Object.values(operation.responses).forEach(response => {
                  const res = response as ResponseObject;
                  if (res.content?.['application/json']?.schema) {
                    findSchemaRefs(res.content['application/json'].schema, usedSchemas);
                  }
                });
              }

              // Collect schemas from parameters
              if (operation.parameters) {
                operation.parameters.forEach((param: ParameterObject) => {
                  if (param.schema) {
                    findSchemaRefs(param.schema, usedSchemas);
                  }
                });
              }

              // Handle security
              const openApiMetadata = Reflect.getMetadata('openapi', controller.prototype, methodName) ||
                                    Reflect.getMetadata('routing-controllers:openapi', controller.prototype, methodName);
              if (openApiMetadata?.security) {
                operation.security = openApiMetadata.security;
              } else {
                delete operation.security;
                delete spec.security;
              }
            }
          }
        });
      });

      // Handle controller-level OpenAPI metadata
      const controllerOpenApi = Reflect.getMetadata('openapi', controller) ||
                               Reflect.getMetadata('routing-controllers:openapi', controller);
      if (controllerOpenApi) {
        if (controllerOpenApi.components?.securitySchemes) {
          if (!spec.components) {
            spec.components = {};
          }
          if (!spec.components.securitySchemes) {
            spec.components.securitySchemes = {};
          }
          Object.assign(spec.components.securitySchemes, controllerOpenApi.components.securitySchemes);
        }

        if (controllerOpenApi.security) {
          spec.security = controllerOpenApi.security;
        }
      }
    }
  });

  // Filter schemas to only include those that are used
  const filteredSchemas: Record<string, SchemaObject | ReferenceObject> = {};
  for (const [name, schema] of Object.entries(schemas)) {
    if (usedSchemas.has(name)) {
      filteredSchemas[name] = schema;
    }
  }

  // Update spec with filtered schemas
  spec.components = spec.components || {};
  spec.components.schemas = filteredSchemas;

  // Create the output directory if it doesn't exist
  const outputDir = path.dirname(config.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the OpenAPI spec to a file
  fs.writeFileSync(config.outputPath, JSON.stringify(spec, null, 2));
  console.log('OpenAPI specification has been generated successfully!');
  console.log(`File written to: ${config.outputPath}`);

  return spec;
}

// Only run if this file is being executed directly
if (require.main === module) {
  const { allConfig } = require('./configs/all.config');
  generateOpenAPISpec(allConfig);
} 