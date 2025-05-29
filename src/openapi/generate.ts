import 'reflect-metadata';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { OpenAPIObject, ResponseObject, ParameterObject, SecuritySchemeObject, ComponentsObject, SchemaObject, ReferenceObject } from 'routing-controllers-openapi/node_modules/openapi3-ts/dist/model/OpenApi';
import fs from 'fs';
import path from 'path';
import { OpenAPIMapConfig } from './types';
import { MetadataArgsStorage } from 'routing-controllers';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';

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

interface RefObject {
  $ref: string;
}

function isRefObject(value: unknown): value is RefObject {
  return typeof value === 'object' && value !== null && '$ref' in value && typeof (value as any).$ref === 'string';
}

function findSchemaRefs(obj: any, refs: Set<string>) {
  if (!obj || typeof obj !== 'object') return;
  
  if (obj.$ref && typeof obj.$ref === 'string') {
    const match = obj.$ref.match(/#\/components\/schemas\/([^/]+)/);
    if (match) {
      refs.add(match[1]);
    }
  }
  
  // Handle array items
  if (obj.items && obj.items.$ref) {
    const match = obj.items.$ref.match(/#\/components\/schemas\/([^/]+)/);
    if (match) {
      refs.add(match[1]);
    }
  }
  
  for (const value of Object.values(obj)) {
    findSchemaRefs(value, refs);
  }
}

export function generateOpenAPISpec(config: OpenAPIMapConfig) {
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

  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: '#/components/schemas/'
  }) as Record<string, SchemaObject | ReferenceObject>;

  const usedSchemas = new Set<string>();
  const schemaAliases = new Map<string, string>();
  const methodSchemaMap = new Map<string, string>();
  const filteredSchemas: Record<string, SchemaObject | ReferenceObject> = {};

  // First pass: collect all schema aliases and map them to method+schema combinations
  const responseTypes = new Map<string, Function>();
  const responseSchemas = new Map<string, SchemaObject | ReferenceObject>();
  const requestBodyUpdates = new Map<string, string>();

  // Helper function to add schema and its nested types
  const addSchemaWithNested = (schema: any, typeName: string) => {
    if (!schema) return;
    
    // Add the main schema
    filteredSchemas[typeName] = schema;
    
    // Find and add nested types
    if (schema.properties) {
      Object.values(schema.properties).forEach((prop: any) => {
        // Handle nested objects with @Type decorator
        if (prop.type === 'object' && prop.$ref) {
          const nestedTypeName = prop.$ref.split('/').pop();
          if (nestedTypeName && schemas[nestedTypeName]) {
            addSchemaWithNested(schemas[nestedTypeName], nestedTypeName);
          }
        }
        // Handle arrays with nested types
        if (prop.type === 'array' && prop.items?.$ref) {
          const nestedTypeName = prop.items.$ref.split('/').pop();
          if (nestedTypeName && schemas[nestedTypeName]) {
            addSchemaWithNested(schemas[nestedTypeName], nestedTypeName);
          }
        }
      });
    }
  };

  // First pass: collect all schema aliases and map them to method+schema combinations
  config.controllers.forEach(controller => {
    Object.getOwnPropertyNames(controller.prototype).forEach(methodName => {
      const responseAliases = (Reflect.getMetadata('openapi:response:aliases', controller.prototype, methodName) || {}) as Record<string, string>;
      const requestAliases = (Reflect.getMetadata('openapi:request:aliases', controller.prototype, methodName) || {}) as Record<string, string>;
      const responseType = Reflect.getMetadata('routing-controllers:response-type', controller.prototype, methodName);
      const requestType = Reflect.getMetadata('routing-controllers:request-type', controller.prototype, methodName);

      if (responseType) {
        const methodKey = `${controller.name}.${methodName}`;
        responseTypes.set(methodKey, responseType);

        // Add response type and its nested types if no alias provided
        if (Object.keys(responseAliases).length === 0) {
          const typeName = responseType.name;
          if (schemas[typeName]) {
            addSchemaWithNested(schemas[typeName], typeName);
          }
        }

        // Add response aliases to the schema aliases map
        Object.entries(responseAliases).forEach(([typeName, alias]) => {
          schemaAliases.set(typeName, alias);
          usedSchemas.add(typeName);
          if (schemas[typeName]) {
            responseSchemas.set(alias, schemas[typeName]);
          }
        });
      }

      if (requestType) {
        // Add request type and its nested types if no alias provided
        if (Object.keys(requestAliases).length === 0) {
          const typeName = requestType.name;
          if (schemas[typeName]) {
            addSchemaWithNested(schemas[typeName], typeName);
          }
        }

        // Add request aliases to the schema aliases map
        Object.entries(requestAliases).forEach(([typeName, alias]) => {
          schemaAliases.set(typeName, alias);
          usedSchemas.add(typeName);
          if (schemas[typeName]) {
            filteredSchemas[alias] = schemas[typeName];
          }
        });

        // Store request body description update if alias exists
        const mainRequestAlias = requestAliases[requestType.name];
        if (mainRequestAlias) {
          requestBodyUpdates.set(requestType.name, mainRequestAlias);
        }
      }
    });
  });

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

  // Update request body descriptions with aliases
  Object.values(spec.paths).forEach(pathItem => {
    Object.values(pathItem).forEach((operation: any) => {
      if (operation.requestBody?.description) {
        const alias = requestBodyUpdates.get(operation.requestBody.description);
        if (alias) {
          operation.requestBody.description = alias;
        }
      }
    });
  });

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
      Object.entries(spec.paths || {}).forEach(([, pathItem]) => {
        Object.entries(pathItem).forEach(([, operation]) => {
          if (operation.operationId?.startsWith(controller.name + '.')) {
            operation.tags = [tagName];
            
            const methodName = operation.operationId.split('.').pop();
            if (methodName) {
              const methodKey = `${controller.name}.${methodName}`;
              const responseType = responseTypes.get(methodKey);
              
              // Collect schemas from request body
              if (operation.requestBody?.content?.['application/json']?.schema) {
                const requestAlias = Reflect.getMetadata('openapi:request:alias', controller.prototype, methodName);
                const requestType = Reflect.getMetadata('routing-controllers:request-type', controller.prototype, methodName);
                
                if (requestType && requestAlias) {
                  operation.requestBody.content['application/json'].schema = {
                    $ref: `#/components/schemas/${requestAlias}`
                  };
                  operation.requestBody.description = requestAlias;
                }
                findSchemaRefs(operation.requestBody.content['application/json'].schema, usedSchemas);
              }

              // Collect schemas from responses and update references
              if (operation.responses) {
                Object.values(operation.responses).forEach(response => {
                  const res = response as ResponseObject;
                  if (res.content?.['application/json']?.schema) {
                    findSchemaRefs(res.content['application/json'].schema, usedSchemas);
                    
                    // Update schema reference if it exists
                    if (res.content['application/json'].schema.$ref) {
                      const refMatch = res.content['application/json'].schema.$ref.match(/#\/components\/schemas\/([^/]+)/);
                      if (refMatch) {
                        // const schemaName = refMatch[1];
                        const methodAlias = methodSchemaMap.get(methodKey);
                        if (methodAlias && responseType) {
                          res.content['application/json'].schema.$ref = `#/components/schemas/${methodAlias}`;
                        }
                      }
                    }
                    
                    // Handle array items
                    const schema = res.content['application/json'].schema as SchemaObject;
                    if (schema.type === 'array' && schema.items && '$ref' in schema.items) {
                      const refMatch = schema.items.$ref.match(/#\/components\/schemas\/([^/]+)/);
                      if (refMatch) {
                        // const schemaName = refMatch[1];
                        const methodAlias = methodSchemaMap.get(methodKey);
                        if (methodAlias && responseType) {
                          schema.items.$ref = `#/components/schemas/${methodAlias}`;
                        }
                      }
                    }
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

  // Filter and rename schemas
  const nestedSchemas = new Set<string>();

  // Helper function to check if a schema has nested objects
  const findAllNestedTypes = (obj: any, foundTypes: Set<string>) => {
    if (!obj || typeof obj !== 'object') return;

    // Check for class-transformer @Type decorators in metadata
    if (obj.target && obj.properties) {
      Object.values(obj.properties).forEach((prop: any) => {
        if (prop.type && typeof prop.type === 'function') {
          foundTypes.add(prop.type.name);
          // Recursively check the nested type's schema
          if (schemas[prop.type.name]) {
            findAllNestedTypes(schemas[prop.type.name], foundTypes);
          }
        }
      });
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => findAllNestedTypes(item, foundTypes));
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        const refName = value.split('/').pop();
        if (refName) {
          foundTypes.add(refName);
          // Recursively check the referenced schema
          if (schemas[refName]) {
            findAllNestedTypes(schemas[refName], foundTypes);
          }
        }
      } else if (key === 'items' && value && typeof value === 'object' && isRefObject(value)) {
        const refName = value.$ref.split('/').pop();
        if (refName) {
          foundTypes.add(refName);
          // Recursively check the referenced schema
          if (schemas[refName]) {
            findAllNestedTypes(schemas[refName], foundTypes);
          }
        }
      } else if (typeof value === 'object') {
        findAllNestedTypes(value, foundTypes);
      }
    }
  };

  // First pass: collect all schema references and their nested types
  for (const [name, schema] of Object.entries(schemas)) {
    if (schemaAliases.get(name)) {
      const foundTypes = new Set<string>();
      findAllNestedTypes(schema, foundTypes);
      foundTypes.forEach(type => nestedSchemas.add(type));
    }
  }

  // Second pass: include all schemas that are either aliased or referenced
  for (const [name, schema] of Object.entries(schemas)) {
    if (schemaAliases.get(name) || nestedSchemas.has(name)) {
      const alias = schemaAliases.get(name) || name;
      const clonedSchema = JSON.parse(JSON.stringify(schema));
      
      // Update references in the schema
      const updateRefs = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        
        if (Array.isArray(obj)) {
          obj.forEach(item => updateRefs(item));
          return;
        }
        
        for (const [key, value] of Object.entries(obj)) {
          if (key === '$ref' && typeof value === 'string') {
            const refName = value.split('/').pop();
            if (refName && schemaAliases.get(refName)) {
              obj[key] = value.replace(refName, schemaAliases.get(refName) || refName);
            }
          } else if (key === 'items' && value && typeof value === 'object' && isRefObject(value)) {
            const refName = value.$ref.split('/').pop();
            if (refName && schemaAliases.get(refName)) {
              value.$ref = value.$ref.replace(refName, schemaAliases.get(refName) || refName);
            }
          } else if (typeof value === 'object') {
            updateRefs(value);
          }
        }
      };
      
      updateRefs(clonedSchema);
      filteredSchemas[alias] = clonedSchema;
    }
  }

  // Update all references in the spec
  const updateAllRefs = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(item => updateAllRefs(item));
      return;
    }
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        const refName = value.split('/').pop();
        if (refName && schemaAliases.get(refName)) {
          obj[key] = value.replace(refName, schemaAliases.get(refName) || refName);
        }
      } else if (key === 'items' && value && typeof value === 'object' && isRefObject(value)) {
        const refName = value.$ref.split('/').pop();
        if (refName && schemaAliases.get(refName)) {
          value.$ref = value.$ref.replace(refName, schemaAliases.get(refName) || refName);
        }
      } else if (typeof value === 'object') {
        updateAllRefs(value);
      }
    }
  };

  updateAllRefs(spec);
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